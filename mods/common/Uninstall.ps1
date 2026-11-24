[CmdletBinding()]
param(
    [switch]$KeepBackups
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TrackFile = Join-Path $ScriptDir "installed-files.txt"
$LogFile = Join-Path $ScriptDir "uninstall.log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    Add-Content -LiteralPath $LogFile -Value ("[{0}] [{1}] {2}" -f (Get-Date -Format "HH:mm:ss"), $Level, $Message) -Encoding UTF8
}

if (-not (Test-Path -LiteralPath $TrackFile -PathType Leaf)) {
    Write-Host ""
    Write-Host "  Nothing to uninstall: installed-files.txt not found." -ForegroundColor Yellow
    Write-Host "  This pack was not installed from this folder." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

$gamePath = $null
$lines = @(Get-Content -LiteralPath $TrackFile -Encoding UTF8 | Where-Object { $_ })
if ($lines.Count -eq 0) {
    Write-Host "  installed-files.txt is empty. Nothing to do." -ForegroundColor Yellow
    exit 0
}

$manifestPath = Join-Path $ScriptDir "manifest.json"
if (Test-Path -LiteralPath $manifestPath) {
    $manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $gamePath = Read-Host "  Enter the game folder path (used during installation)"
    if (-not $gamePath -or -not (Test-Path -LiteralPath $gamePath -PathType Container)) {
        throw "Game folder not found. Uninstall aborted."
    }
    $gamePath = (Resolve-Path -LiteralPath $gamePath).Path.TrimEnd("\", "/")
} else {
    throw "manifest.json not found. Cannot determine the game folder."
}

$backup = Get-ChildItem -LiteralPath $ScriptDir -Directory -Filter "backup_*" -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    Select-Object -First 1

if (-not $backup) {
    Write-Host "  No backup folder found. Tracked files will be removed without restore." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  GTA ALL // Uninstall" -ForegroundColor Yellow
Write-Host "  --------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Game: $gamePath" -ForegroundColor Gray
if ($backup) {
    Write-Host "  Backup: $($backup.FullName)" -ForegroundColor Gray
}
Write-Host ""

$restored = 0
$removed = 0
$missing = 0

foreach ($relative in $lines) {
    $target = Join-Path $gamePath $relative
    $backupFile = if ($backup) { Join-Path $backup.FullName $relative } else { $null }

    if ($backupFile -and (Test-Path -LiteralPath $backupFile -PathType Leaf)) {
        $dir = Split-Path -Parent $target
        if ($dir) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        Copy-Item -LiteralPath $backupFile -Destination $target -Force
        $restored++
        Write-Log "Restored: $relative" "RESTORE"
    } elseif (Test-Path -LiteralPath $target -PathType Leaf) {
        Remove-Item -LiteralPath $target -Force
        $removed++
        Write-Log "Removed: $relative" "REMOVE"
    } else {
        $missing++
        Write-Log "Missing: $relative" "WARN"
    }
}

# Remove empty mod directories created by the installer.
foreach ($dirName in @("scripts", "modloader", "neo", "plugins")) {
    $dir = Join-Path $gamePath $dirName
    if (Test-Path -LiteralPath $dir -PathType Container) {
        $children = @(Get-ChildItem -LiteralPath $dir -Force -ErrorAction SilentlyContinue)
        if ($children.Count -eq 0) {
            Remove-Item -LiteralPath $dir -Force
            Write-Log "Removed empty directory: $dirName" "REMOVE"
        }
    }
}

if (-not $KeepBackups -and $backup) {
    Remove-Item -LiteralPath $backup.FullName -Recurse -Force
    Write-Log "Removed backup folder: $($backup.FullName)" "REMOVE"
}

Remove-Item -LiteralPath $TrackFile -Force
Remove-Item -LiteralPath (Join-Path $ScriptDir "MANUAL-STEPS.txt") -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "  Done." -ForegroundColor Green
Write-Host "  Restored from backup: $restored" -ForegroundColor Gray
Write-Host "  Removed: $removed" -ForegroundColor Gray
Write-Host "  Missing: $missing" -ForegroundColor Gray
Write-Host ""
Write-Host "  If the game still misbehaves, verify game files in Steam." -ForegroundColor Yellow
Write-Host ""
