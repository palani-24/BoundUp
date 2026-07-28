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
    const theme = store.get('theme') || 'light';
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

  function userById(id){
    const loggedInUser = store.get('user') || 'itz_sam';
    if(id === 1 || id === 'me' || id === loggedInUser){
      const p = getStoredProfile();
      return {
        id: 1,
        name: p.name,
        username: p.username,
        avatar: p.avatar,
        followers: p.followers || '12.4K'
      };
    }
    const allReg = typeof getRegisteredUsers === 'function' ? getRegisteredUsers() : {};
    if(typeof id === 'string' && allReg[id]) return allReg[id];
    return D.users.find(u=>u.id===id) || { id: id, name: String(id), username: String(id), avatar: 'assets/avatar-1.svg' };
  }

  /* Interactive Story Viewer Modal */
  let currentStoryIndex = 0;

  function renderStories(){
    const el=$('#stories'); if(!el) return;
    const customStories = store.json('custom_stories', []);
    const userProf = getStoredProfile();
    const myStory = { isCustom: true, name: 'Your Story', username: userProf.username, avatar: userProf.avatar };
    const allUsers = [myStory, ...customStories, ...D.users];
    el.innerHTML = allUsers.map((u, i)=>`<div class="story js-story-open" data-index="${i}" style="cursor:pointer"><div class="story-ring ${u.isCustom ? 'live-badge-glow' : ''}"><img src="${u.avatar}" alt="${u.name}"></div><small>${u.username || u.name}</small></div>`).join('');
    $$('.js-story-open').forEach(btn => btn.addEventListener('click', () => {
      openStoryViewer(Number(btn.dataset.index));
    }));
  }

  function isLoggedIn(){
    const u = store.get('user');
    return !!(u && u !== '' && u !== 'guest');
  }

  function openStoryViewer(index){
    if(!isLoggedIn()){
      toast('🔒 Please login to view Stories!');
      setTimeout(()=> location.href = 'login.html', 900);
      return;
    }

    currentStoryIndex = index;
    const modal = $('#storyViewerModal');
    if(!modal) return;
    const customStories = store.json('custom_stories', []);
    const userProf = getStoredProfile();
    const myStory = { isCustom: true, name: 'Your Story', username: userProf.username, avatar: userProf.avatar };
    const allUsers = [myStory, ...customStories, ...D.users];
    const user = allUsers[currentStoryIndex] || allUsers[0];
    const imgEl = $('#storyImg');
    const avatarEl = $('#storyAvatar');
    const userEl = $('#storyUsername');

    if(imgEl) imgEl.src = user.storyImg || D.posts[currentStoryIndex % D.posts.length]?.img || user.avatar;
    if(avatarEl) avatarEl.src = user.avatar;
    if(userEl) userEl.innerHTML = `<b>${user.username || user.name}</b> <small style="opacity:0.7">${user.name || ''}</small>`;
    
    modal.classList.remove('hidden');
    startStoryProgress();
  }

  function startStoryProgress(){
    const fill = $('#storyProgressFill');
    if(!fill) return;
    fill.style.width = '0%';
    setTimeout(()=> fill.style.width = '100%', 50);
  }

  function nextStory(){
    if(currentStoryIndex < D.users.length - 1) openStoryViewer(currentStoryIndex + 1);
    else closeStoryViewer();
  }

  function prevStory(){
    if(currentStoryIndex > 0) openStoryViewer(currentStoryIndex - 1);
  }

  function closeStoryViewer(){
    const modal = $('#storyViewerModal');
    if(modal) modal.classList.add('hidden');
  }

  function initStoryEvents(){
    const modal = $('#storyViewerModal');
    if(!modal) return;
    const closeBtn = $('#closeStoryBtn');
    const leftNav = $('#storyNavLeft');
    const rightNav = $('#storyNavRight');
    const sendBtn = $('#sendStoryReplyBtn');
    const replyInput = $('#storyReplyInput');

    if(closeBtn) closeBtn.addEventListener('click', closeStoryViewer);
    if(leftNav) leftNav.addEventListener('click', prevStory);
    if(rightNav) rightNav.addEventListener('click', nextStory);
    if(sendBtn) sendBtn.addEventListener('click', ()=>{
      if(replyInput && replyInput.value.trim()){
        toast(`Reply sent to story`);
        replyInput.value = '';
        closeStoryViewer();
      }
    });
  }

  function postHtml(p){
    const u=userById(p.user), liked=store.json('liked',[]).includes(p.id), saved=store.json('saved',[]).includes(p.id);
    const isVideo = p.isVideo || (p.img && (p.img.endsWith('.mp4') || p.img.startsWith('data:video/'))) || p.videoUrl;
    const videoSrc = p.videoUrl || p.img;
    const audioTrackName = p.audioTrack || 'Original Audio • BoundUp Sound';

    let mediaTag = `<img class="post-img" src="${p.img}" alt="${p.tag}">`;
    if (isVideo) {
      mediaTag = `<div class="video-wrap">
        <video class="post-img js-post-video" src="${videoSrc}" controls playsinline style="width:100%;max-height:520px;object-fit:cover;background:#000;border-radius:18px;"></video>
      </div>`;
    }

    return `<article class="post fade-up" data-post-id="${p.id}">
      <header class="post-head">
        <a class="user-mini" href="profile.html?user=${encodeURIComponent(u.username)}">
          <img class="avatar" src="${u.avatar}" alt="${u.name}">
          <span><b>${u.username}</b><small>${p.tag || 'BoundUp'} • 2h</small></span>
        </a>
        <button class="more">⋯</button>
      </header>
      ${mediaTag}
      <div class="post-actions">
        <div class="icon-row">
          <button class="icon-btn js-like ${liked?'liked':''}" title="Like">${liked?'♥':'♡'}</button>
          <button class="icon-btn js-comment-focus" title="Comment">💬</button>
          <button class="icon-btn js-share" title="Share">↗</button>
        </div>
        <button class="icon-btn js-save" title="Save">${saved?'★':'☆'}</button>
      </div>
      <div class="post-body">
        <div class="likes"><span class="js-like-count">${(p.likes+(liked?1:0)).toLocaleString()}</span> likes</div>
        <div class="caption"><b>${u.username}</b> ${p.caption}</div>
        <div class="audio-track-tag">
          <div class="sound-wave-icon"><span></span><span></span><span></span></div>
          <span>${audioTrackName}</span>
        </div>
        <a class="comments-link" href="#">View all ${p.comments} comments</a>
      </div>
      <form class="comment-box js-comment-form">
        <input placeholder="Add a comment...">
        <button>Post</button>
      </form>
    </article>`;
  }

  function renderFeed(){
    const el=$('#feed'); if(!el) return;
    const customPosts = store.json('custom_posts', []);
    const allPosts = [...customPosts, ...D.posts];
    el.innerHTML=allPosts.map(postHtml).join('');
    bindPostActions(el);
  }

  function renderRightPanel(){
    const el=$('#rightPanel'); if(!el) return;
    const mainUser = getStoredProfile();
    el.innerHTML=`<div class="side-card glass">
      <div class="profile-mini">
        <img class="avatar" src="${mainUser.avatar}">
        <div><b>${mainUser.name}</b><div class="muted">@${mainUser.username}</div></div>
        <a class="switch" href="profile.html">View</a>
      </div>
      <h3 data-i18n="suggestions">${t.suggestions||'Suggested for you'}</h3>
      ${D.users.slice(1,6).map(u=>`<div class="suggestion"><img class="avatar" src="${u.avatar}"><div><b>${u.name}</b><div class="muted">${u.followers} followers</div></div><button class="follow-btn js-follow">Follow</button></div>`).join('')}
    </div>
    <div class="side-card glass">
      <h3 data-i18n="trending">${t.trending||'Trending on BoundUp'}</h3>
      ${['#TamilBGM','#MoodMatch','#AIFeed','#CreatorRoom','#GamingAura','#VoiceBubble'].map(x=>`<span class="trend-tag">${x}</span>`).join('')}
    </div>`;
    $$('.js-follow',el).forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('following');btn.textContent=btn.classList.contains('following')?'Following':'Follow';toast(btn.textContent)}));
  }

  /* FULL-SCREEN INTERACTIVE VIDEO & REAL SONG PLAYER MODAL */
  function openVideoPlayerModal(videoData){
    const modal = $('#videoPlayerModal');
    const player = $('#modalVideoPlayer');
    const avatar = $('#modalVideoAvatar');
    const nameEl = $('#modalVideoAuthorName');
    const handleEl = $('#modalVideoAuthorHandle');
    const captionEl = $('#modalVideoCaption');
    const audioTitleEl = $('#modalVideoAudioTitle');

    if(!modal || !player) return;

    if(window.BoundUpSound) window.BoundUpSound.stopAllAudio();

    if(avatar) avatar.src = videoData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
    if(nameEl) nameEl.innerHTML = `<b>${videoData.name || videoData.author || 'BoundUp User'}</b>`;
    if(handleEl) handleEl.textContent = `@${videoData.username || videoData.author || 'itz_sam'}`;
    if(captionEl) captionEl.textContent = videoData.caption || videoData.title || 'BoundUp Video Reel';
    if(audioTitleEl) audioTitleEl.textContent = videoData.audioTrack || '🎵 Original Song Track';

    player.src = videoData.videoUrl || videoData.img;
    player.muted = false;
    player.volume = 1.0;

    modal.classList.remove('hidden');

    const soundGenre = (videoData.audioTrack && (videoData.audioTrack.includes('💕') || videoData.audioTrack.toLowerCase().includes('kadhale') || videoData.audioTrack.toLowerCase().includes('love') || videoData.audioTrack.toLowerCase().includes('nira'))) ? 'love' : 'mass';
    const realAudioUrl = videoData.audioSrc || (D.audioTracks && D.audioTracks[soundGenre]);

    const playPromise = player.play();
    if(playPromise !== undefined){
      playPromise.then(()=>{
        if(window.BoundUpSound) window.BoundUpSound.playRealSongTrack(realAudioUrl, soundGenre);
      }).catch(err=>{
        if(window.BoundUpSound) window.BoundUpSound.playRealSongTrack(realAudioUrl, soundGenre);
      });
    }
  }

  function closeVideoPlayerModal(){
    const modal = $('#videoPlayerModal');
    const player = $('#modalVideoPlayer');

    if(player){
      player.pause();
      player.src = '';
      try { player.currentTime = 0; } catch(e) {}
    }

    if(window.BoundUpSound){
      window.BoundUpSound.stopAllAudio();
    }

    if(modal){
      modal.classList.add('hidden');
    }
  }

  function initVideoPlayerModalEvents(){
    const closeBtn = $('#closeVideoModalBtn');
    const modal = $('#videoPlayerModal');

    if(closeBtn) closeBtn.addEventListener('click', closeVideoPlayerModal);
    if(modal){
      modal.addEventListener('click', (e)=>{
        if(e.target === modal) closeVideoPlayerModal();
      });
    }

    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') closeVideoPlayerModal();
    });
  }

  function bindPostActions(root=document){
    $$('.js-like',root).forEach(btn=>btn.addEventListener('click',()=>{
      const card=btn.closest('[data-post-id]'), id=Number(card.dataset.postId); let liked=store.json('liked',[]); const count=$('.js-like-count',card); let n=Number(count.textContent.replace(/,/g,''));
      if(liked.includes(id)){ liked=liked.filter(x=>x!==id); btn.textContent='♡'; btn.classList.remove('liked'); n--; } 
      else { liked.push(id); btn.textContent='♥'; btn.classList.add('liked'); n++; if(window.BoundUpSound) window.BoundUpSound.playLike(); }
      store.setJson('liked',liked); count.textContent=n.toLocaleString();
    }));

    $$('.js-post-video', root).forEach((vid)=>{
      vid.addEventListener('click', (e)=>{
        e.stopPropagation();
        const card = vid.closest('[data-post-id]');
        const id = Number(card.dataset.postId);
        const post = [...store.json('custom_posts', []), ...D.posts].find(p => p.id === id);
        if(post && (post.isVideo || post.videoUrl)){
          const u = userById(post.user);
          openVideoPlayerModal({
            avatar: u.avatar,
            name: u.name,
            username: u.username,
            caption: post.caption,
            audioTrack: post.audioTrack,
            audioSrc: post.audioSrc,
            videoUrl: post.videoUrl || post.img
          });
        }
      });
    });

    $$('.js-sound-toggle',root).forEach(btn=>{
      btn.addEventListener('click',()=>{
        const video = btn.previousElementSibling;
        const card = btn.closest('[data-post-id]');
        let soundGenre = 'mass';
        let audioSrc = null;
        if(card){
          const id = Number(card.dataset.postId);
          const post = [...store.json('custom_posts', []), ...D.posts].find(p => p.id === id);
          if(post) audioSrc = post.audioSrc;
          const trackText = $('.audio-track-tag', card)?.textContent || '';
          if(trackText.includes('💕') || trackText.toLowerCase().includes('kadhale') || trackText.toLowerCase().includes('love') || trackText.toLowerCase().includes('nira')){
            soundGenre = 'love';
          }
        }
        if(video && window.BoundUpSound){
          window.BoundUpSound.enableVideoSound(video, btn, soundGenre, audioSrc);
        }
      });
    });

    $$('.js-save',root).forEach(btn=>btn.addEventListener('click',()=>{ const id=Number(btn.closest('[data-post-id]').dataset.postId); let saved=store.json('saved',[]); if(saved.includes(id)){saved=saved.filter(x=>x!==id);btn.textContent='☆';toast('Removed from favorites')} else {saved.push(id);btn.textContent='★';toast('Saved to favorites')} store.setJson('saved',saved); }));
    $$('.js-share',root).forEach(btn=>btn.addEventListener('click',()=>toast('Share link copied')));
    $$('.js-comment-focus',root).forEach(btn=>btn.addEventListener('click',()=>$('.js-comment-form input',btn.closest('.post')).focus()));
    $$('.js-comment-form',root).forEach(f=>f.addEventListener('submit',e=>{e.preventDefault(); const input=$('input',f); if(input.value.trim()){toast('Comment added'); if(window.BoundUpSound) window.BoundUpSound.playMessageSent(); input.value='';}}));
  }

  function renderExplore(){
    const grid=$('#exploreGrid'); if(!grid) return;
    grid.innerHTML=[...D.posts,...D.posts].map((p,i)=>`<a class="grid-card" data-info="♡ ${(p.likes+i*20).toLocaleString()} • 💬 ${p.comments+i}" href="home.html#post-${p.id}"><img src="${p.img}" alt="${p.tag}"></a>`).join('');
    
    const search=$('#globalSearch');
    const userResultsContainer = $('#userSearchResults');

    if(search){
      search.addEventListener('input',()=>{
        const q=search.value.toLowerCase().trim().replace('@','');
        
        // Search Registered Users by Username / ID
        if(userResultsContainer){
          if(q.length >= 1){
            const allReg = getRegisteredUsers();
            const matchedUsers = Object.values(allReg).filter(u => 
              (u.username && u.username.toLowerCase().includes(q)) || 
              (u.name && u.name.toLowerCase().includes(q))
            );

            if(matchedUsers.length > 0){
              userResultsContainer.classList.remove('hidden');
              userResultsContainer.innerHTML = matchedUsers.map(u => `
                <div class="feature-card glass" style="display:flex;align-items:center;gap:14px;padding:14px;">
                  <img class="avatar" src="${u.avatar}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid var(--brand)">
                  <div style="flex:1;min-width:0;">
                    <b style="display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.name}</b>
                    <small style="color:var(--muted);display:block">@${u.username} • ${u.followers || '0'} followers</small>
                  </div>
                  <div style="display:flex;gap:6px;">
                    <a class="ghost-btn" href="profile.html?user=${encodeURIComponent(u.username)}" style="padding:6px 12px;font-size:12px">Profile</a>
                    <a class="primary-btn" href="chat.html?target=${encodeURIComponent(u.username)}" style="padding:6px 12px;font-size:12px">💬 Message</a>
                  </div>
                </div>
              `).join('');
            } else {
              userResultsContainer.classList.add('hidden');
            }
          } else {
            userResultsContainer.classList.add('hidden');
          }
        }

        // Filter Post Grid
        $$('.grid-card',grid).forEach((c,i)=>{
          const p=D.posts[i%D.posts.length];
          c.style.display=(p.caption.toLowerCase().includes(q)||p.tag.toLowerCase().includes(q))?'block':'none';
        });
      });
    }
  }

  /* NATIVE PUSH NOTIFICATION CONTROLLER */
  function initPushNotifications(){
    if('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied'){
      Notification.requestPermission();
    }
  }

  function triggerPushNotification(title, bodyText){
    if('Notification' in window && Notification.permission === 'granted'){
      try {
        new Notification(title, {
          body: bodyText,
          icon: 'assets/logo-icon.png'
        });
      } catch(e) {}
    }
  }

  /* MULTI-USER REELS LIVE STREAMER CONTROLLER */
  let liveStreamMedia = null;
  let liveViewerTimer = null;

  function initReelsLiveStream(){
    const startBtn = $('#startLiveStreamBtn');
    const modal = $('#liveStreamModal');
    const closeBtn = $('#closeLiveStreamBtn');
    const videoEl = $('#liveWebcamVideo');
    const counterEl = $('#liveViewerCounter');
    const sendHeartBtn = $('#sendLiveHeartBtn');
    const chatInput = $('#liveChatInput');
    const chatBox = $('#liveChatMessagesBox');

    if(!startBtn || !modal) return;

    startBtn.addEventListener('click', async ()=>{
      modal.classList.remove('hidden');
      try {
        liveStreamMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if(videoEl) videoEl.srcObject = liveStreamMedia;
      } catch(err) {
        toast('Camera simulation active for Live Stream!');
      }

      let count = 1420;
      if(liveViewerTimer) clearInterval(liveViewerTimer);
      liveViewerTimer = setInterval(()=>{
        count += Math.floor(Math.random() * 7) - 3;
        if(counterEl) counterEl.textContent = `👁️ ${count.toLocaleString()} Viewers`;
      }, 2000);

      toast('🔴 You are now LIVE on BoundUp Reels!');
      triggerPushNotification('🔴 BoundUp Live Stream Started!', 'Sam Bound is live now. Tap to watch!');
    });

    const stopLive = () => {
      if(liveStreamMedia){
        liveStreamMedia.getTracks().forEach(t => t.stop());
        liveStreamMedia = null;
      }
      if(videoEl) videoEl.srcObject = null;
      if(liveViewerTimer){
        clearInterval(liveViewerTimer);
        liveViewerTimer = null;
      }
      modal.classList.add('hidden');
      toast('Live Stream ended');
    };

    if(closeBtn) closeBtn.addEventListener('click', stopLive);

    if(sendHeartBtn){
      sendHeartBtn.addEventListener('click', ()=>{
        if(window.BoundUpSound) window.BoundUpSound.playLike();
        toast('❤️ Live Reaction Sent!');
      });
    }

    if(chatInput && chatBox){
      chatInput.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter' && chatInput.value.trim()){
          const msg = chatInput.value.trim();
          chatBox.insertAdjacentHTML('beforeend', `<div><b>@you:</b> ${msg}</div>`);
          chatInput.value = '';
          chatBox.scrollTop = chatBox.scrollHeight;
        }
      });
    }
  }

  function renderReels(){
    const el=$('#reelsGrid'); if(!el) return;
    const searchInput = $('#reelSongSearchInput');
    const customReels = store.json('custom_reels', []);
    let allReels = [...customReels, ...D.reels];

    const drawGrid = (reelsList) => {
      el.innerHTML=reelsList.map(r=>`<article class="reel-card">
        <video class="reel-video js-reel-video" src="${r.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}" poster="${r.img}" loop muted playsinline style="width:100%;height:100%;object-fit:cover;cursor:pointer"></video>
        <button class="video-sound-btn js-reel-sound-toggle" style="top:14px;bottom:auto;right:14px;">🔇</button>
        <div class="reel-overlay">
          <b>${r.title}</b>
          <div class="audio-track-tag" style="color:white;margin:4px 0;">
            <div class="sound-wave-icon"><span style="background:white"></span><span style="background:white"></span><span style="background:white"></span></div>
            <span>${r.audioTrack || 'Original Audio'}</span>
          </div>
          <div>${r.views} views • @${r.author || 'itz_sam'}</div>
          <div class="icon-row" style="margin-top:8px;">
            <button class="icon-btn js-reel-like">♡</button>
            <button class="icon-btn js-share">↗</button>
          </div>
        </div>
      </article>`).join('');

      $$('.reel-card', el).forEach((card, idx)=>{
        card.addEventListener('click', (e)=>{
          if(e.target.classList.contains('js-reel-sound-toggle') || e.target.classList.contains('js-reel-like') || e.target.classList.contains('js-share')) return;
          const reel = reelsList[idx];
          if(reel){
            openVideoPlayerModal({
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
              name: reel.author || 'Reel Creator',
              username: reel.author || 'creator',
              caption: reel.title,
              audioTrack: reel.audioTrack,
              audioSrc: reel.audioSrc,
              videoUrl: reel.videoUrl
            });
          }
        });
      });

      $$('.js-reel-sound-toggle',el).forEach((btn, idx)=>{
        btn.addEventListener('click',(e)=>{
          e.stopPropagation();
          const video = btn.previousElementSibling;
          const card = btn.closest('.reel-card');
          let soundGenre = 'mass';
          let audioSrc = null;
          if(reelsList[idx]) audioSrc = reelsList[idx].audioSrc;

          if(card){
            const trackText = $('.audio-track-tag', card)?.textContent || '';
            if(trackText.includes('💕') || trackText.toLowerCase().includes('kadhale') || trackText.toLowerCase().includes('love') || trackText.toLowerCase().includes('nira')){
              soundGenre = 'love';
            }
          }
          if(video && window.BoundUpSound){
            window.BoundUpSound.enableVideoSound(video, btn, soundGenre, audioSrc);
          }
        });
      });

      $$('.js-reel-like',el).forEach(b=>b.addEventListener('click',()=>{
        b.textContent=b.textContent==='♡'?'♥':'♡';
        b.classList.toggle('liked');
        if(window.BoundUpSound && b.classList.contains('liked')) window.BoundUpSound.playLike();
      }));
      $$('.js-share',el).forEach(b=>b.addEventListener('click',()=>toast('Reel link copied')));
    };

    drawGrid(allReels);

    if(searchInput){
      searchInput.addEventListener('input', ()=>{
        const query = searchInput.value.toLowerCase().trim();
        const filtered = allReels.filter(r => 
          (r.title && r.title.toLowerCase().includes(query)) ||
          (r.audioTrack && r.audioTrack.toLowerCase().includes(query)) ||
          (r.author && r.author.toLowerCase().includes(query))
        );
        drawGrid(filtered);
      });
    }
  }


  /* FULL REAL-TIME MULTI-ACCOUNT CHAT & MESSAGE REQUEST SYSTEM */
  function initChat(){
    const form=$('#chatForm'), input=$('#chatInput'), thread=$('#thread');
    if(!form || !thread) return;

    if(!isLoggedIn()){
      const chatShell = $('.chat-shell');
      if(chatShell){
        chatShell.innerHTML = `
          <div class="glass glow-card" style="grid-column:1/-1;padding:50px 24px;text-align:center;margin:40px auto;max-width:520px;border-radius:28px;">
            <div style="font-size:54px;margin-bottom:14px;">🔐</div>
            <h2 style="font-size:28px;font-weight:900;margin:0 0 10px;">Messages Restricted</h2>
            <p style="color:var(--muted);font-size:15px;line-height:1.6;margin-bottom:24px;">Please login to your BoundUp account to access private chats, send messages, and view message requests.</p>
            <div style="display:flex;gap:12px;justify-content:center;">
              <a class="primary-btn" href="login.html" style="padding:14px 28px;">Login to Chat 🚀</a>
              <a class="ghost-btn" href="welcome.html" style="padding:14px 24px;">Learn More</a>
            </div>
          </div>
        `;
      }
      toast('🔒 Please login to access Messages!');
      return;
    }

    let activeTab = 'primary'; // 'primary' | 'requests'
    let currentUser = store.get('chat_user') || store.get('user') || 'itz_sam';
    const allReg = getRegisteredUsers();

    const urlParams = new URLSearchParams(window.location.search);
    const targetParam = urlParams.get('target');

    let targetContactId = (targetParam && allReg[targetParam]) ? targetParam : 'riya.vibe';

    // Contact Metadata registry from Registered Users
    const allUsers = {};
    Object.keys(allReg).forEach(k => {
      const u = allReg[k];
      allUsers[k] = {
        handle: u.username,
        name: u.name,
        avatar: u.avatar,
        status: u.username === currentUser ? 'Online (You)' : 'Online',
        accepted: true
      };
    });

    // User Pair Room Helper
    function getRoomId(u1, u2){
      const sorted = [u1, u2].sort();
      return `room_${sorted[0]}_${sorted[1]}`;
    }

    // Default message threads
    const defaultThreads = {
      [getRoomId('itz_sam', 'riya.vibe')]: [
        { sender: 'riya.vibe', text: 'Hey Sam! Did you hear the new Tamil BGM edit on BoundUp?', time: '11:30 AM' },
        { sender: 'itz_sam', text: 'Yes! The bass drop was fire 🔥', time: '11:32 AM' }
      ],
      [getRoomId('itz_sam', 'nila_voice')]: [
        { sender: 'nila_voice', text: 'Hey Sam! I sent you a voice request for the upcoming project.', time: '10:00 AM' }
      ],
      [getRoomId('riya.vibe', 'arun_gaming')]: [
        { sender: 'arun_gaming', text: 'Riya! Can I use your BGM track for my live gaming stream?', time: '09:00 AM' }
      ]
    };

    // Accepted contacts registry per user
    let acceptedMap = store.json('chat_accepted_map', {
      'itz_sam': ['riya.vibe', 'arun_gaming'],
      'riya.vibe': ['itz_sam', 'arun_gaming'],
      'arun_gaming': ['itz_sam', 'riya.vibe'],
      'nila_voice': [],
      'vicky_creator': []
    });

    if(targetParam){
      if(!acceptedMap[currentUser]) acceptedMap[currentUser] = [];
      if(!acceptedMap[currentUser].includes(targetParam)){
        acceptedMap[currentUser].push(targetParam);
        store.setJson('chat_accepted_map', acceptedMap);
      }
    }

    let chatStorage = store.json('chat_room_storage', defaultThreads);

    // Socket.IO real-time connection setup
    if(typeof io !== 'undefined'){
      try {
        socket = io('http://localhost:5000');
        socket.on('connect', ()=>{
          const badge = $('#socketBadge');
          if(badge){ badge.textContent = "● Live Socket.IO"; badge.classList.remove('offline'); }
          socket.emit('user:register', currentUser);
          joinActiveRoom();
        });
        socket.on('disconnect', ()=>{
          const badge = $('#socketBadge');
          if(badge){ badge.textContent = "○ Local Sync"; badge.classList.add('offline'); }
        });
        socket.on('message:new', (data)=>{
          const currentRoom = getRoomId(currentUser, targetContactId);
          if(data.roomId === currentRoom && data.sender !== currentUser){
            appendBubble('other', data.text, data.media, data.time || getTimeString());
            saveMessageToRoom(currentRoom, data.sender, data.text, data.media);
            if(window.BoundUpSound) window.BoundUpSound.playNotification();
          }
        });
        socket.on('message:incoming', (data)=>{
          // If incoming message from a non-accepted user
          if(!acceptedMap[currentUser]?.includes(data.sender)){
            if(!acceptedMap[currentUser]) acceptedMap[currentUser] = [];
            store.setJson('chat_accepted_map', acceptedMap);
            renderContacts();
            toast(`New Message Request from @${data.sender}!`);
            if(window.BoundUpSound) window.BoundUpSound.playNotification();
          }
        });
        socket.on('request:accepted', (data)=>{
          if(!acceptedMap[currentUser]) acceptedMap[currentUser] = [];
          if(!acceptedMap[currentUser].includes(data.from)){
            acceptedMap[currentUser].push(data.from);
            store.setJson('chat_accepted_map', acceptedMap);
          }
          renderContacts();
          renderThread();
          toast(`@${data.from} accepted your message request!`);
          if(window.BoundUpSound) window.BoundUpSound.playNotification();
        });
      } catch(err) {
        console.log('Socket connection offline:', err);
      }
    }

    function getTimeString(){
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function joinActiveRoom(){
      if(socket && currentUser && targetContactId){
        const roomId = getRoomId(currentUser, targetContactId);
        socket.emit('room:join', roomId);
      }
    }

    function saveMessageToRoom(roomId, sender, text, media = null){
      if(!chatStorage[roomId]) chatStorage[roomId] = [];
      chatStorage[roomId].push({ sender, text, media, time: getTimeString() });
      store.setJson('chat_room_storage', chatStorage);
    }

    function appendBubble(senderType, text, media = null, time = getTimeString()){
      const isMe = senderType === 'me' || senderType === currentUser;
      let mediaMarkup = media ? `<img class="chat-img-attachment" src="${media}" alt="Attachment">` : '';
      let bubbleHtml = `<div class="bubble ${isMe ? 'me' : ''}"><div>${text || ''}</div>${mediaMarkup}<span class="bubble-time">${time}${isMe ? ' ✓✓' : ''}</span></div>`;
      thread.insertAdjacentHTML('beforeend', bubbleHtml);
      thread.scrollTop = thread.scrollHeight;
    }

    function renderContacts(){
      const container = $('#contactListContainer');
      if(!container) return;

      const userAccepted = acceptedMap[currentUser] || [];
      const keys = Object.keys(allUsers).filter(k => k !== currentUser);

      let primaryList = [];
      let requestList = [];

      keys.forEach(key => {
        if(userAccepted.includes(key)){
          primaryList.push(allUsers[key]);
        } else {
          // Check if there is message history
          const roomId = getRoomId(currentUser, key);
          if(chatStorage[roomId] && chatStorage[roomId].length > 0){
            requestList.push(allUsers[key]);
          } else {
            primaryList.push(allUsers[key]); // Available to chat
          }
        }
      });

      const badgeCount = $('#reqBadgeCount');
      if(badgeCount){
        if(requestList.length > 0){
          badgeCount.textContent = requestList.length;
          badgeCount.classList.remove('hidden');
        } else {
          badgeCount.classList.add('hidden');
        }
      }

      const activeList = activeTab === 'primary' ? primaryList : requestList;

      if(activeList.length === 0){
        container.innerHTML = `<p class="muted" style="text-align:center;padding:20px;font-weight:800">No ${activeTab} messages</p>`;
        return;
      }

      container.innerHTML = activeList.map(u => `
        <div class="profile-mini chat-person ${u.handle === targetContactId ? 'active' : ''}" data-handle="${u.handle}">
          <img class="avatar" src="${u.avatar}" alt="${u.name}">
          <div><b>${u.name}</b><div class="muted">@${u.handle} • ${u.status}</div></div>
        </div>
      `).join('');

      $$('.chat-person', container).forEach(el => {
        el.addEventListener('click', ()=>{
          targetContactId = el.dataset.handle;
          $$('.chat-person', container).forEach(c => c.classList.remove('active'));
          el.classList.add('active');
          joinActiveRoom();
          renderThread();
        });
      });
    }

    function renderThread(){
      thread.innerHTML = '';
      const roomId = getRoomId(currentUser, targetContactId);
      const messages = chatStorage[roomId] || [];
      
      messages.forEach(msg => {
        appendBubble(msg.sender, msg.text, msg.media, msg.time);
      });

      const targetMeta = allUsers[targetContactId] || { name: 'User', avatar: 'assets/avatar-1.svg', status: 'Online' };
      const nameEl = $('#activeChatName');
      const avatarEl = $('#activeChatAvatar');
      const statusEl = $('#activeChatStatus');

      if(nameEl) nameEl.textContent = `${targetMeta.name} (@${targetContactId})`;
      if(avatarEl) avatarEl.src = targetMeta.avatar;
      if(statusEl) statusEl.textContent = targetMeta.status;

      // Handle Request Acceptance Banner Overlay
      const userAccepted = acceptedMap[currentUser] || [];
      const isAccepted = userAccepted.includes(targetContactId) || targetContactId === 'ai';
      const banner = $('#requestBannerOverlay');
      const bannerText = $('#requestBannerText');

      if(!isAccepted && messages.length > 0){
        if(banner) banner.classList.remove('hidden');
        if(bannerText) bannerText.textContent = `Accept message request from @${targetContactId} to start chatting?`;
      } else {
        if(banner) banner.classList.add('hidden');
      }
    }

    // Account Switcher Listener
    const userSelect = $('#activeUserSelect');
    if(userSelect){
      userSelect.value = currentUser;
      userSelect.addEventListener('change', ()=>{
        currentUser = userSelect.value;
        store.set('chat_user', currentUser);
        if(socket) socket.emit('user:register', currentUser);
        
        // Pick first contact
        const keys = Object.keys(allUsers).filter(k => k !== currentUser);
        targetContactId = keys[0] || 'ai';

        joinActiveRoom();
        renderContacts();
        renderThread();
        toast(`Switched account to @${currentUser}`);
      });
    }

    // Tab Bar Listeners
    const tabPrimary = $('#tabPrimary');
    const tabRequests = $('#tabRequests');
    if(tabPrimary && tabRequests){
      tabPrimary.addEventListener('click', ()=>{
        activeTab = 'primary';
        tabPrimary.classList.add('active');
        tabRequests.classList.remove('active');
        renderContacts();
        renderThread();
      });
      tabRequests.addEventListener('click', ()=>{
        activeTab = 'requests';
        tabRequests.classList.add('active');
        tabPrimary.classList.remove('active');
        renderContacts();
        renderThread();
      });
    }

    // Accept / Decline Request Listener
    const acceptBtn = $('#acceptRequestBtn');
    const declineBtn = $('#declineRequestBtn');

    if(acceptBtn){
      acceptBtn.addEventListener('click', ()=>{
        if(!acceptedMap[currentUser]) acceptedMap[currentUser] = [];
        if(!acceptedMap[currentUser].includes(targetContactId)){
          acceptedMap[currentUser].push(targetContactId);
          store.setJson('chat_accepted_map', acceptedMap);
        }
        if(socket){
          socket.emit('request:accept', { from: currentUser, targetUser: targetContactId });
        }
        toast(`Message request from @${targetContactId} accepted!`);
        renderContacts();
        renderThread();
      });
    }

    if(declineBtn){
      declineBtn.addEventListener('click', ()=>{
        const roomId = getRoomId(currentUser, targetContactId);
        delete chatStorage[roomId];
        store.setJson('chat_room_storage', chatStorage);
        toast(`Message request declined`);
        renderContacts();
        renderThread();
      });
    }

    // Handle Form Submit (Sending Message)
    let pendingMediaUrl = null;
    const mediaInput = $('#chatMediaInput');
    const mediaBtn = $('#chatMediaBtn');
    const emojiBtn = $('#chatEmojiBtn');

    if(mediaBtn && mediaInput){
      mediaBtn.addEventListener('click', () => mediaInput.click());
      mediaInput.addEventListener('change', (e)=>{
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          pendingMediaUrl = evt.target.result;
          toast('Photo attached! Click send ➤');
        };
        reader.readAsDataURL(file);
      });
    }

    if(emojiBtn){
      const emojis = ['🔥', '🧡', '✨', '🎧', '💯', '👍', '😊'];
      emojiBtn.addEventListener('click', ()=>{
        input.value += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
        input.focus();
      });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = input.value.trim();
      if(!text && !pendingMediaUrl) return;

      const roomId = getRoomId(currentUser, targetContactId);
      const timeStr = getTimeString();

      // Append my message
      appendBubble('me', text, pendingMediaUrl, timeStr);
      saveMessageToRoom(roomId, currentUser, text, pendingMediaUrl);
      if(window.BoundUpSound) window.BoundUpSound.playMessageSent();

      // Emit direct Socket event
      if(socket){
        socket.emit('message:send_direct', {
          roomId,
          targetUser: targetContactId,
          sender: currentUser,
          text,
          media: pendingMediaUrl,
          time: timeStr
        });
      }

      input.value = '';
      pendingMediaUrl = null;
      if(mediaInput) mediaInput.value = '';

      // AI Bot Auto Reply if target is 'ai'
      if(targetContactId === 'ai'){
        setTimeout(()=>{
          thread.insertAdjacentHTML('beforeend',`<div class="bubble" id="typingBubble"><div class="typing"><i></i><i></i><i></i></div></div>`);
          thread.scrollTop = thread.scrollHeight;
        }, 400);

        setTimeout(()=>{
          const typingBubble = $('#typingBubble');
          if(typingBubble) typingBubble.remove();

          let replyText = "";
          const lower = text.toLowerCase();
          if(lower.includes('caption')){
            replyText = "✨ AI Caption: 'Living life in stereo 🎧 Tamil BGM vibe on BoundUp 🧡'";
          } else if(lower.includes('translate') || lower.includes('tamil')){
            replyText = "🔤 Tamil: 'BoundUp செயலியில் உங்களை வரவேற்பதில் மகிழ்ச்சி!'";
          } else {
            replyText = `BoundUp AI: Noted "${text}" for user @${currentUser}! Need a caption or summary?`;
          }

          appendBubble('ai', replyText, null, getTimeString());
          saveMessageToRoom(roomId, 'ai', replyText, null);
          if(window.BoundUpSound) window.BoundUpSound.playNotification();
        }, 1300);
      }
    });

    // Initial render
    renderContacts();
    renderThread();
  }

  function getRegisteredUsers(){
    const defaultUsers = {
      'itz_sam': { name: 'Sam Bound', username: 'itz_sam', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', bio: 'Dreamer • Gamer • Creator 🚀', category: '🚀 Creator', followers: '12.4K', following: '256', anthem: '💕 Kadhale Kadhale • Flute Romance', anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-flute-melody-112348.mp3' },
      'riya.vibe': { name: 'Riya Music', username: 'riya.vibe', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', cover: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80', bio: 'Music stories & Tamil BGM drops daily 🎵', category: '🎵 Music & Songs', followers: '48.2K', following: '120', anthem: '💕 Nira Nira • Acoustic Sunset', anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a70512.mp3?filename=acoustic-guitar-love-song-18945.mp3' },
      'arun_gaming': { name: 'Arun Gaming', username: 'arun_gaming', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80', bio: 'Live streaming & esports tournament 🎮', category: '🎮 Gaming Aura', followers: '32.1K', following: '88', anthem: '🔥 Tamil Mass BGM Drop', anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8b74a3f12.mp3?filename=mass-bass-drop-action-19823.mp3' },
      'nila_voice': { name: 'Nila Voice', username: 'nila_voice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80', bio: 'Singer & voiceover artist 🎙️', category: '🎙️ Voice & Songs', followers: '21.5K', following: '150', anthem: '💕 Kannazhaga • Soft Violin', anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=violin-romantic-cinematic-11023.mp3' },
      'vicky_creator': { name: 'Vicky Creator', username: 'vicky_creator', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', bio: 'VFX Motion & Cinematic Edits 🎬', category: '🎬 VFX & Motion', followers: '15.8K', following: '95', anthem: '🎧 Chill Lo-Fi Beat', anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db65912a77.mp3?filename=chill-lofi-song-110321.mp3' }
    };
    return Object.assign(defaultUsers, store.json('registered_users', {}));
  }

  function initAuth(){
    const form=$('#authForm'); if(!form) return;
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const email=$('#email')?.value.trim();
      const pass=$('#password')?.value.trim();
      const err=$('#formError');
      if(!email || !pass){ if(err) err.textContent='Please enter email/username and password.'; return; }
      if(pass.length<4){ if(err) err.textContent='Password must be at least 4 characters.'; return; }

      const cleanUser = email.replace('@boundup.app','').replace('@','').trim();
      store.set('user', cleanUser);
      store.set('chat_user', cleanUser);

      // Register new user profile if not present
      const registered = store.json('registered_users', {});
      if(!registered[cleanUser]){
        registered[cleanUser] = {
          name: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
          username: cleanUser,
          email: email,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          bio: 'BoundUp Creator 🚀',
          category: '🚀 Creator',
          followers: '0',
          following: '0',
          anthem: '💕 Kadhale Kadhale • Flute Romance',
          anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-flute-melody-112348.mp3'
        };
        store.setJson('registered_users', registered);
      }

      toast(`Welcome @${cleanUser} to BoundUp!`);
      setTimeout(()=>location.href='home.html', 600);
    });
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

  /* ADVANCED PROFILE & EDIT PROFILE CONTROLLER */
  function getStoredProfile(targetUser){
    const currentUser = targetUser || store.get('user') || 'itz_sam';
    const defaultProfiles = {
      'itz_sam': { name: 'Sam Bound', username: 'itz_sam', bio: 'Dreamer • Gamer • Creator 🚀', category: '🚀 Creator', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', anthem: '💕 Kadhale Kadhale • Flute Romance', anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-flute-melody-112348.mp3', followers: '12.4K', following: '256' },
      'riya.vibe': { name: 'Riya Music', username: 'riya.vibe', bio: 'Music stories & Tamil BGM drops daily 🎵', category: '🎵 Music & Songs', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', cover: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80', anthem: '💕 Nira Nira • Acoustic Sunset', anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a70512.mp3?filename=acoustic-guitar-love-song-18945.mp3', followers: '48.2K', following: '120' },
      'arun_gaming': { name: 'Arun Gaming', username: 'arun_gaming', bio: 'Live streaming & esports tournament 🎮', category: '🎮 Gaming Aura', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80', anthem: '🔥 Tamil Mass BGM Drop', anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8b74a3f12.mp3?filename=mass-bass-drop-action-19823.mp3', followers: '32.1K', following: '88' },
      'nila_voice': { name: 'Nila Voice', username: 'nila_voice', bio: 'Singer & voiceover artist 🎙️', category: '🎙️ Voice & Songs', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80', anthem: '💕 Kannazhaga • Soft Violin', anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=violin-romantic-cinematic-11023.mp3', followers: '21.5K', following: '150' },
      'vicky_creator': { name: 'Vicky Creator', username: 'vicky_creator', bio: 'VFX Motion & Cinematic Edits 🎬', category: '🎬 VFX & Motion', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', anthem: '🎧 Chill Lo-Fi Beat', anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db65912a77.mp3?filename=chill-lofi-song-110321.mp3', followers: '15.8K', following: '95' }
    };

    const base = defaultProfiles[currentUser] || {
      name: currentUser.charAt(0).toUpperCase() + currentUser.slice(1),
      username: currentUser,
      bio: 'BoundUp Creator 🚀',
      category: '🚀 Creator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      anthem: '💕 Kadhale Kadhale • Flute Romance',
      anthemSrc: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-flute-melody-112348.mp3',
      followers: '0',
      following: '0'
    };

    const perAccountCustom = store.json('user_profile_' + currentUser, {});
    return Object.assign(base, perAccountCustom);
  }

  function renderProfile(){
    const grid = $('#profileGrid');
    const urlParams = new URLSearchParams(window.location.search);
    const requestedUser = urlParams.get('user');
    const loggedInUser = store.get('user') || 'itz_sam';
    const targetUsername = requestedUser || loggedInUser;

    const profile = getStoredProfile(targetUsername);
    const isOwnProfile = (targetUsername === loggedInUser);

    const avatarImg = $('#profileAvatarImg');
    const nameEl = $('#profileNameDisplay');
    const handleBioEl = $('#profileHandleBio');
    const catTextEl = $('#profileCategoryText');
    const coverBg = $('#profileCoverBg');
    const anthemTitleEl = $('#profileAnthemTitle');

    if(avatarImg) avatarImg.src = profile.avatar;
    if(nameEl) nameEl.textContent = profile.name;
    if(handleBioEl) handleBioEl.textContent = `@${profile.username} • ${profile.bio}`;
    if(catTextEl) catTextEl.textContent = profile.category || '🚀 Creator';
    if(coverBg) coverBg.style.backgroundImage = `url('${profile.cover}')`;
    if(anthemTitleEl) anthemTitleEl.textContent = `🎵 Profile Anthem: ${profile.anthem || '💕 Kadhale Kadhale • Flute Romance'}`;

    // Header buttons (Edit vs Follow & Message)
    const editBtn = $('#openEditProfileBtn');
    const followBtn = $('#profileFollowBtn');
    const messageBtn = $('#profileMessageBtn');

    if(isOwnProfile){
      if(editBtn) editBtn.style.display = 'inline-flex';
      if(followBtn) followBtn.style.display = 'none';
      if(messageBtn) messageBtn.style.display = 'none';
    } else {
      if(editBtn) editBtn.style.display = 'none';
      if(followBtn){
        followBtn.style.display = 'inline-flex';
        followBtn.addEventListener('click', ()=>{
          const isFollowing = followBtn.classList.contains('following');
          if(isFollowing){
            followBtn.classList.remove('following');
            followBtn.textContent = 'Follow';
            toast(`Unfollowed @${profile.username}`);
          } else {
            followBtn.classList.add('following');
            followBtn.textContent = 'Following ✓';
            toast(`Following @${profile.username}! ✨`);
            if(window.BoundUpSound) window.BoundUpSound.playLike();
          }
        });
      }
      if(messageBtn){
        messageBtn.style.display = 'inline-flex';
        messageBtn.href = `chat.html?target=${encodeURIComponent(profile.username)}`;
      }
    }

    // Profile Anthem Song Player
    const anthemBtn = $('#playProfileAnthemBtn');
    if(anthemBtn){
      anthemBtn.addEventListener('click', ()=>{
        if(window.BoundUpSound){
          window.BoundUpSound.playRealSongTrack(profile.anthemSrc, 'love');
          toast(`Playing Anthem: ${profile.anthem}`);
        }
      });
    }

    // Followers & Following Modals
    const openFollowersBtn = $('#statFollowersCount');
    const openFollowingBtn = $('#statFollowingCount');
    const followersModal = $('#followersModal');
    const closeFollowersBtn = $('#closeFollowersBtn');
    const container = $('#followersListContainer');

    const sampleFollowers = [
      { name: 'Riya Music', username: 'riya.vibe', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
      { name: 'Arun Gaming', username: 'arun_gaming', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
      { name: 'Nila Voice', username: 'nila_voice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
      { name: 'Karthik Motion', username: 'karthik_fx', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80' }
    ];

    const showFollowers = (title) => {
      if(!followersModal || !container) return;
      $('.upload-header h3', followersModal).textContent = title;
      container.innerHTML = sampleFollowers.map(u=>`
        <div class="follower-user-item">
          <img src="${u.avatar}" alt="${u.name}">
          <div style="flex:1">
            <b>${u.name}</b>
            <small style="display:block;color:var(--muted)">@${u.username}</small>
          </div>
          <button class="follow-btn following">Following</button>
        </div>
      `).join('');
      followersModal.classList.remove('hidden');
    };

    if(openFollowersBtn) openFollowersBtn.addEventListener('click', ()=> showFollowers(`Followers (${profile.followers || '12.4K'})`));
    if(openFollowingBtn) openFollowingBtn.addEventListener('click', ()=> showFollowers(`Following (${profile.following || '256'})`));
    if(closeFollowersBtn) closeFollowersBtn.addEventListener('click', ()=> followersModal.classList.add('hidden'));

    // Profile Tabs & Filtered Grid
    if(grid){
      const renderTabGrid = (tabKey) => {
        if(tabKey === 'reels'){
          const customReels = store.json('custom_reels', []);
          const allReels = customReels.concat(D.reels);
          const userReels = allReels.filter(r => (r.author === targetUsername || r.user === targetUsername || isOwnProfile));
          grid.innerHTML = (userReels.length ? userReels : D.reels).map(r=>`<a class="grid-card tall" data-info="🎬 ${r.views || '1.2K'} views" href="reels.html"><img src="${r.img}"></a>`).join('');
        } else if(tabKey === 'saved'){
          const savedIds = store.json('saved', [101, 102]);
          const posts = D.posts.filter(p => savedIds.includes(p.id));
          grid.innerHTML = (posts.length ? posts : D.posts.slice(0, 3)).map(p => `<a class="grid-card" data-info="🔖 Saved" href="home.html#post-${p.id}"><img src="${p.img}"></a>`).join('');
        } else if(tabKey === 'anthem'){
          grid.innerHTML = `
            <div class="glass" style="grid-column:1/-1;padding:32px;text-align:center;border-radius:24px;">
              <div class="sound-wave-icon" style="margin:0 auto 14px;"><span style="background:var(--brand)"></span><span style="background:var(--brand)"></span><span style="background:var(--brand)"></span></div>
              <h2 style="margin:0;font-size:24px;font-weight:900">${profile.anthem || '💕 Kadhale Kadhale • Flute Romance'}</h2>
              <p style="color:var(--muted);margin:8px 0 18px">Active Profile Anthem Song • Playing on profile visits</p>
              <button type="button" class="primary-btn" id="tabPlayAnthemBtn">▶ Play Real Song Audio</button>
            </div>
          `;
          $('#tabPlayAnthemBtn')?.addEventListener('click', ()=>{
            if(window.BoundUpSound) window.BoundUpSound.playRealSongTrack(profile.anthemSrc, 'love');
          });
        } else {
          const customPosts = store.json('custom_posts', []);
          const allPosts = [...customPosts, ...D.posts];
          const userPosts = allPosts.filter(p => (p.author === targetUsername || p.user === targetUsername || (isOwnProfile && (p.user === 1 || p.author === targetUsername))));
          grid.innerHTML = (userPosts.length ? userPosts : D.posts).map(p => `<a class="grid-card" data-info="♡ ${(p.likes||100).toLocaleString()}" href="home.html#post-${p.id}"><img src="${p.img}"></a>`).join('');
        }
      };

      renderTabGrid('posts');

      $$('.tab', document).forEach(tab => {
        tab.addEventListener('click', () => {
          $$('.tab', document).forEach(x => x.classList.remove('active'));
          tab.classList.add('active');
          const tabKey = tab.dataset.profileTab || 'posts';
          renderTabGrid(tabKey);
        });
      });
    }

    // Render Suggested Creators Section on Profile
    const suggestionsContainer = $('#profileSuggestionsContainer');
    if(suggestionsContainer){
      const suggestedUsers = [
        { name: 'Riya Music', username: 'riya.vibe', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', info: '🎵 Tamil BGM Creator' },
        { name: 'Arun Gaming', username: 'arun_gaming', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', info: '🎮 Live Streamer' },
        { name: 'Nila Voice', username: 'nila_voice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', info: '🎙️ Voice & Songs' }
      ];

      suggestionsContainer.innerHTML = suggestedUsers.map(u => `
        <div class="feature-card glass" style="text-align:center;padding:18px;">
          <img class="avatar" src="${u.avatar}" style="width:70px;height:70px;margin:0 auto 10px;display:block;border:2px solid var(--brand)">
          <b style="display:block;font-size:16px">${u.name}</b>
          <small style="color:var(--muted);display:block;margin:4px 0 12px">@${u.username} • ${u.info}</small>
          <button type="button" class="primary-btn js-profile-follow-btn" style="width:100%;padding:9px 14px;font-size:13px">Follow</button>
        </div>
      `).join('');

      $$('.js-profile-follow-btn', suggestionsContainer).forEach(btn => {
        btn.addEventListener('click', () => {
          const isFollowing = btn.classList.contains('following');
          if(isFollowing){
            btn.classList.remove('following');
            btn.textContent = 'Follow';
            btn.style.background = 'linear-gradient(135deg, var(--brand), #ff3d00)';
            toast('Unfollowed user');
          } else {
            btn.classList.add('following');
            btn.textContent = 'Following ✓';
            btn.style.background = 'var(--panel2)';
            btn.style.color = 'var(--muted)';
            toast('Following user! ✨');
            if(window.BoundUpSound) window.BoundUpSound.playLike();
          }
        });
      });
    }
  }

  function initEditProfileModal(){
    const openBtn = $('#openEditProfileBtn');
    const modal = $('#editProfileModal');
    const closeBtn = $('#closeEditProfileBtn');
    const cancelBtn = $('#cancelEditProfileBtn');
    const form = $('#editProfileForm');

    if(!modal || !form) return;

    if(openBtn) openBtn.addEventListener('click', () => {
      const p = getStoredProfile();
      if($('#editNameInput')) $('#editNameInput').value = p.name || '';
      if($('#editUsernameInput')) $('#editUsernameInput').value = p.username || '';
      if($('#editBioInput')) $('#editBioInput').value = p.bio || '';
      if($('#editCategorySelect')) $('#editCategorySelect').value = p.category || '🚀 Creator';
      if($('#editAnthemSelect')) $('#editAnthemSelect').value = p.anthem || '💕 Kadhale Kadhale • Flute Romance';
      if($('#previewEditAvatar')) $('#previewEditAvatar').src = p.avatar;
      modal.classList.remove('hidden');
    });

    if(closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if(cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    let newAvatarUrl = null;
    let newCoverUrl = null;

    $('#editAvatarFile')?.addEventListener('change', (e)=>{
      const file = e.target.files[0];
      if(file){
        const reader = new FileReader();
        reader.onload = (evt) => {
          newAvatarUrl = evt.target.result;
          if($('#previewEditAvatar')) $('#previewEditAvatar').src = newAvatarUrl;
        };
        reader.readAsDataURL(file);
      }
    });

    $('#editCoverFile')?.addEventListener('change', (e)=>{
      const file = e.target.files[0];
      if(file){
        const reader = new FileReader();
        reader.onload = (evt) => {
          newCoverUrl = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const currentUser = store.get('user') || 'itz_sam';
      const current = getStoredProfile(currentUser);

      const updated = {
        name: $('#editNameInput')?.value.trim() || current.name,
        username: $('#editUsernameInput')?.value.trim() || current.username,
        bio: $('#editBioInput')?.value.trim() || current.bio,
        category: $('#editCategorySelect')?.value || current.category,
        anthem: $('#editAnthemSelect')?.value || current.anthem,
        avatar: newAvatarUrl || current.avatar,
        cover: newCoverUrl || current.cover,
        anthemSrc: current.anthemSrc,
        followers: current.followers || '0',
        following: current.following || '0'
      };

      store.setJson('user_profile_' + currentUser, updated);
      store.setJson('user_profile', updated);
      store.set('user', updated.username);
      store.set('chat_user', updated.username);

      // Update registered users registry
      const reg = getRegisteredUsers();
      reg[updated.username] = Object.assign(reg[updated.username] || {}, updated);
      store.setJson('registered_users', reg);

      modal.classList.add('hidden');
      renderProfile();
      renderFeed();
      renderRightPanel();
      renderStories();
      toast(`🚀 Profile & Avatars for @${updated.username} Updated!`);
    });
  }

  function renderSavedHistory(){
    const savedEl=$('#savedGrid'), histEl=$('#historyGrid');
    if(savedEl){ const ids=store.json('saved',[1,3]); const posts=D.posts.filter(p=>ids.includes(p.id)); savedEl.innerHTML=(posts.length?posts:D.posts.slice(0,3)).map(p=>`<a class="grid-card" data-info="Saved" href="home.html#post-${p.id}"><img src="${p.img}"></a>`).join(''); }
    if(histEl){ histEl.innerHTML=D.posts.slice().reverse().map(p=>`<a class="grid-card" data-info="Viewed" href="home.html#post-${p.id}"><img src="${p.img}"></a>`).join(''); }
  }

  /* File Upload & Create Post Integration */
  let uploadedMediaUrl = null;
  let uploadedFileType = null;

  function initCreatePost(){
    const form=$('#createPostForm'); if(!form) return;
    const myProf = getStoredProfile();
    const creatorAvatar = $('#create .user-mini .avatar') || $('#creatorUserAvatar');
    if(creatorAvatar) creatorAvatar.src = myProf.avatar;

    const fileTrigger = $('#uploadFileTrigger');
    const fileInput = $('#mediaFileInput');
    const previewContainer = $('#mediaPreviewContainer');
    const previewImg = $('#mediaPreviewImg');
    const previewVideo = $('#mediaPreviewVideo');
    const removeMediaBtn = $('#removeMediaBtn');
    const aiCaptionBtn = $('#aiCaptionBtn');
    const submitBtn = $('#createSubmitBtn');

    let currentActiveTab = 'post'; // 'post' | 'reel' | 'story'

    // Tab Switching Buttons
    $$('.create-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.create-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentActiveTab = btn.dataset.tab;

        const postPanel = $('#postEditOptions');
        const reelPanel = $('#reelEditOptions');
        const storyPanel = $('#storyEditOptions');

        if(postPanel) postPanel.classList.toggle('hidden', currentActiveTab !== 'post');
        if(reelPanel) reelPanel.classList.toggle('hidden', currentActiveTab !== 'reel');
        if(storyPanel) storyPanel.classList.toggle('hidden', currentActiveTab !== 'story');

        if(submitBtn){
          if(currentActiveTab === 'post') submitBtn.textContent = 'Publish Feed Post 🚀';
          else if(currentActiveTab === 'reel') submitBtn.textContent = 'Publish HD Reel 🎬';
          else if(currentActiveTab === 'story') submitBtn.textContent = 'Publish Story 📖';
        }

        toast(currentActiveTab === 'post' ? '📸 Post mode active' : currentActiveTab === 'reel' ? '🎬 Reel mode active' : '📖 Story mode active');
      });
    });

    if(fileTrigger && fileInput){
      fileTrigger.addEventListener('click', ()=> fileInput.click());
    }

    if(fileInput){
      fileInput.addEventListener('change', (e)=>{
        const file = e.target.files[0];
        if(!file) return;

        uploadedFileType = file.type;
        const reader = new FileReader();
        reader.onload = (evt) => {
          uploadedMediaUrl = evt.target.result;
          const isVid = file.type.startsWith('video/');

          if(isVid){
            if(previewImg) previewImg.classList.add('hidden');
            if(previewVideo){
              previewVideo.src = uploadedMediaUrl;
              previewVideo.classList.remove('hidden');
            }
          } else {
            if(previewVideo) previewVideo.classList.add('hidden');
            if(previewImg){
              previewImg.src = uploadedMediaUrl;
              previewImg.classList.remove('hidden');
            }
          }
          if(previewContainer) previewContainer.classList.remove('hidden');
          toast(isVid ? '🎬 Video media attached' : '📷 Photo media attached');
        };
        reader.readAsDataURL(file);
      });
    }

    if(removeMediaBtn){
      removeMediaBtn.addEventListener('click', ()=>{
        uploadedMediaUrl = null;
        uploadedFileType = null;
        if(previewContainer) previewContainer.classList.add('hidden');
        if(previewImg) previewImg.classList.add('hidden');
        if(previewVideo) previewVideo.classList.add('hidden');
        if(fileInput) fileInput.value = '';
      });
    }

    if(aiCaptionBtn){
      const captions = [
        "✨ Tamil BGM Vibe • BoundUp Moments 🧡 #BoundUp #VibeCheck",
        "🔥 Living the best aesthetic life on BoundUp! 🚀",
        "🎧 Mood: Repeat mode on. What's your favorite song today?",
        "🌟 Creating memories, one video at a time. #BoundUpReels"
      ];
      aiCaptionBtn.addEventListener('click', ()=>{
        const randomCap = captions[Math.floor(Math.random() * captions.length)];
        const captionArea = $('#newCaption');
        if(captionArea) captionArea.value = randomCap;
        toast('AI caption generated!');
      });
    }

    form.addEventListener('submit', e=>{
      e.preventDefault();
      const text=$('#newCaption').value.trim();

      const trackMap = {
        love1: '💕 Kadhale Kadhale • Flute Romance',
        love2: '💕 Nira Nira • Acoustic Sunset',
        love3: '💕 Kannazhaga • Soft Violin',
        love4: '💕 Anbae Anbae • Acoustic Cut',
        love5: '💕 Unakkaga • Piano Romance',
        mass: '🔥 Tamil Mass BGM Drop',
        chill: '🎧 Chill Lo-Fi Beat',
        original: '🎙️ Original Video Sound'
      };

      if(currentActiveTab === 'story'){
        // 📖 STORY PUBLISH
        const storyBg = $('#storyBgSelect')?.value || 'linear-gradient(135deg, #ff6b00, #7c2cff)';
        const storyMusicKey = $('#storyMusicSelect')?.value || 'love1';

        const newStory = {
          id: 'custom_story_' + Date.now(),
          isCustom: true,
          name: 'Your Story',
          username: 'itz_sam',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          storyImg: uploadedMediaUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
          caption: text || 'Live Story 🌟',
          audioTrack: trackMap[storyMusicKey] || 'Romantic Flute BGM',
          bg: storyBg
        };

        const customStories = store.json('custom_stories', []);
        customStories.unshift(newStory);
        store.setJson('custom_stories', customStories);

        renderStories();
        if(window.BoundUpSound) window.BoundUpSound.playMessageSent();
        toast('📖 New Story Published to Top Stories Bar!');

      } else if(currentActiveTab === 'reel'){
        // 🎬 REEL PUBLISH
        const trackKey = $('#videoAudioTrackSelect')?.value || 'mass';
        const speed = $('#reelSpeedSelect')?.value || '1';

        const newReel = {
          id: Date.now(),
          user: 1,
          author: 'itz_sam',
          title: text || 'New HD Reel 🔥',
          img: uploadedMediaUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
          isVideo: true,
          videoUrl: uploadedMediaUrl || '',
          audioTrack: trackMap[trackKey] || 'Tamil Mass BGM',
          speed: speed,
          caption: text || 'New HD Reel 🔥 #BoundUp',
          likes: 1,
          comments: 0
        };

        const customPosts = store.json('custom_posts', []);
        customPosts.unshift(newReel);
        store.setJson('custom_posts', customPosts);

        renderFeed();
        renderReels();
        if(window.BoundUpSound) window.BoundUpSound.playMessageSent();
        toast('🎬 HD Reel Published Successfully!');

      } else {
        // 📸 FEED POST PUBLISH
        if(!text && !uploadedMediaUrl) return toast('Write a caption or attach media first');
        const location = $('#postLocationInput')?.value || '';
        const tags = $('#postTagInput')?.value || '';
        const isVideo = uploadedFileType && uploadedFileType.startsWith('video/');

        const newPost = {
          id: Date.now(),
          user: 1,
          img: isVideo ? 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80' : (uploadedMediaUrl || 'assets/post-1.svg'),
          isVideo: isVideo,
          videoUrl: isVideo ? uploadedMediaUrl : '',
          caption: (text || 'New BoundUp post') + (location ? ` • 📍 ${location}` : '') + (tags ? ` • 🏷️ ${tags}` : ''),
          likes: 1,
          comments: 0
        };

        const customPosts = store.json('custom_posts', []);
        customPosts.unshift(newPost);
        store.setJson('custom_posts', customPosts);

        renderFeed();
        if(window.BoundUpSound) window.BoundUpSound.playMessageSent();
        toast('📸 Post Published to Feed!');
      }

      // Reset Form State
      $('#newCaption').value = '';
      if($('#postLocationInput')) $('#postLocationInput').value = '';
      if($('#postTagInput')) $('#postTagInput').value = '';
      uploadedMediaUrl = null;
      uploadedFileType = null;
      if(previewContainer) previewContainer.classList.add('hidden');
      if(fileInput) fileInput.value = '';
    });
  }

  /* Interactive Upload Reel Video Modal System */
  function initReelsUploadModal(){
    const openBtn = $('#openReelModalBtn');
    const modal = $('#uploadReelModal');
    const closeBtn = $('#closeReelModalBtn');
    const dropArea = $('#reelDropArea');
    const fileInput = $('#reelFileInput');
    const videoPreview = $('#reelPreviewVideo');
    const placeholderText = $('#reelPlaceholderText');
    const titleInput = $('#reelTitleInput');
    const audioSelect = $('#reelAudioSelect');
    const submitBtn = $('#submitReelBtn');

    if(!openBtn || !modal) return;

    openBtn.addEventListener('click', ()=> modal.classList.remove('hidden'));
    if(closeBtn) closeBtn.addEventListener('click', ()=> modal.classList.add('hidden'));

    if(dropArea && fileInput){
      dropArea.addEventListener('click', ()=> fileInput.click());
      fileInput.addEventListener('change', (e)=>{
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const videoDataUrl = evt.target.result;
          if(videoPreview){
            videoPreview.src = videoDataUrl;
            videoPreview.classList.remove('hidden');
          }
          if(placeholderText) placeholderText.classList.add('hidden');
          toast('Video ready for Reel!');
        };
        reader.readAsDataURL(file);
      });
    }

    if(submitBtn){
      submitBtn.addEventListener('click', ()=>{
        const title = titleInput ? titleInput.value.trim() : '';
        const videoSrc = videoPreview && videoPreview.src ? videoPreview.src : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
        const trackKey = audioSelect ? audioSelect.value : 'mass';
        const trackNameMap = {
          love1: '💕 Kadhale Kadhale • Tamil Flute Melody',
          love2: '💕 Nira Nira • Acoustic Cut',
          love3: '💕 Kannazhaga • Violin Romance',
          love4: '💕 Anbae Anbae • Acoustic Sunset',
          love5: '💕 Unakkaga • Piano Romance',
          mass: '🔥 Tamil Mass BGM Drop',
          chill: '🎧 Chill Synthwave Beat',
          gaming: '🎮 Gamer Bass'
        };

        const newReel = {
          id: Date.now(),
          img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
          videoUrl: videoSrc,
          title: title || 'New Reel Drop 🔥',
          author: 'itz_sam',
          audioTrack: trackNameMap[trackKey] || 'Original Audio',
          views: '1'
        };

        const customReels = store.json('custom_reels', []);
        customReels.unshift(newReel);
        store.setJson('custom_reels', customReels);

        renderReels();

        if(window.BoundUpSound) window.BoundUpSound.playMessageSent();
        modal.classList.add('hidden');
        if(titleInput) titleInput.value = '';
        if(videoPreview) { videoPreview.src = ''; videoPreview.classList.add('hidden'); }
        if(placeholderText) placeholderText.classList.remove('hidden');

        toast('🚀 Reel Video Published!');
      });
    }
  }

  /* WebRTC Video Call Controller */
  let localStream = null;

  function initWebRTCCalls(){
    const startCallBtn = $('#startCallBtn');
    const toggleMuteBtn = $('#toggleMuteBtn');
    const toggleCamBtn = $('#toggleCamBtn');
    const endCallBtn = $('#endCallBtn');
    const localVideo = $('#localVideo');
    const statusText = $('#callStatusText');

    if(!startCallBtn || !localVideo) return;

    startCallBtn.addEventListener('click', async ()=>{
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        if(statusText) statusText.textContent = "Status: HD Video Call Connected Live!";
        toast("WebRTC Camera Connected!");
      } catch(err) {
        if(statusText) statusText.textContent = "Status: Demo Camera Simulation Connected";
        toast("Camera simulation connected");
      }
    });

    if(toggleMuteBtn){
      toggleMuteBtn.addEventListener('click', ()=>{
        if(localStream){
          const audioTrack = localStream.getAudioTracks()[0];
          if(audioTrack){
            audioTrack.enabled = !audioTrack.enabled;
            toggleMuteBtn.textContent = audioTrack.enabled ? "🎙 Mute Mic" : "🎙 Unmute Mic";
            toast(audioTrack.enabled ? "Microphone Unmuted" : "Microphone Muted");
          }
        } else {
          toast("Toggle Mic (Call active)");
        }
      });
    }

    if(toggleCamBtn){
      toggleCamBtn.addEventListener('click', ()=>{
        if(localStream){
          const videoTrack = localStream.getVideoTracks()[0];
          if(videoTrack){
            videoTrack.enabled = !videoTrack.enabled;
            toggleCamBtn.textContent = videoTrack.enabled ? "📹 Toggle Cam" : "📹 Enable Cam";
            toast(videoTrack.enabled ? "Camera Enabled" : "Camera Muted");
          }
        } else {
          toast("Toggle Camera (Call active)");
        }
      });
    }

    if(endCallBtn){
      endCallBtn.addEventListener('click', ()=>{
        if(localStream){
          localStream.getTracks().forEach(track => track.stop());
          localStream = null;
          localVideo.srcObject = null;
        }
        if(statusText) statusText.textContent = "Status: Call Ended";
        toast("Call ended");
      });
    }
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const safeExec = (fn) => { try { if (typeof fn === 'function') fn(); } catch(e) {} };
    safeExec(initSplash);
    safeExec(initTheme);
    safeExec(installChrome);
    safeExec(applyLang);
    safeExec(renderStories);
    safeExec(initStoryEvents);
    safeExec(renderFeed);
    safeExec(renderRightPanel);
    safeExec(renderExplore);
    safeExec(renderReels);
    safeExec(initChat);
    safeExec(initAuth);
    safeExec(initSettings);
    safeExec(initDownload);
    safeExec(renderProfile);
    safeExec(initEditProfileModal);
    safeExec(renderSavedHistory);
    safeExec(initCreatePost);
    safeExec(initReelsUploadModal);
    safeExec(initVideoPlayerModalEvents);
    safeExec(initPushNotifications);
    safeExec(initReelsLiveStream);
    safeExec(initWebRTCCalls);
    document.body.classList.add('ready');
  });
})();
