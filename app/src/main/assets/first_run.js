(() => {
  if (window.__lifePointsFirstRunHandled) return;
  window.__lifePointsFirstRunHandled = true;

  // Existing installs already have lifepoints-state. Never overwrite them.
  if (localStorage.getItem('lifepoints-state') !== null) return;

  // A genuinely new install starts clean: no demo balance, tasks, rewards,
  // or timeline entries. Keep the normal default preferences and icon sets.
  state.balance = 0;
  state.totalEarned = 0;
  state.tasks = [];
  state.rewards = [];
  state.timeline = [];

  save();
  render();
})();
