// ================= KUNCI SUPABASE =================
const SUPABASE_URL = "https://myilyqnawceobqedjbfa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sOY6Z9Qa8aILpSL3otVpRA_tx7RyGvf";

let supabaseClient = null;
if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL.startsWith('http')) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ================= SISTEM MISI HARIAN (DAILY QUESTS) =================
const DAILY_QUESTS = [
  {
    id: "visit_gasibu",
    title: "Nongkrong di Lapangan Gasibu",
    target: { x: 0, z: -8 },
    radius: 7.0,
    xpReward: 50,
    color: 0x3b82f6,
    stayDuration: 3,
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
  }
];

class QuestSystem {
  constructor(sceneInstance, supabaseInst, userData) {
    this.scene = sceneInstance;
    this.supabase = supabaseInst;
    this.warga = userData;
    this.quests = DAILY_QUESTS;
    this.init();
  }

  async init() {
    const hud = document.getElementById('player-profile-hud');
    if (hud) hud.style.display = 'block';
    this.updateHUD();
    await this.fetchCompletedQuests();
    this.spawnCheckpointMarkers();
  }

  async fetchCompletedQuests() {
    if (!this.warga || !this.warga.id || !this.supabase) return;
    const today = new Date().toISOString().split("T")[0];
    try {
      const { data, error } = await this.supabase
        .from("warga_daily_quests")
        .select("quest_id")
        .eq("warga_id", this.warga.id)
        .eq("completed_date", today);

      if (data && !error) {
        const completedIds = data.map(q => q.quest_id);
        this.quests.forEach(quest => {
          if (completedIds.includes(quest.id)) {
            quest.isCompleted = true;
            if (quest.mesh) quest.mesh.visible = false;
          }
        });
      }
    } catch(e) {}
  }

