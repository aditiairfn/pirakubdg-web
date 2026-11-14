// ================ PIRAKUBDG REALTIME MULTIPLAYER & FLOATING CHAT =================
(function() {
  const SEND_INTERVAL_MS = 90;
  let mpChannel = null;
  let currentRoomKec = null;
  let mySessionId = 'guest-' + Math.random().toString(36).substring(2, 8);
  const remotePlayers = new Map();
  const activeBubbles = [];
  let lastBroadcastTime = 0;

  function getActiveCamera() {
    if (typeof cam !== 'undefined' && cam) return cam;
    if (typeof camera !== 'undefined' && camera) return camera;
    return null;
  }

  function getMyIdentity() {
    const savedIg = localStorage.getItem('piraku_my_ig');
    const ig = savedIg ? savedIg : ('Tamu_' + mySessionId.slice(-4));
    const kec = localStorage.getItem('piraku_my_kec') || 'Bandung Wetan';
    return { sessionId: mySessionId, ig: ig, kecamatan: kec, isGuest: !savedIg };
  }

  function injectQuickChatAndHud() {
    if (document.getElementById('mp-quick-bar')) return;

    const bubbleLayer = document.createElement('div');
    bubbleLayer.id = 'mp-bubble-layer';
    bubbleLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:990;overflow:hidden;';
    document.body.appendChild(bubbleLayer);

    const badge = document.createElement('div');
    badge.id = 'mp-online-badge';
    badge.style.cssText = [
      'position:fixed',
      'top:62px',
      'right:12px',
      'z-index:995',
      'background:rgba(15, 23, 42, 0.82)',
      'backdrop-filter:blur(8px)',
      'border:1px solid rgba(74, 222, 128, 0.45)',
      'color:#f8fafc',
      'padding:5px 10px',
      'border-radius:999px',
      'font-size:11px',
      'font-weight:700',
      'display:flex',
      'align-items:center',
      'gap:6px',
      'box-shadow:0 4px 12px rgba(0,0,0,0.3)'
    ].join(';');
    badge.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;"></span><span id="mp-online-count">1 Online</span>';
    document.body.appendChild(badge);

    const bar = document.createElement('div');
    bar.id = 'mp-quick-bar';
    bar.style.cssText = [
      'position:fixed',
      'bottom:14px',
      'left:50%',
      'transform:translateX(-50%)',
      'z-index:996',
      'display:flex',
      'align-items:center',
      'gap:6px',
      'background:rgba(15, 23, 42, 0.88)',
      'backdrop-filter:blur(10px)',
      'padding:6px 10px',
      'border-radius:999px',
      'border:1px solid rgba(255,255,255,0.16)',
      'box-shadow:0 8px 24px rgba(0,0,0,0.4)',
      'max-width:92vw'
    ].join(';');

    const emotes = ['\\u01F44B', '\\u2615', '\\u01F68B', '\\u01F525'];
    emotes.forEach(em => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = em;
      btn.style.cssText = 'background:rgba(255,255,255,0.1);border:none;border-radius:50%;width:28px;height:28px;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
      btn.onclick = () => sendChatMessage(em);
      bar.appendChild(btn);
    });

    const input = document.createElement('input');
    input.id = 'mp-chat-input';
    input.type = 'text';
    input.maxLength = 80;
    input.placeholder = 'Sapa wargi sekitar...';
    input.style.cssText = 'background:transparent;border:none;outline:none;color:#fff;font-size:12px;width:130px;padding:0 4px;';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        sendChatMessage(input.value.trim());
        input.value = '';
      }
    });

    const sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.textContent = 'Kirim';
    sendBtn.style.cssText = 'background:#22c55e;color:#052e16;border:none;border-radius:999px;padding:5px 11px;font-size:11px;font-weight:800;cursor:pointer;flex-shrink:0;';
    sendBtn.onclick = () => {
      if (input.value.trim()) {
        sendChatMessage(input.value.trim());
        input.value = '';
      }
    };

    bar.appendChild(input);
    bar.appendChild(sendBtn);
    document.body.appendChild(bar);
  }

  function spawnFloatingBubble(mesh, senderName, text) {
    const layer = document.getElementById('mp-bubble-layer');
    if (!layer || !mesh) return;

    for (let i = activeBubbles.length - 1; i >= 0; i--) {
      if (activeBubbles[i].mesh === mesh) {
        activeBubbles[i].el.remove();
        activeBubbles.splice(i, 1);
      }
    }

    const el = document.createElement('div');
    el.style.cssText = [
      'position:absolute',
      'left:0',
      'top:0',
      'transform:translate(-50%, -100%)',
      'background:rgba(255, 255, 255, 0.96),',
      'color:#0f172a',
      'padding:5px 10px',
      'border-radius:12px',
      'font-size:11px',
      'font-weight:700',
      'box-shadow:0 4px 12px rgba(0,0,0,0.28)',
      'max-width:170px',
      'text-align:center',
      'word-break:break-word',
      'transition:opacity 0.25s ease'
    ].join(';');
    el.innerHTML = '<div style="font-size:9px;color:#16a34a;font-weight:800;">' + senderName + '</div><div>' + text + '</div>';
    layer.appendChild(el);

    activeBubbles.push({
      mesh: mesh,
      el: el,
      expiresAt: Date.now() + 5000
    });
  }

  function sendChatMessage(msg) {
    const id = getMyIdentity();
    if (typeof myPlayerMesh !== 'undefined' && myPlayerMesh) {
      spawnFloatingBubble(myPlayerMesh, id.ig, msg);
    }
    if (mpChannel) {
      mpChannel.send({
        type: 'broadcast',
        event: 'chat',
        payload: {
          sessionId: id.sessionId,
          ig: id.ig,
          message: String(msg).slice(0, 80)
        }
      });
    }
  }

  window.broadcastLiveChat = sendChatMessage;

  function updateOnlineCount(count) {
    const el = document.getElementById('mp-online-count');
    if (el) el.textContent = Math.max(1, count) + ' Online';
  }

  function getOrCreateRemoteAvatar(payload) {
    if (!payload || !payload.sessionId || payload.sessionId === mySessionId) return null;
    if (typeof scene === 'undefined') return null;

    let entry = remotePlayers.get(payload.sessionId);
    if (entry && entry.mesh) return entry;

    let mesh = null;
    if (typeof createCitizenMesh === 'function') {
      try {
        mesh = createCitizenMesh({
          ig: payload.ig || 'Wargi',
          kecamatan: payload.kecamatan || 'Bandung',
          pesan: 'Online di sekitar',
          isRemoteLive: true
        });
      } catch (e) {
        mesh = null;
      }
    }

    if (!mesh && typeof THREE !== 'undefined') {
      mesh = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.3, 0.85, 10),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
      );
      body.position.y = 0.42;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfde68a })
      );
      head.position.y = 1.02;
      mesh.add(body, head);
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
      remotePlayers.set(payload.sessionId, undefined);
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

  function ensureGuestPlayerSpawned() {
    if (typeof myPlayerMesh !== 'undefined' && myPlayerMesh) return;
    if (typeof createCitizenMesh !== 'function' || typeof setupActivePlayer !== 'function') return;

    const id = getMyIdentity();
    const guestData = {
      ig: id.ig,
      kecamatan: id.kecamatan,
      pesan: 'Wargi tamu baru mampir!',
      warna: '#38bdf8',
      isGuest: true
    };
    const guestMesh = createCitizenMesh(guestData);
    if (guestMesh) {
      guestMesh.position.set((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4);
      setupActivePlayer(guestMesh, guestData);
    }
  }

  window.updateMultiplayerFrame = function(delta) {
    const now = Date.now();
    const dt = Math.min(delta || 0.016, 0.1);

    if (mpChannel && now - lastBroadcastTime >= SEND_INTERVAL_MS) {
      if (typeof myPlayerMesh !== 'undefined' && myPlayerMesh && myPlayerMesh.position) {
        lastBroadcastTime = now;
        const id = getMyIdentity();
        mpChannel.send({
          type: 'broadcast',
          event: 'pos',
          payload: {
            sessionId: id.sessionId,
            ig: id.ig,
            kecamatan: id.kecamatan,
            x: Number(myPlayerMesh.position.x.toFixed(3)),
            z: Number(myPlayerMesh.position.z.toFixed(3)),
            rotY: Number((myPlayerMesh.rotation ? myPlayerMesh.rotation.y : 0).toFixed(3))
          }
        });
      }
    }

    remotePlayers.forEach((entry, sid) => {
      if (now - entry.lastSeen > 20000) {
        removeRemoteAvatar(sid);
        return;
      }
      if (!entry.mesh) return;
      const dx = entry.targetX - entry.mesh.position.x;
      const dz = entry.targetZ - entry.mesh.position.z;
      const distSq = dx * dx + dz * dz;

      entry.mesh.position.x += dx * Math.min(1, dt * 10);
      entry.mesh.position.z += dz * Math.min(1, dt * 10);
      if (entry.mesh.rotation) {
        entry.mesh.rotation.y += (entry.targetRotY - entry.mesh.rotation.y) * Math.min(1, dt * 12);
      }
      if (distSq > 0.002) {
        entry.walkPhase += dt * 14;
        entry.mesh.position.y = Math.abs(Math.sin(entry.walkPhase)) * 0.08;
      } else {
        entry.mesh.position.y *= 0.8;
      }
    });

    const activeCam = getActiveCamera();
    if (activeCam && typeof THREE !== 'undefined' && activeBubbles.length > 0) {
      const tempV = new THREE.Vector3();
      for (let i = activeBubbles.length - 1; i >= 0; i--) {
        const b = activeBubbles[i];
        if (now > b.expiresAt || !b.mesh) {
          b.el.remove();
          activeBubbles.splice(i, 1);
          continue;
        }
        b.mesh.getWorldPosition(tempV);
        tempV.y += 1.75;
        tempV.project(activeCam);

        if (tempV.z > 1) {
          b.el.style.display = 'none';
        } else {
          const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
          b.el.style.display = 'block';
          b.el.style.left = x.toFixed(1) + 'px';
          b.el.style.top = y.toFixed(1) + 'px';
        }
      }
    }
  };

  window.switchMultiplayerDistrict = function(kecamatanName) {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    const targetKec = kecamatanName || 'Bandung Wetan';
    if (currentRoomKec === targetKec && mpChannel) return;

    if (mpChannel) {
      supabaseClient.removeChannel(mpChannel);
      remotePlayers.forEach((_, sid) => removeRemoteAvatar(sid));
    }

    currentRoomKec = targetKec;
    const slug = targetKec.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const myInfo = getMyIdentity();

    mpChannel = supabaseClient.channel('pirakubdg-kec-' + slug, {
      config: {
        presence: { key: mySessionId },
        broadcast: { self: false }
      }
    });

    mpChannel
      .on('presence', { event: 'sync' }, () => {
        const state = mpChannel.presenceState();
        updateOnlineCount(Object.keys(state).length);
        remotePlayers.forEach((_, sid) => {
          if (!state[sid]) removeRemoteAvatar(sid);
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
        if (entry && entry.mesh) {
          spawnFloatingBubble(entry.mesh, payload.ig, payload.message);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED'){
          await mpChannel.track({
            ig: myInfo.ig,
            kecamatan: targetKec,
            online_at: new Date().toISOString()
          });
        }
      });
  };

  function initPirakuMultiplayer() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      setTimeout(initPirakuMultiplayer, 400);
      return;
    }
    injectQuickChatAndHud();
    const myInfo = getMyIdentity();
    window.switchMultiplayerDistrict(myInfo.kecamatan);
    setTimeout(ensureGuestPlayerSpawned, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPirakuMultiplayer);
  } else {
    setTimeout(initPirakuMultiplayer, 300);
  }
})();
