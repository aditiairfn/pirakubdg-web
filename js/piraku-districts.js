// ================= PIRAKUBDG 29 KECAMATAN KOMPLEK + PUSAT KOTA BANDUNG WETAN =================
(function() {
  const CENTRAL_HUB = {
    id: "bandung_wetan",
    name: "Bandung Wetan",
    zone: "Pusat Kota",
    icon: "🏛️",
    landmark: "Gedung Sate, Lapangan Gasibu & Pusat Pemerintahan",
    isMainMap: true
  };

  const DISTRICTS = [
    // BANDUNG TENGAH (Non-Pusat)
    { id: "sumur_bandung", name: "Sumur Bandung", zone: "Tengah", icon: "🎭", landmark: "Jl. Braga & Balai Kota", theme: "heritage", ground: 0x166534, accent: 0x38bdf8 },
    { id: "lengkong", name: "Lengkong", zone: "Tengah", icon: "🍜", landmark: "Burangrang & Kuliner Malam", theme: "culinary", ground: 0x15803d, accent: 0xf97316 },
    { id: "regol", name: "Regol", zone: "Tengah", icon: "🕌", landmark: "Alun-Alun & Masjid Raya", theme: "alunalun", ground: 0x16a34a, accent: 0x22c55e },
    { id: "batununggal", name: "Batununggal", zone: "Tengah", icon: "🏢", landmark: "Gatot Subroto & Laswi", theme: "urban", ground: 0x15803d, accent: 0xa855f7 },
    { id: "kiaracondong", name: "Kiaracondong", zone: "Tengah", icon: "🚆", landmark: "Stasiun Kiaracondong", theme: "transit", ground: 0x14532d, accent: 0xec4899 },

    // BANDUNG UTARA
    { id: "coblong", name: "Coblong", zone: "Utara", icon: "🎓", landmark: "Monju, Dago & Kampus ITB", theme: "campus", ground: 0x14532d, accent: 0x3b82f6 },
    { id: "cidadap", name: "Cidadap", zone: "Utara", icon: "🌲", landmark: "Ciumbuleuit & Punclut", theme: "forest", ground: 0x064e3b, accent: 0x16a34a },
    { id: "sukasari", name: "Sukasari", zone: "Utara", icon: "🏫", landmark: "Setiabudi & Isola UPI", theme: "campus", ground: 0x14532d, accent: 0x0ea5e9 },
    { id: "sukajadi", name: "Sukajadi", zone: "Utara", icon: "🛍️", landmark: "Paris Van Java & Pasteur", theme: "urban", ground: 0x166534, accent: 0xf43f5e },
    { id: "cibeunying_kaler", name: "Cibeunying Kaler", zone: "Utara", icon: "🎨", landmark: "Cigadung & Taman Makam Pahlawan", theme: "forest", ground: 0x15803d, accent: 0xeab308 },
    { id: "cibeunying_kidul", name: "Cibeunying Kidul", zone: "Utara", icon: "🎸", landmark: "Cicaheum & Saung Angklung Udjo", theme: "heritage", ground: 0x166534, accent: 0x14b8a6 },

    // BANDUNG TIMUR
    { id: "antapani", name: "Antapani", zone: "Timur", icon: "🌉", landmark: "Flyover Pelangi Antapani", theme: "transit", ground: 0x15803d, accent: 0xf59e0b },
    { id: "arcamanik", name: "Arcamanik", zone: "Timur", icon: "🏟️", landmark: "SPOrT Jabar Arcamanik", theme: "stadium", ground: 0x16a34a, accent: 0x22c55e },
    { id: "mandalajati", name: "Mandalajati", zone: "Timur", icon: "⛰️", landmark: "Sindanglaya & Bukit Moko", theme: "forest", ground: 0x065f46, accent: 0x10b981 },
    { id: "ujungberung", name: "Ujungberung", zone: "Timur", icon: "🥁", landmark: "Alun-Alun Ujungberung & Benjang", theme: "alunalun", ground: 0x15803d, accent: 0xef4444 },
    { id: "cinambo", name: "Cinambo", zone: "Timur", icon: "🏭", landmark: "Sentra Industri Timur", theme: "urban", ground: 0x15803d, accent: 0x64748b },
    { id: "panyileukan", name: "Panyileukan", zone: "Timur", icon: "🏡", landmark: "Cipadung & Gerbang Timur", theme: "alunalun", ground: 0x166534, accent: 0x06b6d4 },
    { id: "cibiru", name: "Cibiru", zone: "Timur", icon: "📚", landmark: "Bunderan Cibiru & UIN", theme: "campus", ground: 0x14532d, accent: 0x8b5cf6 },
    { id: "gedebage", name: "Gedebage", zone: "Timur", icon: "⚽", landmark: "Stadion GBLA, Masjid Al Jabbar & Whoosh", theme: "stadium", ground: 0x0f766e, accent: 0xfacc15 },

    // BANDUNG SELATAN
    { id: "rancasari", name: "Rancasari", zone: "Selatan", icon: "🌿", landmark: "Ciwastra & Derwati", theme: "alunalun", ground: 0x15803d, accent: 0x22c55e },
    { id: "buahbatu", name: "Buahbatu", zone: "Selatan", icon: "🚗", landmark: "Margacinta & Gerbang Tol Buahbatu", theme: "transit", ground: 0x166534, accent: 0x3b82f6 },
    { id: "bandung_kidul", name: "Bandung Kidul", zone: "Selatan", icon: "🏞️", landmark: "Mengger & Batununggal Indah", theme: "urban", ground: 0x15803d, accent: 0x14b8a6 },

    // BANDUNG BARAT
    { id: "cicendo", name: "Cicendo", zone: "Barat", icon: "✈️", landmark: "Bandara Husein & Stasiun Bandung", theme: "transit", ground: 0x166534, accent: 0x38bdf8 },
    { id: "andir", name: "Andir", zone: "Barat", icon: "🏮", landmark: "Cibadak Culinary Night & Pasar Baru", theme: "culinary", ground: 0x166534, accent: 0xef4444 },
    { id: "astanaanyar", name: "Astanaanyar", zone: "Barat", icon: "🧵", landmark: "Tegalega & Monumen Bandung Lautan Api", theme: "alunalun", ground: 0x15803d, accent: 0xf97316 },
    { id: "bojongloa_kaler", name: "Bojongloa Kaler", zone: "Barat", icon: "👞", landmark: "Jamika & Pagarsih", theme: "urban", ground: 0x166534, accent: 0xeab308 },
    { id: "bojongloa_kidul", name: "Bojongloa Kidul", zone: "Barat", icon: "👠", landmark: "Sentra Sepatu Cibaduyut", theme: "culinary", ground: 0x15803d, accent: 0xd97706 },
    { id: "babakan_ciparay", name: "Babakan Ciparay", zone: "Barat", icon: "🚌", landmark: "Terminal Leuwipanjang & Caringin", theme: "transit", ground: 0x166534, accent: 0x0ea5e9 },
    { id: "bandung_kulon", name: "Bandung Kulon", zone: "Barat", icon: "🛣️", landmark: "Cijerah & Gerbang Tol Pasirkoja", theme: "transit", ground: 0x166534, accent: 0x6366f1 }
  ];

  const LEVELS = [
    { min: 0,    lv: 1, houses: 4,  title: "Tanah Kavling & Pos RW" },
    { min: 500,  lv: 2, houses: 8,  title: "Komplek Asri & Mushola" },
    { min: 1500, lv: 3, houses: 12, title: "Komplek Ramai & Pujasera" },
    { min: 3500, lv: 4, houses: 16, title: "Perumahan Elite & Balai RW" },
    { min: 7000, lv: 5, houses: 20, title: "Kawasan Mandiri Ikonik" }
  ];

  function getLevelInfo(coins) {
    let cur = LEVELS[0], next = LEVELS[1];
    for (let i = 0; i < LEVELS.length; i++) {
      if (coins >= LEVELS[i].min) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; }
    }
    return { cur, next };
  }

  const STORAGE_KEY = "piraku_districts_v2";
  try { localStorage.removeItem("piraku_districts_v1"); } catch (e) {}
  let localInvest = {};
  try { localInvest = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) {}

  let activeMapId = "bandung_wetan";

  // Deteksi status warga terdaftar (ber-KTP) vs Tamu secara otomatis dari data akun
  function getCitizenProfile() {
    const ig = (localStorage.getItem("piraku_my_ig") || "").trim();
    const ktpDomText = (document.getElementById("ktp-kec")?.textContent || "").trim();
    const rawKec = (
      localStorage.getItem("piraku_my_kec") ||
      localStorage.getItem("piraku_ktp_kecamatan") ||
      localStorage.getItem("piraku_user_kecamatan") ||
      ktpDomText ||
      ""
    ).trim();

    const isRegistered = Boolean(ig && !ig.toLowerCase().startsWith("tamu_"));
    const matched = DISTRICTS.find(d => d.name.toLowerCase() === rawKec.toLowerCase()) || DISTRICTS.find(d => d.id === "coblong") || DISTRICTS[0];

    return {
      isRegistered,
      ig: isRegistered ? ig : "Tamu",
      district: matched
    };
  }

  function saveLocal() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(localInvest)); } catch (e) {}
  }

  function getCoinsFor(d) {
    return Number(localInvest[d.id] || 0);
  }

  async function resetAllDistrictsInSupabaseOnce() {
    const sb = window.pirakuSupabase;
    if (!sb || localStorage.getItem("piraku_districts_reset_v2") === "1") return;
    try {
      const rows = DISTRICTS.map(d => ({
        district_id: d.id,
        district_name: d.name,
        zone_group: d.zone,
        invested_coins: 0,
        updated_at: new Date().toISOString()
      }));
      await sb.from("piraku_districts").upsert(rows, { onConflict: "district_id" });
      localStorage.setItem("piraku_districts_reset_v2", "1");
    } catch (e) {}
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

  let hiddenMainObjects = [];
  let customDistrictGroup = null;
  let districtCoins = [];

  const KAVLING_SLOTS = [
    { x: -13, z: 13, rotY: 0 }, { x: -20, z: 13, rotY: 0 }, { x: -27, z: 13, rotY: 0 }, { x: -13, z: 22, rotY: Math.PI }, { x: -20, z: 22, rotY: Math.PI },
    { x: 13, z: 13, rotY: 0 },  { x: 20, z: 13, rotY: 0 },  { x: 27, z: 13, rotY: 0 },  { x: 13, z: 22, rotY: Math.PI },  { x: 20, z: 22, rotY: Math.PI },
    { x: -13, z: -13, rotY: Math.PI }, { x: -20, z: -13, rotY: Math.PI }, { x: -27, z: -13, rotY: Math.PI }, { x: -13, z: -22, rotY: 0 }, { x: -20, z: -22, rotY: 0 },
    { x: 13, z: -13, rotY: Math.PI },  { x: 20, z: -13, rotY: Math.PI },  { x: 27, z: -13, rotY: Math.PI },  { x: 13, z: -22, rotY: 0 },  { x: 20, z: -22, rotY: 0 }
  ];

  function createGableRoof(width, height, depth, color) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(0, height);
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
    geom.translate(0, 0, -depth / 2);
    return new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color, roughness: 0.55 }));
  }

  function createModernHouseMesh(idx, lv) {
    const g = new THREE.Group();
    const isTwoStory = (lv >= 2 && idx % 2 === 1) || lv >= 4;
    const wallPalette = [0xfefce8, 0xf8fafc, 0xf1f5f9, 0xffedd5, 0xe0f2fe];
    const roofPalette = [0x9a3412, 0x334155, 0xb45309, 0x7f1d1d];
    const wallMat = new THREE.MeshStandardMaterial({ color: wallPalette[idx % wallPalette.length], roughness: 0.65 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.8 });
    const roofColor = roofPalette[idx % roofPalette.length];

    const yard = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.05, 6.4), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 }));
    yard.position.y = 0.025;
    const lawn = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 2.2), new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9 }));
    lawn.position.set(-1.3, 0.035, 1.8);
    g.add(yard, lawn);

    const fence = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.16), wallMat);
    fence.position.set(-1.45, 0.28, 3.05);
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), trimMat);
    p1.position.set(-0.15, 0.42, 3.05);
    const p2 = p1.clone(); p2.position.x = 1.15;
    g.add(fence, p1, p2);

    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.35, 3.6), wallMat);
    mainBody.position.set(-0.5, 1.22, -0.7);
    mainBody.castShadow = true; mainBody.receiveShadow = true;

    const sideWing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.1, 2.6), wallMat);
    sideWing.position.set(1.8, 1.1, -0.4);
    g.add(mainBody, sideWing);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.18, 1.2), woodMat);
    deck.position.set(-0.9, 0.12, 1.55);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.14, 1.35), trimMat);
    canopy.position.set(-0.9, 2.12, 1.6);
    const colL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.95, 8), trimMat);
    colL.position.set(-2.1, 1.12, 2.15);
    const colR = colL.clone(); colR.position.x = 0.25;
    g.add(deck, canopy, colL, colR);

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.65, 0.12), woodMat);
    door.position.set(-1.2, 1.05, 1.12);
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.05, 0.12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    winFrame.position.set(0.45, 1.4, 1.12);
    const winPane = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.88, 0.14), glassMat);
    winPane.position.set(0.45, 1.4, 1.13);
    g.add(door, winFrame, winPane);

    if (isTwoStory) {
      const body2 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.9, 3.1), wallMat);
      body2.position.set(-0.5, 3.3, -0.8);
      const balcony = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.42, 0.85), trimMat);
      balcony.position.set(-0.9, 2.75, 1.05);
      const win2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 0.12), glassMat);
      win2.position.set(-0.5, 3.5, 0.77);
      const roofTop = createGableRoof(4.1, 1.45, 3.6, roofColor);
      roofTop.position.set(-0.5, 4.25, -0.8);
      const roofSide = createGableRoof(1.9, 0.85, 3.0, roofColor);
      roofSide.position.set(1.8, 2.15, -0.4);
      g.add(body2, balcony, win2, roofTop, roofSide);
    } else {
      const roofMain = createGableRoof(4.4, 1.55, 4.1, roofColor);
      roofMain.position.set(-0.5, 2.38, -0.7);
      const roofSide = createGableRoof(1.8, 0.8, 3.0, roofColor);
      roofSide.position.set(1.8, 2.15, -0.4);
      const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), trimMat);
      chimney.position.set(-1.6, 3.4, -1.3);
      g.add(roofMain, roofSide, chimney);
    }

    if (lv >= 3 && idx % 2 === 0) {
      const carCols = [0xef4444, 0x2563eb, 0xf8fafc, 0x0f172a];
      const carBody = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.45, 2.0), new THREE.MeshStandardMaterial({ color: carCols[idx % carCols.length], metalness: 0.4, roughness: 0.3 }));
      carBody.position.set(1.95, 0.32, 1.5);
      const carCabin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 1.1), glassMat);
      carCabin.position.set(1.95, 0.68, 1.4);
      g.add(carBody, carCabin);
    }

    return g;
  }

  function createEmptyLotMesh() {
    const g = new THREE.Group();
    const soil = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.04, 6.0), new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.95 }));
    soil.position.y = 0.02;
    g.add(soil);
    const stakeMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
    [[-2.4, -2.8], [2.4, -2.8], [-2.4, 2.8], [2.4, 2.8]].forEach(([sx, sz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.75, 6), stakeMat);
      p.position.set(sx, 0.38, sz);
      g.add(p);
    });
    return g;
  }

  function buildDedicatedDistrictScene(d) {
    const sc = window.pirakuScene;
    if (!sc || typeof THREE === "undefined") return;

    const playerMesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (hiddenMainObjects.length === 0) {
      const keepVisible = new Set();
      let p = playerMesh;
      while (p) { keepVisible.add(p); p = p.parent; }
      sc.children.forEach(obj => {
        if (keepVisible.has(obj) || obj.isLight || obj.isCamera || obj.isPoints || obj === customDistrictGroup) return;
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
    grp.name = "piraku-komplek-district-map";
    const baseFootY = (playerMesh && playerMesh.position) ? playerMesh.position.y : 0;
    grp.position.y = baseFootY - 0.03;

    const coins = getCoinsFor(d);
    const { cur } = getLevelInfo(coins);

    const horizonGround = new THREE.Mesh(
      new THREE.PlaneGeometry(760, 760),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.95 })
    );
    horizonGround.rotation.x = -Math.PI / 2;
    horizonGround.position.y = -0.02;
    grp.add(horizonGround);

    const hillMats = [
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.92 }),
      new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.92 }),
      new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.9 })
    ];
    for (let m = 0; m < 28; m++) {
      const ang = (m / 28) * Math.PI * 2;
      const dist = 165 + (m % 3) * 26;
      const mRad = 32 + (m % 4) * 14;
      const mHeight = 22 + (m % 5) * 9;
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(mRad, mHeight, 7), hillMats[m % hillMats.length]);
      mountain.position.set(Math.cos(ang) * dist, mHeight / 2 - 1, Math.sin(ang) * dist);
      grp.add(mountain);
    }

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(110, 110),
      new THREE.MeshStandardMaterial({ color: d.ground, roughness: 0.88 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    grp.add(ground);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.82 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.7 });

    const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 320), roadMat);
    roadNS.rotation.x = -Math.PI / 2; roadNS.position.set(0, 0.01, 0);
    const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(320, 7.2), roadMat);
    roadEW.rotation.x = -Math.PI / 2; roadEW.position.set(0, 0.01, 0);

    const gangN = new THREE.Mesh(new THREE.PlaneGeometry(72, 4.2), roadMat);
    gangN.rotation.x = -Math.PI / 2; gangN.position.set(0, 0.01, -17.5);
    const gangS = new THREE.Mesh(new THREE.PlaneGeometry(72, 4.2), roadMat);
    gangS.rotation.x = -Math.PI / 2; gangS.position.set(0, 0.01, 17.5);
    grp.add(roadNS, roadEW, gangN, gangS);

    const markMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    for (let m = -84; m <= 84; m += 6) {
      if (Math.abs(m) < 10) continue;
      const m1 = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 2.4), markMat);
      m1.rotation.x = -Math.PI / 2; m1.position.set(0, 0.02, m);
      const m2 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.24), markMat);
      m2.rotation.x = -Math.PI / 2; m2.position.set(m, 0.02, 0);
      grp.add(m1, m2);
    }

    const roundGrass = new THREE.Mesh(new THREE.CircleGeometry(7.5, 32), new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85 }));
    roundGrass.rotation.x = -Math.PI / 2; roundGrass.position.set(0, 0.022, 0);
    const roundPaving = new THREE.Mesh(new THREE.RingGeometry(7.5, 9.2, 32), curbMat);
    roundPaving.rotation.x = -Math.PI / 2; roundPaving.position.set(0, 0.02, 0);
    grp.add(roundGrass, roundPaving);

    const monH = 1.8 + cur.lv * 0.75;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.1, 0.8, 16), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    ped.position.y = 0.4;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, monH, 12), new THREE.MeshStandardMaterial({ color: d.accent, metalness: 0.55, roughness: 0.25 }));
    pillar.position.y = 0.8 + monH / 2;
    grp.add(ped, pillar);

    const gateCv = document.createElement("canvas");
    gateCv.width = 512; gateCv.height = 112;
    const gctx = gateCv.getContext("2d");
    gctx.fillStyle = "#0f172a"; gctx.fillRect(0, 0, 512, 112);
    gctx.strokeStyle = "#facc15"; gctx.lineWidth = 6; gctx.strokeRect(4, 4, 504, 104);
    gctx.fillStyle = "#fde047"; gctx.font = "bold 22px sans-serif"; gctx.textAlign = "center";
    gctx.fillText(`KOMPLEK KEC. ${d.name.toUpperCase()} • LV.${cur.lv}`, 256, 44);
    gctx.fillStyle = "#e2e8f0"; gctx.font = "17px sans-serif";
    gctx.fillText(`${cur.title} (${cur.houses}/20 Kavling Terbangun)`, 256, 82);

    const gateBanner = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 1.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gateCv), side: THREE.DoubleSide }));
    gateBanner.position.set(0, 4.2, 29);
    const gateColL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.2, 0.7), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    gateColL.position.set(-4.3, 2.6, 29);
    const gateColR = gateColL.clone(); gateColR.position.x = 4.3;

    const posBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), new THREE.MeshStandardMaterial({ color: 0xfef3c7 }));
    posBox.position.set(-6.2, 1.1, 28);
    const posRoof = createGableRoof(2.8, 1.0, 2.8, 0x991b1b);
    posRoof.position.set(-6.2, 2.2, 28);
    grp.add(gateBanner, gateColL, gateColR, posBox, posRoof);

    KAVLING_SLOTS.forEach((slot, idx) => {
      const unit = idx < cur.houses ? createModernHouseMesh(idx, cur.lv) : createEmptyLotMesh();
      unit.position.set(slot.x, 0, slot.z);
      unit.rotation.y = slot.rotY;
      grp.add(unit);
    });

    if (cur.lv >= 2) {
      const mushola = new THREE.Group();
      const mBody = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.6, 4.6), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
      mBody.position.y = 1.3;
      const mDome = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.2 }));
      mDome.position.y = 2.9;
      mushola.add(mBody, mDome);
      mushola.position.set(-29, 0, -22);
      grp.add(mushola);
    }
    if (cur.lv >= 3) {
      const cafe = new THREE.Group();
      const cBase = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.4, 3.6), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      cBase.position.y = 1.2;
      const cAwning = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.25, 4.8), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      cAwning.position.set(0, 2.5, 0.5);
      cafe.add(cBase, cAwning);
      cafe.position.set(29, 0, -22);
      grp.add(cafe);
    }
    if (cur.lv >= 4) {
      const balai = new THREE.Mesh(new THREE.BoxGeometry(6.2, 4.2, 4.4), new THREE.MeshStandardMaterial({ color: 0x1d4ed8 }));
      balai.position.set(29, 2.1, 22);
      grp.add(balai);
    }

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [[-9, -9], [9, -9], [-9, 9], [9, 9], [-24, -6], [24, -6], [-24, 6], [24, 6], [-38, -28], [38, -28], [-38, 28], [38, 28]].forEach(([tx, tz], i) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      trunk.position.set(tx, 0.7, tz);
      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 0), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
      crown.position.set(tx, 1.95, tz);
      grp.add(trunk, crown);

      if (i < 8) {
        const pju = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 6), poleMat);
        pju.position.set(tx * 0.55, 1.7, tz * 0.55);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), bulbMat);
        lamp.position.set(tx * 0.55, 3.45, tz * 0.55);
        grp.add(pju, lamp);
      }
    });

    const coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.12, 16);
    const coinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.5, metalness: 0.7, roughness: 0.2 });
    [[0, 12], [0, -12], [12, 0], [-12, 0], [17, 17.5], [-17, -17.5]].forEach(([cx, cz]) => {
      const cm = new THREE.Mesh(coinGeo, coinMat);
      cm.rotation.x = Math.PI / 2;
      cm.position.set(cx, 0.95, cz);
      grp.add(cm);
      districtCoins.push(cm);
    });

    sc.add(grp);
    customDistrictGroup = grp;

    if (playerMesh) {
      let p = playerMesh;
      while (p) { p.visible = true; p = p.parent; }
      if (playerMesh.position) {
        playerMesh.position.x = 0;
        playerMesh.position.z = 23;
        if (playerMesh.userData && playerMesh.userData.a && playerMesh.userData.a.c) {
          playerMesh.userData.a.c.x = 0;
          playerMesh.userData.a.c.z = 23;
        }
      }
    }
  }

  let komplekMinimapOverlay = null;
  function updateKomplekMinimap(d) {
    const miniContainer = document.getElementById("minimap-container") || document.querySelector(".minimap-box, [id*='minimap']");
    if (!miniContainer) return;
    if (d.isMainMap) {
      if (komplekMinimapOverlay) komplekMinimapOverlay.style.display = "none";
      return;
    }
    if (!komplekMinimapOverlay) {
      komplekMinimapOverlay = document.createElement("canvas");
      komplekMinimapOverlay.width = 120;
      komplekMinimapOverlay.height = 120;
      komplekMinimapOverlay.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border-radius:50%;z-index:12;pointer-events:none;";
      if (getComputedStyle(miniContainer).position === "static") miniContainer.style.position = "relative";
      miniContainer.appendChild(komplekMinimapOverlay);
    }
    komplekMinimapOverlay.style.display = "block";
    komplekMinimapOverlay.dataset.districtName = d.name;
  }

  function drawKomplekMinimapFrame() {
    if (komplekMinimapOverlay && komplekMinimapOverlay.style.display === "block") {
      const ctx = komplekMinimapOverlay.getContext("2d");
      const w = 120, h = 120, cx = 60, cy = 60;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#166534";
      ctx.fillRect(14, 18, 38, 34); ctx.fillRect(68, 18, 38, 34);
      ctx.fillRect(14, 68, 38, 34); ctx.fillRect(68, 68, 38, 34);
      ctx.fillStyle = "#334155";
      ctx.fillRect(54, 8, 12, 104); ctx.fillRect(8, 54, 104, 12);
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e"; ctx.fill();
      ctx.strokeStyle = "#facc15"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#fde047"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
      ctx.fillText((komplekMinimapOverlay.dataset.districtName || "KOMPLEK").toUpperCase().slice(0, 14), cx, 14);
      const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
      if (mesh && mesh.position) {
        const px = Math.max(12, Math.min(108, cx + (mesh.position.x / 45) * 46));
        const pz = Math.max(16, Math.min(108, cy + (mesh.position.z / 45) * 46));
        ctx.beginPath(); ctx.arc(px, pz, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#38bdf8"; ctx.fill();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();
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
    if (playerMesh) {
      let p = playerMesh;
      while (p) { p.visible = true; p = p.parent; }
      if (playerMesh.position) {
        playerMesh.position.x = 0;
        playerMesh.position.z = -4;
        if (playerMesh.userData && playerMesh.userData.a && playerMesh.userData.a.c) {
          playerMesh.userData.a.c.x = 0;
          playerMesh.userData.a.c.z = -4;
        }
      }
    }
  }

  window.enterDistrictMap = function(districtId) {
    const d = districtId === CENTRAL_HUB.id ? CENTRAL_HUB : (DISTRICTS.find(x => x.id === districtId) || CENTRAL_HUB);
    activeMapId = d.id;

    if (typeof window.switchMultiplayerMapRoom === "function") {
      window.switchMultiplayerMapRoom(d.id);
    }

    if (d.isMainMap) {
      restoreMainGedungSateMap();
    } else {
      buildDedicatedDistrictScene(d);
    }

    updateMapIndicatorHUD(d);
    updateKomplekMinimap(d);
    showDistrictBanner(d);

    const modal = document.getElementById("piraku-districts-modal");
    if (modal) modal.style.display = "none";
  };

  function showDistrictBanner(d) {
    const banner = document.getElementById("district-banner");
    const titleEl = document.getElementById("district-title");
    const subEl = document.getElementById("district-subtitle");
    if (!banner || !titleEl || !subEl) return;
    if (d.isMainMap) {
      titleEl.textContent = `🏛️ PUSAT KOTA BANDUNG • BANDUNG WETAN`;
      subEl.textContent = d.landmark;
    } else {
      const { cur } = getLevelInfo(getCoinsFor(d));
      titleEl.textContent = `${d.icon} KOMPLEK KEC. ${d.name.toUpperCase()} • LV.${cur.lv}`;
      subEl.textContent = `${cur.title} (${cur.houses}/20 Kavling)`;
    }
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
      pill.style.cssText = "position:fixed;bottom:228px;left:16px;padding:6px 11px;border-radius:999px;background:rgba(15,23,42,0.9);backdrop-filter:blur(10px);border:1.5px solid rgba(250,204,21,0.55);color:#fde047;font-size:11px;font-weight:800;z-index:26;display:flex;align-items:center;gap:6px;box-shadow:0 6px 18px rgba(0,0,0,0.4);";
      document.body.appendChild(pill);
    }
    if (!pill) return;
    if (d.isMainMap) {
      pill.style.display = "none";
    } else {
      pill.style.display = "flex";
      pill.innerHTML = `<span style="cursor:pointer;" onclick="openDistrictsHubModal()">${d.icon} ${d.name} ▾</span><button onclick="enterDistrictMap('bandung_wetan')" style="border:none;background:#ef4444;color:#fff;border-radius:999px;padding:2px 7px;font-size:10px;font-weight:800;cursor:pointer;">← Pusat Kota</button>`;
    }
  }

  function tickDistrictLoop() {
    const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (mesh) {
      let p = mesh;
      while (p) { if (!p.visible) p.visible = true; p = p.parent; }
    }
    for (let i = districtCoins.length - 1; i >= 0; i--) {
      const c = districtCoins[i];
      c.rotation.z += 0.08;
      if (mesh && mesh.position && customDistrictGroup) {
        const d = Math.hypot(mesh.position.x - c.position.x, mesh.position.z - c.position.z);
        if (d < 1.65) {
          customDistrictGroup.remove(c);
          districtCoins.splice(i, 1);
          if (window.PirakuEconomy) window.PirakuEconomy.addCoins(20, "Eksplorasi Komplek");
        }
      }
    }
    drawKomplekMinimapFrame();
    requestAnimationFrame(tickDistrictLoop);
  }

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
    const profile = getCitizenProfile();
    const myD = profile.district;
    const myCoins = getCoinsFor(myD);
    const myLv = getLevelInfo(myCoins);

    const ranked = [...DISTRICTS].sort((a, b) => getCoinsFor(b) - getCoinsFor(a));
    const filtered = filterZone === "Semua" ? ranked : ranked.filter(d => d.zone === filterZone);

    const domisiliCardHtml = profile.isRegistered ? `
      <div style="padding:12px;border-radius:16px;background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.4);margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:10.5px;font-weight:800;color:#fde047;">🪪 DOMISILI KTP (${profile.ig})</span>
          <span style="background:#0f172a;color:#4ade80;border:1px solid rgba(74,222,128,0.45);border-radius:999px;padding:2px 8px;font-size:10px;font-weight:800;">✓ Terdaftar</span>
        </div>
        <div style="font-size:15px;font-weight:800;">${myD.icon} Kec. ${myD.name} • <span style="color:#4ade80;">Lv.${myLv.cur.lv} (${myLv.cur.houses}/20 Rumah)</span></div>
        <div style="font-size:11px;color:#cbd5e1;margin:3px 0 8px;">🏘️ ${myLv.cur.title} • Dana: <b style="color:#fde047;">🪙 ${myCoins.toLocaleString("id-ID")}</b></div>
        <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:6px;">
          <button data-enter="${myD.id}" style="padding:8px 6px;border-radius:9px;border:none;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#fff;font-size:11px;font-weight:800;cursor:pointer;">🏘️ Masuk Komplek</button>
          <button data-invest="${myD.id}" data-amt="50" style="padding:8px 4px;border-radius:9px;border:none;background:#16a34a;color:#fff;font-size:11px;font-weight:800;cursor:pointer;">+🪙 50 Bangun</button>
          <button data-invest="${myD.id}" data-amt="200" style="padding:8px 4px;border-radius:9px;border:none;background:#f59e0b;color:#0f172a;font-size:11px;font-weight:800;cursor:pointer;">+🪙 200 Maju</button>
        </div>
      </div>` : `
      <div style="padding:12px;border-radius:16px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.45);margin-bottom:12px;">
        <div style="font-size:11px;font-weight:800;color:#fbbf24;margin-bottom:4px;">⚠️ STATUS: TAMU (BELUM BER-KTP BANDUNG)</div>
        <div style="font-size:11.5px;color:#e2e8f0;line-height:1.4;margin-bottom:8px;">Tamu tetap bebas jalan-jalan ke seluruh komplek kecamatan, namun wajib <b>Daftar KTP Warga</b> terlebih dahulu untuk menyumbang koin pembangunan.</div>
        <button id="dt-open-signup" style="width:100%;padding:9px;border-radius:10px;border:none;background:linear-gradient(135deg,#f59e0b,#eab308);color:#0f172a;font-size:12px;font-weight:800;cursor:pointer;">🪪 Daftar KTP Warga Bandung Sekarang</button>
      </div>`;

    modal.innerHTML = `
      <div style="width:100%;max-width:430px;background:linear-gradient(180deg,#0f172a,#131c31);border:1.5px solid rgba(250,204,21,0.45);border-radius:22px;padding:16px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.82);max-height:84dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div>
            <div style="font-size:10.5px;color:#facc15;font-weight:800;letter-spacing:.7px;">PUSAT KOTA & 29 KECAMATAN HUNIAN</div>
            <div style="font-size:18px;font-weight:800;">Peta & Komplek Bandung 🏘️</div>
          </div>
          <button id="dt-close" style="width:32px;height:32px;border-radius:50%;border:none;background:#1e293b;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>

        ${domisiliCardHtml}

        <!-- Kartu Khusus Pusat Kota: Bandung Wetan (Tanpa Level) -->
        <div style="padding:10px 12px;border-radius:14px;background:linear-gradient(135deg,rgba(30,58,138,0.55),rgba(15,23,42,0.9));border:1px solid rgba(56,189,248,0.45);display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">
          <div>
            <div style="font-size:13px;font-weight:800;color:#f8fafc;">🏛️ Bandung Wetan <span style="font-size:10px;padding:2px 7px;border-radius:999px;background:rgba(250,204,21,0.2);color:#fde047;">PUSAT KOTA</span></div>
            <div style="font-size:10.5px;color:#cbd5e1;margin-top:2px;">Gedung Sate, Lapangan Gasibu & Pusat Kota</div>
          </div>
          <button data-enter="bandung_wetan" style="padding:7px 11px;border-radius:9px;border:none;background:${activeMapId === "bandung_wetan" ? "#22c55e" : "#38bdf8"};color:#0f172a;font-size:11px;font-weight:800;cursor:pointer;flex-shrink:0;">${activeMapId === "bandung_wetan" ? "Aktif ✓" : "Pusat Kota →"}</button>
        </div>

        <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;margin-bottom:10px;">
          ${zones.map(z => `<button data-zone="${z}" style="padding:5px 10px;border-radius:999px;border:none;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;background:${filterZone === z ? "#38bdf8" : "#1e293b"};color:${filterZone === z ? "#0f172a" : "#cbd5e1"};">${z}</button>`).join("")}
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;">
          ${filtered.map(d => {
            const rankIdx = ranked.findIndex(r => r.id === d.id) + 1;
            const c = getCoinsFor(d);
            const lvInfo = getLevelInfo(c);
            const isCurrentMap = activeMapId === d.id;
            const isOwnDistrict = profile.isRegistered && profile.district.id === d.id;
            const investBtnHtml = isOwnDistrict
              ? `<button data-invest="${d.id}" data-amt="50" style="padding:6px 8px;border-radius:8px;border:none;background:#f59e0b;color:#0f172a;font-size:10.5px;font-weight:800;cursor:pointer;">+50</button>`
              : `<button disabled title="${profile.isRegistered ? "Hanya warga ber-KTP " + d.name + " yang bisa membangun" : "Daftar KTP untuk menyumbang"}" style="padding:6px 8px;border-radius:8px;border:none;background:#334155;color:#64748b;font-size:10px;font-weight:800;cursor:not-allowed;">🔒 ${profile.isRegistered ? "KTP Lain" : "Tamu"}</button>`;
            return `
              <div style="padding:10px 12px;border-radius:14px;background:#1e293b;border:1px solid ${isCurrentMap ? "#38bdf8" : "rgba(148,163,184,0.2)"};display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div>
                  <div style="font-size:13px;font-weight:800;color:#f8fafc;">#${rankIdx} ${d.icon} ${d.name} <span style="font-size:10px;padding:1px 6px;border-radius:999px;background:rgba(56,189,248,0.16);color:#38bdf8;">Lv.${lvInfo.cur.lv} • ${lvInfo.cur.houses}/20</span></div>
                  <div style="font-size:10.5px;color:#94a3b8;margin-top:2px;">${lvInfo.cur.title} • <b style="color:#fde047;">🪙 ${c.toLocaleString("id-ID")}</b></div>
                </div>
                <div style="display:flex;gap:5px;flex-shrink:0;">
                  ${investBtnHtml}
                  <button data-enter="${d.id}" style="padding:6px 9px;border-radius:8px;border:none;background:${isCurrentMap ? "#22c55e" : "#2563eb"};color:${isCurrentMap ? "#0f172a" : "#fff"};font-size:10.5px;font-weight:800;cursor:pointer;">${isCurrentMap ? "Aktif ✓" : "Masuk →"}</button>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>`;

    modal.querySelector("#dt-close").onclick = () => { modal.style.display = "none"; };
    const signupBtn = modal.querySelector("#dt-open-signup");
    if (signupBtn) {
      signupBtn.onclick = () => {
        modal.style.display = "none";
        if (typeof window.openAuthModal === "function") window.openAuthModal("signup");
        else if (typeof window.openSignupModal === "function") window.openSignupModal();
      };
    }
    modal.querySelectorAll("[data-zone]").forEach(b => {
      b.onclick = () => { filterZone = b.dataset.zone; renderDistrictsModal(); };
    });
    modal.querySelectorAll("[data-invest]").forEach(b => {
      b.onclick = () => {
        const prof = getCitizenProfile();
        if (!prof.isRegistered || prof.district.id !== b.dataset.invest) return;
        const d = DISTRICTS.find(x => x.id === b.dataset.invest);
        const amt = Number(b.dataset.amt || 50);
        if (!d || !window.PirakuEconomy) return;
        if (!window.PirakuEconomy.spendCoins(amt, "Bangun Komplek " + d.name)) return;
        const nextVal = getCoinsFor(d) + amt;
        localInvest[d.id] = nextVal;
        saveLocal();
        pushDistrictToSupabase(d, nextVal);
        if (activeMapId === d.id && !d.isMainMap) {
          buildDedicatedDistrictScene(d);
          updateKomplekMinimap(d);
        }
        renderDistrictsModal();
      };
    });
    modal.querySelectorAll("[data-enter]").forEach(b => {
      b.onclick = () => window.enterDistrictMap(b.dataset.enter);
    });
  }

  // Isi dropdown pendaftaran KTP dengan 29 kecamatan hunian saja (tanpa Bandung Wetan)
  function populateSignupKecamatan() {
    const sel = document.getElementById("signup-kecamatan");
    if (!sel || sel.dataset.populated29 === "1") return;
    sel.innerHTML = DISTRICTS.map(d => `<option value="${d.name}" ${d.id === "coblong" ? "selected" : ""}>${d.name} (${d.zone})</option>`).join("");
    sel.dataset.populated29 = "1";
  }

  setTimeout(() => {
    populateSignupKecamatan();
    updateMapIndicatorHUD(CENTRAL_HUB);
    resetAllDistrictsInSupabaseOnce().then(() => syncDistrictsFromSupabase());
    requestAnimationFrame(tickDistrictLoop);
  }, 1500);
})();
