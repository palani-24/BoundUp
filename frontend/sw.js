const CACHE='boundup-instagram-style-v6';
const ASSETS=['./','welcome.html','home.html','explore.html','reels.html','chat.html','profile.html','settings.html','download.html','favorites.html','history.html','about.html','css/style.css','js/data.js','js/app.js','assets/logo-icon.png','assets/logo-full.jpg','assets/logo-icon-192.png','assets/favicon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{})));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
