(() => {
  if (window.__lifePointsUpdateFailureUiInstalled) return;
  window.__lifePointsUpdateFailureUiInstalled = true;

  const RELEASES = 'https://github.com/XiaoyuZhuang/LifePoints/releases/latest';
  const previous = window.LifePointsDownloadState;

  const isZh = () => {
    try { return window.lpLang?.() === 'zh'; }
    catch (_) { return false; }
  };

  function refreshVersionLabel() {
    const label = document.getElementById('versionLabel');
    if (!label) return;
    try {
      const version = window.LifePointsUpdater?.getVersionName?.() || '';
      label.textContent = version ? `v${String(version).replace(/^v/i, '')}` : '';
    } catch (_) {}
  }

  window.LifePointsDownloadState = async data => {
    if (data?.status !== 'error') {
      if (typeof previous === 'function') return previous(data);
      return;
    }

    refreshVersionLabel();
    const zh = isZh();
    const title = zh ? '更新失败' : 'Update failed';
    const message = zh
      ? '通过 GitHub 官方更新入口下载仍然失败。是否前往 GitHub Release 页面手动下载最新版？'
      : 'The update could not be downloaded through the available GitHub paths. Open the GitHub Releases page and download the latest version manually?';
    const confirm = zh ? '前往 GitHub' : 'Open GitHub';

    if (typeof window.ask === 'function') {
      const ok = await window.ask(title, message, confirm);
      if (ok) location.href = RELEASES;
    } else if (typeof window.showInfo === 'function') {
      await window.showInfo(title, message);
    }
  };
})();
