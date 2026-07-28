/**
 * BoundUp Mobile App Download & PWA Installer System
 * Detects mobile browsers, shows mobile app download banner, and simulates live APK download
 */
(function(window) {
  const $ = (s, r=document) => r.querySelector(s);
  let deferredPrompt = null;

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  }

  function initMobileAppBanner() {
    if ($('.mobile-app-banner')) return;
    if (localStorage.getItem('boundup_pwa_banner_seen') === '1' || localStorage.getItem('boundup_banner_dismissed') === '1') return;

    const bannerHtml = `
      <div class="mobile-app-banner" id="mobileAppBanner">
        <div class="mobile-banner-left">
          <img src="assets/logo-icon.png" alt="BoundUp App">
          <div class="mobile-banner-text">
            <b>BoundUp Mobile App</b>
            <small>Faster reels, Tamil songs & offline support</small>
          </div>
        </div>
        <div class="mobile-banner-actions">
          <button type="button" class="mobile-install-btn" id="mobileInstallBtn">Download APK</button>
          <button type="button" class="mobile-banner-close" id="mobileCloseBtn">✕</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', bannerHtml);

    const banner = document.getElementById('mobileAppBanner');
    const installBtn = document.getElementById('mobileInstallBtn');
    const closeBtn = document.getElementById('mobileCloseBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (banner) banner.remove();
        localStorage.setItem('boundup_pwa_banner_seen', '1');
        localStorage.setItem('boundup_banner_dismissed', '1');
      });
    }

    if (installBtn) {
      installBtn.addEventListener('click', () => {
        if (banner) banner.remove();
        localStorage.setItem('boundup_pwa_banner_seen', '1');
        localStorage.setItem('boundup_banner_dismissed', '1');
        triggerApkDownloadModal();
      });
    }
  }

  function triggerApkDownloadModal() {
    let modal = document.getElementById('apkDownloadModal');
    if (!modal) {
      const modalHtml = `
        <div id="apkDownloadModal" class="apk-modal-overlay">
          <div class="apk-dialog-card">
            <img src="assets/logo-icon.png" alt="BoundUp App">
            <h2 style="margin:0;font-size:22px;font-weight:900">Downloading BoundUp Mobile...</h2>
            <p style="color:var(--muted);font-size:13px;margin:6px 0 0">Version 7.2 • Android APK (24.8 MB)</p>
            
            <div class="apk-progress-container">
              <div id="apkProgressBar" class="apk-progress-bar"></div>
            </div>
            <b id="apkProgressPct" style="font-size:15px;color:var(--brand)">0%</b>
            <p id="apkStatusText" style="font-size:12px;color:var(--muted);margin-top:4px">Connecting to server...</p>

            <div style="margin-top:18px;display:flex;gap:10px;justify-content:center">
              <button type="button" class="ghost-btn" id="cancelApkBtn">Cancel</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('apkDownloadModal');
    } else {
      modal.classList.remove('hidden');
    }

    const bar = document.getElementById('apkProgressBar');
    const pct = document.getElementById('apkProgressPct');
    const status = document.getElementById('apkStatusText');
    const cancelBtn = document.getElementById('cancelApkBtn');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (bar) bar.style.width = '100%';
        if (pct) pct.textContent = '100% Download Complete!';
        if (status) status.textContent = '📦 Package ready! Click to Install.';

        setTimeout(() => {
          if (window.boundToast) window.boundToast('🚀 BoundUp App Installed Successfully!');
          modal.classList.add('hidden');
          localStorage.setItem('boundup_pwa_banner_seen', '1');
          localStorage.setItem('boundup_pwa_installed', '1');
        }, 1200);
      } else {
        if (bar) bar.style.width = progress + '%';
        if (pct) pct.textContent = progress + '%';
        if (status) status.textContent = `Downloading package... (${Math.round((24.8 * progress) / 100)} / 24.8 MB)`;
      }
    }, 150);
  }

  // Handle native PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (localStorage.getItem('boundup_pwa_banner_seen') !== '1') {
      initMobileAppBanner();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('boundup_pwa_banner_seen') !== '1' && localStorage.getItem('boundup_banner_dismissed') !== '1') {
      setTimeout(initMobileAppBanner, 1000);
    }
  });

  window.BoundUpPWA = {
    downloadApk: triggerApkDownloadModal
  };
})(window);
