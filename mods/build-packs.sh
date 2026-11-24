#!/usr/bin/env bash
set -euo pipefail
export TZ=UTC

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

mkdir -p dist
rm -f dist/GTA_*_RU_60FPS.zip dist/GTA_V_StoryMode_60FPS.zip dist/GTA_Classic_Trilogy_RU_60FPS.zip

for manifest in mods/manifests/*.json; do
  id="$(basename "$manifest" .json)"
  name="$(jq -r '.name' "$manifest")"
  version="$(jq -r '.version' "$manifest")"
  zip_name="$(jq -r '.zipName' "$manifest")"
  installer="$(jq -r 'if .installer == false then "false" else "true" end' "$manifest")"
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT

  if [[ "$installer" == "true" ]]; then
    cp mods/common/Install.ps1 mods/common/Install.cmd mods/common/Uninstall.ps1 mods/common/Uninstall.cmd "$tmp/"
    cp mods/common/README_RU.md "$tmp/README_RU.md"
  fi

  cp "$manifest" "$tmp/manifest.json"

  if [[ -d "mods/extra/$id" ]]; then
    cp -R mods/extra/"$id"/. "$tmp/"
  fi

  # Game-specific README header.
  if [[ "$installer" == "true" ]]; then
    {
      echo "# $name"
      echo
      echo "Версия пака: $version"
      echo
      cat mods/common/README_RU.md
    } > "$tmp/README_RU.md"
  fi

  # Russian localization links.
  {
    echo "GTA ALL — русская локализация"
    echo "============================="
    echo
    echo "Пак не содержит чужие озвучки и тексты. Установите локализацию отдельно,"
    echo "следуя инструкции на странице автора."
    echo
    jq -r '.localization | "Название: \(.title)\nСсылка: \(.url)\nКомментарий: \(.note)"' "$manifest"
    echo
    echo "Если ссылка недоступна — найдите локализацию по названию игры на LibertyCity,"
    echo "GamesVoice, SanLtd или в Steam (официальные субтитры)."
  } > "$tmp/RU-LOCALIZATION.txt"

  # Mod sources and licenses.
  {
    echo "GTA ALL — источники модов"
    echo "========================="
    echo
    jq -r '.mods[] | "- \(.name) — \(.author) — \(.license)\n  \(.url)\n  \(.note // "")\n"' "$manifest"
    echo
    echo "Пак не включает игровые файлы. Все моды скачиваются с официальных страниц."
  } > "$tmp/MOD-SOURCES.txt"

  # Pack-specific notes from the manifest.
  {
    echo "GTA ALL — заметки пакета"
    echo "========================"
    echo
    echo "$name, версия $version"
    echo
    jq -r '.notes // "Дополнительных заметок нет."' "$manifest"
    echo
    echo "Если мод помечен как manual, установите его вручную — ссылка в MANUAL-STEPS.txt."
  } > "$tmp/PACK-NOTES.txt"

  # Short notice.
  {
    echo "GTA ALL — NOTICE"
    echo "==============="
    echo
    echo "This package contains only installer code, configuration files and links."
    echo "It does not include game files, copyrighted textures, audio or localizations."
    echo "Mod authors retain all rights to their work. See MOD-SOURCES.txt for licenses."
  } > "$tmp/NOTICE.txt"

  (cd "$tmp" && find . -type f -exec touch -t 200001010000 {} + && find . -type f | LC_ALL=C sort | zip -Xq "$ROOT/dist/$zip_name" -@)
  echo "Built dist/$zip_name"
done

# Classic trilogy bundle: three separate installers in one archive.
tmp="$(mktemp -d)"
mkdir -p "$tmp/GTA_III" "$tmp/GTA_VICE_CITY" "$tmp/GTA_SAN_ANDREAS"
for pair in "gta-iii:GTA_III" "gta-vc:GTA_VICE_CITY" "gta-sa:GTA_SAN_ANDREAS"; do
  id="${pair%%:*}"
  folder="${pair##*:}"
  manifest="mods/manifests/$id.json"
  installer="$(jq -r 'if .installer == false then "false" else "true" end' "$manifest")"
  if [[ "$installer" != "true" ]]; then
    continue
  fi
  cp mods/common/Install.ps1 mods/common/Install.cmd mods/common/Uninstall.ps1 mods/common/Uninstall.cmd "$tmp/$folder/"
  cp mods/common/README_RU.md "$tmp/$folder/README_RU.md"
  cp "$manifest" "$tmp/$folder/manifest.json"
  if [[ -d "mods/extra/$id" ]]; then
    cp -R mods/extra/"$id"/. "$tmp/$folder/"
  fi
  {
    echo "# $(jq -r '.name' "$manifest")"
    echo
    cat mods/common/README_RU.md
  } > "$tmp/$folder/README_RU.md"
  {
    echo "GTA ALL — русская локализация"
    echo "============================="
    echo
    jq -r '.localization | "Название: \(.title)\nСсылка: \(.url)\nКомментарий: \(.note)"' "$manifest"
  } > "$tmp/$folder/RU-LOCALIZATION.txt"
  {
    echo "GTA ALL — заметки пакета"
    echo "========================"
    echo
    jq -r '.notes // "Дополнительных заметок нет."' "$manifest"
  } > "$tmp/$folder/PACK-NOTES.txt"
  {
    echo "GTA ALL — источники модов"
    echo "========================="
    echo
    jq -r '.mods[] | "- \(.name) — \(.author) — \(.license)\n  \(.url)"' "$manifest"
  } > "$tmp/$folder/MOD-SOURCES.txt"
done
{
  echo "# GTA Classic Trilogy — RU / 60 FPS"
  echo
  echo "Три отдельные папки с установщиками. Запускайте Install.cmd внутри нужной игры."
  echo
  echo "GTA III      → GTA_III/Install.cmd"
  echo "GTA VC       → GTA_VICE_CITY/Install.cmd"
  echo "GTA SA       → GTA_SAN_ANDREAS/Install.cmd"
  echo
  echo "Русская озвучка и тексты — в RU-LOCALIZATION.txt внутри каждой папки."
} > "$tmp/README_RU.md"
(cd "$tmp" && find . -type f -exec touch -t 200001010000 {} + && find . -type f | LC_ALL=C sort | zip -Xq "$ROOT/dist/GTA_Classic_Trilogy_RU_60FPS.zip" -@)
echo "Built dist/GTA_Classic_Trilogy_RU_60FPS.zip"
