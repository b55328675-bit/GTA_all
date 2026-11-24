/* GTA ALL — описания мод-паков.
   Внутри ZIP только установщик, конфиги и ссылки. Игровые файлы и чужие
   озвучки не распространяются. */
window.GTA_MODPACKS = [
  {
    id: "gta-iii",
    localizationLabel: "Русская озвучка",
    game: "gta-iii",
    title: "GTA III — Classic HD",
    kicker: "Либерти-Сити, каким он должен был быть",
    version: "1.0.0",
    download: "dist/GTA_III_RU_60FPS.zip",
    size: "меньше 1 МБ",
    badge: "RU · 60 FPS",
    accent: "#ff4d6d",
    accent2: "#2b0f3a",
    description: "Минимальный, но обязательный набор фиксов для оригинальной GTA III: стабильность, широкоформат, 60 FPS и корректная работа на Windows 10/11.",
    features: [
      "Ultimate ASI Loader: запуск .asi",
      "60 FPS через Framerate Vigilante",
      "SilentPatch: сотни исправлений",
      "WidescreenFix: 16:9, 16:10, 21:9",
      "Project2DFX: красивые короны огней",
      "SkyGfx: графика PS2/Xbox",
      "CLEO 2.2.0 + ModLoader",
      "Готовый конфиг под 1920×1080"
    ],
    mods: [
      { name: "Ultimate ASI Loader", author: "ThirteenAG", license: "MIT", url: "https://github.com/ThirteenAG/Ultimate-ASI-Loader" },
      { name: "SilentPatch III", author: "CookiePLMonster", license: "MIT", url: "https://github.com/CookiePLMonster/SilentPatch" },
      { name: "WidescreenFix", author: "ThirteenAG", license: "MIT", url: "https://github.com/ThirteenAG/WidescreenFixesPack" },
      { name: "Project2DFX", author: "ThirteenAG", license: "MIT", url: "https://github.com/ThirteenAG/III.VC.SA.IV.Project2DFX" },
      { name: "SkyGfx III/VC", author: "aap", license: "MIT", url: "https://github.com/aap/skygfx_vc" },
      { name: "CLEO 2.2.0", author: "cleolibrary", license: "MIT", url: "https://github.com/cleolibrary/III.VC.CLEO" },
      { name: "ModLoader", author: "thelink2012", license: "MIT", url: "https://github.com/thelink2012/modloader" },
      { name: "Framerate Vigilante (вручную)", author: "Junior_Djjr", license: "MIT", url: "https://www.mixmods.com.br/2022/08/iii-vc-sa-framerate-vigilante/" }
    ],
    steps: [
      "Скачайте ZIP и распакуйте в любую папку.",
      "Запустите Install.cmd от имени администратора.",
      "Укажите папку игры, если установщик не найдёт её сам.",
      "В настройках игры включите Frame Limiter — SilentPatch поднимет планку до 30.",
      "Для стабильных 60 FPS скачайте Framerate Vigilante по ссылке из MANUAL-STEPS.txt.",
      "Русскую озвучку поставьте отдельно по ссылке ниже."
    ],
    localization: {
      title: "Русская озвучка «Правильный перевод»",
      url: "https://libertycity.net/files/gta-3/123117-russian-voiceover-v1.2.html",
      note: "Полная любительская озвучка сюжета и радио; альтернатива — WuzVoice (2022). Текст — SanLtd/1C."
    },
    note: "Пак не содержит игровые файлы и озвучку. Установщик скачивает открытые моды с официальных GitHub-релизов и делает резервную копию. Framerate Vigilante ставится вручную: автор распространяет его не через GitHub Releases."
  },
  {
    id: "gta-vc",
    localizationLabel: "Русская озвучка",
    game: "gta-vc",
    title: "GTA Vice City — Neon HD",
    kicker: "1986-й в широком формате",
    version: "1.0.0",
    download: "dist/GTA_VC_RU_60FPS.zip",
    size: "меньше 1 МБ",
    badge: "RU · 60 FPS",
    accent: "#ff6ec7",
    accent2: "#4cc9f0",
    description: "Всё, что нужно для комфортного возвращения в Вайс-Сити: 60 FPS, широкоформат, фиксы физики и неоновая графика без лишнего веса.",
    features: [
      "Ultimate ASI Loader: запуск .asi",
      "60 FPS через Framerate Vigilante",
      "SilentPatch VC: стабильность и мышь",
      "WidescreenFix: 16:9, 16:10, 21:9",
      "Project2DFX: короны огней",
      "SkyGfx: неон PS2/Xbox",
      "CLEO 2.2.0 + ModLoader",
      "Готовый конфиг под 1920×1080"
    ],
    mods: [
      { name: "Ultimate ASI Loader", author: "ThirteenAG", license: "MIT", url: "https://github.com/ThirteenAG/Ultimate-ASI-Loader" },
      { name: "SilentPatch VC", author: "CookiePLMonster", license: "MIT", url: "https://github.com/CookiePLMonster/SilentPatch" },
      { name: "WidescreenFix", author: "ThirteenAG", license: "MIT", url: "https://github.com/ThirteenAG/WidescreenFixesPack" },
      { name: "Project2DFX", author: "ThirteenAG", license: "MIT", url: "https://github.com/ThirteenAG/III.VC.SA.IV.Project2DFX" },
      { name: "SkyGfx III/VC", author: "aap", license: "MIT", url: "https://github.com/aap/skygfx_vc" },
      { name: "CLEO 2.2.0", author: "cleolibrary", license: "MIT", url: "https://github.com/cleolibrary/III.VC.CLEO" },
      { name: "ModLoader", author: "thelink2012", license: "MIT", url: "https://github.com/thelink2012/modloader" },
      { name: "Framerate Vigilante Fixed", author: "shaneomac1337", license: "MIT", url: "https://github.com/shaneomac1337/FramerateVigilante-Fixed" }
    ],
    steps: [
      "Скачайте ZIP и распакуйте в любую папку.",
      "Запустите Install.cmd от имени администратора.",
      "Укажите папку игры, если установщик не найдёт её сам.",
      "В настройках игры включите Frame Limiter — Framerate Vigilante поднимет его до 60 FPS.",
      "Русскую озвучку GamesVoice поставьте отдельно по ссылке."
    ],
    localization: {
      title: "Русская озвучка GamesVoice",
      url: "https://libertycity.net/files/gta-vice-city/219084-professional-russian-voice-acting-for-gta-vice-city-by-gamesvoice.html",
      note: "Студийная озвучка; подходит для оригинала и Definitive Edition."
    },
    note: "Пак не содержит игровые файлы и озвучку. Установщик скачивает открытые моды с официальных GitHub-релизов и делает резервную копию."
  },
  {
    id: "gta-sa",
    localizationLabel: "Русская озвучка",
    game: "gta-sa",
    title: "GTA San Andreas — CJ Edition",
    kicker: "Три города, один нормальный FPS",
    version: "1.0.0",
    download: "dist/GTA_SA_RU_60FPS.zip",
    size: "меньше 1 МБ",
    badge: "RU · 60 FPS",
    accent: "#ffd166",
    accent2: "#06d6a0",
    description: "Главный пак для самой большой игры PS2-эры. 60 FPS без сломанной физики, широкоформат, SkyGfx и удобная установка модов через ModLoader.",
    features: [
      "60 FPS через Framerate Vigilante Steam",
      "SilentPatch SA: физика, мышь, вылеты",
      "WidescreenFix: 16:9, 16:10, 21:9",
      "Project2DFX: короны огней",
      "SkyGfx: графика PS2/Xbox",
      "CLEO 5 + Ultimate ASI Loader + ModLoader",
      "Готовый конфиг под 1920×1080"
    ],
    mods: [
      { name: "SilentPatch SA", author: "CookiePLMonster", license: "MIT", url: "https://github.com/CookiePLMonster/SilentPatch" },
      { name: "WidescreenFix", author: "ThirteenAG", license: "MIT", url: "https://github.com/ThirteenAG/WidescreenFixesPack" },
      { name: "Project2DFX", author: "ThirteenAG", license: "MIT", url: "https://github.com/ThirteenAG/III.VC.SA.IV.Project2DFX" },
      { name: "SkyGfx SA", author: "aap", license: "MIT", url: "https://github.com/aap/skygfx" },
      { name: "CLEO 5", author: "cleolibrary", license: "MIT", url: "https://github.com/cleolibrary/CLEO5" },
      { name: "ModLoader", author: "thelink2012", license: "MIT", url: "https://github.com/thelink2012/modloader" },
      { name: "Framerate Vigilante Steam", author: "isaaccandido", license: "MIT", url: "https://github.com/isaaccandido/FramerateVigilante-SA-Steam" }
    ],
    steps: [
      "Скачайте ZIP и распакуйте в любую папку.",
      "Запустите Install.cmd от имени администратора.",
      "Укажите папку игры, если установщик не найдёт её сам.",
      "В настройках игры включите Frame Limiter — мод поднимет его до 60 FPS.",
      "Русскую озвучку Acrobat поставьте отдельно по ссылке."
    ],
    localization: {
      title: "Русская озвучка Acrobat",
      url: "https://www.playground.ru/gta_san_andreas/file/gta_san_andreas_polnaya_russkaya_ozvuchka-1008556",
      note: "Одноголосая любительская озвучка; текст — SanLtd Team."
    },
    note: "Пак рассчитан на Steam-версию GTA SA. Для классической 1.0 используйте отдельный порт Framerate Vigilante."
  },
  {
    id: "gta-iv",
    localizationLabel: "Русский текст",
    game: "gta-iv",
    title: "GTA IV — Liberty City Fixed",
    kicker: "Нико вернулся в 60 FPS",
    version: "1.0.0",
    download: "dist/GTA_IV_RU_60FPS.zip",
    size: "~215 МБ при установке",
    badge: "RU · 60 FPS",
    accent: "#74c0fc",
    accent2: "#1e2a3a",
    description: "FusionFix и настройки, которые превращают GTA IV Complete Edition в современную игру: стабильные 60 FPS, DXVK, исправленная гамма и меньше вылетов.",
    features: [
      "FusionFix 5.1.2",
      "Исправления для высоких FPS",
      "DXVK и корректная гамма",
      "Меньше вылетов и зависаний",
      "Готовый commandline.txt",
      "Русский текст — по ссылке",
      "Работает с Complete Edition"
    ],
    mods: [
      { name: "FusionFix", author: "ThirteenAG", license: "MIT", url: "https://github.com/ThirteenAG/GTAIV.EFLC.FusionFix" }
    ],
    steps: [
      "Скачайте ZIP и распакуйте в любую папку.",
      "Запустите Install.cmd от имени администратора.",
      "Укажите папку GTA IV: The Complete Edition.",
      "Установщик скачает FusionFix и разложит файлы.",
      "Русский текст и озвучку поставьте отдельно по ссылкам."
    ],
    localization: {
      title: "Русский текст для GTA IV (Steam)",
      url: "https://libertycity.net/files/gta-4/130883-localization-for-gta-iv-steam.html",
      note: "Официальной русской озвучки в Steam-версии нет: только фанатские проекты. Текст — локализация 1C."
    },
    note: "FusionFix весит около 215 МБ — установщик скачивает его с GitHub. Сам ZIP пакета остаётся крошечным."
  },
  {
    id: "gta-v",
    localizationLabel: "Русская озвучка",
    game: "gta-v",
    title: "GTA V — Story Mode Starter",
    kicker: "60 FPS из коробки, моды — по желанию",
    version: "1.0.0",
    download: "dist/GTA_V_StoryMode_60FPS.zip",
    size: "меньше 1 МБ",
    badge: "RU · 60 FPS",
    accent: "#90e0ef",
    accent2: "#0077b6",
    description: "Не «мод-пак» в привычном смысле, а аккуратный стартовый набор: профиль настроек для 60 FPS, ссылки на OpenIV/ScriptHookV и предупреждение о GTA Online.",
    features: [
      "Профиль настроек 60 FPS",
      "Гайд по Story Mode модам",
      "Ссылки на OpenIV и ScriptHookV",
      "Русские субтитры из Steam",
      "Без риска для GTA Online",
      "Памятка по установке"
    ],
    mods: [
      { name: "OpenIV", author: "OpenIV Team", license: "Freeware", url: "https://openiv.com/" },
      { name: "ScriptHookV", author: "Alexander Blade", license: "Freeware", url: "https://dev-c.com/" }
    ],
    steps: [
      "Скачайте ZIP и прочитайте README.",
      "Настройте графику по профилю из пакета.",
      "Моды ставьте только в Story Mode.",
      "Не запускайте GTA Online с модами.",
      "Русские субтитры включите в настройках Steam."
    ],
    localization: {
      title: "Русская озвучка GTA V",
      url: "https://boosty.to/synthvoiceru",
      note: "Полная озвучка — платная фанатская; в Steam доступны русские субтитры."
    },
    note: "GTA V и так работает в 60 FPS на современном ПК. Пак нужен тем, кто хочет настроить всё один раз и не сломать онлайн."
  }
];
