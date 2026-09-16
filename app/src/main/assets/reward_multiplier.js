(() => {
  if (window.__lifePointsRewardMultiplierInstalled) return;
  window.__lifePointsRewardMultiplierInstalled = true;

  const style = document.createElement('style');
  style.textContent = '.reward{grid-template-columns:30px minmax(0,1fr) auto auto auto!important}';
  document.head.appendChild(style);

  const tr = (key, vars = {}) => {
    if (typeof window.lpT === 'function') return window.lpT(key, vars);
    let text = key;
    return String(text).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
  };

  window.renderRewards = function () {
    $('rewardList').innerHTML = '';
    state.rewards.forEach(reward => {
      const index = Number.isInteger(reward.m) && reward.m >= 0
        ? reward.m % state.multipliers.length
        : 0;
      const mult = Number(state.multipliers[index] ?? 1);
      const amount = Math.round(Number(reward.cost) * mult * 10) / 10;

      const row = document.createElement('div');
      row.className = 'row reward';
      row.innerHTML = `<div class="ico">${esc(iconFor(reward,'reward'))}</div><button class="itemName">${esc(reward.name)}</button><button class="mul">${fmt(mult)}×</button><button class="pts spend">−${fmt(amount)}</button><button class="deleteBtn" aria-label="${esc(tr('deleteRewardAria'))}">${trashSvg()}</button>`;

      row.children[0].onclick = () => openItemEditor('reward', reward.id);
      row.children[1].onclick = () => openItemEditor('reward', reward.id);
      row.children[2].onclick = () => {
        const current = Number.isInteger(reward.m) && reward.m >= 0 ? reward.m : 0;
        reward.m = (current + 1) % state.multipliers.length;
        haptic();
        save();
        render();
      };
      row.children[3].onclick = async () => {
        const current = Number.isInteger(reward.m) && reward.m >= 0
          ? reward.m % state.multipliers.length
          : 0;
        const multiplier = Number(state.multipliers[current] ?? 1);
        const points = Math.round(Number(reward.cost) * multiplier * 10) / 10;

        if (state.balance < points) {
          haptic();
          await showInfo(
            tr('notEnoughTitle'),
            tr('notEnoughMsg', { points: fmt(points), name: reward.name })
          );
          return;
        }
        if (state.confirmSpend && !await ask(
          tr('spendTitle'),
          tr('spendMsg', { points: fmt(points), name: reward.name }),
          tr('spend')
        )) return;

        state.balance -= points;
        state.timeline.unshift({
          id: Date.now(),
          time: now(),
          icon: iconFor(reward,'reward'),
          text: reward.name,
          amount: -points
        });
        haptic('success');
        save();
        render();
      };
      row.children[4].onclick = async () => {
        haptic();
        if (await ask(
          tr('deleteRewardTitle'),
          tr('deleteRewardMsg', { name: reward.name }),
          tr('delete'),
          true
        )) {
          state.rewards = state.rewards.filter(x => x.id !== reward.id);
          save();
          render();
        }
      };
      $('rewardList').appendChild(row);
    });
  };

  render();
})();
