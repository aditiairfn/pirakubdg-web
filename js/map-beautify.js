// ================= PIRAKUBDG MAP BEAUTIFY & MINIMAP RADAR =================
(function() {
  let initialized = false;
  const nightGlowLights = [];
  const fireflies = [];
  let fireflyPoints = null;

  function buildCityEnhancements(scene) {
    if (initialized || !scene || typeof THREE === "undefined") return;
    initialized = true;

    const grp = new THREE.Group();
    grp.name = "piraku-map-beautify";
    scene.add(grp);

    const matTerracotta = new THREE.MeshStandardMaterial({ color: 0xb94a38, roughness: 0.85 });
    const matTrackLine = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    const matWood = new THREE.MeshStandardMaterial({ color: 0x7c4a27, roughness: 0.75 });
    const matIron = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 });
    const matStone = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.82 });
    const matRoofGreen = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.7 });
    const matRoofGold = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    const matGlass = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.65 });
    const matLampBulb = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.35 });

    // 1. JOGGING TRACK GASIBU (Lintasan Bata Merah Melingkar)
    const trackOuter = new THREE.Mesh(new THREE.RingGeometry(9.6, 11.4, 48), matTerracotta);
    trackOuter.rotation.x = -Math.PI / 2;
    trackOuter.scale.set(1.2, 0.76, 1);
    trackOuter.position.set(0, 0.045, -7.2);
    grp.add(trackOuter);

    const trackMidLine = new THREE.Mesh(new THREE.RingGeometry(10.45, 10.55, 48), matTrackLine);
    trackMidLine.rotation.x = -Math.PI / 2;
    trackMidLine.scale.set(1.2, 0.76, 1);
    trackMidLine.position.set(0, 0.05, -7.2);
    grp.add(trackMidLine);

    // 2. LAMPU TAMAN KLASIK BRAGA (Di titik bebas tanpa menabrak bangku existing)
    function addBragaLamp(x, z) {
      const l = new THREE.Group();
      l.position.set(x, 0.0, z);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.45, 10), matIron);
      base.position.y = 0.22;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 2.75, 10), matIron);
      pole.position.y = 1.6;
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), matLampBulb);
      lantern.position.y = 3.05;
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 10), matIron);
      cap.position.y = 3.25;
      l.add(base, pole, lantern, cap);
      grp.add(l);
      nightGlowLights.push(lantern);
    }
    [[-14.8, -16.2], [14.8, -16.2], [-14.8, 1.6], [14.8, 1.6], [-8.2, -18.2], [8.2, -18.2]]
      .forEach(p => addBragaLamp(p[0], p[1]));

    // 3. ZONA KULINER UMKM GASIBU (3 Tenda Kuliner Bandung di sisi barat pelataran)
    const stalls = [
      { x: -18.5, z: -13.5, mat: matRoofGreen },
      { x: -18.5, z: -9.5, mat: matRoofGold },
      { x: -18.5, z: -5.5, mat: matTerracotta }
    ];
    stalls.forEach(st => {
      const g = new THREE.Group();
      g.position.set(st.x, 0.0, st.z);
      const table = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.78, 1.0), matWood);
      table.position.y = 0.39;
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.65, 0.95, 4), st.mat);
      canopy.position.y = 2.45;
      canopy.rotation.y = Math.PI / 4;
      [[-0.85, -0.45], [0.85, -0.45], [-0.85, 0.45], [0.85, 0.45]].forEach(c => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.1, 6), matIron);
        p.position.set(c[0], 1.05, c[1]);
        g.add(p);
      });
      g.add(table, canopy);
      grp.add(g);
    });

    // 4. MONUMEN PERJUANGAN RAKYAT JAWA BARAT (Menjulang Megah di Poros Utara Gasibu x=0, z=-35)
    const monju = new THREE.Group();
    monju.position.set(0, 0.0, -35);
    const plaza = new THREE.Mesh(new THREE.BoxGeometry(15, 0.4, 9.5), matStone);
    plaza.position.y = 0.2;
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(11, 0.5, 6.5), matStone);
    step2.position.y = 0.65;
    monju.add(plaza, step2);
    [-1.6, 1.6].forEach(px => {
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.85, 13.5, 4), matStone);
      spire.position.set(px, 7.6, 0);
      spire.rotation.y = Math.PI / 4;
      monju.add(spire);
    });
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.85, 1.1), matRoofGold);
    lintel.position.set(0, 9.8, 0);
    monju.add(lintel);
    grp.add(monju);

    // 5. HALTE TREM MODERN
    const halte = new THREE.Group();
    halte.position.set(-18.5, 0.0, 5.2);
    const hFloor = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.16, 1.6), matStone);
    hFloor.position.y = 0.08;
    const hRoof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.14, 1.9), matGlass);
    hRoof.position.y = 2.45;
    [-1.9, 1.9].forEach(hx => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), matIron);
      post.position.set(hx, 1.2, -0.65);
      halte.add(post);
    });
    halte.add(hFloor, hRoof);
    grp.add(halte);

    // 6. PARTIKEL KUNANG-KUNANG / CAHAYA SENJA TAMAN
    const count = 42;
    const posArr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const fx = (Math.random() - 0.5) * 44;
      const fy = 0.6 + Math.random() * 2.6;
      const fz = -24 + Math.random() * 34;
      posArr[i * 3] = fx;
      posArr[i * 3 + 1] = fy;
      posArr[i * 3 + 2] = fz;
      fireflies.push({ bx: fx, by: fy, bz: fz, phase: Math.random() * Math.PI * 2 });
    }
    const ffGeo = new THREE.BufferGeometry();
    ffGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    const ffMat = new THREE.PointsMaterial({ color: 0xfef08a, size: 0.22, transparent: true, opacity: 0.75 });
    fireflyPoints = new THREE.Points(ffGeo, ffMat);
    grp.add(fireflyPoints);

    // ================= 10. BANDUNG BASIN HORIZON 360° & TRANSPARENT BOUNDARY =================
    const horizonGrp = new THREE.Group();
    horizonGrp.name = "piraku-bandung-horizon";
    scene.add(horizonGrp);

    // Hamparan dataran Bandung Raya luas agar tepi map tidak terpotong kotak
    const outerPlain = new THREE.Mesh(
      new THREE.RingGeometry(48, 460, 64),
      new THREE.MeshStandardMaterial({ color: 0x3b5e3c, roughness: 0.95 })
    );
    outerPlain.rotation.x = -Math.PI / 2;
    outerPlain.position.y = -0.06;
    horizonGrp.add(outerPlain);

    // Perpanjangan jalan arteri keluar batas kota
    const extRoadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const extRoadNS = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 420), extRoadMat);
    extRoadNS.rotation.x = -Math.PI / 2;
    extRoadNS.position.set(-42, -0.02, 0);
    const extRoadEW = new THREE.Mesh(new THREE.PlaneGeometry(420, 8.5), extRoadMat);
    extRoadEW.rotation.x = -Math.PI / 2;
    extRoadEW.position.set(0, -0.02, 3.0);
    horizonGrp.add(extRoadNS, extRoadEW);

    // Tembok batas transparan (holographic glass barrier low-profile di keliling arena)
    const boundW = 122, boundD = 98, boundCenterZ = -6;
    const glassWallMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const edgeGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
    [
      { w: boundW, h: 1.35, d: 0.12, x: 0, z: boundCenterZ - boundD / 2 },
      { w: boundW, h: 1.35, d: 0.12, x: 0, z: boundCenterZ + boundD / 2 },
      { w: 0.12, h: 1.35, d: boundD, x: -boundW / 2, z: boundCenterZ },
      { w: 0.12, h: 1.35, d: boundD, x: boundW / 2, z: boundCenterZ }
    ].forEach(w => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), glassWallMat);
      wall.position.set(w.x, w.h / 2, w.z);
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(w.w + 0.05, 0.06, w.d + 0.05), edgeGlowMat);
      topRail.position.set(w.x, w.h, w.z);
      horizonGrp.add(wall, topRail);
    });

    // Ring Pegunungan Cekungan Bandung 360° (Tangkuban Parahu di Utara, Manglayang Timur, Malabar Selatan)
    function buildMountainRing(radius, baseHeight, peakVar, segments, colorHex, yOffset) {
      const geo = new THREE.CylinderGeometry(radius, radius * 1.18, baseHeight, segments, 1, true);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) {
          const vx = pos.getX(i), vz = pos.getZ(i);
          const ang = Math.atan2(vz, vx);
          // Siluet khas Tangkuban Parahu di sisi utara (-PI/2) & pegunungan bergelombang
          const ridge = Math.sin(ang * 5) * 0.45 + Math.cos(ang * 11) * 0.3 + Math.sin(ang * 19) * 0.25;
          const northBoost = Math.max(0, -Math.sin(ang)) * 0.55;
          pos.setY(i, y + (ridge + northBoost) * peakVar);
        }
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.95,
        metalness: 0.02,
        side: THREE.BackSide
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = baseHeight * 0.45 + yOffset;
      horizonGrp.add(mesh);
      return mesh;
    }

    buildMountainRing(245, 36, 16, 96, 0x2f5249, -2); // Lapisan bukit hijau dekat
    buildMountainRing(340, 62, 26, 96, 0x264356, -4); // Lapisan pegunungan biru-hijau Bandung Raya

    // Siluet Skyline Gedung & Perumahan Bandung di kaki bukit (radius 105..175)
    const cityBlockGeo = new THREE.BoxGeometry(1, 1, 1);
    const cityBlockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
    const skylineCount = 150;
    const skylineIM = new THREE.InstancedMesh(cityBlockGeo, cityBlockMat, skylineCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < skylineCount; i++) {
      const ang = (i / skylineCount) * Math.PI * 2 + (i % 7) * 0.03;
      const dist = 108 + (i % 9) * 8.5;
      const bw = 4.5 + (i % 4) * 2.2;
      const bh = 4.0 + ((i * 7) % 13) * 1.45;
      const bd = 4.5 + (i % 3) * 2.0;
      dummy.position.set(Math.cos(ang) * dist, bh / 2 - 0.1, Math.sin(ang) * dist);
      dummy.rotation.y = -ang;
      dummy.scale.set(bw, bh, bd);
      dummy.updateMatrix();
      skylineIM.setMatrixAt(i, dummy.matrix);
    }
    skylineIM.instanceMatrix.needsUpdate = true;
    horizonGrp.add(skylineIM);

    // Kabut atmosfer lembut agar gunung & skyline menyatu dengan langit
    if (!scene.fog) {
      scene.fog = new THREE.FogExp2(0xcbe3ee, 0.0024);
    }


    // 8. TEMPAT SAMPAH PILAH ORGANIK & ANORGANIK (Prosedural Three.js)
    const matBinGreen = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
    const matBinYellow = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 });
    [[-13.8, -11.3], [-13.8, -0.8], [13.8, -11.3], [13.8, -0.8]].forEach(p => {
      const binGrp = new THREE.Group();
      binGrp.position.set(p[0], 0.05, p[1]);
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.56, 10), matBinGreen);
      b1.position.set(-0.22, 0.28, 0);
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.56, 10), matBinYellow);
      b2.position.set(0.22, 0.28, 0);
      binGrp.add(b1, b2);
      grp.add(binGrp);
    });

    // 9. PAPAN NAMA LANDMARK 3D (CanvasTexture Ringan)
    function makeSignMesh(label, bg, fg, w, h) {
      const cv = document.createElement("canvas");
      cv.width = 256; cv.height = 64;
      const c = cv.getContext("2d");
      c.fillStyle = bg; c.fillRect(0, 0, 256, 64);
      c.strokeStyle = fg; c.lineWidth = 4; c.strokeRect(4, 4, 248, 56);
      c.fillStyle = fg; c.font = "800 28px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(label, 128, 34);
      const tex = new THREE.CanvasTexture(cv);
      return new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), new THREE.MeshBasicMaterial({ map: tex }));
    }
    const signGasibu = makeSignMesh("LAPANGAN GASIBU", "#14532d", "#fef08a", 3.4, 0.72);
    signGasibu.position.set(0, 1.1, 2.2);
    const poleG1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), matIron);
    poleG1.position.set(-1.4, 0.55, 2.2);
    const poleG2 = poleG1.clone(); poleG2.position.x = 1.4;
    grp.add(signGasibu, poleG1, poleG2);

    const signMonju = makeSignMesh("MONUMEN PERJUANGAN", "#1e293b", "#38bdf8", 4.2, 0.78);
    signMonju.position.set(0, 1.4, -30.2);
    grp.add(signMonju);

  }

  // 7. MINIMAP RADAR NAVIGASI INTERAKTIF
  function injectMinimapRadar() {
    if (!document.body || document.getElementById("piraku-minimap-radar")) return;
    const box = document.createElement("div");
    box.id = "piraku-minimap-radar";
    box.style.cssText = "position:fixed;top:102px;left:12px;width:82px;height:82px;border-radius:50%;background:rgba(15,23,42,0.85);backdrop-filter:blur(10px);border:1.5px solid rgba(56,189,248,0.48);box-shadow:0 6px 18px rgba(0,0,0,0.35);z-index:25;pointer-events:none;overflow:hidden;";
    box.innerHTML = "<canvas id=\"piraku-radar-cv\" width=\"82\" height=\"82\"></canvas>";
    document.body.appendChild(box);
  }

  function updateRadarAndAtmosphere(t) {
    injectMinimapRadar();
    const timeBtn = document.getElementById("side-time-btn");
    const isNightOrDusk = timeBtn && /Malam|Senja/i.test(timeBtn.textContent || "");
    nightGlowLights.forEach(m => {
      if (m && m.material) m.material.emissiveIntensity = isNightOrDusk ? 1.6 : 0.25;
    });
    if (fireflyPoints && fireflyPoints.geometry) {
      fireflyPoints.visible = isNightOrDusk;
      const arr = fireflyPoints.geometry.attributes.position.array;
      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i];
        arr[i * 3] = f.bx + Math.sin(t * 0.9 + f.phase) * 0.65;
        arr[i * 3 + 1] = f.by + Math.cos(t * 1.3 + f.phase) * 0.28;
        arr[i * 3 + 2] = f.bz + Math.cos(t * 0.8 + f.phase) * 0.65;
      }
      fireflyPoints.geometry.attributes.position.needsUpdate = true;
    }

    
    // Jaga pemain tetap di dalam tembok batas transparan & sesuaikan warna kabut horizon
    const scRef = window.pirakuScene || (typeof scene !== "undefined" ? scene : null);
    if (scRef && scRef.fog && scRef.background && scRef.background.isColor) {
      scRef.fog.color.lerp(scRef.background, 0.15);
    }
    if (selfMesh && selfMesh.position) {
      if (selfMesh.position.x < -59.5) selfMesh.position.x = -59.5;
      if (selfMesh.position.x > 59.5) selfMesh.position.x = 59.5;
      if (selfMesh.position.z < -53.5) selfMesh.position.z = -53.5;
      if (selfMesh.position.z > 41.5) selfMesh.position.z = 41.5;
    }

    const cv = document.getElementById("piraku-radar-cv");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = 82, H = 82, cx = 41, cy = 41, scale = 0.72;
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(148,163,184,0.26)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 6); ctx.lineTo(cx, H - 6); ctx.moveTo(6, cy); ctx.lineTo(W - 6, cy); ctx.stroke();

    const landmarks = [
      { x: 0, z: -23, c: "#f59e0b" },
      { x: 34.5, z: -6.5, c: "#38bdf8" },
      { x: 0, z: -35, c: "#a78bfa" }
    ];
    landmarks.forEach(lm => {
      const lx = cx + lm.x * scale;
      const ly = cy + lm.z * scale;
      ctx.fillStyle = lm.c;
      ctx.fillRect(lx - 2.2, ly - 2.2, 4.4, 4.4);
    });

    const selfMesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (selfMesh && selfMesh.position) {
      const sx = Math.max(8, Math.min(W - 8, cx + selfMesh.position.x * scale));
      const sy = Math.max(8, Math.min(H - 8, cy + selfMesh.position.z * scale));
      ctx.fillStyle = "#fde047";
      ctx.beginPath(); ctx.arc(sx, sy, 3.6, 0, Math.PI * 2); ctx.fill();
    }
  }

  function loop(now) {
    const sc = window.pirakuScene || (typeof scene !== "undefined" ? scene : null);
    if (sc && !initialized) buildCityEnhancements(sc);
    updateRadarAndAtmosphere((now || 0) * 0.001);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
