[CmdletBinding()]
param(
    [string]$GamePath,
    [switch]$Force,
    [switch]$Offline,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ManifestPath = Join-Path $ScriptDir "manifest.json"

if (-not (Test-Path -LiteralPath $ManifestPath)) {
    throw "manifest.json not found next to Install.ps1."
}

$Manifest = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$Game = $Manifest.game
$ExeNames = @($Game.exe)
$SteamFolders = @($Game.steamFolders)
$DownloadRoot = Join-Path $ScriptDir "_downloads"
$BackupRoot = Join-Path $ScriptDir ("backup_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
$TrackFile = Join-Path $ScriptDir "installed-files.txt"
$LogFile = Join-Path $ScriptDir "install.log"
$ManualFile = Join-Path $ScriptDir "MANUAL-STEPS.txt"
$Failures = New-Object System.Collections.Generic.List[string]
$Tracked = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $line = "[{0}] [{1}] {2}" -f (Get-Date -Format "HH:mm:ss"), $Level, $Message
    Add-Content -LiteralPath $LogFile -Value $line -Encoding UTF8
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "  [OK] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Warn {
    param([string]$Message)
    Write-Host "  [!]  " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
    Write-Log $Message "WARN"
}

function Write-Err {
    param([string]$Message)
    Write-Host "  [X]  " -ForegroundColor Red -NoNewline
    Write-Host $Message
    Write-Log $Message "ERROR"
}

function Get-RelativePath {
    param([string]$BasePath, [string]$FullPath)
    $base = $BasePath.TrimEnd("\", "/") + [IO.Path]::DirectorySeparatorChar
    $baseUri = New-Object System.Uri($base)
    $fullUri = New-Object System.Uri($FullPath)
    $relative = [System.Uri]::UnescapeDataString($baseUri.MakeRelativeUri($fullUri).ToString())
    return $relative.Replace("/", "\")
}

function Find-GamePath {
    $candidates = New-Object System.Collections.Generic.List[string]

    try {
        $steamPath = (Get-ItemProperty -Path "HKCU:\Software\Valve\Steam" -ErrorAction Stop).SteamPath
        if ($steamPath) {
            $candidates.Add((Join-Path $steamPath "steamapps\common"))
            $vdf = Join-Path $steamPath "steamapps\libraryfolders.vdf"
            if (Test-Path -LiteralPath $vdf) {
                $vdfText = Get-Content -LiteralPath $vdf -Raw -Encoding UTF8
                $matches = [regex]::Matches($vdfText, '"path"\s+"([^"]+)"')
                foreach ($match in $matches) {
                    $library = $match.Groups[1].Value.Replace("\\", "\")
                    $candidates.Add((Join-Path $library "steamapps\common"))
                }
            }
        }
    } catch {
        Write-Log "Steam registry lookup failed: $($_.Exception.Message)" "WARN"
    }

    $candidates.Add("C:\Program Files (x86)\Steam\steamapps\common")
    $candidates.Add("C:\Program Files\Steam\steamapps\common")
    $candidates.Add("D:\SteamLibrary\steamapps\common")
    $candidates.Add("E:\SteamLibrary\steamapps\common")
    $candidates.Add("D:\Games\Steam\steamapps\common")
    $candidates.Add("E:\Games\Steam\steamapps\common")

    $seen = @{}
    foreach ($base in $candidates) {
        if (-not $base -or -not (Test-Path -LiteralPath $base)) { continue }
        if ($seen.ContainsKey($base)) { continue }
        $seen[$base] = $true

        foreach ($folder in $SteamFolders) {
            $path = Join-Path $base $folder
            foreach ($exe in $ExeNames) {
                if (Test-Path -LiteralPath (Join-Path $path $exe) -PathType Leaf) {
                    return (Resolve-Path -LiteralPath $path).Path
                }
            }
        }

        try {
            $dirs = Get-ChildItem -LiteralPath $base -Directory -ErrorAction Stop
            foreach ($dir in $dirs) {
                foreach ($exe in $ExeNames) {
                    if (Test-Path -LiteralPath (Join-Path $dir.FullName $exe) -PathType Leaf) {
                        return $dir.FullName
                    }
                }
            }
        } catch {
            # Ignore inaccessible folders.
        }
    }

    return $null
}

function Resolve-GamePath {
    if ($GamePath) {
        if (-not (Test-Path -LiteralPath $GamePath -PathType Container)) {
            throw "The specified game folder does not exist: $GamePath"
        }
        return (Resolve-Path -LiteralPath $GamePath).Path
    }

    $detected = Find-GamePath
    if ($detected) {
        Write-Ok "Game found: $detected"
        if (-not $Force) {
            $answer = Read-Host "  Install into this folder? [Y/n]"
            if ($answer -and $answer.Trim() -notmatch "^(y|yes|д|да)$") {
                throw "Installation cancelled."
            }
        }
        return $detected
    }

    Write-Warn "Could not find the game automatically."
    $manual = Read-Host "  Enter the game folder path (or press Enter to cancel)"
    if (-not $manual) { throw "Installation cancelled." }
    if (-not (Test-Path -LiteralPath $manual -PathType Container)) {
        throw "The specified game folder does not exist: $manual"
    }
    return (Resolve-Path -LiteralPath $manual).Path
}

function Backup-File {
    param([string]$TargetPath)
    if (-not (Test-Path -LiteralPath $TargetPath -PathType Leaf)) { return }
    $relative = Get-RelativePath -BasePath $GamePath -FullPath $TargetPath
    $backupPath = Join-Path $BackupRoot $relative
    $backupDir = Split-Path -Parent $backupPath
    if ($backupDir) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
    Copy-Item -LiteralPath $TargetPath -Destination $backupPath -Force
    Write-Log "Backup: $relative" "BACKUP"
}

function Track-File {
    param([string]$RelativePath)
    if ($Tracked.Add($RelativePath)) {
        Add-Content -LiteralPath $TrackFile -Value $RelativePath -Encoding UTF8
    }
}

function Copy-Tracked {
    param([string]$SourcePath, [string]$RelativeDestination)
    $targetPath = Join-Path $GamePath $RelativeDestination
    $targetDir = Split-Path -Parent $targetPath
    if ($targetDir) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
    Backup-File -TargetPath $targetPath
    Copy-Item -LiteralPath $SourcePath -Destination $targetPath -Force
    Track-File -RelativePath $RelativeDestination
}

function Test-Excluded {
    param([string]$Path, [string[]]$Patterns)
    if (-not $Patterns) { return $false }
    foreach ($pattern in $Patterns) {
        if ($Path -like $pattern) { return $true }
    }
    return $false
}

function Install-ExtractedMod {
    param([string]$ExtractRoot, $Mod)

    $rules = @()
    if ($Mod.install -is [string]) {
        $rules = @(@{ from = $Mod.install; to = "" })
    } else {
        $rules = @($Mod.install)
    }

    if (-not $rules -or $rules.Count -eq 0) {
        $rules = @(@{ from = "*"; to = "" })
    }

    $exclude = @()
    if ($Mod.exclude) { $exclude = @($Mod.exclude) }

    foreach ($rule in $rules) {
        $from = [string]$rule.from
        if (-not $from) { $from = "*" }
        $to = [string]$rule.to
        if ($null -eq $to) { $to = "" }

        $fromPath = Join-Path $ExtractRoot $from
        $isDirectorySource = Test-Path -LiteralPath $fromPath -PathType Container
        $isFileSource = Test-Path -LiteralPath $fromPath -PathType Leaf

        if ($isFileSource) {
            if (Test-Excluded -Path $from -Patterns $exclude) { continue }
            $destRelative = if ($to) { $to } else { Split-Path -Leaf $from }
            Copy-Tracked -SourcePath $fromPath -RelativeDestination $destRelative
            continue
        }

        $baseDir = $ExtractRoot
        if ($isDirectorySource) {
            $baseDir = $fromPath
        } elseif ($from -match "^(.*)[\\/][^\\/]*\*$") {
            $baseDir = Join-Path $ExtractRoot $Matches[1]
        }

        $files = @()
        try {
            $files = @(Get-ChildItem -Path $fromPath -Recurse -File -ErrorAction Stop)
        } catch {
            $files = @()
        }

        if (-not $files -or $files.Count -eq 0) {
            Write-Warn "No files matched '$($Mod.name)' rule '$from'."
            continue
        }

        foreach ($file in $files) {
            $sourceRelative = Get-RelativePath -BasePath $baseDir -FullPath $file.FullName
            if (Test-Excluded -Path $sourceRelative -Patterns $exclude) { continue }

            if ($to.EndsWith("\") -or $to.EndsWith("/")) {
                $destRelative = Join-Path $to $sourceRelative
            } elseif ($to) {
                $destRelative = Join-Path $to $sourceRelative
            } else {
                $destRelative = $sourceRelative
            }

            $destRelative = $destRelative.Replace("/", "\")
            Copy-Tracked -SourcePath $file.FullName -RelativeDestination $destRelative
        }
    }
}

function Get-ModArchive {
    param($Mod)
    $fileName = "$($Mod.id).zip"
    $destination = Join-Path $DownloadRoot $fileName

    if ($Offline) {
        if (-not (Test-Path -LiteralPath $destination -PathType Leaf)) {
            throw "Offline mode: missing $destination"
        }
        return $destination
    }

    if (Test-Path -LiteralPath $destination -PathType Leaf) {
        $existing = Get-Item -LiteralPath $destination
        if ($Mod.size -and $existing.Length -ge ($Mod.size * 0.75)) {
            Write-Ok "Already downloaded: $($Mod.name)"
            return $destination
        }
        Remove-Item -LiteralPath $destination -Force
    }

    if (-not (Test-Path -LiteralPath $DownloadRoot)) {
        New-Item -ItemType Directory -Path $DownloadRoot -Force | Out-Null
    }

    Write-Host "      downloading " -NoNewline
    Write-Host $Mod.name -ForegroundColor White -NoNewline
    Write-Host "..." -NoNewline
    try {
        Invoke-WebRequest -Uri $Mod.url -OutFile $destination -UseBasicParsing -TimeoutSec 300
        Write-Host " done" -ForegroundColor Green
    } catch {
        Write-Host " failed" -ForegroundColor Red
        throw "Download failed: $($_.Exception.Message)"
    }

    if ($Mod.size) {
        $downloaded = (Get-Item -LiteralPath $destination).Length
        if ($downloaded -lt ($Mod.size * 0.75)) {
            throw "Downloaded file is too small: $downloaded bytes (expected about $($Mod.size))."
        }
    }

    Write-Log "Downloaded: $($Mod.name) -> $destination" "DOWNLOAD"
    return $destination
}

function Set-IniValue {
    param([string]$RelativeFile, $Values)
    $path = Join-Path $GamePath $RelativeFile
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Write-Warn "Config not found (skipped): $RelativeFile"
        return
    }

    $content = Get-Content -LiteralPath $path -Raw -Encoding UTF8
    foreach ($property in $Values.PSObject.Properties) {
        $key = $property.Name
        $value = [string]$property.Value
        $pattern = "(?im)^(\s*" + [regex]::Escape($key) + "\s*=\s*).*$"
        $replacementValue = $value.Replace('$', '$$')
        if ([regex]::IsMatch($content, $pattern)) {
            $content = [regex]::Replace($content, $pattern, ('${1}' + $replacementValue))
        } else {
            if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) { $content += "`r`n" }
            $content += "$key=$value`r`n"
        }
    }

    Backup-File -TargetPath $path
    # UTF-8 without BOM: some mods misread a BOM as part of the first key.
    [IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
    Track-File -RelativePath $RelativeFile
    Write-Ok "Configured: $RelativeFile"
}

function Set-TextFile {
    param([string]$RelativeFile, [string]$Text)
    $path = Join-Path $GamePath $RelativeFile
    $dir = Split-Path -Parent $path
    if ($dir) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Backup-File -TargetPath $path
    Set-Content -LiteralPath $path -Value $Text -Encoding ASCII
    Track-File -RelativePath $RelativeFile
    Write-Ok "Created: $RelativeFile"
}

# ---------------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "  GTA ALL // " -ForegroundColor Yellow -NoNewline
Write-Host $Manifest.name -ForegroundColor White
Write-Host "  " $Manifest.version -ForegroundColor DarkGray
Write-Host "  --------------------------------------------------------------" -ForegroundColor DarkGray

if ($DryRun) {
    Write-Warn "Dry run: no files will be changed."
}

$GamePath = Resolve-GamePath
$GamePath = $GamePath.TrimEnd("\", "/")
Write-Ok "Target: $GamePath"

$exeFound = $false
foreach ($exe in $ExeNames) {
    if (Test-Path -LiteralPath (Join-Path $GamePath $exe) -PathType Leaf) {
        $exeFound = $true
        break
    }
}
if (-not $exeFound) {
    if (($Manifest.id -in @('gta-iii', 'gta-vc', 'gta-sa')) -and ($GamePath -match 'Definitive[ _-]+Edition')) {
        Write-Warn "Вы выбрали Definitive Edition. Этот пакет предназначен только для классического издания. Моды не установлены."
        if ($Manifest.id -eq "gta-iii") { Write-Warn "Для ремастера скачайте GTA_III_DE_60FPS_Guide.zip из папки dist репозитория." }
        exit 1
    }
    Write-Warn "Для игры $($Manifest.game.title) нужна папка с файлом: $($ExeNames -join ' или '). Проверьте издание и путь. Моды не установлены."
    exit 1
}

if ($DryRun) {
    Write-Host ""
    Write-Host "  Plan for $GamePath" -ForegroundColor Yellow
    foreach ($mod in $Manifest.mods) {
        if ($mod.manual) {
            Write-Host "   [manual]   $($mod.name)" -ForegroundColor Yellow
            Write-Host "             $($mod.url)" -ForegroundColor DarkGray
        } else {
            $sizeMb = if ($mod.size) { "{0:N2} MB" -f ($mod.size / 1MB) } else { "unknown size" }
            Write-Host "   [download] $($mod.name) ($sizeMb)"
        }
    }
    foreach ($config in $Manifest.config) {
        Write-Host "   [config]   $($config.file)"
    }
    Write-Host ""
    Write-Host "  Dry run: nothing was downloaded, changed or created." -ForegroundColor Green
    Write-Host ""
    exit 0
}

if (Test-Path -LiteralPath $TrackFile) {
    foreach ($line in Get-Content -LiteralPath $TrackFile -Encoding UTF8) {
        if ($line) { $Tracked.Add($line) | Out-Null }
    }
}

if (-not (Test-Path -LiteralPath $BackupRoot)) {
    New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
}

Write-Log "=== Install started: $($Manifest.name) $($Manifest.version) ===" "INFO"
Write-Log "Game path: $GamePath" "INFO"

$installed = 0
$manual = New-Object System.Collections.Generic.List[object]

foreach ($mod in $Manifest.mods) {
    if ($mod.manual) {
        $manual.Add($mod)
        continue
    }

    Write-Step "$($mod.name)"
    Write-Host "      " -NoNewline
    Write-Host $mod.note -ForegroundColor DarkGray

    try {
        $archive = Get-ModArchive -Mod $mod
        $extractRoot = Join-Path $DownloadRoot ("_extract_" + $mod.id)
        if (Test-Path -LiteralPath $extractRoot) {
            Remove-Item -LiteralPath $extractRoot -Recurse -Force
        }
        New-Item -ItemType Directory -Path $extractRoot -Force | Out-Null

        Expand-Archive -LiteralPath $archive -DestinationPath $extractRoot -Force
        Install-ExtractedMod -ExtractRoot $extractRoot -Mod $mod
        Remove-Item -LiteralPath $extractRoot -Recurse -Force
        $installed++
        Write-Ok "Installed: $($mod.name)"
    } catch {
        Write-Err "$($mod.name): $($_.Exception.Message)"
        $Failures.Add($mod.name)
    }
}

foreach ($config in $Manifest.config) {
    if ($config.text -ne $null) {
        Set-TextFile -RelativeFile $config.file -Text $config.text
    } elseif ($config.values) {
        Set-IniValue -RelativeFile $config.file -Values $config.values
    }
}

if ($manual.Count -gt 0) {
    $lines = @(
        "GTA ALL — manual steps",
        "=======================",
        "",
        "These mods are not downloaded automatically. Open the links and follow the authors' instructions:",
        ""
    )
    foreach ($mod in $manual) {
        $lines += "- $($mod.name)"
        $lines += "  $($mod.url)"
        $lines += "  $($mod.note)"
        $lines += ""
    }
    Set-Content -LiteralPath $ManualFile -Value $lines -Encoding UTF8
    Write-Host ""
    Write-Warn "Manual steps saved to MANUAL-STEPS.txt"
    foreach ($mod in $manual) {
        Write-Host "      - $($mod.name): $($mod.url)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "  --------------------------------------------------------------" -ForegroundColor DarkGray
if ($Failures.Count -gt 0) {
    Write-Warn "Installed with warnings. Failed: $($Failures -join ', ')"
    Write-Warn "See install.log for details."
} else {
    Write-Ok "All done. Installed $installed mod package(s)."
}
Write-Host ""
Write-Host "  Backup: " -NoNewline
Write-Host $BackupRoot -ForegroundColor DarkGray
Write-Host "  Log:    " -NoNewline
Write-Host $LogFile -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Next:" -ForegroundColor Yellow
Write-Host "   1. Launch the game and enable Frame Limiter in Display Setup." -ForegroundColor Gray
Write-Host "   2. Set Russian voice/text separately using the link in RU-LOCALIZATION.txt." -ForegroundColor Gray
Write-Host "   3. To remove mods, run Uninstall.cmd." -ForegroundColor Gray
Write-Host ""
