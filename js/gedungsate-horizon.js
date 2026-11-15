// ================= PIRAKUBDG: KALIBRASI PETA ASLI GEDUNG SATE & HORIZON BANDUNG =================
(function() {
  function syncGedungSateAndHorizon() {
    if (typeof scene === 'undefined' || !scene || typeof THREE === 'undefined') {
      setTimeout(syncGedungSateAndHorizon, 300);
      return;
    }
    const old = scene.getObjectByName('bandung-basin-horizon');
    if (old) scene.remove(old);

    const envGroup = new THREE.Group();
    envGroup.name = 'bandung-basin-horizon';

    // 1. HAMPARAN DARATAN CEKUNGAN BANDUNG (Menghilangkan kesan map terpotong kotak)
    const groundSkirt = new THREE.Mesh(
      new THREE.CircleGeometry(950, 48),
      new THREE.MeshStandardMaterial({ color: 0x5c7c4e, roughness: 0.95, metalness: 0.0 })
    );
    groundSkirt.rotation.x = -Math.PI / 2;
    groundSkirt.position.y = -0.18;
    groundSkirt.receiveShadow = true;
    envGroup.add(groundSkirt);

    // 2. HORIZON PEGUNUNGAN CEKUNGAN BANDUNG 360 DERAJAT (Tangkuban Parahu di Utara, Manglayang di Timur)
    const ridgeOuterMat = new THREE.MeshStandardMaterial({
      color: 0x6b8cae, roughness: 0.95, metalness: 0.0, flatShading: true, side: THREE.DoubleSide
    });
    const ridgeInnerMat = new THREE.MeshStandardMaterial({
      color: 0x4f745c, roughness: 0.92, metalness: 0.0, flatShading: true, side: THREE.DoubleSide
    });

    function createMountainRing(radius, segments, baseHeight, variation, mat, isOuter) {
      const geo = new THREE.CylinderGeometry(radius, radius + 90, 1, segments, 1, true);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) {
          const x = pos.getX(i), z = pos.getZ(i);
          const angle = Math.atan2(z, x);
          let h = baseHeight
            + Math.sin(angle * 5.0) * variation * 0.45
            + Math.cos(angle * 11.0 + 0.8) * variation * 0.3
            + Math.sin(angle * 23.0) * variation * 0.15;

          // Siluet Gunung Tangkuban Parahu (Utara: angle ~ -PI/2)
          const northDiff = Math.abs(Math.atan2(Math.sin(angle + Math.PI / 2), Math.cos(angle + Math.PI / 2)));
          if (northDiff < 0.32 && isOuter) {
            h += Math.min((1.0 - northDiff / 0.32) * 38, 26);
          }
          // Siluet Gunung Manglayang (Timur Laut: angle ~ -PI/5)
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
      return new THREE.Mesh(geo, mat);
    }

    envGroup.add(
      createMountainRing(540, 96, 36, 22, ridgeOuterMat, true),
      createMountainRing(380, 72, 18, 12, ridgeInnerMat, false)
    );

    // 3. DETAIL ASLI KAWASAN GASIBU & GEDUNG SATE (Presisi di antara Surapati z=-26 & Diponegoro z=3)
    const detailGroup = new THREE.Group();

    // Lapangan Gasibu tepat di blok (x: -17..17, z: -21..-1.5)
    const gasibuX = 0, gasibuZ = -11.5;
    const runningTrack = new THREE.Mesh(
      new THREE.RingGeometry(4.2, 5.6, 48),
      new THREE.MeshStandardMaterial({ color: 0xd97736, roughness: 0.85 })
    );
    runningTrack.rotation.x = -Math.PI / 2;
    runningTrack.scale.set(2.35, 1.15, 1);
    runningTrack.position.set(gasibuX, 0.16, gasibuZ);
    runningTrack.receiveShadow = true;
    detailGroup.add(runningTrack);

    const innerGrass = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 48),
      new THREE.MeshStandardMaterial({ color: 0x4d7c3f, roughness: 0.92 })
    );
    innerGrass.rotation.x = -Math.PI / 2;
    innerGrass.scale.set(2.35, 1.15, 1);
    innerGrass.position.set(gasibuX, 0.165, gasibuZ);
    innerGrass.receiveShadow = true;
    detailGroup.add(innerGrass);

    // Zebra Cross Penyebrangan Utama Gasibu <-> Gerbang Gedung Sate (Jl. Diponegoro x=0, z=3)
    for (let i = -3; i <= 3; i++) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(0.45, 4.6),
        new THREE.MeshBasicMaterial({ color: 0xf8fafc })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(i * 0.85, 0.175, 3);
      detailGroup.add(stripe);
    }

    // Museum Pos Indonesia (Sisi Timur Gedung Sate: x = 28, z = 12)
    const museumPos = new THREE.Group();
    const posBody = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 4.0, 6.2),
      new THREE.MeshStandardMaterial({ color: 0xf1ece1, roughness: 0.85 })
    );
    posBody.position.y = 2.0;
    posBody.castShadow = true;
    posBody.receiveShadow = true;
    const posRoof = new THREE.Mesh(
      new THREE.ConeGeometry(6.6, 2.0, 4),
      new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.9, flatShading: true })
    );
    posRoof.rotation.y = Math.PI / 4;
    posRoof.position.y = 5.0;
    museumPos.add(posBody, posRoof);
    museumPos.position.set(28, 0, 12);
    detailGroup.add(museumPos);

    envGroup.add(detailGroup);
    scene.add(envGroup);

    if (scene.fog) {
      scene.fog.density = Math.max(scene.fog.density, 0.0012);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(syncGedungSateAndHorizon, 650));
  } else {
    setTimeout(syncGedungSateAndHorizon, 650);
  }
})();