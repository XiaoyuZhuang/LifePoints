(() => {
  const RELEASES =
    'https://github.com/XiaoyuZhuang/LifePoints/releases/latest';

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

  function addUpdateRow() {
    if (byId('checkUpdate')) {
      refreshVersion();
      return;
    }

    const exportRow = byId('export');
    if (!exportRow || !exportRow.parentNode) return;

    const row = document.createElement('div');
    row.className = 'sr tap';
    row.id = 'checkUpdate';
    row.innerHTML =
      '<div class="si">↻</div>' +
      '<div class="sl">Check for updates</div>' +
      '<div class="sv" id="versionLabel"></div>' +
      '<div>›</div>';

    exportRow.parentNode.insertBefore(row, exportRow);
    refreshVersion();

    row.onclick = () => {
      try {
        if (typeof window.haptic === 'function') {
          window.haptic();
        }
      } catch (_) {}

      const label = byId('versionLabel');
      if (label) label.textContent = 'Checking…';

      try {
        if (window.LifePointsUpdater?.checkForUpdate) {
          window.LifePointsUpdater.checkForUpdate();
        } else {
          location.href = RELEASES;
        }
      } catch (_) {
        refreshVersion();
        location.href = RELEASES;
      }
    };
  }

  window.LifePointsUpdateResult = async data => {
    if (data?.status === 'latest') {
      refreshVersion();
      if (typeof window.showInfo === 'function') {
        await window.showInfo(
          'Up to date',
          `LifePoints ${versionName()} is already the latest version.`
        );
      }
      return;
    }

    if (data?.status === 'available') {
      refreshVersion();
      let ok = true;
      if (typeof window.ask === 'function') {
        ok = await window.ask(
          'Update available',
          `${data.version} is available. Download and install it now?`,
          'Update'
        );
      }

      if (ok) {
        const label = byId('versionLabel');
        if (label) label.textContent = 'Downloading…';
        try {
          window.LifePointsUpdater?.downloadUpdate?.(
            data.downloadUrl,
            data.version
          );
        } catch (_) {
          refreshVersion();
          if (typeof window.showInfo === 'function') {
            await window.showInfo(
              'Update failed',
              'Could not start the update download.'
            );
          }
        }
      }
      return;
    }

    refreshVersion();
    if (typeof window.showInfo === 'function') {
      await window.showInfo(
        'Could not check for updates',
        data?.message || 'Please try again later.'
      );
    }
  };

  window.LifePointsDownloadState = async data => {
    const label = byId('versionLabel');

    if (data?.status === 'downloading') {
      if (label) label.textContent = 'Downloading…';
      return;
    }

    if (data?.status === 'permission') {
      if (label) label.textContent = 'Permission…';
      return;
    }

    if (data?.status === 'installing') {
      if (label) label.textContent = 'Installing…';
      return;
    }

    if (data?.status === 'error') {
      refreshVersion();
      if (typeof window.showInfo === 'function') {
        await window.showInfo(
          'Update failed',
          data?.message || 'Could not install the update.'
        );
      }
    }
  };

  addUpdateRow();
})();
