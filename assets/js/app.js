/* GTA ALL — interactions */
(() => {
  "use strict";

  const games = window.GTA_GAMES || [];
  const editions = window.GTA_EDITIONS || [];
  const modpacks = window.GTA_MODPACKS || [];
  const gameById = new Map(games.map((game) => [game.id, game]));
  const packById = new Map(modpacks.map((pack) => [pack.id, pack]));
  const STORAGE_KEY = "gta-all-progress-v1";
  const supportsObservers = typeof window.IntersectionObserver === "function";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>';
  const arrowIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m0 0-6-6m6 6-6 6"/></svg>';
  const downloadIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"/></svg>';

  /* ------------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------------ */
  const menuToggle = $(".menu-toggle");
  const mobileMenu = $("#mobileMenu");

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.hidden = true;
    document.body.classList.remove("menu-open");
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.hidden = isOpen;
      document.body.classList.toggle("menu-open", !isOpen);
    });

    $$("a", mobileMenu).forEach((link) => link.addEventListener("click", closeMenu));

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ------------------------------------------------------------------------
     Header state + active nav
     ------------------------------------------------------------------------ */
  const header = $(".site-header");
  const navLinks = $$(".site-nav a");

  const updateHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (supportsObservers) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    ["order", "games", "mods", "fps", "guide"].forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* ------------------------------------------------------------------------
     Progress
     ------------------------------------------------------------------------ */
  const getProgress = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((id) => gameById.has(id)) : [];
    } catch {
      return [];
    }
  };

  const saveProgress = (ids) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* localStorage may be unavailable */
    }
  };

  let progress = new Set(getProgress());

  const renderProgress = () => {
    const total = games.length;
    const count = progress.size;
    const bar = $("#progressBar");
    const text = $("#progressText");
    const percent = total ? Math.round((count / total) * 100) : 0;

    if (bar) bar.style.width = `${percent}%`;
    if (text) text.textContent = `${count} / ${total} пройдено`;

    const progressbar = $(".progress-bar");
    if (progressbar) progressbar.setAttribute("aria-valuenow", String(count));

    $$("[data-progress]").forEach((button) => {
      const id = button.getAttribute("data-progress");
      const checked = progress.has(id);
      button.classList.toggle("is-checked", checked);
      button.setAttribute("aria-pressed", String(checked));
      const game = gameById.get(id);
      const label = game ? game.short : "игра";
      button.setAttribute("aria-label", checked ? `Снять отметку: ${label}` : `Отметить пройденной: ${label}`);
    });

    $$(".timeline-item").forEach((item) => {
      item.classList.toggle("is-done", progress.has(item.dataset.id));
    });
  };

  const toggleProgress = (id) => {
    if (!id) return;
    if (progress.has(id)) progress.delete(id);
    else progress.add(id);
    saveProgress([...progress]);
    renderProgress();
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-progress]");
    if (!trigger) return;
    event.preventDefault();
    toggleProgress(trigger.getAttribute("data-progress"));
  });

  const resetButton = $("#resetProgress");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (!progress.size) return;
      const confirmed = window.confirm("Сбросить весь прогресс прохождения?");
      if (!confirmed) return;
      progress.clear();
      saveProgress([]);
      renderProgress();
    });
  }

  /* ------------------------------------------------------------------------
     Timeline
     ------------------------------------------------------------------------ */
  const routes = {
    release: {
      groups: [
        { title: "2D-эра · 1997—1999", ids: ["gta-1", "london-1969", "london-1961", "gta-2"] },
        { title: "3D-эра · 2001—2006", ids: ["gta-iii", "gta-vc", "gta-sa", "gta-advance", "gta-lcs", "gta-vcs"] },
        { title: "HD-эра · 2008—2026", ids: ["gta-iv", "gta-tlad", "gta-chinatown", "gta-tbogt", "gta-v", "gta-vi"] }
      ]
    },
    story: {
      groups: [
        { title: "2D-вселенная · 1961—2013", ids: ["london-1961", "london-1969", "gta-1", "gta-2"] },
        { title: "3D-вселенная · 1984—2001", ids: ["gta-vcs", "gta-vc", "gta-sa", "gta-lcs", "gta-advance", "gta-iii"] },
        { title: "HD-вселенная · 2008—2026", ids: ["gta-iv", "gta-tlad", "gta-tbogt", "gta-chinatown", "gta-v", "gta-vi"] }
      ]
    },
    mainline: {
      groups: [
        { title: "Основная линия · без спин-оффов", ids: ["gta-iii", "gta-vc", "gta-sa", "gta-iv", "gta-v", "gta-vi"] }
      ]
    }
  };

  const renderTimeline = (routeName) => {
    const timeline = $("#timeline");
    if (!timeline) return;

    const route = routes[routeName] || routes.release;
    timeline.innerHTML = route.groups
      .map((group) => {
        const items = group.ids
          .map((id) => gameById.get(id))
          .filter(Boolean)
          .map((game, index) => {
            const done = progress.has(game.id);
            const steam = game.steam
              ? `<a class="steam-mini" href="${game.steam.url}" target="_blank" rel="noopener">Steam ↗</a>`
              : `<a href="${game.official}" target="_blank" rel="noopener">Официально ↗</a>`;
            const pack = game.modpack && packById.has(game.modpack)
              ? `<a href="#pack-${game.modpack}">Мод-пак</a>`
              : "";
            const localization = game.localization
              ? `<a href="${game.localization.url}" target="_blank" rel="noopener">${game.localizationLabel || "Русская локализация"} ↗</a>`
              : "";
            return `
              <article class="timeline-item ${done ? "is-done" : ""}" data-id="${game.id}" style="animation-delay:${index * 35}ms">
                <div class="timeline-year">
                  <strong>${game.year}</strong>
                  <span>${game.universe} · ${game.typeLabel}</span>
                </div>
                <div class="timeline-card">
                  <div class="timeline-topline">
                    <span class="timeline-order">#${String(game.order).padStart(2, "0")}</span>
                    <span class="timeline-type">${game.badge}</span>
                  </div>
                  <h3>${game.title}</h3>
                  <p>${game.description}</p>
                  <div class="timeline-meta">
                    <span>${game.setting}</span>
                    <span>${game.hours} ч</span>
                    <span>${game.platforms.slice(0, 2).join(" · ")}</span>
                  </div>
                  <div class="timeline-actions">
                    ${steam}
                    ${pack}
                    ${localization}
                  </div>
                </div>
                <button class="timeline-check ${done ? "is-checked" : ""}" type="button" data-progress="${game.id}" aria-pressed="${done}" aria-label="${done ? "Снять отметку" : "Отметить пройденной"}: ${game.short}">
                  ${checkIcon}
                </button>
              </article>`;
          })
          .join("");

        return `
          <div class="timeline-group">
            <h3 class="timeline-group-title">${group.title}</h3>
            ${items}
          </div>`;
      })
      .join("");

    renderProgress();
  };

  const routeTabs = $$(".route-tab");
  routeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      routeTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderTimeline(tab.dataset.route);
    });
  });

  /* ------------------------------------------------------------------------
     Game cards
     ------------------------------------------------------------------------ */
  const gamesGrid = $("#gamesGrid");
  const emptyState = $("#emptyState");
  const searchInput = $("#gameSearch");
  const filterChips = $$(".chip");
  let activeFilter = "all";
  let query = "";

  const gameCard = (game, index) => {
    const done = progress.has(game.id);
    const image = game.image
      ? `<img src="${game.image}" alt="${game.title}" loading="lazy" onerror="this.classList.add('is-error')">`
      : "";
    const link = game.steam
      ? `<a class="steam-btn" href="${game.steam.url}" target="_blank" rel="noopener">Steam ↗</a>`
      : `<a href="${game.official}" target="_blank" rel="noopener">Официально ↗</a>`;

    return `
      <article class="game-card" style="--accent:${game.accent};--accent2:${game.accent2};animation-delay:${Math.min(index, 8) * 45}ms">
        <div class="game-cover">
          <div class="cover-fallback" data-year="${game.year}" aria-hidden="true"></div>
          ${image}
          <span class="game-cover-badge">${game.badge}</span>
          <span class="game-cover-year">${game.year}</span>
        </div>
        <div class="game-body">
          <p class="game-type">${game.typeLabel}</p>
          <h3>${game.title}</h3>
          <p class="game-desc">${game.description}</p>
          <div class="game-tags">${game.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
          <div class="game-footer">
            <span class="game-hours">${game.hours} ч</span>
            <div class="game-links">
              ${link}
              <button class="game-check ${done ? "is-checked" : ""}" type="button" data-progress="${game.id}" aria-pressed="${done}" aria-label="${done ? "Снять отметку" : "Отметить пройденной"}: ${game.short}">
                ${checkIcon}
              </button>
            </div>
          </div>
        </div>
      </article>`;
  };

  const renderGames = () => {
    if (!gamesGrid) return;

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = games.filter((game) => {
      const matchesFilter = activeFilter === "all" || game.type === activeFilter;
      const haystack = [
        game.title,
        game.short,
        game.year,
        game.setting,
        game.protagonist,
        game.description,
        game.tags.join(" "),
        game.platforms.join(" ")
      ]
        .join(" ")
        .toLowerCase();
      return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
    });

    gamesGrid.innerHTML = filtered.map(gameCard).join("");
    if (emptyState) emptyState.hidden = filtered.length > 0;
    renderProgress();
  };

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      query = event.target.value;
      renderGames();
    });
  }

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter || "all";
      filterChips.forEach((item) => item.classList.toggle("is-active", item === chip));
      renderGames();
    });
  });

  const clearSearch = $("#clearSearch");
  if (clearSearch) {
    clearSearch.addEventListener("click", () => {
      query = "";
      activeFilter = "all";
      if (searchInput) searchInput.value = "";
      filterChips.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === "all"));
      renderGames();
    });
  }

  /* ------------------------------------------------------------------------
     Editions
     ------------------------------------------------------------------------ */
  const editionsGrid = $("#editionsGrid");
  if (editionsGrid) {
    editionsGrid.innerHTML = editions
      .map(
        (edition) => `
          <a class="edition-card" href="${edition.steam.url}" target="_blank" rel="noopener">
            <div class="edition-cover">
              <span class="edition-fallback" aria-hidden="true">${edition.year}</span>
              ${edition.image ? `<img src="${edition.image}" alt="${edition.title}" loading="lazy" onerror="this.remove()">` : ""}
            </div>
            <div class="edition-body">
              <h4>${edition.title}</h4>
              <p>${edition.description}</p>
              <span>Steam ↗</span>
            </div>
          </a>`
      )
      .join("");
  }

  /* ------------------------------------------------------------------------
     Modpacks
     ------------------------------------------------------------------------ */
  const modpacksGrid = $("#modpacksGrid");
  if (modpacksGrid) {
    modpacksGrid.innerHTML = modpacks
      .map(
        (pack) => `
          <article class="mod-card" id="pack-${pack.id}" style="--accent:${pack.accent};--accent2:${pack.accent2}">
            <div class="mod-card-top">
              <span class="mod-badge">${pack.badge}</span>
              <span class="mod-version">v${pack.version}</span>
            </div>
            <p class="mod-kicker">${pack.kicker}</p>
            <h3 class="mod-title">${pack.title}</h3>
            <p class="mod-desc">${pack.description}</p>
            <ul class="mod-features">
              ${pack.features.map((feature) => `<li>${feature}</li>`).join("")}
            </ul>
            <div class="mod-actions">
              <a class="mod-download" href="${pack.download}" download>${downloadIcon} Скачать ZIP · ${pack.size}</a>
              <a class="mod-voice" href="${pack.localization.url}" target="_blank" rel="noopener">${pack.localizationLabel || "Русская локализация"} ↗</a>
            </div>
            <details class="mod-details">
              <summary>Что внутри и кто авторы</summary>
              <ul class="mod-list">
                ${pack.mods
                  .map(
                    (mod) =>
                      `<li><span>${mod.name} — ${mod.author}</span><a href="${mod.url}" target="_blank" rel="noopener">${mod.license} ↗</a></li>`
                  )
                  .join("")}
              </ul>
            </details>
            <p class="mod-note">${pack.note}</p>
          </article>`
      )
      .join("");
  }

  /* ------------------------------------------------------------------------
     Counters
     ------------------------------------------------------------------------ */
  const counters = $$("[data-counter]");
  const animateCounter = (element) => {
    const target = Number(element.dataset.counter || 0);
    const duration = 1300;
    const start = performance.now();
    const reduced = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !Number.isFinite(target)) {
      element.textContent = target.toLocaleString("ru-RU");
      return;
    }

    const tick = (now) => {
      const progressValue = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = Math.round(target * eased).toLocaleString("ru-RU");
      if (progressValue < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (supportsObservers) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((counter) => animateCounter(counter));
  }

  /* ------------------------------------------------------------------------
     Reveal
     ------------------------------------------------------------------------ */
  const revealElements = $$(".reveal");

  if (supportsObservers) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------------
     Copy command
     ------------------------------------------------------------------------ */
  const copyButton = $("#copyCommand");
  const command = $("#installCommand");

  if (copyButton && command) {
    copyButton.addEventListener("click", async () => {
      const text = command.textContent || "";
      try {
        await navigator.clipboard.writeText(text);
        copyButton.textContent = "Скопировано";
      } catch {
        /* Older browsers and embedded webviews: fall back to selecting the text. */
        try {
          const range = document.createRange();
          range.selectNodeContents(command);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          if (typeof document.execCommand === "function") {
            document.execCommand("copy");
            copyButton.textContent = "Скопировано";
          } else {
            copyButton.textContent = "Текст выделен";
          }
        } catch {
          copyButton.textContent = "Скопируйте вручную";
        }
      }
      window.setTimeout(() => {
        copyButton.textContent = "Копировать";
      }, 1800);
    });
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  renderTimeline("release");
  renderGames();
  renderProgress();
})();
