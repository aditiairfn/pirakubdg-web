// ================= PIRAKUBDG LIVE WORLD EVENTS & 3D SULTAN PODIUM (SUPABASE) =================
(function() {
  const EVENT_SCHEDULE = [
    { startMin: 0, endMin: 14, id: "cfd", badge: "🏃 CFD GASIBU", color: "#22c55e", desc: "Koin emas bermunculan di trek biru Gasibu! Pungut sekarang!", coinZone: "gasibu" },
    { startMin: 15, endMin: 29, id: "sunny", badge: "☀️ CERAH BANDUNG", color: "#38bdf8", desc: "Cuaca cerah di Gedung Sate! Waktunya keliling kota.", coinZone: null },
    { startMin: 30, endMin: 44, id: "rain", badge: "🌧️ HUJAN SORE BDG", color: "#60a5fa", desc: "Rintik hujan turun! Hadiah Mancing Taman Lansia 2x Koin!", coinZone: null },
    { startMin: 45, endMin: 59, id: "monju_night", badge: "✨ FESTIVAL MONJU", color: "#f59e0b", desc: "Koin emas bermunculan di pelataran Monumen Perjuangan!", coinZone: "monju" }
  ];

  function getCurrentEvent() {
    const min = new Date().getMinutes();
    return EVENT_SCHEDULE.find(e => min >= e.startMin && min <= e.endMin) || EVENT_SCHEDULE[0];
  }

  function getCitizenIdentity() {
    const savedName = (localStorage.getItem("piraku_citizen_name") || localStorage.getItem("piraku_username") || "").trim();
    const guestId = localStorage.getItem("piraku_guest_id") || ("warga_" + Math.random().toString(36).slice(2, 7));
    localStorage.setItem("piraku_guest_id", guestId);
    const displayName = savedName || ("@" + guestId);
    return { key: (savedName || guestId).toLowerCase(), displayName };
  }

  // ================= 1. SINKRONISASI DOMPET & BILLBOARD KE SUPABASE =================
  window.syncPirakuWalletToSupabase = async function(state) {
    const sb = window.pirakuSupabase;
    if (!sb || !state) return;
    const idObj = getCitizenIdentity();
    try {
      await sb.from("piraku_wallets").upsert({
        citizen_key: idObj.key,
        display_name: idObj.displayName,
        coins: Math.round(state.coins || 0),
        tier: state.tier || "tier_1",
        equipped_outfit: state.equippedOutfit || null,
        billboard_text: state.billboardText || null,
        updated_at: new Date().toISOString()
      }, { onConflict: "citizen_key" });
    } catch (e) {}
  };

  // ================= 2. PODIUM 3D TOP 3 SULTAN KOIN PIRAKU =================
  let podiumGroup = null;
  let podiumBoardTex = null;
  let podiumBoardCv = null;

  function ensurePodium3D() {
    const sc = window.pirakuScene;
    if (!sc || typeof THREE === "undefined" || podiumGroup) return;

    podiumGroup = new THREE.Group();
    podiumGroup.position.set(-10.5, 0, -22.2);

    // 3 Tangga Podium (Juara 2 kiri, Juara 1 tengah tinggi, Juara 3 kanan)
    const specs = [
      { x: -1.7, h: 0.75, col: 0xcbd5e1 }, // #2 Silver
      { x: 0.0,  h: 1.15, col: 0xfacc15 }, // #1 Gold
      { x: 1.7,  h: 0.55, col: 0xd97706 }  // #3 Bronze
    ];

    specs.forEach((sp, idx) => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, sp.h, 1.45),
        new THREE.MeshStandardMaterial({ color: sp.col, roughness: 0.35, metalness: 0.45 })
      );
      box.position.set(sp.x, sp.h / 2, 0);
      podiumGroup.add(box);

      // Patung Avatar Mini di atas podium
      const avatar = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.26, 0.65, 12),
        new THREE.MeshStandardMaterial({ color: idx === 1 ? 0x2563eb : idx === 0 ? 0x16a34a : 0xea580c })
      );
      body.position.y = 0.34;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.21, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xfed7aa })
      );
      head.position.y = 0.82;
      avatar.add(body, head);
      avatar.position.set(sp.x, sp.h, 0);
      podiumGroup.add(avatar);
    });

    // Papan Peringkat Live di atas Podium
    podiumBoardCv = document.createElement("canvas");
    podiumBoardCv.width = 512;
    podiumBoardCv.height = 192;
    podiumBoardTex = new THREE.CanvasTexture(podiumBoardCv);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 1.95),
      new THREE.MeshBasicMaterial({ map: podiumBoardTex })
    );
    board.position.set(0, 3.25, 0);
    podiumGroup.add(board);

    sc.add(podiumGroup);
    drawPodiumCanvas([
      { display_name: "@yelclaw", coins: 1430 },
      { display_name: "@wargi_dago", coins: 920 },
      { display_name: "@akang_gasibu", coins: 650 }
    ]);
  }

  function drawPodiumCanvas(top3) {
    if (!podiumBoardCv || !podiumBoardTex) return;
    const ctx = podiumBoardCv.getContext("2d");
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 512, 192);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 184);

    ctx.fillStyle = "#fde047";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏆 TOP 3 SULTAN KOIN PIRAKU", 256, 34);

    const medals = ["🥇", "🥈", "🥉"];
    ctx.textAlign = "left";
    (top3 || []).slice(0, 3).forEach((row, i) => {
      const y = 76 + i * 38;
      ctx.fillStyle = i === 0 ? "#fef08a" : "#e2e8f0";
      ctx.font = "bold 21px sans-serif";
      const nm = String(row.display_name || "Warga").slice(0, 18);
      ctx.fillText(`${medals[i]} ${nm}`, 32, y);
      ctx.textAlign = "right";
      ctx.fillStyle = "#4ade80";
      ctx.fillText(`🪙 ${Number(row.coins || 0).toLocaleString("id-ID")}`, 480, y);
      ctx.textAlign = "left";
    });
    podiumBoardTex.needsUpdate = true;
  }

  async function refreshLeaderboard3D() {
    ensurePodium3D();
    const sb = window.pirakuSupabase;
    if (!sb) return;
    try {
      const { data } = await sb
        .from("piraku_wallets")
        .select("display_name, coins, billboard_text")
        .order("coins", { ascending: false })
        .limit(3);
      if (data && data.length > 0) {
        drawPodiumCanvas(data);
      }
    } catch (e) {}
  }

  // ================= 3. EVENT KOTA DINAMIS TIAP JAM + KOIN PUNGUT + EFEK HUJAN =================
  let eventCoins = [];
  let rainParticles = null;
  let lastEventId = null;

  function injectEventHUD() {
    if (!document.body || document.getElementById("piraku-event-pill")) return;
    const el = document.createElement("div");
    el.id = "piraku-event-pill";
    el.style.cssText = "position:fixed;top:98px;left:12px;padding:6px 11px;border-radius:999px;background:rgba(15,23,42,0.88);backdrop-filter:blur(10px);border:1.5px solid rgba(56,189,248,0.5);color:#f8fafc;font-size:11px;font-weight:800;z-index:26;cursor:pointer;display:flex;align-items:center;gap:5px;box-shadow:0 6px 16px rgba(0,0,0,0.35);";
    el.onclick = () => {
      const ev = getCurrentEvent();
      const toast = document.getElementById("piraku-coin-toast");
      if (toast) {
        toast.style.background = "#0284c7";
        toast.textContent = ev.badge + " • " + ev.desc;
        toast.style.opacity = "1";
        clearTimeout(toast._t);
        toast._t = setTimeout(() => { toast.style.opacity = "0"; }, 3200);
      }
    };
    document.body.appendChild(el);
  }

  function spawnEventCoins(zone) {
    const sc = window.pirakuScene;
    if (!sc || typeof THREE === "undefined") return;
    eventCoins.forEach(c => sc.remove(c));
    eventCoins = [];
    if (!zone) return;

    const geo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.45, metalness: 0.7, roughness: 0.2 });

    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = Math.PI / 2;
      if (zone === "gasibu") {
        const ang = (i / 10) * Math.PI * 2;
        m.position.set(Math.cos(ang) * 14, 0.85, -10 + Math.sin(ang) * 8);
      } else {
        const ang = (i / 10) * Math.PI * 2;
        m.position.set(Math.cos(ang) * 11, 0.85, -44 + Math.sin(ang) * 7);
      }
      sc.add(m);
      eventCoins.push(m);
    }
  }

  function updateRainEffect(isRain) {
    const sc = window.pirakuScene;
    if (!sc || typeof THREE === "undefined") return;
    if (!isRain) {
      if (rainParticles) { sc.remove(rainParticles); rainParticles = null; }
      return;
    }
    if (!rainParticles) {
      const count = 450;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 90;
        pos[i * 3 + 1] = Math.random() * 26;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 90;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.22, transparent: true, opacity: 0.65 });
      rainParticles = new THREE.Points(geom, mat);
      sc.add(rainParticles);
    }
    const arr = rainParticles.geometry.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] -= 0.48;
      if (arr[i + 1] < 0) arr[i + 1] = 26;
    }
    rainParticles.geometry.attributes.position.needsUpdate = true;
  }

  function tickWorldLive() {
    injectEventHUD();
    ensurePodium3D();
    const ev = getCurrentEvent();
    const pill = document.getElementById("piraku-event-pill");
    if (pill) {
      const remMin = ev.endMin - new Date().getMinutes() + 1;
      pill.style.borderColor = ev.color;
      pill.innerHTML = `<span>${ev.badge}</span><span style="color:#94a3b8;font-size:10px;">(${remMin}m)</span>`;
    }
    if (lastEventId !== ev.id) {
      lastEventId = ev.id;
      spawnEventCoins(ev.coinZone);
    }
    updateRainEffect(ev.id === "rain");

    // Putar koin event & cek apakah karakter pemain memungutnya
    const mesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    for (let i = eventCoins.length - 1; i >= 0; i--) {
      const c = eventCoins[i];
      c.rotation.z += 0.08;
      if (mesh && mesh.position) {
        const d = Math.hypot(mesh.position.x - c.position.x, mesh.position.z - c.position.z);
        if (d < 1.65) {
          window.pirakuScene.remove(c);
          eventCoins.splice(i, 1);
          if (window.PirakuEconomy) window.PirakuEconomy.addCoins(25, "Pungut Koin Event Kota");
        }
      }
    }
    requestAnimationFrame(tickWorldLive);
  }

  setTimeout(() => {
    refreshLeaderboard3D();
    setInterval(refreshLeaderboard3D, 15000);
    requestAnimationFrame(tickWorldLive);
  }, 1500);
})();
