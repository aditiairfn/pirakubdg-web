// ================= KUNCI SUPABASE =================
const SUPABASE_URL = "https://myilyqnawceobqedjbfa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sOY6Z9Qa8aILpSL3otVpRA_tx7RyGvf";

let supabaseClient = null;
if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL.startsWith('http')) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.pirakuSupabase = supabaseClient;
}

// Variabel waktu global
window.clockTime = 0;

// ================= POOL MASTER MISI HARIAN (ROTASI ACAK) =================
const ALL_QUEST_POOL = [
  {
    id: "skate_cikapayang", title: "Main Skateboard di Cikapayang", target: { x: -55, z: -40 }, radius: 7.5, xpReward: 85, color: 0x06b6d4,
    stayDuration: 2.0, timer: 0, isCompleted: false, mesh: null
  },
  {
    id: "jogging_saparua", title: "Lari Keliling Trek Saparua", target: { x: 50, z: 25 }, radius: 8.0, xpReward: 90, color: 0xef4444,
    stayDuration: 2.5, timer: 0, isCompleted: false, mesh: null
  },
  {
    id: "kuliner_cisangkuy", title: "Jajan Kuliner di Cisangkuy", target: { x: 38, z: -10 }, radius: 7.0, xpReward: 75, color: 0x10b981,
    stayDuration: 1.5, timer: 0, isCompleted: false, mesh: null
  },
  {
    id: "halte_cilaki", title: "Jalan Santai ke Jl. Cilaki", target: { x: 31, z: 16 }, radius: 7.0, xpReward: 70, color: 0x06b6d4,
    stayDuration: 0, timer: 0, isCompleted: false, mesh: null
  },
  {
    id: "halte_cimandiri", title: "Mampir ke Taman Cimandiri", target: { x: 0, z: 32 }, radius: 7.0, xpReward: 80, color: 0xa855f7,
    stayDuration: 0, timer: 0, isCompleted: false, mesh: null
  },
  {
    id: "halte_riau", title: "Jelajah Koridor Jl. Riau", target: { x: -36, z: 16 }, radius: 7.0, xpReward: 70, color: 0xf97316,
    stayDuration: 0, timer: 0, isCompleted: false, mesh: null
  },
  {
    id: "visit_gasibu",
    title: "Nongkrong di Lapangan Gasibu",
    target: { x: 0, z: -8 },
    radius: 7.0,
    xpReward: 50,
    color: 0x3b82f6,
    stayDuration: 2.5,
    timer: 0,
    isCompleted: false,
    mesh: null
  },
  {
    id: "visit_gedung_sate",
    title: "Apel di Gerbang Gedung Sate",
    target: { x: 0, z: 13.5 },
    radius: 8.0,
    xpReward: 75,
    color: 0x10b981,
    stayDuration: 0,
    timer: 0,
    isCompleted: false,
    mesh: null
  },
  {
    id: "under_pasupati",
    title: "Menjelajah Kolong Pasupati",
    target: { x: -27, z: -26 },
    radius: 7.5,
    xpReward: 60,
    color: 0xf59e0b,
    stayDuration: 0,
    timer: 0,
    isCompleted: false,
    mesh: null
  },
  {
    id: "visit_pilon",
    title: "Foto di Pilon Merah Putih",
    target: { x: -27, z: -23.5 },
    radius: 6.5,
    xpReward: 65,
    color: 0xef4444,
    stayDuration: 2.0,
    timer: 0,
    isCompleted: false,
    mesh: null
  },
  {
    id: "visit_kafe_dutch",
    title: "Ngopi di Vila Kolonial",
    target: { x: -32, z: -14 },
    radius: 7.0,
    xpReward: 55,
    color: 0x8b5cf6,
    stayDuration: 2.0,
    timer: 0,
    isCompleted: false,
    mesh: null
  },
  {
    id: "visit_perumahan",
    title: "Sapa Warga di Perumahan Baru",
    target: { x: 26, z: -16 },
    radius: 7.5,
    xpReward: 70,
    color: 0xec4899,
    stayDuration: 1.5,
    timer: 0,
    isCompleted: false,
    mesh: null
  },
  {
    id: "visit_billboard",
    title: "Baca Berita di Megatron LED",
    target: { x: -16, z: -18 },
    radius: 6.5,
    xpReward: 50,
    color: 0x06b6d4,
    stayDuration: 0,
    timer: 0,
    isCompleted: false,
    mesh: null
  }
];

function getDailyRotatedQuests(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const poolCopy = ALL_QUEST_POOL.map(q => ({ ...q }));
  for (let i = poolCopy.length - 1; i > 0; i--) {
    const j = (hash + i * 17) % (i + 1);
    const temp = poolCopy[i];
    poolCopy[i] = poolCopy[j];
    poolCopy[j] = temp;
  }
  return poolCopy.slice(0, 3);
}

class QuestSystem {
  constructor(sceneInstance, supabaseInst, userData) {
    this.scene = sceneInstance;
    this.supabase = supabaseInst;
    this.warga = userData;
    const dNow = new Date();
    this.todayStr = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, "0")}-${String(dNow.getDate()).padStart(2, "0")}`;
    const cleanQIg = String(userData?.ig || localStorage.getItem("piraku_my_ig") || "guest").trim().toLowerCase().replace(/^@/, "");
    this.storageKey = "piraku_quests_" + this.todayStr + "_" + (cleanQIg || "guest");
    this.quests = getDailyRotatedQuests(this.todayStr);
    this.init();
  }

  async init() {
    this.loadLocalCompleted();
    await this.fetchCompletedQuests();
    this.spawnCheckpointMarkers();
    this.updateTrackerCard(null);
  }

  loadLocalCompleted() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const completedIds = JSON.parse(saved);
        this.quests.forEach(quest => {
          if (completedIds.includes(quest.id)) {
            quest.isCompleted = true;
          }
        });
      }
    } catch(e) {}
  }

  async fetchCompletedQuests() {
    if (!this.warga || !this.warga.id || !this.supabase) return;
    try {
      const { data, error } = await this.supabase
        .from("warga_daily_quests")
        .select("quest_id")
        .eq("warga_id", this.warga.id)
        .eq("completed_date", this.todayStr);

      if (data && !error && data.length > 0) {
        const completedIds = data.map(q => q.quest_id);
        const localSaved = JSON.parse(localStorage.getItem(this.storageKey) || "[]");
        const merged = Array.from(new Set([...localSaved, ...completedIds]));
        localStorage.setItem(this.storageKey, JSON.stringify(merged));

        this.quests.forEach(quest => {
          if (merged.includes(quest.id)) {
            quest.isCompleted = true;
            if (quest.mesh) quest.mesh.visible = false;
          }
        });
        this.updateTrackerCard(null);
      }
    } catch(e) {}
  }

  spawnCheckpointMarkers() {
    this.quests.forEach(quest => {
      const markerGroup = new THREE.Group();

      const ringGeo = new THREE.RingGeometry(quest.radius - 0.6, quest.radius, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: quest.color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.15;
      markerGroup.add(ringMesh);

      const innerRingGeo = new THREE.RingGeometry(0.2, quest.radius * 0.4, 32);
      const innerRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      innerRing.rotation.x = -Math.PI / 2;
      innerRing.position.y = 0.16;
      markerGroup.add(innerRing);

      const beaconGeo = new THREE.CylinderGeometry(quest.radius * 0.7, quest.radius * 0.85, 12, 32, 1, true);
      const beaconMat = new THREE.MeshBasicMaterial({ color: quest.color, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 6.0;
      markerGroup.add(beaconMesh);

      const diamondGeo = new THREE.OctahedronGeometry(1.0, 0);
      const diamondMat = new THREE.MeshBasicMaterial({ color: quest.color });
      const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
      diamondMesh.position.y = 4.2;
      markerGroup.add(diamondMesh);

      markerGroup.position.set(quest.target.x, 0, quest.target.z);
      if (quest.isCompleted) markerGroup.visible = false;
      quest.mesh = markerGroup;
      quest.innerRing = innerRing;
      quest.diamond = diamondMesh;
      this.scene.add(markerGroup);
    });

    const card = document.getElementById("quest-tracker-card");
    if (card && this.quests.some(q => !q.isCompleted)) card.style.display = "block";
  }

  update(delta, playerPos) {
    if (!playerPos) return;
    this.updateTrackerCard(playerPos);

    const nowSec = performance.now() * 0.001;

    this.quests.forEach(quest => {
      if (quest.isCompleted) return;
      if (quest.mesh) {
        quest.mesh.rotation.y += delta * 0.75;
        if (quest.innerRing) {
          const sc = 1.0 + Math.sin(nowSec * 4) * 0.25;
          quest.innerRing.scale.set(sc, sc, sc);
        }
        if (quest.diamond) {
          quest.diamond.rotation.y += delta * 2;
          quest.diamond.position.y = 4.2 + Math.sin(nowSec * 3) * 0.35;
        }
      }

      const distance = Math.hypot(playerPos.x - quest.target.x, playerPos.z - quest.target.z);
      if (distance <= quest.radius + 1.5) {
        if (quest.stayDuration > 0) {
          quest.timer += delta;
          if (quest.timer >= quest.stayDuration) this.completeQuest(quest);
        } else {
          this.completeQuest(quest);
        }
      } else {
        quest.timer = Math.max(0, quest.timer - delta);
      }
    });
  }

  updateTrackerCard(playerPos) {
    const card = document.getElementById("quest-tracker-card");
    if (!card) return;

    const uncompleted = this.quests.filter(q => !q.isCompleted);
    const completedCount = this.quests.length - uncompleted.length;
    const countEl = document.getElementById("quest-progress-count");
    if (countEl) countEl.innerText = `${completedCount}/${this.quests.length}`;

    if (uncompleted.length === 0) {
      const titleEl = document.getElementById("quest-current-title");
      if (titleEl) titleEl.innerHTML = "🎉 Semua Misi Hari Ini Selesai!";
      const distEl = document.getElementById("quest-distance-text");
      if (distEl) distEl.innerText = "Sampai jumpa besok!";
      const rewEl = document.getElementById("quest-reward-text");
      if (rewEl) rewEl.innerText = "100%";
      setTimeout(() => {
        if (card && this.quests.every(q => q.isCompleted)) {
          card.style.display = "none";
        }
      }, 4000);
      return;
    }

    let nearest = uncompleted[0];
    let minDistance = 9999;

    if (playerPos) {
      uncompleted.forEach(q => {
        const d = Math.hypot(playerPos.x - q.target.x, playerPos.z - q.target.z);
        if (d < minDistance) {
          minDistance = d;
          nearest = q;
        }
      });
    }

    const titleEl = document.getElementById("quest-current-title");
    const distEl = document.getElementById("quest-distance-text");
    const rewEl = document.getElementById("quest-reward-text");

    if (titleEl) {
      if (nearest.stayDuration > 0 && nearest.timer > 0) {
        const remaining = Math.max(0, nearest.stayDuration - nearest.timer).toFixed(1);
        titleEl.innerHTML = `⏳ Tunggu ${remaining}s di ${nearest.title}`;
      } else {
        titleEl.innerText = nearest.title;
      }
    }
    if (distEl) distEl.innerText = playerPos ? `📍 Jarak: ${Math.round(minDistance * 2)}m` : "📍 Ikuti pilar cahaya";
    if (rewEl) rewEl.innerText = `+${nearest.xpReward} XP`;
  }

  async completeQuest(quest) {
    quest.isCompleted = true;
    if (quest.mesh) {
      gsap.to(quest.mesh.scale, { 
        x: 0.001, y: 0.001, z: 0.001, duration: 0.45, 
        onComplete: () => { 
          quest.mesh.visible = false;
          if (quest.mesh.parent) quest.mesh.parent.remove(quest.mesh);
        } 
      });
    }

    try {
      const localSaved = JSON.parse(localStorage.getItem(this.storageKey) || "[]");
      if (!localSaved.includes(quest.id)) {
        localSaved.push(quest.id);
        localStorage.setItem(this.storageKey, JSON.stringify(localSaved));
      }
    } catch(e) {}

    this.showQuestToast(quest.title, quest.xpReward);
    if (typeof window.playSynthTone === 'function') window.playSynthTone(1050, "sine", 0.4);
    await this.applyReward(quest);
  }

  async applyReward(quest) {
    if (!this.warga) return;
    let currentXP = (parseInt(localStorage.getItem("piraku_my_xp") || "0", 10) || parseInt(this.warga.xp, 10) || 0) + quest.xpReward;
    let currentLvl = Math.floor(currentXP / 100) + 1;

    if (typeof window.grantPirakuXP === "function") {
      const info = await window.grantPirakuXP(quest.xpReward, quest.title);
      currentXP = parseInt(localStorage.getItem("piraku_my_xp") || String(currentXP), 10);
      currentLvl = info ? info.level : parseInt(localStorage.getItem("piraku_my_level") || String(currentLvl), 10);
    } else {
      localStorage.setItem("piraku_my_level", currentLvl);
      localStorage.setItem("piraku_my_xp", currentXP);
      if (typeof window.updateAutoDetectButton === "function") window.updateAutoDetectButton();
    }

    this.warga.xp = currentXP;
    this.warga.level = currentLvl;

    const client = this.supabase || supabaseClient;
    if (client && this.warga.id) {
      try {
        await client.from("warga_daily_quests").insert([{ warga_id: this.warga.id, quest_id: quest.id, completed_date: this.todayStr }]);
      } catch (err) {}
    }
  }

  showQuestToast(name, xp) {
    const toast = document.getElementById("quest-toast");
    const nameEl = document.getElementById("toast-quest-name");
    const xpEl = document.getElementById("toast-quest-xp");
    if (!toast) return;
    nameEl.innerText = name;
    xpEl.innerText = xp;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0px)";
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(-20px)";
    }, 3200);
  }
}

let activeQuestSystem = null;

(function () {
  'use strict';
  const container = document.getElementById('webgl-canvas');
  let W = window.innerWidth, H = window.innerHeight;
  const PI = Math.PI;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // Web Audio Synth Generator
  const audioCtx = window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let isAmbiencePlaying = false, windGain = null, cricketsGain = null;

    function initAmbienceSound() {
    // Angin dan jangkrik dimatikan total di sini, efek suara lain dibiarkan jalan normal
    return;
  }

  window.syncAmbienceAudioState = function() {
    const sfxOn = (typeof window.isPirakuSfxEnabled === "function") ? window.isPirakuSfxEnabled() : !window.pirakuSoundMuted;
    if (!sfxOn) {
      if (windGain) {
        try {
          windGain.gain.cancelScheduledValues(audioCtx.currentTime);
          windGain.gain.setValueAtTime(0, audioCtx.currentTime);
        } catch(e){}
      }
      if (cricketsGain) {
        try {
          cricketsGain.gain.cancelScheduledValues(audioCtx.currentTime);
          cricketsGain.gain.setValueAtTime(0, audioCtx.currentTime);
        } catch(e){}
      }
    } else {
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      if (isAmbiencePlaying && windGain) {
        try {
          windGain.gain.cancelScheduledValues(audioCtx.currentTime);
          windGain.gain.setValueAtTime(0, audioCtx.currentTime);
        } catch(e){}
      }
    }
  };

  window._pirakuAutoAmbienceStarted = false;
  ["pointerdown", "keydown"].forEach(ev => {
    window.addEventListener(ev, () => {
      if (window._pirakuAutoAmbienceStarted) return;
      if (typeof window.isPirakuSfxEnabled === "function" && !window.isPirakuSfxEnabled()) return;
      window._pirakuAutoAmbienceStarted = true;
      initAmbienceSound();
      isAmbiencePlaying = true;
      if (windGain) windGain.gain.setValueAtTime(0, audioCtx.currentTime);
    }, { passive: true });
  });

  window.toggleAmbienceAudio = function() {
    isAmbiencePlaying = !isAmbiencePlaying;
    if (isAmbiencePlaying) {
      if (windGain) windGain.gain.setValueAtTime(0, audioCtx.currentTime);
      showToast('Soundscape kota Bandung aktif 🍃');
    } else {
      if (windGain) windGain.gain.setValueAtTime(0, audioCtx.currentTime);
      if (cricketsGain) cricketsGain.gain.setValueAtTime(0, audioCtx.currentTime);
      showToast('Soundscape dinonaktifkan 🔇');
    }
  };

  window.playSynthTone = function(freq, type, duration) {
    if (typeof window.isPirakuSfxEnabled === "function" ? !window.isPirakuSfxEnabled() : !!window.pirakuSoundMuted) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e){}
  };

  window._pirakuStepTimer = 0;
  window._pirakuLastStepPos = null;
  window.playFootstepSfx = function() {
    if (!myPlayerMesh || !isGrounded || (typeof isRidingTram !== "undefined" && isRidingTram)) {
      window._pirakuLastStepPos = myPlayerMesh ? { x: myPlayerMesh.position.x, z: myPlayerMesh.position.z } : null;
      return;
    }
    if (typeof window.isPirakuSfxEnabled === "function" && !window.isPirakuSfxEnabled()) return;
    const cur = myPlayerMesh.position;
    if (!window._pirakuLastStepPos) {
      window._pirakuLastStepPos = { x: cur.x, z: cur.z };
      return;
    }
    const dist = Math.hypot(cur.x - window._pirakuLastStepPos.x, cur.z - window._pirakuLastStepPos.z);
    if (dist >= 1.65) {
      window._pirakuLastStepPos = { x: cur.x, z: cur.z };
      if (typeof window.playSynthTone === "function") {
        window.playSynthTone(135, "triangle", 0.045);
      }
    }
  };

  // Dropdown Menu
  window.toggleHudMenu = function(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('hud-dropdown');
    if (menu) menu.classList.toggle('show');
    window.updateAudioMenuLabel();
  };

  window.closeHudMenu = function() {
    const menu = document.getElementById('hud-dropdown');
    if (menu) menu.classList.remove('show');
  };

  window.updateAudioMenuLabel = function() {
    const icon = document.getElementById('menu-audio-icon');
    if (icon) icon.innerText = isAmbiencePlaying ? '🔊' : '🔇';
  };

  window.addEventListener('click', () => { closeHudMenu(); });

  // Renderer & Scene
  const renderer = new THREE.WebGLRenderer({ antialias: window.innerWidth > 820, powerPreference: "high-performance", preserveDrawingBuffer: true }); window.pirakuRenderer = renderer;
  const isPirakuMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 820;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isPirakuMobile ? 1.15 : 1.35));
  renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene(); window.pirakuScene = scene;
  scene.fog = new THREE.FogExp2(0xd9e7ee, 0.00095);

  const cam = new THREE.PerspectiveCamera(40, W / H, 0.5, 1600);
  cam.position.set(-26, 26, -55);

  function syncPirakuViewportSize() {
    const vw = Math.max(container.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(container.clientHeight || 0, window.innerHeight || 0);
    if (!vw || !vh) return;
    W = vw;
    H = vh;
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
    renderer.setSize(W, H, false);
  }
  window.addEventListener('resize', syncPirakuViewportSize, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(syncPirakuViewportSize, 180), { passive: true });
  window.addEventListener('load', syncPirakuViewportSize, { once: true });
  setTimeout(syncPirakuViewportSize, 350);

  const controls = new THREE.OrbitControls(cam, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.rotateSpeed = (window.innerWidth <= 900) ? 0.85 : 0.8;
  controls.zoomSpeed = 0.9;
  controls.maxPolarAngle = PI / 2.08;
  controls.minDistance = 4.5;
  controls.maxDistance = 85; window.pirakuControls = controls;
  controls.target.set(0, 3, 5);
  if (typeof THREE !== 'undefined' && THREE.MOUSE) {
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
  }
  renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
  if (window.innerWidth <= 900 && typeof THREE !== 'undefined' && THREE.TOUCH) {
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  }

  // Pencahayaan — pagi cerah Bandung (langit biru lembut, matahari rendah, kabut tipis)
  const amb = new THREE.AmbientLight(0xfff5ea, 0.48);            // pengisi lembut, diturunkan agar kontras matahari terasa
  const hemi = new THREE.HemisphereLight(0xcfe9ff, 0x6b7d57, 0.62); // cahaya langit pagi ↔ pantulan tanah hijau Bandung
  const sun = new THREE.DirectionalLight(0xfff0d6, 1.45);        // matahari pagi, hangat tapi tidak oranye
  sun.position.set(-70, 55, 38);                                  // sudut matahari rendah → bayangan panjang khas pagi
  sun.castShadow = true;
  sun.shadow.mapSize.set(isPirakuMobile ? 1024 : 1536, isPirakuMobile ? 1024 : 1536);
  sun.shadow.bias = -0.0004;
  sun.shadow.radius = isPirakuMobile ? 1.5 : 4;                                          // bayangan lembut (PCFSoft)
  Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 1, far: 300 });
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(amb, hemi, sun, sun.target);

  const skyU = {
    top: { value: new THREE.Color(0x5fa8dd) }, bot: { value: new THREE.Color(0xd9e7ee) },
    sunC: { value: new THREE.Color(0xfff2cc) }, sunD: { value: new THREE.Vector3(-.4, .6, .5).normalize() }
  };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 24, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vW;void main(){vW=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform vec3 top;uniform vec3 bot;uniform vec3 sunC;uniform vec3 sunD;varying vec3 vW;void main(){vec3 d=normalize(vW-cameraPosition);float k=pow(clamp(d.y*1.6+.05,0.0,1.0),.55);vec3 c=mix(bot,top,k);float s=pow(max(dot(d,normalize(sunD)),0.0),48.0);c+=sunC*s*.55;gl_FragColor=vec4(c,1.0);}'
  }));
  scene.add(sky);

  // Material & Helpers
  const mats = {};
  const M = c => mats[c] || (mats[c] = new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .92, metalness: 0 }));
  const MAT = c => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .92, metalness: 0 });
  function mk(geo, c, x, y, z, p, cast = true, recv = true) {
    const m = new THREE.Mesh(geo, typeof c === 'number' ? M(c) : c);
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = recv; (p || scene).add(m); return m;
  }
  const box = (w, h, d, x, y, z, c, p, cast, recv) => mk(new THREE.BoxGeometry(w, h, d), c, x, y + h / 2, z, p, cast, recv);
  function hip(w, d, h, x, y, z, c, p) {
    const g = new THREE.ConeGeometry(.7071, 1, 4); g.rotateY(PI / 4);
    const m = mk(g, c, x, y + h / 2, z, p); m.scale.set(w, h, d); return m;
  }
  const cyl = (r1, r2, h, s, x, y, z, c, p) => mk(new THREE.CylinderGeometry(r1, r2, h, s), c, x, y + h / 2, z, p);

  const dum = new THREE.Object3D(), MA = new THREE.Matrix4(), MB = new THREE.Matrix4(), CC = new THREE.Color();
  const boxG = new THREE.BoxGeometry(1, 1, 1); boxG.translate(0, .5, 0);
  const roofG = new THREE.ConeGeometry(.7071, 1, 4); roofG.rotateY(PI / 4); roofG.translate(0, .5, 0);
  const trunkG = new THREE.CylinderGeometry(.14, .22, 1, 5); trunkG.translate(0, .5, 0);
  const crownG = new THREE.IcosahedronGeometry(1, 0), poleG = new THREE.CylinderGeometry(.07, .09, 1, 5), sphG = new THREE.SphereGeometry(1, 6, 5);
  poleG.translate(0, .5, 0);
  const cylG = new THREE.CylinderGeometry(.2, .24, 1, 6); cylG.translate(0, .5, 0);
  const clay = MAT(0xffffff);

  function IM(g, mat, n, cast = true, recv = true) {
    const m = new THREE.InstancedMesh(g, mat, Math.max(1, n));
    m.castShadow = cast; m.receiveShadow = recv; m.frustumCulled = false; scene.add(m); return m;
  }
  function setM(m, i, x, y, z, sx, sy, sz, ry = 0) {
    dum.position.set(x, y, z); dum.rotation.set(0, ry, 0);
    dum.scale.set(Math.max(.001, sx), Math.max(.001, sy), Math.max(.001, sz));
    dum.updateMatrix(); m.setMatrixAt(i, dum.matrix);
  }
  const setC = (m, i, c) => m.setColorAt(i, CC.setHex(c));

  // Tanah
  box(1400, .5, 1400, 0, -.5, 0, 0xdde1d0, null, false, true);
  box(260, .08, 220, 0, -.04, 0, MAT(0x567e51), null, false, true);
  {
    const mc = [0x8aa89a, 0x7a9a8c, 0x93b0a6, 0x86a395];
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * 2 * PI + rnd() * .2, r = 340 + rnd() * 90, h = 45 + rnd() * 75, w = 60 + rnd() * 60;
      const m = mk(new THREE.ConeGeometry(1, 1, 6), mc[i % 4], Math.cos(a) * r, h / 2 - 2, Math.sin(a) * r, null, false, false);
      m.scale.set(w, h, w); m.rotation.y = rnd() * 3;
    }
  }

  // Jalanan
  const atlas = (() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#21252d'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1600; i++) { g.fillStyle = rnd() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.12)'; g.fillRect(rnd() * 256, rnd() * 256, 2, 2); }
    g.fillStyle = '#f8fafc'; g.fillRect(14, 0, 6, 256); g.fillRect(236, 0, 6, 256); g.fillRect(125, 0, 6, 110);
    g.fillStyle = '#3a3f47'; g.fillRect(256, 0, 256, 256);
    g.fillStyle = '#5b8c4e'; g.fillRect(256, 0, 24, 256); g.fillRect(512 - 24, 0, 24, 256);
    for (let y = 0; y < 8; y++) for (let x = 1; x < 7; x++) {
      g.fillStyle = (x + y) % 2 ? '#59616d' : '#6b7480';
      g.fillRect(256 + x * 32 + 2, y * 32 + 2, 28, 28);
    }
    const t = new THREE.CanvasTexture(c); t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
  })();
  const RoadMaterial = new THREE.MeshStandardMaterial({ map: atlas, roughness: .95, side: THREE.DoubleSide });
  // Tekstur paving trotoar dari bagian kanan atlas (u: 0.51..0.99)
  const SidewalkMaterial = new THREE.MeshStandardMaterial({
    map: atlas,
    roughness: 0.92,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  const AsphaltPlainMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.94,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  const CurbMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 });
  const CrosswalkMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.8,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3
  });

  const roads = [], RP = [];
  function road(pts, w, opts = {}) {
    // Subdivide segmen lurus panjang agar tidak melengkung berlebihan di CatmullRom
    const densePts = [];
    for (let k = 0; k < pts.length; k++) {
      densePts.push(pts[k]);
      if (k < pts.length - 1) {
        const dx = pts[k + 1][0] - pts[k][0], dz = pts[k + 1][1] - pts[k][1];
        const dist = Math.hypot(dx, dz);
        if (dist > 14) {
          const steps = Math.floor(dist / 10);
          for (let s = 1; s < steps; s++) {
            densePts.push([pts[k][0] + (dx * s) / steps, pts[k][1] + (dz * s) / steps]);
          }
        }
      }
    }

    const c = new THREE.CatmullRomCurve3(densePts.map(p => V3(p[0], 0, p[1])), false, "centripetal");
    const len = c.getLength(), N = Math.max(8, Math.round(len / 1.5));
    const P = [], I = [], WX = [], VV = [];
    const SP = [], SI = [], SUV = [];
    const yRoad = 0.15 + roads.length * 0.0006;
    const swW = opts.sidewalk ?? 1.45; // lebar trotoar kiri & kanan
    const yWalk = 0.21;

    for (let i = 0; i <= N; i++) {
      const t = i / N, p = c.getPointAt(t), q = c.getTangentAt(t);
      const nx = -q.z, nz = q.x, h = Math.hypot(p.x, p.z - 13.5);
      const hw = w / 2, ow = hw + swW;

      // Aspal utama
      P.push(p.x + nx * hw, yRoad, p.z + nz * hw, p.x - nx * hw, yRoad, p.z - nz * hw);
      WX.push(h, h); VV.push((t * len) / 6, (t * len) / 6);

      // Trotoar kiri & kanan (menggunakan UV kanan atlas: 0.52..0.98)
      if (swW > 0) {
        SP.push(
          p.x + nx * ow, yWalk, p.z + nz * ow,
          p.x + nx * hw, yWalk, p.z + nz * hw,
          p.x - nx * hw, yWalk, p.z - nz * hw,
          p.x - nx * ow, yWalk, p.z - nz * ow
        );
        const vTile = (t * len) / 4;
        SUV.push(0.52, vTile, 0.98, vTile, 0.52, vTile, 0.98, vTile);
      }

      if (i < N) {
        const a = i * 2;
        I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        if (swW > 0) {
          const b = i * 4;
          // Trotoar sisi kiri
          SI.push(b, b + 1, b + 4, b + 1, b + 5, b + 4);
          // Trotoar sisi kanan
          SI.push(b + 2, b + 3, b + 6, b + 3, b + 7, b + 6);
        }
      }
    }

    const g = new THREE.BufferGeometry(), uvArray = new Float32Array(WX.length * 2);
    for (let j = 0; j < WX.length; j++) { uvArray[j * 2] = 0.015 + (j % 2) * 0.47; uvArray[j * 2 + 1] = VV[j]; }
    const uv = new THREE.BufferAttribute(uvArray, 2);
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("uv", uv); g.setIndex(I); g.computeVertexNormals();
    const m = new THREE.Mesh(g, RoadMaterial); m.receiveShadow = true; scene.add(m);

    if (swW > 0) {
      const sg = new THREE.BufferGeometry();
      sg.setAttribute("position", new THREE.Float32BufferAttribute(SP, 3));
      sg.setAttribute("uv", new THREE.Float32BufferAttribute(SUV, 2));
      sg.setIndex(SI); sg.computeVertexNormals();
      const sm = new THREE.Mesh(sg, SidewalkMaterial);
      sm.receiveShadow = true; scene.add(sm);
    }

    c.userData = { w, len }; roads.push({ g, uv, WX, VV, c });
    c.getSpacedPoints(Math.round(len / 2)).forEach(p => RP.push(p));
    return c;
  }

 // Ruas jalan utama kawasan Gedung Sate - Lapangan Gasibu (sesuai peta asli Google Maps)
  const _dummyRoad = road([[-999, -999], [-998, -998]], 0.1);
  // 1. Jl. Surapati (poros utara lurus di bawah Flyover Pasupati, batas utara Lapangan Gasibu)
  const Rsur = road([[-235, -26], [-150, -26], [-65, -26], [-42, -26], [-21, -26], [0, -26], [21, -26], [42, -26], [65, -26], [150, -26], [235, -26]], 8.4);
  // 2. Jl. Diponegoro (barat & timur terbuka; ruas tengah -21..21 ditutup sebagai plaza pedestrian Gedung Sate)
  const RdipW = road([[-235, 3], [-150, 3], [-65, 3], [-42, 3], [-21, 3]], 6.2);
  const RdipE = road([[21, 3], [42, 3], [65, 3], [150, 3], [235, 3]], 6.2);
  // 3. Poros Barat Gasibu-Gedung Sate: Jl. Majapahit (utara) -> Jl. Cilamaya (selatan)
  const Rmaj = road([[-21, -235], [-21, -120], [-21, -26], [-21, -12], [-21, 3], [-21, 14], [-21, 24], [-21, 120], [-21, 235]], 5.4);
  // 4. Poros Timur Gasibu-Gedung Sate: Jl. Sentot Alibasyah (utara) -> Jl. Hayam Wuruk (selatan)
  const Rsen = road([[21, -235], [21, -120], [21, -26], [21, -12], [21, 3], [21, 14], [21, 24], [21, 120], [21, 235]], 5.4);
  const Rcim = _dummyRoad, Rcil = _dummyRoad, Rcla = _dummyRoad, RriauW = road([[-235, 48], [-120, 48], [-21, 48], [21, 48], [120, 48], [235, 48]], 6.4), RriauE = _dummyRoad, Rdago = _dummyRoad;

  // Penutup Perempatan & Pertigaan (Intersection Pads + Zebra Cross)
  function addJunction(x, z, w, d, cwDirs = []) {
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(w, d), AsphaltPlainMat);
    pad.rotation.x = -PI / 2;
    pad.position.set(x, 0.165, z);
    pad.receiveShadow = true;
    scene.add(pad);

    cwDirs.forEach(dir => {
      const isNS = dir === "N" || dir === "S";
      const ox = dir === "E" ? w / 2 + 1.1 : dir === "W" ? -w / 2 - 1.1 : 0;
      const oz = dir === "S" ? d / 2 + 1.1 : dir === "N" ? -d / 2 - 1.1 : 0;
      const span = (isNS ? w : d) - 1.2;
      const count = Math.max(3, Math.floor(span / 0.85));
      for (let i = 0; i < count; i++) {
        const off = -span / 2 + (i + 0.5) * (span / count);
        const stripe = new THREE.Mesh(
          new THREE.PlaneGeometry(isNS ? 0.42 : 1.5, isNS ? 1.5 : 0.42),
          CrosswalkMat
        );
        stripe.rotation.x = -PI / 2;
        stripe.position.set(x + ox + (isNS ? off : 0), 0.172, z + oz + (isNS ? 0 : off));
        scene.add(stripe);
      }
    });
  }

  addJunction(-21, -26, 8.8, 8.8, ["E", "W", "S"]);   // Simpang Surapati - Majapahit
  addJunction(21, -26, 8.8, 8.8, ["E", "W", "S"]);    // Simpang Surapati - Sentot Alibasyah
  addJunction(-21, 3, 7.2, 7.2, ["N", "W", "S"]);     // Pertigaan Diponegoro Barat - Majapahit - Cilamaya
  addJunction(21, 3, 7.2, 7.2, ["N", "E", "S"]);      // Pertigaan Diponegoro Timur - Sentot - Hayam Wuruk       // Pertigaan Surapati - Cilaki    // Pertigaan Surapati - Cilaki

  // Median / Pulau Jalan di bawah pilar Flyover Pasupati (Surapati lurus)
  const pasupatiMedian = new THREE.Mesh(new THREE.BoxGeometry(82, 0.24, 1.05), CurbMat);
  pasupatiMedian.position.set(20, 0.14, -26);
  pasupatiMedian.receiveShadow = true;
  scene.add(pasupatiMedian);

  const LM = new THREE.MeshBasicMaterial({ color: 0xe11d1d, transparent: true, opacity: 0, depthWrite: false });
  roads.forEach(r => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(r.c, Math.round(r.c.userData.len / 2), .3, 5, false), LM);
    m.position.y = .7; scene.add(m);
  });

  // Penutup Simpang Riau Timur - Cilaki (Halte Cilaki)
  // removed orphan junction

  // Promenade Transit & Koridor Hijau Depan Gedung Sate (menyambung Diponegoro Barat - Timur)
  box(36.8, 0.14, 6.2, 0, 0, 3, MAT(0xd6cfc2), null, false, true);      // Pelataran batu andesit
  // removed tram lane on plaza     // Koridor khusus trem & sepeda
  box(36.8, 0.18, 0.28, 0, 0, 0.05, CurbMat, null, false, true);        // Kanstin utara
  box(36.8, 0.18, 0.28, 0, 0, 5.95, CurbMat, null, false, true);        // Kanstin selatan

  // Lapangan Gasibu (proporsional di antara Jl. Majapahit & Jl. Sentot, bebas z-fighting)
  box(33.2, 0.09, 18.2, 0, 0, -9.2, MAT(0x4a7345), null, false, true);  // Hamparan rumput utama
  box(33.6, 0.13, 0.35, 0, 0, -18.3, CurbMat, null, false, true);       // Bingkai kanstin utara
  box(0.35, 0.13, 18.2, -16.6, 0, -9.2, CurbMat, null, false, true);    // Bingkai kanstin barat
  box(0.35, 0.13, 18.2, 16.6, 0, -9.2, CurbMat, null, false, true);     // Bingkai kanstin timur

  // Lintasan Lari (Jogging Track) Oval Gasibu (memanjang sumbu Z sesuai coretan biru)
  const gg = new THREE.RingGeometry(3.2, 4.5, 56); gg.rotateX(-PI / 2);
  const gGasibu = mk(gg, 0x2563eb, 0, 0.115, -9.8, null, false, true);
  gGasibu.scale.set(1.55, 1.0, 2.15);
  const ggLine = new THREE.RingGeometry(3.82, 3.88, 56); ggLine.rotateX(-PI / 2);
  const gGasibuLine = mk(ggLine, 0xf8fafc, 0, 0.118, -9.8, null, false, true);
  gGasibuLine.scale.set(1.55, 1.0, 2.15);
  const gInfield = new THREE.CircleGeometry(3.18, 48); gInfield.rotateX(-PI / 2);
  const mInfield = mk(gInfield, 0x4d7c3f, 0, 0.12, -9.8, null, false, true);
  mInfield.scale.set(1.55, 1.0, 2.15);

// Flyover Pasupati (mendarat/ramp di ujung barat Jl. Surapati, sebelah barat Gasibu)
  const FLY = new THREE.Group(); scene.add(FLY);
  const CFly = new THREE.CatmullRomCurve3([
    V3(-132, 0.22, -26),
    V3(-114, 3.4, -26),
    V3(-95, 6.2, -26),
    V3(-75, 6.2, -26),
    V3(-54, 6.2, -26),
    V3(-38, 3.6, -26),
    V3(-24, 0.22, -26)
  ]);
  CFly.userData = { w: 7.2, len: CFly.getLength() };
  const NDK = 76, deckM = IM(boxG, MAT(0x3b414c), NDK), pilM = IM(new THREE.CylinderGeometry(0.14, 0.17, 1, 12).translate(0, 0.5, 0), MAT(0x64748b), 12), barrierM = IM(boxG, MAT(0x94a3b8), NDK * 2);
  FLY.add(deckM, pilM, barrierM);

  for (let i = 0; i < NDK; i++) {
    const u = (i + .5) / NDK, p = CFly.getPointAt(u), q = CFly.getTangentAt(u), sl = CFly.userData.len / NDK * 1.15;
    dum.position.set(p.x, p.y - 0.35, p.z); dum.lookAt(p.x + q.x, p.y - 0.35 + q.y, p.z + q.z); dum.scale.set(7.2, .65, sl); dum.updateMatrix(); deckM.setMatrixAt(i, dum.matrix);
    [-3.3, 3.3].forEach((sd, j) => {
      dum.position.set(p.x - q.z * sd, p.y + 0.15, p.z + q.x * sd); dum.scale.set(.45, .8, sl); dum.updateMatrix(); barrierM.setMatrixAt(i * 2 + j, dum.matrix);
    });
  }
  [[-116, 2.8], [-102, 5.2], [-88, 5.8], [-74, 5.8], [-64, 5.8], [-44, 4.4], [-34, 2.2]].forEach(([px, py], i) => setM(pilM, i, px, 0, -26, 2.4, py, 2.4));

  // Pilon Utama & Kabel Pasupati (sisi barat di koridor Cikapayang/Balubur)
  {
    const PX = -54, PZ = -26;
    box(1.6, 20, 1.8, PX, 0, PZ, 0xc7cbd1, FLY);
    [-.5, .5].forEach(o => box(.55, 4.4, 1.7, PX + o, 19.8, PZ, 0xd62b2b, FLY));

    const cabM = IM(poleG, new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), 32, false, false); window.pirakuPasupatiCables = cabM;
    const pA = V3(0, 0, 0), pB = V3(0, 0, 0), pD = V3(0, 0, 0), pY = V3(0, 1, 0), qq = new THREE.Quaternion();
    let n = 0;
    [-1, 1].forEach(sd => {
      for (let k = 0; k < 8; k++) [-1, 1].forEach(j => {
        const ax = PX + sd * (4 + k * 2.2);
        const ay = ax > -44 ? 6.2 - (ax + 44) * 0.25 : 6.2;
        pA.set(ax, ay, PZ + j * .6);
        pB.set(PX + sd * .3, 14 + k * 1.15, PZ + j * .3);
        pD.subVectors(pB, pA); const len = pD.length();
        qq.setFromUnitVectors(pY, pD.normalize());
        dum.position.copy(pA); dum.quaternion.copy(qq); dum.scale.set(1.4, len, 1.4); dum.updateMatrix();
        cabM.setMatrixAt(n++, dum.matrix);
      });
    });
    cabM.instanceMatrix.needsUpdate = true;
    const _cInit = new THREE.Color(0xeef1f4);
    for (let ci = 0; ci < 32; ci++) cabM.setColorAt(ci, _cInit);
    if (cabM.instanceColor) cabM.instanceColor.needsUpdate = true;
    window.pirakuPasupatiCabMat = cabM.material;
    FLY.add(cabM);

    const medM = IM(boxG, MAT(0xaeb4bd), 42, false, false);
    for (let i = 0; i < 42; i++) {
      const u = (i + .5) / 42, p = CFly.getPointAt(u), q = CFly.getTangentAt(u);
      dum.position.set(p.x, p.y + 0.1, p.z); dum.lookAt(p.x + q.x, p.y + 0.1 + q.y, p.z + q.z); dum.scale.set(.45, .5, 2.2); dum.updateMatrix();
      medM.setMatrixAt(i, dum.matrix);
    }
    medM.instanceMatrix.needsUpdate = true;
    dum.quaternion.identity();
    FLY.add(medM);
  }

  // Gedung Sate Detail
  const G = new THREE.Group(); G.position.set(0, 0, 13.5); G.rotation.y = PI; scene.add(G);
  const CREAM = 0xeee6cf;
  const ROOFMAT = new THREE.MeshStandardMaterial({ color: 0x17171b, emissive: 0x000000, flatShading: true, roughness: .92, metalness: 0 });
  const GLASSM = new THREE.MeshStandardMaterial({ color: 0x1a2540, emissive: 0xffb347, emissiveIntensity: 0, flatShading: true, roughness: .55, metalness: 0 }); window.pirakuGlassMat = GLASSM;
  const FR = (wb, db, k, h, x, y, z, c, p) => {
    const g = new THREE.CylinderGeometry(.7071 * k, .7071, 1, 4, 1); g.rotateY(PI / 4); g.translate(0, .5, 0);
    const m = mk(g, c, x, y, z, p); m.scale.set(wb, h, db); return m;
  };
  const wnd = (x, y, w, h, z) => box(w, h, .12, x, y, z, GLASSM, G, false);
  const ROOFDARK = new THREE.MeshStandardMaterial({ color: 0x0e0e11, flatShading: true, roughness: .9 });
  const PINK = 0xf2a58c, TWM = new THREE.MeshStandardMaterial({ color: 0x6fd0ee, emissive: 0xffb347, emissiveIntensity: 0, flatShading: true, roughness: .5 });
  const disc = (r, x, y, z, mat) => { const m = mk(new THREE.CylinderGeometry(r, r, .08, 12), mat, x, y, z, G, false); m.rotation.x = PI / 2; };
  const arch = (x, zf, zb) => {
    box(1.1, 1.6, .08, x, .8, zf * zb, PINK, G, false); disc(.55, x, 2.4, zf * zb, M(PINK));
    box(.82, 1.5, .1, x, .9, zf * (zb + .04), GLASSM, G, false); disc(.41, x, 2.4, zf * (zb + .04), GLASSM);
  };
  box(38, .35, 8.2, 0, 0, 0, 0x4a4e55, G, false, true);
  const GS_BODY = box(36, 3.2, 7.4, 0, .35, 0, CREAM, G); // dipakai collider khusus (lebar 36 > filter 28)
  FR(37.6, 8.8, .8, .9, 0, 3.55, 0, ROOFMAT, G);
  box(31.5, 2.5, 5.6, 0, 4.3, 0, CREAM, G);
  FR(33.5, 7.2, .78, 2.3, 0, 6.8, 0, ROOFMAT, G);
  box(9.6, 10.85, 7.8, 0, .35, 0, CREAM, G);
  FR(9.8, 7.8, .6, 1.0, 0, 11.2, 0, ROOFDARK, G);
  box(5.2, 1.9, 4.2, 0, 12.2, 0, CREAM, G);
  FR(7.0, 5.6, .55, 1.1, 0, 14.1, 0, ROOFDARK, G);
  FR(4.0, 3.4, .5, 1.0, 0, 15.2, 0, ROOFDARK, G);
  cyl(.09, .09, 2.6, 6, 0, 16.2, 0, 0x0e0e11, G);
  [[16.65, .42], [17.15, .36], [17.65, .29], [18.1, .22], [18.5, .16]].forEach(o => mk(new THREE.SphereGeometry(o[1], 8, 6), 0x0e0e11, 0, o[0], 0, G));
  [1, -1].forEach(zf => {
    [-1, 1].forEach(sd => {
      for (let k = 0; k < 7; k++) arch(sd * (5.9 + k * 1.75), zf, 3.72);
      for (let k = 0; k < 8; k++) wnd(sd * (5.3 + k * 1.4), 4.9, .7, 1.0, zf * 2.84);
      for (let k = 0; k < 5; k++) { const x = sd * (5.5 + k * 2.2); box(.5, .55, .35, x, 7.7, zf * 3.2, CREAM, G, false); wnd(x, 7.75, .3, .3, zf * 3.4); }
      wnd(sd * 3.4, 7.2, .8, 1.3, zf * 3.94); wnd(sd * 3.4, 9.5, .8, 1.2, zf * 3.94);
      box(.5, 2.6, .1, sd * .6, 5.9, zf * 5.13, GLASSM, G, false);
      box(.7, 1.3, .1, sd * 1.9, .9, zf * 5.62, GLASSM, G, false);
    });
    box(6.2, 3.4, 2, 0, .35, zf * 4.6, CREAM, G); FR(7.4, 3.4, .5, 1.3, 0, 3.75, zf * 4.6, ROOFMAT, G);
    box(3.2, 8.4, 1.4, 0, .35, zf * 4.4, CREAM, G); FR(3.8, 2.0, .5, 1.0, 0, 8.75, zf * 4.4, ROOFMAT, G);
    box(1.5, 2.3, .1, 0, .35, zf * 5.62, 0x3a2a26, G, false);
    for (let k = -2; k <= 2; k++) box(.7, 1.1, .1, k * .95, 12.6, zf * 2.14, TWM, G, false);
  });

  const DUTCH = new THREE.Group(); scene.add(DUTCH);
  function mkColonialVilla(x, z, ry) {
    const v = new THREE.Group(); v.position.set(x, 0, z); v.rotation.y = ry;
    box(7.5, .6, 6, 0, 0, 0, 0x78716c, v); box(6.8, 3.2, 5.2, 0, .6, 0, 0xfafaf9, v); hip(7.8, 6.2, 2.2, 0, 3.8, 0, 0xb45309, v);
    box(6.2, 1.8, 1.5, 0, .6, 2.2, 0xf5f5f4, v);
    [-2.2, -.7, .7, 2.2].forEach(px => cyl(.1, .1, 1.8, 6, px, .6, 2.9, 0xffffff, v));
    // DUTCH.add(v);
  }
  [[-32, -14, .1], [32, -14, -.1]].forEach(p => mkColonialVilla(p[0], p[1], p[2]));
  
// ================= MUSEUM POS INDONESIA & MUSEUM GEOLOGI (KORIDOR TIMUR) =================
  function mkSignTexture(text, bgHex, fgHex = '#ffffff', borderHex = null, fontSpec = '800 32px "Bricolage Grotesque", system-ui, sans-serif') {
    const cv = document.createElement('canvas');
    cv.width = 512; cv.height = 72;
    const ctx = cv.getContext('2d');
    if (bgHex) {
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, 512, 72);
    } else {
      ctx.clearRect(0, 0, 512, 72);
    }
    if (borderHex) {
      ctx.strokeStyle = borderHex;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 504, 64);
    }
    ctx.fillStyle = fgHex;
    ctx.font = fontSpec;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 38);
    const tex = new THREE.CanvasTexture(cv);
    return new THREE.MeshBasicMaterial({ map: tex, transparent: !bgHex, side: THREE.DoubleSide });
  }

  // 2. PULLMAN BANDUNG GRAND CENTRAL & IBIS STYLES (Sisi Barat Gasibu: x = -34.5, z = -10.5)
  {
    const pullman = new THREE.Group();
    pullman.position.set(-34.5, 0, -10.5);
    pullman.rotation.y = PI / 2; // Menghadap Timur menatap Gasibu (+X = Kanan/Utara, -X = Kiri/Selatan)
    scene.add(pullman);

    const offWhite = 0xf8fafc;
    const warmTrim = 0xe2e8f0;
    const winGlass = GLASSM;

    // Pelataran & sabuk taman depan
    box(21.4, 0.22, 11.4, 0, 0, 0.2, 0xd6d3d1, pullman, false, true);
    box(20.4, 0.26, 2.0, 0, 0.22, 4.5, 0x4d7c3f, pullman, false, true);

    // Podium dasar memanjang
    box(20.0, 3.0, 7.6, 0, 0.22, 0.2, offWhite, pullman);
    box(20.4, 0.22, 7.9, 0, 3.22, 0.2, warmTrim, pullman);

    // Sayap Depan-Kiri Ballroom dengan Atap Limasan Gelap (ROOFMAT)
    box(8.4, 2.7, 3.0, -5.2, 0.22, 3.2, offWhite, pullman);
    FR(9.0, 3.6, 0.62, 1.3, -5.2, 2.92, 3.2, ROOFMAT, pullman);
    for (let k = -3; k <= 3; k++) {
      box(0.24, 2.5, 0.22, -5.2 + k * 1.1, 0.22, 4.72, offWhite, pullman);
      box(0.55, 1.1, 0.12, -5.2 + k * 1.1 + 0.55, 0.9, 4.71, winGlass, pullman, false);
    }

    // Sayap Belakang-Kiri Ballroom Atap Limasan Gelap (tidak menembus menara ibis)
    box(6.4, 2.4, 4.4, -6.4, 3.22, -0.4, offWhite, pullman);
    FR(7.0, 5.0, 0.65, 1.5, -6.4, 5.62, -0.4, ROOFMAT, pullman);

    // Ornamen Mahkota Art Deco Berundak (Stepped Gable) di Tengah Podium
    box(3.0, 2.1, 0.42, -0.6, 3.22, 3.85, offWhite, pullman);
    box(2.0, 0.6, 0.42, -0.6, 5.32, 3.85, offWhite, pullman);
    box(1.0, 0.48, 0.42, -0.6, 5.92, 3.85, offWhite, pullman);
    [-0.7, 0, 0.7].forEach(gx => box(0.28, 1.4, 0.14, -0.6 + gx, 3.65, 4.07, winGlass, pullman, false));

    // Porte-Cochère (Kanopi Drop-Off Lobi Utama) Beratap Limasan Gelap di Kanan-Depan
    box(4.6, 0.28, 2.6, 3.8, 2.55, 4.5, offWhite, pullman);
    FR(5.2, 3.2, 0.58, 1.25, 3.8, 2.83, 4.5, ROOFMAT, pullman);
    [-1.8, 1.8].forEach(px => {
      box(0.36, 2.33, 0.36, 3.8 + px, 0.22, 5.4, offWhite, pullman);
      box(0.36, 2.33, 0.36, 3.8 + px, 0.22, 3.8, offWhite, pullman);
    });
    box(2.6, 2.1, 0.16, 3.8, 0.22, 4.02, 0x0f172a, pullman, false);

    // --- MENARA 1 (KIRI): ibis Styles Bandung Grand Central (terpisah dengan celah udara jelas) ---
    box(3.8, 12.2, 4.0, -3.2, 3.44, 1.3, offWhite, pullman);
    box(4.1, 0.3, 4.3, -3.2, 15.64, 1.3, warmTrim, pullman);
    box(2.4, 0.5, 2.4, -3.2, 15.94, 1.3, 0xcbd5e1, pullman);
    // Strip vertikal aksen ungu-gelap di sisi kanan menara ibis
    box(0.48, 11.6, 0.16, -1.75, 3.7, 3.31, 0x312e81, pullman, false);
    [-1.5, -0.7, 0.1].forEach(px => box(0.18, 12.2, 0.2, -3.2 + px, 3.44, 3.32, warmTrim, pullman));
    for (let fl = 0; fl < 7; fl++) {
      [-1.15, -0.35, 0.45].forEach(wx => {
        box(0.46, 0.92, 0.14, -3.2 + wx, 4.05 + fl * 1.58, 3.31, winGlass, pullman, false);
      });
    }
    const signIbis = mkSignTexture('ibis', '#15803d', '#ffffff', '#bbf7d0', '900 34px system-ui, sans-serif');
    const mIbis = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.68), signIbis);
    mIbis.position.set(-1.75, 14.95, 3.34);
    pullman.add(mIbis);

    // --- MENARA 2 (KANAN): pullman Bandung Grand Central (terpisah 1.2 unit dari menara ibis) ---
    // Sayap Belakang Menara Pullman
    box(4.4, 13.0, 4.4, 2.0, 3.44, -0.9, offWhite, pullman);
    box(4.7, 0.3, 4.7, 2.0, 16.44, -0.9, warmTrim, pullman);
    for (let fl = 0; fl < 8; fl++) {
      [-1.3, -0.42, 0.42, 1.3].forEach(wx => {
        box(0.48, 0.94, 0.14, 2.0 + wx, 4.0 + fl * 1.52, 1.31, winGlass, pullman, false);
      });
    }

    // Sayap Utama Depan-Kanan Menara Pullman
    box(5.2, 13.6, 5.0, 6.4, 3.44, 0.5, offWhite, pullman);
    box(5.5, 0.34, 5.3, 6.4, 17.04, 0.5, warmTrim, pullman);
    [-2.2, -1.1, 0, 1.1, 2.2].forEach(px => {
      box(0.22, 13.6, 0.24, 6.4 + px, 3.44, 3.02, warmTrim, pullman);
      box(0.22, 13.6, 0.24, 6.4 + px, 3.44, -2.02, warmTrim, pullman);
    });
    for (let fl = 0; fl < 8; fl++) {
      [-1.65, -0.55, 0.55, 1.65].forEach(wx => {
        box(0.58, 0.98, 0.14, 6.4 + wx, 4.0 + fl * 1.6, 3.01, winGlass, pullman, false);
        box(0.58, 0.98, 0.14, 6.4 + wx, 4.0 + fl * 1.6, -2.01, winGlass, pullman, false);
      });
      [-1.4, 0, 1.4].forEach(wz => {
        box(0.14, 0.98, 0.58, 9.01, 4.0 + fl * 1.6, 0.5 + wz, winGlass, pullman, false);
      });
    }

    const signPullmanMat = mkSignTexture('pullman', null, '#334155', null, '700 42px "Bricolage Grotesque", system-ui, sans-serif');
    const signPullman = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.85), signPullmanMat);
    signPullman.position.set(6.4, 17.75, 2.85);
    pullman.add(signPullman);
  }

  // 3. MUSEUM GEOLOGI BANDUNG (Sisi Utara Jl. Diponegoro Timur: x = 34.5, z = -6.5)
  {
    const mGeo = new THREE.Group();
    mGeo.position.set(34.5, 0, -6.5);
    mGeo.rotation.y = 0; // Fasad utama menghadap Selatan (Jl. Diponegoro Timur)
    scene.add(mGeo);

    const wallIvory = 0xf8fafc;
    const stonePlinth = 0x64748b;
    const woodWin = 0x4a2e1b;

    // Halaman rumput depan berbingkai dinding batu alam rendah + pelataran paving masuk
    box(17.6, 0.14, 11.4, 0, 0, 0.2, 0x4d7c3f, mGeo, false, true);
    box(15.4, 0.22, 3.4, 0, 0.14, 3.4, 0xd6d3d1, mGeo, false, true);
    box(15.6, 0.35, 0.28, 0, 0.14, 5.1, 0x78716c, mGeo);

    // Tiang Bendera Merah-Putih di halaman depan kiri
    cyl(0.06, 0.09, 5.8, 8, -5.6, 0.14, 3.6, 0xf8fafc, mGeo);
    box(0.55, 0.32, 0.1, -5.3, 5.55, 3.6, 0xdc2626, mGeo, false);
    box(0.55, 0.32, 0.1, -5.3, 5.23, 3.6, 0xffffff, mGeo, false);

    // Bodi Utama Panjang 2 Lantai + Plinth Batu Bawah
    box(14.8, 0.45, 5.6, 0, 0.14, -0.6, stonePlinth, mGeo);
    box(14.6, 4.1, 5.4, 0, 0.59, -0.6, wallIvory, mGeo);
    box(14.9, 0.18, 5.7, 0, 2.55, -0.6, 0xe2e8f0, mGeo);

    // Tritisan / Overstek Atap Lebar + Deretan Ventilasi Persegi Kecil di Bawah Lis Atap
    box(15.8, 0.24, 6.6, 0, 4.69, -0.6, 0xf1f5f9, mGeo);
    for (let v = -11; v <= 11; v++) {
      box(0.24, 0.14, 0.14, v * 0.62, 4.52, 2.12, 0x1e293b, mGeo, false);
    }
    // Atap Limasan Panjang menggunakan ROOFMAT (sama persis dengan warna atap Gedung Sate!)
    FR(16.2, 7.0, 0.58, 1.85, 0, 4.93, -0.6, ROOFMAT, mGeo);

    // Bagian Tengah Pintu Masuk Utama yang Menjorok Sedikit + Tangga Undakan
    box(4.4, 4.1, 0.7, 0, 0.59, 2.35, wallIvory, mGeo);
    box(3.2, 0.45, 1.1, 0, 0.14, 3.1, 0x94a3b8, mGeo);
    box(3.4, 0.22, 0.85, 0, 2.45, 2.85, 0xe2e8f0, mGeo);
    box(1.5, 1.85, 0.14, 0, 0.59, 2.71, woodWin, mGeo, false);

    // Tulisan Timbul "MUSEUM ◈ GEOLOGI" di Dinding Putih Lantai 2
    const signGeoMat = mkSignTexture('MUSEUM ◈ GEOLOGI', null, '#1e293b', null, '800 32px "Bricolage Grotesque", system-ui, sans-serif');
    const signGeo = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 0.75), signGeoMat);
    signGeo.position.set(0, 3.15, 2.73);
    mGeo.add(signGeo);

    // Deretan Jendela Kayu Cokelat Berkisi-Kisi di Lantai 1 & Lantai 2
    [-1, 1].forEach(sd => {
      for (let k = 0; k < 4; k++) {
        const wx = sd * (2.8 + k * 1.15);
        box(0.76, 1.15, 0.12, wx, 1.15, 2.11, woodWin, mGeo, false);
        box(0.62, 0.98, 0.14, wx, 1.23, 2.12, GLASSM, mGeo, false);
        box(0.76, 1.05, 0.12, wx, 3.15, 2.11, woodWin, mGeo, false);
        box(0.62, 0.88, 0.14, wx, 3.23, 2.12, GLASSM, mGeo, false);
      }
    });
  }

  // Billboard LED 3D (HD 1024x512 + Word-Wrap + Logo @pirakubdg)
  const billboardCanvas = document.createElement('canvas');
  billboardCanvas.width = 1024; billboardCanvas.height = 512;
  const bCtx = billboardCanvas.getContext('2d');
  const billboardTex = new THREE.CanvasTexture(billboardCanvas);
  let lastBillboardState = { title: 'BANDUNG JUARA 2026', sub: 'Plaza Hijau Gedung Sate & Ruang Kreatif Warga Bandung!', isPaidAd: false };
  const pirakuBillboardLogo = new Image();
  pirakuBillboardLogo.onload = () => {
    drawBillboardScreen(lastBillboardState.title, lastBillboardState.sub, lastBillboardState.isPaidAd);
  };
  pirakuBillboardLogo.src = 'assets/piraku-brand-logo.webp';

  function wrapBillboardLines(ctx, text, maxWidth, maxLines) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = '';
    for (let i = 0; i < words.length; i++) {
      const test = cur ? (cur + ' ' + words[i]) : words[i];
      if (ctx.measureText(test).width <= maxWidth) {
        cur = test;
      } else {
        if (cur) lines.push(cur);
        cur = words[i];
        if (lines.length >= maxLines) break;
      }
    }
    if (cur && lines.length < maxLines) lines.push(cur);
    return lines.slice(0, maxLines);
  }

  function drawBillboardScreen(title, sub, isPaidAd) {
    lastBillboardState = { title, sub, isPaidAd: !!isPaidAd };
    const Wb = 1024, Hb = 512;
    const bgGrad = bCtx.createLinearGradient(0, 0, Wb, Hb);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, isPaidAd ? '#291503' : '#082f49');
    bCtx.fillStyle = bgGrad;
    bCtx.fillRect(0, 0, Wb, Hb);

    // Garis grid LED halus
    bCtx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    bCtx.lineWidth = 2;
    for (let gx = 0; gx <= Wb; gx += 32) {
      bCtx.beginPath(); bCtx.moveTo(gx, 0); bCtx.lineTo(gx, Hb); bCtx.stroke();
    }
    for (let gy = 0; gy <= Hb; gy += 32) {
      bCtx.beginPath(); bCtx.moveTo(0, gy); bCtx.lineTo(Wb, gy); bCtx.stroke();
    }

    // Bingkai luar LED bercahaya
    bCtx.strokeStyle = isPaidAd ? '#facc15' : '#38bdf8';
    bCtx.lineWidth = 10;
    bCtx.strokeRect(10, 10, Wb - 20, Hb - 20);

    // Header Bar
    const hdrGrad = bCtx.createLinearGradient(0, 0, Wb, 0);
    if (isPaidAd) {
      hdrGrad.addColorStop(0, '#b45309'); hdrGrad.addColorStop(1, '#f59e0b');
    } else {
      hdrGrad.addColorStop(0, '#1e3a8a'); hdrGrad.addColorStop(1, '#0284c7');
    }
    bCtx.fillStyle = hdrGrad;
    bCtx.fillRect(15, 15, Wb - 30, 78);

    bCtx.fillStyle = '#ffffff';
    bCtx.font = '900 32px "Bricolage Grotesque", sans-serif';
    bCtx.textBaseline = 'middle';
    bCtx.fillText(isPaidAd ? '📺 LAYAR LED EKSKLUSIF GASIBU' : '🏛️ INFO KOTA BANDUNG • GASIBU', 40, 54);

    if (pirakuBillboardLogo.complete && pirakuBillboardLogo.naturalWidth > 0) {
      bCtx.fillStyle = 'rgba(255,255,255,0.95)';
      bCtx.beginPath(); bCtx.roundRect(Wb - 216, 22, 184, 64, 14); bCtx.fill();
      bCtx.drawImage(pirakuBillboardLogo, Wb - 208, 26, 168, 56);
    }

    // Judul utama (auto-fit width)
    bCtx.fillStyle = '#fde047';
    let titleSize = 48;
    const rawTitle = String(title || '').trim();
    do {
      bCtx.font = `900 ${titleSize}px "Bricolage Grotesque", sans-serif`;
      if (bCtx.measureText(rawTitle).width <= Wb - 88 || titleSize <= 28) break;
      titleSize -= 4;
    } while (titleSize > 28);
    bCtx.fillText(rawTitle, 44, 154);

    // Isi pesan dengan word-wrap rapi (anti kepotong)
    bCtx.fillStyle = '#f8fafc';
    bCtx.font = '700 36px "Bricolage Grotesque", sans-serif';
    const lines = wrapBillboardLines(bCtx, sub, Wb - 88, 3);
    lines.forEach((ln, idx) => {
      bCtx.fillText(ln, 44, 232 + idx * 52);
    });

    // Footer Bar
    bCtx.fillStyle = 'rgba(2, 6, 23, 0.72)';
    bCtx.fillRect(15, Hb - 72, Wb - 30, 57);
    bCtx.fillStyle = isPaidAd ? '#fde047' : '#4ade80';
    bCtx.font = '800 26px "Bricolage Grotesque", sans-serif';
    bCtx.fillText(isPaidAd ? '● TAYANG EKSKLUSIF DI GASIBU • SEWA LED DI TOKO' : '● SIMULASI TATA KOTA @pirakubdg • SEWA LED DI TOKO 🪙 200', 40, Hb - 43);

    billboardTex.needsUpdate = true;
  }
  drawBillboardScreen('BANDUNG JUARA 2026', 'Plaza Hijau Gedung Sate & Ruang Kreatif Warga Bandung!', false);

  window.setGasibuBillboardBroadcast = function(sender, text, isPaidAd) {
    if (isPaidAd) {
      window.pirakuBillboardLockedUntil = Date.now() + 180000;
      drawBillboardScreen('PESAN DARI ' + String(sender || 'WARGA').toUpperCase(), text, true);
    } else if (!window.pirakuBillboardLockedUntil || Date.now() > window.pirakuBillboardLockedUntil) {
      drawBillboardScreen(String(sender || 'WARGA').toUpperCase(), text, false);
    }
  };

  window.focusOnGasibuBillboard = function() {
    if (window.pirakuInDistrict && typeof window.enterDistrictMap === 'function') {
      window.enterDistrictMap('bandung_wetan');
    }
    const p = typeof window.getMyActivePlayerMesh === 'function' ? window.getMyActivePlayerMesh() : null;
    if (p && p.position) {
      p.position.set(-12, 0, -11);
      if (p.userData && p.userData.a && p.userData.a.c) {
        p.userData.a.c.x = -12;
        p.userData.a.c.z = -11;
      }
      if (typeof showToast === 'function') showToast('📺 Mengarah ke Layar LED Gasibu 3D!');
    }
  };

  const billboardGroup = new THREE.Group();
  billboardGroup.position.set(-16, 0, -18);
  billboardGroup.rotation.y = 0.5;
  scene.add(billboardGroup);
  // Dua tiang kokoh berhenti di bawah kabinet (y = 4.55) agar tidak menembus layar depan maupun belakang
  cyl(0.22, 0.26, 4.55, 10, -2.6, 0, 0, 0x1e293b, billboardGroup);
  cyl(0.22, 0.26, 4.55, 10, 2.6, 0, 0, 0x1e293b, billboardGroup);
  box(9.2, 4.8, 0.4, 0, 4.5, 0, 0x0f172a, billboardGroup);
  mk(new THREE.PlaneGeometry(8.8, 4.4), new THREE.MeshBasicMaterial({ map: billboardTex }), 0, 6.9, 0.22, billboardGroup, false, false);
  const backLedPlane = mk(new THREE.PlaneGeometry(8.8, 4.4), new THREE.MeshBasicMaterial({ map: billboardTex }), 0, 6.9, -0.22, billboardGroup, false, false);
  backLedPlane.rotation.y = Math.PI;

  // Kavling Perumahan Warga
  
  // ================= LANDMARK DISTRIK EKSPANSI =================
  const expansionGroup = new THREE.Group();
  expansionGroup.visible = false; scene.add(expansionGroup);

  // 1. DAGO / CIKAPAYANG SKATEPARK (Barat: X: -55, Z: -40)
  {
    box(16, 0.12, 12, -55, 0.06, -40, 0x334155, expansionGroup, false, true);
    // Halfpipe Ramp
    box(3.5, 0.9, 8, -60, 0.45, -40, 0x94a3b8, expansionGroup);
    box(3.5, 0.9, 8, -50, 0.45, -40, 0x94a3b8, expansionGroup);
    // Rail grind & Box obstacle
    box(0.12, 0.5, 6, -55, 0.25, -40, 0xfacc15, expansionGroup);
    box(2.2, 0.45, 3.2, -55, 0.22, -43, 0x0284c7, expansionGroup);
  }

  // 2. TAMAN LANSIA & KULINER CISANGKUY (Tenggara: X: 38, Z: -10)
  {
    // Kolam & rumput rindang Lansia
    box(18, 0.08, 14, 38, 0.04, -10, 0x2d5a27, expansionGroup, false, true);
    box(8, 0.05, 5, 38, 0.06, -10, 0x38bdf8, expansionGroup, false, true);
    // Jembatan Lengkung Merah Mini
    box(2.4, 0.35, 6.2, 38, 0.2, -10, 0xd92626, expansionGroup);
    box(0.15, 0.7, 6.2, 36.9, 0.45, -10, 0xb91c1c, expansionGroup);
    box(0.15, 0.7, 6.2, 39.1, 0.45, -10, 0xb91c1c, expansionGroup);
    // Tenda Kuliner Cisangkuy Pastel (Yoghurt / Surabi)
    const stallColors = [0xf43f5e, 0x0ea5e9, 0xeab308, 0x10b981];
    [-3.5, 0, 3.5].forEach((offset, idx) => {
      box(2.2, 1.4, 2.0, 32 + offset * 1.5, 0.1, -16, 0xf8fafc, expansionGroup);
      hip(2.6, 2.4, 0.9, 32 + offset * 1.5, 1.5, -16, stallColors[idx % stallColors.length], expansionGroup);
    });
  }

  // 3. GOR SAPARUA (Timur: X: 50, Z: 25)
  {
    // Lapangan & Trek Lari Bata Merah Oval
    box(18, 0.06, 22, 50, 0.03, 25, 0xb91c1c, expansionGroup, false, true);
    box(12, 0.08, 16, 50, 0.05, 25, 0x4d7c0f, expansionGroup, false, true);
    // Panggung Gigs Komunitas
    box(7.5, 0.75, 4.2, 50, 0.38, 33, 0x1e293b, expansionGroup);
    box(7.8, 0.18, 4.5, 50, 3.0, 33, 0x475569, expansionGroup);
    [-3.6, 3.6].forEach(px => cyl(0.1, 0.1, 2.8, 6, 50 + px, 0.75, 33, 0x0f172a, expansionGroup));
    // Ruko Distro & Kafe Komunitas Saparua
    for (let r = 0; r < 3; r++) {
      box(4.5, 3.4, 4.5, 62, 0.1, 16 + r * 6.5, 0xe2e8f0, expansionGroup);
      box(4.8, 0.8, 4.8, 62, 3.5, 16 + r * 6.5, 0x0f172a, expansionGroup);
    }
  }

  const citizenHousesGroup = new THREE.Group(); scene.add(citizenHousesGroup);
  const houseOwnersRegistry = {};

  function makeHouseOwnerPlaque(igText) {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 64;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#0e2f2a';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#ffcf4a';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 250, 58);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 26px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(igText || '@warga', 128, 33);
    const tex = new THREE.CanvasTexture(cv);
    return new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
  }

  // --- REGISTRY HUNIAN & PEMILU CAMAT PER KECAMATAN (UNTUK SERVER DISTRIK) ---
  window.weeklyCamatByKec = {};

  window.evaluateWeeklyCamatRotation = async function(citizensList) {
    if (!Array.isArray(citizensList) || citizensList.length === 0) return;
    const topCandidateByKec = {};
    window.weeklyCamatByKec = {};

    if (typeof supabaseClient !== "undefined" && supabaseClient) {
      try {
        const { data } = await supabaseClient
          .from("pemilu_camat").select("*")
          .order("votes", { ascending: false });
        if (Array.isArray(data)) {
          data.forEach(row => {
            const rawK = String(row.district_name || row.kecamatan || row.district_id || "").replace(/[_-]+/g," ").trim().toLowerCase();
            if (!rawK) return;
            if (!topCandidateByKec[rawK] && (Number(row.votes) || 0) > 0) {
              topCandidateByKec[rawK] = {
                ig: String(row.candidate_ig || "").toLowerCase(),
                votes: Number(row.votes) || 0
              };
            }
          });
        }
      } catch (e) {}
    }

    const byKec = {};
    citizensList.forEach(c => {
      if (!c || !c.ig) return;
      c.is_camat = false;
      const k = String(c.kecamatan || "Bandung Wetan").trim().toLowerCase();
      if (!byKec[k]) byKec[k] = [];
      byKec[k].push(c);
    });

    for (const [kLow, members] of Object.entries(byKec)) {
      const topVoteInfo = topCandidateByKec[kLow];
      if (!topVoteInfo || topVoteInfo.votes <= 0) continue;
      const winner = members.find(m => String(m.ig || "").toLowerCase() === topVoteInfo.ig);
      if (winner) {
        window.weeklyCamatByKec[kLow] = winner.ig;
        members.forEach(m => { m.is_camat = (m.ig === winner.ig); });
      }
    }

    // Jika pemain sedang berada di dalam server komplek distrik, perbarui bangunannya secara langsung
    if (window.pirakuInDistrict && typeof window.refreshActiveDistrictHouses === "function") {
      window.refreshActiveDistrictHouses();
    }
  };

  function spawnCitizenHouse(c, index) {
    // Rumah 3D kini dirender khusus di dalam server komplek masing-masing kecamatan (js/piraku-districts.js)
    const safe = getSafeGasibuPos();
    return { hx: safe.x, hz: safe.z, porchX: safe.x, porchZ: safe.z };
  }

  // Gedung Bertingkat
  const WALLS = [0xeae3d5, 0xdfd6c6, 0xd4cbb9, 0xd97757, 0x576574, 0x475569];
  const ROOF_COLORS = [0xba5232, 0xa84425, 0x96391d, 0x475569, 0x334155, 0xc26241];
  const bl = [{ x: -999, z: -999, w: 0.001, d: 0.001, f: 1, k: 1, c: 0x000000, r: 0x000000 }];
  const SK = [
    [-36, 36, -26, 46],      // Poros Gasibu - Gedung Sate (bebas gedung di belakang Gedung Sate)
    [-18, 18, -66, -27],     // Pelataran Monumen Perjuangan (Monju)
    [-39, -27, -26, -5],     // Koridor barat Gasibu
    [27, 48, -20, -2],       // Taman Lansia & Kuliner Cisangkuy
    [24, 58, 4, 34],         // Area Danau Besar Taman Lansia (luas ke selatan & bebas gedung)
    [39, 66, 12, 38],        // GOR Saparua & Ruko Komunitas
    [-65, -45, -48, -32],    // Dago / Cikapayang Skatepark
    [22, 48, -48, -31]       // Kavling Perumahan Warga
  ];
  const near = (x, z) => RP.some(p => (p.x - x) ** 2 + (p.z - z) ** 2 < 36) || SK.some(q => x > q[0] - 2.5 && x < q[1] + 2.5 && z > q[2] - 2.5 && z < q[3] + 2.5);
  for (let x = -38.6; x <= 44; x += 6.4) for (let z = -37.6; z <= 44; z += 6.4) {
    if (near(x, z)) continue; const u = rnd();
    const f = u < .4 ? 1 : u < .75 ? 2 : u < .93 ? 3 : 4, k = rnd() < .55 ? 0 : 1;
    bl.push({ x, z, w: k ? 5.4 : 4.6, d: k ? 5.4 : 4.6, f, k, c: WALLS[Math.floor(rnd() * 5)], r: ROOF_COLORS[Math.floor(rnd() * ROOF_COLORS.length)] });
  }
  const FH = 3.2, nb = bl.length, nroof = bl.filter(b => !b.k).length, nband = bl.reduce((a, b) => a + b.f, 0);
  const bodyM = IM(boxG, clay, nb), roofM = IM(roofG, clay, nroof), parM = IM(boxG, clay, nb - nroof);
  const bandM = IM(boxG, GLASSM, nband, false, false);
  let ri = 0, pi = 0, bi2 = 0;
  bl.forEach((b, i) => {
    b.h = b.f * FH; b.bi = bi2; bi2 += b.f; b.ri = b.k ? -1 : ri++; b.pi = b.k ? pi++ : -1;
    setC(bodyM, i, b.c);
    if (!b.k) setC(roofM, b.ri, b.r); else setC(parM, b.pi, 0xffffff);
  });
  bodyM.instanceColor.needsUpdate = roofM.instanceColor.needsUpdate = parM.instanceColor.needsUpdate = true;

  const grow = { v: 0 };
  function applyGrowth() {
    bl.forEach((b, i) => {
      const s = Math.min(1, Math.max(0, grow.v - i)), e = 1 - Math.pow(1 - s, 3);
      setM(bodyM, i, b.x, 0, b.z, b.w, b.h * e, b.d);
      if (!b.k) setM(roofM, b.ri, b.x, b.h * e, b.z, b.w + .8, 1.7 * e, b.d + .8);
      else setM(parM, b.pi, b.x, b.h * e, b.z, b.w + .3, .3 * e, b.d + .3);
      for (let f = 0; f < b.f; f++) {
        setM(bandM, b.bi + f, b.x, (f * FH + 1.2) * e, b.z, b.w + .08, 0.8 * e, b.d + .08);
      }
    });
    [bodyM, roofM, parM, bandM].forEach(m => m.instanceMatrix.needsUpdate = true);
  }

  // Pohon Kiara Payung (terfilter otomatis dari jalan, trotoar & simpangan)
  const rawTrees = [];
  const nearRoad = (x, z, r = 4.6) => RP.some(p => (p.x - x) ** 2 + (p.z - z) ** 2 < r * r);

  // Barisan utara Gasibu & bingkai pelataran Gedung Sate
  for (let x = -15.5; x <= 15.5; x += 3.85) rawTrees.push({ x, z: -20.6, s: 1.05 });
  [[-9, 8.2], [9, 8.2], [-13.5, 9.2], [13.5, 9.2], [-15.2, -1.2], [15.2, -1.2], [-15.2, 6.8], [15.2, 6.8]]
    .forEach(p => rawTrees.push({ x: p[0], z: p[1], s: 1.0 }));

  // Peneduh koridor Diponegoro, Dago, Riau & Taman Lansia
  for (let x = -54; x <= 54; x += 4.5) {
    if (Math.abs(x) > 25) rawTrees.push({ x, z: -1.6, s: 0.95 });
    if (Math.abs(x) > 18) rawTrees.push({ x, z: 7.6, s: 0.95 });
    if (Math.abs(x) > 27) rawTrees.push({ x, z: 20.6, s: 0.9 });
  }
  for (let z = -46; z <= 32; z += 5.2) {
    rawTrees.push({ x: -46.8, z, s: 0.95 });
    rawTrees.push({ x: -37.2, z, s: 0.95 });
  }
  [[31, -6], [35, -5.5], [42, -6.5], [44, -14]].forEach(p => rawTrees.push({ x: p[0], z: p[1], s: 1.0 }));

  const inMuseumFront = (x, z) => (x >= 25.0 && x <= 44.0 && z >= -9.5 && z <= 1.5);
  const inLansiaLake = (x, z) => (x >= 26.0 && x <= 55.0 && z >= 6.0 && z <= 33.0);
  const trees = rawTrees.filter(t => !nearRoad(t.x, t.z, 4.7) && !inMuseumFront(t.x, t.z) && !inLansiaLake(t.x, t.z));
  const trunkM = IM(trunkG, MAT(0x7a5a40), trees.length), crownM = IM(crownG, clay, trees.length * 2);
  trees.forEach((t, i) => {
    const c = [0x4d7348, 0x5a8852, 0x3d6639, 0x66945c][i % 4];
    setC(crownM, i * 2, c); setC(crownM, i * 2 + 1, c);
  });
  crownM.instanceColor.needsUpdate = true;
  function updTrees(t) {
    trees.forEach((o, i) => {
      const s = o.s, rz = Math.sin(t * 1.8 + i) * .04;
      dum.position.set(o.x, 0, o.z); dum.rotation.set(0, 0, rz); dum.scale.setScalar(s); dum.updateMatrix(); MB.copy(dum.matrix);
      dum.scale.set(1, 3, 1); dum.position.set(0, 0, 0); dum.rotation.set(0, 0, 0); dum.updateMatrix(); MA.multiplyMatrices(MB, dum.matrix); trunkM.setMatrixAt(i, MA);
      [[0, 3.3, 0, 2.9, .85], [.5, 3.9, .3, 1.8, .6]].forEach((c, j) => {
        dum.position.set(c[0], c[1], c[2]); dum.scale.set(c[3], c[4], c[3]); dum.updateMatrix(); MA.multiplyMatrices(MB, dum.matrix); crownM.setMatrixAt(i * 2 + j, MA);
      });
    });
    trunkM.instanceMatrix.needsUpdate = crownM.instanceMatrix.needsUpdate = true;
  }

  // Kendaraan & Angkot
  const CP = [0xe0645a, 0x4f86c9, 0xf2d45c, 0x6fbf8b, 0x9a7fd1, 0xf09a4d, 0xf4f2ec, 0x8d99a6], GR = 0x2e9e5b, YE = 0xf4c430;
  const LGT = (x, z, y = .45) => [2, [.1, .16, .26], [x, y, z]];
  const carP = c => [[0, [2.5, .3, 1.2], [0, 0, 0], 0x2b2f38], [0, [2.6, .65, 1.3], [0, .3, 0], c], [1, [1.4, .55, 1.15], [-.1, .95, 0]], [0, [1.3, .1, 1.1], [-.1, 1.5, 0], c], LGT(-1.3, .5), LGT(-1.3, -.5)];
  const angP = (b, s) => [[0, [3.4, .3, 1.4], [0, 0, 0], 0x2b2f38], [0, [3.5, .95, 1.5], [0, .3, 0], b], [0, [3.52, .22, 1.52], [0, .7, 0], s], [1, [3.2, .6, 1.4], [-.1, 1.25, 0]], [0, [3.3, .12, 1.5], [-.1, 1.85, 0], b], LGT(-1.75, .55), LGT(-1.75, -.55)];
  const mkParts = i => (i % 3 === 0 ? angP(GR, YE) : carP(CP[i % 8]));

  const veh = [];
  function addLane(c, dir, dens, o) {
    const len = c.userData.len, n = Math.floor(len / 4.8 * dens), lat = c.userData.w / 4;
    for (let i = 0; i < n; i++) veh.push({ c, dir, lat, len, off: i * len / n, i: veh.length, parts: mkParts(veh.length + o) });
  }
  addLane(Rsur, 1, 1.1, 1); addLane(Rsur, -1, 1.0, 4);
  addLane(Rmaj, -1, 1.0, 2); addLane(Rsen, 1, 1.0, 5);
  addLane(RdipW, 1, 1.0, 0); addLane(RdipE, 1, 1.0, 1); addLane(RdipW, -1, 1.0, 3); addLane(RdipE, -1, 1.0, 4);
  addLane(Rmaj, 1, 1.0, 3); addLane(Rsen, -1, 1.0, 0);
  [[Rcla, 2], [Rcim, 3], [Rcil, 4], [RriauW, 2], [RriauE, 5], [Rdago, 3]].forEach(r => { addLane(r[0], 1, 1.0, r[1]); addLane(r[0], -1, 1.0, r[1] + 3); });
  addLane(CFly, 1, 1.0, 0); addLane(CFly, -1, 1.0, 1);

  const cnt = [0, 0, 0];
  veh.forEach(v => v.parts.forEach(p => { p.mi = p[0]; p.idx = cnt[p[0]]++; }));
  const HeadlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const VM = [IM(boxG, clay, cnt[0]), IM(boxG, MAT(0x7f95a8), cnt[1], true, false), IM(boxG, HeadlightMaterial, cnt[2], false, false)];
  veh.forEach(v => v.parts.forEach(p => {
    dum.position.set(p[2][0], p[2][1], p[2][2]); dum.rotation.set(0, 0, 0); dum.scale.set(p[1][0], p[1][1], p[1][2]); dum.updateMatrix();
    p.P = dum.matrix.clone(); if (p.mi === 0) setC(VM[0], p.idx, p[3]);
  }));
  VM[0].instanceColor.needsUpdate = true;

  const po = {}, vMat = new THREE.Matrix4();
  function updV(t, isReborn) {
    veh.forEach(v => {
      let u = v.off + .35 * t + .6 * Math.sin(1.3 * t + v.i * .9);
      u = ((u % v.len) + v.len) % v.len;
      const tt = v.dir > 0 ? u / v.len : 1 - u / v.len, p = v.c.getPointAt(tt), q = v.c.getTangentAt(tt).multiplyScalar(v.dir);
      po.x = p.x + q.z * v.lat; po.z = p.z - q.x * v.lat; po.y = v.c === CFly ? p.y + .1 : .16;
      po.ry = Math.atan2(-q.z, q.x);
      const s = isReborn ? 0.001 : 1;
      if(v.glbMesh){v.glbMesh.position.set(po.x,po.y,po.z);v.glbMesh.rotation.y=po.ry;v.glbMesh.scale.setScalar(s)}dum.position.set(po.x, po.y, po.z); dum.rotation.set(0, po.ry, 0); dum.scale.setScalar(s); dum.updateMatrix(); vMat.copy(dum.matrix);
      v.parts.forEach(part => {
        MA.multiplyMatrices(vMat, part.P); VM[part.mi].setMatrixAt(part.idx, MA);
      });
    });
    VM.forEach(m => { m.instanceMatrix.needsUpdate = true; });
  }
//   (function initGLBCityAssets(){const L=THREE.GLTFLoader||window.GLTFLoader;if(!L)return;const ld=new L(),grp=new THREE.Group();scene.add(grp);const fit=(raw,w,h,d)=>{const r=raw.clone(true);r.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m){m.roughness=0.88;m.metalness=0.05}})}});const b=new THREE.Box3().setFromObject(r),sz=b.getSize(new THREE.Vector3()),ct=b.getCenter(new THREE.Vector3());const sx=sz.x>1e-3?w/sz.x:1,sy=sz.y>1e-3?h/sz.y:1,szz=sz.z>1e-3?d/sz.z:1;const g=new THREE.Group();r.scale.set(sx,sy,szz);r.position.set(-ct.x*sx,-b.min.y*sy,-ct.z*szz);g.add(r);return g};ld.load("models/Tree.glb",g=>{if(trunkM)trunkM.visible=false;if(crownM)crownM.visible=false;trees.forEach((t,i)=>{const sc=(t.s||1)*4.4,m=fit(g.scene,sc,sc*1.15,sc);m.position.set(t.x,0,t.z);m.rotation.y=(i*1.37)%(PI*2);grp.add(m)})});ld.load("models/Bench.glb",g=>{if(bnM)bnM.visible=false;furn.forEach(f=>{if(f[0]!=="b")return;const m=fit(g.scene,1.9,0.85,0.75);m.position.set(f[1],0.1,f[2]);m.rotation.y=f[2]<-10?0:PI;grp.add(m)})});ld.load("models/Bus Stop.glb",g=>{if(typeof STATIONS==="undefined")return;STATIONS.forEach(st=>{const m=fit(g.scene,2.8,2.2,1.5),oz=st.sz>15?2.4:-2.4;m.position.set(st.sx,0.18,st.sz+oz);m.rotation.y=oz>0?PI:0;grp.add(m)})});const vFiles=["models/Van.glb","models/sedan.glb","models/taxi.glb","models/suv-luxury.glb","models/hatchback-sports.glb","models/Bus.glb"];Promise.all(vFiles.map(u=>new Promise(res=>ld.load(u,g=>res(g.scene),undefined,()=>res(null))))).then(arr=>{if(!arr[1])return;VM.forEach(m=>{if(m)m.visible=false});veh.forEach((v,idx)=>{const isAngkot=idx%3===0,src=isAngkot?(arr[0]||arr[1]):(arr[1+(idx%5)]||arr[1]),dim=isAngkot?[1.55,1.65,3.3]:(src===arr[5]?[1.75,1.9,4.2]:[1.45,1.25,2.75]),m=fit(src,dim[0],dim[1],dim[2]);m.children[0].rotation.y=PI/2;if(isAngkot)m.traverse(o=>{if(o.isMesh&&o.material&&o.material.color)o.material.color.lerp(new THREE.Color(0x2e9e5b),0.65)});v.glbMesh=m;grp.add(m)})})})();
  // Trem listrik, rel, halte, dan Koin Piraku di sekitar Gedung Sate sudah dihapus.
  // Placeholder di bawah cuma supaya fungsi lama yang masih nyebut nama-nama ini tidak error.
  const rebornGroup = new THREE.Group(); rebornGroup.visible = false; // sengaja tidak dimasukkan ke scene
  const tram = new THREE.Group();
  const STATIONS = [];
  let tramT = 0, tramDwell = 0, tramSt = { name: '', sx: 0, sz: 0 };
  let coinCount = parseInt(localStorage.getItem('piraku_coins') || '0', 10) || 0;
  const coinHud = null;
  // Dulu blok koin memakai 46 angka acak (seed). Dibuang 46x supaya tata letak pohon/bangku/dll di bawahnya tidak bergeser.
  for (let k = 0; k < 46; k++) rnd();

  // Lampu Jalan & Bangku Taman (terfilter dari aspal & persimpangan)
  const furn = [];
  const onRoad = (x, z, r = 3.5) => RP.some(p => (p.x - x) ** 2 + (p.z - z) ** 2 < r * r);

  // Bangku santai di tepi selatan & utara Lapangan Gasibu (di luar plaza upacara tengah)
  [-14, -10.5, 10.5, 14].forEach(bx => {
    furn.push(['b', bx, -2.2]);
    furn.push(['b', bx, -17.2]);
  });

  // Lampu jalan sepanjang koridor Diponegoro, Dago & Riau
  for (let x = -56; x <= 56; x += 8) {
    if (!onRoad(x, 6.7, 3.3) && !(x >= 28 && x <= 55)) furn.push(['l', x, 6.7]);
    if (Math.abs(x) > 18 && !onRoad(x + 4, -0.7, 3.3)) furn.push(['l', x + 4, -0.7]);
    if (!onRoad(x, 19.6, 3.3) && !(x >= 28 && x <= 55)) furn.push(['l', x, 19.6]);
  }
  for (let z = -44; z <= 32; z += 9) {
    if (!onRoad(-45.6, z, 3.3)) furn.push(['l', -45.6, z]);
    if (!onRoad(-38.4, z + 4.5, 3.3)) furn.push(['l', -38.4, z + 4.5]);
  }
  const nB = furn.filter(f => f[0] === 'b').length, nL = furn.filter(f => f[0] === 'l').length;
  const LAMPM = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffc861, emissiveIntensity: 0, roughness: .6 });
  const bnM = IM(boxG, MAT(0x8a6a4a), nB * 2, true, false), bnLegM = IM(boxG, MAT(0x1e293b), nB * 2, true, false), lpM = IM(poleG, MAT(0x374151), nL), lhM = IM(sphG, LAMPM, nL, false, false);
  let b = 0, l = 0;
  furn.forEach(f => {
    if (f[0] === 'b') {
      setM(bnM, b * 2, f[1], 0.26, f[2], 2, 0.1, 0.58);
      setM(bnM, b * 2 + 1, f[1], 0.48, f[2] - 0.25, 2, 0.45, 0.09);
      setM(bnLegM, b * 2, f[1] - 0.78, 0.0, f[2], 0.12, 0.26, 0.54);
      setM(bnLegM, b * 2 + 1, f[1] + 0.78, 0.0, f[2], 0.12, 0.26, 0.54);
      b++;
    }
    else if (f[0] === 'l') { setM(lpM, l, f[1], 0, f[2], 1, 4.2, 1); setM(lhM, l, f[1], 4.3, f[2], .35, .35, .35); l++; }
  });
  [bnM, bnLegM, lpM, lhM].forEach(m => m.instanceMatrix.needsUpdate = true);

  // Awan & Atmosfer
  const clouds = new THREE.Group(); scene.add(clouds);
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85, fog: false, depthWrite: false });
  const cloudG = new THREE.SphereGeometry(1, 12, 8);
  for (let i = 0; i < 16; i++) {
    const c = new THREE.Group(), n = 3 + Math.floor(rnd() * 3);
    for (let j = 0; j < n; j++) { const m = new THREE.Mesh(cloudG, cloudMat); m.scale.set(7 + rnd() * 7, 3 + rnd() * 2.5, 6 + rnd() * 4); m.position.set(j * 8 - n * 4, rnd() * 2, rnd() * 4); c.add(m); }
    c.position.set((rnd() - .5) * 700, 95 + rnd() * 45, (rnd() - .5) * 700); clouds.add(c);
  }
  const sp = [];
  for (let i = 0; i < 500; i++) { const a = rnd() * 2 * PI, e = .12 + rnd() * .85, r = 800; sp.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const stars = new THREE.Points(sg, starMat); scene.add(stars);

  const FN = 90, f0 = [], fpos = new Float32Array(FN * 3);
  for (let i = 0; i < FN; i++) f0.push([(rnd() - .5) * 90, .8 + rnd() * 3.5, (rnd() - .5) * 80 + 5, rnd() * 6.28]);
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
  const fireMat = new THREE.PointsMaterial({ color: 0xfff3a0, size: 4, sizeAttenuation: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const fireflies = new THREE.Points(fg, fireMat); fireflies.frustumCulled = false; scene.add(fireflies);

  function updAtmos(t) {
    TWM.emissiveIntensity = GLASSM.emissiveIntensity;
    const e = LAMPM.emissiveIntensity, night = e > 2, dusk = e > 0 && !night;
    cloudMat.color.setHex(night ? 0x24324d : dusk ? 0xffc59a : 0xffffff); cloudMat.opacity = night ? .5 : .85;
    clouds.children.forEach(c => { c.position.x += .02; if (c.position.x > 350) c.position.x -= 700; });
    starMat.opacity += ((night ? 1 : 0) - starMat.opacity) * .03;
    fireMat.opacity += (((curMode === 'reborn' && e > 0) ? .95 : 0) - fireMat.opacity) * .03;
    if (fireMat.opacity > .01) {
      for (let i = 0; i < FN; i++) {
        const f = f0[i];
        fpos[i * 3] = f[0] + Math.sin(t * .5 + f[3]) * 2;
        fpos[i * 3 + 1] = f[1] + Math.sin(t * .9 + f[3] * 2) * .6;
        fpos[i * 3 + 2] = f[2] + Math.cos(t * .4 + f[3]) * 2;
      }
      fg.attributes.position.needsUpdate = true;
    }

    if (isAmbiencePlaying && cricketsGain) {
      cricketsGain.gain.setValueAtTime(0, audioCtx.currentTime);
    }
  }

  // Waktu
  let curMode = 'reborn';
  const DAY = [0x5fa8dd, 0xd9e7ee], NIGHT = [0x050c18, 0x0f1d33], SUNSET = [0xc2410c, 0xfbbf24];
  
  function updateRealTimeWeather() {
    const now = new Date();
    const hour = window.__fh != null ? window.__fh : now.getHours();
    const mins = String(now.getMinutes()).padStart(2, '0');
    const badge = document.getElementById('time-badge');
    // default HemisphereLight untuk semua fase (dihaluskan per waktu)
    const hemiDay = 0.62, hemiDusk = 0.4, hemiNight = 0.22;

    if (hour >= 5 && hour < 10) {
      if (badge) badge.innerHTML = '🌅 Pagi (' + hour + ':' + mins + ')';
      skyU.top.value.setHex(DAY[0]); skyU.bot.value.setHex(DAY[1]);
      scene.fog.color.copy(skyU.bot.value); scene.fog.density = 0.00095; // kabut tipis pagi
      sun.color.setHex(0xfff3db); sun.intensity = 1.4; sun.position.set(-70, 50, 35); sun.shadow.radius = 4;
      amb.intensity = 0.48; hemi.intensity = hemiDay;
      LAMPM.emissiveIntensity = 0; GLASSM.emissiveIntensity = 0; HeadlightMaterial.color.setHex(0x555555);
    } else if (hour >= 10 && hour < 15) {
      if (badge) badge.innerHTML = '☀️ Siang (' + hour + ':' + mins + ')';
      skyU.top.value.setHex(DAY[0]); skyU.bot.value.setHex(DAY[1]);
      scene.fog.color.copy(skyU.bot.value); scene.fog.density = 0.0008; // siang sedikit lebih jernih
      sun.color.setHex(0xfff1de); sun.intensity = 1.55; sun.position.set(-40, 75, 45); sun.shadow.radius = 3;
      amb.intensity = 0.55; hemi.intensity = 0.66;
      LAMPM.emissiveIntensity = 0; GLASSM.emissiveIntensity = 0; HeadlightMaterial.color.setHex(0x555555);
    } else if (hour >= 15 && hour < 18) {
      if (badge) badge.innerHTML = '🌇 Senja (' + hour + ':' + mins + ')';
      skyU.top.value.setHex(SUNSET[0]); skyU.bot.value.setHex(SUNSET[1]);
      scene.fog.color.copy(skyU.bot.value); scene.fog.density = 0.00115; // kabut senja sedikit menebal
      sun.color.setHex(0xff8c42); sun.intensity = 1.05; sun.position.set(-70, 30, 20); sun.shadow.radius = 5;
      amb.intensity = 0.45; hemi.intensity = hemiDusk;
      LAMPM.emissiveIntensity = 0.8; GLASSM.emissiveIntensity = 0.6; HeadlightMaterial.color.setHex(0xfff7c2);
    } else {
      if (badge) badge.innerHTML = '🌙 Malam (' + hour + ':' + mins + ')';
      skyU.top.value.setHex(NIGHT[0]); skyU.bot.value.setHex(NIGHT[1]);
      scene.fog.color.setHex(0x0a1424); scene.fog.density = 0.0032; // malam lebih pekat
      sun.color.setHex(0x38bdf8); sun.intensity = 0.25; sun.position.set(-40, 60, -40); sun.shadow.radius = 3;
      amb.intensity = 0.25; hemi.intensity = hemiNight;
      LAMPM.emissiveIntensity = 2.4; GLASSM.emissiveIntensity = 1.6; HeadlightMaterial.color.setHex(0xffffff);
    }
  }
  updateRealTimeWeather();
  setInterval(updateRealTimeWeather, 60000);

  window.cycleTime = function () {
    const o = [8, 12, 16, 21, null]; window.__i = ((window.__i == null ? -1 : window.__i) + 1) % o.length; window.__fh = o[window.__i];
    updateRealTimeWeather(); showToast(window.__fh == null ? 'Kembali ke waktu asli' : 'Pratinjau jam ' + window.__fh + ':00');
  };

  function setVitals(mode, n) {
    const r = mode === 'reborn', b = Math.min(12, Math.round(n / 10));
    const v = { udara: r ? 80 + b : 30, hijau: r ? 70 + b : 22, macet: r ? 16 : 92 };
    for (const k in v) { const e = document.getElementById('v-' + k); if (e) { e.style.setProperty('--v', v[k] + '%'); e.nextElementSibling.textContent = v[k]; } }
  }

  function updateCityMilestones(count) {
    setVitals(curMode, count);
    const txt = document.getElementById('milestone-text');
    const nxt = document.getElementById('milestone-next');
    const tgt = Math.min(bl.length, Math.round(count * 1.8));
    gsap.to(grow, { v: tgt, duration: 2.5, ease: 'power1.inOut' });
    if (txt && nxt) {
      if (count < 5) { txt.innerText = 'Level 1 - Titik Awal'; nxt.innerText = 'Target 5: Kafe Gasibu'; }
      else if (count < 15) { txt.innerText = 'Level 2 - Kafe Gasibu Aktif'; nxt.innerText = 'Target 15: Lampu Jalan'; }
      else { txt.innerText = 'Level 3 - Paris van Java Reborn'; nxt.innerText = 'Kota Berkembang Pesat! ✨'; }
    }
  }

  
  window.focusCityMapOverview = function() {
    if (typeof joyX !== "undefined") joyX = 0;
    if (typeof joyY !== "undefined") joyY = 0;
    if (typeof isRidingTram !== "undefined" && isRidingTram && typeof toggleRideTram === "function") toggleRideTram();
    if (typeof showToast === "function") showToast("Menampilkan Peta Bandung 🗺️");
  };

  
  window.focusCityMapOverview = function() {
    if (typeof joyX !== "undefined") joyX = 0;
    if (typeof joyY !== "undefined") joyY = 0;
    if (typeof isRidingTram !== "undefined" && isRidingTram && typeof toggleRideTram === "function") toggleRideTram();
    if (typeof showToast === "function") showToast("Menampilkan Peta Bandung 🗺️");
  };

  window.toggleBottomPanel = function(show) {
    const panel = document.getElementById('bottom-control-panel');
    const fabBtn = document.getElementById('btn-show-panel');
    if (show) {
      if (panel) panel.classList.remove('hidden');
      if (fabBtn) fabBtn.style.display = 'none';
      showToast('Panel simulasi dibuka 🏙️');
    } else {
      if (panel) panel.classList.add('hidden');
      if (fabBtn) fabBtn.style.display = 'block';
      showToast('Menikmati pemandangan kota Bandung ✨');
    }
  };

  // ================= SISTEM WARGA & KARAKTER UTAMA =================
  const citizensGroup = new THREE.Group(); scene.add(citizensGroup);
  const clickableObjects = [], registeredCitizensList = []; window.registeredCitizensList = registeredCitizensList;
  let activeCitizenTarget = null;
  const animC = [], SKIN = [0xf5d0b5, 0xf1c9a0, 0xe0ac80, 0xc68a5c, 0x9a6a45, 0x6f472d];
  const SP = (r, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h);

  let myPlayerMesh = null;
  let isControlledByPlayer = false;

  function getSafeGasibuPos() {
    return {
      x: (Math.random() - 0.5) * 26,
      z: -14 + (Math.random() - 0.5) * 10
    };
  }

  function getSafeCityRoamPos() {
    const zones = [
      () => ({ x: (Math.random() - 0.5) * 34, z: -38 + (Math.random() - 0.5) * 14 }), // Area Monju
      () => ({ x: (Math.random() - 0.5) * 44, z: -14 + (Math.random() - 0.5) * 18 }), // Lapangan Gasibu
      () => ({ x: (Math.random() - 0.5) * 40, z: 9 + (Math.random() - 0.5) * 8 }),    // Depan Gedung Sate
      () => ({ x: 24 + Math.random() * 10, z: -12 + Math.random() * 34 }),             // Jalur Taman Lansia / Sentot
      () => ({ x: -38 + Math.random() * 16, z: -20 + Math.random() * 34 })             // Area Barat / Pasupati
    ];
    return zones[Math.floor(Math.random() * zones.length)]();
  }

  function parseCitizenStyle(c) {
    // Format c.acc: 'acc|skinIdx|pantsIdx|hairStyle|gender'
    const raw = String(c.acc || 'none');
    const parts = raw.split('|');
    const acc = parts[0] || 'none';
    let hash = 0;
    const seedStr = String(c.ig || c.name || 'bdg');
    for (let i = 0; i < seedStr.length; i++) hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    const skinIdx = parts[1] !== undefined ? parseInt(parts[1], 10) : Math.abs(hash) % SKIN.length;
    const pantsIdx = parts[2] !== undefined ? parseInt(parts[2], 10) : Math.abs(hash >> 2) % 7;
    const hairStyle = parts[3] || (Math.abs(hash >> 4) % 4 === 0 ? 'hijab' : 'short');
    const gender = parts[4] === 'female' ? 'female' : (parts[4] === 'male' ? 'male' : ((hairStyle === 'hijab' || hairStyle === 'ponytail' || hairStyle === 'long' || hairStyle === 'bob' || hairStyle === 'bun') ? 'female' : 'male'));
    return { acc, skinIdx: isNaN(skinIdx) ? 2 : skinIdx, pantsIdx: isNaN(pantsIdx) ? 0 : pantsIdx, hairStyle, gender };
  }

  const PANTS_PALETTE = [0x1e293b, 0x111827, 0x1d4ed8, 0x57534e, 0x7f1d1d, 0x14532d, 0xd6d3d1];

  function createCitizenMesh(c) {
    c.upvotes = c.upvotes || 0;
    c.acc = c.acc || 'none';
    c.kecamatan = c.kecamatan || 'Bandung Wetan';
    c.level = parseInt(c.level, 10) || 1;
    c.xp = parseInt(c.xp, 10) || 0;

    const st = parseCitizenStyle(c);
    const cg = new THREE.Group();
    const skin = SKIN[st.skinIdx % SKIN.length];
    const pantsColor = PANTS_PALETTE[st.pantsIdx % PANTS_PALETTE.length];
    const shirtColor = c.color || 0x1e3a8a;

    const body = new THREE.Group();
    cg.add(body);

    // Kaki & Sepatu Sneakers Sol Putih (ujung membulat)
    const mkLeg = (sd) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sd * 0.1, 0.36, 0);
      cg.add(legGroup);

      cyl(0.072, 0.060, 0.32, 12, 0, -0.32, 0, pantsColor, legGroup);
      cyl(0.064, 0.068, 0.055, 12, 0, -0.355, 0.01, 0x111827, legGroup);
      mk(SP(0.066, 10, 8), 0x111827, 0, -0.335, 0.08, legGroup);
      cyl(0.068, 0.072, 0.024, 12, 0, -0.365, 0.01, 0xf8fafc, legGroup, false);
      mk(SP(0.068, 10, 8), 0xf8fafc, 0, -0.355, 0.08, legGroup, false);
      return legGroup;
    };
    const legL = mkLeg(-1);
    const legR = mkLeg(1);

    // Torso Baju + Kerah Putih Rapi (siluet disesuaikan Male / Female)
    const isFemale = st.gender === 'female';
    cyl(isFemale ? 0.155 : 0.19, isFemale ? 0.21 : 0.22, 0.48, 16, 0, 0.34, 0, shirtColor, body);
    cyl(0.11, 0.12, 0.06, 14, 0, 0.81, 0, 0xf8fafc, body, false); // Kerah baju

    // Kepala Proporsional
    const head = new THREE.Group();
    head.position.y = 1.05;
    body.add(head);
    mk(SP(0.25, 20, 16), skin, 0, 0, 0, head);

    // Mata ekspresif + kilau putih + senyum tipis (+ bulu mata / blush lembut untuk female)
    [-0.085, 0.085].forEach((ex, eIdx) => {
      mk(SP(0.033, 10, 8), 0x0f172a, ex, -0.008, 0.226, head);
      mk(SP(0.011, 6, 6), 0xffffff, ex + 0.01, 0.004, 0.248, head, false);
      if (isFemale) {
        const lash = cyl(0.006, 0.006, 0.032, 6, ex + (eIdx === 0 ? -0.025 : 0.025), 0.012, 0.232, 0x0f172a, head, false);
        lash.rotation.z = eIdx === 0 ? 0.65 : -0.65;
        mk(SP(0.026, 8, 6), 0xf43f5e, ex + (eIdx === 0 ? -0.04 : 0.04), -0.048, 0.225, head, false);
      }
      const brow = cyl(0.008, 0.008, 0.045, 6, ex, 0.048, 0.232, 0x1c1917, head, false);
      brow.rotation.z = Math.PI / 2;
    });
    const smile = mk(new THREE.TorusGeometry(0.042, 0.008, 6, 12, Math.PI * 0.75), isFemale ? 0xe11d48 : 0x9a3412, 0, -0.068, 0.228, head, false);
    smile.rotation.z = Math.PI * 1.125;

    // Gaya Rambut / Hijab (Sculpted Halus, Tanpa Kotak)
    if (st.hairStyle === 'hijab') {
      const hijabColor = (shirtColor === 0xf8fafc || shirtColor === 0xe7dec8) ? 0x334155 : 0xf1f5f9;
      const dome = mk(new THREE.SphereGeometry(0.268, 20, 14, 0, PI * 2, 0, PI * 0.64), hijabColor, 0, 0.02, -0.045, head);
      dome.rotation.x = -0.42;
      cyl(0.21, 0.27, 0.22, 16, 0, -0.25, -0.052, hijabColor, head);
    } else if (st.hairStyle === 'ponytail') {
      mk(new THREE.SphereGeometry(0.264, 20, 14, 0, PI * 2, 0, PI * 0.56), 0x1c1917, 0, 0.025, -0.015, head);
      mk(new THREE.TorusGeometry(0.055, 0.016, 8, 14), 0xfacc15, 0, 0.07, -0.245, head, false);
      const tail = cyl(0.065, 0.025, 0.24, 12, 0, -0.05, -0.29, 0x1c1917, head);
      tail.rotation.x = 0.25;
    } else if (st.hairStyle === 'long') {
      mk(new THREE.SphereGeometry(0.268, 20, 14, 0, PI * 2, 0, PI * 0.58), 0x1c1917, 0, 0.025, -0.02, head);
      [-0.21, 0.21].forEach((sx, si) => {
        const sHair = cyl(0.058, 0.045, 0.36, 12, sx, -0.14, -0.02, 0x1c1917, head, false);
        sHair.rotation.z = si === 0 ? -0.06 : 0.06;
      });
      mk(new THREE.CylinderGeometry(0.255, 0.23, 0.34, 16, 1, false, Math.PI * 0.6, Math.PI * 0.8), 0x1c1917, 0, -0.13, -0.03, head, false);
    } else if (st.hairStyle === 'bob') {
      mk(new THREE.SphereGeometry(0.268, 20, 14, 0, PI * 2, 0, PI * 0.58), 0x1c1917, 0, 0.025, -0.02, head);
      const sideL = cyl(0.058, 0.048, 0.22, 12, -0.205, -0.06, -0.02, 0x1c1917, head, false);
      sideL.rotation.z = -0.08;
      const sideR = cyl(0.058, 0.048, 0.22, 12, 0.205, -0.06, -0.02, 0x1c1917, head, false);
      sideR.rotation.z = 0.08;
      mk(new THREE.CylinderGeometry(0.26, 0.24, 0.21, 16, 1, false, Math.PI * 0.65, Math.PI * 0.7), 0x1c1917, 0, -0.05, -0.02, head, false);
    } else if (st.hairStyle === 'bun') {
      mk(new THREE.SphereGeometry(0.262, 20, 14, 0, PI * 2, 0, PI * 0.55), 0x111827, 0, 0.025, -0.015, head);
      mk(SP(0.115, 14, 10), 0x111827, 0, 0.28, -0.05, head);
      mk(new THREE.TorusGeometry(0.085, 0.016, 8, 16), 0x38bdf8, 0, 0.23, -0.045, head, false).rotation.x = Math.PI / 2;
    } else if (st.hairStyle === 'curly') {
      mk(new THREE.SphereGeometry(0.282, 20, 14, 0, PI * 2, 0, PI * 0.6), 0x1c1917, 0, 0.03, -0.02, head);
      [[-0.21,0.11,-0.02],[0.21,0.11,-0.02],[0,0.23,-0.04],[-0.14,0.20,0.08],[0.14,0.20,0.08],[-0.15,0.16,-0.15],[0.15,0.16,-0.15]].forEach(p => mk(SP(0.102, 10, 8), 0x1c1917, p[0], p[1], p[2], head));
    } else if (st.hairStyle === 'spiky') {
      mk(new THREE.SphereGeometry(0.26, 18, 12, 0, PI * 2, 0, PI * 0.52), 0x111827, 0, 0.02, -0.015, head);
      [[-0.09,0.24,0.06],[0.09,0.24,0.06],[0,0.27,0.08],[-0.07,0.25,-0.06],[0.07,0.25,-0.06]].forEach(p => {
        mk(new THREE.ConeGeometry(0.055, 0.14, 8), 0x111827, p[0], p[1], p[2], head, false);
      });
    } else if (st.hairStyle === 'parted') {
      mk(new THREE.SphereGeometry(0.264, 20, 14, 0, PI * 2, 0, PI * 0.56), 0x1c1917, 0, 0.025, -0.015, head);
      mk(SP(0.085, 10, 8), 0x1c1917, -0.08, 0.19, 0.14, head, false);
      mk(SP(0.085, 10, 8), 0x1c1917, 0.08, 0.19, 0.14, head, false);
    } else if (st.hairStyle === 'mohawk') {
      mk(new THREE.SphereGeometry(0.256, 18, 12, 0, PI * 2, 0, PI * 0.45), 0x27272a, 0, 0.02, -0.015, head);
      for (let mi = -2; mi <= 2; mi++) {
        const spike = mk(new THREE.ConeGeometry(0.052, 0.16, 10), 0x111827, 0, 0.26 - Math.abs(mi) * 0.015, mi * 0.075 - 0.01, head, false);
        spike.rotation.x = mi * 0.16;
      }
    } else {
      mk(new THREE.SphereGeometry(0.264, 20, 14, 0, PI * 2, 0, PI * 0.56), 0x111827, 0, 0.025, -0.015, head);
      mk(SP(0.085, 10, 8), 0x111827, 0.06, 0.21, 0.14, head, false); // Jambul depan halus
    }

    // Aksesoris & Topi (Rounded)
    if (st.acc === 'glasses') {
      [-0.085, 0.085].forEach(gx => {
        const lens = cyl(0.046, 0.046, 0.02, 14, gx, -0.008, 0.236, 0x0f172a, head, false);
        lens.rotation.x = Math.PI / 2;
        const rim = mk(new THREE.TorusGeometry(0.048, 0.008, 8, 16), 0x334155, gx, -0.008, 0.242, head, false);
        rim.rotation.y = 0;
      });
      cyl(0.008, 0.008, 0.06, 8, 0, -0.004, 0.242, 0x334155, head, false).rotation.z = Math.PI / 2;
    } else if (st.acc === 'peci') {
      cyl(0.21, 0.23, 0.15, 20, 0, 0.16, 0, 0x0f172a, head);
    } else if (st.acc === 'caping') {
      cyl(0.04, 0.38, 0.18, 20, 0, 0.18, 0, 0xd97706, head);
    } else if (st.acc === 'cap') {
      mk(new THREE.SphereGeometry(0.268, 18, 12, 0, PI * 2, 0, PI * 0.5), 0x2563eb, 0, 0.04, -0.01, head);
      mk(new THREE.CylinderGeometry(0.24, 0.25, 0.022, 16, 1, false, -0.85, 1.7), 0x1e40af, 0, 0.055, 0.08, head, false);
    } else if (st.acc === 'headphones') {
      mk(new THREE.TorusGeometry(0.265, 0.022, 8, 20, Math.PI), 0x1e293b, 0, 0.04, 0, head, false);
      [-0.265, 0.265].forEach(hx => {
        const cup = cyl(0.068, 0.068, 0.05, 12, hx, 0.0, 0, 0x38bdf8, head, false);
        cup.rotation.z = Math.PI / 2;
      });
    } else if (st.acc === 'ribbon') {
      mk(new THREE.ConeGeometry(0.06, 0.10, 6), 0xf43f5e, -0.14, 0.22, 0.06, head, false).rotation.z = 0.8;
      mk(new THREE.ConeGeometry(0.06, 0.10, 6), 0xf43f5e, -0.04, 0.24, 0.06, head, false).rotation.z = -0.8;
      mk(SP(0.028, 8, 8), 0xfb7185, -0.09, 0.23, 0.07, head, false);
    } else if (st.acc === 'cat') {
      const cat = new THREE.Group();
      cat.position.set(0.36, 0, 0.18);
      cg.add(cat);
      const cBody = cyl(0.085, 0.095, 0.22, 12, 0, 0.09, 0, 0xf97316, cat);
      cBody.rotation.x = Math.PI / 2;
      mk(SP(0.105, 12, 10), 0xf97316, 0, 0.18, 0.12, cat);
      [-0.055, 0.055].forEach(ex => mk(new THREE.ConeGeometry(0.032, 0.065, 8), 0xf97316, ex, 0.28, 0.11, cat, false));
      const cTail = cyl(0.018, 0.022, 0.18, 8, 0, 0.16, -0.14, 0xf97316, cat, false);
      cTail.rotation.x = -0.5;
    }

    // Lengan + Telapak Tangan Sewarna Kulit
    const arm = sd => {
      const q = new THREE.Group();
      q.position.set(sd * 0.24, 0.72, 0);
      body.add(q);
      cyl(0.052, 0.045, 0.34, 10, 0, -0.34, 0, shirtColor, q);
      mk(SP(0.052, 8, 8), skin, 0, -0.37, 0, q);
      return q;
    };
    const armL = arm(-1), armR = arm(1);

    // Ring indikator halus di bawah kaki
    const rg = new THREE.RingGeometry(0.36, 0.44, 24);
    rg.rotateX(-PI / 2);
    mk(rg, new THREE.MeshBasicMaterial({ color: shirtColor, transparent: true, opacity: 0.55 }), 0, 0.03, 0, cg, false, false);

    let posX = c.x, posZ = c.z;
    let isResidentAtHouse = false;
    if (c.has_house) {
      const hData = spawnCitizenHouse(c, c.house_index || registeredCitizensList.length);
      posX = hData.porchX;
      posZ = hData.porchZ;
      c.x = posX;
      c.z = posZ;
      isResidentAtHouse = true;
    }

    cg.scale.setScalar(1.22);
    cg.position.set(posX, 0.1, posZ);

    cg.userData.a = {
      body, head, armL, armR, legL, legR, ph: rnd() * 6.28, c,
      tx: posX, tz: posZ,
      walk: !isResidentAtHouse,
      isAtHouse: isResidentAtHouse
    };
    animC.push(cg);

    const hitbox = mk(new THREE.BoxGeometry(1.2, 2.2, 1.2), new THREE.MeshBasicMaterial({ visible: false }), 0, 1.1, 0, cg);
    hitbox.userData = c;
    hitbox.userData.meshGroup = cg;
    clickableObjects.push(hitbox);
    const normNewIg = String(c?.ig || '').trim().toLowerCase().replace(/^@/, '');
    if (!c?.isRoleNpc) {
      const existingIdx = normNewIg ? registeredCitizensList.findIndex(x => String(x?.ig || '').trim().toLowerCase().replace(/^@/, '') === normNewIg) : -1;
      if (existingIdx >= 0) {
        registeredCitizensList[existingIdx] = Object.assign({}, registeredCitizensList[existingIdx], c);
      } else {
        registeredCitizensList.push(c);
      }
    } else if (c.npcBadge) {
      const cv = document.createElement('canvas');
      cv.width = 420; cv.height = 96;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = c.badgeBg || 'rgba(15,23,42,0.92)';
      ctx.beginPath(); ctx.roundRect(6, 6, 408, 84, 24); ctx.fill();
      ctx.strokeStyle = c.badgeBorder || '#38bdf8'; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = c.badgeTextCol || '#bae6fd'; ctx.font = '800 20px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(c.npcBadge, 210, 36);
      ctx.fillStyle = '#ffffff'; ctx.font = '900 23px sans-serif';
      ctx.fillText(c.ig, 210, 70);
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false }));
      spr.scale.set(2.2, 0.50, 1);
      spr.position.set(0, 1.88, 0);
      cg.add(spr);

      // Aura cincin bercahaya di bawah kaki NPC sesuai peran
      const auraColHex = parseInt(String(c.badgeBorder || '#38bdf8').replace('#', ''), 16) || 0x38bdf8;
      const auraGeo = new THREE.RingGeometry(0.48, 0.66, 28);
      auraGeo.rotateX(-PI / 2);
      const roleAura = new THREE.Mesh(auraGeo, new THREE.MeshBasicMaterial({ color: auraColHex, transparent: true, opacity: 0.65, side: THREE.DoubleSide }));
      roleAura.position.y = 0.04;
      cg.add(roleAura);
      cg.userData.roleAuraRing = roleAura;

      // Properti 3D khas tiap NPC (Ukulele Neng Rara, Kamera Teh Dinda, Sapu Mang Asep, Kristal Ki Sunda, Gulungan Mang Cepot)
      if (c.npcRole === 'beggar') {
        const uke = new THREE.Group();
        uke.position.set(0.06, 0.56, 0.22);
        uke.rotation.z = -0.55;
        uke.rotation.x = 0.15;
        cyl(0.11, 0.12, 0.055, 14, 0, -0.05, 0, 0xb45309, uke).rotation.x = PI / 2;
        cyl(0.085, 0.09, 0.055, 14, 0, 0.07, 0, 0xd97706, uke).rotation.x = PI / 2;
        cyl(0.036, 0.036, 0.06, 10, 0, -0.02, 0.005, 0x1e293b, uke, false).rotation.x = PI / 2;
        box(0.045, 0.28, 0.03, 0, 0.23, 0, 0x78350f, uke);
        box(0.065, 0.08, 0.035, 0, 0.39, 0, 0x451a03, uke);
        body.add(uke);
      } else if (c.npcRole === 'quest_photo') {
        const camProp = new THREE.Group();
        camProp.position.set(0, 0.62, 0.22);
        box(0.18, 0.12, 0.10, 0, 0, 0, 0x1e293b, camProp);
        cyl(0.045, 0.045, 0.08, 12, 0, 0, 0.07, 0x94a3b8, camProp).rotation.x = PI / 2;
        body.add(camProp);
      } else if (c.npcRole === 'quest_clean') {
        const broom = new THREE.Group();
        broom.position.set(0, -0.34, 0.08);
        broom.rotation.x = 0.4;
        cyl(0.018, 0.018, 0.95, 8, 0, 0.15, 0, 0x92400e, broom);
        cyl(0.03, 0.11, 0.22, 10, 0, -0.36, 0, 0xd97706, broom);
        armR.add(broom);
      } else if (c.npcRole === 'fortune') {
        const orb = mk(SP(0.10, 12, 10), new THREE.MeshBasicMaterial({ color: 0xc084fc }), 0, -0.38, 0.08, armR, false);
        orb.material.transparent = true; orb.material.opacity = 0.9;
      } else if (c.npcRole === 'quest') {
        const scroll = cyl(0.035, 0.035, 0.24, 10, 0, -0.36, 0.06, 0xfef08a, armR);
        scroll.rotation.x = PI / 2;
      }
    }
    citizensGroup.add(cg);

    const myIg = localStorage.getItem('piraku_my_ig');
    if (myIg && (c?.ig || '').toLowerCase() === String(myIg || '').toLowerCase()) {
      setupActivePlayer(cg, c);
    }

    return cg;
  }

  
  window.spawnGuestCitizen = function() {
    if (myPlayerMesh) return myPlayerMesh;
    const savedIg = localStorage.getItem('piraku_my_ig');
    if (savedIg) return null;
    const guestId = 'Tamu_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const safePos = getSafeGasibuPos();
    const guestData = {
      id: -Date.now(),
      name: guestId,
      ig: guestId,
      role: 'TAMU',
      kecamatan: 'Bandung Wetan',
      wish: 'Wargi tamu lagi jalan-jalan di Gasibu!',
      color: [0x2d6a4f, 0xc2593f, 0x334155, 0x0f766e, 0x78350f][Math.floor(Math.random() * 5)],
      acc: "none|" + Math.floor(Math.random() * 3) + "|0|short",
      x: safePos.x,
      z: safePos.z,
      upvotes: 0
    };
    const mesh = createCitizenMesh(guestData);
    setupActivePlayer(mesh, guestData);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 820;
    if (isTouch) {
      const jz = document.getElementById('joystick-zone');
      const jb = document.getElementById('btn-jump-mobile');
      if (jz) jz.style.display = 'block';
      if (jb) jb.style.display = 'flex';
    }
    return mesh;
  };
  window.getMyActivePlayerMesh = () => myPlayerMesh;
  window.pirakuCreateCitizenMesh = createCitizenMesh;
  window.pirakuScene = scene;

  


  

  window.pirakuCamera = typeof camera !== "undefined" ? camera : (typeof cam !== "undefined" ? cam : null);
  window.hideStaticCitizenByIg = (ig, hide) => {
    if (!ig) return;
    const target = String(ig).toLowerCase();
    registeredCitizensList.forEach(c => {
      if (!c.isRemoteLive && c.ig && c.ig.toLowerCase() === target && c.meshGroup && c.meshGroup !== myPlayerMesh) {
        c.meshGroup.visible = !hide;
      }
    });
  };

  function setupActivePlayer(mesh, c) {
    if (typeof joyX !== "undefined") joyX = 0;
    if (typeof joyY !== "undefined") joyY = 0;
    if (typeof joyActive !== "undefined") joyActive = false;
          if (typeof controls !== "undefined" && controls) {
            const wasDamping = controls.enableDamping;
            controls.enableDamping = false;
            controls.enableZoom = true;
            controls.enabled = true;
            controls.update();
            controls.enableDamping = wasDamping;
          }
    if (typeof joyX !== "undefined") joyX = 0;
    if (typeof joyY !== "undefined") joyY = 0;
    if (typeof joyActive !== "undefined") joyActive = false;
          if (typeof controls !== "undefined" && controls) {
            const wasDamping = controls.enableDamping;
            controls.enableDamping = false;
            controls.enableZoom = true;
            controls.enabled = true;
            controls.update();
            controls.enableDamping = wasDamping;
          }
    if (c && c.color !== undefined) localStorage.setItem('piraku_my_color', String(c.color));
    if (c && c.acc) localStorage.setItem('piraku_my_acc', String(c.acc));
    if (typeof window.forceBroadcastMyAppearance === 'function') window.forceBroadcastMyAppearance();
    myPlayerMesh = mesh;
    if (myPlayerMesh) {
      myPlayerMesh.userData.isPlayer = true;
      myPlayerMesh.userData.isAI = false;
      if (myPlayerMesh.userData.a) { myPlayerMesh.userData.a.spd = 0; myPlayerMesh.userData.a.target = null; }
    }
    if (myPlayerMesh) {
      myPlayerMesh.userData.isPlayer = true;
      myPlayerMesh.userData.isAI = false;
      if (myPlayerMesh.userData.a) { myPlayerMesh.userData.a.spd = 0; myPlayerMesh.userData.a.target = null; }
    }
    isControlledByPlayer = true;
    mesh.userData.a.walk = false;

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 900) {
      const joyZone = document.getElementById('joystick-zone');
      if (joyZone) {
        joyZone.style.display = 'block';
        joyZone.style.visibility = 'visible';
        joyZone.style.pointerEvents = 'auto';
      }
      const jumpBtn = document.getElementById('btn-jump-mobile');
      if (jumpBtn) jumpBtn.style.display = 'flex';
    }

    if (!window.pirakuInDistrict && mesh && mesh.position) {
      if (typeof rebuildPirakuBuildingColliders === "function") rebuildPirakuBuildingColliders();
      const px = mesh.position.x, pz = mesh.position.z;
      const stuckInCollider = Array.isArray(pirakuBuildingColliders) && pirakuBuildingColliders.some(b =>
        px > b.minX - 0.55 && px < b.maxX + 0.55 && pz > b.minZ - 0.55 && pz < b.maxZ + 0.55
      );
      if (stuckInCollider || (Math.abs(px) < 0.5 && Math.abs(pz) < 0.5)) {
        const safe = getSafeGasibuPos();
        mesh.position.set(safe.x, 0.1, safe.z);
        if (mesh.userData && mesh.userData.a && mesh.userData.a.c) {
          mesh.userData.a.c.x = safe.x;
          mesh.userData.a.c.z = safe.z;
        }
      }
      if (typeof resolvePirakuBuildingCollision === "function") {
        resolvePirakuBuildingCollision(mesh.position, mesh.position.x, mesh.position.z, 0.48);
      }
    }

    gsap.to(cam.position, { x: mesh.position.x - 3.5, y: 3.2, z: mesh.position.z - 5.5, duration: 1.5, ease: 'power2.out' });
    controls.target.copy(mesh.position);
    showToast('Mode Kontrol Aktif! Gerakkan dengan WASD / Joystick 🎮');

    if (!activeQuestSystem) {
      // activeQuestSystem disabled: new QuestSystem(scene, supabaseClient, c);
    }
  }

  // Walkot (Berdiri ramah di tepi plaza depan Gedung Sate sebelah barat, lengkap dengan meja kopi santai)
  const WALKOT = new THREE.Group();
  WALKOT.position.set(-6.5, 0.14, 1.4);
  WALKOT.scale.setScalar(1.18);
  WALKOT.rotation.y = 0.55;
  scene.add(WALKOT);

  // Set meja kopi bundar & 2 kursi taman di sebelah Pak Walkot
  cyl(0.45, 0.45, 0.05, 16, 1.05, 0.56, 0.15, 0x9a6b43, WALKOT);
  cyl(0.05, 0.07, 0.56, 10, 1.05, 0, 0.15, 0x334155, WALKOT);
  cyl(0.28, 0.28, 0.04, 12, 1.05, 0, 0.15, 0x334155, WALKOT);
  cyl(0.06, 0.05, 0.1, 10, 0.92, 0.59, 0.12, 0xffffff, WALKOT); // Cangkir kopi

  // Kaki & sepatu pantofel hitam menapak tanah
  [-0.1, 0.1].forEach(lx => {
    cyl(0.065, 0.055, 0.44, 10, lx, 0, 0, 0x0f172a, WALKOT);
    box(0.13, 0.07, 0.22, lx, 0, 0.04, 0x111827, WALKOT);
  });

  // Badan jas biru navy + kemeja putih + dasi merah
  const bodW = new THREE.Group();
  bodW.position.set(0, 0.44, 0);
  WALKOT.add(bodW);
  cyl(0.21, 0.24, 0.56, 14, 0, 0, 0, 0x1e3a8a, bodW);
  box(0.12, 0.42, 0.05, 0, 0.12, 0.2, 0xffffff, bodW, false); // Kemeja V-neck
  box(0.045, 0.32, 0.06, 0, 0.16, 0.21, 0xdc2626, bodW, false); // Dasi merah

  // Kedua lengan (lengan kiri rileks, lengan kanan melambai ramah)
  cyl(0.055, 0.048, 0.44, 10, -0.27, 0.08, 0, 0x1e3a8a, bodW);
  mk(new THREE.SphereGeometry(0.055, 8, 8), 0xf4c29a, -0.27, 0.06, 0, bodW);
  const armRightW = new THREE.Group();
  armRightW.position.set(0.26, 0.48, 0);
  armRightW.rotation.z = -0.55;
  bodW.add(armRightW);
  cyl(0.055, 0.048, 0.42, 10, 0, -0.38, 0, 0x1e3a8a, armRightW);
  mk(new THREE.SphereGeometry(0.055, 8, 8), 0xf4c29a, 0, -0.4, 0, armRightW);

  // Kepala proporsional, kacamata hitam khas, & peci hitam nasional
  const headW = new THREE.Group();
  headW.position.set(0, 0.78, 0);
  bodW.add(headW);
  mk(new THREE.SphereGeometry(0.24, 14, 12), 0xf4c29a, 0, 0, 0, headW);
  // Kacamata bingkai hitam
  [-0.08, 0.08].forEach(ex => {
    box(0.09, 0.065, 0.03, ex, 0.02, 0.22, 0x0f172a, headW, false);
    box(0.065, 0.045, 0.035, ex, 0.02, 0.225, 0xe0f2fe, headW, false);
  });
  box(0.05, 0.018, 0.03, 0, 0.025, 0.225, 0x0f172a, headW, false);
  // Peci hitam pas di kepala
  cyl(0.21, 0.23, 0.16, 16, 0, 0.15, 0, 0x0f172a, headW);

  // Label nama mengambang khas Walikota (Navy & Emas) di atas Pak Walikota
  const wkCv = document.createElement('canvas'); wkCv.width = 420; wkCv.height = 64;
  const wkCtx = wkCv.getContext('2d');
  wkCtx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  wkCtx.beginPath(); wkCtx.roundRect(6, 6, 408, 52, 26); wkCtx.fill();
  wkCtx.strokeStyle = '#facc15'; wkCtx.lineWidth = 4; wkCtx.stroke();
  wkCtx.fillStyle = '#fde047'; wkCtx.font = '900 22px sans-serif'; wkCtx.textAlign = 'center'; wkCtx.textBaseline = 'middle';
  wkCtx.fillText('🏛️ Pak Walikota • Bandung', 210, 33);
  const wkSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(wkCv), transparent: true, depthTest: true }));
  wkSpr.scale.set(isPirakuMobile ? 1.75 : 2.15, isPirakuMobile ? 0.33 : 0.40, 1);
  wkSpr.position.set(0, 1.95, 0);
  WALKOT.add(wkSpr);

  const walkotData = { id: 0, name: 'Pak Walikota', ig: '@pirakubdg', role: 'WALKOT', npcBadge: '🏛️ WALIKOTA BANDUNG', kecamatan: 'Bandung Wetan', wish: 'Wilujeng sumping! Keliling Gasibu, mancing di Danau Taman Lansia, atau kunjungi 30 Kecamatan!', upvotes: 42, x: -6.5, z: 1.4 };
  const walkotHitbox = mk(new THREE.BoxGeometry(1.6, 2.4, 1.6), new THREE.MeshBasicMaterial({ visible: false }), -6.5, 1.1, 1.4);
  walkotHitbox.userData = walkotData;
  walkotHitbox.userData.meshGroup = WALKOT;
  clickableObjects.push(walkotHitbox);
  window.pirakuClickableObjects = clickableObjects;
  registeredCitizensList.push(walkotData);

  // ================= KDM (KANG DEDI MULYADI - GUBERNUR JABAR) KELILING GEDUNG SATE =================
  const KDM = new THREE.Group();
  KDM.position.set(-19.2, 0.14, 6.6);
  KDM.scale.setScalar(1.16);
  scene.add(KDM);

  const kdmWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.72 });
  const kdmPangsiMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.78 });
  const kdmSkinMat = new THREE.MeshStandardMaterial({ color: 0xe6b184, roughness: 0.7 });
  const kdmLegL = new THREE.Group(); kdmLegL.position.set(-0.1, 0.44, 0); KDM.add(kdmLegL);
  const kdmLegR = new THREE.Group(); kdmLegR.position.set(0.1, 0.44, 0); KDM.add(kdmLegR);
  [kdmLegL, kdmLegR].forEach(lg => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.068, 0.42, 8), kdmPangsiMat);
    p.position.y = -0.21;
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.2), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    sh.position.set(0, -0.41, 0.03);
    lg.add(p, sh);
  });

  const kdmBody = new THREE.Group(); kdmBody.position.set(0, 0.44, 0); KDM.add(kdmBody);
  const kdmTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.56, 12), kdmWhiteMat);
  kdmTorso.position.y = 0.28;
  const kdmCollar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.36, 0.05), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
  kdmCollar.position.set(0, 0.34, 0.2);
  kdmBody.add(kdmTorso, kdmCollar);

  const kdmArmL = new THREE.Group(); kdmArmL.position.set(-0.27, 0.48, 0); kdmBody.add(kdmArmL);
  const kdmArmR = new THREE.Group(); kdmArmR.position.set(0.27, 0.48, 0); kdmBody.add(kdmArmR);
  [kdmArmL, kdmArmR].forEach(ar => {
    const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.052, 0.42, 8), kdmWhiteMat);
    sl.position.y = -0.2;
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), kdmSkinMat);
    hd.position.y = -0.43;
    ar.add(sl, hd);
  });

  // Kepala, rambut gelap, & Iket Kepala Putih khas Sunda dengan simpul depan
  const kdmHead = new THREE.Group(); kdmHead.position.set(0, 0.78, 0); kdmBody.add(kdmHead);
  kdmHead.add(new THREE.Mesh(new THREE.SphereGeometry(0.235, 14, 12), kdmSkinMat));
  const kdmHair = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.48), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
  kdmHair.position.y = 0.03;
  const kdmIket = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.25, 0.13, 16), kdmWhiteMat);
  kdmIket.position.y = 0.095;
  const kdmIketKnot = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 8), kdmWhiteMat);
  kdmIketKnot.scale.set(1.2, 0.9, 0.8);
  kdmIketKnot.position.set(0, 0.11, 0.245);
  kdmHead.add(kdmHair, kdmIket, kdmIketKnot);

  // Label nama mengambang khas Gubernur (Navy & Emas) di atas Kang Dedi (KDM)
  const kdmCv = document.createElement('canvas'); kdmCv.width = 340; kdmCv.height = 64;
  const kdmCtx = kdmCv.getContext('2d');
  kdmCtx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  kdmCtx.beginPath(); kdmCtx.roundRect(6, 6, 328, 52, 26); kdmCtx.fill();
  kdmCtx.strokeStyle = '#facc15'; kdmCtx.lineWidth = 4; kdmCtx.stroke();
  kdmCtx.fillStyle = '#fde047'; kdmCtx.font = '900 22px sans-serif'; kdmCtx.textAlign = 'center'; kdmCtx.textBaseline = 'middle';
  kdmCtx.fillText('🏛️ KDM • Gubernur Jabar', 170, 33);
  const kdmSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(kdmCv), transparent: true, depthTest: true }));
  kdmSpr.scale.set(isPirakuMobile ? 1.75 : 2.15, isPirakuMobile ? 0.33 : 0.40, 1);
  kdmSpr.position.set(0, 1.95, 0);
  KDM.add(kdmSpr);

  const kdmData = {
    id: -1,
    name: 'Kang Dedi Mulyadi (KDM)',
    ig: 'Kang Dedi Mulyadi (KDM)',
    role: 'GUBERNUR',
    npcBadge: '🏛️ GUBERNUR JABAR',
    kecamatan: 'Jawa Barat',
    wish: 'Sampurasun wargi! Jaga walungan & lingkungan Bandung, hayu urang sauyunan ngawangun Jabar!',
    upvotes: 99,
    x: -19.2,
    z: 6.6,
    meshGroup: KDM
  };
  const kdmHitbox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.3, 1.5), new THREE.MeshBasicMaterial({ visible: false }));
  kdmHitbox.position.set(0, 1.1, 0);
  kdmHitbox.userData = kdmData;
  KDM.add(kdmHitbox);
  clickableObjects.push(kdmHitbox);

  const kdmWaypoints = [[-19.2, 6.6], [19.2, 6.6], [19.2, 21.0], [-19.2, 21.0]];
  let kdmWpIdx = 1;

  // ================= NPC RANDOM BERPERAN (MISI, PREMAN PALAK, PENGAMEN, PERAMAL, FOTOGRAFER, KEBERSIHAN) =================
  (function spawnCityRoleNpcs() {
    const roleSpecs = [
      {
        id: -101,
        isRoleNpc: true,
        ig: 'Kang Preman Gasibu',
        role: 'PREMAN',
        npcRole: 'extort',
        npcBadge: '🕶️ PREMAN GASIBU',
        badgeBg: 'rgba(127, 29, 29, 0.94)',
        badgeBorder: '#ef4444',
        badgeTextCol: '#fecaca',
        color: 0x1e293b,
        acc: 'glasses|2|0|mohawk|male',
        x: -14.5, z: -12.0,
        wish: 'Eh bro, lewat wilayah Gasibu ada uang keamanan 15 🪙 nih! Mau kasih baik-baik atau gue pelototin?'
      },
      {
        id: -102,
        isRoleNpc: true,
        ig: 'Neng Rara • Pengamen',
        role: 'PENGAMEN',
        npcRole: 'beggar',
        npcBadge: '🎸 PENGAMEN BRAGA',
        badgeBg: 'rgba(131, 24, 67, 0.94)',
        badgeBorder: '#f472b6',
        badgeTextCol: '#fbcfe8',
        color: 0xdb2777,
        acc: 'ribbon|1|3|long|female',
        x: 10.5, z: -20.5,
        wish: 'Permisi akang/teteh, lagi ngamen buat beli senar gitar nih... Boleh minta 10 🪙 seikhlasnya?'
      },
      {
        id: -103,
        isRoleNpc: true,
        ig: 'Mang Cepot • Misi',
        role: 'PEMBERI_MISI',
        npcRole: 'quest',
        npcBadge: '📜 PEMBERI MISI',
        badgeBg: 'rgba(12, 74, 110, 0.94)',
        badgeBorder: '#38bdf8',
        badgeTextCol: '#bae6fd',
        color: 0x0284c7,
        acc: 'peci|2|1|short|male',
        x: -11.0, z: -28.0,
        wish: 'Mau duit jajan? Coba jogging keliling Gasibu sejauh 22 meter dari sini, nanti Mang kasih 45 🪙 + 40 XP!'
      },
      {
        id: -104,
        isRoleNpc: true,
        ig: 'Teh Dinda • Foto',
        role: 'FOTOGRAFER',
        npcRole: 'quest_photo',
        npcBadge: '📸 FOTOGRAFER KOTA',
        badgeBg: 'rgba(120, 53, 15, 0.94)',
        badgeBorder: '#f59e0b',
        badgeTextCol: '#fde68a',
        color: 0xd97706,
        acc: 'cap|1|2|ponytail|female',
        x: 11.5, z: 6.5,
        wish: 'Wargi kece! Yuk ikutan sesi foto wisata depan Gedung Sate, langsung dapat 35 🪙 + 30 XP!'
      },
      {
        id: -105,
        isRoleNpc: true,
        ig: 'Ki Sunda • Peramal',
        role: 'PERAMAL',
        npcRole: 'fortune',
        npcBadge: '🔮 PERAMAL GASIBU',
        badgeBg: 'rgba(88, 28, 135, 0.94)',
        badgeBorder: '#c084fc',
        badgeTextCol: '#e9d5ff',
        color: 0x7e22ce,
        acc: 'peci|3|4|short|male',
        x: 22.5, z: 12.0,
        wish: 'Sampurasun... Cukup mahar 5 🪙, Ki Sunda ramal hokimu hari ini — kalau lagi mujur bisa dapat berkah koin!'
      },
      {
        id: -106,
        isRoleNpc: true,
        ig: 'Mang Asep • Kebersihan',
        role: 'KEBERSIHAN',
        npcRole: 'quest_clean',
        npcBadge: '🧹 TIM KEBERSIHAN',
        badgeBg: 'rgba(20, 83, 45, 0.94)',
        badgeBorder: '#4ade80',
        badgeTextCol: '#bbf7d0',
        color: 0x16a34a,
        acc: 'cap|2|5|parted|male',
        x: 16.0, z: -12.5,
        wish: 'Ayo wargi bantu Mang Asep bersihin daun kering di sekitar Gasibu! Hadiah 30 🪙 + 35 XP!'
      }
    ];

    roleSpecs.forEach(sp => {
      createCitizenMesh(sp);
    });
  })();

  let totalWarga = 1;

  window.syncAmbientOfflineNpcVisibility = function(onlineCount) {
    const count = Number(onlineCount) || 1;
    window.pirakuOnlineCount = count;
    const hideAmbient = count > 10;
    animC.forEach(g => {
      if (g && g !== myPlayerMesh && g.userData && g.userData.isAmbientOfflineNpc) {
        g.visible = !hideAmbient;
        if (hideAmbient && activeCitizenTarget && activeCitizenTarget.meshGroup === g) {
          hideCitizenSpeech();
        }
      }
    });
  };

  async function loadCitizensFromDB() {
    if (!supabaseClient) { 
      const counterEl = document.getElementById('warga-counter');
      if (counterEl) counterEl.innerText = '1 WARGA'; 
      updateCityMilestones(1); 
      return; 
    }
    try {
      const allRows = [];
      const pageSize = 1000;
      for (let from = 0; from < 50000; from += pageSize) {
        const { data: page, error } = await supabaseClient
          .from('warga_publik')
          .select('*')
          .order('id', { ascending: true })
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!page || page.length === 0) break;
        allRows.push(...page);
        if (page.length < pageSize) break;
      }
      if (allRows.length > 0) {
        const mySavedIg = (localStorage.getItem('piraku_my_ig') || '').trim().toLowerCase();
        let ambientNpcCount = 0;
        allRows.forEach(c => {
          const isMe = mySavedIg && String(c?.ig || '').trim().toLowerCase() === mySavedIg;
          if (isMe || ambientNpcCount < 10) {
            const cg = createCitizenMesh(c);
            if (!isMe) {
              if (cg) cg.userData.isAmbientOfflineNpc = true;
              ambientNpcCount++;
            }
          } else {
            // Tetap simpan ke registeredCitizensList untuk pencarian, leaderboard & distrik tanpa memenuhi Gedung Sate dengan NPC offline
            registeredCitizensList.push(c);
          }
        });
        if (typeof window.syncAmbientOfflineNpcVisibility === 'function') {
          window.syncAmbientOfflineNpcVisibility(window.pirakuOnlineCount || 1);
        }
        totalWarga = 1 + allRows.length;
      }
      const counterEl = document.getElementById('warga-counter');
      if (counterEl) counterEl.innerText = totalWarga + ' WARGA';
      updateCityMilestones(totalWarga); 
      window.updateAutoDetectButton();
      initCitizenTicker();
    } catch (err) {
      const counterEl = document.getElementById('warga-counter');
      if (counterEl) counterEl.innerText = '1 WARGA';
    }
  }
  loadCitizensFromDB().then(() => {
    const savedIg = (localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase();
    if (savedIg && Array.isArray(registeredCitizensList)) {
      const me = registeredCitizensList.find(c => String(c.ig || "").trim().toLowerCase() === savedIg);
      if (me) {
        const localXp = parseInt(localStorage.getItem("piraku_my_xp") || "0", 10) || 0;
        const dbXp = typeof me.xp === "number" ? me.xp : 0;
        const bestXp = Math.max(localXp, dbXp);
        const lvlObj = typeof window.computePirakuLevelFromTotalXp === "function"
          ? window.computePirakuLevelFromTotalXp(bestXp)
          : { level: Math.max(parseInt(localStorage.getItem("piraku_my_level") || "1", 10) || 1, me.level || 1) };
        localStorage.setItem("piraku_my_xp", String(bestXp));
        localStorage.setItem("piraku_my_level", String(lvlObj.level));
        me.xp = bestXp;
        me.level = lvlObj.level;
        if (me.kecamatan) localStorage.setItem("piraku_my_kec", me.kecamatan);
        if (me.color !== undefined) localStorage.setItem("piraku_my_color", String(me.color));
        if (me.acc) localStorage.setItem("piraku_my_acc", String(me.acc));
        if (me.has_house) {
          const suf = "_" + savedIg.replace(/^@/, "");
          localStorage.setItem("piraku_has_house" + suf, "1");
          localStorage.setItem("piraku_house_keys" + suf, "3");
        }
        if (typeof window.updateAutoDetectButton === "function") window.updateAutoDetectButton();
        if (typeof window.syncPirakuMissionsFromCloud === "function") window.syncPirakuMissionsFromCloud();
        if (typeof window.autoSpawnRegisteredDistrict === "function") window.autoSpawnRegisteredDistrict(true);
      } else if (registeredCitizensList.length > 0 || supabaseClient) {
        // Sesi lama di browser ini sudah tidak ada di database (misal pasca-reset) -> bersihkan otomatis
        ["piraku_my_ig", "piraku_my_level", "piraku_my_xp", "piraku_my_kec", "piraku_ktp_kecamatan", "piraku_my_color", "piraku_my_acc", "piraku_my_inventory"].forEach(k => localStorage.removeItem(k));
        if (typeof window.reloadPirakuEconomyForCurrentUser === "function") window.reloadPirakuEconomyForCurrentUser();
      if (typeof window.refreshPirakuFishingForCurrentUser === "function") window.refreshPirakuFishingForCurrentUser();
        if (typeof window.updateAutoDetectButton === "function") window.updateAutoDetectButton();
      }
    }
    if (typeof window.evaluateWeeklyCamatRotation === "function") window.evaluateWeeklyCamatRotation(registeredCitizensList);
    if (!localStorage.getItem("piraku_my_ig") && window.spawnGuestCitizen) window.spawnGuestCitizen();
  });

  // Ticker Aspirasi (dinonaktifkan)
  let currentTickerIndex = 0;
  function initCitizenTicker() {}

  window.focusCurrentTickerCitizen = function() {
    const c = registeredCitizensList[currentTickerIndex];
    if (c) {
      showCitizenSpeech(c, true);
      showToast('Kamera terbang ke ' + c.ig + ' ✨');
    }
  };

  // Raycaster Tap
  const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
  let touchStartPos = { x: 0, y: 0 }, touchStartTime = 0, activeTapPointerId = null;
  window.addEventListener('pointerdown', e => {
    if (e.target !== renderer.domElement) { activeTapPointerId = null; return; }
    if (e.pointerType === 'mouse' && e.button !== 0) { activeTapPointerId = null; return; }
    activeTapPointerId = e.pointerId;
    touchStartTime = performance.now();
    touchStartPos = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('pointerup', e => {
    if (e.target !== renderer.domElement) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (activeTapPointerId !== null && e.pointerId !== activeTapPointerId) return;
    activeTapPointerId = null;
    if (performance.now() - touchStartTime < 300 && Math.hypot(e.clientX - touchStartPos.x, e.clientY - touchStartPos.y) < 8) {
      mouse.x = (e.clientX / W) * 2 - 1; mouse.y = -(e.clientY / H) * 2 + 1;
      raycaster.setFromCamera(mouse, cam);
      const hits = raycaster.intersectObjects(clickableObjects).filter(h => {
        const ud = h.object && h.object.userData;
        if (!ud) return false;
        let p = h.object;
        while (p) { if (p.visible === false) return false; p = p.parent; }
        return true;
      });
      if (window.pirakuInDistrict) {
        const distGrp = scene.getObjectByName("piraku-komplek-district-map");
        if (distGrp) {
          const dHits = raycaster.intersectObjects(distGrp.children, true);
          const aptHit = dHits.find(h => h.object && h.object.userData && h.object.userData.isKecamatanApartment);
          if (aptHit) {
            hideCitizenSpeech();
            if (typeof window.openActiveDistrictApartmentModal === "function") {
              window.openActiveDistrictApartmentModal();
            }
            return;
          }
        }
      }
      if (hits.length > 0) {
        pirakuTapWalkTarget = null;
        if (pirakuTapMarker) pirakuTapMarker.visible = false;
        showCitizenSpeech(hits[0].object.userData);
      } else {
        hideCitizenSpeech();
        pirakuTapWalkTarget = null;
        if (pirakuTapMarker) pirakuTapMarker.visible = false;
      }
    }
  });

  window.openKecamatanApartmentModal = function(kecKey) {
    const cleanKec = getKecamatanKey(kecKey);
    const state = ensureKecamatanSlotState(cleanKec);
    const occupantIgs = state.apartmentOccupants || [];

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
              <div id="kec-apt-sub" style="font-size:11px;color:#94a3b8;">Hunian vertikal warga setelah 36 kavling tapak terisi</div>
            </div>
            <button onclick="document.getElementById('kec-apartment-modal').style.display='none'" style="background:rgba(148,163,184,0.15);border:none;color:#f8fafc;width:28px;height:28px;border-radius:8px;cursor:pointer;font-weight:700;">✕</button>
          </div>
          <div id="kec-apt-body" style="padding:12px 14px;overflow-y:auto;flex:1;"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const titleEl = document.getElementById("kec-apt-title");
    const subEl = document.getElementById("kec-apt-sub");
    const bodyEl = document.getElementById("kec-apt-body");
    if (titleEl) titleEl.innerText = "🏢 Apartemen Kec. " + cleanKec;
    if (subEl) subEl.innerText = occupantIgs.length + " Penghuni Terdaftar (Unit Warga ke-21 dst.)";

    if (bodyEl) {
      if (occupantIgs.length === 0) {
        bodyEl.innerHTML = "<div style=\"padding:16px;text-align:center;color:#94a3b8;font-size:12px;\">Belum ada penghuni unit apartemen di kecamatan ini.</div>";
      } else {
        bodyEl.innerHTML = occupantIgs.map((ig, i) => {
          const cit = (registeredCitizensList || []).find(c => String(c.ig || "").toLowerCase() === String(ig).toLowerCase()) || { ig };
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
      }
    }

    modal.style.display = "flex";
  };

  const bubbleEl = document.getElementById('citizen-bubble'), tempV = new THREE.Vector3();
  function getNpcLines(data) {
    const r = data.role || '';
    const b = data.npcBadge || '';
    if (r === 'GUBERNUR') {
      return [
        data.wish,
        'Urang kudu miara walungan Cikapundung jeung taman kota, ulah miceun runtah sambarangan nya!',
        'Coba mancing di Danau Taman Lansia atawa di 29 kecamatan—cenah aya ikan Divine 1/100.000 nu langka pisan!',
        'Silih asah, silih asih, silih asuh! Hayu babarengan ngawangun Jawa Barat nu bersih tur asri.'
      ];
    }
    if (r === 'WALKOT') {
      return [
        data.wish,
        'Jangan lupa daftar E-KTP warga Bandung dan pilih Camat favoritmu di menu Pemilu!',
        'Di setiap kecamatan ada Kopdes Biru Putih buat jual hasil pancingan, beli umbul-umbul, dan upgrade joran.',
        'Kumpulkan koin dari narik Ojol 3D, Balap Gasibu, atau mancing buat bangun rumah hingga Villa Sultan!'
      ];
    }
    if (b.includes('PEMANCING')) {
      return [
        data.wish,
        'Tips: Pas lempar joran, hentikan bar di zona kuning (75%+) biar dapat ✨ PERFECT CAST (+25% Luck)!',
        'Jangan lupa kunci (🔒) ikan langkamu di Tas sebelum klik Jual Semua di Kopdes!',
        'Kalau pakai Joran Naga Siliwangi + Umbul-umbul Kosmik pas hujan, peluang dapat Cosmic & Divine naik drastis!'
      ];
    }
    return [
      data.wish,
      'Jajanan Bandung dari Kopdes bisa langsung dimakan atau disimpan ke 🎒 Tas buat ngebut kapan saja!',
      'Kalau capek mancing di dermaga, mampir jajan Cireng atau Bandrek hangat biar jalan makin kencang!'
    ];
  }

  const _npcRoleCooldowns = {};
  let _npcJogQuest = null;
  let activeNpcDialogueTarget = null;
  let _lastPremanInterceptAt = 0;

  const _npcProximityLastAt = {};
  const nengRaraAudio = new Audio('./assets/neng-rara-ukulele.mp3');
  nengRaraAudio.loop = true;
  nengRaraAudio.volume = 0;
  let nengRaraCurVol = 0;
  let nengRaraMuted = localStorage.getItem('piraku_mute_rara') === '1';

  window.syncNengRaraAudioState = function() {
    if (window.pirakuSoundMuted || nengRaraMuted) {
      nengRaraCurVol = 0;
      nengRaraAudio.muted = true;
      nengRaraAudio.volume = 0;
      if (!nengRaraAudio.paused) nengRaraAudio.pause();
    }
  };

  window.toggleNengRaraMute = function() {
    nengRaraMuted = !nengRaraMuted;
    localStorage.setItem('piraku_mute_rara', nengRaraMuted ? '1' : '0');
    if (nengRaraMuted) {
      nengRaraCurVol = 0;
      nengRaraAudio.muted = true;
      nengRaraAudio.volume = 0;
      if (!nengRaraAudio.paused) nengRaraAudio.pause();
    } else if (!window.pirakuSoundMuted) {
      nengRaraAudio.muted = false;
    }
    if (typeof window.showToast === 'function') {
      window.showToast(nengRaraMuted ? '🔇 Musik Neng Rara dimute' : '🎸 Musik Neng Rara dinyalakan');
    }
    const pillBtn = document.getElementById('piraku-rara-mute-pill');
    if (pillBtn) pillBtn.innerHTML = nengRaraMuted ? '🎸 Rara: 🔇 Unmute' : '🎸 Rara: 🔊 Mute';
  };

  function updateNengRaraSpatialAudio(pDist, inMainCity) {
    let pill = document.getElementById('piraku-rara-mute-pill');
    const fishUiEl = document.getElementById('piraku-fishing-ui');
    const isFishingUiOpen = Boolean(fishUiEl && fishUiEl.style.display && fishUiEl.style.display !== 'none');
    const nearPill = inMainCity && pDist < 8.5 && !isFishingUiOpen;
    if (nearPill) {
      if (!pill && document.body) {
        pill = document.createElement('button');
        pill.id = 'piraku-rara-mute-pill';
        pill.type = 'button';
        pill.style.cssText = 'position:fixed;bottom:204px;left:16px;z-index:24;background:rgba(15,23,42,0.9);border:1.5px solid #f472b6;color:#fbcfe8;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:800;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,0.45);';
        pill.onclick = () => window.toggleNengRaraMute();
        document.body.appendChild(pill);
      }
      if (pill) {
        pill.innerHTML = nengRaraMuted ? '🎸 Rara: 🔇 Unmute' : '🎸 Rara: 🔊 Mute';
        pill.style.display = 'inline-flex';
      }
    } else if (pill) {
      pill.style.display = 'none';
    }

    if (window.pirakuSoundMuted || nengRaraMuted) {
      nengRaraCurVol = 0;
      nengRaraAudio.muted = true;
      nengRaraAudio.volume = 0;
      if (!nengRaraAudio.paused) nengRaraAudio.pause();
      return;
    }

    if (!inMainCity || pDist >= 11.5) {
      if (!nengRaraAudio.paused) {
        nengRaraCurVol = Math.max(0, nengRaraCurVol - 0.04);
        nengRaraAudio.volume = nengRaraCurVol;
        if (nengRaraCurVol <= 0.01) {
          nengRaraCurVol = 0;
          nengRaraAudio.muted = true;
          nengRaraAudio.volume = 0;
          nengRaraAudio.pause();
        }
      }
      return;
    }

    const targetVol = 0.22 * Math.max(0, Math.min(1, 1 - pDist / 11.5));
    nengRaraAudio.muted = false;
    if (nengRaraAudio.paused && targetVol > 0.015) {
      nengRaraAudio.play().catch(() => {});
    }
    nengRaraCurVol += (targetVol - nengRaraCurVol) * 0.12;
    nengRaraAudio.volume = nengRaraCurVol;
  }

  function playNpcRoleSfx(roleType, isProximity) {
    if (typeof window.playSynthTone !== 'function') return;
    if (roleType === 'beggar') {
      if (!isProximity) {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => setTimeout(() => window.playSynthTone(f, 'triangle', 0.12), i * 85));
      }
    } else if (roleType === 'extort') {
      window.playSynthTone(isProximity ? 140 : 120, 'sawtooth', 0.18);
      if (!isProximity) setTimeout(() => window.playSynthTone(95, 'sawtooth', 0.22), 110);
    } else if (roleType === 'fortune') {
      window.playSynthTone(587.33, 'sine', 0.18);
      setTimeout(() => window.playSynthTone(880, 'sine', 0.22), 110);
    } else if (roleType === 'quest_photo') {
      if (isProximity) {
        window.playSynthTone(1150, 'sine', 0.08);
      } else {
        window.playSynthTone(1320, 'square', 0.05);
        setTimeout(() => window.playSynthTone(1760, 'sine', 0.09), 65);
      }
    } else if (roleType === 'quest_clean') {
      window.playSynthTone(440, 'triangle', 0.11);
      setTimeout(() => window.playSynthTone(554.37, 'triangle', 0.14), 90);
    } else if (roleType === 'quest') {
      window.playSynthTone(523.25, 'sine', 0.12);
      setTimeout(() => window.playSynthTone(659.25, 'sine', 0.16), 95);
    }
  }

  function triggerScreenTintFx(bgCss, durationMs) {
    const fx = document.createElement('div');
    fx.style.cssText = `position:fixed;inset:0;background:${bgCss};opacity:0.8;z-index:999998;pointer-events:none;transition:opacity ${(durationMs || 320) / 1000}s ease-out;`;
    document.body.appendChild(fx);
    requestAnimationFrame(() => { fx.style.opacity = '0'; });
    setTimeout(() => fx.remove(), (durationMs || 320) + 40);
  }

  function triggerScreenShakeFx() {
    const cvEl = renderer && renderer.domElement;
    if (!cvEl) return;
    cvEl.style.transition = 'transform 0.05s';
    const seq = [[-7, 4], [7, -4], [-5, -3], [5, 3], [0, 0]];
    seq.forEach(([x, y], i) => {
      setTimeout(() => { cvEl.style.transform = (x === 0 && y === 0) ? '' : `translate(${x}px, ${y}px)`; }, i * 55);
    });
  }

  const _pirakuStoryLogoImg = new Image();
  _pirakuStoryLogoImg.src = './assets/piraku-brand-logo.webp';

  function getPhotoAlbumKey() {
    const ig = (localStorage.getItem('piraku_my_ig') || '').trim().toLowerCase().replace(/^@/, '');
    return 'piraku_photo_album_' + (ig || 'guest');
  }
  function savePhotoToAlbum(dataUrl, label) {
    try {
      const key = getPhotoAlbumKey();
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.unshift({ url: dataUrl, label: label || 'Gedung Sate', ts: Date.now() });
      localStorage.setItem(key, JSON.stringify(arr.slice(0, 6)));
    } catch (_) {}
  }
  window.openTehDindaPhotoAlbum = function() {
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem(getPhotoAlbumKey()) || '[]'); } catch (_) {}
    let modal = document.getElementById('piraku-photo-album-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'piraku-photo-album-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.84);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';
      modal.addEventListener('pointerdown', e => e.stopPropagation());
      document.body.appendChild(modal);
    }
    const gridHtml = arr.length
      ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-height:62vh;overflow-y:auto;">${arr.map((it, i) => `
          <div style="background:#1e293b;border:1px solid rgba(250,204,21,0.35);border-radius:12px;padding:6px;text-align:center;">
            <img src="${it.url}" data-idx="${i}" style="width:100%;border-radius:8px;cursor:pointer;display:block;" alt="Foto ${i + 1}">
            <div style="font-size:10px;color:#fde047;font-weight:800;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${it.label || 'Story 9:16'}</div>
          </div>`).join('')}</div>`
      : `<div style="padding:24px;color:#94a3b8;font-size:12.5px;">Belum ada foto tersimpan. Ajak Teh Dinda foto bareng dulu!</div>`;
    modal.innerHTML = `
      <div style="background:#0f172a;border:2px solid #f59e0b;border-radius:18px;padding:14px;width:min(380px,94vw);color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.8);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-weight:900;font-size:14px;color:#fde047;">🖼️ Album Kenangan Teh Dinda</span>
          <button type="button" id="piraku-album-close" style="border:none;background:#1e293b;color:#cbd5e1;width:28px;height:28px;border-radius:999px;font-weight:900;cursor:pointer;">✕</button>
        </div>
        ${gridHtml}
      </div>
    `;
    modal.style.display = 'flex';
    modal.querySelector('#piraku-album-close').onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    modal.querySelectorAll('img[data-idx]').forEach(im => {
      im.onclick = () => {
        const it = arr[Number(im.dataset.idx)];
        if (it && it.url) { modal.style.display = 'none'; showSavedPolaroidModal(it.url, null); }
      };
    });
  };

  function triggerPolaroidPhotoFx(partnerKey) {
    triggerScreenTintFx('#ffffff', 280);
    let finalPhotoUrl = '';
    try {
      const pm = typeof window.getMyActivePlayerMesh === 'function' ? window.getMyActivePlayerMesh() : myPlayerMesh;
      const pKey = partnerKey || 'walkot';
      let partnerObj = typeof WALKOT !== 'undefined' ? WALKOT : null;
      let partnerBadgeText = '🏛️ Pak Walikota';
      let partnerTagHandle = '@pirakubdg';
      let partnerSubtitle = 'Foto bareng Pak Walikota di depan Gedung Sate ✨';
      let partnerWalkFlag = null;
      if (pKey === 'kdm' && typeof KDM !== 'undefined' && KDM) {
        partnerObj = KDM;
        partnerBadgeText = '🏛️ Kang Dedi (KDM)';
        partnerTagHandle = '@dedimulyadi71';
        partnerSubtitle = 'Foto bareng Gubernur Jabar di depan Gedung Sate ✨';
      } else if (pKey === 'rara') {
        const raraMesh = animC.find(x => x && x.userData && x.userData.a && x.userData.a.c && x.userData.a.c.npcRole === 'beggar');
        if (raraMesh) {
          partnerObj = raraMesh;
          partnerBadgeText = '🎸 Neng Rara';
          partnerTagHandle = 'Neng Rara';
          partnerSubtitle = 'Foto bareng Pengamen Braga di depan Gedung Sate ✨';
          partnerWalkFlag = raraMesh.userData.a.walk;
          raraMesh.userData.a.walk = false;
        }
      }

      if (renderer && scene && cam && partnerObj) {
        // Simpan state asli pemain, partner, warga sekitar, dan kamera
        const prevCamPos = cam.position.clone();
        const prevCamQuat = cam.quaternion.clone();
        const prevFov = cam.fov;
        const prevPartnerPos = partnerObj.position.clone();
        const prevPartnerRotY = partnerObj.rotation.y;
        const prevPartnerVis = partnerObj.visible;
        const hiddenOthers = [];
        if (typeof citizensGroup !== 'undefined' && citizensGroup && Array.isArray(citizensGroup.children)) {
          citizensGroup.children.forEach(ch => {
            if (ch !== pm && ch !== partnerObj && ch.visible) { ch.visible = false; hiddenOthers.push(ch); }
          });
        }
        let prevPmPos = null, prevPmRotY = 0, prevArmZ = 0, prevArmX = 0, prevBodyY = 0;
        if (pm) {
          prevPmPos = pm.position.clone();
          prevPmRotY = pm.rotation.y;
          if (pm.userData?.a?.body) {
            prevBodyY = pm.userData.a.body.position.y;
            pm.userData.a.body.position.y = 0;
          }
          if (pm.userData?.a?.armR) {
            prevArmZ = pm.userData.a.armR.rotation.z;
            prevArmX = pm.userData.a.armR.rotation.x;
            pm.userData.a.armR.rotation.z = 2.35;
            pm.userData.a.armR.rotation.x = -0.2;
          }
          pm.position.set(0.58, 0.14, 0.5);
          pm.rotation.y = Math.PI + 0.08;
        }
        partnerObj.visible = true;
        partnerObj.position.set(-0.62, 0.14, 0.5);
        partnerObj.rotation.y = Math.PI - 0.08;
        const prevWkSprVis = (typeof wkSpr !== 'undefined' && wkSpr) ? wkSpr.visible : true;
        if (typeof wkSpr !== 'undefined' && wkSpr) wkSpr.visible = false;
        // Jangan ubah cam.aspect agar hasil render tidak nge-stretch!
        cam.fov = 54;
        cam.updateProjectionMatrix();
        cam.position.set(0.0, 1.85, -6.5);
        cam.lookAt(0.0, 2.75, 13.5);
        cam.updateMatrixWorld();

        const forceRender = typeof renderer.__rawRender === 'function'
          ? () => renderer.__rawRender(scene, cam)
          : () => renderer.render(scene, cam);
        forceRender();

        // Hitung posisi proyeksi kepala karakter & Pak Walikota untuk label nama tajam di Story
        const projToStory = (wx, wy, wz, fx, fy, fw, fh, sx, sy, sw, sh, srcW, srcH) => {
          const v = new THREE.Vector3(wx, wy, wz).project(cam);
          const px = (v.x * 0.5 + 0.5) * srcW;
          const py = (-v.y * 0.5 + 0.5) * srcH;
          return {
            x: fx + ((px - sx) / sw) * fw,
            y: fy + ((py - sy) / sh) * fh
          };
        };

        // Desain kartu Story 9:16 (720x1280) siap upload IG / WA / TikTok Story!
        const pCv = document.createElement('canvas');
        pCv.width = 720;
        pCv.height = 1280;
        const pCtx = pCv.getContext('2d');

        // Latar belakang gradasi elegan Bandung + aksen cahaya
        const bgGrad = pCtx.createLinearGradient(0, 0, 720, 1280);
        bgGrad.addColorStop(0, '#091124');
        bgGrad.addColorStop(0.5, '#13203d');
        bgGrad.addColorStop(1, '#070d1a');
        pCtx.fillStyle = bgGrad;
        pCtx.fillRect(0, 0, 720, 1280);

        // Dekorasi bokeh lembut
        pCtx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        pCtx.beginPath(); pCtx.arc(110, 140, 150, 0, Math.PI * 2); pCtx.fill();
        pCtx.fillStyle = 'rgba(250, 204, 21, 0.12)';
        pCtx.beginPath(); pCtx.arc(620, 1140, 170, 0, Math.PI * 2); pCtx.fill();

        // Header Story dengan Logo Resmi PirakuBdg
        if (_pirakuStoryLogoImg.complete && _pirakuStoryLogoImg.naturalWidth > 0) {
          const lRatio = _pirakuStoryLogoImg.naturalWidth / Math.max(1, _pirakuStoryLogoImg.naturalHeight);
          const lH = 56;
          const lW = Math.min(260, lH * lRatio);
          pCtx.drawImage(_pirakuStoryLogoImg, 360 - lW / 2, 30, lW, lH);
        } else {
          pCtx.fillStyle = '#fde047';
          pCtx.font = '900 28px sans-serif';
          pCtx.textAlign = 'center';
          pCtx.fillText('PIRAKU BANDUNG', 360, 68);
        }

        pCtx.fillStyle = 'rgba(56, 189, 248, 0.16)';
        pCtx.beginPath(); pCtx.roundRect(150, 98, 420, 38, 19); pCtx.fill();
        pCtx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
        pCtx.lineWidth = 2;
        pCtx.stroke();
        pCtx.fillStyle = '#7dd3fc';
        pCtx.font = '800 17px sans-serif';
        pCtx.textAlign = 'center';
        pCtx.fillText('📍 GEDUNG SATE • KOTA BANDUNG', 360, 123);

        // Bingkai foto 3D utama (640x860) dengan sudut membulat & border emas
        const fx = 40, fy = 156, fw = 640, fh = 860;
        pCtx.save();
        pCtx.beginPath();
        pCtx.roundRect(fx, fy, fw, fh, 28);
        pCtx.clip();

        const srcW = renderer.domElement.width || 720;
        const srcH = renderer.domElement.height || 960;
        const sAsp = srcW / Math.max(1, srcH);
        const dAsp = fw / fh;
        let sx = 0, sy = 0, sw = srcW, sh = srcH;
        if (sAsp > dAsp) { sw = srcH * dAsp; sx = (srcW - sw) / 2; }
        else { sh = srcW / dAsp; sy = (srcH - sh) / 2; }
        pCtx.drawImage(renderer.domElement, sx, sy, sw, sh, fx, fy, fw, fh);

        // Vignette bawah halus di dalam foto
        const vig = pCtx.createLinearGradient(0, fy + fh - 160, 0, fy + fh);
        vig.addColorStop(0, 'rgba(9,17,36,0)');
        vig.addColorStop(1, 'rgba(9,17,36,0.72)');
        pCtx.fillStyle = vig;
        pCtx.fillRect(fx, fy + fh - 160, fw, 160);
        pCtx.restore();

        // Border emas frame foto
        pCtx.strokeStyle = '#facc15';
        pCtx.lineWidth = 4;
        pCtx.beginPath(); pCtx.roundRect(fx, fy, fw, fh, 28); pCtx.stroke();

        // Gambar label nama rapi & tajam tepat di atas kepala masing-masing
        const myIg = (localStorage.getItem('piraku_my_ig') || 'Warga').trim();
        const dispIg = myIg.startsWith('@') ? myIg : '@' + myIg;
        const drawTagPill = (x, y, text, borderCol, textCol) => {
          pCtx.save();
          pCtx.font = '800 17px sans-serif';
          const tw = Math.min(230, pCtx.measureText(text).width + 26);
          const rx = Math.max(fx + 14, Math.min(fx + fw - tw - 14, x - tw / 2));
          const ry = Math.max(fy + 16, y - 34);
          pCtx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          pCtx.beginPath(); pCtx.roundRect(rx, ry, tw, 32, 16); pCtx.fill();
          pCtx.strokeStyle = borderCol; pCtx.lineWidth = 2.5; pCtx.stroke();
          pCtx.fillStyle = textCol; pCtx.textAlign = 'center'; pCtx.textBaseline = 'middle';
          pCtx.fillText(text, rx + tw / 2, ry + 16.5);
          pCtx.restore();
        };
        const pmTagPt = projToStory(0.58, 2.25, 0.5, fx, fy, fw, fh, sx, sy, sw, sh, srcW, srcH);
        const wkTagPt = projToStory(-0.62, 2.25, 0.5, fx, fy, fw, fh, sx, sy, sw, sh, srcW, srcH);
        drawTagPill(pmTagPt.x, pmTagPt.y, dispIg, '#38bdf8', '#bae6fd');
        drawTagPill(wkTagPt.x, wkTagPt.y, partnerBadgeText, '#facc15', '#fde047');

        // Watermark kecil di pojok bawah foto
        pCtx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        pCtx.beginPath(); pCtx.roundRect(fx + 20, fy + fh - 58, 260, 36, 18); pCtx.fill();
        pCtx.fillStyle = '#fde047';
        pCtx.font = '800 15px sans-serif';
        pCtx.textAlign = 'left';
        pCtx.fillText('📸 Jepretan Teh Dinda', fx + 36, fy + fh - 35);

        // Caption Story di bawah foto
        pCtx.textAlign = 'center';
        pCtx.fillStyle = '#f8fafc';
        pCtx.font = '900 32px sans-serif';
        pCtx.fillText(`${dispIg}  ×  ${partnerTagHandle}`, 360, 1080);

        pCtx.fillStyle = '#cbd5e1';
        pCtx.font = '700 20px sans-serif';
        pCtx.fillText(partnerSubtitle, 360, 1122);

        pCtx.fillStyle = 'rgba(250, 204, 21, 0.14)';
        pCtx.beginPath(); pCtx.roundRect(170, 1160, 380, 44, 22); pCtx.fill();
        pCtx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
        pCtx.lineWidth = 1.5;
        pCtx.stroke();
        pCtx.fillStyle = '#fde047';
        pCtx.font = '800 17px sans-serif';
        pCtx.fillText('🗓️ ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 360, 1188);

        finalPhotoUrl = pCv.toDataURL('image/png');
        savePhotoToAlbum(pCv.toDataURL('image/jpeg', 0.72), `${dispIg} × ${partnerBadgeText}`);

        // Pulihkan state asli seketika
        hiddenOthers.forEach(ch => { ch.visible = true; });
        if (typeof wkSpr !== 'undefined' && wkSpr) wkSpr.visible = prevWkSprVis;
        cam.fov = prevFov;
        cam.updateProjectionMatrix();
        cam.position.copy(prevCamPos);
        cam.quaternion.copy(prevCamQuat);
        partnerObj.position.copy(prevPartnerPos);
        partnerObj.rotation.y = prevPartnerRotY;
        partnerObj.visible = prevPartnerVis;
        if (partnerWalkFlag !== null && partnerObj.userData?.a) partnerObj.userData.a.walk = partnerWalkFlag;
        if (pm && prevPmPos) {
          pm.position.copy(prevPmPos);
          pm.rotation.y = prevPmRotY;
          if (pm.userData?.a?.body) pm.userData.a.body.position.y = prevBodyY;
          if (pm.userData?.a?.armR) {
            pm.userData.a.armR.rotation.z = prevArmZ;
            pm.userData.a.armR.rotation.x = prevArmX;
          }
        }
        forceRender();
        showSavedPolaroidModal(finalPhotoUrl, pCv);
        return;
      }
    } catch (_) {}
  }

  function showSavedPolaroidModal(photoUrl, canvasEl) {
    if (!photoUrl) return;
    let modal = document.getElementById('piraku-photo-result-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'piraku-photo-result-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.82);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';
      modal.addEventListener('pointerdown', e => e.stopPropagation());
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background:#0f172a;border:2px solid #f59e0b;border-radius:18px;padding:14px;width:min(360px,94vw);box-shadow:0 24px 60px rgba(0,0,0,0.8);text-align:center;color:#f8fafc;">
        <div style="font-weight:900;font-size:14px;color:#fde047;margin-bottom:10px;">📸 Foto Story 9:16 — Teh Dinda!</div>
        <img src="${photoUrl}" alt="Foto Story Gedung Sate" style="max-height:58vh;width:auto;max-width:100%;margin:0 auto 10px;border-radius:12px;display:block;box-shadow:0 10px 26px rgba(0,0,0,0.5);">
        <div style="display:flex;gap:8px;margin-bottom:6px;">
          <button type="button" id="piraku-photo-save-btn" style="flex:1;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;padding:10px 12px;border-radius:11px;font-weight:900;font-size:12.5px;cursor:pointer;">💾 Simpan Story (9:16)</button>
          <button type="button" id="piraku-photo-close" style="border:none;background:#1e293b;color:#cbd5e1;padding:10px 14px;border-radius:11px;font-weight:800;font-size:12.5px;cursor:pointer;">Tutup</button>
        </div>
        <div style="font-size:10.5px;color:#94a3b8;">💡 Di iPhone/HP, bisa juga tekan & tahan foto → Simpan ke Foto</div>
      </div>
    `;
    modal.style.display = 'flex';
    const saveBtn = modal.querySelector('#piraku-photo-save-btn');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const triggerDownload = (url) => {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'pirakubdg-story-gedungsate.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
        };
        if (canvasEl && canvasEl.toBlob) {
          canvasEl.toBlob(async (blob) => {
            if (!blob) { triggerDownload(photoUrl); return; }
            try {
              const file = new File([blob], 'pirakubdg-story-gedungsate.png', { type: 'image/png' });
              if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'Foto Piraku Bandung' });
                return;
              }
            } catch (_) {}
            const objUrl = URL.createObjectURL(blob);
            triggerDownload(objUrl);
            setTimeout(() => URL.revokeObjectURL(objUrl), 4000);
          }, 'image/png');
        } else {
          triggerDownload(photoUrl);
        }
      };
    }
    const closeBtn = modal.querySelector('#piraku-photo-close');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  }

  function updateJogQuestHudPill() {
    let pill = document.getElementById('piraku-jog-quest-pill');
    if (!_npcJogQuest) {
      if (pill) pill.style.display = 'none';
      return;
    }
    if (!pill && document.body) {
      pill = document.createElement('div');
      pill.id = 'piraku-jog-quest-pill';
      pill.style.cssText = 'position:fixed;top:116px;left:50%;transform:translateX(-50%);z-index:9000;background:rgba(15,23,42,0.92);border:1.5px solid #38bdf8;color:#f8fafc;padding:6px 14px;border-radius:999px;font-size:11.5px;font-weight:800;box-shadow:0 8px 22px rgba(0,0,0,0.45);pointer-events:none;white-space:nowrap;';
      document.body.appendChild(pill);
    }
    const pm = typeof window.getMyActivePlayerMesh === 'function' ? window.getMyActivePlayerMesh() : myPlayerMesh;
    const dist = pm ? Math.hypot(pm.position.x - _npcJogQuest.x, pm.position.z - _npcJogQuest.z) : 0;
    const done = dist >= 22;
    pill.style.borderColor = done ? '#4ade80' : '#38bdf8';
    pill.innerHTML = done
      ? '✅ Misi Jogging 22m beres! Lapor ke <b>Mang Cepot</b> (+45 🪙)'
      : `🏃 Misi Mang Cepot: <b>${Math.min(22, Math.round(dist))}/22m</b>`;
    pill.style.display = 'block';
  }

  function openNpcDialogueCard(data) {
    if (bubbleEl) bubbleEl.style.display = 'none';
    activeCitizenTarget = null;
    activeNpcDialogueTarget = data || null;
    let card = document.getElementById('piraku-npc-dialogue');
    if (!card && document.body) {
      card = document.createElement('div');
      card.id = 'piraku-npc-dialogue';
      card.style.cssText = 'position:fixed;bottom:84px;left:50%;transform:translateX(-50%);z-index:99990;width:min(380px,calc(100vw - 24px));background:linear-gradient(135deg,rgba(15,23,42,0.97),rgba(30,41,59,0.97));border:2px solid #facc15;border-radius:18px;padding:14px 16px;color:#f8fafc;box-shadow:0 18px 45px rgba(0,0,0,0.78);display:none;';
      card.addEventListener('pointerdown', ev => ev.stopPropagation());
      card.addEventListener('pointerup', ev => ev.stopPropagation());
      document.body.appendChild(card);
    }
    if (!card) return;
    const rawLines = getNpcLines(data);
    const lines = rawLines.map(l => l || 'Wilujeng sumping di Piraku Bandung!').filter(Boolean);
    let lineIdx = 0;
    const badgeText = data.npcBadge || '🏛️ NPC KOTA';
    const roleType = data.npcRole || '';

    const buildRoleActionHtml = () => {
      const now = Date.now();
      const cdEnd = _npcRoleCooldowns[roleType] || 0;
      const cdLeft = Math.max(0, Math.ceil((cdEnd - now) / 1000));
      if (roleType === 'extort') {
        if (cdLeft > 0) return `<div style="font-size:11px;color:#94a3b8;text-align:center;margin-bottom:8px;">⏳ Preman lagi minggir dulu (${cdLeft}d)</div>`;
        return `<div style="display:flex;gap:8px;margin-bottom:8px;">
          <button id="npc-role-act1" style="flex:1;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;padding:8px 10px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;">💸 Kasih 15 🪙 (+10 XP)</button>
          <button id="npc-role-act2" style="flex:1;border:none;background:#334155;color:#f8fafc;padding:8px 10px;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;">😤 Tolak & Lari</button>
        </div>`;
      }
      if (roleType === 'beggar') {
        const muteLabel = nengRaraMuted ? '🔊 Nyalakan Musik Rara' : '🔇 Mute Musik Rara';
        const muteBtnHtml = `<button id="npc-rara-mute-btn" style="width:100%;margin-bottom:8px;border:1px solid rgba(244,114,182,0.4);background:rgba(131,24,67,0.35);color:#fbcfe8;padding:7px 10px;border-radius:10px;font-weight:800;font-size:11.5px;cursor:pointer;">${muteLabel}</button>`;
        if (cdLeft > 0) return `${muteBtnHtml}<div style="font-size:11px;color:#f472b6;text-align:center;margin-bottom:8px;">🎵 Makasih ya kak! (${cdLeft}d)</div>`;
        return `${muteBtnHtml}<div style="display:flex;gap:8px;margin-bottom:8px;">
          <button id="npc-role-act1" style="flex:1;border:none;background:linear-gradient(135deg,#ec4899,#db2777);color:#fff;padding:8px 10px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;">🪙 Kasih 10 🪙 (+25 XP & Ngebut)</button>
          <button id="npc-role-act2" style="border:none;background:#334155;color:#cbd5e1;padding:8px 10px;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;">🙏 Lewat Dulu</button>
        </div>`;
      }
      if (roleType === 'fortune') {
        if (cdLeft > 0) return `<div style="font-size:11px;color:#c084fc;text-align:center;margin-bottom:8px;">🔮 Ramalan berikutnya tersedia dalam ${cdLeft}d</div>`;
        return `<div style="display:flex;gap:8px;margin-bottom:8px;">
          <button id="npc-role-act1" style="flex:1;border:none;background:linear-gradient(135deg,#9333ea,#7e22ce);color:#fff;padding:8px 10px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;">🔮 Ramal Nasib (5 🪙)</button>
        </div>`;
      }
      if (roleType === 'quest') {
        if (cdLeft > 0) return `<div style="font-size:11px;color:#38bdf8;text-align:center;margin-bottom:8px;">⏳ Misi Jogging berikutnya dalam ${cdLeft}d</div>`;
        const pm = typeof window.getMyActivePlayerMesh === 'function' ? window.getMyActivePlayerMesh() : myPlayerMesh;
        if (_npcJogQuest && pm) {
          const dist = Math.hypot(pm.position.x - _npcJogQuest.x, pm.position.z - _npcJogQuest.z);
          if (dist >= 22) {
            return `<button id="npc-role-act1" style="width:100%;margin-bottom:8px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;padding:9px 12px;border-radius:10px;font-weight:900;font-size:12.5px;cursor:pointer;">🎁 Klaim Hadiah Misi (+45 🪙 & +40 XP)</button>`;
          }
          return `<div style="font-size:11.5px;color:#fde047;text-align:center;margin-bottom:8px;">🏃 Progres Jogging: <b>${Math.round(dist)}/22m</b> — jalan lagi lalu klik Mang Cepot!</div>`;
        }
        return `<button id="npc-role-act1" style="width:100%;margin-bottom:8px;border:none;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;padding:9px 12px;border-radius:10px;font-weight:900;font-size:12.5px;cursor:pointer;">📜 Ambil Misi Jogging 22m (+45 🪙)</button>`;
      }
      if (roleType === 'quest_photo') {
        let albumLen = 0;
        try { albumLen = JSON.parse(localStorage.getItem(getPhotoAlbumKey()) || '[]').length; } catch (_) {}
        return `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px;">
          <button onclick="window._pirakuSnapPartner('walkot')" style="border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#0f172a;padding:8px 6px;border-radius:9px;font-weight:900;font-size:11px;cursor:pointer;">📸 Pak Walkot</button>
          <button onclick="window._pirakuSnapPartner('kdm')" style="border:none;background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;padding:8px 6px;border-radius:9px;font-weight:900;font-size:11px;cursor:pointer;">📸 Kang Dedi</button>
          <button onclick="window._pirakuSnapPartner('rara')" style="border:none;background:linear-gradient(135deg,#f472b6,#db2777);color:#fff;padding:8px 6px;border-radius:9px;font-weight:900;font-size:11px;cursor:pointer;">📸 Neng Rara</button>
        </div>
        <button onclick="openTehDindaPhotoAlbum()" style="width:100%;margin-bottom:8px;border:1px solid rgba(250,204,21,0.4);background:#1e293b;color:#fde047;padding:7px 10px;border-radius:9px;font-weight:800;font-size:11.5px;cursor:pointer;">🖼️ Lihat Album Kenangan (${albumLen})</button>
        ${cdLeft > 0 ? `<div style="font-size:10.5px;color:#94a3b8;text-align:center;margin-bottom:6px;">⏳ Hadiah foto berikutnya dalam ${cdLeft}d (tetap bisa foto!)</div>` : `<div style="font-size:10.5px;color:#fbbf24;text-align:center;margin-bottom:6px;">✨ Bonus foto pertama: +35 🪙 & +30 XP!</div>`}`;
      }
      if (roleType === 'quest_clean') {
        if (cdLeft > 0) return `<div style="font-size:11px;color:#4ade80;text-align:center;margin-bottom:8px;">🧹 Area sudah bersih! Cek lagi ${cdLeft}d lagi</div>`;
        return `<button id="npc-role-act1" style="width:100%;margin-bottom:8px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;padding:9px 12px;border-radius:10px;font-weight:900;font-size:12.5px;cursor:pointer;">🧹 Bantu Bersih-bersih (+30 🪙 & +35 XP)</button>`;
      }
      return '';
    };

    const renderLine = () => {
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <span style="padding:3px 9px;border-radius:999px;font-size:10px;font-weight:900;background:linear-gradient(135deg,#ffcf4a,#f59e0b);color:#0f172a;white-space:nowrap;">${badgeText}</span>
            <span style="font-weight:900;font-size:13.5px;color:#f8fafc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${data.ig || data.name}</span>
          </div>
          <button id="npc-dlg-close" style="border:none;background:rgba(148,163,184,0.2);color:#cbd5e1;width:26px;height:26px;border-radius:999px;font-weight:900;cursor:pointer;">✕</button>
        </div>
        <div style="background:rgba(2,6,23,0.55);border:1px solid rgba(148,163,184,0.22);border-radius:12px;padding:10px 12px;font-size:12.5px;line-height:1.45;color:#e2e8f0;margin-bottom:10px;">“${lines[lineIdx]}”</div>
        ${buildRoleActionHtml()}
        <div style="display:flex;gap:8px;">
          <button id="npc-dlg-next" style="flex:1;border:none;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#fff;padding:8px 12px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;">💬 Ngobrol Lagi (${lineIdx + 1}/${lines.length})</button>
          <button id="npc-dlg-bye" style="border:none;background:#1e293b;color:#fde047;border:1px solid #475569;padding:8px 12px;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;">👋 Pamit</button>
        </div>
      `;
      card.querySelector('#npc-dlg-close').onclick = () => { card.style.display = 'none'; activeNpcDialogueTarget = null; };
      card.querySelector('#npc-dlg-bye').onclick = () => { card.style.display = 'none'; activeNpcDialogueTarget = null; };
      card.querySelector('#npc-dlg-next').onclick = () => {
        lineIdx = (lineIdx + 1) % lines.length;
        if (typeof window.playSynthTone === 'function') window.playSynthTone(620, 'sine', 0.08);
        renderLine();
      };

      window._pirakuSnapPartner = (pKey) => {
        const eco = window.PirakuEconomy;
        const pm = typeof window.getMyActivePlayerMesh === 'function' ? window.getMyActivePlayerMesh() : myPlayerMesh;
        const nowTs = Date.now();
        const canReward = nowTs > (_npcRoleCooldowns.quest_photo || 0);
        if (canReward) {
          _npcRoleCooldowns.quest_photo = nowTs + 120000;
          if (eco) eco.addCoins(35, 'Misi Foto Wisata Bandung');
          if (typeof window.grantPirakuXP === 'function') window.grantPirakuXP(30, 'Misi Foto Wisata');
        }
        triggerPolaroidPhotoFx(pKey);
        if (pm && pm.userData && pm.userData.a && pm.userData.a.armR) {
          gsap.to(pm.userData.a.armR.rotation, { z: 2.35, duration: 0.22, yoyo: true, repeat: 3 });
        }
        playNpcRoleSfx('quest_photo', false);
        showToast(canReward ? '📸 Cekrek! Foto kece (+35 🪙 & +30 XP)!' : '📸 Cekrek! Foto tersimpan ke Album Kenangan!');
        renderLine();
      };
      const raraMuteBtn = card.querySelector('#npc-rara-mute-btn');
      if (raraMuteBtn) {
        raraMuteBtn.onclick = () => {
          window.toggleNengRaraMute();
          renderLine();
        };
      }
      const act1 = card.querySelector('#npc-role-act1');
      const act2 = card.querySelector('#npc-role-act2');
      if (act1) {
        act1.onclick = () => {
          const eco = window.PirakuEconomy;
          const pm = typeof window.getMyActivePlayerMesh === 'function' ? window.getMyActivePlayerMesh() : myPlayerMesh;
          if (roleType === 'extort') {
            if (!eco || !eco.spendCoins(15, 'Uang Keamanan Preman Gasibu')) {
              showToast('Preman: Duit lu kurang! Narik Ojol dulu sana 🛵');
              return;
            }
            _npcRoleCooldowns[roleType] = Date.now() + 90000;
            if (typeof window.grantPirakuXP === 'function') window.grantPirakuXP(10, 'Damai sama Preman');
            if (data.meshGroup && data.meshGroup.userData?.a?.armR) {
              gsap.to(data.meshGroup.userData.a.armR.rotation, { z: -2.2, duration: 0.22, yoyo: true, repeat: 3 });
            }
            showOverheadBubbleOnAvatar(data.ig, '😎 Aman Bos!');
            showToast('💸 Bayar 15 🪙 ke Kang Preman — aman bos! (+10 XP)');
          } else if (roleType === 'beggar') {
            if (!eco || !eco.spendCoins(10, 'Sumbangan Pengamen Braga')) {
              showToast('Koin kamu belum cukup 10 🪙!');
              return;
            }
            _npcRoleCooldowns[roleType] = Date.now() + 90000;
            if (typeof window.grantPirakuXP === 'function') window.grantPirakuXP(25, 'Sedekah ke Pengamen');
            window.pirakuSpeedBoostUntil = Math.max(window.pirakuSpeedBoostUntil || 0, Date.now()) + 20000;
            triggerScreenTintFx('rgba(244,114,182,0.35)', 420);
            if (pm) gsap.to(pm.position, { y: 0.55, duration: 0.18, yoyo: true, repeat: 3 });
            showOverheadBubbleOnAvatar(data.ig, '🎵 Makasih banyak kak! ✨');
            showToast('🎸 Makasih! Dapat berkah +25 XP & lari ngebut 20 detik!');
          } else if (roleType === 'fortune') {
            if (!eco || !eco.spendCoins(5, 'Ramalan Ki Sunda')) {
              showToast('Mahar ramalan minimal 5 🪙!');
              return;
            }
            _npcRoleCooldowns[roleType] = Date.now() + 75000;
            triggerScreenTintFx('rgba(168,85,247,0.42)', 500);
            const roll = Math.random();
            if (roll < 0.45) {
              eco.addCoins(20, 'Berkah Ramalan Ki Sunda');
              showOverheadBubbleOnAvatar(data.ig, '🔮 Hoki besar! +20 🪙');
              showToast('🔮 Hoki besar! Ki Sunda kasih berkah +20 🪙!');
            } else if (roll < 0.8) {
              if (typeof window.grantPirakuXP === 'function') window.grantPirakuXP(20, 'Petuah Ki Sunda');
              showOverheadBubbleOnAvatar(data.ig, '🔮 Aura emas! +20 XP');
              showToast('🔮 Ramalan: Hari ini bakal dapat ikan langka! (+20 XP)');
            } else {
              window.pirakuSpeedBoostUntil = Math.max(window.pirakuSpeedBoostUntil || 0, Date.now()) + 25000;
              showOverheadBubbleOnAvatar(data.ig, '🔮 Langkah ringan! ⚡');
              showToast('🔮 Ramalan: Langkahmu ringan hari ini! (+Ngebut 25d)');
            }
          } else if (roleType === 'quest') {
            if (!_npcJogQuest) {
              _npcJogQuest = { x: pm ? pm.position.x : 0, z: pm ? pm.position.z : 0, notified: false };
              updateJogQuestHudPill();
              showToast('🏃 Misi dimulai! Jalan 22m keliling Gasibu lalu lapor Mang Cepot!');
              card.style.display = 'none';
              activeNpcDialogueTarget = null;
              return;
            }
            const dist = pm ? Math.hypot(pm.position.x - _npcJogQuest.x, pm.position.z - _npcJogQuest.z) : 0;
            if (dist >= 22) {
              _npcJogQuest = null;
              updateJogQuestHudPill();
              _npcRoleCooldowns[roleType] = Date.now() + 120000;
              if (eco) eco.addCoins(45, 'Misi Jogging Mang Cepot');
              if (typeof window.grantPirakuXP === 'function') window.grantPirakuXP(40, 'Misi Jogging Gasibu');
              triggerScreenTintFx('rgba(250,204,21,0.35)', 380);
              if (pm) gsap.to(pm.position, { y: 0.65, duration: 0.2, yoyo: true, repeat: 1 });
              showToast('🎉 Misi Jogging selesai! +45 🪙 & +40 XP!');
            }
          } else if (roleType === 'quest_photo') {
            _npcRoleCooldowns[roleType] = Date.now() + 120000;
            triggerPolaroidPhotoFx();
            if (pm && pm.userData && pm.userData.a && pm.userData.a.armR) {
              gsap.to(pm.userData.a.armR.rotation, { z: -2.4, duration: 0.22, yoyo: true, repeat: 3 });
            }
            if (eco) eco.addCoins(35, 'Misi Foto Wisata Bandung');
            if (typeof window.grantPirakuXP === 'function') window.grantPirakuXP(30, 'Misi Foto Wisata');
            showToast('📸 Cekrek! Foto kece di Gedung Sate (+35 🪙 & +30 XP)!');
          } else if (roleType === 'quest_clean') {
            _npcRoleCooldowns[roleType] = Date.now() + 120000;
            triggerScreenTintFx('rgba(74,222,128,0.3)', 350);
            if (pm && pm.userData && pm.userData.a && pm.userData.a.armR) {
              gsap.to(pm.userData.a.armR.rotation, { x: -1.4, duration: 0.18, yoyo: true, repeat: 3 });
            }
            if (eco) eco.addCoins(30, 'Bantu Kebersihan Gasibu');
            if (typeof window.grantPirakuXP === 'function') window.grantPirakuXP(35, 'Bantu Kebersihan');
            showToast('🧹 Gasibu kinclong! Hadiah +30 🪙 & +35 XP!');
          }
          playNpcRoleSfx(roleType, false);
          renderLine();
        };
      }
      if (act2) {
        act2.onclick = () => {
          _npcRoleCooldowns[roleType] = Date.now() + 45000;
          if (roleType === 'extort') {
            const pm = typeof window.getMyActivePlayerMesh === 'function' ? window.getMyActivePlayerMesh() : myPlayerMesh;
            if (pm && data) {
              const dx = pm.position.x - (data.x || 0);
              const dz = pm.position.z - (data.z || 0);
              const len = Math.max(0.1, Math.hypot(dx, dz));
              gsap.to(pm.position, { x: pm.position.x + (dx / len) * 3.2, z: pm.position.z + (dz / len) * 3.2, duration: 0.28, ease: 'power2.out' });
              gsap.to(pm.position, { y: 0.5, duration: 0.14, yoyo: true, repeat: 1 });
            }
            if (data.meshGroup && data.meshGroup.userData?.a?.armR) {
              gsap.to(data.meshGroup.userData.a.armR.rotation, { x: -1.9, duration: 0.16, yoyo: true, repeat: 1 });
            }
            triggerScreenShakeFx();
            triggerScreenTintFx('rgba(239,68,68,0.45)', 400);
            window.pirakuSpeedMult = 0.55;
            setTimeout(() => { if (window.pirakuSpeedMult === 0.55) window.pirakuSpeedMult = 1.0; }, 1800);
            const eco = window.PirakuEconomy;
            const dropped = eco && eco.spendCoins(5, 'Koin Jatuh Digertak Preman');
            if (typeof window.playSynthTone === 'function') window.playSynthTone(150, 'sawtooth', 0.24);
            showOverheadBubbleOnAvatar(data.ig, '💢 Awas lu ya!');
            showToast(dropped ? '💥 Digertak Kang Preman! Kamu terpental, pusing 2d, & koin jatuh 5 🪙!' : '💥 Digertak Kang Preman! Kamu terpental & pusing!');
          } else {
            showToast('🎸 Neng Rara: Hati-hati di jalan kak!');
          }
          card.style.display = 'none';
          activeNpcDialogueTarget = null;
        };
      }
    };
    renderLine();
    card.style.display = 'block';
  }

  function showCitizenSpeech(data, focusCam = false) {
    if (data && (data.npcBadge || data.role === 'WALKOT' || data.role === 'GUBERNUR')) {
      openNpcDialogueCard(data);
      return;
    }
    const npcCard = document.getElementById('piraku-npc-dialogue');
    if (npcCard) npcCard.style.display = 'none';
    activeCitizenTarget = data;
    document.getElementById('b-ig').innerText = data.ig;
    const cLvl = typeof window.computePirakuLevelFromTotalXp === 'function'
      ? window.computePirakuLevelFromTotalXp(data.xp || 0).level
      : (parseInt(data.level, 10) || 1);
    const roleEl = document.getElementById('b-role');
    if (roleEl) {
      if (data.npcBadge || data.role === 'WALKOT') {
        roleEl.innerText = data.npcBadge || '🏛️ WALIKOTA';
        roleEl.style.background = 'linear-gradient(135deg,#ffcf4a,#f59e0b)';
        roleEl.style.color = '#0e2f2a';
      } else {
        roleEl.innerText = 'LVL ' + cLvl;
        roleEl.style.background = cLvl >= 99 ? 'linear-gradient(135deg,#ffcf4a,#f59e0b)' : 'rgba(255,207,74,0.2)';
        roleEl.style.color = cLvl >= 99 ? '#0e2f2a' : '#ffcf4a';
      }
    }
    document.getElementById('b-kec').innerText = 'Kec. ' + (data.kecamatan || 'Bandung Wetan');
    document.getElementById('b-upvotes').innerText = data.upvotes || 0;
    bubbleEl.style.display = 'block';

    if (focusCam) {
      const curX = data.x;
      const curZ = data.z;
      gsap.to(controls.target, { x: curX, y: 1.5, z: curZ, duration: 1.2, ease: 'power2.inOut' });
      gsap.to(cam.position, { x: curX - 3.5, y: 3.2, z: curZ - 5.5, duration: 1.2, ease: 'power2.inOut' });
    }
  }

  function hideCitizenSpeech() {
    activeCitizenTarget = null;
    if (bubbleEl) bubbleEl.style.display = 'none';
    const npcCard = document.getElementById('piraku-npc-dialogue');
    if (npcCard) npcCard.style.display = 'none';
  }
  function updateBubblePos() {
    if (!activeCitizenTarget || !bubbleEl) return;
    const bx = activeCitizenTarget.meshGroup ? activeCitizenTarget.meshGroup.position.x : (activeCitizenTarget.x || 0);
    const bz = activeCitizenTarget.meshGroup ? activeCitizenTarget.meshGroup.position.z : (activeCitizenTarget.z || 0);
    tempV.set(bx, 2.3, bz).project(cam);
    if (tempV.z > 1 || Math.abs(tempV.x) > 1.08 || Math.abs(tempV.y) > 1.08) {
      bubbleEl.style.display = 'none';
      return;
    }
    bubbleEl.style.display = 'block';
    const px = Math.max(90, Math.min(W - 90, (tempV.x * 0.5 + 0.5) * W));
    const py = Math.max(80, Math.min(H - 40, (-tempV.y * 0.5 + 0.5) * H));
    bubbleEl.style.left = px + 'px';
    bubbleEl.style.top = py + 'px';
  }

  // Emotes
  window.triggerEmote = function(type) {
    if (!activeCitizenTarget) return;
    const animObj = animC.find(a => ((a.userData?.a?.c?.ig || '')).toLowerCase() === ((activeCitizenTarget.ig || '')).toLowerCase());

    if (type === 'kopi') {
      window.playSynthTone(580, 'sine', 0.25);
      showToast(activeCitizenTarget.ig + ' lagi nyeruput kopi santai ☕');
      if (animObj) gsap.to(animObj.userData.a.armR.rotation, { x: -2.2, duration: 0.4, yoyo: true, repeat: 1 });
    } else if (type === 'lambai') {
      window.playSynthTone(750, 'triangle', 0.2);
      showToast(activeCitizenTarget.ig + ' melambaikan tangan ke wargi! 👋');
      if (animObj) gsap.to(animObj.userData.a.armR.rotation, { z: -2.5, duration: 0.25, yoyo: true, repeat: 5 });
    } else if (type === 'bel') {
      window.playSynthTone(1200, 'sine', 0.12);
      setTimeout(() => window.playSynthTone(1500, 'sine', 0.2), 140);
      showToast('🚲 Ting-ting! Sepeda wargi lewat!');
    }
  };

  // Upvote
  window.upvoteCurrentCitizen = async function() {
    if (!activeCitizenTarget) return;
    const cleanIg = (activeCitizenTarget.ig || '').trim().toLowerCase();
    const voteKey = 'voted_user_' + cleanIg;

    if (localStorage.getItem(voteKey)) {
      showToast('Kamu sudah pernah mendukung wargi ini! ❤️');
      return;
    }

    const currentCount = parseInt(activeCitizenTarget.upvotes, 10) || 0;
    const nextCount = currentCount + 1;
    activeCitizenTarget.upvotes = nextCount;
    document.getElementById('b-upvotes').innerText = nextCount;
    localStorage.setItem(voteKey, 'true');
    showToast('Wargi didukung! +1 ❤️');

    if (supabaseClient) {
      try {
        if (activeCitizenTarget.id && Number(activeCitizenTarget.id) > 0) {
          const rr = await supabaseClient.rpc('increment_upvote', { p_id: activeCitizenTarget.id });
          if (!rr.error) return;
        }
        let resp;
        if (activeCitizenTarget.id && Number(activeCitizenTarget.id) > 0) {
          resp = await supabaseClient
            .from('warga_piraku')
            .update({ upvotes: nextCount })
            .eq('id', activeCitizenTarget.id)
            .select();
        } else {
          resp = await supabaseClient
            .from('warga_piraku')
            .update({ upvotes: nextCount })
            .ilike('ig', likeEsc(activeCitizenTarget.ig))
            .select();
        }
        if (resp && resp.error) console.error('Supabase update gagal:', resp.error);
      } catch (err) {}
    }
  };

  // Overhead Chat Bubbles
  const activeWorldBubbles = [];
  function showOverheadBubbleOnAvatar(senderIg, text) {
    const avatar = animC.find(a => ((a.userData?.a?.c?.ig || '')).toLowerCase() === ((senderIg || '')).toLowerCase());
    if (!avatar) return;

    const el = document.createElement('div');
    el.className = 'world-overhead-bubble show';
    el.innerText = text;
    document.getElementById('overhead-chat-container').appendChild(el);

    const bubbleItem = { el, avatar, expires: performance.now() + 5000 };
    activeWorldBubbles.push(bubbleItem);

    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => {
        el.remove();
        const idx = activeWorldBubbles.indexOf(bubbleItem);
        if (idx > -1) activeWorldBubbles.splice(idx, 1);
      }, 300);
    }, 4700);
  }

  function updateOverheadBubblesPos() {
    activeWorldBubbles.forEach(b => {
      tempV.set(b.avatar.position.x, 2.7, b.avatar.position.z).project(cam);
      if (tempV.z > 1) {
        b.el.style.display = 'none';
      } else {
        b.el.style.display = 'block';
        b.el.style.left = (tempV.x * 0.5 + 0.5) * W + 'px';
        b.el.style.top = (-tempV.y * 0.5 + 0.5) * H + 'px';
      }
    });
  }

  // Live Chat
  let unreadChatCount = 0, isChatModalOpen = false;
  window.openChatModal = function() {
    isChatModalOpen = true; unreadChatCount = 0;
    const badge = document.getElementById('chat-unread-count');
    if (badge) badge.style.display = 'none';
    const m = document.getElementById('chat-modal'); 
    if (m) {
      m.style.display = 'flex';
      setTimeout(() => {
        m.querySelector('.modal-card').style.transform = 'translateY(0)';
        const stream = document.getElementById('chat-messages');
        if (stream) stream.scrollTop = stream.scrollHeight;
      }, 10);
    }
    loadRecentChats();
  };
  window.closeChatModal = function() {
    isChatModalOpen = false;
    const m = document.getElementById('chat-modal'); 
    if (m) {
      m.querySelector('.modal-card').style.transform = 'translateY(100%)';
      setTimeout(() => m.style.display = 'none', 280);
    }
  };

  let activeChatReply = null;

  window.clearChatReply = function() {
    activeChatReply = null;
    const prev = document.getElementById('chat-reply-preview');
    if (prev) prev.style.display = 'none';
  };

  window.setChatReply = function(sender, rawBody) {
    const cleanSender = String(sender || '').replace(/[|\]]/g, '').trim();
    const cleanSnippet = String(rawBody || '').replace(/[|\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 48);
    if (!cleanSender) return;
    activeChatReply = { sender: cleanSender, snippet: cleanSnippet };
    const prev = document.getElementById('chat-reply-preview');
    const tgtEl = document.getElementById('chat-reply-target');
    const snpEl = document.getElementById('chat-reply-snippet');
    if (tgtEl) tgtEl.textContent = cleanSender;
    if (snpEl) snpEl.textContent = cleanSnippet || '...';
    if (prev) prev.style.display = 'flex';
    const inp = document.getElementById('inp-chat-msg');
    if (inp) inp.focus();
  };

  window.insertChatMention = function(ig) {
    const inp = document.getElementById('inp-chat-msg');
    const listEl = document.getElementById('chat-mention-list');
    if (listEl) listEl.style.display = 'none';
    if (!inp || !ig) return;
    const tag = (String(ig).startsWith('@') ? ig : '@' + ig) + ' ';
    const val = inp.value || '';
    if (/(?:^|\s)@([a-zA-Z0-9_.-]*)$/.test(val)) {
      inp.value = val.replace(/(^|\s)@([a-zA-Z0-9_.-]*)$/, '$1' + tag);
    } else {
      inp.value = val + (val && !val.endsWith(' ') ? ' ' : '') + tag;
    }
    inp.focus();
  };

  function parsePirakuChatPayload(raw) {
    const s = String(raw || '');
    const m = s.match(/^\[REPLY\|([^|\]]+)\|([^\]]*)\]\s*([\s\S]*)$/);
    if (m) return { replyTo: m[1], replySnippet: m[2], body: m[3] };
    return { replyTo: null, replySnippet: '', body: s };
  }

  function formatChatBodyWithMentions(body, myIgClean, isMe) {
    let mentionedMe = false;
    const escaped = esc(body);
    const html = escaped.replace(/@([a-zA-Z0-9_.-]+)/g, (full, uname) => {
      const isTargetMe = Boolean(myIgClean && uname.toLowerCase() === myIgClean);
      if (isTargetMe) mentionedMe = true;
      const bg = isTargetMe
        ? 'rgba(250,204,21,0.28);color:#fde047;border:1px solid rgba(250,204,21,0.55)'
        : (isMe ? 'rgba(15,23,42,0.22);color:#041322' : 'rgba(56,189,248,0.2);color:#7dd3fc');
      return `<span onclick="insertChatMention('${esc(uname)}')" style="display:inline-block;padding:0 5px;border-radius:6px;background:${bg};font-weight:800;cursor:pointer;">${full}</span>`;
    });
    return { html, mentionedMe };
  }

  const chatInpEl = document.getElementById('inp-chat-msg');
  if (chatInpEl) {
    chatInpEl.addEventListener('input', () => {
      const listEl = document.getElementById('chat-mention-list');
      if (!listEl) return;
      const m = (chatInpEl.value || '').match(/(?:^|\s)@([a-zA-Z0-9_.-]*)$/);
      if (!m) {
        listEl.style.display = 'none';
        return;
      }
      const q = m[1].toLowerCase();
      const myClean = (localStorage.getItem('piraku_my_ig') || '').trim().toLowerCase().replace(/^@/, '');
      const candidates = (Array.isArray(registeredCitizensList) ? registeredCitizensList : [])
        .filter(c => c && c.ig)
        .map(c => ({ ig: String(c.ig).trim(), kec: c.kecamatan || '' }))
        .filter(c => {
          const cl = c.ig.toLowerCase().replace(/^@/, '');
          return cl && cl !== myClean && (!q || cl.includes(q));
        })
        .slice(0, 6);
      if (!candidates.length) {
        listEl.style.display = 'none';
        return;
      }
      listEl.innerHTML = '';
      candidates.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;border:none;background:rgba(30,41,59,0.75);color:#f8fafc;padding:6px 10px;border-radius:8px;font-size:11.5px;font-weight:700;cursor:pointer;text-align:left;';
        btn.innerHTML = `<span style="color:#7dd3fc;">${esc(c.ig.startsWith('@') ? c.ig : '@' + c.ig)}</span><span style="font-size:10px;color:#94a3b8;">${esc(c.kec)}</span>`;
        btn.onclick = () => window.insertChatMention(c.ig);
        listEl.appendChild(btn);
      });
      listEl.style.display = 'flex';
    });
  }

  function appendChatToUI(sender, text, createdAt, isHistory) {
    const rawText = String(text || '');
    if (rawText.startsWith('[BILLBOARD] ')) {
      const adText = rawText.replace('[BILLBOARD] ', '').trim();
      if (typeof window.setGasibuBillboardBroadcast === 'function') {
        window.setGasibuBillboardBroadcast(sender, adText, true);
      }
      return;
    }
    if (rawText.startsWith('[MEGAFON] ')) {
      if (!isHistory && typeof window.triggerPirakuMegaphone === 'function') {
        const megaText = rawText.replace('[MEGAFON] ', '').trim();
        window.triggerPirakuMegaphone(sender + ': ' + megaText);
      }
      return;
    }

    const parsed = parsePirakuChatPayload(rawText);
    const stream = document.getElementById('chat-messages');
    if (!stream) return;
    const myIg = (localStorage.getItem('piraku_my_ig') || '').trim().toLowerCase();
    const myIgClean = myIg.replace(/^@/, '');
    const isMe = Boolean(myIg && String(sender || '').trim().toLowerCase() === myIg);
    const cit = Array.isArray(registeredCitizensList)
      ? registeredCitizensList.find(c => String(c.ig || '').trim().toLowerCase() === String(sender || '').trim().toLowerCase())
      : null;
    const kecBadge = cit && cit.kecamatan ? ` <span style="font-size:9px;padding:1px 6px;border-radius:99px;background:${isMe ? 'rgba(15,23,42,0.22)' : 'rgba(56,189,248,0.18)'};color:${isMe ? '#0f172a' : '#38bdf8'};font-weight:800;">${esc(cit.kecamatan)}</span>` : '';
    const timeStr = createdAt
      ? new Date(createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const { html: bodyHtml, mentionedMe } = formatChatBodyWithMentions(parsed.body, myIgClean, isMe);
    const isRepliedToMe = Boolean(!isMe && myIgClean && parsed.replyTo && parsed.replyTo.toLowerCase().replace(/^@/, '') === myIgClean);
    const highlightMe = !isMe && (mentionedMe || isRepliedToMe);

    const wrap = document.createElement('div');
    wrap.style.cssText = `display:flex;flex-direction:column;align-items:${isMe ? 'flex-end' : 'flex-start'};max-width:100%;`;
    const bubble = document.createElement('div');
    bubble.style.cssText = isMe
      ? 'max-width:84%;background:linear-gradient(135deg,#38bdf8,#0ea5e9);color:#041322;padding:8px 12px;border-radius:14px 14px 4px 14px;font-size:12px;box-shadow:0 3px 10px rgba(14,165,233,0.25);word-break:break-word;'
      : `max-width:84%;background:${highlightMe ? 'rgba(250,204,21,0.12)' : '#1e293b'};border:1px solid ${highlightMe ? 'rgba(250,204,21,0.6)' : 'rgba(148,163,184,0.24)'};color:#f8fafc;padding:8px 12px;border-radius:14px 14px 14px 4px;font-size:12px;box-shadow:0 3px 10px rgba(0,0,0,0.2);word-break:break-word;`;

    const quoteHtml = parsed.replyTo
      ? `<div style="background:${isMe ? 'rgba(15,23,42,0.16)' : 'rgba(15,23,42,0.55)'};border-left:2.5px solid ${isMe ? '#0f172a' : '#38bdf8'};border-radius:6px;padding:4px 7px;margin-bottom:5px;font-size:10.5px;opacity:0.92;"><div style="font-weight:800;">↩️ ${esc(parsed.replyTo)}</div><div style="opacity:0.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(parsed.replySnippet)}</div></div>`
      : '';

    const replyBtn = `<button type="button" class="piraku-chat-reply-btn" title="Balas pesan ini" style="border:none;background:transparent;color:${isMe ? '#041322' : '#94a3b8'};font-size:11px;cursor:pointer;padding:0 2px;opacity:0.85;">↩️</button>`;
    const senderBtn = `<span class="piraku-chat-sender-btn" title="Ketuk untuk tag" style="font-weight:800;font-size:11px;cursor:pointer;">${esc(sender)}${kecBadge}${highlightMe ? ' 🔔' : ''}</span>`;

    bubble.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px;">${senderBtn}<span style="display:inline-flex;align-items:center;gap:5px;"><span style="font-size:9.5px;opacity:0.7;">${timeStr}</span>${replyBtn}</span></div>${quoteHtml}<div>${bodyHtml}</div>`;
    const rBtn = bubble.querySelector('.piraku-chat-reply-btn');
    if (rBtn) rBtn.onclick = () => window.setChatReply(sender, parsed.body);
    const sBtn = bubble.querySelector('.piraku-chat-sender-btn');
    if (sBtn) sBtn.onclick = () => window.insertChatMention(sender);

    wrap.appendChild(bubble);
    stream.appendChild(wrap);
    stream.scrollTop = stream.scrollHeight;

    if (!isHistory) {
      const overheadMsg = parsed.replyTo ? `↩️ ${parsed.replyTo}: ${parsed.body}` : parsed.body;
      showOverheadBubbleOnAvatar(sender, overheadMsg);
    }
  }

  async function loadRecentChats() {
    if (!supabaseClient) return;
    try {
      const { data } = await supabaseClient
        .from('chat_warga')
        .select('*')
        .order('id', { ascending: false })
        .limit(25);

      if (data && data.length > 0) {
        const stream = document.getElementById('chat-messages');
        stream.innerHTML = '<div style="background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.35);padding:8px 11px;border-radius:12px;font-size:11.5px;color:#fde047;"><b>@pirakubdg:</b> Wilujeng sumping di Balai Obrolan Warga! Pesan tampil realtime di sini & di atas avatar 3D. Ketuk ↩️ untuk balas atau ketik <b>@nama</b> untuk tag warga.</div>';
        data.reverse().forEach(row => appendChatToUI(row.sender_ig, row.message, row.created_at, true));
      }
    } catch (e) {}
  }

  window.sendQuickChat = function(txt) {
    if (!(localStorage.getItem('piraku_my_ig') || '').trim()) {
      showToast('Silakan Masuk / Daftar E-KTP dulu untuk bisa nge-chat! 🪪');
      if (typeof closeChatModal === 'function') closeChatModal();
      if (typeof openJoinModal === 'function') openJoinModal();
      return;
    }
    const inp = document.getElementById('inp-chat-msg');
    if (!inp) return;
    inp.value = txt;
    window.sendChatMessage();
  };

  window.sendChatMessage = async function() {
    const myIg = (localStorage.getItem('piraku_my_ig') || '').trim();
    if (!myIg) {
      showToast('Silakan Masuk / Daftar E-KTP dulu untuk bisa nge-chat! 🪪');
      if (typeof closeChatModal === 'function') closeChatModal();
      if (typeof openJoinModal === 'function') openJoinModal();
      return;
    }
    const inp = document.getElementById('inp-chat-msg');
    const rawMsg = inp.value.trim();
    if (!rawMsg) return;
    const listEl = document.getElementById('chat-mention-list');
    if (listEl) listEl.style.display = 'none';

    const msg = activeChatReply
      ? `[REPLY|${activeChatReply.sender}|${activeChatReply.snippet}] ${rawMsg}`
      : rawMsg;
    window.clearChatReply();

    appendChatToUI(myIg, msg);
    inp.value = '';

    if (typeof window.broadcastWargaChat === 'function') {
      window.broadcastWargaChat(myIg, msg, new Date().toISOString());
    }

    if (supabaseClient) {
      try {
        await supabaseClient.from('chat_warga').insert([{ sender_ig: myIg, message: msg }]);
      } catch (err) {}
    }
  };

  window.onPirakuWargaChatBroadcast = function(newRow) {
    if (!newRow || !newRow.sender_ig) return;
    const myIg = localStorage.getItem('piraku_my_ig') || '';
    const myIgClean = myIg.trim().toLowerCase().replace(/^@/, '');
    if (newRow.sender_ig !== myIg) {
      const rawNew = String(newRow.message || '');
      const isSystemCmd = rawNew.startsWith('[BILLBOARD] ') || rawNew.startsWith('[MEGAFON] ');
      appendChatToUI(newRow.sender_ig, rawNew, newRow.created_at);
      if (!isChatModalOpen && !isSystemCmd) {
        unreadChatCount++;
        const badge = document.getElementById('chat-unread-count');
        if (badge) {
          badge.innerText = unreadChatCount;
          badge.style.display = 'flex';
        }
      }
      if (!isSystemCmd) {
        const p = parsePirakuChatPayload(rawNew);
        const isTagged = myIgClean && (
          (p.replyTo && p.replyTo.toLowerCase().replace(/^@/, '') === myIgClean) ||
          new RegExp('(?:^|\\s)@' + myIgClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(p.body)
        );
        showToast((isTagged ? '🔔 ' : '💬 ') + newRow.sender_ig + ': ' + p.body.substring(0, 24));
      }
    }
  };

  // Polling
  window.openPollingModal = function() {
    const m = document.getElementById('polling-modal'); 
    if (m) {
      m.style.display = 'flex';
      setTimeout(() => m.querySelector('.modal-card').style.transform = 'translateY(0)', 10);
    }
    loadPollingResults();
  };
  window.closePollingModal = function() {
    const m = document.getElementById('polling-modal'); 
    if (m) {
      m.querySelector('.modal-card').style.transform = 'translateY(100%)';
      setTimeout(() => m.style.display = 'none', 280);
    }
  };

  async function loadPollingResults() {
    if (!supabaseClient) return;
    try {
      const { data } = await supabaseClient.from('polling_kebijakan').select('*');
      if (data && data.length > 0) {
        const totalVotes = data.reduce((a, b) => a + (b.votes || 0), 0) || 1;
        data.forEach(item => {
          const btn = document.getElementById('btn-poll-' + item.id);
          const countEl = document.getElementById('poll-count-' + item.id);
          const fillEl = document.getElementById('poll-fill-' + item.id);
          if (countEl) countEl.innerText = (item.votes || 0) + ' Suara';
          if (fillEl) fillEl.style.width = Math.round(((item.votes || 0) / totalVotes) * 100) + '%';
          const pIg = (localStorage.getItem('piraku_my_ig') || 'guest').toLowerCase().replace(/^@/, '');
          if (localStorage.getItem('voted_policy_' + pIg) === item.id && btn) {
            btn.classList.add('voted');
          }
        });
      }
    } catch(e){}
  }

  window.votePolicy = async function(policyId) {
    const pIg = (localStorage.getItem('piraku_my_ig') || '').toLowerCase().replace(/^@/, '');
    if (!pIg) {
      showToast('Login atau daftar akun warga dulu untuk ikut polling! 🗳️');
      return;
    }
    if (localStorage.getItem('voted_policy_' + pIg)) {
      showToast('Kamu sudah menyalurkan suara di polling ini! 🗳️');
      return;
    }
    localStorage.setItem('voted_policy_' + pIg, policyId);
    showToast('Suara kamu sah tercatat! +1 🗳️');
    window.playSynthTone(880, 'sine', 0.2);

    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.from('polling_kebijakan').select('votes').eq('id', policyId).single();
        const newV = ((data && data.votes) || 0) + 1;
        await supabaseClient.from('polling_kebijakan').update({ votes: newV }).eq('id', policyId);
        loadPollingResults();
      } catch(e){}
    }
  };

  // Selfie
  window.takeCitizenSelfiePoster = function() {
    closeKTP();
    const myIg = localStorage.getItem('piraku_my_ig');
    const myCitizen = registeredCitizensList.find(c => (c?.ig || '').toLowerCase() === (myIg || '').toLowerCase());
    
    const targetX = myCitizen ? myCitizen.x : -10;
    const targetZ = myCitizen ? myCitizen.z : -2.5;

    showToast('Membidik selfie 9:16 berlatar Gedung Sate... 📸');
    
    gsap.to(cam.position, { x: targetX, y: 1.4, z: targetZ - 2.8, duration: 1.2, ease: 'power2.inOut' });
    gsap.to(controls.target, { x: targetX, y: 1.2, z: targetZ + 2.0, duration: 1.2, ease: 'power2.inOut', onComplete: () => {
      setTimeout(() => {
    renderer.render(scene, cam);
        const c = renderer.domElement;
        const o = document.createElement('canvas');
        o.width = 1080; o.height = 1920;
        const ctx = o.getContext('2d');

        ctx.drawImage(c, 0, 0, o.width, o.height);

        ctx.fillStyle = 'rgba(14,47,42,0.85)';
        ctx.fillRect(60, 120, o.width - 120, 240);

        ctx.font = '800 64px "Bricolage Grotesque", sans-serif';
        ctx.fillStyle = '#ffcf4a';
        ctx.fillText('WARGA RESMI BANDUNG', 100, 210);

        ctx.font = '700 44px "Bricolage Grotesque", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(myIg || '@wargabandung', 100, 280);

        ctx.font = '700 36px "Bricolage Grotesque", sans-serif';
        ctx.fillStyle = '#a6dc6b';
        ctx.fillText('simulasi tata kota @pirakubdg', 100, 1800);

        const a = document.createElement('a');
        a.download = 'Selfie_Bandung_' + (myIg ? myIg.replace('@', '') : 'Warga') + '.png';
        a.href = o.toDataURL('image/png');
        a.click();
        showToast('Poster Story 9:16 tersimpan di galeri!');
      }, 500);
    }});
  };

  // Auth Tabs
  let currentAuthTab = 'login';
  window.switchAuthTab = function(tab) {
    currentAuthTab = tab;
    const tabLogin = document.getElementById('tab-btn-login');
    const tabSignup = document.getElementById('tab-btn-signup');
    const formLogin = document.getElementById('auth-form-login');
    const formSignup = document.getElementById('auth-form-signup');

    if (tab === 'login') {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabSignup) tabSignup.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formSignup) formSignup.style.display = 'none';
      const t = document.getElementById('auth-modal-title');
      if (t) t.innerText = 'Masuk Akun Warga 🔑';
    } else {
      if (tabSignup) tabSignup.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      if (formLogin) formLogin.style.display = 'none';
      if (formSignup) formSignup.style.display = 'block';
      const t = document.getElementById('auth-modal-title');
      if (t) t.innerText = 'Daftar Akun Warga Baru 📜';
    }
  };

  let selectedRole = 'Barista', selectedEmoji = '☕', selectedColor = 0x1e3a8a, selectedAcc = 'none';
  window.openJoinModal = function() { 
    const m = document.getElementById('join-modal'); 
    if (m) {
      m.style.display = 'flex'; 
      switchAuthTab('login');
      setTimeout(() => m.querySelector('.modal-card').style.transform = 'translateY(0)', 10); 
    }
  };
  window.closeJoinModal = function() { 
    const m = document.getElementById('join-modal'); 
    if (m) {
      m.querySelector('.modal-card').style.transform = 'translateY(100%)'; 
      setTimeout(() => m.style.display = 'none', 280); 
    }
  };
  let selectedGender = 'male', selectedSkinIdx = 3, selectedPantsIdx = 0, selectedHair = 'short';
  window.pickGender = (el, g) => {
    document.querySelectorAll('.gender-chip').forEach(c => c.classList.remove('selected'));
    if (el) el.classList.add('selected');
    selectedGender = g === 'female' ? 'female' : 'male';
    const gBadge = document.getElementById('signup-gender-preview');
    if (gBadge) gBadge.textContent = selectedGender === 'female' ? '👩 Perempuan' : '👨 Laki-laki';
  };
  window.pickSignupSkin = (el, idx) => { document.querySelectorAll('.signup-skin-swatch').forEach(c => c.classList.remove('selected')); el.classList.add('selected'); selectedSkinIdx = idx; };
  window.pickSignupPants = (el, idx) => { document.querySelectorAll('.signup-pants-swatch').forEach(c => c.classList.remove('selected')); el.classList.add('selected'); selectedPantsIdx = idx; };
  window.pickSignupHair = (el, h) => { document.querySelectorAll('.hair-chip').forEach(c => c.classList.remove('selected')); el.classList.add('selected'); selectedHair = h; };
  window.pickRole = (el, r, e) => { document.querySelectorAll('.role-chip').forEach(c => c.classList.remove('selected')); el.classList.add('selected'); selectedRole = r; selectedEmoji = e; };
  window.pickAcc = (el, a) => { document.querySelectorAll('.acc-chip').forEach(c => c.classList.remove('selected')); el.classList.add('selected'); selectedAcc = a; };
  window.pickColor = (el, hex) => { document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected')); el.classList.add('selected'); selectedColor = hex; };

  // Login
  window.processUserLogin = async function() {
    const rawIg = document.getElementById('login-ig').value.trim();
    const pin = document.getElementById('login-pin').value.trim();

    if (!rawIg) { alert('Masukkan username Instagram kamu!'); return; }
    if (!pin || pin.length < 4) { alert('Masukkan 4 angka PIN keamanan akunmu!'); return; }

    const cleanHandle = rawIg.replace(/^@+/, '').trim().toLowerCase();
    const formattedIg = '@' + cleanHandle;
    if (!/^[a-z0-9._]{1,30}$/.test(cleanHandle)) { alert('Username Instagram hanya boleh huruf, angka, titik, dan garis bawah (maks 30 karakter).'); return; }
    if (cleanHandle !== 'yelclaw' && /admin|moderator|official|pirakubdg/.test(cleanHandle)) {
      alert('⚠️ Username yang mengandung unsur "admin" / resmi tidak dapat digunakan!');
      return;
    }

    const btn = document.getElementById('btn-submit-login');
    btn.disabled = true; btn.innerText = 'Memverifikasi akun...';

    if (supabaseClient) {
      try {
        const { data: user, error } = await supabaseClient
          .from('warga_piraku')
          .select('*')
          .or(`ig.ilike.${likeEsc(formattedIg)},ig.ilike.${likeEsc(cleanHandle)}`)
          .maybeSingle();

        if (error) {
          alert('Gagal terhubung ke database: ' + error.message);
          btn.disabled = false; btn.innerText = 'Masuk & Mainkan Karakter 🎮';
          return;
        }

        if (!user) {
          alert('Akun "' + formattedIg + '" belum terdaftar. Silakan pilih tab "Daftar Baru"!');
          btn.disabled = false; btn.innerText = 'Masuk & Mainkan Karakter 🎮';
          switchAuthTab('signup');
          document.getElementById('signup-ig').value = formattedIg;
          return;
        }

        if (user.pin_warga && String(user.pin_warga) !== String(pin)) {
          alert('⚠️ PIN salah! Pastikan 4 angka PIN sesuai dengan yang kamu buat saat mendaftar.');
          btn.disabled = false; btn.innerText = 'Masuk & Mainkan Karakter 🎮';
          return;
        }

        const dbXp = typeof user.xp === 'number' ? user.xp : 0;
        const lvlObj = typeof window.computePirakuLevelFromTotalXp === 'function'
          ? window.computePirakuLevelFromTotalXp(dbXp)
          : { level: user.level || 1 };
        localStorage.setItem('piraku_my_ig', user.ig);
        localStorage.setItem('piraku_my_level', String(lvlObj.level));
        localStorage.setItem('piraku_my_xp', String(dbXp));
        localStorage.setItem('piraku_my_kec', user.kecamatan || 'Bandung Wetan');
        if (user.color !== undefined) localStorage.setItem('piraku_my_color', String(user.color));
        if (user.acc) localStorage.setItem('piraku_my_acc', String(user.acc));
        if (user.has_house) {
          const suf = '_' + String(user.ig || '').trim().toLowerCase().replace(/^@/, '');
          localStorage.setItem('piraku_has_house' + suf, '1');
          localStorage.setItem('piraku_house_keys' + suf, '3');
          window.pirakuDistrictHasHouse = true;
        }
        if (typeof window.reloadPirakuEconomyForCurrentUser === "function") window.reloadPirakuEconomyForCurrentUser();
      if (typeof window.refreshPirakuFishingForCurrentUser === "function") window.refreshPirakuFishingForCurrentUser();

        let foundMesh = animC.find(a => String(a.userData?.a?.c?.ig || '').toLowerCase() === String(user.ig || '').toLowerCase());
        if (!foundMesh) {
          foundMesh = createCitizenMesh(user);
        }
        const myHouse = houseOwnersRegistry[user.ig] || spawnCitizenHouse(user, registeredCitizensList.length);
        if (myHouse && foundMesh) {
          foundMesh.position.set(myHouse.porchX, 0, myHouse.porchZ);
          foundMesh.rotation.y = 0;
        }
        setupActivePlayer(foundMesh, user);
        if (typeof window.syncPirakuMissionsFromCloud === "function") window.syncPirakuMissionsFromCloud();
        if (typeof window.autoSpawnRegisteredDistrict === "function") window.autoSpawnRegisteredDistrict(true);

        window.updateAutoDetectButton();
        btn.disabled = false; btn.innerText = 'Masuk & Mainkan Karakter 🎮';
        closeJoinModal();
        showToast('Selamat datang kembali, ' + user.ig + '! 🎮');
        return;
      } catch (err) {}
    }
    btn.disabled = false; btn.innerText = 'Masuk & Mainkan Karakter 🎮';
  };

  // Signup
  window.processUserSignup = async function() {
    const rawIg = document.getElementById('signup-ig').value.trim();
    const pin = document.getElementById('signup-pin').value.trim();
    const name = document.getElementById('signup-name').value.trim() || 'Warga Baru';
    const kecamatan = document.getElementById('signup-kecamatan').value;
    const wish = '';

    if (!rawIg) { alert('Masukkan username Instagram kamu!'); return; }
    if (!pin || pin.length < 4) { alert('Buat 4 angka PIN keamanan akunmu!'); return; }

    const cleanHandle = rawIg.replace(/^@+/, '').trim().toLowerCase();
    const formattedIg = '@' + cleanHandle;
    if (!/^[a-z0-9._]{1,30}$/.test(cleanHandle)) { alert('Username Instagram hanya boleh huruf, angka, titik, dan garis bawah (maks 30 karakter).'); return; }
    const lowerName = name.toLowerCase();
    if (cleanHandle !== 'yelclaw' && (/admin|moderator|official|pirakubdg/.test(cleanHandle) || /admin|moderator|official|pirakubdg/.test(lowerName))) {
      alert('⚠️ Username atau nama yang mengandung unsur "admin" / resmi tidak dapat digunakan!');
      return;
    }

    const btn = document.getElementById('btn-submit-signup');
    btn.disabled = true; btn.innerText = 'Mendaftarkan warga...';

    let myDeviceToken = localStorage.getItem('piraku_device_token');
    if (!myDeviceToken) {
      myDeviceToken = 'dev_' + Math.random().toString(36).substring(2) + Date.now();
      localStorage.setItem('piraku_device_token', myDeviceToken);
    }

    if (supabaseClient) {
      try {
        const { data: exist } = await supabaseClient
          .from('warga_piraku')
          .select('id, ig')
          .or(`ig.ilike.${likeEsc(formattedIg)},ig.ilike.${likeEsc(cleanHandle)}`)
          .maybeSingle();

        if (exist) {
          alert('Username ' + formattedIg + ' sudah terdaftar! Silakan login di tab "Masuk Akun".');
          btn.disabled = false; btn.innerText = 'Daftar Jadi Warga Resmi 📜';
          switchAuthTab('login');
          document.getElementById('login-ig').value = formattedIg;
          return;
        }

        const draftCit = { ig: formattedIg, kecamatan, has_house: false };
        const assignedHouse = spawnCitizenHouse(draftCit, registeredCitizensList.length);
        const spawnX = assignedHouse ? assignedHouse.porchX : getSafeGasibuPos().x;
        const spawnZ = assignedHouse ? assignedHouse.porchZ : getSafeGasibuPos().z;
        const encodedSignupAcc = (selectedAcc || 'none') + '|' + selectedSkinIdx + '|' + selectedPantsIdx + '|' + selectedHair + '|' + selectedGender;
        const newCit = { 
          name, 
          ig: formattedIg, 
          pin_warga: pin, 
          role: selectedRole, 
          acc: encodedSignupAcc, 
          color: selectedColor, 
          kecamatan, 
          wish, 
          upvotes: 0, 
          level: 1, 
          xp: 0, 
          device_token: myDeviceToken,
          x: parseFloat(spawnX.toFixed(2)), 
          z: parseFloat(spawnZ.toFixed(2))
        };

        const { data, error } = await supabaseClient.from('warga_piraku').insert([newCit]).select();
        if (error) {
          alert('Gagal mendaftar ke database: ' + error.message);
          btn.disabled = false; btn.innerText = 'Daftar Jadi Warga Resmi 📜';
          return;
        }
        if (data && data[0]) newCit.id = data[0].id;

        totalWarga++;
        const counterEl = document.getElementById('warga-counter');
        if (counterEl) counterEl.innerText = totalWarga + ' WARGA';
        
        const createdMesh = createCitizenMesh(newCit);
        setupActivePlayer(createdMesh, newCit);

        localStorage.setItem('piraku_my_ig', newCit.ig);
        localStorage.setItem('piraku_my_level', 1);
        localStorage.setItem('piraku_my_xp', 0);
        localStorage.setItem('piraku_my_kec', newCit.kecamatan);
        if (typeof window.reloadPirakuEconomyForCurrentUser === "function") window.reloadPirakuEconomyForCurrentUser();
      if (typeof window.refreshPirakuFishingForCurrentUser === "function") window.refreshPirakuFishingForCurrentUser();
        window.updateAutoDetectButton();

        btn.disabled = false; btn.innerText = 'Daftar Jadi Warga Resmi 📜';
        closeJoinModal();

        document.getElementById('ktp-reg-num').innerText = 'NO: BDG-' + String(totalWarga).padStart(3, '0');
        document.getElementById('ktp-name').innerText = name; 
        document.getElementById('ktp-kec').innerText = kecamatan;
        document.getElementById('ktp-ig').innerText = newCit.ig;
        document.getElementById('ktp-avatar-emoji').innerText = selectedEmoji; 
        document.getElementById('ktp-avatar-role').innerText = selectedRole.toUpperCase();
        const ktpGenEl = document.getElementById('ktp-gender-pill');
        if (ktpGenEl) ktpGenEl.innerText = selectedGender === 'female' ? '♀️ PEREMPUAN' : '♂️ LAKI-LAKI';
        document.getElementById('ktp-level-text').innerText = 'Lv. 1';
        window._pirakuPendingDistrictSpawn = true;
        document.getElementById('ktp-modal').style.display = 'flex';
        return;
      } catch (err) {}
    }
    btn.disabled = false; btn.innerText = 'Daftar Jadi Warga Resmi 📜';
  };

  window.closeKTP = () => { 
    const m = document.getElementById('ktp-modal');
    if (m) m.style.display = 'none'; 
    if (window._pirakuPendingDistrictSpawn) {
      window._pirakuPendingDistrictSpawn = false;
      if (typeof window.autoSpawnRegisteredDistrict === 'function') {
        setTimeout(() => window.autoSpawnRegisteredDistrict(true), 120);
      }
    }
    if (typeof window.onPirakuKtpCompleted === 'function') {
      setTimeout(() => window.onPirakuKtpCompleted(), 180);
    }
  };

    // Header AutoDetect Button
    window.updateAutoDetectButton = function() {
    try {
      const titleEl = document.getElementById("my-citizen-title");
      const curLvl = parseInt(localStorage.getItem("piraku_my_level") || "99", 10);
      if (typeof window.getPirakuCitizenTitle === "function" && titleEl) {
        titleEl.textContent = window.getPirakuCitizenTitle(curLvl);
      }
    } catch(e) {}
    const savedIg = localStorage.getItem("piraku_my_ig");
    const savedXp = parseInt(localStorage.getItem("piraku_my_xp") || "0", 10);
    const lvlData = typeof window.computePirakuLevelFromTotalXp === "function"
      ? window.computePirakuLevelFromTotalXp(savedXp)
      : { level: Math.min(99, parseInt(localStorage.getItem("piraku_my_level") || "1", 10)), currentXpInLevel: savedXp % 100, requiredForNext: 100, isMax: false };
    const savedLvl = lvlData.level;
    const xpProgress = lvlData.isMax ? 100 : Math.min(100, Math.round((lvlData.currentXpInLevel / lvlData.requiredForNext) * 100));
    const btn = document.getElementById("btn-citizen-status");
    if (!btn) return;

    if (savedIg) { 
      btn.className = "btn-my-citizen"; 
      btn.style.minWidth = "120px";
      btn.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:6px;">' +
        '<span style="font-weight:800; font-size:11px; color:#fff;">👤 ' + savedIg + '</span>' +
        '<span class="player-level-badge" style="color:var(--lampu); font-weight:800; font-size:9.5px;">LVL ' + savedLvl + '</span>' +
        '</div>' +
        '<div style="width:100%; height:4px; background:rgba(255,255,255,0.25); border-radius:3px; margin-top:4px; overflow:hidden;">' +
        '<div style="width:' + xpProgress + '%; height:100%; background:linear-gradient(90deg, #4ade80, #ffcf4a); transition:width 0.3s ease;"></div>' +
        '</div>';
    } else { 
      btn.className = "btn-join"; 
      btn.style.minWidth = "";
      btn.innerHTML = "<span>+</span> Masuk / Daftar"; 
    }
  };

  window.openMyKTPModal = function(citizen) {
    const savedIg = localStorage.getItem('piraku_my_ig') || '';
    const found = citizen || registeredCitizensList.find(c => (c?.ig || '').toLowerCase() === savedIg.toLowerCase());
    if (!found) { openJoinModal(); return; }
    const lvl = found.level || parseInt(localStorage.getItem('piraku_my_level') || '1', 10) || 1;
    const regNum = found.id ? String(found.id).padStart(3, '0') : String(Math.max(1, totalWarga)).padStart(3, '0');
    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    setTxt('ktp-reg-num', 'NO: BDG-' + regNum);
    setTxt('ktp-name', found.name || found.ig || 'Warga Bandung');
    setTxt('ktp-kec', found.kecamatan || localStorage.getItem('piraku_my_kec') || 'Bandung Wetan');
    setTxt('ktp-ig', found.ig || savedIg);
    setTxt('ktp-avatar-emoji', found.emoji || '☕');
    setTxt('ktp-avatar-role', (found.role || 'WARGA').toUpperCase());
    const st = parseCitizenStyle(found);
    setTxt('ktp-gender-pill', st.gender === 'female' ? '♀️ PEREMPUAN' : '♂️ LAKI-LAKI');
    setTxt('ktp-level-text', 'Lv. ' + lvl);
    const ktpTierEl = document.getElementById('ktp-tier-pill');
    const eco = window.PirakuEconomy;
    if (ktpTierEl && eco && typeof eco.getTierObj === 'function') {
      const t = eco.getTierObj();
      ktpTierEl.textContent = t.badge + ' ' + t.name;
    }
    const m = document.getElementById('ktp-modal');
    if (m) m.style.display = 'flex';
  };

  window.openMyAccountMenuModal = function(found) {
    let modal = document.getElementById('piraku-my-account-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'piraku-my-account-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.72);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;';
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
      document.body.appendChild(modal);
    }
    const lvl = found.level || parseInt(localStorage.getItem('piraku_my_level') || '1', 10) || 1;
    const kec = found.kecamatan || localStorage.getItem('piraku_my_kec') || 'Bandung';
    const coins = window.PirakuEconomy ? window.PirakuEconomy.getCoins() : 0;
    const isFounder = String(found.ig || '').trim().toLowerCase().replace(/^@/, '') === 'yelclaw';
    modal.innerHTML = `
      <div style="width:100%;max-width:340px;background:linear-gradient(180deg,#0f172a,#1e293b);border:1.5px solid ${isFounder ? 'rgba(250,204,21,0.7)' : 'rgba(56,189,248,0.45)'};border-radius:20px;padding:16px;color:#f8fafc;box-shadow:0 22px 50px rgba(0,0,0,0.78);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div>
            <div style="font-size:10px;color:${isFounder ? '#facc15' : '#7dd3fc'};font-weight:800;letter-spacing:.7px;">${isFounder ? '🛡️ FOUNDER & ADMIN KOTA' : 'AKUN WARGA AKTIF'}</div>
            <div style="font-size:16px;font-weight:800;color:#fff;margin-top:2px;">${found.ig} <span style="font-size:11px;background:${isFounder ? '#d97706' : '#2563eb'};padding:2px 7px;border-radius:999px;vertical-align:middle;">LVL ${lvl}</span></div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Kec. ${kec} • 🪙 ${coins.toLocaleString('id-ID')}</div>
          </div>
          <button id="btn-close-myacc" style="width:30px;height:30px;border-radius:50%;border:none;background:#0f172a;color:#cbd5e1;font-size:15px;cursor:pointer;">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${isFounder ? `<button id="btn-myacc-founder" style="width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid rgba(250,204,21,0.65);background:linear-gradient(135deg,rgba(245,158,11,0.28),rgba(120,53,15,0.45));color:#fef08a;font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:space-between;"><span>🛡️ Panel Admin Founder (Kirim Hadiah)</span><span>›</span></button>` : ''}
          <button id="btn-myacc-wardrobe" style="width:100%;padding:11px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);background:rgba(30,41,59,0.9);color:#f8fafc;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
            <span>👕 Ganti Pakaian &amp; Karakter</span><span style="color:#94a3b8;">›</span>
          </button>
          <button id="btn-myacc-ktp" style="width:100%;padding:11px 14px;border-radius:12px;border:1px solid rgba(56,189,248,0.3);background:rgba(37,99,235,0.22);color:#e0f2fe;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
            <span>🪪 Kelola KTP</span><span style="color:#7dd3fc;">›</span>
          </button>
          <button id="btn-myacc-logout" style="width:100%;padding:11px 14px;border-radius:12px;border:1px solid rgba(239,68,68,0.35);background:rgba(127,29,29,0.35);color:#fecaca;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
            <span>🚪 Logout / Keluar Akun</span><span style="color:#fca5a5;">›</span>
          </button>
        </div>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#btn-close-myacc').onclick = () => { modal.style.display = 'none'; };
    const fBtn = modal.querySelector('#btn-myacc-founder');
    if (fBtn) {
      fBtn.onclick = () => {
        modal.style.display = 'none';
        if (typeof window.openFounderAdminModal === 'function') window.openFounderAdminModal();
      };
    }
    modal.querySelector('#btn-myacc-wardrobe').onclick = () => {
      modal.style.display = 'none';
      if (typeof window.openWardrobeModal === 'function') window.openWardrobeModal();
    };
    modal.querySelector('#btn-myacc-ktp').onclick = () => {
      modal.style.display = 'none';
      window.openMyKTPModal(found);
    };
    modal.querySelector('#btn-myacc-logout').onclick = () => {
      modal.style.display = 'none';
      window.resetMyDeviceCitizen();
    };
  };

  window.openFounderAdminModal = function() {
    const myClean = (localStorage.getItem('piraku_my_ig') || '').trim().toLowerCase().replace(/^@/, '');
    if (myClean !== 'yelclaw') { showToast('Khusus akun Founder @yelclaw!'); return; }
    let modal = document.getElementById('piraku-founder-admin-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'piraku-founder-admin-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.8);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;';
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
      document.body.appendChild(modal);
    }
    const cat = (window.PirakuEconomy && typeof window.PirakuEconomy.getCatalog === 'function')
      ? window.PirakuEconomy.getCatalog()
      : { outfit: [], mobility: [], tier: [] };
    const fishCat = (typeof window.getPirakuFishingCatalog === 'function')
      ? window.getPirakuFishingCatalog()
      : { rods: [], bobbers: [] };
    const allItems = [
      ...cat.outfit.map(i => ({ ...i, catType: 'outfit', dispIcon: i.icon || '👕', group: 'Outfit & Aksesoris' })),
      ...cat.mobility.map(i => ({ ...i, catType: 'mobility', dispIcon: i.icon || '🛵', group: 'Kendaraan Kota' })),
      ...cat.tier.filter(i => i.id !== 'tier_1').map(i => ({ ...i, catType: 'tier', dispIcon: i.icon || i.badge || '👑', group: 'Gelar Warga' })),
      ...(fishCat.rods || []).map(i => ({ ...i, catType: 'fish_rod', dispIcon: i.badge || '🎣', group: 'Joran Mancing' })),
      ...(fishCat.bobbers || []).map(i => ({ ...i, catType: 'fish_bobber', dispIcon: i.icon || '🔴', group: 'Umbul-umbul Mancing' }))
    ];
    const citizens = (Array.isArray(registeredCitizensList) ? registeredCitizensList : [])
      .filter(c => c && c.ig && String(c.ig).toLowerCase().replace(/^@/, '') !== 'yelclaw');

    const groupNames = Array.from(new Set(allItems.map(i => i.group)));
    const itemsOptHtml = groupNames.map(g => {
      const opts = allItems.filter(i => i.group === g)
        .map(i => `<option value="${i.id}" data-cat="${i.catType}">${i.dispIcon} ${i.name}</option>`).join('');
      return `<optgroup label="${g}">${opts}</optgroup>`;
    }).join('');

    modal.innerHTML = `
      <div style="width:100%;max-width:410px;background:linear-gradient(180deg,#0f172a,#1e293b);border:1.5px solid rgba(250,204,21,0.65);border-radius:22px;padding:18px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.85);max-height:86dvh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div>
            <div style="font-size:10px;color:#facc15;font-weight:800;letter-spacing:.8px;">🛡️ ROLE KHUSUS FOUNDER (@yelclaw)</div>
            <div style="font-size:18px;font-weight:800;">Panel Admin &amp; Hadiah Warga</div>
          </div>
          <button id="fa-close" style="width:30px;height:30px;border-radius:50%;border:none;background:#090d16;color:#cbd5e1;font-size:15px;cursor:pointer;">✕</button>
        </div>

        <label style="display:block;font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:4px;">PILIH WARGA PENERIMA</label>
        <input id="fa-target-search" type="text" placeholder="🔍 Cari @username / nama / kecamatan..." style="width:100%;box-sizing:border-box;padding:9px 10px;border-radius:10px;border:1px solid rgba(250,204,21,0.45);background:#090d16;color:#f8fafc;font-size:12.5px;margin-bottom:6px;">
        <select id="fa-target-select" style="width:100%;padding:9px 10px;border-radius:10px;border:1px solid #334155;background:#090d16;color:#f8fafc;font-size:12.5px;margin-bottom:6px;">
          <option value="">-- Pilih dari daftar warga (${citizens.length}) --</option>
          ${citizens.map(c => `<option value="${String(c.ig).replace(/^@/, '')}">${c.ig} (${c.kecamatan || 'Bandung'})</option>`).join('')}
        </select>
        <input id="fa-target-ig" type="text" placeholder="Atau ketik @username IG penerima..." style="width:100%;box-sizing:border-box;padding:9px 10px;border-radius:10px;border:1px solid #334155;background:#090d16;color:#f8fafc;font-size:12.5px;margin-bottom:12px;">

        <div style="padding:12px;border-radius:14px;background:rgba(15,23,42,0.75);border:1px solid rgba(250,204,21,0.3);margin-bottom:10px;">
          <div style="font-size:12px;font-weight:800;color:#fde047;margin-bottom:8px;">🪙 Kirim Koin Piraku</div>
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <input id="fa-coin-amt" type="number" value="100" min="1" max="50000" style="flex:1;padding:8px 10px;border-radius:9px;border:1px solid #334155;background:#090d16;color:#fde047;font-weight:800;font-size:13px;">
            <button id="fa-send-coins" style="padding:8px 14px;border-radius:9px;border:none;background:linear-gradient(135deg,#facc15,#f59e0b);color:#0f172a;font-weight:900;font-size:12px;cursor:pointer;">Kirim Koin 🪙</button>
          </div>
          <div style="display:flex;gap:6px;">
            ${[50, 150, 500, 1000].map(v => `<button class="fa-quick-coin" data-v="${v}" style="flex:1;padding:5px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#cbd5e1;font-size:11px;font-weight:800;cursor:pointer;">+${v}</button>`).join('')}
          </div>
        </div>

        <div style="padding:12px;border-radius:14px;background:rgba(15,23,42,0.75);border:1px solid rgba(56,189,248,0.3);margin-bottom:10px;">
          <div style="font-size:12px;font-weight:800;color:#7dd3fc;margin-bottom:8px;">🎁 Kirim Item / Kendaraan / Gelar</div>
          <select id="fa-item-select" style="width:100%;padding:9px 10px;border-radius:10px;border:1px solid #334155;background:#090d16;color:#f8fafc;font-size:12px;margin-bottom:8px;">
            ${itemsOptHtml}
          </select>
          <button id="fa-send-item" style="width:100%;padding:9px;border-radius:10px;border:none;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#fff;font-weight:900;font-size:12.5px;cursor:pointer;">Kirim Item ke Warga 🎁</button>
        </div>

        <div style="padding:12px;border-radius:14px;background:rgba(15,23,42,0.75);border:1px solid rgba(74,222,128,0.3);">
          <div style="font-size:12px;font-weight:800;color:#4ade80;margin-bottom:6px;">📢 Pengumuman Global (Gratis Admin)</div>
          <div style="display:flex;gap:6px;">
            <input id="fa-announce-txt" type="text" maxlength="100" placeholder="Tulis pengumuman ke seluruh kota..." style="flex:1;padding:8px 10px;border-radius:9px;border:1px solid #334155;background:#090d16;color:#f8fafc;font-size:12px;">
            <button id="fa-send-announce" style="padding:8px 12px;border-radius:9px;border:none;background:#10b981;color:#fff;font-weight:900;font-size:12px;cursor:pointer;">Siarkan</button>
          </div>
        </div>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#fa-close').onclick = () => { modal.style.display = 'none'; };
    const searchEl = modal.querySelector('#fa-target-search');
    const selEl = modal.querySelector('#fa-target-select');
    const inpEl = modal.querySelector('#fa-target-ig');
    if (searchEl) {
      searchEl.oninput = () => {
        const q = (searchEl.value || '').trim().toLowerCase().replace(/^@/, '');
        const filtered = q
          ? citizens.filter(c =>
              String(c.ig || '').toLowerCase().includes(q) ||
              String(c.nama || '').toLowerCase().includes(q) ||
              String(c.kecamatan || '').toLowerCase().includes(q)
            )
          : citizens;
        const placeholder = q ? `-- Hasil pencarian (${filtered.length}) --` : `-- Pilih dari daftar warga (${citizens.length}) --`;
        selEl.innerHTML = `<option value="">${placeholder}</option>` +
          filtered.slice(0, 200).map(c => `<option value="${String(c.ig).replace(/^@/, '')}">${c.ig} (${c.kecamatan || 'Bandung'})</option>`).join('');
        if (filtered.length === 1) {
          const onlyVal = String(filtered[0].ig).replace(/^@/, '');
          selEl.value = onlyVal;
          inpEl.value = '@' + onlyVal;
        }
      };
    }
    selEl.onchange = () => { if (selEl.value) inpEl.value = '@' + selEl.value; };
    modal.querySelectorAll('.fa-quick-coin').forEach(b => { b.onclick = () => { modal.querySelector('#fa-coin-amt').value = b.dataset.v; }; });

    async function upsertGiftToCitizen(targetKey, applyFn, summaryText) {
      if (!supabaseClient) { showToast('Supabase belum siap!'); return; }
      const { data: cur } = await supabaseClient.from('piraku_wallets').select('*').eq('citizen_key', targetKey).maybeSingle();
      const base = cur ? {
        citizen_key: targetKey,
        display_name: cur.display_name || ('@' + targetKey),
        coins: Number(cur.coins ?? 25),
        owned_items: Array.isArray(cur.owned_items) ? [...cur.owned_items] : ['tier_1'],
        tier_id: cur.tier_id || 'tier_1',
        equipped_outfit: cur.equipped_outfit || null,
        equipped_vehicle: cur.equipped_vehicle || null,
        rental_expires_at: Number(cur.rental_expires_at || 0),
        billboard_text: cur.billboard_text || null,
        updated_at: new Date().toISOString()
      } : {
        citizen_key: targetKey,
        display_name: '@' + targetKey,
        coins: 25,
        owned_items: ['tier_1'],
        tier_id: 'tier_1',
        equipped_outfit: null,
        equipped_vehicle: null,
        rental_expires_at: 0,
        billboard_text: null,
        updated_at: new Date().toISOString()
      };
      applyFn(base);
      const { error } = await supabaseClient.from('piraku_wallets').upsert(base, { onConflict: 'citizen_key' });
      if (error) { showToast('Gagal mengirim hadiah: ' + error.message); return; }
      if (typeof window.broadcastFounderGift === 'function') window.broadcastFounderGift(targetKey, summaryText);
      if (typeof window.refreshPirakuRemoteTiers === 'function') window.refreshPirakuRemoteTiers();
      showToast('✅ Berhasil kirim ke @' + targetKey + ': ' + summaryText);
    }

    modal.querySelector('#fa-send-coins').onclick = async () => {
      const targetKey = (inpEl.value || '').trim().toLowerCase().replace(/^@/, '');
      const amt = Math.round(Number(modal.querySelector('#fa-coin-amt').value) || 0);
      if (!targetKey) { showToast('Pilih/ketik @username penerima dulu!'); return; }
      if (amt <= 0) { showToast('Jumlah koin harus > 0!'); return; }
      await upsertGiftToCitizen(targetKey, (w) => { w.coins = Math.max(0, w.coins + amt); }, `+${amt} 🪙 Koin`);
    };

    modal.querySelector('#fa-send-item').onclick = async () => {
      const targetKey = (inpEl.value || '').trim().toLowerCase().replace(/^@/, '');
      if (!targetKey) { showToast('Pilih/ketik @username penerima dulu!'); return; }
      const itemSel = modal.querySelector('#fa-item-select');
      const itemId = itemSel.value;
      const itemCat = itemSel.options[itemSel.selectedIndex]?.dataset?.cat || '';
      const itemObj = allItems.find(x => x.id === itemId && (!itemCat || x.catType === itemCat));
      if (!itemObj) return;
      await upsertGiftToCitizen(targetKey, (w) => {
        if (itemObj.catType === 'fish_rod') {
          const tag = 'fish_rod:' + itemId;
          if (!w.owned_items.includes(tag)) w.owned_items.push(tag);
        } else if (itemObj.catType === 'fish_bobber') {
          const tag = 'fish_bobber:' + itemId;
          if (!w.owned_items.includes(tag)) w.owned_items.push(tag);
        } else {
          if (!w.owned_items.includes(itemId)) w.owned_items.push(itemId);
          if (itemObj.catType === 'outfit') w.equipped_outfit = itemId;
          else if (itemObj.catType === 'tier') w.tier_id = itemId;
          else if (itemObj.catType === 'mobility') {
            w.equipped_vehicle = itemId;
            w.rental_expires_at = Math.max(Date.now(), Number(w.rental_expires_at || 0)) + (itemObj.durationMin || 10) * 60 * 1000;
          }
        }
      }, `${itemObj.dispIcon} ${itemObj.name}`);
    };

    modal.querySelector('#fa-send-announce').onclick = async () => {
      const msg = (modal.querySelector('#fa-announce-txt').value || '').trim();
      if (!msg) return;
      if (supabaseClient) {
        await supabaseClient.from('chat_warga').insert([{ sender_ig: '@yelclaw', message: '[MEGAFON] ' + msg }]);
      }
      modal.querySelector('#fa-announce-txt').value = '';
      showToast('📢 Pengumuman Founder disiarkan!');
    };
  };

  window.handleCitizenButtonClick = function() {
    const savedIg = localStorage.getItem('piraku_my_ig');
    if (savedIg) {
      const found = registeredCitizensList.find(c => (c?.ig || '').toLowerCase() === savedIg.toLowerCase());
      if (found) {
        window.openMyAccountMenuModal(found);
      } else openJoinModal();
    } else openJoinModal();
  };

  window.resetMyDeviceCitizen = function() {
    if (confirm('Keluar dari akun di perangkat ini?')) { 
      localStorage.removeItem('piraku_my_ig'); 
      localStorage.removeItem('piraku_my_level');
      localStorage.removeItem('piraku_my_xp');
      localStorage.removeItem('piraku_my_kec');
      localStorage.removeItem('piraku_ktp_kecamatan');
      localStorage.removeItem('piraku_my_color');
      localStorage.removeItem('piraku_my_acc');
      localStorage.removeItem('piraku_my_inventory');
      if (typeof window.reloadPirakuEconomyForCurrentUser === "function") window.reloadPirakuEconomyForCurrentUser();
      if (typeof window.refreshPirakuFishingForCurrentUser === "function") window.refreshPirakuFishingForCurrentUser();
      window.pirakuDistrictHasHouse = false;
      myPlayerMesh = null;
      isControlledByPlayer = false;
      activeQuestSystem = null;
      const joyZone = document.getElementById('joystick-zone');
      if (joyZone) joyZone.style.display = 'none';
      const jumpBtn = document.getElementById('btn-jump-mobile');
      if (jumpBtn) jumpBtn.style.display = 'none';
      const card = document.getElementById('quest-tracker-card');
      if (card) card.style.display = 'none';
      window.updateAutoDetectButton(); 
      closeKTP();
      if (window.pirakuInDistrict && typeof window.enterDistrictMap === "function") {
        window.enterDistrictMap("bandung_wetan");
      }
      if (typeof window.spawnGuestCitizen === "function") {
        setTimeout(() => window.spawnGuestCitizen(), 150);
      }
      showToast('Berhasil keluar akun!'); 
    }
  };

  function showToast(msg) {
    const t = document.getElementById('toast-notif'); 
    if (!t) return;
    t.innerText = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  window.openLeaderboardModal = function() {
    const modal = document.getElementById('leaderboard-modal'); 
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.querySelector('.modal-card').style.transform = 'translateY(0)', 10);
    }
    renderLeaderboard();
    if (typeof window.refreshPirakuRemoteTiers === 'function') {
      Promise.resolve(window.refreshPirakuRemoteTiers()).then(() => {
        if (modal && modal.style.display === 'flex') renderLeaderboard();
      }).catch(() => {});
    }
  };
  window.closeLeaderboardModal = function() {
    const modal = document.getElementById('leaderboard-modal'); 
    if (modal) {
      modal.querySelector('.modal-card').style.transform = 'translateY(100%)';
      setTimeout(() => modal.style.display = 'none', 280);
    }
  };
  function likeEsc(s) { return String(s || '').replace(/[\\%_]/g, m => '\\' + m); }
  const esc = s => String(s || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  let activeLeaderboardTab = 'level';
  window.setLeaderboardTab = function(tab) {
    activeLeaderboardTab = tab || 'level';
    document.querySelectorAll('#leaderboard-tabs [data-lb-tab]').forEach(btn => {
      const active = btn.dataset.lbTab === activeLeaderboardTab;
      btn.style.background = active ? '#facc15' : '#1e293b';
      btn.style.color = active ? '#0f172a' : '#cbd5e1';
    });
    renderLeaderboard();
  };

  function renderLeaderboard() {
    const containerEl = document.getElementById('leaderboard-items');
    if (!containerEl) return;

    if (activeLeaderboardTab === 'camat') {
      const camatRows = (typeof window.getPirakuCamatLeaderboard === 'function')
        ? window.getPirakuCamatLeaderboard()
        : [];
      if (!camatRows.length) {
        containerEl.innerHTML = '<div style="text-align:center;font-size:11.5px;color:#94a3b8;padding:20px;">Data Camat & Kecamatan sedang dimuat...</div>';
        return;
      }
      containerEl.innerHTML = camatRows.map((d, idx) => `
        <div class="leader-item" onclick="closeLeaderboardModal();if(typeof window.enterDistrictMap==='function')window.enterDistrictMap('${esc(d.id)}');" style="background:rgba(30,41,59,0.85);border:1px solid rgba(148,163,184,0.2);color:#f8fafc;">
          <div class="leader-rank">${['🥇','🥈','🥉'][idx] || '#' + (idx + 1)}</div>
          <div class="leader-info">
            <div class="leader-user" style="color:#f8fafc;">🏛️ Kec. ${esc(d.name)}</div>
            <div style="font-size:10.5px;color:#fde047;font-weight:700;">Camat: ${d.camatIg ? esc(d.camatIg) : '<span style="color:#94a3b8;font-weight:600;">Belum terpilih</span>'}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:1px;">Lv.${d.level} (${esc(d.title)}) • 🏠 ${d.builtHouses}/36 • 👥 ${d.totalCitizens} warga</div>
          </div>
          <div class="leader-votes" style="color:#38bdf8;font-weight:900;font-size:11px;white-space:nowrap;">🪙 ${Number(d.coins || 0).toLocaleString('id-ID')}</div>
        </div>
      `).join('');
      return;
    }

    const tierOrder = { tier_7: 7, tier_6: 6, tier_5: 5, tier_4: 4, tier_3: 3, tier_2: 2, tier_1: 1 };
    const myIgClean = (localStorage.getItem('piraku_my_ig') || '').trim().toLowerCase().replace(/^@/, '');
    const myEcoTier = (window.PirakuEconomy && typeof window.PirakuEconomy.getTierObj === 'function') ? window.PirakuEconomy.getTierObj() : null;

    const myEcoCoins = (window.PirakuEconomy && typeof window.PirakuEconomy.getCoins === 'function') ? window.PirakuEconomy.getCoins() : null;

    const seen = new Set();
    const list = [];
    registeredCitizensList.forEach(c => {
      if (!c || !c.ig || c.role === 'WALKOT' || c.role === 'GUBERNUR') return;
      const clean = String(c.ig || '').trim().toLowerCase().replace(/^@/, '');
      if (!clean || seen.has(clean)) return;
      seen.add(clean);
      const remTier = (window.pirakuRemoteTiers || {})[clean];
      const lvl = (typeof window.computePirakuLevelFromTotalXp === 'function')
        ? window.computePirakuLevelFromTotalXp(c.xp || 0).level
        : (c.level || 1);
      const lvlTitle = (typeof window.getPirakuCitizenTitle === 'function')
        ? window.getPirakuCitizenTitle(lvl)
        : 'Warga Baru';
      const tObj = (clean && clean === myIgClean && myEcoTier)
        ? { tierId: myEcoTier.id, tierName: myEcoTier.id === 'tier_1' ? lvlTitle : myEcoTier.name, tierBadge: myEcoTier.id === 'tier_1' ? '🎖️' : myEcoTier.badge }
        : (remTier && remTier.tierId && remTier.tierId !== 'tier_1'
          ? remTier
          : { tierId: 'tier_1', tierName: lvlTitle, tierBadge: '🎖️' });
      const coins = (clean && clean === myIgClean && myEcoCoins !== null)
        ? myEcoCoins
        : (Number((window.pirakuRemoteCoins || {})[clean]) || 0);
      list.push({ ...c, clean, lvl, coins, tierId: tObj.tierId || 'tier_1', tierName: tObj.tierName || lvlTitle, tierBadge: tObj.tierBadge || '🎖️' });
    });

    let sorted;
    if (activeLeaderboardTab === 'votes') {
      sorted = list.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0) || (b.xp || 0) - (a.xp || 0)).slice(0, 10);
    } else if (activeLeaderboardTab === 'sultan') {
      sorted = list.sort((a, b) => (tierOrder[b.tierId] || 1) - (tierOrder[a.tierId] || 1) || (b.coins || 0) - (a.coins || 0) || (b.xp || 0) - (a.xp || 0)).slice(0, 10);
    } else {
      sorted = list.sort((a, b) => (b.xp || 0) - (a.xp || 0) || (b.lvl || 1) - (a.lvl || 1)).slice(0, 10);
    }

    containerEl.innerHTML = sorted.map((c, idx) => {
      const statText = activeLeaderboardTab === 'votes'
        ? `❤️ ${c.upvotes || 0}`
        : activeLeaderboardTab === 'sultan'
          ? `${c.tierBadge} ${c.tierName || 'Warga'}`
          : `⭐ Lv.${c.lvl}`;
      const subText = activeLeaderboardTab === 'sultan'
        ? `Kec. ${esc(c.kecamatan || 'Bandung')} • 🪙 ${(c.coins || 0).toLocaleString('id-ID')}`
        : `Kec. ${esc(c.kecamatan || 'Bandung')} • ${(c.xp || 0).toLocaleString('id-ID')} XP`;
      return `
        <div class="leader-item" onclick="teleportToCitizen('${esc(c.ig)}')" style="background:rgba(30,41,59,0.85);border:1px solid rgba(148,163,184,0.2);color:#f8fafc;">
          <div class="leader-rank">${['🥇','🥈','🥉'][idx] || '#' + (idx + 1)}</div>
          <div class="leader-info">
            <div class="leader-user" style="color:#f8fafc;">${esc(c.ig)}</div>
            <div style="font-size:10.5px;color:#94a3b8;">${subText}</div>
          </div>
          <div class="leader-votes" style="color:#fde047;font-weight:900;font-size:11.5px;white-space:nowrap;">${statText}</div>
        </div>
      `;
    }).join('');
  }
  window.teleportToCitizen = function(ig) {
    closeLeaderboardModal();
    if (typeof window.focusOnlineCitizenByIg === 'function') {
      window.focusOnlineCitizenByIg(ig);
      return;
    }
    const clean = String(ig || '').trim().toLowerCase().replace(/^@/, '');
    const found = registeredCitizensList.find(c => String(c?.ig || '').trim().toLowerCase().replace(/^@/, '') === clean);
    if (found) showCitizenSpeech(found, true);
  };

  // Absen Minigame + XP Level Up
  window.openCheckinModal = function() {
    const modal = document.getElementById('checkin-modal'), myIg = localStorage.getItem('piraku_my_ig');
    if (myIg) document.getElementById('checkin-ig-inp').value = myIg;
    if (modal) {
      modal.style.display = 'flex'; 
      setTimeout(() => modal.querySelector('.modal-card').style.transform = 'translateY(0)', 10);
    }
  };
  window.closeCheckinModal = function() {
    const modal = document.getElementById('checkin-modal'); 
    if (modal) {
      modal.querySelector('.modal-card').style.transform = 'translateY(100%)';
      setTimeout(() => modal.style.display = 'none', 280);
    }
  };

  window.processDailyCheckin = async function() {
    const handle = document.getElementById('checkin-ig-inp').value.trim();
    if (!handle) { alert('Masukkan handle IG kamu!'); return; }
    const cleanIg = (handle.startsWith('@') ? handle : '@' + handle).toLowerCase();

    const streakKey = 'user_streak_' + cleanIg.replace(/^@/, '');
    let s = (parseInt(localStorage.getItem(streakKey) || '0') % 7) + 1;
    localStorage.setItem(streakKey, s);

    let curLvl = parseInt(localStorage.getItem('piraku_my_level') || '1', 10);
    if (typeof window.grantPirakuXP === "function") {
      const info = await window.grantPirakuXP(60, "Absen Harian Warga (H-" + s + ")");
      if (info && info.level) curLvl = info.level;
      else curLvl = parseInt(localStorage.getItem('piraku_my_level') || '1', 10);
    } else {
      curLvl = Math.min(99, curLvl + 1);
      localStorage.setItem('piraku_my_level', curLvl);
    }
    window.updateAutoDetectButton();
    
    if (s === 7) {
      showToast('🎉 SELAMAT H-7! Rumah kamu terbit di komplek kecamatan!');
      window.playSynthTone(1050, 'sine', 0.5);

      const targetCitizen = registeredCitizensList.find(c => (c?.ig || '').toLowerCase() === cleanIg);
      if (targetCitizen) {
        targetCitizen.has_house = true;
        if (supabaseClient) {
          try { await supabaseClient.from('warga_piraku').update({ has_house: true }).ilike('ig', cleanIg); } catch (e) {}
        }
        if (typeof window.refreshActiveDistrictHouses === "function") window.refreshActiveDistrictHouses();
        const hData = spawnCitizenHouse(targetCitizen, registeredCitizensList.length);
        
        const animObj = animC.find(a => ((a.userData?.a?.c?.ig || '')).toLowerCase() === cleanIg);
        if (animObj) {
          gsap.to(animObj.position, { x: hData.porchX, z: hData.porchZ, duration: 1.5, ease: 'power2.out' });
          animObj.userData.a.tx = hData.porchX;
          animObj.userData.a.tz = hData.porchZ;
        }

        if (supabaseClient) {
          await supabaseClient.from('warga_piraku').update({ 
            has_house: true,
            house_index: registeredCitizensList.length,
            level: curLvl
          }).ilike('ig', likeEsc(cleanIg));
        }
      }
    } else {
      showToast('Absen H-' + s + ' berhasil! +50 XP (Naik ke Lv. ' + curLvl + ') 🚀');
      window.playSynthTone(620, 'sine', 0.2);
      if (supabaseClient) {
        await supabaseClient.from('warga_piraku').update({ level: curLvl }).ilike('ig', likeEsc(cleanIg));
      }
    }
    setTimeout(() => closeCheckinModal(), 1200);
  };

  window.applyMode = function(m) {
    const isR = m === 'reborn'; curMode = m; setVitals(m, totalWarga);
    const btnR = document.getElementById('btn-mode-reborn');
    const btnN = document.getElementById('btn-mode-now');
    const badge = document.getElementById('badge-status');
    const title = document.getElementById('status-title');
    if (btnR) btnR.className = 'btn-mode g ' + (isR ? 'active' : '');
    if (btnN) btnN.className = 'btn-mode r ' + (!isR ? 'active' : '');
    if (badge) {
      badge.textContent = isR ? 'Mode Reborn' : 'Darurat macet';
      badge.style.color = isR ? '#6fe3a3' : '#ff8a7a';
    }
    if (title) {
      title.textContent = isR ? 'Bandung Reborn: Plaza Hijau & Kota Ramah Warga' : 'Kondisi Sekarang: Macet & Polusi Knalpot';
    }
    rebornGroup.visible = false; rebornGroup.scale.set(0.001, 0.001, 0.001);
    gsap.to(LM, { opacity: isR ? 0 : 0.75, duration: 0.5 });
  };
  applyMode('reborn');

  // Preset Kamera
  window.moveCam = function(preset) {
    hideCitizenSpeech();
    document.querySelectorAll('.view-chip').forEach(c => c.classList.remove('active'));
    const btn = document.getElementById('chip-' + preset); if (btn) btn.classList.add('active');
    let p, t;
    if (preset === 'overview') { p = { x: -26, y: 26, z: -55 }; t = { x: 0, y: 3, z: 5 }; }
    else if (preset === 'sate') { p = { x: 0, y: 18, z: -38 }; t = { x: 0, y: 8, z: 13.5 }; }
    else if (preset === 'pasupati') { 
      p = { x: -65, y: 16, z: -55 }; 
      t = { x: -27, y: 6.5, z: -26 }; 
    }
    else if (preset === 'walkot') { p = { x: -14, y: 2.2, z: -8 }; t = { x: -10, y: 1.2, z: -2.5 }; }
    gsap.to(cam.position, { ...p, duration: 1.2, ease: 'power2.inOut' });
    gsap.to(controls.target, { ...t, duration: 1.2, ease: 'power2.inOut' });
  };

  window.snapCity = function () {
    renderer.render(scene, cam);
    const c = renderer.domElement, o = document.createElement('canvas'); o.width = c.width; o.height = c.height;
    const x = o.getContext('2d'); x.drawImage(c, 0, 0);
    x.font = '800 ' + Math.round(o.width * .04) + 'px "Bricolage Grotesque", sans-serif';
    x.fillStyle = '#fff'; x.fillText('@pirakubdg', o.width * .04, o.height * .96);
    const a = document.createElement('a'); a.download = 'bandung-' + curMode + '.png'; a.href = o.toDataURL('image/png'); a.click();
    showToast('Foto kota tersimpan 📷');
  };

  window.downloadKTPScreenshot = function() {
    const runExport = () => {
      html2canvas(document.getElementById('ktp-card-export'), { scale: 3, backgroundColor: null, useCORS: true }).then(canvas => {
        const a = document.createElement('a'); a.download = 'E-KTP_Bandung_' + (document.getElementById('ktp-ig').innerText.replace('@', '') || 'Warga') + '.png';
        a.href = canvas.toDataURL('image/png'); a.click();
      });
    };
    if (typeof html2canvas === 'function') {
      runExport();
    } else {
      showToast('Menyiapkan ekspor KTP...');
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = runExport;
      s.onerror = () => showToast('Gagal memuat modul ekspor KTP');
      document.head.appendChild(s);
    }
  };

  window.copyCitizenLink = function() {
    if (!activeCitizenTarget) return;
    const cleanIg = activeCitizenTarget.ig.replace('@', '');
    const url = window.location.origin + window.location.pathname + '?warga=' + cleanIg;
    navigator.clipboard.writeText(url).then(() => showToast('Link profil @' + cleanIg + ' disalin! 📋'));
  };

  window.copyCurrentCitizenLink = function() {
    const ig = document.getElementById('ktp-ig').innerText.replace('@', '');
    const url = window.location.origin + window.location.pathname + '?warga=' + ig;
    navigator.clipboard.writeText(url).then(() => showToast('Link KTP disalin! 📋'));
  };

  window.handleSearchCitizen = function(q) {
    q = q.trim().toLowerCase(); if (!q) { hideCitizenSpeech(); return; }
    const f = registeredCitizensList.find(c => (c.ig && String(c?.ig || "").toLowerCase().includes(q)) || (c.name && c.name.toLowerCase().includes(q)) || (c.kecamatan && c.kecamatan.toLowerCase().includes(q)));
    if (f) showCitizenSpeech(f);
  };

  // === MENU TITIK 3: CARI WARGA, HEMAT BATERAI, LAYAR BERSIH, PANDUAN, MASUKAN ===
  window.openSearchWargaModal = function() {
    let modal = document.getElementById('piraku-search-warga-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'piraku-search-warga-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.75);backdrop-filter:blur(7px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;';
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="width:100%;max-width:380px;background:linear-gradient(180deg,#0f172a,#1e293b);border:1.5px solid rgba(56,189,248,0.45);border-radius:20px;padding:16px;color:#f8fafc;box-shadow:0 22px 50px rgba(0,0,0,0.78);max-height:82vh;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:16px;font-weight:800;">🔍 Cari Warga Bandung</div>
          <button id="btn-close-search-warga" style="width:30px;height:30px;border-radius:50%;border:none;background:#0f172a;color:#cbd5e1;font-size:15px;cursor:pointer;">✕</button>
        </div>
        <input id="input-search-warga-modal" type="text" placeholder="Ketik @username, nama, atau kecamatan..." style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:12px;border:1px solid #334155;background:#090d16;color:#f8fafc;font-size:13px;outline:none;margin-bottom:10px;">
        <div id="search-warga-results" style="overflow-y:auto;display:flex;flex-direction:column;gap:7px;max-height:52vh;"></div>
      </div>`;
    modal.style.display = 'flex';
    const inp = modal.querySelector('#input-search-warga-modal');
    const resEl = modal.querySelector('#search-warga-results');
    const renderList = (query) => {
      const q = (query || '').trim().toLowerCase();
      const list = registeredCitizensList.filter(c => {
        if (!c) return false;
        if (!q) return true;
        return (c.ig && String(c.ig).toLowerCase().includes(q)) ||
          (c.name && String(c.name).toLowerCase().includes(q)) ||
          (c.kecamatan && String(c.kecamatan).toLowerCase().includes(q));
      }).slice(0, 30);
      if (list.length === 0) {
        resEl.innerHTML = '<div style="text-align:center;padding:18px;color:#94a3b8;font-size:12.5px;">Warga tidak ditemukan.</div>';
        return;
      }
      resEl.innerHTML = list.map((c, idx) => `
        <button data-idx="${idx}" class="sw-item" style="width:100%;text-align:left;padding:9px 11px;border-radius:12px;border:1px solid #334155;background:rgba(15,23,42,0.75);color:#f8fafc;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="min-width:0;">
            <div style="font-size:13px;font-weight:800;color:#7dd3fc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.emoji || '🧑'} ${c.ig || c.name}</div>
            <div style="font-size:11px;color:#94a3b8;">${c.name || '-'} • Kec. ${c.kecamatan || 'Bandung'}</div>
          </div>
          <span style="font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:999px;background:rgba(56,189,248,0.16);color:#bae6fd;flex-shrink:0;">LVL ${c.level || 1}</span>
        </button>`).join('');
      resEl.querySelectorAll('.sw-item').forEach(btn => {
        btn.onclick = () => {
          const target = list[Number(btn.dataset.idx)];
          modal.style.display = 'none';
          if (target) {
            showCitizenSpeech(target, true);
            showToast('Menyorot ' + (target.ig || target.name) + ' ✨');
          }
        };
      });
    };
    renderList('');
    inp.addEventListener('input', () => renderList(inp.value));
    modal.querySelector('#btn-close-search-warga').onclick = () => { modal.style.display = 'none'; };
    setTimeout(() => inp.focus(), 60);
  };

  function applyBatterySaverState(isOn) {
    window.pirakuPotatoMode = !!isOn;
    document.body.classList.toggle('piraku-anti-lag', !!isOn);
    if (typeof renderer !== 'undefined' && renderer) {
      renderer.setPixelRatio(isOn ? 0.75 : Math.min(window.devicePixelRatio, isPirakuMobile ? 1.1 : 1.35));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      if (renderer.shadowMap) {
        renderer.shadowMap.enabled = !isOn;
        renderer.shadowMap.autoUpdate = false;
        renderer.shadowMap.needsUpdate = true;
      }
    }
    const badge = document.getElementById('battery-saver-badge');
    if (badge) {
      badge.innerText = isOn ? 'ON' : 'OFF';
      badge.style.background = isOn ? 'rgba(34,197,94,0.24)' : 'rgba(148,163,184,0.22)';
      badge.style.color = isOn ? '#4ade80' : '#cbd5e1';
    }
    const hudBtn = document.getElementById('btn-hud-battery');
    if (hudBtn) {
      hudBtn.innerHTML = isOn ? '<span>⚡ Anti Lag: ON</span>' : '<span>⚡ Anti Lag: OFF</span>';
      hudBtn.style.borderColor = isOn ? 'rgba(74,222,128,0.75)' : '';
      hudBtn.style.color = isOn ? '#4ade80' : '';
    }
  }
  window.toggleBatterySaverMode = function() {
    const next = localStorage.getItem('piraku_low_power') !== '1';
    localStorage.setItem('piraku_low_power', next ? '1' : '0');
    applyBatterySaverState(next);
    showToast(next ? '⚡ Mode Anti Lag aktif (grafis ringan)' : '✨ Mode Grafis Normal aktif');
  };
  setTimeout(() => { applyBatterySaverState(localStorage.getItem('piraku_low_power') === '1'); }, 300);

  window.toggleCleanHudMode = function() {
    const active = document.body.classList.toggle('piraku-clean-hud');
    let exitBtn = document.getElementById('piraku-exit-clean-btn');
    if (active) {
      if (!exitBtn) {
        exitBtn = document.createElement('button');
        exitBtn.id = 'piraku-exit-clean-btn';
        exitBtn.innerHTML = '👁️ Tampilkan HUD';
        exitBtn.onclick = () => window.toggleCleanHudMode();
        document.body.appendChild(exitBtn);
      }
      exitBtn.style.display = 'inline-flex';
      showToast('🙈 Mode Layar Bersih aktif');
    } else if (exitBtn) {
      exitBtn.style.display = 'none';
    }
  };

  window.openGuideModal = function() {
    let modal = document.getElementById('piraku-guide-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'piraku-guide-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.75);backdrop-filter:blur(7px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;';
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="width:100%;max-width:410px;background:linear-gradient(180deg,#0f172a,#1e293b);border:1.5px solid rgba(56,189,248,0.45);border-radius:20px;padding:18px;color:#f8fafc;box-shadow:0 22px 50px rgba(0,0,0,0.78);max-height:84dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div>
            <div style="font-size:10px;color:#38bdf8;font-weight:800;letter-spacing:.7px;">BUKU SAKU WARGA BANDUNG</div>
            <div style="font-size:16px;font-weight:800;">❓ Panduan &amp; Kontrol Kota</div>
          </div>
          <button id="btn-close-guide" style="width:30px;height:30px;border-radius:50%;border:none;background:#0f172a;color:#cbd5e1;font-size:15px;cursor:pointer;">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:9px;font-size:11.8px;line-height:1.48;color:#cbd5e1;">
          <div style="padding:10px 12px;border-radius:12px;background:rgba(15,23,42,0.75);border:1px solid #334155;">
            <b style="color:#7dd3fc;">🕹️ Kontrol Gerak &amp; Kamera</b><br>
            • <b>Jalan</b>: Geser <b>Joystick</b> di kiri bawah (HP) atau tekan <b>W A S D</b> (PC).<br>
            • <b>Lompat</b>: Tekan tombol <b>🦘</b> di kanan bawah (HP) atau <b>Space</b> (PC).<br>
            • <b>Kamera di HP</b>: Geser layar dengan jari kanan sambil jalan pakai joystick kiri (saat pakai analog, zoom otomatis dikunci agar kamera tidak ikut nge-zoom); cubit 2 jari saat diam untuk zoom.<br>
            • <b>Kamera di PC</b>: Drag <b>Klik Kanan</b> (atau Klik Kiri) untuk putar kamera, <b>Scroll</b> untuk zoom, atau tekan <b>Q / E</b> &amp; <b>Panah Kiri/Kanan</b> untuk putar halus sambil jalan.<br>
            • <b>Reset Kamera</b>: Tekan <b>R</b> (PC) atau klik <b>🎥 Reset Cam</b> di kanan layar untuk meluruskan kamera ke belakang karakter.
          </div>
          <div style="padding:10px 12px;border-radius:12px;background:rgba(15,23,42,0.75);border:1px solid #334155;">
            <b style="color:#c084fc;">🪪 Akun Warga, KTP &amp; Tujuan Main</b><br>
            • Ketuk <b>+ Masuk / Daftar</b> (atau <b>@username LVL</b>) di kanan atas untuk membuat E-KTP, ganti pakaian/warna karakter, atau logout.<br>
            • Warga ber-KTP otomatis spawn di komplek kecamatannya masing-masing (atau Pusat Kota untuk Bandung Wetan).
          </div>
          <div style="padding:10px 12px;border-radius:12px;background:rgba(15,23,42,0.75);border:1px solid #334155;">
            <b style="color:#4ade80;">🎯 Panduan Misi, Hunian 3D &amp; Pemilu</b><br>
            • Buka tab <b>MISI</b> di bawah untuk cek daftar misi harian: <b>Absen Harian</b>, <b>Jalan Keliling Kota</b>, <b>Sapa Warga</b>, <b>Naik Angkot/Ojol</b>, &amp; <b>Mancing</b>.<br>
            • Setiap misi selesai memberi <b>Kunci (🔑)</b>, <b>Koin (🪙)</b>, &amp; <b>XP</b>. Kumpulkan <b>3 Kunci 🔑 + 100 🪙</b> untuk membangun <b>Rumah 3D</b> di kavling kecamatanmu (upgrade hingga <b>Villa Sultan Lv.4</b>)!<br>
            • Jika 36 kavling tapak di kecamatan penuh, kamu otomatis masuk <b>Tower Apartemen</b> dan bisa ikut patungan upgrade tower.<br>
            • Buka tab <b>PEMILU</b> untuk memilih atau mencalonkan diri jadi <b>Camat</b> (minimal Lv.2).
          </div>
          <div style="padding:10px 12px;border-radius:12px;background:rgba(15,23,42,0.75);border:1px solid #334155;">
            <b style="color:#38bdf8;">🎣 Mancing 3D &amp; Mini-Game (Tab GAME)</b><br>
            • Pergi ke <b>Danau Taman Lansia</b> (Timur Gedung Sate, ikuti garis biru di minimap) lalu ketuk tombol <b>🎣 Mancing di sini</b>.<br>
            • Tangkap 40 jenis ikan langka, jual hasil tangkapan untuk <b>Koin</b> melimpah, beli joran lebih kuat (hingga <b>Joran Kristal &amp; Naga</b>), atau klik <b>Pamer Ikan</b>!<br>
            • Buka tab <b>GAME</b> untuk main <b>Kurir Ojol 3D</b>, <b>Balap Gasibu 3D</b>, &amp; mini-game Arcade lainnya.
          </div>
          <div style="padding:10px 12px;border-radius:12px;background:rgba(15,23,42,0.75);border:1px solid #334155;">
            <b style="color:#fde047;">🪙 Toko Kota, Kendaraan &amp; Gelar Sultan</b><br>
            • Ketuk pill <b>🪙 Toko</b> di bawah minimap untuk <b>Sewa (10 menit)</b> atau <b>Beli Permanen</b> kendaraan (Skateboard, Sepeda Boseh, Skuter, <b>Vespa Klasik</b>), outfit/sayap neon, <b>Megafon</b>, atau <b>Billboard LED Gasibu</b>.<br>
            • Kumpulkan koin untuk naik gelar hingga <b>Sultan Kecamatan</b>, <b>🦁 Sultan Bandung</b>, <b>🦅 Sultan Jabar</b>, sampai <b>🔱 Sultan Indo</b>!
          </div>
          <div style="padding:10px 12px;border-radius:12px;background:rgba(15,23,42,0.75);border:1px solid #334155;">
            <b style="color:#fda4af;">💬 Sosial, Audio &amp; Menu Cepat (⋯)</b><br>
            • Ketuk karakter warga lain untuk <b>👋 Lambai</b> atau <b>❤️ Setuju</b>, pakai <b>Obrolan</b> untuk chat realtime, dan tombol <b>Mic</b> untuk Voice Chat jarak dekat.<br>
            • Menu <b>⋯</b> di kanan atas berisi: <b>🔍 Cari Warga</b>, <b>🏆 Peringkat</b>, <b>🙈 Mode Layar Bersih</b>, &amp; <b>📣 Lapor Bug/Saran</b>. Di kanan layar tersedia tombol <b>⚡ Anti Lag</b> &amp; <b>🎥 Reset Cam</b>.
          </div>
        </div>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#btn-close-guide').onclick = () => { modal.style.display = 'none'; };
  };

  window.openFeedbackModal = function() {
    let modal = document.getElementById('piraku-feedback-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'piraku-feedback-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.75);backdrop-filter:blur(7px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;';
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="width:100%;max-width:380px;background:linear-gradient(180deg,#0f172a,#1e293b);border:1.5px solid rgba(250,204,21,0.45);border-radius:20px;padding:18px;color:#f8fafc;box-shadow:0 22px 50px rgba(0,0,0,0.78);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:16px;font-weight:800;">📣 Masukan &amp; Lapor Bug</div>
          <button id="btn-close-fb" style="width:30px;height:30px;border-radius:50%;border:none;background:#0f172a;color:#cbd5e1;font-size:15px;cursor:pointer;">✕</button>
        </div>
        <select id="fb-type" style="width:100%;padding:9px 11px;border-radius:10px;border:1px solid #334155;background:#090d16;color:#f8fafc;font-size:12.5px;margin-bottom:8px;">
          <option value="bug">🐞 Lapor Bug / Error</option>
          <option value="saran">💡 Saran Fitur Baru</option>
        </select>
        <textarea id="fb-text" rows="4" placeholder="Tulis bug yang kamu temui atau saran fitur..." style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:12px;border:1px solid #334155;background:#090d16;color:#f8fafc;font-size:12.5px;resize:vertical;outline:none;margin-bottom:10px;"></textarea>
        <button id="btn-send-fb" style="width:100%;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:13px;font-weight:800;cursor:pointer;margin-bottom:8px;">Kirim Masukan ✉️</button>
        <a href="https://www.instagram.com/pirakubdg" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;font-size:11.5px;color:#7dd3fc;text-decoration:none;font-weight:700;">Atau DM langsung ke @pirakubdg ↗</a>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#btn-close-fb').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#btn-send-fb').onclick = async () => {
      const btn = modal.querySelector('#btn-send-fb');
      const msg = (modal.querySelector('#fb-text').value || '').trim();
      if (!msg) { showToast('Tulis pesan dulu ya!'); return; }
      const tipe = modal.querySelector('#fb-type').value;
      const pengirim_ig = localStorage.getItem('piraku_my_ig') || 'tamu';
      const kecamatan = localStorage.getItem('piraku_my_kec') || 'Bandung Wetan';
      btn.disabled = true;
      btn.innerText = 'Mengirim...';
      let savedDb = false;
      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
          const { error } = await supabaseClient.from('laporan_warga').insert([{ tipe, pesan: msg, pengirim_ig, kecamatan }]);
          if (!error) savedDb = true;
        } catch (e) {}
      }
      try {
        const logs = JSON.parse(localStorage.getItem('piraku_feedback_logs') || '[]');
        logs.push({ tipe, msg, pengirim_ig, kecamatan, savedDb, at: new Date().toISOString() });
        localStorage.setItem('piraku_feedback_logs', JSON.stringify(logs.slice(-20)));
      } catch (e) {}
      modal.style.display = 'none';
      showToast(savedDb ? 'Laporan terkirim ke Supabase! Terima kasih 🙌' : 'Tersimpan lokal (cek tabel laporan_warga) 🙌');
    };
  };

  // ================= SISTEM WARDROBE / GANTI KARAKTER =================
  let editRole = "Barista", editEmoji = "☕", editAcc = "none", editColor = 0x1e3a8a;

  window.openWardrobeModal = function() {
    if (!myPlayerMesh) {
      showToast("Masuk atau daftar warga dulu untuk ganti karakter! 👤");
      openJoinModal();
      return;
    }
    const c = myPlayerMesh.userData.a.c;
    editRole = c.role || "Barista";
    editAcc = c.acc || "none";
    editColor = c.color || 0x1e3a8a;

    // Sinkronisasi status selected pada tombol chip
    document.querySelectorAll(".role-chip-edit").forEach(el => {
      const isMatch = el.getAttribute("onclick") && el.getAttribute("onclick").includes(" + editRole + ");
      el.classList.toggle("selected", !!isMatch);
    });
    document.querySelectorAll(".acc-chip-edit").forEach(el => {
      const isMatch = el.getAttribute("onclick") && el.getAttribute("onclick").includes(" + editAcc + ");
      el.classList.toggle("selected", !!isMatch);
    });

    const modal = document.getElementById("wardrobe-modal");
    if (modal) {
      if (modal.parentElement !== document.body) document.body.appendChild(modal);
      modal.style.setProperty("z-index", "2147483000", "important");
      modal.style.display = "flex";
      const joy = document.getElementById("joystick-zone");
      if (joy) joy.style.visibility = "hidden";
      document.querySelectorAll('button[title="Buka Balai Obrolan Warga"], .btn-chat-fab').forEach(b => { b.style.visibility = "hidden"; });
      setTimeout(() => {
        const card = modal.querySelector(".modal-card");
        if (card) card.style.transform = "translateY(0)";
      }, 10);
    }
    if (typeof window.syncWardrobePreviewSVG === "function") window.syncWardrobePreviewSVG();
  };

  window.closeWardrobeModal = function() {
    const modal = document.getElementById("wardrobe-modal");
    if (modal) {
      modal.querySelector(".modal-card").style.transform = "translateY(100%)";
      setTimeout(() => {
        modal.style.display = "none";
        const joy = document.getElementById("joystick-zone");
        if (joy) joy.style.visibility = "visible";
        document.querySelectorAll('button[title="Buka Balai Obrolan Warga"], .btn-chat-fab').forEach(b => { b.style.visibility = "visible"; });
      }, 280);
    }
  };

  window.pickWardrobeRole = (el, r, e) => {
    document.querySelectorAll(".role-chip-edit").forEach(c => c.classList.remove("selected"));
    el.classList.add("selected");
    editRole = r; editEmoji = e;
  };
  window.pickWardrobeAcc = (el, a) => {
    document.querySelectorAll(".acc-chip-edit").forEach(c => c.classList.remove("selected"));
    el.classList.add("selected");
    editAcc = a;
  };
  window.pickWardrobeColor = (el, hex) => {
    document.querySelectorAll(".color-swatch-edit").forEach(s => s.classList.remove("selected"));
    el.classList.add("selected");
    editColor = hex;
  };

  
  window.syncWardrobePreviewSVG = function() {
    const activeColorBtn = document.querySelector("#wd-shirt-row .wd-swatch.active, #wd-color-row .wd-swatch.active");
    const activePantsBtn = document.querySelector("#wd-pants-row .wd-swatch.active");
    const activeSkinBtn = document.querySelector("#wd-skin-row .wd-swatch.active");
    const activeHairBtn = document.querySelector("#wd-hair-row .wd-pill.active");
    const activeAccBtn = document.querySelector("#wd-acc-row .wd-pill.active");
    const activeRoleBtn = document.querySelector("#wd-role-row .wd-pill.active");

    const shirtCss = activeColorBtn ? activeColorBtn.dataset.css : "#2563eb";
    const pantsCss = activePantsBtn ? activePantsBtn.dataset.css : "#1e293b";
    const skinCss = activeSkinBtn ? activeSkinBtn.dataset.css : "#c68a5c";
    const hairVal = activeHairBtn ? activeHairBtn.dataset.val : "short";
    const accVal = activeAccBtn ? activeAccBtn.dataset.val : "none";
    const roleVal = activeRoleBtn ? (activeRoleBtn.dataset.emoji + " " + activeRoleBtn.dataset.role) : "☕ Barista";

    const pvShirt = document.getElementById("pv-shirt");
    const pvArmL = document.getElementById("pv-arm-l");
    const pvArmR = document.getElementById("pv-arm-r");
    const pvLegL = document.getElementById("pv-leg-l");
    const pvLegR = document.getElementById("pv-leg-r");
    const pvSkin = document.getElementById("pv-skin");
    const pvHijab = document.getElementById("pv-hijab-back");
    const pvHairBack = document.getElementById("pv-hair-back");
    const pvHairFront = document.getElementById("pv-hair-front");
    const pvAcc = document.getElementById("pv-acc-layer");
    const pvBadge = document.getElementById("pv-role-badge");

    if (pvShirt) pvShirt.setAttribute("fill", shirtCss);
    if (pvArmL) pvArmL.setAttribute("fill", shirtCss);
    if (pvArmR) pvArmR.setAttribute("fill", shirtCss);
    if (pvLegL) pvLegL.setAttribute("fill", pantsCss);
    if (pvLegR) pvLegR.setAttribute("fill", pantsCss);
    if (pvSkin) pvSkin.setAttribute("fill", skinCss);
    if (pvBadge) pvBadge.textContent = roleVal;

    if (pvHijab) pvHijab.style.display = hairVal === "hijab" ? "block" : "none";
    if (pvHairBack) {
      if (hairVal === "bob") {
        pvHairBack.innerHTML = "<path d='M30,36 C28,58 32,70 42,72 L68,72 C78,70 82,58 80,36 Z' fill='#1c1917'/>";
      } else if (hairVal === "ponytail") {
        pvHairBack.innerHTML = "<path d='M74,28 C88,28 92,46 84,60 C79,56 76,46 74,38 Z' fill='#1c1917'/><circle cx='76' cy='31' r='4' fill='#facc15'/>";
      } else {
        pvHairBack.innerHTML = "";
      }
    }
    if (pvHairFront) {
      if (hairVal === "hijab") {
        // Hijab menutup dahi & bingkai dagu dengan rapi tanpa celah
        pvHairFront.innerHTML = "<path d='M31,39 C31,20 42,14 55,14 C68,14 79,20 79,39 C77,29 66,24 55,24 C44,24 33,29 31,39 Z' fill='#f1f5f9'/><path d='M34,53 Q55,66 76,53 Q72,70 55,72 Q38,70 34,53 Z' fill='#e2e8f0'/>";
      } else if (hairVal === "bun") {
        pvHairFront.innerHTML = "<circle cx='55' cy='15' r='9' fill='#111827'/><path d='M48,21 Q55,18 62,21' stroke='#38bdf8' stroke-width='2.5' fill='none' stroke-linecap='round'/><path d='M34,37 C34,20 44,17 55,17 C66,17 76,20 76,37 Q65,28 55,31 Q45,28 34,37 Z' fill='#111827'/>";
      } else if (hairVal === "curly") {
        pvHairFront.innerHTML = "<circle cx='35' cy='30' r='7.5' fill='#1c1917'/><circle cx='42' cy='21' r='8.5' fill='#1c1917'/><circle cx='55' cy='18' r='9.5' fill='#1c1917'/><circle cx='68' cy='21' r='8.5' fill='#1c1917'/><circle cx='75' cy='30' r='7.5' fill='#1c1917'/>";
      } else if (hairVal === "mohawk") {
        pvHairFront.innerHTML = "<path d='M35,36 C36,22 44,19 55,19 C66,19 74,22 75,36 Q65,30 55,31 Q45,30 35,36 Z' fill='#27272a'/><path d='M48,24 L52,8 L55,17 L59,7 L62,24 Z' fill='#111827'/>";
      } else if (hairVal === "bob") {
        pvHairFront.innerHTML = "<path d='M32,40 C32,19 42,16 55,16 C68,16 78,19 78,40 C79,52 77,61 73,63 C72,50 72,38 68,32 Q55,27 42,32 C38,38 38,50 37,63 C33,61 31,52 32,40 Z' fill='#1c1917'/>";
      } else if (hairVal === "ponytail") {
        pvHairFront.innerHTML = "<path d='M34,37 C34,19 44,16 55,16 C66,16 76,19 76,37 Q64,27 55,31 Q44,27 34,37 Z' fill='#1c1917'/>";
      } else {
        // Pendek rapi dengan jambul halus
        pvHairFront.innerHTML = "<path d='M34,37 C34,19 43,16 55,16 C67,16 76,19 76,37 Q66,27 56,31 Q46,27 34,37 Z' fill='#111827'/><path d='M52,18 Q59,12 65,20 Q59,21 52,18 Z' fill='#1f2937'/>";
      }
    }
    if (pvAcc) {
      if (accVal === "glasses") {
        pvAcc.innerHTML = "<circle cx='46.5' cy='40' r='5.5' fill='rgba(15,23,42,0.75)' stroke='#334155' stroke-width='1.5'/><circle cx='63.5' cy='40' r='5.5' fill='rgba(15,23,42,0.75)' stroke='#334155' stroke-width='1.5'/><line x1='52' y1='40' x2='58' y2='40' stroke='#334155' stroke-width='1.6'/>";
      } else if (accVal === "peci") {
        pvAcc.innerHTML = "<path d='M37,25 C37,16 44,14 55,14 C66,14 73,16 73,25 Z' fill='#0f172a'/>";
      } else if (accVal === "caping") {
        pvAcc.innerHTML = "<polygon points='55,6 20,24 90,24' fill='#d97706' stroke='#92400e' stroke-width='1.2'/>";
      } else if (accVal === "cat") {
        pvAcc.innerHTML = "<text x='82' y='146' font-size='18'>🐈</text>";
      } else {
        pvAcc.innerHTML = "";
      }
    }
  };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#wardrobe-modal .wd-swatch, #wardrobe-modal .wd-pill");
    if (!btn) return;
    const row = btn.parentElement;
    if (row) row.querySelectorAll(".active").forEach(el => el.classList.remove("active"));
    btn.classList.add("active");
    if (btn.dataset.hex) editColor = parseInt(btn.dataset.hex, 16);
    if (btn.dataset.role) { editRole = btn.dataset.role; editEmoji = btn.dataset.emoji || "☕"; }
    window.syncWardrobePreviewSVG();
  });

  window.saveWardrobeCustomization = async function() {
    if (!myPlayerMesh || isRidingTram) return;
    const btn = document.getElementById("btn-save-wardrobe");
    if (btn) { btn.disabled = true; btn.innerText = "Menyimpan..."; }

    const oldPos = myPlayerMesh.position.clone();
    const oldRot = myPlayerMesh.rotation.y;
    const cData = myPlayerMesh.userData.a.c;

    const selSkin = document.querySelector("#wd-skin-row .wd-swatch.active")?.dataset?.idx ?? "1";
    const selPants = document.querySelector("#wd-pants-row .wd-swatch.active")?.dataset?.idx ?? "0";
    const selHair = document.querySelector("#wd-hair-row .wd-pill.active")?.dataset?.val ?? "short";
    const selAcc = document.querySelector("#wd-acc-row .wd-pill.active")?.dataset?.val ?? editAcc ?? "none";
    const selColorHex = document.querySelector("#wd-color-row .wd-swatch.active")?.dataset?.hex;
    if (selColorHex) editColor = parseInt(selColorHex, 16);
    const composedAcc = selAcc + "|" + selSkin + "|" + selPants + "|" + selHair;
    cData.role = editRole;
    cData.acc = composedAcc;
    cData.color = editColor;
    editAcc = composedAcc;
    localStorage.setItem('piraku_my_color', String(editColor));
    localStorage.setItem('piraku_my_acc', String(editAcc));
    if (typeof window.forceBroadcastMyAppearance === 'function') window.forceBroadcastMyAppearance();

    const animIdx = animC.indexOf(myPlayerMesh);
    if (animIdx > -1) animC.splice(animIdx, 1);
    citizensGroup.remove(myPlayerMesh);

    const newMesh = createCitizenMesh(cData);
    newMesh.position.copy(oldPos);
    newMesh.rotation.y = oldRot;
    setupActivePlayer(newMesh, cData);

    const ktpRole = document.getElementById("ktp-avatar-role");
    const ktpEmoji = document.getElementById("ktp-avatar-emoji");
    if (ktpRole) ktpRole.innerText = editRole.toUpperCase();
    if (ktpEmoji) ktpEmoji.innerText = editEmoji;

    if (supabaseClient && cData.id) {
      try {
        await supabaseClient.from("warga_piraku").update({
          role: editRole,
          acc: editAcc,
          color: editColor
        }).eq("id", cData.id);
      } catch(err) {}
    }

    if (btn) { btn.disabled = false; btn.innerText = "Simpan Penampilan Baru ✨"; }
    closeWardrobeModal();
    if (typeof window.playSynthTone === "function") window.playSynthTone(780, "sine", 0.25);
    showToast("Karakter & outfit berhasil diperbarui! ✨");
  };

  
    // ================= SISTEM INTERAKSI NAIK TREM =================
  let isRidingTram = false;

  window.toggleRideTram = function(force) {
    if (!myPlayerMesh) {
      showToast("Masuk atau daftar warga dulu untuk naik trem! 🚊");
      return;
    }

    const dTr = Math.hypot(myPlayerMesh.position.x - tram.position.x, myPlayerMesh.position.z - tram.position.z);
    if (force !== true) {
      if (isRidingTram && tramDwell <= 0) { showToast('Trem masih jalan, turun di ' + nextTramStation().name + ' ya 🚊'); return; }
      if (!isRidingTram && !(tramDwell > 0 && dTr <= 9)) { showToast('Tunggu trem berhenti di halte dulu 🚊'); return; }
    }
    isRidingTram = !isRidingTram;
    const btnText = document.getElementById("tram-action-text");
    const btnIcon = document.getElementById("tram-action-icon");
    const btn = document.getElementById("btn-tram-action");

    if (isRidingTram) {
      if (btnText) btnText.innerText = "Turun di Sini";
      if (btnIcon) btnIcon.innerText = "🚶";
      if (btn) btn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";

      const a = myPlayerMesh.userData.a;
      if (a.legL) a.legL.rotation.x = 0;
      if (a.legR) a.legR.rotation.x = 0;
      if (a.armL) a.armL.rotation.x = 0;
      if (a.armR) a.armR.rotation.x = 0;

      if (typeof window.playSynthTone === "function") window.playSynthTone(750, "sine", 0.3);
      showToast("Keliling Gedung Sate, Cilaki, Cimandiri & Riau naik trem 🚊✨ Kumpulkan koin!");
    } else {
      if (btnText) btnText.innerText = "Naik Trem";
      if (btnIcon) btnIcon.innerText = "🚊";
      if (btn) btn.style.background = "linear-gradient(135deg, #2563eb, #1d4ed8)";

      const dst = tramDwell > 0 ? { x: tramSt.sx, z: tramSt.sz } : { x: tram.position.x + Math.sin(tram.rotation.y) * 3.4, z: tram.position.z + Math.cos(tram.rotation.y) * 3.4 };
      myPlayerMesh.position.set(dst.x, 0.1, dst.z);
      if (myPlayerMesh.userData.a && myPlayerMesh.userData.a.c) { myPlayerMesh.userData.a.c.x = dst.x; myPlayerMesh.userData.a.c.z = dst.z; }

      if (typeof window.playSynthTone === "function") window.playSynthTone(480, "sine", 0.2);
      showToast("Turun dari trem. Wilujeng jalan-jalan kembali!");
    }
  };

  function nextTramStation() {
    let best = STATIONS[0], bd = 2;
    STATIONS.forEach(st => { const d = (st.t - tramT + 1) % 1; if (d > 1e-4 && d < bd) { bd = d; best = st; } });
    return best;
  }
  window.onTramArrive = st => {
    if (!isRidingTram) return;
    showToast('🚊 Tiba di ' + st.name + ' — ketuk "Turun" kalau mau keluar');
    if (window.playSynthTone) window.playSynthTone(660, 'sine', 0.25);
  };

  function updateTramInteraction(delta) {
    const tramBtn = document.getElementById("btn-tram-action");
    if (tramBtn) tramBtn.style.display = "none";
    isRidingTram = false;
  }

  // ================= INTERAKSI QUEST TREM 3D (tram.glb) =================
  // Deteksi jarak pemain <-> objek trem.glb, tampilkan Interaction Prompt lewat
  // window.PirakuRPG (js/rpg-ui.js), lalu saat E / prompt di-tap jalankan dialog
  // window.PIRAKU_QUESTS dan perbarui Mini Quest Tracker (rpg-ui.js) + Supabase
  // lewat window.PirakuQuestProgress (js/multiplayer.js).
  const TRAM_TALK_RANGE = 9;      // meter (dunia simulasi) — cakupan trem + halte
  const TRAM_BOARD_RANGE = 9;     // harus sama dengan ambang tombol "Naik Trem"

  // Terbitkan jembatan ke sistem quest/save (dipakai js/rpg-ui.js & js/multiplayer.js).
  window.PirakuGameBridge = {
  /** Ambil teks status terkini untuk Mini Quest Tracker. */
  getTrackerSnapshot: function () {
    const t = document.getElementById("quest-current-title");
    const d = document.getElementById("quest-distance-text");
    const r = document.getElementById("quest-reward-text");
    const c = document.getElementById("quest-progress-count");
    return {
      title: t ? t.textContent.trim() : "",
      meta: [d && d.textContent.trim(), r && r.textContent.trim()].filter(Boolean).join(" · "),
      count: c ? c.textContent.trim() : ""
    };
  },
  /** Status quest harian aktif: progress ring (0..1) + jumlah selesai/total. */
  getDailyProgress: function () {
    if (!activeQuestSystem || !activeQuestSystem.quests) return null;
    const qs = activeQuestSystem.quests;
    const done = qs.filter(q => q.isCompleted).length;
    return { done: done, total: qs.length, progress: qs.length ? done / qs.length : 0 };
  },
  /** Tandai quest harian selesai saat progres dimuat dari Supabase. */
  markDailyCompleted: function (ids) {
    if (!activeQuestSystem || !activeQuestSystem.quests || !Array.isArray(ids)) return 0;
    let n = 0;
    activeQuestSystem.quests.forEach(q => {
      if (ids.indexOf(q.id) === -1 || q.isCompleted) return;
      q.isCompleted = true;
      q.timer = 0;
      if (q.mesh) {
        if (q.mesh.parent) q.mesh.parent.remove(q.mesh);
        q.mesh = null;
      }
      n++;
    });
    if (n) activeQuestSystem.updateTrackerCard(myPlayerMesh ? myPlayerMesh.position : null);
    return n;
  },
  /** Tambahkan koin hasil quest (dipanggil saat progres quest disinkronkan). */
  addCoins: function (n) {
    const add = Math.max(0, parseInt(n, 10) || 0);
    if (!add) return coinCount;
    coinCount += add;
    localStorage.setItem('piraku_coins', coinCount);
    if (coinHud) coinHud.textContent = '🪙 ' + coinCount;
    return coinCount;
  },
  setCoins: function (n) {
    const v = Math.max(0, parseInt(n, 10) || 0);
    coinCount = v;
    localStorage.setItem('piraku_coins', coinCount);
    if (coinHud) coinHud.textContent = '🪙 ' + coinCount;
    return coinCount;
  },
  getCoins: function () { return coinCount; },
  /** Pemain sedang di dekat trem? */
  isNearTram: function (range) {
    if (!myPlayerMesh) return false;
    const lim = typeof range === 'number' ? range : TRAM_TALK_RANGE;
    return Math.hypot(myPlayerMesh.position.x - tram.position.x, myPlayerMesh.position.z - tram.position.z) <= lim;
  },
  /** Bawa pemain ke samping trem (muat progres: lanjutkan quest di halte). */
  teleportToTram: function () {
    if (!myPlayerMesh) return false;
    const dst = tramDwell > 0
      ? { x: tramSt.sx, z: tramSt.sz }
      : { x: tram.position.x + Math.sin(tram.rotation.y) * 3.4, z: tram.position.z + Math.cos(tram.rotation.y) * 3.4 };
    myPlayerMesh.position.set(dst.x, 0.1, dst.z);
    if (myPlayerMesh.userData.a && myPlayerMesh.userData.a.c) {
      myPlayerMesh.userData.a.c.x = dst.x;
      myPlayerMesh.userData.a.c.z = dst.z;
    }
    return true;
  },
  getTramState: function () {
    return { dwell: tramDwell, station: tramSt ? tramSt.name : null, riding: isRidingTram };
  }
  };

  function questData() {
    return (typeof window !== 'undefined' && window.PIRAKU_QUESTS) || null;
  }

  function questProgressStore() {
    return (typeof window !== 'undefined' && window.PirakuQuestProgress) || null;
  }

  /**
   * Sapa trem: dialog utama dari js/quests.js. Baris pertama sudah terbaca =
   * quest diterima (accepted); sudah naik trem = in_progress (dihitung dari
   * STATIONS[0] → STATIONS[3]); turun di halte tujuan = completed + hadiah.
   */
  function talkToTram() {
    const Q = questData();
    const rpg = (typeof window !== 'undefined' && window.PirakuRPG) || null;
    if (!Q || !Q.mainQuest || !rpg || !rpg.dialog) {
      if (typeof window.showToast === "function") window.showToast("Trem klasik Bandung keur ngaliwat! 🚊");
      return;
    }
    const quest = Q.mainQuest;
    const store = questProgressStore();
    const prev = (store && store.getLocal && store.getLocal(quest.id)) || null;
    const prevStatus = prev ? prev.status : "not_started";

    rpg.dialog.openMainQuest();

    if (prevStatus === "not_started" || prevStatus === "accepted") {
      if (store && store.save) store.save(quest.id, "accepted");
      if (typeof window.showToast === "function") {
        window.showToast("Quest aktif: " + quest.title + " 🚊");
      }
    } else if (prevStatus === "completed") {
      if (typeof window.showToast === "function") {
        window.showToast("Quest ieu parantos réngsé — hatur nuhun tos naek trem! ✅");
      }
    } else if (prevStatus === "in_progress") {
      if (typeof window.showToast === "function") {
        window.showToast("Trem masih dina perjalanan — turun di " + quest.finishPoint.name + " 🚊");
      }
    }
  }

  function updateTramQuestInteraction(delta) {
    return;
    // Hanya saat trem tampil (mode reborn) dan pemain bisa bergerak.
    if (curMode !== 'reborn' || !myPlayerMesh) return;
    const rpg = (typeof window !== 'undefined' && window.PirakuRPG) || null;
    if (!rpg || !rpg.prompt) return;

    const prompt = rpg.prompt;
    const d = Math.hypot(myPlayerMesh.position.x - tram.position.x, myPlayerMesh.position.z - tram.position.z);
    // Kehadiran objek trem.glb (bukan cuma titik rute) ikut diverifikasi bila model termuat.
    const near = d <= TRAM_TALK_RANGE || isTramGlbNear();
    const dialogOpen = rpg.dialog && rpg.dialog.open_;
    // Jangan timpa prompt NPC/trem lain; hanya kelola prompt bertanda tremQuest milik kita.
    const ownsPrompt = !prompt.current || prompt.current.tramQuest;

    if (isRidingTram) {
      const arrived = tramDwell > 0;
      syncQuestFromRide(arrived);
      prompt.showForTram(arrived ? "exit" : "riding", arrived ? (tramSt && tramSt.name) : nextTramStation().name);
      if (prompt.current) prompt.current.tramQuest = true;
      return;
    }

    if (dialogOpen) {
      // Dialog trem sedang terbuka: sembunyikan prompt agar tidak menutupi dialog.
      if (ownsPrompt && prompt.current && prompt.current.kind === "tram") prompt.hide();
      return;
    }

    if (!near) {
      if (ownsPrompt && prompt.current && prompt.current.kind === "tram") prompt.hide();
      return;
    }
    if (!ownsPrompt) return;

    prompt.showForTram("board", tramSt ? tramSt.name : "Halte Gasibu");
    if (prompt.current) {
      // Satu baris penjelas: E/TAP menjalankan dialog quest trem klasik.
      prompt.current.sub = "Tekan " + rpg.keyLabel + " untuk ngobrol jeung Kang Undang & naik trem";
      prompt.current.tramQuest = true;
      prompt.current.onQuestAction = talkToTram;
    }
  }

  /** Progres quest dari perjalanan trem: accepted → in_progress → completed. */
  function syncQuestFromRide(arrived) {
    if (!arrived) return;
    const Q = questData();
    const store = questProgressStore();
    if (!Q || !Q.mainQuest || !store || !store.save) return;
    const quest = Q.mainQuest;
    const cur = store.getLocal(quest.id);
    const status = cur ? cur.status : 'not_started';
    if (status !== 'accepted' && status !== 'in_progress') return;
    const atEnd = !!(tramSt && quest.finishPoint && tramSt.name === quest.finishPoint.name);
    const reward = atEnd ? ((quest.reward && quest.reward.coins) || 0) : 0;
    const next = atEnd ? 'completed' : 'in_progress';
    if (cur && cur.status === next) return;
    store.save(quest.id, next, reward);
    if (atEnd && typeof window.showToast === 'function') {
      window.showToast('🎉 Quest "' + quest.title + '" réngsé! +' + reward + ' koin & tiket kenangan');
    }
  }

  // Opsional: cek bounding sphere objek GLB trem terhadap pemain.
  function isTramGlbNear() {
    try {
      const glb = tram.userData && tram.userData.glbRoot;
      if (!glb || typeof THREE === 'undefined' || typeof THREE.Box3 !== 'function') return false;
      const box = new THREE.Box3().setFromObject(glb);
      if (typeof box.isEmpty === 'function' && box.isEmpty()) return false;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const dx = myPlayerMesh.position.x - sphere.center.x;
      const dz = myPlayerMesh.position.z - sphere.center.z;
      return Math.sqrt(dx * dx + dz * dz) <= sphere.radius + 2.5;
    } catch (e) { return false; }
  }

  window.talkToTramQuest = talkToTram;

  
  // ================= SISTEM TRIGGER ZONE ALA BRUNO SIMON =================
  class DistrictTriggerZone {
    constructor(id, title, subtitle, minX, maxX, minZ, maxZ, toneFreq) {
      this.id = id;
      this.title = title;
      this.subtitle = subtitle;
      this.minX = minX;
      this.maxX = maxX;
      this.minZ = minZ;
      this.maxZ = maxZ;
      this.toneFreq = toneFreq;
      this.isInside = false;
    }

    check(pos) {
      const inside = pos.x >= this.minX && pos.x <= this.maxX && pos.z >= this.minZ && pos.z <= this.maxZ;
      if (inside && !this.isInside) {
        this.isInside = true;
        this.onEnter();
      } else if (!inside && this.isInside) {
        this.isInside = false;
      }
    }

    onEnter() {
      const banner = document.getElementById("district-banner");
      const titleEl = document.getElementById("district-title");
      const subEl = document.getElementById("district-subtitle");
      if (!banner || !titleEl || !subEl) return;

      titleEl.innerText = this.title;
      subEl.innerText = this.subtitle;

      banner.style.opacity = "1";
      banner.style.transform = "translateX(-50%) translateY(0px)";

      if (typeof window.playSynthTone === "function") {
        window.playSynthTone(this.toneFreq || 620, "sine", 0.35);
      }

      clearTimeout(window.__districtTimer);
      window.__districtTimer = setTimeout(() => {
        banner.style.opacity = "0";
        banner.style.transform = "translateX(-50%) translateY(-25px)";
      }, 3500);
    }
  }

  const DISTRICT_ZONES = [
    new DistrictTriggerZone("gasibu", "Lapangan Gasibu & Gedung Sate", "Pusat Pemerintahan & Ruang Publik Hijau", -20, 20, -18, 20, 520),
    new DistrictTriggerZone("pasupati", "Flyover Pasupati & Kolong", "Ikon Penghubung Kota & Koridor Silaturahmi", -45, -20, -32, -18, 580),
    new DistrictTriggerZone("cikapayang", "Kawasan Kreatif Dago & Cikapayang", "Skatepark Kolong, Street Art & Distro Musik", -75, -45, -55, -25, 660),
    new DistrictTriggerZone("lansia", "Taman Lansia & Jalur Cisangkuy", "Oase Teduh Kolam Air & Tenda Kuliner Khas", 20, 50, -25, 5, 740),
    new DistrictTriggerZone("saparua", "Kompleks Olahraga & GOR Saparua", "Trek Lari Merah Bata, Komunitas & Panggung Indie", 35, 75, 8, 45, 820)
  ];

  function updateDistrictTriggers(playerPos) {
    if (!playerPos) return;
    DISTRICT_ZONES.forEach(zone => zone.check(playerPos));
  }

  // ================= KONTROL PEMAIN & FISIKA LOMPAT =================
  let playerVelY = 0;
  let isGrounded = true;
  const gravity = -32.0;
  const jumpForce = 11.5;
  const BASE_Y = 0.1;

  window.playerJump = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!myPlayerMesh || !isGrounded) return;
    playerVelY = jumpForce;
    isGrounded = false;
    if (typeof window.playSynthTone === "function") window.playSynthTone(580, "sine", 0.18);
  };

  function initJumpButton() {
    const jumpBtn = document.getElementById("btn-jump-mobile");
    if (!jumpBtn) return;
    jumpBtn.addEventListener("touchstart", function(e) { window.playerJump(e); }, { passive: false });
    jumpBtn.addEventListener("mousedown", function(e) { window.playerJump(e); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initJumpButton);
  } else {
    initJumpButton();
  }

  function isTypingInField(e) {
    const t = (e && e.target) || document.activeElement;
    return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable));
  }

  window.addEventListener("keydown", e => {
    if (isTypingInField(e)) return;
    if (e.code === "Space" || e.key === " " || e.keyCode === 32) {
      e.preventDefault();
      window.playerJump();
    }
  });

  const keys = { w: false, a: false, s: false, d: false, q: false, e: false, arrowleft: false, arrowright: false };
  window.addEventListener('keydown', e => {
    if (isTypingInField(e)) { keys.w = keys.a = keys.s = keys.d = keys.q = keys.e = keys.arrowleft = keys.arrowright = false; return; }
    const k = (e.key || '').toLowerCase();
    if (k === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (typeof window.resetPirakuCamera === 'function') window.resetPirakuCamera();
      return;
    }
    if (keys.hasOwnProperty(k)) keys[k] = true;
  });
  window.addEventListener('keyup', e => {
    const k = (e.key || '').toLowerCase();
    if (keys.hasOwnProperty(k)) keys[k] = false;
  });

  window.resetPirakuCamera = function () {
    window.pirakuCameraTrackTarget = null;
    const stopBtn = document.getElementById('piraku-stop-track-btn');
    if (stopBtn) stopBtn.style.display = 'none';
    if (typeof controls === 'undefined' || !controls) return;
    if (myPlayerMesh) {
      const yaw = myPlayerMesh.rotation.y || 0;
      const dist = 12;
      const targetX = myPlayerMesh.position.x;
      const targetY = myPlayerMesh.position.y + 1.3;
      const targetZ = myPlayerMesh.position.z;
      const camX = targetX - Math.sin(yaw) * dist;
      const camY = targetY + 5.2;
      const camZ = targetZ - Math.cos(yaw) * dist;
      if (typeof gsap !== 'undefined') {
        gsap.to(controls.target, { x: targetX, y: targetY, z: targetZ, duration: 0.45, ease: 'power2.out' });
        gsap.to(cam.position, { x: camX, y: camY, z: camZ, duration: 0.45, ease: 'power2.out' });
      } else {
        controls.target.set(targetX, targetY, targetZ);
        cam.position.set(camX, camY, camZ);
      }
      showToast('Kamera diluruskan ke belakang karakter 🎥');
    } else {
      controls.target.set(0, 3, 5);
      cam.position.set(-26, 26, -55);
      showToast('Kamera direset 🎥');
    }
  };

  const joystickZone = document.getElementById('joystick-zone');
  const joystickKnob = document.getElementById('joystick-knob');
  let joyVector = { x: 0, y: 0 };
  let joyActive = false;
  let joyCenter = { x: 0, y: 0 };

  if (joystickZone) {
    let activeJoyTouchId = null;
    let activeCamTouchId = null;
    let camLastX = 0;
    let camLastY = 0;
    const camOrbitOffset = new THREE.Vector3();
    const camOrbitSpherical = new THREE.Spherical();
    joystickZone.style.touchAction = 'none';
    joystickZone.addEventListener('pointerdown', e => e.stopPropagation());

    function isCanvasTouchTarget(target) {
      if (!target || typeof target.closest !== 'function') return false;
      if (target === renderer.domElement || target.id === 'webgl-canvas') return true;
      return !target.closest('button, input, textarea, select, a, #joystick-zone, #minimap-box, #hud-chat-box, .modal-card, .modal-overlay');
    }

    function rotateCameraByDelta(dx, dy) {
      if (typeof controls === 'undefined' || !controls || typeof cam === 'undefined' || !cam) return;
      camOrbitOffset.copy(cam.position).sub(controls.target);
      camOrbitSpherical.setFromVector3(camOrbitOffset);
      const speed = (controls.rotateSpeed || 0.85) * 0.007;
      camOrbitSpherical.theta -= dx * speed;
      camOrbitSpherical.phi -= dy * speed;
      const maxPhi = controls.maxPolarAngle || (Math.PI / 2.08);
      camOrbitSpherical.phi = Math.max(0.15, Math.min(maxPhi, camOrbitSpherical.phi));
      camOrbitSpherical.makeSafe();
      camOrbitOffset.setFromSpherical(camOrbitSpherical);
      cam.position.copy(controls.target).add(camOrbitOffset);
      cam.lookAt(controls.target);
    }

    function handleJoyMoveClient(clientX, clientY) {
      let dx = clientX - joyCenter.x;
      let dy = clientY - joyCenter.y;
      const maxR = 32;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      if (joystickKnob) joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      const normX = Math.abs(dx) < 4 ? 0 : dx / maxR;
      const normY = Math.abs(dy) < 4 ? 0 : dy / maxR;
      joyVector = { x: normX, y: normY };
    }

    joystickZone.addEventListener('touchstart', e => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.changedTouches[0];
      activeJoyTouchId = t.identifier;
      joyActive = true;
      if (typeof controls !== 'undefined' && controls) {
        controls.enableZoom = false;
        controls.enabled = false;
      }
      // Jika jari lain sudah menyentuh layar sebelumnya, langsung lanjutkan sebagai putar kamera
      if (activeCamTouchId === null && e.touches) {
        for (let i = 0; i < e.touches.length; i++) {
          const other = e.touches[i];
          if (other.identifier !== activeJoyTouchId && isCanvasTouchTarget(other.target)) {
            activeCamTouchId = other.identifier;
            camLastX = other.clientX;
            camLastY = other.clientY;
            break;
          }
        }
      }
      const rect = joystickZone.getBoundingClientRect();
      joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      handleJoyMoveClient(t.clientX, t.clientY);
    }, { passive: false });

    // Tangkap sentuhan jari kedua di area layar mana pun di luar UI saat analog sedang ditahan
    window.addEventListener('touchstart', e => {
      if (!joyActive || activeCamTouchId !== null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== activeJoyTouchId && isCanvasTouchTarget(t.target)) {
          activeCamTouchId = t.identifier;
          camLastX = t.clientX;
          camLastY = t.clientY;
          break;
        }
      }
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (!joyActive && activeCamTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (joyActive && activeJoyTouchId !== null && t.identifier === activeJoyTouchId) {
          handleJoyMoveClient(t.clientX, t.clientY);
        } else if (activeCamTouchId !== null && t.identifier === activeCamTouchId) {
          const dx = t.clientX - camLastX;
          const dy = t.clientY - camLastY;
          camLastX = t.clientX;
          camLastY = t.clientY;
          rotateCameraByDelta(dx, dy);
        }
      }
    }, { passive: true });

    function endJoyTouch(e) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const id = e.changedTouches[i].identifier;
        if (activeCamTouchId !== null && id === activeCamTouchId) {
          activeCamTouchId = null;
        }
        if (joyActive && id === activeJoyTouchId) {
          activeJoyTouchId = null;
          joyActive = false;
          if (typeof controls !== 'undefined' && controls) {
            const wasDamping = controls.enableDamping;
            controls.enableDamping = false;
            controls.enableZoom = true;
            controls.enabled = true;
            controls.update();
            controls.enableDamping = wasDamping;
          }
          if (joystickKnob) joystickKnob.style.transform = 'translate(0, 0)';
          joyVector = { x: 0, y: 0 };
        }
      }
    }

    window.addEventListener('touchend', endJoyTouch, { passive: true });
    window.addEventListener('touchcancel', endJoyTouch, { passive: true });
  }

  const moveForwardVec = new THREE.Vector3();
  const moveRightVec = new THREE.Vector3();
  const moveFinalVec = new THREE.Vector3();

  
  function getPasupatiDeckY(x, z, curY) {
    // Pelataran & tangga Monumen Perjuangan (Monju) di pusat kota (x=0, z=-35)
    if (!window.pirakuInDistrict) {
      if (Math.abs(x) <= 5.5 && Math.abs(z + 35) <= 3.25) return 0.9;
      if (Math.abs(x) <= 7.5 && Math.abs(z + 35) <= 4.75) return 0.4;
    }
    if (x < -134 || x > -22 || Math.abs(z + 26) > 3.15) return BASE_Y;
    const u = Math.max(0, Math.min(1, (x - (-132)) / (-24 - (-132))));
    const deckY = CFly.getPointAt(u).y + 0.14;
    // Hanya naik/menapak di atas jembatan jika sudah di atas dek (curY >= deckY - 1.1) atau masuk dari ujung ramp (< 1.1m)
    if (deckY <= 1.1 || curY >= deckY - 1.1) return deckY;
    return BASE_Y;
  }

  
  // ================= SISTEM COLLISION BANGUNAN & RUMAH WARGA OTOMATIS =================
  let pirakuBuildingColliders = [];
  let pirakuLastColliderScan = 0;
  window.resetPirakuColliders = function() { pirakuBuildingColliders = []; pirakuLastColliderScan = 0; };
  window.pirakuGetColliders = function() { return pirakuBuildingColliders; };

  function rebuildPirakuBuildingColliders() {
    if (!scene || typeof THREE === "undefined") return;
    scene.updateMatrixWorld(true);
    const boxes = [];
    const tmpBox = new THREE.Box3();
    const tmpSize = new THREE.Vector3();
    const tmpCenter = new THREE.Vector3();
    const localSize = new THREE.Vector3();
    const tmpScale = new THREE.Vector3();

    const dynamicRoots = new Set();
    if (typeof citizensGroup !== "undefined" && citizensGroup) dynamicRoots.add(citizensGroup);
    if (typeof tram !== "undefined" && tram) dynamicRoots.add(tram);
    if (typeof animC !== "undefined" && Array.isArray(animC)) animC.forEach(c => dynamicRoots.add(c));

    scene.traverse(obj => {
      if (!obj || !obj.isMesh || !obj.visible) return;
      const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
      if (mat && mat.transparent && (mat.opacity === undefined || mat.opacity < 0.85)) return;

      // Pastikan SELURUH parent sampai root scene benar-benar visible & bukan grup dinamis
      let p = obj;
      while (p) {
        if (p.visible === false) return;
        if (dynamicRoots.has(p) || p.userData?.a || p.userData?.isCar || p.userData?.isCoin || p.name === "piraku-shop-body-att" || p.name === "piraku-shop-head-att") return;
        p = p.parent;
      }

      // Cek ukuran lokal geometri agar objek tipis/miring (kabel/rel/garis jalan) tidak jadi kotak raksasa di ruang kosong
      if (obj.geometry) {
        if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
        if (obj.geometry.boundingBox) {
          obj.geometry.boundingBox.getSize(localSize);
          localSize.multiply(obj.getWorldScale(tmpScale));
          if (localSize.y < 1.1 || localSize.x < 0.65 || localSize.z < 0.65) return;
          if (localSize.x > 28 || localSize.z > 28) return;
        }
      }

      tmpBox.setFromObject(obj);
      if (tmpBox.isEmpty()) return;
      tmpBox.getSize(tmpSize);
      tmpBox.getCenter(tmpCenter);

      if (tmpSize.y < 1.1 || tmpSize.y > 42) return;
      if (tmpSize.x < 0.65 || tmpSize.z < 0.65) return;
      if (tmpSize.x > 28 || tmpSize.z > 28) return;
      if (tmpBox.min.y > 1.8 || tmpBox.max.y < 1.0) return;

      // Abaikan area Flyover Pasupati
      if (tmpCenter.z > -31 && tmpCenter.z < -21 && tmpBox.min.y > 1.4) return;

      boxes.push({
        minX: tmpBox.min.x,
        maxX: tmpBox.max.x,
        minZ: tmpBox.min.z,
        maxZ: tmpBox.max.z
      });
    });

    // Collider khusus: badan/sayap Gedung Sate (terlalu lebar untuk filter otomatis di atas)
    if (typeof GS_BODY !== "undefined" && GS_BODY) {
      let vis = true, q = GS_BODY;
      while (q) { if (q.visible === false) { vis = false; break; } q = q.parent; }
      if (vis) {
        tmpBox.setFromObject(GS_BODY);
        if (!tmpBox.isEmpty()) boxes.push({ minX: tmpBox.min.x, maxX: tmpBox.max.x, minZ: tmpBox.min.z, maxZ: tmpBox.max.z });
      }
    }

    // Collider khusus: dua pilar Monumen Perjuangan (x=±1.6, z=-35) & Gazebo/Dermaga/Air Terjun Taman Lansia
    if (!window.pirakuInDistrict) {
      boxes.push(
        { minX: -2.35, maxX: -0.85, minZ: -35.75, maxZ: -34.25 },
        { minX: 0.85, maxX: 2.35, minZ: -35.75, maxZ: -34.25 },
        // Gazebo Danau Taman Lansia (world 29.5, 27.5)
        { minX: 27.5, maxX: 31.5, minZ: 25.5, maxZ: 29.5 },
        // Pagar samping kiri/kanan Dermaga Taman Lansia (pintu masuk barat tetap terbuka)
        { minX: 27.5, maxX: 35.5, minZ: 14.35, maxZ: 14.75 },
        { minX: 27.5, maxX: 35.5, minZ: 17.25, maxZ: 17.65 },
        // Batu Air Terjun Taman Lansia (world 48.2, 12.8)
        { minX: 46.2, maxX: 50.2, minZ: 10.8, maxZ: 14.8 }
      );
    }

    pirakuBuildingColliders = boxes;
    pirakuLastColliderScan = performance.now();
  }

  function resolvePirakuBuildingCollision(pos, prevX, prevZ, radius = 0.48) {
    if (pirakuBuildingColliders.length === 0 || performance.now() - pirakuLastColliderScan > 60000) {
      rebuildPirakuBuildingColliders();
    }
    // Jika sedang naik di atas dek tinggi Flyover Pasupati (y > 2.4), tidak bertabrakan dengan bangunan bawah
    if (pos.y > 2.4) return;

    if (window.pirakuInDistrict) {
      const dTugu = Math.hypot(pos.x, pos.z);
      if (dTugu < 2.75) {
        const nx = dTugu > 0.001 ? pos.x / dTugu : 0;
        const nz = dTugu > 0.001 ? pos.z / dTugu : 1;
        pos.x = nx * 2.75;
        pos.z = nz * 2.75;
      }
    }

    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < pirakuBuildingColliders.length; i++) {
        const b = pirakuBuildingColliders[i];
        const minX = b.minX - radius;
        const maxX = b.maxX + radius;
        const minZ = b.minZ - radius;
        const maxZ = b.maxZ + radius;

        if (pos.x > minX && pos.x < maxX && pos.z > minZ && pos.z < maxZ) {
          // Hitung penetrasi terkecil dari 4 sisi dinding agar karakter meluncur mulus (sliding collision)
          const penLeft = pos.x - minX;
          const penRight = maxX - pos.x;
          const penTop = pos.z - minZ;
          const penBottom = maxZ - pos.z;
          const minPen = Math.min(penLeft, penRight, penTop, penBottom);

          if (minPen === penLeft) pos.x = minX;
          else if (minPen === penRight) pos.x = maxX;
          else if (minPen === penTop) pos.z = minZ;
          else pos.z = maxZ;
        }
      }
    }
  }

  let pirakuTapWalkTarget = null;
  let pirakuTapMarker = null;

  function updatePlayerMovement(delta) {
    if (!myPlayerMesh || isRidingTram) return;

    let inputForward = 0;
    let inputRight = 0;
    const speed = 8.5 * (window.pirakuSpeedMult || 1.0) * delta;

    if (keys.w) inputForward += 1;
    if (keys.s) inputForward -= 1;
    if (keys.d) inputRight += 1;
    if (keys.a) inputRight -= 1;

    if (joyActive) {
      const mobileSpeedBoost = (window.innerWidth <= 900) ? 0.85 : 0.95;
      inputForward -= joyVector.y * mobileSpeedBoost;
      inputRight += joyVector.x * mobileSpeedBoost;
    }

    // Putar kamera halus di PC pakai Q / E atau Panah Kiri / Kanan
    const camYawInput = (keys.q || keys.arrowleft ? 1 : 0) - (keys.e || keys.arrowright ? 1 : 0);
    if (camYawInput !== 0 && typeof controls !== 'undefined' && controls) {
      const ang = camYawInput * 2.1 * delta;
      const offX = cam.position.x - controls.target.x;
      const offZ = cam.position.z - controls.target.z;
      const cosA = Math.cos(ang), sinA = Math.sin(ang);
      cam.position.x = controls.target.x + offX * cosA - offZ * sinA;
      cam.position.z = controls.target.z + offX * sinA + offZ * cosA;
    }

    // === SCREEN-RELATIVE ISOMETRIC CONTROL (ANTI-PUSING) ===
    // Dorong joystick ke atas = jalan ke atas layar; kiri/kanan = jalan ke kiri/kanan layar
    cam.getWorldDirection(moveForwardVec);
    moveForwardVec.y = 0;
    moveForwardVec.normalize();

    moveRightVec.crossVectors(moveForwardVec, new THREE.Vector3(0, 1, 0)).normalize();

    moveFinalVec.set(0, 0, 0);
    moveFinalVec.addScaledVector(moveForwardVec, inputForward);
    moveFinalVec.addScaledVector(moveRightVec, inputRight);

    // Jika joystick/keyboard ditekan manual, batalkan auto-walk tap
    if (moveFinalVec.lengthSq() > 0.002 && pirakuTapWalkTarget) {
      pirakuTapWalkTarget = null;
      if (pirakuTapMarker) pirakuTapMarker.visible = false;
    }

    // Jika sedang auto-walk menuju titik Tap-to-Walk
    if (pirakuTapWalkTarget) {
      const dxT = pirakuTapWalkTarget.x - myPlayerMesh.position.x;
      const dzT = pirakuTapWalkTarget.z - myPlayerMesh.position.z;
      const distT = Math.hypot(dxT, dzT);
      if (distT < 0.45) {
        pirakuTapWalkTarget = null;
        if (pirakuTapMarker) pirakuTapMarker.visible = false;
      } else {
        moveFinalVec.set(dxT / distT, 0, dzT / distT);
        if (pirakuTapMarker && pirakuTapMarker.visible) {
          pirakuTapMarker.rotation.z += delta * 2.5;
        }
      }
    }

    const inputMag = Math.min(1.0, moveFinalVec.length());
    const hasInput = (inputMag > 0.01);
    const a = myPlayerMesh.userData.a;

    if (hasInput) {
      if (window.pirakuCameraTrackTarget && inputMag > 0.25) {
        window.pirakuCameraTrackTarget = null;
        window.pirakuActiveMinimapTarget = null;
        const stopBtn = document.getElementById('piraku-stop-track-btn');
        if (stopBtn) stopBtn.style.display = 'none';
      }
      const beforeMoveX = myPlayerMesh.position.x;
      const beforeMoveZ = myPlayerMesh.position.z;

      moveFinalVec.normalize();
      const targetRot = Math.atan2(moveFinalVec.x, moveFinalVec.z);
      let diffRot = targetRot - myPlayerMesh.rotation.y;
      while (diffRot > Math.PI) diffRot -= Math.PI * 2;
      while (diffRot < -Math.PI) diffRot += Math.PI * 2;
      myPlayerMesh.rotation.y += diffRot * Math.min(0.35, Math.min(delta, 0.05) * 10);

      const cuankiBoost = (window.pirakuSpeedBoostUntil && Date.now() < window.pirakuSpeedBoostUntil) ? 1.55 : 1.0;
      const inFishingWater = (typeof window.getPirakuFishingGroundY === "function" && window.getPirakuFishingGroundY(myPlayerMesh.position.x, myPlayerMesh.position.z) === -0.72);
      const waterSlow = inFishingWater ? 0.38 : 1.0;
      const effectiveSpeed = speed * Math.max(0.35, inputMag * 0.92) * cuankiBoost * waterSlow;
      myPlayerMesh.position.x += moveFinalVec.x * effectiveSpeed;
      myPlayerMesh.position.z += moveFinalVec.z * effectiveSpeed;

      const prevX = myPlayerMesh.position.x;
      const prevZ = myPlayerMesh.position.z;
      const prevY = myPlayerMesh.position.y;
      if (window.pirakuInDistrict) {
        // Di dalam komplek/distrik: tahan di atas lahan 110x110 (setengahnya 55, sisakan 3 margin)
        myPlayerMesh.position.x = Math.max(-52, Math.min(52, myPlayerMesh.position.x));
        myPlayerMesh.position.z = Math.max(-52, Math.min(52, myPlayerMesh.position.z));
      } else {
        myPlayerMesh.position.x = Math.max(-132, Math.min(61, myPlayerMesh.position.x));
        myPlayerMesh.position.z = Math.max(-62, Math.min(52, myPlayerMesh.position.z));
      }
      // Jika melewati batas barat kota (x < -61) via Flyover Pasupati, kunci tetap di atas koridor jembatan (-29.0 .. -23.0)
      if (myPlayerMesh.position.x < -61) {
        myPlayerMesh.position.z = Math.max(-29.0, Math.min(-23.0, myPlayerMesh.position.z));
      }
      // Jika sedang berjalan di atas dek jembatan tinggi (prevY > 1.15) & grounded, tahan di dalam parapet jembatan (-29.0 .. -23.0)
      if (isGrounded && prevY > 1.15 && myPlayerMesh.position.x < -25) {
        myPlayerMesh.position.z = Math.max(-29.0, Math.min(-23.0, myPlayerMesh.position.z));
      }

      resolvePirakuBuildingCollision(myPlayerMesh.position, prevX, prevZ, 0.48);
      // Cegah karakter tergelincir masuk air kolam saat berjalan di daratan/batu tepi kolam
      if (isGrounded && prevY >= -0.15 && typeof window.getPirakuFishingGroundY === "function" && window.getPirakuFishingGroundY(myPlayerMesh.position.x, myPlayerMesh.position.z) === -0.72) {
        myPlayerMesh.position.x = beforeMoveX;
        myPlayerMesh.position.z = beforeMoveZ;
      }
      myPlayerMesh.userData.a.c.x = myPlayerMesh.position.x;
      myPlayerMesh.userData.a.c.z = myPlayerMesh.position.z;

      // Sinkronisasi posisi kamera tepat sebelum controls.update() & renderer.render() dalam frame yang sama
      if (typeof controls !== 'undefined' && controls && controls.target) {
        const stepX = myPlayerMesh.position.x - beforeMoveX;
        const stepZ = myPlayerMesh.position.z - beforeMoveZ;
        if (Math.abs(stepX) > 0.00001 || Math.abs(stepZ) > 0.00001) {
          controls.target.x += stepX;
          controls.target.z += stepZ;
          cam.position.x += stepX;
          cam.position.z += stepZ;
        }
      }

      if (isGrounded) {
        const s = Math.sin(window.clockTime * 15);
        a.body.position.y = Math.abs(s) * 0.08;
        a.armL.rotation.x = s * 0.85;
        a.armR.rotation.x = -s * 0.85;
        if (a.legL && a.legR) {
          a.legL.rotation.x = -s * 0.95;
          a.legR.rotation.x = s * 0.95;
        }
      }
    } else if (isGrounded) {
      if (a.legL) a.legL.rotation.x *= 0.6;
      if (a.legR) a.legR.rotation.x *= 0.6;
      if (!(window.pirakuFishingSyncState && window.pirakuFishingSyncState.state)) {
        if (a.armL) a.armL.rotation.x *= 0.6;
        if (a.armR) a.armR.rotation.x *= 0.6;
        if (a.body) a.body.rotation.x *= 0.7;
      }
    }

    const fishingFloorY = (typeof window.getPirakuFishingGroundY === "function") ? window.getPirakuFishingGroundY(myPlayerMesh.position.x, myPlayerMesh.position.z) : null;
    const groundY = (fishingFloorY !== null) ? fishingFloorY : getPasupatiDeckY(myPlayerMesh.position.x, myPlayerMesh.position.z, myPlayerMesh.position.y);
    if (isGrounded) {
      if (myPlayerMesh.position.y > groundY + 0.35) {
        isGrounded = false;
      } else {
        myPlayerMesh.position.y = groundY;
      }
    }
    if (!isGrounded) {
      playerVelY += gravity * delta;
      myPlayerMesh.position.y += playerVelY * delta;

      if (a.legL && a.legR) {
        a.legL.rotation.x = -0.55;
        a.legR.rotation.x = 0.45;
      }
      a.armL.rotation.x = -0.6;
      a.armR.rotation.x = -0.6;

      if (myPlayerMesh.position.y <= groundY) {
        myPlayerMesh.position.y = groundY;
        playerVelY = 0;
        isGrounded = true;
      }
    }
    window.pirakuIsAirborne = !isGrounded;

    const track = window.pirakuCameraTrackTarget;
    const followX = track ? (track.mesh && track.mesh.position ? track.mesh.position.x : track.x) : myPlayerMesh.position.x;
    const followY = track ? (track.mesh && track.mesh.position ? track.mesh.position.y + 1.3 : 1.4) : (myPlayerMesh.position.y + 1.3);
    const followZ = track ? (track.mesh && track.mesh.position ? track.mesh.position.z : track.z) : myPlayerMesh.position.z;

    const curTarget = controls.target;
    const diffX = followX - curTarget.x;
    const diffY = followY - curTarget.y;
    const diffZ = followZ - curTarget.z;
    const lerpFactor = 0.12;

    curTarget.x += diffX * lerpFactor;
    curTarget.y += diffY * lerpFactor;
    curTarget.z += diffZ * lerpFactor;

    cam.position.x += diffX * lerpFactor;
    cam.position.y += diffY * lerpFactor;
    cam.position.z += diffZ * lerpFactor;
  }

  // ================= ANIMATION LOOP =================
  let clockTime = 0, isTabHidden = false;
  document.addEventListener('visibilitychange', () => { isTabHidden = document.hidden; });

  function animate() {
    requestAnimationFrame(animate);
    if (isTabHidden) return;

    clockTime += 0.016;
    window.clockTime = clockTime;

    applyGrowth();
    updTrees(clockTime);
    updV(clockTime, curMode === 'reborn');

    updatePlayerMovement(0.016);
    if (typeof KDM !== "undefined" && KDM) {
      KDM.visible = !window.pirakuInDistrict;
      if (KDM.visible) {
        const tgt = kdmWaypoints[kdmWpIdx];
        const dxK = tgt[0] - KDM.position.x;
        const dzK = tgt[1] - KDM.position.z;
        const distK = Math.hypot(dxK, dzK);
        if (distK < 0.35) {
          kdmWpIdx = (kdmWpIdx + 1) % kdmWaypoints.length;
        } else {
          const stepK = 1.65 * 0.016;
          KDM.position.x += (dxK / distK) * stepK;
          KDM.position.z += (dzK / distK) * stepK;
          KDM.rotation.y = Math.atan2(dxK, dzK);
          const sw = Math.sin(clockTime * 7.5);
          kdmLegL.rotation.x = sw * 0.55;
          kdmLegR.rotation.x = -sw * 0.55;
          kdmArmL.rotation.x = -sw * 0.45;
          kdmArmR.rotation.x = sw * 0.45;
        }
        kdmData.x = KDM.position.x;
        kdmData.z = KDM.position.z;
      }
    }
    if (controls) {
      controls.update();
    }
    if (!window.pirakuPotatoMode && Math.round(clockTime * 60) % 3 === 0) {
      renderer.shadowMap.needsUpdate = true;
    }
    cam.updateMatrixWorld();
    if (myPlayerMesh) updateDistrictTriggers(myPlayerMesh.position);
    // Sinkronisasi posisi avatar pemain lain (js/multiplayer.js) — broadcast + interpolasi.
    if (typeof window.updateMultiplayerFrame === 'function') window.updateMultiplayerFrame(0.016);

    if (activeQuestSystem && myPlayerMesh) {
      activeQuestSystem.update(0.016, myPlayerMesh.position);
    }
    if (_npcJogQuest && myPlayerMesh) {
      updateJogQuestHudPill();
      if (!_npcJogQuest.notified && Math.hypot(myPlayerMesh.position.x - _npcJogQuest.x, myPlayerMesh.position.z - _npcJogQuest.z) >= 22) {
        _npcJogQuest.notified = true;
        if (typeof window.playSynthTone === 'function') window.playSynthTone(960, 'sine', 0.22);
        showToast('🎉 Misi Jogging 22m beres! Lapor ke Mang Cepot buat klaim 45 🪙!');
      }
    }

    animC.forEach(g => {
      if (g.userData && g.userData.a && g.userData.a.c && g.userData.a.c.isRoleNpc) {
        g.visible = !window.pirakuInDistrict;
        if (g.visible && myPlayerMesh) {
          const rType = g.userData.a.c.npcRole;
          const pDist = Math.hypot(myPlayerMesh.position.x - g.position.x, myPlayerMesh.position.z - g.position.z);
          if (g.userData.roleAuraRing) {
            const pulse = 1 + Math.sin(clockTime * (pDist < 5.5 ? 7 : 3) + g.userData.a.ph) * 0.14;
            g.userData.roleAuraRing.scale.setScalar(pulse);
            g.userData.roleAuraRing.material.opacity = pDist < 5.5 ? 0.85 : 0.42;
          }
          const nowMs = Date.now();
          if (rType === 'beggar') {
            updateNengRaraSpatialAudio(pDist, true);
          } else if (rType && pDist < 4.5) {
            if (nowMs - (_npcProximityLastAt[rType] || 0) > 12000) {
              _npcProximityLastAt[rType] = nowMs;
              playNpcRoleSfx(rType, true);
            }
          }
        } else if (g.userData.a.c.npcRole === 'beggar' && !g.visible) {
          updateNengRaraSpatialAudio(999, false);
        }
      }
      if (g === myPlayerMesh || !g.visible || (g.userData && g.userData.a && g.userData.a.isRemotePlayer)) return;

      const a = g.userData.a;
      let isWalking = 0;

      if (a.walk && a.c !== activeCitizenTarget && a.c !== activeNpcDialogueTarget) {
        const dx = a.tx - g.position.x, dz = a.tz - g.position.z, d = Math.hypot(dx, dz);
        if (d < 0.4) {
          if (a.c && a.c.npcRole === 'quest_photo') {
            a.tx = (g.position.x > 0) ? -11.5 : 11.5;
            a.tz = 2.4;
          } else {
            const nextTarget = (a.c && a.c.isRoleNpc) ? getSafeCityRoamPos() : getSafeGasibuPos();
            a.tx = nextTarget.x;
            a.tz = nextTarget.z;
          }
        } else {
          isWalking = 1;
          const stepSpd = (a.c && a.c.isRoleNpc) ? 0.024 : 0.015;
          g.position.x += (dx / d) * stepSpd;
          g.position.z += (dz / d) * stepSpd;
          a.c.x = g.position.x;
          a.c.z = g.position.z;
          g.rotation.y = Math.atan2(dx, dz);
        }
        // Kang Preman bisa menghadang jika pemain lewat sangat dekat saat cooldown siap
        if (a.c && a.c.npcRole === 'extort' && !window.pirakuInDistrict && myPlayerMesh && !activeNpcDialogueTarget) {
          const nowMs = Date.now();
          if (nowMs > (_npcRoleCooldowns.extort || 0) && nowMs - _lastPremanInterceptAt > 60000) {
            const pDist = Math.hypot(myPlayerMesh.position.x - g.position.x, myPlayerMesh.position.z - g.position.z);
            if (pDist < 2.2) {
              _lastPremanInterceptAt = nowMs;
              showToast('🕶️ Kang Preman menghadangmu!');
              openNpcDialogueCard(a.c);
            }
          }
        }
      } else if (a.c === activeNpcDialogueTarget && myPlayerMesh) {
        g.rotation.y = Math.atan2(myPlayerMesh.position.x - g.position.x, myPlayerMesh.position.z - g.position.z);
      }
      const s = Math.sin(clockTime * (isWalking ? 8 : 2.5) + a.ph);
      a.body.position.y = Math.abs(s) * (isWalking ? 0.07 : 0.035);
      a.armL.rotation.x = s * (isWalking ? 0.8 : 0.4);
      a.armR.rotation.x = -s * (isWalking ? 0.8 : 0.4);
      if (a.legL && a.legR) {
        a.legL.rotation.x = -s * (isWalking ? 0.85 : 0.2);
        a.legR.rotation.x = s * (isWalking ? 0.85 : 0.2);
      }
    });

    headW.rotation.y = Math.sin(clockTime * 0.8) * 0.15;
    // posisi trem dikendalikan oleh updateTram()

    updateBubblePos();
    updateOverheadBubblesPos();
    updAtmos(clockTime); 
    stars.position.copy(cam.position);
    sky.position.copy(cam.position);
    if (typeof window.applyPirakuRidingPoses === 'function') window.applyPirakuRidingPoses();
    renderer.render(scene, cam);
  }
  animate();

  gsap.from(cam.position, { x: -120, y: 110, z: -170, duration: 3.4, ease: 'power3.out', delay: .2 });
})();

// ================= BRIDGE GLOBAL UNTUK SISTEM QUEST (rpg-ui.js / multiplayer.js) =================
// showToast hidup di scope IIFE di atas, jadi diekspos agar rpg-ui.js & multiplayer.js
// bisa memberitahu pemain. Fungsi quest trem memakai window.PirakuGameBridge (dideklarasikan
// di dalam IIFE) untuk membaca tracker & menambah koin.
window.showToast = function (msg) {
  const t = document.getElementById('toast-notif');
  if (!t) { try { console.log('[toast]', msg); } catch (e) {} return; }
  t.innerText = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
};


// Aksesibilitas: tombol ikon yang hanya punya title ikut dibaca screen reader
document.querySelectorAll('[title]').forEach(el => { if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.title); });