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
    { min: 100,  lv: 2, houses: 8,  title: "Komplek Asri & Mushola" },
    { min: 300,  lv: 3, houses: 12, title: "Komplek Ramai & Pujasera" },
    { min: 700,  lv: 4, houses: 16, title: "Perumahan Elite & Balai RW" },
    { min: 1400, lv: 5, houses: 20, title: "Kawasan Mandiri Ikonik" }
  ];

  
  let lastKnownCitizenLvl = parseInt(localStorage.getItem("piraku_my_level") || "1", 10);
  function checkAndGrantLevelUpRewards() {
    const curLvl = parseInt(localStorage.getItem("piraku_my_level") || "1", 10);
    if (curLvl > lastKnownCitizenLvl) {
      const gainedLevels = curLvl - lastKnownCitizenLvl;
      lastKnownCitizenLvl = curLvl;
      const bonusCoins = gainedLevels * 25;
      if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
        window.PirakuEconomy.addCoins(bonusCoins, "Bonus Naik Level " + curLvl);
      }
      const unlocked = [];
      try {
        const inv = JSON.parse(localStorage.getItem("piraku_owned_items") || "[]");
        if (curLvl >= 3 && !inv.includes("crown")) { inv.push("crown"); unlocked.push("Mahkota Emas Warga"); }
        if (curLvl >= 5 && !inv.includes("glasses")) { inv.push("glasses"); unlocked.push("Kacamata Sultan"); }
        if (curLvl >= 8 && !inv.includes("scooter")) { inv.push("scooter"); unlocked.push("Skuter Listrik Bandung"); }
        localStorage.setItem("piraku_owned_items", JSON.stringify(inv));
      } catch (e) {}

      if (typeof window.playSynthTone === "function") {
        window.playSynthTone(660, "triangle", 0.25);
        setTimeout(() => window.playSynthTone(880, "triangle", 0.35), 140);
      }
      const unlockMsg = unlocked.length > 0 ? " + Buka Item: " + unlocked.join(", ") : "";
      if (typeof window.showToast === "function") {
        window.showToast("🎉 NAIK KE LVL " + curLvl + "! Bonus +" + bonusCoins + " Koin" + unlockMsg);
      }
    }
  }

  function getRealDistrictHouseStats(d) {
    const kecLow = String(d.name || "").trim().toLowerCase();
    const idLow = String(d.id || "").trim().toLowerCase().replace(/[_-]+/g, " ");
    const allCitizens = Array.isArray(window.registeredCitizensList) ? window.registeredCitizensList : [];
    const seen = new Map();
    allCitizens.forEach(c => {
      if (!c || !c.ig) return;
      const ck = String(c.kecamatan || "").trim().toLowerCase().replace(/[_-]+/g, " ");
      if (ck !== kecLow && ck !== idLow) return;
      const norm = String(c.ig || "").trim().toLowerCase().replace(/^@/, "");
      if (!norm) return;
      const prev = seen.get(norm);
      const hasH = Boolean(
        c.has_house ||
        (window.pirakuRemoteHouses && window.pirakuRemoteHouses[norm]) ||
        localStorage.getItem("piraku_has_house_" + norm) === "1"
      );
      if (!prev) seen.set(norm, hasH);
      else if (hasH) seen.set(norm, true);
    });
    let built = 0;
    seen.forEach(v => { if (v) built++; });
    return { totalCitizens: seen.size, builtHouses: Math.min(20, built) };
  }

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

  async function syncDistrictsFromSupabase() {
    const sb = window.pirakuSupabase;
    if (!sb) return;
    try {
      const { data, error } = await sb.from("piraku_districts").select("district_id, invested_coins");
      if (!error && data && data.length > 0) {
        let activeChanged = false;
        data.forEach(row => {
          if (typeof row.invested_coins === "number") {
            const prev = localInvest[row.district_id] || 0;
            const next = Math.max(prev, row.invested_coins);
            localInvest[row.district_id] = next;
            if (next !== prev && row.district_id === activeMapId) activeChanged = true;
          }
        });
        saveLocal();
        if (activeChanged && window.pirakuInDistrict && typeof window.refreshActiveDistrictHouses === "function") {
          window.refreshActiveDistrictHouses();
        }
      }
    } catch (e) {}
  }

  async function pushDistrictToSupabase(d, newCoins, deltaAmt) {
    const sb = window.pirakuSupabase;
    if (!sb) return;
    try {
      if (typeof window.markPirakuGotongRoyongDone === "function") window.markPirakuGotongRoyongDone();
      const { data: curRow } = await sb.from("piraku_districts").select("invested_coins").eq("district_id", d.id).maybeSingle();
      const cloudVal = Number(curRow?.invested_coins || 0);
      const safeCoins = Math.max(Number(newCoins) || 0, cloudVal + (Number(deltaAmt) || 0));
      localInvest[d.id] = safeCoins;
      saveLocal();
      await sb.from("piraku_districts").upsert({
        district_id: d.id,
        district_name: d.name,
        zone_group: d.zone,
        invested_coins: safeCoins,
        updated_at: new Date().toISOString()
      }, { onConflict: "district_id" });
    } catch (e) {}
  }

  let hiddenMainObjects = [];
    if (typeof window.resetPirakuColliders === "function") window.resetPirakuColliders();
  let customDistrictGroup = null;
  let districtCoins = [];
  let districtTraffic = [];
  let districtPedestrians = [];
  let myKavlingBeaconGroup = null;
  let myDistrictKavlingInfo = null;
  let districtLampState = null;
  let districtHouseGlassMat = null;

  const HOUSE_TIER_INFO = [
    { tier: 1, name: "Rumah Asri Tipe 36", cost: 0, minLvl: 1 },
    { tier: 2, name: "Rumah Tingkat 2 Lantai", cost: 350, minLvl: 3 },
    { tier: 3, name: "Rumah Mewah + Mobil Garasi", cost: 800, minLvl: 6 },
    { tier: 4, name: "Villa Sultan Pagar Emas", cost: 2000, minLvl: 10 }
  ];

  function getPersonalHouseTierFor(igRaw) {
    const clean = String(igRaw || "").trim().toLowerCase().replace(/^@/, "");
    if (!clean) return 1;
    let tier = parseInt(localStorage.getItem("piraku_house_tier_" + clean) || "1", 10) || 1;
    if (window.pirakuRemoteHouseTiers && window.pirakuRemoteHouseTiers[clean]) {
      tier = Math.max(tier, Number(window.pirakuRemoteHouseTiers[clean]) || 1);
    }
    const myIg = (localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase().replace(/^@/, "");
    if (clean === myIg && window.PirakuEconomy && typeof window.PirakuEconomy.getState === "function") {
      const owned = window.PirakuEconomy.getState().owned || [];
      if (owned.includes("house_tier_4")) tier = Math.max(tier, 4);
      else if (owned.includes("house_tier_3")) tier = Math.max(tier, 3);
      else if (owned.includes("house_tier_2")) tier = Math.max(tier, 2);
      localStorage.setItem("piraku_house_tier_" + clean, String(tier));
    }
    return Math.max(1, Math.min(4, tier));
  }
  window.getMyPersonalHouseTier = function() {
    return getPersonalHouseTierFor(localStorage.getItem("piraku_my_ig") || "");
  };

  const KAVLING_SLOTS = [
    // Kuadran Barat Daya & Tenggara (Baris 1: z=13 menghadap +Z ke jalan komplek)
    { x: -13, z: 13, rotY: 0 }, { x: -20, z: 13, rotY: 0 }, { x: -27, z: 13, rotY: 0 },
    { x: 13, z: 13, rotY: 0 },  { x: 20, z: 13, rotY: 0 },  { x: 27, z: 13, rotY: 0 },
    // Baris 2: z=22 menghadap -Z ke jalan komplek
    { x: -13, z: 22, rotY: Math.PI }, { x: -20, z: 22, rotY: Math.PI }, { x: -27, z: 22, rotY: Math.PI },
    { x: 13, z: 22, rotY: Math.PI },  { x: 20, z: 22, rotY: Math.PI },  { x: 27, z: 22, rotY: Math.PI },
    // Kuadran Barat Laut & Timur Laut (Baris 3: z=-13 menghadap -Z ke jalan komplek)
    { x: -13, z: -13, rotY: Math.PI }, { x: -20, z: -13, rotY: Math.PI }, { x: -27, z: -13, rotY: Math.PI },
    { x: 13, z: -13, rotY: Math.PI },  { x: 20, z: -13, rotY: Math.PI },  { x: 27, z: -13, rotY: Math.PI },
    // Baris 4: z=-22 menghadap +Z ke jalan komplek
    { x: -13, z: -22, rotY: 0 }, { x: -20, z: -22, rotY: 0 }, { x: -27, z: -22, rotY: 0 },
    { x: 13, z: -22, rotY: 0 },  { x: 20, z: -22, rotY: 0 },  { x: 27, z: -22, rotY: 0 },
    // Baris 5 & 6 (Ekspansi Blok Luar: z=31 & z=-31 -> Total 36 Kavling)
    { x: -13, z: 31, rotY: Math.PI }, { x: -20, z: 31, rotY: Math.PI }, { x: -27, z: 31, rotY: Math.PI },
    { x: 13, z: 31, rotY: Math.PI },  { x: 20, z: 31, rotY: Math.PI },  { x: 27, z: 31, rotY: Math.PI },
    { x: -13, z: -31, rotY: 0 }, { x: -20, z: -31, rotY: 0 }, { x: -27, z: -31, rotY: 0 },
    { x: 13, z: -31, rotY: 0 },  { x: 20, z: -31, rotY: 0 },  { x: 27, z: -31, rotY: 0 }
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

  function createModernHouseMesh(idx, lv, personalTier = 0) {
    const g = new THREE.Group();
    const isSultan = personalTier >= 4;
    const isTwoStory = personalTier >= 2 || (personalTier === 0 && ((lv >= 2 && idx % 2 === 1) || lv >= 4));
    const hasCar = personalTier >= 3 || (personalTier === 0 && lv >= 3 && idx % 2 === 0);
    const wallPalette = [0xfefce8, 0xf8fafc, 0xf1f5f9, 0xffedd5, 0xe0f2fe];
    const roofPalette = [0x9a3412, 0x334155, 0xb45309, 0x7f1d1d];
    const wallMat = new THREE.MeshStandardMaterial({ color: isSultan ? 0xfffbeb : wallPalette[idx % wallPalette.length], roughness: 0.65 });
    const trimMat = new THREE.MeshStandardMaterial({
      color: isSultan ? 0xfacc15 : 0x1e293b,
      roughness: isSultan ? 0.25 : 0.5,
      metalness: isSultan ? 0.65 : 0.1
    });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
    if (!districtHouseGlassMat) {
      districtHouseGlassMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0xfef08a,
        emissiveIntensity: 0.0,
        roughness: 0.15,
        metalness: 0.75
      });
    }
    const glassMat = districtHouseGlassMat;
    const roofColor = isSultan ? 0xb45309 : roofPalette[idx % roofPalette.length];

    const yard = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.05, 6.4), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 }));
    yard.position.y = 0.025;
    const lawn = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 2.2), new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9 }));
    lawn.position.set(-1.3, 0.035, 1.8);
    g.add(yard, lawn);

    const fence = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.16), isSultan ? trimMat : wallMat);
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

    if (hasCar) {
      const carCols = [0xef4444, 0x2563eb, 0xf8fafc, 0x0f172a];
      const carCol = isSultan ? 0xdc2626 : carCols[idx % carCols.length];
      const carBody = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.45, 2.0), new THREE.MeshStandardMaterial({ color: carCol, metalness: 0.55, roughness: 0.22 }));
      carBody.position.set(1.95, 0.32, 1.5);
      const carCabin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 1.1), glassMat);
      carCabin.position.set(1.95, 0.68, 1.4);
      g.add(carBody, carCabin);
    }

    if (isSultan) {
      // Air mancur mini Sultan di taman depan
      const fBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.72, 0.22, 14), trimMat);
      fBase.position.set(-1.35, 0.14, 1.85);
      const fWater = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.25, 14), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      fWater.position.set(-1.35, 0.15, 1.85);
      const fTop = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), trimMat);
      fTop.position.set(-1.35, 0.55, 1.85);
      g.add(fBase, fWater, fTop);
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

  
  
  
  function isDistrictSoundMuted() {
    if (typeof window.isPirakuSfxEnabled === "function") return !window.isPirakuSfxEnabled();
    return window.pirakuSoundMuted === true;
  }

  let districtAudioCtx = null;
  function getDistrictAudioCtx() {
    if (typeof window.isPirakuSfxEnabled === "function" ? !window.isPirakuSfxEnabled() : !!window.pirakuSoundMuted) return null;
    const ctx = window.audioCtx || districtAudioCtx || (districtAudioCtx = new (window.AudioContext || window.webkitAudioContext)());
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  // Efek suara klakson angkot Bandung ("tin-tin!" dua nada harmonis)
  function playAngkotHornSfx() {
    const ctx = getDistrictAudioCtx();
    if (!ctx) return;
    try {
      // "tin-tin!" dua nada pendek
      [0, 0.16].forEach((off, i) => {
        const t0 = ctx.currentTime + off;
        [440, 554].forEach(f => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(f * (i ? 1.06 : 1), t0);
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.13);
          osc.connect(g); g.connect(ctx.destination);
          osc.start(t0); osc.stop(t0 + 0.14);
        });
      });
    } catch (e) {}
  }

  // Efek suara denting mangkok porselen tukang bakso/cuanki ("ting-ting-ting!")
  function playBaksoBowlClinkSfx() {
    const ctx = getDistrictAudioCtx();
    if (!ctx) return;
    try {
      // "ting-ting-ting!" denting porselen
      [0, 0.14, 0.28].forEach((off, i) => {
        const t0 = ctx.currentTime + off;
        [2350, 3520].forEach((f, j) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f * (1 + i * 0.015), t0);
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(j ? 0.03 : 0.07, t0 + 0.005);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
          osc.connect(g); g.connect(ctx.destination);
          osc.start(t0); osc.stop(t0 + 0.24);
        });
      });
    } catch (e) {}
  }

  function createBandungAngkotMesh(bodyCol, stripeCol) {
    const g = new THREE.Group();
    g.userData.isCar = true;
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.45, metalness: 0.2 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: stripeCol, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.8 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });
    const headLightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Bodi minibus angkot + strip khas Bandung
    const lower = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.55, 2.85), bodyMat);
    lower.position.y = 0.52;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.41, 0.16, 2.87), stripeMat);
    stripe.position.y = 0.58;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.56, 2.35), bodyMat);
    cabin.position.set(0, 1.05, -0.15);
    const windF = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.42, 0.08), glassMat);
    windF.position.set(0, 1.04, 1.03);
    const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.36, 1.9), glassMat);
    sideGlass.position.set(0, 1.06, -0.15);
    // Papan trayek di atas atap depan
    const trayek = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.18, 0.24), stripeMat);
    trayek.position.set(0, 1.4, 0.85);

    g.add(lower, stripe, cabin, windF, sideGlass, trayek);

    // Lampu depan & belakang
    [-0.46, 0.46].forEach(lx => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.06), headLightMat);
      hl.position.set(lx, 0.52, 1.43);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.06), tailLightMat);
      tl.position.set(lx, 0.52, -1.43);
      g.add(hl, tl);
    });

    // 4 Roda
    [[-0.68, 0.85], [0.68, 0.85], [-0.68, -0.85], [0.68, -0.85]].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 12), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.26, wz);
      g.add(w);
    });
    return g;
  }

  function createPrivateCarMesh(color) {
    const g = new THREE.Group();
    g.userData.isCar = true;
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.45 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.8 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.48, 2.75), mat);
    body.position.y = 0.46;
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.44, 1.45), mat);
    top.position.set(0, 0.9, -0.15);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.21, 0.34, 1.32), glassMat);
    glass.position.set(0, 0.9, -0.15);
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xfef9c3 }));
    hlL.position.set(-0.44, 0.48, 1.38);
    const hlR = hlL.clone(); hlR.position.x = 0.44;
    g.add(body, top, glass, hlL, hlR);
    [[-0.66, 0.82], [0.66, 0.82], [-0.66, -0.82], [0.66, -0.82]].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 12), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.24, wz);
      g.add(w);
    });
    return g;
  }

  function createDistrictNpcMesh(shirtCol, hasHijab) {
    const g = new THREE.Group();
    g.userData.isCar = true; // Tandai dinamis agar tidak masuk static building collider
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.7 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtCol, roughness: 0.75 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.46, 10), shirtMat);
    torso.position.y = 0.62;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 10), skinMat);
    head.position.y = 1.04;
    g.add(torso, head);

    if (hasHijab) {
      const hijab = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 10), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 }));
      hijab.position.set(0, 1.05, -0.03);
      g.add(hijab);
    } else {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      hair.position.y = 1.07;
      g.add(hair);
    }

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.38, 0.12), pantsMat);
    legL.position.set(-0.09, 0.2, 0);
    const legR = legL.clone(); legR.position.x = 0.09;
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.36, 0.09), shirtMat);
    armL.position.set(-0.24, 0.62, 0);
    const armR = armL.clone(); armR.position.x = 0.24;
    g.add(legL, legR, armL, armR);
    g.userData.limbs = { legL, legR, armL, armR };
    return g;
  }

  function createStreetVendorCartMesh(awningCol, boxCol) {
    const g = new THREE.Group();
    g.userData.isCar = true;
    const cartMat = new THREE.MeshStandardMaterial({ color: boxCol, roughness: 0.6 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.65 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827 });

    // Gerobak dorong bakso/cuanki/bandrek
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 1.45), cartMat);
    base.position.set(0, 0.52, 0.2);
    const showcase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.48, 0.9), glassMat);
    showcase.position.set(0, 1.08, 0.35);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.34, 12), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 }));
    pot.position.set(0, 0.98, -0.25);

    // Payung tenda warna-warni khas PKL Bandung
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 6), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    pole.position.set(0, 1.35, 0.15);
    const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.45, 10), new THREE.MeshStandardMaterial({ color: awningCol, roughness: 0.7 }));
    umbrella.position.set(0, 2.25, 0.15);

    // Roda gerobak
    [-0.45, 0.45].forEach(wx => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.24, 0.2);
      g.add(w);
    });

    // Abang tukang dagang yang mendorong di belakang gerobak
    const vendor = createDistrictNpcMesh(0xfacc15, false);
    vendor.position.set(0, 0, -0.85);
    g.add(base, showcase, pot, pole, umbrella, vendor);
    g.userData.limbs = vendor.userData.limbs;
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
        const isSkyDome = obj === window.__pirakuSkyDome || (obj.geometry && obj.geometry.type === "SphereGeometry" && obj.material && obj.material.side === THREE.BackSide);
        if (obj.isLight || obj.isCamera || obj.isPoints || isSkyDome || obj === customDistrictGroup) return;
        if (keepVisible.has(obj)) {
          // Jika grup warga (citizensGroup) ikut keepVisible karena berisi playerMesh, sembunyikan NPC warga lainnya di dalam grup ini!
          if (obj !== playerMesh && Array.isArray(obj.children) && obj.children.length > 1) {
            obj.children.forEach(ch => {
              if (!keepVisible.has(ch) && ch.visible) {
                ch.visible = false;
                hiddenMainObjects.push(ch);
              }
            });
          }
          return;
        }
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
    districtTraffic = [];
    districtPedestrians = [];

    const grp = new THREE.Group();
    grp.name = "piraku-komplek-district-map";
    const baseFootY = (playerMesh && playerMesh.position) ? playerMesh.position.y : 0;
    grp.position.y = baseFootY - 0.03;

    const coins = getCoinsFor(d);
    const { cur } = getLevelInfo(coins);

    const horizonGround = new THREE.Mesh(
      new THREE.CircleGeometry(900, 48),
      new THREE.MeshStandardMaterial({ color: 0x5c7c4e, roughness: 0.94, metalness: 0.0 })
    );
    horizonGround.rotation.x = -Math.PI / 2;
    horizonGround.position.y = -0.04;
    horizonGround.receiveShadow = true;
    grp.add(horizonGround);

    // Horizon Pegunungan Cekungan Bandung 360° Halus (Senada dengan Pusat Kota Gedung Sate)
    function createDistrictMountainRing(radius, segments, baseHeight, variation, colorHex) {
      const geo = new THREE.CylinderGeometry(radius, radius + 85, 1, segments, 1, true);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        if (pos.getY(i) > 0) {
          const x = pos.getX(i), z = pos.getZ(i);
          const angle = Math.atan2(z, x);
          const h = baseHeight
            + Math.sin(angle * 5.0) * variation * 0.45
            + Math.cos(angle * 11.0 + 0.8) * variation * 0.3
            + Math.sin(angle * 23.0) * variation * 0.15;
          pos.setY(i, Math.max(8, h));
        } else {
          pos.setY(i, -2);
        }
      }
      geo.computeVertexNormals();
      return new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.94, metalness: 0.0, flatShading: true, side: THREE.DoubleSide })
      );
    }
    grp.add(
      createDistrictMountainRing(480, 96, 32, 18, 0x6b8cae),
      createDistrictMountainRing(330, 72, 16, 10, 0x4f745c)
    );

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(116, 116),
      new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.88 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    grp.add(ground);

    // Tekstur paving trotoar & aspal khas Bandung Wetan
    const paveCv = document.createElement("canvas");
    paveCv.width = 128; paveCv.height = 128;
    const pctx = paveCv.getContext("2d");
    pctx.fillStyle = "#64748b"; pctx.fillRect(0, 0, 128, 128);
    for (let py = 0; py < 4; py++) {
      for (let px = 0; px < 4; px++) {
        pctx.fillStyle = (px + py) % 2 === 0 ? "#94a3b8" : "#cbd5e1";
        pctx.fillRect(px * 32 + 2, py * 32 + 2, 28, 28);
      }
    }
    const paveTex = new THREE.CanvasTexture(paveCv);
    paveTex.wrapS = paveTex.wrapT = THREE.RepeatWrapping;
    paveTex.repeat.set(3, 64);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.86, metalness: 0.05 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ map: paveTex, roughness: 0.88 });

    // Jalan Raya Utama NS & EW + Aspal Bundaran Melingkar (terhubung mulus di semua kecamatan)
    const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 320), roadMat);
    roadNS.rotation.x = -Math.PI / 2; roadNS.position.set(0, 0.012, 0); roadNS.receiveShadow = true;
    const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(320, 7.2), roadMat);
    roadEW.rotation.x = -Math.PI / 2; roadEW.position.set(0, 0.012, 0); roadEW.receiveShadow = true;

    const markMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // Aspal bundaran melingkar di pusat perempatan (radius 6.8m - 13.2m)
    const roundaboutAsphalt = new THREE.Mesh(new THREE.RingGeometry(6.8, 13.2, 48), roadMat);
    roundaboutAsphalt.rotation.x = -Math.PI / 2; roundaboutAsphalt.position.set(0, 0.014, 0); roundaboutAsphalt.receiveShadow = true;

    // Marka garis putus-putus melingkar di tengah bundaran
    for (let a = 0; a < 24; a++) {
      const ang = (a / 24) * Math.PI * 2;
      const rDash = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 1.35), markMat);
      rDash.rotation.x = -Math.PI / 2;
      rDash.rotation.z = -ang;
      rDash.position.set(Math.cos(ang) * 10.0, 0.022, Math.sin(ang) * 10.0);
      grp.add(rDash);
    }

    // Trotoar Paving Kiri-Kanan DIPOTONG berhenti di ±12.2m (sebelum zebra cross, tidak menabrak bundaran!)
    const segLen = 147.8; // dari ±12.2m sampai ±160m
    const segCenter = 12.2 + segLen / 2; // 86.1m
    const swSegments = [
      [-4.4, segCenter, 1.6, segLen], [4.4, segCenter, 1.6, segLen],
      [-4.4, -segCenter, 1.6, segLen], [4.4, -segCenter, 1.6, segLen],
      [segCenter, -4.4, segLen, 1.6], [segCenter, 4.4, segLen, 1.6],
      [-segCenter, -4.4, segLen, 1.6], [-segCenter, 4.4, segLen, 1.6]
    ];
    swSegments.forEach(([sx, sz, sw, sd]) => {
      const swMesh = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.09, sd), sidewalkMat);
      swMesh.position.set(sx, 0.045, sz);
      swMesh.receiveShadow = true;
      grp.add(swMesh);
    });

    // Jalan Komplek / Gang Utara & Selatan + Trotoar (berhenti sebelum jalan utama ±4.6m)
    const gangN = new THREE.Mesh(new THREE.PlaneGeometry(72, 4.4), roadMat);
    gangN.rotation.x = -Math.PI / 2; gangN.position.set(0, 0.012, -17.5);
    const gangS = new THREE.Mesh(new THREE.PlaneGeometry(72, 4.4), roadMat);
    gangS.rotation.x = -Math.PI / 2; gangS.position.set(0, 0.012, 17.5);
    const gangSideLen = 30.8;
    const gangSideCenter = 5.2 + gangSideLen / 2;
    [
      [-gangSideCenter, -20.25], [gangSideCenter, -20.25],
      [-gangSideCenter, -14.75], [gangSideCenter, -14.75],
      [-gangSideCenter, 14.75], [gangSideCenter, 14.75],
      [-gangSideCenter, 20.25], [gangSideCenter, 20.25]
    ].forEach(([gx, gz]) => {
      const gsw = new THREE.Mesh(new THREE.BoxGeometry(gangSideLen, 0.07, 1.1), sidewalkMat);
      gsw.position.set(gx, 0.035, gz);
      grp.add(gsw);
    });

    grp.add(roadNS, roadEW, roundaboutAsphalt, gangN, gangS);

    // Marka Jalan Putih Tengah & Garis Tepi Kuning Khas Bandung Wetan

    for (let m = -84; m <= 84; m += 5.5) {
      if (Math.abs(m) < 11) continue;
      const m1 = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 2.3), markMat);
      m1.rotation.x = -Math.PI / 2; m1.position.set(0, 0.022, m);
      const m2 = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.22), markMat);
      m2.rotation.x = -Math.PI / 2; m2.position.set(m, 0.022, 0);
      grp.add(m1, m2);
    }
    [-3.35, 3.35].forEach(off => {
      const eLen = 147.2;
      const eCenter = 12.8 + eLen / 2;
      [eCenter, -eCenter].forEach(cPos => {
        const eNS = new THREE.Mesh(new THREE.PlaneGeometry(0.14, eLen), edgeMat);
        eNS.rotation.x = -Math.PI / 2; eNS.position.set(off, 0.02, cPos);
        const eEW = new THREE.Mesh(new THREE.PlaneGeometry(eLen, 0.14), edgeMat);
        eEW.rotation.x = -Math.PI / 2; eEW.position.set(cPos, 0.02, off);
        grp.add(eNS, eEW);
      });
    });

    // Zebra Cross 6-Strip di 4 Sisi Bundaran
    for (let zc = -2.5; zc <= 2.5; zc += 1.0) {
      const cwN = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 2.2), markMat);
      cwN.rotation.x = -Math.PI / 2; cwN.position.set(zc, 0.024, -13.5);
      const cwS = cwN.clone(); cwS.position.z = 13.5;
      const cwW = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), markMat);
      cwW.rotation.x = -Math.PI / 2; cwW.position.set(-13.5, 0.024, zc);
      const cwE = cwW.clone(); cwE.position.x = 13.5;
      grp.add(cwN, cwS, cwW, cwE);
    }

    // Deretan Lampu Jalan PJU Klasik Bandung + Pohon Rindang di Trotoar
    const pjuPoleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.35 });
    const pjuBulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const pjuHaloMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.28, depthWrite: false });
    const pjuPoolMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.0, depthWrite: false });
    const districtPointLights = [];
    districtLampState = { bulbMat: pjuBulbMat, haloMat: pjuHaloMat, poolMat: pjuPoolMat, pointLights: districtPointLights };
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const leafMats = [
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.82 }),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.78 })
    ];

    function addStreetLamp(lx, lz, armDirX, armDirZ) {
      const lamp = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.45, 8), pjuPoleMat);
      base.position.y = 0.225;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.095, 4.2, 8), pjuPoleMat);
      pole.position.y = 2.1;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(armDirX !== 0 ? 1.1 : 0.08, 0.07, armDirZ !== 0 ? 1.1 : 0.08), pjuPoleMat);
      arm.position.set(armDirX * 0.5, 4.15, armDirZ * 0.5);
      const hood = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 8), pjuPoleMat);
      hood.position.set(armDirX * 0.95, 4.08, armDirZ * 0.95);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), pjuBulbMat);
      bulb.position.set(armDirX * 0.95, 3.94, armDirZ * 0.95);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), pjuHaloMat);
      halo.position.set(armDirX * 0.95, 3.92, armDirZ * 0.95);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(2.6, 16), pjuPoolMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(armDirX * 1.1, -0.04, armDirZ * 1.1);
      lamp.add(base, pole, arm, hood, bulb, halo, pool);
      lamp.position.set(lx, 0.08, lz);
      grp.add(lamp);
    }

    function addBandungTree(tx, tz, scale = 1) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * scale, 0.22 * scale, 2.2 * scale, 8), trunkMat);
      trunk.position.y = 1.1 * scale;
      const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25 * scale, 1), leafMats[0]);
      c1.position.set(0, 2.8 * scale, 0);
      const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95 * scale, 1), leafMats[1]);
      c2.position.set(0.65 * scale, 2.45 * scale, 0.35 * scale);
      const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9 * scale, 1), leafMats[2]);
      c3.position.set(-0.6 * scale, 2.55 * scale, -0.3 * scale);
      tree.add(trunk, c1, c2, c3);
      tree.position.set(tx, 0.08, tz);
      grp.add(tree);
    }

    for (let pos = -48; pos <= 48; pos += 14) {
      if (Math.abs(pos) < 15) continue;
      // Lampu PJU sepanjang jalan utama Utara-Selatan & Timur-Barat
      addStreetLamp(-4.5, pos, 1, 0);
      addStreetLamp(4.5, pos, -1, 0);
      addStreetLamp(pos, -4.5, 0, 1);
      addStreetLamp(pos, 4.5, 0, -1);
      // Pohon peneduh di sela-sela lampu (bebas dari area bundaran & gang)
      if (Math.abs(pos + 7) > 14 && Math.abs(pos + 7 - 17.5) > 3.5 && Math.abs(pos + 7 + 17.5) > 3.5) {
        addBandungTree(-5.6, pos + 7, 0.95);
        addBandungTree(5.6, pos + 7, 1.0);
        addBandungTree(pos + 7, -5.6, 0.95);
        addBandungTree(pos + 7, 5.6, 1.0);
      }
    }

    // 4 Lampu Taman + Bangku Taman di Atas Trotoar Paving Bundaran (R = 5.8m, aman dari aspal jalan)
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
    [[-4.1, -4.1], [4.1, -4.1], [-4.1, 4.1], [4.1, 4.1]].forEach(([bx, bz]) => {
      addStreetLamp(bx, bz, bx < 0 ? 0.5 : -0.5, bz < 0 ? 0.5 : -0.5);
      const pt = new THREE.PointLight(0xfde047, 0, 18, 1.8);
      pt.position.set(bx, 4.0, bz);
      grp.add(pt);
      districtPointLights.push(pt);
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.42, 0.52), benchMat);
      bench.position.set(bx * 0.92, 0.25, bz * 0.92);
      bench.lookAt(0, 0.25, 0);
      grp.add(bench);
    });

    const roundGrass = new THREE.Mesh(new THREE.CircleGeometry(5.4, 36), new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85 }));
    roundGrass.rotation.x = -Math.PI / 2; roundGrass.position.set(0, 0.022, 0);
    const roundPaving = new THREE.Mesh(new THREE.RingGeometry(5.4, 6.8, 36), sidewalkMat);
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
    const gateStats = getRealDistrictHouseStats(d);
    gctx.fillText(`${cur.title} (${gateStats.builtHouses}/20 Rumah Terbangun)`, 256, 82);

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

    // --- HUNIAN SERVER KECAMATAN: SLOT #0 CAMAT MINGGUAN + 19 WARGA (TANAH KOSONG -> MISI -> RUMAH) + APARTEMEN KE-21+ ---
    function makeDistrictPlaque(labelText, isCamatPlaque) {
      const cv = document.createElement("canvas");
      cv.width = 256; cv.height = 64;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = isCamatPlaque ? "rgba(180, 83, 9, 0.94)" : "rgba(15, 23, 42, 0.88)";
      ctx.fillRect(0, 0, 256, 64);
      ctx.strokeStyle = isCamatPlaque ? "#fde047" : "#38bdf8";
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 252, 60);
      ctx.fillStyle = isCamatPlaque ? "#fef08a" : "#f8fafc";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(labelText || "").slice(0, 22), 128, 32);
      const tex = new THREE.CanvasTexture(cv);
      return new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    }

    const kecLow = String(d.name || "").trim().toLowerCase();
    const idLow = String(d.id || "").trim().toLowerCase();
    const allCitizens = Array.isArray(window.registeredCitizensList) ? window.registeredCitizensList : [];
    const memberMap = new Map();
    allCitizens.forEach(c => {
      if (!c || !c.ig) return;
      const ck = String(c.kecamatan || "").trim().toLowerCase().replace(/[_-]+/g, " ");
      if (ck !== kecLow && ck !== idLow.replace(/[_-]+/g, " ")) return;
      const normIg = String(c.ig || "").trim().toLowerCase().replace(/^@/, "");
      if (!normIg) return;
      const prev = memberMap.get(normIg);
      if (!prev) {
        memberMap.set(normIg, { ...c });
      } else {
        prev.has_house = Boolean(prev.has_house || c.has_house);
        prev.xp = Math.max(Number(prev.xp || 0), Number(c.xp || 0));
      }
    });
    const districtMembers = Array.from(memberMap.values());

    const myProf = getCitizenProfile();
    const myCleanIg = myProf.isRegistered ? String(myProf.ig || "").trim().toLowerCase().replace(/^@/, "") : "";
    const isMyHomeDistrict = myProf.isRegistered && myProf.district && myProf.district.id === d.id;
    if (isMyHomeDistrict && myCleanIg && !memberMap.has(myCleanIg)) {
      districtMembers.unshift({
        ig: myProf.ig.startsWith("@") ? myProf.ig : "@" + myProf.ig,
        kecamatan: d.name,
        has_house: localStorage.getItem("piraku_has_house_" + myCleanIg) === "1"
      });
    }

    const camatIg = (window.weeklyCamatByKec && (window.weeklyCamatByKec[kecLow] || window.weeklyCamatByKec[idLow])) || null;
    const camatNorm = camatIg ? String(camatIg).trim().toLowerCase().replace(/^@/, "") : "";
    const camatMember = camatNorm
      ? districtMembers.find(m => String(m.ig || "").trim().toLowerCase().replace(/^@/, "") === camatNorm)
      : null;
    const regularMembers = districtMembers.filter(m => !camatNorm || String(m.ig || "").trim().toLowerCase().replace(/^@/, "") !== camatNorm);

    const hasBuiltHouse = (m) => {
      if (!m) return false;
      const norm = String(m.ig || "").trim().toLowerCase().replace(/^@/, "");
      return Boolean(
        m.has_house ||
        (norm && window.pirakuRemoteHouses && window.pirakuRemoteHouses[norm]) ||
        (norm && localStorage.getItem("piraku_has_house_" + norm) === "1")
      );
    };

    // Prioritaskan warga yang sudah menyelesaikan misi & bangun rumah untuk mengisi 35 kavling warga (Slot #0 = Camat -> total 36 kavling).
    // Warga yang belum bangun rumah tidak memblokir slot kavling orang lain (kecuali preview slot untuk pemain yang sedang login).
    const builtMembers = regularMembers.filter(hasBuiltHouse);
    const unbuiltMembers = regularMembers.filter(m => !hasBuiltHouse(m));
    const myUnbuiltIdx = isMyHomeDistrict && myCleanIg
      ? unbuiltMembers.findIndex(m => String(m.ig || "").trim().toLowerCase().replace(/^@/, "") === myCleanIg)
      : -1;
    const myUnbuiltPreview = myUnbuiltIdx >= 0 ? unbuiltMembers[myUnbuiltIdx] : null;

    const landedAssignees = [camatMember || null];
    for (let s = 0; s < 35; s++) {
      if (s < builtMembers.length) {
        landedAssignees.push(builtMembers[s]);
      } else if (s === builtMembers.length && myUnbuiltPreview) {
        landedAssignees.push(myUnbuiltPreview);
      } else {
        landedAssignees.push(null);
      }
    }
    const landedIgSet = new Set(
      landedAssignees
        .filter(Boolean)
        .map(m => String(m.ig || "").trim().toLowerCase().replace(/^@/, ""))
    );

    myKavlingBeaconGroup = null;
    myDistrictKavlingInfo = null;

    KAVLING_SLOTS.forEach((slot, idx) => {
      const resident = landedAssignees[idx];
      const isCamatSlot = (idx === 0);
      const resCleanIg = resident ? String(resident.ig || "").trim().toLowerCase().replace(/^@/, "") : "";
      const isMySlot = Boolean(myCleanIg && resCleanIg && resCleanIg === myCleanIg);
      const resHasHouse = Boolean(
        resident && (
          resident.has_house ||
          isCamatSlot ||
          (window.pirakuRemoteHouses && window.pirakuRemoteHouses[resCleanIg]) ||
          localStorage.getItem("piraku_has_house_" + resCleanIg) === "1"
        )
      );
      const pTier = resident ? getPersonalHouseTierFor(resident.ig) : 0;
      let unit;
      let plaqueLabel = "";

      if (resident) {
        if (resHasHouse) {
          unit = createModernHouseMesh(idx, isCamatSlot ? Math.max(3, cur.lv) : cur.lv, isMySlot ? pTier : (pTier > 1 ? pTier : 0));
          const tierTag = pTier >= 4 ? "👑 SULTAN " : (pTier > 1 ? `★Lv.${pTier} ` : "");
          plaqueLabel = isCamatSlot ? ("👑 CAMAT " + resident.ig) : (tierTag + resident.ig);
        } else {
          // Belum menyelesaikan misi rumah -> Kavling Tanah Kosong milik warga
          unit = createEmptyLotMesh();
          plaqueLabel = (isMySlot ? "📍 KAVLINGMU " : "") + resident.ig;
        }
      } else {
        unit = createEmptyLotMesh();
        plaqueLabel = isCamatSlot ? "Kavling Dinas Camat" : ("Kavling #" + (idx + 1));
      }

      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 0.58),
        makeDistrictPlaque(plaqueLabel, (isCamatSlot && Boolean(resident)) || isMySlot)
      );
      sign.position.set(0, (isCamatSlot && resident) || (resHasHouse && pTier >= 2) ? 4.8 : 1.2, 2.75);
      unit.add(sign);

      if (isMySlot) {
        // Tambahkan Beacon Penanda 3D di depan kavling milik pemain sendiri
        const beaconGrp = new THREE.Group();
        const frontDirZ = slot.rotY === 0 ? 1 : -1;
        const worldFrontX = slot.x;
        const worldFrontZ = slot.z + frontDirZ * 3.6;

        const ringGeo = new THREE.RingGeometry(0.85, 1.18, 28);
        const ringMat = new THREE.MeshBasicMaterial({
          color: resHasHouse ? 0xfacc15 : 0x38bdf8,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.06;

        const beamGeo = new THREE.CylinderGeometry(0.18, 0.55, 4.2, 14, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: resHasHouse ? 0xfacc15 : 0x38bdf8,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.y = 2.1;

        const gemGeo = new THREE.OctahedronGeometry(0.38, 0);
        const gemMat = new THREE.MeshStandardMaterial({
          color: resHasHouse ? 0xfacc15 : 0x38bdf8,
          emissive: resHasHouse ? 0xd97706 : 0x0284c7,
          emissiveIntensity: 0.7,
          metalness: 0.6,
          roughness: 0.2
        });
        const gemMesh = new THREE.Mesh(gemGeo, gemMat);
        gemMesh.position.y = 2.4;

        beaconGrp.add(ringMesh, beamMesh, gemMesh);
        beaconGrp.position.set(worldFrontX, 0, worldFrontZ);
        beaconGrp.userData = { gemMesh, ringMesh };
        grp.add(beaconGrp);
        myKavlingBeaconGroup = beaconGrp;

        myDistrictKavlingInfo = {
          slotIdx: idx,
          x: worldFrontX,
          z: worldFrontZ,
          districtId: d.id,
          districtName: d.name,
          hasHouse: resHasHouse,
          houseTier: pTier
        };
      }

      unit.position.set(slot.x, 0, slot.z);
      unit.rotation.y = slot.rotY;
      grp.add(unit);
    });

    // Warga yang belum mendapat kavling tapak (kelebihan >19 rumah atau belum menyelesaikan misi bangun rumah) -> Tower Apartemen Kecamatan
    const apartmentResidents = regularMembers.filter(m => {
      const norm = String(m.ig || "").trim().toLowerCase().replace(/^@/, "");
      return !landedIgSet.has(norm);
    });
    if (apartmentResidents.length > 0) {
      const aptGroup = new THREE.Group();
      aptGroup.position.set(-35, 0, 22);
      aptGroup.rotation.y = Math.PI;

      const podium = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.25, 6.8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      podium.position.y = 0.125;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(6.0, 11.5, 5.4), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 }));
      tower.position.y = 6.0;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.35, 5.7), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      roof.position.y = 11.9;
      aptGroup.add(podium, tower, roof);

      const glassMatApt = districtHouseGlassMat || new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0xfef08a, emissiveIntensity: 0.0, metalness: 0.75, roughness: 0.15 });
      for (let fl = 0; fl < 4; fl++) {
        const fy = 1.8 + fl * 2.5;
        [-1.8, 0, 1.8].forEach(wx => {
          const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.35, 5.5), glassMatApt);
          win.position.set(wx, fy, 0);
          aptGroup.add(win);
        });
      }

      const aptPlaque = new THREE.Mesh(
        new THREE.PlaneGeometry(4.6, 0.72),
        makeDistrictPlaque("🏢 APT. " + d.name.toUpperCase() + " (" + apartmentResidents.length + ")", false)
      );
      aptPlaque.position.set(0, 12.6, 2.9);
      aptGroup.add(aptPlaque);

      // Klik Tower Apartemen untuk membuka daftar penghuninya
      aptGroup.traverse(ch => {
        if (ch.isMesh) {
          ch.userData = { isKecamatanApartment: true, kecKey: d.name, occupants: apartmentResidents };
        }
      });
      grp.add(aptGroup);

      window.openActiveDistrictApartmentModal = function() {
        let modal = document.getElementById("kec-apartment-modal");
        if (!modal) {
          modal = document.createElement("div");
          modal.id = "kec-apartment-modal";
          modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.74);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;";
          modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
          modal.innerHTML = `
            <div style="background:#0f172a;border:1px solid rgba(56,189,248,0.35);border-radius:18px;width:100%;max-width:420px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.65);">
              <div style="padding:14px 16px;border-bottom:1px solid rgba(148,163,184,0.18);display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div id="kec-apt-title" style="font-weight:800;color:#38bdf8;font-size:15px;">🏢 Apartemen Kecamatan</div>
                  <div id="kec-apt-sub" style="font-size:11px;color:#94a3b8;">Hunian vertikal warga ke-21 dst.</div>
                </div>
                <button onclick="document.getElementById('kec-apartment-modal').style.display='none'" style="background:rgba(148,163,184,0.15);border:none;color:#f8fafc;width:28px;height:28px;border-radius:8px;cursor:pointer;font-weight:700;">✕</button>
              </div>
              <div id="kec-apt-body" style="padding:12px 14px;overflow-y:auto;flex:1;"></div>
            </div>
          `;
          document.body.appendChild(modal);
        }
        document.getElementById("kec-apt-title").innerText = "🏢 Apartemen Kec. " + d.name;
        document.getElementById("kec-apt-sub").innerText = apartmentResidents.length + " Penghuni Terdaftar (Warga ke-21 dst.)";
        document.getElementById("kec-apt-body").innerHTML = apartmentResidents.map((cit, i) => {
          const floor = Math.floor(i / 4) + 1;
          const unitNo = floor * 100 + (i % 4) + 1;
          return `
            <div style="background:rgba(30,41,59,0.75);border:1px solid rgba(148,163,184,0.2);border-radius:12px;padding:10px 12px;margin-bottom:8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:800;color:#f8fafc;font-size:13px;">${cit.ig}</span>
                <span style="background:rgba(56,189,248,0.16);color:#38bdf8;font-weight:700;font-size:10.5px;padding:2px 8px;border-radius:999px;">Lt. ${floor} • Unit ${unitNo}</span>
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${cit.role || "Warga"} • Lvl ${cit.level || 1} (${cit.xp || 0} XP)</div>
              ${cit.wish ? `<div style="font-size:11px;color:#cbd5e1;margin-top:4px;font-style:italic;">"${String(cit.wish).slice(0, 80)}"</div>` : ""}
            </div>
          `;
        }).join("");
        modal.style.display = "flex";
      };
    }

    window.refreshActiveDistrictHouses = function() {
      if (!window.pirakuInDistrict) return;
      const pm = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
      const savedX = pm && pm.position ? pm.position.x : null;
      const savedZ = pm && pm.position ? pm.position.z : null;
      buildDedicatedDistrictScene(d);
      if (pm && pm.position && savedX !== null && savedZ !== null) {
        pm.position.x = savedX;
        pm.position.z = savedZ;
        if (pm.userData && pm.userData.a && pm.userData.a.c) {
          pm.userData.a.c.x = savedX;
          pm.userData.a.c.z = savedZ;
        }
      }
    };

    if (cur.lv >= 2) {
      // 1. MUSHOLA KOMPLEK (Kubah emas 2-tingkat, gerbang melengkung, jendela samping, menara oktagonal, & taman serambi)
      const mushola = new THREE.Group();
      const mStone = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.75 });
      const mWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
      const mGreen = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.55 });
      const mGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.68, roughness: 0.22 });
      const mLeaf = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });

      const mPlinth = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.3, 6.2), mStone);
      mPlinth.position.y = 0.15;
      const mBody = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.7, 4.6), mWhite);
      mBody.position.y = 1.65;
      const mTrim = new THREE.Mesh(new THREE.BoxGeometry(5.15, 0.22, 4.95), mGreen);
      mTrim.position.y = 3.0;
      const mDrumBase = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.15, 0.36, 8), mWhite);
      mDrumBase.position.y = 3.24;
      const mDrum = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.75, 0.52, 8), mGreen);
      mDrum.position.y = 3.65;
      const mDome = new THREE.Mesh(new THREE.SphereGeometry(1.62, 20, 14), mGold);
      mDome.position.y = 4.02;
      const mSpire = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.9, 8), mGold);
      mSpire.position.y = 5.95;

      // Serambi depan berpilar & atap limas serambi
      const mPorchRoof = createGableRoof(3.8, 0.75, 1.5, 0x059669);
      mPorchRoof.position.set(0, 2.38, 2.72);
      [-1.4, 1.4].forEach(px => {
        const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 2.15, 8), mWhite);
        pil.position.set(px, 1.32, 3.15);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.36), mGold);
        cap.position.set(px, 2.36, 3.15);
        mushola.add(pil, cap);
      });
      // Pintu melengkung + bingkai emas + jendela depan & samping
      const mArchFrame = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.09, 8, 14, Math.PI), mGold);
      mArchFrame.position.set(0, 1.9, 2.34);
      const mDoor = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.75, 0.12), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      mDoor.position.set(0, 1.15, 2.32);
      [-1.55, 1.55].forEach(wx => {
        const w = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.05, 0.1), districtHouseGlassMat);
        w.position.set(wx, 1.65, 2.32);
        const wTop = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 10), mGold);
        wTop.rotation.x = Math.PI / 2;
        wTop.position.set(wx, 2.18, 2.32);
        mushola.add(w, wTop);
      });
      [-2.42, 2.42].forEach(sx => {
        [-0.9, 0.9].forEach(sz => {
          const sw = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.95, 0.7), districtHouseGlassMat);
          sw.position.set(sx, 1.65, sz);
          mushola.add(sw);
        });
      });
      // Taman pot kecil kiri-kanan serambi
      [-2.35, 2.35].forEach(bx => {
        const pot = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.32, 0.85), mStone);
        pot.position.set(bx, 0.44, 2.95);
        const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 0), mLeaf);
        bush.position.set(bx, 0.78, 2.95);
        mushola.add(pot, bush);
      });
      // Menara sudut mushola bertingkat
      const minBase = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.5, 4.7, 8), mWhite);
      minBase.position.set(-2.35, 2.35, 2.1);
      const minRing = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.18, 8), mGreen);
      minRing.position.set(-2.35, 3.85, 2.1);
      const minCap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), mGold);
      minCap.position.set(-2.35, 4.85, 2.1);

      mushola.add(mPlinth, mBody, mTrim, mDrumBase, mDrum, mDome, mSpire, mPorchRoof, mArchFrame, mDoor, minBase, minRing, minCap);
      mushola.position.set(-34, 0, -24);
      grp.add(mushola);
    }
    if (cur.lv >= 3) {
      // 2. KAFE & PUJASERA KOMPLEK (Dek kayu pergola, jendela samping, papan menu A-frame, ikon cangkir kopi, & payung meja)
      const cafe = new THREE.Group();
      const cWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
      const cDeck = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.18, 5.8), new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 }));
      cDeck.position.set(0, 0.09, 0.65);
      const cLower = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.1, 3.6), cWoodMat);
      cLower.position.set(0, 0.72, -0.35);
      const cUpper = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.5, 3.6), new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.65 }));
      cUpper.position.set(0, 2.02, -0.35);
      const cRoof = createGableRoof(5.8, 1.25, 4.2, 0x334155);
      cRoof.position.set(0, 2.75, -0.35);

      // Etalase kaca hangat + jendela samping + papan nama & ikon cangkir kopi
      const cWindow = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.05, 0.1), districtHouseGlassMat);
      cWindow.position.set(0, 1.75, 1.47);
      [-2.62, 2.62].forEach(sx => {
        const sw = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.95, 1.7), districtHouseGlassMat);
        sw.position.set(sx, 1.85, -0.35);
        cafe.add(sw);
      });
      const cSign = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.48, 0.16), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      cSign.position.set(0, 2.68, 1.52);
      const cupBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.36, 10), new THREE.MeshStandardMaterial({ color: 0xfefce8 }));
      cupBody.position.set(0, 3.16, 1.52);

      // Pergola kayu di dek depan
      [-2.8, 2.8].forEach(px => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.35, 0.14), cWoodMat);
        post.position.set(px, 1.32, 3.25);
        cafe.add(post);
      });
      const pergBar = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.12, 0.14), cWoodMat);
      pergBar.position.set(0, 2.48, 3.25);
      cafe.add(pergBar);

      // Kanopi kafe bergaris merah-krem
      for (let s = 0; s < 5; s++) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(1.04, 0.14, 1.45),
          new THREE.MeshStandardMaterial({ color: s % 2 === 0 ? 0xdc2626 : 0xfefce8, roughness: 0.6 })
        );
        stripe.position.set(-2.08 + s * 1.04, 2.28, 2.05);
        stripe.rotation.x = 0.22;
        cafe.add(stripe);
      }

      // 2 Set meja & payung outdoor di dek depan
      [[-1.6, 2.6, 0x0ea5e9], [1.6, 2.6, 0xf59e0b]].forEach(([ux, uz, uCol]) => {
        const tbl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 12), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
        tbl.position.set(ux, 0.72, uz);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        leg.position.set(ux, 0.42, uz);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.55, 6), new THREE.MeshStandardMaterial({ color: 0x475569 }));
        pole.position.set(ux, 1.45, uz);
        const umb = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.52, 8), new THREE.MeshStandardMaterial({ color: uCol, roughness: 0.6 }));
        umb.position.set(ux, 2.22, uz);
        cafe.add(tbl, leg, pole, umb);
      });

      cafe.add(cDeck, cLower, cUpper, cRoof, cWindow, cSign, cupBody);
      cafe.position.set(34, 0, -24);
      grp.add(cafe);
    }
    if (cur.lv >= 4) {
      // 3. BALAI WARGA BANDUNG (Menghadap jalan -Z, pedimen klasik, 4 pilar, jendela samping, & tiang bendera)
      const balai = new THREE.Group();
      const bStone = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.75 });
      const bWall = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
      const bBlue = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.55 });
      const bGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.55, roughness: 0.3 });

      const bStep1 = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.2, 5.8), bStone);
      bStep1.position.y = 0.1;
      const bStep2 = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.2, 5.2), bStone);
      bStep2.position.y = 0.3;
      const bBody = new THREE.Mesh(new THREE.BoxGeometry(6.0, 3.2, 4.0), bWall);
      bBody.position.set(0, 2.0, -0.2);
      const bAccent = new THREE.Mesh(new THREE.BoxGeometry(6.25, 0.42, 4.25), bBlue);
      bAccent.position.set(0, 3.48, -0.2);
      const bRoof = createGableRoof(6.6, 1.65, 4.6, 0xb45309);
      bRoof.position.set(0, 3.68, -0.2);

      // Pedimen segitiga klasik di atas serambi depan + 4 pilar klasik
      const bPediment = createGableRoof(4.6, 0.95, 1.35, 0xf8fafc);
      bPediment.position.set(0, 3.35, 2.15);
      const bPortico = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.22, 1.3), bBlue);
      bPortico.position.set(0, 3.25, 2.25);
      [-1.8, -0.65, 0.65, 1.8].forEach(px => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 2.85, 10), bWall);
        col.position.set(px, 1.82, 2.55);
        balai.add(col);
      });
      // Pintu utama & jendela depan + samping menyala malam
      const bDoor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.12), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      bDoor.position.set(0, 1.4, 1.82);
      [-2.1, -1.2, 1.2, 2.1].forEach(wx => {
        const bw = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.05, 0.1), districtHouseGlassMat);
        bw.position.set(wx, 2.1, 1.82);
        balai.add(bw);
      });
      [-3.02, 3.02].forEach(sx => {
        [-1.1, 0.7].forEach(sz => {
          const sw = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.05, 0.75), districtHouseGlassMat);
          sw.position.set(sx, 2.1, sz);
          balai.add(sw);
        });
      });
      // Medali jam / lambang di pedimen + Tiang Bendera Merah Putih
      const bClock = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.14, 16), bGold);
      bClock.rotation.x = Math.PI / 2;
      bClock.position.set(0, 3.78, 2.85);
      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 4.5, 8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6 }));
      flagPole.position.set(-3.2, 2.25, 2.6);
      const flagRed = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.28, 0.04), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
      flagRed.position.set(-2.72, 4.25, 2.6);
      const flagWht = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.28, 0.04), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
      flagWht.position.set(-2.72, 3.97, 2.6);

      balai.add(bStep1, bStep2, bBody, bAccent, bRoof, bPediment, bPortico, bDoor, bClock, flagPole, flagRed, flagWht);
      balai.position.set(34, 0, 24);
      balai.rotation.y = Math.PI;
      grp.add(balai);
    }

    // 4. MINIMARKET PIRAKU MART 24J (Tersedia di setiap distrik untuk beli cemilan!)
    (function addDistrictMinimarket() {
      const mart = new THREE.Group();
      const mmWall = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
      const mmPlinth = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
      const mmBlue = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
      const mmRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
      const mmYellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 });

      const base = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.22, 4.8), mmPlinth);
      base.position.y = 0.11;
      const body = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.75, 3.8), mmWall);
      body.position.set(0, 1.58, -0.2);
      // Atap miring modern & fascia strip biru-merah-kuning khas minimarket
      const roof = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.24, 4.4), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }));
      roof.position.set(0, 3.05, 0.05);
      const bandBlue = new THREE.Mesh(new THREE.BoxGeometry(5.85, 0.32, 0.14), mmBlue);
      bandBlue.position.set(0, 2.84, 2.2);
      const bandRed = new THREE.Mesh(new THREE.BoxGeometry(5.85, 0.14, 0.14), mmRed);
      bandRed.position.set(0, 2.61, 2.2);
      const bandYel = new THREE.Mesh(new THREE.BoxGeometry(5.85, 0.1, 0.14), mmYellow);
      bandYel.position.set(0, 2.49, 2.2);

      // Pintu kaca + etalase cemilan + plang Piraku Mart
      const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.95, 0.1), districtHouseGlassMat);
      doorGlass.position.set(0, 1.2, 1.72);
      [-1.7, 1.7].forEach(wx => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.45, 0.1), districtHouseGlassMat);
        win.position.set(wx, 1.45, 1.72);
        mart.add(win);
      });
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 0.62),
        makeDistrictPlaque("🏪 PIRAKU MART 24J", true)
      );
      signMesh.position.set(0, 3.55, 2.15);

      // Cooler minuman outdoor & bangku depan
      const cooler = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.15, 0.55), mmBlue);
      cooler.position.set(-2.25, 0.78, 2.02);
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.36, 0.48), new THREE.MeshStandardMaterial({ color: 0xb45309 }));
      bench.position.set(1.95, 0.38, 2.02);

      // Ring indikator interaksi di trotoar depan minimarket
      const martRing = new THREE.Mesh(
        new THREE.RingGeometry(0.7, 0.98, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
      );
      martRing.rotation.x = -Math.PI / 2;
      martRing.position.set(0, 0.05, 3.2);

      mart.add(base, body, roof, bandBlue, bandRed, bandYel, doorGlass, signMesh, cooler, bench, martRing);
      mart.position.set(34, 0, -10.5);
      mart.traverse(ch => {
        if (ch.isMesh) ch.userData = { ...(ch.userData || {}), isPirakuMart: true };
      });
      grp.add(mart);
    })();

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [[-10.6, -10.6], [10.6, -10.6], [-10.6, 10.6], [10.6, 10.6], [-24, -6], [24, -6], [-24, 6], [24, 6], [-38, -28], [38, -28], [-38, 28], [38, 28]].forEach(([tx, tz]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      trunk.position.set(tx, 0.7, tz);
      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 0), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
      crown.position.set(tx, 1.95, tz);
      grp.add(trunk, crown);
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

    // Armada Angkot Bandung & Mobil Warga (Masuk dari 4 ruas jalan -> melingkar bundaran -> belok kiri/lurus/kanan keluar!)
    const R_CIRCLE = 10.0;
    const ENTRY_R = 11.4;
    // 4 Arah Masuk (arm: 0=Utara(-Z), 1=Timur(+X), 2=Selatan(+Z), 3=Barat(-X))
    // Sudut titik temu jalur kiri Indonesia dengan lingkaran R=10.0:
    // Utara(-Z, x=+1.8) -> ang ~ -1.39 rad | Barat(-X, z=-1.8) -> ang ~ 2.96 rad | Selatan(+Z, x=-1.8) -> ang ~ 1.75 rad | Timur(+X, z=+1.8) -> ang ~ -0.18 rad
    const ARM_DEFS = [
      { name: "N", axis: "z", dir: 1, laneX: 1.8, laneZ: 0, entryAng: -1.39, exitAng: -1.75 }, // Datang dari Utara (-Z -> +Z)
      { name: "W", axis: "x", dir: 1, laneX: 0, laneZ: -1.8, entryAng: 2.96, exitAng: 3.32 },  // Datang dari Barat (-X -> +X)
      { name: "S", axis: "z", dir: -1, laneX: -1.8, laneZ: 0, entryAng: 1.75, exitAng: 1.39 }, // Datang dari Selatan (+Z -> -Z)
      { name: "E", axis: "x", dir: -1, laneX: 0, laneZ: 1.8, entryAng: -0.18, exitAng: 0.18 }   // Datang dari Timur (+X -> -X)
    ];
    // Jalan keluar berpasangan sesuai aturan lalu lintas Indonesia (sisi kiri jalan):
    // Keluar ke Selatan(+Z, x=+1.8): exitAng = 1.39 | Keluar ke Timur(+X, z=+1.8): exitAng = 0.18 | Keluar ke Utara(-Z, x=-1.8): exitAng = -1.75 | Keluar ke Barat(-X, z=-1.8): exitAng = 2.96
    const EXIT_ARMS = [
      { axis: "z", dir: 1, laneX: 1.8, exitAng: 1.39 },   // Keluar ke Selatan (+Z)
      { axis: "x", dir: 1, laneZ: 1.8, exitAng: 0.18 },   // Keluar ke Timur (+X)
      { axis: "z", dir: -1, laneX: -1.8, exitAng: -1.75 }, // Keluar ke Utara (-Z)
      { axis: "x", dir: -1, laneZ: -1.8, exitAng: 2.96 }   // Keluar ke Barat (-X)
    ];

    const angkotConfigs = [
      // Jalur Utara (armIdx: 0, bergerak dari -Z menuju bundaran)
      { armIdx: 0, startDist: -16, turnSteps: 2, speed: 7.8, body: 0x16a34a, stripe: 0xfacc15 }, // Angkot Kalapa-Dago (Hijau-Kuning)
      { armIdx: 0, startDist: -27, turnSteps: 1, speed: 8.4, carColor: 0xef4444 },               // Mobil Merah
      { armIdx: 0, startDist: -39, turnSteps: 3, speed: 7.5, body: 0x0284c7, stripe: 0xfef08a }, // Angkot Cisitu-Tegallega (Biru Muda-Kuning)
      { armIdx: 0, startDist: -51, turnSteps: 2, speed: 8.8, carColor: 0x38bdf8 },               // Mobil Biru Langit

      // Jalur Barat (armIdx: 1, bergerak dari -X menuju bundaran)
      { armIdx: 1, startDist: -18, turnSteps: 3, speed: 7.4, body: 0xfef3c7, stripe: 0xdc2626 }, // Angkot St.Hall-Lembang (Krem-Merah)
      { armIdx: 1, startDist: -30, turnSteps: 2, speed: 8.5, carColor: 0xfacc15 },               // Mobil Kuning
      { armIdx: 1, startDist: -42, turnSteps: 1, speed: 7.9, body: 0x15803d, stripe: 0xf97316 }, // Angkot Cicaheum-Ciroyom (Hijau-Oranye)
      { armIdx: 1, startDist: -54, turnSteps: 2, speed: 8.9, carColor: 0xa855f7 },               // Mobil Ungu

      // Jalur Selatan (armIdx: 2, bergerak dari +Z menuju bundaran)
      { armIdx: 2, startDist: 17, turnSteps: 1, speed: 7.6, body: 0x2563eb, stripe: 0xf8fafc },  // Angkot Sederhana-Cimindi (Biru-Putih)
      { armIdx: 2, startDist: 28, turnSteps: 3, speed: 8.3, carColor: 0x0f172a },                // Mobil Hitam
      { armIdx: 2, startDist: 40, turnSteps: 2, speed: 7.7, body: 0xeab308, stripe: 0x1d4ed8 },  // Angkot Margahayu-Ledeng (Kuning-Biru)
      { armIdx: 2, startDist: 52, turnSteps: 1, speed: 8.7, carColor: 0x10b981 },                // Mobil Emerald

      // Jalur Timur (armIdx: 3, bergerak dari +X menuju bundaran)
      { armIdx: 3, startDist: 19, turnSteps: 2, speed: 8.2, carColor: 0xf8fafc },                // Mobil Putih
      { armIdx: 3, startDist: 31, turnSteps: 1, speed: 7.5, body: 0x9a3412, stripe: 0xfef3c7 },  // Angkot Ciwastra-Ujungberung (Coklat-Krem)
      { armIdx: 3, startDist: 43, turnSteps: 3, speed: 8.6, carColor: 0xf97316 },                // Mobil Oranye
      { armIdx: 3, startDist: 55, turnSteps: 2, speed: 7.8, body: 0xbe123c, stripe: 0xf8fafc }   // Angkot Cibaduyut (Merah Maroon-Putih)
    ];
    angkotConfigs.forEach(cfg => {
      const veh = cfg.body ? createBandungAngkotMesh(cfg.body, cfg.stripe) : createPrivateCarMesh(cfg.carColor);
      const initArm = ARM_DEFS[cfg.armIdx];
      if (initArm.axis === "z") {
        veh.position.set(initArm.laneX, 0.02, cfg.startDist);
        veh.rotation.y = initArm.dir > 0 ? 0 : Math.PI;
      } else {
        veh.position.set(cfg.startDist, 0.02, initArm.laneZ);
        veh.rotation.y = initArm.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
      grp.add(veh);
      districtTraffic.push({
        mesh: veh,
        state: "approach", // approach -> circle -> exit
        armIdx: cfg.armIdx,
        dist: cfg.startDist,
        turnSteps: cfg.turnSteps,
        speed: cfg.speed,
        circleAng: 0,
        traveledAng: 0,
        targetAngSpan: Math.PI,
        exitArm: EXIT_ARMS[0]
      });
    });

    // NPC Warga Lokal Jalan Santai di Trotoar Paving
    const npcConfigs = [
      { axis: "z", fixed: -4.4, pos: -28, dir: 1, speed: 1.55, col: 0x3b82f6, hijab: true },
      { axis: "z", fixed: 4.4, pos: 24, dir: -1, speed: 1.45, col: 0x10b981, hijab: false },
      { axis: "x", fixed: -4.4, pos: -22, dir: 1, speed: 1.5, col: 0xf97316, hijab: true },
      { axis: "x", fixed: 4.4, pos: 26, dir: -1, speed: 1.6, col: 0xa855f7, hijab: false },
      { axis: "z", fixed: -4.4, pos: 14, dir: 1, speed: 1.4, col: 0xec4899, hijab: true },
      { axis: "x", fixed: 4.4, pos: -16, dir: 1, speed: 1.5, col: 0x0ea5e9, hijab: false }
    ];
    npcConfigs.forEach((nc, idx) => {
      const npc = createDistrictNpcMesh(nc.col, nc.hijab);
      grp.add(npc);
      districtPedestrians.push({ mesh: npc, phase: idx * 1.3, isVendor: false, ...nc });
    });

    // Tukang Dagang Keliling (Gerobak Bakso/Cuanki & Bandrek Keliling Komplek)
    const vendorConfigs = [
      { axis: "x", fixed: -16.4, pos: -24, dir: 1, speed: 1.05, awning: 0xef4444, box: 0x2563eb },
      { axis: "x", fixed: 16.4, pos: 22, dir: -1, speed: 1.0, awning: 0xf59e0b, box: 0x15803d }
    ];
    vendorConfigs.forEach((vc, idx) => {
      const cart = createStreetVendorCartMesh(vc.awning, vc.box);
      grp.add(cart);
      districtPedestrians.push({ mesh: cart, phase: idx * 2.1, isVendor: true, ...vc });
    });

    sc.add(grp);
    customDistrictGroup = grp;

    if (playerMesh) {
      let p = playerMesh;
      while (p) { p.visible = true; p = p.parent; }
      if (playerMesh.position) {
        playerMesh.position.x = 0;
        playerMesh.position.z = 3.6;
        if (playerMesh.userData && playerMesh.userData.a && playerMesh.userData.a.c) {
          playerMesh.userData.a.c.x = 0;
          playerMesh.userData.a.c.z = 3.6;
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
      komplekMinimapOverlay.width = 216;
      komplekMinimapOverlay.height = 216;
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
      const w = 216, h = 216, cx = 108, cy = 108;
      const toM = v => cx + (v / 48) * 90;
      ctx.clearRect(0, 0, w, h);

      // Latar radar gelap
      const bg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 108);
      bg.addColorStop(0, "#16253b"); bg.addColorStop(1, "#09111e");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // 4 Kuadran Komplek Hijau
      ctx.fillStyle = "rgba(22, 101, 52, 0.72)";
      ctx.beginPath();
      ctx.roundRect(22, 26, 72, 68, 10);
      ctx.roundRect(122, 26, 72, 68, 10);
      ctx.roundRect(22, 122, 72, 68, 10);
      ctx.roundRect(122, 122, 72, 68, 10);
      ctx.fill();

      // 20 Kavling Rumah mini
      ctx.fillStyle = "rgba(226, 232, 240, 0.45)";
      KAVLING_SLOTS.forEach(s => {
        ctx.fillRect(toM(s.x) - 4, toM(s.z) - 4, 8, 8);
      });

      // Jalan Poros 4 Arah + Marka Putus-Putus
      ctx.fillStyle = "#334155";
      ctx.fillRect(98, 10, 20, 196);
      ctx.fillRect(10, 98, 196, 20);
      ctx.strokeStyle = "rgba(250, 204, 21, 0.5)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx, 14); ctx.lineTo(cx, h - 14);
      ctx.moveTo(14, cy); ctx.lineTo(w - 14, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bundaran Tengah
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#334155"; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e"; ctx.fill();
      ctx.strokeStyle = "#facc15"; ctx.lineWidth = 2; ctx.stroke();

      // Beacon Kavling Milik Sendiri (berdenyut)
      if (myDistrictKavlingInfo) {
        const kx = toM(myDistrictKavlingInfo.x);
        const kz = toM(myDistrictKavlingInfo.z);
        ctx.fillStyle = myDistrictKavlingInfo.hasHouse ? "#facc15" : "#38bdf8";
        ctx.beginPath(); ctx.arc(kx, kz, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.2; ctx.stroke();
      }

      // Titik Live Angkot & Mobil Warga di Komplek
      districtTraffic.forEach(v => {
        if (!v.mesh) return;
        const vx = toM(v.mesh.position.x);
        const vz = toM(v.mesh.position.z);
        if (Math.hypot(vx - cx, vz - cy) < 98) {
          ctx.fillStyle = "#fb923c";
          ctx.fillRect(vx - 2.5, vz - 2.5, 5, 5);
        }
      });

      // Petunjuk Target Ojol 3D di Minimap Komplek
      const mmTgt = window.pirakuActiveMinimapTarget;
      if (mmTgt && mmTgt.mapId === activeMapId) {
        const tx = Math.max(18, Math.min(w - 18, toM(mmTgt.x)));
        const tz = Math.max(24, Math.min(h - 18, toM(mmTgt.z)));
        const mesh0 = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
        if (mesh0 && mesh0.position) {
          const sx0 = Math.max(18, Math.min(w - 18, toM(mesh0.position.x)));
          const sz0 = Math.max(24, Math.min(h - 18, toM(mesh0.position.z)));
          ctx.save();
          ctx.strokeStyle = mmTgt.color || "#facc15";
          ctx.lineWidth = 1.6;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(sx0, sz0); ctx.lineTo(tx, tz); ctx.stroke();
          ctx.restore();
        }
        const tp = 6 + Math.sin(performance.now() * 0.006) * 2.2;
        ctx.strokeStyle = mmTgt.color || "#facc15";
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(tx, tz, tp, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = mmTgt.color || "#facc15";
        ctx.beginPath(); ctx.arc(tx, tz, 4, 0, Math.PI * 2); ctx.fill();
      }

      // Label Nama Kecamatan
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.beginPath(); ctx.roundRect(cx - 52, 8, 104, 16, 8); ctx.fill();
      ctx.fillStyle = "#fde047"; ctx.font = "bold 9.5px sans-serif"; ctx.textAlign = "center";
      ctx.fillText((komplekMinimapOverlay.dataset.districtName || "KOMPLEK").toUpperCase().slice(0, 14), cx, 19.5);

      // Penanda Pemain + Arah Hadap
      const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
      if (mesh && mesh.position) {
        const px = Math.max(18, Math.min(w - 18, toM(mesh.position.x)));
        const pz = Math.max(24, Math.min(h - 18, toM(mesh.position.z)));
        const rot = mesh.rotation ? -mesh.rotation.y + Math.PI / 2 : 0;

        ctx.save();
        ctx.translate(px, pz);
        ctx.rotate(rot);
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
        grad.addColorStop(0, "rgba(56, 189, 248, 0.55)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 20, -0.45, 0.45); ctx.closePath(); ctx.fill();
        ctx.restore();

        ctx.beginPath(); ctx.arc(px, pz, 5.2, 0, Math.PI * 2);
        ctx.fillStyle = "#38bdf8"; ctx.fill();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.6; ctx.stroke();
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
    districtTraffic = [];
    districtPedestrians = [];
    districtTraffic = [];
    districtPedestrians = [];
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

  function showMapTransitionCover(labelText) {
    if (!document.body) return;
    let cov = document.getElementById("piraku-map-transition-cover");
    if (!cov) {
      cov = document.createElement("div");
      cov.id = "piraku-map-transition-cover";
      cov.style.cssText = "position:fixed;inset:0;z-index:99998;background:rgba(9,13,22,0.92);backdrop-filter:blur(8px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#f8fafc;font-family:'Bricolage Grotesque',sans-serif;pointer-events:auto;transition:opacity 0.25s ease;";
      document.body.appendChild(cov);
    }
    cov.innerHTML = `<div style="width:36px;height:36px;border-radius:50%;border:3px solid rgba(56,189,248,0.25);border-top-color:#38bdf8;animation:spin 0.7s linear infinite;"></div><div style="font-size:14px;font-weight:800;color:#7dd3fc;">${labelText}</div>`;
    cov.style.opacity = "1";
    cov.style.display = "flex";
    clearTimeout(cov._t);
    cov._t = setTimeout(() => {
      cov.style.opacity = "0";
      setTimeout(() => { cov.style.display = "none"; }, 260);
    }, 340);
  }

  window.enterDistrictMap = function(districtId) {
    const d = districtId === CENTRAL_HUB.id ? CENTRAL_HUB : (DISTRICTS.find(x => x.id === districtId) || CENTRAL_HUB);
    showMapTransitionCover(d.isMainMap ? "🏛️ Menuju Pusat Kota Bandung..." : `${d.icon} Memasuki Kec. ${d.name}...`);
    activeMapId = d.id;
    window.pirakuActiveMapId = d.id;
    window.pirakuInDistrict = !d.isMainMap; // dibaca main.js buat batas gerak
    if (typeof window.updateBottomDockByMode === "function") window.updateBottomDockByMode();

    if (typeof window.switchMultiplayerMapRoom === "function") {
      window.switchMultiplayerMapRoom(d.id);
    }

    if (d.isMainMap) {
      restoreMainGedungSateMap();
    } else {
      buildDedicatedDistrictScene(d);
    }

    if (typeof window.resetPirakuColliders === "function") window.resetPirakuColliders(); // collider peta lama jangan kebawa
    updateMapIndicatorHUD(d);
    updateKomplekMinimap(d);
    showDistrictBanner(d);

    const modal = document.getElementById("piraku-districts-modal");
    if (modal) modal.style.display = "none";
  };

  window.autoSpawnRegisteredDistrict = function(force) {
    const prof = getCitizenProfile();
    if (!prof.isRegistered || !prof.district) return;
    if (prof.district.id && prof.district.id !== "bandung_wetan" && (force || activeMapId === "bandung_wetan")) {
      window.enterDistrictMap(prof.district.id);
    }
  };
  setTimeout(() => {
    if (!window._pirakuDidInitialDistrictSpawn && localStorage.getItem("piraku_my_ig")) {
      window._pirakuDidInitialDistrictSpawn = true;
      window.autoSpawnRegisteredDistrict(false);
    }
  }, 300);

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
      const bStats = getRealDistrictHouseStats(d);
      titleEl.textContent = `${d.icon} KOMPLEK KEC. ${d.name.toUpperCase()} • LV.${cur.lv}`;
      subEl.textContent = `${cur.title} (${bStats.builtHouses}/20 Rumah)`;
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

  
  const pirakuKnockback = { active: false, vx: 0, vy: 0, vz: 0, spinX: 0, spinZ: 0, cooldownUntil: 0 };
  function triggerCarKnockback(player, carMesh, nowMs) {
    if (!player || !player.position || !carMesh || !carMesh.position) return;
    if (nowMs < pirakuKnockback.cooldownUntil) return;
    const dx = player.position.x - carMesh.position.x;
    const dz = player.position.z - carMesh.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 1.45 || player.position.y > 1.6) return;

    const nx = dist > 0.01 ? dx / dist : Math.sin(carMesh.rotation.y || 0);
    const nz = dist > 0.01 ? dz / dist : Math.cos(carMesh.rotation.y || 0);
    player.position.x = carMesh.position.x + nx * 1.55;
    player.position.z = carMesh.position.z + nz * 1.55;

    const fwdX = Math.sin(carMesh.rotation.y || 0);
    const fwdZ = Math.cos(carMesh.rotation.y || 0);
    const launchX = fwdX * 0.75 + nx * 0.65;
    const launchZ = fwdZ * 0.75 + nz * 0.65;
    const lLen = Math.hypot(launchX, launchZ) || 1;

    pirakuKnockback.active = true;
    pirakuKnockback.vx = (launchX / lLen) * 9.5;
    pirakuKnockback.vz = (launchZ / lLen) * 9.5;
    pirakuKnockback.vy = 8.4;
    pirakuKnockback.spinX = (Math.random() > 0.5 ? 1 : -1) * 11;
    pirakuKnockback.spinZ = (Math.random() > 0.5 ? 1 : -1) * 9;
    pirakuKnockback.cooldownUntil = nowMs + 1100;

    try { if (typeof playAngkotHorn === "function") playAngkotHorn(); } catch (e) {}
    try { playAngkotHornSfx(); } catch (e) {}
    try { if (typeof window.recordPirakuAngkotHit === "function") window.recordPirakuAngkotHit(); } catch (e) {}
  }

  window.walkToMyDistrictKavling = function() {
    const prof = getCitizenProfile();
    if (!prof.isRegistered) {
      if (typeof window.openAuthModal === "function") window.openAuthModal("signup");
      return;
    }
    if (activeMapId !== prof.district.id) {
      window.enterDistrictMap(prof.district.id);
    }
    setTimeout(() => {
      const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
      if (mesh && mesh.position && myDistrictKavlingInfo) {
        mesh.position.set(myDistrictKavlingInfo.x, 0, myDistrictKavlingInfo.z);
        if (mesh.userData && mesh.userData.a && mesh.userData.a.c) {
          mesh.userData.a.c.x = myDistrictKavlingInfo.x;
          mesh.userData.a.c.z = myDistrictKavlingInfo.z;
        }
        if (typeof window.showToast === "function") {
          window.showToast("📍 Tiba di depan Kavling milikmu di Kec. " + prof.district.name + "!");
        }
      }
    }, 180);
  };

  window.upgradeMyPersonalHouse = async function() {
    const prof = getCitizenProfile();
    if (!prof.isRegistered) return;
    const clean = String(prof.ig || "").trim().toLowerCase().replace(/^@/, "");
    const curTier = getPersonalHouseTierFor(clean);
    if (curTier >= 4) {
      if (typeof window.showToast === "function") window.showToast("👑 Rumahmu sudah mencapai level tertinggi (Villa Sultan Lv.4)!");
      return;
    }
    const nextInfo = HOUSE_TIER_INFO.find(h => h.tier === curTier + 1);
    if (!nextInfo) return;
    const myLvl = parseInt(localStorage.getItem("piraku_my_level") || "1", 10);
    if (myLvl < (nextInfo.minLvl || 1)) {
      if (typeof window.showToast === "function") {
        window.showToast("🔒 Butuh minimal Level " + nextInfo.minLvl + " untuk upgrade ke " + nextInfo.name + " (Levelmu: Lv." + myLvl + ")!");
      }
      return;
    }
    if (!window.PirakuEconomy || typeof window.PirakuEconomy.spendCoins !== "function") return;
    if (!window.PirakuEconomy.spendCoins(nextInfo.cost, "Upgrade " + nextInfo.name)) return;

    localStorage.setItem("piraku_house_tier_" + clean, String(nextInfo.tier));
    if (window.PirakuEconomy && typeof window.PirakuEconomy.getState === "function") {
      const ecoState = window.PirakuEconomy.getState();
      if (Array.isArray(ecoState.owned)) {
        const tag = "house_tier_" + nextInfo.tier;
        if (!ecoState.owned.includes(tag)) ecoState.owned.push(tag);
        if (typeof window.PirakuEconomy.saveNow === "function") {
          window.PirakuEconomy.saveNow();
        } else if (typeof window.syncPirakuWalletToSupabase === "function") {
          window.syncPirakuWalletToSupabase(ecoState);
        }
      }
    }
    if (typeof window.playSynthTone === "function") {
      window.playSynthTone(784, "triangle", 0.22);
      setTimeout(() => window.playSynthTone(1046, "triangle", 0.35), 140);
    }
    if (typeof window.grantPirakuXP === "function") {
      await window.grantPirakuXP(60, "Upgrade Rumah ke Lv." + nextInfo.tier + " (" + nextInfo.name + ")");
    }
    if (typeof window.showToast === "function") {
      window.showToast("🏡 UPGRADE BERHASIL! Rumahmu kini Lv." + nextInfo.tier + ": " + nextInfo.name + " ✨");
    }
    if (! CENTRAL_HUB || activeMapId !== CENTRAL_HUB.id) {
      const curD = DISTRICTS.find(x => x.id === activeMapId);
      if (curD) buildDedicatedDistrictScene(curD);
    }
  };

  window.buyVendorCuankiBoost = async function() {
    if (!window.PirakuEconomy || typeof window.PirakuEconomy.spendCoins !== "function") return;
    if (!window.PirakuEconomy.spendCoins(10, "Jajan Cuanki Mang Bandung")) return;
    playBaksoBowlClinkSfx();
    window.pirakuSpeedBoostUntil = Date.now() + 35000;
    const dNow = new Date();
    const today = typeof window.getPirakuLocalDateKey === "function"
      ? window.getPirakuLocalDateKey()
      : `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, "0")}-${String(dNow.getDate()).padStart(2, "0")}`;
    const clean = String(localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase().replace(/^@/, "");
    const suf = clean ? ("_" + clean) : "_guest";
    localStorage.setItem("piraku_did_cuanki_" + today + suf, "1");

    if (typeof window.showToast === "function") {
      window.showToast("🍜 Sruput Cuanki Panas (-10 🪙)! Lari +55% Lebih Ngebut selama 35 Detik! ⚡");
    }
  };

  function updateCarKnockbackPhysics(player, dt) {
    if (!pirakuKnockback.active || !player || !player.position) return;
    player.position.x = Math.max(-52, Math.min(52, player.position.x + pirakuKnockback.vx * dt));
    player.position.z = Math.max(-52, Math.min(52, player.position.z + pirakuKnockback.vz * dt));
    player.position.y += pirakuKnockback.vy * dt;
    pirakuKnockback.vy -= 24.0 * dt;
    player.rotation.x += pirakuKnockback.spinX * dt;
    player.rotation.z += pirakuKnockback.spinZ * dt;

    if (player.userData && player.userData.a && player.userData.a.c) {
      player.userData.a.c.x = player.position.x;
      player.userData.a.c.z = player.position.z;
    }

    if (player.position.y <= 0) {
      player.position.y = 0;
      player.rotation.x = 0;
      player.rotation.z = 0;
      pirakuKnockback.active = false;
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
          if (window.PirakuEconomy) window.PirakuEconomy.addCoins(1, "Eksplorasi Komplek");
        }
      }
    }
        const dt = 0.016;
    const nowSec = performance.now() * 0.001;

    const activePlayer = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    const pPos = activePlayer && activePlayer.position ? activePlayer.position : null;
    const nowMs = performance.now();
    if (customDistrictGroup && activePlayer) updateCarKnockbackPhysics(activePlayer, dt);

    // Update lalu lintas Angkot Bandung & Mobil Warga (anti-deadlock bundaran + prioritas lajur + respawn cepat)
    districtTraffic.forEach((v, idx) => {
      if (!v.mesh) return;
      if (customDistrictGroup && activePlayer) triggerCarKnockback(activePlayer, v.mesh, nowMs);
      const R = 10.0;
      const ENTRY_R = 11.4;
      const SPAWN_DIST = 58;
      const ARM_DEFS = [
        { axis: "z", dir: 1, laneX: 1.8, entryAng: -1.39 },
        { axis: "x", dir: 1, laneZ: -1.8, entryAng: 2.96 },
        { axis: "z", dir: -1, laneX: -1.8, entryAng: 1.75 },
        { axis: "x", dir: -1, laneZ: 1.8, entryAng: -0.18 }
      ];
      const EXIT_ARMS = [
        { axis: "z", dir: 1, laneX: 1.8 },
        { axis: "x", dir: 1, laneZ: 1.8 },
        { axis: "z", dir: -1, laneX: -1.8 },
        { axis: "x", dir: -1, laneZ: -1.8 }
      ];

      // Anti-tabrakan berbasis lajur & state (bebas deadlock di bundaran maupun antar lajur berlawanan)
      let speedFactor = 1.0;
      const curArm = ARM_DEFS[v.armIdx];
      for (let j = 0; j < districtTraffic.length; j++) {
        if (j === idx || !districtTraffic[j].mesh) continue;
        const otherVeh = districtTraffic[j];
        const other = otherVeh.mesh.position;
        const dx = other.x - v.mesh.position.x;
        const dz = other.z - v.mesh.position.z;
        const distOther = Math.hypot(dx, dz);

        if (v.state === "approach") {
          // 1) Antre rapi di lajur masuk yang sama jika ada mobil di depan (lebih dekat ke bundaran)
          if (otherVeh.state === "approach" && otherVeh.armIdx === v.armIdx) {
            const aheadGap = (otherVeh.dist - v.dist) * curArm.dir;
            if (aheadGap > 0.05 && aheadGap < 5.6 && Math.abs(otherVeh.dist) < Math.abs(v.dist)) {
              speedFactor = 0;
              break;
            }
          }
          // 2) Yield di bibir bundaran (11.4m..14.8m) hanya terhadap mobil di dalam bundaran yang sedang mendekati pintu masuk ini
          const absDist = Math.abs(v.dist);
          if (absDist > ENTRY_R && absDist <= ENTRY_R + 3.4 && otherVeh.state === "circle" && distOther < 6.4) {
            const otherFwdX = Math.sin(otherVeh.mesh.rotation.y);
            const otherFwdZ = Math.cos(otherVeh.mesh.rotation.y);
            const towardEntry = (-dx * otherFwdX + -dz * otherFwdZ);
            if (towardEntry > -0.6) {
              speedFactor = 0;
              break;
            }
          }
        } else if (v.state === "circle") {
          // Kendaraan di dalam bundaran punya hak utama (tidak pernah berhenti untuk approach/exit).
          // Hanya jaga jarak dengan kendaraan lain di dalam bundaran yang sudah lebih dulu berputar (strict order -> bebas deadlock).
          if (otherVeh.state === "circle") {
            const angAhead = ((v.circleAng - otherVeh.circleAng) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            const hasPriority = otherVeh.traveledAng > v.traveledAng || (otherVeh.traveledAng === v.traveledAng && j < idx);
            if (hasPriority && angAhead > 0.02 && angAhead < 0.42) {
              speedFactor = angAhead < 0.28 ? 0 : Math.min(speedFactor, 0.35);
              if (speedFactor === 0) break;
            }
          }
        } else if (v.state === "exit" && v.exitArm) {
          // Kendaraan keluar bundaran hanya jaga jarak dengan kendaraan di lajur keluar yang sama di depannya
          if (
            otherVeh.state === "exit" &&
            otherVeh.exitArm &&
            otherVeh.exitArm.axis === v.exitArm.axis &&
            otherVeh.exitArm.dir === v.exitArm.dir
          ) {
            const aheadGap = (otherVeh.dist - v.dist) * v.exitArm.dir;
            if (aheadGap > 0.05 && aheadGap < 5.4 && Math.abs(otherVeh.dist) > Math.abs(v.dist)) {
              speedFactor = 0;
              break;
            }
          }
        }
      }
      const effSpeed = v.speed * speedFactor;

      if (v.state === "approach") {
        const arm = ARM_DEFS[v.armIdx];
        v.dist += arm.dir * effSpeed * dt;
        if (arm.axis === "z") {
          v.mesh.position.set(arm.laneX, 0.02, v.dist);
          v.mesh.rotation.y = arm.dir > 0 ? 0 : Math.PI;
        } else {
          v.mesh.position.set(v.dist, 0.02, arm.laneZ);
          v.mesh.rotation.y = arm.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
        if ((arm.dir > 0 && v.dist >= -ENTRY_R) || (arm.dir < 0 && v.dist <= ENTRY_R)) {
          v.state = "circle";
          v.circleAng = arm.entryAng;
          v.traveledAng = 0;
          v.targetAngSpan = v.turnSteps * (Math.PI / 2) - 0.34;
          const exitMap = [
            [3, 0, 1],
            [0, 1, 2],
            [1, 2, 3],
            [2, 3, 0]
          ];
          const chosenExitIdx = exitMap[v.armIdx][(v.turnSteps - 1) % 3];
          v.exitArm = EXIT_ARMS[chosenExitIdx];
        }
      } else if (v.state === "circle") {
        const angStep = (effSpeed / R) * dt;
        v.circleAng -= angStep;
        v.traveledAng += angStep;
        v.mesh.position.set(Math.cos(v.circleAng) * R, 0.02, Math.sin(v.circleAng) * R);
        v.mesh.rotation.y = Math.atan2(Math.sin(v.circleAng), -Math.cos(v.circleAng));

        if (v.traveledAng >= v.targetAngSpan) {
          v.state = "exit";
          v.dist = v.exitArm.dir > 0 ? ENTRY_R : -ENTRY_R;
        }
      } else if (v.state === "exit") {
        const ex = v.exitArm;
        v.dist += ex.dir * effSpeed * dt;
        if (ex.axis === "z") {
          v.mesh.position.set(ex.laneX, 0.02, v.dist);
          v.mesh.rotation.y = ex.dir > 0 ? 0 : Math.PI;
        } else {
          v.mesh.position.set(v.dist, 0.02, ex.laneZ);
          v.mesh.rotation.y = ex.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
        // Respawn begitu keluar batas komplek (58m) ke ruas jalan yang senggang
        if (Math.abs(v.dist) > SPAWN_DIST) {
          const baseTry = (v.armIdx + 1 + Math.floor(Math.random() * 3)) % 4;
          for (let attempt = 0; attempt < 4; attempt++) {
            const candIdx = (baseTry + attempt) % 4;
            const candArm = ARM_DEFS[candIdx];
            const candDist = candArm.dir > 0 ? -SPAWN_DIST : SPAWN_DIST;
            const sx = candArm.axis === "z" ? candArm.laneX : candDist;
            const sz = candArm.axis === "z" ? candDist : candArm.laneZ;
            const tooClose = districtTraffic.some(
              (o, oi) => oi !== idx && o.mesh && Math.hypot(o.mesh.position.x - sx, o.mesh.position.z - sz) < 9.5
            );
            if (!tooClose) {
              v.armIdx = candIdx;
              v.turnSteps = 1 + Math.floor(Math.random() * 3);
              v.dist = candDist;
              v.state = "approach";
              break;
            }
          }
        }
      } else if (v.mode === "laneEW") {
        if (!v.inCircle) {
          v.pos += v.dir * v.speed * dt;
          if (v.pos > 52) v.pos = -52;
          if (v.pos < -52) v.pos = 52;
          if ((v.dir > 0 && v.pos >= -entryDist && v.pos < -entryDist + 1.2) ||
              (v.dir < 0 && v.pos <= entryDist && v.pos > entryDist - 1.2)) {
            v.inCircle = true;
            v.circleStartAngle = v.dir > 0 ? Math.PI + 0.18 : 0.18;
            v.circleProgress = 0;
          } else {
            const zLane = v.dir > 0 ? -1.8 : 1.8;
            v.mesh.position.set(v.pos, 0.02, zLane);
            v.mesh.rotation.y = v.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
          }
        }
        if (v.inCircle) {
          const angSpeed = v.speed / R;
          v.circleProgress += angSpeed * dt;
          const curAng = v.circleStartAngle - v.circleProgress;
          v.mesh.position.set(Math.cos(curAng) * R, 0.02, Math.sin(curAng) * R);
          v.mesh.rotation.y = Math.atan2(Math.sin(curAng), -Math.cos(curAng));
          if (v.circleProgress >= Math.PI - 0.36) {
            v.inCircle = false;
            v.pos = v.dir > 0 ? entryDist + 0.3 : -entryDist - 0.3;
          }
        }
      }

      const _curPPos = (mesh && mesh.position) ? mesh.position : null;
      if (_curPPos && (!v.lastHorn || nowMs - v.lastHorn > 6500)) {
        const dVeh = Math.hypot(_curPPos.x - v.mesh.position.x, _curPPos.z - v.mesh.position.z);
        if (dVeh < 14.0) {
          v.lastHorn = nowMs;
          playAngkotHornSfx();
        }
      }
    });

    // Update langkah NPC Trotoar & Tukang Dagang Keliling
    districtPedestrians.forEach(p => {
      if (!p.mesh) return;
      p.pos += p.dir * p.speed * dt;
      const limit = p.isVendor ? 31 : 44;
      if (p.pos > limit) { p.pos = limit; p.dir = -1; }
      if (p.pos < -limit) { p.pos = -limit; p.dir = 1; }
      // Lompati persimpangan tengah (-10..10) untuk pejalan kaki poros utama
      if (!p.isVendor && Math.abs(p.pos) < 10.2) {
        p.pos = p.dir > 0 ? 10.3 : -10.3;
      }

      const groundY = p.isVendor ? 0.02 : 0.09;
      if (p.axis === "z") {
        p.mesh.position.set(p.fixed, groundY, p.pos);
        p.mesh.rotation.y = p.dir > 0 ? 0 : Math.PI;
      } else {
        p.mesh.position.set(p.pos, groundY, p.fixed);
        p.mesh.rotation.y = p.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      }

      const limbs = p.mesh.userData.limbs;
      if (limbs) {
        const swing = Math.sin(nowSec * (p.isVendor ? 6.5 : 9.0) + p.phase) * 0.55;
        limbs.legL.rotation.x = swing;
        limbs.legR.rotation.x = -swing;
        if (!p.isVendor) {
          limbs.armL.rotation.x = -swing * 0.85;
          limbs.armR.rotation.x = swing * 0.85;
        } else {
          limbs.armL.rotation.x = -0.55;
          limbs.armR.rotation.x = -0.55;
        }
      }

      const _curVPos = (mesh && mesh.position) ? mesh.position : null;
      if (p.isVendor && _curVPos && (!p.lastClink || nowMs - p.lastClink > 5200)) {
        const dCart = Math.hypot(_curVPos.x - p.mesh.position.x, _curVPos.z - p.mesh.position.z);
        if (dCart < 12.0) {
          p.lastClink = nowMs;
          playBaksoBowlClinkSfx();
        }
      }
    });
    // Animasi Beacon Penanda Kavling Milik Sendiri
    if (myKavlingBeaconGroup && myKavlingBeaconGroup.userData) {
      const { gemMesh, ringMesh } = myKavlingBeaconGroup.userData;
      if (gemMesh) {
        gemMesh.rotation.y += 0.045;
        gemMesh.position.y = 2.35 + Math.sin(nowSec * 3.2) * 0.25;
      }
      if (ringMesh) {
        const s = 1 + Math.sin(nowSec * 3.5) * 0.1;
        ringMesh.scale.set(s, s, 1);
      }
    }

    // Nyalakan Lampu PJU & Bundaran Komplek secara otomatis saat Senja / Malam
    if (customDistrictGroup && districtLampState) {
      const timeBtn = document.getElementById("side-time-btn");
      const btnTxt = timeBtn ? (timeBtn.textContent || "") : "";
      const isNight = /Malam/i.test(btnTxt);
      const isDusk = /Senja|Sore/i.test(btnTxt);
      const nightLevel = isNight ? 1.0 : isDusk ? 0.65 : 0.0;
      if (districtLampState.bulbMat) {
        districtLampState.bulbMat.color.setHex(nightLevel > 0.1 ? 0xfef08a : 0xe2e8f0);
      }
      if (districtLampState.haloMat) {
        districtLampState.haloMat.opacity = nightLevel > 0.1 ? 0.35 * nightLevel : 0.0;
      }
      if (districtLampState.poolMat) {
        districtLampState.poolMat.opacity = nightLevel > 0.1 ? 0.24 * nightLevel : 0.0;
      }
      if (Array.isArray(districtLampState.pointLights)) {
        districtLampState.pointLights.forEach(pt => { pt.intensity = nightLevel * 1.45; });
      }
      if (districtHouseGlassMat) {
        districtHouseGlassMat.emissiveIntensity = nightLevel * 1.4;
      }
    }

    updateDistrictWorldActionPrompt(pPos, nowMs);
    checkAndGrantLevelUpRewards();
    drawKomplekMinimapFrame();
    requestAnimationFrame(tickDistrictLoop);
  }

  let lastActionHtmlSig = "";
  function updateDistrictWorldActionPrompt(pPos, nowMs) {
    let bar = document.getElementById("piraku-3d-action-bar");
    if (!bar && document.body) {
      bar = document.createElement("div");
      bar.id = "piraku-3d-action-bar";
      bar.style.cssText = "position:fixed;bottom:148px;left:50%;transform:translateX(-50%);z-index:45;display:none;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px;padding:7px 11px;border-radius:16px;background:rgba(15,23,42,0.92);backdrop-filter:blur(10px);border:1.5px solid rgba(56,189,248,0.65);color:#f8fafc;font-size:11.5px;font-weight:800;box-shadow:0 12px 28px rgba(0,0,0,0.55);max-width:min(360px, calc(100vw - 24px));box-sizing:border-box;text-align:center;";
      document.body.appendChild(bar);
    }
    if (!bar) return;

    if (!customDistrictGroup || !pPos || activeMapId === CENTRAL_HUB.id) {
      if (bar.style.display !== "none") bar.style.display = "none";
      return;
    }

    let html = "";

    // 1. Cek jarak ke Kavling Milik Sendiri (khusus 20 kavling tapak: 1 Camat + 19 Warga Pertama)
    if (myDistrictKavlingInfo) {
      const dKav = Math.hypot(pPos.x - myDistrictKavlingInfo.x, pPos.z - myDistrictKavlingInfo.z);
      if (dKav < 5.2) {
        const clean = String(localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase().replace(/^@/, "");
        const suf = clean ? ("_" + clean) : "_guest";
        const hasH = localStorage.getItem("piraku_has_house" + suf) === "1" || myDistrictKavlingInfo.hasHouse;
        if (hasH) {
          window.pirakuDistrictHasHouse = true;
          if (localStorage.getItem("piraku_has_house" + suf) !== "1") localStorage.setItem("piraku_has_house" + suf, "1");
        }
        const keys = hasH ? 3 : Math.min(3, parseInt(localStorage.getItem("piraku_house_keys" + suf) || "0", 10));
        if (!hasH) {
          if (keys >= 3) {
            html = `<span>📍 Kavlingmu Siap Dibangun!</span>` +
                   `<button onclick="buildMyInstantHouse()" style="border:none;background:linear-gradient(135deg,#facc15,#f59e0b);color:#0f172a;padding:6px 11px;border-radius:10px;font-weight:900;font-size:11px;cursor:pointer;">🏠 Dirikan Rumah 3D (3/3 🔑)</button>`;
          } else {
            html = `<span>📍 Tanah Kavlingmu (${keys}/3 🔑)</span>` +
                   `<button onclick="openMissionsHubModal()" style="border:none;background:#38bdf8;color:#0f172a;padding:6px 10px;border-radius:10px;font-weight:800;font-size:11px;cursor:pointer;">🎯 Cari ${3 - keys} Kunci Lagi</button>`;
          }
        } else {
          const curT = getPersonalHouseTierFor(clean);
          if (curT < 4) {
            const nextT = HOUSE_TIER_INFO.find(h => h.tier === curT + 1);
            html = `<span>🏠 Rumahmu Lv.${curT}</span>` +
                   `<button onclick="upgradeMyPersonalHouse()" style="border:none;background:linear-gradient(135deg,#22c55e,#10b981);color:#052e16;padding:6px 10px;border-radius:10px;font-weight:900;font-size:11px;cursor:pointer;">✨ Upgrade Lv.${nextT.tier} (🪙 ${nextT.cost} • Min Lv.${nextT.minLvl})</button>`;
          } else {
            html = `<span style="color:#fde047;">👑 Villa Sultan Lv.4 Milikmu • Level Maksimal!</span>`;
          }
        }
      }
    }

    // 2. Cek jarak ke Gerobak Tukang Cuanki/Bandrek Keliling
    if (!html) {
      for (let i = 0; i < districtPedestrians.length; i++) {
        const p = districtPedestrians[i];
        if (!p.isVendor || !p.mesh) continue;
        const dVen = Math.hypot(pPos.x - p.mesh.position.x, pPos.z - p.mesh.position.z);
        if (dVen < 4.2) {
          const boostRem = (window.pirakuSpeedBoostUntil && Date.now() < window.pirakuSpeedBoostUntil)
            ? Math.ceil((window.pirakuSpeedBoostUntil - Date.now()) / 1000)
            : 0;
          html = `<span>🍜 Mang Cuanki</span>` +
                 `<button onclick="buyVendorCuankiBoost()" style="border:none;background:linear-gradient(135deg,#f97316,#eab308);color:#0f172a;padding:6px 10px;border-radius:10px;font-weight:900;font-size:11px;cursor:pointer;white-space:nowrap;">${boostRem > 0 ? `⚡ Ngebut (${boostRem}d)` : "🍲 Beli (🪙 10 • 35d)"}</button>`;
          break;
        }
      }
    }

    // 3. Cek jarak ke Minimarket Piraku Mart 24J (34, 0, -10.5 -> depan pintu z = -7.3)
    if (!html) {
      const dMart = Math.hypot(pPos.x - 34, pPos.z - (-7.3));
      if (dMart < 5.0) {
        html = `<span>🏪 Piraku Mart 24J</span>` +
               `<button onclick="openPirakuMartModal()" style="border:none;background:linear-gradient(135deg,#38bdf8,#0284c7);color:#f8fafc;padding:6px 11px;border-radius:10px;font-weight:900;font-size:11px;cursor:pointer;white-space:nowrap;">🛒 Beli Cemilan</button>`;
      }
    }

    if (!html) {
      if (bar.style.display !== "none") bar.style.display = "none";
      lastActionHtmlSig = "";
      return;
    }

    bar.style.display = "flex";
    if (html !== lastActionHtmlSig) {
      lastActionHtmlSig = html;
      bar.innerHTML = html;
    }
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
    syncDistrictsFromSupabase().then(() => {
      if (modal.style.display === "flex") renderDistrictsModal();
    });
  };

  function renderDistrictsModal() {
    const modal = document.getElementById("piraku-districts-modal");
    if (!modal) return;
    const zones = ["Semua", "Tengah", "Utara", "Timur", "Selatan", "Barat"];
    const profile = getCitizenProfile();
    const myD = profile.district;
    const myCoins = getCoinsFor(myD);
    const myLv = getLevelInfo(myCoins);
    const myStats = getRealDistrictHouseStats(myD);

    const ranked = [...DISTRICTS].sort((a, b) => getCoinsFor(b) - getCoinsFor(a));
    const filtered = filterZone === "Semua" ? ranked : ranked.filter(d => d.zone === filterZone);

    const domisiliCardHtml = profile.isRegistered ? `
      <div style="padding:12px;border-radius:16px;background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.4);margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:10.5px;font-weight:800;color:#fde047;">🪪 DOMISILI KTP (${profile.ig})</span>
          <span style="background:#0f172a;color:#4ade80;border:1px solid rgba(74,222,128,0.45);border-radius:999px;padding:2px 8px;font-size:10px;font-weight:800;">✓ Terdaftar</span>
        </div>
        <div style="font-size:15px;font-weight:800;">${myD.icon} Kec. ${myD.name} • <span style="color:#4ade80;">Lv.${myLv.cur.lv} (${myStats.builtHouses}/20 Rumah)</span></div>
        <div style="font-size:11px;color:#cbd5e1;margin:3px 0 8px;">🏘️ ${myLv.cur.title} • Dana: <b style="color:#fde047;">🪙 ${myCoins.toLocaleString("id-ID")}</b></div>
        <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:6px;">
          <button data-enter="${myD.id}" style="padding:8px 6px;border-radius:9px;border:none;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#fff;font-size:11px;font-weight:800;cursor:pointer;">🏘️ Masuk Komplek</button>
          <button data-invest="${myD.id}" data-amt="10" style="padding:8px 4px;border-radius:9px;border:none;background:#16a34a;color:#fff;font-size:11px;font-weight:800;cursor:pointer;">+🪙 10 Bangun</button>
          <button data-invest="${myD.id}" data-amt="35" style="padding:8px 4px;border-radius:9px;border:none;background:#f59e0b;color:#0f172a;font-size:11px;font-weight:800;cursor:pointer;">+🪙 35 Maju</button>
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
            const dStats = getRealDistrictHouseStats(d);
            const isCurrentMap = activeMapId === d.id;
            const isOwnDistrict = profile.isRegistered && profile.district.id === d.id;
            const investBtnHtml = isOwnDistrict
              ? `<button data-invest="${d.id}" data-amt="10" style="padding:6px 8px;border-radius:8px;border:none;background:#f59e0b;color:#0f172a;font-size:10.5px;font-weight:800;cursor:pointer;">+10</button>`
              : `<button disabled title="${profile.isRegistered ? "Hanya warga ber-KTP " + d.name + " yang bisa membangun" : "Daftar KTP untuk menyumbang"}" style="padding:6px 8px;border-radius:8px;border:none;background:#334155;color:#64748b;font-size:10px;font-weight:800;cursor:not-allowed;">🔒 ${profile.isRegistered ? "KTP Lain" : "Tamu"}</button>`;
            return `
              <div style="padding:10px 12px;border-radius:14px;background:#1e293b;border:1px solid ${isCurrentMap ? "#38bdf8" : "rgba(148,163,184,0.2)"};display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div>
                  <div style="font-size:13px;font-weight:800;color:#f8fafc;">#${rankIdx} ${d.icon} ${d.name} <span style="font-size:10px;padding:1px 6px;border-radius:999px;background:rgba(56,189,248,0.16);color:#38bdf8;">Lv.${lvInfo.cur.lv} • ${dStats.builtHouses}/20</span></div>
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
        const amt = Number(b.dataset.amt || 10);
        if (!d || !window.PirakuEconomy) return;
        if (!window.PirakuEconomy.spendCoins(amt, "Bangun Komplek " + d.name)) return;
        const nextVal = getCoinsFor(d) + amt;
        localInvest[d.id] = nextVal;
        saveLocal();
        pushDistrictToSupabase(d, nextVal, amt);
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

  const PIRAKU_MART_SNACKS = [
    { id: "cireng", icon: "🥟", name: "Cireng Bumbu Rujak", cost: 10, boostSec: 30, desc: "Ngebut +30 detik!" },
    { id: "seblak", icon: "🍜", name: "Seblak Cup Pedas", cost: 15, boostSec: 45, desc: "Ngebut +45 detik!" },
    { id: "kopi",   icon: "🧋", name: "Es Kopi Susu Braga", cost: 12, boostSec: 40, desc: "Segar & ngebut 40 detik!" },
    { id: "surabi", icon: "🥞", name: "Surabi Oncom Hangat", cost: 8,  boostSec: 20, desc: "Cemilan hemat +20 detik!" }
  ];

  window.openPirakuMartModal = function() {
    let modal = document.getElementById("piraku-mart-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "piraku-mart-modal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.75);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;";
      modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
      modal.innerHTML = `
        <div style="background:#0f172a;border:1.5px solid rgba(56,189,248,0.45);border-radius:18px;width:100%;max-width:390px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.65);color:#f8fafc;">
          <div style="padding:14px 16px;background:linear-gradient(135deg,#0284c7,#1d4ed8);display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:900;font-size:15px;">🏪 Piraku Mart 24J</div>
              <div style="font-size:11px;color:#e0f2fe;">Jajan cemilan khas Bandung pakai Koin!</div>
            </div>
            <button onclick="document.getElementById('piraku-mart-modal').style.display='none'" style="border:none;background:rgba(15,23,42,0.45);color:#f8fafc;width:30px;height:30px;border-radius:999px;cursor:pointer;font-weight:800;">✕</button>
          </div>
          <div id="piraku-mart-items" style="padding:12px 14px;display:flex;flex-direction:column;gap:8px;"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    const list = document.getElementById("piraku-mart-items");
    if (list) {
      list.innerHTML = PIRAKU_MART_SNACKS.map(s => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(30,41,59,0.75);border:1px solid rgba(148,163,184,0.2);border-radius:12px;padding:10px 12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:22px;">${s.icon}</span>
            <div>
              <div style="font-weight:800;font-size:13px;">${s.name}</div>
              <div style="font-size:11px;color:#94a3b8;">${s.desc}</div>
            </div>
          </div>
          <button onclick="buyPirakuMartSnack('${s.id}')" style="border:none;background:linear-gradient(135deg,#facc15,#f59e0b);color:#0f172a;padding:7px 11px;border-radius:10px;font-weight:900;font-size:11.5px;cursor:pointer;white-space:nowrap;">🪙 ${s.cost}</button>
        </div>
      `).join("");
    }
    modal.style.display = "flex";
  };

  window.buyPirakuMartSnack = function(snackId) {
    const item = PIRAKU_MART_SNACKS.find(s => s.id === snackId);
    if (!item || !window.PirakuEconomy) return;
    if (!window.PirakuEconomy.spendCoins(item.cost, "Jajan " + item.name + " di Piraku Mart")) return;
    window.pirakuSpeedBoostUntil = Math.max(window.pirakuSpeedBoostUntil || 0, Date.now()) + item.boostSec * 1000;
    const modal = document.getElementById("piraku-mart-modal");
    if (modal) modal.style.display = "none";
    if (typeof window.showToast === "function") {
      window.showToast(`${item.icon} Nyam! Beli ${item.name} — lari ngebut +${item.boostSec} detik!`);
    }
  };

  setTimeout(() => {
    populateSignupKecamatan();
    updateMapIndicatorHUD(CENTRAL_HUB);
    syncDistrictsFromSupabase();
    requestAnimationFrame(tickDistrictLoop);
  }, 600);
})();
