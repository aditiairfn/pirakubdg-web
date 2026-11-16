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

  // State WebRTC Voice Chat dengan Dynamic TURN Cloudflare Calls
  let localAudioStream = null;
  let isMicEnabled = false;
  const peerConnections = new Map();
  const remoteAudioEls = new Map();
  const pendingIceMap = new Map();
  const speakingPeers = new Map();
  const voiceAnalysers = new Map();
  let sharedAudioCtx = null;

  // Default ICE servers (STUN fallback jika Edge Function sedang memuat)
  let activeRtcConfig = {
    iceCandidatePoolSize: 8,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' }
    ]
  };

  // Ambil kredensial TURN dinamis dari Supabase Edge Function (Cloudflare Calls)
  async function fetchCloudflareTurnCredentials() {
    try {
      const res = await fetch('https://myilyqnawceobqedjbfa.supabase.co/functions/v1/get-turn-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data && data.iceServers) {
        activeRtcConfig.iceServers = data.iceServers;
        console.log("TURN Cloudflare Calls berhasil dimuat:", activeRtcConfig.iceServers.length, "server");
      }
    } catch (e) {
      console.warn("Gagal mengambil TURN Cloudflare, menggunakan STUN default:", e);
    }
  }

  // Panggil saat multiplayer dimuat
  fetchCloudflareTurnCredentials();

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

  // Gunakan activeRtcConfig saat membuat peer connection
  function createPeerConnection(targetSid, isInitiator) {
    if (peerConnections.has(targetSid)) return peerConnections.get(targetSid);
    
    const pc = new RTCPeerConnection(activeRtcConfig);
    peerConnections.set(targetSid, pc);

    if (localAudioStream) {
      localAudioStream.getTracks().forEach(track => pc.addTrack(track, localAudioStream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && mpChannel) {
        mpChannel.send({
          type: 'broadcast',
          event: 'rtc-ice',
          payload: { from: mySessionId, to: targetSid, candidate: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      let aud = remoteAudioEls.get(targetSid);
      if (!aud) {
        aud = document.createElement('audio');
        aud.autoplay = true;
        aud.playsInline = true;
        aud.muted = !!window.pirakuVoiceMuted;
        document.body.appendChild(aud);
        remoteAudioEls.set(targetSid, aud);
      }
      if (aud.srcObject !== event.streams[0]) {
        aud.srcObject = event.streams[0];
        aud.play().catch(() => {});
        startVoiceActivityMonitor(targetSid, event.streams[0]);
      }
    };

    if (isInitiator) {
      pc.createOffer().then(offer => pc.setLocalDescription(offer)).then(() => {
        if (mpChannel) {
          mpChannel.send({
            type: 'broadcast',
            event: 'rtc-offer',
            payload: { from: mySessionId, to: targetSid, offer: pc.localDescription }
          });
        }
      }).catch(() => {});
    }

    return pc;
  }
})();
