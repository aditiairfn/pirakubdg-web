(function () {
  if (typeof window === 'undefined') return;

  const DISMISS_KEY = 'piraku_pwa_dismiss_ts';
  const ANNOUNCE_KEY = 'piraku_pwa_announce_v1_seen';
  const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
  let deferredPrompt = null;
  let bannerTimer = null;
  let announcementShownThisSession = false;

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    }, { once: true });
  }

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {}
  }

  function isDismissedRecently() {
    const ts = parseInt(storageGet(DISMISS_KEY) || '0', 10);
    return ts > 0 && Date.now() - ts < DISMISS_MS;
  }

  function markDismissed() {
    storageSet(DISMISS_KEY, String(Date.now()));
  }

  function hasSeenAnnouncement() {
    return storageGet(ANNOUNCE_KEY) === '1';
  }

  function isIOS() {
    const ua = navigator.userAgent || '';
    const isAppleMobile = /iphone|ipad|ipod/i.test(ua);
    const isIpadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isAppleMobile || isIpadOS;
  }

  function isInAppBrowser() {
    return /Instagram|FBAN|FBAV|musical_ly|BytedanceWebview|Line\//i.test(navigator.userAgent || '');
  }

  function removeBanner() {
    const el = document.getElementById('piraku-pwa-install-pill');
    if (el) el.remove();
  }

  function removeAnnouncement() {
    const el = document.getElementById('piraku-pwa-announce-card');
    if (el) el.remove();
  }

  function hideInstallMenuButtonIfStandalone() {
    if (!isStandalone()) return;
    const btn = document.getElementById('btn-menu-pwa-install');
    if (btn) btn.style.display = 'none';
  }

  async function runNativeInstallPrompt() {
    if (!deferredPrompt) return false;
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (choice && choice.outcome === 'accepted') {
        removeBanner();
        removeAnnouncement();
        const modal = document.getElementById('piraku-pwa-guide-modal');
        if (modal) modal.remove();
        return true;
      }
    } catch (e) {}
    return false;
  }

  function openPirakuInstallGuide(defaultTab) {
    const existing = document.getElementById('piraku-pwa-guide-modal');
    if (existing) existing.remove();

    const inApp = isInAppBrowser();
    const onIos = isIOS();
    let activeTab = defaultTab === 'ios' || defaultTab === 'android'
      ? defaultTab
      : (onIos ? 'ios' : 'android');

    const inAppHtml = inApp
      ? '<div style="background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.38);border-radius:12px;padding:10px 12px;margin-bottom:12px;font-size:11.5px;color:#fde047;line-height:1.45;">' +
          '<b>⚠️ Buka di ' + (onIos ? 'Safari' : 'Chrome') + ' dulu:</b> Kamu membuka game dari browser dalam aplikasi (Instagram/TikTok/dll). Ketuk menu <b>⋯</b> lalu pilih <b>Open in ' + (onIos ? 'Safari' : 'Browser / Chrome') + '</b> agar opsi Add to Home Screen muncul.' +
        '</div>'
      : '';

    const iosContentHtml =
      '<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;color:#e2e8f0;line-height:1.5;">' +
        '<div><b>1.</b> Pastikan kamu membuka game ini menggunakan browser <b>Safari</b>.</div>' +
        '<div><b>2.</b> Ketuk ikon <b>Share</b> <span style="display:inline-block;padding:1px 7px;border-radius:6px;background:rgba(56,189,248,0.2);color:#38bdf8;font-weight:800;">⬆️</span> di bar bawah/atas Safari.</div>' +
        '<div><b>3.</b> Scroll ke bawah, lalu pilih <b>Add to Home Screen</b> (<b>Tambah ke Layar Utama</b>).</div>' +
        '<div><b>4.</b> Ketuk <b>Add</b> (<b>Tambah</b>) di pojok kanan atas — ikon game langsung muncul di Home Screen!</div>' +
      '</div>';

    const nativeAndroidBtnHtml = deferredPrompt
      ? '<button type="button" id="piraku-pwa-guide-native-btn" style="margin-bottom:12px;width:100%;padding:10px 12px;border:none;border-radius:12px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-size:12.5px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(34,197,94,0.3);">⚡ Install Otomatis Sekarang</button>'
      : '';

    const androidContentHtml =
      nativeAndroidBtnHtml +
      '<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;color:#e2e8f0;line-height:1.5;">' +
        '<div><b>1.</b> Buka game ini menggunakan browser <b>Google Chrome</b>.</div>' +
        '<div><b>2.</b> Ketuk ikon menu <b>⋮</b> di pojok kanan atas Chrome.</div>' +
        '<div><b>3.</b> Pilih <b>Install app</b> atau <b>Add to Home screen</b> (<b>Tambahkan ke layar utama</b>).</div>' +
        '<div><b>4.</b> Ketuk <b>Install / Add</b> untuk menyelesaikan pemasangan.</div>' +
      '</div>';

    const overlay = document.createElement('div');
    overlay.id = 'piraku-pwa-guide-modal';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:99995;background:rgba(4,12,11,0.74);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;';

    overlay.innerHTML =
      '<div style="width:100%;max-width:380px;max-height:90vh;overflow-y:auto;background:linear-gradient(160deg,rgba(14,47,42,0.97),rgba(7,22,20,0.99));border:1px solid rgba(255,255,255,0.16);border-radius:20px;padding:18px;box-shadow:0 20px 50px rgba(0,0,0,0.55);color:#fff;font-family:inherit;">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">' +
          '<img src="assets/icon-192.png" alt="Piraku BDG" style="width:46px;height:46px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);object-fit:cover;">' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:15px;font-weight:800;color:#fff;">Cara Pasang ke Home Screen</div>' +
            '<div style="font-size:11.5px;color:#94a3b8;">Main layar penuh tanpa bar browser</div>' +
          '</div>' +
          '<button type="button" id="piraku-pwa-guide-close" aria-label="Tutup" style="width:28px;height:28px;border-radius:999px;border:none;background:rgba(255,255,255,0.1);color:#cbd5e1;font-size:14px;cursor:pointer;">✕</button>' +
        '</div>' +
        inAppHtml +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;background:rgba(0,0,0,0.28);padding:4px;border-radius:12px;margin-bottom:14px;">' +
          '<button type="button" id="piraku-pwa-tab-ios" style="padding:8px 10px;border:none;border-radius:9px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">🍎 iOS (Safari)</button>' +
          '<button type="button" id="piraku-pwa-tab-android" style="padding:8px 10px;border:none;border-radius:9px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">🤖 Android (Chrome)</button>' +
        '</div>' +
        '<div id="piraku-pwa-tab-body"></div>' +
        '<button type="button" id="piraku-pwa-guide-ok" style="margin-top:16px;width:100%;padding:10px 14px;border:none;border-radius:12px;background:linear-gradient(135deg,#facc15,#eab308);color:#0f172a;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;">Siap, Mengerti!</button>' +
      '</div>';

    document.body.appendChild(overlay);

    const tabIos = document.getElementById('piraku-pwa-tab-ios');
    const tabAndroid = document.getElementById('piraku-pwa-tab-android');
    const tabBody = document.getElementById('piraku-pwa-tab-body');

    function renderTab(tab) {
      activeTab = tab;
      const isIosTab = tab === 'ios';
      tabIos.style.background = isIosTab ? 'rgba(250,204,21,0.2)' : 'transparent';
      tabIos.style.color = isIosTab ? '#fde047' : '#94a3b8';
      tabAndroid.style.background = !isIosTab ? 'rgba(250,204,21,0.2)' : 'transparent';
      tabAndroid.style.color = !isIosTab ? '#fde047' : '#94a3b8';
      tabBody.innerHTML = isIosTab ? iosContentHtml : androidContentHtml;

      const nativeBtn = document.getElementById('piraku-pwa-guide-native-btn');
      if (nativeBtn) {
        nativeBtn.addEventListener('click', runNativeInstallPrompt);
      }
    }

    tabIos.addEventListener('click', function () { renderTab('ios'); });
    tabAndroid.addEventListener('click', function () { renderTab('android'); });
    renderTab(activeTab);

    const closeModal = function () {
      overlay.remove();
    };
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    const btnClose = document.getElementById('piraku-pwa-guide-close');
    const btnOk = document.getElementById('piraku-pwa-guide-ok');
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnOk) btnOk.addEventListener('click', closeModal);
  }

  async function triggerInstall() {
    if (await runNativeInstallPrompt()) return;
    openPirakuInstallGuide();
  }

  function showOneTimeAnnouncement() {
    if (isStandalone() || hasSeenAnnouncement()) return false;
    if (document.getElementById('piraku-pwa-announce-card')) return true;

    storageSet(ANNOUNCE_KEY, '1');
    announcementShownThisSession = true;
    removeBanner();

    const card = document.createElement('div');
    card.id = 'piraku-pwa-announce-card';
    card.style.cssText =
      'position:fixed;top:calc(env(safe-area-inset-top, 0px) + 74px);left:50%;transform:translateX(-50%);z-index:9500;' +
      'width:calc(100vw - 28px);max-width:340px;padding:12px 14px;border-radius:18px;' +
      'background:linear-gradient(155deg,rgba(14,47,42,0.95),rgba(9,31,28,0.97));' +
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
      'border:1px solid rgba(250,204,21,0.5);box-shadow:0 14px 34px rgba(0,0,0,0.48);' +
      'color:#fff;font-family:inherit;';

    const ctaLabel = deferredPrompt ? '📲 Install Sekarang' : '📖 Lihat Cara Pasang';

    card.innerHTML =
      '<div style="display:flex;align-items:flex-start;gap:10px;">' +
        '<img src="assets/icon-192.png" alt="Piraku BDG" style="width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);object-fit:cover;flex-shrink:0;">' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:13px;font-weight:800;color:#fde047;line-height:1.3;">✨ Baru! Bisa Add to Home Screen</div>' +
          '<div style="font-size:11.5px;color:#e2e8f0;line-height:1.4;margin-top:3px;">Sekarang Piraku Bandung bisa dipasang di Home Screen iOS &amp; Android biar main layar penuh &amp; makin cepat!</div>' +
        '</div>' +
        '<button type="button" id="piraku-pwa-announce-x" aria-label="Tutup" style="width:24px;height:24px;border-radius:999px;border:none;background:rgba(255,255,255,0.12);color:#cbd5e1;font-size:11px;cursor:pointer;flex-shrink:0;">✕</button>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-top:10px;">' +
        '<button type="button" id="piraku-pwa-announce-cta" style="flex:1;padding:8px 12px;border:none;border-radius:10px;background:linear-gradient(135deg,#facc15,#eab308);color:#0f172a;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">' + ctaLabel + '</button>' +
        '<button type="button" id="piraku-pwa-announce-later" style="padding:8px 12px;border:1px solid rgba(255,255,255,0.18);border-radius:10px;background:rgba(255,255,255,0.06);color:#cbd5e1;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;">Nanti</button>' +
      '</div>';

    document.body.appendChild(card);

    const dismissCard = function () {
      removeAnnouncement();
    };
    document.getElementById('piraku-pwa-announce-x').addEventListener('click', dismissCard);
    document.getElementById('piraku-pwa-announce-later').addEventListener('click', dismissCard);
    document.getElementById('piraku-pwa-announce-cta').addEventListener('click', function () {
      removeAnnouncement();
      triggerInstall();
    });

    return true;
  }

  function showBanner(labelText) {
    if (isStandalone() || isDismissedRecently() || announcementShownThisSession) return;
    if (document.getElementById('piraku-pwa-announce-card')) return;
    if (document.getElementById('piraku-pwa-install-pill')) return;

    const pill = document.createElement('div');
    pill.id = 'piraku-pwa-install-pill';
    pill.style.cssText =
      'position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom, 0px) + 14px);transform:translateX(-50%);z-index:9000;' +
      'display:flex;align-items:center;gap:8px;padding:6px 8px 6px 10px;border-radius:999px;' +
      'background:rgba(14,47,42,0.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
      'border:1px solid rgba(250,204,21,0.45);box-shadow:0 10px 28px rgba(0,0,0,0.4);' +
      'max-width:calc(100vw - 140px);white-space:nowrap;';

    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.textContent = labelText || '📲 Pasang Game';
    actionBtn.style.cssText =
      'border:none;background:transparent;color:#fde047;font-size:11.5px;font-weight:800;cursor:pointer;padding:2px 4px;font-family:inherit;';
    actionBtn.addEventListener('click', triggerInstall);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Tutup');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText =
      'width:20px;height:20px;border-radius:999px;border:none;background:rgba(255,255,255,0.12);color:#cbd5e1;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;';
    closeBtn.addEventListener('click', function () {
      markDismissed();
      removeBanner();
    });

    pill.appendChild(actionBtn);
    pill.appendChild(closeBtn);
    document.body.appendChild(pill);
  }

  function scheduleBanner(labelText) {
    if (bannerTimer || isStandalone() || isDismissedRecently() || announcementShownThisSession) return;
    bannerTimer = setTimeout(function () {
      showBanner(labelText);
    }, 6000);
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    const announceCta = document.getElementById('piraku-pwa-announce-cta');
    if (announceCta) {
      announceCta.textContent = '📲 Install Sekarang';
    }
    if (document.getElementById('piraku-pwa-install-pill')) return;
    if (bannerTimer) {
      clearTimeout(bannerTimer);
      bannerTimer = null;
    }
    scheduleBanner('📲 Install App');
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    removeBanner();
    removeAnnouncement();
    hideInstallMenuButtonIfStandalone();
    if (typeof window.showToast === 'function') {
      window.showToast('Piraku Bandung terpasang di Home Screen! 📲✨');
    }
  });

  window.openPirakuInstallGuide = openPirakuInstallGuide;
  window.openPirakuInstallPrompt = triggerInstall;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideInstallMenuButtonIfStandalone, { once: true });
  } else {
    hideInstallMenuButtonIfStandalone();
  }

  if (!isStandalone()) {
    window.addEventListener('load', function () {
      hideInstallMenuButtonIfStandalone();
      if (!hasSeenAnnouncement()) {
        setTimeout(function () {
          showOneTimeAnnouncement();
        }, 4500);
        return;
      }
      if (!isDismissedRecently() && (isIOS() || isInAppBrowser())) {
        scheduleBanner('📲 Add to Home Screen');
      }
    }, { once: true });
  }
})();
