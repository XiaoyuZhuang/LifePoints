(() => {
  if (window.__lifePointsTimelineUndoInstalled) return;
  window.__lifePointsTimelineUndoInstalled = true;

  // New installs must start clean. Existing installs already have saved state,
  // so upgrades never overwrite a user's balance, tasks, rewards, or timeline.
  if (localStorage.getItem('lifepoints-state') === null) {
    state.balance = 0;
    state.totalEarned = 0;
    state.tasks = [];
    state.rewards = [];
    state.timeline = [];
    save();
    render();
  }

  const style = document.createElement('style');
  style.textContent = `
    .timeline{grid-template-columns:46px 28px minmax(0,1fr) auto 32px!important}
    .lpMultiplierRow{min-height:42px!important;padding:6px 10px!important;gap:8px!important}
    .lpMultiplierRow>.si{flex:0 0 24px}
    .lpMultiplierRow>.sl{white-space:nowrap;flex:1 1 auto}
    .lpMultiplierRow>.inputs{display:flex!important;grid-template-columns:none!important;border-top:0!important;padding:0!important;margin-left:auto!important;gap:4px!important;flex:0 0 auto}
    .lpMultiplierRow .mi{width:48px!important;padding:6px 5px!important;border-radius:9px!important;font-size:.72rem!important}
    @media(max-width:370px){.lpMultiplierRow .mi{width:42px!important;padding:6px 3px!important;font-size:.68rem!important}.lpMultiplierRow>.sl{font-size:.8rem!important}}
  `;
  document.head.appendChild(style);

  // Put “Custom multipliers” and its three values on one compact row.
  const multiplierInputs = document.querySelector('#m1')?.closest('.inputs');
  const multiplierHeader = multiplierInputs?.previousElementSibling;
  if (multiplierInputs && multiplierHeader?.classList.contains('sr')) {
    multiplierHeader.classList.add('lpMultiplierRow');
    multiplierHeader.appendChild(multiplierInputs);
  }

  window.renderHistory = function () {
    $('timeList').innerHTML = '';
    state.timeline.forEach((x, idx) => {
      const row = document.createElement('div');
      row.className = 'row timeline';
      row.innerHTML = `<div class="time">${esc(x.time)}</div><div class="ico">${esc(x.icon || '•')}</div><div class="historyName">${esc(x.text)}</div><div class="amt ${x.amount >= 0 ? 'pos' : 'neg'}">${x.amount >= 0 ? '+' : '−'}${fmt(Math.abs(x.amount))}</div><button class="deleteBtn" aria-label="Undo transaction">${trashSvg()}</button>`;
      row.children[4].onclick = async () => {
        haptic();
        const sign = x.amount >= 0 ? '+' : '−';
        const action = x.amount >= 0 ? 'remove the earned points' : 'restore the spent points';
        const ok = await ask(
          'Undo this entry?',
          `Undo ${sign}${fmt(Math.abs(x.amount))} points for "${x.text}"? This will ${action} and remove this timeline record.`,
          'Undo',
          true
        );
        if (!ok) return;

        state.balance -= x.amount;
        if (x.amount > 0) {
          state.totalEarned = Math.max(0, state.totalEarned - x.amount);
        }
        state.timeline.splice(idx, 1);
        save();
        render();
        haptic('success');
      };
      $('timeList').appendChild(row);
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