  spawnCheckpointMarkers() {
    this.quests.forEach(quest => {
      const markerGroup = new THREE.Group();
      const ringGeo = new THREE.RingGeometry(quest.radius - 0.4, quest.radius, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: quest.color, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.14;
      markerGroup.add(ringMesh);

      const beaconGeo = new THREE.CylinderGeometry(quest.radius * 0.9, quest.radius * 0.9, 3.5, 32, 1, true);
      const beaconMat = new THREE.MeshBasicMaterial({ color: quest.color, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 1.8;
      markerGroup.add(beaconMesh);

      markerGroup.position.set(quest.target.x, 0, quest.target.z);
      if (quest.isCompleted) markerGroup.visible = false;
      quest.mesh = markerGroup;
      this.scene.add(markerGroup);
    });
  }

  update(delta, playerPos) {
    if (!playerPos) return;
    this.quests.forEach(quest => {
      if (quest.isCompleted) return;
      if (quest.mesh) quest.mesh.rotation.y += delta * 0.75;
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

  async completeQuest(quest) {
    quest.isCompleted = true;
    if (quest.mesh) {
      gsap.to(quest.mesh.scale, { x: 0, y: 0, z: 0, duration: 0.5, onComplete: () => { quest.mesh.visible = false; } });
    }
    this.showQuestToast(quest.title, quest.xpReward);
    if (typeof playSynthTone === 'function') playSynthTone(1050, "sine", 0.4);
    await this.applyReward(quest);
  }

  async applyReward(quest) {
    if (!this.warga) return;
    const prevXP = parseInt(this.warga.xp, 10) || 0;
    const currentXP = prevXP + quest.xpReward;
    const currentLvl = Math.floor(currentXP / 100) + 1;

    this.warga.xp = currentXP;
    this.warga.level = currentLvl;
    localStorage.setItem("piraku_my_level", currentLvl);
    localStorage.setItem("piraku_my_xp", currentXP);

    this.updateHUD();
    if (typeof updateAutoDetectButton === "function") updateAutoDetectButton();

    const client = this.supabase || supabaseClient;
    if (client && this.warga.id) {
      try {
        const today = new Date().toISOString().split("T")[0];
        await client.from("warga_daily_quests").insert([{ warga_id: this.warga.id, quest_id: quest.id, completed_date: today }]);
        await client.from("warga_piraku").update({ xp: currentXP, level: currentLvl }).eq("id", this.warga.id);
      } catch (err) {}
    }
  }

  updateHUD() {
    const xp = this.warga?.xp || 0;
    const lvl = this.warga?.level || 1;
    const currentLvlProgress = xp % 100;
    const badge = document.getElementById("hud-level-badge");
    const text = document.getElementById("hud-xp-text");
    const fill = document.getElementById("hud-xp-fill");
    if (badge) badge.innerText = `LVL ${lvl}`;
    if (text) text.innerText = `${currentLvlProgress} / 100 XP`;
    if (fill) fill.style.width = `${currentLvlProgress}%`;
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
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let isAmbiencePlaying = false, windGain = null, cricketsGain = null;

  function initAmbienceSound() {
    if (windGain) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, audioCtx.currentTime);

      windGain = audioCtx.createGain();
      windGain.gain.setValueAtTime(0, audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(windGain);
      windGain.connect(audioCtx.destination);
      whiteNoise.start();

      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4500, audioCtx.currentTime);
      cricketsGain = audioCtx.createGain();
      cricketsGain.gain.setValueAtTime(0, audioCtx.currentTime);
      osc.connect(cricketsGain);
      cricketsGain.connect(audioCtx.destination);
      osc.start();
    } catch(e){}
  }

  window.toggleAmbienceAudio = function() {
    initAmbienceSound();
    isAmbiencePlaying = !isAmbiencePlaying;
    if (isAmbiencePlaying) {
      windGain.gain.setTargetAtTime(0.08, audioCtx.currentTime, 0.5);
      showToast('Soundscape kota Bandung aktif 🍃');
    } else {
      if (windGain) windGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
      if (cricketsGain) cricketsGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
      showToast('Soundscape dinonaktifkan 🔇');
    }
  };

  window.playSynthTone = function(freq, type, duration) {
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e){}
  };

  // Menu Dropdown "⋯"
  window.toggleHudMenu = function(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('hud-dropdown');
    menu.classList.toggle('show');
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
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xd9e7ee, 180, 750);

  const cam = new THREE.PerspectiveCamera(40, W / H, 0.5, 1600);
  cam.position.set(-26, 26, -55);

  const controls = new THREE.OrbitControls(cam, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = PI / 2.08;
  controls.minDistance = 3;
  controls.maxDistance = 240;
  controls.target.set(0, 3, 5);

  // Pencahayaan
  const amb = new THREE.AmbientLight(0xfff2e6, 0.56);
  const hemi = new THREE.HemisphereLight(0xe0edfb, 0x3d4b35, 0.38);
  const sun = new THREE.DirectionalLight(0xfff1de, 1.15);
  sun.position.set(-40, 65, 45);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0003;
  Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 1, far: 300 });
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

  // Tanah & Hamparan
  box(1400, .5, 1400, 0, -.5, 0, 0xdde1d0, null, false, true);
  box(160, .08, 140, 0, -.04, 0, MAT(0x567e51), null, false, true);
  {
    const mc = [0x8aa89a, 0x7a9a8c, 0x93b0a6, 0x86a395];
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * 2 * PI + rnd() * .2, r = 340 + rnd() * 90, h = 45 + rnd() * 75, w = 60 + rnd() * 60;
      const m = mk(new THREE.ConeGeometry(1, 1, 6), mc[i % 4], Math.cos(a) * r, h / 2 - 2, Math.sin(a) * r, null, false, false);
      m.scale.set(w, h, w); m.rotation.y = rnd() * 3;
    }
  }

  // Atlas Aspal Jalan
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
  const roads = [], RP = [];
  function road(pts, w) {
    const c = new THREE.CatmullRomCurve3(pts.map(p => V3(p[0], 0, p[1])), false, 'centripetal'), len = c.getLength(), N = Math.max(4, Math.round(len / 2));
    const P = [], I = [], WX = [], VV = [], y = .14 + roads.length * .002;
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = c.getPointAt(t), q = c.getTangentAt(t), nx = -q.z, nz = q.x, h = Math.hypot(p.x, p.z - 13.5);
      P.push(p.x + nx * w / 2, y, p.z + nz * w / 2, p.x - nx * w / 2, y, p.z - nz * w / 2);
      WX.push(h, h); VV.push(t * len / 6, t * len / 6);
      if (i < N) { const a = i * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(), uvArray = new Float32Array(WX.length * 2);
    for (let j = 0; j < WX.length; j++) { uvArray[j * 2] = .015 + (j % 2) * .47; uvArray[j * 2 + 1] = VV[j]; }
    const uv = new THREE.BufferAttribute(uvArray, 2);
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', uv); g.setIndex(I); g.computeVertexNormals();
    const m = new THREE.Mesh(g, RoadMaterial); m.receiveShadow = true; scene.add(m);
    c.userData = { w, len }; roads.push({ g, uv, WX, VV, c });
    c.getSpacedPoints(Math.round(len / 2)).forEach(p => RP.push(p)); return c;
  }

  const Rsur = road([[-60, -52], [-32, -27.5], [-22, -26], [60, -26]], 8);
  const RdipW = road([[-60, 3], [-21, 3]], 6), RdipE = road([[21, 3], [60, 3]], 6);
  const Rmaj = road([[-21, -26], [-21, 3]], 5), Rsen = road([[21, -26], [21, 3]], 5);
  const Rcla = road([[-22, 4], [-27, 14], [-33, 22], [-42, 33], [-48.5, 40]], 4);
  const Rcim = road([[-22, 3], [-25, 9], [-25, 21], [-17, 29.5], [0, 32], [18, 30.5], [32, 30], [44, 27]], 4);
  const Rcil = road([[18, 5], [31, 16], [44, 27], [60, 38]], 4);
  const RriauW = road([[-60, 16], [-24, 16]], 5.5), RriauE = road([[24, 16], [60, 16]], 5.5);
  const Rdago = road([[-42, -50], [-42, 3], [-42, 35]], 5.5);

  const LM = new THREE.MeshBasicMaterial({ color: 0xe11d1d, transparent: true, opacity: 0, depthWrite: false });
  roads.forEach(r => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(r.c, Math.round(r.c.userData.len / 2), .3, 5, false), LM);
    m.position.y = .7; scene.add(m);
  });

  // Plaza Gasibu
  box(42, .08, 14, 0, 0, -5, MAT(0x4a7345), null, false, true);
  box(10, .12, 12, 0, 0, -4.5, MAT(0xd4cbb9), null, false, true);
  const gg = new THREE.RingGeometry(3.4, 5.6, 40); gg.rotateX(-PI / 2);
  const gGasibu = mk(gg, 0xd97706, 0, .12, -13, null, false, true); gGasibu.scale.x = 2.4;

  // Flyover Pasupati
  const FLY = new THREE.Group(); scene.add(FLY);
  const CFly = new THREE.CatmullRomCurve3([-85, -60, -35, 0, 35, 65, 85].map(x => V3(x, 6.2, -26 + 1.6 * Math.sin(x / 30))));
  CFly.userData = { w: 7.2, len: CFly.getLength() };
  const NDK = 80, deckM = IM(boxG, MAT(0x3b414c), NDK), pilM = IM(cylG, MAT(0x64748b), 15), barrierM = IM(boxG, MAT(0x94a3b8), NDK * 2);
  FLY.add(deckM, pilM, barrierM);

  for (let i = 0; i < NDK; i++) {
    const u = (i + .5) / NDK, p = CFly.getPointAt(u), q = CFly.getTangentAt(u), sl = CFly.userData.len / NDK * 1.15;
    dum.position.set(p.x, 5.65, p.z); dum.lookAt(p.x + q.x, 5.65, p.z + q.z); dum.scale.set(7.2, .65, sl); dum.updateMatrix(); deckM.setMatrixAt(i, dum.matrix);
    [-3.3, 3.3].forEach((sd, j) => {
      dum.position.set(p.x - q.z * sd, 6.2, p.z + q.x * sd); dum.scale.set(.45, .8, sl); dum.updateMatrix(); barrierM.setMatrixAt(i * 2 + j, dum.matrix);
    });
  }
  [-82, -70, -58, -46, -8, 4, 16, 28, 40, 52, 64, 76, 84].forEach((px, i) => setM(pilM, i, px, 0, px >= -12 ? -26 : -26 + 1.6 * Math.sin(px / 30), 2.4, 5.65, 2.4));

  // Pilon Utama & Kabel Pasupati
  {
    const PX = -27, zc = x => -26 + 1.6 * Math.sin(x / 30), PZ = zc(PX);
    box(1.6, 20, 1.8, PX, 0, PZ, 0xc7cbd1, FLY);
    [-.5, .5].forEach(o => box(.55, 4.4, 1.7, PX + o, 19.8, PZ, 0xd62b2b, FLY));
    
    const cabM = IM(poleG, MAT(0xeef1f4), 32, false, false);
    const pA = V3(0, 0, 0), pB = V3(0, 0, 0), pD = V3(0, 0, 0), pY = V3(0, 1, 0), qq = new THREE.Quaternion();
    let n = 0;
    [-1, 1].forEach(sd => { 
      for (let k = 0; k < 8; k++) [-1, 1].forEach(j => {
        const ax = PX + sd * (5 + k * 4.6);
        pA.set(ax, 6.8, zc(ax) + j * .6); 
        pB.set(PX + sd * .3, 14 + k * 1.15, PZ + j * .3);
        pD.subVectors(pB, pA); const len = pD.length(); 
        qq.setFromUnitVectors(pY, pD.normalize());
        dum.position.copy(pA); dum.quaternion.copy(qq); dum.scale.set(1.4, len, 1.4); dum.updateMatrix(); 
        cabM.setMatrixAt(n++, dum.matrix);
      }); 
    });
    cabM.instanceMatrix.needsUpdate = true;
    FLY.add(cabM);

    const medM = IM(boxG, MAT(0xaeb4bd), 60, false, false);
    for (let i = 0; i < 60; i++) {
      const u = (i + .5) / 60, p = CFly.getPointAt(u), q = CFly.getTangentAt(u);
      dum.position.set(p.x, 6.3, p.z); dum.lookAt(p.x + q.x, 6.3, p.z + q.z); dum.scale.set(.45, .5, 2.9); dum.updateMatrix(); 
      medM.setMatrixAt(i, dum.matrix);
    }
    medM.instanceMatrix.needsUpdate = true; 
    dum.quaternion.identity();
    FLY.add(medM);
  }

  // Gedung Sate & Vila
  const G = new THREE.Group(); G.position.set(0, 0, 13.5); G.rotation.y = PI; scene.add(G);
  const CREAM = 0xeee6cf;
  const ROOFMAT = new THREE.MeshStandardMaterial({ color: 0x17171b, emissive: 0x000000, flatShading: true, roughness: .92, metalness: 0 });
  const GLASSM = new THREE.MeshStandardMaterial({ color: 0x1a2540, emissive: 0xffb347, emissiveIntensity: 0, flatShading: true, roughness: .55, metalness: 0 });
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
  box(36, 3.2, 7.4, 0, .35, 0, CREAM, G);
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
    DUTCH.add(v);
  }
  [[-32, -14, .1], [32, -14, -.1]].forEach(p => mkColonialVilla(p[0], p[1], p[2]));

