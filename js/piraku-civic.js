// piraku-civic.js — Pemilu Camat, Tutorial Goals, Jalur Cepat Rumah 3D (3 Kunci), Warga Distrik & Max Lvl 99
(function () {
  "use strict";

  const MAX_LEVEL = 99;

  window.getPirakuXpRequiredForLevel = function (lvl) {
    const L = Math.max(1, Math.min(MAX_LEVEL, parseInt(lvl, 10) || 1));
    return 100 + (L - 1) * 15;
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
    const myIg = localStorage.getItem("piraku_my_ig");
    let totalXp = parseInt(localStorage.getItem("piraku_my_xp") || "0", 10);
    const oldInfo = window.computePirakuLevelFromTotalXp(totalXp);

    totalXp += Math.max(0, parseInt(amount, 10) || 0);
    const newInfo = window.computePirakuLevelFromTotalXp(totalXp);

    localStorage.setItem("piraku_my_xp", String(totalXp));
    localStorage.setItem("piraku_my_level", String(newInfo.level));

    if (typeof window.updateAutoDetectButton === "function") {
      window.updateAutoDetectButton();
    }

    if (newInfo.level > oldInfo.level) {
      if (typeof window.playSynthTone === "function") window.playSynthTone(980, "sine", 0.35);
      if (typeof window.showToast === "function") {
        window.showToast("🎉 NAIK LEVEL " + newInfo.level + "! Gelar: " + window.getPirakuCitizenTitle(newInfo.level));
      }
    } else if (reasonText && typeof window.showToast === "function") {
      window.showToast("+" + amount + " XP (" + reasonText + ") ✨");
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
    let candidates = [];
    let votedCandidateId = localStorage.getItem("piraku_voted_camat_" + dist.id);

    if (sb) {
      try {
        const res = await sb.from("pemilu_camat").select("*").eq("district_id", dist.id).order("votes", { ascending: false });
        if (res.data) candidates = res.data;
        if (myIg) {
          const vRes = await sb.from("pemilu_votes").select("candidate_id").eq("district_id", dist.id).ilike("voter_ig", myIg).maybeSingle();
          if (vRes.data) votedCandidateId = String(vRes.data.candidate_id);
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
    const sb = window.pirakuSupabase;
    if (sb) {
      try {
        const res = await sb.from("pemilu_votes").insert([{
          district_id: distId,
          voter_ig: myIg.toLowerCase(),
          candidate_id: candidateId
        }]);
        if (res.error) {
          alert("Kamu sudah pernah mencoblos di kecamatan ini!");
          return;
        }
        await sb.from("pemilu_camat").update({ votes: currentVotes + 1 }).eq("id", candidateId);
        localStorage.setItem("piraku_voted_camat_" + distId, String(candidateId));
        await window.grantPirakuXP(60, "Menyalurkan Hak Suara Pemilu");
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

  window.openMissionsHubModal = function () {
    const modal = ensureCivicModal();
    const dist = getActiveDistrictInfo();
    const today = new Date().toISOString().slice(0, 10);
    const totalXp = parseInt(localStorage.getItem("piraku_my_xp") || "0", 10);
    const lvlInfo = window.computePirakuLevelFromTotalXp(totalXp);
    const pct = lvlInfo.isMax ? 100 : Math.min(100, Math.round((lvlInfo.currentXpInLevel / lvlInfo.requiredForNext) * 100));

    const myKecHome = localStorage.getItem("piraku_my_kec") || dist.name;
    const houseKeys = Math.min(3, parseInt(localStorage.getItem("piraku_house_keys") || "0", 10));
    const hasHouse = localStorage.getItem("piraku_has_house") === "1";
    const isFirstTimeTut = localStorage.getItem("piraku_mission_tut_seen") !== "1";

    const missions = [
      {
        id: "checkin_" + today,
        cat: "HARIAN",
        title: "1. Absen Harian Warga",
        desc: "Klik Klaim untuk mencatat kehadiranmu hari ini.",
        xp: 50,
        coins: 50,
        done: localStorage.getItem("piraku_claimed_checkin_" + today) === "1"
      },
      {
        id: "patrol_" + today,
        cat: "EKSPLORASI",
        title: "2. Patroli Wilayah " + dist.name,
        desc: "Jalan-jalan keliling peta kota lalu klaim hadiah patroli.",
        xp: 40,
        coins: 50,
        done: localStorage.getItem("piraku_claimed_patrol_" + today) === "1"
      },
      {
        id: "vote_" + today,
        cat: "DEMOKRASI",
        title: "3. Partisipasi Pemilu Camat",
        desc: "Buka tab Pemilu di bawah untuk cek calon atau nyoblos Camat.",
        xp: 60,
        coins: 50,
        done: localStorage.getItem("piraku_claimed_vote_" + today) === "1"
      },
      {
        id: "gotong_" + today,
        cat: "GOTONG ROYONG",
        title: "4. Gotong Royong " + dist.name,
        desc: "Dukung kas pembangunan fasilitas 3D kecamatanmu.",
        xp: 50,
        coins: 50,
        done: localStorage.getItem("piraku_claimed_gotong_" + today) === "1"
      }
    ];

    modal.style.display = "flex";
    modal.innerHTML = [
      '<div style="width:100%;max-width:440px;max-height:85vh;overflow-y:auto;background:#0e2f2a;border:1.5px solid rgba(74,222,128,0.35);border-radius:22px;padding:18px;color:#fff;font-family:\'Bricolage Grotesque\',sans-serif;">',
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">',
          '<div>',
            '<div style="font-size:10px;font-weight:800;color:#4ade80;letter-spacing:1px;text-transform:uppercase;">🎯 PUSAT MISI & PANDUAN WARGA</div>',
            '<h3 style="margin:2px 0 0;font-size:18px;font-weight:800;">Misi & Goals di ' + dist.name + '</h3>',
          '</div>',
          '<button onclick="document.getElementById(\'piraku-civic-modal\').style.display=\'none\'" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-weight:800;cursor:pointer;">✕</button>',
        '</div>',

        '<div style="background:rgba(15,23,42,0.65);border:1px solid rgba(56,189,248,0.45);border-radius:14px;padding:10px 12px;margin-bottom:12px;">',
          '<div onclick="toggleMissionTutorialBox()" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">',
            '<span style="font-size:12px;font-weight:800;color:#38bdf8;">📖 Tutorial: Cara Main & Goals Utama</span>',
            '<span id="mission-tutorial-arrow" style="font-size:10.5px;font-weight:700;color:#bae6fd;">' + (isFirstTimeTut ? '▲ Tutup' : '▼ Lihat Panduan') + '</span>',
          '</div>',
          '<div id="mission-tutorial-content" style="display:' + (isFirstTimeTut ? 'block' : 'none') + ';margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);font-size:11px;color:#e2e8f0;line-height:1.5;">',
            '<div style="margin-bottom:6px;"><b style="color:#ffcf4a;">🏠 Goal 1 — Punya Rumah 3D Sendiri:</b> Selesaikan <b>3 misi apa saja</b> di bawah untuk mengumpulkan <b>3 Kunci 🔑</b>, lalu bangun Rumah Tropis lengkap dengan papan nama IG kamu di <b>Kec. ' + myKecHome + '</b>.</div>',
            '<div style="margin-bottom:6px;"><b style="color:#4ade80;">⭐ Goal 2 — Naik Level (Max Lvl 99):</b> Tiap misi memberi <b>XP</b>. Capai minimal <b>Level 2</b> untuk membuka hak mendaftar jadi <b>Calon Camat</b>!</div>',
            '<div style="margin-bottom:6px;"><b style="color:#f472b6;">🗳️ Goal 3 — Pemilu Camat:</b> Buka tab <b>Pemilu</b> untuk mencoblos atau berkampanye menjadi pemimpin kecamatan domisilimu.</div>',
            '<div><b style="color:#fbbf24;">🪙 Goal 4 — Koin Pembangunan:</b> Koin hasil misi dipakai untuk patungan upgrade fasilitas kota di kecamatanmu.</div>',
          '</div>',
        '</div>',

        '<div style="background:linear-gradient(135deg,rgba(255,207,74,0.22),rgba(16,185,129,0.2));border:1.5px solid rgba(255,207,74,0.55);border-radius:14px;padding:12px;margin-bottom:12px;">',
          '<div style="display:flex;justify-content:space-between;align-items:center;">',
            '<span style="font-weight:800;font-size:12.5px;color:#ffcf4a;">🏠 Progres Rumah 3D: ' + (hasHouse ? 'SUDAH BERDIRI ✓' : houseKeys + ' / 3 Kunci 🔑') + '</span>',
            '<span style="font-size:10px;font-weight:800;background:#10b981;color:#fff;padding:2px 8px;border-radius:99px;">Kec. ' + myKecHome + '</span>',
          '</div>',
          '<div style="font-size:11px;color:#f1f5f9;margin-top:5px;line-height:1.4;">',
            (hasHouse
              ? '🎉 <b>Rumah 3D Tropis</b> kamu sudah berdiri di komplek perumahan <b>Kec. ' + myKecHome + '</b>!'
              : houseKeys >= 3
                ? '🔥 Kunci sudah lengkap (3/3)! Klik tombol emas di bawah untuk langsung mendirikan <b>Rumah 3D</b> milikmu!'
                : 'Butuh <b>' + (3 - houseKeys) + ' Kunci 🔑 lagi</b> (selesaikan ' + (3 - houseKeys) + ' misi di bawah) untuk membangun rumahmu!'),
          '</div>',
          ((!hasHouse && houseKeys >= 3)
            ? '<button onclick="buildMyInstantHouse()" style="width:100%;margin-top:9px;padding:10px;border:none;border-radius:11px;background:linear-gradient(135deg,#ffcf4a,#f59e0b);color:#0e2f2a;font-weight:900;font-size:12.5px;cursor:pointer;box-shadow:0 6px 18px rgba(245,158,11,0.4);">🏠 BANGUN RUMAH 3D SAYA SEKARANG!</button>'
            : ''),
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
            return '<div style="background:rgba(255,255,255,0.07);border-radius:14px;padding:11px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
              '<div>' +
                '<span style="font-size:9px;font-weight:800;background:rgba(255,207,74,0.2);color:#ffcf4a;padding:2px 6px;border-radius:5px;">' + m.cat + '</span>' +
                '<div style="font-weight:800;font-size:13px;margin-top:3px;">' + m.title + '</div>' +
                '<div style="font-size:11px;color:#cbd5e1;margin-top:2px;">' + m.desc + '</div>' +
                '<div style="font-size:10.5px;font-weight:800;color:#4ade80;margin-top:4px;">Hadiah: +' + m.xp + ' XP · +' + m.coins + ' 🪙 · +1 🔑</div>' +
              '</div>' +
              '<button ' + (m.done ? 'disabled' : 'onclick="claimPirakuMission(\'' + m.id + '\', ' + m.xp + ', ' + m.coins + ', \'' + m.title + '\')"') + ' style="flex-shrink:0;padding:8px 12px;border:none;border-radius:10px;background:' + (m.done ? 'rgba(255,255,255,0.12)' : '#10b981') + ';color:' + (m.done ? '#94a3b8' : '#fff') + ';font-weight:800;font-size:11px;cursor:' + (m.done ? 'default' : 'pointer') + ';">' +
                (m.done ? 'Selesai ✓' : 'Klaim') +
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
    localStorage.setItem("piraku_claimed_" + missionKey, "1");

    const curKeys = Math.min(3, parseInt(localStorage.getItem("piraku_house_keys") || "0", 10) + 1);
    localStorage.setItem("piraku_house_keys", String(curKeys));

    if (window.PirakuGameBridge && typeof window.PirakuGameBridge.addCoins === "function") {
      window.PirakuGameBridge.addCoins(coinReward);
    } else {
      const c = parseInt(localStorage.getItem("piraku_coins") || "0", 10) + coinReward;
      localStorage.setItem("piraku_coins", String(c));
    }

    await window.grantPirakuXP(xpReward, title);
    if (curKeys === 3 && localStorage.getItem("piraku_has_house") !== "1" && typeof window.showToast === "function") {
      window.showToast("🔑 3/3 Kunci Terkumpul! Klik tombol Bangun Rumah 3D di atas!");
    }
    window.openMissionsHubModal();
  };

  window.buildMyInstantHouse = async function () {
    const myIg = localStorage.getItem("piraku_my_ig");
    const myKec = localStorage.getItem("piraku_my_kec") || "Bandung Wetan";
    if (!myIg) return;

    localStorage.setItem("piraku_has_house", "1");
    if (typeof window.playSynthTone === "function") window.playSynthTone(1040, "sine", 0.45);

    const sb = window.pirakuSupabase;
    if (sb) {
      try {
        await sb.from("warga_piraku").update({ has_house: true }).ilike("ig", myIg);
      } catch (e) {}
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
})();
