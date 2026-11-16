// ================= PIRAKUBDG 30 KECAMATAN MULTI-MAP ENGINE (HD STYLISH & SAFE SYNC) =================
(function() {
  const DISTRICTS = [
    { id: "bandung_wetan", name: "Bandung Wetan", zone: "Tengah", icon: "🏛️", landmark: "Gedung Sate & Lapangan Gasibu", theme: "central", ground: 0x14532d, accent: 0xfacc15, isMainMap: true },
    { id: "sumur_bandung", name: "Sumur Bandung", zone: "Tengah", icon: "🎭", landmark: "Jl. Braga & Balai Kota", theme: "heritage", ground: 0x166534, accent: 0x38bdf8 },
    { id: "lengkong", name: "Lengkong", zone: "Tengah", icon: "🍜", landmark: "Burangrang & Kuliner Malam", theme: "culinary", ground: 0x15803d, accent: 0xf97316 },
    { id: "regol", name: "Regol", zone: "Tengah", icon: "🕌", landmark: "Alun-Alun & Masjid Raya", theme: "alunalun", ground: 0x16a34a, accent: 0x22c55e },
    { id: "batununggal", name: "Batununggal", zone: "Tengah", icon: "🏢", landmark: "Gatot Subroto & Laswi", theme: "urban", ground: 0x1e293b, accent: 0xa855f7 },
    { id: "kiaracondong", name: "Kiaracondong", zone: "Tengah", icon: "🚆", landmark: "Stasiun Kiaracondong", theme: "transit", ground: 0x14532d, accent: 0xec4899 },

    { id: "coblong", name: "Coblong", zone: "Utara", icon: "🎓", landmark: "Monju, Dago & Kampus ITB", theme: "campus", ground: 0x14532d, accent: 0x3b82f6 },
    { id: "cidadap", name: "Cidadap", zone: "Utara", icon: "🌲", landmark: "Ciumbuleuit & Punclut", theme: "forest", ground: 0x064e3b, accent: 0x16a34a },
    { id: "sukasari", name: "Sukasari", zone: "Utara", icon: "🏫", landmark: "Setiabudi & Isola UPI", theme: "campus", ground: 0x14532d, accent: 0x0ea5e9 },
    { id: "sukajadi", name: "Sukajadi", zone: "Utara", icon: "🛍️", landmark: "Paris Van Java & Pasteur", theme: "urban", ground: 0x166534, accent: 0xf43f5e },
    { id: "cibeunying_kaler", name: "Cibeunying Kaler", zone: "Utara", icon: "🎨", landmark: "Cigadung & Taman Makam Pahlawan", theme: "forest", ground: 0x15803d, accent: 0xeab308 },
    { id: "cibeunying_kidul", name: "Cibeunying Kidul", zone: "Utara", icon: "🎸", landmark: "Cicaheum & Saung Angklung Udjo", theme: "heritage", ground: 0x166534, accent: 0x14b8a6 },

    { id: "antapani", name: "Antapani", zone: "Timur", icon: "🌉", landmark: "Flyover Pelangi Antapani", theme: "transit", ground: 0x15803d, accent: 0xf59e0b },
    { id: "arcamanik", name: "Arcamanik", zone: "Timur", icon: "🏟️", landmark: "SPOrT Jabar Arcamanik", theme: "stadium", ground: 0x16a34a, accent: 0x22c55e },
    { id: "mandalajati", name: "Mandalajati", zone: "Timur", icon: "⛰️", landmark: "Sindanglaya & Bukit Moko", theme: "forest", ground: 0x065f46, accent: 0x10b981 },
    { id: "ujungberung", name: "Ujungberung", zone: "Timur", icon: "🥁", landmark: "Alun-Alun Ujungberung & Benjang", theme: "alunalun", ground: 0x15803d, accent: 0xef4444 },
    { id: "cinambo", name: "Cinambo", zone: "Timur", icon: "🏭", landmark: "Sentra Industri Timur", theme: "urban", ground: 0x1e293b, accent: 0x64748b },
    { id: "panyileukan", name: "Panyileukan", zone: "Timur", icon: "🏡", landmark: "Cipadung & Gerbang Timur", theme: "alunalun", ground: 0x166534, accent: 0x06b6d4 },
    { id: "cibiru", name: "Cibiru", zone: "Timur", icon: "📚", landmark: "Bunderan Cibiru & UIN", theme: "campus", ground: 0x14532d, accent: 0x8b5cf6 },
    { id: "gedebage", name: "Gedebage", zone: "Timur", icon: "⚽", landmark: "Stadion GBLA, Masjid Al Jabbar & Whoosh", theme: "stadium", ground: 0x0f766e, accent: 0xfacc15 },

    { id: "rancasari", name: "Rancasari", zone: "Selatan", icon: "🌿", landmark: "Ciwastra & Derwati", theme: "alunalun", ground: 0x15803d, accent: 0x22c55e },
    { id: "buahbatu", name: "Buahbatu", zone: "Selatan", icon: "🚗", landmark: "Margacinta & Gerbang Tol Buahbatu", theme: "transit", ground: 0x166534, accent: 0x3b82f6 },
    { id: "bandung_kidul", name: "Bandung Kidul", zone: "Selatan", icon: "🏞️", landmark: "Mengger & Batununggal Indah", theme: "urban", ground: 0x15803d, accent: 0x14b8a6 },

    { id: "cicendo", name: "Cicendo", zone: "Barat", icon: "✈️", landmark: "Bandara Husein & Stasiun Bandung", theme: "transit", ground: 0x1e293b, accent: 0x38bdf8 },
    { id: "andir", name: "Andir", zone: "Barat", icon: "🏮", landmark: "Cibadak Culinary Night & Pasar Baru", theme: "culinary", ground: 0x166534, accent: 0xef4444 },
    { id: "astanaanyar", name: "Astanaanyar", zone: "Barat", icon: "🧵", landmark: "Tegalega & Monumen Bandung Lautan Api", theme: "alunalun", ground: 0x15803d, accent: 0xf97316 },
    { id: "bojongloa_kaler", name: "Bojongloa Kaler", zone: "Barat", icon: "👞", landmark: "Jamika & Pagarsih", theme: "urban", ground: 0x166534, accent: 0xeab308 },
    { id: "bojongloa_kidul", name: "Bojongloa Kidul", zone: "Barat", icon: "👠", landmark: "Sentra Sepatu Cibaduyut", theme: "culinary", ground: 0x15803d, accent: 0xd97706 },
    { id: "babakan_ciparay", name: "Babakan Ciparay", zone: "Barat", icon: "🚌", landmark: "Terminal Leuwipanjang & Caringin", theme: "transit", ground: 0x1e293b, accent: 0x0ea5e9 },
    { id: "bandung_kulon", name: "Bandung Kulon", zone: "Barat", icon: "🛣️", landmark: "Cijerah & Gerbang Tol Pasirkoja", theme: "transit", ground: 0x166534, accent: 0x6366f1 }
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
      if (coins >= LEVELS[i].min) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; }
    }
    return { cur, next };
  }

  const STORAGE_KEY = "piraku_districts_v1";
  let localInvest = {};
  try { localInvest = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) {}

  let savedKtp = localStorage.getItem("piraku_ktp_kecamatan") || localStorage.getItem("piraku_user_kecamatan") || localStorage.getItem("piraku_my_kecamatan") || "Bandung Wetan";
  let myDistrictName = DISTRICTS.find(d => d.name.toLowerCase() === savedKtp.toLowerCase()) ? DISTRICTS.find(d => d.name.toLowerCase() === savedKtp.toLowerCase()).name : "Bandung Wetan";
  let activeMapId = "bandung_wetan";

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
      const { data, error } = await sb.from("piraku_districts").select("district_id, invested_coins");
      if (!error && data && data.length > 0) {
        data.forEach(row => {
          if (typeof row.invested_coins === "number") {
            localInvest[row.district_id] = Math.max(localInvest[row.district_id] || 0, row.invested_coins);
          }
        });
        saveLocal();
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

  // ================= 1. ENGINE MULTI-MAP 3D HD TERPISAH PER KECAMATAN =================
  let hiddenMainObjects = [];
  let customDistrictGroup = null;
  let districtCoins = [];

  function buildDedicatedDistrictScene(d) {
    const sc = window.pirakuScene;
    if (!sc || typeof THREE === "undefined") return;

    const playerMesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (hiddenMainObjects.length === 0) {
      sc.children.forEach(obj => {
        if (obj === playerMesh || obj.isLight || obj.isCamera || obj === customDistrictGroup) return;
        if (obj.visible) {
          obj.visible = false;
          hiddenMainObjects.push(obj);
        }
      });
    }

    if (customDistrictGroup) {
      sc.remove(customDistrictGroup);
      customDistrictGroup = null;
    }
    districtCoins = [];

    const grp = new THREE.Group();
    grp.name = "piraku-hd-district-map";
    const coins = getCoinsFor(d);
    const { cur } = getLevelInfo(coins);

    // Tanah Rumput HD Bertekstur Lembut
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(96, 96),
      new THREE.MeshStandardMaterial({ color: d.ground, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    grp.add(ground);

    // Jalan Aspal Utama Simpang 4
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 96), roadMat);
    roadNS.rotation.x = -Math.PI / 2; roadNS.position.set(0, 0.02, 0);
    const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(96, 8.5), roadMat);
    roadEW.rotation.x = -Math.PI / 2; roadEW.position.set(0, 0.02, 0);
    grp.add(roadNS, roadEW);

    // Marka Jalan Kuning Tengah
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const lineNS = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 96), lineMat);
    lineNS.rotation.x = -Math.PI / 2; lineNS.position.set(0, 0.03, 0);
    const lineEW = new THREE.Mesh(new THREE.PlaneGeometry(96, 0.35), lineMat);
    lineEW.rotation.x = -Math.PI / 2; lineEW.position.set(0, 0.03, 0);
    grp.add(lineNS, lineEW);

    // Alun-Alun / Plaza Bundar di Tengah Distrik
    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(13, 36),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 })
    );
    plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0.035, 0);
    const plazaRing = new THREE.Mesh(
      new THREE.RingGeometry(13, 15.5, 36),
      new THREE.MeshBasicMaterial({ color: d.accent, side: THREE.DoubleSide })
    );
    plazaRing.rotation.x = -Math.PI / 2; plazaRing.position.set(0, 0.04, 0);
    grp.add(plaza, plazaRing);

    // Landmark 3D Eksklusif di Tengah Alun-Alun
    const landmarkGroup = new THREE.Group();
    landmarkGroup.position.set(0, 0, 0);

    if (d.theme === "stadium") {
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(4.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.3, roughness: 0.2 })
      );
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(4.9, 0.4, 10, 32),
        new THREE.MeshStandardMaterial({ color: d.accent })
      );
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.4;
      landmarkGroup.add(dome, ring);
    } else if (d.theme === "campus" || d.theme === "heritage") {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(7, 3.5, 4),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 })
      );
      base.position.y = 1.75;
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(5.5, 2.6, 4),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45 })
      );
      roof.rotation.y = Math.PI / 4; roof.position.y = 4.8;
      landmarkGroup.add(base, roof);
    } else {
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(2.8, 3.4, 1.4, 16),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      ped.position.y = 0.7;
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 1.2, 7, 12),
        new THREE.MeshStandardMaterial({ color: d.accent, metalness: 0.6, roughness: 0.2 })
      );
      spire.position.y = 4.7;
      landmarkGroup.add(ped, spire);
    }
    grp.add(landmarkGroup);

    // Papan Gerbang Selamat Datang 3D
    const signCv = document.createElement("canvas");
    signCv.width = 512; signCv.height = 128;
    const sctx = signCv.getContext("2d");
    sctx.fillStyle = "#0f172a"; sctx.fillRect(0, 0, 512, 128);
    sctx.strokeStyle = "#facc15"; sctx.lineWidth = 6; sctx.strokeRect(4, 4, 504, 120);
    sctx.fillStyle = "#fde047"; sctx.font = "bold 24px sans-serif"; sctx.textAlign = "center";
    sctx.fillText(`KEC. ${d.name.toUpperCase()} • LV.${cur.lv}`, 256, 48);
    sctx.fillStyle = "#e2e8f0"; sctx.font = "18px sans-serif";
    sctx.fillText(d.landmark.slice(0, 38), 256, 88);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 1.9),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(signCv) })
    );
    signMesh.position.set(0, 3.4, -18);
    const poleL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.5, 8), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    poleL.position.set(-3.5, 2.25, -18);
    const poleR = poleL.clone(); poleR.position.x = 3.5;
    grp.add(signMesh, poleL, poleR);

    // Gedung-Gedung Komersial & Perumahan (Bertambah sesuai Level 1..5)
    const bCount = 8 + cur.lv * 4;
    const bMatPool = [
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0xfce7f3, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 })
    ];
    for (let i = 0; i < bCount; i++) {
      const ang = (i / bCount) * Math.PI * 2;
      const rad = 22 + (i % 3) * 7;
      const bx = Math.cos(ang) * rad;
      const bz = Math.sin(ang) * rad;
      if (Math.abs(bx) < 7 || Math.abs(bz) < 7) continue;
      const bh = 3.0 + ((i * 5) % 6) * (0.7 + cur.lv * 0.28);
      const bMesh = new THREE.Mesh(
        new THREE.BoxGeometry(4.0, bh, 4.0),
        bMatPool[i % bMatPool.length]
      );
      bMesh.position.set(bx, bh / 2, bz);
      bMesh.castShadow = true; bMesh.receiveShadow = true;
      grp.add(bMesh);
    }

    // Pohon Rindang & Lampu Taman Estetik Sekeliling Plaza
    for (let t = 0; t < 28; t++) {
      const ang = (t / 28) * Math.PI * 2 + 0.1;
      const tr = 17.5 + (t % 2) * 12;
      const tx = Math.cos(ang) * tr;
      const tz = Math.sin(ang) * tr;
      if (Math.abs(tx) < 5.5 || Math.abs(tz) < 5.5) continue;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.5, 6), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      trunk.position.set(tx, 0.75, tz);
      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), new THREE.MeshStandardMaterial({ color: 0x15803d }));
      crown.position.set(tx, 2.1, tz);
      grp.add(trunk, crown);
    }

    // 6 Koin Emas Eksplorasi di Peta Kecamatan
    const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16);
    const coinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.5, metalness: 0.7, roughness: 0.2 });
    for (let c = 0; c < 6; c++) {
      const ang = (c / 6) * Math.PI * 2;
      const cm = new THREE.Mesh(coinGeo, coinMat);
      cm.rotation.x = Math.PI / 2;
      cm.position.set(Math.cos(ang) * 14, 0.85, Math.sin(ang) * 14);
      grp.add(cm);
      districtCoins.push(cm);
    }

    sc.add(grp);
    customDistrictGroup = grp;

    if (playerMesh && playerMesh.position) {
      playerMesh.position.set(0, 0.14, 9.5);
      if (playerMesh.userData && playerMesh.userData.a && playerMesh.userData.a.c) {
        playerMesh.userData.a.c.x = 0;
        playerMesh.userData.a.c.z = 9.5;
      }
    }
  }

  function restoreMainGedungSateMap() {
    const sc = window.pirakuScene;
    if (!sc) return;
    if (customDistrictGroup) {
      sc.remove(customDistrictGroup);
      customDistrictGroup = null;
    }
    districtCoins = [];
    hiddenMainObjects.forEach(obj => { obj.visible = true; });
    hiddenMainObjects = [];

    const playerMesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (playerMesh && playerMesh.position) {
      playerMesh.position.set(0, 0.14, -4);
      if (playerMesh.userData && playerMesh.userData.a && playerMesh.userData.a.c) {
        playerMesh.userData.a.c.x = 0;
        playerMesh.userData.a.c.z = -4;
      }
    }
  }

  window.enterDistrictMap = function(districtId) {
    const d = DISTRICTS.find(x => x.id === districtId) || DISTRICTS[0];
    activeMapId = d.id;

    if (d.isMainMap) {
      restoreMainGedungSateMap();
    } else {
      buildDedicatedDistrictScene(d);
    }

    updateMapIndicatorHUD(d);
    showDistrictBanner(d);

    const modal = document.getElementById("piraku-districts-modal");
    if (modal) modal.style.display = "none";
  };

  function showDistrictBanner(d) {
    const banner = document.getElementById("district-banner");
    const titleEl = document.getElementById("district-title");
    const subEl = document.getElementById("district-subtitle");
    if (!banner || !titleEl || !subEl) return;
    const { cur } = getLevelInfo(getCoinsFor(d));
    titleEl.textContent = `${d.icon} MAPS KEC. ${d.name.toUpperCase()} • LV.${cur.lv}`;
    subEl.textContent = `${d.landmark} (${cur.title})`;
    banner.style.opacity = "1";
    banner.style.transform = "translateX(-50%) translateY(0px)";
    clearTimeout(banner._t);
    banner._t = setTimeout(() => {
      banner.style.opacity = "0";
      banner.style.transform = "translateX(-50%) translateY(-25px)";
    }, 3400);
  }

  function updateMapIndicatorHUD(d) {
    let pill = document.getElementById("piraku-active-map-pill");
    if (!pill && document.body) {
      pill = document.createElement("div");
      pill.id = "piraku-active-map-pill";
      pill.style.cssText = "position:fixed;bottom:146px;left:16px;padding:6px 11px;border-radius:999px;background:rgba(15,23,42,0.88);backdrop-filter:blur(10px);border:1.5px solid rgba(250,204,21,0.55);color:#fde047;font-size:11px;font-weight:800;z-index:26;display:flex;align-items:center;gap:6px;box-shadow:0 6px 18px rgba(0,0,0,0.4);";
      document.body.appendChild(pill);
    }
    if (!pill) return;
    if (d.isMainMap) {
      pill.style.display = "none";
    } else {
      pill.style.display = "flex";
      pill.innerHTML = `<span style="cursor:pointer;" onclick="openDistrictsHubModal()">${d.icon} ${d.name} ▾</span><button onclick="enterDistrictMap('bandung_wetan')" style="border:none;background:#ef4444;color:#fff;border-radius:999px;padding:2px 7px;font-size:10px;font-weight:800;cursor:pointer;">← Gd. Sate</button>`;
    }
  }

  function tickDistrictCoins() {
    const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    for (let i = districtCoins.length - 1; i >= 0; i--) {
      const c = districtCoins[i];
      c.rotation.z += 0.08;
      if (mesh && mesh.position && customDistrictGroup) {
        const d = Math.hypot(mesh.position.x - c.position.x, mesh.position.z - c.position.z);
        if (d < 1.65) {
          customDistrictGroup.remove(c);
          districtCoins.splice(i, 1);
          if (window.PirakuEconomy) window.PirakuEconomy.addCoins(20, "Eksplorasi Kecamatan");
        }
      }
    }
    requestAnimationFrame(tickDistrictCoins);
  }

  // ================= 2. MODAL DIREKTORI & PEMBANGUNAN 30 KECAMATAN =================
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
            <div style="font-size:10.5px;color:#facc15;font-weight:800;letter-spacing:.7px;">MULTI-MAP HD • 30 KECAMATAN BANDUNG</div>
            <div style="font-size:18px;font-weight:800;">Peta & Wilayah Kecamatan 🏙️</div>
          </div>
          <button id="dt-close" style="width:32px;height:32px;border-radius:50%;border:none;background:#1e293b;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>

        <!-- Kartu Kecamatan Domisili Aktif -->
        <div style="padding:12px;border-radius:16px;background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.4);margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:10.5px;font-weight:800;color:#fde047;">🪪 DOMISILI KTP KAMU</span>
            <select id="dt-select-my" style="background:#0f172a;color:#fde047;border:1px solid #facc15;border-radius:8px;padding:3px 7px;font-size:11px;font-weight:700;">
              ${DISTRICTS.map(d => `<option value="${d.name}" ${d.name === myDistrictName ? "selected" : ""}>${d.name}</option>`).join("")}
            </select>
          </div>
          <div style="font-size:15px;font-weight:800;">${myD.icon} Kec. ${myD.name} • <span style="color:#4ade80;">Lv.${myLv.cur.lv} (${myLv.cur.title})</span></div>
          <div style="font-size:11px;color:#cbd5e1;margin:3px 0 8px;">📍 ${myD.landmark} • Dana Wilayah: <b style="color:#fde047;">🪙 ${myCoins.toLocaleString("id-ID")}</b></div>
          <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:6px;">
            <button data-enter="${myD.id}" style="padding:8px 6px;border-radius:9px;border:none;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#fff;font-size:11px;font-weight:800;cursor:pointer;">🗺️ Masuk Maps</button>
            <button data-invest="${myD.id}" data-amt="50" style="padding:8px 4px;border-radius:9px;border:none;background:#16a34a;color:#fff;font-size:11px;font-weight:800;cursor:pointer;">+🪙 50 Bangun</button>
            <button data-invest="${myD.id}" data-amt="200" style="padding:8px 4px;border-radius:9px;border:none;background:#f59e0b;color:#0f172a;font-size:11px;font-weight:800;cursor:pointer;">+🪙 200 Maju</button>
          </div>
        </div>

        <!-- Filter Zona 5 Wilayah Bandung -->
        <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;margin-bottom:10px;">
          ${zones.map(z => `<button data-zone="${z}" style="padding:5px 10px;border-radius:999px;border:none;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;background:${filterZone === z ? "#38bdf8" : "#1e293b"};color:${filterZone === z ? "#0f172a" : "#cbd5e1"};">${z}</button>`).join("")}
        </div>

        <!-- Daftar 30 Kecamatan dengan Maps HD Masing-Masing -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${filtered.map(d => {
            const rankIdx = ranked.findIndex(r => r.id === d.id) + 1;
            const c = getCoinsFor(d);
            const lvInfo = getLevelInfo(c);
            const isCurrentMap = activeMapId === d.id;
            return `
              <div style="padding:10px 12px;border-radius:14px;background:#1e293b;border:1px solid ${isCurrentMap ? "#38bdf8" : "rgba(148,163,184,0.2)"};display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div>
                  <div style="font-size:13px;font-weight:800;color:#f8fafc;">#${rankIdx} ${d.icon} ${d.name} <span style="font-size:10px;padding:1px 6px;border-radius:999px;background:rgba(56,189,248,0.16);color:#38bdf8;">Lv.${lvInfo.cur.lv}</span></div>
                  <div style="font-size:10.5px;color:#94a3b8;margin-top:2px;">${d.landmark} • <b style="color:#fde047;">🪙 ${c.toLocaleString("id-ID")}</b></div>
                </div>
                <div style="display:flex;gap:5px;flex-shrink:0;">
                  <button data-invest="${d.id}" data-amt="50" style="padding:6px 8px;border-radius:8px;border:none;background:#f59e0b;color:#0f172a;font-size:10.5px;font-weight:800;cursor:pointer;">+50</button>
                  <button data-enter="${d.id}" style="padding:6px 9px;border-radius:8px;border:none;background:${isCurrentMap ? "#22c55e" : "#2563eb"};color:${isCurrentMap ? "#0f172a" : "#fff"};font-size:10.5px;font-weight:800;cursor:pointer;">${isCurrentMap ? "Aktif ✓" : "Masuk →"}</button>
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
        pushDistrictToSupabase(d, nextVal);
        if (activeMapId === d.id && !d.isMainMap) buildDedicatedDistrictScene(d);
        renderDistrictsModal();
      };
    });
    modal.querySelectorAll("[data-enter]").forEach(b => {
      b.onclick = () => window.enterDistrictMap(b.dataset.enter);
    });
  }

  function populateSignupKecamatan() {
    const sel = document.getElementById("signup-kecamatan");
    if (!sel || sel.dataset.populated30 === "1") return;
    sel.innerHTML = DISTRICTS.map(d => `<option value="${d.name}" ${d.name === "Bandung Wetan" ? "selected" : ""}>${d.name} (${d.zone})</option>`).join("");
    sel.dataset.populated30 = "1";
  }

  setTimeout(() => {
    populateSignupKecamatan();
    updateMapIndicatorHUD(DISTRICTS[0]);
    syncDistrictsFromSupabase();
    requestAnimationFrame(tickDistrictCoins);
  }, 1500);
})();
