// piraku-civic.js — Sistem Pemilu Camat per Kecamatan, Pusat Misi, Filter Warga Distrik & Leveling Max 99
(function () {
  "use strict";

  const MAX_LEVEL = 99;

  // Rumus Kurva Santai: Lvl 1 = 100 XP, naik +15 XP tiap level, Max Level 99
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

  // Helper tambah XP + sinkron ke UI & Supabase
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
        window.showToast(`🎉 NAIK LEVEL ${newInfo.level}! Gelar: ${window.getPirakuCitizenTitle(newInfo.level)}`);
      }
    } else if (reasonText && typeof window.showToast === "function") {
      window.showToast(`+${amount} XP (${reasonText}) ✨`);
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
      const txt = pill.querySelector("span")?.textContent || "";
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
      modal.addEventListener("click", (e) => {
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
    modal.innerHTML = `
      <div style="width:100%;max-width:440px;max-height:85vh;overflow-y:auto;background:#0e2f2a;border:1.5px solid rgba(255,207,74,0.35);border-radius:22px;padding:18px;color:#fff;font-family:'Bricolage Grotesque',sans-serif;box-shadow:0 20px 50px rgba(0,0,0,0.55);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div>
            <div style="font-size:10px;font-weight:800;color:#ffcf4a;letter-spacing:1px;text-transform:uppercase;">🗳️ PEMILIHAN CAMAT PERIODE INI</div>
            <h3 style="margin:2px 0 0;font-size:18px;font-weight:800;">Kecamatan ${dist.name}</h3>
          </div>
          <button onclick="document.getElementById('piraku-civic-modal').style.display='none'" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-weight:800;cursor:pointer;">✕</button>
        </div>

        <div style="background:rgba(0,0,0,0.28);border-radius:12px;padding:10px 12px;font-size:11.5px;color:#cfe0d9;margin-bottom:14px;line-height:1.45;">
          ${!myIg
            ? '⚠️ Kamu belum masuk akun. <b>Masuk / Daftar</b> dulu untuk ikut nyoblos atau nyalon Camat!'
            : isDomisiliMatch
              ? `✅ Domisili KTP kamu sesuai (<b>${myKec}</b>). Kamu berhak nyoblos (1 suara) & nyalon jika minimal <b>Lvl 2</b>.`
              : `ℹ️ KTP kamu terdaftar di <b>${myKec}</b>. Kamu hanya bisa nyoblos & nyalon di kecamatan domisilimu sendiri.`}
        </div>

        <div id="pemilu-camat-list" style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;">
          <div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px;">Memuat kotak suara ${dist.name}...</div>
        </div>

        ${isDomisiliMatch ? `
          <div style="border-top:1px solid rgba(255,255,255,0.12);padding-top:12px;">
            <div style="font-size:12px;font-weight:800;color:#ffcf4a;margin-bottom:6px;">📢 Daftar Jadi Calon Camat ${dist.name}</div>
            ${lvlInfo.level >= 2 ? `
              <input id="inp-visi-camat" maxlength="85" placeholder="Tulis visi singkat (maks 85 karakter)..." style="width:100%;box-sizing:border-box;padding:9px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#fff;font-size:12px;margin-bottom:8px;">
              <button onclick="submitCalonCamat('${dist.id}', '${dist.name}')" style="width:100%;padding:10px;border:none;border-radius:12px;background:linear-gradient(135deg,#ffcf4a,#f59e0b);color:#0e2f2a;font-weight:800;font-size:12.5px;cursor:pointer;">Daftarkan Diri Sebagai Calon Camat 👑</button>
            ` : `
              <div style="font-size:11.5px;color:#fca5a5;">Syarat mencalonkan diri minimal <b>Level 2</b> (Level kamu saat ini: <b>Lvl ${lvlInfo.level}</b>). Selesaikan misi harian dulu!</div>
            `}
          </div>
        ` : ""}
      </div>
    `;

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
        const { data } = await sb.from("pemilu_camat").select("*").eq("district_id", dist.id).order("votes", { ascending: false });
        if (data) candidates = data;
        if (myIg) {
          const { data: vData } = await sb.from("pemilu_votes").select("candidate_id").eq("district_id", dist.id).ilike("voter_ig", myIg).maybeSingle();
          if (vData) votedCandidateId = String(vData.candidate_id);
        }
      } catch (e) {}
    }

    if (candidates.length === 0) {
      listEl.innerHTML = `<div style="text-align:center;padding:18px;background:rgba(255,255,255,0.05);border-radius:14px;font-size:12px;color:#cbd5e1;">Belum ada calon Camat terdaftar di <b>${dist.name}</b>.<br>Jadilah warga pertama yang mencalonkan diri!</div>`;
      return;
    }

    const totalVotes = candidates.reduce((acc, c) => acc + (c.votes || 0), 0) || 1;
    listEl.innerHTML = candidates.map((c, idx) => {
      const pct = Math.round(((c.votes || 0) / totalVotes) * 100);
      const isLeader = idx === 0 && (c.votes || 0) > 0;
      const isMyChoice = votedCandidateId === String(c.id);
      return `
        <div style="background:rgba(255,255,255,0.07);border:1px solid ${isLeader ? "#ffcf4a" : "rgba(255,255,255,0.12)"};border-radius:14px;padding:11px 12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-weight:800;font-size:13px;color:${isLeader ? "#ffcf4a" : "#fff"};">
              ${isLeader ? "👑 " : ""}${c.candidate_ig} <span style="font-size:10px;font-weight:600;color:#94a3b8;">(${c.candidate_name})</span>
            </div>
            <div style="font-size:11px;font-weight:800;color:#4ade80;">${c.votes || 0} Suara (${pct}%)</div>
          </div>
          <div style="font-size:11.5px;color:#e2e8f0;margin:5px 0 8px;">“${c.visi_misi}”</div>
          <div style="width:100%;height:5px;background:rgba(255,255,255,0.12);border-radius:4px;overflow:hidden;margin-bottom:8px;">
            <div style="width:${pct}%;height:100%;background:${isLeader ? "#ffcf4a" : "#4ade80"};"></div>
          </div>
          ${canVote ? (
            votedCandidateId
              ? `<div style="font-size:11px;font-weight:700;color:${isMyChoice ? "#4ade80" : "#94a3b8"};">${isMyChoice ? "✅ Pilihan kamu" : "Hak suara sudah digunakan"}</div>`
              : `<button onclick="voteForCamat(${c.id}, '${dist.id}', ${c.votes || 0})" style="padding:6px 12px;border:none;border-radius:9px;background:#10b981;color:#fff;font-weight:800;font-size:11px;cursor:pointer;">🗳️ Coblos Calon Ini</button>`
          ) : ""}
        </div>
      `;
    }).join("");
  }

  window.submitCalonCamat = async function (distId, distName) {
    const myIg = localStorage.getItem("piraku_my_ig");
    const visi = (document.getElementById("inp-visi-camat")?.value || "").trim();
    if (!myIg) return;
    if (visi.length < 8) {
      alert("Tulis visi singkat minimal 8 karakter!");
      return;
    }
    const sb = window.pirakuSupabase;
    if (sb) {
      try {
        const { data: exist } = await sb.from("pemilu_camat").select("id").eq("district_id", distId).ilike("candidate_ig", myIg).maybeSingle();
        if (exist) {
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
        const { error } = await sb.from("pemilu_votes").insert([{
          district_id: distId,
          voter_ig: myIg.toLowerCase(),
          candidate_id: candidateId
        }]);
        if (error) {
          alert("Kamu sudah pernah mencoblos di kecamatan ini!");
          return;
        }
        await sb.from("pemilu_camat").update({ votes: currentVotes + 1 }).eq("id", candidateId);
        localStorage.setItem("piraku_voted_camat_" + distId, String(candidateId));
        localStorage.setItem("piraku_mission_vote_done_" + new Date().toISOString().slice(0, 10), "1");
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
    modal.innerHTML = `
      <div style="width:100%;max-width:440px;max-height:85vh;overflow-y:auto;background:#0e2f2a;border:1.5px solid rgba(255,255,255,0.2);border-radius:22px;padding:18px;color:#fff;font-family:'Bricolage Grotesque',sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div>
            <div style="font-size:10px;font-weight:800;color:#4ade80;letter-spacing:1px;text-transform:uppercase;">👥 DIREKTORI TETANGGA WILAYAH</div>
            <h3 style="margin:2px 0 0;font-size:18px;font-weight:800;">Warga Kec. ${dist.name}</h3>
          </div>
          <button onclick="document.getElementById('piraku-civic-modal').style.display='none'" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-weight:800;cursor:pointer;">✕</button>
        </div>
        <div id="district-warga-list" style="display:flex;flex-direction:column;gap:8px;">
          <div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px;">Memuat data warga ${dist.name}...</div>
        </div>
      </div>
    `;

    const listEl = document.getElementById("district-warga-list");
    const sb = window.pirakuSupabase;
    let rows = [];
    if (sb) {
      try {
        const { data } = await sb.from("warga_publik").select("*").ilike("kecamatan", dist.name).order("xp", { ascending: false }).limit(30);
        if (data) rows = data;
      } catch (e) {}
    }

    if (!rows.length) {
      listEl.innerHTML = `<div style="text-align:center;padding:20px;background:rgba(255,255,255,0.05);border-radius:14px;font-size:12px;color:#cbd5e1;">Belum ada warga terdaftar di <b>Kec. ${dist.name}</b>.</div>`;
      return;
    }

    listEl.innerHTML = rows.map((w, i) => {
      const lInfo = window.computePirakuLevelFromTotalXp(w.xp || 0);
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.07);padding:10px 12px;border-radius:13px;">
          <div>
            <div style="font-weight:800;font-size:12.5px;color:#fff;">#${i + 1} ${w.ig} <span style="background:#ffcf4a;color:#0e2f2a;padding:1px 6px;border-radius:6px;font-size:9.5px;font-weight:800;">LVL ${lInfo.level}</span></div>
            <div style="font-size:11px;color:#cbd5e1;margin-top:2px;">“${w.wish || "Wargi Bandung"}”</div>
          </div>
          <div style="text-align:right;font-size:11px;font-weight:800;color:#4ade80;">❤️ ${w.upvotes || 0}</div>
        </div>
      `;
    }).join("");
  };

  // ================= 3. MODAL PUSAT MISI (TAB KE-5) =================
  window.openMissionsHubModal = function () {
    const modal = ensureCivicModal();
    const dist = getActiveDistrictInfo();
    const today = new Date().toISOString().slice(0, 10);
    const totalXp = parseInt(localStorage.getItem("piraku_my_xp") || "0", 10);
    const lvlInfo = window.computePirakuLevelFromTotalXp(totalXp);
    const pct = lvlInfo.isMax ? 100 : Math.min(100, Math.round((lvlInfo.currentXpInLevel / lvlInfo.requiredForNext) * 100));

    const missions = [
      {
        id: "checkin_" + today,
        cat: "HARIAN",
        title: "Absen Harian Warga",
        desc: "Klaim kehadiran harian untuk mengejar Streak 7 Hari.",
        xp: 50,
        coins: 25,
        done: localStorage.getItem("piraku_claimed_checkin_" + today) === "1"
      },
      {
        id: "patrol_" + today,
        cat: "EKSPLORASI",
        title: `Patroli Wilayah ${dist.name}`,
        desc: "Keliling & tinjau kondisi lingkungan kecamatan aktif.",
        xp: 40,
        coins: 20,
        done: localStorage.getItem("piraku_claimed_patrol_" + today) === "1"
      },
      {
        id: "vote_" + today,
        cat: "DEMOKRASI",
        title: "Partisipasi Pemilu Camat",
        desc: "Gunakan hak suara atau tinjau visi calon Camat di tab Pemilu.",
        xp: 60,
        coins: 35,
        done: localStorage.getItem("piraku_claimed_vote_" + today) === "1"
      },
      {
        id: "gotong_" + today,
        cat: "GOTONG ROYONG",
        title: `Patungan Pembangunan ${dist.name}`,
        desc: "Bantu kas pembangunan fasilitas 3D kecamatanmu.",
        xp: 50,
        coins: 30,
        done: localStorage.getItem("piraku_claimed_gotong_" + today) === "1"
      }
    ];

    modal.style.display = "flex";
    modal.innerHTML = `
      <div style="width:100%;max-width:440px;max-height:85vh;overflow-y:auto;background:#0e2f2a;border:1.5px solid rgba(74,222,128,0.35);border-radius:22px;padding:18px;color:#fff;font-family:'Bricolage Grotesque',sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div>
            <div style="font-size:10px;font-weight:800;color:#4ade80;letter-spacing:1px;text-transform:uppercase;">🎯 PUSAT MISI & PROGRES LEVEL</div>
            <h3 style="margin:2px 0 0;font-size:18px;font-weight:800;">Misi Warga ${dist.name}</h3>
          </div>
          <button onclick="document.getElementById('piraku-civic-modal').style.display='none'" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-weight:800;cursor:pointer;">✕</button>
        </div>

        <div style="background:rgba(0,0,0,0.3);border-radius:14px;padding:12px;margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-weight:800;font-size:13px;color:#ffcf4a;">${lvlInfo.isMax ? "MAX LEVEL 99 👑" : `LEVEL ${lvlInfo.level}`} · ${window.getPirakuCitizenTitle(lvlInfo.level)}</span>
            <span style="font-size:11px;font-weight:700;color:#cfe0d9;">${lvlInfo.isMax ? "MAX" : `${lvlInfo.currentXpInLevel} / ${lvlInfo.requiredForNext} XP`}</span>
          </div>
          <div style="width:100%;height:7px;background:rgba(255,255,255,0.14);border-radius:6px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#4ade80,#ffcf4a);"></div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:9px;">
          ${missions.map(m => `
            <div style="background:rgba(255,255,255,0.07);border-radius:14px;padding:11px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
              <div>
                <span style="font-size:9px;font-weight:800;background:rgba(255,207,74,0.2);color:#ffcf4a;padding:2px 6px;border-radius:5px;">${m.cat}</span>
                <div style="font-weight:800;font-size:13px;margin-top:3px;">${m.title}</div>
                <div style="font-size:11px;color:#cbd5e1;margin-top:2px;">${m.desc}</div>
                <div style="font-size:10.5px;font-weight:800;color:#4ade80;margin-top:4px;">Hadiah: +${m.xp} XP & +${m.coins} 🪙</div>
              </div>
              <button ${m.done ? "disabled" : `onclick="claimPirakuMission('${m.id}', ${m.xp}, ${m.coins}, '${m.title}')"`} style="flex-shrink:0;padding:8px 12px;border:none;border-radius:10px;background:${m.done ? "rgba(255,255,255,0.12)" : "#10b981"};color:${m.done ? "#94a3b8" : "#fff"};font-weight:800;font-size:11px;cursor:${m.done ? "default" : "pointer"};">
                ${m.done ? "Selesai ✓" : "Klaim"}
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  };

  window.claimPirakuMission = async function (missionKey, xpReward, coinReward, title) {
    if (!localStorage.getItem("piraku_my_ig")) {
      alert("Masuk atau daftar akun warga dulu untuk mengklaim misi!");
      return;
    }
    localStorage.setItem("piraku_claimed_" + missionKey, "1");
    if (window.PirakuGameBridge && typeof window.PirakuGameBridge.addCoins === "function") {
      window.PirakuGameBridge.addCoins(coinReward);
    } else {
      const c = parseInt(localStorage.getItem("piraku_coins") || "0", 10) + coinReward;
      localStorage.setItem("piraku_coins", String(c));
    }
    await window.grantPirakuXP(xpReward, title);
    window.openMissionsHubModal();
  };
})();
