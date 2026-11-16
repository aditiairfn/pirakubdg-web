// ================= PIRAKUBDG HD ARCADE GAMES (PADEL CLUB + 1-THUMB MOBILE UX + SYNCED ECONOMY) =================
(function() {
  const CHARS = [
    { id: "dika", name: "Kang Dika", badge: "🧢", shirt: "#eab308", hair: "#0f172a", perk: "+10% Koin", mult: 1.1 },
    { id: "nisa", name: "Teh Nisa", badge: "🧕", shirt: "#ec4899", hair: "#f8fafc", perk: "Gerak Lincah", mult: 1.05 },
    { id: "ujang", name: "Mang Ujang", badge: "🕶️", shirt: "#10b981", hair: "#334155", perk: "+5 Bonus Koin", bonus: 5, mult: 1.0 },
    { id: "yelclaw", name: "YelClaw Pro", badge: "⚡", shirt: "#38bdf8", hair: "#facc15", perk: "Jejak Neon +15%", mult: 1.15 }
  ];

  // Hadiah Koin 100% sinkron dengan harga Toko Kota (Sepeda 12, Skuter 22, Kacamata 35, Iket 45, Helm 65)
  const GAMES = [
    {
      id: "padel",
      icon: "🎾",
      title: "Padel Club Gasibu",
      place: "Padel Court Gasibu",
      reward: "20 – 65 Koin",
      x: 0,
      z: -12,
      desc: "Main Padel kekinian di lapangan kaca biru Bandung! Bola memantul dinding kaca & kontrol 1-jempol super responsif.",
      how: "Geser jari langsung di lapangan untuk menggerakkan pemain (otomatis mengayun raket saat bola dekat). Tap lapangan atau tekan SMASH untuk pukulan keras pantul kaca!"
    },
    {
      id: "angkot",
      icon: "🚐",
      title: "Angkot Ngebut Surapati",
      place: "Jl. Surapati – Pasupati",
      reward: "15 – 60 Koin",
      x: -18,
      z: -26,
      desc: "Narik angkot hijau Cicaheum–Ledeng dengan latar siluet Gedung Sate, jemput warga & hindari barikade macet!",
      how: "Tap/geser lajur kiri-tengah-kanan langsung di layar (atau pakai tombol bawah) untuk jemput warga melambai (+koin) selama 25 detik."
    },
    {
      id: "fishing",
      icon: "🎣",
      title: "Mancing Kolam Taman Lansia",
      place: "Taman Timur Gedung Sate",
      reward: "20 – 55 Koin",
      x: 26,
      z: 10,
      desc: "Kolam teratai senja Taman Lansia! Jaga tarikan joran tetap di zona hijau untuk mengangkat Koi Kohaku Emas.",
      how: "Tahan layar kolam atau tombol TARIK JORAN agar indikator emas tetap berada di zona hijau sampai bar tangkapan penuh."
    },
    {
      id: "sate",
      icon: "🍢",
      title: "Bakar Sate Gedung Sate",
      place: "Pelataran Gedung Sate",
      reward: "20 – 60 Koin",
      x: 0,
      z: 6,
      desc: "Kipasi bara arang menyala di bawah siluet menara Gedung Sate, angkat 3 porsi sate saat matang keemasan!",
      how: "Tap Kipas Bara untuk menaikkan panas arang, lalu tap Angkat & Sajikan tepat saat kematangan di zona hijau (72%–92%)."
    }
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

  // Sistem hadiah jujur & sinkron 1:1 dengan dompet PirakuEconomy
  function rewardPlayer(baseCoins, reason, gameId) {
    const ch = getSelectedChar();
    const modeMult = selectedMode === "pro" ? 1.4 : 1.0;
    const total = Math.max(10, Math.round(baseCoins * (ch.mult || 1) * modeMult + (ch.bonus || 0)));
    saveHighScore(gameId, total);
    if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
      window.PirakuEconomy.addCoins(total, reason + " (" + ch.name + ")");
    }
    return total;
  }

  function tone(freq, dur) {
    if (typeof window.playSynthTone === "function") window.playSynthTone(freq, "triangle", dur || 0.1);
  }

  function setupHiDPI(canvas, w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1.5, 2);
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
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.88);z-index:99999;display:flex;align-items:center;justify-content:center;padding:12px;touch-action:pan-y;";
      modal.addEventListener("click", e => { if (e.target === modal) closeGamesModal(); });
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";
    const resolvedId = directId === "badminton" ? "padel" : directId;
    if (resolvedId) openGameLobby(resolvedId);
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
      <div style="width:100%;max-width:420px;background:linear-gradient(180deg,#0f172a 0%,#131c31 100%);border:1.5px solid rgba(56,189,248,0.45);border-radius:22px;padding:16px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.85);max-height:85dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div>
            <div style="font-size:10.5px;color:#38bdf8;font-weight:800;letter-spacing:.8px;">ARCADE BANDUNG • 1-JEMPOL HD</div>
            <div style="font-size:19px;font-weight:800;">Pilih Mini-Game 🎮</div>
          </div>
          <button id="g-close" style="width:32px;height:32px;border-radius:50%;border:none;background:#1e293b;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>

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
            <div style="padding:12px;border-radius:16px;background:rgba(30,41,59,0.88);border:1px solid rgba(148,163,184,0.24);">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:42px;height:42px;border-radius:12px;background:rgba(56,189,248,0.16);display:flex;align-items:center;justify-content:center;font-size:24px;">${g.icon}</div>
                  <div>
                    <div style="font-size:14px;font-weight:800;color:#f8fafc;">${g.title}</div>
                    <div style="font-size:11px;color:#94a3b8;">📍 ${g.place} • <span style="color:#fde047;font-weight:700;">🪙 ${g.reward}</span></div>
                  </div>
                </div>
                ${hs[g.id] ? `<span style="font-size:10px;padding:3px 7px;border-radius:999px;background:rgba(34,197,94,0.2);color:#4ade80;font-weight:800;">Rekor: +${hs[g.id]}</span>` : ""}
              </div>
              <div style="font-size:11.5px;color:#cbd5e1;line-height:1.35;margin-bottom:9px;">${g.desc}</div>
              <div style="display:flex;gap:8px;">
                <button data-lobby="${g.id}" style="flex:1;padding:9px 12px;border-radius:10px;border:none;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#fff;font-size:12px;font-weight:800;cursor:pointer;">▶ Masuk Arena</button>
                <button data-loc="${g.id}" style="padding:9px 10px;border-radius:10px;border:1px solid rgba(250,204,21,0.45);background:rgba(250,204,21,0.1);color:#fde047;font-size:11px;font-weight:700;cursor:pointer;">Lihat di peta →</button>
              </div>
            </div>
          `).join("")}
        </div>

        <button id="g-shop" style="width:100%;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#f59e0b,#eab308);color:#0f172a;font-size:12.5px;font-weight:800;cursor:pointer;">🛍️ Buka Toko Kota (Saldo: 🪙 ${coins.toLocaleString("id-ID")})</button>
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

  // ================= LOBBY PERSIAPAN GAME =================
  function openGameLobby(id) {
    stopLoop();
    const modal = document.getElementById("piraku-games-modal");
    const g = GAMES.find(x => x.id === id) || GAMES[0];
    const ch = getSelectedChar();
    const hs = getHighScores()[id] || 0;

    modal.innerHTML = `
      <div style="width:100%;max-width:400px;background:linear-gradient(180deg,#0f172a,#1e293b);border:1.5px solid #38bdf8;border-radius:22px;padding:18px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:11px;font-weight:800;color:#38bdf8;">ARENA • ${g.place.toUpperCase()}</span>
          <button id="lb-back" style="background:#334155;border:none;color:#fff;padding:5px 10px;border-radius:8px;font-size:11px;cursor:pointer;">← Daftar Game</button>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="width:50px;height:50px;border-radius:14px;background:rgba(56,189,248,0.18);display:flex;align-items:center;justify-content:center;font-size:30px;">${g.icon}</div>
          <div>
            <div style="font-size:18px;font-weight:800;">${g.title}</div>
            <div style="font-size:11.5px;color:#fde047;font-weight:700;">🪙 Hadiah: ${g.reward} ${hs ? "• Rekor: +" + hs : ""}</div>
          </div>
        </div>

        <div style="padding:10px;border-radius:12px;background:rgba(15,23,42,0.8);border:1px solid #334155;margin-bottom:12px;">
          <div style="font-size:11px;font-weight:800;color:#38bdf8;margin-bottom:4px;">📱 KONTROL HP MUDAH</div>
          <div style="font-size:11.5px;color:#cbd5e1;line-height:1.4;">${g.how}</div>
        </div>

        <div style="font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">1. PILIH KARAKTER</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;">
          ${CHARS.map(c => `
            <button data-lchar="${c.id}" style="padding:8px 4px;border-radius:11px;border:1.5px solid ${c.id === selectedCharId ? "#facc15" : "#334155"};background:${c.id === selectedCharId ? "rgba(250,204,21,0.2)" : "#0f172a"};color:#fff;cursor:pointer;text-align:center;">
              <div style="font-size:20px;">${c.badge}</div>
              <div style="font-size:10px;font-weight:800;margin-top:2px;">${c.name.split(" ")[1] || c.name}</div>
              <div style="font-size:8.5px;color:#fde047;">${c.perk}</div>
            </button>
          `).join("")}
        </div>

        <div style="font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">2. MODE PERTANDINGAN</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
          <button data-lmode="normal" style="padding:9px;border-radius:11px;border:1.5px solid ${selectedMode === "normal" ? "#38bdf8" : "#334155"};background:${selectedMode === "normal" ? "rgba(56,189,248,0.18)" : "#0f172a"};color:#fff;font-size:12px;font-weight:800;cursor:pointer;">🌤️ Santai (1.0x Koin)</button>
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
      if (id === "padel") playPadel();
      else if (id === "angkot") playAngkot();
      else if (id === "fishing") playFishing();
      else if (id === "sate") playSate();
    };
  }

  function drawPadelPlayer(ctx, x, y, shirtColor, hairColor, swingProg, isBot) {
    // Bayangan lembut
    ctx.fillStyle = "rgba(2,6,23,0.42)";
    ctx.beginPath(); ctx.ellipse(x, y + 12, 14, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    // Kaki & sepatu olahraga
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x - 6, y + 2, 4.5, 9); ctx.fillRect(x + 1.5, y + 2, 4.5, 9);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(x - 6.5, y + 9, 5.5, 3); ctx.fillRect(x + 1, y + 9, 5.5, 3);
    // Jersey padel
    ctx.fillStyle = shirtColor;
    ctx.beginPath(); ctx.roundRect(x - 10, y - 12, 20, 16, 6); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1; ctx.stroke();
    // Kepala & headband
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath(); ctx.arc(x, y - 18, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hairColor || "#0f172a";
    ctx.beginPath(); ctx.arc(x, y - 20, 7.5, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isBot ? "#38bdf8" : "#facc15";
    ctx.fillRect(x - 7.5, y - 20, 15, 2.6);

    // Raket Padel (teardrop berlubang khas padel)
    ctx.save();
    ctx.translate(x + (isBot ? -11 : 11), y - 6);
    const angle = isBot ? 0.45 - swingProg * 1.25 : -0.45 + swingProg * 1.45;
    ctx.rotate(angle);
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -11); ctx.stroke();
    ctx.fillStyle = isBot ? "#0284c7" : "#f59e0b";
    ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(0, -19, 6.5, 8.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Lubang-lubang raket padel
    ctx.fillStyle = "#0f172a";
    [[-2.2, -21], [2.2, -21], [0, -18.5], [-2.2, -16], [2.2, -16]].forEach(([hx, hy]) => {
      ctx.beginPath(); ctx.arc(hx, hy, 0.9, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }

  // ================= 1. PADEL CLUB GASIBU (GLASS COURT + 1-THUMB DRAG + AUTO-SWING) =================
  function playPadel() {
    const modal = document.getElementById("piraku-games-modal");
    const ch = getSelectedChar();
    const isPro = selectedMode === "pro";
    modal.innerHTML = `
      <div style="width:100%;max-width:400px;background:linear-gradient(180deg,#0c4a6e,#0f172a);border:2px solid #38bdf8;border-radius:22px;padding:12px;color:#fff;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#7dd3fc;">🎾 Padel Club Gasibu • ${isPro ? "Juara Kota" : "Santai"}</span>
          <button id="pd-back" style="background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.3);color:#fff;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:6px 12px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:12px;margin-bottom:6px;">
          <span>${ch.badge} ${ch.name}</span>
          <span id="pd-score" style="color:#facc15;font-size:20px;letter-spacing:1px;">0 : 0</span>
          <span style="color:#93c5fd;">${isPro ? "Pro Dago" : "Coach Gasibu"}</span>
        </div>
        <div id="pd-status" style="background:rgba(2,132,199,0.22);border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:5px;text-align:center;font-size:11px;color:#e0f2fe;margin-bottom:6px;">Geser jari di lapangan untuk gerak (Auto-Hit) • Tap SMASH buat pukulan keras!</div>
        <canvas id="pd-cv" style="width:100%;height:285px;border-radius:14px;display:block;margin-bottom:8px;touch-action:none;cursor:grab;"></canvas>
        <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:8px;">
          <button id="pd-lob" style="padding:11px;border-radius:12px;border:1px solid rgba(56,189,248,0.45);background:rgba(14,165,233,0.2);color:#e0f2fe;font-weight:800;font-size:12.5px;cursor:pointer;">🌤️ Lob / Servis</button>
          <button id="pd-smash" style="padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 4px 14px rgba(234,88,12,0.45);">🔥 SMASH / BANDEJA</button>
        </div>
      </div>`;

    modal.querySelector("#pd-back").onclick = () => openGameLobby("padel");
    const cv = document.getElementById("pd-cv");
    const ctx = setupHiDPI(cv, 340, 285);
    const stEl = document.getElementById("pd-status");
    const scEl = document.getElementById("pd-score");

    let p = { x: 170, y: 232, targetX: 170, targetY: 232, swing: 0 };
    let bot = { x: 170, y: 64, swing: 0 };
    let ball = { x: 170, y: 218, vx: 0, vy: 0, z: 14, vz: 0, state: "serve_p", power: false };
    let trail = [], sparks = [], wallFlashes = [], pScore = 0, bScore = 0, finished = false;
    let dragging = false;

    function spawnSparks(x, y, col, count) {
      for (let i = 0; i < (count || 12); i++) {
        sparks.push({ x, y, vx: (Math.random() - 0.5) * 6.5, vy: (Math.random() - 0.5) * 6.5, life: 1, col });
      }
    }

    function launchBall(isSmash) {
      if (finished) return;
      p.swing = 1.0;
      if (ball.state === "serve_p") {
        ball.state = "fly_to_bot";
        ball.x = p.x; ball.y = p.y - 12;
        const aimDir = (170 - p.x) * 0.025 + (Math.random() - 0.5) * 1.4;
        ball.vx = aimDir;
        ball.vy = isSmash ? -5.1 : -4.0;
        ball.z = 16; ball.vz = 1.45;
        ball.power = !!isSmash;
        spawnSparks(ball.x, ball.y - 8, isSmash ? "#facc15" : "#38bdf8", 10);
        tone(isSmash ? 740 : 540, 0.1);
        stEl.textContent = isSmash ? "🔥 Servis Kilat meluncur!" : "Servis masuk ke area lawan!";
        return;
      }
      const dist = Math.hypot(ball.x - p.x, ball.y - p.y);
      if (ball.state === "fly_to_p" && dist < 68) {
        ball.state = "fly_to_bot";
        // Otomatis arahkan pukulan ke sudut yang menjauhi posisi bot (berasa jago!)
        const openSide = bot.x > 170 ? -1 : 1;
        const playerBias = (170 - p.x) * 0.022;
        ball.vx = openSide * (1.6 + Math.random() * 1.3) + playerBias;
        ball.vy = isSmash ? (isPro ? -6.2 : -5.6) : (isPro ? -4.7 : -4.2);
        ball.z = isSmash ? 24 : 15;
        ball.vz = isSmash ? 0.55 : 1.35;
        ball.power = !!isSmash;
        spawnSparks(ball.x, ball.y - ball.z * 0.4, isSmash ? "#facc15" : "#38bdf8", isSmash ? 18 : 10);
        tone(isSmash ? 820 : 600, 0.12);
        stEl.textContent = isSmash ? "🔥 BANDEJA SMASH! Mantul kaca!" : "🎾 Pukulan silang mulus!";
      }
    }

    function updatePointerTarget(clientX, clientY) {
      const rect = cv.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 340;
      const ny = ((clientY - rect.top) / rect.height) * 285;
      p.targetX = Math.max(54, Math.min(286, nx));
      p.targetY = Math.max(162, Math.min(258, ny));
    }

    cv.addEventListener("pointerdown", e => {
      dragging = true;
      updatePointerTarget(e.clientX, e.clientY);
      if (ball.state === "serve_p") launchBall(false);
    });
    cv.addEventListener("pointermove", e => {
      if (!dragging) return;
      updatePointerTarget(e.clientX, e.clientY);
    });
    window.addEventListener("pointerup", () => { dragging = false; });

    document.getElementById("pd-lob").onclick = () => launchBall(false);
    document.getElementById("pd-smash").onclick = () => launchBall(true);

    function scorePoint(who) {
      if (who === "p") {
        pScore++;
        stEl.textContent = "🎉 Poin untuk " + ch.name + "!";
        tone(700, 0.16);
        spawnSparks(ball.x, ball.y, "#4ade80", 16);
      } else {
        bScore++;
        stEl.textContent = "Bola masuk di sudut lapanganmu!";
        tone(240, 0.16);
      }
      scEl.textContent = `${pScore} : ${bScore}`;
      if (pScore >= 5 || bScore >= 5) {
        finished = true; stopLoop();
        const win = pScore >= 5;
        const coin = rewardPlayer(win ? 42 : 18, win ? "Juara Padel Club Gasibu" : "Latihan Padel Gasibu", "padel");
        stEl.innerHTML = `<b style="color:#fde047;">${win ? "🏆 JUARA PADEL CLUB!" : "Pertandingan Selesai!"} +🪙 ${coin} Koin masuk dompet!</b>`;
        return;
      }
      trail = [];
      ball = { x: p.x, y: p.y - 12, vx: 0, vy: 0, z: 14, vz: 0, state: "serve_p", power: false };
    }

    // Helper perspektif dinding lapangan padel (trapesium)
    function getCourtHalfWidthAtY(y) {
      const t = Math.max(0, Math.min(1, (y - 34) / (264 - 34)));
      return 104 + t * 44; // atas 104 (total 208), bawah 148 (total 296)
    }

    function step() {
      p.swing = Math.max(0, p.swing - 0.08);
      bot.swing = Math.max(0, bot.swing - 0.08);

      // Gerak karakter pemain mulus ke jari
      p.x += (p.targetX - p.x) * 0.28;
      p.y += (p.targetY - p.y) * 0.28;

      // Auto-swing saat bola mendekat ke pemain (bikin kontrol di HP super nyaman!)
      if (ball.state === "fly_to_p" && Math.hypot(ball.x - p.x, ball.y - p.y) < 46) {
        launchBall(false);
      }

      // Gerak bot lawan
      const botTargetX = ball.state === "fly_to_bot" ? ball.x : 170;
      bot.x += (botTargetX - bot.x) * (isPro ? 0.082 : 0.056);
      bot.x = Math.max(82, Math.min(258, bot.x));

      if (ball.state === "fly_to_bot" || ball.state === "fly_to_p") {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.z = Math.max(0, ball.z + ball.vz);
        ball.vz -= 0.055;
        if (ball.z === 0) ball.vz = 1.1; // Pantulan karpet padel

        // Pantulan dinding kaca samping kiri & kanan (ciri khas Padel!)
        const halfW = getCourtHalfWidthAtY(ball.y);
        const leftWall = 170 - halfW + 6;
        const rightWall = 170 + halfW - 6;
        if (ball.x <= leftWall) {
          ball.x = leftWall + 1;
          ball.vx = Math.abs(ball.vx) * 0.92;
          wallFlashes.push({ x: leftWall, y: ball.y, life: 1 });
          spawnSparks(leftWall, ball.y, "#7dd3fc", 8);
          tone(640, 0.06);
        } else if (ball.x >= rightWall) {
          ball.x = rightWall - 1;
          ball.vx = -Math.abs(ball.vx) * 0.92;
          wallFlashes.push({ x: rightWall, y: ball.y, life: 1 });
          spawnSparks(rightWall, ball.y, "#7dd3fc", 8);
          tone(640, 0.06);
        }

        trail.push({ x: ball.x, y: ball.y - ball.z * 0.45, power: ball.power });
        if (trail.length > 14) trail.shift();

        if (ball.state === "fly_to_bot" && Math.hypot(ball.x - bot.x, ball.y - bot.y) < 32) {
          bot.swing = 1.0;
          ball.state = "fly_to_p";
          ball.power = false;
          ball.vx = (Math.random() - 0.5) * (isPro ? 4.4 : 3.5);
          ball.vy = (isPro ? 3.8 : 3.1) + Math.random() * 0.8;
          ball.z = 15; ball.vz = 1.35;
          tone(460, 0.08);
        } else if (ball.y < 30) {
          scorePoint("p");
        } else if (ball.y > 272) {
          scorePoint("bot");
        }
      } else {
        ball.x = p.x; ball.y = p.y - 12;
      }

      // ===== RENDER LAPANGAN PADEL KACA HD =====
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 285);
      bgGrad.addColorStop(0, "#090d16"); bgGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, 340, 285);

      // Lampu sorot klub padel malam Bandung
      [60, 280].forEach(lx => {
        const spot = ctx.createRadialGradient(lx, 18, 4, lx, 140, 175);
        spot.addColorStop(0, "rgba(56,189,248,0.22)");
        spot.addColorStop(1, "rgba(56,189,248,0)");
        ctx.fillStyle = spot; ctx.fillRect(0, 0, 340, 285);
      });

      // Karpet biru ikonik World Padel Tour
      const courtGrad = ctx.createLinearGradient(0, 34, 0, 264);
      courtGrad.addColorStop(0, "#0369a1"); courtGrad.addColorStop(1, "#0284c7");
      ctx.fillStyle = courtGrad;
      ctx.beginPath(); ctx.moveTo(66, 34); ctx.lineTo(274, 34); ctx.lineTo(318, 264); ctx.lineTo(22, 264); ctx.closePath(); ctx.fill();

      // Garis putih lapangan padel
      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(66, 34); ctx.lineTo(274, 34); ctx.lineTo(318, 264); ctx.lineTo(22, 264); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(170, 68); ctx.lineTo(170, 224); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(58, 68); ctx.lineTo(282, 68); ctx.moveTo(31, 224); ctx.lineTo(309, 224); ctx.stroke();

      // Dinding kaca tempered transparan di sekeliling lapangan
      ctx.fillStyle = "rgba(125,211,252,0.14)";
      ctx.beginPath(); ctx.moveTo(66, 12); ctx.lineTo(274, 12); ctx.lineTo(274, 34); ctx.lineTo(66, 34); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(66, 12); ctx.lineTo(22, 232); ctx.lineTo(22, 264); ctx.lineTo(66, 34); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(274, 12); ctx.lineTo(318, 232); ctx.lineTo(318, 264); ctx.lineTo(274, 34); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(125,211,252,0.65)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(66, 12); ctx.lineTo(274, 12); ctx.lineTo(318, 232); ctx.moveTo(66, 12); ctx.lineTo(22, 232); ctx.stroke();

      // Kilau pantulan kaca saat bola kena dinding
      for (let i = wallFlashes.length - 1; i >= 0; i--) {
        const wf = wallFlashes[i]; wf.life -= 0.06;
        if (wf.life <= 0) { wallFlashes.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(125,211,252,${wf.life * 0.65})`;
        ctx.beginPath(); ctx.arc(wf.x, wf.y, 18 * (1.2 - wf.life * 0.4), 0, Math.PI * 2); ctx.fill();
      }

      drawPadelPlayer(ctx, bot.x, bot.y, isPro ? "#7c3aed" : "#0ea5e9", "#0f172a", bot.swing, true);

      // Net tengah Padel
      ctx.fillStyle = "#1e293b"; ctx.fillRect(42, 132, 5, 22); ctx.fillRect(293, 132, 5, 22);
      ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fillRect(46, 135, 248, 15);
      ctx.fillStyle = "#f8fafc"; ctx.fillRect(44, 133, 252, 3.5);

      // Zona auto-swing pemain (lingkaran panduan halus)
      ctx.strokeStyle = "rgba(250,204,21,0.35)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 44, 28, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      drawPadelPlayer(ctx, p.x, p.y, ch.shirt, ch.hair, p.swing, false);

      // Jejak & Bola Padel kuning neon
      trail.forEach((tr, idx) => {
        ctx.fillStyle = tr.power ? `rgba(249,115,22,${(idx / trail.length) * 0.55})` : `rgba(250,204,21,${(idx / trail.length) * 0.45})`;
        ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.power ? 4.8 : 3.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath(); ctx.ellipse(ball.x, ball.y + 6, 5.5, 2.8, 0, 0, Math.PI * 2); ctx.fill();
      const by = ball.y - ball.z * 0.45;
      ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(ball.x, by, 4.8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ball.x, by, 3.2, 0.3, 2.5); ctx.stroke();

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

  // ================= 2. ANGKOT NGEBUT SURAPATI (TAP/SWIPE LAJUR + SILUET GEDUNG SATE) =================
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
          <span id="ak-score" style="color:#fde047;">Penumpang: 0 • 🪙 +15 Koin</span>
          <span id="ak-time" style="color:#38bdf8;">⏱️ 25d</span>
        </div>
        <canvas id="ak-cv" style="width:100%;height:290px;border-radius:14px;display:block;margin-bottom:8px;touch-action:none;"></canvas>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="ak-l" style="padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:14px;font-weight:900;">◀ Lajur Kiri</button>
          <button id="ak-r" style="padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:14px;font-weight:900;">Lajur Kanan ▶</button>
        </div>
      </div>`;
    modal.querySelector("#ak-back").onclick = () => openGameLobby("angkot");
    const cv = document.getElementById("ak-cv");
    const ctx = setupHiDPI(cv, 330, 290);
    const lanes = [86, 165, 244];
    let lane = 1, curX = lanes[1], objs = [], popups = [], pax = 0, start = performance.now(), dash = 0, over = false;

    function goLeft() { if (lane > 0) { lane--; tone(480, 0.06); } }
    function goRight() { if (lane < 2) { lane++; tone(520, 0.06); } }
    document.getElementById("ak-l").onclick = goLeft;
    document.getElementById("ak-r").onclick = goRight;

    // Tap langsung lajur kiri/tengah/kanan di layar canvas
    cv.addEventListener("pointerdown", e => {
      const rect = cv.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 330;
      const targetLane = nx < 125 ? 0 : nx > 205 ? 2 : 1;
      if (targetLane !== lane) { lane = targetLane; tone(500, 0.06); }
    });

    function calcEarned() {
      return Math.min(44, 14 + pax * 3);
    }

    function step(now) {
      const rem = Math.max(0, 25 - Math.floor((now - start) / 1000));
      document.getElementById("ak-time").textContent = "⏱️ " + rem + "d";
      if (rem <= 0 && !over) {
        over = true; stopLoop();
        const coin = rewardPlayer(calcEarned(), "Narik Angkot Surapati (" + pax + " warga)", "angkot");
        document.getElementById("ak-score").textContent = `Selesai! +🪙 ${coin} Koin masuk dompet!`;
        return;
      }

      const spd = isPro ? 5.6 : 4.3;
      dash = (dash + spd * 1.4) % 44;
      curX += (lanes[lane] - curX) * 0.26;

      if (Math.random() < (isPro ? 0.055 : 0.045)) {
        const l = Math.floor(Math.random() * 3);
        objs.push({ lane: l, y: -35, type: Math.random() < 0.65 ? "pax" : "cone" });
      }

      ctx.clearRect(0, 0, 330, 290);
      // Trotoar & Pepohonan Surapati
      ctx.fillStyle = "#14532d"; ctx.fillRect(0, 0, 42, 290); ctx.fillRect(288, 0, 42, 290);
      ctx.fillStyle = "#94a3b8"; ctx.fillRect(36, 0, 8, 290); ctx.fillRect(286, 0, 8, 290);

      // Aspal Jalan Surapati
      ctx.fillStyle = "#1e293b"; ctx.fillRect(44, 0, 242, 290);
      ctx.strokeStyle = "#facc15"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(48, 0); ctx.lineTo(48, 290); ctx.moveTo(282, 0); ctx.lineTo(282, 290); ctx.stroke();

      ctx.strokeStyle = "rgba(248,250,252,0.72)"; ctx.lineWidth = 2.5; ctx.setLineDash([22, 22]); ctx.lineDashOffset = -dash;
      ctx.beginPath(); ctx.moveTo(125, 0); ctx.lineTo(125, 290); ctx.moveTo(205, 0); ctx.lineTo(205, 290); ctx.stroke();
      ctx.setLineDash([]);

      for (let ty = -44 + dash; ty < 320; ty += 88) {
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
          ctx.fillStyle = "rgba(250,204,21,0.28)"; ctx.beginPath(); ctx.arc(ox, o.y, 19, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.roundRect(ox - 8, o.y - 3, 16, 13, 4); ctx.fill();
          ctx.fillStyle = "#fed7aa"; ctx.beginPath(); ctx.arc(ox, o.y - 9, 6.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(ox + 10, o.y - 11, 3.8, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = "#ea580c"; ctx.beginPath(); ctx.roundRect(ox - 18, o.y - 11, 36, 22, 5); ctx.fill();
          ctx.fillStyle = "#f8fafc"; ctx.fillRect(ox - 14, o.y - 3, 28, 6);
        }

        if (Math.abs(ox - curX) < 26 && Math.abs(o.y - 236) < 30) {
          if (o.type === "pax") {
            pax++; tone(720, 0.09);
            popups.push({ x: curX, y: 205, text: "+3 Koin", life: 1 });
          } else {
            pax = Math.max(0, pax - 1); tone(200, 0.14);
            popups.push({ x: curX, y: 205, text: "Macet!", life: 1 });
          }
          document.getElementById("ak-score").textContent = `Penumpang: ${pax} • 🪙 +${calcEarned()} Koin`;
          objs.splice(i, 1);
        } else if (o.y > 320) objs.splice(i, 1);
      }

      // Sorot lampu depan angkot & bodi angkot hijau khas Bandung
      ctx.fillStyle = "rgba(254,240,138,0.24)";
      ctx.beginPath(); ctx.moveTo(curX - 15, 208); ctx.lineTo(curX - 28, 158); ctx.lineTo(curX + 28, 158); ctx.lineTo(curX + 15, 208); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.beginPath(); ctx.roundRect(curX - 19, 210, 42, 60, 8); ctx.fill();
      ctx.fillStyle = "#16a34a"; ctx.beginPath(); ctx.roundRect(curX - 21, 206, 42, 60, 8); ctx.fill();
      ctx.fillStyle = ch.shirt; ctx.fillRect(curX - 21, 230, 42, 12);
      ctx.fillStyle = "#e2e8f0"; ctx.beginPath(); ctx.roundRect(curX - 16, 224, 32, 34, 5); ctx.fill();
      ctx.fillStyle = "#0ea5e9"; ctx.beginPath(); ctx.roundRect(curX - 16, 211, 32, 11, 3); ctx.fill();
      ctx.fillStyle = "#fef08a"; ctx.fillRect(curX - 17, 206, 7, 3); ctx.fillRect(curX + 10, 206, 7, 3);

      for (let i = popups.length - 1; i >= 0; i--) {
        const pp = popups[i]; pp.y -= 1.2; pp.life -= 0.03;
        if (pp.life <= 0) { popups.splice(i, 1); continue; }
        ctx.globalAlpha = pp.life;
        ctx.fillStyle = "#fde047"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(pp.text, pp.x, pp.y);
        ctx.globalAlpha = 1;
      }

      if (!over) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 3. MANCING KOLAM TAMAN LANSIA (KOI KOHAKU EMAS + HOLD LAYAR) =================
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
        <div id="fs-info" style="font-size:12px;font-weight:700;color:#fde047;margin-bottom:6px;">Tahan layar kolam atau tombol TARIK agar indikator tetap di zona hijau!</div>
        <canvas id="fs-cv" style="width:100%;height:245px;border-radius:14px;display:block;margin-bottom:8px;touch-action:none;"></canvas>
        <button id="fs-hold" style="width:100%;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#0f172a;font-size:14px;font-weight:900;cursor:pointer;user-select:none;touch-action:none;">🎣 TAHAN UNTUK TARIK JORAN</button>
      </div>`;
    modal.querySelector("#fs-back").onclick = () => openGameLobby("fishing");
    const cv = document.getElementById("fs-cv");
    const ctx = setupHiDPI(cv, 330, 245);
    const holdBtn = document.getElementById("fs-hold");
    let holding = false, bar = 48, progress = 32, fishX = 165, t = 0, done = false;

    const startHold = e => { e.preventDefault(); holding = true; };
    const endHold = () => { holding = false; };
    holdBtn.addEventListener("pointerdown", startHold);
    cv.addEventListener("pointerdown", startHold);
    window.addEventListener("pointerup", endHold);
    window.addEventListener("pointercancel", endHold);

    function step() {
      t += 0.06;
      const pullForce = isPro ? 1.8 : 1.55;
      bar += holding ? pullForce : -(isPro ? 1.45 : 1.2);
      bar = Math.max(0, Math.min(100, bar));
      const inZone = bar >= 30 && bar <= 72;
      progress += inZone ? 0.52 : -0.18;
      fishX = 165 + Math.sin(t * 2.1) * 76;

      const waterGrad = ctx.createRadialGradient(165, 95, 15, 165, 120, 195);
      waterGrad.addColorStop(0, "#0284c7"); waterGrad.addColorStop(1, "#082f49");
      ctx.fillStyle = waterGrad; ctx.fillRect(0, 0, 330, 245);

      // Teratai Taman Lansia
      [[52, 46, 20], [278, 54, 22], [66, 138, 17], [268, 132, 16]].forEach(([lx, ly, lr]) => {
        ctx.fillStyle = "#15803d"; ctx.beginPath(); ctx.arc(lx, ly, lr, 0.2, Math.PI * 1.9); ctx.lineTo(lx, ly); ctx.fill();
        ctx.fillStyle = "#f472b6"; ctx.beginPath(); ctx.arc(lx + 4, ly - 3, 5, 0, Math.PI * 2); ctx.fill();
      });

      // Riak air dinamis
      ctx.strokeStyle = inZone ? "rgba(74,222,128,0.55)" : "rgba(186,230,253,0.4)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(fishX, 105, 28 + Math.sin(t * 4) * 8, 12, 0, 0, Math.PI * 2); ctx.stroke();

      // Ikan Koi Kohaku Emas
      const tailWag = Math.sin(t * 10) * 6;
      ctx.fillStyle = "#f97316";
      ctx.beginPath(); ctx.moveTo(fishX - 18, 105); ctx.lineTo(fishX - 31, 96 + tailWag); ctx.lineTo(fishX - 31, 114 + tailWag); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(fishX, 105, 21, 9.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.arc(fishX - 3, 104, 5.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(fishX + 9, 104, 4.8, 0, Math.PI * 2); ctx.fill();

      // Senar & Pelampung
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(165, 0); ctx.quadraticCurveTo((165 + fishX) / 2, 55, fishX + 14, 98); ctx.stroke();
      ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(fishX + 14, 96, 4.5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(fishX + 14, 96, 4.5, 0, Math.PI); ctx.fill();

      // Bar Tensi & Zona Hijau
      ctx.fillStyle = "rgba(15,23,42,0.88)"; ctx.beginPath(); ctx.roundRect(22, 178, 286, 22, 10); ctx.fill();
      ctx.fillStyle = "#22c55e"; ctx.fillRect(22 + 286 * 0.30, 178, 286 * 0.42, 22);
      ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.roundRect(22 + (bar / 100) * 276, 175, 10, 28, 4); ctx.fill();

      // Bar Progres Tangkapan
      ctx.fillStyle = "rgba(15,23,42,0.88)"; ctx.beginPath(); ctx.roundRect(22, 210, 286, 12, 6); ctx.fill();
      ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.roundRect(22, 210, 286 * Math.max(0, Math.min(1, progress / 100)), 12, 6); ctx.fill();

      if (progress >= 100 && !done) {
        done = true; stopLoop();
        const coin = rewardPlayer(36, "Dapat Koi Emas Taman Lansia", "fishing");
        document.getElementById("fs-info").textContent = `🎉 Dapat Koi Emas Gedung Sate! +🪙 ${coin} Koin masuk dompet!`;
        return;
      }
      if (!done) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 4. BAKAR SATE GEDUNG SATE (SILUET MENARA + EMBER BARA) =================
  function playSate() {
    const modal = document.getElementById("piraku-games-modal");
    const ch = getSelectedChar();
    const isPro = selectedMode === "pro";
    modal.innerHTML = `
      <div style="width:100%;max-width:390px;background:#0f172a;border:2px solid #f59e0b;border-radius:22px;padding:12px;color:#fff;text-align:center;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#f59e0b;">🍢 ${ch.badge} ${ch.name} • Sate Gedung Sate</span>
          <button id="st-back" style="background:#1e293b;border:none;color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div id="st-msg" style="font-size:11.5px;color:#cbd5e1;margin-bottom:6px;">Kipasi bara lalu angkat 3 porsi saat matang <b>72%–92%</b>!</div>
        <canvas id="st-cv" style="width:100%;height:220px;border-radius:14px;display:block;margin-bottom:10px;"></canvas>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="st-fan" style="padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#ea580c,#dc2626);color:#fff;font-weight:800;cursor:pointer;">🪭 Kipas Bara</button>
          <button id="st-serve" style="padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#0f172a;font-weight:900;cursor:pointer;">🍽️ Angkat & Sajikan!</button>
        </div>
      </div>`;
    modal.querySelector("#st-back").onclick = () => openGameLobby("sate");
    const cv = document.getElementById("st-cv");
    const ctx = setupHiDPI(cv, 330, 220);
    let cook = 0, heat = 0.36, served = 0, over = false, smokes = [], embers = [], t = 0;

    document.getElementById("st-fan").onclick = () => {
      heat = Math.min(1.5, heat + (isPro ? 0.44 : 0.38));
      tone(460, 0.07);
      for (let i = 0; i < 7; i++) {
        smokes.push({ x: 75 + Math.random() * 180, y: 128, vy: -1.3 - Math.random(), r: 6 + Math.random() * 6, a: 0.55 });
        embers.push({ x: 75 + Math.random() * 180, y: 132, vx: (Math.random() - 0.5) * 2.5, vy: -2 - Math.random() * 2, life: 1 });
      }
    };

    document.getElementById("st-serve").onclick = () => {
      if (cook >= 72 && cook <= 92) {
        served++; tone(740, 0.13);
        document.getElementById("st-msg").innerHTML = `<b style="color:#4ade80;">Matang Sempurna! (${served}/3 porsi)</b>`;
        if (served >= 3) {
          over = true; stopLoop();
          const coin = rewardPlayer(40, "Sate Matang Sempurna Gedung Sate", "sate");
          document.getElementById("st-msg").innerHTML = `<b style="color:#fde047;">🎉 3 Porsi Sate Ludes! +🪙 ${coin} Koin masuk dompet!</b>`;
        }
      } else {
        tone(210, 0.15);
        document.getElementById("st-msg").innerHTML = `<b style="color:#f87171;">${cook < 72 ? "Masih mentah!" : "Kegosongan!"} Coba tusukan baru!</b>`;
      }
      cook = 0; heat = 0.36;
    };

    function step() {
      t += 0.08;
      cook = Math.min(100, cook + heat * (isPro ? 1.2 : 0.98));
      heat = Math.max(0.26, heat * 0.985);
      if (Math.random() < 0.25) smokes.push({ x: 80 + Math.random() * 170, y: 118, vy: -1.1, r: 5, a: 0.38 });

      ctx.clearRect(0, 0, 330, 220);
      const sky = ctx.createLinearGradient(0, 0, 0, 220);
      sky.addColorStop(0, "#0f172a"); sky.addColorStop(1, "#1e293b");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, 330, 220);

      // Siluet Menara Tusuk Sate Gedung Sate di latar belakang
      ctx.fillStyle = "rgba(56,189,248,0.1)";
      ctx.fillRect(110, 32, 110, 88);
      ctx.fillRect(145, 16, 40, 20);
      ctx.fillRect(163, 4, 4, 14);

      // Tungku Panggangan & Bara Menyala
      ctx.fillStyle = "#090d16"; ctx.beginPath(); ctx.roundRect(45, 118, 240, 48, 8); ctx.fill();
      for (let bx = 62; bx < 268; bx += 18) {
        const glow = 0.55 + Math.sin(t + bx) * 0.35 * heat;
        ctx.fillStyle = `rgba(249,115,22,${Math.min(1, glow)})`;
        ctx.beginPath(); ctx.arc(bx, 136, 7.5, 0, Math.PI * 2); ctx.fill();
      }

      // 5 Tusuk Sate
      const meatCol = cook < 45 ? "#f87171" : cook < 72 ? "#d97706" : cook <= 92 ? "#92400e" : "#1c1917";
      for (let s = 0; s < 5; s++) {
        const sx = 82 + s * 41;
        ctx.strokeStyle = "#fde68a"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(sx, 58); ctx.lineTo(sx, 155); ctx.stroke();
        [75, 91, 107].forEach(sy => {
          ctx.fillStyle = meatCol;
          ctx.beginPath(); ctx.roundRect(sx - 9, sy - 6, 18, 12, 4); ctx.fill();
          if (cook >= 72 && cook <= 92) {
            ctx.fillStyle = "rgba(253,224,71,0.35)";
            ctx.fillRect(sx - 5, sy - 3, 10, 3);
          }
        });
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const em = embers[i]; em.x += em.vx; em.y += em.vy; em.life -= 0.04;
        if (em.life <= 0) { embers.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(251,191,36,${em.life})`;
        ctx.beginPath(); ctx.arc(em.x, em.y, 2.2, 0, Math.PI * 2); ctx.fill();
      }

      for (let i = smokes.length - 1; i >= 0; i--) {
        const sm = smokes[i]; sm.y += sm.vy; sm.r += 0.15; sm.a -= 0.012;
        if (sm.a <= 0) { smokes.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(226,232,240,${sm.a})`;
        ctx.beginPath(); ctx.arc(sm.x, sm.y, sm.r, 0, Math.PI * 2); ctx.fill();
      }

      // Bar Tingkat Kematangan
      ctx.fillStyle = "#090d16"; ctx.beginPath(); ctx.roundRect(35, 182, 260, 20, 9); ctx.fill();
      ctx.fillStyle = "rgba(34,197,94,0.55)"; ctx.fillRect(35 + 260 * 0.72, 182, 260 * 0.20, 20);
      ctx.fillStyle = cook > 92 ? "#ef4444" : "#f59e0b";
      ctx.beginPath(); ctx.roundRect(35, 182, 260 * (cook / 100), 20, 9); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Matang: " + Math.round(cook) + "% (Target 72–92%)", 165, 196);

      if (!over) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }
})();
