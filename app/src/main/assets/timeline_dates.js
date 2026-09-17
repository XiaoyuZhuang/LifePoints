(() => {
  if (window.__lifePointsTimelineDatesInstalled) return;
  window.__lifePointsTimelineDatesInstalled = true;

  const style = document.createElement('style');
  style.textContent = `
    .timelineDateDivider{display:flex;align-items:center;gap:8px;margin:10px 4px 5px;color:var(--m);font-size:.72rem;font-weight:750;line-height:1;white-space:nowrap}
    .timelineDateDivider::before,.timelineDateDivider::after{content:"";height:1px;background:var(--l);flex:1}
  `;
  document.head.appendChild(style);

  const tr = (key, vars = {}) => {
    if (typeof window.lpT === 'function') return window.lpT(key, vars);
    return String(key).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
  };

  function entryDate(entry) {
    const raw = Number(entry?.id);
    if (!Number.isFinite(raw) || raw < 946684800000) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function dateKey(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function dateLabel(date) {
    if (!date) return '';
    const lang = typeof window.lpLang === 'function' ? window.lpLang() : 'en';
    const now = new Date();
    const sameYear = date.getFullYear() === now.getFullYear();
    if (lang === 'zh') {
      return sameYear
        ? `${date.getMonth() + 1}月${date.getDate()}日`
        : `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      ...(sameYear ? {} : { year: 'numeric' })
    }).format(date);
  }

  window.renderHistory = function () {
    const list = $('timeList');
    list.innerHTML = '';
    let previousDateKey = null;

    state.timeline.forEach((entry, idx) => {
      const date = entryDate(entry);
      const key = dateKey(date);

      // Keep the newest group clean. A date label appears only where the
      // chronological list actually crosses into another day.
      if (previousDateKey !== null && key && key !== previousDateKey) {
        const divider = document.createElement('div');
        divider.className = 'timelineDateDivider';
        divider.textContent = dateLabel(date);
        list.appendChild(divider);
      }
      if (key) previousDateKey = key;

      const row = document.createElement('div');
      row.className = 'row timeline';
      row.innerHTML = `<div class="time">${esc(entry.time)}</div><div class="ico">${esc(entry.icon || '•')}</div><div class="historyName">${esc(entry.text)}</div><div class="amt ${entry.amount >= 0 ? 'pos' : 'neg'}">${entry.amount >= 0 ? '+' : '−'}${fmt(Math.abs(entry.amount))}</div><button class="deleteBtn" aria-label="${esc(tr('undoAria'))}">${trashSvg()}</button>`;
      row.children[4].onclick = async () => {
        haptic();
        const message = entry.amount >= 0
          ? tr('undoEarn', { points: fmt(Math.abs(entry.amount)), name: entry.text })
          : tr('undoSpend', { points: fmt(Math.abs(entry.amount)), name: entry.text });
        if (!await ask(tr('undoTitle'), message, tr('undo'), true)) return;
        state.balance -= entry.amount;
        if (entry.amount > 0) state.totalEarned = Math.max(0, state.totalEarned - entry.amount);
        state.timeline.splice(idx, 1);
        save();
        render();
        haptic('success');
      };
      list.appendChild(row);
    });

    const gained = state.timeline.filter(x => x.amount > 0).reduce((a, b) => a + b.amount, 0);
    const spent = Math.abs(state.timeline.filter(x => x.amount < 0).reduce((a, b) => a + b.amount, 0));
    const net = gained - spent;
    $('gain').textContent = '+' + fmt(gained);
    $('spent').textContent = '−' + fmt(spent);
    $('net').textContent = (net >= 0 ? '+' : '−') + fmt(Math.abs(net));
    $('net').className = 'tv ' + (net >= 0 ? 'pos' : 'neg');
  };

  renderHistory();
})();
