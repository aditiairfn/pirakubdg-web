// ================= PIRAKUBDG HD RETINA VECTOR ARCADE GAMES + CHAR SELECTOR =================
(function() {
  const CHARS = [
    { id: "dika", name: "Kang Dika", badge: "🧢", shirt: "#eab308", hair: "#0f172a", perk: "+10% Koin", mult: 1.1 },
    { id: "nisa", name: "Teh Nisa", badge: "🧕", shirt: "#ec4899", hair: "#f8fafc", perk: "Kontrol Lincah", mult: 1.05 },
    { id: "ujang", name: "Mang Ujang", badge: "🕶️", shirt: "#10b981", hair: "#334155", perk: "+50 Bonus Koin", bonus: 50, mult: 1.0 },
    { id: "yelclaw", name: "YelClaw Pro", badge: "⚡", shirt: "#38bdf8", hair: "#facc15", perk: "Jejak Neon +15%", mult: 1.15 }
  ];

  const GAMES = [
    { id: "badminton", icon: "🏸", title: "Badminton GOR Gasibu", place: "Lapangan Gasibu", reward: "s.d. 1.000 Koin", x: 0, z: -12, desc: "Duel bulu tangkis 2.5D di lapangan Gasibu! Ayunkan raket, bidik sudut, & Smash!", how: "Geser posisi pakai panah, atur slider bidik kiri/kanan, lalu tekan Servis/Drop/Drive/Smash saat kok masuk lingkaran kuning!" },
    { id: "angkot", icon: "🚐", title: "Angkot Ngebut Surapati", place: "Jl. Surapati – Pasupati", reward: "s.d. 1.100 Koin", x: -18, z: -26, desc: "Setir angkot Cicaheum–Ledeng di jalan rindang Bandung, jemput warga & hindari macet!", how: "Pindah lajur kiri/kanan untuk menjemput warga melambai (+koin) dan hindari barikade macet oranye selama 30 detik." },
    { id: "fishing", icon: "🎣", title: "Mancing Kolam Taman Lansia", place: "Taman Timur Gedung Sate", reward: "s.d. 950 Koin", x: 26, z: 10, desc: "Kolam jernih berteratai! Tarik joran & jaga tensi senar untuk dapat Koi Emas.", how: "Tekan dan tahan tombol TARIK JORAN agar indikator kuning tetap berada di zona hijau sampai bar progres penuh." },
    { id: "sate", icon: "🍢", title: "Bakar Sate Gedung Sate", place: "Pelataran Gedung Sate", reward: "s.d. 900 Koin", x: 0, z: 6, desc: "Tungku arang membara! Kipasi bara & angkat tusuk sate tepat saat matang keemasan!", how: "Tekan Kipas Bara untuk menaikkan panas arang, lalu tekan Angkat & Sajikan saat tingkat matang berada di 75%–92%." }
  ];

  let selectedCharId = localStorage.getItem("piraku_game_char") || "dika";
  let selectedMode = "normal"; // "normal" | "pro"

  function getSelectedChar() {
    return CHARS.find(c => c.id === selectedCharId) || CHARS[0];
  }

  function getHighScores() {
    try { return JSON.parse(localStorage.getItem("piraku_game_hs") || "{}"); } catch (e) { return {}; }
  }
  function saveHighScore(gameId, val) {
    const hs = getHighScores();
    if (!hs[gameId] || val > hs[gameId]) {
      hs[gameId] = val;
      try { localStorage.setItem("piraku_game_hs", JSON.stringify(hs)); } catch (e) {}
    }
  }

  function rewardPlayer(baseCoins, reason, gameId) {
    const ch = getSelectedChar();
    const modeMult = selectedMode === "pro" ? 1.4 : 1.0;
    const total = Math.round(baseCoins * (ch.mult || 1) * modeMult + (ch.bonus || 0));
    saveHighScore(gameId, total);
    if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
      const balancedReward = Math.max(5, Math.min(10, Math.round(total * 0.12)));
      window.PirakuEconomy.addCoins(balancedReward, reason + " (" + ch.name + ")");
    }
    return total;
  }

  function tone(freq, dur) {
    if (typeof window.playSynthTone === "function") window.playSynthTone(freq, "triangle", dur || 0.12);
  }

  function setupHiDPI(canvas, w, h) {
    const dpr = Math.min(window.devicePixelRatio || 2, 3);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return ctx;
  }

  function gotoLocation(x, z, label) {
    const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (mesh && mesh.position) {
      mesh.position.set(x, 0.14, z);
      if (mesh.userData && mesh.userData.a && mesh.userData.a.c) {
        mesh.userData.a.c.x = x;
        mesh.userData.a.c.z = z;
      }
    }
    closeGamesModal();
    const toast = document.getElementById("piraku-coin-toast");
    if (toast) {
      toast.style.background = "#0284c7";
      toast.textContent = "📍 Menuju " + label;
      toast.style.opacity = "1";
      clearTimeout(toast._t);
      toast._t = setTimeout(() => { toast.style.opacity = "0"; }, 2200);
    }
  }

  let rafId = null;
  function stopLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function closeGamesModal() {
    stopLoop();
    const modal = document.getElementById("piraku-games-modal");
    if (modal) modal.style.display = "none";
  }

  window.openGamesHubModal = function(directId) {
    stopLoop();
    let modal = document.getElementById("piraku-games-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "piraku-games-modal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:12px;touch-action:pan-y;";
      modal.addEventListener("click", e => { if (e.target === modal) closeGamesModal(); });
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";
    if (directId) openGameLobby(directId);
    else renderHub();
  };

  function renderHub() {
    stopLoop();
    const modal = document.getElementById("piraku-games-modal");
    if (!modal) return;
    const coins = window.PirakuEconomy ? window.PirakuEconomy.getCoins() : 25;
    const ch = getSelectedChar();
    const hs = getHighScores();

    modal.innerHTML = `
      <div style="width:100%;max-width:420px;background:linear-gradient(180deg,#0f172a 0%,#131c31 100%);border:1.5px solid rgba(56,189,248,0.45);border-radius:22px;padding:16px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.8);max-height:82dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div>
            <div style="font-size:10.5px;color:#38bdf8;font-weight:800;letter-spacing:.8px;">ARCADE BANDUNG • KARAKTER & ARENA</div>
            <div style="font-size:19px;font-weight:800;">Pilih Mini-Game 🎮</div>
          </div>
          <button id="g-close" style="width:32px;height:32px;border-radius:50%;border:none;background:#1e293b;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>

        <!-- Bar Pilihan Karakter Aktif -->
        <div style="padding:10px 12px;border-radius:14px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.35);margin-bottom:12px;">
          <div style="font-size:10.5px;font-weight:800;color:#7dd3fc;margin-bottom:6px;">PILIH CHAR KAMU (AKTIF: ${ch.badge} ${ch.name.toUpperCase()})</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
            ${CHARS.map(c => `
              <button data-pick-char="${c.id}" style="padding:7px 4px;border-radius:11px;border:1.5px solid ${c.id === selectedCharId ? "#facc15" : "rgba(148,163,184,0.25)"};background:${c.id === selectedCharId ? "rgba(250,204,21,0.18)" : "#1e293b"};color:#fff;cursor:pointer;text-align:center;">
                <div style="font-size:20px;">${c.badge}</div>
                <div style="font-size:10px;font-weight:800;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.name.split(" ")[1] || c.name}</div>
                <div style="font-size:8.5px;color:#fde047;">${c.perk}</div>
              </button>
            `).join("")}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:9px;margin-bottom:14px;">
          ${GAMES.map(g => `
            <div style="padding:12px;border-radius:16px;background:rgba(30,41,59,0.85);border:1px solid rgba(148,163,184,0.22);">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:42px;height:42px;border-radius:12px;background:rgba(56,189,248,0.14);display:flex;align-items:center;justify-content:center;font-size:24px;">${g.icon}</div>
                  <div>
                    <div style="font-size:14px;font-weight:800;color:#f8fafc;">${g.title}</div>
                    <div style="font-size:11px;color:#94a3b8;">📍 ${g.place} • <span style="color:#fde047;font-weight:700;">🪙 ${g.reward}</span></div>
                  </div>
                </div>
                ${hs[g.id] ? `<span style="font-size:10px;padding:3px 7px;border-radius:999px;background:rgba(34,197,94,0.2);color:#4ade80;font-weight:800;">Rekor: ${hs[g.id]}</span>` : ""}
              </div>
              <div style="font-size:11.5px;color:#cbd5e1;line-height:1.35;margin-bottom:9px;">${g.desc}</div>
              <div style="display:flex;gap:8px;">
                <button data-lobby="${g.id}" style="flex:1;padding:8px 12px;border-radius:10px;border:none;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#fff;font-size:12px;font-weight:800;cursor:pointer;">▶ Masuk Arena</button>
                <button data-loc="${g.id}" style="padding:8px 10px;border-radius:10px;border:1px solid rgba(250,204,21,0.45);background:rgba(250,204,21,0.1);color:#fde047;font-size:11px;font-weight:700;cursor:pointer;">Lihat di peta →</button>
              </div>
            </div>
          `).join("")}
        </div>

        <button id="g-shop" style="width:100%;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#f59e0b,#eab308);color:#0f172a;font-size:12.5px;font-weight:800;cursor:pointer;">🛍️ Buka Toko Kota (🪙 ${coins.toLocaleString("id-ID")})</button>
      </div>`;

    modal.querySelector("#g-close").onclick = closeGamesModal;
    modal.querySelector("#g-shop").onclick = () => { closeGamesModal(); if (window.openEconomyModal) window.openEconomyModal("outfit"); };
    modal.querySelectorAll("[data-pick-char]").forEach(b => {
      b.onclick = () => {
        selectedCharId = b.dataset.pickChar;
        localStorage.setItem("piraku_game_char", selectedCharId);
        tone(620, 0.08);
        renderHub();
      };
    });
    modal.querySelectorAll("[data-lobby]").forEach(b => { b.onclick = () => openGameLobby(b.dataset.lobby); });
    modal.querySelectorAll("[data-loc]").forEach(b => {
      b.onclick = () => {
        const g = GAMES.find(x => x.id === b.dataset.loc);
        if (g) gotoLocation(g.x, g.z, g.place);
      };
    });
  }

  // ================= LOBBY PERSIAPAN GAME (PILIH CHAR + MODE + CARA MAIN) =================
  function openGameLobby(id) {
    stopLoop();
    const modal = document.getElementById("piraku-games-modal");
    const g = GAMES.find(x => x.id === id) || GAMES[0];
    const ch = getSelectedChar();
    const hs = getHighScores()[id] || 0;

    modal.innerHTML = `
      <div style="width:100%;max-width:400px;background:linear-gradient(180deg,#0f172a,#1e293b);border:1.5px solid #facc15;border-radius:22px;padding:18px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:11px;font-weight:800;color:#facc15;">LOBI PERTANDINGAN • ${g.place.toUpperCase()}</span>
          <button id="lb-back" style="background:#334155;border:none;color:#fff;padding:5px 10px;border-radius:8px;font-size:11px;cursor:pointer;">← Daftar Game</button>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="width:50px;height:50px;border-radius:14px;background:rgba(250,204,21,0.16);display:flex;align-items:center;justify-content:center;font-size:30px;">${g.icon}</div>
          <div>
            <div style="font-size:18px;font-weight:800;">${g.title}</div>
            <div style="font-size:11.5px;color:#4ade80;font-weight:700;">🏆 Rekor Terbaikmu: 🪙 ${hs.toLocaleString("id-ID")}</div>
          </div>
        </div>

        <div style="padding:10px;border-radius:12px;background:rgba(15,23,42,0.75);border:1px solid #334155;margin-bottom:12px;">
          <div style="font-size:11px;font-weight:800;color:#38bdf8;margin-bottom:4px;">📖 CARA MAIN</div>
          <div style="font-size:11.5px;color:#cbd5e1;line-height:1.4;">${g.how}</div>
        </div>

        <div style="font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">1. PILIH KARAKTER PEMAIN</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;">
          ${CHARS.map(c => `
            <button data-lchar="${c.id}" style="padding:8px 4px;border-radius:11px;border:1.5px solid ${c.id === selectedCharId ? "#facc15" : "#334155"};background:${c.id === selectedCharId ? "rgba(250,204,21,0.2)" : "#0f172a"};color:#fff;cursor:pointer;text-align:center;">
              <div style="font-size:20px;">${c.badge}</div>
              <div style="font-size:10px;font-weight:800;margin-top:2px;">${c.name.split(" ")[1] || c.name}</div>
              <div style="font-size:8.5px;color:#fde047;">${c.perk}</div>
            </button>
          `).join("")}
        </div>

        <div style="font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">2. TINGKAT KESULITAN</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
          <button data-lmode="normal" style="padding:9px;border-radius:11px;border:1.5px solid ${selectedMode === "normal" ? "#38bdf8" : "#334155"};background:${selectedMode === "normal" ? "rgba(56,189,248,0.18)" : "#0f172a"};color:#fff;font-size:12px;font-weight:800;cursor:pointer;">🌤️ Mode Santai (1.0x)</button>
          <button data-lmode="pro" style="padding:9px;border-radius:11px;border:1.5px solid ${selectedMode === "pro" ? "#f97316" : "#334155"};background:${selectedMode === "pro" ? "rgba(249,115,22,0.22)" : "#0f172a"};color:#fff;font-size:12px;font-weight:800;cursor:pointer;">🔥 Juara Kota (1.4x Koin)</button>
        </div>

        <button id="lb-start" style="width:100%;padding:12px;border-radius:13px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#0f172a;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(34,197,94,0.4);">▶ MULAI MAIN (${ch.badge} ${ch.name})</button>
      </div>`;

    modal.querySelector("#lb-back").onclick = renderHub;
    modal.querySelectorAll("[data-lchar]").forEach(b => {
      b.onclick = () => { selectedCharId = b.dataset.lchar; localStorage.setItem("piraku_game_char", selectedCharId); openGameLobby(id); };
    });
    modal.querySelectorAll("[data-lmode]").forEach(b => {
      b.onclick = () => { selectedMode = b.dataset.lmode; openGameLobby(id); };
    });
    modal.querySelector("#lb-start").onclick = () => {
      if (id === "badminton") playBadminton();
      else if (id === "angkot") playAngkot();
      else if (id === "fishing") playFishing();
      else if (id === "sate") playSate();
    };
  }

  function drawPlayerSprite(ctx, x, y, shirtColor, hairColor, swingProg, isBot) {
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath(); ctx.ellipse(x, y + 11, 13, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 6, y + 2, 4.5, 8); ctx.fillRect(x + 1.5, y + 2, 4.5, 8);
    ctx.fillStyle = shirtColor;
    ctx.beginPath(); ctx.roundRect(x - 9, y - 11, 18, 15, 5); ctx.fill();
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath(); ctx.arc(x, y - 17, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hairColor || "#0f172a";
    ctx.beginPath(); ctx.arc(x, y - 19, 7.5, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isBot ? "#38bdf8" : "#facc15";
    ctx.fillRect(x - 7.5, y - 19, 15, 2.5);

    ctx.save();
    ctx.translate(x + (isBot ? -10 : 10), y - 6);
    const angle = isBot ? 0.4 - swingProg * 1.1 : -0.4 + swingProg * 1.3;
    ctx.rotate(angle);
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -14); ctx.stroke();
    ctx.strokeStyle = "#facc15"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -20, 5.5, 7.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fill();
    ctx.restore();
  }

  // ================= 1. BADMINTON GOR GASIBU (2.5D PERSPECTIVE HD) =================
  function playBadminton() {
    const modal = document.getElementById("piraku-games-modal");
    const ch = getSelectedChar();
    const isPro = selectedMode === "pro";
    modal.innerHTML = `
      <div style="width:100%;max-width:400px;background:linear-gradient(180deg,#064e3b,#022c22);border:2px solid #6ee7b7;border-radius:22px;padding:12px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#a7f3d0;">🏸 GOR Gasibu • ${isPro ? "Mode Juara" : "Mode Santai"}</span>
          <button id="bm-back" style="background:rgba(0,0,0,0.45);border:none;color:#fff;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div style="background:#f8fafc;color:#0f172a;border-radius:12px;padding:6px 12px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:12.5px;margin-bottom:6px;">
          <span>${ch.badge} ${ch.name}</span>
          <span id="bm-score" style="color:#dc2626;font-size:21px;">0 : 0</span>
          <span>${isPro ? "Jawara Dago" : "Pelatih Gasibu"}</span>
        </div>
        <div id="bm-status" style="background:rgba(0,0,0,0.35);border-radius:8px;padding:5px;text-align:center;font-size:11px;margin-bottom:6px;">Tekan Servis atau pukulan saat kok masuk lingkaran kuning!</div>
        <canvas id="bm-cv" style="width:100%;height:245px;border-radius:14px;display:block;margin-bottom:8px;"></canvas>
        <div style="background:#f8fafc;color:#0f172a;padding:6px 10px;border-radius:10px;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
          <span style="font-size:11px;font-weight:700;white-space:nowrap;">Bidik Sudut:</span>
          <input id="bm-aim" type="range" min="-1" max="1" step="0.1" value="0" style="flex:1;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">
            <div></div><button id="bm-up" style="padding:9px;border-radius:9px;border:none;background:#f8fafc;font-weight:900;">↑</button><div></div>
            <button id="bm-left" style="padding:9px;border-radius:9px;border:none;background:#f8fafc;font-weight:900;">←</button>
            <button id="bm-down" style="padding:9px;border-radius:9px;border:none;background:#f8fafc;font-weight:900;">↓</button>
            <button id="bm-right" style="padding:9px;border-radius:9px;border:none;background:#f8fafc;font-weight:900;">→</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
            <button data-hit="servis" style="border-radius:9px;border:none;background:#ecfdf5;color:#064e3b;font-weight:800;font-size:12px;cursor:pointer;">Servis</button>
            <button data-hit="drop" style="border-radius:9px;border:none;background:#ecfdf5;color:#064e3b;font-weight:800;font-size:12px;cursor:pointer;">Drop</button>
            <button data-hit="drive" style="border-radius:9px;border:none;background:#ecfdf5;color:#064e3b;font-weight:800;font-size:12px;cursor:pointer;">Drive</button>
            <button data-hit="smash" style="border-radius:9px;border:none;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-weight:800;font-size:12px;cursor:pointer;">Smash 🔥</button>
          </div>
        </div>
      </div>`;

    modal.querySelector("#bm-back").onclick = () => openGameLobby("badminton");
    const cv = document.getElementById("bm-cv");
    const ctx = setupHiDPI(cv, 340, 245);
    const stEl = document.getElementById("bm-status");
    const scEl = document.getElementById("bm-score");

    let p = { x: 170, y: 198, swing: 0 }, bot = { x: 170, y: 54, swing: 0 };
    let kok = { x: 170, y: 188, vx: 0, vy: 0, z: 14, vz: 0, state: "serve_p" };
    let trail = [], sparks = [], pScore = 0, bScore = 0, aim = 0, finished = false;

    document.getElementById("bm-aim").oninput = e => { aim = parseFloat(e.target.value); };
    document.getElementById("bm-left").onclick = () => { p.x = Math.max(62, p.x - 24); };
    document.getElementById("bm-right").onclick = () => { p.x = Math.min(278, p.x + 24); };
    document.getElementById("bm-up").onclick = () => { p.y = Math.max(138, p.y - 16); };
    document.getElementById("bm-down").onclick = () => { p.y = Math.min(222, p.y + 16); };

    function spawnSparks(x, y, col) {
      for (let i = 0; i < 12; i++) sparks.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 1, col });
    }

    function hitKok(type) {
      if (finished) return;
      p.swing = 1.0;
      if (kok.state === "serve_p") {
        kok.state = "fly_to_bot";
        kok.x = p.x; kok.y = p.y - 10;
        kok.vx = aim * 2.3 + (Math.random() - 0.5) * 0.5;
        kok.vy = -3.5; kok.z = 16; kok.vz = 1.65;
        tone(520, 0.1);
        stEl.textContent = "Servis meluncur ke lapangan lawan!";
        return;
      }
      const dist = Math.hypot(kok.x - p.x, kok.y - p.y);
      if (kok.state === "fly_to_p" && dist < 56) {
        kok.state = "fly_to_bot";
        const spd = type === "smash" ? 5.7 : type === "drive" ? 4.5 : type === "drop" ? 3.1 : 3.8;
        kok.vx = aim * 3.0 + (Math.random() - 0.5) * 0.4;
        kok.vy = -spd;
        kok.z = type === "smash" ? 26 : 16;
        kok.vz = type === "drop" ? 0.55 : type === "smash" ? -0.35 : 1.3;
        spawnSparks(kok.x, kok.y - kok.z * 0.4, type === "smash" ? "#facc15" : "#38bdf8");
        tone(type === "smash" ? 760 : 580, 0.12);
        stEl.textContent = type === "smash" ? "🔥 SMASH KILAT!" : "Pukulan " + type.toUpperCase() + "!";
      }
    }
    modal.querySelectorAll("[data-hit]").forEach(b => { b.onclick = () => hitKok(b.dataset.hit); });

    function scorePoint(who) {
      if (who === "p") { pScore++; stEl.textContent = "🎉 Poin untuk " + ch.name + "!"; tone(680, 0.18); spawnSparks(kok.x, kok.y, "#4ade80"); }
      else { bScore++; stEl.textContent = "Kok jatuh di area kamu!"; tone(240, 0.18); }
      scEl.textContent = `${pScore} : ${bScore}`;
      if (pScore >= 5 || bScore >= 5) {
        finished = true; stopLoop();
        const win = pScore >= 5;
        const coin = rewardPlayer(win ? 650 : 180, win ? "Juara Badminton GOR Gasibu" : "Latihan Badminton Gasibu", "badminton");
        stEl.innerHTML = `<b>${win ? "🏆 JUARA GOR GASIBU!" : "Pertandingan Selesai!"} +🪙 ${coin} Koin</b>`;
        return;
      }
      trail = [];
      kok = { x: p.x, y: p.y - 10, vx: 0, vy: 0, z: 14, vz: 0, state: "serve_p" };
    }

    function step() {
      p.swing = Math.max(0, p.swing - 0.08);
      bot.swing = Math.max(0, bot.swing - 0.08);

      const targetX = kok.state === "fly_to_bot" ? kok.x : 170;
      bot.x += (targetX - bot.x) * (isPro ? 0.095 : 0.065);
      bot.x = Math.max(76, Math.min(264, bot.x));

      if (kok.state === "fly_to_bot" || kok.state === "fly_to_p") {
        kok.x += kok.vx; kok.y += kok.vy;
        kok.z = Math.max(0, kok.z + kok.vz);
        kok.vz -= 0.055;
        trail.push({ x: kok.x, y: kok.y - kok.z * 0.45, life: 1 });
        if (trail.length > 14) trail.shift();

        if (kok.state === "fly_to_bot" && Math.hypot(kok.x - bot.x, kok.y - bot.y) < 30) {
          bot.swing = 1.0;
          kok.state = "fly_to_p";
          kok.vx = (Math.random() - 0.5) * (isPro ? 3.8 : 3.2);
          kok.vy = (isPro ? 3.6 : 3.1) + Math.random() * 1.0;
          kok.z = 16; kok.vz = 1.45;
          tone(440, 0.09);
        } else if (kok.y < 22) scorePoint("p");
        else if (kok.y > 236) scorePoint("bot");
      } else {
        kok.x = p.x; kok.y = p.y - 10;
      }

      const bgGrad = ctx.createLinearGradient(0, 0, 0, 245);
      bgGrad.addColorStop(0, "#0f172a"); bgGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, 340, 245);

      ctx.fillStyle = "#c2410c";
      ctx.beginPath(); ctx.moveTo(46, 24); ctx.lineTo(294, 24); ctx.lineTo(328, 236); ctx.lineTo(12, 236); ctx.closePath(); ctx.fill();

      const courtGrad = ctx.createLinearGradient(0, 24, 0, 236);
      courtGrad.addColorStop(0, "#15803d"); courtGrad.addColorStop(1, "#16a34a");
      ctx.fillStyle = courtGrad;
      ctx.beginPath(); ctx.moveTo(64, 30); ctx.lineTo(276, 30); ctx.lineTo(304, 228); ctx.lineTo(36, 228); ctx.closePath(); ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(64, 30); ctx.lineTo(276, 30); ctx.lineTo(304, 228); ctx.lineTo(36, 228); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(170, 30); ctx.lineTo(170, 228); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(56, 86); ctx.lineTo(284, 86); ctx.moveTo(46, 162); ctx.lineTo(294, 162); ctx.stroke();

      drawPlayerSprite(ctx, bot.x, bot.y, isPro ? "#7c3aed" : "#2563eb", "#0f172a", bot.swing, true);

      ctx.fillStyle = "#334155"; ctx.fillRect(46, 102, 5, 24); ctx.fillRect(289, 102, 5, 24);
      ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fillRect(50, 105, 240, 16);
      ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 0.8;
      for (let nx = 56; nx < 288; nx += 10) { ctx.beginPath(); ctx.moveTo(nx, 105); ctx.lineTo(nx, 121); ctx.stroke(); }
      ctx.fillStyle = "#f8fafc"; ctx.fillRect(48, 103, 244, 3.5);

      ctx.strokeStyle = "rgba(250,204,21,0.45)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 44, 26, 0, 0, Math.PI * 2); ctx.stroke();
      drawPlayerSprite(ctx, p.x, p.y, ch.shirt, ch.hair, p.swing, false);

      trail.forEach((tr, idx) => {
        ctx.fillStyle = `rgba(250,204,21,${(idx / trail.length) * 0.45})`;
        ctx.beginPath(); ctx.arc(tr.x, tr.y, 3.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = "rgba(0,0,0,0.38)"; ctx.beginPath(); ctx.ellipse(kok.x, kok.y + 6, 5.5, 3, 0, 0, Math.PI * 2); ctx.fill();
      const ky = kok.y - kok.z * 0.45;
      ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.moveTo(kok.x - 4, ky - 5); ctx.lineTo(kok.x + 4, ky - 5); ctx.lineTo(kok.x, ky + 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(kok.x, ky + 3, 3.2, 0, Math.PI * 2); ctx.fill();

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.life -= 0.06;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = s.col; ctx.globalAlpha = s.life;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (!finished) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 2. ANGKOT NGEBUT SURAPATI =================
  function playAngkot() {
    const modal = document.getElementById("piraku-games-modal");
    const ch = getSelectedChar();
    const isPro = selectedMode === "pro";
    modal.innerHTML = `
      <div style="width:100%;max-width:390px;background:#0f172a;border:2px solid #22c55e;border-radius:22px;padding:12px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#4ade80;">🚐 ${ch.badge} ${ch.name} • Cicaheum–Ledeng</span>
          <button id="ak-back" style="background:#1e293b;border:none;color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:6px;">
          <span id="ak-score" style="color:#fde047;">Penumpang: 0 • 🪙 0</span>
          <span id="ak-time" style="color:#38bdf8;">⏱️ 30d</span>
        </div>
        <canvas id="ak-cv" style="width:100%;height:285px;border-radius:14px;display:block;margin-bottom:8px;"></canvas>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="ak-l" style="padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:15px;font-weight:900;">◀ Lajur Kiri</button>
          <button id="ak-r" style="padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:15px;font-weight:900;">Lajur Kanan ▶</button>
        </div>
      </div>`;
    modal.querySelector("#ak-back").onclick = () => openGameLobby("angkot");
    const cv = document.getElementById("ak-cv");
    const ctx = setupHiDPI(cv, 330, 285);
    const lanes = [86, 165, 244];
    let lane = 1, curX = lanes[1], objs = [], pax = 0, start = performance.now(), dash = 0, over = false;

    document.getElementById("ak-l").onclick = () => { if (lane > 0) { lane--; tone(480, 0.07); } };
    document.getElementById("ak-r").onclick = () => { if (lane < 2) { lane++; tone(520, 0.07); } };

    function step(now) {
      const rem = Math.max(0, 30 - Math.floor((now - start) / 1000));
      document.getElementById("ak-time").textContent = "⏱️ " + rem + "d";
      if (rem <= 0 && !over) {
        over = true; stopLoop();
        const coin = rewardPlayer(Math.min(800, pax * 75), "Narik Angkot Surapati (" + pax + " penumpang)", "angkot");
        document.getElementById("ak-score").textContent = `Selesai! +🪙 ${coin} Koin`;
        return;
      }

      const spd = isPro ? 5.8 : 4.4;
      dash = (dash + spd * 1.4) % 44;
      curX += (lanes[lane] - curX) * 0.24;

      if (Math.random() < (isPro ? 0.055 : 0.045)) {
        const l = Math.floor(Math.random() * 3);
        objs.push({ lane: l, y: -35, type: Math.random() < 0.62 ? "pax" : "cone" });
      }

      ctx.clearRect(0, 0, 330, 285);
      ctx.fillStyle = "#166534"; ctx.fillRect(0, 0, 42, 285); ctx.fillRect(288, 0, 42, 285);
      ctx.fillStyle = "#94a3b8"; ctx.fillRect(36, 0, 8, 285); ctx.fillRect(286, 0, 8, 285);

      ctx.fillStyle = "#1e293b"; ctx.fillRect(44, 0, 242, 285);
      ctx.strokeStyle = "#facc15"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(48, 0); ctx.lineTo(48, 285); ctx.moveTo(282, 0); ctx.lineTo(282, 285); ctx.stroke();

      ctx.strokeStyle = "rgba(248,250,252,0.7)"; ctx.lineWidth = 2.5; ctx.setLineDash([22, 22]); ctx.lineDashOffset = -dash;
      ctx.beginPath(); ctx.moveTo(125, 0); ctx.lineTo(125, 285); ctx.moveTo(205, 0); ctx.lineTo(205, 285); ctx.stroke();
      ctx.setLineDash([]);

      for (let ty = -44 + dash; ty < 310; ty += 88) {
        [18, 312].forEach(tx => {
          ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.arc(tx + 3, ty + 4, 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#15803d"; ctx.beginPath(); ctx.arc(tx, ty, 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(tx - 3, ty - 3, 9, 0, Math.PI * 2); ctx.fill();
        });
      }

      for (let i = objs.length - 1; i >= 0; i--) {
        const o = objs[i];
        o.y += spd;
        const ox = lanes[o.lane];
        if (o.type === "pax") {
          ctx.fillStyle = "rgba(250,204,21,0.25)"; ctx.beginPath(); ctx.arc(ox, o.y, 19, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.roundRect(ox - 8, o.y - 3, 16, 13, 4); ctx.fill();
          ctx.fillStyle = "#fed7aa"; ctx.beginPath(); ctx.arc(ox, o.y - 9, 6.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(ox + 10, o.y - 11, 3.5, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = "#ea580c"; ctx.beginPath(); ctx.roundRect(ox - 18, o.y - 11, 36, 22, 5); ctx.fill();
          ctx.fillStyle = "#f8fafc"; ctx.fillRect(ox - 14, o.y - 3, 28, 6);
        }

        if (Math.abs(ox - curX) < 26 && Math.abs(o.y - 232) < 30) {
          if (o.type === "pax") { pax++; tone(720, 0.1); }
          else { pax = Math.max(0, pax - 1); tone(200, 0.15); }
          document.getElementById("ak-score").textContent = `Penumpang: ${pax} • 🪙 ${pax * 75}`;
          objs.splice(i, 1);
        } else if (o.y > 315) objs.splice(i, 1);
      }

      ctx.fillStyle = "rgba(254,240,138,0.22)";
      ctx.beginPath(); ctx.moveTo(curX - 15, 204); ctx.lineTo(curX - 28, 155); ctx.lineTo(curX + 28, 155); ctx.lineTo(curX + 15, 204); ctx.closePath(); ctx.fill();

      ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.beginPath(); ctx.roundRect(curX - 19, 206, 42, 60, 8); ctx.fill();
      ctx.fillStyle = "#16a34a"; ctx.beginPath(); ctx.roundRect(curX - 21, 202, 42, 60, 8); ctx.fill();
      ctx.fillStyle = ch.shirt; ctx.fillRect(curX - 21, 226, 42, 12);
      ctx.fillStyle = "#e2e8f0"; ctx.beginPath(); ctx.roundRect(curX - 16, 220, 32, 34, 5); ctx.fill();
      ctx.fillStyle = "#0ea5e9"; ctx.beginPath(); ctx.roundRect(curX - 16, 207, 32, 11, 3); ctx.fill();
      ctx.fillStyle = "#fef08a"; ctx.fillRect(curX - 17, 202, 7, 3); ctx.fillRect(curX + 10, 202, 7, 3);

      if (!over) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 3. MANCING KOLAM TAMAN LANSIA =================
  function playFishing() {
    const modal = document.getElementById("piraku-games-modal");
    const ch = getSelectedChar();
    const isPro = selectedMode === "pro";
    modal.innerHTML = `
      <div style="width:100%;max-width:390px;background:#0f172a;border:2px solid #38bdf8;border-radius:22px;padding:12px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#38bdf8;">🎣 ${ch.badge} ${ch.name} • Taman Lansia</span>
          <button id="fs-back" style="background:#1e293b;border:none;color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div id="fs-info" style="font-size:12px;font-weight:700;color:#fde047;margin-bottom:6px;">Tahan tombol TARIK agar indikator tetap di zona hijau!</div>
        <canvas id="fs-cv" style="width:100%;height:230px;border-radius:14px;display:block;margin-bottom:8px;"></canvas>
        <button id="fs-hold" style="width:100%;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#0f172a;font-size:14px;font-weight:900;cursor:pointer;user-select:none;">🎣 TAHAN UNTUK TARIK JORAN</button>
      </div>`;
    modal.querySelector("#fs-back").onclick = () => openGameLobby("fishing");
    const cv = document.getElementById("fs-cv");
    const ctx = setupHiDPI(cv, 330, 230);
    const holdBtn = document.getElementById("fs-hold");
    let holding = false, bar = 45, progress = 35, fishX = 165, t = 0, done = false;

    holdBtn.onmousedown = holdBtn.ontouchstart = e => { e.preventDefault(); holding = true; };
    window.addEventListener("mouseup", () => { holding = false; });
    window.addEventListener("touchend", () => { holding = false; });

    function step() {
      t += 0.06;
      const pullForce = isPro ? 1.85 : 1.55;
      bar += holding ? pullForce : -(isPro ? 1.5 : 1.25);
      bar = Math.max(0, Math.min(100, bar));
      const inZone = bar >= 32 && bar <= 70;
      progress += inZone ? 0.46 : -0.2;
      fishX = 165 + Math.sin(t * 2.2) * 78;

      const waterGrad = ctx.createRadialGradient(165, 95, 15, 165, 115, 190);
      waterGrad.addColorStop(0, "#0284c7"); waterGrad.addColorStop(1, "#0c4a6e");
      ctx.fillStyle = waterGrad; ctx.fillRect(0, 0, 330, 230);

      [[52, 46, 20], [278, 54, 22], [66, 134, 17]].forEach(([lx, ly, lr]) => {
        ctx.fillStyle = "#15803d"; ctx.beginPath(); ctx.arc(lx, ly, lr, 0.2, Math.PI * 1.9); ctx.lineTo(lx, ly); ctx.fill();
        ctx.fillStyle = "#f472b6"; ctx.beginPath(); ctx.arc(lx + 4, ly - 3, 5, 0, Math.PI * 2); ctx.fill();
      });

      ctx.strokeStyle = "rgba(186,230,253,0.4)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(fishX, 102, 26 + Math.sin(t * 4) * 7, 11, 0, 0, Math.PI * 2); ctx.stroke();

      const tailWag = Math.sin(t * 10) * 6;
      ctx.fillStyle = "#f97316";
      ctx.beginPath(); ctx.moveTo(fishX - 18, 102); ctx.lineTo(fishX - 30, 94 + tailWag); ctx.lineTo(fishX - 30, 110 + tailWag); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(fishX, 102, 20, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.arc(fishX - 3, 101, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(fishX + 9, 101, 4.5, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(165, 0); ctx.quadraticCurveTo((165 + fishX) / 2, 55, fishX + 14, 96); ctx.stroke();
      ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(fishX + 14, 94, 4.5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(fishX + 14, 94, 4.5, 0, Math.PI); ctx.fill();

      ctx.fillStyle = "rgba(15,23,42,0.85)"; ctx.beginPath(); ctx.roundRect(22, 168, 286, 20, 10); ctx.fill();
      ctx.fillStyle = "#22c55e"; ctx.fillRect(22 + 286 * 0.32, 168, 286 * 0.38, 20);
      ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.roundRect(22 + (bar / 100) * 276, 165, 10, 26, 4); ctx.fill();

      ctx.fillStyle = "rgba(15,23,42,0.85)"; ctx.beginPath(); ctx.roundRect(22, 198, 286, 11, 6); ctx.fill();
      ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.roundRect(22, 198, 286 * Math.max(0, Math.min(1, progress / 100)), 11, 6); ctx.fill();

      if (progress >= 100 && !done) {
        done = true; stopLoop();
        const coin = rewardPlayer(450, "Dapat Koi Emas Taman Lansia", "fishing");
        document.getElementById("fs-info").textContent = `🎉 Dapat Koi Emas Gedung Sate! +🪙 ${coin} Koin`;
        return;
      }
      if (!done) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 4. BAKAR SATE GEDUNG SATE =================
  function playSate() {
    const modal = document.getElementById("piraku-games-modal");
    const ch = getSelectedChar();
    const isPro = selectedMode === "pro";
    modal.innerHTML = `
      <div style="width:100%;max-width:390px;background:#0f172a;border:2px solid #f59e0b;border-radius:22px;padding:12px;color:#fff;text-align:center;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#f59e0b;">🍢 ${ch.badge} ${ch.name} • Bakar Sate</span>
          <button id="st-back" style="background:#1e293b;border:none;color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div id="st-msg" style="font-size:11.5px;color:#cbd5e1;margin-bottom:6px;">Kipasi bara api lalu angkat sate tepat saat matang <b>75%–92%</b>!</div>
        <canvas id="st-cv" style="width:100%;height:205px;border-radius:14px;display:block;margin-bottom:10px;"></canvas>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="st-fan" style="padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#ea580c,#dc2626);color:#fff;font-weight:800;cursor:pointer;">🪭 Kipas Bara</button>
          <button id="st-serve" style="padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#0f172a;font-weight:800;cursor:pointer;">🍽️ Angkat & Sajikan!</button>
        </div>
      </div>`;
    modal.querySelector("#st-back").onclick = () => openGameLobby("sate");
    const cv = document.getElementById("st-cv");
    const ctx = setupHiDPI(cv, 330, 205);
    let cook = 0, heat = 0.35, served = 0, over = false, smokes = [], t = 0;

    document.getElementById("st-fan").onclick = () => {
      heat = Math.min(1.5, heat + (isPro ? 0.45 : 0.38));
      tone(460, 0.08);
      for (let i = 0; i < 6; i++) smokes.push({ x: 75 + Math.random() * 180, y: 120, vy: -1.4 - Math.random(), r: 6 + Math.random() * 6, a: 0.55 });
    };

    document.getElementById("st-serve").onclick = () => {
      if (cook >= 75 && cook <= 92) {
        served++; tone(740, 0.14);
        document.getElementById("st-msg").innerHTML = `<b style="color:#4ade80;">Matang Sempurna! (${served}/3 porsi)</b>`;
        if (served >= 3) {
          over = true; stopLoop();
          const coin = rewardPlayer(500, "Sate Matang Sempurna Gedung Sate", "sate");
          document.getElementById("st-msg").innerHTML = `<b style="color:#fde047;">🎉 3 Porsi Sate Ludes! +🪙 ${coin} Koin</b>`;
        }
      } else {
        tone(210, 0.16);
        document.getElementById("st-msg").innerHTML = `<b style="color:#f87171;">${cook < 75 ? "Masih mentah!" : "Kegosongan!"} Coba tusukan baru!</b>`;
      }
      cook = 0; heat = 0.35;
    };

    function step() {
      t += 0.08;
      cook = Math.min(100, cook + heat * (isPro ? 1.25 : 1.0));
      heat = Math.max(0.25, heat * 0.985);
      if (Math.random() < 0.25) smokes.push({ x: 80 + Math.random() * 170, y: 112, vy: -1.1, r: 5, a: 0.4 });

      ctx.clearRect(0, 0, 330, 205);
      ctx.fillStyle = "#1e293b"; ctx.fillRect(0, 0, 330, 205);

      ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.roundRect(45, 110, 240, 48, 8); ctx.fill();
      for (let bx = 62; bx < 268; bx += 18) {
        const glow = 0.55 + Math.sin(t + bx) * 0.35 * heat;
        ctx.fillStyle = `rgba(249,115,22,${Math.min(1, glow)})`;
        ctx.beginPath(); ctx.arc(bx, 128, 7, 0, Math.PI * 2); ctx.fill();
      }

      const meatCol = cook < 45 ? "#f87171" : cook < 75 ? "#d97706" : cook <= 92 ? "#92400e" : "#1c1917";
      for (let s = 0; s < 5; s++) {
        const sx = 82 + s * 41;
        ctx.strokeStyle = "#fde68a"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(sx, 55); ctx.lineTo(sx, 148); ctx.stroke();
        [72, 87, 102].forEach(sy => {
          ctx.fillStyle = meatCol;
          ctx.beginPath(); ctx.roundRect(sx - 9, sy - 6, 18, 12, 4); ctx.fill();
        });
      }

      for (let i = smokes.length - 1; i >= 0; i--) {
        const sm = smokes[i]; sm.y += sm.vy; sm.r += 0.15; sm.a -= 0.012;
        if (sm.a <= 0) { smokes.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(226,232,240,${sm.a})`;
        ctx.beginPath(); ctx.arc(sm.x, sm.y, sm.r, 0, Math.PI * 2); ctx.fill();
      }

      ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.roundRect(35, 172, 260, 18, 9); ctx.fill();
      ctx.fillStyle = "rgba(34,197,94,0.5)"; ctx.fillRect(35 + 260 * 0.75, 172, 260 * 0.17, 18);
      ctx.fillStyle = cook > 92 ? "#ef4444" : "#f59e0b";
      ctx.beginPath(); ctx.roundRect(35, 172, 260 * (cook / 100), 18, 9); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Matang: " + Math.round(cook) + "% (Target 75–92%)", 165, 185);

      if (!over) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }
})();
