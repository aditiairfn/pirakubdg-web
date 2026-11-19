// ================= PIRAKUBDG ECONOMY, WALLET, 10-MIN VEHICLE RENTAL & 3D SHOP =================
(function() {
  function getAccountStorageKey() {
    const rawIg = (localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase().replace(/^@/, "");
    const guestId = localStorage.getItem("piraku_guest_id") || "guest";
    return "piraku_economy_v2_" + (rawIg || guestId);
  }

  const CATALOG = {
    outfit: [
      { id: "kacamata_hitam", name: "Kacamata Hitam Dago", price: 120, icon: "🕶️", desc: "Kacamata aviator bulat bingkai emas untuk gaya di Gasibu." },
      { id: "topi_bobotoh", name: "Topi Persib Biru", price: 140, icon: "🧢", desc: "Topi baseball biru-putih khas warga Bandung." },
      { id: "iket_sunda", name: "Iket Sunda / Totopong", price: 180, icon: "🧣", desc: "Iket kepala khas Sunda dengan motif emas terpasang di kepala." },
      { id: "tas_ransel", name: "Ransel Traveller Dago", price: 210, icon: "🎒", desc: "Tas ransel petualang 3D keren terpasang di punggung." },
      { id: "helm_biker", name: "Helm Biker Pasupati", price: 260, icon: "🪖", desc: "Helm full-face visor biru siap melintas di Pasupati." },
      { id: "sayap_neon", name: "Sayap Neon Braga", price: 480, icon: "🪽", desc: "Sepasang sayap cahaya biru-emas bercahaya di punggung!" },
      { id: "aura_emas", name: "Aura Langkah Emas", price: 750, icon: "✨", desc: "Cincin cahaya emas berputar di bawah kaki karakter." }
    ],
    mobility: [
      { id: "skateboard_gasibu", name: "Skateboard Neon (Sewa 10 Menit)", price: 15, durationMin: 10, speed: 1.25, icon: "🛹", desc: "Sewa 10 menit • Meluncur santai 1.25x keliling Gasibu." },
      { id: "sepeda_kota", name: "Sepeda Boseh (Sewa 10 Menit)", price: 25, durationMin: 10, speed: 1.35, icon: "🚲", desc: "Sewa 10 menit • Kecepatan gerak 1.35x + sepeda 3D." },
      { id: "skuter_listrik", name: "Skuter Listrik (Sewa 10 Menit)", price: 45, durationMin: 10, speed: 1.65, icon: "🛴", desc: "Sewa 10 menit • Meluncur 1.65x keliling Gasibu & Monju." },
      { id: "vespa_bandung", name: "Vespa Klasik Braga (Sewa 10 Menit)", price: 70, durationMin: 10, speed: 1.92, icon: "🛵", desc: "Sewa 10 menit • Paling kencang 1.92x buat kejar Ojol & Balap Gasibu!" }
    ],
    tier: [
      { id: "tier_1", name: "Warga Baru", badge: "🌱", price: 0, desc: "Status dasar warga Piraku Bandung." },
      { id: "tier_2", name: "Wargi Aktif", badge: "⭐", price: 350, desc: "Lencana bintang di label nama + prioritas polling." },
      { id: "tier_3", name: "Sesepuh Bandung", badge: "👑", price: 1200, desc: "Mahkota emas di label nama + gelar Sesepuh." },
      { id: "tier_4", name: "Sultan Dago", badge: "💎", price: 4500, desc: "Gelar tertinggi Piraku Bandung dengan bingkai berlian." }
    ]
  };

  let activeAccountKey = getAccountStorageKey();

  function getDefaultState() {
    return {
      coins: 25,
      owned: ["tier_1"],
      equippedOutfit: null,
      equippedVehicle: null,
      rentalExpiresAt: 0,
      tier: "tier_1",
      billboardText: "WILUJENG SUMPING DI PIRAKU BANDUNG!",
      history: [{ label: "Bonus Warga Baru Piraku", delta: 25, ts: Date.now() }]
    };
  }

  function loadState() {
    activeAccountKey = getAccountStorageKey();
    try {
      const raw = localStorage.getItem(activeAccountKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.coins === "number") {
          if (!Array.isArray(parsed.owned)) parsed.owned = ["tier_1"];
          if (typeof parsed.rentalExpiresAt !== "number") parsed.rentalExpiresAt = 0;
          return parsed;
        }
      }
    } catch (e) {}
    return getDefaultState();
  }

  let state = loadState();
  let lastLocalMutationTs = 0;
  let pullVersion = 0;
  let pendingCoinDelta = 0;

  function unpackCloudTagsToLocalStorage(ownedArr) {
    const rawIg = (localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase().replace(/^@/, "");
    if (!rawIg || !Array.isArray(ownedArr)) return;
    const suf = "_" + rawIg;
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    let houseChanged = false;

    if (ownedArr.includes("has_house_built") || ownedArr.some(x => String(x).startsWith("house_tier_"))) {
      if (localStorage.getItem("piraku_has_house" + suf) !== "1") houseChanged = true;
      localStorage.setItem("piraku_has_house" + suf, "1");
      localStorage.setItem("piraku_house_keys" + suf, "3");
      window.pirakuDistrictHasHouse = true;
    } else {
      let maxK = parseInt(localStorage.getItem("piraku_house_keys" + suf) || "0", 10) || 0;
      ownedArr.forEach(tag => {
        if (String(tag).startsWith("house_keys_")) {
          const kv = parseInt(String(tag).replace("house_keys_", ""), 10) || 0;
          if (kv > maxK) maxK = kv;
        }
      });
      if (maxK > 0) localStorage.setItem("piraku_house_keys" + suf, String(Math.min(3, maxK)));
    }

    ownedArr.forEach(tag => {
      const s = String(tag || "");
      if (s.startsWith("claimed_")) {
        const mKey = s.slice("claimed_".length);
        localStorage.setItem("piraku_claimed_" + mKey + suf, "1");
        if (mKey.startsWith("angkot_") && mKey.endsWith(today)) {
          localStorage.setItem("piraku_angkot_hits_" + today + suf, "3");
        }
      }
    });

    if (houseChanged && window.pirakuInDistrict && typeof window.refreshActiveDistrictHouses === "function") {
      window.refreshActiveDistrictHouses();
    }
  }

  function saveState(skipRemote) {
    activeAccountKey = getAccountStorageKey();
    const isLoggedUser = Boolean((localStorage.getItem("piraku_my_ig") || "").trim());
    if (!skipRemote) {
      lastLocalMutationTs = Date.now();
      state.updatedAt = lastLocalMutationTs;
      // Jangan kirim state default ke Supabase sebelum hidrasi cloud selesai (mencegah reset koin ke 25 di HP baru/incognito!)
      if ((!isLoggedUser || state._hydrated) && typeof window.syncPirakuWalletToSupabase === "function") {
        window.syncPirakuWalletToSupabase(state);
      }
    }
    try { localStorage.setItem(activeAccountKey, JSON.stringify(state)); } catch (e) {}
    updateWalletHUD();
    syncPlayer3DAttachments();
  }

  async function pullAccountWalletFromCloud() {
    const myPullVer = ++pullVersion;
    const newKey = getAccountStorageKey();
    const isAccountSwitch = (newKey !== activeAccountKey);
    if (isAccountSwitch) {
      state = loadState();
      lastLocalMutationTs = 0;
      pendingCoinDelta = 0;
      updateWalletHUD();
      syncPlayer3DAttachments();
    }
    if (typeof window.hydratePirakuWalletFromSupabase === "function") {
      const cloud = await window.hydratePirakuWalletFromSupabase();
      if (myPullVer !== pullVersion || getAccountStorageKey() !== newKey || !cloud) return;
      if (cloud.status === "error" || cloud.status === "guest") return;

      if (cloud.status === "ok") {
        const localTs = Number(state.updatedAt || 0);
        const cloudTs = Number(cloud.updatedAt || 0);
        const wasHydrated = Boolean(state._hydrated);
        const preferLocalCoins = wasHydrated && !isAccountSwitch && (localTs > cloudTs && cloudTs > 0);

        if (!wasHydrated) {
          state.coins = Math.max(0, cloud.coins + pendingCoinDelta);
          pendingCoinDelta = 0;
        } else if (!preferLocalCoins) {
          state.coins = cloud.coins;
        }

        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const mergedOwned = Array.from(new Set([...(Array.isArray(state.owned) ? state.owned : []), ...(Array.isArray(cloud.owned) ? cloud.owned : [])]))
          .filter(tag => {
            const s = String(tag || "");
            if (s.startsWith("claimed_") && !s.endsWith(today)) return false;
            return true;
          });
        state.owned = mergedOwned;
        state.tier = cloud.tier || state.tier;
        state.equippedOutfit = cloud.equippedOutfit || state.equippedOutfit;
        state.equippedVehicle = cloud.equippedVehicle || state.equippedVehicle;
        state.rentalExpiresAt = cloud.rentalExpiresAt || state.rentalExpiresAt;
        state.billboardText = cloud.billboardText || state.billboardText;
        state.updatedAt = Math.max(localTs, cloudTs, Date.now());
        state._hydrated = true;
        unpackCloudTagsToLocalStorage(mergedOwned);
        saveState(preferLocalCoins ? false : true);
        const modal = document.getElementById("piraku-economy-modal");
        if (modal && modal.style.display === "flex") renderEconomyModal();
      } else if (cloud.status === "empty") {
        // Benar-benar akun baru yang belum punya baris di piraku_wallets -> aman simpan state awal
        state._hydrated = true;
        pendingCoinDelta = 0;
        saveState(false);
      }
    }
  }
  window.reloadPirakuEconomyForCurrentUser = pullAccountWalletFromCloud;

  const _coinGrantsTs = [];
  function isFounderBypass(reason) {
    const ig = (localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase().replace(/^@/, "");
    return ig === "yelclaw" && String(reason || "").includes("Admin Founder");
  }

  window.PirakuEconomy = Object.freeze({
    getCoins: () => state.coins,
    getState: () => state,
    getCatalog: () => CATALOG,
    saveNow: () => saveState(false),
    addCoins(amount, reason) {
      const val = Math.round(Number(amount) || 0);
      if (!val) return state.coins;
      if (val > 0 && !isFounderBypass(reason)) {
        if (val > 2500) {
          console.warn("[PirakuSecurity] Penambahan koin terlalu besar ditolak:", val);
          return state.coins;
        }
        const now = Date.now();
        while (_coinGrantsTs.length && now - _coinGrantsTs[0] > 3000) _coinGrantsTs.shift();
        if (_coinGrantsTs.length >= 6) {
          console.warn("[PirakuSecurity] Rate limit koin tercapai.");
          return state.coins;
        }
        _coinGrantsTs.push(now);
      }
      if (!state._hydrated && (localStorage.getItem("piraku_my_ig") || "").trim()) {
        pendingCoinDelta += val;
      }
      state.coins = Math.max(0, state.coins + val);
      state.history.unshift({ label: reason || (val > 0 ? "Hadiah Aktivitas" : "Belanja Kota"), delta: val, ts: Date.now() });
      if (state.history.length > 25) state.history.length = 25;
      saveState();
      showCoinToast((val > 0 ? "+" : "") + val + " Koin Piraku • " + (reason || ""));
      return state.coins;
    },
    spendCoins(amount, reason) {
      const cost = Math.round(Number(amount) || 0);
      if (cost <= 0) return true;
      if (state.coins < cost) {
        showCoinToast("Koin Piraku belum cukup! Main mini-game dulu yuk 🪙", true);
        return false;
      }
      this.addCoins(-cost, reason);
      return true;
    },
    getActiveRental() {
      if (!state.equippedVehicle || !state.rentalExpiresAt) return null;
      const remMs = state.rentalExpiresAt - Date.now();
      if (remMs <= 0) return null;
      const item = CATALOG.mobility.find(m => m.id === state.equippedVehicle);
      return item ? { item, remMs } : null;
    },
    getSpeedMultiplier() {
      const r = this.getActiveRental();
      return r ? r.item.speed : 1.0;
    },
    getTierObj() {
      return CATALOG.tier.find(t => t.id === state.tier) || CATALOG.tier[0];
    }
  });

  function formatRem(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const s = String(totalSec % 60).padStart(2, "0");
    return m + ":" + s;
  }

  function showCoinToast(msg, isWarn) {
    let el = document.getElementById("piraku-coin-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "piraku-coin-toast";
      el.style.cssText = "position:fixed;top:96px;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:999px;font-size:12px;font-weight:700;z-index:100001;pointer-events:none;transition:opacity .25s ease;box-shadow:0 8px 24px rgba(0,0,0,0.35);white-space:nowrap;";
      document.body.appendChild(el);
    }
    el.style.background = isWarn ? "#dc2626" : "linear-gradient(135deg,#f59e0b,#d97706)";
    el.style.color = "#ffffff";
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = "0"; }, 2600);
  }

  function triggerMegaphoneBanner(text) {
    let bar = document.getElementById("piraku-megaphone-banner");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "piraku-megaphone-banner";
      bar.style.cssText = "position:fixed;top:56px;left:50%;transform:translateX(-50%);max-width:92vw;padding:7px 16px;border-radius:999px;background:linear-gradient(90deg,#fef08a,#f59e0b);color:#1e1b4b;font-size:12px;font-weight:800;z-index:88;box-shadow:0 6px 20px rgba(245,158,11,0.45);border:1.5px solid #fff;display:flex;align-items:center;gap:6px;";
      document.body.appendChild(bar);
    }
    bar.innerHTML = "<span>📢</span><span>" + text.replace(/[<>&]/g, "") + "</span>";
    bar.style.display = "flex";
    clearTimeout(bar._t);
    bar._t = setTimeout(() => { bar.style.display = "none"; }, 18000);
  }
  window.triggerPirakuMegaphone = triggerMegaphoneBanner;

  function updateGasibuBillboard3D(text) {
    if (!text) return;
    if (typeof window.setGasibuBillboardBroadcast === "function") {
      const myIg = localStorage.getItem("piraku_my_ig") || "Warga Bandung";
      window.setGasibuBillboardBroadcast(myIg, text, false);
    }
  }

  const activeAnimatedShopGroups = new Set();
  let shopAnimStarted = false;
  function ensureShopAnimLoop() {
    if (shopAnimStarted) return;
    shopAnimStarted = true;
    function tick() {
      const t = performance.now() * 0.0025;
      activeAnimatedShopGroups.forEach(grp => {
        if (!grp.parent) {
          activeAnimatedShopGroups.delete(grp);
          return;
        }
        const outer = grp.getObjectByName("aura-outer");
        const inner = grp.getObjectByName("aura-inner");
        if (outer) outer.rotation.z = t;
        if (inner) inner.rotation.z = -t * 1.6;
        grp.children.forEach(ch => {
          if (ch.userData && ch.userData.isAuraOrb) {
            const idx = ch.userData.orbIdx || 0;
            const ang = t * 1.2 + (idx / 8) * Math.PI * 2;
            ch.position.x = Math.cos(ang) * 0.48;
            ch.position.z = Math.sin(ang) * 0.48;
            ch.position.y = 0.25 + ((t * 0.45 + idx * 0.14) % 1) * 1.15;
            ch.rotation.y = t * 2;
          }
        });
      });
      
      // Pose berkendara realistis untuk karakter sendiri maupun pemain lain yang naik Skuter / Sepeda
      if (window.pirakuScene) {
        window.pirakuScene.traverse(cg => {
          const a = cg?.userData?.a;
          if (!a || !a.body || !a.armL || !a.armR || !a.legL || !a.legR) return;
          const veh = cg.userData._activeShopVehicle;
          if (veh === "skateboard_gasibu") {
        cg.userData._wasRidingShopVeh = true;
        a.body.position.y = 0.09;
        a.body.rotation.x = 0.05;
        a.armL.rotation.z = 0.28;
        a.armR.rotation.z = -0.28;
        a.legL.position.set(-0.08, 0.45, 0.14);
        a.legR.position.set(0.08, 0.45, -0.14);
      } else if (veh === "skuter_listrik") {
            cg.userData._wasRidingShopVeh = true;
            a.body.position.y = 0.14;
            a.body.rotation.x = 0.08;
            a.armL.rotation.x = -0.88;
            a.armR.rotation.x = -0.88;
            a.armL.rotation.z = 0.08;
            a.armR.rotation.z = -0.08;
            a.legL.rotation.x = -0.20;
            a.legR.rotation.x = 0.24;
          } else if (veh === "sepeda_kota") {
            cg.userData._wasRidingShopVeh = true;
            const isMoving = Boolean(a.walk) || (typeof window.getMyActivePlayerMesh === "function" && window.getMyActivePlayerMesh() === cg && (Math.abs(window.joyX || 0) > 0.05 || Math.abs(window.joyY || 0) > 0.05));
            const pedal = isMoving ? Math.sin(t * 4.5) * 0.30 : 0;
            a.body.position.y = 0.16;
            a.body.rotation.x = 0.15;
            a.armL.rotation.x = -0.80;
            a.armR.rotation.x = -0.80;
            a.armL.rotation.z = 0.12;
            a.armR.rotation.z = -0.12;
            a.legL.rotation.x = -0.58 + pedal;
            a.legR.rotation.x = -0.58 - pedal;
          } else if (veh === "vespa_bandung") {
            cg.userData._wasRidingShopVeh = true;
            a.body.position.y = 0.22;
            a.body.rotation.x = 0.06;
            a.armL.rotation.x = -0.84;
            a.armR.rotation.x = -0.84;
            a.armL.rotation.z = 0.14;
            a.armR.rotation.z = -0.14;
            a.legL.rotation.x = -0.78;
            a.legR.rotation.x = -0.78;
          } else if (cg.userData._wasRidingShopVeh) {
            cg.userData._wasRidingShopVeh = false;
            a.body.position.y = 0;
            a.body.rotation.x = 0;
            a.armL.rotation.z = 0;
            a.armR.rotation.z = 0;
          }
        });
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  window.attachPirakuShopToCitizen = function(cg, outfitId, vehicleId) {
    if (!cg || typeof THREE === "undefined" || !cg.userData || !cg.userData.a || !cg.userData.a.head) return;
    cg.userData._activeShopVehicle = vehicleId || null;
    const headNode = cg.userData.a.head;

    // Bersihkan attachment lama di akar karakter maupun di kepala
    const oldBodyAtt = cg.getObjectByName("piraku-shop-body-att");
    if (oldBodyAtt) cg.remove(oldBodyAtt);
    const oldHeadAtt = headNode.getObjectByName("piraku-shop-head-att");
    if (oldHeadAtt) headNode.remove(oldHeadAtt);

    // A. AKSESORIS KEPALA (menempel langsung ke tulang head agar ikut gerak & proporsional)
    if (outfitId === "iket_sunda" || outfitId === "kacamata_hitam" || outfitId === "helm_biker" || outfitId === "topi_bobotoh") {
      const headGrp = new THREE.Group();
      headGrp.name = "piraku-shop-head-att";

      if (outfitId === "topi_bobotoh") {
        const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.45 });
        const trimMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
        const crown = new THREE.Mesh(
          new THREE.SphereGeometry(0.268, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
          capMat
        );
        crown.position.set(0, 0.04, -0.01);
        const brim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.25, 0.022, 20, 1, false, -0.85, 1.7),
          trimMat
        );
        brim.position.set(0, 0.055, 0.08);
        const emblem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.042, 0.042, 0.018, 14),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.2 })
        );
        emblem.rotation.x = Math.PI / 2;
        emblem.position.set(0, 0.14, 0.238);
        const topBtn = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), trimMat);
        topBtn.position.set(0, 0.305, -0.01);
        headGrp.add(crown, brim, emblem, topBtn);
      } else if (outfitId === "iket_sunda") {
        // Lilitan utama kain iket Sunda di atas dahi
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(0.252, 0.046, 12, 28),
          new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.72 })
        );
        band.rotation.x = Math.PI / 2;
        band.position.set(0, 0.115, -0.01);

        // Lis motif batik emas melingkar
        const motif = new THREE.Mesh(
          new THREE.TorusGeometry(0.258, 0.017, 10, 28),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.35, roughness: 0.4 })
        );
        motif.rotation.x = Math.PI / 2;
        motif.position.set(0, 0.125, -0.01);

        // Lipatan segitiga khas Totopong Sunda di bagian depan atas
        const frontPeak = new THREE.Mesh(
          new THREE.ConeGeometry(0.115, 0.21, 4),
          new THREE.MeshStandardMaterial({ color: 0x5c2d16, roughness: 0.65 })
        );
        frontPeak.position.set(0, 0.24, 0.08);
        frontPeak.rotation.y = Math.PI / 4;
        frontPeak.rotation.x = 0.18;

        // Simpul & dua ekor kain menjuntai di belakang kepala
        const knot = new THREE.Mesh(
          new THREE.SphereGeometry(0.068, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.55 })
        );
        knot.position.set(0, 0.11, -0.26);

        const tailL = new THREE.Mesh(
          new THREE.BoxGeometry(0.045, 0.16, 0.018),
          new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.7 })
        );
        tailL.position.set(-0.032, 0.03, -0.27);
        tailL.rotation.z = 0.22;

        const tailR = new THREE.Mesh(
          new THREE.BoxGeometry(0.045, 0.16, 0.018),
          new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.7 })
        );
        tailR.position.set(0.032, 0.03, -0.27);
        tailR.rotation.z = -0.22;

        headGrp.add(band, motif, frontPeak, knot, tailL, tailR);
      } else if (outfitId === "kacamata_hitam") {
        // Kacamata Hitam Dago bulat/aviator halus
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.18 });
        const lensMat = new THREE.MeshStandardMaterial({ color: 0x050811, metalness: 0.92, roughness: 0.06 });

        for (const sx of [-0.088, 0.088]) {
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.01, 10, 20), frameMat);
          rim.position.set(sx, -0.008, 0.244);
          const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.014, 18), lensMat);
          lens.rotation.x = Math.PI / 2;
          lens.position.set(sx, -0.008, 0.242);
          headGrp.add(rim, lens);
        }
        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.065, 8), frameMat);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.006, 0.246);

        const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.24, 8), frameMat);
        armL.rotation.x = Math.PI / 2;
        armL.position.set(-0.152, 0.002, 0.125);
        const armR = armL.clone();
        armR.position.x = 0.152;

        headGrp.add(bridge, armL, armR);
      } else if (outfitId === "helm_biker") {
        // Helm Biker Pasupati menutup rapi rambut + visor melengkung + strip balap
        const shell = new THREE.Mesh(
          new THREE.SphereGeometry(0.295, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.66),
          new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.45, roughness: 0.18 })
        );
        shell.position.set(0, 0.035, -0.01);

        const racingStripe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.30, 0.30, 0.075, 22, 1, true, -0.45, 2.5),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.5, roughness: 0.25, side: THREE.DoubleSide })
        );
        racingStripe.rotation.z = Math.PI / 2;
        racingStripe.rotation.y = Math.PI / 2;
        racingStripe.position.set(0, 0.035, -0.01);

        const visor = new THREE.Mesh(
          new THREE.CylinderGeometry(0.278, 0.278, 0.125, 22, 1, true, -0.88, 1.76),
          new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.85, roughness: 0.08, transparent: true, opacity: 0.82, side: THREE.DoubleSide })
        );
        visor.position.set(0, 0.01, 0.015);

        const chinGuard = new THREE.Mesh(
          new THREE.TorusGeometry(0.24, 0.026, 8, 20, Math.PI),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
        );
        chinGuard.rotation.x = Math.PI / 2;
        chinGuard.rotation.z = Math.PI;
        chinGuard.position.set(0, -0.10, 0.04);

        headGrp.add(shell, racingStripe, visor, chinGuard);
      }
      headNode.add(headGrp);
    }

    // A2. AKSESORIS PUNGGUNG (menempel ke tulang body agar ikut goyang & duduk)
    const bodyNode = cg.userData?.a?.body;
    if (bodyNode) {
      const oldBackAtt = bodyNode.getObjectByName("piraku-shop-back-att");
      if (oldBackAtt) bodyNode.remove(oldBackAtt);
      if (outfitId === "tas_ransel" || outfitId === "sayap_neon") {
        const backGrp = new THREE.Group();
        backGrp.name = "piraku-shop-back-att";
        if (outfitId === "tas_ransel") {
          const bagMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.6 });
          const trimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45 });
          const mainPack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.15), bagMat);
          mainPack.position.set(0, 0.56, -0.23);
          const topFlap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.15, 14, 1, false, 0, Math.PI), bagMat);
          topFlap.rotation.z = Math.PI / 2;
          topFlap.rotation.y = Math.PI / 2;
          topFlap.position.set(0, 0.72, -0.23);
          const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.05), trimMat);
          pocket.position.set(0, 0.49, -0.31);
          backGrp.add(mainPack, topFlap, pocket);
        } else if (outfitId === "sayap_neon") {
          const wingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72, side: THREE.DoubleSide });
          const edgeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
          for (const sd of [-1, 1]) {
            const wing = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.68, 4), wingMat);
            wing.position.set(sd * 0.28, 0.68, -0.24);
            wing.rotation.z = sd * -0.95;
            wing.rotation.y = sd * 0.35;
            const feather = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.46, 4), edgeMat);
            feather.position.set(sd * 0.22, 0.52, -0.22);
            feather.rotation.z = sd * -1.25;
            feather.rotation.y = sd * 0.35;
            backGrp.add(wing, feather);
          }
        }
        bodyNode.add(backGrp);
      }
    }

    // B. AURA EMAS & KENDARAAN SEWA (menempel ke akar karakter cg)
    if (outfitId === "aura_emas" || vehicleId === "skateboard_gasibu" || vehicleId === "sepeda_kota" || vehicleId === "skuter_listrik" || vehicleId === "vespa_bandung") {
      const bodyGrp = new THREE.Group();
      bodyGrp.name = "piraku-shop-body-att";

      if (outfitId === "aura_emas") {
        const outerRing = new THREE.Mesh(
          new THREE.RingGeometry(0.45, 0.62, 36),
          new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
        );
        outerRing.name = "aura-outer";
        outerRing.rotation.x = -Math.PI / 2;
        outerRing.position.y = 0.045;

        const innerRing = new THREE.Mesh(
          new THREE.RingGeometry(0.26, 0.36, 32),
          new THREE.MeshBasicMaterial({ color: 0xfef9c3, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
        );
        innerRing.name = "aura-inner";
        innerRing.rotation.x = -Math.PI / 2;
        innerRing.position.y = 0.055;

        bodyGrp.add(outerRing, innerRing);

        for (let i = 0; i < 8; i++) {
          const orb = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.048, 0),
            new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfde047 : 0xffffff })
          );
          orb.userData = { isAuraOrb: true, orbIdx: i };
          bodyGrp.add(orb);
        }
        activeAnimatedShopGroups.add(bodyGrp);
        ensureShopAnimLoop();
      }

      if (vehicleId === "skateboard_gasibu") {
        const deckMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
        const neonMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35 });
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.032, 0.56), deckMat);
        board.position.set(0, 0.08, 0);
        for (const cz of [-0.28, 0.28]) {
          const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.032, 16), deckMat);
          cap.position.set(0, 0.08, cz);
          const rimCap = new THREE.Mesh(new THREE.TorusGeometry(0.122, 0.012, 6, 16), neonMat);
          rimCap.rotation.x = Math.PI / 2;
          rimCap.position.set(0, 0.08, cz);
          bodyGrp.add(cap, rimCap);
        }
        for (const sx of [-0.12, 0.12]) {
          const strip = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.56, 8), neonMat);
          strip.rotation.x = Math.PI / 2;
          strip.position.set(sx, 0.08, 0);
          bodyGrp.add(strip);
        }
        for (const wz of [-0.24, 0.24]) {
          for (const wx of [-0.105, 0.105]) {
            const w = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.035, 14), wheelMat);
            w.rotation.z = Math.PI / 2;
            w.position.set(wx, 0.042, wz);
            bodyGrp.add(w);
          }
        }
        bodyGrp.add(board);
      } else if (vehicleId === "sepeda_kota") {
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, metalness: 0.45, roughness: 0.28 });
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.85, roughness: 0.15 });

        for (const wz of [-0.46, 0.46]) {
          const tire = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.036, 12, 24), tireMat);
          tire.rotation.y = Math.PI / 2;
          tire.position.set(0, 0.23, wz);
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.014, 8, 20), chromeMat);
          rim.rotation.y = Math.PI / 2;
          rim.position.set(0, 0.23, wz);
          const spoke1 = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.32, 0.012), chromeMat);
          spoke1.position.set(0, 0.23, wz);
          const spoke2 = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.012, 0.32), chromeMat);
          spoke2.position.set(0, 0.23, wz);
          bodyGrp.add(tire, rim, spoke1, spoke2);
        }

        const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.56, 8), frameMat);
        topTube.rotation.x = Math.PI / 2;
        topTube.position.set(0, 0.50, 0.04);

        const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.64, 8), frameMat);
        downTube.rotation.x = Math.PI / 3.1;
        downTube.position.set(0, 0.36, 0.12);

        const seatTube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.48, 8), frameMat);
        seatTube.rotation.x = -0.22;
        seatTube.position.set(0, 0.38, -0.18);

        const saddle = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.045, 0.22),
          new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 })
        );
        saddle.position.set(0, 0.62, -0.23);

        const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.64, 8), frameMat);
        fork.rotation.x = -0.24;
        fork.position.set(0, 0.53, 0.36);

        const handleBar = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.028, 0.028), chromeMat);
        handleBar.position.set(0, 0.83, 0.28);

        const basket = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.15, 0.17),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 })
        );
        basket.position.set(0, 0.68, 0.46);

        bodyGrp.add(topTube, downTube, seatTube, saddle, fork, handleBar, basket);
      } else if (vehicleId === "skuter_listrik") {
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.65, roughness: 0.22 });
        const neonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

        const deck = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.055, 0.90), bodyMat);
        deck.position.set(0, 0.13, 0);

        const underGlow = new THREE.Mesh(
          new THREE.PlaneGeometry(0.34, 0.96),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
        );
        underGlow.rotation.x = -Math.PI / 2;
        underGlow.position.set(0, 0.035, 0);

        for (const sx of [-0.13, 0.13]) {
          const strip = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.025, 0.84), neonMat);
          strip.position.set(sx, 0.13, 0);
          bodyGrp.add(strip);
        }

        for (const wz of [-0.38, 0.40]) {
          const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.075, 18), wheelMat);
          tire.rotation.z = Math.PI / 2;
          tire.position.set(0, 0.115, wz);
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 14), neonMat);
          hub.rotation.z = Math.PI / 2;
          hub.position.set(0, 0.115, wz);
          bodyGrp.add(tire, hub);
        }

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.03, 0.85, 10), bodyMat);
        stem.rotation.x = -0.16;
        stem.position.set(0, 0.54, 0.35);

        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.032, 0.032), bodyMat);
        bar.position.set(0, 0.94, 0.28);

        const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        headlight.position.set(0, 0.85, 0.33);

        bodyGrp.add(deck, underGlow, stem, bar, headlight);
      } else if (vehicleId === "vespa_bandung") {
        const vespaMat = new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.45, roughness: 0.25 }); // Mint Klasik
        const creamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 });
        const seatMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.85, roughness: 0.15 });

        for (const wz of [-0.46, 0.44]) {
          const tire = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.055, 12, 22), tireMat);
          tire.rotation.y = Math.PI / 2;
          tire.position.set(0, 0.17, wz);
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.02, 8, 18), creamMat);
          rim.rotation.y = Math.PI / 2;
          rim.position.set(0, 0.17, wz);
          bodyGrp.add(tire, rim);
        }

        // Bodi belakang membulat khas Vespa (kubah kiri-kanan + tutup belakang melengkung)
        const rearCore = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.48, 16), vespaMat);
        rearCore.rotation.x = Math.PI / 2;
        rearCore.position.set(0, 0.35, -0.26);

        for (const sx of [-0.13, 0.13]) {
          const cowl = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 12), vespaMat);
          cowl.scale.set(0.65, 0.85, 1.45);
          cowl.position.set(sx, 0.33, -0.27);
          bodyGrp.add(cowl);
        }

        const floorDeck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.46, 14), vespaMat);
        floorDeck.rotation.x = Math.PI / 2;
        floorDeck.scale.set(1.0, 1.0, 0.22);
        floorDeck.position.set(0, 0.22, 0.06);

        // Jok kulit coklat klasik melengkung
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.135, 0.42, 14), seatMat);
        seat.rotation.x = Math.PI / 2;
        seat.scale.set(1.05, 1.0, 0.45);
        seat.position.set(0, 0.54, -0.22);

        // Sayap depan melengkung + spakbor depan bulat + spion retro
        const frontShield = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.195, 0.50, 18, 1, false, -Math.PI * 0.45, Math.PI * 0.9), vespaMat);
        frontShield.rotation.x = -0.18;
        frontShield.position.set(0, 0.47, 0.23);

        const fender = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), vespaMat);
        fender.position.set(0, 0.23, 0.44);

        const steerCol = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.048, 0.22, 12), vespaMat);
        steerCol.position.set(0, 0.78, 0.29);

        const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.56, 10), chromeMat);
        handleBar.rotation.z = Math.PI / 2;
        handleBar.position.set(0, 0.86, 0.27);

        for (const mx of [-0.22, 0.22]) {
          const stemM = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 6), chromeMat);
          stemM.position.set(mx, 0.93, 0.27);
          const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.014, 12), chromeMat);
          mirror.rotation.x = Math.PI / 2;
          mirror.position.set(mx, 1.0, 0.27);
          bodyGrp.add(stemM, mirror);
        }

        const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        headlight.position.set(0, 0.87, 0.34);

        const tailLight = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        tailLight.position.set(0, 0.42, -0.53);

        bodyGrp.add(rearCore, floorDeck, seat, frontShield, fender, steerCol, handleBar, headlight, tailLight);
      }

      cg.add(bodyGrp);
    }
  };

  function syncPlayer3DAttachments() {
    window.pirakuSpeedMult = window.PirakuEconomy.getSpeedMultiplier();
    const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (!mesh || typeof THREE === "undefined") return;

    const rental = window.PirakuEconomy.getActiveRental();
    window.attachPirakuShopToCitizen(mesh, state.equippedOutfit, rental ? rental.item.id : null);
    ensureShopAnimLoop();

    updateGasibuBillboard3D(state.billboardText);
    if (typeof window.forceBroadcastMyAppearance === "function") window.forceBroadcastMyAppearance();
  }

  function injectWalletHUD() {
    if (!document.body || document.getElementById("piraku-wallet-pill")) return;
    const pill = document.createElement("button");
    pill.id = "piraku-wallet-pill";
    pill.type = "button";
    pill.style.cssText = "position:fixed;top:244px;left:16px;padding:6px 11px;border-radius:999px;background:rgba(15,23,42,0.88);backdrop-filter:blur(10px);border:1.5px solid rgba(250,204,21,0.5);color:#f8fafc;font-size:11.5px;font-weight:800;z-index:26;display:inline-flex;align-items:center;gap:6px;box-shadow:0 6px 18px rgba(0,0,0,0.38);cursor:pointer;";
    pill.onclick = () => openEconomyModal("outfit");
    document.body.appendChild(pill);
    updateWalletHUD();
  }

  function updateWalletHUD() {
    const pill = document.getElementById("piraku-wallet-pill");
    if (!pill) return;
    const tier = window.PirakuEconomy.getTierObj();
    const rental = window.PirakuEconomy.getActiveRental();
    const badgeStr = rental ? `${rental.item.icon} ${formatRem(rental.remMs)}` : `${tier.badge} Toko`;
    pill.innerHTML = `<span>🪙 ${state.coins.toLocaleString("id-ID")}</span><span style="font-size:10px;background:rgba(250,204,21,0.18);padding:1px 6px;border-radius:999px;color:#fef08a;">${badgeStr}</span>`;
  }

  let activeTab = "outfit";
  window.openEconomyModal = function(tab) {
    if (tab) activeTab = tab;
    let modal = document.getElementById("piraku-economy-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "piraku-economy-modal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.72);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;";
      modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";
    renderEconomyModal();
  };

  function renderEconomyModal() {
    const modal = document.getElementById("piraku-economy-modal");
    if (!modal) return;
    const tier = window.PirakuEconomy.getTierObj();

    const tabs = [
      { id: "outfit", label: "👕 Gaya 3D" },
      { id: "mobility", label: "🛴 Sewa" },
      { id: "city", label: "📢 Kota" },
      { id: "tier", label: "🪪 Gelar" },
      { id: "history", label: "📜 Riwayat" }
    ];

    let bodyHTML = "";
    if (activeTab === "outfit") {
      bodyHTML = CATALOG.outfit.map(item => {
        const owned = state.owned.includes(item.id);
        const equipped = state.equippedOutfit === item.id;
        return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border-radius:12px;background:#1e293b;border:1px solid ${equipped ? "#facc15" : "rgba(148,163,184,0.2)"};margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:24px;">${item.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:#f8fafc;">${item.name}</div>
              <div style="font-size:11px;color:#94a3b8;">${item.desc}</div>
            </div>
          </div>
          <button data-buy-outfit="${item.id}" style="padding:7px 12px;border-radius:10px;border:none;font-size:11.5px;font-weight:800;cursor:pointer;white-space:nowrap;background:${equipped ? "#22c55e" : owned ? "#38bdf8" : "#f59e0b"};color:#0f172a;">
            ${equipped ? "Dipakai ✓" : owned ? "Pakai" : "🪙 " + item.price}
          </button>
        </div>`;
      }).join("");
    } else if (activeTab === "mobility") {
      const rental = window.PirakuEconomy.getActiveRental();
      bodyHTML = `<div style="font-size:11px;color:#38bdf8;background:rgba(56,189,248,0.12);padding:8px 10px;border-radius:10px;margin-bottom:8px;">⏱️ Sistem sewa berlaku <b>10 menit</b> real-time sejak disewa.</div>` +
        CATALOG.mobility.map(item => {
          const isThisActive = rental && rental.item.id === item.id;
          return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border-radius:12px;background:#1e293b;border:1px solid ${isThisActive ? "#38bdf8" : "rgba(148,163,184,0.2)"};margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:24px;">${item.icon}</span>
              <div>
                <div style="font-size:13px;font-weight:700;color:#f8fafc;">${item.name}</div>
                <div style="font-size:11px;color:#94a3b8;">${item.desc}</div>
                ${isThisActive ? `<div style="font-size:11px;font-weight:800;color:#4ade80;margin-top:2px;">Aktif • Sisa waktu: ${formatRem(rental.remMs)}</div>` : ""}
              </div>
            </div>
            <button data-rent-veh="${item.id}" style="padding:7px 11px;border-radius:10px;border:none;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;background:${isThisActive ? "#38bdf8" : "#f59e0b"};color:#0f172a;">
              ${isThisActive ? "+10m (🪙 " + item.price + ")" : "Sewa 🪙 " + item.price}
            </button>
          </div>`;
        }).join("");
    } else if (activeTab === "city") {
      bodyHTML = `
        <div style="padding:12px;border-radius:12px;background:#1e293b;border:1px solid rgba(250,204,21,0.35);margin-bottom:10px;">
          <div style="font-size:13px;font-weight:700;color:#f8fafc;margin-bottom:4px;">📢 Megafon Kota Live (🪙 80)</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Siarkan pengumuman banner emas ke layar seluruh warga yang sedang online!</div>
          <div style="display:flex;gap:6px;">
            <input id="inp-megaphone" type="text" maxlength="55" placeholder="Contoh: Kumpul ngopi di depan Gedung Sate yuk!" style="flex:1;padding:8px 10px;border-radius:9px;border:1px solid #475569;background:#0f172a;color:#fff;font-size:12px;">
            <button id="btn-send-megaphone" style="padding:8px 12px;border-radius:9px;border:none;background:#f59e0b;color:#0f172a;font-weight:800;font-size:12px;cursor:pointer;">Kirim</button>
          </div>
        </div>
        <div style="padding:12px;border-radius:12px;background:#1e293b;border:1px solid rgba(56,189,248,0.4);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:13px;font-weight:700;color:#f8fafc;">📺 Sewa Layar LED Gasibu 3D (🪙 200)</span>
            <button id="btn-view-billboard" style="border:none;background:rgba(56,189,248,0.2);color:#38bdf8;border-radius:8px;padding:3px 8px;font-size:10.5px;font-weight:800;cursor:pointer;">📍 Lihat Layar</button>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Teks kamu langsung tayang eksklusif <b>3 menit</b> di papan LED raksasa Gasibu & dilihat semua warga!</div>
          <div style="display:flex;gap:6px;">
            <input id="inp-billboard" type="text" maxlength="50" value="${state.billboardText}" style="flex:1;padding:8px 10px;border-radius:9px;border:1px solid #475569;background:#0f172a;color:#fde047;font-size:12px;font-weight:700;">
            <button id="btn-send-billboard" style="padding:8px 12px;border-radius:9px;border:none;background:#38bdf8;color:#0f172a;font-weight:800;font-size:12px;cursor:pointer;">Tayangkan</button>
          </div>
        </div>`;
    } else if (activeTab === "history") {
      const hist = Array.isArray(state.history) ? state.history : [];
      bodyHTML = hist.length === 0
        ? `<div style="text-align:center;padding:24px;color:#94a3b8;font-size:12px;">Belum ada riwayat transaksi koin.</div>`
        : hist.slice(0, 15).map(h => {
            const isPlus = Number(h.delta) >= 0;
            const tStr = h.ts ? new Date(h.ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:10px;background:#1e293b;border:1px solid rgba(148,163,184,0.16);margin-bottom:6px;">
              <div>
                <div style="font-size:12px;font-weight:700;color:#f8fafc;">${h.label || "Aktivitas"}</div>
                <div style="font-size:10px;color:#94a3b8;">${tStr}</div>
              </div>
              <span style="font-size:12.5px;font-weight:900;color:${isPlus ? "#4ade80" : "#f87171"};">${isPlus ? "+" : ""}${h.delta} 🪙</span>
            </div>`;
          }).join("");
    } else if (activeTab === "tier") {
      bodyHTML = CATALOG.tier.map(t => {
        const owned = state.owned.includes(t.id);
        const current = state.tier === t.id;
        return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border-radius:12px;background:#1e293b;border:1px solid ${current ? "#a78bfa" : "rgba(148,163,184,0.2)"};margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:22px;">${t.badge}</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:#f8fafc;">${t.name}</div>
              <div style="font-size:11px;color:#94a3b8;">${t.desc}</div>
            </div>
          </div>
          <button data-buy-tier="${t.id}" style="padding:7px 12px;border-radius:10px;border:none;font-size:11.5px;font-weight:800;cursor:pointer;white-space:nowrap;background:${current ? "#22c55e" : owned ? "#a78bfa" : "#f59e0b"};color:#0f172a;">
            ${current ? "Gelar Aktif" : owned ? "Pasang" : "🪙 " + t.price}
          </button>
        </div>`;
      }).join("");
    }

    modal.innerHTML = `
      <div style="width:100%;max-width:410px;background:#0f172a;border:1.5px solid rgba(250,204,21,0.45);border-radius:20px;padding:16px;color:#f8fafc;box-shadow:0 20px 45px rgba(0,0,0,0.6);max-height:82dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div>
            <div style="font-size:11px;color:#facc15;font-weight:800;letter-spacing:.5px;">EKONOMI & TOKO KOTA</div>
            <div style="font-size:17px;font-weight:800;">Dompet Piraku • 🪙 ${state.coins.toLocaleString("id-ID")}</div>
          </div>
          <button id="btn-close-eco" style="width:32px;height:32px;border-radius:50%;border:none;background:#1e293b;color:#cbd5e1;font-size:16px;cursor:pointer;">✕</button>
        </div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:12px;">Status Warga: <b style="color:#fde047;">${tier.badge} ${tier.name}</b> • Kecepatan: <b style="color:#38bdf8;">${window.PirakuEconomy.getSpeedMultiplier()}x</b></div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:12px;">
          ${tabs.map(tb => `<button data-eco-tab="${tb.id}" style="padding:7px 2px;border-radius:10px;border:none;font-size:10.5px;font-weight:700;cursor:pointer;background:${activeTab === tb.id ? "#f59e0b" : "#1e293b"};color:${activeTab === tb.id ? "#0f172a" : "#cbd5e1"};">${tb.label}</button>`).join("")}
        </div>
        <div>${bodyHTML}</div>
      </div>`;

    modal.querySelector("#btn-close-eco").onclick = () => { modal.style.display = "none"; };
    modal.querySelectorAll("[data-eco-tab]").forEach(btn => {
      btn.onclick = () => { activeTab = btn.dataset.ecoTab; renderEconomyModal(); };
    });

    modal.querySelectorAll("[data-buy-outfit]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.buyOutfit;
        const item = CATALOG.outfit.find(x => x.id === id);
        if (!item) return;
        if (!state.owned.includes(id)) {
          if (!window.PirakuEconomy.spendCoins(item.price, "Beli " + item.name)) return;
          state.owned.push(id);
        }
        state.equippedOutfit = (state.equippedOutfit === id) ? null : id;
        saveState();
        renderEconomyModal();
      };
    });

    modal.querySelectorAll("[data-rent-veh]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.rentVeh;
        const item = CATALOG.mobility.find(x => x.id === id);
        if (!item) return;
        const curRental = window.PirakuEconomy.getActiveRental();
        const isExtend = curRental && curRental.item.id === id;
        if (!window.PirakuEconomy.spendCoins(item.price, (isExtend ? "Perpanjang " : "Sewa ") + item.name)) return;
        const baseTime = isExtend ? state.rentalExpiresAt : Date.now();
        state.equippedVehicle = id;
        state.rentalExpiresAt = baseTime + (item.durationMin || 10) * 60 * 1000;
        saveState();
        renderEconomyModal();
      };
    });

    modal.querySelectorAll("[data-buy-tier]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.buyTier;
        const item = CATALOG.tier.find(x => x.id === id);
        if (!item) return;
        if (!state.owned.includes(id)) {
          if (!window.PirakuEconomy.spendCoins(item.price, "Upgrade Gelar " + item.name)) return;
          state.owned.push(id);
        }
        state.tier = id;
        saveState();
        renderEconomyModal();
      };
    });

    const btnMega = modal.querySelector("#btn-send-megaphone");
    if (btnMega) {
      btnMega.onclick = () => {
        const txt = (modal.querySelector("#inp-megaphone").value || "").trim();
        if (!txt) return showCoinToast("Tulis pesan megafon dulu ya!", true);
        if (!window.PirakuEconomy.spendCoins(80, "Megafon Kota")) return;
        modal.style.display = "none";
        const myIg = localStorage.getItem("piraku_my_ig") || "Warga Bandung";
        triggerMegaphoneBanner(myIg + ": " + txt);
        if (window.pirakuSupabase) {
          window.pirakuSupabase.from("chat_warga").insert([{ sender_ig: myIg, message: "[MEGAFON] " + txt }]).then(() => {});
        }
      };
    }

    const btnViewBill = modal.querySelector("#btn-view-billboard");
    if (btnViewBill) {
      btnViewBill.onclick = () => {
        modal.style.display = "none";
        if (typeof window.focusOnGasibuBillboard === "function") window.focusOnGasibuBillboard();
      };
    }

    const btnBill = modal.querySelector("#btn-send-billboard");
    if (btnBill) {
      btnBill.onclick = () => {
        const txt = (modal.querySelector("#inp-billboard").value || "").trim();
        if (!txt) return showCoinToast("Tulis teks untuk layar LED Gasibu!", true);
        if (!window.PirakuEconomy.spendCoins(200, "Sewa Billboard Gasibu")) return;
        state.billboardText = txt;
        saveState();
        const myIg = localStorage.getItem("piraku_my_ig") || "Warga Bandung";
        if (typeof window.setGasibuBillboardBroadcast === "function") {
          window.setGasibuBillboardBroadcast(myIg, txt, true);
        }
        if (window.pirakuSupabase) {
          window.pirakuSupabase.from("chat_warga").insert([{ sender_ig: myIg, message: "[BILLBOARD] " + txt }]).then(() => {});
        }
        showCoinToast("📺 Teks tayang 3 menit di Layar LED Gasibu 3D!");
        renderEconomyModal();
      };
    }
  }

  setInterval(() => {
    injectWalletHUD();
    if (state.equippedVehicle && (!state.rentalExpiresAt || Date.now() >= state.rentalExpiresAt)) {
      const expiredItem = CATALOG.mobility.find(m => m.id === state.equippedVehicle);
      state.equippedVehicle = null;
      state.rentalExpiresAt = 0;
      saveState();
      showCoinToast("⏱️ Waktu sewa " + (expiredItem ? expiredItem.name.split(" (")[0] : "kendaraan") + " habis!", true);
      const modal = document.getElementById("piraku-economy-modal");
      if (modal && modal.style.display === "flex" && activeTab === "mobility") renderEconomyModal();
    } else {
      updateWalletHUD();
    }
    const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (mesh && !mesh.getObjectByName("piraku-shop-attachments") && (state.equippedOutfit || window.PirakuEconomy.getActiveRental())) {
      syncPlayer3DAttachments();
    }
    try {
      const ig = (localStorage.getItem("piraku_my_ig") || "").toLowerCase().replace(/^@/, "");
      if (ig === "yelclaw" && state._hydrated && Array.isArray(state.owned) && !state.owned.includes("founder_topup_10k")) {
        state.owned.push("founder_topup_10k");
        localStorage.setItem("piraku_yelclaw_topup_10k_done", "1");
        window.PirakuEconomy.addCoins(10000, "Top-Up Admin Founder (@yelclaw)");
      }
    } catch (e) {}
  }, 1000);

  setTimeout(pullAccountWalletFromCloud, 1200);
  setInterval(() => {
    const curKey = getAccountStorageKey();
    if (curKey !== activeAccountKey) {
      state = loadState();
      updateWalletHUD();
      syncPlayer3DAttachments();
      pullAccountWalletFromCloud();
    }
  }, 1500);

  window.applyPirakuRidingPoses = function() {
    if (!window.pirakuScene) return;
    const t = performance.now() * 0.0025;
    window.pirakuScene.traverse(cg => {
      const a = cg?.userData?.a;
      if (!a || !a.body || !a.armL || !a.armR || !a.legL || !a.legR) return;
      const veh = cg.userData._activeShopVehicle;
      if (veh === "skateboard_gasibu") {
        cg.userData._wasRidingShopVeh = true;
        a.body.position.y = 0.09;
        a.body.rotation.x = 0.05;
        a.armL.rotation.z = 0.28;
        a.armR.rotation.z = -0.28;
        a.legL.position.set(-0.08, 0.45, 0.14);
        a.legR.position.set(0.08, 0.45, -0.14);
      } else if (veh === "skuter_listrik") {
        cg.userData._wasRidingShopVeh = true;
        a.body.position.y = 0.14;
        a.body.rotation.x = 0.08;
        a.armL.rotation.x = -0.88;
        a.armR.rotation.x = -0.88;
        a.armL.rotation.z = 0.08;
        a.armR.rotation.z = -0.08;
        a.legL.position.set(-0.08, 0.48, 0.14);
        a.legR.position.set(0.08, 0.48, -0.14);
        a.legL.rotation.x = -0.15;
        a.legR.rotation.x = 0.18;
      } else if (veh === "sepeda_kota") {
        cg.userData._wasRidingShopVeh = true;
        const isMoving = Boolean(a.walk) || (typeof window.getMyActivePlayerMesh === "function" && window.getMyActivePlayerMesh() === cg && (Math.abs(window.joyX || 0) > 0.05 || Math.abs(window.joyY || 0) > 0.05));
        const pedal = isMoving ? Math.sin(t * 4.5) * 0.32 : 0;
        a.body.position.y = 0.16;
        a.body.rotation.x = 0.15;
        a.armL.rotation.x = -0.80;
        a.armR.rotation.x = -0.80;
        a.armL.rotation.z = 0.12;
        a.armR.rotation.z = -0.12;
        a.legL.position.y = 0.46;
        a.legR.position.y = 0.46;
        a.legL.rotation.x = -0.58 + pedal;
        a.legR.rotation.x = -0.58 - pedal;
      } else if (veh === "vespa_bandung") {
        cg.userData._wasRidingShopVeh = true;
        a.body.position.y = 0.22;
        a.body.rotation.x = 0.06;
        a.armL.rotation.x = -0.84;
        a.armR.rotation.x = -0.84;
        a.armL.rotation.z = 0.14;
        a.armR.rotation.z = -0.14;
        a.legL.position.set(-0.12, 0.48, 0.06);
        a.legR.position.set(0.12, 0.48, 0.06);
        a.legL.rotation.x = -0.78;
        a.legR.rotation.x = -0.78;
      } else if (cg.userData._wasRidingShopVeh) {
        cg.userData._wasRidingShopVeh = false;
        a.body.position.y = 0;
        a.body.rotation.x = 0;
        a.armL.rotation.z = 0;
        a.armR.rotation.z = 0;
        a.legL.position.set(-0.1, 0.36, 0);
        a.legR.position.set(0.1, 0.36, 0);
      }
    });
  };

})();

try { localStorage.removeItem("piraku_economy_v2"); } catch (e) {}
