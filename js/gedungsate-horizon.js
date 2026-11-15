// ================= PIRAKUBDG: PETA SEKITAR GEDUNG SATE & HORIZON CEKUNGAN BANDUNG =================
(function() {
  function buildBandungBasinAndGedungSate() {
    if (typeof scene === 'undefined' || !scene || typeof THREE === 'undefined') {
      setTimeout(buildBandungBasinAndGedungSate, 300);
      return;
    }
    if (scene.getObjectByName('bandung-basin-horizon')) return;

    const envGroup = new THREE.Group();
    envGroup.name = 'bandung-basin-horizon';

    // 1. HAMPARAN DARATAN LUAS (Menghilangkan kesan map kotak melayang di cakrawala)
    const groundSkirt = new THREE.Mesh(
      new THREE.CircleGeometry(950, 48),
      new THREE.MeshStandardMaterial({
        color: 0x5c7c4e,
        roughness: 0.95,
        metalness: 0.0
      })
    );
    groundSkirt.rotation.x = -Math.PI / 2;
    groundSkirt.position.y = -0.18;
    groundSkirt.receiveShadow = true;
    envGroup.add(groundSkirt);

    // 2. HORIZON PEGUNUNGAN CEKUNGAN BANDUNG 360 DERAJAT (Termasuk Siluet Tangkuban Parahu)
    const ridgeOuterMat = new THREE.MeshStandardMaterial({
      color: 0x6b8cae,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: true
    });
    const ridgeInnerMat = new THREE.MeshStandardMaterial({
      color: 0x4f745c,
      roughness: 0.92,
      metalness: 0.0,
      flatShading: true
    });

    function createMountainRing(radius, segments, baseHeight, variation, mat, isOuter) {
      const geo = new THREE.CylinderGeometry(radius, radius + 90, 1, segments, 1, true);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) {
          const x = pos.getX(i);
          const z = pos.getZ(i);
          const angle = Math.atan2(z, x);

          // Gelombang perbukitan alami Cekungan Bandung
          let h = baseHeight
            + Math.sin(angle * 5.0) * variation * 0.45
            + Math.cos(angle * 11.0 + 0.8) * variation * 0.3
            + Math.sin(angle * 23.0) * variation * 0.15;

          // Siluet khas Gunung Tangkuban Parahu (puncak datar memanjang di sisi Utara: angle ~ -PI/2)
          const northDiff = Math.abs(Math.atan2(Math.sin(angle + Math.PI / 2), Math.cos(angle + Math.PI / 2)));
          if (northDiff < 0.32 && isOuter) {
            const plateau = 1.0 - (northDiff / 0.32);
            h += Math.min(plateau * 38, 26); // puncak datar khas perahu terbalik
          }

          // Siluet Gunung Manglayang di Timur Laut (angle ~ -PI/5)
          const eastDiff = Math.abs(Math.atan2(Math.sin(angle + Math.PI / 5), Math.cos(angle + Math.PI / 5)));
          if (eastDiff < 0.18 && isOuter) {
            h += (1.0 - eastDiff / 0.18) * 32;
          }

          pos.setY(i, Math.max(8, h));
        } else {
          pos.setY(i, -2);
        }
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.material.side = THREE.DoubleSide;
      return mesh;
    }

    const outerMountains = createMountainRing(540, 96, 36, 22, ridgeOuterMat, true);
    const innerHills = createMountainRing(380, 72, 18, 12, ridgeInnerMat, false);
    envGroup.add(outerMountains, innerHills);

    // 3. PENATAAN PETA ASLI SEKITARAN GEDUNG SATE & LAPANGAN GASIBU
    // Poros Utara-Selatan: Lapangan Gasibu (Utara, z ~ -26) <-> Jl. Diponegoro (z ~ -11) <-> Gedung Sate (Selatan)
    const mapGroup = new THREE.Group();
    mapGroup.name = 'gedung-sate-real-layout';

    // Lapangan Gasibu (Trek Lari Oval Merah-Terakota + Rumput Hijau Tengah)
    const gasibuX = 0;
    const gasibuZ = -26;

    const gasibuOuterGrass = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 18),
      new THREE.MeshStandardMaterial({ color: 0x5f8d4e, roughness: 0.9 })
    );
    gasibuOuterGrass.rotation.x = -Math.PI / 2;
    gasibuOuterGrass.position.set(gasibuX, 0.04, gasibuZ);
    gasibuOuterGrass.receiveShadow = true;
    mapGroup.add(gasibuOuterGrass);

    const runningTrack = new THREE.Mesh(
      new THREE.RingGeometry(4.6, 6.2, 48),
      new THREE.MeshStandardMaterial({ color: 0xd97736, roughness: 0.85 })
    );
    runningTrack.rotation.x = -Math.PI / 2;
    runningTrack.scale.set(2.2, 1.05, 1);
    runningTrack.position.set(gasibuX, 0.06, gasibuZ);
    runningTrack.receiveShadow = true;
    mapGroup.add(runningTrack);

    const innerField = new THREE.Mesh(
      new THREE.CircleGeometry(4.6, 48),
      new THREE.MeshStandardMaterial({ color: 0x4d7c3f, roughness: 0.92 })
    );
    innerField.rotation.x = -Math.PI / 2;
    innerField.scale.set(2.2, 1.05, 1);
    innerField.position.set(gasibuX, 0.065, gasibuZ);
    innerField.receiveShadow = true;
    mapGroup.add(innerField);

    // Koridor Jl. Diponegoro (Timur-Barat di depan Gedung Sate) & Jl. Hayam Wuruk / Sentot Alibasyah
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.88 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 });

    // Jl. Diponegoro (membentang Timur-Barat di z = -12)
    const jlDiponegoro = new THREE.Mesh(new THREE.PlaneGeometry(110, 6.5), roadMat);
    jlDiponegoro.rotation.x = -Math.PI / 2;
    jlDiponegoro.position.set(0, 0.05, -12);
    jlDiponegoro.receiveShadow = true;
    mapGroup.add(jlDiponegoro);

    // Garis Marka Tengah Jl. Diponegoro
    for (let mx = -48; mx <= 48; mx += 6) {
      const dash = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 0.22),
        new THREE.MeshBasicMaterial({ color: 0xf8fafc })
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(mx, 0.065, -12);
      mapGroup.add(dash);
    }

    // Jalan Pengapit Barat (Jl. Sentot Alibasyah) & Timur (Jl. Hayam Wuruk / Cilamaya)
    [-21, 21].forEach(roadX => {
      const sideRoad = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 54), roadMat);
      sideRoad.rotation.x = -Math.PI / 2;
      sideRoad.position.set(roadX, 0.048, -14);
      sideRoad.receiveShadow = true;
      mapGroup.add(sideRoad);
    });

    // Museum Pos Indonesia (Sisi Timur Gedung Sate - Bangunan Indische Putih-Krem)
    const museumPos = new THREE.Group();
    const posBody = new THREE.Mesh(
      new THREE.BoxGeometry(10, 4.2, 7),
      new THREE.MeshStandardMaterial({ color: 0xf1ece1, roughness: 0.85 })
    );
    posBody.position.y = 2.1;
    posBody.castShadow = true;
    posBody.receiveShadow = true;
    const posRoof = new THREE.Mesh(
      new THREE.ConeGeometry(7.6, 2.2, 4),
      new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.9, flatShading: true })
    );
    posRoof.rotation.y = Math.PI / 4;
    posRoof.position.y = 5.3;
    museumPos.add(posBody, posRoof);
    museumPos.position.set(30, 0, -2);
    mapGroup.add(museumPos);

    // Taman Lansia & Kolam/Aliran Air di Sisi Tenggara Gedung Sate
    const tamanLansia = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 16),
      new THREE.MeshStandardMaterial({ color: 0x4d7c3f, roughness: 0.9 })
    );
    tamanLansia.rotation.x = -Math.PI / 2;
    tamanLansia.position.set(31, 0.045, 14);
    tamanLansia.receiveShadow = true;
    mapGroup.add(tamanLansia);

    const creek = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 15),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.1 })
    );
    creek.rotation.x = -Math.PI / 2;
    creek.position.set(33, 0.06, 14);
    mapGroup.add(creek);

    // Pohon Peneduh Rapi di Sepanjang Trotoar Jl. Diponegoro & Perimeter Gasibu
    const trunkGeo = new THREE.CylinderGeometry(0.16, 0.22, 1.8, 6);
    const crownGeo = new THREE.DodecahedronGeometry(1.35, 1);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.85, flatShading: true });

    const treeCoords = [
      [-16, -16], [-8, -16], [0, -16], [8, -16], [16, -16],
      [-16, -8.2], [-9, -8.2], [9, -8.2], [16, -8.2],
      [-17, -26], [-17, -33], [17, -26], [17, -33],
      [25, 10], [27, 17], [36, 11], [36, 18]
    ];

    treeCoords.forEach(([tx, tz], idx) => {
      const tree = new THREE.Group();
      const tr = new THREE.Mesh(trunkGeo, trunkMat);
      tr.position.y = 0.9;
      tr.castShadow = true;
      const cr = new THREE.Mesh(crownGeo, leafMat);
      cr.position.y = 2.5;
      cr.scale.setScalar(0.85 + (idx % 3) * 0.15);
      cr.castShadow = true;
      tree.add(tr, cr);
      tree.position.set(tx, 0, tz);
      mapGroup.add(tree);
    });

    envGroup.add(mapGroup);
    scene.add(envGroup);

    // Pertajam sedikit kabut jarak jauh agar horizon pegunungan menyatu alami
    scene.traverse(o => { if (o.name && /tram|rel|coin/i.test(o.name)) o.visible = false; }); if (typeof tram !== "undefined" && tram) tram.visible = false; if (scene.fog) {
      scene.fog.density = Math.max(scene.fog.density, 0.00125);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(buildBandungBasinAndGedungSate, 600));
  } else {
    setTimeout(buildBandungBasinAndGedungSate, 600);
  }
})();