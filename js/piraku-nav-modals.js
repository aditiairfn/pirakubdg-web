// ================= PIRAKUBDG INFO UPDATES, OFFICIAL ACCOUNT & FLOATING CHAT =================
(function() {
  function injectFloatingChatButton() {
    if (!document.body || document.getElementById("piraku-floating-chat-btn")) return;
    const btn = document.createElement("button");
    btn.id = "piraku-floating-chat-btn";
    btn.type = "button";
    btn.title = "Buka Balai Obrolan Warga";
    btn.style.cssText = "position:fixed;bottom:186px;left:16px;padding:8px 13px;border-radius:999px;background:rgba(15,23,42,0.88);backdrop-filter:blur(10px);border:1.5px solid rgba(56,189,248,0.55);color:#f8fafc;font-size:12px;font-weight:800;display:flex;align-items:center;gap:6px;cursor:pointer;z-index:26;box-shadow:0 8px 20px rgba(0,0,0,0.4);";
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Obrolan</span>`;
    btn.onclick = () => {
      if (typeof window.openChatModal === "function") window.openChatModal();
    };
    document.body.appendChild(btn);
  }

  window.openInfoUpdatesModal = function() {
    let modal = document.getElementById("piraku-info-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "piraku-info-modal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.78);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;";
      modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";

    const updates = [
      { ver: "v2.4 • Terbaru", badge: "BARU", title: "Ekonomi Koin Piraku & Toko Kota 3D", desc: "Kumpulkan Koin Piraku dari mini-game dan tukarkan dengan Iket Sunda, Kacamata Dago, Helm Biker, Aura Emas, Megafon, atau sewa Layar LED Gasibu 3D." },
      { ver: "v2.3", badge: "FITUR", title: "Sewa Sepeda Boseh & Skuter Listrik (10 Menit)", desc: "Sewa Sepeda (1.35x speed) atau Skuter Listrik (1.65x speed) selama 10 menit lengkap dengan countdown timer di HUD." },
      { ver: "v2.2", badge: "ARCADE", title: "4 Mini-Game HD 1-Jempol (Padel Club, Angkot, Mancing, Sate)", desc: "Mainkan Padel Club Gasibu, Angkot Ngebut Surapati, Mancing Taman Lansia, & Bakar Sate Gedung Sate dengan pilihan 4 karakter ber-perk." },
      { ver: "v2.1", badge: "LIVE", title: "Event Kota Dinamis & Podium 3D Top 3 Sultan", desc: "Cuaca & event berganti otomatis tiap jam (CFD Gasibu, Hujan Sore, Festival Monju) + Podium 3D Top 3 Sultan di utara Gasibu." },
      { ver: "v2.0", badge: "KOTA", title: "Flyover Pasupati, Jalur Jalan & Minimap Radar", desc: "Akses naik ke jembatan layang Pasupati, batas wilayah Bandung Wetan, serta radar minimap interaktif." }
    ];

    modal.innerHTML = `
      <div style="width:100%;max-width:410px;background:#0f172a;border:1.5px solid rgba(56,189,248,0.45);border-radius:22px;padding:16px;color:#f8fafc;box-shadow:0 24px 55px rgba(0,0,0,0.75);max-height:82dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div>
            <div style="font-size:10.5px;color:#38bdf8;font-weight:800;letter-spacing:.7px;">CATATAN RILIS KOTA</div>
            <div style="font-size:18px;font-weight:800;">Info & Update Piraku 📢</div>
          </div>
          <button id="btn-close-info" style="width:32px;height:32px;border-radius:50%;border:none;background:#1e293b;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:9px;margin-bottom:12px;">
          ${updates.map(u => `
            <div style="padding:11px 12px;border-radius:14px;background:#1e293b;border:1px solid rgba(148,163,184,0.2);">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:11px;font-weight:800;color:#fde047;">${u.ver}</span>
                <span style="font-size:9.5px;font-weight:800;padding:2px 7px;border-radius:999px;background:rgba(56,189,248,0.18);color:#38bdf8;">${u.badge}</span>
              </div>
              <div style="font-size:13.5px;font-weight:800;color:#f8fafc;margin-bottom:3px;">${u.title}</div>
              <div style="font-size:11.5px;color:#cbd5e1;line-height:1.4;">${u.desc}</div>
            </div>
          `).join("")}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="btn-info-districts" style="padding:10px;border-radius:12px;border:none;background:#f59e0b;color:#0f172a;font-size:12px;font-weight:800;cursor:pointer;">🏙️ 30 Kecamatan</button>
          <button id="btn-info-polling" style="padding:10px;border-radius:12px;border:1px solid rgba(250,204,21,0.45);background:rgba(250,204,21,0.12);color:#fde047;font-size:12px;font-weight:800;cursor:pointer;">📊 Polling Kota</button>
        </div>
      </div>`;

    modal.querySelector("#btn-close-info").onclick = () => { modal.style.display = "none"; };
    modal.querySelector("#btn-info-districts").onclick = () => { modal.style.display = "none"; if (window.openDistrictsHubModal) window.openDistrictsHubModal(); };
    modal.querySelector("#btn-info-polling").onclick = () => {
      modal.style.display = "none";
      if (typeof window.openPollingModal === "function") window.openPollingModal();
    };
  };

  window.openAccountSocialModal = function() {
    let modal = document.getElementById("piraku-account-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "piraku-account-modal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.78);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;";
      modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";

    const citizenName = (localStorage.getItem("piraku_citizen_name") || localStorage.getItem("piraku_username") || "Warga Tamu Bandung").trim();
    const coins = window.PirakuEconomy ? window.PirakuEconomy.getCoins() : 500;
    const tier = window.PirakuEconomy ? window.PirakuEconomy.getTierObj() : { badge: "🌱", name: "Warga Baru" };

    modal.innerHTML = `
      <div style="width:100%;max-width:400px;background:linear-gradient(180deg,#0f172a,#1e293b);border:1.5px solid rgba(250,204,21,0.5);border-radius:22px;padding:18px;color:#f8fafc;box-shadow:0 24px 55px rgba(0,0,0,0.8);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div>
            <div style="font-size:10.5px;color:#facc15;font-weight:800;letter-spacing:.7px;">KOMUNITAS & SOSIAL MEDIA</div>
            <div style="font-size:18px;font-weight:800;">Akun @pirakubdg 🏙️</div>
          </div>
          <button id="btn-close-acc" style="width:32px;height:32px;border-radius:50%;border:none;background:#0f172a;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>

        <!-- Profil Warga Aktif -->
        <div style="padding:12px;border-radius:14px;background:rgba(15,23,42,0.75);border:1px solid #334155;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:11px;color:#94a3b8;">KTP Warga Aktif</div>
            <div style="font-size:14px;font-weight:800;color:#fff;">${citizenName}</div>
            <div style="font-size:11px;color:#fde047;margin-top:2px;">${tier.badge} ${tier.name} • 🪙 ${coins.toLocaleString("id-ID")}</div>
          </div>
          <button id="btn-acc-auth" style="padding:8px 12px;border-radius:10px;border:none;background:#2563eb;color:#fff;font-size:11.5px;font-weight:800;cursor:pointer;">Kelola KTP</button>
        </div>

        <div style="font-size:11.5px;color:#cbd5e1;margin-bottom:10px;line-height:1.4;">Ikuti perkembangan episode 3D tata kota Bandung, behind the scenes, dan pengumuman event warga di kanal resmi <b>@pirakubdg</b>:</div>

        <div style="display:flex;flex-direction:column;gap:9px;">
          <a href="https://www.instagram.com/pirakubdg" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:#fff;font-weight:800;box-shadow:0 8px 20px rgba(253,29,29,0.28);">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:22px;">📸</span>
              <div>
                <div style="font-size:14px;">Instagram @pirakubdg</div>
                <div style="font-size:11px;opacity:.9;font-weight:600;">Reels 3D Bandung, Update Peta & Info Warga</div>
              </div>
            </div>
            <span style="font-size:13px;">Buka ↗</span>
          </a>

          <a href="https://www.tiktok.com/@pirakubdg" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:14px;background:#090d16;border:1.5px solid #25f4ee;color:#fff;font-weight:800;box-shadow:0 8px 20px rgba(37,244,238,0.2);">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:22px;">🎵</span>
              <div>
                <div style="font-size:14px;">TikTok @pirakubdg</div>
                <div style="font-size:11px;color:#94a3b8;font-weight:600;">Video Simulasi Tata Kota & Momen Kocak Warga</div>
              </div>
            </div>
            <span style="font-size:13px;color:#25f4ee;">Buka ↗</span>
          </a>
        </div>
      </div>`;

    modal.querySelector("#btn-close-acc").onclick = () => { modal.style.display = "none"; };
    modal.querySelector("#btn-acc-auth").onclick = () => {
      modal.style.display = "none";
      if (typeof window.handleCitizenButtonClick === "function") window.handleCitizenButtonClick();
    };
  };

  setInterval(injectFloatingChatButton, 800);
})();
