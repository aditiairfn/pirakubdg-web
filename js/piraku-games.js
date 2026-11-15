// ================= PIRAKUBDG 5 MINI-GAMES HUB & COIN REWARDS =================
(function() {
  const GAMES = [
    { id: "quiz", icon: "🎓", title: "Kuis Urang Bandung", place: "Pelataran Gedung Sate", reward: "s.d. 1.500 Koin", x: 0, z: 4, desc: "10 soal cepat seputar Bandung + lifeline 50/50 & Tanya Warga." },
    { id: "cashier", icon: "🏪", title: "Kasir Warung Gasibu", place: "Sisi Barat Gasibu", reward: "s.d. 800 Koin", x: -16, z: -10, desc: "Scan belanjaan warga & hitung kembalian cepat dalam 45 detik." },
    { id: "fishing", icon: "🎣", title: "Mancing Taman Lansia", place: "Taman Timur Gedung Sate", reward: "s.d. 900 Koin", x: 26, z: 10, desc: "Tarik pelampung saat getar untuk dapat Koi Emas Gedung Sate." },
    { id: "badminton", icon: "🏸", title: "Badminton GOR Gasibu", place: "Lapangan Gasibu", reward: "s.d. 1.000 Koin", x: 0, z: -12, desc: "Duel rally Servis, Drop, Drive, & Smash lawan Pelatih Bandung." },
    { id: "barista", icon: "☕", title: "Racik Kopi & Bandros", place: "Selasar Monumen Perjuangan", reward: "s.d. 750 Koin", x: 0, z: -42, desc: "Racik pesanan kopi susu gula aren & bandros sebelum timer habis." }
  ];

  const QUIZ_BANK = [
    { cat: "Sejarah", q: "Berapa jumlah ornamen tusuk sate di puncak menara Gedung Sate?", a: ["6 buah", "5 buah", "7 buah", "8 buah"], c: 0, hint: "Melambangkan 6 juta gulden biaya pembangunannya." },
    { cat: "Sejarah", q: "Tahun berapakah Gedung Sate mulai dibangun pada masa Hindia Belanda?", a: ["1920", "1910", "1932", "1945"], c: 0, hint: "Peletakan batu pertama dilakukan pada 27 Juli 1920." },
    { cat: "Landmark", q: "Jalan raya utama di utara Lapangan Gasibu yang melintas barat–timur adalah...", a: ["Jl. Surapati", "Jl. Asia Afrika", "Jl. Braga", "Jl. Merdeka"], c: 0, hint: "Terhubung langsung ke jembatan layang Pasupati." },
    { cat: "Landmark", q: "Nama jembatan layang ikonik dengan lampu kabel warna-warni di barat Gasibu adalah...", a: ["Flyover Pasupati", "Jembatan Ampera", "Jembatan Suramadu", "Flyover Kiaracondong"], c: 0, hint: "Singkatan dari Pasteur – Surapati." },
    { cat: "Landmark", q: "Monumen Perjuangan Rakyat Jawa Barat berada tepat di sebelah mana Lapangan Gasibu?", a: ["Utara", "Selatan", "Timur", "Barat"], c: 0, hint: "Berseberangan dengan Gedung Sate di ujung utara sumbu Gasibu." },
    { cat: "Kuliner", q: "Kue tradisional Bandung berbahan kelapa parut & tepung beras berbentuk setengah lingkaran adalah...", a: ["Bandros", "Bika Ambon", "Klepon", "Serabi Solo"], c: 0, hint: "Enak dimakan hangat-hangat dengan taburan gula pasir atau keju." },
    { cat: "Kuliner", q: "Minuman hangat khas Sunda berbahan gula aren, santan, dan daun pandan adalah...", a: ["Bajigur", "Wedang Uwuh", "Sekoteng", "Teh Talua"], c: 0, hint: "Sering dijajakan bersama bandrek dan kacang rebus." },
    { cat: "Bahasa", q: "Apa arti kata 'Piraku' dalam bahasa Sunda sehari-hari?", a: ["Masa sih / Tidak mungkin", "Terima kasih", "Permisi", "Hati-hati"], c: 0, hint: "Sering dipakai saat heran atau takjub!" },
    { cat: "Bahasa", q: "Ungkapan ramah bahasa Sunda untuk menyambut tamu datang adalah...", a: ["Wilujeng Sumping", "Wilujeng Wengi", "Hatur Nuhun", "Mangga Ti Payun"], c: 0, hint: "Tertulis di layar LED utara Gasibu!" },
    { cat: "Jalur", q: "Jurusan angkot ikonik berwarna hijau-merah yang melintasi Surapati–Gasibu adalah...", a: ["Cicaheum – Ledeng", "Ciroyom – Cikudapateuh", "Kalapa – Dago", "Stasiun – Sadang Serang"], c: 0, hint: "Menghubungkan terminal timur Cicaheum ke utara Ledeng." },
    { cat: "Kuliner", q: "Jajanan aci khas Bandung yang digoreng renyah dan dicocol bumbu rujak adalah...", a: ["Cireng", "Cilok", "Cimol", "Batagor"], c: 0, hint: "Singkatan dari Aci Digoreng." },
    { cat: "Sejarah", q: "Julukan terkenal kota Bandung pada era kolonial karena keindahan tata kotanya adalah...", a: ["Parijs van Java", "Kota Hujan", "Kota Pahlawan", "Serambi Mekah"], c: 0, hint: "Artinya Paris-nya Pulau Jawa." }
  ];

  function addCoins(amt, reason) {
    if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
      window.PirakuEconomy.addCoins(amt, reason);
    }
  }

  function teleportOrWalkTo(x, z, label) {
    const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (mesh && mesh.position) {
      mesh.position.set(x, 0.14, z);
      if (mesh.userData && mesh.userData.a && mesh.userData.a.c) {
        mesh.userData.a.c.x = x;
        mesh.userData.a.c.z = z;
      }
    }
    const modal = document.getElementById("piraku-games-modal");
    if (modal) modal.style.display = "none";
    const toast = document.getElementById("piraku-coin-toast");
    if (toast) {
      toast.style.background = "#0284c7";
      toast.textContent = "📍 Menuju " + label;
      toast.style.opacity = "1";
      clearTimeout(toast._t);
      toast._t = setTimeout(() => { toast.style.opacity = "0"; }, 2200);
    }
  }

  let activeTimer = null;
  function clearGameTimer() {
    if (activeTimer) { clearInterval(activeTimer); activeTimer = null; }
  }

  window.openGamesHubModal = function(directGameId) {
    clearGameTimer();
    let modal = document.getElementById("piraku-games-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "piraku-games-modal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.76);backdrop-filter:blur(7px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;";
      modal.addEventListener("click", e => { if (e.target === modal) { clearGameTimer(); modal.style.display = "none"; } });
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";
    if (directGameId) {
      launchGame(directGameId);
    } else {
      renderGamesHub();
    }
  };

  function renderGamesHub() {
    clearGameTimer();
    const modal = document.getElementById("piraku-games-modal");
    if (!modal) return;
    const coins = window.PirakuEconomy ? window.PirakuEconomy.getCoins() : 500;
    const tier = window.PirakuEconomy ? window.PirakuEconomy.getTierObj() : { badge: "🌱", name: "Warga Baru" };

    modal.innerHTML = `
      <div style="width:100%;max-width:420px;background:#0f172a;border:1.5px solid rgba(56,189,248,0.45);border-radius:20px;padding:16px;color:#f8fafc;box-shadow:0 22px 50px rgba(0,0,0,0.65);max-height:85vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div>
            <div style="font-size:11px;color:#38bdf8;font-weight:800;letter-spacing:.5px;">JELAJAH BANDUNG • ARCADE WARGA</div>
            <div style="font-size:18px;font-weight:800;">Temukan Game 🎮</div>
          </div>
          <button id="btn-close-games" style="width:32px;height:32px;border-radius:50%;border:none;background:#1e293b;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>
        <div style="font-size:11.5px;color:#94a3b8;margin-bottom:12px;">Mainkan mini-game khas Bandung untuk mengumpulkan <b style="color:#fde047;">Koin Piraku</b> dan tukar di Toko Kota!</div>

        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
          ${GAMES.map(g => `
            <div style="padding:11px 12px;border-radius:14px;background:#1e293b;border:1px solid rgba(148,163,184,0.22);display:flex;flex-direction:column;gap:7px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div style="display:flex;align-items:center;gap:9px;">
                  <span style="font-size:24px;">${g.icon}</span>
                  <div>
                    <div style="font-size:13.5px;font-weight:800;color:#f8fafc;">${g.title}</div>
                    <div style="font-size:11px;color:#94a3b8;">📍 ${g.place} • <span style="color:#fde047;font-weight:700;">🪙 ${g.reward}</span></div>
                  </div>
                </div>
              </div>
              <div style="font-size:11px;color:#cbd5e1;line-height:1.35;">${g.desc}</div>
              <div style="display:flex;gap:7px;margin-top:2px;">
                <button data-play-game="${g.id}" style="flex:1;padding:7px 10px;border-radius:9px;border:none;background:linear-gradient(135deg,#2563eb,#38bdf8);color:#fff;font-size:11.5px;font-weight:800;cursor:pointer;">▶ Main Sekarang</button>
                <button data-goto-game="${g.id}" style="padding:7px 10px;border-radius:9px;border:1px solid rgba(250,204,21,0.45);background:rgba(250,204,21,0.1);color:#fde047;font-size:11px;font-weight:700;cursor:pointer;">Lihat di peta →</button>
              </div>
            </div>
          `).join("")}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="btn-hub-wallet" style="padding:10px;border-radius:12px;border:1px solid rgba(250,204,21,0.45);background:#1e293b;color:#fde047;font-size:12px;font-weight:800;cursor:pointer;">🪙 Dompet: ${coins.toLocaleString("id-ID")}</button>
          <button id="btn-hub-shop" style="padding:10px;border-radius:12px;border:none;background:#f59e0b;color:#0f172a;font-size:12px;font-weight:800;cursor:pointer;">🛍️ Toko Gaya & Kota</button>
        </div>
      </div>`;

    modal.querySelector("#btn-close-games").onclick = () => { modal.style.display = "none"; };
    modal.querySelector("#btn-hub-wallet").onclick = () => { modal.style.display = "none"; if (window.openEconomyModal) window.openEconomyModal("tier"); };
    modal.querySelector("#btn-hub-shop").onclick = () => { modal.style.display = "none"; if (window.openEconomyModal) window.openEconomyModal("outfit"); };

    modal.querySelectorAll("[data-play-game]").forEach(btn => {
      btn.onclick = () => launchGame(btn.dataset.playGame);
    });
    modal.querySelectorAll("[data-goto-game]").forEach(btn => {
      btn.onclick = () => {
        const g = GAMES.find(x => x.id === btn.dataset.gotoGame);
        if (g) teleportOrWalkTo(g.x, g.z, g.place);
      };
    });
  }

  function launchGame(id) {
    clearGameTimer();
    if (id === "quiz") return startQuizGame();
    if (id === "cashier") return startCashierGame();
    if (id === "fishing") return startFishingGame();
    if (id === "badminton") return startBadmintonGame();
    if (id === "barista") return startBaristaGame();
  }

  // ================= 1. KUIS URANG BANDUNG (10 SOAL + 50/50 + TANYA WARGA) =================
  function startQuizGame() {
    const modal = document.getElementById("piraku-games-modal");
    let selectedCat = "Campur";
    const cats = ["Sejarah", "Kuliner", "Landmark", "Campur"];

    function renderIntro() {
      modal.innerHTML = `
        <div style="width:100%;max-width:400px;background:#0f172a;border:1.5px solid #f59e0b;border-radius:20px;padding:18px;color:#f8fafc;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:11px;font-weight:800;color:#f59e0b;">GEDUNG SATE • LOMBA KUIS</span>
            <button id="q-back" style="background:#1e293b;border:none;color:#cbd5e1;border-radius:8px;padding:4px 9px;font-size:11px;cursor:pointer;">← Daftar Game</button>
          </div>
          <div style="font-size:20px;font-weight:800;margin-bottom:6px;">Kuis Urang Bandung 🎓</div>
          <div style="font-size:12px;color:#cbd5e1;line-height:1.4;margin-bottom:12px;">Pilih kategori, lalu jawab 8 soal cepat. Setiap jawaban benar bernilai <b>100 Koin</b>, plus <b>bonus 300 Koin</b> kalau benar minimal 6! Waktu 15 detik per soal.</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
            ${cats.map(c => `<button data-qcat="${c}" style="padding:10px;border-radius:12px;border:1.5px solid ${selectedCat === c ? "#facc15" : "#334155"};background:${selectedCat === c ? "rgba(250,204,21,0.16)" : "#1e293b"};color:#fff;font-weight:800;font-size:12.5px;cursor:pointer;">${c}</button>`).join("")}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
            <span style="font-size:11px;padding:4px 9px;border-radius:999px;background:#1e293b;color:#fde047;">🧠 50/50 sekali</span>
            <span style="font-size:11px;padding:4px 9px;border-radius:999px;background:#1e293b;color:#38bdf8;">📞 Tanya warga</span>
            <span style="font-size:11px;padding:4px 9px;border-radius:999px;background:#1e293b;color:#4ade80;">🏆 Bonus 6+</span>
          </div>
          <button id="q-start" style="width:100%;padding:11px;border-radius:12px;border:none;background:#ea580c;color:#fff;font-size:14px;font-weight:800;cursor:pointer;">Mulai Kuis</button>
        </div>`;
      modal.querySelector("#q-back").onclick = renderGamesHub;
      modal.querySelectorAll("[data-qcat]").forEach(b => { b.onclick = () => { selectedCat = b.dataset.qcat; renderIntro(); }; });
      modal.querySelector("#q-start").onclick = runQuestions;
    }

    function runQuestions() {
      let pool = selectedCat === "Campur" ? [...QUIZ_BANK] : QUIZ_BANK.filter(x => x.cat === selectedCat || x.cat === "Bahasa");
      pool.sort(() => Math.random() - 0.5);
      const qs = pool.slice(0, 8);
      let idx = 0, correct = 0, used50 = false, usedHint = false, hiddenOpts = [], hintShown = "";

      function showQ() {
        clearGameTimer();
        if (idx >= qs.length) {
          const earned = correct * 100 + (correct >= 6 ? 300 : 0);
          if (earned > 0) addCoins(earned, "Kuis Urang Bandung (" + correct + "/" + qs.length + ")");
          modal.innerHTML = `<div style="width:100%;max-width:380px;background:#0f172a;border:1.5px solid #22c55e;border-radius:20px;padding:20px;text-align:center;color:#fff;">
            <div style="font-size:38px;margin-bottom:6px;">🎓</div>
            <div style="font-size:18px;font-weight:800;">Kuis Selesai!</div>
            <div style="font-size:13px;color:#cbd5e1;margin:8px 0;">Jawaban Benar: <b>${correct} dari ${qs.length}</b></div>
            <div style="font-size:16px;font-weight:800;color:#fde047;margin-bottom:14px;">+🪙 ${earned} Koin Piraku</div>
            <button id="q-done" style="width:100%;padding:10px;border-radius:12px;border:none;background:#22c55e;color:#0f172a;font-weight:800;cursor:pointer;">Kembali ke Daftar Game</button>
          </div>`;
          modal.querySelector("#q-done").onclick = renderGamesHub;
          return;
        }
        const cur = qs[idx];
        let sec = 15;
        modal.innerHTML = `<div style="width:100%;max-width:400px;background:#0f172a;border:1.5px solid #38bdf8;border-radius:20px;padding:16px;color:#f8fafc;">
          <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:8px;">
            <span style="color:#38bdf8;">Soal ${idx + 1}/${qs.length} • ${cur.cat}</span>
            <span id="q-timer" style="color:#fde047;">⏱️ ${sec}d</span>
          </div>
          <div style="font-size:14.5px;font-weight:700;line-height:1.4;margin-bottom:12px;">${cur.q}</div>
          ${hintShown ? `<div style="padding:8px;border-radius:10px;background:rgba(56,189,248,0.15);color:#bae6fd;font-size:11.5px;margin-bottom:10px;">📞 Kata Warga: "${hintShown}"</div>` : ""}
          <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:12px;">
            ${cur.a.map((opt, oi) => hiddenOpts.includes(oi) ? "" : `<button data-qopt="${oi}" style="text-align:left;padding:10px 12px;border-radius:11px;border:1px solid #334155;background:#1e293b;color:#f8fafc;font-size:12.5px;font-weight:700;cursor:pointer;">${String.fromCharCode(65 + oi)}. ${opt}</button>`).join("")}
          </div>
          <div style="display:flex;gap:8px;">
            <button id="q-50" ${used50 ? "disabled" : ""} style="flex:1;padding:7px;border-radius:9px;border:none;background:${used50 ? "#334155" : "#f59e0b"};color:#0f172a;font-size:11px;font-weight:800;cursor:pointer;">🧠 50/50</button>
            <button id="q-hint" ${usedHint ? "disabled" : ""} style="flex:1;padding:7px;border-radius:9px;border:none;background:${usedHint ? "#334155" : "#38bdf8"};color:#0f172a;font-size:11px;font-weight:800;cursor:pointer;">📞 Tanya Warga</button>
          </div>
        </div>`;

        activeTimer = setInterval(() => {
          sec--;
          const tEl = document.getElementById("q-timer");
          if (tEl) tEl.textContent = "⏱️ " + sec + "d";
          if (sec <= 0) { clearGameTimer(); idx++; hiddenOpts = []; hintShown = ""; showQ(); }
        }, 1000);

        modal.querySelectorAll("[data-qopt]").forEach(btn => {
          btn.onclick = () => {
            clearGameTimer();
            const pick = Number(btn.dataset.qopt);
            if (pick === cur.c) correct++;
            idx++; hiddenOpts = []; hintShown = "";
            showQ();
          };
        });
        const b50 = modal.querySelector("#q-50");
        if (b50 && !used50) b50.onclick = () => {
          used50 = true;
          const wrongs = [0, 1, 2, 3].filter(i => i !== cur.c).sort(() => Math.random() - 0.5);
          hiddenOpts = wrongs.slice(0, 2);
          showQ();
        };
        const bHint = modal.querySelector("#q-hint");
        if (bHint && !usedHint) bHint.onclick = () => {
          usedHint = true;
          hintShown = cur.hint;
          showQ();
        };
      }
      showQ();
    }
    renderIntro();
  }

  // ================= 2. KASIR WARUNG & MINIMARKET GASIBU =================
  function startCashierGame() {
    const modal = document.getElementById("piraku-games-modal");
    const ITEMS = [
      { name: "Kupat Tahu", icon: "🍲", price: 15 },
      { name: "Bandros Keju", icon: "🧇", price: 12 },
      { name: "Kopi Tubruk", icon: "☕", price: 8 },
      { name: "Air Mineral", icon: "💧", price: 5 },
      { name: "Batagor", icon: "🥟", price: 20 }
    ];
    let score = 0, sec = 40;

    function nextCustomer() {
      const basket = [ITEMS[Math.floor(Math.random() * ITEMS.length)], ITEMS[Math.floor(Math.random() * ITEMS.length)]];
      const total = basket.reduce((s, i) => s + i.price, 0);
      const paid = total <= 20 ? 20 : total <= 50 ? 50 : 100;
      const change = paid - total;
      const choices = Array.from(new Set([change, change + 5, Math.max(0, change - 5), change + 10])).sort(() => Math.random() - 0.5);

      modal.innerHTML = `<div style="width:100%;max-width:400px;background:#0f172a;border:1.5px solid #22c55e;border-radius:20px;padding:16px;color:#f8fafc;">
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:10px;">
          <span style="color:#4ade80;">🏪 Kasir Gasibu • Skor: ${score}</span>
          <span id="c-timer" style="color:#fde047;">⏱️ ${sec}d</span>
        </div>
        <div style="padding:12px;border-radius:12px;background:#1e293b;margin-bottom:10px;">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">Belanjaan Warga:</div>
          ${basket.map(b => `<div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:4px;"><span>${b.icon} ${b.name}</span><span>Rp ${b.price}.000</span></div>`).join("")}
          <div style="border-top:1px dashed #475569;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-size:13px;font-weight:800;color:#fde047;">
            <span>Total: Rp ${total}.000</span><span>Uang Tunai: Rp ${paid}.000</span>
          </div>
        </div>
        <div style="font-size:12px;color:#cbd5e1;margin-bottom:8px;">Pilih uang kembalian yang tepat:</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          ${choices.map(ch => `<button data-ch="${ch}" style="padding:11px;border-radius:11px;border:none;background:#2563eb;color:#fff;font-size:13px;font-weight:800;cursor:pointer;">Rp ${ch}.000</button>`).join("")}
        </div>
      </div>`;

      modal.querySelectorAll("[data-ch]").forEach(btn => {
        btn.onclick = () => {
          if (Number(btn.dataset.ch) === change) score += 120;
          nextCustomer();
        };
      });
    }

    nextCustomer();
    activeTimer = setInterval(() => {
      sec--;
      const el = document.getElementById("c-timer");
      if (el) el.textContent = "⏱️ " + sec + "d";
      if (sec <= 0) {
        clearGameTimer();
        const earned = Math.min(800, score);
        if (earned > 0) addCoins(earned, "Kasir Warung Gasibu");
        modal.innerHTML = `<div style="width:100%;max-width:360px;background:#0f172a;border:1.5px solid #22c55e;border-radius:20px;padding:20px;text-align:center;color:#fff;">
          <div style="font-size:36px;">🏪</div>
          <div style="font-size:18px;font-weight:800;margin:6px 0;">Shift Kasir Selesai!</div>
          <div style="font-size:15px;font-weight:800;color:#fde047;margin-bottom:14px;">+🪙 ${earned} Koin Piraku</div>
          <button id="c-done" style="width:100%;padding:10px;border-radius:12px;border:none;background:#22c55e;color:#0f172a;font-weight:800;cursor:pointer;">Kembali</button>
        </div>`;
        modal.querySelector("#c-done").onclick = renderGamesHub;
      }
    }, 1000);
  }

  // ================= 3. MANCING KOLAM TAMAN LANSIA =================
  function startFishingGame() {
    const modal = document.getElementById("piraku-games-modal");
    const FISH = [
      { name: "Ikan Mas Gasibu", icon: "🐟", coin: 140 },
      { name: "Lele Jumbo", icon: "🐡", coin: 180 },
      { name: "Nila Merah", icon: "🐠", coin: 120 },
      { name: "Koi Emas Gedung Sate", icon: "🐉", coin: 320 }
    ];
    let pos = 10, dir = 1, caught = [], tries = 3;

    function renderRod() {
      clearGameTimer();
      if (tries <= 0) {
        const total = caught.reduce((s, f) => s + f.coin, 0);
        if (total > 0) addCoins(total, "Mancing Taman Lansia");
        modal.innerHTML = `<div style="width:100%;max-width:370px;background:#0f172a;border:1.5px solid #38bdf8;border-radius:20px;padding:20px;text-align:center;color:#fff;">
          <div style="font-size:36px;">🎣</div>
          <div style="font-size:18px;font-weight:800;margin:6px 0;">Hasil Tangkapan</div>
          <div style="font-size:12px;color:#cbd5e1;margin-bottom:8px;">${caught.length ? caught.map(f => f.icon + " " + f.name).join(", ") : "Belum dapat ikan, coba lagi yuk!"}</div>
          <div style="font-size:16px;font-weight:800;color:#fde047;margin-bottom:14px;">+🪙 ${total} Koin Piraku</div>
          <button id="f-done" style="width:100%;padding:10px;border-radius:12px;border:none;background:#38bdf8;color:#0f172a;font-weight:800;cursor:pointer;">Selesai</button>
        </div>`;
        modal.querySelector("#f-done").onclick = renderGamesHub;
        return;
      }

      modal.innerHTML = `<div style="width:100%;max-width:390px;background:#0f172a;border:1.5px solid #38bdf8;border-radius:20px;padding:18px;color:#fff;text-align:center;">
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:10px;">
          <span style="color:#38bdf8;">🎣 Kolam Taman Lansia</span>
          <span>Sisa Umpan: ${tries}</span>
        </div>
        <div style="font-size:12px;color:#cbd5e1;margin-bottom:14px;">Tekan <b>Tarik Kail!</b> tepat saat pelampung berada di zona hijau tengah!</div>
        <div style="position:relative;height:26px;border-radius:999px;background:#1e293b;overflow:hidden;margin-bottom:16px;border:1px solid #334155;">
          <div style="position:absolute;left:38%;width:24%;top:0;bottom:0;background:rgba(34,197,94,0.45);border-left:2px solid #22c55e;border-right:2px solid #22c55e;"></div>
          <div id="f-pin" style="position:absolute;left:10%;top:2px;bottom:2px;width:12px;border-radius:999px;background:#fde047;"></div>
        </div>
        <button id="f-pull" style="width:100%;padding:12px;border-radius:12px;border:none;background:#22c55e;color:#0f172a;font-size:14px;font-weight:800;cursor:pointer;">🎣 Tarik Kail Sekarang!</button>
      </div>`;

      activeTimer = setInterval(() => {
        pos += dir * 3.8;
        if (pos >= 92) { pos = 92; dir = -1; }
        if (pos <= 2) { pos = 2; dir = 1; }
        const pin = document.getElementById("f-pin");
        if (pin) pin.style.left = pos + "%";
      }, 30);

      modal.querySelector("#f-pull").onclick = () => {
        tries--;
        if (pos >= 36 && pos <= 62) {
          const got = FISH[Math.floor(Math.random() * FISH.length)];
          caught.push(got);
        }
        renderRod();
      };
    }
    renderRod();
  }

  // ================= 4. BADMINTON GOR GASIBU =================
  function startBadmintonGame() {
    const modal = document.getElementById("piraku-games-modal");
    let pScore = 0, cScore = 0, aim = 50, msg = "Pilih jenis pukulan untuk menyerang Pelatih Bandung!";

    function renderCourt() {
      if (pScore >= 5 || cScore >= 5) {
        const win = pScore >= 5;
        const earned = win ? 650 : 150;
        addCoins(earned, win ? "Menang Badminton GOR Gasibu" : "Latihan Badminton Gasibu");
        modal.innerHTML = `<div style="width:100%;max-width:360px;background:#0f172a;border:1.5px solid #22c55e;border-radius:20px;padding:20px;text-align:center;color:#fff;">
          <div style="font-size:38px;">🏸</div>
          <div style="font-size:18px;font-weight:800;margin:6px 0;">${win ? "Menang Pertandingan!" : "Coba Lagi!"}</div>
          <div style="font-size:14px;color:#cbd5e1;margin-bottom:8px;">Skor Akhir: <b>${pScore} : ${cScore}</b></div>
          <div style="font-size:16px;font-weight:800;color:#fde047;margin-bottom:14px;">+🪙 ${earned} Koin Piraku</div>
          <button id="b-done" style="width:100%;padding:10px;border-radius:12px;border:none;background:#22c55e;color:#0f172a;font-weight:800;cursor:pointer;">Kembali</button>
        </div>`;
        modal.querySelector("#b-done").onclick = renderGamesHub;
        return;
      }

      modal.innerHTML = `<div style="width:100%;max-width:390px;background:#14532d;border:2px solid #86efac;border-radius:20px;padding:16px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:12px;font-weight:800;">🏸 GOR Gasibu • Lapangan 1</span>
          <button id="b-exit" style="background:rgba(0,0,0,0.35);border:none;color:#fff;padding:4px 9px;border-radius:8px;font-size:11px;cursor:pointer;">Keluar</button>
        </div>
        <div style="background:#f8fafc;color:#0f172a;border-radius:14px;padding:10px;text-align:center;font-weight:800;font-size:18px;margin-bottom:8px;">
          Kamu <span style="color:#dc2626;font-size:24px;">${pScore} : ${cScore}</span> Pelatih
        </div>
        <div style="background:rgba(0,0,0,0.28);padding:8px;border-radius:10px;font-size:11.5px;text-align:center;margin-bottom:10px;">${msg}</div>
        <div style="background:#f8fafc;color:#0f172a;padding:9px 12px;border-radius:12px;margin-bottom:10px;">
          <div style="font-size:11px;font-weight:700;margin-bottom:4px;">Bidik kiri / kanan (${aim}%)</div>
          <input id="b-aim" type="range" min="10" max="90" value="${aim}" style="width:100%;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          ${["Servis", "Drop", "Drive", "Smash"].map(shot => `<button data-shot="${shot}" style="padding:11px;border-radius:11px;border:none;background:${shot === "Smash" ? "#f59e0b" : "#ecfdf5"};color:#064e3b;font-size:13px;font-weight:800;cursor:pointer;">${shot}</button>`).join("")}
        </div>
      </div>`;

      modal.querySelector("#b-exit").onclick = renderGamesHub;
      modal.querySelector("#b-aim").oninput = e => { aim = Number(e.target.value); };
      modal.querySelectorAll("[data-shot]").forEach(btn => {
        btn.onclick = () => {
          const shot = btn.dataset.shot;
          const edgeBonus = Math.abs(aim - 50) > 22 ? 0.16 : 0;
          const winChance = (shot === "Smash" ? 0.62 : shot === "Drop" ? 0.58 : 0.54) + edgeBonus;
          if (Math.random() < winChance) {
            pScore++;
            msg = `🔥 ${shot} tajam ke sudut lapangan! Poin untuk kamu!`;
          } else {
            cScore++;
            msg = `Pelatih Bandung berhasil mengembalikan ${shot} kamu!`;
          }
          renderCourt();
        };
      });
    }
    renderCourt();
  }

  // ================= 5. RACIK KOPI & BANDROS MONJU =================
  function startBaristaGame() {
    const modal = document.getElementById("piraku-games-modal");
    const ORDERS = [
      { title: "Es Kopi Susu Gula Aren", steps: ["☕ Espresso", "🥛 Susu Segar", "🍯 Gula Aren"] },
      { title: "Bandros Keju Susu", steps: ["🧇 Adonan Kelapa", "🧀 Parutan Keju", "🥛 Susu Kental"] },
      { title: "Bajigur Hangat", steps: ["🥥 Santan", "🍯 Gula Aren", "🌿 Daun Pandan"] }
    ];
    let done = 0, stepIdx = 0, cur = ORDERS[0], sec = 35;

    function renderBar() {
      const pool = ["☕ Espresso", "🥛 Susu Segar", "🍯 Gula Aren", "🧇 Adonan Kelapa", "🧀 Parutan Keju", "🥛 Susu Kental", "🥥 Santan", "🌿 Daun Pandan"].sort(() => Math.random() - 0.5);
      modal.innerHTML = `<div style="width:100%;max-width:400px;background:#0f172a;border:1.5px solid #f59e0b;border-radius:20px;padding:16px;color:#fff;">
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:8px;">
          <span style="color:#f59e0b;">☕ Kedai Monju • Pesanan: ${done}</span>
          <span id="k-timer" style="color:#fde047;">⏱️ ${sec}d</span>
        </div>
        <div style="padding:11px;border-radius:12px;background:#1e293b;margin-bottom:10px;">
          <div style="font-size:13px;font-weight:800;color:#fde047;margin-bottom:6px;">Pesanan: ${cur.title}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${cur.steps.map((st, i) => `<span style="padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;background:${i < stepIdx ? "#22c55e" : "#334155"};color:${i < stepIdx ? "#0f172a" : "#e2e8f0"};">${i < stepIdx ? "✓ " : ""}${st}</span>`).join("")}
          </div>
        </div>
        <div style="font-size:11.5px;color:#cbd5e1;margin-bottom:8px;">Klik bahan berikutnya secara berurutan:</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
          ${pool.map(ing => `<button data-ing="${ing}" style="padding:9px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:12px;font-weight:700;cursor:pointer;">${ing}</button>`).join("")}
        </div>
      </div>`;

      modal.querySelectorAll("[data-ing]").forEach(btn => {
        btn.onclick = () => {
          if (btn.dataset.ing === cur.steps[stepIdx]) {
            stepIdx++;
            if (stepIdx >= cur.steps.length) {
              done++;
              stepIdx = 0;
              cur = ORDERS[Math.floor(Math.random() * ORDERS.length)];
            }
            renderBar();
          }
        };
      });
    }

    renderBar();
    activeTimer = setInterval(() => {
      sec--;
      const el = document.getElementById("k-timer");
      if (el) el.textContent = "⏱️ " + sec + "d";
      if (sec <= 0) {
        clearGameTimer();
        const earned = Math.min(750, done * 180);
        if (earned > 0) addCoins(earned, "Kedai Kopi & Bandros Monju");
        modal.innerHTML = `<div style="width:100%;max-width:360px;background:#0f172a;border:1.5px solid #f59e0b;border-radius:20px;padding:20px;text-align:center;color:#fff;">
          <div style="font-size:36px;">☕</div>
          <div style="font-size:18px;font-weight:800;margin:6px 0;">Pesanan Selesai: ${done}</div>
          <div style="font-size:16px;font-weight:800;color:#fde047;margin-bottom:14px;">+🪙 ${earned} Koin Piraku</div>
          <button id="k-done" style="width:100%;padding:10px;border-radius:12px;border:none;background:#f59e0b;color:#0f172a;font-weight:800;cursor:pointer;">Kembali</button>
        </div>`;
        modal.querySelector("#k-done").onclick = renderGamesHub;
      }
    }, 1000);
  }
})();
