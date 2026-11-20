// ================= PIRAKUBDG GLOBAL REALTIME MULTIPLAYER & PROXIMITY VOICE CHAT =================
(function() {
  // Isi URL Worker Cloudflare di sini setelah `npx wrangler deploy` (contoh: "https://pirakubdg-realtime.username.workers.dev")
  // Jika kosong (""), otomatis fallback ke Supabase Realtime.
  const DEFAULT_CF_REALTIME_URL = "https://pirakubdg-realtime.pirakubdg.workers.dev";
  function getCfRealtimeBaseUrl() {
    const raw = (typeof window !== "undefined" && window.PIRAKU_CF_REALTIME_URL) || DEFAULT_CF_REALTIME_URL || "";
    return String(raw).trim().replace(/\/+$/, "");
  }
  function useCloudflareRealtime() {
    return /^https?:\/\/|^wss?:\/\//i.test(getCfRealtimeBaseUrl());
  }
  const SEND_INTERVAL_MS = useCloudflareRealtime() ? 320 : 650;
  let currentWorldRoomId = 'bandung_wetan';
  function getRoomChannelName() { return 'pirakubdg-world-' + currentWorldRoomId; }
  const VOICE_MAX_DIST = 24;

  let mpChannel = null;
  let mySessionId = 'wargi-' + Math.random().toString(36).substring(2, 8);
  const remotePlayers = new Map();
  const activeBubbles = [];
  let lastBroadcastTime = 0;

  // State WebRTC Voice Chat (Global untuk seluruh wargi lintas ISP)
  let localAudioStream = null;
  let isMicEnabled = false;
  const peerConnections = new Map();
  const remoteAudioEls = new Map();
  const pendingIceMap = new Map();
  const speakingPeers = new Map(); // key ("self" atau remoteSid) -> boolean
  const voiceAnalysers = new Map(); // key -> { ctx, analyser, data, timer }
  let sharedAudioCtx = null;

  function startVoiceActivityMonitor(key, mediaStream) {
    stopVoiceActivityMonitor(key);
    if (!mediaStream) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
      if (sharedAudioCtx.state === "suspended") sharedAudioCtx.resume().catch(() => {});
      const source = sharedAudioCtx.createMediaStreamSource(mediaStream);
      const analyser = sharedAudioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.45;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const timer = setInterval(() => {
        if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
          sharedAudioCtx.resume().catch(() => {});
        }
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const isTalking = key === "self" ? (isMicEnabled && rms > 0.018) : (rms > 0.015);
        speakingPeers.set(key, isTalking);
      }, 90);
      voiceAnalysers.set(key, { source, analyser, timer });
    } catch (_) {}
  }

  function stopVoiceActivityMonitor(key) {
    const item = voiceAnalysers.get(key);
    if (item) {
      clearInterval(item.timer);
      try { item.source.disconnect(); } catch (_) {}
      voiceAnalysers.delete(key);
    }
    speakingPeers.delete(key);
  }

  const rtcConfig = {
    iceCandidatePoolSize: 8,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceServers: [
      { urls: 'stun:stun.cloudflare.com:3478' },
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  let turnRefreshTimer = null;
  async function refreshCloudflareTurn() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      setTimeout(refreshCloudflareTurn, 1000);
      return;
    }
    try {
      const { data, error } = await supabaseClient.functions.invoke('get-turn-credentials');
      if (!error && data?.iceServers) {
        const servers = Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers];
        rtcConfig.iceServers = servers;
        console.log('[WebRTC] Cloudflare TURNS active (' + servers.length + ' servers)');
        if (!turnRefreshTimer) {
          turnRefreshTimer = setInterval(refreshCloudflareTurn, 12 * 60 * 60 * 1000);
        }
      } else {
        console.warn('[WebRTC] TURN fallback ke STUN:', error?.message || 'Empty response');
      }
    } catch (err) {
      console.warn('[WebRTC] Gagal fetch Cloudflare TURN:', err.message);
    }
  }
  refreshCloudflareTurn();

  function unlockPendingRemoteAudios() {
    remoteAudioEls.forEach((aud) => {
      if (aud) {
        aud.muted = !!window.pirakuVoiceMuted;
        if (aud.paused) aud.play().catch(() => {});
      }
    });
  }
  window.addEventListener("pointerdown", unlockPendingRemoteAudios, { passive: true });

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
    const shopVehicle = eco && typeof eco.getEquippedVehicleId === "function"
      ? eco.getEquippedVehicleId()
      : (eco && typeof eco.getActiveRental === "function" && eco.getActiveRental() ? eco.getActiveRental().item.id : null);
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
      tag.className = "piraku-nametag";
      tag.style.cssText = "position:absolute;left:0;top:0;transform:translate(-50%,-100%);padding:2px 6px;border-radius:6px;font-size:9.5px;font-weight:800;letter-spacing:0.2px;white-space:nowrap;pointer-events:none;background:rgba(15,23,42,0.78);color:" + (isSelf ? "#fde047" : "#f8fafc") + ";border:1px solid " + (isSelf ? "rgba(250,204,21,0.45)" : "rgba(148,163,184,0.35)") + ";";
      layer.appendChild(tag);
      onlineNameTags.set(key, tag);
    }
    if (!tag.classList.contains("piraku-nametag")) tag.classList.add("piraku-nametag");
    const cleanHandle = String(label || "").trim().toLowerCase().replace(/^@/, "").split("•")[0].trim();
    let resolvedTierId = null;
    let resolvedTierBadge = "";
    let resolvedTierName = "";
    if (isSelf && window.PirakuEconomy && typeof window.PirakuEconomy.getTierObj === "function") {
      const myT = window.PirakuEconomy.getTierObj();
      if (myT && myT.id && myT.id !== "tier_1") {
        resolvedTierId = myT.id;
        resolvedTierBadge = myT.badge || "";
        resolvedTierName = myT.name || "";
      }
    } else {
      const remEntry = remotePlayers.get(key);
      const remTier = (window.pirakuRemoteTiers || {})[cleanHandle];
      const tid = (remEntry && remEntry.tierId) || (remTier && remTier.tierId) || null;
      if (tid && tid !== "tier_1") {
        resolvedTierId = tid;
        resolvedTierBadge = (remTier && remTier.tierBadge) || "";
        resolvedTierName = (remTier && remTier.tierName) || "";
      }
    }

    const TIER_STYLES = {
      tier_7: { bg: "linear-gradient(135deg,rgba(15,23,42,0.95),rgba(66,32,6,0.95))", border: "#facc15", badgeCol: "#facc15", text: "#fef08a", shadow: "0 2px 10px rgba(250,204,21,0.45)" },
      tier_6: { bg: "rgba(36,14,66,0.92)", border: "#c084fc", badgeCol: "#e879f9", text: "#e9d5ff", shadow: "0 2px 10px rgba(192,132,252,0.4)" },
      tier_5: { bg: "rgba(15,29,68,0.92)", border: "#60a5fa", badgeCol: "#fde047", text: "#93c5fd", shadow: "0 2px 10px rgba(96,165,250,0.4)" },
      tier_4: { bg: "rgba(8,30,48,0.92)", border: "#38bdf8", badgeCol: "#7dd3fc", text: "#bae6fd", shadow: "0 2px 8px rgba(56,189,248,0.38)" },
      tier_3: { bg: "rgba(28,19,8,0.92)", border: "#f59e0b", badgeCol: "#fbbf24", text: "#fde68a", shadow: "0 2px 8px rgba(245,158,11,0.35)" },
      tier_2: { bg: "rgba(30,27,75,0.90)", border: "#818cf8", badgeCol: "#a5b4fc", text: "#c7d2fe", shadow: "0 2px 8px rgba(129,140,248,0.32)" }
    };
    const tierStyle = resolvedTierId ? (TIER_STYLES[resolvedTierId] || null) : null;
    const isFounder = cleanHandle === "yelclaw";
    const isSpeaking = !!speakingPeers.get(key);
    const topBadgeText = [
      isFounder ? "🛡️ FOUNDER" : "",
      (resolvedTierBadge && resolvedTierName) ? (resolvedTierBadge + " " + resolvedTierName) : ""
    ].filter(Boolean).join(" ");
    const handleText = (isSpeaking ? "🎙️ " : "") + label;
    const escTag = s => String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[m]));
    const badgeColorCss = tierStyle ? `color:${tierStyle.badgeCol};` : (isFounder ? "color:#facc15;" : "");
    const nextHtml = topBadgeText
      ? `<div style="font-size:8px;font-weight:800;letter-spacing:0.35px;line-height:1.15;margin-bottom:1px;${badgeColorCss}">${escTag(topBadgeText)}</div><div style="font-size:9.5px;font-weight:800;line-height:1.15;">${escTag(handleText)}</div>`
      : `<div style="font-size:9.5px;font-weight:800;line-height:1.15;">${escTag(handleText)}</div>`;
    if (tag.dataset.lastHtml !== nextHtml) {
      tag.dataset.lastHtml = nextHtml;
      tag.innerHTML = nextHtml;
    }
    tag.style.textAlign = "center";
    tag.style.transformOrigin = "bottom center";

    if (tierStyle) {
      tag.style.background = tierStyle.bg;
      tag.style.borderColor = tierStyle.border;
      tag.style.borderWidth = "1.8px";
      tag.style.color = tierStyle.text;
      tag.style.boxShadow = tierStyle.shadow;
      tag.style.padding = "3px 12px";
      tag.style.borderRadius = "999px";
      tag.style.textShadow = "0 1px 2px rgba(0,0,0,0.6)";
    } else if (isFounder) {
      tag.style.background = "rgba(15, 23, 42, 0.94)";
      tag.style.borderColor = "#facc15";
      tag.style.borderWidth = "1.8px";
      tag.style.color = "#fde047";
      tag.style.boxShadow = "0 2px 10px rgba(250,204,21,0.4)";
      tag.style.padding = "3px 12px";
      tag.style.borderRadius = "999px";
    } else {
      tag.style.boxShadow = "none";
      tag.style.borderWidth = "1px";
      tag.style.padding = "2px 7px";
      tag.style.borderRadius = "999px";
      tag.style.textShadow = "none";
      tag.style.background = "rgba(15,23,42,0.78)";
      tag.style.borderColor = isSelf ? "rgba(250,204,21,0.45)" : "rgba(148,163,184,0.35)";
      tag.style.color = isSelf ? "#fde047" : "#f8fafc";
    }
    if (isSpeaking) {
      const pulse = 0.55 + 0.45 * Math.sin(performance.now() * 0.018);
      tag.style.borderColor = "#22c55e";
      tag.style.boxShadow = "0 0 0 1.5px rgba(34,197,94,0.85), 0 0 " + (8 + pulse * 8).toFixed(1) + "px rgba(34, 197, 94, " + (0.5 + pulse * 0.35).toFixed(2) + ")";
    }
    const v = new THREE.Vector3();
    mesh.getWorldPosition(v);
    const camDist = camObj.position ? camObj.position.distanceTo(v) : 14;
    const tagScale = Math.max(0.52, Math.min(1.0, 14 / Math.max(12, camDist)));
    tag.style.transform = "translate(-50%,-100%) scale(" + tagScale.toFixed(2) + ")";
    const selfMesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    const refDist = (!isSelf && selfMesh && selfMesh.position)
      ? Math.hypot(v.x - selfMesh.position.x, v.z - selfMesh.position.z)
      : (camObj.position ? camObj.position.distanceTo(v) * 0.45 : 0);
    if (!isSelf && refDist > 24) {
      tag.style.display = "none";
      return;
    }
    v.y += 1.85;
    v.project(camObj);
    if (v.z > 1) { tag.style.display = "none"; }
    else {
      tag.style.display = "block";
      tag.style.opacity = (!isSelf && refDist > 16) ? Math.max(0.28, 1 - (refDist - 16) / 9).toFixed(2) : "1";
      tag.style.left = ((v.x * 0.5 + 0.5) * window.innerWidth).toFixed(1) + "px";
      tag.style.top = ((-(v.y * 0.5) + 0.5) * window.innerHeight).toFixed(1) + "px";
    }
  }

  function injectBubbleLayer() {
    if (document.getElementById('mp-bubble-layer')) return;
    const bubbleLayer = document.createElement('div');
    bubbleLayer.id = 'mp-bubble-layer';
    bubbleLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:18;overflow:hidden;';
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
    if (!(localStorage.getItem("piraku_my_ig") || "").trim()) {
      if (typeof window.showToast === "function") window.showToast("Silakan Masuk / Daftar E-KTP dulu untuk bisa nge-chat! 🪪");
      if (typeof window.openJoinModal === "function") window.openJoinModal();
      return;
    }
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
    window.pirakuOnlineCount = total;
    const el = document.getElementById('top-online-count');
    if (el) el.textContent = total + ' Warga Online';
    if (typeof window.syncAmbientOfflineNpcVisibility === 'function') {
      window.syncAmbientOfflineNpcVisibility(total);
    }
  }

  function getOrCreateRemoteAvatar(payload) {
    if (!payload || !payload.sessionId || payload.sessionId === mySessionId) return null;
    const activeScene = window.pirakuScene || (typeof scene !== "undefined" ? scene : null);
    if (!activeScene) return null;

    if (payload.ig && payload.tierId) {
      const cleanIg = String(payload.ig).toLowerCase().replace(/^@/, "").trim();
      if (cleanIg) {
        window.pirakuRemoteTiers = window.pirakuRemoteTiers || {};
        window.pirakuRemoteTiers[cleanIg] = { tierId: payload.tierId, tierName: payload.tierName || "", tierBadge: payload.tierBadge || "" };
      }
    }
    let entry = remotePlayers.get(payload.sessionId);
    const nextShopOutfit = payload.shopOutfit || null;
    const nextShopVehicle = payload.shopVehicle || null;
    if (entry && entry.mesh) {
      // Update outfit live jika warga mengganti baju/aksesoris
      if ((payload.color && entry.color !== payload.color) || (payload.acc && entry.acc !== payload.acc)) {
        if (typeof citizensGroup !== 'undefined') citizensGroup.remove(entry.mesh);
        else (window.pirakuScene || scene).remove(entry.mesh);
        entry.mesh = null;
      } else {
        const nextTierId = payload.tierId || entry.tierId || null;
        if ((payload.shopOutfit !== undefined && entry.shopOutfit !== nextShopOutfit) ||
            (payload.shopVehicle !== undefined && entry.shopVehicle !== nextShopVehicle) ||
            (payload.tierId !== undefined && entry.tierId !== nextTierId)) {
          entry.shopOutfit = nextShopOutfit;
          entry.shopVehicle = nextShopVehicle;
          entry.tierId = nextTierId;
          if (typeof window.attachPirakuShopToCitizen === 'function') {
            window.attachPirakuShopToCitizen(entry.mesh, entry.shopOutfit, entry.shopVehicle, entry.tierId);
          }
        }
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
      mesh.position.set(payload.x || 0, typeof payload.y === "number" ? payload.y : 0.1, payload.z || 0);
      if (mesh.userData && mesh.userData.a) {
        mesh.userData.a.walk = false; // Dikendalikan langsung oleh posisi realtime!
        mesh.userData.a.isRemotePlayer = true;
      }
      entry = {
        mesh,
        targetX: payload.x || 0,
        targetY: typeof payload.y === "number" ? payload.y : 0.1,
        targetZ: payload.z || 0,
        targetRotY: payload.rotY || 0,
        jump: !!payload.jump,
        fishing: payload.fishing || null,
        ig: payload.ig || 'Wargi',
        color: payload.color,
        acc: payload.acc,
        shopOutfit: nextShopOutfit,
        shopVehicle: nextShopVehicle,
        tierId: payload.tierId || null,
        lastSeen: Date.now(),
        walkPhase: 0
      };
      if ((nextShopOutfit || nextShopVehicle || (payload.tierId && payload.tierId !== 'tier_1')) && typeof window.attachPirakuShopToCitizen === 'function') {
        window.attachPirakuShopToCitizen(mesh, nextShopOutfit, nextShopVehicle, payload.tierId || null);
      }
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
    if (entry && typeof window.clearRemotePlayerFishing3D === 'function') {
      window.clearRemotePlayerFishing3D(entry);
    }
    if (entry && entry.mesh) {
      if (entry.mesh.parent) entry.mesh.parent.remove(entry.mesh);
      if (typeof citizensGroup !== 'undefined' && citizensGroup) citizensGroup.remove(entry.mesh);
      const sc = window.pirakuScene || (typeof scene !== 'undefined' ? scene : null);
      if (sc) sc.remove(entry.mesh);
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
    pendingIceMap.delete(remoteSid);
    stopVoiceActivityMonitor(remoteSid);
    const aud = remoteAudioEls.get(remoteSid);
    if (aud) {
      aud.srcObject = null;
      aud.remove();
      remoteAudioEls.delete(remoteSid);
    }
  }

  async function sendOfferToPeer(remoteSid, pc) {
    if (!pc || !mpChannel) return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      mpChannel.send({
        type: 'broadcast',
        event: 'rtc-offer',
        payload: { from: mySessionId, to: remoteSid, sdp: pc.localDescription }
      });
    } catch (err) {
      console.warn("[WebRTC] Gagal kirim offer ke", remoteSid, err);
    }
  }

  function createPeerConnection(remoteSid, isInitiator) {
    if (peerConnections.has(remoteSid)) return peerConnections.get(remoteSid);
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnections.set(remoteSid, pc);

    if (localAudioStream) {
      localAudioStream.getTracks().forEach(track => pc.addTrack(track, localAudioStream));
    } else {
      try { pc.addTransceiver("audio", { direction: "sendrecv" }); } catch (_) {}
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
        aud.setAttribute("playsinline", "");
        document.body.appendChild(aud);
        remoteAudioEls.set(remoteSid, aud);
      }
      const stream = (e.streams && e.streams[0]) ? e.streams[0] : new MediaStream([e.track]);
      aud.srcObject = stream;
      startVoiceActivityMonitor(remoteSid, stream);
      aud.muted = !!window.pirakuVoiceMuted;
      aud.volume = 1.0;
      aud.play().catch(() => {
        if (typeof showToast === 'function') {
          showToast('🔊 Ketuk layar sekali untuk mendengar suara wargi!');
        }
        const unlock = () => {
          remoteAudioEls.forEach(el => { try { el.play().catch(() => {}); } catch (_) {} });
        };
        window.addEventListener('pointerdown', unlock, { once: true });
      });
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        if (typeof showToast === 'function') {
          showToast('⚠️ Koneksi suara terblokir NAT/ISP (butuh TURN relay aktif)');
        }
        try { pc.restartIce(); } catch (_) {}
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        const peerInfo = remotePlayers.get(remoteSid);
        if (typeof showToast === 'function') {
          showToast('🔊 Suara tersambung dengan ' + (peerInfo?.ig || 'Wargi') + '!');
        }
        unlockPendingRemoteAudios();
      } else if (['failed', 'closed'].includes(pc.connectionState)) {
        closePeerVoice(remoteSid);
      }
    };

    if (isInitiator && mySessionId < remoteSid) {
      sendOfferToPeer(remoteSid, pc);
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
    unlockPendingRemoteAudios();
    if (!isMicEnabled) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (typeof showToast === 'function') showToast('Browser/HTTPS tidak mendukung mikrofon 🔇');
        return;
      }
      try {
        localAudioStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false
        });
        isMicEnabled = true;
        startVoiceActivityMonitor("self", localAudioStream);
        updateMicButtonUi();
        if (typeof showToast === 'function') showToast('Voice Chat aktif! Ngobrol langsung sama wargi sekitar 🎙️');
        // Hubungkan & renegosiasi SDP ke semua warga yang sedang online (full-mesh)
        remotePlayers.forEach((_, remoteSid) => {
          const pc = createPeerConnection(remoteSid, false);
          const senders = pc.getSenders();
          localAudioStream.getTracks().forEach(track => {
            const existingSender = senders.find(s => s.track && s.track.kind === track.kind);
            if (existingSender) {
              existingSender.replaceTrack(track).catch(() => {});
            } else {
              pc.addTrack(track, localAudioStream);
            }
          });
            if (pc.signalingState === 'stable') {
              sendOfferToPeer(remoteSid, pc);
            }
          });
          if (mpChannel) {
            mpChannel.send({ type: 'broadcast', event: 'voice-ready', payload: { from: mySessionId } });
          }
      } catch (err) {
        console.error("[VoiceChat] Mic error:", err);
        if (typeof showToast === 'function') showToast('Izin mikrofon ditolak browser 🔇');
      }
    } else {
      isMicEnabled = false;
      stopVoiceActivityMonitor("self");
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

    // 1. Kirim posisi, rotasi, & outfit kita hanya jika WebSocket channel sudah 'joined', tab aktif, & ada perubahan signifikan (atau heartbeat 25s)
    const activeMesh = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (!document.hidden && mpChannel && mpChannel.state === 'joined' && activeMesh && activeMesh.position && now - lastBroadcastTime >= SEND_INTERVAL_MS) {
      const px = Number(activeMesh.position.x.toFixed(2));
      const py = Number(activeMesh.position.y.toFixed(2));
      const pz = Number(activeMesh.position.z.toFixed(2));
      const prot = Number((activeMesh.rotation ? activeMesh.rotation.y : 0).toFixed(2));
      const isJump = Boolean(window.pirakuIsAirborne);
      const fishObj = window.pirakuFishingSyncState || null;
      const fishSig = fishObj ? `${fishObj.state}_${fishObj.bx}_${fishObj.bz}` : "";
      const showFishObj = window.pirakuShownFish || null;
      const showFishSig = showFishObj ? `${showFishObj.id}_${showFishObj.kg}_${showFishObj.mut || ""}` : "";
      const rodCarryObj = window.pirakuCarriedRodState || null;
      const rodCarrySig = rodCarryObj ? `${rodCarryObj.id}_${rodCarryObj.hold ? 1 : 0}` : "";
      const idNow = getMyIdentity();
      const shopSig = `${idNow.shopOutfit || ""}|${idNow.shopVehicle || ""}|${idNow.tierId || ""}`;
      const moved = !mpChannel._lastSentPos ||
        Math.abs(px - mpChannel._lastSentPos.x) > 0.30 ||
        Math.abs(py - mpChannel._lastSentPos.y) > 0.14 ||
        Math.abs(pz - mpChannel._lastSentPos.z) > 0.30 ||
        Math.abs(prot - mpChannel._lastSentPos.rot) > 0.18 ||
        isJump !== mpChannel._lastSentPos.jump ||
        fishSig !== mpChannel._lastSentPos.fishSig ||
        showFishSig !== mpChannel._lastSentPos.showFishSig ||
        rodCarrySig !== mpChannel._lastSentPos.rodCarrySig ||
        shopSig !== mpChannel._lastSentPos.shopSig ||
        (now - (mpChannel._lastSentPos.ts || 0) >= 40000);
      if (moved) {
        lastBroadcastTime = now;
        mpChannel._lastSentPos = { x: px, y: py, z: pz, rot: prot, jump: isJump, fishSig, showFishSig, rodCarrySig, shopSig, ts: now };
        const id = idNow;
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
            tierId: id.tierId,
            tierName: id.tierName,
            tierBadge: id.tierBadge,
            shopOutfit: id.shopOutfit,
            shopVehicle: id.shopVehicle,
            x: px,
            y: py,
            z: pz,
            rotY: prot,
            jump: isJump,
            fishing: fishObj,
            showFish: showFishObj,
            rodCarry: rodCarryObj
          }
        });
      }
    }

    // 2. Gerakkan karakter warga lain secara halus + atur volume suara berdasarkan jarak 3D
    const perfNow = performance.now();
    remotePlayers.forEach((entry, sid) => {
      if (now - entry.lastSeen > 40000) {
        removeRemoteAvatar(sid);
        return;
      }
      if (!entry.mesh) return;
      const dx = entry.targetX - entry.mesh.position.x;
      const dy = (typeof entry.targetY === "number" ? entry.targetY : 0.1) - entry.mesh.position.y;
      const dz = entry.targetZ - entry.mesh.position.z;
      const distSq = dx * dx + dz * dz;

      entry.mesh.position.x += dx * Math.min(1, dt * 11);
      entry.mesh.position.y += dy * Math.min(1, dt * 15);
      entry.mesh.position.z += dz * Math.min(1, dt * 11);
      if (entry.mesh.rotation) {
        entry.mesh.rotation.y += (entry.targetRotY - entry.mesh.rotation.y) * Math.min(1, dt * 12);
      }

      // Animasi ayunan tangan & kaki saat warga remote berjalan, loncat, atau memancing
      const ud = entry.mesh.userData && entry.mesh.userData.a;
      if (entry.fishing && entry.fishing.state && entry.fishing.state !== "idle") {
        if (typeof window.syncRemotePlayerFishing3D === "function") {
          window.syncRemotePlayerFishing3D(entry, perfNow);
        }
        if (ud && ud.legL && ud.legR) {
          ud.legL.rotation.x *= 0.7;
          ud.legR.rotation.x *= 0.7;
        }
      } else {
        if (typeof window.clearRemotePlayerFishing3D === "function") {
          window.clearRemotePlayerFishing3D(entry);
        }
        if (entry.jump && ud && ud.legL && ud.legR) {
          ud.legL.rotation.x = -0.55;
          ud.legR.rotation.x = 0.45;
          if (ud.armL) ud.armL.rotation.x = -0.6;
          if (ud.armR) ud.armR.rotation.x = -0.6;
        } else if (distSq > 0.00025) {
          entry.walkPhase += dt * 15;
          const swing = Math.sin(entry.walkPhase) * 0.65;
          if (ud && ud.legL && ud.legR) {
            if (ud.body) ud.body.position.y = Math.abs(swing) * 0.07;
            ud.legL.rotation.x = swing;
            ud.legR.rotation.x = -swing;
            if (ud.armL) ud.armL.rotation.x = -swing * 0.75;
            if (ud.armR) ud.armR.rotation.x = swing * 0.75;
          }
        } else if (ud && ud.legL && ud.legR) {
          if (ud.body) ud.body.position.y *= 0.8;
          ud.legL.rotation.x *= 0.8;
          ud.legR.rotation.x *= 0.8;
          if (ud.armL) ud.armL.rotation.x *= 0.8;
          if (ud.armR) ud.armR.rotation.x *= 0.8;
        }
      }

      if (typeof window.syncShownFishOnMesh === "function") {
        window.syncShownFishOnMesh(entry.mesh, entry.showFish, perfNow);
      }
      if (typeof window.syncEquippedRodVisual === "function") {
        window.syncEquippedRodVisual(entry.mesh, entry.rodCarry && entry.rodCarry.id, !!(entry.rodCarry && entry.rodCarry.hold), !!(entry.fishing && entry.fishing.state && entry.fishing.state !== "idle"), perfNow);
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
    if (!mpChannel || mpChannel.state !== "joined") return;
    const id = getMyIdentity();
    const am = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    // Ambil posisi dari mesh aktif atau fallback ke titik kecamatan/rumah jika tersimpan
    const savedKec = localStorage.getItem("piraku_my_kec") || localStorage.getItem("piraku_ktp_kecamatan") || "Bandung Wetan";
    const defaultX = savedKec.toLowerCase() !== "bandung wetan" ? 25 : 0;
    const defaultZ = savedKec.toLowerCase() !== "bandung wetan" ? -34 : 2.5;
    const x = am && am.position ? Number(am.position.x.toFixed(3)) : defaultX;
    const z = am && am.position ? Number(am.position.z.toFixed(3)) : defaultZ;
    const rotY = am && am.rotation ? Number(am.rotation.y.toFixed(3)) : 0;
    mpChannel.send({ type: "broadcast", event: "pos", payload: { sessionId: id.sessionId, ig: id.ig, kecamatan: id.kecamatan, color: id.color, acc: id.acc, role: id.role, tierId: id.tierId, tierName: id.tierName, tierBadge: id.tierBadge, shopOutfit: id.shopOutfit, shopVehicle: id.shopVehicle, x, z, rotY } });
  }
  window.forceBroadcastMyAppearance = async function() {
    lastBroadcastTime = 0;
    sendMyLiveSnapshot();
    if (mpChannel) {
      const id = getMyIdentity();
      const am = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
      const px = am && am.position ? Number(am.position.x.toFixed(2)) : 0;
      const pz = am && am.position ? Number(am.position.z.toFixed(2)) : 2.5;
      try {
        await mpChannel.track({ ig: id.ig, kecamatan: id.kecamatan, color: id.color, acc: id.acc, role: id.role, tierId: id.tierId, tierName: id.tierName, tierBadge: id.tierBadge, shopOutfit: id.shopOutfit, shopVehicle: id.shopVehicle, x: px, z: pz, rotY: 0, online_at: new Date().toISOString() });
      } catch (_) {}
    }
  };
  function createCloudflareChannel(wsPath, sessionId) {
    const base = getCfRealtimeBaseUrl().replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
    const sep = wsPath.indexOf("?") >= 0 ? "&" : "?";
    const fullUrl = base + wsPath + sep + "sessionId=" + encodeURIComponent(sessionId);

    const presenceHandlers = {};
    const broadcastHandlers = {};
    let presenceMap = {};
    let ws = null;
    let closedByClient = false;
    let reconnectTimer = null;
    let pingTimer = null;
    let subscribeCb = null;
    let pendingTrack = null;
    let failCount = 0;

    const channelObj = {
      state: "closed",
      on(type, filter, cb) {
        const ev = filter && filter.event;
        if (!ev || typeof cb !== "function") return channelObj;
        if (type === "presence") {
          presenceHandlers[ev] = presenceHandlers[ev] || [];
          presenceHandlers[ev].push(cb);
        } else if (type === "broadcast") {
          broadcastHandlers[ev] = broadcastHandlers[ev] || [];
          broadcastHandlers[ev].push(cb);
        }
        return channelObj;
      },
      presenceState() {
        return presenceMap;
      },
      send(msg) {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        try {
          ws.send(JSON.stringify(msg));
        } catch (_) {}
      },
      async track(payload) {
        pendingTrack = payload;
        if (ws && ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: "track", payload }));
          } catch (_) {}
        }
      },
      subscribe(cb) {
        subscribeCb = cb;
        connectWs();
        return channelObj;
      },
      unsubscribe() {
        closedByClient = true;
        channelObj.state = "closed";
        if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
        if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
        if (ws) {
          try { ws.close(); } catch (_) {}
          ws = null;
        }
      }
    };

    function emitPresence(ev) {
      const list = presenceHandlers[ev];
      if (!list) return;
      list.forEach((fn) => { try { fn(); } catch (_) {} });
    }

    function connectWs() {
      if (closedByClient) return;
      try {
        ws = new WebSocket(fullUrl);
      } catch (_) {
        scheduleReconnect();
        return;
      }

      ws.addEventListener("open", () => {
        failCount = 0;
        channelObj.state = "joined";
        if (pendingTrack) {
          try { ws.send(JSON.stringify({ type: "track", payload: pendingTrack })); } catch (_) {}
        }
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            try { ws.send('{"type":"ping"}'); } catch (_) {}
          }
        }, 45000);
        if (typeof subscribeCb === "function") {
          try { subscribeCb("SUBSCRIBED"); } catch (_) {}
        }
      });

      ws.addEventListener("message", (event) => {
        let data;
        try { data = JSON.parse(event.data); } catch (_) { return; }
        if (!data || typeof data !== "object") return;
        if (data.type === "presence_sync") {
          presenceMap = data.state && typeof data.state === "object" ? data.state : {};
          emitPresence("sync");
          return;
        }
        if (data.type === "broadcast" && data.event) {
          const list = broadcastHandlers[data.event];
          if (list) {
            list.forEach((fn) => { try { fn({ payload: data.payload }); } catch (_) {} });
          }
        }
      });

      ws.addEventListener("close", () => {
        channelObj.state = "closed";
        if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
        if (!closedByClient) {
          failCount++;
          // Jangan fallback ke Supabase Realtime agar kuota Supabase aman; perlambat reconnect jika limit Cloudflare tercapai
          if (failCount >= 5) {
            setTimeout(() => scheduleReconnect(), 20000);
            return;
          }
          scheduleReconnect();
        }
      });

      ws.addEventListener("error", () => {
        try { ws.close(); } catch (_) {}
      });
    }

    function scheduleReconnect() {
      if (closedByClient || reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectWs();
      }, 1500);
    }

    return channelObj;
  }

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

    if (mpChannel) {
      try {
        if (typeof mpChannel.unsubscribe === "function") mpChannel.unsubscribe();
        if (typeof supabaseClient !== "undefined" && supabaseClient && typeof supabaseClient.removeChannel === "function") {
          supabaseClient.removeChannel(mpChannel);
        }
      } catch (e) {}
      mpChannel = null;
    }
    updateOnlineCount(Math.max(1, globalOnlineCount || 1));
    connectGlobalWorld();
  };

  function connectGlobalWorld() {
    const useCf = useCloudflareRealtime();
    if (!useCf && (typeof supabaseClient === 'undefined' || !supabaseClient)) return;
    if (mpChannel) return;

    const myInfo = getMyIdentity();
    mpChannel = useCf
      ? createCloudflareChannel('/ws/room/' + encodeURIComponent(currentWorldRoomId), mySessionId)
      : supabaseClient.channel(getRoomChannelName(), {
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
            const en = getOrCreateRemoteAvatar({ sessionId: sid, ig: info.ig, kecamatan: info.kecamatan, color: info.color, acc: info.acc, role: info.role, tierId: info.tierId, tierName: info.tierName, tierBadge: info.tierBadge, shopOutfit: info.shopOutfit || null, shopVehicle: info.shopVehicle || null, x: info.x ?? 0, z: info.z ?? 2.5, rotY: info.rotY ?? 0 });
            if (en) en.lastSeen = Date.now();
          }
        });
        sendMyLiveSnapshot();
        lastBroadcastTime = 0;
        const state = mpChannel.presenceState();
        const sids = Object.keys(state);
        updateOnlineCount(Math.max(globalOnlineCount || 1, sids.length));
        remotePlayers.forEach((_, sid) => {
          if (!state[sid]) removeRemoteAvatar(sid);
        });
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        if (key && key !== mySessionId) removeRemoteAvatar(key);
        if (Array.isArray(leftPresences)) {
          leftPresences.forEach(lp => {
            if (lp && lp.sessionId && lp.sessionId !== mySessionId) removeRemoteAvatar(lp.sessionId);
          });
        }
      })
      .on('broadcast', { event: 'leave' }, ({ payload }) => {
        if (payload && payload.sessionId && payload.sessionId !== mySessionId) {
          removeRemoteAvatar(payload.sessionId);
        }
      })
      .on('broadcast', { event: 'pos' }, ({ payload }) => {
        const entry = getOrCreateRemoteAvatar(payload);
        if (entry) {
          entry.targetX = payload.x;
          entry.targetY = typeof payload.y === "number" ? payload.y : 0.1;
          entry.targetZ = payload.z;
          entry.targetRotY = payload.rotY;
          entry.jump = !!payload.jump;
          entry.fishing = payload.fishing || null;
          entry.showFish = payload.showFish || null;
          entry.rodCarry = payload.rodCarry || null;
          entry.lastSeen = Date.now();
          if (isMicEnabled && payload.sessionId && !peerConnections.has(payload.sessionId)) {
            createPeerConnection(payload.sessionId, true);
          }
        }
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        if (!payload || payload.sessionId === mySessionId) return;
        const entry = remotePlayers.get(payload.sessionId);
        if (entry && entry.mesh) {
          spawnFloatingBubble(entry.mesh, payload.ig, payload.message);
        }
      })
      .on('broadcast', { event: 'warga-chat' }, ({ payload }) => {
        if (!payload || payload.sessionId === mySessionId) return;
        if (typeof window.onPirakuWargaChatBroadcast === 'function') {
          window.onPirakuWargaChatBroadcast(payload);
        }
      })
      .on('broadcast', { event: 'founder-gift' }, ({ payload }) => {
        if (!payload || !payload.targetIg) return;
        const myClean = (localStorage.getItem('piraku_my_ig') || '').trim().toLowerCase().replace(/^@/, '');
        if (myClean && myClean === String(payload.targetIg).trim().toLowerCase().replace(/^@/, '')) {
          if (typeof window.reloadPirakuEconomyForCurrentUser === 'function') window.reloadPirakuEconomyForCurrentUser();
          if (typeof window.showToast === 'function') window.showToast('🎁 Hadiah dari Founder @yelclaw: ' + (payload.summaryText || 'Cek dompet & tasmu!'));
        }
      })
      .on('broadcast', { event: 'voice-ready' }, ({ payload }) => {
        if (!payload || !payload.from || payload.from === mySessionId) return;
        const pc = createPeerConnection(payload.from, false);
        if (localAudioStream) {
          const senders = pc.getSenders();
          localAudioStream.getTracks().forEach(track => {
            const existingSender = senders.find(s => s.track && s.track.kind === track.kind);
            if (existingSender) {
              existingSender.replaceTrack(track).catch(() => {});
            } else {
              pc.addTrack(track, localAudioStream);
            }
          });
        }
        // Deterministik: hanya pihak dengan sessionId lebih kecil yang mengirim offer agar tidak tabrakan
        if (mySessionId < payload.from && pc.signalingState === 'stable') {
          sendOfferToPeer(payload.from, pc);
        }
      })
      .on('broadcast', { event: 'rtc-offer' }, async ({ payload }) => {
        if (!payload || !payload.from || payload.from === mySessionId) return;
        if (payload.to && payload.to !== mySessionId) return;
        const pc = createPeerConnection(payload.from, false);
        try {
          // Anti-glare: jika kedua pihak bersamaan mengirim offer, pihak dengan ID lebih besar mengalah (rollback)
          if (pc.signalingState !== 'stable') {
            if (mySessionId < payload.from) return;
            await pc.setLocalDescription({ type: 'rollback' });
          }
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          // Flush ICE candidates yang datang lebih dulu sebelum remoteDescription siap
          const queued = pendingIceMap.get(payload.from) || [];
          pendingIceMap.delete(payload.from);
          for (const cand of queued) {
            try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch (_) {}
          }
          if (localAudioStream) {
            const senders = pc.getSenders();
            localAudioStream.getTracks().forEach(track => {
              if (!senders.find(s => s.track && s.track.kind === track.kind)) {
                pc.addTrack(track, localAudioStream);
              }
            });
          }
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
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            const queued = pendingIceMap.get(payload.from) || [];
            pendingIceMap.delete(payload.from);
            for (const cand of queued) {
              try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch (_) {}
            }
          } catch (e) {}
        }
      })
      .on('broadcast', { event: 'rtc-ice' }, async ({ payload }) => {
        if (!payload || !payload.from || payload.from === mySessionId || !payload.candidate) return;
        if (payload.to && payload.to !== mySessionId) return;
        const pc = peerConnections.get(payload.from);
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch (e) {}
        } else {
          const list = pendingIceMap.get(payload.from) || [];
          list.push(payload.candidate);
          pendingIceMap.set(payload.from, list);
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
  window.broadcastFounderGift = function(targetIg, summaryText) {
    if (mpChannel && mpChannel.state === 'joined') {
      mpChannel.send({ type: 'broadcast', event: 'founder-gift', payload: { targetIg, summaryText } });
    }
  };

  window.broadcastWargaChat = function(senderIg, message, createdAt) {
    if (mpChannel && mpChannel.state === 'joined') {
      mpChannel.send({
        type: 'broadcast',
        event: 'warga-chat',
        payload: {
          sessionId: mySessionId,
          sender_ig: senderIg,
          message: String(message || '').slice(0, 500),
          created_at: createdAt || new Date().toISOString()
        }
      });
    }
  };

  window.switchMultiplayerDistrict = function() {
    connectGlobalWorld();
  };

  window.getPirakuOnlineUsersList = function() {
    const map = new Map();
    const myInfo = getMyIdentity();
    const myNorm = String(myInfo.ig || "").trim().toLowerCase().replace(/^@/, "");
    map.set(myNorm || "self", {
      ig: myInfo.ig || "@tamu",
      kecamatan: myInfo.kecamatan || "Bandung",
      mapId: window.pirakuInDistrict ? (window.pirakuActiveMapId || "distrik") : "pusat_kota",
      afk: !!document.hidden,
      tierBadge: myInfo.tierBadge || "",
      tierName: myInfo.tierName || "",
      isSelf: true
    });
    const addPresenceMap = (st) => {
      if (!st || typeof st !== "object") return;
      Object.values(st).forEach(arr => {
        if (!Array.isArray(arr)) return;
        arr.forEach(p => {
          if (!p || !p.ig) return;
          const k = String(p.ig).trim().toLowerCase().replace(/^@/, "");
          if (!k || map.has(k)) return;
          map.set(k, {
            ig: p.ig,
            kecamatan: p.kecamatan || "Bandung",
            mapId: p.mapId || "",
            afk: !!p.afk,
            tierBadge: p.tierBadge || "",
            tierName: p.tierName || "",
            isSelf: k === myNorm
          });
        });
      });
    };
    if (globalPresenceChannel && typeof globalPresenceChannel.presenceState === "function") {
      addPresenceMap(globalPresenceChannel.presenceState());
    }
    if (mpChannel && typeof mpChannel.presenceState === "function") {
      addPresenceMap(mpChannel.presenceState());
    }
    remotePlayers.forEach(en => {
      if (!en || !en.ig) return;
      const k = String(en.ig).trim().toLowerCase().replace(/^@/, "");
      if (!k || map.has(k)) return;
      const rt = (window.pirakuRemoteTiers || {})[k] || {};
      map.set(k, {
        ig: en.ig,
        kecamatan: "Bandung",
        tierBadge: rt.tierBadge || "",
        tierName: rt.tierName || "",
        isSelf: false
      });
    });
    return Array.from(map.values());
  };

  window.focusOnlineCitizenByIg = function(rawIg) {
    const clean = String(rawIg || "").trim().toLowerCase().replace(/^@/, "");
    if (!clean) return;
    let targetX = null, targetZ = null, liveMesh = null;
    remotePlayers.forEach(en => {
      if (!en || !en.ig) return;
      if (String(en.ig).trim().toLowerCase().replace(/^@/, "") === clean && en.mesh && en.mesh.position) {
        targetX = en.mesh.position.x;
        targetZ = en.mesh.position.z;
        liveMesh = en.mesh;
      }
    });
    if (targetX === null && mpChannel && typeof mpChannel.presenceState === "function") {
      const pSt = mpChannel.presenceState();
      Object.values(pSt || {}).forEach(arr => {
        if (!Array.isArray(arr)) return;
        arr.forEach(p => {
          if (!p || !p.ig) return;
          if (String(p.ig).trim().toLowerCase().replace(/^@/, "") === clean && typeof p.x === "number" && typeof p.z === "number") {
            targetX = p.x;
            targetZ = p.z;
          }
        });
      });
    }
    if (targetX === null && Array.isArray(window.registeredCitizensList)) {
      const reg = window.registeredCitizensList.find(c => String(c?.ig || "").trim().toLowerCase().replace(/^@/, "") === clean);
      if (reg && typeof reg.x === "number" && typeof reg.z === "number") {
        targetX = reg.x;
        targetZ = reg.z;
      }
    }
    if (targetX !== null && targetZ !== null) {
      window.pirakuCameraTrackTarget = { ig: clean, mesh: liveMesh, x: targetX, z: targetZ };
      window.pirakuActiveMinimapTarget = { x: targetX, z: targetZ, label: "📍 @" + clean, mapId: window.pirakuActiveMapId || "bandung_wetan" };
      let stopBtn = document.getElementById("piraku-stop-track-btn");
      if (!stopBtn && document.body) {
        stopBtn = document.createElement("button");
        stopBtn.id = "piraku-stop-track-btn";
        stopBtn.type = "button";
        stopBtn.style.cssText = "position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:95;padding:6px 14px;border-radius:999px;background:rgba(15,23,42,0.94);border:1.5px solid #38bdf8;color:#fde047;font-size:11.5px;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,0.55);cursor:pointer;display:none;";
        stopBtn.onclick = () => {
          window.pirakuCameraTrackTarget = null;
          window.pirakuActiveMinimapTarget = null;
          stopBtn.style.display = "none";
          if (typeof window.resetPirakuCamera === "function") window.resetPirakuCamera();
        };
        document.body.appendChild(stopBtn);
      }
      if (stopBtn) {
        stopBtn.textContent = "📍 Melacak @" + clean + " • ✕ Kembali";
        stopBtn.style.display = "block";
      }
      const camObj = getActiveCamera();
      const ctrl = window.pirakuControls;
      if (typeof gsap !== "undefined") {
        if (ctrl && ctrl.target) gsap.killTweensOf(ctrl.target);
        if (camObj && camObj.position) gsap.killTweensOf(camObj.position);
      }
      if (ctrl && ctrl.target && camObj) {
        const offX = camObj.position.x - ctrl.target.x;
        const offY = Math.max(3.5, camObj.position.y - ctrl.target.y);
        const offZ = camObj.position.z - ctrl.target.z;
        ctrl.target.set(targetX, 1.4, targetZ);
        camObj.position.set(targetX + offX, 1.4 + offY, targetZ + offZ);
        if (typeof ctrl.update === "function") ctrl.update();
      }
      if (liveMesh && liveMesh.userData && liveMesh.userData.a && liveMesh.userData.a.c && typeof window.showCitizenSpeech === "function") {
        window.showCitizenSpeech(liveMesh.userData.a.c, false);
      }
      if (typeof window.showToast === "function") {
        window.showToast("📍 Melacak @" + clean + (liveMesh ? " (Live)" : " (Lokasi terakhir)"));
      }
    } else if (typeof window.showToast === "function") {
      window.showToast("📍 @" + clean + " sedang berada di distrik / tab lain.");
    }
  };

  window.openOnlineCitizensModal = function() {
    let modal = document.getElementById("piraku-online-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "piraku-online-modal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.78);backdrop-filter:blur(7px);z-index:99995;display:none;align-items:center;justify-content:center;padding:16px;";
      modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
      document.body.appendChild(modal);
    }
    const list = window.getPirakuOnlineUsersList();
    const esc = s => String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[m]));
    modal.innerHTML = `
      <div style="width:100%;max-width:380px;max-height:80dvh;display:flex;flex-direction:column;background:linear-gradient(160deg,#0f172a,#162033);border:1.5px solid rgba(74,222,128,0.45);border-radius:20px;overflow:hidden;color:#f8fafc;box-shadow:0 22px 55px rgba(0,0,0,0.78);">
        <div style="padding:13px 16px;border-bottom:1px solid rgba(148,163,184,0.18);display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:10px;font-weight:800;color:#4ade80;letter-spacing:0.6px;">● REALTIME PRESENCE</div>
            <div style="font-size:15px;font-weight:900;">Warga Sedang Online (${Math.max(globalOnlineCount || 1, list.length)})</div>
          </div>
          <button onclick="document.getElementById('piraku-online-modal').style.display='none'" style="border:none;background:rgba(148,163,184,0.16);color:#f8fafc;width:30px;height:30px;border-radius:9px;font-weight:800;cursor:pointer;">✕</button>
        </div>
        <div style="padding:12px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:7px;">
          ${list.map(u => {
            const locText = u.mapId && u.mapId !== "pusat_kota" && u.mapId !== "bandung_wetan"
              ? ("📍 Kec. " + u.mapId.replace(/_/g, " "))
              : (u.kecamatan || "Bandung");
            return `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 11px;border-radius:12px;background:${u.isSelf ? "rgba(250,204,21,0.12)" : "rgba(30,41,59,0.85)"};border:1px solid ${u.isSelf ? "rgba(250,204,21,0.45)" : "rgba(148,163,184,0.2)"};">
              <div style="min-width:0;">
                <div style="font-size:12.5px;font-weight:800;color:${u.isSelf ? "#fde047" : "#f8fafc"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                  ${u.afk ? "🟡" : "🟢"} ${esc(u.ig)} ${u.afk ? "<span style='font-size:9.5px;color:#fbbf24;'>(AFK)</span>" : ""} ${u.isSelf ? "<span style='font-size:10px;color:#4ade80;'>(Kamu)</span>" : ""}
                </div>
                <div style="font-size:10.5px;color:#94a3b8;margin-top:1px;">
                  ${u.tierBadge && u.tierName ? `<span style="color:#fde047;font-weight:700;">${esc(u.tierBadge)} ${esc(u.tierName)}</span> • ` : ""}${esc(locText)}
                </div>
              </div>
              ${!u.isSelf ? `<button onclick="document.getElementById('piraku-online-modal').style.display='none';if(typeof window.focusOnlineCitizenByIg==='function')window.focusOnlineCitizenByIg('${esc(u.ig)}');" style="border:none;background:rgba(56,189,248,0.2);color:#38bdf8;padding:5px 9px;border-radius:8px;font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap;">📍 Lacak</button>` : ""}
            </div>
          `; }).join("")}
          ${globalOnlineCount > list.length ? `<div style="text-align:center;font-size:10.5px;color:#94a3b8;padding:4px 0;">+ ${globalOnlineCount - list.length} warga lainnya di tab background / tamu.</div>` : ""}
        </div>
        <div style="padding:10px 14px;border-top:1px solid rgba(148,163,184,0.16);display:flex;gap:8px;">
          <button onclick="document.getElementById('piraku-online-modal').style.display='none';if(typeof openChatModal==='function')openChatModal();" style="flex:1;border:none;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#fff;padding:9px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;">💬 Buka Balai Obrolan</button>
        </div>
      </div>
    `;
    modal.style.display = "flex";
  };

  let globalPresenceChannel = null;
  let globalOnlineCount = 1;
  function connectGlobalPresenceCount() {
    const useCf = useCloudflareRealtime();
    if ((!useCf && (typeof supabaseClient === 'undefined' || !supabaseClient)) || globalPresenceChannel) return;
    const myInfo = getMyIdentity();
    globalPresenceChannel = useCf
      ? createCloudflareChannel('/ws/global', mySessionId)
      : supabaseClient.channel('piraku-global-presence', {
          config: { presence: { key: mySessionId } }
        });
    globalPresenceChannel
      .on('presence', { event: 'sync' }, () => {
        if (!globalPresenceChannel) return;
        globalOnlineCount = Math.max(1, Object.keys(globalPresenceChannel.presenceState()).length);
        updateOnlineCount(globalOnlineCount);
      })
      .on('presence', { event: 'join' }, () => {
        if (!globalPresenceChannel) return;
        globalOnlineCount = Math.max(1, Object.keys(globalPresenceChannel.presenceState()).length);
        updateOnlineCount(globalOnlineCount);
      })
      .on('presence', { event: 'leave' }, () => {
        if (!globalPresenceChannel) return;
        globalOnlineCount = Math.max(1, Object.keys(globalPresenceChannel.presenceState()).length);
        updateOnlineCount(globalOnlineCount);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const trackPresence = async () => {
            try {
              const curId = getMyIdentity();
              await globalPresenceChannel.track({
                ig: curId.ig,
                mapId: window.pirakuInDistrict ? (window.pirakuActiveMapId || "distrik") : "pusat_kota",
                afk: !!document.hidden,
                online_at: new Date().toISOString()
              });
            } catch (e) {}
          };
          await trackPresence();
          document.addEventListener("visibilitychange", trackPresence);
        }
      });
  }

  function initPirakuMultiplayer() {
    if (!useCloudflareRealtime() && (typeof supabaseClient === 'undefined' || !supabaseClient)) {
      setTimeout(initPirakuMultiplayer, 400);
      return;
    }
    injectBubbleLayer();
    connectGlobalPresenceCount();
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
  btn.style.cssText = "position:fixed;bottom:72px;right:16px;z-index:9999;background:#0f172a;color:#38bdf8;border:1px solid #38bdf8;padding:8px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:all 0.2s;";
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



// --- PERSISTENT INVENTORY SYNC (SUPABASE & LOCALSTORAGE) ---
window.saveMyInventory = async function(inventoryArray) {
  try {
    localStorage.setItem('piraku_my_inventory', JSON.stringify(inventoryArray));
    const myIg = localStorage.getItem('piraku_my_ig');
    if (myIg && typeof sb !== 'undefined' && sb) {
      await sb.from('warga_publik')
        .update({ inventory: inventoryArray })
        .ilike('ig', myIg);
    }
  } catch (err) {
    console.error("[Inventory] Gagal menyimpan inventaris:", err);
  }
};

window.loadMyInventory = async function() {
  let localInv = [];
  try {
    const raw = localStorage.getItem('piraku_my_inventory');
    if (raw) localInv = JSON.parse(raw);
  } catch (e) {}

  try {
    const myIg = localStorage.getItem('piraku_my_ig');
    if (myIg && typeof sb !== 'undefined' && sb) {
      const { data, error } = await sb.from('warga_publik')
        .select('inventory')
        .ilike('ig', myIg)
        .maybeSingle();
      if (data && data.inventory) {
        if (Array.isArray(data.inventory)) {
          localInv = data.inventory;
          localStorage.setItem('piraku_my_inventory', JSON.stringify(localInv));
        }
      }
    }
  } catch (err) {
    console.error("[Inventory] Gagal memuat dari Supabase:", err);
  }
  return localInv;
};


// Auto-reconnect WebRTC dipicu otomatis saat mic diaktifkan
if (typeof window.toggleMyMic === "function" && !window.__micAutoReconnectPatched) {
  window.__micAutoReconnectPatched = true;
  const oldToggle = window.toggleMyMic;
  window.toggleMyMic = function() {
    oldToggle();
    if (window.isMyMicActive && typeof window.reconnectMyPeerConnections === "function") {
      window.reconnectMyPeerConnections();
    }
  };
}


// --- CLEAN UI: SEMBUNYIKAN TOMBOL RECONNECT MELAYANG & AUTO-RECONNECT DI MIC ---
(function() {
  const hideFloatingReconnect = () => {
    document.querySelectorAll("button").forEach(btn => {
      if ((btn.innerText || "").includes("Reconnect Mic")) {
        btn.remove();
      }
    });
  };
  hideFloatingReconnect();
  setInterval(hideFloatingReconnect, 500);

  if (!window.__pirakuMicAutoHooked) {
    window.__pirakuMicAutoHooked = true;
    document.addEventListener("click", function(e) {
      const micBtn = e.target.closest("button");
      if (!micBtn) return;
      const txt = (micBtn.innerText || micBtn.title || "").toLowerCase();
      if (txt.includes("mic off") || micBtn.id.toLowerCase().includes("mic")) {
        setTimeout(() => {
          if (typeof window.reconnectMyPeerConnections === "function") {
            window.reconnectMyPeerConnections();
          } else if (typeof window.initWebRTCVoice === "function") {
            window.initWebRTCVoice();
          }
        }, 250);
      }
    }, true);
  }
})();


// --- V104: PROXIMITY VOICE FILTER & SPATIAL VOLUME ATTENUATION ---
(function() {
  if (window.__pirakuProximityVoiceActive) return;
  window.__pirakuProximityVoiceActive = true;

  const MAX_VOICE_RADIUS = 45; // Batas jarak maksimal suara tersambung (unit dunia 3D)
  const FULL_VOLUME_RADIUS = 10; // Jarak ngobrol dekat (volume 100%)

  function getDistance3D(posA, posB) {
    if (!posA || !posB) return Infinity;
    const dx = (posA.x || 0) - (posB.x || 0);
    const dz = (posA.z || 0) - (posB.z || 0);
    return Math.sqrt(dx * dx + dz * dz);
  }

  // Loop pengecekan jarak tiap 500ms untuk mengatur volume & koneksi peer
  setInterval(() => {
    const myPos = window.myPlayerPosition || (window.playerMesh && window.playerMesh.position);
    const peers = window.peerConnections || window.rtcPeers || {};
    const remotePlayers = window.remotePlayers || window.otherPlayers || {};

    if (!myPos) return;

    Object.keys(peers).forEach(peerId => {
      const target = remotePlayers[peerId];
      const targetPos = target && (target.position || target.mesh?.position || target);
      const dist = getDistance3D(myPos, targetPos);

      // 1. Atur volume elemen audio sesuai jarak (spatial fade-out)
      const audioEl = document.getElementById("audio-" + peerId) || document.querySelector(`audio[data-peer="${peerId}"]`);
      if (audioEl) {
        if (dist <= FULL_VOLUME_RADIUS) {
          audioEl.volume = 1.0;
        } else if (dist >= MAX_VOICE_RADIUS) {
          audioEl.volume = 0.0;
        } else {
          const ratio = 1 - ((dist - FULL_VOLUME_RADIUS) / (MAX_VOICE_RADIUS - FULL_VOLUME_RADIUS));
          audioEl.volume = Math.max(0, Math.min(1, ratio));
        }
      }

      // 2. Putus koneksi peer jika warga sudah keluar jauh dari radius (> 50 unit)
      if (dist > MAX_VOICE_RADIUS + 5) {
        const pc = peers[peerId];
        if (pc && typeof pc.close === "function") {
          pc.close();
          delete peers[peerId];
        }
        if (audioEl) audioEl.remove();
      }
    });
  }, 500);

  // Guard saat menerima sinyal offer/connect baru: tolak jika di luar radius
  window.isPeerWithinVoiceRadius = function(peerId) {
    const myPos = window.myPlayerPosition || (window.playerMesh && window.playerMesh.position);
    const remotePlayers = window.remotePlayers || window.otherPlayers || {};
    const target = remotePlayers[peerId];
    const targetPos = target && (target.position || target.mesh?.position || target);
    if (!myPos || !targetPos) return true; // Izinkan dulu jika posisi belum ter-sync awal
    return getDistance3D(myPos, targetPos) <= MAX_VOICE_RADIUS;
  };

  function sendLeaveSignal() {
    try {
      if (mpChannel && mpChannel.state === 'joined') {
        mpChannel.send({ type: 'broadcast', event: 'leave', payload: { sessionId: mySessionId } });
      }
    } catch (_) {}
  }
  window.addEventListener("pagehide", sendLeaveSignal);
  window.addEventListener("beforeunload", sendLeaveSignal);
})();
