// ================= UI & EVENT LISTENER TOMBOL MIC VOICE CHAT =================
(function() {
  window.addEventListener('DOMContentLoaded', () => {
    initMicController();
  });

  function initMicController() {
    const micBtn = document.getElementById('btn-mic') || document.querySelector('.mic-toggle-btn');
    
    if (!micBtn) {
      console.warn("Elemen tombol mic tidak ditemukan di DOM. Lewati inisialisasi UI mic.");
      return;
    }

    micBtn.classList.remove('active', 'muted');

    micBtn.addEventListener('click', async () => {
      try {
        if (!window.localAudioStream) {
          window.localAudioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }, 
            video: false 
          });
          window.isMicEnabled = true;
          console.log("Mikrofon berhasil diaktifkan dan diizinkan.");

          if (window.peerConnections && window.peerConnections.size > 0) {
            window.peerConnections.forEach((pc) => {
              window.localAudioStream.getTracks().forEach(track => {
                const senders = pc.getSenders();
                const hasTrack = senders.some(s => s.track && s.track.kind === 'audio');
                if (!hasTrack) {
                  pc.addTrack(track, window.localAudioStream);
                }
              });
            });
          }
        } else {
          window.isMicEnabled = !window.isMicEnabled;
          const audioTrack = window.localAudioStream.getAudioTracks()[0];
          if (audioTrack) {
            audioTrack.enabled = window.isMicEnabled;
          }
        }

        if (window.isMicEnabled) {
          micBtn.classList.add('active');
          micBtn.classList.remove('muted');
          micBtn.setAttribute('aria-pressed', 'true');
        } else {
          micBtn.classList.remove('active');
          micBtn.classList.add('muted');
          micBtn.setAttribute('aria-pressed', 'false');
        }

      } catch (err) {
        console.error("Gagal mengakses mikrofon:", err);
        alert("Mohon berikan izin akses mikrofon pada browser untuk menggunakan fitur voice chat.");
      }
    });
  }
})();
