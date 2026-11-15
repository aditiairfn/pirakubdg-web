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

    // ================= 10. SEAMLESS BANDUNG BASIN HORIZON (ZERO BOX EDGE) =================
    const horizonGrp = new THREE.Group();
    horizonGrp.name = "piraku-bandung-horizon";
    scene.add(horizonGrp);

    // 1. Tekstur rumput organik seragam dengan lantai kota agar sambungan 0% terlihat
    const grassCv = document.createElement("canvas");
    grassCv.width = grassCv.height = 128;
    const gg = grassCv.getContext("2d");
    gg.fillStyle = "#6c965c";
    gg.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 800; i++) {
      gg.fillStyle = Math.random() > 0.5 ? "rgba(88,128,72,0.42)" : "rgba(142,174,104,0.32)";
      gg.fillRect(Math.random() * 128, Math.random() * 128, 2, 3);
    }
    const grassTex = new THREE.CanvasTexture(grassCv);
    grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(160, 160);
    const seamlessGroundMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95, metalness: 0 });

    // Samakan warna lantai tanah bawaan di scene agar menyatu tanpa garis batas kotak
    scene.traverse(obj => {
      if (obj.isMesh && obj.geometry && obj.geometry.type === "BoxGeometry" && obj.scale) {
        const p = obj.geometry.parameters;
        if (p && p.width >= 90 && p.depth >= 80 && p.height <= 2.5) {
          obj.material = seamlessGroundMat;
        }
      }
    });

    // Hamparan dataran Bandung Raya menyatu rata (y = -0.004 agar bebas z-fighting & bebas tangga pinggiran)
    const infinitePlain = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), seamlessGroundMat);
    infinitePlain.rotation.x = -Math.PI / 2;
    infinitePlain.position.y = -0.004;
    infinitePlain.receiveShadow = true;
    horizonGrp.add(infinitePlain);

    // Perpanjangan jalan asli (Jl. Surapati z=-26, Jl. Diponegoro z=3, Jl. Cilamaya x=-21, Jl. Hayam Wuruk x=21) presisi di y=0.15 + trotoar y=0.21
    const extAsphaltMat = new THREE.MeshStandardMaterial({ color: 0x2d3542, roughness: 0.90 });
    const extWalkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.88 });
    const extDashMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });

    function extendExactRoad(x0, z0, x1, z1, roadW) {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      const isEW = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      const asph = new THREE.Mesh(new THREE.PlaneGeometry(isEW ? len : roadW, isEW ? roadW : len), extAsphaltMat);
      asph.rotation.x = -Math.PI / 2;
      asph.position.set(cx, 0.152, cz);
      asph.receiveShadow = true;
      horizonGrp.add(asph);

      // Trotoar kiri & kanan (lebar 1.45m di y=0.21 persis seperti main.js)
      const sw = 1.45;
      [-1, 1].forEach(side => {
        const off = side * (roadW / 2 + sw / 2);
        const walk = new THREE.Mesh(
          new THREE.BoxGeometry(isEW ? len : sw, 0.06, isEW ? sw : len),
          extWalkMat
        );
        walk.position.set(cx + (isEW ? 0 : off), 0.18, cz + (isEW ? off : 0));
        walk.receiveShadow = true;
        horizonGrp.add(walk);
      });

      // Marka garis putus-putus putih tengah jalan
      const steps = Math.floor(len / 7);
      for (let k = 0; k < steps; k++) {
        const u = (k + 0.5) / steps;
        const dx = x0 + (x1 - x0) * u;
        const dz = z0 + (z1 - z0) * u;
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(isEW ? 3.0 : 0.24, isEW ? 0.24 : 3.0), extDashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(dx, 0.158, dz);
        horizonGrp.add(dash);
      }
    }

    // Sambung tepat dari ujung koordinat asli di main.js (±65 di X, +24 di Z) sampai ±460m!
    extendExactRoad(-460, -26, -65, -26, 8.4); // Jl. Surapati Barat (ke Pasteur/Dago)
    extendExactRoad(65, -26, 460, -26, 8.4);   // Jl. Surapati Timur (ke Cicaheum)
    extendExactRoad(-460, 3, -65, 3, 6.2);     // Jl. Diponegoro Barat
    extendExactRoad(65, 3, 460, 3, 6.2);       // Jl. Diponegoro Timur (ke Supratman)
    extendExactRoad(-21, 24, -21, 460, 5.4);   // Jl. Cilamaya Selatan (ke Riau/Banda)
    extendExactRoad(21, 24, 21, 460, 5.4);     // Jl. Hayam Wuruk Selatan (ke Riau)

    // 2. Permukiman Perifer & Pepohonan Bandung sampai radius 270m (menghilangkan kesan pulau kosong)
    let pSeed = 42;
    const pRnd = () => (pSeed = (pSeed * 16807) % 2147483647) / 2147483647;
    const periHouses = [];
    const periTrees = [];
    for (let x = -260; x <= 260; x += 13) {
      for (let z = -260; z <= 260; z += 13) {
        // Lewati area kota inti & koridor jalan perpanjangan
        if (x > -67 && x < 67 && z > -34 && z < 28) continue;
        if (Math.abs(z + 26) < 9.5 || Math.abs(z - 3) < 8.5) continue;
        if (z > 22 && (Math.abs(x + 21) < 8.0 || Math.abs(x - 21) < 8.0)) continue;
        if (Math.hypot(x, z) > 265) continue;
        if (pRnd() < 0.56) {
          periHouses.push([x + (pRnd() - 0.5) * 3.5, z + (pRnd() - 0.5) * 3.5]);
        } else if (pRnd() < 0.82) {
          periTrees.push([x + (pRnd() - 0.5) * 3.5, z + (pRnd() - 0.5) * 3.5]);
        }
      }
    }

    const wallCols = [0xf5efe6, 0xede0d4, 0xe6ccb2, 0xdbeafe, 0xfef3c7, 0xe2e8f0];
    const roofCols = [0xb45309, 0x9a3412, 0x475569, 0x334155];
    const hWallIM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), Math.max(1, periHouses.length));
    const hRoofGeo = new THREE.ConeGeometry(0.72, 1, 4); hRoofGeo.rotateY(Math.PI / 4);
    const hRoofIM = new THREE.InstancedMesh(hRoofGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.85 }), Math.max(1, periHouses.length));
    const dum = new THREE.Object3D(), col = new THREE.Color();
    periHouses.forEach((h, i) => {
      const bw = 4.2 + pRnd() * 2.2, bh = 2.8 + Math.floor(pRnd() * 2) * 1.5, bd = 4.2 + pRnd() * 2.2;
      dum.position.set(h[0], bh / 2, h[1]); dum.rotation.set(0, (i % 2) * Math.PI / 2, 0); dum.scale.set(bw, bh, bd); dum.updateMatrix();
      hWallIM.setMatrixAt(i, dum.matrix);
      hWallIM.setColorAt(i, col.setHex(wallCols[i % wallCols.length]));
      dum.position.set(h[0], bh + 0.75, h[1]); dum.scale.set(bw + 0.6, 1.5, bd + 0.6); dum.updateMatrix();
      hRoofIM.setMatrixAt(i, dum.matrix);
      hRoofIM.setColorAt(i, col.setHex(roofCols[(i * 3) % roofCols.length]));
    });
    if (hWallIM.instanceColor) hWallIM.instanceColor.needsUpdate = true;
    if (hRoofIM.instanceColor) hRoofIM.instanceColor.needsUpdate = true;
    horizonGrp.add(hWallIM, hRoofIM);

    const tTrunkIM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.3, 1, 7), new THREE.MeshStandardMaterial({ color: 0x7a5a40, roughness: 0.9 }), Math.max(1, periTrees.length));
    const tCrownIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.9 }), Math.max(1, periTrees.length));
    const leafCols = [0x4f8a47, 0x62a050, 0x3f7a40, 0x74a85a];
    periTrees.forEach((t, i) => {
      const s = 0.9 + pRnd() * 0.45;
      dum.position.set(t[0], 1.5 * s, t[1]); dum.rotation.set(0, 0, 0); dum.scale.set(s, 3.0 * s, s); dum.updateMatrix();
      tTrunkIM.setMatrixAt(i, dum.matrix);
      dum.position.set(t[0], 3.6 * s, t[1]); dum.rotation.set(0, pRnd() * 3, 0); dum.scale.set(2.4 * s, 1.9 * s, 2.4 * s); dum.updateMatrix();
      tCrownIM.setMatrixAt(i, dum.matrix);
      tCrownIM.setColorAt(i, col.setHex(leafCols[i % leafCols.length]));
    });
    if (tCrownIM.instanceColor) tCrownIM.instanceColor.needsUpdate = true;
    horizonGrp.add(tTrunkIM, tCrownIM);

    // 3. Shader Sky Dome + Sun Bloom (identik eps 3 final.html)
    window.__pirakuSkyU = {
      top: { value: new THREE.Color(0x63a2d4) },
      bot: { value: new THREE.Color(0xd6e6ef) },
      sunC: { value: new THREE.Color(0xfff4d4) },
      sunD: { value: new THREE.Vector3(-0.4, 0.6, 0.5).normalize() }
    };
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(850, 28, 18),
      new THREE.ShaderMaterial({
        uniforms: window.__pirakuSkyU,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: "varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: "uniform vec3 top; uniform vec3 bot; uniform vec3 sunC; uniform vec3 sunD; varying vec3 vW; void main(){ vec3 d = normalize(vW - cameraPosition); float k = pow(clamp(d.y * 1.6 + 0.05, 0.0, 1.0), 0.55); vec3 c = mix(bot, top, k); float s = pow(max(dot(d, normalize(sunD)), 0.0), 48.0); c += sunC * s * 0.35; gl_FragColor = vec4(c, 1.0); }"
      })
    );
    skyDome.frustumCulled = false;
    skyDome.renderOrder = -10;
    horizonGrp.add(skyDome);
    window.__pirakuSkyDome = skyDome;

    // 4. Cincin Pegunungan Mangkok Bandung 360° Berlapis
    let mSeed = 11;
    const mRnd = () => (mSeed = (mSeed * 16807) % 2147483647) / 2147483647;
    [
      { count: 46, rMin: 340, rSpan: 55, hMin: 36, hSpan: 44, wMin: 72, wSpan: 48, cols: [0x6f9a82, 0x7aa68a, 0x668f7a] },
      { count: 54, rMin: 430, rSpan: 75, hMin: 58, hSpan: 72, wMin: 92, wSpan: 68, cols: [0x8eb3a2, 0x7ea392, 0x9cbcb0, 0x88ab9b] }
    ].forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const a = (i / layer.count) * Math.PI * 2 + mRnd() * 0.14;
        const r = layer.rMin + mRnd() * layer.rSpan;
        const h = layer.hMin + mRnd() * layer.hSpan;
        const w = layer.wMin + mRnd() * layer.wSpan;
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(1, 1, 7),
          new THREE.MeshStandardMaterial({ color: layer.cols[i % layer.cols.length], flatShading: true, roughness: 0.92 })
        );
        cone.position.set(Math.cos(a) * r, h / 2 - 2, Math.sin(a) * r);
        cone.scale.set(w, h, w);
        cone.rotation.y = mRnd() * Math.PI;
        horizonGrp.add(cone);
      }
    });

    // 5. Fog menyatu mulus ke cakrawala (tidak ada garis potong horizon)
    scene.fog = new THREE.Fog(0xd8e6ee, 135, 490);

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
    const selfMesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
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
    if (window.__pirakuSkyDome && typeof camera !== "undefined" && camera) {
      window.__pirakuSkyDome.position.copy(camera.position);
    }
    if (window.__pirakuSkyU && scRef && scRef.fog) {
      const btnTxt = timeBtn ? (timeBtn.textContent || "") : "";
      const pal = /Malam/i.test(btnTxt)
        ? { top: 0x0b132b, bot: 0x1e293b, sun: 0x94a3b8 }
        : /Senja/i.test(btnTxt)
          ? { top: 0x4a7bb0, bot: 0xf5c894, sun: 0xffb347 }
          : /Pagi/i.test(btnTxt)
            ? { top: 0x58b2e0, bot: 0xf5dfb4, sun: 0xffe4a0 }
            : { top: 0x63a2d4, bot: 0xd6e6ef, sun: 0xfff4d4 };
      window.__pirakuSkyU.top.value.lerp(new THREE.Color(pal.top), 0.12);
      window.__pirakuSkyU.bot.value.lerp(new THREE.Color(pal.bot), 0.12);
      window.__pirakuSkyU.sunC.value.lerp(new THREE.Color(pal.sun), 0.12);
      scRef.fog.color.copy(window.__pirakuSkyU.bot.value);
    }
    if (selfMesh && selfMesh.position) {
      if (selfMesh.position.x < -61.0) selfMesh.position.x = -61.0;
      if (selfMesh.position.x > 61.0) selfMesh.position.x = 61.0;
      if (selfMesh.position.z < -31.0) selfMesh.position.z = -31.0;
      if (selfMesh.position.z > 24.5) selfMesh.position.z = 24.5;
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
