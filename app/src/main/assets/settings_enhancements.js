(() => {
  if (window.__lifePointsSettingsEnhancementsInstalled) return;
  window.__lifePointsSettingsEnhancementsInstalled = true;

  const RELEASES = 'https://github.com/XiaoyuZhuang/LifePoints/releases/latest';
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
  const LAST_CHECK_KEY = 'lifepoints-update-last-check';
  const DISMISSED_VERSION_KEY = 'lifepoints-update-dismissed-version';

  const tr = (key, vars = {}) => {
    if (typeof window.lpT === 'function') return window.lpT(key, vars);
    let text = key;
    return String(text).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function versionName() {
    try {
      return window.LifePointsUpdater?.getVersionName?.() || '';
    } catch (_) {
      return '';
    }
  }

  function refreshVersion() {
    const label = byId('versionLabel');
    if (!label) return;
    const version = versionName();
    label.textContent = version ? `v${String(version).replace(/^v/i, '')}` : '';
  }

  function installCompactAppearance() {
    if (byId('lpCompactAppearance')) return;

    const themePicker = document.querySelector('#settings .themes');
    const langPicker = document.querySelector('#settings .lpLangPicker');
    const fontPicker = document.querySelector('#settings .fontPicker');
    if (!themePicker || !langPicker || !fontPicker) return;

    const themeSection = themePicker.closest('.section');
    const langSection = langPicker.closest('.section');
    const fontSection = fontPicker.closest('.section');
    if (!themeSection || !fontSection) return;

    const compact = document.createElement('div');
    compact.className = 'section lpCompactSection';
    compact.id = 'lpCompactAppearance';
    compact.innerHTML = `
      <div class="card lpCompactCard">
        <div class="sr lpCompactRow"><div class="sl lpCompactLabel" id="lpCompactThemeLabel"></div><div class="lpCompactControl" id="lpThemeMount"></div></div>
        <div class="sr lpCompactRow"><div class="sl lpCompactLabel" id="lpCompactLanguageLabel"></div><div class="lpCompactControl" id="lpLanguageMount"></div></div>
        <div class="sr lpCompactRow"><div class="sl lpCompactLabel" id="lpCompactFontLabel"></div><div class="lpCompactControl" id="lpFontMount"></div></div>
      </div>`;

    themeSection.parentNode.insertBefore(compact, themeSection);
    byId('lpThemeMount').appendChild(themePicker);
    byId('lpLanguageMount').appendChild(langPicker);
    byId('lpFontMount').appendChild(fontPicker);

    [themeSection, langSection, fontSection].forEach(section => {
      if (section && section !== compact && section.parentNode) section.remove();
    });

    const style = document.createElement('style');
    style.id = 'lpCompactSettingsStyle';
    style.textContent = `
      .lpCompactSection{margin-top:10px!important}
      .lpCompactCard .lpCompactRow{min-height:42px;padding:6px 10px;gap:8px}
      .lpCompactLabel{font-size:.84rem;font-weight:700;white-space:nowrap;flex:0 0 auto}
      .lpCompactControl{margin-left:auto;display:flex;justify-content:flex-end;min-width:0;max-width:76%}
      .lpCompactControl .themes,.lpCompactControl .lpLangPicker,.lpCompactControl .fontPicker{display:flex!important;grid-template-columns:none!important;gap:4px!important;width:auto;margin:0}
      .lpCompactControl .theme,.lpCompactControl .lpLangBtn,.lpCompactControl .fontBtn{padding:6px 8px!important;border-radius:9px!important;font-size:.72rem!important;line-height:1.1;min-width:0!important;white-space:nowrap}
      @media(max-width:370px){.lpCompactControl{max-width:78%}.lpCompactControl .theme,.lpCompactControl .lpLangBtn,.lpCompactControl .fontBtn{padding:6px!important;font-size:.68rem!important}}
    `;
    document.head.appendChild(style);
    syncCompactLabels();
  }

  function syncCompactLabels() {
    const theme = byId('lpCompactThemeLabel');
    const language = byId('lpCompactLanguageLabel');
    const font = byId('lpCompactFontLabel');
    if (theme) theme.textContent = tr('Theme');
    if (language) language.textContent = tr('language');
    if (font) font.textContent = tr('Font size');
  }

  let checkInFlight = false;
  let pendingMode = null;

  function ensureUpdateRow() {
    let row = byId('checkUpdate');
    if (!row) {
      const exportRow = byId('export');
      if (!exportRow || !exportRow.parentNode) return null;
      row = document.createElement('div');
      row.className = 'sr tap';
      row.id = 'checkUpdate';
      row.innerHTML = '<div class="si">↻</div><div class="sl"></div><div class="sv" id="versionLabel"></div><div>›</div>';
      exportRow.parentNode.insertBefore(row, exportRow);
    }

    const label = row.querySelector('.sl');
    if (label) label.textContent = tr('Check for updates');
    refreshVersion();
    row.onclick = () => {
      try { if (typeof window.haptic === 'function') window.haptic(); } catch (_) {}
      localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));
      startCheck('manual');
    };
    return row;
  }

  function startCheck(mode) {
    if (checkInFlight) {
      if (mode === 'manual') pendingMode = 'manual';
      return;
    }

    if (!window.LifePointsUpdater?.checkForUpdate) {
      if (mode === 'manual') location.href = RELEASES;
      return;
    }

    checkInFlight = true;
    pendingMode = mode;
    if (mode === 'manual') {
      const label = byId('versionLabel');
      if (label) label.textContent = tr('checking');
    }

    try {
      window.LifePointsUpdater.checkForUpdate();
    } catch (_) {
      checkInFlight = false;
      pendingMode = null;
      refreshVersion();
      if (mode === 'manual') location.href = RELEASES;
    }
  }

  async function handleUpdateResult(data) {
    checkInFlight = false;
    const mode = pendingMode || 'manual';
    pendingMode = null;

    if (data?.status === 'latest') {
      refreshVersion();
      if (mode === 'manual' && typeof window.showInfo === 'function') {
        await window.showInfo(
          tr('upToDate'),
          tr('upToDateMsg', { version: versionName() })
        );
      }
      return;
    }

    if (data?.status === 'available') {
      refreshVersion();
      const versionKey = String(data.versionCode || data.version || data.downloadUrl || '');
      const dismissed = localStorage.getItem(DISMISSED_VERSION_KEY);
      if (mode === 'auto' && versionKey && dismissed === versionKey) return;

      let ok = true;
      if (typeof window.ask === 'function') {
        ok = await window.ask(
          tr('updateAvailable'),
          tr('updateAvailableMsg', { version: data.version }),
          tr('update')
        );
      }

      if (!ok) {
        if (versionKey) localStorage.setItem(DISMISSED_VERSION_KEY, versionKey);
        return;
      }

      if (versionKey && dismissed === versionKey) {
        localStorage.removeItem(DISMISSED_VERSION_KEY);
      }
      const label = byId('versionLabel');
      if (label) label.textContent = tr('downloading');
      try {
        window.LifePointsUpdater?.downloadUpdate?.(data.downloadUrl, data.version);
      } catch (_) {
        refreshVersion();
        if (typeof window.showInfo === 'function') {
          await window.showInfo(tr('updateFailed'), tr('updateStartFailed'));
        }
      }
      return;
    }

    refreshVersion();
    if (mode === 'manual' && typeof window.showInfo === 'function') {
      await window.showInfo(
        tr('updateCheckFailed'),
        (window.lpLang?.() === 'en' && data?.message) ? data.message : tr('tryAgain')
      );
    }
  }

  window.LifePointsUpdateResult = handleUpdateResult;

  function maybeAutoCheck() {
    const now = Date.now();
    const last = Number(localStorage.getItem(LAST_CHECK_KEY) || 0);
    if (now - last < THREE_DAYS) return;
    localStorage.setItem(LAST_CHECK_KEY, String(now));
    startCheck('auto');
  }
  window.LifePointsMaybeAutoCheck = maybeAutoCheck;

  const previousRender = typeof render === 'function' ? render : null;
  if (previousRender) {
    render = function () {
      previousRender();
      installCompactAppearance();
      syncCompactLabels();
      ensureUpdateRow();
    };
  }

  installCompactAppearance();
  syncCompactLabels();
  ensureUpdateRow();
  setTimeout(maybeAutoCheck, 900);
})();
