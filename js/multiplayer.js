// ================= PIRAKUBDG REALTIME MULTIPLAYER (SUPABASE) =================
(function() {
  const MP_CHANNEL_NAME = 'pirakubdg-live-city';
  const SEND_INTERVAL_MS = 90;
  let mpChannel = null;
  let mySessionId = 'guest-' + Math.random().toString(36).substring(2, 9);
  const remotePlayers = new Map(); // sessionId -> { mesh, targetX, targetZ, targetRotY, ig, lastSeen, isMoving }
  let lastBroadcastTime = 0;

  function createOnlineHudBadge() {
    if (document.getElementById('mp-online-badge')) return;
    const badge = document.createElement('div');
    badge.id = 'mp-online-badge';
    badge.style.cssText = [
      'position:fixed',
      'bottom:14px',
      'right:14px',
      'z-index:999',
      'background:rgba(15, 23, 42, 0.85)',
      'backdrop-filter:blur(8px)',
      'border:1px solid rgba(74, 222, 128, 0.45)',
      'color:#f8fafc',
      'padding:6px 12px',
      'border-radius:999px',
      'font-family:inherit',
      'font-size:11px',
      'font-weight:700',
      'display:flex',
      'align-items:center',
      'gap:6px',
      'box-shadow:0 4px 14px rgba(0,0,0,0.35)',
      'pointer-events:auto',
      'cursor:pointer'
    ].join(';');
    badge.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;display:inline-block;"></span><span id="mp-online-count">1 Wargi Online</span>';
    badge.title = 'Wargi yang sedang aktif jalan-jalan di Bandung secara real-time';
    document.body.appendChild(badge);
  }

  function updateOnlineCount(count) {
    const el = document.getElementById('mp-online-count');
    if (el) {
      el.textContent = Math.max(1, count) + ' Wargi Online';
    }
  }

  function getMyIdentity() {
    const ig = localStorage.getItem('piraku_my_ig') || ('Tamu_' + mySessionId.slice(-4));
    const kec = localStorage.getItem('piraku_my_kec') || 'Bandung Wetan';
    return { sessionId: mySessionId, ig: ig, kecamatan: kec };
  }

  function getOrCreateRemoteAvatar(payload) {
    if (!payload || !payload.sessionId || payload.sessionId === mySessionId) return null;
    if (typeof scene === 'undefined') return null;

    let entry = remotePlayers.get(payload.sessionId);
    if (entry && entry.mesh) {
      return entry;
    }

    // Gunakan createCitizenMesh jika tersedia, atau fallback kapsul 3D low-poly
    let mesh = null;
    if (typeof createCitizenMesh === 'function') {
      try {
        mesh = createCitizenMesh({
          ig: payload.ig || 'Wargi',
          kecamatan: payload.kecamatan || 'Bandung',
          pesan: 'Sedang online!',
          isRemoteLive: true
        });
      } catch (e) {
        mesh = null;
      }
    }

    if (!mesh && typeof THREE !== 'undefined') {
      mesh = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.32, 0.9, 12),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 })
      );
      body.position.y = 0.45;
      body.castShadow = true;

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 14, 14),
        new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.4 })
      );
      head.position.y = 1.08;
      head.castShadow = true;

      // Ring hijau penanda live online di bawah kaki
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.36, 0.46, 24),
        new THREE.MeshBasicMaterial({ color: 0x4ade80, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;

      mesh.add(body, head, ring);
      scene.add(mesh);
    }

    if (mesh) {
      mesh.position.set(payload.x || 0, 0, payload.z || 0);
      entry = {
        mesh: mesh,
        targetX: payload.x || 0,
        targetZ: payload.z || 0,
        targetRotY: payload.rotY || 0,
        ig: payload.ig || 'Wargi',
        lastSeen: Date.now(),
        walkPhase: 0
      };
      remotePlayers.set(payload.sessionId, entry);
    }
    return entry;
  }

  function removeRemoteAvatar(sessionId) {
    const entry = remotePlayers.get(sessionId);
    if (entry && entry.mesh && typeof scene !== 'undefined') {
      scene.remove(entry.mesh);
    }
    remotePlayers.delete(sessionId);
  }

  // Dipanggil dari loop render (60 FPS) untuk interpolasi mulus
  window.updateMultiplayerFrame = function(delta) {
    const now = Date.now();
    const dt = Math.min(delta || 0.016, 0.1);

    // 1. Broadcast posisi karakter aktif kita ke pemain lain
    if (mpChannel && now - lastBroadcastTime >= SEND_INTERVAL_MS) {
      let activeObj = null;
      if (typeof activePlayerMesh !== 'undefined' && activePlayerMesh) {
        activeObj = activePlayerMesh;
      } else if (typeof playerMesh !== 'undefined' && playerMesh) {
        activeObj = playerMesh;
      } else if (typeof myPlayerMesh !== 'undefined' && myPlayerMesh) {
        activeObj = myPlayerMesh;
      }

      if (activeObj && activeObj.position) {
        lastBroadcastTime = now;
        const id = getMyIdentity();
        mpChannel.send({
          type: 'broadcast',
          event: 'pos',
          payload: {
            sessionId: id.sessionId,
            ig: id.ig,
            kecamatan: id.kecamatan,
            x: Number(activeObj.position.x.toFixed(3)),
            z: Number(activeObj.position.z.toFixed(3)),
            rotY: Number((activeObj.rotation ? activeObj.rotation.y : 0).toFixed(3))
          }
        });
      }
    }

    // 2. Interpolasi (Lerp) pergerakan avatar pemain lain
    remotePlayers.forEach((entry, sid) => {
      if (now - entry.lastSeen > 20000) {
        removeRemoteAvatar(sid);
        return;
      }
      if (!entry.mesh) return;

      const dx = entry.targetX - entry.mesh.position.x;
      const dz = entry.targetZ - entry.mesh.position.z;
      const distSq = dx * dx + dz * dz;

      entry.mesh.position.x += (entry.targetX - entry.mesh.position.x) * Math.min(1, dt * 10);
      entry.mesh.position.z += (entry.targetZ - entry.mesh.position.z) * Math.min(1, dt * 10);
      if (entry.mesh.rotation) {
        entry.mesh.rotation.y += (entry.targetRotY - entry.mesh.rotation.y) * Math.min(1, dt * 12);
      }

      // Efek memantul ringan saat bergerak
      if (distSq > 0.002) {
        entry.walkPhase += dt * 14;
        entry.mesh.position.y = Math.abs(Math.sin(entry.walkPhase)) * 0.08;
      } else {
        entry.mesh.position.y *= 0.8;
      }
    });
  };

  // Fungsi helper untuk broadcast curhat/emote secara langsung
  window.broadcastLiveChat = function(message) {
    if (!mpChannel || !message) return;
    const id = getMyIdentity();
    mpChannel.send({
      type: 'broadcast',
      event: 'chat',
      payload: {
        sessionId: id.sessionId,
        ig: id.ig,
        message: String(message).slice(0, 140)
      }
    });
  };

  function initPirakuMultiplayer() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      setTimeout(initPirakuMultiplayer, 500);
      return;
    }

    createOnlineHudBadge();
    const myInfo = getMyIdentity();

    mpChannel = supabaseClient.channel(MP_CHANNEL_NAME, {
      config: {
        presence: { key: mySessionId },
        broadcast: { self: false }
      }
    });

    mpChannel
      .on('presence', { event: 'sync' }, () => {
        const state = mpChannel.presenceState();
        const activeKeys = Object.keys(state);
        updateOnlineCount(activeKeys.length);

        // Bersihkan avatar yang sudah disconnect
        remotePlayers.forEach((_, sid) => {
          if (!state[sid]) {
            removeRemoteAvatar(sid);
          }
        });
      })
      .on('broadcast', { event: 'pos' }, ({ payload }) => {
        const entry = getOrCreateRemoteAvatar(payload);
        if (entry) {
          entry.targetX = payload.x;
          entry.targetZ = payload.z;
          entry.targetRotY = payload.rotY;
          entry.lastSeen = Date.now();
        }
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        if (!payload || payload.sessionId === mySessionId) return;
        const entry = remotePlayers.get(payload.sessionId);
        if (entry && entry.mesh && typeof showCitizenSpeech === 'function') {
          showCitizenSpeech({
            ig: payload.ig,
            pesan: payload.message,
            mesh: entry.mesh
          });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await mpChannel.track({
            ig: myInfo.ig,
            kecamatan: myInfo.kecamatan,
            online_at: new Date().toISOString()
          });
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPirakuMultiplayer);
  } else {
    setTimeout(initPirakuMultiplayer, 400);
  }
})();
