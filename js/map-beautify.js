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
    // fireflyPoints dihapus agar tidak muncul kotak putih outframe

    // ================= 10. SEAMLESS BANDUNG BASIN HORIZON (KUALITAS VISUAL EP. 3 FINAL) =================
    const horizonGrp = new THREE.Group();
    horizonGrp.name = "piraku-bandung-horizon";
    scene.add(horizonGrp);

    function makeProcTex(w, h, fn, rx = 1, ry = 1) {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      fn(c.getContext("2d"), w, h);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      return t;
    }

    // 1. Tekstur rumput organik lembut ala Ep. 3 (#74a063)
    const grassTex = makeProcTex(128, 128, (g, w, h) => {
      g.fillStyle = "#74a063";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 750; i++) {
        g.fillStyle = Math.random() > 0.5 ? "rgba(98,140,80,0.42)" : "rgba(150,180,110,0.32)";
        g.fillRect(Math.random() * w, Math.random() * h, 2, 3);
      }
    }, 170, 170);
    const seamlessGroundMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95, metalness: 0 });

    // Samakan warna lantai tanah utama di scene agar tidak ada garis batas
    scene.traverse(obj => {
      if (obj.isMesh && obj.geometry && obj.geometry.type === "BoxGeometry") {
        const p = obj.geometry.parameters;
        if (p && p.width >= 90 && p.depth >= 80 && p.height <= 2.5) {
          obj.material = seamlessGroundMat;
        }
      }
    });

    const infinitePlain = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), seamlessGroundMat);
    infinitePlain.rotation.x = -Math.PI / 2;
    infinitePlain.position.y = -0.004;
    infinitePlain.receiveShadow = true;
    horizonGrp.add(infinitePlain);

    // 2. Barisan Lampu Jalan PJU Menyala + Kolam Cahaya di Aspal + Jendela Hotel Pullman + RGB Pasupati
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.45 });
    const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, fog: false });
    const glowCv = document.createElement("canvas");
    glowCv.width = glowCv.height = 64;
    const gg2 = glowCv.getContext("2d");
    const rad = gg2.createRadialGradient(32, 32, 2, 32, 32, 32);
    rad.addColorStop(0, "rgba(255,224,130,0.88)");
    rad.addColorStop(0.5, "rgba(255,200,90,0.28)");
    rad.addColorStop(1, "rgba(255,200,90,0)");
    gg2.fillStyle = rad;
    gg2.fillRect(0, 0, 64, 64);
    const roadGlowMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(glowCv),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    });
    const extLampPools = [];

    function addStreetLamp(lx, lz, rotY) {
      const lg = new THREE.Group();
      lg.position.set(lx, 0.21, lz);
      lg.rotation.y = rotY;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 4.4, 8), poleMat);
      pole.position.y = 2.2;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.07, 0.07), poleMat);
      arm.position.set(0.55, 4.35, 0);
      const hood = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.32), poleMat);
      hood.position.set(1.05, 4.38, 0);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.12, 0.26), lampBulbMat);
      head.position.set(1.05, 4.28, 0);
      lg.add(hood);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), roadGlowMat);
      halo.position.set(1.05, 4.22, 0);
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 8.5), roadGlowMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(1.1, 0.02, 0);
      lg.add(pole, arm, head, halo, pool);
      horizonGrp.add(lg);
      extLampPools.push(pool);
    }

    function populateStreetLamps(x0, z0, x1, z1, roadW) {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const isEW = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      const lampSteps = Math.floor(len / 20);
      for (let k = 0; k < lampSteps; k++) {
        const u = (k + 0.4) / lampSteps;
        const px = x0 + (x1 - x0) * u;
        const pz = z0 + (z1 - z0) * u;
        const side = (k % 2 === 0) ? 1 : -1;
        const off = side * (roadW / 2 + 0.45);
        if (isEW) addStreetLamp(px, pz + off, side > 0 ? Math.PI / 2 : -Math.PI / 2);
        else addStreetLamp(px + off, pz, side > 0 ? Math.PI : 0);
      }
    }

    // Pasang barisan lampu PJU lengkap di area inti Gasibu-Gedung Sate & jalan perpanjangan
    populateStreetLamps(-220, -26, 220, -26, 8.4);   // Jl. Surapati penuh dari ujung barat ke timur
    populateStreetLamps(-220, 3, -22, 3, 6.2);     // Jl. Diponegoro Barat
    populateStreetLamps(22, 3, 220, 3, 6.2);       // Jl. Diponegoro Timur
    populateStreetLamps(-21, -24, -21, 220, 5.4);  // Jl. Majapahit - Cilamaya
    populateStreetLamps(21, -24, 21, 220, 5.4);    // Jl. Sentot Alibasyah - Hayam Wuruk

    window.__pirakuNightLights = { lampBulbMat, roadGlowMat };

    // Strip LED RGB mengikuti kurva CFly Flyover Pasupati (termasuk ramp turun ke x=-132)
    const pasupatiLedMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, fog: false, toneMapped: false });
    const pCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-132, 0.22, -26),
      new THREE.Vector3(-114, 3.4, -26),
      new THREE.Vector3(-95, 6.2, -26),
      new THREE.Vector3(-75, 6.2, -26),
      new THREE.Vector3(-54, 6.2, -26),
      new THREE.Vector3(-38, 3.6, -26),
      new THREE.Vector3(-24, 0.22, -26)
    ]);
    for (let si = 0; si < 54; si++) {
      const u = (si + 0.5) / 54;
      const pt = pCurve.getPointAt(u), tg = pCurve.getTangentAt(u);
      const segLen = (pCurve.getLength() / 54) * 1.08;
      [-3.3, 3.3].forEach(sd => {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(segLen, 0.18, 0.22), pasupatiLedMat);
        strip.position.set(pt.x, pt.y + 0.62, pt.z + sd);
        strip.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tg.clone().normalize());
        horizonGrp.add(strip);
      });
    }
    const pPylonLight = new THREE.PointLight(0xff2a85, 0, 34, 1.5);
    pPylonLight.position.set(-54, 15, -26);
    horizonGrp.add(pPylonLight);
    window.__pirakuPasupatiDeco = { pasupatiLedMat, pPylonLight };

    // 3. Tekstur Fasad Rumah, Fasad Ruko 2-Lantai, & Atap Genteng Tanah Liat (Ep. 3)
    const houseFacadeTex = makeProcTex(256, 256, (g, w, h) => {
      g.fillStyle = "#f4efe6";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 450; i++) {
        g.fillStyle = "rgba(110,100,85,0.06)";
        g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
      // Jendela berbingkai putih + kaca biru lembut
      g.fillStyle = "#e2e8f0";
      g.fillRect(w * 0.10 - 4, h * 0.28 - 4, w * 0.30 + 8, h * 0.34 + 8);
      g.fillStyle = "#3f5a73";
      g.fillRect(w * 0.10, h * 0.28, w * 0.30, h * 0.34);
      // Pintu kayu hangat
      g.fillStyle = "#7c5a3a";
      g.fillRect(w * 0.56, h * 0.34, w * 0.22, h * 0.62);
      // Ambient occlusion halus di bagian bawah dinding
      const ao = g.createLinearGradient(0, h * 0.82, 0, h);
      ao.addColorStop(0, "rgba(40,30,20,0)");
      ao.addColorStop(1, "rgba(40,30,20,0.28)");
      g.fillStyle = ao;
      g.fillRect(0, h * 0.82, w, h * 0.18);
    });

    const roofTileTex = makeProcTex(128, 128, (g, w, h) => {
      g.fillStyle = "#c96f45";
      g.fillRect(0, 0, w, h);
      for (let r = 0; r < 8; r++) {
        g.fillStyle = r % 2 ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.06)";
        g.fillRect(0, r * 16, w, 16);
        g.strokeStyle = "rgba(60,25,10,0.48)";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(0, r * 16 + 15);
        g.lineTo(w, r * 16 + 15);
        g.stroke();
        for (let x = (r % 2) * 8; x < w; x += 16) {
          g.beginPath();
          g.moveTo(x, r * 16);
          g.lineTo(x, r * 16 + 15);
          g.stroke();
        }
      }
    }, 3, 2);

    let pSeed = 42;
    const pRnd = () => (pSeed = (pSeed * 16807) % 2147483647) / 2147483647;
    const periHouses = [];
    const periTrees = [];
    for (let x = -255; x <= 255; x += 13.5) {
      for (let z = -255; z <= 255; z += 13.5) {
        if (x > -67 && x < 67 && z > -68 && z < 32) continue;
        if (Math.abs(z + 26) < 9.2 || Math.abs(z - 3) < 8.2) continue;
        if (z > 22 && (Math.abs(x + 21) < 7.8 || Math.abs(x - 21) < 7.8)) continue;
        if (Math.hypot(x, z - 20) > 255) continue;
        const nearArterial = Math.abs(z + 26) < 15.5 || Math.abs(z - 3) < 14.5 || (z > 22 && (Math.abs(x + 21) < 14 || Math.abs(x - 21) < 14));
        if (nearArterial || pRnd() < 0.62) {
          periHouses.push({ x: x + (pRnd() - 0.5) * 2.2, z: z + (pRnd() - 0.5) * 2.2, isRuko: nearArterial });
        } else if (pRnd() < 0.85) {
          periTrees.push({ x: x + (pRnd() - 0.5) * 2.6, z: z + (pRnd() - 0.5) * 2.6 });
        }
      }
    }

    const wallCols = [0xf5efe6, 0xede0d4, 0xe6ccb2, 0xdbeafe, 0xfef3c7, 0xe2e8f0];
    const roofCols = [0xb45309, 0x9a3412, 0x475569, 0x334155];
    const awnCols = [0xdc2626, 0x16a34a, 0x2563eb, 0xd97706];

    
    const houseGlowTex = makeProcTex(256, 256, (g, w, h) => {
      g.fillStyle = "#000000";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#ffcf70";
      g.fillRect(w * 0.10, h * 0.28, w * 0.30, h * 0.34);
    });
    const hWallMat = new THREE.MeshStandardMaterial({
      map: houseFacadeTex,
      emissiveMap: houseGlowTex,
      emissive: new THREE.Color(0xffb84d),
      emissiveIntensity: 0,
      roughness: 0.90
    });
    window.__pirakuHouseWallMat = hWallMat;

    const hWallIM = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      hWallMat,
      Math.max(1, periHouses.length)
    );
    const hRoofGeo = new THREE.ConeGeometry(0.71, 1, 4);
    hRoofGeo.rotateY(Math.PI / 4);
    const hRoofIM = new THREE.InstancedMesh(
      hRoofGeo,
      new THREE.MeshStandardMaterial({ map: roofTileTex, flatShading: true, roughness: 0.85 }),
      Math.max(1, periHouses.length)
    );
    const hTrimIM = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 }),
      Math.max(1, periHouses.length)
    );
    const rukos = periHouses.filter(h => h.isRuko);
    const hAwnIM = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 }),
      Math.max(1, rukos.length)
    );

    const dum = new THREE.Object3D(), col = new THREE.Color();
    let awnIdx = 0;
    periHouses.forEach((h, i) => {
      const bw = h.isRuko ? 4.6 : (4.4 + pRnd() * 1.8);
      const bh = h.isRuko ? (4.8 + Math.floor(pRnd() * 2) * 1.8) : (3.0 + Math.floor(pRnd() * 2) * 1.4);
      const bd = h.isRuko ? 5.2 : (4.4 + pRnd() * 1.8);
      const rot = (i % 2) * Math.PI / 2;

      dum.position.set(h.x, bh / 2, h.z);
      dum.rotation.set(0, rot, 0);
      dum.scale.set(bw, bh, bd);
      dum.updateMatrix();
      hWallIM.setMatrixAt(i, dum.matrix);
      hWallIM.setColorAt(i, col.setHex(wallCols[i % wallCols.length]));

      // Lisplang atap putih bersih ala Ep. 3
      dum.position.set(h.x, bh + 0.1, h.z);
      dum.scale.set(bw + 0.55, 0.22, bd + 0.55);
      dum.updateMatrix();
      hTrimIM.setMatrixAt(i, dum.matrix);

      // Atap genteng bertekstur
      dum.position.set(h.x, bh + 0.85, h.z);
      dum.scale.set(bw + 0.45, 1.45, bd + 0.45);
      dum.updateMatrix();
      hRoofIM.setMatrixAt(i, dum.matrix);
      hRoofIM.setColorAt(i, col.setHex(roofCols[(i * 3) % roofCols.length]));

      // Kanopi ruko warna-warni di koridor arteri
      if (h.isRuko && awnIdx < rukos.length) {
        dum.position.set(h.x, 2.35, h.z);
        dum.scale.set(bw + 0.65, 0.42, bd + 0.65);
        dum.updateMatrix();
        hAwnIM.setMatrixAt(awnIdx, dum.matrix);
        hAwnIM.setColorAt(awnIdx, col.setHex(awnCols[awnIdx % awnCols.length]));
        awnIdx++;
      }
    });
    if (hWallIM.instanceColor) hWallIM.instanceColor.needsUpdate = true;
    if (hRoofIM.instanceColor) hRoofIM.instanceColor.needsUpdate = true;
    if (hAwnIM.instanceColor) hAwnIM.instanceColor.needsUpdate = true;
    horizonGrp.add(hWallIM, hTrimIM, hRoofIM, hAwnIM);

    // 4. Pohon 3-Mahkota Organik (IcosahedronGeometry 3 Lapis seperti Ep. 3 Final)
    const tTrunkIM = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.18, 0.28, 1, 8),
      new THREE.MeshStandardMaterial({ color: 0x7a5a40, roughness: 0.9 }),
      Math.max(1, periTrees.length)
    );
    const crownGeo3 = new THREE.IcosahedronGeometry(1, 2);
    const tCrowns3 = [0, 1, 2].map(() => new THREE.InstancedMesh(
      crownGeo3,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 }),
      Math.max(1, periTrees.length)
    ));
    const leafCols = [0x4f8a47, 0x62a050, 0x3f7a40, 0x74a85a, 0x5b9a4c, 0x86b560];
    periTrees.forEach((t, i) => {
      const s = 0.85 + pRnd() * 0.4, ry = pRnd() * 6.28, gi = Math.floor(pRnd() * leafCols.length);
      dum.position.set(t.x, 1.6 * s, t.z); dum.rotation.set(0, 0, 0); dum.scale.set(s, 3.2 * s, s); dum.updateMatrix();
      tTrunkIM.setMatrixAt(i, dum.matrix);

      dum.position.set(t.x, 3.7 * s, t.z); dum.rotation.set(0, ry, 0); dum.scale.set(2.5 * s, 1.9 * s, 2.5 * s); dum.updateMatrix();
      tCrowns3[0].setMatrixAt(i, dum.matrix);
      tCrowns3[0].setColorAt(i, col.setHex(leafCols[gi]));

      dum.position.set(t.x + Math.cos(ry) * 1.1 * s, 4.6 * s, t.z + Math.sin(ry) * 1.0 * s); dum.scale.set(1.7 * s, 1.4 * s, 1.7 * s); dum.updateMatrix();
      tCrowns3[1].setMatrixAt(i, dum.matrix);
      tCrowns3[1].setColorAt(i, col.setHex(leafCols[(gi + 2) % leafCols.length]));

      dum.position.set(t.x - Math.cos(ry) * 1.2 * s, 4.1 * s, t.z - Math.sin(ry) * 0.9 * s); dum.scale.set(1.5 * s, 1.25 * s, 1.5 * s); dum.updateMatrix();
      tCrowns3[2].setMatrixAt(i, dum.matrix);
      tCrowns3[2].setColorAt(i, col.setHex(leafCols[(gi + 4) % leafCols.length]));
    });
    tCrowns3.forEach(m => { if (m.instanceColor) m.instanceColor.needsUpdate = true; horizonGrp.add(m); });
    horizonGrp.add(tTrunkIM);

    // 5. Shader Sky Dome + Sun Bloom & Cincin Pegunungan Mangkok Bandung (Ep. 3 Final)
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

    let mSeed = 11;
    const mRnd = () => (mSeed = (mSeed * 16807) % 2147483647) / 2147483647;
    [
      { count: 56, rMin: 325, rSpan: 55, hMin: 42, hSpan: 48, wMin: 78, wSpan: 52, cols: [0x6f9a82, 0x7aa68a, 0x668f7a] },
      { count: 64, rMin: 405, rSpan: 75, hMin: 68, hSpan: 78, wMin: 98, wSpan: 68, cols: [0x8eb3a2, 0x7ea392, 0x9cbcb0, 0x88ab9b] }
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
        cone.position.set(Math.cos(a) * r, h / 2 - 2, 25 + Math.sin(a) * r);
        cone.scale.set(w, h, w);
        cone.rotation.y = mRnd() * Math.PI;
        horizonGrp.add(cone);
      }
    });

    scene.fog = new THREE.Fog(0xd8e6ee, 210, 590);

    // ================= 11. JALAN BELAKANG GEDUNG SATE & PLAZA TAMAN MONUMEN PERJUANGAN =================
    // Plaza Paving + Taman Bunga + Lampu Taman Klasik di pelataran Monumen Perjuangan (x: -16..16, z: -31..-66)
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 });
    const plazaDeck = new THREE.Mesh(new THREE.BoxGeometry(30, 0.08, 34), plazaMat);
    plazaDeck.position.set(0, 0.06, -48.5);
    plazaDeck.receiveShadow = true;
    horizonGrp.add(plazaDeck);

    // Jalur taman tengah berwarna terakota + bedengan tanaman hijau & bunga warna-warni
    const walkAxis = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.04, 33), new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 }));
    walkAxis.position.set(0, 0.11, -48.5);
    horizonGrp.add(walkAxis);

    const flowerCols = [0xf43f5e, 0xfacc15, 0xa855f7, 0xf97316];
    [-9.5, 9.5].forEach((bx, bIdx) => {
      [-37, -45, -53, -61].forEach((bz, zIdx) => {
        // Bedengan taman hijau
        const bed = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.24, 5.2), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }));
        bed.position.set(bx, 0.20, bz);
        horizonGrp.add(bed);
        // Bunga berwarna di atas bedengan
        const flw = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.14, 3.8), new THREE.MeshStandardMaterial({ color: flowerCols[(bIdx + zIdx) % flowerCols.length], roughness: 0.8 }));
        flw.position.set(bx, 0.35, bz);
        horizonGrp.add(flw);
        // Lampu taman klasik menyala hangat di sudut bedengan
        addStreetLamp(bx > 0 ? bx - 3.8 : bx + 3.8, bz, bx > 0 ? Math.PI : 0);
      });
    });


  }

  // 7. MINIMAP RADAR NAVIGASI INTERAKTIF
  function injectMinimapRadar() {
    if (!document.body || document.getElementById("piraku-minimap-radar")) return;
    const box = document.createElement("div");
    box.id = "piraku-minimap-radar";
    box.title = "Ketuk untuk perbesar/perkecil Peta Mini";
    box.style.cssText = "position:fixed;top:102px;left:12px;width:104px;height:104px;border-radius:50%;background:radial-gradient(circle at 50% 45%, #162235 0%, #0b1220 100%);backdrop-filter:blur(10px);border:2px solid rgba(56,189,248,0.65);box-shadow:0 8px 22px rgba(0,0,0,0.45), inset 0 0 14px rgba(15,23,42,0.85);z-index:25;pointer-events:auto;cursor:pointer;overflow:hidden;transition:width .2s ease,height .2s ease;";
    box.innerHTML = "<canvas id=\"piraku-radar-cv\" width=\"208\" height=\"208\" style=\"width:100%;height:100%;display:block;\"></canvas>";
    box.addEventListener("click", () => {
      const big = box.dataset.big === "1";
      box.dataset.big = big ? "0" : "1";
      box.style.width = big ? "104px" : "148px";
      box.style.height = big ? "104px" : "148px";
    });
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
      const allBtnsTxt = Array.from(document.querySelectorAll("button")).map(b => b.textContent || "").join(" ");
      const activeTimeTxt = btnTxt || allBtnsTxt;
      const isNight = /Malam/i.test(activeTimeTxt) && !/Siang|Pagi|Senja/i.test(btnTxt);
      const isDusk = /Senja|Sore/i.test(btnTxt);
      const nightLevel = isNight ? 1.0 : isDusk ? 0.6 : 0.0;

      const nl = window.__pirakuNightLights;
      if (nl) {
        nl.lampBulbMat.color.setHex(nightLevel > 0.1 ? 0xffe49e : 0xf8fafc);
        nl.roadGlowMat.opacity = nightLevel * 0.78;
      }

      // Nyalakan semua jendela Gedung Sate, Hotel Pullman (-34.5, -10.5), & bangunan sekitar
      if (window.pirakuGlassMat) {
        window.pirakuGlassMat.emissiveIntensity = nightLevel * 1.35;
      }
      if (window.__pirakuHouseWallMat) {
        window.__pirakuHouseWallMat.emissiveIntensity = nightLevel * 1.25;
      }

      // Nyalakan 32 kabel asli Flyover Pasupati (PX=-54, PZ=-26) dengan gelombang warna RGB dinamis
      const cab = window.pirakuPasupatiCables;
      const cabMat = window.pirakuPasupatiCabMat;
      if (cab && cab.instanceColor) {
        if (cab.material) cab.material.toneMapped = false;
        const hueBase = ((t || performance.now() * 0.001) * 0.18) % 1;
        const cTmp = new THREE.Color();
        if (nightLevel > 0.05) {
          for (let ci = 0; ci < 32; ci++) {
            cTmp.setHSL((hueBase + (ci % 16) * 0.0625) % 1, 1.0, 0.56);
            cab.setColorAt(ci, cTmp);
          }
        } else {
          cTmp.setHex(0xeef1f4);
          for (let ci = 0; ci < 32; ci++) cab.setColorAt(ci, cTmp);
        }
        cab.instanceColor.needsUpdate = true;
        if (window.__pirakuPasupatiDeco) {
          window.__pirakuPasupatiDeco.pasupatiLedMat.opacity = nightLevel * 0.95;
          window.__pirakuPasupatiDeco.pasupatiLedMat.color.setHSL(hueBase, 1.0, 0.56);
          window.__pirakuPasupatiDeco.pPylonLight.intensity = nightLevel * 2.8;
          window.__pirakuPasupatiDeco.pPylonLight.color.setHSL((hueBase + 0.45) % 1, 1.0, 0.55);
        }
      }
    }
    if (selfMesh && selfMesh.position) {
      if (selfMesh.position.z >= -29.2 && selfMesh.position.z <= -22.8) {
        if (selfMesh.position.x < -132.0) selfMesh.position.x = -132.0;
      } else {
        if (selfMesh.position.x < -61.0) selfMesh.position.x = -61.0;
      }
      if (selfMesh.position.x > 61.0) selfMesh.position.x = 61.0;
      if (selfMesh.position.z < -31.0) selfMesh.position.z = -31.0;
      if (selfMesh.position.z > 24.5) selfMesh.position.z = 24.5;
    }

    const cv = document.getElementById("piraku-radar-cv");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = 208, H = 208, cx = 104, cy = 110, scale = 1.38;
    const toX = wx => cx + wx * scale;
    const toY = wz => cy + wz * scale;

    ctx.clearRect(0, 0, W, H);

    // Zona taman hijau Gasibu & Monju
    ctx.fillStyle = "rgba(34, 197, 94, 0.22)";
    ctx.beginPath();
    ctx.ellipse(toX(0), toY(-11.5), 18 * scale, 11.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Trek lari biru Gasibu
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(toX(0), toY(-11.5), 14.5 * scale, 8.2 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Plaza Monumen Perjuangan (Utara)
    ctx.fillStyle = "rgba(148, 163, 184, 0.22)";
    ctx.fillRect(toX(-13), toY(-56), 26 * scale, 24 * scale);

    // Jaringan Jalan Raya Utama (Aspal & Marka)
    ctx.lineCap = "round";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 8.5;
    // Jl. Surapati (barat - timur)
    ctx.beginPath(); ctx.moveTo(toX(-75), toY(-26)); ctx.lineTo(toX(75), toY(-26)); ctx.stroke();
    // Jl. Diponegoro (barat & timur)
    ctx.lineWidth = 6.5;
    ctx.beginPath(); ctx.moveTo(toX(-75), toY(3)); ctx.lineTo(toX(-21), toY(3)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toX(21), toY(3)); ctx.lineTo(toX(75), toY(3)); ctx.stroke();
    // Poros Barat (Majapahit - Cilamaya) & Timur (Sentot - Hayam Wuruk)
    ctx.lineWidth = 6.0;
    ctx.beginPath(); ctx.moveTo(toX(-21), toY(-70)); ctx.lineTo(toX(-21), toY(65)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toX(21), toY(-70)); ctx.lineTo(toX(21), toY(65)); ctx.stroke();

    // Garis tengah marka jalan putih tipis
    ctx.strokeStyle = "rgba(226, 232, 240, 0.45)";
    ctx.lineWidth = 1.1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(toX(-75), toY(-26)); ctx.lineTo(toX(75), toY(-26)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toX(-21), toY(-70)); ctx.lineTo(toX(-21), toY(65)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toX(21), toY(-70)); ctx.lineTo(toX(21), toY(65)); ctx.stroke();
    ctx.setLineDash([]);

    // Flyover Pasupati (sisi barat di atas Jl. Surapati)
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(toX(-75), toY(-26)); ctx.lineTo(toX(-24), toY(-26)); ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(toX(-54), toY(-26), 3.2, 0, Math.PI * 2); ctx.fill();

    // Blok Gedung Landmark:
    // 1. Gedung Sate (0, 13.5)
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(toX(-16), toY(8), 32 * scale, 11 * scale);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(toX(-4.5), toY(9.5), 9 * scale, 8 * scale);

    // 2. Hotel Pullman (-34.5, -10.5)
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(toX(-39), toY(-19), 9 * scale, 17 * scale);

    // 3. Monumen Perjuangan (0, -46)
    ctx.fillStyle = "#c084fc";
    ctx.fillRect(toX(-5), toY(-49), 10 * scale, 6 * scale);

    // Label mini landmark
    ctx.fillStyle = "rgba(248, 250, 252, 0.88)";
    ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GD. SATE", toX(0), toY(27));
    ctx.fillStyle = "rgba(186, 230, 253, 0.85)";
    ctx.font = "bold 9px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("GASIBU", toX(0), toY(-10));
    ctx.fillStyle = "rgba(216, 180, 254, 0.85)";
    ctx.fillText("MONJU", toX(0), toY(-53));

    // Penunjuk arah mata angin Utara (U)
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("U", cx, 15);

    // Penanda Pemain + Arah Hadap (View Cone)
    if (selfMesh && selfMesh.position) {
      const sx = Math.max(18, Math.min(W - 18, toX(selfMesh.position.x)));
      const sy = Math.max(18, Math.min(H - 18, toY(selfMesh.position.z)));
      const rot = selfMesh.rotation ? -selfMesh.rotation.y + Math.PI / 2 : 0;

      // Sorot arah hadap karakter
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(rot);
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
      grad.addColorStop(0, "rgba(253, 224, 71, 0.55)");
      grad.addColorStop(1, "rgba(253, 224, 71, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 22, -0.48, 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Cincin pulse & titik kuning karakter
      const pulse = 7.5 + Math.sin((t || 0) * 5) * 1.8;
      ctx.strokeStyle = "rgba(253, 224, 71, 0.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(sx, sy, pulse, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#fde047";
      ctx.beginPath(); ctx.arc(sx, sy, 5.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.6;
      ctx.stroke();
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
