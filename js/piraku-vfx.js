// piraku-vfx.js — lapisan efek visual tambahan: awan, hujan sesekali, debu langkah kaki.
(function () {
  "use strict";
  var Q = new URLSearchParams(location.search);
  var scene = null, cam = null, ctrl = null;
  var clouds = [], cloudMats = [], cloudBaseY = [];
  var rain = null, rainAmt = 0, rainOn = Q.get("rain") === "1", rainUntil = 0, nextRainAt = 0;
  var isMob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 820;
  var RAIN_N = isMob ? 350 : 700, rainDrops = null;
  var puffs = [], puffTimer = 0, lastP = null;
  var dbg = null, dbgT = 0;
  var last = 0, fails = 0, off = false;
  function hourNow() { return window.__fh != null ? window.__fh : new Date().getHours(); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function buildClouds() {
    var geo = new THREE.IcosahedronGeometry(1, 1);
    var g = new THREE.Group(); g.name = "piraku-vfx-clouds";
    for (var i = 0; i < 16; i++) {
      var mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false, depthWrite: false });
      cloudMats.push(mat);
      var c = new THREE.Group(), n = 3 + (i % 3);
      for (var k = 0; k < n; k++) {
        var m = new THREE.Mesh(geo, mat), s = 9 + ((i * 7 + k * 5) % 8);
        m.scale.set(s * 1.5, s * 0.55, s);
        m.position.set((k - n / 2) * s * 1.1, (k % 2) * 1.5, ((k * 3) % 5) - 2);
        c.add(m);
      }
      var ang = (i / 16) * Math.PI * 2, r = 120 + (i % 4) * 45, y = 95 + (i % 5) * 9;
      c.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r);
      c.userData.speed = 0.8 + (i % 4) * 0.35;
      cloudBaseY.push(y); clouds.push(c); g.add(c);
    }
    scene.add(g);
  }
  function updateClouds(dt) {
    var h = hourNow(), col = 0xffffff, base = 0.85;
    if (h >= 19 || h < 5) { col = 0x34435f; base = 0.28; }
    else if (h >= 17) { col = 0xffc59a; base = 0.8; }
    else if (h < 7) { col = 0xffe2d0; base = 0.8; }
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      c.position.x += c.userData.speed * dt;
      if (c.position.x > 280) c.position.x = -280;
      var k = clamp((cloudBaseY[i] - cam.position.y - 5) / 35, 0, 1);
      cloudMats[i].color.setHex(col);
      cloudMats[i].opacity = base * k;
      c.visible = k > 0.01;
    }
  }
  function buildRain() {
    var pos = new Float32Array(RAIN_N * 6);
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.LineBasicMaterial({ color: 0xbcd4ff, transparent: true, opacity: 0, fog: false, depthWrite: false });
    rain = new THREE.LineSegments(geo, mat);
    rain.frustumCulled = false; rain.visible = false;
    rainDrops = new Float32Array(RAIN_N * 3);
    for (var i = 0; i < RAIN_N; i++) {
      rainDrops[i * 3] = (Math.random() - 0.5) * 70;
      rainDrops[i * 3 + 1] = Math.random() * 40;
      rainDrops[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    scene.add(rain);
    nextRainAt = performance.now() / 1000 + 120 + Math.random() * 120;
  }
  function updateRain(dt, now) {
    var t = now / 1000;
    if (Q.get("rain") !== "1" && Q.get("rain") !== "0") {
      if (!rainOn && t > nextRainAt) {
        var h = hourNow();
        rainOn = h >= 13 && h <= 18 && Math.random() < 0.6;
        rainUntil = t + 70 + Math.random() * 40;
        nextRainAt = t + 240 + Math.random() * 180;
      } else if (rainOn && t > rainUntil) rainOn = false;
    }
    var target = rainOn ? 1 : 0;
    rainAmt += clamp(target - rainAmt, -0.5 * dt, 0.5 * dt);
    if (rainAmt < 0.01) { rain.visible = false; return; }
    rain.visible = true;
    rain.material.opacity = 0.55 * rainAmt;
    var c = ctrl && ctrl.target ? ctrl.target : cam.position;
    var p = rain.geometry.attributes.position.array, d = rainDrops;
    for (var i = 0; i < RAIN_N; i++) {
      var o = i * 3;
      d[o + 1] -= 38 * dt;
      if (d[o + 1] < 0) { d[o + 1] += 40; d[o] = (Math.random() - 0.5) * 70; d[o + 2] = (Math.random() - 0.5) * 70; }
      var x = c.x + d[o], y = d[o + 1], z = c.z + d[o + 2], q = i * 6;
      p[q] = x; p[q + 1] = y; p[q + 2] = z;
      p[q + 3] = x - 0.15; p[q + 4] = y - 1.2; p[q + 5] = z;
    }
    rain.geometry.attributes.position.needsUpdate = true;
  }
  function buildPuffs() {
    var geo = new THREE.SphereGeometry(0.16, 6, 5);
    for (var i = 0; i < 16; i++) {
      var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xd8cdb8, transparent: true, opacity: 0, depthWrite: false }));
      m.visible = false; m.userData.life = 0; scene.add(m); puffs.push(m);
    }
  }
  function updatePuffs(dt) {
    for (var i = 0; i < puffs.length; i++) {
      var m = puffs[i], L = m.userData.life;
      if (L <= 0) continue;
      L -= dt; m.userData.life = L;
      var k = 1 - L / 0.55;
      m.scale.setScalar(1 + k * 1.8);
      m.position.y += dt * 0.5;
      m.material.opacity = 0.4 * (1 - k);
      if (L <= 0) m.visible = false;
    }
    var pl = window.getMyActivePlayerMesh && window.getMyActivePlayerMesh();
    if (!pl || !pl.position) { lastP = null; return; }
    var px = pl.position.x, py = pl.position.y, pz = pl.position.z;
    if (lastP) {
      var spd = Math.hypot(px - lastP.x, pz - lastP.z) / Math.max(dt, 0.001);
      var grounded = Math.abs(py - lastP.y) < 0.02;
      puffTimer -= dt;
      if (spd > 2 && grounded && puffTimer <= 0) {
        puffTimer = 0.2;
        for (var j = 0; j < puffs.length; j++) {
          if (puffs[j].userData.life <= 0) {
            var m2 = puffs[j];
            m2.position.set(px + (Math.random() - 0.5) * 0.3, py + 0.08, pz + (Math.random() - 0.5) * 0.3);
            m2.scale.setScalar(1); m2.userData.life = 0.55; m2.visible = true;
            break;
          }
        }
      }
    }
    lastP = { x: px, y: py, z: pz };
  }
  function updateDebug(dt) {
    if (Q.get("debugcol") !== "1" || typeof window.pirakuGetColliders !== "function") return;
    dbgT -= dt; if (dbgT > 0) return; dbgT = 1.5;
    if (!dbg) { dbg = new THREE.Group(); dbg.name = "piraku-vfx-debug"; scene.add(dbg); }
    while (dbg.children.length) {
      var ch = dbg.children.pop(); dbg.remove(ch);
      if (ch.geometry) ch.geometry.dispose();
    }
    var mat = new THREE.LineBasicMaterial({ color: 0xff2d2d, fog: false });
    var list = window.pirakuGetColliders() || [];
    for (var i = 0; i < list.length && i < 400; i++) {
      var b = list[i], w = b.maxX - b.minX, dd = b.maxZ - b.minZ;
      var e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, 5, dd)), mat);
      e.position.set((b.minX + b.maxX) / 2, 2.5, (b.minZ + b.maxZ) / 2);
      dbg.add(e);
    }
  }
  function tick(now) {
    requestAnimationFrame(tick);
    if (off) return;
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (document.hidden || dt <= 0) return;
    try {
      updateClouds(dt); updateRain(dt, now); updatePuffs(dt); updateDebug(dt);
    } catch (e) {
      if (++fails > 5) { off = true; console.warn("[piraku-vfx] dimatikan karena error:", e); }
    }
  }
  var tries = 0, wait = setInterval(function () {
    scene = window.pirakuScene; cam = window.pirakuCamera; ctrl = window.pirakuControls;
    if (scene && cam && window.THREE) {
      clearInterval(wait);
      try { buildClouds(); buildRain(); buildPuffs(); } catch (e) { console.warn("[piraku-vfx] gagal init:", e); return; }
      last = performance.now(); requestAnimationFrame(tick);
    } else if (++tries > 200) clearInterval(wait);
  }, 300);
})();
