(() => {
  if (window.__lifePointsBilingualInstalled) return;
  window.__lifePointsBilingualInstalled = true;

  const RELEASES = 'https://github.com/XiaoyuZhuang/LifePoints/releases/latest';
  const DEFAULT_LANG = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';

  const I18N = {
    en: {
      'My tasks':'My tasks','My rewards':'My rewards','Timeline':'Timeline','Settings':'Settings','＋ Add':'＋ Add',
      'Balance':'Balance','Total earned':'Total earned','Gained':'Gained','Spent':'Spent','Net':'Net',
      'Theme':'Theme','☀︎ Light':'☀︎ Light','☾ Pure Black':'☾ Pure Black','Font size':'Font size','Small':'Small','Default':'Default','Large':'Large','XL':'XL',
      'Points':'Points','Custom multipliers':'Custom multipliers','Confirm before spending points':'Confirm before spending points','Haptics':'Haptics',
      'Icon library':'Icon library','Task icons':'Task icons','Reward icons':'Reward icons','Tap × to remove an icon':'Tap × to remove an icon',
      'App':'App','Support me':'Support me','About LifePoints':'About LifePoints','Check for updates':'Check for updates','Export data':'Export data','Clear all data':'Clear all data',
      'Tasks':'Tasks','Rewards':'Rewards','Name':'Name','Icon':'Icon','(optional)':'(optional)','Cancel':'Cancel','Save':'Save','Add':'Add','OK':'OK','Confirm':'Confirm',
      language:'Language', chinese:'中文', english:'English',
      iconPlaceholder:'Type an emoji or symbol, or leave blank for default', iconHint:'Choose from your icon library or type your own.', newIconPlaceholder:'Type an emoji or symbol',
      addTask:'Add task',editTask:'Edit task',addReward:'Add reward',editReward:'Edit reward',addTaskIcon:'Add task icon',addRewardIcon:'Add reward icon',
      deleteTaskTitle:'Delete task?',deleteTaskMsg:'Delete "{name}" from your task list?',deleteRewardTitle:'Delete reward?',deleteRewardMsg:'Delete "{name}" from your rewards?',delete:'Delete',
      notEnoughTitle:'Not enough points',notEnoughMsg:'You need {points} points for "{name}".',spendTitle:'Spend points?',spendMsg:'Spend {points} points on "{name}"?',spend:'Spend',
      undoTitle:'Undo this entry?',undoEarn:'Undo +{points} points for "{name}"? This will remove the earned points and delete this timeline record.',undoSpend:'Undo −{points} points for "{name}"? This will restore the spent points and delete this timeline record.',undo:'Undo',
      removeIconTitle:'Remove icon?',removeIconMsg:'Remove {icon} from your {type} icon library?',remove:'Remove',taskWord:'task',rewardWord:'reward',
      aboutMsg:'Do things. Earn points. Spend them on rewards.',
      checking:'Checking…',downloading:'Downloading…',permission:'Permission…',installing:'Installing…',
      upToDate:'Up to date',upToDateMsg:'LifePoints {version} is already the latest version.',updateAvailable:'Update available',updateAvailableMsg:'{version} is available. Download and install it now?',update:'Update',
      updateFailed:'Update failed',updateStartFailed:'Could not start the update download.',updateCheckFailed:'Could not check for updates',tryAgain:'Please check your network connection and try again later.',installFailed:'Could not install the update.',
      clearTitle:'Clear all data?',clearMsg:'Tasks, rewards, balance, total earned, and timeline will be permanently cleared. Theme, language, font size, icon libraries, multipliers, and app preferences will be kept.',clearButton:'Clear all',
      deleteTaskAria:'Delete task',deleteRewardAria:'Delete reward',undoAria:'Undo transaction'
    },
    zh: {
      'My tasks':'我的任务','My rewards':'我的奖励','Timeline':'时间线','Settings':'设置','＋ Add':'＋ 添加',
      'Balance':'余额','Total earned':'累计获得','Gained':'获得','Spent':'支出','Net':'净值',
      'Theme':'主题','☀︎ Light':'☀︎ 浅色','☾ Pure Black':'☾ 纯黑','Font size':'字体大小','Small':'小','Default':'默认','Large':'大','XL':'特大',
      'Points':'积分','Custom multipliers':'自定义倍率','Confirm before spending points':'消费积分前确认','Haptics':'触觉反馈',
      'Icon library':'图标库','Task icons':'任务图标','Reward icons':'奖励图标','Tap × to remove an icon':'点击 × 删除图标',
      'App':'应用','Support me':'支持我','About LifePoints':'关于 LifePoints','Check for updates':'检查更新','Export data':'导出数据','Clear all data':'清空所有数据',
      'Tasks':'任务','Rewards':'奖励','Name':'名称','Icon':'图标','(optional)':'（可选）','Cancel':'取消','Save':'保存','Add':'添加','OK':'确定','Confirm':'确认',
      language:'语言', chinese:'中文', english:'English',
      iconPlaceholder:'输入 emoji 或符号，留空则使用默认图标', iconHint:'可以从图标库中选择，也可以直接输入自己的图标。', newIconPlaceholder:'输入 emoji 或符号',
      addTask:'添加任务',editTask:'编辑任务',addReward:'添加奖励',editReward:'编辑奖励',addTaskIcon:'添加任务图标',addRewardIcon:'添加奖励图标',
      deleteTaskTitle:'删除任务？',deleteTaskMsg:'确定从任务列表中删除“{name}”吗？',deleteRewardTitle:'删除奖励？',deleteRewardMsg:'确定从奖励列表中删除“{name}”吗？',delete:'删除',
      notEnoughTitle:'积分不足',notEnoughMsg:'兑换“{name}”需要 {points} 积分。',spendTitle:'确认消费积分？',spendMsg:'确定用 {points} 积分兑换“{name}”吗？',spend:'兑换',
      undoTitle:'撤回这条记录？',undoEarn:'撤回“{name}”获得的 +{points} 积分？余额和累计获得积分会一起扣回，并删除这条时间线记录。',undoSpend:'撤回“{name}”支出的 −{points} 积分？对应积分会退回余额，并删除这条时间线记录。',undo:'撤回',
      removeIconTitle:'删除图标？',removeIconMsg:'确定从{type}图标库中删除 {icon} 吗？',remove:'删除',taskWord:'任务',rewardWord:'奖励',
      aboutMsg:'完成事情，获得积分，再用积分兑换喜欢的奖励。',
      checking:'检查中…',downloading:'下载中…',permission:'等待授权…',installing:'正在安装…',
      upToDate:'已是最新版',upToDateMsg:'LifePoints {version} 已经是最新版。',updateAvailable:'发现新版本',updateAvailableMsg:'发现 {version}，是否立即下载并安装？',update:'更新',
      updateFailed:'更新失败',updateStartFailed:'无法开始下载更新。',updateCheckFailed:'无法检查更新',tryAgain:'请检查网络连接后稍后重试。',installFailed:'无法安装更新。',
      clearTitle:'清空所有数据？',clearMsg:'任务、奖励、余额、累计获得积分和时间线将被永久清空。主题、语言、字号、图标库、倍率和其他应用偏好会保留。',clearButton:'全部清空',
      deleteTaskAria:'删除任务',deleteRewardAria:'删除奖励',undoAria:'撤回记录'
    }
  };

  const HAD_SAVED_STATE = !!localStorage.getItem('lifepoints-state');
  if (state.language !== 'zh' && state.language !== 'en') {
    state.language = DEFAULT_LANG;
    if (!HAD_SAVED_STATE && DEFAULT_LANG === 'zh') {
      const taskNames = ['学习','运动','工作','健康'];
      const rewardNames = ['看一集剧','看一部电影','喜欢的零食'];
      state.tasks.forEach((item,i)=>{ if (taskNames[i]) item.name = taskNames[i]; });
      state.rewards.forEach((item,i)=>{ if (rewardNames[i]) item.name = rewardNames[i]; });
    }
    save();
  }

  const t = (key, vars = {}) => {
    let text = (I18N[state.language] || I18N.en)[key];
    if (text == null) text = I18N.en[key];
    if (text == null) text = key;
    return String(text).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
  };
  window.lpT = t;
  window.lpLang = () => state.language;

  function byId(id) { return document.getElementById(id); }
  function setExactText(el, text) {
    if (!el) return;
    if (el.childElementCount === 0) el.textContent = text;
  }

  const staticKeys = new Set([
    'My tasks','My rewards','Timeline','Settings','＋ Add','Balance','Total earned','Gained','Spent','Net',
    'Theme','☀︎ Light','☾ Pure Black','Font size','Small','Default','Large','XL','Points','Custom multipliers',
    'Confirm before spending points','Haptics','Icon library','Task icons','Reward icons','Tap × to remove an icon',
    'App','Support me','About LifePoints','Check for updates','Export data','Clear all data','Tasks','Rewards','Name','Icon','(optional)','Cancel','Save','Add','OK','Confirm'
  ]);
  document.querySelectorAll('h1,.st,.ml,.tl,.sl,.theme,.fontBtn,.miniAdd,.add,.nb span,.field label,.field label span,.cancel,.save,.iconLibraryTitle span').forEach(el => {
    const raw = el.textContent.trim();
    if (staticKeys.has(raw)) el.dataset.lpI18n = raw;
  });

  let langSection = byId('lpLanguageSection');
  if (!langSection) {
    const themeSection = document.querySelector('#settings .section');
    langSection = document.createElement('div');
    langSection.className = 'section';
    langSection.id = 'lpLanguageSection';
    langSection.innerHTML = '<div class="st" id="lpLanguageTitle"></div><div class="lpLangPicker"><button class="lpLangBtn" data-lang="zh">中文</button><button class="lpLangBtn" data-lang="en">English</button></div>';
    themeSection?.insertAdjacentElement('afterend', langSection);

    const style = document.createElement('style');
    style.textContent = '.lpLangPicker{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.lpLangBtn{padding:12px 10px;border-radius:13px;border:1px solid var(--l);background:var(--s);color:var(--t);font-weight:750}.lpLangBtn.sel{border-color:var(--g);box-shadow:inset 0 0 0 1px var(--g)}';
    document.head.appendChild(style);
  }

  function applyLanguage() {
    document.documentElement.lang = state.language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-lp-i18n]').forEach(el => setExactText(el, t(el.dataset.lpI18n)));
    const title = byId('lpLanguageTitle');
    if (title) title.textContent = t('language');
    document.querySelectorAll('.lpLangBtn').forEach(btn => btn.classList.toggle('sel', btn.dataset.lang === state.language));

    const iicon = byId('iicon');
    const newIcon = byId('newIcon');
    const hint = document.querySelector('.iconHint');
    if (iicon) iicon.placeholder = t('iconPlaceholder');
    if (newIcon) newIcon.placeholder = t('newIconPlaceholder');
    if (hint) hint.textContent = t('iconHint');
    const itemIconLabel = document.querySelector('#itemBack .field:nth-of-type(3) label');
    if (itemIconLabel) {
      for (const node of itemIconLabel.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
          node.nodeValue = t('Icon') + ' ';
          break;
        }
      }
    }

    const updateRowText = byId('checkUpdate')?.querySelector('.sl');
    if (updateRowText) updateRowText.textContent = t('Check for updates');

    try { window.LifePointsAndroid?.setLanguage?.(state.language); } catch (_) {}
  }

  document.querySelectorAll('.lpLangBtn').forEach(btn => {
    btn.onclick = () => {
      state.language = btn.dataset.lang === 'zh' ? 'zh' : 'en';
      save();
      render();
      haptic();
    };
  });

  const baseShowDialog = showDialog;
  showDialog = function (opts = {}) {
    const next = {...opts};
    if (next.confirmText === 'OK') next.confirmText = t('OK');
    else if (next.confirmText === 'Confirm') next.confirmText = t('Confirm');
    if (next.cancelText === 'Cancel') next.cancelText = t('Cancel');
    return baseShowDialog(next);
  };

  renderTasks = function () {
    $('taskList').innerHTML = '';
    state.tasks.forEach(task => {
      const mult = Number(state.multipliers[task.m] ?? 1);
      const amount = Math.round(task.base * mult * 10) / 10;
      const row = document.createElement('div');
      row.className = 'row task';
      row.innerHTML = `<div class="ico">${esc(iconFor(task,'task'))}</div><button class="itemName">${esc(task.name)}</button><button class="mul">${fmt(mult)}×</button><button class="pts">+${fmt(amount)}</button><button class="deleteBtn" aria-label="${esc(t('deleteTaskAria'))}">${trashSvg()}</button>`;
      row.children[0].onclick = () => openItemEditor('task', task.id);
      row.children[1].onclick = () => openItemEditor('task', task.id);
      row.children[2].onclick = () => { task.m = (task.m + 1) % state.multipliers.length; haptic(); save(); render(); };
      row.children[3].onclick = () => {
        const points = Math.round(task.base * Number(state.multipliers[task.m]) * 10) / 10;
        state.balance += points;
        state.totalEarned += points;
        state.timeline.unshift({id:Date.now(),time:now(),icon:iconFor(task,'task'),text:task.name,amount:points});
        haptic('success'); save(); render();
      };
      row.children[4].onclick = async () => {
        haptic();
        if (await ask(t('deleteTaskTitle'), t('deleteTaskMsg',{name:task.name}), t('delete'), true)) {
          state.tasks = state.tasks.filter(x => x.id !== task.id); save(); render();
        }
      };
      $('taskList').appendChild(row);
    });
  };

  renderRewards = function () {
    $('rewardList').innerHTML = '';
    state.rewards.forEach(reward => {
      const row = document.createElement('div');
      row.className = 'row reward';
      row.innerHTML = `<div class="ico">${esc(iconFor(reward,'reward'))}</div><button class="itemName">${esc(reward.name)}</button><button class="pts spend">−${fmt(reward.cost)}</button><button class="deleteBtn" aria-label="${esc(t('deleteRewardAria'))}">${trashSvg()}</button>`;
      row.children[0].onclick = () => openItemEditor('reward', reward.id);
      row.children[1].onclick = () => openItemEditor('reward', reward.id);
      row.children[2].onclick = async () => {
        if (state.balance < reward.cost) { haptic(); await showInfo(t('notEnoughTitle'), t('notEnoughMsg',{points:fmt(reward.cost),name:reward.name})); return; }
        if (state.confirmSpend && !await ask(t('spendTitle'), t('spendMsg',{points:fmt(reward.cost),name:reward.name}), t('spend'))) return;
        state.balance -= reward.cost;
        state.timeline.unshift({id:Date.now(),time:now(),icon:iconFor(reward,'reward'),text:reward.name,amount:-reward.cost});
        haptic('success'); save(); render();
      };
      row.children[3].onclick = async () => {
        haptic();
        if (await ask(t('deleteRewardTitle'), t('deleteRewardMsg',{name:reward.name}), t('delete'), true)) {
          state.rewards = state.rewards.filter(x => x.id !== reward.id); save(); render();
        }
      };
      $('rewardList').appendChild(row);
    });
  };

  renderHistory = function () {
    $('timeList').innerHTML = '';
    state.timeline.forEach((entry, idx) => {
      const row = document.createElement('div');
      row.className = 'row timeline';
      row.innerHTML = `<div class="time">${esc(entry.time)}</div><div class="ico">${esc(entry.icon || '•')}</div><div class="historyName">${esc(entry.text)}</div><div class="amt ${entry.amount >= 0 ? 'pos' : 'neg'}">${entry.amount >= 0 ? '+' : '−'}${fmt(Math.abs(entry.amount))}</div><button class="deleteBtn" aria-label="${esc(t('undoAria'))}">${trashSvg()}</button>`;
      row.children[4].onclick = async () => {
        haptic();
        const message = entry.amount >= 0
          ? t('undoEarn',{points:fmt(Math.abs(entry.amount)),name:entry.text})
          : t('undoSpend',{points:fmt(Math.abs(entry.amount)),name:entry.text});
        if (!await ask(t('undoTitle'), message, t('undo'), true)) return;
        state.balance -= entry.amount;
        if (entry.amount > 0) state.totalEarned = Math.max(0, state.totalEarned - entry.amount);
        state.timeline.splice(idx,1); save(); render(); haptic('success');
      };
      $('timeList').appendChild(row);
    });
    const gained = state.timeline.filter(x=>x.amount>0).reduce((a,b)=>a+b.amount,0);
    const spent = Math.abs(state.timeline.filter(x=>x.amount<0).reduce((a,b)=>a+b.amount,0));
    const net = gained - spent;
    $('gain').textContent='+'+fmt(gained); $('spent').textContent='−'+fmt(spent);
    $('net').textContent=(net>=0?'+':'−')+fmt(Math.abs(net)); $('net').className='tv '+(net>=0?'pos':'neg');
  };

  renderIconLibrary = function () {
    const renderOne = (id,list,type) => {
      const box=$(id); box.innerHTML='';
      list.forEach((icon,idx) => {
        const button=document.createElement('button'); button.className='libIcon'; button.innerHTML=`<span>${esc(icon)}</span><b>×</b>`;
        button.onclick=async()=>{
          haptic();
          if (await ask(t('removeIconTitle'), t('removeIconMsg',{icon,type:t(type==='task'?'taskWord':'rewardWord')}), t('remove'), true)) {
            list.splice(idx,1); save(); renderSettings();
          }
        };
        box.appendChild(button);
      });
    };
    renderOne('taskIconLibrary',state.taskIcons,'task'); renderOne('rewardIconLibrary',state.rewardIcons,'reward');
  };

  const baseRenderSettings = renderSettings;
  renderSettings = function () {
    baseRenderSettings();
    applyLanguage();
  };

  openItemEditor = function(type,id=null) {
    itemMode=type; editingId=id;
    const item=id==null?null:(type==='task'?state.tasks.find(x=>x.id===id):state.rewards.find(x=>x.id===id));
    $('itemTitle').textContent=item?(type==='task'?t('editTask'):t('editReward')):(type==='task'?t('addTask'):t('addReward'));
    $('iname').value=item?.name||''; $('ipoints').value=item?(type==='task'?item.base:item.cost):'';
    $('iicon').value=item?.icon||''; fillPresets(item?.icon||'');
    scrollEditorTop(); $('itemBack').classList.add('on');
    requestAnimationFrame(()=>{scrollEditorTop();setTimeout(()=>{$('iname').focus();scrollEditorTop()},120)});
  };

  document.querySelectorAll('[data-icon-add]').forEach(button => {
    button.onclick = () => {
      iconMode=button.dataset.iconAdd;
      $('iconTitle').textContent=iconMode==='task'?t('addTaskIcon'):t('addRewardIcon');
      $('newIcon').value=''; window.scrollTo(0,0); $('iconBack').classList.add('on');
      requestAnimationFrame(()=>setTimeout(()=>$('newIcon').focus(),100)); haptic();
    };
  });

  const support = byId('support');
  if (support) support.onclick=()=>{haptic();location.href='https://github.com/XiaoyuZhuang/LifePoints'};
  const about = byId('about');
  if (about) about.onclick=async()=>{haptic();await showInfo(t('About LifePoints'),t('aboutMsg'))};
  const clearAll = byId('clearAll');
  if (clearAll) clearAll.onclick=async()=>{
    haptic();
    if (!await ask(t('clearTitle'),t('clearMsg'),t('clearButton'),true)) return;
    const prefs={theme:state.theme,language:state.language,fontSize:state.fontSize,taskIcons:[...state.taskIcons],rewardIcons:[...state.rewardIcons],multipliers:[...state.multipliers],confirmSpend:state.confirmSpend,haptics:state.haptics};
    state={balance:0,totalEarned:0,tasks:[],rewards:[],timeline:[],...prefs}; save(); render(); haptic('success');
  };

  function versionName() {
    try { return window.LifePointsUpdater?.getVersionName?.() || ''; }
    catch (_) { return ''; }
  }
  function refreshVersion() {
    const label=byId('versionLabel'); if(!label)return;
    const version=versionName(); label.textContent=version?`v${String(version).replace(/^v/i,'')}`:'';
  }
  const updateRow=byId('checkUpdate');
  if(updateRow) updateRow.onclick=()=>{
    haptic(); const label=byId('versionLabel'); if(label)label.textContent=t('checking');
    try{if(window.LifePointsUpdater?.checkForUpdate)window.LifePointsUpdater.checkForUpdate();else location.href=RELEASES}
    catch(_){refreshVersion();location.href=RELEASES}
  };

  window.LifePointsUpdateResult=async data=>{
    if(data?.status==='latest'){
      refreshVersion(); await showInfo(t('upToDate'),t('upToDateMsg',{version:versionName()})); return;
    }
    if(data?.status==='available'){
      refreshVersion();
      const ok=await ask(t('updateAvailable'),t('updateAvailableMsg',{version:data.version}),t('update'));
      if(ok){const label=byId('versionLabel');if(label)label.textContent=t('downloading');try{window.LifePointsUpdater?.downloadUpdate?.(data.downloadUrl,data.version)}catch(_){refreshVersion();await showInfo(t('updateFailed'),t('updateStartFailed'))}}
      return;
    }
    refreshVersion(); await showInfo(t('updateCheckFailed'),state.language==='en'?(data?.message||t('tryAgain')):t('tryAgain'));
  };

  window.LifePointsDownloadState=async data=>{
    const label=byId('versionLabel');
    if(data?.status==='downloading'){if(label)label.textContent=t('downloading');return}
    if(data?.status==='permission'){if(label)label.textContent=t('permission');return}
    if(data?.status==='installing'){if(label)label.textContent=t('installing');return}
    if(data?.status==='error'){refreshVersion();await showInfo(t('updateFailed'),state.language==='en'?(data?.message||t('installFailed')):t('installFailed'))}
  };

  const baseRender = render;
  render = function () {
    baseRender();
    applyLanguage();
  };

  render();
  refreshVersion();
})();
