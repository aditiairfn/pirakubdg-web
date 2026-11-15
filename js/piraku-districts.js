// ================= PIRAKUBDG 30 KECAMATAN DEVELOPMENT & 3D PAVILIONS =================
(function() {
  const DISTRICTS = [
    // BANDUNG TENGAH (Pusat Kota & Pemerintahan)
    { id: "bandung_wetan", name: "Bandung Wetan", zone: "Tengah", icon: "🏛️", landmark: "Gedung Sate & Lapangan Gasibu", x: 0, z: -6, color: 0xfacc15 },
    { id: "sumur_bandung", name: "Sumur Bandung", zone: "Tengah", icon: "🎭", landmark: "Jl. Braga & Balai Kota", x: -8, z: 14, color: 0x38bdf8 },
    { id: "lengkong", name: "Lengkong", zone: "Tengah", icon: "🍜", landmark: "Burangrang & Kuliner Malam", x: -4, z: 22, color: 0xf97316 },
    { id: "regol", name: "Regol", zone: "Tengah", icon: "🕌", landmark: "Alun-Alun & Masjid Raya", x: -12, z: 22, color: 0x22c55e },
    { id: "batununggal", name: "Batununggal", zone: "Tengah", icon: "🏢", landmark: "Gatot Subroto & Laswi", x: 8, z: 20, color: 0xa855f7 },
    { id: "kiaracondong", name: "Kiaracondong", zone: "Tengah", icon: "🚆", landmark: "Stasiun Kiaracondong", x: 16, z: 18, color: 0xec4899 },

    // BANDUNG UTARA (Kampus, Wisata & Pegunungan)
    { id: "coblong", name: "Coblong", zone: "Utara", icon: "🎓", landmark: "Monju, Dago & Kampus ITB", x: 0, z: -38, color: 0x3b82f6 },
    { id: "cidadap", name: "Cidadap", zone: "Utara", icon: "🌲", landmark: "Ciumbuleuit & Punclut", x: -12, z: -44, color: 0x16a34a },
    { id: "sukasari", name: "Sukasari", zone: "Utara", icon: "🏫", landmark: "Setiabudi & Isola UPI", x: -22, z: -40, color: 0x0ea5e9 },
    { id: "sukajadi", name: "Sukajadi", zone: "Utara", icon: "🛍️", landmark: "Paris Van Java & Pasteur", x: -24, z: -28, color: 0xf43f5e },
    { id: "cibeunying_kaler", name: "Cibeunying Kaler", zone: "Utara", icon: "🎨", landmark: "Cigadung & Taman Makam Pahlawan", x: 12, z: -36, color: 0xeab308 },
    { id: "cibeunying_kidul", name: "Cibeunying Kidul", zone: "Utara", icon: "🎸", landmark: "Cicaheum & Padasuka Saung Udjo", x: 22, z: -26, color: 0x14b8a6 },

    // BANDUNG TIMUR (Teknologi, Stadion & Kawasan Baru)
    { id: "antapani", name: "Antapani", zone: "Timur", icon: "🌉", landmark: "Flyover Pelangi Antapani", x: 24, z: -8, color: 0xf59e0b },
    { id: "arcamanik", name: "Arcamanik", zone: "Timur", icon: "🏟️", landmark: "SPOrT Jabar Arcamanik", x: 30, z: -14, color: 0x22c55e },
    { id: "mandalajati", name: "Mandalajati", zone: "Timur", icon: "⛰️", landmark: "Sindanglaya & Bukit Moko", x: 30, z: -26, color: 0x10b981 },
    { id: "ujungberung", name: "Ujungberung", zone: "Timur", icon: "🥁", landmark: "Alun-Alun Ujungberung & Benjang", x: 36, z: -18, color: 0xef4444 },
    { id: "cinambo", name: "Cinambo", zone: "Timur", icon: "🏭", landmark: "Sentra Industri Timur", x: 34, z: -4, color: 0x64748b },
    { id: "panyileukan", name: "Panyileukan", zone: "Timur", icon: "🏡", landmark: "Cipadung & Gerbang Timur", x: 38, z: 4, color: 0x06b6d4 },
    { id: "cibiru", name: "Cibiru", zone: "Timur", icon: "📚", landmark: "Bunderan Cibiru & UIN", x: 40, z: -8, color: 0x8b5cf6 },
    { id: "gedebage", name: "Gedebage", zone: "Timur", icon: "⚽", landmark: "Stadion GBLA, Masjid Al Jabbar & Whoosh", x: 36, z: 16, color: 0xfacc15 },

    // BANDUNG SELATAN (Hunian & Kreatif)
    { id: "rancasari", name: "Rancasari", zone: "Selatan", icon: "🌿", landmark: "Ciwastra & Derwati", x: 26, z: 24, color: 0x22c55e },
    { id: "buahbatu", name: "Buahbatu", zone: "Selatan", icon: "🚗", landmark: "Margacinta & Gerbang Tol Buahbatu", x: 16, z: 28, color: 0x3b82f6 },
    { id: "bandung_kidul", name: "Bandung Kidul", zone: "Selatan", icon: "🏞️", landmark: "Mengger & Batununggal Indah", x: 4, z: 28, color: 0x14b8a6 },

    // BANDUNG BARAT (Perdagangan, Kuliner & Bandara)
    { id: "cicendo", name: "Cicendo", zone: "Barat", icon: "✈️", landmark: "Bandara Husein & Stasiun Bandung", x: -26, z: -12, color: 0x38bdf8 },
    { id: "andir", name: "Andir", zone: "Barat", icon: "🏮", landmark: "Cibadak Culinary Night & Pasar Baru", x: -24, z: 4, color: 0xef4444 },
    { id: "astanaanyar", name: "Astanaanyar", zone: "Barat", icon: "🧵", landmark: "Tegalega & Monumen Bandung Lautan Api", x: -18, z: 20, color: 0xf97316 },
    { id: "bojongloa_kaler", name: "Bojongloa Kaler", zone: "Barat", icon: "👞", landmark: "Jamika & Pagarsih", x: -26, z: 14, color: 0xeab308 },
    { id: "bojongloa_kidul", name: "Bojongloa Kidul", zone: "Barat", icon: "👠", landmark: "Sentra Sepatu Cibaduyut", x: -24, z: 26, color: 0xd97706 },
    { id: "babakan_ciparay", name: "Babakan Ciparay", zone: "Barat", icon: "🚌", landmark: "Terminal Leuwipanjang & Caringin", x: -32, z: 20, color: 0x0ea5e9 },
    { id: "bandung_kulon", name: "Bandung Kulon", zone: "Barat", icon: "🛣️", landmark: "Cijerah & Gerbang Tol Pasirkoja", x: -34, z: 8, color: 0x6366f1 }
  ];

  const LEVELS = [
    { min: 0,    lv: 1, title: "Pos RW Digital" },
    { min: 500,  lv: 2, title: "Taman Tematik & Wi-Fi" },
    { min: 1500, lv: 3, title: "Sentra Kuliner & Kreatif" },
    { min: 3500, lv: 4, title: "Balai Kota Satelit" },
    { min: 7000, lv: 5, title: "Ikon Metropolis Bandung" }
  ];

  function getLevelInfo(coins) {
    let cur = LEVELS[0], next = LEVELS[1];
    for (let i = 0; i < LEVELS.length; i++) {
      if (coins >= LEVELS[i].min) {
        cur = LEVELS[i];
        next = LEVELS[i + 1] || null;
      }
    }
    return { cur, next };
  }

  const STORAGE_KEY = "piraku_districts_v1";
  let localInvest = {};
  try { localInvest = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) {}

  let myDistrictName = localStorage.getItem("piraku_my_kecamatan") || "Bandung Wetan";

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localInvest));
      localStorage.setItem("piraku_my_kecamatan", myDistrictName);
    } catch (e) {}
    const ktpEl = document.getElementById("ktp-kec");
    if (ktpEl) ktpEl.textContent = myDistrictName;
  }

  function getCoinsFor(d) {
    return Number(localInvest[d.id] || (d.id === "bandung_wetan" ? 1200 : d.id === "coblong" ? 850 : 150));
  }

  async function syncDistrictsFromSupabase() {
    const sb = window.pirakuSupabase;
    if (!sb) return;
    try {
      const { data } = await sb.from("piraku_districts").select("district_id, invested_coins");
      if (data && data.length > 0) {
        data.forEach(row => {
          if (typeof row.invested_coins === "number") {
            localInvest[row.district_id] = Math.max(localInvest[row.district_id] || 0, row.invested_coins);
          }
        });
        saveLocal();
        rebuildDistrictMarkers3D();
      }
    } catch (e) {}
  }

  async function pushDistrictToSupabase(d, newCoins) {
    const sb = window.pirakuSupabase;
    if (!sb) return;
    try {
      await sb.from("piraku_districts").upsert({
        district_id: d.id,
        district_name: d.name,
        zone_group: d.zone,
        invested_coins: newCoins,
        updated_at: new Date().toISOString()
      }, { onConflict: "district_id" });
    } catch (e) {}
  }

  // ================= 1. PAVILIUN 3D 30 KECAMATAN & DETEKSI MASUK WILAYAH =================
  let markersGroup = null;
  let lastBannerDistrictId = null;

  function rebuildDistrictMarkers3D() {
    const sc = window.pirakuScene;
    if (!sc || typeof THREE === "undefined") return;
    if (markersGroup) sc.remove(markersGroup);
    markersGroup = new THREE.Group();

    DISTRICTS.forEach(d => {
      const coins = getCoinsFor(d);
      const { cur } = getLevelInfo(coins);
      const h = 0.7 + cur.lv * 0.35;

      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.36, h, 8),
        new THREE.MeshStandardMaterial({ color: d.color, roughness: 0.4, metalness: 0.35 })
      );
      pillar.position.set(d.x, h / 2, d.z);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.45, 0.65, 20),
        new THREE.MeshBasicMaterial({ color: d.color, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(d.x, 0.05, d.z);

      markersGroup.add(pillar, ring);
    });

    sc.add(markersGroup);
  }

  function showDistrictBanner(d) {
    const banner = document.getElementById("district-banner");
    const titleEl = document.getElementById("district-title");
    const subEl = document.getElementById("district-subtitle");
    if (!banner || !titleEl || !subEl) return;
    const { cur } = getLevelInfo(getCoinsFor(d));
    titleEl.textContent = `${d.icon} KEC. ${d.name.toUpperCase()} • LV.${cur.lv}`;
    subEl.textContent = `${d.landmark} (${cur.title})`;
    banner.style.opacity = "1";
    banner.style.transform = "translateX(-50%) translateY(0px)";
    clearTimeout(banner._t);
    banner._t = setTimeout(() => {
      banner.style.opacity = "0";
      banner.style.transform = "translateX(-50%) translateY(-25px)";
    }, 3200);
  }

  function checkPlayerDistrictProximity() {
    const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (mesh && mesh.position) {
      let nearest = null, minD = 3.2;
      for (const d of DISTRICTS) {
        const dist = Math.hypot(mesh.position.x - d.x, mesh.position.z - d.z);
        if (dist < minD) { minD = dist; nearest = d; }
      }
      if (nearest && nearest.id !== lastBannerDistrictId) {
        lastBannerDistrictId = nearest.id;
        showDistrictBanner(nearest);
      } else if (!nearest) {
        lastBannerDistrictId = null;
      }
    }
    requestAnimationFrame(checkPlayerDistrictProximity);
  }

  // ================= 2. MODAL PENGEMBANGAN 30 KECAMATAN KOTA BANDUNG =================
  let filterZone = "Semua";

  window.openDistrictsHubModal = function() {
    let modal = document.getElementById("piraku-districts-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "piraku-districts-modal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.82);backdrop-filter:blur(9px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:12px;touch-action:pan-y;";
      modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";
    renderDistrictsModal();
  };

  function renderDistrictsModal() {
    const modal = document.getElementById("piraku-districts-modal");
    if (!modal) return;
    const zones = ["Semua", "Tengah", "Utara", "Timur", "Selatan", "Barat"];
    const myD = DISTRICTS.find(d => d.name === myDistrictName) || DISTRICTS[0];
    const myCoins = getCoinsFor(myD);
    const myLv = getLevelInfo(myCoins);

    const ranked = [...DISTRICTS].sort((a, b) => getCoinsFor(b) - getCoinsFor(a));
    const filtered = filterZone === "Semua" ? ranked : ranked.filter(d => d.zone === filterZone);

    modal.innerHTML = `
      <div style="width:100%;max-width:430px;background:linear-gradient(180deg,#0f172a,#131c31);border:1.5px solid rgba(250,204,21,0.45);border-radius:22px;padding:16px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.82);max-height:84dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div>
            <div style="font-size:10.5px;color:#facc15;font-weight:800;letter-spacing:.7px;">OTONOMI WARGA • 30 KECAMATAN</div>
            <div style="font-size:18px;font-weight:800;">Pembangunan Wilayah Bandung 🏙️</div>
          </div>
          <button id="dt-close" style="width:32px;height:32px;border-radius:50%;border:none;background:#1e293b;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>

        <!-- Kartu Kecamatan Domisili Aktif -->
        <div style="padding:12px;border-radius:16px;background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.4);margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:10.5px;font-weight:800;color:#fde047;">🪪 KECAMATAN KTP KAMU</span>
            <select id="dt-select-my" style="background:#0f172a;color:#fde047;border:1px solid #facc15;border-radius:8px;padding:3px 7px;font-size:11px;font-weight:700;">
              ${DISTRICTS.map(d => `<option value="${d.name}" ${d.name === myDistrictName ? "selected" : ""}>${d.name}</option>`).join("")}
            </select>
          </div>
          <div style="font-size:15px;font-weight:800;">${myD.icon} Kec. ${myD.name} • <span style="color:#4ade80;">Lv.${myLv.cur.lv} (${myLv.cur.title})</span></div>
          <div style="font-size:11px;color:#cbd5e1;margin:3px 0 8px;">📍 ${myD.landmark} • Dana Pembangunan: <b style="color:#fde047;">🪙 ${myCoins.toLocaleString("id-ID")}</b></div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
            <button data-invest="${myD.id}" data-amt="50" style="padding:7px 4px;border-radius:9px;border:none;background:#2563eb;color:#fff;font-size:11px;font-weight:800;cursor:pointer;">+🪙 50 Bangun</button>
            <button data-invest="${myD.id}" data-amt="150" style="padding:7px 4px;border-radius:9px;border:none;background:#16a34a;color:#fff;font-size:11px;font-weight:800;cursor:pointer;">+🪙 150 Maju</button>
            <button data-invest="${myD.id}" data-amt="500" style="padding:7px 4px;border-radius:9px;border:none;background:#f59e0b;color:#0f172a;font-size:11px;font-weight:800;cursor:pointer;">+🪙 500 Sultan</button>
          </div>
        </div>

        <!-- Filter Zona 5 Wilayah Bandung -->
        <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;margin-bottom:10px;">
          ${zones.map(z => `<button data-zone="${z}" style="padding:5px 10px;border-radius:999px;border:none;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;background:${filterZone === z ? "#38bdf8" : "#1e293b"};color:${filterZone === z ? "#0f172a" : "#cbd5e1"};">${z}</button>`).join("")}
        </div>

        <!-- Daftar & Klasemen 30 Kecamatan -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${filtered.map(d => {
            const rankIdx = ranked.findIndex(r => r.id === d.id) + 1;
            const c = getCoinsFor(d);
            const lvInfo = getLevelInfo(c);
            return `
              <div style="padding:10px 12px;border-radius:14px;background:#1e293b;border:1px solid ${d.name === myDistrictName ? "rgba(250,204,21,0.5)" : "rgba(148,163,184,0.2)"};display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div>
                  <div style="font-size:13px;font-weight:800;color:#f8fafc;">#${rankIdx} ${d.icon} ${d.name} <span style="font-size:10px;padding:1px 6px;border-radius:999px;background:rgba(56,189,248,0.16);color:#38bdf8;">Lv.${lvInfo.cur.lv}</span></div>
                  <div style="font-size:10.5px;color:#94a3b8;margin-top:2px;">${d.landmark} • <b style="color:#fde047;">🪙 ${c.toLocaleString("id-ID")}</b></div>
                </div>
                <div style="display:flex;gap:5px;flex-shrink:0;">
                  <button data-invest="${d.id}" data-amt="50" style="padding:6px 8px;border-radius:8px;border:none;background:#f59e0b;color:#0f172a;font-size:10.5px;font-weight:800;cursor:pointer;">+50</button>
                  <button data-visit="${d.id}" style="padding:6px 8px;border-radius:8px;border:1px solid #38bdf8;background:rgba(56,189,248,0.12);color:#38bdf8;font-size:10.5px;font-weight:700;cursor:pointer;">Peta →</button>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>`;

    modal.querySelector("#dt-close").onclick = () => { modal.style.display = "none"; };
    modal.querySelector("#dt-select-my").onchange = e => {
      myDistrictName = e.target.value;
      saveLocal();
      renderDistrictsModal();
    };
    modal.querySelectorAll("[data-zone]").forEach(b => {
      b.onclick = () => { filterZone = b.dataset.zone; renderDistrictsModal(); };
    });
    modal.querySelectorAll("[data-invest]").forEach(b => {
      b.onclick = () => {
        const d = DISTRICTS.find(x => x.id === b.dataset.invest);
        const amt = Number(b.dataset.amt || 50);
        if (!d || !window.PirakuEconomy) return;
        if (!window.PirakuEconomy.spendCoins(amt, "Bangun Kec. " + d.name)) return;
        const nextVal = getCoinsFor(d) + amt;
        localInvest[d.id] = nextVal;
        saveLocal();
        rebuildDistrictMarkers3D();
        pushDistrictToSupabase(d, nextVal);
        renderDistrictsModal();
      };
    });
    modal.querySelectorAll("[data-visit]").forEach(b => {
      b.onclick = () => {
        const d = DISTRICTS.find(x => x.id === b.dataset.visit);
        if (!d) return;
        const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
        if (mesh && mesh.position) {
          mesh.position.set(d.x, 0.14, d.z + 1.2);
          if (mesh.userData && mesh.userData.a && mesh.userData.a.c) {
            mesh.userData.a.c.x = d.x;
            mesh.userData.a.c.z = d.z + 1.2;
          }
        }
        modal.style.display = "none";
        showDistrictBanner(d);
      };
    });
  }

  // Isi lengkap opsi <select id="signup-kecamatan"> dengan 30 kecamatan resmi
  function populateSignupKecamatan() {
    const sel = document.getElementById("signup-kecamatan");
    if (!sel || sel.dataset.populated30 === "1") return;
    sel.innerHTML = DISTRICTS.map(d => `<option value="${d.name}" ${d.name === "Bandung Wetan" ? "selected" : ""}>${d.name} (${d.zone})</option>`).join("");
    sel.dataset.populated30 = "1";
  }

  setTimeout(() => {
    populateSignupKecamatan();
    rebuildDistrictMarkers3D();
    syncDistrictsFromSupabase();
    requestAnimationFrame(checkPlayerDistrictProximity);
  }, 1600);
})();
