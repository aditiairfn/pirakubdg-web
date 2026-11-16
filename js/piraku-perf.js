// piraku-perf.js — Mobile Thermal, Battery & GPU Optimizer untuk PirakuBDG 3D
(function () {
  "use strict";

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 820;
  let lastInteractionTime = Date.now();
  let isTabHidden = document.hidden;

  function markActive() {
    lastInteractionTime = Date.now();
  }

  ["pointerdown", "pointermove", "touchstart", "touchmove", "keydown", "wheel"].forEach(function (evt) {
    window.addEventListener(evt, markActive, { passive: true });
  });

  document.addEventListener("visibilitychange", function () {
    isTabHidden = document.hidden;
    if (!isTabHidden) markActive();
  });

  // Optimasi CSS ringan di mobile agar GPU tidak panas karena backdrop-filter berlapis
  if (isMobile) {
    const style = document.createElement("style");
    style.id = "piraku-mobile-thermal-css";
    style.textContent = `
      @media (max-width: 820px) {
        .bottom-nav-dock, #piraku-civic-modal, #bottom-control-panel {
          backdrop-filter: blur(4px) !important;
          -webkit-backdrop-filter: blur(4px) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Pantau & optimalkan WebGLRenderer saat sudah terinisialisasi di window
  function applyRendererOptimizations() {
    const renderer = window.pirakuRenderer || window.renderer;
    if (!renderer || renderer.__pirakuThermalPatched) return;
    renderer.__pirakuThermalPatched = true;

    // 1. Batasi pixelRatio agar GPU HP tidak merender 3x-4x lipat piksel
    const maxDpr = isMobile ? 1.35 : 1.75;
    const targetDpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    renderer.setPixelRatio(targetDpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    // 2. Hemat shadow map di HP (render bayangan statis sekali saja, tidak tiap frame)
    if (isMobile && renderer.shadowMap && renderer.shadowMap.enabled) {
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = true;
    }

    // 3. Throttle renderer.render() berbasis aktivitas & tab visibility
    const origRender = renderer.render.bind(renderer);
    let lastRenderTimestamp = 0;

    renderer.render = function (scene, camera) {
      if (isTabHidden) return;

      const now = performance.now();
      const civicModal = document.getElementById("piraku-civic-modal");
      const isModalOpen = civicModal && civicModal.style.display === "flex";
      const isIdle = Date.now() - lastInteractionTime > 4500;

      // Target FPS adaptif:
      // - Tab hidden: 0 FPS
      // - Modal terbuka / idle > 4.5 detik: 15 FPS (66ms) -> HP langsung dingin
      // - Aktif di Mobile: 36 FPS (27ms) -> mulus tapi hemat GPU
      // - Aktif di Desktop: 60 FPS (16ms)
      let minFrameInterval = isMobile ? 27 : 15;
      if (isModalOpen || isIdle) {
        minFrameInterval = 66;
      }

      if (now - lastRenderTimestamp < minFrameInterval) {
        return;
      }
      lastRenderTimestamp = now;
      origRender(scene, camera);
    };

    window.addEventListener("resize", function () {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    }, { passive: true });
  }

  // Jalankan pengecekan sampai renderer Three.js siap
  const bootInterval = setInterval(function () {
    if (window.pirakuRenderer || window.renderer) {
      applyRendererOptimizations();
      clearInterval(bootInterval);
    }
  }, 400);
})();

// ================= 2. DISTANCE CULLING & SHADOW OPTIMIZER =================
(function () {
  const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 820;

  function runSceneCulling() {
    const scene = window.pirakuScene;
    const cam = window.pirakuCamera || window.camera;
    if (!scene || !cam) return;

    const camPos = cam.position;
    const maxDistSq = isMobileDevice ? 68 * 68 : 115 * 115;

    scene.traverse(function (obj) {
      if (!obj.isMesh && !obj.isGroup) return;

      // Matikan castShadow untuk objek dekorasi kecil di HP
      if (isMobileDevice && obj.isMesh && obj.castShadow) {
        if (obj.geometry && obj.geometry.boundingSphere) {
          if (obj.geometry.boundingSphere.radius < 1.2) {
            obj.castShadow = false;
          }
        }
      }

      // Distance culling untuk objek props/rumah/pohon yang punya posisi dunia
      if (obj.userData && obj.userData.cullable) {
        const dx = obj.position.x - camPos.x;
        const dz = obj.position.z - camPos.z;
        obj.visible = (dx * dx + dz * dz) <= maxDistSq;
      }
    });

    // Culling khusus grup rumah warga & objek jauh
    const housesGrp = scene.getObjectByName("piraku-district-houses");
    if (housesGrp) {
      housesGrp.children.forEach(function (house) {
        const dx = house.position.x - camPos.x;
        const dz = house.position.z - camPos.z;
        house.visible = (dx * dx + dz * dz) <= maxDistSq;
      });
    }
  }

  // Jalankan distance culling tiap 600ms (ringan di CPU, hemat besar di GPU)
  setInterval(runSceneCulling, 600);
})();
