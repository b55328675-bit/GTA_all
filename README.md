# GTA ALL — все игры серии в одном месте

**GTA ALL** — фанатский навигатор по серии Grand Theft Auto: полный список игр в порядке прохождения, продолжительность, платформы, ссылки на Steam и готовые мод-паки для 60 FPS и русской локализации. Всё на русском языке, в одном репозитории.

> Проект не аффилирован с Rockstar Games и Take-Two Interactive. Игровые файлы, тексты и озвучки не распространяются — только установщик, конфиги и ссылки на официальные страницы авторов.

## Что внутри

| Раздел | Что там |
|---|---|
| `index.html` | одностраничный сайт: таймлайн, архив всех игр, издания, мод-паки, FAQ |
| `data/games.js` | 16 игр: даты, сеттинг, герой, длительность, Steam, советы |
| `data/modpacks.js` | описания пакетов и ссылки на скачивание |
| `assets/` | стили, скрипты, SVG-графика (без внешних зависимостей) |
| `mods/manifests/` | JSON-манифесты: какие моды ставить, куда и с какими конфигами |
| `mods/common/` | установщик `Install.ps1`, `Uninstall.ps1` и README |
| `mods/extra/` | дополнительные материалы паков (гайды, чек-листы) |
| `mods/build-packs.sh` | сборка ZIP-паков в `dist/` |
| `dist/` | готовые ZIP-паки для скачивания |

## Как пользоваться сайтом

1. Откройте `index.html` в браузере — сайт статический, сборка не нужна.
2. В блоке «Порядок прохождения» переключайте режимы: **по релизам**, **по сюжету** или **основные игры**.
3. Отмечайте пройденные игры — прогресс сохраняется в `localStorage` браузера.
4. В разделе «Моды» скачайте пак и запустите `Install.cmd`.

Для локального запуска с корректными относительными путями:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Мод-паки

| Пак | Что делает | Скачать |
|---|---|---|
| **GTA III — Classic HD** | 60 FPS, широкоформат, SilentPatch, SkyGfx, CLEO | `dist/GTA_III_RU_60FPS.zip` |
| **GTA III — The Definitive Edition** | Настройка 60 FPS без модов и озвучка для DE; без установщика | [Скачать ZIP](dist/GTA_III_DE_60FPS_Guide.zip) |
| **GTA VC — Neon HD** | 60 FPS, широкоформат, SilentPatch, SkyGfx, CLEO | `dist/GTA_VC_RU_60FPS.zip` |
| **GTA SA — CJ Edition** | 60 FPS через Framerate Vigilante, SkyGfx, ModLoader | `dist/GTA_SA_RU_60FPS.zip` |
| **Classic Trilogy** | три установщика в одном архиве | `dist/GTA_Classic_Trilogy_RU_60FPS.zip` |
| **GTA IV — Liberty City Fixed** | FusionFix 5.1.2, commandline.txt, меньше вылетов | `dist/GTA_IV_RU_60FPS.zip` |
| **GTA V — Story Mode Starter** | профиль 60 FPS, гайд по Story Mode модам | `dist/GTA_V_StoryMode_60FPS.zip` |

### Как это работает

Внутри ZIP нет DLL на сотни мегабайт. Установщик:

1. находит игру через Steam (реестр + `libraryfolders.vdf`) или спрашивает путь вручную;
2. сохраняет резервную копию каждого заменяемого файла в `backup_YYYYMMDD_HHMMSS`;
3. скачивает моды с официальных GitHub-релизов в `_downloads/`;
4. раскладывает файлы по правилам из `manifest.json`;
5. прописывает конфиги (разрешение, `FPSlimit`, `commandline.txt`);
6. пишет `installed-files.txt` и `install.log`.

### Установка

```bat
Install.cmd              :: обычная установка
Install.cmd -DryRun      :: показать, что будет сделано, ничего не меняя
Install.cmd -Offline     :: использовать ZIP из _downloads, не качать из сети
Install.cmd -GamePath "D:\Steam\steamapps\common\Grand Theft Auto San Andreas"
```

После установки включите в игре **Frame Limiter**: моды поднимают лимит до 60, а не отключают его.

### Удаление

```bat
Uninstall.cmd
```

Установщик восстановит файлы из последней резервной копии. Если резервной копии нет — удалит только те файлы, которые ставил сам.

### Русская локализация

Паки не содержат чужих озвучек: это нарушало бы права авторов. Ссылки на локализации лежат в `RU-LOCALIZATION.txt` внутри каждого ZIP и на сайте.

| Игра | Что доступно |
|---|---|
| GTA III | «Правильный перевод» v1.2, WuzVoice (2022) |
| GTA VC | GamesVoice — студийная озвучка, 3.86 ГБ |
| GTA SA | Acrobat (одноголосая, ~1.9–2.77 ГБ) + текст SanLtd 0.56 |
| GTA IV | официальный русской озвучки нет: текст 1C + любительские проекты |
| GTA V | официальной озвучки нет: русские субтитры в Steam, фанатская озвучка — платная |

## Сборка паков

Требуются `bash`, `jq` и `zip`.

```bash
./mods/build-packs.sh
```

Скрипт собирает каждый манифест в `dist/<zipName>`: установщик + `manifest.json` + README + `RU-LOCALIZATION.txt` + `MOD-SOURCES.txt` + `NOTICE.txt` + содержимое `mods/extra/<id>/`.

## Разработка

Сайт не использует сборщик и внешние библиотеки: чистые HTML, CSS и JS.

```bash
# проверить синтаксис данных и скриптов
node --check data/games.js
node --check data/modpacks.js
node --check assets/js/app.js

# локальный сервер
python3 -m http.server 8080
```

### Структура данных

`window.GTA_GAMES` — массив игр. Ключевые поля: `id`, `order`, `type` (`main` | `expansion` | `spinoff` | `handheld`), `year`, `storyYear`, `steam.appid`, `modpack`, `localization`.

`window.GTA_MODPACKS` — массив паков: `id`, `game`, `download`, `features[]`, `mods[]`, `steps[]`, `localization`.

`mods/manifests/*.json` — схемы установки: `game.exe[]`, `mods[].install[{from,to}]`, `config[{file,values}]`, `localization`.

## Лицензия и права

- Код сайта и установщика — MIT, см. [LICENSE](LICENSE).
- Моды принадлежат авторам и скачиваются с их официальных страниц по своим лицензиям.
- Торговые знаки Grand Theft Auto принадлежат Take-Two Interactive.
- Подробности — в [NOTICE.md](NOTICE.md).

Нашли ошибку в дате, ссылке или совместимости? Откройте Issue или Pull Request.
