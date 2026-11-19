// piraku-civic.js — Pemilu Camat, Tutorial Goals, Jalur Cepat Rumah 3D (3 Kunci), Warga Distrik & Max Lvl 99
(function () {
  "use strict";

  const MAX_LEVEL = 99;
  const HOUSE_REQ_KEYS = 2;
  const HOUSE_BUILD_COST = 30;

  window.getPirakuXpRequiredForLevel = function (lvl) {
    const L = Math.max(1, Math.min(MAX_LEVEL, parseInt(lvl, 10) || 1));
    return 60 + (L - 1) * 20;
  };

  window.computePirakuLevelFromTotalXp = function (totalXp) {
    let xpLeft = Math.max(0, parseInt(totalXp, 10) || 0);
    let lvl = 1;
    while (lvl < MAX_LEVEL) {
      const req = window.getPirakuXpRequiredForLevel(lvl);
      if (xpLeft >= req) {
        xpLeft -= req;
        lvl++;
      } else {
        break;
      }
    }
    const reqNext = lvl >= MAX_LEVEL ? 1 : window.getPirakuXpRequiredForLevel(lvl);
    return {
      level: lvl,
      currentXpInLevel: lvl >= MAX_LEVEL ? reqNext : xpLeft,
      requiredForNext: reqNext,
      isMax: lvl >= MAX_LEVEL
    };
  };

  window.getPirakuCitizenTitle = function (lvl) {
    if (lvl >= 99) return "Legenda Tatar Sunda 👑";
    if (lvl >= 50) return "Tokoh Kota Bandung";
    if (lvl >= 25) return "Sesepuh Distrik";
    if (lvl >= 10) return "Penggerak Wilayah";
    if (lvl >= 5) return "Warga Teladan";
    if (lvl >= 2) return "Warga Aktif";
    return "Warga Baru";
  };

  window.grantPirakuXP = async function (amount, reasonText) {
    const myIg = (localStorage.getItem("piraku_my_ig") || "").trim();
    const added = Math.max(0, parseInt(amount, 10) || 0);
    if (!added) return window.computePirakuLevelFromTotalXp(parseInt(localStorage.getItem("piraku_my_xp") || "0", 10));

    let totalXp = parseInt(localStorage.getItem("piraku_my_xp") || "0", 10);
    const oldInfo = window.computePirakuLevelFromTotalXp(totalXp);

    totalXp += added;
    const newInfo = window.computePirakuLevelFromTotalXp(totalXp);

    localStorage.setItem("piraku_my_xp", String(totalXp));
    localStorage.setItem("piraku_my_level", String(newInfo.level));

    if (Array.isArray(window.registeredCitizensList) && myIg) {
      const me = window.registeredCitizensList.find(c => String(c.ig || "").trim().toLowerCase() === myIg.toLowerCase());
      if (me) {
        me.xp = totalXp;
        me.level = newInfo.level;
      }
    }

    const ktpLvlEl = document.getElementById("ktp-level-text");
    if (ktpLvlEl) ktpLvlEl.innerText = "Lv. " + newInfo.level;

    if (typeof window.updateAutoDetectButton === "function") {
      window.updateAutoDetectButton();
    }

    if (newInfo.level > oldInfo.level) {
      if (typeof window.playSynthTone === "function") window.playSynthTone(980, "sine", 0.35);
      if (typeof window.showToast === "function") {
        window.showToast("🎉 NAIK LEVEL " + newInfo.level + "! Gelar: " + window.getPirakuCitizenTitle(newInfo.level));
      }
    } else if (reasonText && typeof window.showToast === "function") {
      window.showToast("+" + added + " XP (" + reasonText + ") ✨");
    }

    const sb = window.pirakuSupabase;
    if (sb && myIg) {
      try {
        await sb.from("warga_piraku").update({ xp: totalXp, level: newInfo.level }).ilike("ig", myIg);
      } catch (e) {}
    }
    return newInfo;
  };

  function getActiveDistrictInfo() {
    const pill = document.getElementById("piraku-active-map-pill");
    if (pill && pill.style.display !== "none") {
      const spanEl = pill.querySelector("span");
      const txt = spanEl ? spanEl.textContent : "";
      const cleanName = txt.replace(/^[^\w]+/, "").replace(/▾$/, "").trim();
      if (cleanName) {
        return {
          id: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          name: cleanName
        };
      }
    }
    return { id: "bandung_wetan", name: "Bandung Wetan" };
  }

  function ensureCivicModal() {
    let modal = document.getElementById("piraku-civic-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "piraku-civic-modal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.82);backdrop-filter:blur(10px);z-index:99998;display:none;align-items:flex-end;justify-content:center;padding:12px;";
      modal.addEventListener("click", function (e) {
        if (e.target === modal) modal.style.display = "none";
      });
      document.body.appendChild(modal);
    }
    return modal;
  }

  // ================= 1. MODAL PEMILU CAMAT =================
  window.openPemiluCamatModal = async function () {
    const modal = ensureCivicModal();
    const dist = getActiveDistrictInfo();
    const myIg = localStorage.getItem("piraku_my_ig") || "";
    const myKec = localStorage.getItem("piraku_my_kec") || "Bandung Wetan";
    const totalXp = parseInt(localStorage.getItem("piraku_my_xp") || "0", 10);
    const lvlInfo = window.computePirakuLevelFromTotalXp(totalXp);
    const isDomisiliMatch = myIg && myKec.toLowerCase() === dist.name.toLowerCase();

    modal.style.display = "flex";
    modal.innerHTML = [
      '<div style="width:100%;max-width:440px;max-height:85vh;overflow-y:auto;background:#0e2f2a;border:1.5px solid rgba(255,207,74,0.35);border-radius:22px;padding:18px;color:#fff;font-family:\'Bricolage Grotesque\',sans-serif;box-shadow:0 20px 50px rgba(0,0,0,0.55);">',
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">',
          '<div>',
            '<div style="font-size:10px;font-weight:800;color:#ffcf4a;letter-spacing:1px;text-transform:uppercase;">🗳️ PEMILIHAN CAMAT PERIODE INI</div>',
            '<h3 style="margin:2px 0 0;font-size:18px;font-weight:800;">Kecamatan ' + dist.name + '</h3>',
          '</div>',
          '<button onclick="document.getElementById(\'piraku-civic-modal\').style.display=\'none\'" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-weight:800;cursor:pointer;">✕</button>',
        '</div>',
        '<div style="background:rgba(0,0,0,0.28);border-radius:12px;padding:10px 12px;font-size:11.5px;color:#cfe0d9;margin-bottom:14px;line-height:1.45;">',
          (!myIg
            ? '⚠️ Kamu belum masuk akun. <b>Masuk / Daftar</b> dulu untuk ikut nyoblos atau nyalon Camat!'
            : isDomisiliMatch
              ? '✅ Domisili KTP kamu sesuai (<b>' + myKec + '</b>). Kamu berhak nyoblos (1 suara) & nyalon jika minimal <b>Lvl 2</b>.'
              : 'ℹ️ KTP kamu terdaftar di <b>' + myKec + '</b>. Kamu hanya bisa nyoblos & nyalon di kecamatan domisilimu sendiri.'),
        '</div>',
        '<div id="pemilu-camat-list" style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;">',
          '<div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px;">Memuat kotak suara ' + dist.name + '...</div>',
        '</div>',
        (isDomisiliMatch ? (
          '<div style="border-top:1px solid rgba(255,255,255,0.12);padding-top:12px;">' +
            '<div style="font-size:12px;font-weight:800;color:#ffcf4a;margin-bottom:6px;">📢 Daftar Jadi Calon Camat ' + dist.name + '</div>' +
            (lvlInfo.level >= 2
              ? '<input id="inp-visi-camat" maxlength="85" placeholder="Tulis visi singkat (maks 85 karakter)..." style="width:100%;box-sizing:border-box;padding:9px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#fff;font-size:12px;margin-bottom:8px;">' +
                '<button onclick="submitCalonCamat(\'' + dist.id + '\', \'' + dist.name + '\')" style="width:100%;padding:10px;border:none;border-radius:12px;background:linear-gradient(135deg,#ffcf4a,#f59e0b);color:#0e2f2a;font-weight:800;font-size:12.5px;cursor:pointer;">Daftarkan Diri Sebagai Calon Camat 👑</button>'
              : '<div style="font-size:11.5px;color:#fca5a5;">Syarat mencalonkan diri minimal <b>Level 2</b> (Level kamu saat ini: <b>Lvl ' + lvlInfo.level + '</b>). Selesaikan misi dulu!</div>') +
          '</div>'
        ) : ''),
      '</div>'
    ].join('');

    loadPemiluCandidates(dist, myIg, isDomisiliMatch);
  };

  async function loadPemiluCandidates(dist, myIg, canVote) {
    const listEl = document.getElementById("pemilu-camat-list");
    if (!listEl) return;

    const sb = window.pirakuSupabase;
    const cleanVoter = (myIg || "").trim().toLowerCase().replace(/^@/, "");
    const voteLsKey = cleanVoter ? ("piraku_voted_camat_" + dist.id + "_" + cleanVoter) : null;
    let candidates = [];
    let votedCandidateId = voteLsKey ? localStorage.getItem(voteLsKey) : null;

    if (sb) {
      try {
        const res = await sb.from("pemilu_camat").select("*").eq("district_id", dist.id).order("votes", { ascending: false });
        if (res.data) candidates = res.data;
        if (myIg) {
          const vRes = await sb.from("pemilu_votes").select("candidate_id").eq("district_id", dist.id).ilike("voter_ig", myIg).maybeSingle();
          if (vRes.data) {
            votedCandidateId = String(vRes.data.candidate_id);
            if (voteLsKey) localStorage.setItem(voteLsKey, votedCandidateId);
          } else if (!vRes.error) {
            votedCandidateId = null;
            if (voteLsKey) localStorage.removeItem(voteLsKey);
          }
        }
      } catch (e) {}
    }

    if (candidates.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:18px;background:rgba(255,255,255,0.05);border-radius:14px;font-size:12px;color:#cbd5e1;">Belum ada calon Camat terdaftar di <b>' + dist.name + '</b>.<br>Jadilah warga pertama yang mencalonkan diri!</div>';
      return;
    }

    const totalVotes = candidates.reduce(function (acc, c) { return acc + (c.votes || 0); }, 0) || 1;
    listEl.innerHTML = candidates.map(function (c, idx) {
      const pct = Math.round(((c.votes || 0) / totalVotes) * 100);
      const isLeader = idx === 0 && (c.votes || 0) > 0;
      const isMyChoice = votedCandidateId === String(c.id);
      return '<div style="background:rgba(255,255,255,0.07);border:1px solid ' + (isLeader ? '#ffcf4a' : 'rgba(255,255,255,0.12)') + ';border-radius:14px;padding:11px 12px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<div style="font-weight:800;font-size:13px;color:' + (isLeader ? '#ffcf4a' : '#fff') + ';">' +
            (isLeader ? '👑 ' : '') + c.candidate_ig + ' <span style="font-size:10px;font-weight:600;color:#94a3b8;">(' + c.candidate_name + ')</span>' +
          '</div>' +
          '<div style="font-size:11px;font-weight:800;color:#4ade80;">' + (c.votes || 0) + ' Suara (' + pct + '%)</div>' +
        '</div>' +
        '<div style="font-size:11.5px;color:#e2e8f0;margin:5px 0 8px;">“' + c.visi_misi + '”</div>' +
        '<div style="width:100%;height:5px;background:rgba(255,255,255,0.12);border-radius:4px;overflow:hidden;margin-bottom:8px;">' +
          '<div style="width:' + pct + '%;height:100%;background:' + (isLeader ? '#ffcf4a' : '#4ade80') + ';"></div>' +
        '</div>' +
        (canVote ? (
          votedCandidateId
            ? '<div style="font-size:11px;font-weight:700;color:' + (isMyChoice ? '#4ade80' : '#94a3b8') + ';">' + (isMyChoice ? '✅ Pilihan kamu' : 'Hak suara sudah digunakan') + '</div>'
            : '<button onclick="voteForCamat(' + c.id + ', \'' + dist.id + '\', ' + (c.votes || 0) + ')" style="padding:6px 12px;border:none;border-radius:9px;background:#10b981;color:#fff;font-weight:800;font-size:11px;cursor:pointer;">🗳️ Coblos Calon Ini</button>'
        ) : '') +
      '</div>';
    }).join('');
  }

  window.submitCalonCamat = async function (distId, distName) {
    const myIg = localStorage.getItem("piraku_my_ig");
    const inp = document.getElementById("inp-visi-camat");
    const visi = (inp ? inp.value : "").trim();
    if (!myIg) return;
    if (visi.length < 8) {
      alert("Tulis visi singkat minimal 8 karakter!");
      return;
    }
    const sb = window.pirakuSupabase;
    if (sb) {
      try {
        const res = await sb.from("pemilu_camat").select("id").eq("district_id", distId).ilike("candidate_ig", myIg).maybeSingle();
        if (res.data) {
          alert("Kamu sudah terdaftar sebagai calon Camat di kecamatan ini!");
          return;
        }
        await sb.from("pemilu_camat").insert([{
          district_id: distId,
          district_name: distName,
          candidate_ig: myIg,
          candidate_name: myIg.replace("@", ""),
          visi_misi: visi,
          votes: 0
        }]);
        await window.grantPirakuXP(40, "Mendaftar Calon Camat");
        window.openPemiluCamatModal();
      } catch (e) {
        alert("Gagal mendaftar: " + e.message);
      }
    }
  };

  window.voteForCamat = async function (candidateId, distId, currentVotes) {
    const myIg = localStorage.getItem("piraku_my_ig");
    if (!myIg) return;
    const cleanVoter = myIg.trim().toLowerCase().replace(/^@/, "");
    const voteLsKey = "piraku_voted_camat_" + distId + "_" + cleanVoter;
    const sb = window.pirakuSupabase;
    if (sb) {
      try {
        const existing = await sb.from("pemilu_votes").select("candidate_id").eq("district_id", distId).ilike("voter_ig", myIg).maybeSingle();
        if (existing.data) {
          localStorage.setItem(voteLsKey, String(existing.data.candidate_id));
          localStorage.setItem("piraku_did_vote_" + getLocalDateKey() + getCivicUserSuffix(), "1");
          alert("Kamu sudah pernah mencoblos di kecamatan ini!");
          window.openPemiluCamatModal();
          return;
        }
        const res = await sb.from("pemilu_votes").insert([{
          district_id: distId,
          voter_ig: myIg.toLowerCase(),
          candidate_id: candidateId
        }]);
        if (res.error) {
          alert("Kamu sudah pernah mencoblos di kecamatan ini!");
          window.openPemiluCamatModal();
          return;
        }
        const latestCand = await sb.from("pemilu_camat").select("votes").eq("id", candidateId).maybeSingle();
        const nextVotes = ((latestCand.data && typeof latestCand.data.votes === "number") ? latestCand.data.votes : currentVotes) + 1;
        await sb.from("pemilu_camat").update({ votes: nextVotes }).eq("id", candidateId);
        localStorage.setItem(voteLsKey, String(candidateId));
        localStorage.setItem("piraku_did_vote_" + getLocalDateKey() + getCivicUserSuffix(), "1");
        await window.grantPirakuXP(60, "Menyalurkan Hak Suara Pemilu");
        if (typeof window.evaluateWeeklyCamatRotation === "function" && Array.isArray(window.registeredCitizensList)) {
          await window.evaluateWeeklyCamatRotation(window.registeredCitizensList);
        }
        window.openPemiluCamatModal();
      } catch (e) {}
    }
  };

  // ================= 2. FILTER TAB WARGA KHUSUS DISTRIK =================
  window.openDistrictCitizensModal = async function () {
    const modal = ensureCivicModal();
    const dist = getActiveDistrictInfo();
    modal.style.display = "flex";
    modal.innerHTML = [
      '<div style="width:100%;max-width:440px;max-height:85vh;overflow-y:auto;background:#0e2f2a;border:1.5px solid rgba(255,255,255,0.2);border-radius:22px;padding:18px;color:#fff;font-family:\'Bricolage Grotesque\',sans-serif;">',
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">',
          '<div>',
            '<div style="font-size:10px;font-weight:800;color:#4ade80;letter-spacing:1px;text-transform:uppercase;">👥 DIREKTORI TETANGGA WILAYAH</div>',
            '<h3 style="margin:2px 0 0;font-size:18px;font-weight:800;">Warga Kec. ' + dist.name + '</h3>',
          '</div>',
          '<button onclick="document.getElementById(\'piraku-civic-modal\').style.display=\'none\'" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-weight:800;cursor:pointer;">✕</button>',
        '</div>',
        '<div id="district-warga-list" style="display:flex;flex-direction:column;gap:8px;">',
          '<div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px;">Memuat data warga ' + dist.name + '...</div>',
        '</div>',
      '</div>'
    ].join('');

    const listEl = document.getElementById("district-warga-list");
    const sb = window.pirakuSupabase;
    let rows = [];
    if (sb) {
      try {
        const res = await sb.from("warga_publik").select("*").ilike("kecamatan", dist.name).order("xp", { ascending: false }).limit(30);
        if (res.data) rows = res.data;
      } catch (e) {}
    }

    if (!rows.length) {
      listEl.innerHTML = '<div style="text-align:center;padding:20px;background:rgba(255,255,255,0.05);border-radius:14px;font-size:12px;color:#cbd5e1;">Belum ada warga terdaftar di <b>Kec. ' + dist.name + '</b>.</div>';
      return;
    }

    listEl.innerHTML = rows.map(function (w, i) {
      const lInfo = window.computePirakuLevelFromTotalXp(w.xp || 0);
      return '<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.07);padding:10px 12px;border-radius:13px;">' +
        '<div>' +
          '<div style="font-weight:800;font-size:12.5px;color:#fff;">#' + (i + 1) + ' ' + w.ig + ' <span style="background:#ffcf4a;color:#0e2f2a;padding:1px 6px;border-radius:6px;font-size:9.5px;font-weight:800;">LVL ' + lInfo.level + '</span></div>' +
          '<div style="font-size:11px;color:#cbd5e1;margin-top:2px;">“' + (w.wish || "Wargi Bandung") + '”</div>' +
        '</div>' +
        '<div style="text-align:right;font-size:11px;font-weight:800;color:#4ade80;">❤️ ' + (w.upvotes || 0) + '</div>' +
      '</div>';
    }).join('');
  };

  // ================= 3. MODAL PUSAT MISI + TUTORIAL GOALS WARGA =================
  window.toggleMissionTutorialBox = function () {
    const box = document.getElementById("mission-tutorial-content");
    const arrow = document.getElementById("mission-tutorial-arrow");
    if (!box) return;
    const isHidden = box.style.display === "none";
    box.style.display = isHidden ? "block" : "none";
    if (arrow) arrow.innerText = isHidden ? "▲ Tutup" : "▼ Lihat Panduan";
    localStorage.setItem("piraku_mission_tut_seen", "1");
  };

  // Pelacak progres misi nyata (jalan kaki patroli & donasi gotong royong)
  let _lastPatrolPos = null;
  setInterval(function () {
    const myIg = (localStorage.getItem("piraku_my_ig") || "").trim();
    if (!myIg) return;
    const mesh = (typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null) || window.playerGroup;
    if (!mesh || !mesh.position) return;
    const x = mesh.position.x, z = mesh.position.z;
    if (_lastPatrolPos) {
      const stepDist = Math.hypot(x - _lastPatrolPos.x, z - _lastPatrolPos.z);
      if (stepDist > 0.25 && stepDist < 45) {
        const today = getLocalDateKey();
        const key = "piraku_patrol_dist_" + today + getCivicUserSuffix();
        const cur = parseFloat(localStorage.getItem(key) || "0");
        localStorage.setItem(key, String(Math.min(9999, cur + stepDist)));
      }
    }
    _lastPatrolPos = { x: x, z: z };
  }, 600);

  window.markPirakuGotongRoyongDone = function () {
    const today = getLocalDateKey();
    localStorage.setItem("piraku_did_gotong_" + today + getCivicUserSuffix(), "1");
  };

  function getLocalDateKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  window.getPirakuLocalDateKey = getLocalDateKey;

  window.recordPirakuAngkotHit = function () {
    const today = getLocalDateKey();
    const suf = getCivicUserSuffix();
    if (localStorage.getItem("piraku_claimed_angkot_" + today + suf) === "1") return;
    const key = "piraku_angkot_hits_" + today + suf;
    const prev = parseInt(localStorage.getItem(key) || "0", 10);
    if (prev >= 3) return;
    const cur = prev + 1;
    localStorage.setItem(key, String(cur));
    if (typeof window.showToast === "function") {
      if (cur === 3) {
        window.showToast("💥 Misi Adu Mekanik Angkot (3/3) Selesai! Klaim hadiah di menu Misi 🎯");
      } else {
        window.showToast("💥 Mental Ditabrak Angkot! (" + cur + "/3 Misi Adu Mekanik)");
      }
    }
  };

  function getCivicUserSuffix() {
    const ig = (localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase().replace(/^@/, "");
    return ig ? ("_" + ig) : "_guest";
  }

  function getDailyMissionsList(dist) {
    const today = getLocalDateKey();
    const suf = getCivicUserSuffix();
    const isLoggedWarga = !!(localStorage.getItem("piraku_my_ig") || "").trim();
    const patrolDist = Math.floor(parseFloat(localStorage.getItem("piraku_patrol_dist_" + today + suf) || "0"));
    const patrolTarget = 150;
    const cleanVoterCheck = (localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase().replace(/^@/, "");
    const homeKecId = (localStorage.getItem("piraku_my_kec") || dist.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    let hasAnyVotedCamat = Boolean(
      localStorage.getItem("piraku_voted_camat_" + dist.id + "_" + cleanVoterCheck) ||
      (homeKecId && localStorage.getItem("piraku_voted_camat_" + homeKecId + "_" + cleanVoterCheck))
    );
    if (!hasAnyVotedCamat && cleanVoterCheck) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || "";
          if (k.startsWith("piraku_voted_camat_") && k.endsWith("_" + cleanVoterCheck)) {
            hasAnyVotedCamat = true;
            break;
          }
        }
      } catch (e) {}
    }
    const didVote = localStorage.getItem("piraku_did_vote_" + today + suf) === "1" || hasAnyVotedCamat;
    const didGotong = localStorage.getItem("piraku_did_gotong_" + today + suf) === "1";
    const didCuanki = localStorage.getItem("piraku_did_cuanki_" + today + suf) === "1";
    const angkotHits = Math.min(3, parseInt(localStorage.getItem("piraku_angkot_hits_" + today + suf) || "0", 10));

    return [
      {
        id: "checkin_" + today,
        cat: "HARIAN",
        title: "1. Absen Harian Warga",
        desc: isLoggedWarga ? "Kehadiran terverifikasi! Klik Klaim untuk absen hari ini." : "Daftar/masuk akun warga dulu untuk absen harian.",
        xp: 30,
        coins: 10,
        ready: isLoggedWarga,
        lockLabel: "Login Dulu",
        done: localStorage.getItem("piraku_claimed_checkin_" + today + suf) === "1"
      },
      {
        id: "patrol_" + today,
        cat: "EKSPLORASI",
        title: "2. Patroli Jalan Kaki " + dist.name,
        desc: "Jalan kaki keliling peta kota (" + Math.min(patrolDist, patrolTarget) + " / " + patrolTarget + " m).",
        xp: 35,
        coins: 12,
        ready: isLoggedWarga && patrolDist >= patrolTarget,
        lockLabel: Math.min(patrolDist, patrolTarget) + "/" + patrolTarget + "m",
        actionHint: "Jalan Kaki Keliling (" + Math.min(patrolDist, patrolTarget) + "/150m)",
        done: localStorage.getItem("piraku_claimed_patrol_" + today + suf) === "1"
      },
      {
        id: "cuanki_" + today,
        cat: "KULINER 3D",
        title: "3. Jajan Cuanki di Gerobak Keliling",
        desc: "Dekati Gerobak Bakso/Cuanki di jalan komplek lalu beli seporsi (10 🪙).",
        xp: 40,
        coins: 15,
        ready: isLoggedWarga && didCuanki,
        lockLabel: "Cari Gerobak",
        actionHint: "Cari Gerobak Cuanki di Komplek",
        done: localStorage.getItem("piraku_claimed_cuanki_" + today + suf) === "1"
      },
      {
        id: "angkot_" + today,
        cat: "ADU MEKANIK 3D",
        title: "4. Mental Ditabrak Angkot 3x",
        desc: "Uji nyali di bundaran komplek! Tertabrak angkot/mobil (" + angkotHits + " / 3 kali).",
        xp: 45,
        coins: 15,
        ready: isLoggedWarga && angkotHits >= 3,
        lockLabel: angkotHits + "/3 Tabrak",
        actionHint: "Tabrak Angkot di Bundaran (" + angkotHits + "/3)",
        done: localStorage.getItem("piraku_claimed_angkot_" + today + suf) === "1"
      },
      {
        id: "vote_" + today,
        cat: "DEMOKRASI",
        title: "5. Partisipasi Pemilu Camat",
        desc: "Gunakan 1 hak suaramu di tab Pemilu Camat kecamatan.",
        xp: 45,
        coins: 15,
        ready: isLoggedWarga && didVote,
        lockLabel: "Belum Nyoblos",
        actionHint: "Coblos Calon Camat",
        done: localStorage.getItem("piraku_claimed_vote_" + today + suf) === "1"
      },
      {
        id: "gotong_" + today,
        cat: "GOTONG ROYONG",
        title: "6. Gotong Royong " + dist.name,
        desc: "Sumbang koin ke kas pembangunan fasilitas 3D kecamatan.",
        xp: 40,
        coins: 12,
        ready: isLoggedWarga && didGotong,
        lockLabel: "Belum Patungan",
        actionHint: "Patungan Koin Komplek",
        done: localStorage.getItem("piraku_claimed_gotong_" + today + suf) === "1"
      }
    ];
  }

  async function syncHouseStatusFromCloud() {
    const myIg = (localStorage.getItem("piraku_my_ig") || "").trim();
    if (!myIg) return false;
    const suf = getCivicUserSuffix();
    if (window.PirakuEconomy && typeof window.PirakuEconomy.getState === "function") {
      const owned = window.PirakuEconomy.getState().owned || [];
      if (owned.includes("has_house_built") || owned.some(x => String(x).startsWith("house_tier_"))) {
        localStorage.setItem("piraku_has_house" + suf, "1");
        localStorage.setItem("piraku_house_keys" + suf, String(HOUSE_REQ_KEYS));
        window.pirakuDistrictHasHouse = true;
        return true;
      }
      owned.forEach(tag => {
        const s = String(tag || "");
        if (s.startsWith("house_keys_")) {
          const kv = parseInt(s.replace("house_keys_", ""), 10) || 0;
          const curK = parseInt(localStorage.getItem("piraku_house_keys" + suf) || "0", 10) || 0;
          if (kv > curK) localStorage.setItem("piraku_house_keys" + suf, String(Math.min(HOUSE_REQ_KEYS, kv)));
        }
        if (s.startsWith("claimed_")) {
          const mKey = s.slice("claimed_".length);
          localStorage.setItem("piraku_claimed_" + mKey + suf, "1");
        }
      });
    }
    if (window.pirakuDistrictHasHouse || parseInt(localStorage.getItem("piraku_house_tier" + suf) || "0", 10) >= 1) {
      localStorage.setItem("piraku_has_house" + suf, "1");
      localStorage.setItem("piraku_house_keys" + suf, String(HOUSE_REQ_KEYS));
      return true;
    }
    if (Array.isArray(window.registeredCitizensList)) {
      const me = window.registeredCitizensList.find(c => String(c.ig || "").toLowerCase() === myIg.toLowerCase());
      if (me && me.has_house) {
        localStorage.setItem("piraku_has_house" + suf, "1");
        localStorage.setItem("piraku_house_keys" + suf, String(HOUSE_REQ_KEYS));
        return true;
      }
    }
    const sb = window.pirakuSupabase;
    if (sb) {
      try {
        const { data } = await sb.from("warga_piraku").select("has_house, xp").ilike("ig", myIg).maybeSingle();
        if (data && data.has_house) {
          localStorage.setItem("piraku_has_house" + suf, "1");
          localStorage.setItem("piraku_house_keys" + suf, String(HOUSE_REQ_KEYS));
          return true;
        }
      } catch (e) {}
    }
    return localStorage.getItem("piraku_has_house" + suf) === "1";
  }

  async function syncDailyClaimsFromCloud(today, suf) {
    const myIg = (localStorage.getItem("piraku_my_ig") || "").trim();
    const sb = window.pirakuSupabase;
    if (!myIg || !sb) return;
    let wargaId = null;
    if (Array.isArray(window.registeredCitizensList)) {
      const me = window.registeredCitizensList.find(c => String(c.ig || "").toLowerCase() === myIg.toLowerCase());
      if (me && me.id) wargaId = me.id;
    }
    if (!wargaId) {
      try {
        const { data: u } = await sb.from("warga_piraku").select("id").ilike("ig", myIg).maybeSingle();
        if (u && u.id) wargaId = u.id;
      } catch (e) {}
    }
    if (!wargaId) return;
    try {
      const cleanVoter = myIg.toLowerCase().replace(/^@/, "");
      const { data: vData } = await sb.from("pemilu_votes").select("district_id, candidate_id").ilike("voter_ig", myIg);
      if (Array.isArray(vData) && vData.length > 0) {
        vData.forEach(vr => {
          if (vr && vr.district_id) {
            localStorage.setItem("piraku_voted_camat_" + vr.district_id + "_" + cleanVoter, String(vr.candidate_id || "1"));
          }
        });
        localStorage.setItem("piraku_did_vote_" + today + suf, "1");
      }
    } catch (e) {}
    try {
      const { data, error } = await sb
        .from("warga_daily_quests")
        .select("quest_id")
        .eq("warga_id", wargaId)
        .eq("completed_date", today);
      if (!error && Array.isArray(data)) {
        data.forEach(r => {
          if (r && r.quest_id) {
            localStorage.setItem("piraku_claimed_" + r.quest_id + suf, "1");
            if (String(r.quest_id).startsWith("angkot_")) {
              localStorage.setItem("piraku_angkot_hits_" + today + suf, "3");
            }
          }
        });
      }
    } catch (e) {}
  }

  window.syncPirakuMissionsFromCloud = async function () {
    const suf = getCivicUserSuffix();
    await syncHouseStatusFromCloud();
    await syncDailyClaimsFromCloud(getLocalDateKey(), suf);
  };
  setTimeout(() => { window.syncPirakuMissionsFromCloud(); }, 950);

  window.openMissionsHubModal = async function () {
    const modal = ensureCivicModal();
    const dist = getActiveDistrictInfo();
    const suf = getCivicUserSuffix();
    await syncHouseStatusFromCloud();
    await syncDailyClaimsFromCloud(getLocalDateKey(), suf);

    const totalXp = parseInt(localStorage.getItem("piraku_my_xp") || "0", 10);
    const lvlInfo = window.computePirakuLevelFromTotalXp(totalXp);
    const pct = lvlInfo.isMax ? 100 : Math.min(100, Math.round((lvlInfo.currentXpInLevel / lvlInfo.requiredForNext) * 100));

    const myKecHome = localStorage.getItem("piraku_my_kec") || dist.name;
    const myHomeId = myKecHome.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const hasHouse = localStorage.getItem("piraku_has_house" + suf) === "1";
    const houseKeys = hasHouse ? HOUSE_REQ_KEYS : Math.min(HOUSE_REQ_KEYS, parseInt(localStorage.getItem("piraku_house_keys" + suf) || "0", 10));
    const houseTier = typeof window.getMyPersonalHouseTier === "function" ? window.getMyPersonalHouseTier() : 1;
    const isFirstTimeTut = localStorage.getItem("piraku_mission_tut_seen") !== "1";

    const missions = getDailyMissionsList(dist);

    const myCoins = window.PirakuEconomy ? window.PirakuEconomy.getCoins() : (parseInt(localStorage.getItem("piraku_coins") || "0", 10) || 0);
    const step1Done = Boolean((localStorage.getItem("piraku_my_ig") || "").trim());
    const step2Done = hasHouse || houseKeys >= HOUSE_REQ_KEYS;
    const step3Done = hasHouse;
    const kavFull = !hasHouse && (typeof window.isDistrictKavlingFull === "function") && window.isDistrictKavlingFull(myKecHome);

    modal.style.display = "flex";
    modal.innerHTML = [
      '<div style="width:100%;max-width:440px;max-height:85vh;overflow-y:auto;background:#0e2f2a;border:1.5px solid rgba(74,222,128,0.35);border-radius:22px;padding:18px;color:#fff;font-family:\'Bricolage Grotesque\',sans-serif;">',
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">',
          '<div>',
            '<div style="font-size:10px;font-weight:800;color:#4ade80;letter-spacing:1px;text-transform:uppercase;">🎯 PUSAT MISI & PROGRES HUNIAN 3D</div>',
            '<h3 style="margin:2px 0 0;font-size:18px;font-weight:800;">Misi & Goals di ' + dist.name + '</h3>',
          '</div>',
          '<button onclick="document.getElementById(\'piraku-civic-modal\').style.display=\'none\'" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-weight:800;cursor:pointer;">✕</button>',
        '</div>',

        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:11px;">',
          '<div style="padding:7px 8px;border-radius:11px;background:' + (step1Done ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.06)') + ';border:1px solid ' + (step1Done ? 'rgba(74,222,128,0.45)' : 'rgba(148,163,184,0.22)') + ';text-align:center;">',
            '<div style="font-size:12px;">' + (step1Done ? '✅' : '1️⃣') + '</div>',
            '<div style="font-size:10px;font-weight:800;color:' + (step1Done ? '#4ade80' : '#cbd5e1') + ';margin-top:2px;">1. Daftar KTP</div>',
          '</div>',
          '<div style="padding:7px 8px;border-radius:11px;background:' + (step2Done ? 'rgba(34,197,94,0.18)' : 'rgba(250,204,21,0.12)') + ';border:1px solid ' + (step2Done ? 'rgba(74,222,128,0.45)' : 'rgba(250,204,21,0.4)') + ';text-align:center;">',
            '<div style="font-size:12px;">' + (step2Done ? '✅' : '🔑 ' + houseKeys + '/' + HOUSE_REQ_KEYS) + '</div>',
            '<div style="font-size:10px;font-weight:800;color:' + (step2Done ? '#4ade80' : '#fde047') + ';margin-top:2px;">2. ' + HOUSE_REQ_KEYS + ' Kunci Misi</div>',
          '</div>',
          '<div style="padding:7px 8px;border-radius:11px;background:' + (step3Done ? 'rgba(34,197,94,0.18)' : (step2Done && myCoins >= HOUSE_BUILD_COST ? 'rgba(56,189,248,0.22)' : 'rgba(255,255,255,0.06)')) + ';border:1px solid ' + (step3Done ? 'rgba(74,222,128,0.45)' : (step2Done && myCoins >= HOUSE_BUILD_COST ? '#38bdf8' : 'rgba(148,163,184,0.22)')) + ';text-align:center;">',
            '<div style="font-size:12px;">' + (step3Done ? '🏠 ✓' : '🪙 ' + Math.min(HOUSE_BUILD_COST, myCoins) + '/' + HOUSE_BUILD_COST) + '</div>',
            '<div style="font-size:10px;font-weight:800;color:' + (step3Done ? '#4ade80' : (step2Done && myCoins >= HOUSE_BUILD_COST ? '#7dd3fc' : '#cbd5e1')) + ';margin-top:2px;">3. Bangun Rumah</div>',
          '</div>',
        '</div>',

        '<div style="background:rgba(15,23,42,0.65);border:1px solid rgba(56,189,248,0.45);border-radius:14px;padding:10px 12px;margin-bottom:12px;">',
          '<div onclick="toggleMissionTutorialBox()" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">',
            '<span style="font-size:12px;font-weight:800;color:#38bdf8;">📖 Panduan Hunian (36 Kavling & Apartemen)</span>',
            '<span id="mission-tutorial-arrow" style="font-size:10.5px;font-weight:700;color:#bae6fd;">' + (isFirstTimeTut ? '▲ Tutup' : '▼ Lihat Panduan') + '</span>',
          '</div>',
          '<div id="mission-tutorial-content" style="display:' + (isFirstTimeTut ? 'block' : 'none') + ';margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);font-size:11px;color:#e2e8f0;line-height:1.5;">',
            '<div style="margin-bottom:6px;"><b style="color:#ffcf4a;">🏘️ Kuota 36 Kavling Tapak & Apartemen:</b> Setiap kecamatan memiliki <b>36 Kavling Tapak</b> (1 Rumah Dinas Camat + 35 Warga Tercepat Bangun Rumah). Jika penuh, warga masuk <b>Tower Apartemen</b> dan bisa ikut patungan menaikkan level apartemen!</div>',
            '<div style="margin-bottom:6px;"><b style="color:#38bdf8;">🏠 Syarat Bangun Rumah 3D:</b> Kumpulkan <b>' + HOUSE_REQ_KEYS + ' Kunci 🔑</b> (dari misi harian) + <b>' + HOUSE_BUILD_COST + ' 🪙 Koin Biaya Bangun</b> untuk mendirikan rumah di kavlingmu.</div>',
            '<div style="margin-bottom:6px;"><b style="color:#4ade80;">✨ Upgrade Rumah (Lv.1 → Lv.4 Villa Sultan):</b> Berdiri di depan rumahmu untuk upgrade bertahap (Lv.2: 350 🪙, Lv.3: 800 🪙, Lv.4 Villa Sultan: 2.000 🪙).</div>',
            '<div><b style="color:#f472b6;">👑 Pemilu Camat:</b> Capai minimal <b>Level 2</b> untuk mencalonkan diri menjadi Camat dan menempati Kavling Nomor #1!</div>',
          '</div>',
        '</div>',

        '<div style="background:linear-gradient(135deg,rgba(255,207,74,0.22),rgba(16,185,129,0.2));border:1.5px solid rgba(255,207,74,0.55);border-radius:14px;padding:12px;margin-bottom:12px;">',
          '<div style="display:flex;justify-content:space-between;align-items:center;">',
            '<span style="font-weight:800;font-size:12.5px;color:#ffcf4a;">🏠 Status Hunian: ' + (hasHouse ? ('RUMAH LV.' + houseTier + '/4 ✓') : (kavFull ? '36/36 KAVLING PENUH 🏢' : (houseKeys + ' / ' + HOUSE_REQ_KEYS + ' Kunci 🔑'))) + '</span>',
            '<span style="font-size:10px;font-weight:800;background:#10b981;color:#fff;padding:2px 8px;border-radius:99px;">Kec. ' + myKecHome + '</span>',
          '</div>',
          '<div style="font-size:11px;color:#f1f5f9;margin-top:5px;line-height:1.4;">',
            (hasHouse
              ? '🎉 <b>Rumah 3D</b> kamu sudah berdiri di <b>Kec. ' + myKecHome + '</b> (Tipe Lv.' + houseTier + '/4). Datangi depan rumahmu untuk upgrade!'
              : kavFull
                ? '🏢 Semua <b>36 Kavling Tapak</b> di Kec. ' + myKecHome + ' sudah terisi! Kamu otomatis menghuni <b>Apartemen Kecamatan</b> dan bisa menyumbang untuk menaikkan level apartemen.'
                : houseKeys >= HOUSE_REQ_KEYS
                  ? '🔥 Kunci lengkap (' + HOUSE_REQ_KEYS + '/' + HOUSE_REQ_KEYS + ')! Wajib klik tombol di bawah untuk mendirikan <b>Rumah 3D (' + HOUSE_BUILD_COST + ' 🪙)</b> sekarang!'
                  : 'Butuh <b>' + (HOUSE_REQ_KEYS - houseKeys) + ' Kunci 🔑 lagi</b> + <b>' + HOUSE_BUILD_COST + ' 🪙 Koin</b> untuk membangun rumah di kavlingmu!'),
          '</div>',
          '<div style="display:flex;gap:7px;margin-top:9px;flex-wrap:wrap;">',
            ((!hasHouse && kavFull)
              ? '<button onclick="document.getElementById(\'piraku-civic-modal\').style.display=\'none\'; if(typeof window.donateDistrictApartment===\'function\') window.donateDistrictApartment(\'' + myHomeId + '\', 20);" style="flex:1;padding:10px;border:none;border-radius:11px;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#fff;font-weight:900;font-size:12px;cursor:pointer;">🏢 Sumbang Level Apartemen (20 🪙)</button>'
              : ((!hasHouse && houseKeys >= HOUSE_REQ_KEYS)
                ? '<button onclick="buildMyInstantHouse()" style="flex:1;padding:10px;border:none;border-radius:11px;background:linear-gradient(135deg,#ffcf4a,#f59e0b);color:#0e2f2a;font-weight:900;font-size:12px;cursor:pointer;box-shadow:0 6px 18px rgba(245,158,11,0.4);">🏠 BANGUN RUMAH 3D (' + HOUSE_BUILD_COST + ' 🪙)</button>'
                : '')),
            '<button onclick="document.getElementById(\'piraku-civic-modal\').style.display=\'none\'; if(typeof window.walkToMyDistrictKavling===\'function\') window.walkToMyDistrictKavling(); else if(typeof window.enterDistrictMap===\'function\') window.enterDistrictMap(\'' + myHomeId + '\');" style="flex:1;padding:9px 10px;border:none;border-radius:11px;background:#38bdf8;color:#0f172a;font-weight:800;font-size:11.5px;cursor:pointer;">📍 Masuk Komplek ' + myKecHome + ' →</button>',
          '</div>',
        '</div>',

        '<div style="background:rgba(0,0,0,0.3);border-radius:14px;padding:11px 12px;margin-bottom:12px;">',
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">',
            '<span style="font-weight:800;font-size:12.5px;color:#ffcf4a;">' + (lvlInfo.isMax ? 'MAX LEVEL 99 👑' : 'LEVEL ' + lvlInfo.level) + ' · ' + window.getPirakuCitizenTitle(lvlInfo.level) + '</span>',
            '<span style="font-size:11px;font-weight:700;color:#cfe0d9;">' + (lvlInfo.isMax ? 'MAX' : lvlInfo.currentXpInLevel + ' / ' + lvlInfo.requiredForNext + ' XP') + '</span>',
          '</div>',
          '<div style="width:100%;height:7px;background:rgba(255,255,255,0.14);border-radius:6px;overflow:hidden;">',
            '<div style="width:' + pct + '%;height:100%;background:linear-gradient(90deg,#4ade80,#ffcf4a);"></div>',
          '</div>',
        '</div>',

        '<div style="display:flex;flex-direction:column;gap:9px;">',
          missions.map(function (m) {
            return '<div style="background:rgba(255,255,255,' + (m.done ? '0.03' : '0.07') + ');opacity:' + (m.done ? '0.68' : '1') + ';border-radius:14px;padding:11px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
              '<div>' +
                '<span style="font-size:9px;font-weight:800;background:rgba(255,207,74,0.2);color:#ffcf4a;padding:2px 6px;border-radius:5px;">' + m.cat + '</span>' +
                '<div style="font-weight:800;font-size:13px;margin-top:3px;">' + m.title + '</div>' +
                '<div style="font-size:11px;color:#cbd5e1;margin-top:2px;">' + m.desc + '</div>' +
                '<div style="font-size:10.5px;font-weight:800;color:#4ade80;margin-top:4px;">Hadiah: +' + m.xp + ' XP · +' + m.coins + ' 🪙' + (hasHouse ? '' : ' · +1 🔑') + '</div>' +
              '</div>' +
              '<button ' + ((m.done || !m.ready) ? 'disabled' : 'onclick="claimPirakuMission(\'' + m.id + '\', ' + m.xp + ', ' + m.coins + ', \'' + m.title + '\')"') + ' style="flex-shrink:0;padding:8px 12px;border:none;border-radius:10px;background:' + (m.done ? 'rgba(255,255,255,0.12)' : (m.ready ? '#10b981' : 'rgba(255,255,255,0.08)')) + ';color:' + (m.done ? '#94a3b8' : (m.ready ? '#fff' : '#64748b')) + ';border:' + ((!m.done && !m.ready) ? '1px solid rgba(148,163,184,0.25)' : 'none') + ';font-weight:800;font-size:11px;cursor:' + ((m.done || !m.ready) ? 'not-allowed' : 'pointer') + ';">' +
                (m.done ? 'Selesai ✓' : (m.ready ? 'Klaim ✨' : ('🔒 ' + (m.lockLabel || 'Terkunci')))) +
              '</button>' +
            '</div>';
          }).join(''),
        '</div>',
      '</div>'
    ].join('');
  };

  window.claimPirakuMission = async function (missionKey, xpReward, coinReward, title) {
    if (!localStorage.getItem("piraku_my_ig")) {
      alert("Masuk atau daftar akun warga dulu untuk mengklaim misi!");
      return;
    }
    const suf = getCivicUserSuffix();
    if (localStorage.getItem("piraku_claimed_" + missionKey + suf) === "1") return;
    localStorage.setItem("piraku_claimed_" + missionKey + suf, "1");
    // Sembunyikan HUD onboarding atas begitu pemain sudah paham & menyelesaikan 1 misi pertamanya
    localStorage.setItem("piraku_onboarding_hud_done" + suf, "1");

    const hasHouseAlready = localStorage.getItem("piraku_has_house" + suf) === "1";
    const curKeys = hasHouseAlready ? HOUSE_REQ_KEYS : Math.min(HOUSE_REQ_KEYS, parseInt(localStorage.getItem("piraku_house_keys" + suf) || "0", 10) + 1);
    localStorage.setItem("piraku_house_keys" + suf, String(curKeys));

    if (window.PirakuEconomy && typeof window.PirakuEconomy.getState === "function") {
      const ecoState = window.PirakuEconomy.getState();
      if (Array.isArray(ecoState.owned)) {
        const claimTag = "claimed_" + missionKey;
        const keyTag = "house_keys_" + curKeys;
        if (!ecoState.owned.includes(claimTag)) ecoState.owned.push(claimTag);
        if (!ecoState.owned.includes(keyTag)) ecoState.owned.push(keyTag);
      }
    }

    // Simpan klaim ke Supabase agar tidak bisa diulang di hari yang sama lintas sesi/perangkat
    const sb = window.pirakuSupabase;
    const myIg = (localStorage.getItem("piraku_my_ig") || "").trim();
    if (sb && myIg) {
      let wargaId = null;
      if (Array.isArray(window.registeredCitizensList)) {
        const me = window.registeredCitizensList.find(c => String(c.ig || "").toLowerCase() === myIg.toLowerCase());
        if (me && me.id) wargaId = me.id;
      }
      if (!wargaId) {
        try {
          const { data: u } = await sb.from("warga_piraku").select("id").ilike("ig", myIg).maybeSingle();
          if (u && u.id) wargaId = u.id;
        } catch (e) {}
      }
      if (wargaId) {
        try {
          await sb.from("warga_daily_quests").insert([{ warga_id: wargaId, quest_id: missionKey, completed_date: getLocalDateKey() }]);
        } catch (e) {}
      }
    }

    if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
      window.PirakuEconomy.addCoins(coinReward, title);
    } else if (window.PirakuGameBridge && typeof window.PirakuGameBridge.addCoins === "function") {
      window.PirakuGameBridge.addCoins(coinReward);
    } else {
      const c = parseInt(localStorage.getItem("piraku_coins") || "0", 10) + coinReward;
      localStorage.setItem("piraku_coins", String(c));
    }

    await window.grantPirakuXP(xpReward, title);
    const hasHouseNow = localStorage.getItem("piraku_has_house" + suf) === "1";
    if (curKeys >= HOUSE_REQ_KEYS && !hasHouseNow) {
      const myKec = localStorage.getItem("piraku_my_kec") || "Coblong";
      const kavFull = (typeof window.isDistrictKavlingFull === "function") && window.isDistrictKavlingFull(myKec);
      if (!kavFull) {
        if (typeof window.showToast === "function") {
          window.showToast(`🔑 ${HOUSE_REQ_KEYS}/${HOUSE_REQ_KEYS} Kunci Terkumpul! Sekarang wajib Bangun Rumah (${HOUSE_BUILD_COST} 🪙)!`);
        }
        setTimeout(() => { window.openMandatoryBuildHouseModal(); }, 280);
      } else if (typeof window.showToast === "function") {
        window.showToast("🏢 36 Kavling penuh! Yuk sumbang untuk naikkan level Apartemen Kecamatan!");
      }
    }
    updateGuidedQuestHud();
    const civicModal = document.getElementById("piraku-civic-modal");
    if (civicModal && civicModal.style.display === "flex" && curKeys < HOUSE_REQ_KEYS) {
      window.openMissionsHubModal();
    }
  };

  // ================= ONBOARDING HABIS DAFTAR KTP & HUD PENUNTUN AWAL (HILANG SETELAH 1 MISI) =================
  window.onPirakuKtpCompleted = function () {
    const myIg = (localStorage.getItem("piraku_my_ig") || "").trim();
    const myKec = (localStorage.getItem("piraku_my_kec") || "Coblong").trim();
    if (!myIg) return;

    const modal = ensureCivicModal();
    modal.style.display = "flex";
    modal.innerHTML = [
      '<div style="width:100%;max-width:410px;background:linear-gradient(165deg,#0f172a,#0e2f2a);border:2px solid #facc15;border-radius:24px;padding:20px;color:#fff;font-family:\'Bricolage Grotesque\',sans-serif;box-shadow:0 24px 60px rgba(0,0,0,0.8);">',
        '<div style="font-size:11px;font-weight:800;color:#facc15;letter-spacing:0.8px;text-transform:uppercase;">🎉 WILUJENG SUMPING WARGI BARU!</div>',
        '<h3 style="margin:4px 0 8px;font-size:19px;font-weight:800;">KTP ' + myIg + ' Terdaftar di Kec. ' + myKec + '!</h3>',
        '<div style="font-size:12px;color:#e2e8f0;line-height:1.5;margin-bottom:12px;">',
          'Setiap kecamatan punya <b>36 Kavling Tapak</b> (1 Camat + 35 Warga) dan <b>Tower Apartemen</b> untuk warga ke-37 dst.',
        '</div>',
        '<div style="background:rgba(0,0,0,0.32);border:1px solid rgba(56,189,248,0.4);border-radius:14px;padding:11px 12px;font-size:11.5px;color:#bae6fd;margin-bottom:14px;line-height:1.5;">',
          '<div><b>🎯 Tujuan Bermain:</b></div>',
          '<div>1️⃣ Kunjungi komplek <b>Kec. ' + myKec + '</b> untuk melihat lahan/hunianmu</div>',
          '<div>2️⃣ Selesaikan <b>Misi Harian & Mini-Game</b> untuk mengumpulkan <b>3 Kunci 🔑 + 100 🪙 Koin</b></div>',
          '<div>3️⃣ Bangun <b>Rumah 3D</b>, upgrade ke <b>Villa Sultan</b>, & ikuti <b>Pemilu Camat</b>!</div>',
        '</div>',
        '<div style="display:flex;gap:8px;">',
          '<button onclick="document.getElementById(\'piraku-civic-modal\').style.display=\'none\'; if(typeof window.walkToMyDistrictKavling===\'function\') window.walkToMyDistrictKavling();" style="flex:1.4;padding:11px;border:none;border-radius:12px;background:linear-gradient(135deg,#facc15,#f59e0b);color:#0f172a;font-weight:900;font-size:12.5px;cursor:pointer;">🏘️ Masuk Komplek ' + myKec + ' →</button>',
          '<button onclick="document.getElementById(\'piraku-civic-modal\').style.display=\'none\'" style="flex:0.6;padding:11px;border:none;border-radius:12px;background:rgba(255,255,255,0.12);color:#cbd5e1;font-weight:800;font-size:12px;cursor:pointer;">Nanti</button>',
        '</div>',
      '</div>'
    ].join('');
  };

  window.dismissPirakuOnboardingHud = function () {
    const suf = getCivicUserSuffix();
    localStorage.setItem("piraku_onboarding_hud_done" + suf, "1");
    const hud = document.getElementById("piraku-guided-quest-hud");
    if (hud) hud.style.display = "none";
  };

  function updateMisiTabBadge(isReg, hasHouse, houseKeys, myCoins) {
    const misiBtn = document.getElementById("nav-tab-misi");
    if (!misiBtn) return;
    let badge = document.getElementById("nav-misi-badge");
    if (!badge) {
      if (getComputedStyle(misiBtn).position === "static") misiBtn.style.position = "relative";
      badge = document.createElement("span");
      badge.id = "nav-misi-badge";
      badge.style.cssText = "position:absolute;top:4px;right:14%;min-width:15px;height:15px;padding:0 4px;border-radius:999px;background:#ef4444;color:#fff;font-size:9.5px;font-weight:900;line-height:15px;text-align:center;box-shadow:0 2px 6px rgba(239,68,68,0.6);display:none;pointer-events:none;";
      misiBtn.appendChild(badge);
    }
    if (!isReg) {
      badge.style.display = "none";
      return;
    }
    const dist = getActiveDistrictInfo();
    const readyCount = getDailyMissionsList(dist).filter(m => m.ready && !m.done).length;
    const canBuildNow = !hasHouse && houseKeys >= HOUSE_REQ_KEYS && myCoins >= HOUSE_BUILD_COST;
    const total = readyCount + (canBuildNow ? 1 : 0);
    if (total > 0) {
      badge.textContent = canBuildNow ? "🏠" : String(total);
      badge.style.background = canBuildNow ? "#f59e0b" : "#ef4444";
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  let lastQuestHudSig = "";
  function updateGuidedQuestHud() {
    const myIg = (localStorage.getItem("piraku_my_ig") || "").trim();
    const isReg = Boolean(myIg && !myIg.toLowerCase().startsWith("tamu_"));
    const suf = getCivicUserSuffix();
    const hasHouse = localStorage.getItem("piraku_has_house" + suf) === "1" || Boolean(window.pirakuDistrictHasHouse);
    const houseKeys = hasHouse ? HOUSE_REQ_KEYS : parseInt(localStorage.getItem("piraku_house_keys" + suf) || "0", 10);
    const myCoins = window.PirakuEconomy ? window.PirakuEconomy.getCoins() : (parseInt(localStorage.getItem("piraku_coins") || "0", 10) || 0);
    const myKec = localStorage.getItem("piraku_my_kec") || "Coblong";
    const kavFull = !hasHouse && (typeof window.isDistrictKavlingFull === "function") && window.isDistrictKavlingFull(myKec);

    updateMisiTabBadge(isReg, hasHouse, houseKeys, myCoins);

    let hud = document.getElementById("piraku-guided-quest-hud");
    if (!hud && document.body) {
      hud = document.createElement("div");
      hud.id = "piraku-guided-quest-hud";
      hud.style.cssText = "position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:25;display:none;align-items:center;gap:8px;padding:6px 11px;border-radius:999px;background:rgba(15,23,42,0.88);backdrop-filter:blur(10px);border:1.5px solid rgba(74,222,128,0.55);color:#f8fafc;font-size:11px;font-weight:800;box-shadow:0 8px 22px rgba(0,0,0,0.45);max-width:94vw;white-space:nowrap;";
      document.body.appendChild(hud);
    }
    if (!hud) return;

    const canBuildNow = isReg && !hasHouse && !kavFull && houseKeys >= HOUSE_REQ_KEYS && myCoins >= HOUSE_BUILD_COST;
    const onboardingDone = localStorage.getItem("piraku_onboarding_hud_done" + suf) === "1" || hasHouse || houseKeys >= 1;

    // Hilangkan HUD setelah punya rumah; jika siap bangun rumah (2/2 + 30 koin) tampilkan terus sampai klik Bangun Rumah
    if (isReg && onboardingDone && !canBuildNow && !kavFull) {
      if (hud.style.display !== "none") hud.style.display = "none";
      return;
    }

    let html = "";
    if (!isReg) {
      if (localStorage.getItem("piraku_onboarding_hud_done_guest") === "1") {
        if (hud.style.display !== "none") hud.style.display = "none";
        return;
      }
      html = `<span style="color:#fde047;">🎯 Langkah Awal: Daftar KTP Warga Bandung</span>` +
             `<button onclick="if(typeof openJoinModal==='function') openJoinModal(); else if(typeof openAccountSocialModal==='function') openAccountSocialModal();" style="border:none;background:linear-gradient(135deg,#facc15,#f59e0b);color:#0f172a;padding:4px 9px;border-radius:99px;font-weight:900;font-size:10.5px;cursor:pointer;">🪪 Daftar KTP</button>` +
             `<button onclick="dismissPirakuOnboardingHud()" style="border:none;background:transparent;color:#94a3b8;font-weight:800;font-size:11px;cursor:pointer;padding:0 3px;">✕</button>`;
    } else if (kavFull) {
      const myHomeId = myKec.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      html = `<span style="color:#7dd3fc;">🏢 36 Kavling Penuh!</span>` +
             `<button onclick="if(typeof window.donateDistrictApartment==='function') window.donateDistrictApartment('${myHomeId}', 20);" style="border:none;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#fff;padding:4px 9px;border-radius:99px;font-weight:900;font-size:10.5px;cursor:pointer;">✨ Sumbang Level Apartemen (20 🪙)</button>`;
    } else if (canBuildNow) {
      html = `<span style="color:#fde047;">🎉 Kunci ${HOUSE_REQ_KEYS}/${HOUSE_REQ_KEYS} Siap!</span>` +
             `<button onclick="buildMyInstantHouse()" style="border:none;background:linear-gradient(135deg,#facc15,#f59e0b);color:#0f172a;padding:4px 10px;border-radius:99px;font-weight:900;font-size:10.5px;cursor:pointer;">🏠 Bangun Rumah (${HOUSE_BUILD_COST} 🪙)!</button>`;
    } else {
      html = `<span>🏘️ Wargi Baru: Selesaikan ${HOUSE_REQ_KEYS} Misi untuk Bangun Rumah di <b>Kec. ${myKec}</b></span>` +
             `<button onclick="openMissionsHubModal()" style="border:none;background:#10b981;color:#fff;padding:4px 9px;border-radius:99px;font-weight:800;font-size:10px;cursor:pointer;">🎯 Buka Misi</button>` +
             `<button onclick="dismissPirakuOnboardingHud()" style="border:none;background:transparent;color:#94a3b8;font-weight:800;font-size:11px;cursor:pointer;padding:0 3px;">✕</button>`;
    }

    hud.style.display = "flex";
    if (html !== lastQuestHudSig) {
      lastQuestHudSig = html;
      hud.innerHTML = html;
    }
  }
  setInterval(updateGuidedQuestHud, 1000);
  setTimeout(updateGuidedQuestHud, 600);

  window.openMandatoryBuildHouseModal = function () {
    const myIg = (localStorage.getItem("piraku_my_ig") || "").trim();
    const myKec = localStorage.getItem("piraku_my_kec") || "Bandung Wetan";
    if (!myIg) return;
    const suf = getCivicUserSuffix();
    if (localStorage.getItem("piraku_has_house" + suf) === "1" || window.pirakuDistrictHasHouse) return;
    const myCoins = window.PirakuEconomy ? window.PirakuEconomy.getCoins() : (parseInt(localStorage.getItem("piraku_coins") || "0", 10) || 0);
    const modal = ensureCivicModal();
    modal.style.display = "flex";
    modal.onclick = null;
    modal.innerHTML = [
      '<div style="width:100%;max-width:390px;background:linear-gradient(165deg,#0f172a,#0e2f2a);border:2px solid #facc15;border-radius:24px;padding:22px;color:#fff;font-family:\'Bricolage Grotesque\',sans-serif;box-shadow:0 24px 60px rgba(0,0,0,0.85);text-align:center;">',
        '<div style="font-size:34px;margin-bottom:6px;">🏠🔑</div>',
        '<div style="font-size:11px;font-weight:800;color:#facc15;letter-spacing:0.8px;text-transform:uppercase;">MISI KUNCI LENGKAP (' + HOUSE_REQ_KEYS + '/' + HOUSE_REQ_KEYS + ')!</div>',
        '<h3 style="margin:6px 0 8px;font-size:20px;font-weight:900;">Waktunya Bangun Rumahmu!</h3>',
        '<p style="font-size:12.5px;color:#cbd5e1;line-height:1.5;margin:0 0 16px;">Kavling di <b>Kec. ' + myKec + '</b> sudah menunggumu. Dirikan rumah 3D sekarang sebelum lanjut menjelajah kota!</p>',
        (myCoins >= HOUSE_BUILD_COST
          ? '<button onclick="buildMyInstantHouse()" style="width:100%;padding:13px;border:none;border-radius:14px;background:linear-gradient(135deg,#facc15,#f59e0b);color:#0f172a;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 8px 24px rgba(245,158,11,0.45);">🏠 BANGUN RUMAH SEKARANG (' + HOUSE_BUILD_COST + ' 🪙)</button>'
          : '<div style="font-size:11.5px;color:#fca5a5;margin-bottom:10px;">Koinmu saat ini <b>' + myCoins + ' 🪙</b> (butuh <b>' + HOUSE_BUILD_COST + ' 🪙</b>). Klaim 1 misi lagi untuk dapat koin!</div>' +
            '<button onclick="openMissionsHubModal()" style="width:100%;padding:12px;border:none;border-radius:14px;background:#10b981;color:#fff;font-weight:900;font-size:13px;cursor:pointer;">🎯 Kumpulkan Koin di Misi</button>'),
      '</div>'
    ].join("");
  };

  window.buildMyInstantHouse = async function () {
    const myIg = localStorage.getItem("piraku_my_ig");
    const myKec = localStorage.getItem("piraku_my_kec") || "Bandung Wetan";
    if (!myIg) return;

    const suf = getCivicUserSuffix();
    if (localStorage.getItem("piraku_has_house" + suf) === "1" || window.pirakuDistrictHasHouse) {
      if (typeof window.showToast === "function") window.showToast("🏠 Rumahmu sudah berdiri di komplek!");
      return;
    }
    const houseKeys = parseInt(localStorage.getItem("piraku_house_keys" + suf) || "0", 10);
    if (houseKeys < HOUSE_REQ_KEYS) {
      if (typeof window.showToast === "function") window.showToast(`🔒 Butuh ${HOUSE_REQ_KEYS} Kunci 🔑 dari Misi untuk membangun rumah!`);
      return;
    }
    if (window.PirakuEconomy && typeof window.PirakuEconomy.spendCoins === "function") {
      if (!window.PirakuEconomy.spendCoins(HOUSE_BUILD_COST, "Biaya Bangun Rumah 3D Kec. " + myKec)) return;
    }

    localStorage.setItem("piraku_has_house" + suf, "1");
    localStorage.setItem("piraku_house_keys" + suf, String(HOUSE_REQ_KEYS));
    localStorage.setItem("piraku_onboarding_hud_done" + suf, "1");
    window.pirakuDistrictHasHouse = true;
    if (window.PirakuEconomy && typeof window.PirakuEconomy.getState === "function") {
      const ecoState = window.PirakuEconomy.getState();
      if (Array.isArray(ecoState.owned)) {
        if (!ecoState.owned.includes("has_house_built")) ecoState.owned.push("has_house_built");
        if (!ecoState.owned.includes("house_keys_2")) ecoState.owned.push("house_keys_2");
        if (typeof window.PirakuEconomy.saveNow === "function") window.PirakuEconomy.saveNow();
      }
    }
    if (typeof window.playSynthTone === "function") window.playSynthTone(1040, "sine", 0.45);

    const sb = window.pirakuSupabase;
    if (sb) {
      try {
        await sb.from("warga_piraku").update({ has_house: true }).ilike("ig", myIg);
      } catch (e) {}
    }

    if (Array.isArray(window.registeredCitizensList)) {
      const me = window.registeredCitizensList.find(c => String(c.ig || "").toLowerCase() === myIg.toLowerCase());
      if (me) me.has_house = true;
    }
    if (typeof window.refreshActiveDistrictHouses === "function") {
      window.refreshActiveDistrictHouses();
    }
    if (typeof window.syncDistrictHousesInScene === "function") {
      await window.syncDistrictHousesInScene(myKec);
    }
    if (typeof window.showToast === "function") {
      window.showToast("🎉 SELAMAT! Rumah 3D kamu resmi berdiri di Kec. " + myKec + " 🏠✨");
    }
    window.openMissionsHubModal();
  };

  // ================= 4. SPAWN RUMAH PER KECAMATAN =================
  let districtHousesGroup = null;
  let lastRenderedDistrict = "";

  window.syncDistrictHousesInScene = async function (districtName) {
    const scene = window.pirakuScene;
    const sb = window.pirakuSupabase;
    if (!scene || !sb || !districtName || districtName.toLowerCase() === "bandung wetan") return;

    if (districtHousesGroup) {
      scene.remove(districtHousesGroup);
      districtHousesGroup = null;
    }

    districtHousesGroup = new window.THREE.Group();
    districtHousesGroup.name = "piraku-district-houses";
    scene.add(districtHousesGroup);

    try {
      const res = await sb
        .from("warga_publik")
        .select("*")
        .eq("has_house", true)
        .ilike("kecamatan", districtName)
        .order("house_index", { ascending: true });

      if (!res.data || res.data.length === 0) return;

      res.data.forEach(function (c, idx) {
        if (typeof window.buildTropicalBandungHouse === "function") {
          const house = window.buildTropicalBandungHouse(c, idx);
          if (!house) return;
          const col = idx % 4;
          const row = Math.floor(idx / 4);
          house.position.set(25 + col * 6.2, 0, -34 - row * 6.8);
          districtHousesGroup.add(house);
        }
      });
    } catch (e) {}
  };

  setInterval(function () {
    const pill = document.getElementById("piraku-active-map-pill");
    let activeName = "Bandung Wetan";
    if (pill && pill.style.display !== "none") {
      const spanEl = pill.querySelector("span");
      const txt = spanEl ? spanEl.textContent : "";
      const clean = txt.replace(/^[^\w]+/, "").replace(/▾$/, "").trim();
      if (clean) activeName = clean;
    }
    if (activeName !== lastRenderedDistrict) {
      lastRenderedDistrict = activeName;
      window.syncDistrictHousesInScene(activeName);
    }
  }, 1500);

  // ================= 5. AUTO-SWITCH FOOTER (PETA UTAMA VS DISTRIK) =================
  let lastFooterMode = "";

  function updateBottomDockByMode() {
    const dock = document.querySelector(".bottom-nav-dock");
    if (!dock) return;

    const isDistrictMode = Boolean(window.pirakuInDistrict);
    const modeKey = isDistrictMode ? "district" : "main";
    if (modeKey === lastFooterMode) return;
    lastFooterMode = modeKey;

    if (!isDistrictMode) {
      dock.innerHTML = [
        '<button class="nav-dock-btn active" id="nav-tab-peta" onclick="setActiveDockTab(\'peta\'); const p=document.getElementById(\'bottom-control-panel\'); if(p){p.dataset.userOpened=\'0\'; p.classList.add(\'hidden\'); p.style.setProperty(\'display\',\'none\',\'important\');} if(typeof window.openDistrictsHubModal===\'function\') window.openDistrictsHubModal();">',
          '<svg viewBox="0 0 24 24"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',
          '<span class="nav-lbl">Peta</span>',
        '</button>',
        '<button class="nav-dock-btn" id="nav-tab-skenario" onclick="setActiveDockTab(\'skenario\'); const p=document.getElementById(\'bottom-control-panel\'); if(p){const open=p.dataset.userOpened===\'1\'; p.dataset.userOpened=open?\'0\':\'1\'; p.classList.toggle(\'hidden\',open); p.style.setProperty(\'display\',open?\'none\':\'block\',\'important\');}">',
          '<svg viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
          '<span class="nav-lbl">Skenario</span>',
        '</button>',
        '<button class="nav-dock-btn" id="nav-tab-info" onclick="setActiveDockTab(\'info\'); openInfoUpdatesModal();">',
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
          '<span class="nav-lbl">Info</span>',
        '</button>',
        '<button class="nav-dock-btn" id="nav-tab-misi" onclick="setActiveDockTab(\'misi\'); if(typeof window.openMissionsHubModal===\'function\') window.openMissionsHubModal();">',
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
          '<span class="nav-lbl">Misi</span>',
        '</button>',
        '<button class="nav-dock-btn" id="nav-tab-game" onclick="setActiveDockTab(\'game\'); if(typeof openGamesHubModal===\'function\') openGamesHubModal();">',
          '<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="11" r="1"/><circle cx="17" cy="13" r="1"/></svg>',
          '<span class="nav-lbl">Game</span>',
        '</button>',
        '<button class="nav-dock-btn" id="nav-tab-akun" onclick="setActiveDockTab(\'akun\'); openAccountSocialModal();">',
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
          '<span class="nav-lbl">Akun</span>',
        '</button>'
      ].join('');
    } else {
      dock.innerHTML = [
        '<button class="nav-dock-btn active" id="nav-tab-peta" onclick="setActiveDockTab(\'peta\'); const p=document.getElementById(\'bottom-control-panel\'); if(p){p.dataset.userOpened=\'0\'; p.classList.add(\'hidden\'); p.style.setProperty(\'display\',\'none\',\'important\');} if(typeof window.openDistrictsHubModal===\'function\') window.openDistrictsHubModal();">',
          '<svg viewBox="0 0 24 24"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',
          '<span class="nav-lbl">Peta</span>',
        '</button>',
        '<button class="nav-dock-btn" id="nav-tab-pemilu" onclick="setActiveDockTab(\'pemilu\'); if(typeof window.openPemiluCamatModal===\'function\') window.openPemiluCamatModal();">',
          '<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><rect x="3" y="4" width="18" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/></svg>',
          '<span class="nav-lbl">Pemilu</span>',
        '</button>',
        '<button class="nav-dock-btn" id="nav-tab-info" onclick="setActiveDockTab(\'info\'); openInfoUpdatesModal();">',
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
          '<span class="nav-lbl">Info</span>',
        '</button>',
        '<button class="nav-dock-btn" id="nav-tab-warga" onclick="setActiveDockTab(\'warga\'); if(typeof window.openDistrictCitizensModal===\'function\') window.openDistrictCitizensModal();">',
          '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
          '<span class="nav-lbl">Warga</span>',
        '</button>',
        '<button class="nav-dock-btn" id="nav-tab-misi" onclick="setActiveDockTab(\'misi\'); if(typeof window.openMissionsHubModal===\'function\') window.openMissionsHubModal();">',
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
          '<span class="nav-lbl">Misi</span>',
        '</button>',
        '<button class="nav-dock-btn" id="nav-tab-akun" onclick="setActiveDockTab(\'akun\'); openAccountSocialModal();">',
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
          '<span class="nav-lbl">Akun</span>',
        '</button>'
      ].join('');
    }
    updateGuidedQuestHud();
  }

  window.updateBottomDockByMode = updateBottomDockByMode;
  updateBottomDockByMode();
  setInterval(updateBottomDockByMode, 600);
  document.addEventListener("click", function(){ setTimeout(updateBottomDockByMode, 120); }, { passive: true });

  })();
