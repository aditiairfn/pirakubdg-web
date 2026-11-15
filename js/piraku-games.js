// ================= PIRAKUBDG INTERACTIVE CANVAS ARCADE GAMES =================
(function() {
  const GAMES = [
    { id: "badminton", icon: "🏸", title: "Badminton GOR Gasibu", place: "Lapangan Gasibu", reward: "650 Koin", x: 0, z: -12, desc: "Duel bulu tangkis visual di lapangan Gasibu! Gerakkan pemain, bidik sudut, & lakukan Smash!" },
    { id: "angkot", icon: "🚐", title: "Angkot Ngebut Surapati", place: "Jl. Surapati – Pasupati", reward: "s.d. 900 Koin", x: -18, z: -26, desc: "Setir angkot Cicaheum–Ledeng 3 lajur! Jemput penumpang & hindari angkot ngetem." },
    { id: "fishing", icon: "🎣", title: "Mancing Kolam Taman Lansia", place: "Taman Timur Gedung Sate", reward: "s.d. 850 Koin", x: 26, z: 10, desc: "Lempar kail ke kolam, tunggu ikan menyambar, lalu tahan tarik senar di zona hijau!" },
    { id: "sate", icon: "🍢", title: "Bakar Sate Gedung Sate", place: "Pelataran Gedung Sate", reward: "s.d. 800 Koin", x: 0, z: 6, desc: "Kipas bara api & balik tusuk sate tepat saat matang keemasan sebelum gosong!" }
  ];

  function addCoins(amt, reason) {
    if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
      window.PirakuEconomy.addCoins(amt, reason);
    }
  }

  function tone(freq, dur) {
    if (typeof window.playSynthTone === "function") window.playSynthTone(freq, "triangle", dur || 0.12);
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
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.82);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:12px;touch-action:pan-y;";
      modal.addEventListener("click", e => { if (e.target === modal) closeGamesModal(); });
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";
    if (directId) launchGame(directId);
    else renderHub();
  };

  function renderHub() {
    stopLoop();
    const modal = document.getElementById("piraku-games-modal");
    if (!modal) return;
    const coins = window.PirakuEconomy ? window.PirakuEconomy.getCoins() : 500;

    modal.innerHTML = `
      <div style="width:100%;max-width:420px;background:#0f172a;border:1.5px solid rgba(56,189,248,0.5);border-radius:20px;padding:16px;color:#f8fafc;box-shadow:0 24px 55px rgba(0,0,0,0.75);max-height:82dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div>
            <div style="font-size:11px;color:#38bdf8;font-weight:800;letter-spacing:.5px;">ARCADE INTERAKTIF BANDUNG</div>
            <div style="font-size:18px;font-weight:800;">Pilih Mini-Game 🎮</div>
          </div>
          <button id="g-close" style="width:32px;height:32px;border-radius:50%;border:none;background:#1e293b;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>
        <div style="font-size:11.5px;color:#94a3b8;margin-bottom:12px;">Semua game pakai arena interaktif real-time! Kumpulkan <b style="color:#fde047;">Koin Piraku</b> buat belanja di Toko Kota.</div>

        <div style="display:flex;flex-direction:column;gap:9px;margin-bottom:14px;">
          ${GAMES.map(g => `
            <div style="padding:12px;border-radius:14px;background:#1e293b;border:1px solid rgba(148,163,184,0.25);">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <span style="font-size:26px;">${g.icon}</span>
                <div>
                  <div style="font-size:14px;font-weight:800;color:#f8fafc;">${g.title}</div>
                  <div style="font-size:11px;color:#94a3b8;">📍 ${g.place} • <span style="color:#fde047;font-weight:700;">🪙 ${g.reward}</span></div>
                </div>
              </div>
              <div style="font-size:11.5px;color:#cbd5e1;line-height:1.35;margin-bottom:9px;">${g.desc}</div>
              <div style="display:flex;gap:8px;">
                <button data-play="${g.id}" style="flex:1;padding:8px 12px;border-radius:10px;border:none;background:linear-gradient(135deg,#2563eb,#38bdf8);color:#fff;font-size:12px;font-weight:800;cursor:pointer;">▶ Mainkan</button>
                <button data-loc="${g.id}" style="padding:8px 10px;border-radius:10px;border:1px solid rgba(250,204,21,0.45);background:rgba(250,204,21,0.1);color:#fde047;font-size:11px;font-weight:700;cursor:pointer;">Lihat di peta →</button>
              </div>
            </div>
          `).join("")}
        </div>

        <button id="g-shop" style="width:100%;padding:11px;border-radius:12px;border:none;background:#f59e0b;color:#0f172a;font-size:12.5px;font-weight:800;cursor:pointer;">🛍️ Buka Toko Kota (🪙 ${coins.toLocaleString("id-ID")})</button>
      </div>`;

    modal.querySelector("#g-close").onclick = closeGamesModal;
    modal.querySelector("#g-shop").onclick = () => { closeGamesModal(); if (window.openEconomyModal) window.openEconomyModal("outfit"); };
    modal.querySelectorAll("[data-play]").forEach(b => { b.onclick = () => launchGame(b.dataset.play); });
    modal.querySelectorAll("[data-loc]").forEach(b => {
      b.onclick = () => {
        const g = GAMES.find(x => x.id === b.dataset.loc);
        if (g) gotoLocation(g.x, g.z, g.place);
      };
    });
  }

  function launchGame(id) {
    stopLoop();
    if (id === "badminton") return playBadminton();
    if (id === "angkot") return playAngkot();
    if (id === "fishing") return playFishing();
    if (id === "sate") return playSate();
  }

  // ================= 1. BADMINTON GOR GASIBU (VISUAL COURT + SHUTTLECOCK PHYSICS) =================
  function playBadminton() {
    const modal = document.getElementById("piraku-games-modal");
    modal.innerHTML = `
      <div style="width:100%;max-width:400px;background:#14532d;border:2px solid #86efac;border-radius:20px;padding:12px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;">🏸 Badminton • GOR Gasibu</span>
          <button id="bm-back" style="background:rgba(0,0,0,0.4);border:none;color:#fff;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Kembali</button>
        </div>
        <div style="background:#f8fafc;color:#0f172a;border-radius:12px;padding:6px 10px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:13px;margin-bottom:6px;">
          <span>Kamu</span>
          <span id="bm-score" style="color:#dc2626;font-size:20px;">0 : 0</span>
          <span>Pelatih Bandung</span>
        </div>
        <div id="bm-status" style="background:rgba(0,0,0,0.3);border-radius:8px;padding:5px;text-align:center;font-size:11px;margin-bottom:6px;">Tekan Servis atau pukulan saat kok mendekat!</div>
        <canvas id="bm-cv" width="340" height="250" style="width:100%;border-radius:12px;background:#166534;display:block;margin-bottom:8px;"></canvas>
        <div style="background:#f8fafc;color:#0f172a;padding:6px 10px;border-radius:10px;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
          <span style="font-size:11px;font-weight:700;white-space:nowrap;">Bidik:</span>
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
            <button data-hit="smash" style="border-radius:9px;border:none;background:#f59e0b;color:#0f172a;font-weight:800;font-size:12px;cursor:pointer;">Smash 🔥</button>
          </div>
        </div>
      </div>`;

    modal.querySelector("#bm-back").onclick = renderHub;
    const cv = document.getElementById("bm-cv");
    const ctx = cv.getContext("2d");
    const stEl = document.getElementById("bm-status");
    const scEl = document.getElementById("bm-score");

    let p = { x: 170, y: 205 }, bot = { x: 170, y: 45 };
    let kok = { x: 170, y: 195, vx: 0, vy: 0, z: 12, vz: 0, state: "serve_p" };
    let pScore = 0, bScore = 0, aim = 0, finished = false;

    document.getElementById("bm-aim").oninput = e => { aim = parseFloat(e.target.value); };
    document.getElementById("bm-left").onclick = () => { p.x = Math.max(65, p.x - 22); };
    document.getElementById("bm-right").onclick = () => { p.x = Math.min(275, p.x + 22); };
    document.getElementById("bm-up").onclick = () => { p.y = Math.max(138, p.y - 16); };
    document.getElementById("bm-down").onclick = () => { p.y = Math.min(230, p.y + 16); };

    function hitKok(type) {
      if (finished) return;
      if (kok.state === "serve_p") {
        kok.state = "fly_to_bot";
        kok.x = p.x; kok.y = p.y - 8;
        kok.vx = aim * 2.4 + (Math.random() - 0.5) * 0.6;
        kok.vy = -3.6; kok.z = 16; kok.vz = 1.6;
        tone(520, 0.1);
        stEl.textContent = "Servis meluncur!";
        return;
      }
      const dist = Math.hypot(kok.x - p.x, kok.y - p.y);
      if (kok.state === "fly_to_p" && dist < 52) {
        kok.state = "fly_to_bot";
        const spd = type === "smash" ? 5.6 : type === "drive" ? 4.5 : type === "drop" ? 3.1 : 3.8;
        kok.vx = aim * 3.1 + (Math.random() - 0.5) * 0.5;
        kok.vy = -spd;
        kok.z = type === "smash" ? 24 : 15;
        kok.vz = type === "drop" ? 0.6 : type === "smash" ? -0.4 : 1.3;
        tone(type === "smash" ? 740 : 580, 0.12);
        stEl.textContent = type === "smash" ? "🔥 SMASH KERAS!" : "Pukulan " + type.toUpperCase() + "!";
      }
    }
    modal.querySelectorAll("[data-hit]").forEach(b => { b.onclick = () => hitKok(b.dataset.hit); });

    function scorePoint(who) {
      if (who === "p") { pScore++; stEl.textContent = "🎉 Poin untuk kamu!"; tone(680, 0.18); }
      else { bScore++; stEl.textContent = "Kok jatuh di area kamu!"; tone(240, 0.18); }
      scEl.textContent = `${pScore} : ${bScore}`;
      if (pScore >= 5 || bScore >= 5) {
        finished = true;
        stopLoop();
        const win = pScore >= 5;
        const coin = win ? 650 : 180;
        addCoins(coin, win ? "Juara Badminton GOR Gasibu" : "Latihan Badminton Gasibu");
        stEl.innerHTML = `<b>${win ? "🏆 MENANG!" : "Selesai!"} +🪙 ${coin} Koin Piraku</b>`;
        return;
      }
      kok = { x: p.x, y: p.y - 8, vx: 0, vy: 0, z: 12, vz: 0, state: "serve_p" };
    }

    function step() {
      // Gerak AI Pelatih
      const targetX = kok.state === "fly_to_bot" ? kok.x : 170;
      bot.x += (targetX - bot.x) * 0.065;
      bot.x = Math.max(70, Math.min(270, bot.x));

      if (kok.state === "fly_to_bot" || kok.state === "fly_to_p") {
        kok.x += kok.vx;
        kok.y += kok.vy;
        kok.z = Math.max(0, kok.z + kok.vz);
        kok.vz -= 0.055;

        if (kok.state === "fly_to_bot" && Math.hypot(kok.x - bot.x, kok.y - bot.y) < 28) {
          kok.state = "fly_to_p";
          kok.vx = (Math.random() - 0.5) * 3.4;
          kok.vy = 3.2 + Math.random() * 1.1;
          kok.z = 16; kok.vz = 1.4;
          tone(440, 0.09);
        } else if (kok.y < 14) {
          scorePoint("p");
        } else if (kok.y > 242) {
          scorePoint("bot");
        }
      } else {
        kok.x = p.x; kok.y = p.y - 8;
      }

      // Gambar Lapangan Perspektif
      ctx.clearRect(0, 0, 340, 250);
      ctx.fillStyle = "#c2410c"; ctx.fillRect(28, 12, 284, 226);
      ctx.fillStyle = "#15803d"; ctx.fillRect(48, 22, 244, 206);
      ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 2;
      ctx.strokeRect(48, 22, 244, 206);
      ctx.beginPath(); ctx.moveTo(170, 22); ctx.lineTo(170, 228); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(48, 92); ctx.lineTo(292, 92); ctx.moveTo(48, 158); ctx.lineTo(292, 158); ctx.stroke();

      // Net tengah
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fillRect(42, 123, 256, 4);

      // Pelatih (Atas)
      ctx.fillStyle = "#1d4ed8"; ctx.beginPath(); ctx.arc(bot.x, bot.y, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(bot.x, bot.y - 5, 7, 0, Math.PI * 2); ctx.fill();

      // Pemain (Bawah) + Jangkauan Raket
      ctx.strokeStyle = "rgba(253,224,71,0.35)"; ctx.beginPath(); ctx.arc(p.x, p.y, 34, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#16a34a"; ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(p.x, p.y - 5, 7.5, 0, Math.PI * 2); ctx.fill();

      // Bayangan & Kok
      ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(kok.x, kok.y + 6, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(kok.x, kok.y - kok.z * 0.45, 5.5, 0, Math.PI * 2); ctx.fill();

      if (!finished) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 2. ANGKOT NGEBUT SURAPATI (3-LANE ARCADE RUNNER) =================
  function playAngkot() {
    const modal = document.getElementById("piraku-games-modal");
    modal.innerHTML = `
      <div style="width:100%;max-width:390px;background:#0f172a;border:2px solid #22c55e;border-radius:20px;padding:12px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#4ade80;">🚐 Angkot Cicaheum–Ledeng</span>
          <button id="ak-back" style="background:#1e293b;border:none;color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Kembali</button>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:6px;">
          <span id="ak-score" style="color:#fde047;">Penumpang: 0 • 🪙 0</span>
          <span id="ak-time" style="color:#38bdf8;">⏱️ 30d</span>
        </div>
        <canvas id="ak-cv" width="330" height="290" style="width:100%;border-radius:12px;background:#1e293b;display:block;margin-bottom:8px;"></canvas>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="ak-l" style="padding:12px;border-radius:12px;border:none;background:#2563eb;color:#fff;font-size:16px;font-weight:900;">◀ Pindah Kiri</button>
          <button id="ak-r" style="padding:12px;border-radius:12px;border:none;background:#2563eb;color:#fff;font-size:16px;font-weight:900;">Pindah Kanan ▶</button>
        </div>
      </div>`;
    modal.querySelector("#ak-back").onclick = renderHub;
    const cv = document.getElementById("ak-cv"), ctx = cv.getContext("2d");
    const lanes = [75, 165, 255];
    let lane = 1, objs = [], pax = 0, start = performance.now(), dash = 0, over = false;

    document.getElementById("ak-l").onclick = () => { if (lane > 0) { lane--; tone(480, 0.07); } };
    document.getElementById("ak-r").onclick = () => { if (lane < 2) { lane++; tone(520, 0.07); } };

    function step(now) {
      const rem = Math.max(0, 30 - Math.floor((now - start) / 1000));
      document.getElementById("ak-time").textContent = "⏱️ " + rem + "d";
      if (rem <= 0 && !over) {
        over = true; stopLoop();
        const coin = Math.min(900, pax * 75);
        if (coin > 0) addCoins(coin, "Narikt Angkot Surapati (" + pax + " penumpang)");
        document.getElementById("ak-score").textContent = `Selesai! +🪙 ${coin} Koin`;
        return;
      }

      dash = (dash + 6) % 36;
      if (Math.random() < 0.045) {
        const l = Math.floor(Math.random() * 3);
        const isPax = Math.random() < 0.62;
        objs.push({ lane: l, y: -25, type: isPax ? "pax" : "cone" });
      }

      ctx.clearRect(0, 0, 330, 290);
      ctx.fillStyle = "#334155"; ctx.fillRect(30, 0, 270, 290);
      ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2; ctx.setLineDash([18, 18]); ctx.lineDashOffset = -dash;
      ctx.beginPath(); ctx.moveTo(120, 0); ctx.lineTo(120, 290); ctx.moveTo(210, 0); ctx.lineTo(210, 290); ctx.stroke();
      ctx.setLineDash([]);

      for (let i = objs.length - 1; i >= 0; i--) {
        const o = objs[i];
        o.y += 4.3;
        const ox = lanes[o.lane];
        if (o.type === "pax") {
          ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(ox, o.y, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#0f172a"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"; ctx.fillText("🙋", ox, o.y + 4);
        } else {
          ctx.fillStyle = "#ef4444"; ctx.fillRect(ox - 16, o.y - 12, 32, 24);
          ctx.fillStyle = "#fff"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center"; ctx.fillText("MACET", ox, o.y + 3);
        }

        if (o.lane === lane && Math.abs(o.y - 238) < 28) {
          if (o.type === "pax") { pax++; tone(720, 0.1); }
          else { pax = Math.max(0, pax - 1); tone(200, 0.15); }
          document.getElementById("ak-score").textContent = `Penumpang: ${pax} • 🪙 ${pax * 75}`;
          objs.splice(i, 1);
        } else if (o.y > 315) {
          objs.splice(i, 1);
        }
      }

      // Angkot Hijau-Merah Bandung
      const ax = lanes[lane];
      ctx.fillStyle = "#16a34a"; ctx.fillRect(ax - 19, 215, 38, 52);
      ctx.fillStyle = "#dc2626"; ctx.fillRect(ax - 19, 234, 38, 10);
      ctx.fillStyle = "#bae6fd"; ctx.fillRect(ax - 15, 220, 30, 11);

      if (!over) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 3. MANCING KOLAM TAMAN LANSIA (TENSION REELING CANVAS) =================
  function playFishing() {
    const modal = document.getElementById("piraku-games-modal");
    modal.innerHTML = `
      <div style="width:100%;max-width:390px;background:#0f172a;border:2px solid #38bdf8;border-radius:20px;padding:12px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#38bdf8;">🎣 Kolam Taman Lansia</span>
          <button id="fs-back" style="background:#1e293b;border:none;color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Kembali</button>
        </div>
        <div id="fs-info" style="font-size:12px;font-weight:700;color:#fde047;margin-bottom:6px;">Tahan tombol TARIK agar indikator tetap di zona hijau!</div>
        <canvas id="fs-cv" width="330" height="230" style="width:100%;border-radius:12px;background:#0369a1;display:block;margin-bottom:8px;"></canvas>
        <button id="fs-hold" style="width:100%;padding:13px;border-radius:12px;border:none;background:#22c55e;color:#0f172a;font-size:14px;font-weight:900;cursor:pointer;user-select:none;">🎣 TAHAN UNTUK TARIK SENAR</button>
      </div>`;
    modal.querySelector("#fs-back").onclick = renderHub;
    const cv = document.getElementById("fs-cv"), ctx = cv.getContext("2d");
    const holdBtn = document.getElementById("fs-hold");
    let holding = false, bar = 45, progress = 35, fishX = 165, t = 0, done = false;

    holdBtn.onmousedown = holdBtn.ontouchstart = e => { e.preventDefault(); holding = true; };
    window.addEventListener("mouseup", () => { holding = false; });
    window.addEventListener("touchend", () => { holding = false; });

    function step() {
      t += 0.06;
      bar += holding ? 1.55 : -1.25;
      bar = Math.max(0, Math.min(100, bar));
      const inZone = bar >= 32 && bar <= 70;
      progress += inZone ? 0.42 : -0.22;
      fishX = 165 + Math.sin(t * 2.4) * 75;

      ctx.clearRect(0, 0, 330, 230);
      // Riak air kolam
      ctx.strokeStyle = "rgba(186,230,253,0.35)";
      ctx.beginPath(); ctx.ellipse(fishX, 110, 28 + Math.sin(t * 4) * 6, 12, 0, 0, Math.PI * 2); ctx.stroke();
      // Ikan Koi Emas berenang
      ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.ellipse(fishX, 110, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(fishX + 7, 109, 4, 0, Math.PI * 2); ctx.fill();

      // Bar Tensi Senar
      ctx.fillStyle = "#1e293b"; ctx.fillRect(25, 175, 280, 18);
      ctx.fillStyle = "rgba(34,197,94,0.55)"; ctx.fillRect(25 + 280 * 0.32, 175, 280 * 0.38, 18);
      ctx.fillStyle = "#fde047"; ctx.fillRect(25 + (bar / 100) * 270, 172, 10, 24);

      // Bar Progres Tangkapan
      ctx.fillStyle = "#0f172a"; ctx.fillRect(25, 202, 280, 10);
      ctx.fillStyle = "#38bdf8"; ctx.fillRect(25, 202, 280 * Math.max(0, Math.min(1, progress / 100)), 10);

      if (progress >= 100 && !done) {
        done = true; stopLoop();
        addCoins(420, "Dapat Koi Emas Taman Lansia");
        document.getElementById("fs-info").textContent = "🎉 Dapat Koi Emas Gedung Sate! +🪙 420 Koin";
        return;
      }
      if (!done) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // ================= 4. BAKAR SATE GEDUNG SATE (GRILL RHYTHM ACTION) =================
  function playSate() {
    const modal = document.getElementById("piraku-games-modal");
    modal.innerHTML = `
      <div style="width:100%;max-width:390px;background:#0f172a;border:2px solid #f59e0b;border-radius:20px;padding:14px;color:#fff;text-align:center;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:12px;font-weight:800;color:#f59e0b;">🍢 Bakar Sate Gedung Sate</span>
          <button id="st-back" style="background:#1e293b;border:none;color:#cbd5e1;padding:4px 10px;border-radius:8px;font-size:11px;cursor:pointer;">Kembali</button>
        </div>
        <div id="st-msg" style="font-size:12px;color:#cbd5e1;margin-bottom:10px;">Kipas bara api lalu angkat sate tepat saat tingkat matang <b>75%–92%</b>!</div>
        <div style="background:#1e293b;border-radius:16px;padding:16px;margin-bottom:12px;">
          <div style="font-size:38px;margin-bottom:6px;">🍢🔥🍢</div>
          <div id="st-pct" style="font-size:20px;font-weight:900;color:#fde047;margin-bottom:8px;">Matang: 0%</div>
          <div style="height:20px;border-radius:999px;background:#0f172a;overflow:hidden;position:relative;">
            <div style="position:absolute;left:75%;width:17%;top:0;bottom:0;background:rgba(34,197,94,0.5);"></div>
            <div id="st-bar" style="height:100%;width:0%;background:#f59e0b;"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="st-fan" style="padding:12px;border-radius:12px;border:none;background:#ea580c;color:#fff;font-weight:800;cursor:pointer;">🪭 Kipas Bara</button>
          <button id="st-serve" style="padding:12px;border-radius:12px;border:none;background:#22c55e;color:#0f172a;font-weight:800;cursor:pointer;">🍽️ Sajikan!</button>
        </div>
      </div>`;
    modal.querySelector("#st-back").onclick = renderHub;
    let cook = 0, heat = 0.35, served = 0, over = false;
    document.getElementById("st-fan").onclick = () => { heat = Math.min(1.4, heat + 0.35); tone(460, 0.08); };
    document.getElementById("st-serve").onclick = () => {
      if (cook >= 75 && cook <= 92) {
        served++;
        tone(740, 0.14);
        document.getElementById("st-msg").innerHTML = `<b style="color:#4ade80;">Matang Sempurna! (${served}/3 porsi)</b>`;
        if (served >= 3) {
          over = true; stopLoop();
          addCoins(500, "Sate Matang Sempurna Gedung Sate");
          document.getElementById("st-msg").innerHTML = `<b style="color:#fde047;">🎉 3 Porsi Sate Ludes! +🪙 500 Koin</b>`;
        }
      } else {
        tone(210, 0.16);
        document.getElementById("st-msg").innerHTML = `<b style="color:#f87171;">${cook < 75 ? "Masih mentah!" : "Kegosongan!"} Coba tusukan baru!</b>`;
      }
      cook = 0; heat = 0.35;
    };

    function step() {
      cook = Math.min(100, cook + heat);
      heat = Math.max(0.25, heat * 0.985);
      document.getElementById("st-pct").textContent = "Matang: " + Math.round(cook) + "%";
      document.getElementById("st-bar").style.width = cook + "%";
      if (!over) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }
})();
