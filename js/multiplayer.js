// ================= PIRAKUBDG GLOBAL REALTIME MULTIPLAYER & PROXIMITY VOICE CHAT =================
(function() {
  const SEND_INTERVAL_MS = 90;
  let currentWorldRoomId = 'bandung_wetan';
  function getRoomChannelName() { return 'pirakubdg-world-' + currentWorldRoomId; }
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
    if (window.pirakuCamera) return window.pirakuCamera;
    if (typeof cam !== "undefined" && cam) return cam;
    if (typeof camera !== "undefined" && camera) return camera;
    return null;
  }

  function getMyIdentity() {
    const savedIg = localStorage.getItem("piraku_my_ig");
    const ig = savedIg ? savedIg : ("Tamu_" + mySessionId.slice(-4));
    const kec = localStorage.getItem("piraku_my_kec") || "Bandung";
    const activeMesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    const cData = activeMesh?.userData?.a?.c;
    const color = (cData && cData.color !== undefined) ? cData.color : (parseInt(localStorage.getItem("piraku_my_color") || "", 10) || 0x2563eb);
    const acc = (cData && cData.acc) ? cData.acc : (localStorage.getItem("piraku_my_acc") || "none");
    const role = (cData && cData.role) ? cData.role : "WARGA";
    const eco = window.PirakuEconomy;
    const tierObj = eco && typeof eco.getTierObj === "function" ? eco.getTierObj() : { id: "tier_1", name: "Warga Baru", badge: "🌱" };
    const shopOutfit = eco && typeof eco.getState === "function" ? eco.getState().equippedOutfit : null;
    const activeRental = eco && typeof eco.getActiveRental === "function" ? eco.getActiveRental() : null;
    const shopVehicle = activeRental ? activeRental.item.id : null;
    return {
      sessionId: mySessionId,
      ig,
      kecamatan: kec,
      color,
      acc,
      role,
      tierId: tierObj.id,
      tierName: tierObj.name,
      tierBadge: tierObj.badge,
      shopOutfit,
      shopVehicle,
      isGuest: !savedIg
    };
  }

  
  const onlineNameTags = new Map();
  function syncOnlineNameTag(key, mesh, label, isSelf) {
    const layer = document.getElementById("mp-bubble-layer");
    const camObj = getActiveCamera();
    if (!layer || !camObj || !mesh || typeof THREE === "undefined") return;
    let tag = onlineNameTags.get(key);
    if (!tag) {
      tag = document.createElement("div");
      tag.style.cssText = "position:absolute;left:0;top:0;transform:translate(-50%,-100%);padding:2px 6px;border-radius:6px;font-size:9.5px;font-weight:800;letter-spacing:0.2px;white-space:nowrap;pointer-events:none;background:rgba(15,23,42,0.78);color:" + (isSelf ? "#fde047" : "#f8fafc") + ";border:1px solid " + (isSelf ? "rgba(250,204,21,0.45)" : "rgba(148,163,184,0.35)") + ";";
      layer.appendChild(tag);
      onlineNameTags.set(key, tag);
    }
    const tierStyle = key.includes("tier_4")
      ? { bg: "rgba(8,47,73,0.92)", border: "#38bdf8", text: "#bae6fd" }
      : key.includes("tier_3")
      ? { bg: "rgba(69,26,3,0.92)", border: "#f59e0b", text: "#fde68a" }
      : key.includes("tier_2")
      ? { bg: "rgba(30,27,75,0.90)", border: "#818cf8", text: "#e0e7ff" }
      : null;
    if (tierStyle) {
      tag.style.background = tierStyle.bg;
      tag.style.borderColor = tierStyle.border;
      tag.style.color = tierStyle.text;
    }
    if (tag.textContent !== label) tag.textContent = label;
    const v = new THREE.Vector3();
    mesh.getWorldPosition(v);
    v.y += 1.85;
    v.project(camObj);
    if (v.z > 1) { tag.style.display = "none"; }
    else {
      tag.style.display = "block";
      tag.style.left = ((v.x * 0.5 + 0.5) * window.innerWidth).toFixed(1) + "px";
      tag.style.top = ((-(v.y * 0.5) + 0.5) * window.innerHeight).toFixed(1) + "px";
    }
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
    if ((typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : (typeof (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null) !== "undefined" ? (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null) : null))) {
      spawnFloatingBubble((typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null), id.ig, msg);
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
  window.forceBroadcastMyAppearance = () => { lastBroadcastTime = 0; };

  function updateOnlineCount(count) {
    const total = Math.max(1, count);
    const el = document.getElementById('top-online-count');
    if (el) el.textContent = total + ' Warga Online';
  }

  function getOrCreateRemoteAvatar(payload) {
    if (!payload || !payload.sessionId || payload.sessionId === mySessionId) return null;
    const activeScene = window.pirakuScene || (typeof scene !== "undefined" ? scene : null);
    if (!activeScene) return null;

    let entry = remotePlayers.get(payload.sessionId);
    if (entry && entry.mesh) {
      // Update outfit live jika warga mengganti baju/aksesoris
      if ((payload.color && entry.color !== payload.color) || (payload.acc && entry.acc !== payload.acc)) {
        if (typeof citizensGroup !== 'undefined') citizensGroup.remove(entry.mesh);
        else (window.pirakuScene || scene).remove(entry.mesh);
        entry.mesh = null;
      } else {
        return entry;
      }
    }

    let mesh = null;
    if (typeof window.pirakuCreateCitizenMesh === "function") {
      try {
        mesh = window.pirakuCreateCitizenMesh({
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
      activeScene.add(mesh);
    }

    if (mesh) {
      if (typeof window.hideStaticCitizenByIg === 'function' && payload.ig) {
        window.hideStaticCitizenByIg(payload.ig, true);
      }
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
    const rem = remotePlayers.get(sessionId);
    if (rem && rem.ig && typeof window.hideStaticCitizenByIg === 'function') {
      window.hideStaticCitizenByIg(rem.ig, false);
    }
    const entry = remotePlayers.get(sessionId);
    if (entry && entry.mesh) {
      if (typeof citizensGroup !== 'undefined') citizensGroup.remove(entry.mesh);
      if (typeof scene !== 'undefined') (window.pirakuScene || scene).remove(entry.mesh);
    }
    remotePlayers.delete(sessionId);
    const oldTag = onlineNameTags.get(sessionId); if (oldTag) { oldTag.remove(); onlineNameTags.delete(sessionId); }
    closePeerVoice(sessionId);
  }

  // ================= WEBRTC PROXIMITY VOICE CHAT =================
  function updateMicButtonUi() {
    const btn = document.getElementById("btn-voice-mic");
    if (!btn) return;
    const micSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>';
    const micOffSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" y1="19" x2="12" y2="22"/></svg>';
    if (isMicEnabled) {
      btn.style.background = "linear-gradient(135deg, #16a34a, #22c55e)";
      btn.style.borderColor = "#86efac";
      btn.style.color = "#ffffff";
      btn.innerHTML = micSvg + '<span>Mic On</span>';
    } else {
      btn.style.background = "";
      btn.style.borderColor = "";
      btn.style.color = "";
      btn.innerHTML = micOffSvg + '<span>Mic Off</span>';
    }
  }

  window.syncVoiceMuteState = function(isMuted) {
    remoteAudioEls.forEach(aud => {
      if (aud) aud.muted = !!isMuted;
    });
  };
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
      aud.muted = !!window.pirakuVoiceMuted;
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
    if (typeof window.spawnGuestCitizen === 'function' && !localStorage.getItem('piraku_my_ig')) {
      window.spawnGuestCitizen();
    }
  }

  window.updateMultiplayerFrame = function(delta) {
    const now = Date.now();
    const dt = Math.min(delta || 0.016, 0.1);

    // 1. Kirim posisi, rotasi, & outfit kita ke semua warga di satu peta
    if (mpChannel && now - lastBroadcastTime >= SEND_INTERVAL_MS) {
      if ((typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : (typeof (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null) !== "undefined" ? (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null) : null)) && (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null).position) {
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
            role: id.role,
            x: Number((typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null).position.x.toFixed(3)),
            z: Number((typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null).position.z.toFixed(3)),
            rotY: Number(((typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null).rotation ? (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null).rotation.y : 0).toFixed(3))
          }
        });
      }
    }

    // 2. Gerakkan karakter warga lain secara halus + atur volume suara berdasarkan jarak 3D
    remotePlayers.forEach((entry, sid) => {
      if (now - entry.lastSeen > 60000) {
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
      if (aud) aud.muted = !!window.pirakuVoiceMuted;
      if (aud && (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : (typeof (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null) !== "undefined" ? (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null) : null))) {
        const pdx = entry.mesh.position.x - (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null).position.x;
        const pdz = entry.mesh.position.z - (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null).position.z;
        const pdist = Math.sqrt(pdx * pdx + pdz * pdz);
        const vol = Math.max(0, Math.min(1, 1 - (pdist / VOICE_MAX_DIST)));
        aud.volume = Number(vol.toFixed(2));
      }
    });

    // 3. Posisi bubble chat melayang di atas kepala
    const selfMesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (selfMesh) syncOnlineNameTag("self", selfMesh, getMyIdentity().ig, true);
    remotePlayers.forEach((en, sid) => { if (en.mesh) syncOnlineNameTag(sid, en.mesh, en.ig || "Wargi", false); });
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

  
  function sendMyLiveSnapshot() {
    if (!mpChannel) return;
    const id = getMyIdentity();
    const am = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    const x = am && am.position ? Number(am.position.x.toFixed(3)) : 0;
    const z = am && am.position ? Number(am.position.z.toFixed(3)) : 2.5;
    const rotY = am && am.rotation ? Number(am.rotation.y.toFixed(3)) : 0;
    mpChannel.send({ type: "broadcast", event: "pos", payload: { sessionId: id.sessionId, ig: id.ig, kecamatan: id.kecamatan, color: id.color, acc: id.acc, role: id.role, x, z, rotY } });
  }
  window.forceBroadcastMyAppearance = async function() {
    lastBroadcastTime = 0;
    sendMyLiveSnapshot();
    if (mpChannel) {
      const id = getMyIdentity();
      const am = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
      try {
        await mpChannel.track({ ig: id.ig, kecamatan: id.kecamatan, color: id.color, acc: id.acc, role: id.role, x: am && am.position ? Number(am.position.x.toFixed(2)) : 0, z: am && am.position ? Number(am.position.z.toFixed(2)) : 2.5, rotY: 0, color: myInfo.color, acc: myInfo.acc, role: myInfo.role, x: 0, z: 2.5, rotY: 0, online_at: new Date().toISOString() });
      } catch (_) {}
    }
  };
  window.switchMultiplayerMapRoom = function(newRoomId) {
    const nextRoom = (newRoomId || "bandung_wetan").toLowerCase();
    if (nextRoom === currentWorldRoomId && mpChannel) return;
    currentWorldRoomId = nextRoom;

    // Bersihkan seluruh avatar, nametag, dan koneksi suara WebRTC dari room kecamatan sebelumnya
    Array.from(remotePlayers.keys()).forEach(sid => {
      try { removeRemoteAvatar(sid); } catch (e) {}
    });
    remotePlayers.clear();
    peerConnections.forEach((pc, sid) => {
      try { pc.close(); } catch (e) {}
    });
    peerConnections.clear();
    remoteAudioEls.forEach((el) => {
      try { el.pause(); el.remove(); } catch (e) {}
    });
    remoteAudioEls.clear();

    if (mpChannel && typeof supabaseClient !== "undefined" && supabaseClient) {
      try { supabaseClient.removeChannel(mpChannel); } catch (e) {}
      mpChannel = null;
    }
    updateOnlineCount(1);
    connectGlobalWorld();
  };

  function connectGlobalWorld() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    if (mpChannel) return;

    const myInfo = getMyIdentity();
    mpChannel = supabaseClient.channel(getRoomChannelName(), {
      config: {
        presence: { key: mySessionId },
        broadcast: { self: false }
      }
    });

    mpChannel
      .on("presence", { event: "sync" }, () => {
        const st = mpChannel.presenceState();
        Object.keys(st).forEach(sid => {
          if (sid === mySessionId) return;
          const info = Array.isArray(st[sid]) && st[sid].length ? st[sid][st[sid].length - 1] : null;
          if (info) {
            const en = getOrCreateRemoteAvatar({ sessionId: sid, ig: info.ig, kecamatan: info.kecamatan, color: info.color, acc: info.acc, role: info.role, x: info.x ?? 0, z: info.z ?? 2.5, rotY: info.rotY ?? 0 });
            if (en) en.lastSeen = Date.now();
          }
        });
        sendMyLiveSnapshot();
        lastBroadcastTime = 0;
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
        if (!payload || !payload.from || payload.from === mySessionId) return;
        // Tangani offer jika ditujukan ke kita atau broadcast umum
        if (payload.to && payload.to !== mySessionId) return;
        const pc = createPeerConnection(payload.from, false);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          if (mpChannel) {
            mpChannel.send({
              type: 'broadcast',
              event: 'rtc-answer',
              payload: { from: mySessionId, to: payload.from, sdp: pc.localDescription }
            });
          }
        } catch (e) { console.error("[WebRTC] Error handling offer:", e); }
      })
      .on('broadcast', { event: 'rtc-answer' }, async ({ payload }) => {
        if (!payload || !payload.from || payload.from === mySessionId) return;
        if (payload.to && payload.to !== mySessionId) return;
        const pc = peerConnections.get(payload.from);
        if (pc) {
          try { await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp)); } catch (e) {}
        }
      })
      .on('broadcast', { event: 'rtc-ice' }, async ({ payload }) => {
        if (!payload || !payload.from || payload.from === mySessionId || !payload.candidate) return;
        if (payload.to && payload.to !== mySessionId) return;
        const pc = peerConnections.get(payload.from);
        if (pc) {
          try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch (e) {}
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
    setTimeout(() => { ensureGuestPlayerSpawned(); window.forceBroadcastMyAppearance(); }, 900);
  }

  
  (function startOnlineNameTagLoop() {
    function tickTags() {
      try {
        injectBubbleLayer();
        const selfMesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
        if (selfMesh) {
          syncOnlineNameTag("self", selfMesh, getMyIdentity().ig, true);
        }
        remotePlayers.forEach((en, sid) => {
          if (en && en.mesh) {
            syncOnlineNameTag(sid, en.mesh, en.ig || "Wargi", false);
          }
        });
      } catch (_) {}
      requestAnimationFrame(tickTags);
    }
    requestAnimationFrame(tickTags);
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPirakuMultiplayer);
  } else {
    setTimeout(initPirakuMultiplayer, 300);
  }
})();



// --- ENGINE RECONNECT WEB/VOICE CHAT TOTAL ---
window.forceReconnectVoiceChat = async function() {
  console.log("[VoiceChat] Memulai reset total engine WebRTC & Mic...");
  if (typeof showToast === "function") {
    showToast("🔄 Me-reset ulang sambungan mic & peer...");
  }

  // 1. Matikan semua track stream lama
  try {
    if (typeof localStream !== "undefined" && localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
  } catch(e) {}

  // 2. Tutup semua peer connections aktif jika ada
  try {
    if (typeof activePeers === "object" && activePeers !== null) {
      Object.keys(activePeers).forEach(id => {
        try {
          if (activePeers[id].pc) activePeers[id].pc.close();
        } catch(err) {}
      });
      window.activePeers = {};
    }
  } catch(e) {}

  // 3. Minta ulang akses mikrofon secara segar
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, 
      video: false 
    });
    console.log("[VoiceChat] Mikrofon baru berhasil diinisialisasi.");
    if (typeof showToast === "function") {
      showToast("🎙️ Mic siap! Menyambungkan ulang ke room...");
    }
    
    // 4. Trigger ulang broadcast status multiplayer jika fungsi tersedia
    if (typeof window.initMultiplayer === "function") {
      setTimeout(() => { window.initMultiplayer(); }, 500);
    }
  } catch (err) {
    console.error("[VoiceChat] Gagal total akses mic:", err);
    if (typeof showToast === "function") {
      showToast("⚠️ Gagal akses mic! Periksa izin browser.");
    }
  }
};



// --- TOMBOL PINTASAN RECONNECT MIC DI HUD ---
(function() {
  if (document.getElementById("btn-reconnect-mic")) return;
  const btn = document.createElement("button");
  btn.id = "btn-reconnect-mic";
  btn.innerHTML = "🎙️ Reconnect Mic";
  btn.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:9999;background:#0f172a;color:#38bdf8;border:1px solid #38bdf8;padding:8px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:all 0.2s;";
  btn.onmouseover = () => { btn.style.background = "#1e293b"; btn.style.transform = "scale(1.05)"; };
  btn.onmouseout = () => { btn.style.background = "#0f172a"; btn.style.transform = "scale(1)"; };
  btn.onclick = async () => {
    btn.innerHTML = "⏳ Menghubungkan...";
    if (typeof window.forceReconnectVoiceChat === "function") {
      await window.forceReconnectVoiceChat();
    }
    setTimeout(() => { btn.innerHTML = "🎙️ Reconnect Mic"; }, 1500);
  };
  document.body.appendChild(btn);
})();
