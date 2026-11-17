// ================= PIRAKUBDG HD ARCADE GAMES (PADEL CLUB + 1-THUMB MOBILE UX + SYNCED ECONOMY) =================
(function() {
  const GAMES = [
    {
      id: "penalty",
      icon: "⚽",
      title: "Adu Penalti Stadion GBLA",
      place: "Stadion GBLA Gedebage",
      reward: "10 – 28 Koin",
      x: 0,
      z: -18,
      desc: "5 Tendangan Penalti di hadapan ribuan Bobotoh GBLA! Pilih sudut kiri, tengah, atau kanan untuk mengelabui kiper lawan.",
      how: "Tap langsung salah satu sudut gawang (Kiri / Tengah / Kanan) di layar atau tombol bawah saat meteran tendangan siap!"
    },
    {
      id: "padel",
      icon: "🎾",
      title: "Padel Club Gasibu",
      place: "Padel Court Gasibu",
      reward: "10 – 30 Koin",
      x: 0,
      z: -12,
      desc: "Main Padel di lapangan kaca biru Bandung! Jaga Rally panjang + pantulan dinding kaca untuk bonus koin ekstra.",
      how: "Geser jari langsung di lapangan untuk gerak (Auto-Hit saat dekat) • Tap SMASH untuk pukulan kilat!"
    },
    {
      id: "angkot",
      icon: "🚐",
      title: "Angkot Ngebut Surapati",
      place: "Jl. Surapati – Pasupati",
      reward: "10 – 30 Koin",
      x: -18,
      z: -26,
      desc: "Narik angkot hijau Cicaheum–Ledeng dengan 3 Nyawa! Jemput warga beruntun (Combo) & hindari barikade macet.",
      how: "Swipe kiri/kanan atau tap lajur di layar selama 25 detik. Nabrak barikade 3x = mogok!"
    },
    {
      id: "fishing",
      icon: "🎣",
      title: "Mancing Kolam Taman Lansia",
      place: "Taman Timur Gedung Sate",
      reward: "12 – 34 Koin",
      x: 26,
      z: 10,
      desc: "Tarik-ulur joran di Taman Lansia! Tangkap Mujair, Koi Kohaku, atau Koi Naga Emas Langka sebelum senar putus.",
      how: "Tahan layar kolam atau tombol TARIK JORAN agar indikator tetap di zona hijau saat ikan berontak!"
    },
    {
      id: "sate",
      icon: "🍢",
      title: "Bakar Sate Gedung Sate",
      place: "Pelataran Gedung Sate",
      reward: "10 – 32 Koin",
      x: 0,
      z: 6,
      desc: "Kipasi bara arang dalam 35 detik! Angkat 3 porsi di zona matang (72–92%) atau tepat di zona PERFECT (79–86%).",
      how: "Tap Kipas Bara lalu Angkat & Sajikan sebelum waktu habis (maksimal 2x gosong)!"
    }
  ];

  let selectedMode = "normal"; // "normal" | "pro"

  function getActiveCitizenLabel() {
    const ig = (localStorage.getItem("piraku_my_ig") || "").trim();
    return ig || "Wargi Bandung";
  }

  function showArcadeEndOverlay(parentCard, replayFn) {
    if (!parentCard) return;
    let bar = parentCard.querySelector(".arcade-end-actions");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "arcade-end-actions";
      bar.style.cssText = "display:grid;grid-template-columns:1.2fr 1fr;gap:8px;margin-top:9px;";
      bar.innerHTML = `
        <button class="arc-replay" style="padding:10px;border-radius:11px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;font-weight:900;font-size:12.5px;cursor:pointer;">🔄 Main Lagi</button>
        <button class="arc-hub" style="padding:10px;border-radius:11px;border:1px solid rgba(148,163,184,0.35);background:#1e293b;color:#f8fafc;font-weight:800;font-size:12px;cursor:pointer;">← Daftar Game</button>
      `;
      parentCard.appendChild(bar);
      bar.querySelector(".arc-replay").onclick = replayFn;
      bar.querySelector(".arc-hub").onclick = renderHub;
    }
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

  // Sistem hadiah jujur & sinkron 1:1 dengan dompet PirakuEconomy + XP Level
  function rewardPlayer(baseCoins, reason, gameId) {
    const modeMult = selectedMode === "pro" ? 1.3 : 1.0;
    const total = Math.max(8, Math.round(baseCoins * modeMult));
    saveHighScore(gameId, total);
    if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
      window.PirakuEconomy.addCoins(total, reason);
    }
    if (typeof window.grantPirakuXP === "function") {
      const xpEarned = Math.max(15, Math.round(total * 1.2));
      window.grantPirakuXP(xpEarned, reason);
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
      modal.addEventListener("click", e => {
        if (e.target === modal && !modal.querySelector("canvas")) closeGamesModal();
      });
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
    const hs = getHighScores();
    const ojolBestStreak = parseInt(localStorage.getItem("piraku_ojol_best_streak") || "0", 10);
    const raceBestSec = localStorage.getItem("piraku_gasibu_race_best");

    modal.innerHTML = `
      <div style="width:100%;max-width:420px;background:linear-gradient(180deg,#0f172a 0%,#131c31 100%);border:1.5px solid rgba(56,189,248,0.45);border-radius:22px;padding:16px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.85);max-height:85dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div>
            <div style="font-size:10.5px;color:#38bdf8;font-weight:800;letter-spacing:.8px;">ARCADE BANDUNG • 3D & 1-JEMPOL</div>
            <div style="font-size:19px;font-weight:800;">Pilih Game Bandung 🎮</div>
          </div>
          <button id="g-close" style="width:32px;height:32px;border-radius:50%;border:none;background:#1e293b;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>

        <div style="font-size:10.5px;font-weight:800;color:#4ade80;letter-spacing:.6px;margin:4px 0 6px;">🌍 GAME DUNIA 3D (LANGSUNG DI PETA)</div>
        <div style="padding:12px;border-radius:16px;background:linear-gradient(135deg,rgba(16,185,129,0.22),rgba(15,23,42,0.92));border:1.5px solid rgba(74,222,128,0.55);margin-bottom:9px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:42px;height:42px;border-radius:12px;background:rgba(74,222,128,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;">🛵</div>
              <div>
                <div style="font-size:14px;font-weight:800;color:#f8fafc;">Kurir & Ojol Bandung 3D</div>
                <div style="font-size:11px;color:#cbd5e1;">📍 Pusat Kota → Komplek • <span style="color:#fde047;font-weight:700;">🪙 18–25 Koin + 40 XP</span></div>
              </div>
            </div>
            ${ojolBestStreak > 0 ? `<span style="font-size:10px;padding:3px 7px;border-radius:999px;background:rgba(250,204,21,0.2);color:#fde047;font-weight:800;">🔥 ${ojolBestStreak}</span>` : ""}
          </div>
          <div style="font-size:11.5px;color:#e2e8f0;line-height:1.38;margin-bottom:9px;">
            1 Orderan Lintas Peta! Jemput pesanan di <b>Pusat Kota (Pullman/Gasibu/Taman Lansia)</b> lalu antar ke <b>Komplek Kecamatan</b> tujuan sebelum waktu habis.
          </div>
          <button id="g-start-ojol" style="width:100%;padding:9px 12px;border-radius:10px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;font-size:12px;font-weight:900;cursor:pointer;">▶ Mulai Narik di Peta 3D</button>
        </div>

        <div style="padding:12px;border-radius:16px;background:linear-gradient(135deg,rgba(56,189,248,0.22),rgba(15,23,42,0.92));border:1.5px solid rgba(56,189,248,0.55);margin-bottom:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:42px;height:42px;border-radius:12px;background:rgba(56,189,248,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;">🏁</div>
              <div>
                <div style="font-size:14px;font-weight:800;color:#f8fafc;">Balap Time Trial Gasibu 3D</div>
                <div style="font-size:11px;color:#cbd5e1;">📍 5 Checkpoint Gasibu • <span style="color:#fde047;font-weight:700;">🪙 16 Koin + 35 XP</span></div>
              </div>
            </div>
            ${raceBestSec ? `<span style="font-size:10px;padding:3px 7px;border-radius:999px;background:rgba(56,189,248,0.2);color:#7dd3fc;font-weight:800;">⏱️ ${raceBestSec}d</span>` : ""}
          </div>
          <div style="font-size:11.5px;color:#e2e8f0;line-height:1.38;margin-bottom:9px;">
            Lewati <b>5 Gerbang Checkpoint</b> keliling Lapangan Gasibu & Gedung Sate di bawah <b>45 detik</b>! Pakai Skuter/Sepeda untuk pecahkan rekor tercepat.
          </div>
          <button id="g-start-race" style="width:100%;padding:9px 12px;border-radius:10px;border:none;background:linear-gradient(135deg,#38bdf8,#0284c7);color:#041322;font-size:12px;font-weight:900;cursor:pointer;">🏁 Mulai Balap Gasibu 3D</button>
        </div>

        <div style="font-size:10.5px;font-weight:800;color:#fde047;letter-spacing:.6px;margin:4px 0 6px;">🕹️ ARCADE KOTA BANDUNG</div>
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
    const ojolBtn = modal.querySelector("#g-start-ojol");
    if (ojolBtn) {
      ojolBtn.onclick = () => {
        closeGamesModal();
        if (typeof window.startOjol3DGame === "function") window.startOjol3DGame();
      };
    }
    const raceBtn = modal.querySelector("#g-start-race");
    if (raceBtn) {
      raceBtn.onclick = () => {
        closeGamesModal();
        if (typeof window.startGasibuRace3D === "function") window.startGasibuRace3D();
      };
    }
    modal.querySelector("#g-shop").onclick = () => { closeGamesModal(); if (window.openEconomyModal) window.openEconomyModal("outfit"); };
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
    const playerName = getActiveCitizenLabel();
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

        <div style="font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">MODE PERTANDINGAN</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
          <button data-lmode="normal" style="padding:9px;border-radius:11px;border:1.5px solid ${selectedMode === "normal" ? "#38bdf8" : "#334155"};background:${selectedMode === "normal" ? "rgba(56,189,248,0.18)" : "#0f172a"};color:#fff;font-size:12px;font-weight:800;cursor:pointer;">🌤️ Santai (1.0x Koin)</button>
          <button data-lmode="pro" style="padding:9px;border-radius:11px;border:1.5px solid ${selectedMode === "pro" ? "#f97316" : "#334155"};background:${selectedMode === "pro" ? "rgba(249,115,22,0.22)" : "#0f172a"};color:#fff;font-size:12px;font-weight:800;cursor:pointer;">🔥 Juara Kota (1.4x Koin)</button>
        </div>

        <button id="lb-start" style="width:100%;padding:12px;border-radius:13px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#0f172a;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(34,197,94,0.4);">▶ MULAI MAIN (${playerName})</button>
      </div>`;

    modal.querySelector("#lb-back").onclick = renderHub;
    modal.querySelectorAll("[data-lmode]").forEach(b => {
      b.onclick = () => { selectedMode = b.dataset.lmode; openGameLobby(id); };
    });
    modal.querySelector("#lb-start").onclick = () => {
      if (id === "penalty") playPenaltyGBLA();
      else if (id === "padel") playPadel();
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

  // ================= 1. PADEL CLUB GASIBU (GLASS COURT + RALLY BONUS) =================
  function playPadel() {
    const modal = document.getElementById("piraku-games-modal");
    const playerName = getActiveCitizenLabel();
    const isPro = selectedMode === "pro";
    modal.innerHTML = `
      <div id="pd-card" style="width:100%;max-width:400px;background:linear-gradient(180deg,#0c4a6e,#0f172a);border:2px solid #38bdf8;border-radius:22px;padding:12px;color:#fff;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#7dd3fc;">🎾 Padel Club Gasibu • ${isPro ? "Juara Kota" : "Santai"}</span>
          <button id="pd-back" style="background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.3);color:#fff;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:6px 12px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:12px;margin-bottom:6px;">
          <span>${playerName}</span>
          <span id="pd-score" style="color:#facc15;font-size:20px;letter-spacing:1px;">0 : 0</span>
          <span id="pd-rally" style="color:#4ade80;font-size:11px;">Rally: 0x</span>
        </div>
        <div id="pd-status" style="background:rgba(2,132,199,0.22);border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:5px;text-align:center;font-size:11px;color:#e0f2fe;margin-bottom:6px;">Geser jari di lapangan untuk gerak • Jaga Rally panjang buat bonus koin!</div>
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
    const rlEl = document.getElementById("pd-rally");

    let p = { x: 170, y: 232, targetX: 170, targetY: 232, swing: 0 };
    let bot = { x: 170, y: 64, swing: 0 };
    let ball = { x: 170, y: 218, vx: 0, vy: 0, z: 14, vz: 0, state: "serve_p", power: false };
    let trail = [], sparks = [], wallFlashes = [], pScore = 0, bScore = 0, rally = 0, maxRally = 0, finished = false;
    let dragging = false, smashBanner = 0, lastNow = performance.now();

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
      if (ball.state === "fly_to_p" && dist < 56) {
        ball.state = "fly_to_bot";
        rally++;
        if (rally > maxRally) maxRally = rally;
        if (rlEl) rlEl.textContent = "Rally: " + rally + "x";
        // Otomatis arahkan pukulan ke sudut yang menjauhi posisi bot (berasa jago!)
        const openSide = bot.x > 170 ? -1 : 1;
        const playerBias = (170 - p.x) * 0.022;
        ball.vx = openSide * (1.6 + Math.random() * 1.3) + playerBias;
        ball.vy = isSmash ? (isPro ? -6.2 : -5.6) : (isPro ? -4.7 : -4.2);
        ball.z = isSmash ? 24 : 15;
        ball.vz = isSmash ? 0.55 : 1.35;
        ball.power = !!isSmash;
        spawnSparks(ball.x, ball.y - ball.z * 0.4, isSmash ? "#facc15" : "#38bdf8", isSmash ? 18 : 10);
        if (isSmash) smashBanner = 1.0;
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
        stEl.textContent = "🎉 Poin untuk " + playerName + "!";
        tone(700, 0.16);
        spawnSparks(ball.x, ball.y, "#4ade80", 16);
      } else {
        bScore++;
        stEl.textContent = "Bola masuk di sudut lapanganmu!";
        tone(240, 0.16);
      }
      rally = 0;
      if (rlEl) rlEl.textContent = "Rally: 0x";
      scEl.textContent = `${pScore} : ${bScore}`;
      if (pScore >= 5 || bScore >= 5) {
        finished = true; stopLoop();
        const win = pScore >= 5;
        const rallyBonus = Math.min(8, Math.floor(maxRally / 3));
        const coin = rewardPlayer((win ? 20 : 8) + rallyBonus, win ? "Juara Padel Club Gasibu" : "Latihan Padel Gasibu", "padel");
        stEl.innerHTML = `<b style="color:#fde047;">${win ? "🏆 JUARA PADEL CLUB!" : "Pertandingan Selesai!"} (Max Rally ${maxRally}x) +🪙 ${coin} Koin!</b>`;
        showArcadeEndOverlay(document.getElementById("pd-card"), playPadel);
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

    function step(now) {
      const dtScale = Math.min(2.2, Math.max(0.3, (((now || performance.now()) - lastNow) / 1000) * 60));
      lastNow = now || performance.now();

      p.swing = Math.max(0, p.swing - 0.08 * dtScale);
      bot.swing = Math.max(0, bot.swing - 0.08 * dtScale);
      smashBanner = Math.max(0, smashBanner - 0.03 * dtScale);

      // Gerak karakter pemain mulus ke jari
      p.x += (p.targetX - p.x) * Math.min(1, 0.28 * dtScale);
      p.y += (p.targetY - p.y) * Math.min(1, 0.28 * dtScale);

      // Auto-swing saat bola mendekat ke pemain (radius lebih menantang)
      if (ball.state === "fly_to_p" && Math.hypot(ball.x - p.x, ball.y - p.y) < 36) {
        launchBall(false);
      }

      // Gerak bot lawan
      const botTargetX = ball.state === "fly_to_bot" ? ball.x : 170;
      bot.x += (botTargetX - bot.x) * Math.min(1, (isPro ? 0.082 : 0.056) * dtScale);
      bot.x = Math.max(82, Math.min(258, bot.x));

      if (ball.state === "fly_to_bot" || ball.state === "fly_to_p") {
        ball.x += ball.vx * dtScale;
        ball.y += ball.vy * dtScale;
        ball.z = Math.max(0, ball.z + ball.vz * dtScale);
        ball.vz -= 0.055 * dtScale;
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

      // Garis putih lapangan padel + pola grid karpet halus
      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
      for (let gy = 56; gy < 250; gy += 28) {
        const hw = getCourtHalfWidthAtY(gy);
        ctx.beginPath(); ctx.moveTo(170 - hw, gy); ctx.lineTo(170 + hw, gy); ctx.stroke();
      }
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
      drawPadelPlayer(ctx, p.x, p.y, "#eab308", "#0f172a", p.swing, false);

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
        const s = sparks[i]; s.x += s.vx * dtScale; s.y += s.vy * dtScale; s.life -= 0.06 * dtScale;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = s.col; ctx.globalAlpha = s.life;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (smashBanner > 0) {
        ctx.globalAlpha = Math.min(1, smashBanner * 1.4);
        ctx.fillStyle = "#fde047";
        ctx.font = "900 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🔥 BANDEJA SMASH!", 170, 120 - (1 - smashBanner) * 14);
        ctx.globalAlpha = 1;
      }

      if (!finished) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 2. ANGKOT NGEBUT SURAPATI (3 NYAWA + COMBO + SWIPE) =================
  function playAngkot() {
    const modal = document.getElementById("piraku-games-modal");
    const playerName = getActiveCitizenLabel();
    const isPro = selectedMode === "pro";
    modal.innerHTML = `
      <div id="ak-card" style="width:100%;max-width:390px;background:#0f172a;border:2px solid #22c55e;border-radius:22px;padding:12px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#4ade80;">🚐 ${playerName} • Cicaheum–Ledeng</span>
          <button id="ak-back" style="background:#1e293b;border:none;color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:6px;">
          <span id="ak-score" style="color:#fde047;">Warga: 0 • Combo 0x</span>
          <span id="ak-lives" style="color:#f87171;">❤️❤️❤️</span>
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
    let lane = 1, curX = lanes[1], objs = [], popups = [], pax = 0, combo = 0, lives = 3, start = performance.now(), dash = 0, over = false;
    let swipeStartX = null;

    function goLeft() { if (!over && lane > 0) { lane--; tone(480, 0.06); } }
    function goRight() { if (!over && lane < 2) { lane++; tone(520, 0.06); } }
    document.getElementById("ak-l").onclick = goLeft;
    document.getElementById("ak-r").onclick = goRight;

    cv.addEventListener("pointerdown", e => {
      swipeStartX = e.clientX;
      const rect = cv.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 330;
      const targetLane = nx < 125 ? 0 : nx > 205 ? 2 : 1;
      if (targetLane !== lane) { lane = targetLane; tone(500, 0.06); }
    });
    cv.addEventListener("pointermove", e => {
      if (swipeStartX === null) return;
      const dx = e.clientX - swipeStartX;
      if (dx > 28) { goRight(); swipeStartX = e.clientX; }
      else if (dx < -28) { goLeft(); swipeStartX = e.clientX; }
    });
    cv.addEventListener("pointerup", () => { swipeStartX = null; });

    function calcEarned() {
      return Math.min(24, 6 + pax * 2);
    }

    function finishAngkot(crashed) {
      over = true; stopLoop();
      const coin = rewardPlayer(calcEarned(), "Narik Angkot Surapati (" + pax + " warga)", "angkot");
      document.getElementById("ak-score").textContent = `${crashed ? "💥 Mogok!" : "Selesai!"} +🪙 ${coin} Koin`;
      showArcadeEndOverlay(document.getElementById("ak-card"), playAngkot);
    }

    let akLastNow = performance.now();
    function step(now) {
      const dtScale = Math.min(2.2, Math.max(0.3, (((now || performance.now()) - akLastNow) / 1000) * 60));
      akLastNow = now || performance.now();
      const rem = Math.max(0, 25 - Math.floor((now - start) / 1000));
      document.getElementById("ak-time").textContent = "⏱️ " + rem + "d";
      if (rem <= 0 && !over) {
        finishAngkot(false);
        return;
      }

      const spd = ((isPro ? 5.6 : 4.3) + Math.min(1.6, pax * 0.08)) * dtScale;
      dash = (dash + spd * 1.4) % 44;
      curX += (lanes[lane] - curX) * Math.min(1, 0.26 * dtScale);

      if (Math.random() < (isPro ? 0.058 : 0.048) * dtScale) {
        const l = Math.floor(Math.random() * 3);
        if (!objs.some(o => o.lane === l && o.y < 36)) {
          objs.push({ lane: l, y: -35, type: Math.random() < 0.62 ? "pax" : "cone" });
        }
      }

      ctx.clearRect(0, 0, 330, 290);
      ctx.fillStyle = "#14532d"; ctx.fillRect(0, 0, 42, 290); ctx.fillRect(288, 0, 42, 290);
      ctx.fillStyle = "#94a3b8"; ctx.fillRect(36, 0, 8, 290); ctx.fillRect(286, 0, 8, 290);

      ctx.fillStyle = "#1e293b"; ctx.fillRect(44, 0, 242, 290);
      // Efek garis kecepatan tipis di aspal
      ctx.strokeStyle = "rgba(148,163,184,0.12)"; ctx.lineWidth = 1;
      for (let sy = (dash * 2) % 60 - 60; sy < 290; sy += 60) {
        ctx.beginPath(); ctx.moveTo(64, sy); ctx.lineTo(64, sy + 24); ctx.moveTo(266, sy + 20); ctx.lineTo(266, sy + 44); ctx.stroke();
      }
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
            combo++;
            const bonus = combo >= 3 ? 2 : 1;
            pax += bonus;
            tone(720 + Math.min(200, combo * 25), 0.09);
            popups.push({ x: curX, y: 205, text: combo >= 3 ? `🔥 Combo ${combo}x!` : "+1 Warga", life: 1 });
          } else {
            combo = 0;
            lives--;
            document.getElementById("ak-lives").textContent = "❤️".repeat(Math.max(0, lives)) + "🖤".repeat(Math.max(0, 3 - lives));
            tone(190, 0.16);
            popups.push({ x: curX, y: 205, text: "💥 Tabrak!", life: 1 });
            if (lives <= 0) {
              objs.splice(i, 1);
              finishAngkot(true);
              return;
            }
          }
          document.getElementById("ak-score").textContent = `Warga: ${pax} • Combo ${combo}x`;
          objs.splice(i, 1);
        } else if (o.y > 320) objs.splice(i, 1);
      }

      ctx.fillStyle = "rgba(254,240,138,0.24)";
      ctx.beginPath(); ctx.moveTo(curX - 15, 208); ctx.lineTo(curX - 28, 158); ctx.lineTo(curX + 28, 158); ctx.lineTo(curX + 15, 208); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.beginPath(); ctx.roundRect(curX - 19, 210, 42, 60, 8); ctx.fill();
      ctx.fillStyle = "#16a34a"; ctx.beginPath(); ctx.roundRect(curX - 21, 206, 42, 60, 8); ctx.fill();
      ctx.fillStyle = "#facc15"; ctx.fillRect(curX - 21, 230, 42, 12);
      ctx.fillStyle = "#e2e8f0"; ctx.beginPath(); ctx.roundRect(curX - 16, 224, 32, 34, 5); ctx.fill();
      ctx.fillStyle = "#0f172a"; ctx.font = "bold 6.5px sans-serif"; ctx.textAlign = "center"; ctx.fillText("CICAHEUM", curX, 244);
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

  // ================= 3. MANCING KOLAM TAMAN LANSIA (3 JENIS IKAN + BERONTAK + PUTUS SENAR) =================
  function playFishing() {
    const modal = document.getElementById("piraku-games-modal");
    const playerName = getActiveCitizenLabel();
    const isPro = selectedMode === "pro";
    const fishRoll = Math.random();
    const fishSpec = fishRoll > 0.78
      ? { name: "Koi Naga Emas Langka", col: "#facc15", coin: 26, pull: 1.55, speed: 0.44 }
      : fishRoll > 0.35
        ? { name: "Koi Kohaku Taman Lansia", col: "#f97316", coin: 18, pull: 1.32, speed: 0.50 }
        : { name: "Mujair Segar Bandung", col: "#94a3b8", coin: 12, pull: 1.15, speed: 0.58 };

    modal.innerHTML = `
      <div id="fs-card" style="width:100%;max-width:390px;background:linear-gradient(180deg,#082f49,#0f172a);border:2px solid #38bdf8;border-radius:22px;padding:12px;color:#fff;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#7dd3fc;">🎣 ${playerName} • ${fishSpec.name}</span>
          <button id="fs-back" style="background:rgba(15,23,42,0.75);border:1px solid rgba(148,163,184,0.3);color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div id="fs-info" style="background:rgba(2,132,199,0.2);border:1px solid rgba(56,189,248,0.3);border-radius:9px;padding:6px 8px;font-size:11.5px;font-weight:700;color:#fde047;margin-bottom:7px;text-align:center;">Tahan tombol agar indikator tetap di <b>Zona Hijau</b>!</div>
        <canvas id="fs-cv" style="width:100%;height:250px;border-radius:14px;display:block;margin-bottom:8px;touch-action:none;"></canvas>
        <div id="fs-result" style="display:none;padding:10px 12px;border-radius:12px;background:rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.4);text-align:center;margin-bottom:4px;"></div>
        <button id="fs-hold" style="width:100%;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;font-size:14px;font-weight:900;cursor:pointer;user-select:none;touch-action:none;box-shadow:0 6px 18px rgba(34,197,94,0.35);">🎣 TAHAN UNTUK TARIK JORAN</button>
      </div>`;
    modal.querySelector("#fs-back").onclick = () => openGameLobby("fishing");
    const cv = document.getElementById("fs-cv");
    const ctx = setupHiDPI(cv, 330, 250);
    const holdBtn = document.getElementById("fs-hold");
    const resBox = document.getElementById("fs-result");
    let holding = false, bar = 48, progress = 20, tension = 100, fishX = 165, t = 0, done = false, fsLastNow = performance.now();
    const bubbles = Array.from({ length: 12 }, () => ({ x: 30 + Math.random() * 270, y: 40 + Math.random() * 130, r: 1.5 + Math.random() * 2.5, s: 0.3 + Math.random() * 0.5 }));

    const startHold = e => { if (done) return; e.preventDefault(); holding = true; holdBtn.style.transform = "scale(0.98)"; };
    const endHold = () => { holding = false; holdBtn.style.transform = "scale(1)"; };
    holdBtn.addEventListener("pointerdown", startHold);
    cv.addEventListener("pointerdown", startHold);
    window.addEventListener("pointerup", endHold);
    window.addEventListener("pointercancel", endHold);

    function step(now) {
      const dtScale = Math.min(2.2, Math.max(0.3, (((now || performance.now()) - fsLastNow) / 1000) * 60));
      fsLastNow = now || performance.now();
      t += 0.06 * dtScale;
      const surge = Math.sin(t * 1.9) > 0.72 ? 1.55 : 1.0; // Ikan sesekali berontak!
      const pullForce = isPro ? 1.85 : 1.6;
      bar += (holding ? pullForce : -(fishSpec.pull * surge * (isPro ? 1.25 : 1.0))) * dtScale;
      bar = Math.max(0, Math.min(100, bar));
      const inZone = bar >= 30 && bar <= 72;
      progress += (inZone ? fishSpec.speed : -0.25) * dtScale;
      progress = Math.max(0, progress);
      if (!inZone) tension = Math.max(0, tension - 0.55 * dtScale);
      else tension = Math.min(100, tension + 0.15 * dtScale);
      fishX = 165 + Math.sin(t * (surge > 1 ? 3.8 : 2.1)) * 78;

      // Latar air kolam Taman Lansia dengan gradasi kedalaman
      const waterGrad = ctx.createLinearGradient(0, 0, 0, 250);
      waterGrad.addColorStop(0, "#0ea5e9");
      waterGrad.addColorStop(0.22, "#0284c7");
      waterGrad.addColorStop(0.75, "#075985");
      waterGrad.addColorStop(1, "#082f49");
      ctx.fillStyle = waterGrad; ctx.fillRect(0, 0, 330, 250);

      // Dermaga kayu & batu tepi kolam di bagian atas
      ctx.fillStyle = "#334155"; ctx.fillRect(0, 0, 330, 22);
      ctx.fillStyle = "#78350f"; ctx.fillRect(110, 0, 110, 24);
      ctx.fillStyle = "#92400e";
      for (let px = 114; px < 216; px += 18) ctx.fillRect(px, 2, 14, 20);

      // Sinar matahari menembus air
      ctx.fillStyle = "rgba(186,230,253,0.08)";
      [75, 165, 255].forEach((rx, ri) => {
        ctx.beginPath();
        ctx.moveTo(rx - 14, 22); ctx.lineTo(rx + 14, 22);
        ctx.lineTo(rx + 46 + Math.sin(t + ri) * 8, 172); ctx.lineTo(rx - 22 + Math.sin(t + ri) * 8, 172);
        ctx.closePath(); ctx.fill();
      });

      // Rumput air bergoyang di dasar kolam
      ctx.strokeStyle = "rgba(21,128,61,0.75)"; ctx.lineWidth = 3; ctx.lineCap = "round";
      [34, 64, 128, 210, 268, 298].forEach((wx, wi) => {
        ctx.beginPath();
        ctx.moveTo(wx, 175);
        ctx.quadraticCurveTo(wx + Math.sin(t * 1.4 + wi) * 9, 152, wx + Math.cos(t * 1.2 + wi) * 6, 134);
        ctx.stroke();
      });

      // Gelembung udara naik
      bubbles.forEach(b => {
        b.y -= b.s * dtScale;
        if (b.y < 26) { b.y = 165; b.x = 30 + Math.random() * 270; }
        ctx.fillStyle = "rgba(224,242,254,0.35)";
        ctx.beginPath(); ctx.arc(b.x + Math.sin(t + b.y * 0.05) * 2, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      });

      // Daun teratai & bunga pink
      [[48, 48, 18], [282, 54, 20]].forEach(([lx, ly, lr]) => {
        ctx.fillStyle = "#15803d"; ctx.beginPath(); ctx.arc(lx, ly, lr, 0.25, Math.PI * 1.9); ctx.lineTo(lx, ly); ctx.fill();
        ctx.fillStyle = "#f472b6"; ctx.beginPath(); ctx.arc(lx + 4, ly - 3, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(lx + 4, ly - 3, 2, 0, Math.PI * 2); ctx.fill();
      });

      // Riak air di sekitar ikan
      ctx.strokeStyle = surge > 1 ? "rgba(248,113,113,0.8)" : (inZone ? "rgba(74,222,128,0.65)" : "rgba(186,230,253,0.45)");
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.ellipse(fishX, 112, 30 + Math.sin(t * 4) * 8, 12, 0, 0, Math.PI * 2); ctx.stroke();

      // Visual Ikan Detail (Sirip, Badan, Corak Koi/Sisik, Mata)
      const facing = Math.cos(t * (surge > 1 ? 3.8 : 2.1)) >= 0 ? 1 : -1;
      const tailWag = Math.sin(t * 11) * 6;
      ctx.save();
      ctx.translate(fishX, 112);
      ctx.scale(facing, 1);
      ctx.fillStyle = fishSpec.col;
      ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-33, -10 + tailWag); ctx.lineTo(-33, 10 + tailWag); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, 22, 10.5, 0, 0, Math.PI * 2); ctx.fill();
      // Sirip punggung & perut
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath(); ctx.moveTo(-4, -9); ctx.lineTo(4, -15); ctx.lineTo(9, -8); ctx.closePath(); ctx.fill();
      // Corak belang koi
      ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.arc(-4, -1, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(7, -2, 4.2, 0, Math.PI * 2); ctx.fill();
      // Mata ikan
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(14, -3, 2.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(14.8, -3, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Joran bambu melengkung & senar pancing + pelampung
      const rodBend = holding ? 14 : 4;
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(165, 22); ctx.quadraticCurveTo(165, 36 + rodBend, 165 + (fishX - 165) * 0.12, 44 + rodBend); ctx.stroke();
      ctx.strokeStyle = surge > 1 ? "#fca5a5" : "rgba(255,255,255,0.85)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(165 + (fishX - 165) * 0.12, 44 + rodBend); ctx.quadraticCurveTo((165 + fishX) / 2, 74, fishX + facing * 16, 105); ctx.stroke();
      ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(fishX + facing * 16, 103, 4.5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(fishX + facing * 16, 103, 4.5, 0, Math.PI); ctx.fill();

      if (surge > 1) {
        ctx.fillStyle = "rgba(239,68,68,0.9)"; ctx.beginPath(); ctx.roundRect(102, 30, 126, 20, 999); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "900 10.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("⚡ IKAN BERONTAK!", 165, 44);
      }

      // Panel HUD Bawah Canvas (Daya Senar, Zona Tarik, Progress Tangkap)
      ctx.fillStyle = "rgba(15,23,42,0.88)"; ctx.beginPath(); ctx.roundRect(12, 170, 306, 72, 12); ctx.fill();
      ctx.fillStyle = "#e2e8f0"; ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "left"; ctx.fillText("🎯 Zona Aman", 22, 184);
      ctx.textAlign = "right";
      ctx.fillStyle = tension < 35 ? "#f87171" : "#4ade80";
      ctx.fillText("Daya Senar: " + Math.round(tension) + "%", 308, 184);

      // Bar Zona Tarik
      ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.roundRect(22, 190, 286, 20, 10); ctx.fill();
      ctx.fillStyle = inZone ? "#22c55e" : "#15803d"; ctx.fillRect(22 + 286 * 0.30, 190, 286 * 0.42, 20);
      ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.roundRect(22 + (bar / 100) * 276, 187, 10, 26, 4); ctx.fill();

      // Bar Progress Tangkap
      ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.roundRect(22, 218, 286, 14, 7); ctx.fill();
      ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.roundRect(22, 218, 286 * Math.max(0, Math.min(1, progress / 100)), 14, 7); ctx.fill();
      ctx.fillStyle = "#f8fafc"; ctx.font = "bold 9.5px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Progress Tangkap: " + Math.round(Math.min(100, progress)) + "%", 165, 228);

      if (tension <= 0 && !done) {
        done = true; holding = false; stopLoop();
        tone(190, 0.25);
        holdBtn.style.display = "none";
        document.getElementById("fs-info").innerHTML = `<span style="color:#f87171;">💥 Senar Putus! ${fishSpec.name} berhasil lolos!</span>`;
        resBox.style.display = "block";
        resBox.innerHTML = `<div style="font-size:14px;font-weight:900;color:#f87171;margin-bottom:3px;">💥 Senar Putus!</div><div style="font-size:11.5px;color:#cbd5e1;">Jaga indikator di zona hijau agar senar tidak kehilangan daya.</div>`;
        showArcadeEndOverlay(document.getElementById("fs-card"), playFishing);
        return;
      }

      if (progress >= 100 && !done) {
        done = true; holding = false; stopLoop();
        const coin = rewardPlayer(fishSpec.coin, "Dapat " + fishSpec.name, "fishing");
        const xpEarned = Math.max(15, Math.round(coin * 1.2));
        holdBtn.style.display = "none";
        document.getElementById("fs-info").innerHTML = `<span style="color:#4ade80;">🎉 Berhasil Menangkap ${fishSpec.name}!</span>`;
        resBox.style.display = "block";
        resBox.innerHTML = `<div style="font-size:14px;font-weight:900;color:#fde047;margin-bottom:3px;">🏆 Dapat ${fishSpec.name}!</div><div style="font-size:12px;color:#4ade80;font-weight:800;">+🪙 ${coin} Koin Piraku &amp; +${xpEarned} XP</div>`;
        showArcadeEndOverlay(document.getElementById("fs-card"), playFishing);
        return;
      }
      if (!done) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 4. BAKAR SATE GEDUNG SATE (TIMER 35D + MAX 2 GOSONG + PERFECT BONUS) =================
  function playSate() {
    const modal = document.getElementById("piraku-games-modal");
    const playerName = getActiveCitizenLabel();
    const isPro = selectedMode === "pro";
    modal.innerHTML = `
      <div id="st-card" style="width:100%;max-width:390px;background:#0f172a;border:2px solid #f59e0b;border-radius:22px;padding:12px;color:#fff;text-align:center;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#f59e0b;">🍢 ${playerName} • Sate Gedung Sate</span>
          <span id="st-time" style="font-size:11.5px;font-weight:800;color:#38bdf8;">⏱️ 35d</span>
          <button id="st-back" style="background:#1e293b;border:none;color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div id="st-msg" style="font-size:11.5px;color:#cbd5e1;margin-bottom:6px;">Angkat 3 porsi di zona <b>72%–92%</b> (🔥 PERFECT 79%–86%)!</div>
        <canvas id="st-cv" style="width:100%;height:220px;border-radius:14px;display:block;margin-bottom:10px;"></canvas>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="st-fan" style="padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#ea580c,#dc2626);color:#fff;font-weight:800;cursor:pointer;">🪭 Kipas Bara</button>
          <button id="st-serve" style="padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#0f172a;font-weight:900;cursor:pointer;">🍽️ Angkat & Sajikan!</button>
        </div>
      </div>`;
    modal.querySelector("#st-back").onclick = () => openGameLobby("sate");
    const cv = document.getElementById("st-cv");
    const ctx = setupHiDPI(cv, 330, 220);
    let cook = 0, heat = 0.36, served = 0, burns = 0, perfects = 0, over = false, smokes = [], embers = [], t = 0, start = performance.now();

    document.getElementById("st-fan").onclick = () => {
      if (over) return;
      heat = Math.min(1.5, heat + (isPro ? 0.44 : 0.38));
      tone(460, 0.07);
      for (let i = 0; i < 7; i++) {
        smokes.push({ x: 75 + Math.random() * 180, y: 128, vy: -1.3 - Math.random(), r: 6 + Math.random() * 6, a: 0.55 });
        embers.push({ x: 75 + Math.random() * 180, y: 132, vx: (Math.random() - 0.5) * 2.5, vy: -2 - Math.random() * 2, life: 1 });
      }
    };

    document.getElementById("st-serve").onclick = () => {
      if (over) return;
      if (cook >= 72 && cook <= 92) {
        served++;
        const isPerf = cook >= 79 && cook <= 86;
        if (isPerf) perfects++;
        tone(isPerf ? 880 : 740, 0.14);
        document.getElementById("st-msg").innerHTML = `<b style="color:#4ade80;">${isPerf ? "🔥 PERFECT!" : "Matang Pas!"} (${served}/3 porsi)</b>`;
        if (served >= 3) {
          over = true; stopLoop();
          const coin = rewardPlayer(18 + perfects * 3, "Sate Gedung Sate (" + perfects + " Perfect)", "sate");
          document.getElementById("st-msg").innerHTML = `<b style="color:#fde047;">🎉 3 Porsi Ludes! +🪙 ${coin} Koin masuk dompet!</b>`;
          showArcadeEndOverlay(document.getElementById("st-card"), playSate);
        }
      } else {
        if (cook > 92) burns++;
        tone(210, 0.15);
        if (burns >= 2) {
          over = true; stopLoop();
          const coin = rewardPlayer(10 + served * 6, "Sate Gosong Gedung Sate", "sate");
          document.getElementById("st-msg").innerHTML = `<b style="color:#f87171;">💨 Terlalu banyak gosong! Dapat +🪙 ${coin} Koin.</b>`;
          showArcadeEndOverlay(document.getElementById("st-card"), playSate);
        } else {
          document.getElementById("st-msg").innerHTML = `<b style="color:#f87171;">${cook < 72 ? "Masih mentah!" : "Kegosongan (" + burns + "/2)!"} Coba tusukan baru!</b>`;
        }
      }
      cook = 0; heat = 0.36;
    };

    let stLastNow = performance.now();
    function step(now) {
      const dtScale = Math.min(2.2, Math.max(0.3, (((now || performance.now()) - stLastNow) / 1000) * 60));
      stLastNow = now || performance.now();
      const rem = Math.max(0, 35 - Math.floor((now - start) / 1000));
      const tEl = document.getElementById("st-time");
      if (tEl) tEl.textContent = "⏱️ " + rem + "d";
      if (rem <= 0 && !over) {
        over = true; stopLoop();
        const coin = rewardPlayer(10 + served * 8, "Sate Gedung Sate (" + served + "/3 porsi)", "sate");
        document.getElementById("st-msg").innerHTML = `<b style="color:#fde047;">⏱️ Waktu Habis! (${served}/3 porsi) +🪙 ${coin} Koin!</b>`;
        showArcadeEndOverlay(document.getElementById("st-card"), playSate);
        return;
      }

      t += 0.08 * dtScale;
      cook = Math.min(100, cook + heat * (isPro ? 1.2 : 0.98) * dtScale);
      heat = Math.max(0.26, heat * Math.pow(0.985, dtScale));
      if (Math.random() < 0.25 * dtScale) smokes.push({ x: 80 + Math.random() * 170, y: 118, vy: -1.1, r: 5, a: 0.38 });

      ctx.clearRect(0, 0, 330, 220);
      const sky = ctx.createLinearGradient(0, 0, 0, 220);
      sky.addColorStop(0, "#0f172a"); sky.addColorStop(1, "#1e293b");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, 330, 220);

      // Siluet Gedung Sate Bandung dengan tusuk sate ikonik & jendela hangat
      ctx.fillStyle = "rgba(56,189,248,0.12)";
      ctx.fillRect(86, 44, 158, 76);
      ctx.fillRect(115, 30, 100, 90);
      ctx.fillRect(145, 15, 40, 20);
      ctx.fillRect(163, 2, 4, 15);
      ctx.fillStyle = "rgba(253,224,71,0.26)";
      for (let wx = 124; wx <= 198; wx += 18) {
        ctx.fillRect(wx, 42, 7, 10);
        ctx.fillRect(wx, 60, 7, 10);
      }

      ctx.fillStyle = "#090d16"; ctx.beginPath(); ctx.roundRect(45, 118, 240, 48, 8); ctx.fill();
      for (let bx = 62; bx < 268; bx += 18) {
        const glow = 0.55 + Math.sin(t + bx) * 0.35 * heat;
        ctx.fillStyle = `rgba(249,115,22,${Math.min(1, glow)})`;
        ctx.beginPath(); ctx.arc(bx, 136, 7.5, 0, Math.PI * 2); ctx.fill();
      }

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

      ctx.fillStyle = "#090d16"; ctx.beginPath(); ctx.roundRect(35, 182, 260, 20, 9); ctx.fill();
      ctx.fillStyle = "rgba(34,197,94,0.55)"; ctx.fillRect(35 + 260 * 0.72, 182, 260 * 0.20, 20);
      ctx.fillStyle = "rgba(250,204,21,0.75)"; ctx.fillRect(35 + 260 * 0.79, 182, 260 * 0.07, 20);
      ctx.fillStyle = cook > 92 ? "#ef4444" : "#f59e0b";
      ctx.beginPath(); ctx.roundRect(35, 182, 260 * (cook / 100), 20, 9); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Matang: " + Math.round(cook) + "% (Target 72–92%)", 165, 196);

      if (!over) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 5. ADU PENALTI STADION GBLA (5 TENDANGAN BOBOTOH) =================
  function playPenaltyGBLA() {
    const modal = document.getElementById("piraku-games-modal");
    const playerName = getActiveCitizenLabel();
    const isPro = selectedMode === "pro";
    modal.innerHTML = `
      <div id="pk-card" style="width:100%;max-width:390px;background:linear-gradient(180deg,#064e3b,#0f172a);border:2px solid #4ade80;border-radius:22px;padding:12px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#4ade80;">⚽ ${playerName} • Stadion GBLA</span>
          <button id="pk-back" style="background:#1e293b;border:none;color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Lobi</button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:800;margin-bottom:6px;">
          <span id="pk-score" style="color:#fde047;">Gol: 0 / 5</span>
          <span id="pk-dots" style="font-size:13px;letter-spacing:2px;">⚪⚪⚪⚪⚪</span>
        </div>
        <div id="pk-msg" style="background:rgba(15,23,42,0.75);border-radius:8px;padding:5px;text-align:center;font-size:11px;color:#cbd5e1;margin-bottom:6px;">Pilih sudut gawang (Kiri / Tengah / Kanan) untuk menendang!</div>
        <canvas id="pk-cv" style="width:100%;height:245px;border-radius:14px;display:block;margin-bottom:8px;touch-action:none;"></canvas>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;">
          <button id="pk-l" style="padding:11px 6px;border-radius:11px;border:none;background:#2563eb;color:#fff;font-weight:900;font-size:12px;cursor:pointer;">↖ Kiri</button>
          <button id="pk-c" style="padding:11px 6px;border-radius:11px;border:none;background:#0284c7;color:#fff;font-weight:900;font-size:12px;cursor:pointer;">⬆ Tengah</button>
          <button id="pk-r" style="padding:11px 6px;border-radius:11px;border:none;background:#2563eb;color:#fff;font-weight:900;font-size:12px;cursor:pointer;">Kanan ↗</button>
        </div>
      </div>`;
    modal.querySelector("#pk-back").onclick = () => openGameLobby("penalty");
    const cv = document.getElementById("pk-cv");
    const ctx = setupHiDPI(cv, 330, 245);
    const goalXs = [92, 165, 238];
    let shot = 0, goals = 0, results = [], over = false, anim = null;
    let keeperX = 165, keeperTargetX = 165, ball = { x: 165, y: 212, scale: 1 };

    function shoot(dirIdx) {
      if (over || anim) return;
      const keeperIdx = Math.random() < (isPro ? 0.42 : 0.30) ? dirIdx : Math.floor(Math.random() * 3);
      keeperTargetX = goalXs[keeperIdx];
      const startX = 165, startY = 212;
      const endX = goalXs[dirIdx], endY = 74;
      const t0 = performance.now();
      tone(520, 0.1);
      anim = { startX, startY, endX, endY, t0, dirIdx, keeperIdx };
    }

    document.getElementById("pk-l").onclick = () => shoot(0);
    document.getElementById("pk-c").onclick = () => shoot(1);
    document.getElementById("pk-r").onclick = () => shoot(2);
    cv.addEventListener("pointerdown", e => {
      const rect = cv.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 330;
      shoot(nx < 128 ? 0 : nx > 202 ? 2 : 1);
    });

    let pkLastNow = performance.now(), goalFlash = 0;
    function step(now) {
      const dtScale = Math.min(2.2, Math.max(0.3, (((now || performance.now()) - pkLastNow) / 1000) * 60));
      pkLastNow = now || performance.now();
      goalFlash = Math.max(0, goalFlash - 0.04 * dtScale);

      if (anim) {
        const prog = Math.min(1, (now - anim.t0) / 420);
        const ease = 1 - Math.pow(1 - prog, 2);
        ball.x = anim.startX + (anim.endX - anim.startX) * ease;
        ball.y = anim.startY + (anim.endY - anim.startY) * ease - Math.sin(prog * Math.PI) * 26;
        ball.scale = 1 - ease * 0.42;
        keeperX += (keeperTargetX - keeperX) * Math.min(1, 0.22 * dtScale);

        if (prog >= 1) {
          const isGoal = anim.dirIdx !== anim.keeperIdx;
          shot++;
          if (isGoal) {
            goals++;
            goalFlash = 1.0;
            results.push("🟢");
            tone(840, 0.18);
            document.getElementById("pk-msg").innerHTML = `<b style="color:#4ade80;">⚽ GOOOL! Bobotoh GBLA bersorak!</b>`;
          } else {
            results.push("🔴");
            tone(210, 0.18);
            document.getElementById("pk-msg").innerHTML = `<b style="color:#f87171;">🧤 Ditepis Kiper!</b>`;
          }
          document.getElementById("pk-score").textContent = `Gol: ${goals} / 5`;
          document.getElementById("pk-dots").textContent = results.join("") + "⚪".repeat(5 - results.length);
          anim = null;

          if (shot >= 5) {
            over = true; stopLoop();
            const coin = rewardPlayer(6 + goals * 3, "Adu Penalti GBLA (" + goals + "/5 Gol)", "penalty");
            document.getElementById("pk-msg").innerHTML = `<b style="color:#fde047;">🏆 Selesai (${goals}/5 Gol)! +🪙 ${coin} Koin masuk dompet!</b>`;
            showArcadeEndOverlay(document.getElementById("pk-card"), playPenaltyGBLA);
            return;
          }
          setTimeout(() => {
            if (!over) { ball = { x: 165, y: 212, scale: 1 }; keeperX = 165; keeperTargetX = 165; }
          }, 360);
        }
      }

      // Render Stadion GBLA
      ctx.clearRect(0, 0, 330, 245);
      ctx.fillStyle = "#090d16"; ctx.fillRect(0, 0, 330, 88);
      // Lampu sorot stadion GBLA malam hari
      [48, 282].forEach(lx => {
        const fl = ctx.createRadialGradient(lx, 8, 2, lx, 80, 125);
        fl.addColorStop(0, "rgba(255,255,255,0.22)");
        fl.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = fl; ctx.fillRect(0, 0, 330, 130);
      });
      // Tribun Bobotoh
      ctx.fillStyle = "#1d4ed8"; ctx.fillRect(0, 26, 330, 36);
      for (let bx = 10; bx < 325; bx += 14) {
        ctx.fillStyle = bx % 28 === 0 ? "#facc15" : "#93c5fd";
        ctx.beginPath(); ctx.arc(bx, 38 + (bx % 3) * 4, 2.6, 0, Math.PI * 2); ctx.fill();
      }
      // Rumput Lapangan
      ctx.fillStyle = "#15803d"; ctx.fillRect(0, 88, 330, 157);
      ctx.fillStyle = "#166534"; ctx.fillRect(0, 128, 330, 38);
      ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2;
      ctx.strokeRect(40, 88, 250, 90);

      // Gawang & Jaring
      ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(62, 46, 206, 46);
      ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1;
      for (let gx = 74; gx < 268; gx += 16) {
        ctx.beginPath(); ctx.moveTo(gx, 46); ctx.lineTo(gx, 92); ctx.stroke();
      }
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(62, 92); ctx.lineTo(62, 46); ctx.lineTo(268, 46); ctx.lineTo(268, 92); ctx.stroke();

      // Kiper Lawan
      ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.roundRect(keeperX - 11, 64, 22, 22, 5); ctx.fill();
      ctx.fillStyle = "#fed7aa"; ctx.beginPath(); ctx.arc(keeperX, 58, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(keeperX - 14, 70, 4, 0, Math.PI * 2); ctx.arc(keeperX + 14, 70, 4, 0, Math.PI * 2); ctx.fill();

      // Bola
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath(); ctx.ellipse(ball.x, ball.y + 8 * ball.scale, 10 * ball.scale, 4 * ball.scale, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(ball.x, ball.y, 9.5 * ball.scale, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.beginPath(); ctx.arc(ball.x, ball.y, 3.6 * ball.scale, 0, Math.PI * 2); ctx.fill();

      if (goalFlash > 0) {
        ctx.globalAlpha = Math.min(1, goalFlash * 1.4);
        ctx.fillStyle = "#4ade80";
        ctx.font = "900 22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⚽ GOOOL!", 165, 136 - (1 - goalFlash) * 16);
        ctx.globalAlpha = 1;
      }

      if (!over) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 5. KURIR & OJOL BANDUNG 3D (LINTAS PETA: PUSAT KOTA -> KOMPLEK KECAMATAN) =================
  const OJOL_PICKUP_SPOTS = [
    { name: "Depan Hotel Pullman Gasibu", x: -28, z: -12, icon: "🏨" },
    { name: "Gerbang Gedung Sate", x: 0, z: 7, icon: "🏛️" },
    { name: "Taman Lansia Cisangkuy", x: 34, z: -10, icon: "🌳" },
    { name: "Koridor Jl. Surapati", x: -14, z: -26, icon: "🛣️" }
  ];

  const OJOL_DISTRICTS = [
    { id: "coblong", name: "Coblong" },
    { id: "sumur_bandung", name: "Sumur Bandung" },
    { id: "lengkong", name: "Lengkong" },
    { id: "antapani", name: "Antapani" },
    { id: "buahbatu", name: "Buahbatu" },
    { id: "cidadap", name: "Cidadap" }
  ];

  const OJOL_DISTRICT_SPOTS = [
    { name: "Bundaran Tugu Komplek", x: 0, z: -9, icon: "🎡" },
    { name: "Area Mushola Komplek", x: -26, z: -18, icon: "🕌" },
    { name: "Pujasera Timur Komplek", x: 26, z: -18, icon: "☕" },
    { name: "Pojok Selatan Komplek", x: 18, z: 18, icon: "🏡" }
  ];

  const OJOL_CARGO = [
    { label: "Seblak Ceker Pedas", kind: "Kurir", pay: 20 },
    { label: "Penumpang Anak ITB", kind: "Ojol", pay: 24 },
    { label: "Batagor Kingsley", kind: "Kurir", pay: 20 },
    { label: "Kopi Susu Braga", kind: "Kurir", pay: 18 },
    { label: "Penumpang Wisatawan", kind: "Ojol", pay: 25 }
  ];

  let ojolState = {
    active: false,
    stage: "pickup", // pickup (bandung_wetan) -> travel (switch to district) -> dropoff (inside district)
    pickup: null,
    targetDistrict: null,
    dropoff: null,
    cargo: null,
    endMs: 0,
    beaconGroup: null,
    guideLine: null,
    lastSceneMapId: null,
    rafId: null
  };

  function ensureOjolHud() {
    let hud = document.getElementById("piraku-ojol-hud");
    if (!hud && document.body) {
      hud = document.createElement("div");
      hud.id = "piraku-ojol-hud";
      hud.style.cssText = "position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:46;display:none;flex-direction:column;gap:6px;padding:9px 13px;border-radius:16px;background:rgba(15,23,42,0.94);backdrop-filter:blur(10px);border:1.5px solid rgba(74,222,128,0.75);color:#f8fafc;font-size:11.5px;font-weight:800;box-shadow:0 12px 30px rgba(0,0,0,0.65);min-width:265px;max-width:92vw;";
      document.body.appendChild(hud);
    }
    return hud;
  }

  function clearOjol3DMeshes() {
    if (ojolState.beaconGroup && ojolState.beaconGroup.parent) {
      ojolState.beaconGroup.parent.remove(ojolState.beaconGroup);
    }
    if (ojolState.guideLine && ojolState.guideLine.parent) {
      ojolState.guideLine.parent.remove(ojolState.guideLine);
    }
    ojolState.beaconGroup = null;
    ojolState.guideLine = null;
  }

  function makeOjolSignTexture(text, bgHex, borderHex) {
    const THREE = window.THREE;
    const cv = document.createElement("canvas");
    cv.width = 512; cv.height = 128;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = bgHex;
    ctx.beginPath(); ctx.roundRect(6, 6, 500, 116, 24); ctx.fill();
    ctx.strokeStyle = borderHex;
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.roundRect(6, 6, 500, 116, 24); ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 64);
    const tex = new THREE.CanvasTexture(cv);
    return new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  }

  function spawnOjolBeacon(targetSpot, isDropoff) {
    const sc = window.pirakuScene;
    const THREE = window.THREE;
    if (!sc || !THREE || !targetSpot) return;
    clearOjol3DMeshes();

    const col = isDropoff ? 0xfacc15 : 0x22c55e;
    const grp = new THREE.Group();

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.3, 1.95, 32),
      new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.09;

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 1.0, 16, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
    );
    beam.position.y = 8.0;

    const box = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.65, 0),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.65, metalness: 0.4, roughness: 0.2 })
    );
    box.position.y = 1.9;

    const signLabel = isDropoff ? "🏁 ANTAR KE SINI" : "📦 AMBIL ORDERAN";
    const sprite = new THREE.Sprite(
      makeOjolSignTexture(signLabel, isDropoff ? "rgba(120,53,15,0.95)" : "rgba(6,78,59,0.95)", isDropoff ? "#facc15" : "#4ade80")
    );
    sprite.scale.set(5.4, 1.35, 1);
    sprite.position.y = 4.2;

    grp.add(ring, beam, box, sprite);
    grp.position.set(targetSpot.x, 0, targetSpot.z);
    grp.userData = { box, ring, sprite };
    sc.add(grp);
    ojolState.beaconGroup = grp;

    // Garis Penuntun 3D Putus-Putus di atas tanah dari pemain ke titik tujuan
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.25, 0),
      new THREE.Vector3(targetSpot.x, 0.25, targetSpot.z)
    ]);
    const lineMat = new THREE.LineDashedMaterial({
      color: col,
      dashSize: 1.2,
      gapSize: 0.7,
      transparent: true,
      opacity: 0.9
    });
    const guideLine = new THREE.Line(lineGeo, lineMat);
    guideLine.computeLineDistances();
    sc.add(guideLine);
    ojolState.guideLine = guideLine;
  }

  window.stopOjol3DGame = function(silent) {
    ojolState.active = false;
    if (ojolState.rafId) { cancelAnimationFrame(ojolState.rafId); ojolState.rafId = null; }
    clearOjol3DMeshes();
    const hud = document.getElementById("piraku-ojol-hud");
    if (hud) hud.style.display = "none";
    if (!silent && typeof window.showToast === "function") {
      window.showToast("🛵 Misi Kurir & Ojol dihentikan.");
    }
  };

  window.startOjol3DGame = function() {
    if (typeof window.stopGasibuRace3D === "function") window.stopGasibuRace3D(true);
    if (window.pirakuInDistrict && typeof window.enterDistrictMap === "function") {
      window.enterDistrictMap("bandung_wetan");
    }
    const player = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (!player || !player.position) {
      if (typeof window.showToast === "function") {
        window.showToast("⚠️ Masuk/pilih karakter dulu untuk mulai narik Kurir & Ojol!");
      }
      return;
    }

    const pickup = OJOL_PICKUP_SPOTS[Math.floor(Math.random() * OJOL_PICKUP_SPOTS.length)];
    const targetDistrict = OJOL_DISTRICTS[Math.floor(Math.random() * OJOL_DISTRICTS.length)];
    const dropoff = OJOL_DISTRICT_SPOTS[Math.floor(Math.random() * OJOL_DISTRICT_SPOTS.length)];
    const cargo = OJOL_CARGO[Math.floor(Math.random() * OJOL_CARGO.length)];

    ojolState.active = true;
    ojolState.stage = "pickup";
    ojolState.pickup = pickup;
    ojolState.targetDistrict = targetDistrict;
    ojolState.dropoff = dropoff;
    ojolState.cargo = cargo;
    ojolState.lastSceneMapId = "bandung_wetan";
    ojolState.endMs = performance.now() + 70000; // 70 detik total perjalanan lintas peta

    spawnOjolBeacon(pickup, false);
    tone(660, 0.14);
    if (typeof window.showToast === "function") {
      window.showToast(`🛵 ORDER BARU: Ambil ${cargo.label} di ${pickup.name}, antar ke Kec. ${targetDistrict.name}!`);
    }

    const hud = ensureOjolHud();
    if (hud) hud.style.display = "flex";

    function tickOjol() {
      if (!ojolState.active) return;
      const p = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
      const curMapId = window.pirakuActiveMapId || (window.pirakuInDistrict ? "district" : "bandung_wetan");
      const nowMs = performance.now();
      const nowSec = nowMs * 0.001;

      // Jika sudah masuk ke kecamatan tujuan pada tahap travel -> langsung spawn suar tujuan di dalam komplek!
      if (ojolState.stage === "travel" && curMapId === ojolState.targetDistrict.id) {
        ojolState.stage = "dropoff";
        ojolState.lastSceneMapId = curMapId;
        spawnOjolBeacon(ojolState.dropoff, true);
        tone(740, 0.15);
        if (typeof window.showToast === "function") {
          window.showToast(`📍 Tiba di Kec. ${ojolState.targetDistrict.name}! Ikuti garis kuning ke ${ojolState.dropoff.name}!`);
        }
      }

      if (ojolState.beaconGroup && ojolState.beaconGroup.userData) {
        const { box, ring, sprite } = ojolState.beaconGroup.userData;
        if (box) {
          box.rotation.y += 0.05;
          box.position.y = 1.9 + Math.sin(nowSec * 3.5) * 0.25;
        }
        if (ring) {
          const s = 1 + Math.sin(nowSec * 4) * 0.12;
          ring.scale.set(s, s, 1);
        }
        if (sprite) {
          sprite.position.y = 4.2 + Math.sin(nowSec * 2.5) * 0.2;
        }
      }

      const activeTarget = ojolState.stage === "pickup" ? ojolState.pickup : (ojolState.stage === "dropoff" ? ojolState.dropoff : null);
      let distM = 0;
      let screenArrowDeg = 0;

      if (p && p.position && activeTarget) {
        const dx = activeTarget.x - p.position.x;
        const dz = activeTarget.z - p.position.z;
        distM = Math.hypot(dx, dz);

        // Update Garis Penuntun 3D dari kaki pemain langsung ke titik tujuan
        if (ojolState.guideLine && ojolState.guideLine.geometry) {
          const posAttr = ojolState.guideLine.geometry.attributes.position;
          posAttr.setXYZ(0, p.position.x, 0.25, p.position.z);
          posAttr.setXYZ(1, activeTarget.x, 0.25, activeTarget.z);
          posAttr.needsUpdate = true;
          ojolState.guideLine.computeLineDistances();
        }

        // Hitung sudut panah relatif terhadap kamera layar (isometrik) agar 0° = ke atas layar
        const cam = window.pirakuCamera || window.camera;
        if (cam && window.THREE) {
          const fwd = new window.THREE.Vector3();
          cam.getWorldDirection(fwd);
          fwd.y = 0;
          fwd.normalize();
          const right = new window.THREE.Vector3().crossVectors(fwd, new window.THREE.Vector3(0, 1, 0)).normalize();
          const projF = dx * fwd.x + dz * fwd.z;
          const projR = dx * right.x + dz * right.z;
          screenArrowDeg = Math.atan2(projR, projF) * (180 / Math.PI);
        } else {
          screenArrowDeg = Math.atan2(dx, -dz) * (180 / Math.PI);
        }

        if (distM < 3.2) {
          if (ojolState.stage === "pickup") {
            ojolState.stage = "travel";
            clearOjol3DMeshes();
            tone(780, 0.16);
            if (typeof window.showToast === "function") {
              window.showToast(`📦 ${ojolState.cargo.label} Terambil! Klik tombol Masuk Kec. ${ojolState.targetDistrict.name} di HUD atas!`);
            }
          } else if (ojolState.stage === "dropoff") {
            // Misi selesai 1x! Beri hadiah dan akhiri dengan rapi
            const pay = ojolState.cargo.pay;
            if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
              window.PirakuEconomy.addCoins(pay, "Antar " + ojolState.cargo.label + " ke " + ojolState.targetDistrict.name);
            }
            if (typeof window.grantPirakuXP === "function") {
              window.grantPirakuXP(40, "Selesai Orderan Lintas Kecamatan");
            }
            const doneCount = parseInt(localStorage.getItem("piraku_ojol_completed") || "0", 10) + 1;
            localStorage.setItem("piraku_ojol_completed", String(doneCount));
            tone(960, 0.25);
            if (typeof window.showToast === "function") {
              window.showToast(`🎉 ORDER SELESAI! ${ojolState.cargo.label} tiba di Kec. ${ojolState.targetDistrict.name} (+${pay} 🪙 & +40 XP)!`);
            }
            window.stopOjol3DGame(true);
            return;
          }
        }
      }

      const remSec = Math.max(0, (ojolState.endMs - nowMs) / 1000);
      if (remSec <= 0) {
        tone(220, 0.28);
        if (typeof window.showToast === "function") {
          window.showToast("⏱️ Waktu Habis! Orderan dibatalkan pelanggan.");
        }
        window.stopOjol3DGame(true);
        return;
      }

      if (hud) {
        if (ojolState.stage === "travel") {
          hud.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <span style="color:#facc15;">📦 ${ojolState.cargo.label} • Lintas Peta</span>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="background:${remSec < 12 ? "#ef4444" : "#1e293b"};color:#fff;padding:2px 7px;border-radius:99px;font-size:10.5px;">⏱️ ${remSec.toFixed(1)}d</span>
                <button onclick="stopOjol3DGame()" style="border:none;background:rgba(255,255,255,0.16);color:#fff;border-radius:99px;width:20px;height:20px;font-size:11px;font-weight:800;cursor:pointer;">✕</button>
              </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <span style="font-size:11px;color:#e2e8f0;">Tujuan: <b>Kec. ${ojolState.targetDistrict.name}</b></span>
              <button onclick="if(typeof enterDistrictMap==='function') enterDistrictMap('${ojolState.targetDistrict.id}')" style="border:none;background:linear-gradient(135deg,#facc15,#f59e0b);color:#0f172a;padding:5px 10px;border-radius:9px;font-weight:900;font-size:11px;cursor:pointer;">🏘️ Masuk Kec. ${ojolState.targetDistrict.name} →</button>
            </div>
          `;
        } else {
          const isDrop = ojolState.stage === "dropoff";
          const badgeCol = isDrop ? "#facc15" : "#4ade80";
          const targetLabel = isDrop
            ? `Antar ke ${ojolState.dropoff.icon} ${ojolState.dropoff.name}`
            : `Ambil di ${ojolState.pickup.icon} ${ojolState.pickup.name}`;
          hud.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <span style="color:${badgeCol};">🛵 ${ojolState.cargo.label}</span>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="background:${remSec < 12 ? "#ef4444" : "#1e293b"};color:#fff;padding:2px 7px;border-radius:99px;font-size:10.5px;">⏱️ ${remSec.toFixed(1)}d</span>
                <button onclick="stopOjol3DGame()" style="border:none;background:rgba(255,255,255,0.16);color:#fff;border-radius:99px;width:20px;height:20px;font-size:11px;font-weight:800;cursor:pointer;">✕</button>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:#e2e8f0;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:${badgeCol};color:#0f172a;font-size:14px;font-weight:900;transform:rotate(${Math.round(screenArrowDeg)}deg);flex-shrink:0;">▲</span>
              <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${targetLabel} <b style="color:#38bdf8;">(${Math.round(distM)}m)</b></span>
            </div>
          `;
        }
      }

      ojolState.rafId = requestAnimationFrame(tickOjol);
    }
    ojolState.rafId = requestAnimationFrame(tickOjol);
  };

  // ================= 6. BALAP TIME TRIAL GASIBU 3D (5 CHECKPOINT) =================
  const RACE_CHECKPOINTS = [
    { name: "CP 1: Utara Gasibu", x: 0, z: -22 },
    { name: "CP 2: Sisi Barat Pullman", x: -24, z: -10 },
    { name: "CP 3: Gerbang Gedung Sate", x: 0, z: 7 },
    { name: "CP 4: Koridor Taman Lansia", x: 26, z: -8 },
    { name: "FINISH: Tugu Gasibu", x: 0, z: -14 }
  ];

  let raceState = {
    active: false,
    cpIdx: 0,
    startMs: 0,
    endMs: 0,
    beaconGroup: null,
    guideLine: null,
    rafId: null
  };

  function clearRace3DMeshes() {
    if (raceState.beaconGroup && raceState.beaconGroup.parent) {
      raceState.beaconGroup.parent.remove(raceState.beaconGroup);
    }
    if (raceState.guideLine && raceState.guideLine.parent) {
      raceState.guideLine.parent.remove(raceState.guideLine);
    }
    raceState.beaconGroup = null;
    raceState.guideLine = null;
  }

  function spawnRaceCheckpoint(cp, idx, total) {
    const sc = window.pirakuScene;
    const THREE = window.THREE;
    if (!sc || !THREE || !cp) return;
    clearRace3DMeshes();

    const isFinish = idx === total - 1;
    const col = isFinish ? 0xfacc15 : 0x38bdf8;
    const grp = new THREE.Group();

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 2.1, 32),
      new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.09;

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 1.0, 14, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    beam.position.y = 7.0;

    const sprite = new THREE.Sprite(
      makeOjolSignTexture(isFinish ? "🏁 GARIS FINISH" : ("🚩 CHECKPOINT " + (idx + 1) + "/" + total), "rgba(15,23,42,0.95)", isFinish ? "#facc15" : "#38bdf8")
    );
    sprite.scale.set(5.2, 1.3, 1);
    sprite.position.y = 4.0;

    grp.add(ring, beam, sprite);
    grp.position.set(cp.x, 0, cp.z);
    grp.userData = { ring, sprite };
    sc.add(grp);
    raceState.beaconGroup = grp;

    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.25, 0),
      new THREE.Vector3(cp.x, 0.25, cp.z)
    ]);
    const lineMat = new THREE.LineDashedMaterial({ color: col, dashSize: 1.2, gapSize: 0.65, transparent: true, opacity: 0.92 });
    const guideLine = new THREE.Line(lineGeo, lineMat);
    guideLine.computeLineDistances();
    sc.add(guideLine);
    raceState.guideLine = guideLine;
  }

  window.stopGasibuRace3D = function(silent) {
    raceState.active = false;
    if (raceState.rafId) { cancelAnimationFrame(raceState.rafId); raceState.rafId = null; }
    clearRace3DMeshes();
    const hud = document.getElementById("piraku-ojol-hud");
    if (hud && !ojolState.active) hud.style.display = "none";
    if (!silent && typeof window.showToast === "function") {
      window.showToast("🏁 Balap Time Trial Gasibu dihentikan.");
    }
  };

  window.startGasibuRace3D = function() {
    if (typeof window.stopOjol3DGame === "function") window.stopOjol3DGame(true);
    if (window.pirakuInDistrict && typeof window.enterDistrictMap === "function") {
      window.enterDistrictMap("bandung_wetan");
    }
    const player = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (!player || !player.position) {
      if (typeof window.showToast === "function") {
        window.showToast("⚠️ Masuk/pilih karakter dulu untuk mulai Balap Gasibu 3D!");
      }
      return;
    }

    // Tempatkan pemain di garis start Selatan Gasibu
    player.position.set(0, 0, -2);
    if (player.userData && player.userData.a && player.userData.a.c) {
      player.userData.a.c.x = 0;
      player.userData.a.c.z = -2;
    }

    raceState.active = true;
    raceState.cpIdx = 0;
    raceState.startMs = performance.now();
    raceState.endMs = raceState.startMs + 45000;
    spawnRaceCheckpoint(RACE_CHECKPOINTS[0], 0, RACE_CHECKPOINTS.length);
    tone(680, 0.16);
    if (typeof window.showToast === "function") {
      window.showToast("🏁 MULAI! Lewati 5 Checkpoint Gasibu dalam 45 detik!");
    }

    const hud = ensureOjolHud();
    if (hud) hud.style.display = "flex";

    function tickRace() {
      if (!raceState.active) return;
      const p = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
      const nowMs = performance.now();
      const nowSec = nowMs * 0.001;

      if (raceState.beaconGroup && raceState.beaconGroup.userData) {
        const { ring, sprite } = raceState.beaconGroup.userData;
        if (ring) {
          const s = 1 + Math.sin(nowSec * 5) * 0.12;
          ring.scale.set(s, s, 1);
        }
        if (sprite) sprite.position.y = 4.0 + Math.sin(nowSec * 3) * 0.2;
      }

      const target = RACE_CHECKPOINTS[raceState.cpIdx];
      let distM = 0;
      let screenArrowDeg = 0;
      if (p && p.position && target) {
        const dx = target.x - p.position.x;
        const dz = target.z - p.position.z;
        distM = Math.hypot(dx, dz);

        if (raceState.guideLine && raceState.guideLine.geometry) {
          const posAttr = raceState.guideLine.geometry.attributes.position;
          posAttr.setXYZ(0, p.position.x, 0.25, p.position.z);
          posAttr.setXYZ(1, target.x, 0.25, target.z);
          posAttr.needsUpdate = true;
          raceState.guideLine.computeLineDistances();
        }

        const cam = window.pirakuCamera || window.camera;
        if (cam && window.THREE) {
          const fwd = new window.THREE.Vector3();
          cam.getWorldDirection(fwd);
          fwd.y = 0;
          fwd.normalize();
          const right = new window.THREE.Vector3().crossVectors(fwd, new window.THREE.Vector3(0, 1, 0)).normalize();
          screenArrowDeg = Math.atan2(dx * right.x + dz * right.z, dx * fwd.x + dz * fwd.z) * (180 / Math.PI);
        }

        if (distM < 3.4) {
          raceState.cpIdx++;
          if (raceState.cpIdx >= RACE_CHECKPOINTS.length) {
            const elapsedSec = ((nowMs - raceState.startMs) / 1000).toFixed(1);
            const prevBest = parseFloat(localStorage.getItem("piraku_gasibu_race_best") || "999");
            const isNewBest = parseFloat(elapsedSec) < prevBest;
            if (isNewBest) localStorage.setItem("piraku_gasibu_race_best", elapsedSec);

            if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
              window.PirakuEconomy.addCoins(16, "Finis Balap Gasibu (" + elapsedSec + "d)");
            }
            if (typeof window.grantPirakuXP === "function") {
              window.grantPirakuXP(35, "Finis Balap Time Trial Gasibu");
            }
            tone(980, 0.28);
            if (typeof window.showToast === "function") {
              window.showToast(`🏆 FINISH ${elapsedSec}d!${isNewBest ? " (REKOR BARU!)" : ""} +16 🪙 & +35 XP!`);
            }
            window.stopGasibuRace3D(true);
            return;
          } else {
            tone(720 + raceState.cpIdx * 50, 0.12);
            spawnRaceCheckpoint(RACE_CHECKPOINTS[raceState.cpIdx], raceState.cpIdx, RACE_CHECKPOINTS.length);
          }
        }
      }

      const remSec = Math.max(0, (raceState.endMs - nowMs) / 1000);
      if (remSec <= 0) {
        tone(220, 0.28);
        if (typeof window.showToast === "function") {
          window.showToast("⏱️ Waktu Habis! Gagal finis di bawah 45 detik.");
        }
        window.stopGasibuRace3D(true);
        return;
      }

      if (hud) {
        hud.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <span style="color:#38bdf8;">🏁 BALAP GASIBU • ${raceState.cpIdx + 1}/${RACE_CHECKPOINTS.length}</span>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="background:${remSec < 10 ? "#ef4444" : "#1e293b"};color:#fff;padding:2px 7px;border-radius:99px;font-size:10.5px;">⏱️ ${remSec.toFixed(1)}d</span>
              <button onclick="stopGasibuRace3D()" style="border:none;background:rgba(255,255,255,0.16);color:#fff;border-radius:99px;width:20px;height:20px;font-size:11px;font-weight:800;cursor:pointer;">✕</button>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:#e2e8f0;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#38bdf8;color:#0f172a;font-size:14px;font-weight:900;transform:rotate(${Math.round(screenArrowDeg)}deg);flex-shrink:0;">▲</span>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${target.name} <b style="color:#fde047;">(${Math.round(distM)}m)</b></span>
          </div>
        `;
      }

      raceState.rafId = requestAnimationFrame(tickRace);
    }
    raceState.rafId = requestAnimationFrame(tickRace);
  };
})();