  // Billboard LED 3D
  const billboardCanvas = document.createElement('canvas');
  billboardCanvas.width = 512; billboardCanvas.height = 256;
  const bCtx = billboardCanvas.getContext('2d');
  const billboardTex = new THREE.CanvasTexture(billboardCanvas);

  function drawBillboardScreen(title, sub) {
    bCtx.fillStyle = '#0f172a';
    bCtx.fillRect(0, 0, 512, 256);
    bCtx.fillStyle = '#2450e6';
    bCtx.fillRect(0, 0, 512, 45);
    bCtx.fillStyle = '#ffffff';
    bCtx.font = '800 24px "Bricolage Grotesque", sans-serif';
    bCtx.fillText('WARGA BANDUNG LIVE NEWS', 20, 32);

    bCtx.fillStyle = '#ffcf4a';
    bCtx.font = '800 32px "Bricolage Grotesque", sans-serif';
    bCtx.fillText(title, 20, 110);

    bCtx.fillStyle = '#e2e8f0';
    bCtx.font = '600 22px "Bricolage Grotesque", sans-serif';
    bCtx.fillText(sub, 20, 160);

    bCtx.fillStyle = '#4ade80';
    bCtx.font = '700 18px "Bricolage Grotesque", sans-serif';
    bCtx.fillText('● REALTIME SIMULASI @pirakubdg', 20, 225);
    billboardTex.needsUpdate = true;
  }
  drawBillboardScreen('BANDUNG REBORN 2026', 'Trem Listrik & Trotoar Rindang Dimulai!');

  const billboardGroup = new THREE.Group();
  billboardGroup.position.set(-16, 0, -18);
  billboardGroup.rotation.y = 0.5;
  scene.add(billboardGroup);
  cyl(0.25, 0.25, 6, 8, 0, 0, 0, 0x1e293b, billboardGroup);
  box(9.2, 4.8, 0.4, 0, 4.5, 0, 0x0f172a, billboardGroup);
  mk(new THREE.PlaneGeometry(8.8, 4.4), new THREE.MeshBasicMaterial({ map: billboardTex }), 0, 6.9, 0.22, billboardGroup, false, false);

  // Perumahan Warga
  const citizenHousesGroup = new THREE.Group(); scene.add(citizenHousesGroup);
  const houseOwnersRegistry = {};

  function spawnCitizenHouse(c, index) {
    if (houseOwnersRegistry[c.ig]) return houseOwnersRegistry[c.ig];
    const hg = new THREE.Group();
    const hx = 26 + (index % 4) * 6;
    const hz = -16 - Math.floor(index / 4) * 6;
    hg.position.set(hx, 0, hz);

    box(3.4, 2.4, 3.4, 0, 0.1, 0, 0xf8fafc, hg);
    hip(4.0, 4.0, 1.5, 0, 2.5, 0, 0x9a3412, hg);
    box(0.9, 1.5, 0.1, 0, 0.1, 1.72, 0x78350f, hg);
    box(3.8, 0.15, 1.6, 0, 0.05, 2.4, 0xcbd5e1, hg);
    box(2.4, 0.45, 0.1, 0, 3.6, 0, 0x0f172a, hg);
    
    hg.scale.set(0.001, 0.001, 0.001);
    citizenHousesGroup.add(hg);
    gsap.to(hg.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'back.out' });

