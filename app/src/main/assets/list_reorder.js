(() => {
  if (window.__lpReorderInstalled) return;
  window.__lpReorderInstalled = true;
  const style = document.createElement('style');
  style.textContent = `
    #taskList .row,#rewardList .row{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
    .lpDragPlaceholder{opacity:.25;border:1px dashed var(--g)!important}
    .lpDragGhost{position:fixed!important;z-index:100;pointer-events:none;box-shadow:0 8px 24px #0004;opacity:.96;border-color:var(--g)!important;transform:scale(1.02)}
  `;
  document.head.appendChild(style);
  let drag = null, blockClickUntil = 0;
  const lists = ['taskList', 'rewardList'].map(id => document.getElementById(id));

  function start(target, x, y, touchId = null) {
    if (drag || Date.now() < blockClickUntil) return;
    const row = target.closest('.row');
    const list = row?.parentElement;
    if (!lists.includes(list) || list.children.length < 2) return;
    const items = list.id === 'taskList' ? state.tasks : state.rewards;
    drag = { row, list, items, originalRows: Array.from(list.children), x, y,
      startX: x, startY: y, touchId, active: false, frame: 0 };
    drag.timer = setTimeout(activate, 450);
  }

  function activate() {
    const d = drag;
    if (!d || !d.row.isConnected) return finish(false);
    d.active = true;
    const rect = d.row.getBoundingClientRect();
    d.offset = d.startY - rect.top;
    d.ghost = d.row.cloneNode(true);
    d.ghost.classList.add('lpDragGhost');
    d.ghost.setAttribute('aria-hidden', 'true');
    Object.assign(d.ghost.style, { left: rect.left + 'px', width: rect.width + 'px', height: rect.height + 'px' });
    document.body.appendChild(d.ghost);
    d.row.classList.add('lpDragPlaceholder');
    haptic('success');
    tick();
  }

  function tick() {
    const d = drag;
    if (!d?.active) return;
    if (!d.row.isConnected || !d.list.closest('.page')?.classList.contains('on')) return finish(false);
    d.ghost.style.top = (d.y - d.offset) + 'px';
    const bottom = document.querySelector('.nav')?.getBoundingClientRect().top ?? innerHeight;
    const edge = 64;
    const speed = d.y < edge ? -Math.min(14, (edge - d.y) / 4)
      : d.y > bottom - edge ? Math.min(14, (d.y - bottom + edge) / 4) : 0;
    if (speed) window.scrollBy(0, speed);
    const siblings = Array.from(d.list.children).filter(row => row !== d.row);
    const before = siblings.find(row => {
      const r = row.getBoundingClientRect();
      return d.y < r.top + r.height / 2;
    });
    d.list.insertBefore(d.row, before || null);
    d.frame = requestAnimationFrame(tick);
  }

  function move(x, y, event) {
    if (!drag) return;
    if (!drag.active && Math.hypot(x - drag.startX, y - drag.startY) > 10) {
      finish(false); // A normal swipe keeps scrolling instead of starting a drag.
      return;
    }
    drag.x = x; drag.y = y;
    if (drag.active && event.cancelable) event.preventDefault();
  }

  function finish(commit) {
    const d = drag;
    if (!d) return;
    drag = null;
    clearTimeout(d.timer);
    cancelAnimationFrame(d.frame);
    if (!d.active) return;
    blockClickUntil = Date.now() + 700;
    d.ghost.remove();
    d.row.classList.remove('lpDragPlaceholder');
    if (commit) {
      const ordered = Array.from(d.list.children).map(row => d.items[d.originalRows.indexOf(row)]);
      if (ordered.length === d.items.length && ordered.every(Boolean)) {
        if (d.list.id === 'taskList') state.tasks = ordered;
        else state.rewards = ordered;
        save();
        haptic();
      }
    }
    render();
  }

  lists.forEach(list => {
    list.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) { finish(false); return; }
      const t = e.touches[0];
      start(e.target, t.clientX, t.clientY, t.identifier);
    }, { passive: true });
    list.addEventListener('mousedown', e => {
      if (e.button === 0) start(e.target, e.clientX, e.clientY);
    });
    list.addEventListener('contextmenu', e => e.preventDefault());
  });
  document.addEventListener('touchstart', e => {
    if (e.touches.length > 1) finish(false);
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (!drag || drag.touchId === null) return;
    const t = Array.from(e.touches).find(t => t.identifier === drag.touchId);
    if (t) move(t.clientX, t.clientY, e);
  }, { passive: false });
  document.addEventListener('touchend', e => {
    if (!drag || drag.touchId === null) return;
    if (Array.from(e.changedTouches).some(t => t.identifier === drag.touchId)) {
      if (drag.active && e.cancelable) e.preventDefault();
      finish(true);
    }
  }, { passive: false });
  document.addEventListener('touchcancel', () => finish(false), { passive: true });
  document.addEventListener('mousemove', e => {
    if (drag?.touchId === null) move(e.clientX, e.clientY, e);
  });
  document.addEventListener('mouseup', () => { if (drag?.touchId === null) finish(true); });
  document.addEventListener('click', e => {
    if (drag?.active || Date.now() < blockClickUntil) {
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') finish(false); });
  window.addEventListener('blur', () => finish(false));
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(false); });
  const previousBack = window.LifePointsBack;
  window.LifePointsBack = () => {
    if (drag) { finish(false); return true; }
    return previousBack ? previousBack() : false;
  };
})();
