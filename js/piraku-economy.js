// ================= PIRAKUBDG ECONOMY, WALLET, 10-MIN VEHICLE RENTAL & 3D SHOP =================
(function() {
  const STORAGE_KEY = "piraku_economy_v2";

  const CATALOG = {
    outfit: [
      { id: "iket_sunda", name: "Iket Sunda / Totopong", price: 45, icon: "🧣", desc: "Iket kepala khas Sunda langsung terpasang di karakter 3D." },
      { id: "kacamata_hitam", name: "Kacamata Hitam Dago", price: 35, icon: "🕶️", desc: "Kacamata gaya buat nongkrong sore di Gasibu." },
      { id: "helm_biker", name: "Helm Biker Pasupati", price: 65, icon: "🪖", desc: "Helm visor gelap siap melintas di Flyover Pasupati." },
      { id: "aura_emas", name: "Aura Langkah Emas", price: 100, icon: "✨", desc: "Cincin cahaya emas berputar di bawah kaki karakter." }
    ],
    mobility: [
      { id: "sepeda_kota", name: "Sepeda Boseh (Sewa 10 Menit)", price: 12, durationMin: 10, speed: 1.35, icon: "🚲", desc: "Sewa 10 menit • Kecepatan gerak 1.35x + sepeda 3D." },
      { id: "skuter_listrik", name: "Skuter Listrik (Sewa 10 Menit)", price: 22, durationMin: 10, speed: 1.65, icon: "🛴", desc: "Sewa 10 menit • Meluncur 1.65x keliling Gasibu & Monju." }
    ],
    tier: [
      { id: "tier_1", name: "Warga Baru", badge: "🌱", price: 0, desc: "Status dasar warga Piraku Bandung." },
      { id: "tier_2", name: "Wargi Aktif", badge: "⭐", price: 80, desc: "Lencana bintang di label nama + prioritas polling." },
      { id: "tier_3", name: "Sesepuh Bandung", badge: "👑", price: 200, desc: "Mahkota emas di label nama + gelar Sesepuh." },
      { id: "tier_4", name: "Sultan Dago", badge: "💎", price: 450, desc: "Gelar tertinggi Piraku Bandung dengan bingkai berlian." }
    ]
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.coins === "number") {
          if (typeof parsed.rentalExpiresAt !== "number") parsed.rentalExpiresAt = 0;
          return parsed;
        }
      }
    } catch (e) {}
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

  let state = loadState();
  function saveState() {
    if (typeof window.syncPirakuWalletToSupabase === "function") window.syncPirakuWalletToSupabase(state);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    updateWalletHUD();
    syncPlayer3DAttachments();
  }

  window.PirakuEconomy = {
    getCoins: () => state.coins,
    getState: () => state,
    addCoins(amount, reason) {
      const val = Math.round(Number(amount) || 0);
      if (!val) return state.coins;
      state.coins = Math.max(0, state.coins + val);
      state.history.unshift({ label: reason || (val > 0 ? "Hadiah Aktivitas" : "Belanja Kota"), delta: val, ts: Date.now() });
      if (state.history.length > 25) state.history.length = 25;
      saveState();
      showCoinToast((val > 0 ? "+" : "") + val + " Koin Piraku • " + (reason || ""));
      return state.coins;
    },
    spendCoins(amount, reason) {
      if (state.coins < amount) {
        showCoinToast("Koin Piraku belum cukup! Main mini-game dulu yuk 🪙", true);
        return false;
      }
      this.addCoins(-amount, reason);
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
  };

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

  let billboardMesh = null;
  function updateGasibuBillboard3D(text) {
    const sc = window.pirakuScene;
    if (!sc || typeof THREE === "undefined") return;
    if (!billboardMesh) {
      const cv = document.createElement("canvas");
      cv.width = 512; cv.height = 128;
      const tex = new THREE.CanvasTexture(cv);
      const mat = new THREE.MeshBasicMaterial({ map: tex });
      billboardMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 2.2), mat);
      billboardMesh.position.set(0, 4.35, -22.15);
      billboardMesh.userData = { cv, tex };
      sc.add(billboardMesh);
    }
    const { cv, tex } = billboardMesh.userData;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 120);
    ctx.fillStyle = "#fde047";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((text || "PIRAKU BANDUNG").slice(0, 34).toUpperCase(), 256, 66);
    tex.needsUpdate = true;
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
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  window.attachPirakuShopToCitizen = function(cg, outfitId, vehicleId) {
    if (!cg || typeof THREE === "undefined" || !cg.userData || !cg.userData.a || !cg.userData.a.head) return;
    const headNode = cg.userData?.a?.head || cg;

    // Bersihkan attachment lama di akar karakter maupun di kepala
    const oldBodyAtt = cg.getObjectByName("piraku-shop-body-att");
    if (oldBodyAtt) cg.remove(oldBodyAtt);
    const oldHeadAtt = headNode.getObjectByName("piraku-shop-head-att");
    if (oldHeadAtt) headNode.remove(oldHeadAtt);

    // A. AKSESORIS KEPALA (menempel langsung ke tulang head agar ikut gerak & proporsional)
    if (outfitId === "iket_sunda" || outfitId === "kacamata_hitam" || outfitId === "helm_biker") {
      const headGrp = new THREE.Group();
      headGrp.name = "piraku-shop-head-att";

      if (outfitId === "iket_sunda") {
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
        // Kacamata Hitam Dago presisi di koordinat mata wajah
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.18 });
        const lensMat = new THREE.MeshStandardMaterial({ color: 0x050811, metalness: 0.92, roughness: 0.06 });

        for (const sx of [-0.095, 0.095]) {
          const rim = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.088, 0.022), frameMat);
          rim.position.set(sx, -0.01, 0.242);
          const lens = new THREE.Mesh(new THREE.BoxGeometry(0.116, 0.068, 0.026), lensMat);
          lens.position.set(sx, -0.01, 0.245);
          headGrp.add(rim, lens);
        }
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.018, 0.022), frameMat);
        bridge.position.set(0, 0.008, 0.244);

        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 0.24), frameMat);
        armL.position.set(-0.162, 0.002, 0.125);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 0.24), frameMat);
        armR.position.set(0.162, 0.002, 0.125);

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

    // B. AURA EMAS & KENDARAAN SEWA (menempel ke akar karakter cg)
    if (outfitId === "aura_emas" || vehicleId === "sepeda_kota" || vehicleId === "skuter_listrik") {
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

      if (vehicleId === "sepeda_kota") {
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
      { id: "city", label: "📢 Billboard" },
      { id: "tier", label: "🪪 Gelar KTP" }
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
        <div style="padding:12px;border-radius:12px;background:#1e293b;border:1px solid rgba(148,163,184,0.2);margin-bottom:10px;">
          <div style="font-size:13px;font-weight:700;color:#f8fafc;margin-bottom:4px;">📢 Megafon Kota (🪙 80)</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Kirim pengumuman banner emas di layar peta warga.</div>
          <div style="display:flex;gap:6px;">
            <input id="inp-megaphone" type="text" maxlength="55" placeholder="Contoh: Kumpul ngopi di depan Gedung Sate yuk!" style="flex:1;padding:8px 10px;border-radius:9px;border:1px solid #475569;background:#0f172a;color:#fff;font-size:12px;">
            <button id="btn-send-megaphone" style="padding:8px 12px;border-radius:9px;border:none;background:#f59e0b;color:#0f172a;font-weight:800;font-size:12px;cursor:pointer;">Kirim</button>
          </div>
        </div>
        <div style="padding:12px;border-radius:12px;background:#1e293b;border:1px solid rgba(148,163,184,0.2);">
          <div style="font-size:13px;font-weight:700;color:#f8fafc;margin-bottom:4px;">📺 Sewa Layar LED Gasibu 3D (🪙 200)</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Teks kamu langsung tayang di papan LED raksasa utara Gasibu!</div>
          <div style="display:flex;gap:6px;">
            <input id="inp-billboard" type="text" maxlength="34" value="${state.billboardText}" style="flex:1;padding:8px 10px;border-radius:9px;border:1px solid #475569;background:#0f172a;color:#fde047;font-size:12px;font-weight:700;">
            <button id="btn-send-billboard" style="padding:8px 12px;border-radius:9px;border:none;background:#38bdf8;color:#0f172a;font-weight:800;font-size:12px;cursor:pointer;">Tayangkan</button>
          </div>
        </div>`;
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
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:12px;">
          ${tabs.map(tb => `<button data-eco-tab="${tb.id}" style="padding:7px 4px;border-radius:10px;border:none;font-size:11px;font-weight:700;cursor:pointer;background:${activeTab === tb.id ? "#f59e0b" : "#1e293b"};color:${activeTab === tb.id ? "#0f172a" : "#cbd5e1"};">${tb.label}</button>`).join("")}
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
        triggerMegaphoneBanner(txt);
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
        showCoinToast("Teks sudah tayang di Layar LED Gasibu 3D!");
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
  }, 1000);

  setTimeout(() => {
    try {
      const ig = (localStorage.getItem("piraku_my_ig") || "").toLowerCase().replace(/^@/, "");
      if (ig === "yelclaw" && !localStorage.getItem("piraku_yelclaw_topup_10k_done")) {
        localStorage.setItem("piraku_yelclaw_topup_10k_done", "1");
        if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
          window.PirakuEconomy.addCoins(10000, "Top-Up Admin Founder (@yelclaw)");
        }
      }
    } catch (e) {}
  }, 1500);

  setTimeout(() => {
    try {
      if (typeof window.syncPirakuWalletToSupabase === "function") {
        window.syncPirakuWalletToSupabase(state);
      }
    } catch (e) {}
  }, 2200);
})();