    const houseData = { hx, hz, porchX: hx, porchZ: hz + 2.4, group: hg };
    houseOwnersRegistry[c.ig] = houseData;
    return houseData;
  }

  // Gedung Kota Berjendela
  const WALLS = [0xeae3d5, 0xdfd6c6, 0xd4cbb9, 0xd97757, 0x576574, 0x475569];
  const ROOF_COLORS = [0xba5232, 0xa84425, 0x96391d, 0x475569, 0x334155, 0xc26241];
  const bl = [];
  const SK = [[-36, 36, -26, 18], [-39, -27, -26, -5], [28, 40, -26, -3]];
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

  // Pohon Kiara Payung
  const trees = [];
  for (let x = -16; x <= 16; x += 4) trees.push({ x, z: -22.2, s: 1.05 });
  [[-9, 8], [9, 8], [-13, 9], [13, 9], [-17, 0], [17, 0], [-17, 5], [17, 5]].forEach(p => trees.push({ x: p[0], z: p[1], s: 1 }));
  for (let x = -54; x <= 54; x += 4.2) if (Math.abs(Math.abs(x) - 21) > 4.2) {
    if (Math.abs(x) > 30) trees.push({ x, z: -1.8, s: .95 });
    if (Math.abs(x) > 17) trees.push({ x, z: 7.6, s: .95 });
  }
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
      dum.position.set(po.x, po.y, po.z); dum.rotation.set(0, po.ry, 0); dum.scale.setScalar(s); dum.updateMatrix(); vMat.copy(dum.matrix);
      v.parts.forEach(part => {
        MA.multiplyMatrices(vMat, part.P); VM[part.mi].setMatrixAt(part.idx, MA);
      });
    });
    VM.forEach(m => { m.instanceMatrix.needsUpdate = true; });
  }

  // Trem
  const rebornGroup = new THREE.Group(); scene.add(rebornGroup);
  const tram = new THREE.Group();
  [-3.15, 0, 3.15].forEach(x => {
    box(3, 1.5, 1.7, x, .35, 0, 0x1f6bff, tram); box(2.9, .52, 1.76, x, 1.0, 0, 0xbfe6ff, tram, false); box(3, .14, 1.5, x, 1.85, 0, 0xf8fafc, tram);
  });
  box(9.5, .32, 1.75, 0, .55, 0, 0x0b3fb8, tram, false);
  [-4.8, 4.8].forEach(x => [-.55, .55].forEach(z => mk(new THREE.BoxGeometry(.1, .2, .3), new THREE.MeshBasicMaterial({ color: 0xfff7c2 }), x, .85, z, tram, false, false)));
  rebornGroup.add(tram);
  [2.2, 3.1, 3.3, 4.2].forEach(z => box(100, .08, .14, 0, .22, z, 0x94a3b8, rebornGroup, false));

  // Lampu Jalan
  const furn = [];
  for (let x = -40; x <= 40; x += 8) if (Math.abs(Math.abs(x) - 21) > 5) {
    furn.push(['b', x + 2, -2.6]); if (Math.abs(x) > 4.5) furn.push(['l', x, 8.4]); if (Math.abs(x) > 6) furn.push(['l', x + 4, -.6]);
  }
  const nB = furn.filter(f => f[0] === 'b').length, nL = furn.filter(f => f[0] === 'l').length;
  const LAMPM = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffc861, emissiveIntensity: 0, roughness: .6 });
  const bnM = IM(boxG, MAT(0x8a6a4a), nB * 2, true, false), lpM = IM(poleG, MAT(0x374151), nL), lhM = IM(sphG, LAMPM, nL, false, false);
  let b = 0, l = 0;
  furn.forEach(f => {
    if (f[0] === 'b') { setM(bnM, b * 2, f[1], .4, f[2], 2, .15, .6); setM(bnM, b * 2 + 1, f[1], .5, f[2] - .3, 2, .6, .1); b++; }
    else if (f[0] === 'l') { setM(lpM, l, f[1], 0, f[2], 1, 4.2, 1); setM(lhM, l, f[1], 4.3, f[2], .35, .35, .35); l++; }
  });
  [bnM, lpM, lhM].forEach(m => m.instanceMatrix.needsUpdate = true);

  // Awan & Kunang-kunang
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
      cricketsGain.gain.setTargetAtTime(night ? 0.04 : 0, audioCtx.currentTime, 0.8);
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

    if (hour >= 5 && hour < 10) {
      if (badge) badge.innerHTML = '🌅 Pagi (' + hour + ':' + mins + ')';
      skyU.top.value.setHex(DAY[0]); skyU.bot.value.setHex(DAY[1]);
      scene.fog.color.copy(skyU.bot.value);
      sun.color.setHex(0xfff3db); sun.intensity = 1.15; sun.position.set(-60, 45, 30);
      amb.intensity = 0.55;
      LAMPM.emissiveIntensity = 0; GLASSM.emissiveIntensity = 0; HeadlightMaterial.color.setHex(0x555555);
    } else if (hour >= 10 && hour < 15) {
      if (badge) badge.innerHTML = '☀️ Siang (' + hour + ':' + mins + ')';
      skyU.top.value.setHex(DAY[0]); skyU.bot.value.setHex(DAY[1]);
      scene.fog.color.copy(skyU.bot.value);
      sun.color.setHex(0xfff1de); sun.intensity = 1.35; sun.position.set(-40, 75, 45);
      amb.intensity = 0.65;
      LAMPM.emissiveIntensity = 0; GLASSM.emissiveIntensity = 0; HeadlightMaterial.color.setHex(0x555555);
    } else if (hour >= 15 && hour < 18) {
      if (badge) badge.innerHTML = '🌇 Senja (' + hour + ':' + mins + ')';
      skyU.top.value.setHex(SUNSET[0]); skyU.bot.value.setHex(SUNSET[1]);
      scene.fog.color.copy(skyU.bot.value);
      sun.color.setHex(0xff8c42); sun.intensity = 1.0; sun.position.set(-70, 30, 20);
      amb.intensity = 0.45;
      LAMPM.emissiveIntensity = 0.8; GLASSM.emissiveIntensity = 0.6; HeadlightMaterial.color.setHex(0xfff7c2);
    } else {
      if (badge) badge.innerHTML = '🌙 Malam (' + hour + ':' + mins + ')';
      skyU.top.value.setHex(NIGHT[0]); skyU.bot.value.setHex(NIGHT[1]);
      scene.fog.color.setHex(0x0a1424); scene.fog.near = 100; scene.fog.far = 520;
      sun.color.setHex(0x38bdf8); sun.intensity = 0.25; sun.position.set(-40, 60, -40);
      amb.intensity = 0.25;
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

  window.toggleBottomPanel = function(show) {
    const panel = document.getElementById('bottom-control-panel');
    const fabBtn = document.getElementById('btn-show-panel');
    if (show) {
      panel.classList.remove('hidden');
      fabBtn.style.display = 'none';
      showToast('Panel simulasi dibuka 🏙️');
    } else {
      panel.classList.add('hidden');
      fabBtn.style.display = 'block';
      showToast('Menikmati pemandangan kota Bandung ✨');
    }
  };

  // ================= SISTEM WARGA & KARAKTER UTAMA =================
  const citizensGroup = new THREE.Group(); scene.add(citizensGroup);
  const clickableObjects = [], registeredCitizensList = [];
  let activeCitizenTarget = null;
  const animC = [], SKIN = [0xf1c9a0, 0xe0ac80, 0xc68a5c, 0x9a6a45];
  const SP = (r, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h);

  let myPlayerMesh = null;
  let isControlledByPlayer = false;

  function getSafeGasibuPos() {
    return {
      x: (Math.random() - 0.5) * 26,
      z: -14 + (Math.random() - 0.5) * 10
    };
  }

  function createCitizenMesh(c) {
    c.upvotes = c.upvotes || 0; 
    c.acc = c.acc || 'none';
    c.kecamatan = c.kecamatan || 'Bandung Wetan';
    c.level = parseInt(c.level, 10) || 1;
    c.xp = parseInt(c.xp, 10) || 0;

    const cg = new THREE.Group(), skin = SKIN[Math.floor(rnd() * 4)];
    const body = new THREE.Group(); cg.add(body);
    [-.11, .11].forEach(x => { cyl(.085, .07, .34, 8, x, 0, 0, 0x273449, cg); mk(SP(.1, 8, 6), 0x111827, x, .06, .05, cg).scale.set(1, .6, 1.4); });
    cyl(.2, .25, .5, 14, 0, .32, 0, c.color, body);
    const head = new THREE.Group(); head.position.y = 1.1; body.add(head);
    mk(SP(.3, 16, 12), skin, 0, 0, 0, head);
    mk(new THREE.SphereGeometry(.31, 16, 10, 0, PI * 2, 0, PI * .55), 0x111827, 0, .03, -.02, head);
    [-.1, .1].forEach(x => mk(SP(.045, 8, 6), 0x111111, x, -.02, .27, head));

    if (c.acc === 'glasses') box(.36, .08, .06, 0, -.02, .28, 0x0f172a, head);
    else if (c.acc === 'peci') cyl(.26, .26, .18, 14, 0, .28, 0, 0x111827, head);
    else if (c.acc === 'cat') {
      const cat = new THREE.Group(); cat.position.set(0.38, 0, 0.2); cg.add(cat);
      box(0.24, 0.18, 0.35, 0, 0.09, 0, 0xf97316, cat);
      mk(new THREE.SphereGeometry(0.12, 8, 6), 0xf97316, 0, 0.22, 0.14, cat);
    }

    const arm = sd => { const q = new THREE.Group(); q.position.set(sd * .27, .74, 0); body.add(q); cyl(.06, .055, .4, 8, 0, -.4, 0, c.color, q); return q; };
    const armL = arm(-1), armR = arm(1);

    const rg = new THREE.RingGeometry(.42, .52, 24); rg.rotateX(-PI / 2);
    mk(rg, new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: .7 }), 0, .03, 0, cg, false, false);

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

    cg.scale.setScalar(1.25); cg.position.set(posX, 0.1, posZ);

    cg.userData.a = { 
      body, head, armL, armR, ph: rnd() * 6.28, c, 
      tx: posX, tz: posZ, 
      walk: !isResidentAtHouse,
      isAtHouse: isResidentAtHouse
    };
    animC.push(cg);

    const hitbox = mk(new THREE.BoxGeometry(1.2, 2.2, 1.2), new THREE.MeshBasicMaterial({ visible: false }), 0, 1.1, 0, cg);
    hitbox.userData = c;
    hitbox.userData.meshGroup = cg;
    clickableObjects.push(hitbox); 
    registeredCitizensList.push(c);
    citizensGroup.add(cg); 

    const myIg = localStorage.getItem('piraku_my_ig');
    if (myIg && c.ig && c.ig.toLowerCase() === myIg.toLowerCase()) {
      setupActivePlayer(cg, c);
    }

    return cg;
  }

  function setupActivePlayer(mesh, c) {
    myPlayerMesh = mesh;
    isControlledByPlayer = true;
    mesh.userData.a.walk = false;

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      const joyZone = document.getElementById('joystick-zone');
      if (joyZone) joyZone.style.display = 'block';
    }

    gsap.to(cam.position, { x: mesh.position.x - 3.5, y: 3.2, z: mesh.position.z - 5.5, duration: 1.5, ease: 'power2.out' });
    controls.target.copy(mesh.position);
    showToast('Mode Kontrol Aktif! Gerakkan dengan WASD / Joystick 🎮');

    if (!activeQuestSystem) {
      activeQuestSystem = new QuestSystem(scene, supabaseClient, c);
    }
  }

  // Walkot
  const WALKOT = new THREE.Group(); WALKOT.position.set(-10, .12, -2.5); WALKOT.scale.setScalar(1.25); WALKOT.rotation.y = 2.45; scene.add(WALKOT);
  box(.9, .07, .8, 0, .31, -.05, 0x2563eb, WALKOT);
  cyl(.46, .46, .05, 16, 1.15, .58, .2, 0x9a6b43, WALKOT);
  cyl(.04, .04, .58, 8, 1.15, 0, .2, 0x6b4a32, WALKOT);
  const bodW = new THREE.Group(); bodW.position.set(0, .46, 0); WALKOT.add(bodW);
  cyl(.27, .33, .62, 16, 0, .31, 0, 0x1e3a8a, bodW);
  const headW = new THREE.Group(); headW.position.set(0, .86, 0); bodW.add(headW);
  mk(new THREE.SphereGeometry(.38, 12, 10), 0xf4c29a, 0, 0, 0, headW);
  cyl(.27, .31, .25, 16, 0, .27, 0, 0x0f172a, headW);
  cyl(.32, .32, .04, 16, 0, .27, 0, 0xfacc15, headW);
  cyl(.065, .05, .11, 12, 0.4, 0.7, 0.2, 0xffffff, bodW);

  const walkotData = { id: 0, name: 'Pak Walikota', ig: '@pirakubdg', role: 'WALKOT', kecamatan: 'Sumur Bandung', wish: 'Wilujeng sumping! Sok atuh keliling Gasibu & tata kotana!', upvotes: 42, x: -10, z: -2.5 };
  const walkotHitbox = mk(new THREE.BoxGeometry(1.5, 2.5, 1.5), new THREE.MeshBasicMaterial({ visible: false }), -10, 1.2, -2.5);
  walkotHitbox.userData = walkotData;
  walkotHitbox.userData.meshGroup = WALKOT;
  clickableObjects.push(walkotHitbox); registeredCitizensList.push(walkotData);

  let totalWarga = 1;

  async function loadCitizensFromDB() {
    if (!supabaseClient) { 
      const counterEl = document.getElementById('warga-counter');
      if (counterEl) counterEl.innerText = '1 WARGA'; 
      updateCityMilestones(1); 
      return; 
    }
    try {
      const { data, error } = await supabaseClient.from('warga_piraku').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        data.forEach(c => createCitizenMesh(c)); 
        totalWarga = 1 + data.length;
      }
      const counterEl = document.getElementById('warga-counter');
      if (counterEl) counterEl.innerText = totalWarga + ' WARGA';
      updateCityMilestones(totalWarga); 
      updateAutoDetectButton();
      initCitizenTicker();
    } catch (err) {
      const counterEl = document.getElementById('warga-counter');
      if (counterEl) counterEl.innerText = '1 WARGA';
    }
  }
  loadCitizensFromDB();

  // Ticker Aspirasi
  let currentTickerIndex = 0;
  function initCitizenTicker() {
    if (registeredCitizensList.length === 0) return;
    setInterval(() => {
      currentTickerIndex = (currentTickerIndex + 1) % registeredCitizensList.length;
      const c = registeredCitizensList[currentTickerIndex];
      const tickerEl = document.getElementById('ticker-text');
      if (tickerEl && c) {
        tickerEl.innerHTML = `<b>${esc(c.ig)} [${esc(c.kecamatan || 'Bandung')}]:</b> "${esc(c.wish)}"`;
      }
    }, 7000);
  }

  window.focusCurrentTickerCitizen = function() {
    const c = registeredCitizensList[currentTickerIndex];
    if (c) {
      showCitizenSpeech(c);
      showToast('Kamera terbang ke ' + c.ig + ' ✨');
    }
  };

  // Raycaster Tap
  const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
  let touchStartPos = { x: 0, y: 0 }, touchStartTime = 0;
  window.addEventListener('pointerdown', e => { touchStartTime = performance.now(); touchStartPos = { x: e.clientX, y: e.clientY }; });
  window.addEventListener('pointerup', e => {
    if (performance.now() - touchStartTime < 300 && Math.hypot(e.clientX - touchStartPos.x, e.clientY - touchStartPos.y) < 8) {
      mouse.x = (e.clientX / W) * 2 - 1; mouse.y = -(e.clientY / H) * 2 + 1;
      raycaster.setFromCamera(mouse, cam);
      const hits = raycaster.intersectObjects(clickableObjects);
      if (hits.length > 0) showCitizenSpeech(hits[0].object.userData); else hideCitizenSpeech();
    }
  });

  const bubbleEl = document.getElementById('citizen-bubble'), tempV = new THREE.Vector3();
  function showCitizenSpeech(data) {
    activeCitizenTarget = data;
    document.getElementById('b-ig').innerText = data.ig;
    document.getElementById('b-role').innerText = (data.role || 'WARGA').toUpperCase();
    document.getElementById('b-kec').innerText = 'Kec. ' + (data.kecamatan || 'Bandung Wetan');
    document.getElementById('b-wish').innerText = '“' + data.wish + '”';
    document.getElementById('b-upvotes').innerText = data.upvotes || 0;
    bubbleEl.style.display = 'block';

    const curX = data.x;
    const curZ = data.z;

    gsap.to(controls.target, { x: curX, y: 1.5, z: curZ, duration: 1.2, ease: 'power2.inOut' });
    gsap.to(cam.position, { x: curX - 3.5, y: 3.2, z: curZ - 5.5, duration: 1.2, ease: 'power2.inOut' });
  }

  function hideCitizenSpeech() { activeCitizenTarget = null; if (bubbleEl) bubbleEl.style.display = 'none'; }
  function updateBubblePos() {
    if (!activeCitizenTarget || !bubbleEl) return;
    tempV.set(activeCitizenTarget.x, 2.3, activeCitizenTarget.z).project(cam);
    if (tempV.z > 1) { bubbleEl.style.display = 'none'; return; }
    bubbleEl.style.display = 'block';
    bubbleEl.style.left = (tempV.x * 0.5 + 0.5) * W + 'px';
    bubbleEl.style.top = (-tempV.y * 0.5 + 0.5) * H + 'px';
  }

  // Emotes
  window.triggerEmote = function(type) {
    if (!activeCitizenTarget) return;
    const animObj = animC.find(a => a.userData.a.c.ig === activeCitizenTarget.ig);

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
      showToast('Kamu sudah pernah menyetujui aspirasi ini! ❤️');
      return;
    }

    const currentCount = parseInt(activeCitizenTarget.upvotes, 10) || 0;
    const nextCount = currentCount + 1;
    activeCitizenTarget.upvotes = nextCount;
    document.getElementById('b-upvotes').innerText = nextCount;
    localStorage.setItem(voteKey, 'true');
    showToast('Aspirasi didukung! +1 ❤️');

    if (supabaseClient) {
      try {
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
            .ilike('ig', activeCitizenTarget.ig)
            .select();
        }
        if (resp && resp.error) console.error('Supabase update gagal:', resp.error);
      } catch (err) {}
    }
  };

  // Overhead Chat Bubbles
  const activeWorldBubbles = [];
  function showOverheadBubbleOnAvatar(senderIg, text) {
    const avatar = animC.find(a => a.userData.a.c.ig.toLowerCase() === senderIg.toLowerCase());
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

  function appendChatToUI(sender, text) {
    const stream = document.getElementById('chat-messages');
    if (!stream) return;
    const div = document.createElement('div');
    div.style.cssText = 'background:#fff;padding:8px 12px;border-radius:12px;font-size:12px;color:var(--ink);box-shadow:0 2px 6px rgba(0,0,0,.06);';
    div.innerHTML = `<b>${esc(sender)}:</b> ${esc(text)}`;
    stream.appendChild(div);
    stream.scrollTop = stream.scrollHeight;

    showOverheadBubbleOnAvatar(sender, text);
    drawBillboardScreen(sender.toUpperCase(), text.substring(0, 30));
  }

  async function loadRecentChats() {
    if (!supabaseClient) return;
    try {
      const { data } = await supabaseClient
        .from('chat_warga')
        .select('*')
        .order('id', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const stream = document.getElementById('chat-messages');
        stream.innerHTML = '<div style="background:#fff;padding:8px 12px;border-radius:12px;font-size:12px;color:var(--ink);"><b>@pirakubdg:</b> Wilujeng sumping di Balai Obrolan! Pesan di sini dibroadcast langsung ke semua warga kota.</div>';
        data.reverse().forEach(row => appendChatToUI(row.sender_ig, row.message));
      }
    } catch (e) {}
  }

  window.sendChatMessage = async function() {
    const inp = document.getElementById('inp-chat-msg');
    const msg = inp.value.trim();
    if (!msg) return;
    const myIg = localStorage.getItem('piraku_my_ig') || '@warga_tamu';

    appendChatToUI(myIg, msg);
    inp.value = '';

    if (supabaseClient) {
      try {
        await supabaseClient.from('chat_warga').insert([{ sender_ig: myIg, message: msg }]);
      } catch (err) {}
    }
  };

  if (supabaseClient) {
    supabaseClient
      .channel('realtime_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_warga' }, payload => {
        const myIg = localStorage.getItem('piraku_my_ig') || '';
        if (payload.new && payload.new.sender_ig !== myIg) {
          appendChatToUI(payload.new.sender_ig, payload.new.message);
          if (!isChatModalOpen) {
            unreadChatCount++;
            const badge = document.getElementById('chat-unread-count');
            if (badge) {
              badge.innerText = unreadChatCount;
              badge.style.display = 'flex';
            }
          }
          showToast('💬 ' + payload.new.sender_ig + ': ' + payload.new.message.substring(0, 24));
        }
      })
      .subscribe();
  }

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
          if (localStorage.getItem('voted_policy') === item.id && btn) {
            btn.classList.add('voted');
          }
        });
      }
    } catch(e){}
  }

  window.votePolicy = async function(policyId) {
    if (localStorage.getItem('voted_policy')) {
      showToast('Kamu sudah menyalurkan suara di polling ini! 🗳️');
      return;
    }
    localStorage.setItem('voted_policy', policyId);
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

  // Selfie Mode
  window.takeCitizenSelfiePoster = function() {
    closeKTP();
    const myIg = localStorage.getItem('piraku_my_ig');
    const myCitizen = registeredCitizensList.find(c => c.ig && c.ig.toLowerCase() === (myIg || '').toLowerCase());
    
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

  // ================= AUTH: SWITCH TAB MASUK VS DAFTAR =================
  let currentAuthTab = 'login';
  window.switchAuthTab = function(tab) {
    currentAuthTab = tab;
    const tabLogin = document.getElementById('tab-btn-login');
    const tabSignup = document.getElementById('tab-btn-signup');
    const formLogin = document.getElementById('auth-form-login');
    const formSignup = document.getElementById('auth-form-signup');

    if (tab === 'login') {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      formLogin.style.display = 'block';
      formSignup.style.display = 'none';
      document.getElementById('auth-modal-title').innerText = 'Masuk Akun Warga 🔑';
    } else {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      formLogin.style.display = 'none';
      formSignup.style.display = 'block';
      document.getElementById('auth-modal-title').innerText = 'Daftar Akun Warga Baru 📜';
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
  window.pickRole = (el, r, e) => { document.querySelectorAll('.role-chip').forEach(c => c.classList.remove('selected')); el.classList.add('selected'); selectedRole = r; selectedEmoji = e; };
  window.pickAcc = (el, a) => { document.querySelectorAll('.acc-chip').forEach(c => c.classList.remove('selected')); el.classList.add('selected'); selectedAcc = a; };
  window.pickColor = (el, hex) => { document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected')); el.classList.add('selected'); selectedColor = hex; };

  // PROSES 1: LOGIN CEPAT
  window.processUserLogin = async function() {
    const rawIg = document.getElementById('login-ig').value.trim();
    const pin = document.getElementById('login-pin').value.trim();

    if (!rawIg) { alert('Masukkan username Instagram kamu!'); return; }
    if (!pin || pin.length < 4) { alert('Masukkan 4 angka PIN keamanan akunmu!'); return; }

    const cleanHandle = rawIg.replace(/^@+/, '').trim().toLowerCase();
    const formattedIg = '@' + cleanHandle;

    const btn = document.getElementById('btn-submit-login');
    btn.disabled = true; btn.innerText = 'Memverifikasi akun...';

    if (supabaseClient) {
      try {
        const { data: user, error } = await supabaseClient
          .from('warga_piraku')
          .select('*')
          .or(`ig.ilike.${formattedIg},ig.ilike.${cleanHandle}`)
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

        localStorage.setItem('piraku_my_ig', user.ig);
        localStorage.setItem('piraku_my_level', user.level || 1);
        localStorage.setItem('piraku_my_kec', user.kecamatan || 'Bandung Wetan');

        let foundMesh = animC.find(a => a.userData.a.c.ig.toLowerCase() === user.ig.toLowerCase());
        if (!foundMesh) {
          foundMesh = createCitizenMesh(user);
        }
        setupActivePlayer(foundMesh, user);

        updateAutoDetectButton();
        btn.disabled = false; btn.innerText = 'Masuk & Mainkan Karakter 🎮';
        closeJoinModal();
        showToast('Selamat datang kembali, ' + user.ig + '! 🎮');
        return;
      } catch (err) {}
    }
    btn.disabled = false; btn.innerText = 'Masuk & Mainkan Karakter 🎮';
  };

  // PROSES 2: DAFTAR WARGA BARU
  window.processUserSignup = async function() {
    const rawIg = document.getElementById('signup-ig').value.trim();
    const pin = document.getElementById('signup-pin').value.trim();
    const name = document.getElementById('signup-name').value.trim() || 'Warga Baru';
    const kecamatan = document.getElementById('signup-kecamatan').value;
    const wish = document.getElementById('signup-wish').value.trim() || 'Bandung makin asri dan ramah pejalan kaki!';

    if (!rawIg) { alert('Masukkan username Instagram kamu!'); return; }
    if (!pin || pin.length < 4) { alert('Buat 4 angka PIN keamanan akunmu!'); return; }

    const cleanHandle = rawIg.replace(/^@+/, '').trim().toLowerCase();
    const formattedIg = '@' + cleanHandle;

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
          .or(`ig.ilike.${formattedIg},ig.ilike.${cleanHandle}`)
          .maybeSingle();

        if (exist) {
          alert('Username ' + formattedIg + ' sudah terdaftar! Silakan login di tab "Masuk Akun".');
          btn.disabled = false; btn.innerText = 'Daftar Jadi Warga Resmi 📜';
          switchAuthTab('login');
          document.getElementById('login-ig').value = formattedIg;
          return;
        }

        const safeSpawn = getSafeGasibuPos();
        const newCit = { 
          name, 
          ig: formattedIg, 
          pin_warga: pin, 
          role: selectedRole, 
          acc: selectedAcc, 
          color: selectedColor, 
          kecamatan, 
          wish, 
          upvotes: 0, 
          level: 1, 
          xp: 0, 
          device_token: myDeviceToken,
          x: parseFloat(safeSpawn.x.toFixed(2)), 
          z: parseFloat(safeSpawn.z.toFixed(2))
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
        localStorage.setItem('piraku_my_kec', newCit.kecamatan);
        updateAutoDetectButton();

        btn.disabled = false; btn.innerText = 'Daftar Jadi Warga Resmi 📜';
        closeJoinModal();

        document.getElementById('ktp-reg-num').innerText = 'NO: BDG-' + String(totalWarga).padStart(3, '0');
        document.getElementById('ktp-name').innerText = name; 
        document.getElementById('ktp-kec').innerText = kecamatan;
        document.getElementById('ktp-ig').innerText = newCit.ig;
        document.getElementById('ktp-avatar-emoji').innerText = selectedEmoji; 
        document.getElementById('ktp-avatar-role').innerText = selectedRole.toUpperCase();
        document.getElementById('ktp-level-text').innerText = 'Lv. 1';
        document.getElementById('ktp-quote').innerText = '“' + wish + '”'; 
        document.getElementById('ktp-modal').style.display = 'flex';
        return;
      } catch (err) {}
    }
    btn.disabled = false; btn.innerText = 'Daftar Jadi Warga Resmi 📜';
  };

  window.closeKTP = () => { 
    const m = document.getElementById('ktp-modal');
    if (m) m.style.display = 'none'; 
  };

  // HUD Handlers
  window.updateAutoDetectButton = function() {
    const savedIg = localStorage.getItem('piraku_my_ig');
    const savedLvl = localStorage.getItem('piraku_my_level') || 1;
    const btn = document.getElementById('btn-citizen-status');
    if (!btn) return;
    if (savedIg) { 
      btn.className = 'btn-my-citizen'; 
      btn.innerHTML = `<span>👤 ${savedIg}</span><span class="player-level-badge">LEVEL ${savedLvl}</span>`; 
    } else { 
      btn.className = 'btn-join'; 
      btn.innerHTML = '<span>+</span> Masuk / Daftar'; 
    }
  };

  window.handleCitizenButtonClick = function() {
    const savedIg = localStorage.getItem('piraku_my_ig');
    if (savedIg) {
      const found = registeredCitizensList.find(c => c.ig && c.ig.toLowerCase() === savedIg.toLowerCase());
      if (found) { 
        showCitizenSpeech(found); 
        showToast('Kamera menyorot kamu! ✨'); 
      } else openJoinModal();
    } else openJoinModal();
  };

  window.resetMyDeviceCitizen = function() {
    if (confirm('Keluar dari akun di perangkat ini?')) { 
      localStorage.removeItem('piraku_my_ig'); 
      localStorage.removeItem('piraku_my_level');
      myPlayerMesh = null;
      isControlledByPlayer = false;
      activeQuestSystem = null;
      const joyZone = document.getElementById('joystick-zone');
      if (joyZone) joyZone.style.display = 'none';
      const hud = document.getElementById('player-profile-hud');
      if (hud) hud.style.display = 'none';
      updateAutoDetectButton(); 
      closeKTP(); 
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
  };
  window.closeLeaderboardModal = function() {
    const modal = document.getElementById('leaderboard-modal'); 
    if (modal) {
      modal.querySelector('.modal-card').style.transform = 'translateY(100%)';
      setTimeout(() => modal.style.display = 'none', 280);
    }
  };
  const esc = s => String(s || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  function renderLeaderboard() {
    const sorted = [...registeredCitizensList].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 5);
    const containerEl = document.getElementById('leaderboard-items');
    if (!containerEl) return;
    containerEl.innerHTML = sorted.map((c, idx) => `
      <div class="leader-item" onclick="teleportToCitizen('${esc(c.ig)}')">
        <div class="leader-rank">${['🥇','🥈','🥉'][idx] || '#' + (idx + 1)}</div>
        <div class="leader-info">
          <div class="leader-user">${esc(c.ig)} <span style="font-size:9.5px;color:var(--sub);font-weight:600">(${esc(c.kecamatan || 'Bandung')})</span></div>
          <div class="leader-wish">"${esc(c.wish)}"</div>
        </div>
        <div class="leader-votes">❤️ ${c.upvotes || 0}</div>
      </div>
    `).join('');
  }
  window.teleportToCitizen = function(ig) { closeLeaderboardModal(); const found = registeredCitizensList.find(c => c.ig === ig); if (found) showCitizenSpeech(found); };

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

    let s = (parseInt(localStorage.getItem('user_streak') || '0') % 7) + 1;
    localStorage.setItem('user_streak', s);

    let curLvl = parseInt(localStorage.getItem('piraku_my_level') || '1');
    curLvl += 1;
    localStorage.setItem('piraku_my_level', curLvl);
    updateAutoDetectButton();
    
    if (s === 7) {
      showToast('🎉 SELAMAT H-7! Rumah kamu terbit di perumahan Bandung!');
      window.playSynthTone(1050, 'sine', 0.5);

      const targetCitizen = registeredCitizensList.find(c => c.ig && c.ig.toLowerCase() === cleanIg);
      if (targetCitizen) {
        targetCitizen.has_house = true;
        const hData = spawnCitizenHouse(targetCitizen, registeredCitizensList.length);
        
        const animObj = animC.find(a => a.userData.a.c.ig.toLowerCase() === cleanIg);
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
          }).ilike('ig', cleanIg);
        }
      }
    } else {
      showToast('Absen H-' + s + ' berhasil! +50 XP (Naik ke Lv. ' + curLvl + ') 🚀');
      window.playSynthTone(620, 'sine', 0.2);
      if (supabaseClient) {
        await supabaseClient.from('warga_piraku').update({ level: curLvl }).ilike('ig', cleanIg);
      }
    }
    setTimeout(() => closeCheckinModal(), 1200);
  };

  window.applyMode = function(m) {
    const isR = m === 'reborn'; curMode = m; setVitals(m, totalWarga);
    document.getElementById('btn-mode-reborn').className = 'btn-mode g ' + (isR ? 'active' : '');
    document.getElementById('btn-mode-now').className = 'btn-mode r ' + (!isR ? 'active' : '');
    document.getElementById('badge-status').textContent = isR ? 'Mode Reborn' : 'Darurat macet';
    document.getElementById('badge-status').style.color = isR ? '#6fe3a3' : '#ff8a7a';
    document.getElementById('status-title').textContent = isR ? 'Bandung Reborn: Trem Listrik & Plaza Hijau' : 'Kondisi Sekarang: Macet & Polusi Knalpot';
    gsap.to(rebornGroup.scale, { y: isR ? 1 : 0.001, duration: 0.5 });
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
    html2canvas(document.getElementById('ktp-card-export'), { scale: 3, backgroundColor: null, useCORS: true }).then(canvas => {
      const a = document.createElement('a'); a.download = 'E-KTP_Bandung_' + (document.getElementById('ktp-ig').innerText.replace('@', '') || 'Warga') + '.png';
      a.href = canvas.toDataURL('image/png'); a.click();
    });
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
    const f = registeredCitizensList.find(c => (c.ig && c.ig.toLowerCase().includes(q)) || (c.name && c.name.toLowerCase().includes(q)) || (c.kecamatan && c.kecamatan.toLowerCase().includes(q)));
    if (f) showCitizenSpeech(f);
  };

  // ================= KONTROL PEMAIN (WASD & VIRTUAL JOYSTICK) =================
  const keys = { w: false, a: false, s: false, d: false };
  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (keys.hasOwnProperty(k)) keys[k] = true;
  });
  window.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    if (keys.hasOwnProperty(k)) keys[k] = false;
  });

  const joystickZone = document.getElementById('joystick-zone');
  const joystickKnob = document.getElementById('joystick-knob');
  let joyVector = { x: 0, y: 0 };
  let joyActive = false;
  let joyCenter = { x: 0, y: 0 };

  if (joystickZone) {
    joystickZone.addEventListener('touchstart', e => {
      joyActive = true;
      const touch = e.touches[0];
      const rect = joystickZone.getBoundingClientRect();
      joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      if (!joyActive) return;
      const touch = e.touches[0];
      let dx = touch.clientX - joyCenter.x;
      let dy = touch.clientY - joyCenter.y;
      const dist = Math.hypot(dx, dy);
      const maxR = 36;

      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }

      if (joystickKnob) joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      joyVector = { x: dx / maxR, y: dy / maxR };
    }, { passive: false });

    window.addEventListener('touchend', () => {
      joyActive = false;
      if (joystickKnob) joystickKnob.style.transform = 'translate(0, 0)';
      joyVector = { x: 0, y: 0 };
    });
  }

  function updatePlayerMovement(delta) {
    if (!myPlayerMesh) return;

    let moveX = 0, moveZ = 0;
    const speed = 8.5 * delta;

    if (keys.w) moveZ += 1;
    if (keys.s) moveZ -= 1;
    if (keys.a) moveX += 1;
    if (keys.d) moveX -= 1;

    if (joyActive) {
      moveX -= joyVector.x;
      moveZ -= joyVector.y;
    }

    const hasInput = (moveX !== 0 || moveZ !== 0);

    if (hasInput) {
      controls.enabled = false;

      const angle = Math.atan2(moveX, moveZ);
      myPlayerMesh.rotation.y = angle;

      const len = Math.hypot(moveX, moveZ);
      myPlayerMesh.position.x += (moveX / len) * speed;
      myPlayerMesh.position.z += (moveZ / len) * speed;

      myPlayerMesh.position.x = Math.max(-45, Math.min(45, myPlayerMesh.position.x));
      myPlayerMesh.position.z = Math.max(-40, Math.min(30, myPlayerMesh.position.z));

      myPlayerMesh.userData.a.c.x = myPlayerMesh.position.x;
      myPlayerMesh.userData.a.c.z = myPlayerMesh.position.z;

      // Smooth Follow Camera
      const camTargetX = myPlayerMesh.position.x;
      const camTargetZ = myPlayerMesh.position.z;
      
      controls.target.x += (camTargetX - controls.target.x) * 0.12;
      controls.target.y += (1.4 - controls.target.y) * 0.12;
      controls.target.z += (camTargetZ - controls.target.z) * 0.12;
      
      cam.position.x += (camTargetX - 3.5 - cam.position.x) * 0.08;
      cam.position.y += (4.5 - cam.position.y) * 0.08;
      cam.position.z += (camTargetZ - 7.5 - cam.position.z) * 0.08;

      const a = myPlayerMesh.userData.a;
      const s = Math.sin(clockTime * 12);
      a.body.position.y = Math.abs(s) * 0.09;
      a.armL.rotation.x = s * 0.85;
      a.armR.rotation.x = -s * 0.85;
    } else {
      controls.enabled = true;
    }
  }

  // ================= ANIMATION LOOP =================
  let clockTime = 0, isTabHidden = false;
  document.addEventListener('visibilitychange', () => { isTabHidden = document.hidden; });

  function animate() {
    requestAnimationFrame(animate);
    if (isTabHidden) return;

    clockTime += 0.016;
    if (controls.enabled) controls.update();
    applyGrowth();
    updTrees(clockTime);
    updV(clockTime, curMode === 'reborn');

    updatePlayerMovement(0.016);

    // Update Deteksi Quest
    if (activeQuestSystem && myPlayerMesh) {
      activeQuestSystem.update(0.016, myPlayerMesh.position);
    }

    animC.forEach(g => {
      if (g === myPlayerMesh) return;

      const a = g.userData.a;
      let isWalking = 0;

      if (a.walk && a.c !== activeCitizenTarget) {
        const dx = a.tx - g.position.x, dz = a.tz - g.position.z, d = Math.hypot(dx, dz);
        if (d < 0.4) {
          const nextTarget = getSafeGasibuPos();
          a.tx = nextTarget.x;
          a.tz = nextTarget.z;
        } else {
          isWalking = 1;
          g.position.x += (dx / d) * 0.015;
          g.position.z += (dz / d) * 0.015;
          a.c.x = g.position.x;
          a.c.z = g.position.z;
          g.rotation.y = Math.atan2(dx, dz);
        }
      }
      const s = Math.sin(clockTime * (isWalking ? 8 : 2.5) + a.ph);
      a.body.position.y = Math.abs(s) * (isWalking ? 0.07 : 0.035);
      a.armL.rotation.x = s * (isWalking ? 0.8 : 0.4);
      a.armR.rotation.x = -s * (isWalking ? 0.8 : 0.4);
    });

    headW.rotation.y = Math.sin(clockTime * 0.8) * 0.15;
    tram.position.set(Math.sin(clockTime * 0.6) * 18, .26, 2.7);

    updateBubblePos();
    updateOverheadBubblesPos();
    updAtmos(clockTime); 
    stars.position.copy(cam.position);
    sky.position.copy(cam.position);
    renderer.render(scene, cam);
  }
  animate();

  gsap.from(cam.position, { x: -120, y: 110, z: -170, duration: 3.4, ease: 'power3.out', delay: .2 });
})();
