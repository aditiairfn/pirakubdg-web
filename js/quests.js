// ================= PIRAKUBDG — DATA QUEST & NPC WARGA LOKAL =================
// File data murni (tanpa efek samping). Hanya mengekspos window.PIRAKU_QUESTS.
// Quest utama: naik trem klasik Bandung (models/tram.glb) bersama 2 NPC warga lokal.
// Koordinat mengacu pada tata kota simulasi: Halte Gasibu (0, 2.7), Halte Cilaki (31, 16),
// Halte Cimandiri (0, 32), Halte Riau (-36, 16), koridor Gedung Sate / Cilaki / Cimandiri / Riau.

window.PIRAKU_QUESTS = {
  version: "1.0.0",
  theme: "Naik trem klasik Bandung keliling koridor Gedung Sate",
  tramModel: "models/tram.glb",
  currency: "koin",
  currencyLabel: "Koin Piraku",
  items: {
    kacang_garuda: "Kacang Garuda Klasik",
    peuyeum_cibaduyut: "Peuyeum Cibaduyut",
    tiket_kenangan: "Tiket Kenangan Trem Klasik",
    cendol_lengkob: "Cendol Lengkob"
  },

  // ================= QUEST UTAMA =================
  mainQuest: {
    id: "quest_trem_klasik_bandung",
    title: "Trem Klasik Keliling Gedung Sate",
    description:
      "Trem klasik Bandung (tram.glb) berhenti di Halte Gasibu. Naik bareng dua warga lokal, keliling koridor Cilaki - Cimandiri - Riau, lalu turun di Halte Riau dengan tiket kenangan di tangan.",
    npcName: "Kang Undang, warga Cilaki",
    dialogLines: [
      { speaker: "Kang Undang", text: "Euy, meser tiket heula atuh! Trem klasik téh jarang ngaliwat dieu mah." },
      { speaker: "Kang Undang", text: "Ari kuring mah unggal isuk nungguan trem ieu di Halte Gasibu. Geus jadi kabiasaan baheula." },
      { speaker: "Kang Undang", text: "Kelilingna téh ngalangkung Gedung Sate, Cilaki, Cimandiri, nepi ka Riau. Hiji puteran, teu lila." },
      { speaker: "Pemain", text: "Sok atuh, kuring milu. Kumaha carana naik?" },
      { speaker: "Kang Undang", text: "Gampil, cek we kancing 'Naik Trem' basa trem geus eureun di halte. Ulah luncat bari trem keur leumpang!" },
      { speaker: "Bu Rani", text: "Buruan atuh, bangku hareup masih kosong. Sok, eweuh nu ngarebut!" },
      { speaker: "Kang Undang", text: "Keur di tengah jalan, tingali kénca-katuhu. Nu éta deui Gedung Sate, nu éta deui pager Cilaki." },
      { speaker: "Bu Rani", text: "Mun tos nepi Halte Riau, turun heula. Urang meuli cendol, sanggeus kitu balik deui." },
      { speaker: "Kang Undang", text: "Hatur nuhun tos milu. Ieu tiket kenangan, simpen atuh minangka oleh-oleh ti trem klasik!" }
    ],
    objective:
      "Naik trem klasik (models/tram.glb) dari Halte Gasibu, keliling koridor Cilaki - Cimandiri - Riau, lalu turun di Halte Riau.",
    reward: {
      coins: 150,
      xp: 120,
      items: ["tiket_kenangan", "kacang_garuda"],
      badge: "Penumpang Trem Klasik"
    },
    // Penunjang gameplay (opsional dipakai sistem quest di main.js)
    startPoint: { name: "Halte Gasibu", x: 0, z: 2.7 },
    finishPoint: { name: "Halte Riau", x: -36, z: 16 },
    route: [
      { name: "Halte Gasibu", x: 0, z: 2.7 },
      { name: "Halte Cilaki", x: 31, z: 16 },
      { name: "Halte Cimandiri", x: 0, z: 32 },
      { name: "Halte Riau", x: -36, z: 16 }
    ],
    stayDuration: 2.0,
    npcs: ["npc_kang_undang_cilaki", "npc_bu_rani_cimandiri"]
  },

  // ================= NPC WARGA LOKAL =================
  npcs: [
    {
      id: "npc_kang_undang_cilaki",
      name: "Kang Undang",
      npcName: "Kang Undang",
      origin: "Cilaki",
      role: "Tukang parkir langganan trem klasik",
      home: { x: 31, z: 16 },
      questId: "quest_trem_klasik_bandung",
      title: "Sapaan Kang Undang di Halte Cilaki",
      description:
        "Kang Undang hampir tiap hari nungguin trem klasik di Halte Cilaki. Dia yang paling hafal jadwal dan suka nyeritain trem zaman dulu.",
      objective:
        "Temui Kang Undang di Halte Cilaki dan dengarkan ceritanya soal trem klasik Bandung.",
      dialogLines: [
        { speaker: "Kang Undang", text: "Punten, nuju milarian halte Cilaki? Muhun, ieu teh. Sok calik heula." },
        { speaker: "Pemain", text: "Kang, trem ieu ti baheula tos aya keneh nya?" },
        { speaker: "Kang Undang", text: "Aya atuh, ngan baheula mah leuwih lila nungguanana. Ayeuna mah unggal sababaraha menit datang." },
        { speaker: "Kang Undang", text: "Kuring mah resep ningali jalmi naek trem. Ramé, siga pasar leutik nu leumpang." },
        { speaker: "Kang Undang", text: "Mun anjeun hayang ka Cimandiri, tinggal naek ieu. Ulah hilap atuh, di jero tremmah ulah sora tarik." },
        { speaker: "Pemain", text: "Hatur nuhun, Kang!" },
        { speaker: "Kang Undang", text: "Mangga, wilujeng ngumbara di Kota Bandung. Sampurasun!" }
      ],
      reward: {
        coins: 60,
        xp: 45,
        items: ["kacang_garuda"],
        badge: "Sobat Kang Undang"
      }
    },
    {
      id: "npc_bu_rani_cimandiri",
      name: "Bu Rani",
      npcName: "Bu Rani",
      origin: "Cimandiri",
      role: "Penjual cendol di dekat Halte Cimandiri",
      home: { x: 0, z: 32 },
      questId: "quest_trem_klasik_bandung",
      title: "Kuliner Bareng Bu Rani di Halte Cimandiri",
      description:
        "Bu Rani jualan cendol persis di sebelah Halte Cimandiri. Katanya penumpang trem klasik itu pelanggan paling setianya sejak dulu.",
      objective:
        "Cari Bu Rani di sekitar Halte Cimandiri dan coba cendol khas Bandung-nya setelah turun dari trem.",
      dialogLines: [
        { speaker: "Bu Rani", text: "Geura calik, nuju istirahat ti trem nya? Ieu mah tempatna pas pisan." },
        { speaker: "Pemain", text: "Cendolna seger, Bu!" },
        { speaker: "Bu Rani", text: "Enya atuh, cendol teh mun teu make es teh karasa. Kuring geus ngajual di dieu ti kapungkur." },
        { speaker: "Bu Rani", text: "Uninga teu, penumpang trem di dieu teh ramé mun soré. Budak sakola, wargi kantor, saréréa." },
        { speaker: "Bu Rani", text: "Mun anjeun badé ka Halte Riau, gancang atuh, trem téh nuju caket." },
        { speaker: "Pemain", text: "Muhun Bu, hatur nuhun cendolna!" },
        { speaker: "Bu Rani", text: "Mangga, sing salamet di jalan. Nu penting mah ulah poho mawa oleh-oleh keur balikna!" }
      ],
      reward: {
        coins: 70,
        xp: 50,
        items: ["cendol_lengkob", "peuyeum_cibaduyut"],
        badge: "Pelanggan Setia Cendol Cimandiri"
      }
    }
  ]
};

// Daftar quest dalam satu array untuk memudahkan iterasi (main quest + quest tiap NPC).
window.PIRAKU_QUESTS.allQuests = [
  window.PIRAKU_QUESTS.mainQuest,
  ...window.PIRAKU_QUESTS.npcs
];

// Helper: cari quest berdasarkan id.
window.PIRAKU_QUESTS.getQuestById = function (questId) {
  return window.PIRAKU_QUESTS.allQuests.find(function (q) { return q.id === questId; }) || null;
};

// Helper: cari NPC berdasarkan id.
window.PIRAKU_QUESTS.getNpcById = function (npcId) {
  return window.PIRAKU_QUESTS.npcs.find(function (n) { return n.id === npcId; }) || null;
};
