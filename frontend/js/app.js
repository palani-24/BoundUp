
(function(){
  const D = window.BOUNDUP_DATA || {users:[],posts:[],reels:[],translations:{en:{}}};
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
  const store = {
    get:k=>localStorage.getItem('boundup_'+k),
    set:(k,v)=>localStorage.setItem('boundup_'+k,v),
    json:(k,d)=>{try{return JSON.parse(localStorage.getItem('boundup_'+k))??d}catch{return d}},
    setJson:(k,v)=>localStorage.setItem('boundup_'+k,JSON.stringify(v))
  };
  const page = (location.pathname.split('/').pop() || 'index.html').replace('.html','');
  const lang = store.get('lang') || 'en';
  const t = D.translations[lang] || D.translations.en;

  function toast(msg){
    let el=$('.toast'); if(!el){ el=document.createElement('div'); el.className='toast'; document.body.appendChild(el); }
    el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1800);
  }
  window.boundToast = toast;

  function initTheme(){
    const theme = store.get('theme') || 'dark';
    document.documentElement.dataset.theme = theme;
    $$('.js-theme-label').forEach(el=>el.textContent = theme==='dark'?'Dark':'Light');
  }
  function applyLang(){
    $$('[data-i18n]').forEach(el=>{ const key=el.dataset.i18n; if(t[key]) el.textContent=t[key]; });
    $$('[data-i18n-placeholder]').forEach(el=>{ const key=el.dataset.i18nPlaceholder; if(t[key]) el.placeholder=t[key]; });
    const sel=$('#languageSelect'); if(sel) sel.value=lang;
  }

  function navHtml(){
    const items=[['home','home.html','⌂','home'],['explore','explore.html','✦','explore'],['reels','reels.html','▶','reels'],['chat','chat.html','✉','chat'],['favorites','favorites.html','♡','favorites'],['profile','profile.html','◎','profile'],['settings','settings.html','⚙','settings']];
    const activeName = page==='index'?'home':page;
    return `<aside class="app-rail"><a class="brand" href="home.html"><img src="assets/logo-icon.png" alt="BoundUp"><span>Bound<span>Up</span></span></a><nav class="nav-list">${items.map(([id,href,ico,label])=>`<a class="nav-item ${activeName===id?'active':''}" href="${href}"><b class="nav-ico">${ico}</b><span class="label" data-i18n="${label}">${t[label]||label}</span></a>`).join('')}</nav><div class="rail-bottom"><a class="create-btn" href="home.html#create"><span class="create-text" data-i18n="newPost">${t.newPost||'Create'}</span> +</a><button class="ghost-btn js-theme-toggle">◐ <span class="create-text js-theme-label"></span></button></div></aside>`;
  }
  function topMobile(){
    return `<div class="top-mobile"><a class="brand" href="home.html"><img src="assets/logo-icon.png" alt="BoundUp"><span>Bound<span>Up</span></span></a><div><button class="ghost-btn js-theme-toggle">◐</button></div></div>`;
  }
  function bottomNav(){
    const items=[['home','home.html','⌂'],['explore','explore.html','✦'],['reels','reels.html','▶'],['chat','chat.html','✉'],['profile','profile.html','◎']];
    return `<nav class="bottom-nav">${items.map(([id,href,ico])=>`<a class="${page===id?'active':''}" href="${href}">${ico}</a>`).join('')}</nav>`;
  }
  function installChrome(){
    const shell=$('.shell');
    if(shell && !$('.app-rail')) shell.insertAdjacentHTML('afterbegin', navHtml());
    if(!$('.top-mobile') && !document.body.classList.contains('no-chrome')) document.body.insertAdjacentHTML('afterbegin', topMobile());
    if(!$('.bottom-nav') && !document.body.classList.contains('no-chrome')) document.body.insertAdjacentHTML('beforeend', bottomNav());
    $$('.js-theme-toggle').forEach(btn=>btn.addEventListener('click',()=>{ const next=(document.documentElement.dataset.theme==='dark')?'light':'dark'; store.set('theme',next); initTheme(); toast(next==='dark'?'Dark mode on':'Light mode on'); }));
  }

  function userById(id){ return D.users.find(u=>u.id===id) || D.users[0]; }
  function renderStories(){
    const el=$('#stories'); if(!el) return;
    el.innerHTML = D.users.map(u=>`<a class="story" href="profile.html?u=${u.id}"><div class="story-ring"><img src="${u.avatar}" alt="${u.name}"></div><small>${u.username}</small></a>`).join('');
  }
  function postHtml(p){
    const u=userById(p.user), liked=store.json('liked',[]).includes(p.id), saved=store.json('saved',[]).includes(p.id);
    return `<article class="post fade-up" data-post-id="${p.id}"><header class="post-head"><a class="user-mini" href="profile.html?u=${u.id}"><img class="avatar" src="${u.avatar}" alt="${u.name}"><span><b>${u.username}</b><small>${p.tag} • 2h</small></span></a><button class="more">⋯</button></header><img class="post-img" src="${p.img}" alt="${p.tag}"><div class="post-actions"><div class="icon-row"><button class="icon-btn js-like ${liked?'liked':''}" title="Like">${liked?'♥':'♡'}</button><button class="icon-btn js-comment-focus" title="Comment">💬</button><button class="icon-btn js-share" title="Share">↗</button></div><button class="icon-btn js-save" title="Save">${saved?'★':'☆'}</button></div><div class="post-body"><div class="likes"><span class="js-like-count">${(p.likes+(liked?1:0)).toLocaleString()}</span> likes</div><div class="caption"><b>${u.username}</b>${p.caption}</div><a class="comments-link" href="#">View all ${p.comments} comments</a></div><form class="comment-box js-comment-form"><input placeholder="Add a comment..."><button>Post</button></form></article>`;
  }
  function renderFeed(){
    const el=$('#feed'); if(!el) return;
    el.innerHTML=D.posts.map(postHtml).join('');
    bindPostActions(el);
  }
  function renderRightPanel(){
    const el=$('#rightPanel'); if(!el) return;
    el.innerHTML=`<div class="side-card glass"><div class="profile-mini"><img class="avatar" src="assets/avatar-1.svg"><div><b>Sam Bound</b><div class="muted">@itz_sam</div></div><a class="switch" href="profile.html">View</a></div><h3 data-i18n="suggestions">${t.suggestions||'Suggested for you'}</h3>${D.users.slice(1,6).map(u=>`<div class="suggestion"><img class="avatar" src="${u.avatar}"><div><b>${u.name}</b><div class="muted">${u.followers} followers</div></div><button class="follow-btn js-follow">Follow</button></div>`).join('')}</div><div class="side-card glass"><h3 data-i18n="trending">${t.trending||'Trending on BoundUp'}</h3>${['#TamilBGM','#MoodMatch','#AIFeed','#CreatorRoom','#GamingAura','#VoiceBubble'].map(x=>`<span class="trend-tag">${x}</span>`).join('')}</div>`;
    $$('.js-follow',el).forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('following');btn.textContent=btn.classList.contains('following')?'Following':'Follow';toast(btn.textContent)}));
  }
  function bindPostActions(root=document){
    $$('.js-like',root).forEach(btn=>btn.addEventListener('click',()=>{
      const card=btn.closest('[data-post-id]'), id=Number(card.dataset.postId); let liked=store.json('liked',[]); const count=$('.js-like-count',card); let n=Number(count.textContent.replace(/,/g,''));
      if(liked.includes(id)){ liked=liked.filter(x=>x!==id); btn.textContent='♡'; btn.classList.remove('liked'); n--; } else { liked.push(id); btn.textContent='♥'; btn.classList.add('liked'); n++; }
      store.setJson('liked',liked); count.textContent=n.toLocaleString();
    }));
    $$('.js-save',root).forEach(btn=>btn.addEventListener('click',()=>{ const id=Number(btn.closest('[data-post-id]').dataset.postId); let saved=store.json('saved',[]); if(saved.includes(id)){saved=saved.filter(x=>x!==id);btn.textContent='☆';toast('Removed from favorites')} else {saved.push(id);btn.textContent='★';toast('Saved to favorites')} store.setJson('saved',saved); }));
    $$('.js-share',root).forEach(btn=>btn.addEventListener('click',()=>toast('Share link copied')));
    $$('.js-comment-focus',root).forEach(btn=>btn.addEventListener('click',()=>$('.js-comment-form input',btn.closest('.post')).focus()));
    $$('.js-comment-form',root).forEach(f=>f.addEventListener('submit',e=>{e.preventDefault(); const input=$('input',f); if(input.value.trim()){toast('Comment added'); input.value='';}}));
  }
  function renderExplore(){
    const grid=$('#exploreGrid'); if(!grid) return;
    grid.innerHTML=[...D.posts,...D.posts].map((p,i)=>`<a class="grid-card" data-info="♡ ${(p.likes+i*20).toLocaleString()} • 💬 ${p.comments+i}" href="home.html#post-${p.id}"><img src="${p.img}" alt="${p.tag}"></a>`).join('');
    const search=$('#globalSearch'); if(search) search.addEventListener('input',()=>{ const q=search.value.toLowerCase(); $$('.grid-card',grid).forEach((c,i)=>{ const p=D.posts[i%D.posts.length]; c.style.display=(p.caption.toLowerCase().includes(q)||p.tag.toLowerCase().includes(q))?'block':'none'; }); });
  }
  function renderReels(){
    const el=$('#reelsGrid'); if(!el) return;
    el.innerHTML=D.reels.map(r=>`<article class="reel-card"><img src="${r.img}" alt="${r.title}"><div class="play">▶</div><div class="reel-overlay"><b>${r.title}</b><div>${r.views} views</div><div class="icon-row"><button class="icon-btn js-reel-like">♡</button><button class="icon-btn js-share">↗</button></div></div></article>`).join('');
    $$('.js-reel-like',el).forEach(b=>b.addEventListener('click',()=>{b.textContent=b.textContent==='♡'?'♥':'♡';b.classList.toggle('liked');}));
    $$('.js-share',el).forEach(b=>b.addEventListener('click',()=>toast('Reel shared')));
  }
  function initChat(){
    const form=$('#chatForm'), input=$('#chatInput'), thread=$('#thread'); if(!form) return;
    form.addEventListener('submit',e=>{ e.preventDefault(); const msg=input.value.trim(); if(!msg) return; input.value=''; thread.insertAdjacentHTML('beforeend',`<div class="bubble me">${msg}</div>`); thread.scrollTop=thread.scrollHeight; setTimeout(()=>{thread.insertAdjacentHTML('beforeend',`<div class="bubble"><div class="typing"><i></i><i></i><i></i></div></div>`); thread.scrollTop=thread.scrollHeight;},300); setTimeout(()=>{ const last=thread.lastElementChild; if(last) last.outerHTML=`<div class="bubble">BoundUp AI reply: Nice! I can help you create a caption, translate, or summarize this chat.</div>`; thread.scrollTop=thread.scrollHeight;},1300); });
    $$('.chat-person').forEach(p=>p.addEventListener('click',()=>toast('Chat opened')));
  }
  function initAuth(){
    const form=$('#authForm'); if(!form) return;
    form.addEventListener('submit',e=>{ e.preventDefault(); const email=$('#email')?.value.trim(); const pass=$('#password')?.value.trim(); const err=$('#formError'); if(!email || !pass){ if(err) err.textContent='Please enter email/username and password.'; return; } if(pass.length<4){ if(err) err.textContent='Password must be at least 4 characters.'; return; } store.set('user',email); toast('Welcome to BoundUp'); setTimeout(()=>location.href='home.html',600); });
    $$('.js-password-toggle').forEach(btn=>btn.addEventListener('click',()=>{ const p=$('#password'); if(p){p.type=p.type==='password'?'text':'password';btn.textContent=p.type==='password'?'Show':'Hide';} }));
    $$('.js-guest').forEach(btn=>btn.addEventListener('click',()=>{store.set('user','guest');location.href='home.html'}));
  }
  function initSettings(){
    const sel=$('#languageSelect'); if(sel) sel.addEventListener('change',()=>{store.set('lang',sel.value); toast('Language changed'); setTimeout(()=>location.reload(),500);});
    $$('.toggle').forEach(tog=>tog.addEventListener('click',()=>{tog.classList.toggle('on'); if(tog.dataset.setting==='theme'){store.set('theme',tog.classList.contains('on')?'dark':'light'); initTheme();} toast('Setting updated'); }));
    const clear=$('#clearCache'); if(clear) clear.addEventListener('click',()=>{localStorage.clear();toast('Cache cleared');setTimeout(()=>location.reload(),700)});
    const logout=$('#logoutBtn'); if(logout) logout.addEventListener('click',()=>{store.set('user','');toast('Logged out');setTimeout(()=>location.href='welcome.html',500)});
  }
  function initDownload(){
    $$('.js-download').forEach(btn=>btn.addEventListener('click',()=>{ const box=btn.closest('.download-panel')||document; const bar=$('.download-progress span',box); const pct=$('.download-pct',box); let n=0; if(bar) bar.style.width='0%'; const timer=setInterval(()=>{ n+=Math.ceil(Math.random()*9); if(n>=100){n=100;clearInterval(timer);toast('Download ready');} if(bar) bar.style.width=n+'%'; if(pct) pct.textContent=n+'%'; },170); }));
  }
  function initSplash(){
    const pct=$('#splashPct'), bar=$('#splashBar'); if(!pct) return; let n=0; const timer=setInterval(()=>{n+=2; pct.textContent=n+'%'; if(bar) bar.style.width=n+'%'; if(n>=100){clearInterval(timer); setTimeout(()=>location.href='welcome.html',450)}},40);
  }
  function renderProfile(){
    const grid=$('#profileGrid'); if(grid) grid.innerHTML=D.posts.map(p=>`<a class="grid-card" data-info="${p.tag}" href="home.html#post-${p.id}"><img src="${p.img}"></a>`).join('');
    $$('.tab').forEach(tab=>tab.addEventListener('click',()=>{$$('.tab').forEach(x=>x.classList.remove('active')); tab.classList.add('active'); toast(tab.textContent.trim()+' opened');}));
  }
  function renderSavedHistory(){
    const savedEl=$('#savedGrid'), histEl=$('#historyGrid');
    if(savedEl){ const ids=store.json('saved',[1,3]); const posts=D.posts.filter(p=>ids.includes(p.id)); savedEl.innerHTML=(posts.length?posts:D.posts.slice(0,3)).map(p=>`<a class="grid-card" data-info="Saved" href="home.html#post-${p.id}"><img src="${p.img}"></a>`).join(''); }
    if(histEl){ histEl.innerHTML=D.posts.slice().reverse().map(p=>`<a class="grid-card" data-info="Viewed" href="home.html#post-${p.id}"><img src="${p.img}"></a>`).join(''); }
  }
  function initCreatePost(){
    const form=$('#createPostForm'); if(!form) return;
    form.addEventListener('submit',e=>{e.preventDefault(); const text=$('#newCaption').value.trim(); if(!text) return toast('Write something first'); D.posts.unshift({id:Date.now(),user:1,img:'assets/post-7.svg',caption:text,likes:0,comments:0,tag:'New'}); renderFeed(); $('#newCaption').value=''; toast('Post published');});
  }

  document.addEventListener('DOMContentLoaded',()=>{
    initTheme(); installChrome(); applyLang(); renderStories(); renderFeed(); renderRightPanel(); renderExplore(); renderReels(); initChat(); initAuth(); initSettings(); initDownload(); initSplash(); renderProfile(); renderSavedHistory(); initCreatePost();
    document.body.classList.add('ready');
  });
})();
