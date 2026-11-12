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

// ================= PIRAKUBDG — SIMPAN & MUAT PROGRES QUEST (SUPABASE) =================
// Bagian dari js/multiplayer.js. Dipasang sebagai window.PirakuQuestProgress dan dipakai oleh
// js/main.js (interaksi trem 3D) dan js/rpg-ui.js (Mini Quest Tracker).
//
// Konfigurasi Supabase: klien dibuat di js/main.js (const supabaseClient, URL + anon key) dan
// dipakai bersama. Skrip ini menunggu hingga klien tersedia, jadi urutan <script> aman.
//   SUPABASE_URL      : https://myilyqnawceobqedjbfa.supabase.co
//   SUPABASE_ANON_KEY : sb_publishable_...  (publishable key, aman di browser + RLS)
//
// Tabel target (buat sekali di SQL editor Supabase):
//
//   create table if not exists public.warga_quest_progress (
//     id          bigint generated by default as identity primary key,
//     player_key  text        not null,          -- ig warga atau device id anonim
//     quest_id    text        not null,          -- id dari window.PIRAKU_QUESTS
//     status      text        not null default 'not_started', -- not_started|accepted|in_progress|completed
//     coins       integer     not null default 0, -- total koin yang dimiliki pemain untuk quest ini
//     quest_date  date        not null default current_date, -- untuk quest harian
//     updated_at  timestamptz not null default now(),
//     unique (player_key, quest_id, quest_date)
//   );
//   alter table public.warga_quest_progress enable row level security;
//   create policy "warga_quest_progress_anon_all" on public.warga_quest_progress
//     for all to anon using (true) with check (true);
//   -- indeks bantu
//   create index if not exists warga_quest_progress_key_idx
//     on public.warga_quest_progress (player_key, quest_date);
//
// Tanpa tabel/policy di atas, progres tetap tersimpan di localStorage (mode offline-first)
// dan penulisan Supabase gagal dengan pesan konsol yang jelas — game tidak error.
(function () {
  'use strict';

  const TABLE = 'warga_quest_progress';
  const LS_PREFIX = 'piraku_quest_progress_v1:';
  const LS_DEVICE = 'piraku_device_id';
  const VALID = ['not_started', 'accepted', 'in_progress', 'completed'];

  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function deviceId() {
    try {
      let id = localStorage.getItem(LS_DEVICE);
      if (!id) {
        id = 'guest-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(LS_DEVICE, id);
      }
      return id;
    } catch (e) { return 'guest-anon'; }
  }

  /** Identitas pemain: ig warga (piraku_my_ig) atau id perangkat untuk tamu. */
  function playerKey() {
    try {
      const ig = localStorage.getItem('piraku_my_ig');
      if (ig && String(ig).trim()) return 'ig:' + String(ig).trim().toLowerCase();
    } catch (e) {}
    return 'dev:' + deviceId();
  }

  function client() {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) return supabaseClient;
    if (window.supabaseClient) return window.supabaseClient;
    return null;
  }

  /* ---------------- localStorage (cache + fallback) ---------------- */
  function lsKey(qid) { return LS_PREFIX + playerKey() + ':' + qid; }

  function getLocal(questId) {
    try {
      const raw = localStorage.getItem(lsKey(questId));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return null;
      return {
        quest_id: questId,
        status: VALID.indexOf(obj.status) > -1 ? obj.status : 'not_started',
        coins: Math.max(0, parseInt(obj.coins, 10) || 0),
        quest_date: obj.quest_date || todayStr(),
        dirty: !!obj.dirty
      };
    } catch (e) { return null; }
  }

  function setLocal(questId, record, dirty) {
    try {
      localStorage.setItem(lsKey(questId), JSON.stringify({
        status: record.status, coins: record.coins,
        quest_date: record.quest_date || todayStr(), dirty: !!dirty
      }));
    } catch (e) {}
  }

  const STATUS_LABEL = { accepted: 'Diterima', in_progress: 'Berjalan', completed: 'Selesai' };

  /** Perbarui Mini Quest Tracker (rpg-ui.js) sesuai status quest utama. */
  function notifyTracker(questId) {
    if (typeof window === 'undefined' || !window.PirakuRPG) return;
    const rpg = window.PirakuRPG;
    if (!rpg.tracker) return;
    const Q = window.PIRAKU_QUESTS;
    if (!Q || !Q.mainQuest || Q.mainQuest.id !== questId) return; // kartu hanya quest utama
    const quest = Q.mainQuest;

    const rec = getLocal(questId);
    const status = rec ? rec.status : 'not_started';
    const reward = (quest.reward && quest.reward.coins) || 0;
    const progress = status === 'completed' ? 1 : status === 'in_progress' ? 0.5 : 0;

    rpg.tracker.setStatus(STATUS_LABEL[status] || 'Menunggu', progress);
    if (status === 'completed') {
      rpg.tracker.setMeta('🏆 +' + reward + ' koin · réngsé');
    } else if (status === 'in_progress') {
      rpg.tracker.setMeta('📍 Turun di ' + ((quest.finishPoint && quest.finishPoint.name) || 'Halte Riau'));
    } else if (status === 'accepted') {
      rpg.tracker.setMeta('📍 Naek trem di ' + ((quest.startPoint && quest.startPoint.name) || 'Halte Gasibu'));
    }
    rpg.tracker.show();
    rpg.tracker.flash();
  }

  /** Snapshot misi harian dari main.js (null bila QuestSystem belum aktif). */
  function dailySnapshot() {
    const b = window.PirakuGameBridge;
    if (!b || typeof b.getDailyProgress !== 'function') return null;
    try {
      const p = b.getDailyProgress();
      return p && p.total ? p : null;
    } catch (e) { return null; }
  }

  let lastDailyKey = '';
  /**
   * Simpan jumlah misi harian selesai sebagai baris quest_id='daily_quests'
   * (kolom status diisi angka, coins diisi angka yang sama) agar progres harian
   * ikut pulih saat halaman di-refresh.
   */
  function saveDailyProgress() {
    const p = dailySnapshot();
    if (!p) return;
    const key = p.done + '/' + p.total;
    if (key === lastDailyKey) return;
    lastDailyKey = key;
    const prev = getLocal('daily_quests');
    setLocal('daily_quests', { status: String(p.done), coins: p.done, quest_date: todayStr() }, true);
    if (!prev || prev.status !== String(p.done)) push(getLocal('daily_quests'));
  }

  /* ---------------- Supabase ---------------- */
  async function push(record) {
    const sb = client();
    if (!sb) return { ok: false, reason: 'no-client' };
    const row = {
      player_key: playerKey(),
      quest_id: record.quest_id,
      status: record.status,
      coins: record.coins,
      quest_date: record.quest_date || todayStr(),
      updated_at: new Date().toISOString()
    };
    try {
      // Upsert pada unique (player_key, quest_id, quest_date).
      const { error } = await sb.from(TABLE).upsert(row, {
        onConflict: 'player_key,quest_id,quest_date'
      });
      if (error) {
        // Fallback: tabel bisa saja tanpa unique constraint — update lalu insert.
        const up = await sb.from(TABLE)
          .update({ status: row.status, coins: row.coins, updated_at: row.updated_at })
          .eq('player_key', row.player_key).eq('quest_id', row.quest_id).eq('quest_date', row.quest_date)
          .select('id');
        if (!up.error && up.data && up.data.length) return { ok: true };
        const ins = await sb.from(TABLE).insert([row]);
        if (ins.error) {
          console.warn('[PirakuQuestProgress] gagal simpan ke Supabase:', ins.error.message || ins.error);
          return { ok: false, reason: 'supabase', error: ins.error };
        }
      }
      return { ok: true };
    } catch (err) {
      console.warn('[PirakuQuestProgress] error jaringan saat simpan:', err && err.message);
      return { ok: false, reason: 'network', error: err };
    }
  }

  async function flushDirty() {
    const sb = client();
    if (!sb) return 0;
    let sent = 0;
    const Q = window.PIRAKU_QUESTS;
    const ids = (Q && Q.allQuests ? Q.allQuests : []).map(q => q.id);
    ids.push('daily_quests');
    for (let i = 0; i < ids.length; i++) {
      const rec = getLocal(ids[i]);
      if (!rec || !rec.dirty) continue;
      // eslint-disable-next-line no-await-in-loop
      const r = await push(rec);
      if (r.ok) { setLocal(ids[i], rec, false); sent++; }
    }
    return sent;
  }

  /**
   * Simpan progres quest. Ditulis ke localStorage lebih dulu (instan, tahan refresh),
   * lalu di-push ke Supabase. coins: tambahan koin (0 = tak menambah).
   * Urutan status hanya bisa maju (not_started < accepted < in_progress < completed)
   * supaya progres tidak mundur akibat dua tab / refresh.
   */
  function save(questId, status, coinsDelta) {
    if (!questId) return null;
    const st = VALID.indexOf(status) > -1 ? status : 'not_started';
    const prev = getLocal(questId) || { status: 'not_started', coins: 0, quest_date: todayStr() };
    const add = Math.max(0, parseInt(coinsDelta, 10) || 0);

    const rank = { not_started: 0, accepted: 1, in_progress: 2, completed: 3 };
    if (rank[prev.status] > rank[st]) return null;               // jangan mundurkan status
    const awarded = (add > 0 && st === 'completed' && prev.status !== 'completed') ? add : 0;

    const record = {
      quest_id: questId,
      status: st,
      coins: prev.coins + awarded,
      quest_date: prev.quest_date || todayStr()
    };
    setLocal(questId, record, true);

    // Koin pemain (HUD 🪙 di main.js) ikut naik saat hadiah diberikan.
    if (awarded && window.PirakuGameBridge && typeof window.PirakuGameBridge.addCoins === 'function') {
      window.PirakuGameBridge.addCoins(awarded);
    }
    if (awarded && typeof window.playSynthTone === 'function') window.playSynthTone(1180, 'sine', 0.35);

    notifyTracker(questId);
    const syncPromise = push(record).then(r => {
      if (r && r.ok) setLocal(questId, record, false);
      return r;
    });
    return { record: record, awarded: awarded, synced: syncPromise };
  }

  /** Muat progres quest dari Supabase (setelah halaman di-refresh). */
  async function load(options) {
    const opts = options || {};
    const sb = client();
    const Q = window.PIRAKU_QUESTS;
    const ids = (Q && Q.allQuests ? Q.allQuests : []).map(q => q.id);
    const result = { source: 'local', quests: {}, daily: [], count: 0 };

    // 1. Cache lokal dulu (tampil instan walau offline).
    ids.forEach(id => {
      const rec = getLocal(id);
      if (rec && rec.status !== 'not_started') {
        result.quests[id] = rec;
      }
    });

    // 2. Coba Supabase.
    if (sb) {
      try {
        const { data, error } = await sb.from(TABLE)
          .select('quest_id,status,coins,quest_date,updated_at')
          .eq('player_key', playerKey())
          .order('updated_at', { ascending: false })
          .limit(200);
        if (!error && Array.isArray(data)) {
          result.source = 'supabase';
          let fetched = 0;
          data.forEach(row => {
            if (!row || !row.quest_id) return;
            if (row.quest_id === 'daily_quests') return; // baris agregat, bukan quest
            // Ambil baris terbaru per quest (data sudah urut updated_at desc).
            if (result.quests[row.quest_id] && result.quests[row.quest_id]._fromDb) return;
            const rec = {
              quest_id: row.quest_id,
              status: VALID.indexOf(row.status) > -1 ? row.status : 'not_started',
              coins: Math.max(0, parseInt(row.coins, 10) || 0),
              quest_date: row.quest_date || todayStr(),
              _fromDb: true
            };
            const local = getLocal(row.quest_id);
            // Baris lokal yang belum terkirim (dirty) menang agar tak kehilangan progres offline.
            if (local && local.dirty) return;
            result.quests[row.quest_id] = rec;
            setLocal(row.quest_id, rec, false);
            fetched++;
          });
          result.count = fetched;

          // Progres misi harian: baris quest_id='daily_quests', kolom status = jumlah selesai.
          const daily = data.find(r => r && r.quest_id === 'daily_quests');
          if (daily && daily.status != null && !isNaN(parseInt(daily.status, 10))) {
            result.dailyCount = parseInt(daily.status, 10) || 0;
            lastDailyKey = result.dailyCount + '/' + result.dailyCount; // hindari tulis ulang
          }
        } else if (error) {
          console.warn('[PirakuQuestProgress] gagal muat dari Supabase (' + TABLE + '):', error.message || error);
          result.reason = 'supabase';
        }
        saveDailyProgress();
      } catch (err) {
        console.warn('[PirakuQuestProgress] error jaringan saat muat:', err && err.message);
        result.reason = 'network';
      }
    } else {
      result.reason = 'no-client';
    }

    // 3. Terapkan ke UI: tracker + koin.
    Object.keys(result.quests).forEach(id => notifyTracker(id));

    let questCoins = 0;
    Object.keys(result.quests).forEach(id => {
      questCoins = Math.max(questCoins, result.quests[id].coins || 0);
    });
    const bridge = window.PirakuGameBridge;
    if (bridge && typeof bridge.setCoins === 'function' && questCoins > 0) {
      // Hanya naikkan: koin yang dipungut di dunia bisa lebih besar dari catatan quest.
      if (typeof bridge.getCoins === 'function' && bridge.getCoins() < questCoins) bridge.setCoins(questCoins);
    }

    // 4. Kirim balik progres yang belum tersimpan.
    flushDirty();
    return result;
  }

  /** Muat progres setelah refresh + beri tahu pemain status quest trem. */
  async function resumeOnRefresh() {
    const res = await load();
    const Q = window.PIRAKU_QUESTS;
    const mainId = Q && Q.mainQuest ? Q.mainQuest.id : null;
    const rec = mainId ? res.quests[mainId] : null;
    const toast = typeof window.showToast === 'function' ? window.showToast : null;
    if (!toast) return res;
    const finish = (Q.mainQuest.finishPoint && Q.mainQuest.finishPoint.name) || 'Halte Riau';
    if (rec && rec.status === 'in_progress') {
      toast('Progres quest dimuat — lanjutkan trem dan turun di ' + finish + ' 🚊');
    } else if (rec && rec.status === 'accepted') {
      toast('Quest trem klasik masih aktif — naik trem di Halte Gasibu 🚊');
    } else if (rec && rec.status === 'completed') {
      toast('Quest trem klasik tos réngsé — ' + rec.coins + ' koin kacatet ✅');
    }
    return res;
  }

  window.PirakuQuestProgress = {
    table: TABLE,
    playerKey: playerKey,
    save: save,
    load: load,
    resumeOnRefresh: resumeOnRefresh,
    getLocal: getLocal,
    flush: flushDirty,
    today: todayStr,
    dailySnapshot: dailySnapshot
  };

  // Muat progres otomatis begitu ada warga/kontrol aktif (setelah login/auto-detect),
  // lalu sekali lagi saat tab kembali fokus agar progres lintas perangkat segar.
  let loadedOnce = false;
  function tryAutoLoad() {
    if (loadedOnce) return;
    if (typeof window === 'undefined' || !window.PIRAKU_QUESTS) return;
    if (!client()) return;
    loadedOnce = true;
    resumeOnRefresh();
  }
  function scheduleAutoLoad() {
    // Tunggu main.js siap (PIRAKU_QUESTS ada & klien Supabase dibuat).
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      if (loadedOnce || tries > 40) { clearInterval(iv); return; }
      tryAutoLoad();
    }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleAutoLoad);
  else scheduleAutoLoad();

  window.addEventListener('online', () => { flushDirty(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !loadedOnce) tryAutoLoad();
  });
  window.addEventListener('beforeunload', () => { flushDirty(); });
})();
