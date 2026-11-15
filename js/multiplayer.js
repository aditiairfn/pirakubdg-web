// ================= PIRAKUBDG GLOBAL REALTIME MULTIPLAYER & PROXIMITY VOICE CHAT =================
(function() {
  const SEND_INTERVAL_MS = 90;
  const GLOBAL_CHANNEL_NAME = 'pirakubdg-global-world-v1';
  const VOICE_MAX_DIST = 24;

  let mpChannel = null;
  let mySessionId = 'wargi-' + Math.random().toString(36).substring(2, 8);
  const remotePlayers = new Map();
  const activeBubbles = [];
  let lastBroadcastTime = 0;

  // State WebRTC Voice Chat
  let localAudioStream = null;
  let isMicEnabled = false;
  const peerConnections = new Map();
  const remoteAudioEls = new Map();
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  function getActiveCamera() {
    if (typeof cam !== 'undefined' && cam) return cam;
    if (typeof camera !== 'undefined' && camera) return camera;
    return null;
  }

  function getMyIdentity() {
    const savedIg = localStorage.getItem('piraku_my_ig');
    const ig = savedIg ? savedIg : ('Tamu_' + mySessionId.slice(-4));
    const kec = localStorage.getItem('piraku_my_kec') || 'Bandung';
    let color = 0x2d6a4f;
    let acc = 'none';
    if (typeof myPlayerMesh !== 'undefined' && myPlayerMesh?.userData?.a?.c) {
      color = myPlayerMesh.userData.a.c.color || color;
      acc = myPlayerMesh.userData.a.c.acc || acc;
    }
    return { sessionId: mySessionId, ig, kecamatan: kec, color, acc, isGuest: !savedIg };
  }

  function injectBubbleLayer() {
    if (document.getElementById('mp-bubble-layer')) return;
    const bubbleLayer = document.createElement('div');
    bubbleLayer.id = 'mp-bubble-layer';
    bubbleLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:990;overflow:hidden;';
    document.body.appendChild(bubbleLayer);
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
    el.style.cssText = 'position:absolute;left:0;top:0;transform:translate(-50%,-100%);background:rgba(19,27,46,0.94);color:#f8fafc;border:1px solid rgba(56,189,248,0.4);padding:5px 10px;border-radius:12px;font-size:11px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:175px;text-align:center;word-break:break-word;transition:opacity 0.25s ease;';
    el.innerHTML = '<div style="font-size:9px;color:#38bdf8;font-weight:800;">' + senderName + '</div><div>' + text + '</div>';
    layer.appendChild(el);

    activeBubbles.push({ mesh, el, expiresAt: Date.now() + 5000 });
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
        payload: { sessionId: id.sessionId, ig: id.ig, message: String(msg).slice(0, 80) }
      });
    }
  }
  window.broadcastLiveChat = sendChatMessage;

  function updateOnlineCount(count) {
    const total = Math.max(1, count);
    const el = document.getElementById('top-online-count');
    if (el) el.textContent = total + ' Warga Online';
  }

  function getOrCreateRemoteAvatar(payload) {
    if (!payload || !payload.sessionId || payload.sessionId === mySessionId) return null;
    if (typeof scene === 'undefined') return null;

    let entry = remotePlayers.get(payload.sessionId);
    if (entry && entry.mesh) {
      // Update outfit live jika warga mengganti baju/aksesoris
      if ((payload.color && entry.color !== payload.color) || (payload.acc && entry.acc !== payload.acc)) {
        if (typeof citizensGroup !== 'undefined') citizensGroup.remove(entry.mesh);
        else scene.remove(entry.mesh);
        entry.mesh = null;
      } else {
        return entry;
      }
    }

    let mesh = null;
    if (typeof createCitizenMesh === 'function') {
      try {
        mesh = createCitizenMesh({
          ig: payload.ig || 'Wargi',
          kecamatan: payload.kecamatan || 'Bandung',
          wish: 'Wargi online di Gasibu',
          color: payload.color || 0x2563eb,
          acc: payload.acc || 'none',
          x: payload.x || 0,
          z: payload.z || 0,
          isRemoteLive: true
        });
      } catch (e) {
        mesh = null;
      }
    }

    if (!mesh && typeof THREE !== 'undefined') {
      mesh = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.28, 0.8, 12),
        new THREE.MeshStandardMaterial({ color: payload.color || 0x38bdf8 })
      );
      body.position.y = 0.4;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfde68a })
      );
      head.position.y = 0.98;
      mesh.add(body, head);
      scene.add(mesh);
    }

    if (mesh) {
      mesh.position.set(payload.x || 0, 0.1, payload.z || 0);
      if (mesh.userData && mesh.userData.a) {
        mesh.userData.a.walk = false; // Dikendalikan langsung oleh posisi realtime!
      }
      entry = {
        mesh,
        targetX: payload.x || 0,
        targetZ: payload.z || 0,
        targetRotY: payload.rotY || 0,
        ig: payload.ig || 'Wargi',
        color: payload.color,
        acc: payload.acc,
        lastSeen: Date.now(),
        walkPhase: 0
      };
      remotePlayers.set(payload.sessionId, entry);
    }
    return entry;
  }

  function removeRemoteAvatar(sessionId) {
    const entry = remotePlayers.get(sessionId);
    if (entry && entry.mesh) {
      if (typeof citizensGroup !== 'undefined') citizensGroup.remove(entry.mesh);
      if (typeof scene !== 'undefined') scene.remove(entry.mesh);
    }
    remotePlayers.delete(sessionId);
    closePeerVoice(sessionId);
  }

  // ================= WEBRTC PROXIMITY VOICE CHAT =================
  function updateMicButtonUi() {
    const btn = document.getElementById('btn-voice-mic');
    if (!btn) return;
    if (isMicEnabled) {
      btn.style.background = 'linear-gradient(135deg, #16a34a, #22c55e)';
      btn.style.borderColor = '#86efac';
      btn.style.color = '#ffffff';
      btn.innerHTML = '🎙️ Mic Live';
    } else {
      btn.style.background = 'rgba(19, 27, 46, 0.9)';
      btn.style.borderColor = 'rgba(148, 163, 184, 0.3)';
      btn.style.color = '#f8fafc';
      btn.innerHTML = '🔇 Mic Off';
    }
  }

  function closePeerVoice(remoteSid) {
    const pc = peerConnections.get(remoteSid);
    if (pc) {
      try { pc.close(); } catch (_) {}
      peerConnections.delete(remoteSid);
    }
    const aud = remoteAudioEls.get(remoteSid);
    if (aud) {
      aud.srcObject = null;
      aud.remove();
      remoteAudioEls.delete(remoteSid);
    }
  }

  function createPeerConnection(remoteSid, isInitiator) {
    if (peerConnections.has(remoteSid)) return peerConnections.get(remoteSid);
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnections.set(remoteSid, pc);

    if (localAudioStream) {
      localAudioStream.getTracks().forEach(track => pc.addTrack(track, localAudioStream));
    }

    pc.onicecandidate = (e) => {
      if (e.candidate && mpChannel) {
        mpChannel.send({
          type: 'broadcast',
          event: 'rtc-ice',
          payload: { from: mySessionId, to: remoteSid, candidate: e.candidate }
        });
      }
    };

    pc.ontrack = (e) => {
      let aud = remoteAudioEls.get(remoteSid);
      if (!aud) {
        aud = document.createElement('audio');
        aud.autoplay = true;
        aud.playsInline = true;
        document.body.appendChild(aud);
        remoteAudioEls.set(remoteSid, aud);
      }
      aud.srcObject = e.streams[0];
      aud.play().catch(() => {});
    };

    pc.onconnectionstatechange = () => {
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        closePeerVoice(remoteSid);
      }
    };

    if (isInitiator) {
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          if (mpChannel) {
            mpChannel.send({
              type: 'broadcast',
              event: 'rtc-offer',
              payload: { from: mySessionId, to: remoteSid, sdp: pc.localDescription }
            });
          }
        })
        .catch(() => {});
    }

    return pc;
  }

  window.toggleVoiceChat = async function() {
    const id = getMyIdentity();
    if (id.isGuest) {
      if (typeof showToast === 'function') {
        showToast('Daftar / masuk warga dulu untuk pakai Voice Chat & akses fitur lainnya 🎙️');
      }
      if (typeof handleCitizenButtonClick === 'function') {
        setTimeout(() => handleCitizenButtonClick(), 550);
      }
      return;
    }
    if (!isMicEnabled) {
      try {
        localAudioStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false
        });
        isMicEnabled = true;
        updateMicButtonUi();
        if (typeof showToast === 'function') showToast('Voice Chat aktif! Ngobrol langsung sama wargi sekitar 🎙️');

        // Hubungkan ke semua warga yang sedang online di peta
        remotePlayers.forEach((_, remoteSid) => {
          if (peerConnections.has(remoteSid)) {
            const pc = peerConnections.get(remoteSid);
            localAudioStream.getTracks().forEach(t => pc.addTrack(t, localAudioStream));
          } else {
            createPeerConnection(remoteSid, true);
          }
        });
      } catch (err) {
        if (typeof showToast === 'function') showToast('Izin mikrofon ditolak browser 🔇');
      }
    } else {
      isMicEnabled = false;
      if (localAudioStream) {
        localAudioStream.getTracks().forEach(t => t.stop());
        localAudioStream = null;
      }
      updateMicButtonUi();
      if (typeof showToast === 'function') showToast('Mikrofon dimatikan 🔇');
    }
  };

  function ensureGuestPlayerSpawned() {
    if (typeof myPlayerMesh !== 'undefined' && myPlayerMesh) return;
    if (typeof createCitizenMesh !== 'function' || typeof setupActivePlayer !== 'function') return;

    const id = getMyIdentity();
    const guestData = {
      ig: id.ig,
      kecamatan: id.kecamatan,
      wish: 'Wargi baru mampir di Gasibu!',
      color: 0x2563eb,
      acc: 'none',
      x: (Math.random() - 0.5) * 6,
      z: -6 + (Math.random() - 0.5) * 4,
      isGuest: true
    };
    const guestMesh = createCitizenMesh(guestData);
    if (guestMesh) {
      setupActivePlayer(guestMesh, guestData);
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 820;
      if (isTouch) {
        const jz = document.getElementById('joystick-zone');
        const jb = document.getElementById('btn-jump-mobile');
        if (jz) jz.style.display = 'block';
        if (jb) jb.style.display = 'flex';
      }
    }
  }

  window.updateMultiplayerFrame = function(delta) {
    const now = Date.now();
    const dt = Math.min(delta || 0.016, 0.1);

    // 1. Kirim posisi, rotasi, & outfit kita ke semua warga di satu peta
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
            color: id.color,
            acc: id.acc,
            x: Number(myPlayerMesh.position.x.toFixed(3)),
            z: Number(myPlayerMesh.position.z.toFixed(3)),
            rotY: Number((myPlayerMesh.rotation ? myPlayerMesh.rotation.y : 0).toFixed(3))
          }
        });
      }
    }

    // 2. Gerakkan karakter warga lain secara halus + atur volume suara berdasarkan jarak 3D
    remotePlayers.forEach((entry, sid) => {
      if (now - entry.lastSeen > 22000) {
        removeRemoteAvatar(sid);
        return;
      }
      if (!entry.mesh) return;
      const dx = entry.targetX - entry.mesh.position.x;
      const dz = entry.targetZ - entry.mesh.position.z;
      const distSq = dx * dx + dz * dz;

      entry.mesh.position.x += dx * Math.min(1, dt * 11);
      entry.mesh.position.z += dz * Math.min(1, dt * 11);
      if (entry.mesh.rotation) {
        entry.mesh.rotation.y += (entry.targetRotY - entry.mesh.rotation.y) * Math.min(1, dt * 12);
      }

      // Animasi ayunan tangan & kaki saat warga remote berjalan
      const ud = entry.mesh.userData && entry.mesh.userData.a;
      if (distSq > 0.0015) {
        entry.walkPhase += dt * 14;
        const swing = Math.sin(entry.walkPhase) * 0.55;
        if (ud && ud.legL && ud.legR) {
          ud.legL.rotation.x = swing;
          ud.legR.rotation.x = -swing;
          if (ud.armL) ud.armL.rotation.x = -swing * 0.7;
          if (ud.armR) ud.armR.rotation.x = swing * 0.7;
        }
      } else if (ud && ud.legL && ud.legR) {
        ud.legL.rotation.x *= 0.8;
        ud.legR.rotation.x *= 0.8;
        if (ud.armL) ud.armL.rotation.x *= 0.8;
        if (ud.armR) ud.armR.rotation.x *= 0.8;
      }

      // Proximity audio volume (makin dekat karakter, suara makin jelas)
      const aud = remoteAudioEls.get(sid);
      if (aud && typeof myPlayerMesh !== 'undefined' && myPlayerMesh) {
        const pdx = entry.mesh.position.x - myPlayerMesh.position.x;
        const pdz = entry.mesh.position.z - myPlayerMesh.position.z;
        const pdist = Math.sqrt(pdx * pdx + pdz * pdz);
        const vol = Math.max(0, Math.min(1, 1 - (pdist / VOICE_MAX_DIST)));
        aud.volume = Number(vol.toFixed(2));
      }
    });

    // 3. Posisi bubble chat melayang di atas kepala
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

  function connectGlobalWorld() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    if (mpChannel) return;

    const myInfo = getMyIdentity();
    mpChannel = supabaseClient.channel(GLOBAL_CHANNEL_NAME, {
      config: {
        presence: { key: mySessionId },
        broadcast: { self: false }
      }
    });

    mpChannel
      .on('presence', { event: 'sync' }, () => {
        const state = mpChannel.presenceState();
        const sids = Object.keys(state);
        updateOnlineCount(sids.length);
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
      .on('broadcast', { event: 'rtc-offer' }, async ({ payload }) => {
        if (!payload || payload.to !== mySessionId || !payload.from) return;
        const pc = createPeerConnection(payload.from, false);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          mpChannel.send({
            type: 'broadcast',
            event: 'rtc-answer',
            payload: { from: mySessionId, to: payload.from, sdp: pc.localDescription }
          });
        } catch (_) {}
      })
      .on('broadcast', { event: 'rtc-answer' }, async ({ payload }) => {
        if (!payload || payload.to !== mySessionId || !payload.from) return;
        const pc = peerConnections.get(payload.from);
        if (pc) {
          try { await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp)); } catch (_) {}
        }
      })
      .on('broadcast', { event: 'rtc-ice' }, async ({ payload }) => {
        if (!payload || payload.to !== mySessionId || !payload.from || !payload.candidate) return;
        const pc = peerConnections.get(payload.from);
        if (pc) {
          try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch (_) {}
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

  // Tetap dukung fungsi lama jika dipanggil dari main.js, tapi tetap di 1 dunia global
  window.switchMultiplayerDistrict = function() {
    connectGlobalWorld();
  };

  function initPirakuMultiplayer() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      setTimeout(initPirakuMultiplayer, 400);
      return;
    }
    injectBubbleLayer();
    connectGlobalWorld();
    setTimeout(ensureGuestPlayerSpawned, 450);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPirakuMultiplayer);
  } else {
    setTimeout(initPirakuMultiplayer, 300);
  }
})();
