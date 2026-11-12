// ================= PIRAKUBDG — UI RPG (Interaction Prompt, Dialog Box, Quest Tracker) =================
// Skrip presentasi murni: membaca window.PIRAKU_QUESTS (js/quests.js) dan memakai helper
// global dari main.js bila tersedia (showToast / playSynthTone / toggleRideTram / quest-tracker-card).
// Tidak menyentuh objek THREE langsung supaya tetap aman dimuat sebelum main.js.
(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const QUESTS = (typeof window !== "undefined" && window.PIRAKU_QUESTS) || null;

  const isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);

  /**
   * Label tombol interaksi. Di HP: "TAP"; di desktop: "E".
   * Dihitung ulang saat dibutuhkan supaya benar walau mode sentuh berubah
   * setelah skrip dimuat (mis. perangkat hybrid / emulasi).
   */
  function currentKeyLabel() {
    const touchNow = ("ontouchstart" in window) ||
                     (navigator.maxTouchPoints > 0) ||
                     (window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches);
    return touchNow ? "TAP" : "E";
  }
  let keyLabel = currentKeyLabel();

  /* ============================================================
     1. INTERACTION PROMPT — melayang di tengah bawah
     ============================================================ */
  const Prompt = {
    el: null,
    current: null,
    hideTimer: null,

    init() {
      this.el = $("interaction-prompt");
      if (!this.el) return;
      this.el.addEventListener("click", e => {
        e.preventDefault();
        this.trigger();
      });
    },

    /** Tampilkan prompt. action = "Bicara" | "Naik Trem" | "Turun di Sini" dst. */
    show(action, sub, icon) {
      if (!this.el) return;
      clearTimeout(this.hideTimer);
      this.current = { action, sub, icon };
      keyLabel = currentKeyLabel();
      const k = $("ip-key"), a = $("ip-action"), s = $("ip-sub"), ic = $("ip-icon");
      if (k) { k.innerText = keyLabel; k.style.minWidth = keyLabel.length > 1 ? "48px" : "34px"; }
      if (a) a.innerText = action;
      if (s) s.innerText = sub || "";
      if (s) s.style.display = sub ? "" : "none";
      if (ic) ic.innerText = icon || "💬";
      const already = this.el.classList.contains("show");
      this.el.classList.add("show");
      if (!already) {
        this.el.classList.remove("pulse");
        void this.el.offsetWidth;
        this.el.classList.add("pulse");
      }
    },

    hide() {
      if (!this.el) return;
      this.current = null;
      this.el.classList.remove("show", "pulse");
    },

    /** Aksi utama saat prompt ditekan / tombol E ditekan. */
    trigger() {
      if (!this.current) return;
      const kind = this.current.kind;
      if (kind === "npc") {
        RPGDialog.openNpc(this.current.npcId);
      } else if (kind === "tram") {
        // Prompt trem quest: jalankan dialog window.PIRAKU_QUESTS (disediakan main.js);
        // prompt trem biasa: naik/turun trem.
        if (typeof this.current.onQuestAction === "function") this.current.onQuestAction();
        else if (this.current.tramQuest && typeof window.talkToTramQuest === "function") window.talkToTramQuest();
        else if (this.current.tramQuest && QUESTS && QUESTS.mainQuest) RPGDialog.openMainQuest();
        else if (typeof window.toggleRideTram === "function") window.toggleRideTram();
      } else {
        RPGDialog.open(this.current.action, this.current.sub);
      }
      if (typeof window.playSynthTone === "function") window.playSynthTone(680, "sine", 0.15);
    },

    /** Prompt untuk NPC terdekat (dipanggil dari main.js bila ada NPC di dekat pemain). */
    showForNpc(npc) {
      const name = (npc && (npc.npcName || npc.name)) || "Warga";
      keyLabel = currentKeyLabel();
      this.show("Bicara", "Tekan " + keyLabel + " untuk bicara dengan " + name, "💬");
      if (this.current) { this.current.kind = "npc"; this.current.npcId = npc && npc.id; }
    },

    /** Prompt naik/turun trem. */
    showForTram(mode, stationName) {
      keyLabel = currentKeyLabel();
      if (mode === "board") {
        this.show("Naik Trem", "Tekan " + keyLabel + " untuk naik trem di " + (stationName || "halte"), "🚊");
      } else if (mode === "exit") {
        this.show("Turun di Sini", "Tekan " + keyLabel + " untuk turun di " + (stationName || "halte"), "🚶");
      } else {
        this.show("Trem Jalan", "Tunggu trem berhenti di halte", "🚊");
      }
      if (this.current) this.current.kind = "tram";
    }
  };

  /* ============================================================
     2. RPG DIALOG BOX — nama NPC, teks dialog, tombol Lanjut
     ============================================================ */
  const RPGDialog = {
    el: null,
    lines: [],
    index: 0,
    speaker: "",
    open_: false,

    init() {
      this.el = $("rpg-dialog");
      if (!this.el) return;
      const nextBtn = $("btn-rpg-next");
      if (nextBtn) nextBtn.addEventListener("click", e => { e.preventDefault(); this.next(); });
      const closeBtn = $("btn-rpg-close");
      if (closeBtn) closeBtn.addEventListener("click", e => { e.preventDefault(); this.close(); });
      // Klik area dialog (bukan tombol) juga lanjut — nyaman di HP.
      this.el.addEventListener("click", e => {
        if (e.target.closest("button")) return;
        this.next();
      });
    },

    /** Buka dialog bebas (judul + satu baris teks). */
    open(title, text, icon) {
      this.lines = [{ speaker: title || "Warga Bandung", text: text || "" }];
      this.index = 0;
      this._render(icon);
    },

    /** Buka dialog NPC dari data js/quests.js. */
    openNpc(npcId) {
      const npc = QUESTS && QUESTS.getNpcById ? QUESTS.getNpcById(npcId) : null;
      if (!npc) {
        this.open("Warga Bandung", "Euy, wilujeng sumping di Bandung! Aya nu kaciweuh? 👋");
        return;
      }
      this.speaker = npc.npcName || npc.name || "Warga";
      const lines = Array.isArray(npc.dialogLines) && npc.dialogLines.length
        ? npc.dialogLines
        : [{ speaker: this.speaker, text: npc.description || "Wilujeng sumping!" }];
      this.lines = lines;
      this.index = 0;
      this._render(npc.icon || "🧑");
      if (typeof window.showToast === "function") {
        window.showToast("Ngobrol jeung " + this.speaker + " — " + (npc.role || "warga Bandung"));
      }
    },

    /** Buka dialog quest utama (trem klasik) dari js/quests.js. */
    openMainQuest() {
      const q = QUESTS && QUESTS.mainQuest;
      if (!q) { this.open("Trem Klasik", "Trem klasik Bandung keur ngaliwat di Halte Gasibu! 🚊"); return; }
      this.speaker = q.npcName || "Kang Undang";
      this.lines = q.dialogLines && q.dialogLines.length
        ? q.dialogLines
        : [{ speaker: this.speaker, text: q.description || "" }];
      this.index = 0;
      this._render("🚊");
    },

    _render(icon) {
      if (!this.el) return;
      const line = this.lines[this.index] || { speaker: this.speaker, text: "" };
      const last = this.index >= this.lines.length - 1;

      const plate = $("rpg-npc-name");
      if (plate) plate.innerText = line.speaker || this.speaker || "Warga Bandung";
      const avatar = $("rpg-npc-avatar");
      if (avatar) {
        const who = (line.speaker || "").toLowerCase();
        avatar.innerText = who.indexOf("pemain") > -1 || who.indexOf("kamu") > -1
          ? "😀"
          : (icon || "🧑");
      }
      const body = $("rpg-dialog-text");
      if (body) body.innerText = line.text || "";

      // Tombol Lanjut berubah jadi "Selesai" di baris terakhir.
      const nextBtn = $("btn-rpg-next");
      if (nextBtn) nextBtn.innerHTML = last ? "Selesai ✓" : "Lanjut ▸";
      const hint = $("rpg-dialog-hint");
      if (hint) {
        keyLabel = currentKeyLabel();
        hint.innerText = last
          ? "Tekan " + keyLabel + " untuk menutup"
          : "Baris " + (this.index + 1) + " dari " + this.lines.length + " · Tekan " + keyLabel;
      }

      // Dot indikator progres baris (maks 9 dot biar rapi).
      const dots = $("rpg-dialog-dots");
      if (dots) {
        const n = Math.min(this.lines.length, 9);
        let html = "";
        for (let i = 0; i < n; i++) html += '<i class="' + (i === Math.min(this.index, n - 1) ? "on" : "") + '"></i>';
        dots.innerHTML = html;
      }

      this.open_ = true;
      this.el.classList.add("open");
      this.el.setAttribute("aria-hidden", "false");
      document.body.classList.add("rpg-dialog-open");
    },

    /** Lanjut ke baris berikutnya, atau tutup bila sudah baris terakhir. */
    next() {
      if (!this.open_) return;
      if (this.index < this.lines.length - 1) {
        this.index++;
        this._render(null);
        if (typeof window.playSynthTone === "function") window.playSynthTone(760, "sine", 0.08);
      } else {
        this.close();
      }
    },

    close() {
      if (!this.el) return;
      this.open_ = false;
      this.index = 0;
      this.lines = [];
      this.el.classList.remove("open");
      this.el.setAttribute("aria-hidden", "true");
      document.body.classList.remove("rpg-dialog-open");
      if (typeof window.playSynthTone === "function") window.playSynthTone(420, "sine", 0.1);
    }
  };

  /* ============================================================
     3. MINI QUEST TRACKER — kiri atas, judul + status quest
     ============================================================ */
  const QuestTracker = {
    el: null,
    quest: null,

    init() {
      this.el = $("quest-tracker-card");
      if (!this.el) return;
      // Isi judul & objektif quest aktif dari js/quests.js (bila tersedia).
      const q = (QUESTS && QUESTS.mainQuest) || null;
      this.quest = q;
      const titleEl = $("qt-title");
      if (titleEl && q) titleEl.innerText = q.title || "";
      const objEl = $("qt-objective");
      if (objEl && q) objEl.innerText = q.objective || q.description || "";
      const labelEl = $("qt-label-text");
      if (labelEl) labelEl.innerText = q ? "Quest Aktif" : "Misi Harian";
      this.setStatus("Berjalan", 0);
      // Klik kartu = buka dialog penjelasan quest.
      this.el.addEventListener("click", () => {
        if (this.quest) RPGDialog.open(this.quest.title, this.quest.objective || this.quest.description, "🚊");
      });
      this.el.style.display = "";
    },

    /** status: "Berjalan" | "Selesai" | "Menunggu"; progress 0..1 */
    setStatus(status, progress) {
      const st = $("qt-status");
      if (st) {
        const done = status === "Selesai";
        st.classList.toggle("done", done);
        st.innerHTML = (done ? "✅ " : "🎯 ") + status;
      }
      const bar = $("qt-bar-fill");
      if (bar && typeof progress === "number") {
        bar.style.width = Math.max(0, Math.min(1, progress)) * 100 + "%";
      }
    },

    setMeta(text) {
      const m = $("qt-meta");
      if (m) m.innerText = text || "";
    },

    /**
     * Jembatan kompatibilitas: main.js (QuestSystem.updateTrackerCard) menulis ke
     * #quest-current-title / #quest-distance-text / #quest-reward-text. Elemen itu kini
     * tersembunyi, jadi salin nilainya ke elemen tracker yang terlihat.
     */
    syncFromLegacy() {
      if (!this.el) return;
      const t = $("quest-current-title"), d = $("quest-distance-text"), r = $("quest-reward-text");
      const titleEl = $("qt-title");
      if (titleEl && t && t.textContent.trim()) titleEl.innerText = t.textContent.trim();
      const metaEl = $("qt-meta");
      if (metaEl) {
        const parts = [];
        if (d && d.textContent.trim()) parts.push(d.textContent.trim());
        if (r && r.textContent.trim()) parts.push("🏆 " + r.textContent.trim());
        if (parts.length) metaEl.innerText = parts.join(" · ");
      }
      if (t && /Semua Misi/i.test(t.textContent)) {
        this.setStatus("Selesai", 1);
      }
      const countEl = $("quest-progress-count");
      if (countEl) {
        const m = countEl.textContent.match(/(\d+)\s*\/\s*(\d+)/);
        if (m) this.setStatus("Berjalan", Number(m[1]) / Math.max(1, Number(m[2])));
      }
    },

    /** Animasi kilat saat progres berubah / quest selesai. */
    flash() {
      if (!this.el) return;
      this.el.classList.remove("q-flash");
      void this.el.offsetWidth;
      this.el.classList.add("q-flash");
    },

    hide() { if (this.el) this.el.style.display = "none"; },
    show() { if (this.el) this.el.style.display = ""; }
  };

  /* ============================================================
     INTEGRASI — jembatan ke main.js (opsional, aman bila absen)
     ============================================================ */
  /**
   * Pantau keadaan game lewat DOM yang sudah ada (tanpa menyentuh variabel THREE).
   * - #btn-tram-action tampil saat pemain dekat halte trem -> munculkan prompt naik/turun.
   * - Thread dialog NPC dibuka dari prompt apa pun yang punya kind "npc".
   */
  function watchGameState() {
    const tramBtn = $("btn-tram-action");
    const tramTxt = $("tram-action-text");

    // --- Hitung tinggi panel bawah supaya prompt mengambang tepat di atasnya ---
    const panel = $("bottom-control-panel");
    let lift = 24;
    if (panel) {
      const cs = getComputedStyle(panel);
      const shown = cs.display !== "none" && !panel.classList.contains("hidden");
      if (shown) {
        const r = panel.getBoundingClientRect();
        // Hanya pertimbangkan bila panel benar-benar berada di area bawah viewport.
        if (r.height > 0 && r.top > innerHeight * 0.4) lift = Math.round(innerHeight - r.top) + 14;
      }
    }
    // Panel joystick / tombol lompat di HP juga perlu dihindari.
    const joy = $("joystick-zone");
    if (joy && getComputedStyle(joy).display !== "none") lift = Math.max(lift, 30);
    document.documentElement.style.setProperty("--prompt-lift", lift + "px");

    // Jangan tampilkan prompt selama dialog RPG terbuka (biar tidak bertumpuk).
    if (RPGDialog.open_) { Prompt.hide(); return; }
    // Prompt trem quest dikelola main.js (updateTramQuestInteraction) lewat API PirakuRPG;
    // biarkan agar ajakan dialog quest tidak tertimpa setiap 400 ms.
    if (Prompt.current && Prompt.current.tramQuest) return;
    if (!tramBtn) return;

    const visible = tramBtn.style.display && tramBtn.style.display !== "none";
    const riding = tramTxt && /Turun/i.test(tramTxt.innerText);
    if (visible) {
      Prompt.showForTram(riding ? "exit" : "board", tramTxt ? tramTxt.innerText : "");
    } else if (Prompt.current && Prompt.current.kind === "tram") {
      Prompt.hide();
    }
  }
  setInterval(watchGameState, 400);
  // API publik: main.js / multiplayer.js bisa memanggil window.PirakuRPG.*
  window.PirakuRPG = {
    prompt: Prompt,
    dialog: RPGDialog,
    tracker: QuestTracker,
    isTouch: isTouch,
    get keyLabel() { return currentKeyLabel(); }
  };

  // Kompatibilitas: fungsi global untuk pemakaian cepat dari atribut onclick.
  window.showInteractionPrompt = function (action, sub, icon) { Prompt.show(action, sub, icon); };
  window.hideInteractionPrompt = function () { Prompt.hide(); };
  window.openRpgDialog = function (title, text, icon) { RPGDialog.open(title, text, icon); };
  window.closeRpgDialog = function () { RPGDialog.close(); };
  window.completeRpgDialog = function () { RPGDialog.next(); };
  window.updateQuestTracker = function (status, progress, meta) {
    if (typeof status === "string") QuestTracker.setStatus(status, progress);
    if (typeof meta === "string") QuestTracker.setMeta(meta);
    QuestTracker.flash();
  };

  /* ---------- Bind tombol Lanjut ke keyboard desktop ---------- */
  window.addEventListener("keydown", e => {
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    const k = (e.key || "").toLowerCase();
    if (k === "e") {
      e.preventDefault();
      if (RPGDialog.open_) RPGDialog.next();
      else Prompt.trigger();
    } else if (k === "escape") {
      if (RPGDialog.open_) RPGDialog.close();
      else Prompt.hide();
    } else if (k === "enter" && RPGDialog.open_) {
      e.preventDefault();
      RPGDialog.next();
    } else if ((k === " " || e.code === "Space") && RPGDialog.open_) {
      // Spasi = lompat di main.js; saat dialog terbuka, jadikan "Lanjut" saja.
      e.preventDefault();
      e.stopImmediatePropagation();
      RPGDialog.next();
    }
  }, true);

  /* ---------- Init ---------- */
  function init() {
    Prompt.init();
    RPGDialog.init();
    QuestTracker.init();

    // Ikuti quest tracker versi main.js: pantau perubahan DOM pada elemen jembatan.
    const tracked = ["quest-current-title", "quest-distance-text", "quest-reward-text", "quest-progress-count"];
    tracked.forEach(id => {
      const el = $(id);
      if (!el || typeof MutationObserver === "undefined") return;
      new MutationObserver(() => QuestTracker.syncFromLegacy())
        .observe(el, { childList: true, characterData: true, subtree: true });
    });
    // Sinkronisasi awal + interval ringan sebagai jaring aman.
    QuestTracker.syncFromLegacy();
    setInterval(() => QuestTracker.syncFromLegacy(), 1200);

    // Tampilkan kartu begitu main.js mengaktifkannya (display:block dari QuestSystem).
    const card = $("quest-tracker-card");
    if (card && typeof MutationObserver !== "undefined") {
      new MutationObserver(() => {
        if (card.style.display && card.style.display !== "none") QuestTracker.show();
      }).observe(card, { attributes: true, attributeFilter: ["style"] });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Quest tracker di-handle main.js (QuestSystem.updateTrackerCard) untuk misi harian;
  // kita hanya menyediakan elemen + gaya, jadi jangan menimpa bila main.js sudah mengisinya.
})();
