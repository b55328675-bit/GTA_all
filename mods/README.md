# Мод-паки GTA ALL

Готовые ZIP-паки для классической трилогии, GTA IV и GTA V. Внутри — установщик, конфиги и ссылки. Игровые файлы, тексты и чужие озвучки не распространяются.

## Скачать

| Пак | Что чинит | Скачать |
|---|---|---|
| GTA III — Classic HD | 60 FPS, широкоформат, SilentPatch, SkyGfx, CLEO | [ZIP](../dist/GTA_III_RU_60FPS.zip) |
| GTA VC — Neon HD | 60 FPS, широкоформат, SilentPatch, SkyGfx, CLEO | [ZIP](../dist/GTA_VC_RU_60FPS.zip) |
| GTA SA — CJ Edition | 60 FPS, широкоформат, SilentPatch, SkyGfx, CLEO | [ZIP](../dist/GTA_SA_RU_60FPS.zip) |
| Classic Trilogy — всё сразу | Три установщика в одном архиве | [ZIP](../dist/GTA_Classic_Trilogy_RU_60FPS.zip) |
| GTA IV — Liberty City Fixed | FusionFix, 60 FPS, DXVK | [ZIP](../dist/GTA_IV_RU_60FPS.zip) |
| GTA V — Story Mode Starter | Настройки 60 FPS и гайд по модам | [ZIP](../dist/GTA_V_StoryMode_60FPS.zip) |

## Как установить

1. Распакуйте ZIP.
2. Запустите `Install.cmd`.
3. Разрешите права администратора.
4. Укажите папку игры, если установщик не нашёл её сам.
5. В игре включите **Frame Limiter**.
6. Русскую озвучку поставьте отдельно по ссылке из `RU-LOCALIZATION.txt`.

Подробная инструкция — в `common/README_RU.md`.

## Офлайн-режим

Скачайте ZIP-моды из `manifest.json` на другом ПК и положите их в `_downloads` рядом с `Install.ps1`. Имена файлов — `id.zip`, например `silentpatch.zip`. Затем:

```bat
Install.cmd -Offline
```

## Удаление

Запустите `Uninstall.cmd`. Установщик восстановит файлы из резервной копии.

## Права

Паки содержат только собственный код, конфиги и ссылки. Моды принадлежат авторам и распространяются по своим лицензиям. Игровые файлы, тексты и озвучки не включены. Подробности — в [NOTICE.md](../NOTICE.md).
