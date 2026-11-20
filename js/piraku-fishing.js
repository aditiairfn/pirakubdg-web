// piraku-fishing.js — Mancing 3D ala Roblox Fisch (Danau Besar, Tenggelam di Air, Jual/Upgrade Khusus di Kopdes, UI Anti-Tindih)
(function () {
  "use strict";

  const RODS = [
    { id: "bamboo",    name: "Joran Bambu Cikapundung", cost: 0,     barWidth: 34, luckBonus: 0.00, mutChance: 0.05, color: 0xa16207, badge: "🎋", tierNote: "Cocok ikan Common–Uncommon (Rare+ sangat langka)" },
    { id: "fiber",     name: "Joran Fiber Braga",       cost: 600,   barWidth: 40, luckBonus: 0.18, mutChance: 0.10, color: 0x0284c7, badge: "🎣", tierNote: "Buka peluang Rare & Epic" },
    { id: "carbon",    name: "Joran Karbon Dago",       cost: 2500,  barWidth: 46, luckBonus: 0.38, mutChance: 0.18, color: 0x1e293b, badge: "⚡", tierNote: "Efek kilau biru • Peluang Epic & Mythic" },
    { id: "gold",      name: "Joran Emas Siliwangi",    cost: 8500,  barWidth: 54, luckBonus: 0.65, mutChance: 0.28, color: 0xfacc15, badge: "👑", tierNote: "Cahaya emas • Peluang Mythic & Secret tinggi" },
    { id: "crystal",   name: "Joran Kristal Tangkuban", cost: 25000,  barWidth: 60, luckBonus: 0.95, mutChance: 0.38, color: 0x38bdf8, badge: "💎", tierNote: "Cahaya kristal biru • Buru Secret & Cosmic!" },
    { id: "celestial", name: "Joran Naga Siliwangi",    cost: 65000,  barWidth: 68, luckBonus: 1.40, mutChance: 0.52, color: 0xa855f7, badge: "🌌", tierNote: "Aura kosmik • Peluang tertinggi Cosmic & Divine!" },
    { id: "galatama",  name: "Joran Galatama Sultan",   cost: 150000, barWidth: 76, luckBonus: 2.10, mutChance: 0.72, color: 0xf43f5e, badge: "🏆", tierNote: "Joran Galatama legendaris • Peluang gacor Mythic–Divine & Mutasi!" }
  ];

  const BOBBERS = [
    { id: "classic", name: "Umbul-umbul Merah Putih", cost: 0,     biteSpeed: 1.00, luckBoost: 0.00, mutBoost: 0.00, topCol: 0xef4444, botCol: 0xf8fafc, glowCol: null,     icon: "🔴", desc: "Pelampung standar" },
    { id: "neon",    name: "Umbul-umbul Neon Biru",   cost: 1200,  biteSpeed: 0.78, luckBoost: 0.16, mutBoost: 0.06, topCol: 0x38bdf8, botCol: 0x0f172a, glowCol: 0x38bdf8, icon: "💠", desc: "Nyambar +22% cepat • Luck +16%" },
    { id: "emas",    name: "Umbul-umbul Emas Sakti",  cost: 5000,  biteSpeed: 0.66, luckBoost: 0.36, mutBoost: 0.14, topCol: 0xfacc15, botCol: 0x78350f, glowCol: 0xfde047, icon: "🌟", desc: "Nyambar +34% cepat • Luck +36% • Mutasi +14%" },
    { id: "kosmik",  name: "Umbul-umbul Kosmik",      cost: 18000, biteSpeed: 0.52, luckBoost: 0.65, mutBoost: 0.24, topCol: 0xc084fc, botCol: 0x3b0764, glowCol: 0xe879f9, icon: "🔮", desc: "Nyambar +48% cepat • Luck +65% • Mutasi +24%" }
  ];

  const FISH_CATALOG = [
    // Common (10)
    { id: "sepatu",      name: "Sepatu Bekas Cibaduyut", rarity: "Common",   col: "#94a3b8", accent: "#475569", shape: "boot",    minKg: 0.4,  maxKg: 1.2,  baseCoin: 0,   speed: 0.35, erratic: 0.15, weight: 4.0,  icon: "🥾", meshCol: 0x64748b },
    { id: "wader",       name: "Wader Cilik Dago",       rarity: "Common",   col: "#fcd34d", accent: "#f59e0b", shape: "chubby",  minKg: 0.2,  maxKg: 0.9,  baseCoin: 2,   speed: 0.40, erratic: 0.18, weight: 10.0, icon: "🐟", meshCol: 0xfcd34d },
    { id: "lele",        name: "Lele Cikapundung",       rarity: "Common",   col: "#64748b", accent: "#334155", shape: "whisker", minKg: 0.6,  maxKg: 3.4,  baseCoin: 3,   speed: 0.45, erratic: 0.22, weight: 9.0,  icon: "🐟", meshCol: 0x475569 },
    { id: "mujair",      name: "Mujair Taman Lansia",    rarity: "Common",   col: "#9ca3af", accent: "#6b7280", shape: "chubby",  minKg: 0.5,  maxKg: 2.5,  baseCoin: 2,   speed: 0.42, erratic: 0.20, weight: 9.0,  icon: "🐠", meshCol: 0x94a3b8 },
    { id: "nila",        name: "Nila Merah Bandung",     rarity: "Common",   col: "#f87171", accent: "#dc2626", shape: "chubby",  minKg: 0.7,  maxKg: 3.0,  baseCoin: 3,   speed: 0.48, erratic: 0.25, weight: 8.0,  icon: "🐠", meshCol: 0xef4444 },
    { id: "bawal",       name: "Bawal Pipi Tembem",      rarity: "Common",   col: "#f9a8d4", accent: "#ec4899", shape: "round",   minKg: 0.8,  maxKg: 3.6,  baseCoin: 4,   speed: 0.50, erratic: 0.26, weight: 7.5,  icon: "🐡", meshCol: 0xf472b6 },
    { id: "cere",        name: "Ikan Cere Gang Sempit",  rarity: "Common",   col: "#a3e635", accent: "#65a30d", shape: "chubby",  minKg: 0.1,  maxKg: 0.5,  baseCoin: 2,   speed: 0.38, erratic: 0.16, weight: 8.5,  icon: "🐟", meshCol: 0x84cc16 },
    { id: "sepat",       name: "Sepat Rawa Antapani",    rarity: "Common",   col: "#38bdf8", accent: "#0284c7", shape: "round",   minKg: 0.4,  maxKg: 1.6,  baseCoin: 3,   speed: 0.44, erratic: 0.21, weight: 7.0,  icon: "🐠", meshCol: 0x38bdf8 },
    { id: "betok",       name: "Betok Galak Cihampelas", rarity: "Common",   col: "#4ade80", accent: "#16a34a", shape: "chubby",  minKg: 0.5,  maxKg: 1.9,  baseCoin: 3,   speed: 0.49, erratic: 0.26, weight: 6.5,  icon: "🐟", meshCol: 0x22c55e },
    { id: "gabuscilik",  name: "Gabus Cilik Cimahi",     rarity: "Common",   col: "#94a3b8", accent: "#1e293b", shape: "eel",     minKg: 0.8,  maxKg: 2.8,  baseCoin: 4,   speed: 0.52, erratic: 0.28, weight: 6.0,  icon: "🐟", meshCol: 0x64748b },
    // Uncommon (9)
    { id: "kancra",      name: "Ikan Mas Kancra",        rarity: "Uncommon", col: "#fbbf24", accent: "#d97706", shape: "chubby",  minKg: 1.5,  maxKg: 6.5,  baseCoin: 6,   speed: 0.62, erratic: 0.36, weight: 3.0,  icon: "🐡", meshCol: 0xf59e0b },
    { id: "gurame",      name: "Gurame Soang",           rarity: "Uncommon", col: "#a78bfa", accent: "#7c3aed", shape: "round",   minKg: 2.0,  maxKg: 8.0,  baseCoin: 7,   speed: 0.68, erratic: 0.38, weight: 2.8,  icon: "🐟", meshCol: 0x8b5cf6 },
    { id: "patin",       name: "Patin Kumis Lembang",    rarity: "Uncommon", col: "#60a5fa", accent: "#2563eb", shape: "whisker", minKg: 2.2,  maxKg: 9.0,  baseCoin: 8,   speed: 0.72, erratic: 0.42, weight: 2.6,  icon: "🐟", meshCol: 0x3b82f6 },
    { id: "cupang",      name: "Cupang Pelangi Braga",   rarity: "Uncommon", col: "#f43f5e", accent: "#38bdf8", shape: "fancy",   minKg: 0.3,  maxKg: 1.1,  baseCoin: 9,   speed: 0.76, erratic: 0.48, weight: 2.4,  icon: "🐠", meshCol: 0xf43f5e },
    { id: "tawes",       name: "Tawes Perak Arcamanik",  rarity: "Uncommon", col: "#cbd5e1", accent: "#64748b", shape: "chubby",  minKg: 1.2,  maxKg: 4.5,  baseCoin: 6,   speed: 0.60, erratic: 0.34, weight: 2.5,  icon: "🐟", meshCol: 0xcbd5e1 },
    { id: "baung",       name: "Baung Sungai Citarum",   rarity: "Uncommon", col: "#d97706", accent: "#78350f", shape: "whisker", minKg: 1.8,  maxKg: 7.2,  baseCoin: 8,   speed: 0.70, erratic: 0.40, weight: 2.2,  icon: "🐟", meshCol: 0xd97706 },
    { id: "nilem",       name: "Nilem Pipi Chubby",      rarity: "Uncommon", col: "#fb7185", accent: "#be123c", shape: "round",   minKg: 1.0,  maxKg: 3.9,  baseCoin: 7,   speed: 0.65, erratic: 0.37, weight: 2.2,  icon: "🐠", meshCol: 0xfb7185 },
    { id: "guppy",       name: "Guppy Neon Taman Vanda", rarity: "Uncommon", col: "#2dd4bf", accent: "#f472b6", shape: "fancy",   minKg: 0.2,  maxKg: 0.8,  baseCoin: 9,   speed: 0.74, erratic: 0.46, weight: 2.0,  icon: "🐠", meshCol: 0x2dd4bf },
    { id: "lemon",       name: "Ikan Lemon Setiabudi",   rarity: "Uncommon", col: "#fde047", accent: "#eab308", shape: "chubby",  minKg: 0.6,  maxKg: 2.1,  baseCoin: 8,   speed: 0.69, erratic: 0.41, weight: 2.0,  icon: "🐠", meshCol: 0xfde047 },
    // Rare (7)
    { id: "koi",         name: "Koi Kohaku Gasibu",      rarity: "Rare",     col: "#fb923c", accent: "#ffffff", shape: "koi",     minKg: 2.5,  maxKg: 11.0, baseCoin: 12,  speed: 0.85, erratic: 0.52, weight: 1.1,  icon: "🎏", meshCol: 0xf97316 },
    { id: "belut",       name: "Belut Listrik Pasupati", rarity: "Rare",     col: "#38bdf8", accent: "#fde047", shape: "eel",     minKg: 1.8,  maxKg: 9.5,  baseCoin: 14,  speed: 0.96, erratic: 0.64, weight: 1.0,  icon: "⚡", meshCol: 0x38bdf8 },
    { id: "buntal",      name: "Ikan Buntal Pipi Merah", rarity: "Rare",     col: "#fde047", accent: "#fb7185", shape: "puffer",  minKg: 1.0,  maxKg: 4.5,  baseCoin: 16,  speed: 0.92, erratic: 0.58, weight: 0.9,  icon: "🐡", meshCol: 0xfacc15 },
    { id: "maskoki",     name: "Mas Koki Panda Punclut", rarity: "Rare",     col: "#f8fafc", accent: "#1e293b", shape: "round",   minKg: 0.9,  maxKg: 3.8,  baseCoin: 18,  speed: 0.94, erratic: 0.60, weight: 0.85, icon: "🐠", meshCol: 0xf8fafc },
    { id: "oscar",       name: "Oscar Batik Bandung",    rarity: "Rare",     col: "#1e293b", accent: "#f97316", shape: "koi",     minKg: 2.0,  maxKg: 8.5,  baseCoin: 15,  speed: 0.90, erratic: 0.56, weight: 0.85, icon: "🐠", meshCol: 0xf97316 },
    { id: "louhan",      name: "Louhan Jenong Cikutra",  rarity: "Rare",     col: "#f43f5e", accent: "#fde047", shape: "round",   minKg: 1.5,  maxKg: 5.5,  baseCoin: 17,  speed: 0.95, erratic: 0.62, weight: 0.80, icon: "🐡", meshCol: 0xf43f5e },
    { id: "toman",       name: "Toman Loreng Ciwidey",   rarity: "Rare",     col: "#10b981", accent: "#064e3b", shape: "eel",     minKg: 4.0,  maxKg: 15.0, baseCoin: 18,  speed: 0.98, erratic: 0.65, weight: 0.75, icon: "🐟", meshCol: 0x10b981 },
    // Epic (5)
    { id: "arwana",      name: "Arwana Sunda Perak",     rarity: "Epic",     col: "#e879f9", accent: "#a855f7", shape: "fancy",   minKg: 4.5,  maxKg: 18.0, baseCoin: 25,  speed: 1.15, erratic: 0.75, weight: 0.45, icon: "🐉", meshCol: 0xe879f9 },
    { id: "koinaga",     name: "Koi Naga Emas",          rarity: "Epic",     col: "#f59e0b", accent: "#fef08a", shape: "koi",     minKg: 5.0,  maxKg: 22.0, baseCoin: 30,  speed: 1.24, erratic: 0.80, weight: 0.40, icon: "🐲", meshCol: 0xfbbf24 },
    { id: "axolotl",     name: "Axolotl Pink Tangkuban", rarity: "Epic",     col: "#f472b6", accent: "#fbcfe8", shape: "axolotl", minKg: 1.2,  maxKg: 4.2,  baseCoin: 35,  speed: 1.20, erratic: 0.78, weight: 0.35, icon: "🌸", meshCol: 0xf472b6 },
    { id: "pari",        name: "Pari Polkadot Lembang",  rarity: "Epic",     col: "#818cf8", accent: "#e0e7ff", shape: "round",   minKg: 6.0,  maxKg: 24.0, baseCoin: 32,  speed: 1.22, erratic: 0.76, weight: 0.35, icon: "🛸", meshCol: 0x818cf8 },
    { id: "hiucilik",    name: "Hiu Cilik Lucu Dago",    rarity: "Epic",     col: "#38bdf8", accent: "#f8fafc", shape: "whale",   minKg: 7.0,  maxKg: 26.0, baseCoin: 36,  speed: 1.26, erratic: 0.82, weight: 0.30, icon: "🦈", meshCol: 0x38bdf8 },
    // Mythic ~1/100 (4)
    { id: "purba",       name: "Ikan Purba Cikapundung", rarity: "Mythic",   col: "#22d3ee", accent: "#0891b2", shape: "crown",   minKg: 12.0, maxKg: 42.0, baseCoin: 55,  speed: 1.48, erratic: 0.95, weight: 0.30, icon: "🦕", meshCol: 0x22d3ee },
    { id: "koisultan",   name: "Koi Sultan 24K",         rarity: "Mythic",   col: "#fde047", accent: "#f97316", shape: "crown",   minKg: 10.0, maxKg: 38.0, baseCoin: 65,  speed: 1.52, erratic: 1.00, weight: 0.25, icon: "👑", meshCol: 0xfacc15 },
    { id: "pausmini",    name: "Paus Mini Awan Bandung", rarity: "Mythic",   col: "#7dd3fc", accent: "#e0f2fe", shape: "whale",   minKg: 16.0, maxKg: 55.0, baseCoin: 75,  speed: 1.56, erratic: 0.96, weight: 0.25, icon: "🐳", meshCol: 0x7dd3fc },
    { id: "nagalangit",  name: "Naga Air Siliwangi",     rarity: "Mythic",   col: "#34d399", accent: "#fde047", shape: "crown",   minKg: 20.0, maxKg: 68.0, baseCoin: 85,  speed: 1.62, erratic: 1.05, weight: 0.20, icon: "🐲", meshCol: 0x34d399 },
    // Secret ~1/1.000 (2)
    { id: "kudanil",     name: "Kuda Laut Kristal Kawah",rarity: "Secret",   col: "#2dd4bf", accent: "#99f6e4", shape: "crown",   minKg: 8.0,  maxKg: 30.0, baseCoin: 120, speed: 1.68, erratic: 1.08, weight: 0.05, icon: "🦄", meshCol: 0x2dd4bf },
    { id: "axogold",     name: "Axolotl Emas Keramat",   rarity: "Secret",   col: "#fbbf24", accent: "#fef08a", shape: "axolotl", minKg: 5.0,  maxKg: 18.0, baseCoin: 150, speed: 1.72, erratic: 1.10, weight: 0.05, icon: "✨", meshCol: 0xfbbf24 },
    // Cosmic ~1/10.000 (2)
    { id: "pausgalaxy",  name: "Paus Galaksi Bosscha",   rarity: "Cosmic",   col: "#a855f7", accent: "#f0abfc", shape: "whale",   minKg: 35.0, maxKg: 99.0, baseCoin: 250, speed: 1.80, erratic: 1.15, weight: 0.005,icon: "🌌", meshCol: 0xa855f7 },
    { id: "koinova",     name: "Koi Supernova Parahyangan",rarity:"Cosmic",  col: "#f43f5e", accent: "#fde047", shape: "crown",   minKg: 28.0, maxKg: 88.0, baseCoin: 300, speed: 1.85, erratic: 1.18, weight: 0.005,icon: "🌠", meshCol: 0xf43f5e },
    // Divine ~1/100.000 (1)
    { id: "rajasamudra", name: "Raja Samudra Bandung",   rarity: "Divine",   col: "#fde047", accent: "#38bdf8", shape: "crown",   minKg: 50.0, maxKg: 150.0,baseCoin: 500, speed: 1.95, erratic: 1.25, weight: 0.001,icon: "🔱", meshCol: 0xfde047 }
  ];

  const DISTRICT_EXCLUSIVE_FISH = {
    sumur_bandung:    { id: "ex_sumur",    districtName: "Sumur Bandung",    name: "Koi Heritage Braga",         rarity: "Mythic", col: "#38bdf8", accent: "#fde047", shape: "crown",   minKg: 12, maxKg: 40,  baseCoin: 75,  speed: 1.52, erratic: 0.98, weight: 0.45, icon: "🎭", meshCol: 0x38bdf8 },
    lengkong:         { id: "ex_lengkong", districtName: "Lengkong",         name: "Lele Pedas Burangrang",      rarity: "Mythic", col: "#f97316", accent: "#ef4444", shape: "whisker", minKg: 10, maxKg: 36,  baseCoin: 70,  speed: 1.50, erratic: 0.96, weight: 0.45, icon: "🍜", meshCol: 0xf97316 },
    regol:            { id: "ex_regol",    districtName: "Regol",            name: "Ikan Suci Alun-Alun",        rarity: "Divine", col: "#fde047", accent: "#22c55e", shape: "crown",   minKg: 45, maxKg: 130, baseCoin: 480, speed: 1.92, erratic: 1.22, weight: 0.008,icon: "🕌", meshCol: 0xfde047 },
    batununggal:      { id: "ex_batu",     districtName: "Batununggal",      name: "Naga Neon Laswi",            rarity: "Secret", col: "#a855f7", accent: "#38bdf8", shape: "crown",   minKg: 18, maxKg: 58,  baseCoin: 145, speed: 1.68, erratic: 1.08, weight: 0.08, icon: "🏢", meshCol: 0xa855f7 },
    kiaracondong:     { id: "ex_kircon",   districtName: "Kiaracondong",     name: "Belut Express Kircon",       rarity: "Mythic", col: "#ec4899", accent: "#f8fafc", shape: "eel",     minKg: 14, maxKg: 44,  baseCoin: 80,  speed: 1.58, erratic: 1.02, weight: 0.45, icon: "🚆", meshCol: 0xec4899 },
    coblong:          { id: "ex_coblong",  districtName: "Coblong",          name: "Axolotl Sarjana ITB",        rarity: "Secret", col: "#3b82f6", accent: "#fde047", shape: "axolotl", minKg: 8,  maxKg: 26,  baseCoin: 155, speed: 1.70, erratic: 1.08, weight: 0.08, icon: "🎓", meshCol: 0x3b82f6 },
    cidadap:          { id: "ex_cidadap",  districtName: "Cidadap",          name: "Paus Kabut Punclut",         rarity: "Cosmic", col: "#16a34a", accent: "#e0f2fe", shape: "whale",   minKg: 32, maxKg: 95,  baseCoin: 260, speed: 1.82, erratic: 1.15, weight: 0.02, icon: "🌲", meshCol: 0x16a34a },
    sukasari:         { id: "ex_sukasari", districtName: "Sukasari",         name: "Koi Isola Biru",             rarity: "Mythic", col: "#0ea5e9", accent: "#e0f2fe", shape: "koi",     minKg: 11, maxKg: 35,  baseCoin: 72,  speed: 1.48, erratic: 0.95, weight: 0.45, icon: "🏫", meshCol: 0x0ea5e9 },
    sukajadi:         { id: "ex_sukajadi", districtName: "Sukajadi",         name: "Ikan Sultan PVJ",            rarity: "Secret", col: "#f43f5e", accent: "#fde047", shape: "crown",   minKg: 15, maxKg: 48,  baseCoin: 150, speed: 1.66, erratic: 1.06, weight: 0.08, icon: "🛍️", meshCol: 0xf43f5e },
    cibeunying_kaler: { id: "ex_cibkal",   districtName: "Cibeunying Kaler", name: "Naga Pelukis Cigadung",      rarity: "Cosmic", col: "#eab308", accent: "#f472b6", shape: "crown",   minKg: 28, maxKg: 85,  baseCoin: 270, speed: 1.80, erratic: 1.14, weight: 0.02, icon: "🎨", meshCol: 0xeab308 },
    cibeunying_kidul: { id: "ex_cibkid",   districtName: "Cibeunying Kidul", name: "Ikan Angklung Udjo",         rarity: "Mythic", col: "#14b8a6", accent: "#fde047", shape: "fancy",   minKg: 12, maxKg: 38,  baseCoin: 78,  speed: 1.54, erratic: 0.98, weight: 0.45, icon: "🎸", meshCol: 0x14b8a6 },
    antapani:         { id: "ex_antapani", districtName: "Antapani",         name: "Ikan Pelangi Antapani",      rarity: "Secret", col: "#f59e0b", accent: "#38bdf8", shape: "fancy",   minKg: 14, maxKg: 42,  baseCoin: 140, speed: 1.65, erratic: 1.05, weight: 0.08, icon: "🌉", meshCol: 0xf59e0b },
    arcamanik:        { id: "ex_arcamanik",districtName: "Arcamanik",        name: "Juara Emas Arcamanik",       rarity: "Mythic", col: "#22c55e", accent: "#fde047", shape: "crown",   minKg: 13, maxKg: 41,  baseCoin: 80,  speed: 1.56, erratic: 1.00, weight: 0.45, icon: "🏟️", meshCol: 0x22c55e },
    mandalajati:      { id: "ex_mandala",  districtName: "Mandalajati",      name: "Paus Bintang Moko",          rarity: "Cosmic", col: "#10b981", accent: "#fde047", shape: "whale",   minKg: 30, maxKg: 92,  baseCoin: 280, speed: 1.84, erratic: 1.16, weight: 0.02, icon: "⛰️", meshCol: 0x10b981 },
    ujungberung:      { id: "ex_ujber",    districtName: "Ujungberung",      name: "Naga Benjang Ujungberung",   rarity: "Secret", col: "#ef4444", accent: "#fde047", shape: "crown",   minKg: 16, maxKg: 52,  baseCoin: 155, speed: 1.70, erratic: 1.08, weight: 0.08, icon: "🥁", meshCol: 0xef4444 },
    cinambo:          { id: "ex_cinambo",  districtName: "Cinambo",          name: "Robot Koi Cinambo",          rarity: "Mythic", col: "#64748b", accent: "#38bdf8", shape: "koi",     minKg: 14, maxKg: 46,  baseCoin: 76,  speed: 1.50, erratic: 0.96, weight: 0.45, icon: "🏭", meshCol: 0x64748b },
    panyileukan:      { id: "ex_panyi",    districtName: "Panyileukan",      name: "Koi Gerbang Timur",          rarity: "Mythic", col: "#06b6d4", accent: "#f8fafc", shape: "koi",     minKg: 12, maxKg: 39,  baseCoin: 74,  speed: 1.49, erratic: 0.95, weight: 0.45, icon: "🏡", meshCol: 0x06b6d4 },
    cibiru:           { id: "ex_cibiru",   districtName: "Cibiru",           name: "Ikan Cendekia Cibiru",       rarity: "Secret", col: "#8b5cf6", accent: "#e0e7ff", shape: "crown",   minKg: 15, maxKg: 45,  baseCoin: 148, speed: 1.68, erratic: 1.06, weight: 0.08, icon: "📚", meshCol: 0x8b5cf6 },
    gedebage:         { id: "ex_gedebage", districtName: "Gedebage",         name: "Sang Al Jabbar Divine",      rarity: "Divine", col: "#facc15", accent: "#38bdf8", shape: "crown",   minKg: 55, maxKg: 160, baseCoin: 520, speed: 1.96, erratic: 1.25, weight: 0.008,icon: "⚽", meshCol: 0xfacc15 },
    rancasari:        { id: "ex_ranca",    districtName: "Rancasari",        name: "Buntal Rawa Ciwastra",       rarity: "Mythic", col: "#22c55e", accent: "#fde047", shape: "puffer",  minKg: 11, maxKg: 36,  baseCoin: 72,  speed: 1.50, erratic: 0.98, weight: 0.45, icon: "🌿", meshCol: 0x22c55e },
    buahbatu:         { id: "ex_bubat",    districtName: "Buahbatu",         name: "Koi Turbo Tol Buahbatu",     rarity: "Secret", col: "#3b82f6", accent: "#f43f5e", shape: "koi",     minKg: 16, maxKg: 50,  baseCoin: 150, speed: 1.72, erratic: 1.10, weight: 0.08, icon: "🚗", meshCol: 0x3b82f6 },
    bandung_kidul:    { id: "ex_bkidul",   districtName: "Bandung Kidul",    name: "Naga Hijau Mengger",         rarity: "Mythic", col: "#14b8a6", accent: "#bbf7d0", shape: "crown",   minKg: 13, maxKg: 42,  baseCoin: 78,  speed: 1.54, erratic: 0.99, weight: 0.45, icon: "🏞️", meshCol: 0x14b8a6 },
    cicendo:          { id: "ex_cicendo",  districtName: "Cicendo",          name: "Ikan Jet Husein",            rarity: "Cosmic", col: "#38bdf8", accent: "#f8fafc", shape: "whale",   minKg: 34, maxKg: 98,  baseCoin: 275, speed: 1.86, erratic: 1.16, weight: 0.02, icon: "✈️", meshCol: 0x38bdf8 },
    andir:            { id: "ex_andir",    districtName: "Andir",            name: "Lampion Emas Cibadak",       rarity: "Secret", col: "#ef4444", accent: "#fde047", shape: "round",   minKg: 14, maxKg: 44,  baseCoin: 145, speed: 1.66, erratic: 1.05, weight: 0.08, icon: "🏮", meshCol: 0xef4444 },
    astanaanyar:      { id: "ex_astana",   districtName: "Astanaanyar",      name: "Api Bandung Lautan Api",     rarity: "Divine", col: "#f97316", accent: "#fde047", shape: "crown",   minKg: 50, maxKg: 145, baseCoin: 500, speed: 1.94, erratic: 1.24, weight: 0.008,icon: "🔥", meshCol: 0xf97316 },
    bojongloa_kaler:  { id: "ex_bojkal",   districtName: "Bojongloa Kaler",  name: "Koi Jamika Klasik",          rarity: "Mythic", col: "#eab308", accent: "#1e293b", shape: "koi",     minKg: 12, maxKg: 38,  baseCoin: 74,  speed: 1.50, erratic: 0.96, weight: 0.45, icon: "👞", meshCol: 0xeab308 },
    bojongloa_kidul:  { id: "ex_bojkid",   districtName: "Bojongloa Kidul",  name: "Sepatu Emas Cibaduyut",      rarity: "Secret", col: "#fde047", accent: "#d97706", shape: "boot",    minKg: 10, maxKg: 30,  baseCoin: 165, speed: 1.68, erratic: 1.06, weight: 0.08, icon: "👠", meshCol: 0xfde047 },
    babakan_ciparay:  { id: "ex_bacip",    districtName: "Babakan Ciparay",  name: "Paus Terminal Leuwipanjang", rarity: "Mythic", col: "#0ea5e9", accent: "#bae6fd", shape: "whale",   minKg: 18, maxKg: 54,  baseCoin: 85,  speed: 1.56, erratic: 1.00, weight: 0.45, icon: "🚌", meshCol: 0x0ea5e9 },
    bandung_kulon:    { id: "ex_bkulon",   districtName: "Bandung Kulon",    name: "Naga Tol Pasirkoja",         rarity: "Cosmic", col: "#6366f1", accent: "#fde047", shape: "crown",   minKg: 32, maxKg: 94,  baseCoin: 265, speed: 1.82, erratic: 1.15, weight: 0.02, icon: "🛣️", meshCol: 0x6366f1 }
  };
  const ALL_FISH_CATALOG = FISH_CATALOG.concat(Object.values(DISTRICT_EXCLUSIVE_FISH));

  function renderFishArt(fishOrItem, size) {
    const f = ALL_FISH_CATALOG.find(x => x.id === fishOrItem.id) || fishOrItem || {};
    const sz = size || 44;
    const c = f.col || "#38bdf8";
    const ac = f.accent || "#0284c7";
    const sh = f.shape || "chubby";

    if (sh === "boot") {
      return `<svg width="${sz}" height="${sz}" viewBox="0 0 64 64" style="display:inline-block;vertical-align:middle;">
        <path d="M22 14h16v22l12 4c3 1 4 4 4 7v4H18V18c0-2 2-4 4-4z" fill="#64748b" stroke="#334155" stroke-width="2.5"/>
        <rect x="17" y="47" width="38" height="6" rx="3" fill="#334155"/>
        <path d="M26 24h8M26 30h8" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    }
    if (sh === "whale") {
      return `<svg width="${sz}" height="${sz}" viewBox="0 0 64 64" style="display:inline-block;vertical-align:middle;">
        <path d="M32 10c-2-4-7-4-8 0M32 10c2-4 7-4 8 0" stroke="#bae6fd" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M12 36c0-11 9-18 22-18 11 0 18 6 18 15 0 8-6 13-16 13H20c-5 0-8-4-8-10z" fill="${c}" stroke="#0284c7" stroke-width="2"/>
        <path d="M12 36l-8-7 2 10-4 6 10-4z" fill="${c}" stroke="#0284c7" stroke-width="2"/>
        <path d="M24 46c8 0 18-1 23-6H22z" fill="${ac}"/>
        <circle cx="42" cy="31" r="3.2" fill="#0f172a"/><circle cx="43" cy="30" r="1.1" fill="#fff"/>
        <ellipse cx="38" cy="36" rx="3" ry="1.8" fill="#fb7185" opacity="0.7"/>
        <path d="M29 14l3-5 3 5 4-3-2 6h-10l-2-6z" fill="#fde047" stroke="#ca8a04" stroke-width="1.2"/>
      </svg>`;
    }
    if (sh === "axolotl") {
      return `<svg width="${sz}" height="${sz}" viewBox="0 0 64 64" style="display:inline-block;vertical-align:middle;">
        <path d="M14 26l-7-5M13 31l-8 0M14 36l-7 5M50 26l7-5M51 31l8 0M50 36l7 5" stroke="#ec4899" stroke-width="3.2" stroke-linecap="round"/>
        <ellipse cx="32" cy="34" rx="18" ry="14" fill="${c}" stroke="#db2777" stroke-width="2"/>
        <ellipse cx="32" cy="38" rx="11" ry="7" fill="${ac}" opacity="0.85"/>
        <circle cx="24" cy="31" r="3.2" fill="#0f172a"/><circle cx="25" cy="30" r="1.1" fill="#fff"/>
        <circle cx="40" cy="31" r="3.2" fill="#0f172a"/><circle cx="41" cy="30" r="1.1" fill="#fff"/>
        <path d="M29 36c2 2 4 2 6 0" stroke="#9d174d" stroke-width="2" fill="none" stroke-linecap="round"/>
        <ellipse cx="21" cy="35" rx="2.5" ry="1.5" fill="#fb7185"/>
        <ellipse cx="43" cy="35" rx="2.5" ry="1.5" fill="#fb7185"/>
      </svg>`;
    }
    const isPuffer = sh === "puffer";
    const isCrown = sh === "crown";
    const isWhisker = sh === "whisker";
    const isEel = sh === "eel";
    const ry = isPuffer ? 17 : (sh === "round" ? 15 : 13);
    const rx = isEel ? 20 : (isPuffer ? 17 : 18);
    return `<svg width="${sz}" height="${sz}" viewBox="0 0 64 64" style="display:inline-block;vertical-align:middle;">
      ${isPuffer ? `<path d="M32 11l3 5M32 53l3-5M15 20l4 3M49 20l-4 3M15 44l4-3M49 44l-4-3" stroke="${ac}" stroke-width="2.5" stroke-linecap="round"/>` : ""}
      <path d="M15 32l-10-9v18z" fill="${ac}" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M26 19c2-7 10-7 12 0" fill="${ac}" stroke="#0f172a" stroke-width="1.5"/>
      <ellipse cx="34" cy="32" rx="${rx}" ry="${ry}" fill="${c}" stroke="#0f172a" stroke-width="2"/>
      ${sh === "koi" ? `<circle cx="30" cy="28" r="5" fill="${ac}" opacity="0.9"/><circle cx="41" cy="34" r="4" fill="${ac}" opacity="0.9"/>` : `<ellipse cx="32" cy="36" rx="9" ry="5" fill="${ac}" opacity="0.32"/>`}
      ${isWhisker ? `<path d="M51 34c4 1 6 4 6 6M50 37c3 2 4 5 3 7" stroke="#0f172a" stroke-width="1.8" fill="none" stroke-linecap="round"/>` : ""}
      <circle cx="43" cy="29" r="3.4" fill="#0f172a"/><circle cx="44" cy="28" r="1.2" fill="#fff"/>
      <ellipse cx="39" cy="34" rx="2.8" ry="1.6" fill="#fb7185" opacity="0.75"/>
      <path d="M46 35c1.5 1.5 3.5 1.5 4.5 0" stroke="#0f172a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${isCrown ? `<path d="M28 18l3-6 3 5 3-5 3 6z" fill="#fde047" stroke="#ca8a04" stroke-width="1.3"/>` : ""}
    </svg>`;
  }

  const RARITY_STYLE = {
    Common:   { bg: "#334155", fg: "#e2e8f0", border: "#64748b", odds: "" },
    Uncommon: { bg: "#065f46", fg: "#6ee7b7", border: "#10b981", odds: "" },
    Rare:     { bg: "#1e3a8a", fg: "#93c5fd", border: "#3b82f6", odds: "" },
    Epic:     { bg: "#581c87", fg: "#f0abfc", border: "#d946ef", odds: "" },
    Mythic:   { bg: "#78350f", fg: "#fde047", border: "#facc15", odds: "1/100" },
    Secret:   { bg: "#064e3b", fg: "#5eead4", border: "#14b8a6", odds: "1/1.000" },
    Cosmic:   { bg: "#4c1d95", fg: "#f5d0fe", border: "#c084fc", odds: "1/10.000" },
    Divine:   { bg: "#713f12", fg: "#fef08a", border: "#fde047", odds: "1/100.000" }
  };

  const MUTATIONS = [
    { id: "shiny",    label: "✨ Shiny",    mult: 1.5 },
    { id: "electric", label: "⚡ Electric", mult: 1.8 },
    { id: "giant",    label: "👑 Giant",    mult: 2.2 }
  ];

  function getUserSuf() {
    const ig = (localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase().replace(/^@/, "");
    return ig ? "_" + ig : "_guest";
  }

  function loadJson(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (_) { return fallback; }
  }

  let _cachedBagLen = null;
  let _cachedItemLen = null;
  let _fishCloudSyncTimer = null;

  function markLocalFishTs() {
    try { localStorage.setItem("piraku_fish_sync_ts" + getUserSuf(), String(Date.now())); } catch (_) {}
  }

  function syncFishingToCloud(immediate) {
    const ig = (localStorage.getItem("piraku_my_ig") || "").trim().toLowerCase().replace(/^@/, "");
    if (!ig) return;
    const doFlush = () => {
      _fishCloudSyncTimer = null;
      if (!window.PirakuEconomy || typeof window.PirakuEconomy.getState !== "function") return;
      const ecoState = window.PirakuEconomy.getState();
      if (!ecoState || !ecoState._hydrated || !Array.isArray(ecoState.owned)) return;
      const payload = {
        ts: Date.now(),
        bag: getBag(),
        itemBag: getItemBag(),
        dex: getDex(),
        rods: getOwnedRods(),
        rodEq: getEquippedRodId(),
        bobbers: getOwnedBobbers(),
        bobberEq: getEquippedBobberId(),
        best: loadJson("piraku_fish_best" + getUserSuf(), null)
      };
      ecoState.owned = ecoState.owned.filter(tag => !String(tag || "").startsWith("fish_sync_v1:"));
      ecoState.owned.push("fish_sync_v1:" + JSON.stringify(payload));
      if (typeof window.PirakuEconomy.saveNow === "function") window.PirakuEconomy.saveNow();
    };
    clearTimeout(_fishCloudSyncTimer);
    if (immediate) {
      doFlush();
      return;
    }
    _fishCloudSyncTimer = setTimeout(doFlush, 15000);
  }
  window.addEventListener("pagehide", () => { if (_fishCloudSyncTimer) syncFishingToCloud(true); });

  window.refreshPirakuFishingForCurrentUser = function () {
    _cachedBagLen = null;
    _cachedItemLen = null;
    getBag();
    getItemBag();
    const modal = document.getElementById("piraku-fishing-modal");
    if (modal && modal.style.display === "flex" && typeof window.openFishingHubModal === "function") {
      window.openFishingHubModal();
    }
  };
  window.syncPirakuFishingToCloud = syncFishingToCloud;

  function getBag() {
    const arr = loadJson("piraku_fish_bag" + getUserSuf(), []);
    _cachedBagLen = arr.length;
    return arr;
  }
  function getItemBag() {
    const arr = loadJson("piraku_item_bag" + getUserSuf(), []);
    _cachedItemLen = arr.length;
    return arr;
  }
  function saveItemBag(arr) {
    const trimmed = arr.slice(0, 1000);
    _cachedItemLen = trimmed.length;
    localStorage.setItem("piraku_item_bag" + getUserSuf(), JSON.stringify(trimmed));
    markLocalFishTs();
    syncFishingToCloud();
  }
  function getBagLen() {
    if (_cachedBagLen === null) getBag();
    if (_cachedItemLen === null) getItemBag();
    return (_cachedBagLen || 0) + (_cachedItemLen || 0);
  }
  function saveBag(bag) {
    const trimmed = bag.slice(0, 1000);
    _cachedBagLen = trimmed.length;
    localStorage.setItem("piraku_fish_bag" + getUserSuf(), JSON.stringify(trimmed));
    markLocalFishTs();
    syncFishingToCloud();
  }
  window.addPirakuBagItem = function (item) {
    if (!item) return;
    const arr = getItemBag();
    arr.unshift({
      uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      id: item.id,
      name: item.name,
      icon: item.icon || "🍱",
      boostSec: item.boostSec || 25,
      desc: item.desc || ""
    });
    saveItemBag(arr);
  };
  window.usePirakuBagItem = function (idx) {
    const arr = getItemBag();
    const item = arr[idx];
    if (!item) return;
    arr.splice(idx, 1);
    saveItemBag(arr);
    window.pirakuSpeedBoostUntil = Math.max(window.pirakuSpeedBoostUntil || 0, Date.now()) + (item.boostSec || 25) * 1000;
    if (typeof window.playSynthTone === "function") window.playSynthTone(660, "triangle", 0.16);
    if (typeof window.showToast === "function") {
      window.showToast(`${item.icon} Nyam! Makan ${item.name} dari tas — ngebut +${item.boostSec || 25}d!`);
    }
    window.openFishingHubModal();
  };
  function getDex() { return loadJson("piraku_fish_dex" + getUserSuf(), {}); }
  function saveDex(dex) {
    localStorage.setItem("piraku_fish_dex" + getUserSuf(), JSON.stringify(dex));
    markLocalFishTs();
    syncFishingToCloud();
  }
  function getOwnedRods() {
    const arr = loadJson("piraku_fish_rods" + getUserSuf(), ["bamboo"]);
    return Array.isArray(arr) && arr.length ? arr : ["bamboo"];
  }
  function saveOwnedRods(arr) {
    localStorage.setItem("piraku_fish_rods" + getUserSuf(), JSON.stringify(arr));
    markLocalFishTs();
    syncFishingToCloud();
  }
  function getEquippedRodId() { return localStorage.getItem("piraku_fish_rod_eq" + getUserSuf()) || "bamboo"; }
  function setEquippedRodId(id) {
    localStorage.setItem("piraku_fish_rod_eq" + getUserSuf(), id);
    markLocalFishTs();
    syncFishingToCloud();
  }
  function getEquippedRod() { return RODS.find(r => r.id === getEquippedRodId()) || RODS[0]; }

  function getOwnedBobbers() {
    const arr = loadJson("piraku_fish_bobbers" + getUserSuf(), ["classic"]);
    return Array.isArray(arr) && arr.length ? arr : ["classic"];
  }
  function saveOwnedBobbers(arr) {
    localStorage.setItem("piraku_fish_bobbers" + getUserSuf(), JSON.stringify(arr));
    markLocalFishTs();
    syncFishingToCloud();
  }
  function getEquippedBobberId() { return localStorage.getItem("piraku_fish_bobber_eq" + getUserSuf()) || "classic"; }
  function setEquippedBobberId(id) {
    localStorage.setItem("piraku_fish_bobber_eq" + getUserSuf(), id);
    markLocalFishTs();
    syncFishingToCloud();
  }
  function getEquippedBobber() { return BOBBERS.find(b => b.id === getEquippedBobberId()) || BOBBERS[0]; }

  function getActivePond() {
    if (window.pirakuInDistrict) {
      return { name: "Kolam Mancing Kecamatan", x: 42.0, z: 10.2, waterY: 0.12, radius: 12.5, spotX: 42.0, spotZ: 13.5 };
    }
    return { name: "Danau Taman Lansia", x: 39, z: 18.0, waterY: 0.12, radius: 17.5, spotX: 33.5, spotZ: 16.0 };
  }

  function isNearKopdes() {
    const pm = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (!pm || !pm.position) return false;
    if (window.pirakuInDistrict) {
      return Math.hypot(pm.position.x - 34.0, pm.position.z - (-9.0)) < 11.5;
    }
    return Math.hypot(pm.position.x - 34.5, pm.position.z - (-18.5)) < 11.5;
  }

  function isPlayerOnPier(px, pz) {
    if (window.pirakuInDistrict) {
      // Dermaga Kolam Mancing Kecamatan (world x: 40.4..43.6, z: 10.9..16.1)
      return px >= 40.4 && px <= 43.6 && pz >= 10.9 && pz <= 16.1;
    }
    // Dermaga panjang Taman Lansia (world x: 27.5..35.5, z: 14.5..17.5)
    return px >= 27.5 && px <= 35.5 && pz >= 14.5 && pz <= 17.5;
  }

  function isPlayerInLakeWater(px, pz) {
    if (isPlayerOnPier(px, pz)) return false;
    if (window.pirakuInDistrict) {
      return Math.hypot(px - 42.0, pz - 9.9) < 5.45 || Math.hypot(px - 45.2, pz - 10.4) < 3.65 || Math.hypot(px - 39.4, pz - 9.7) < 3.45;
    }
    const inMain = Math.hypot(px - 39.0, pz - 15.0) < 5.85;
    const inEast = Math.hypot(px - 44.5, pz - 14.5) < 4.65;
    const inSouth1 = Math.hypot(px - 40.0, pz - 22.0) < 6.05;
    const inSouth2 = Math.hypot(px - 43.5, pz - 26.2) < 4.65;
    return inMain || inEast || inSouth1 || inSouth2;
  }

  const lansiaRocks = [];
  const districtRocks = [];
  const npcAnglerList = [];
  const rareVfxParticles = [];

  function createNpcLabelSprite(text, bgCol, textCol, borderCol) {
    const cv = document.createElement("canvas");
    cv.width = 256; cv.height = 56;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = bgCol || "rgba(3, 105, 161, 0.92)";
    ctx.beginPath(); ctx.roundRect(6, 6, 244, 44, 22); ctx.fill();
    ctx.strokeStyle = borderCol || "#38bdf8"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = textCol || "#f8fafc";
    ctx.font = "900 20px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 29);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false }));
    spr.scale.set(2.1, 0.46, 1);
    spr.position.set(0, 2.25, 0);
    return spr;
  }

  function attachNpcClickHitbox(parentGrp, sizeArr, info) {
    const hb = new THREE.Mesh(new THREE.BoxGeometry(sizeArr[0], sizeArr[1], sizeArr[2]), new THREE.MeshBasicMaterial({ visible: false }));
    hb.position.set(0, sizeArr[1] * 0.5, 0);
    hb.userData = {
      ig: info.name,
      npcBadge: info.badge,
      kecamatan: info.kec,
      wish: info.wish,
      tips: info.tips || null,
      upvotes: info.upvotes || 15,
      x: info.wx,
      z: info.wz,
      meshGroup: parentGrp
    };
    parentGrp.add(hb);
    if (Array.isArray(window.pirakuClickableObjects)) {
      window.pirakuClickableObjects.push(hb);
    }
  }

  function buildSmoothNpcFigure(shirtCol, hatCol, isVendor) {
    const fig = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.68 });
    const shirt = new THREE.MeshStandardMaterial({ color: shirtCol || 0x2563eb, roughness: 0.72 });
    const pants = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });

    // Kaki & sepatu bulat rapi
    [-0.1, 0.1].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.062, 0.44, 10), pants);
      leg.position.set(lx, 0.22, 0);
      const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), shoeMat);
      shoe.scale.set(0.95, 0.65, 1.35);
      shoe.position.set(lx, 0.04, 0.03);
      fig.add(leg, shoe);
    });

    // Badan silinder halus + kerah/celemek
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.23, 0.54, 14), shirt);
    torso.position.set(0, 0.71, 0);
    fig.add(torso);
    if (isVendor) {
      const apron = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.235, 0.42, 12, 1, false, -0.9, 1.8), new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 }));
      apron.position.set(0, 0.66, 0.01);
      fig.add(apron);
    }

    // Bahu & lengan kiri bulat
    const armL = new THREE.Group();
    armL.position.set(-0.25, 0.92, 0);
    const shL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), shirt);
    const slL = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.048, 0.38, 10), shirt);
    slL.position.y = -0.19;
    const hdL = new THREE.Mesh(new THREE.SphereGeometry(0.054, 8, 8), skin);
    hdL.position.y = -0.4;
    armL.add(shL, slL, hdL);
    fig.add(armL);

    // Lengan kanan (bisa dianimasikan)
    const armR = new THREE.Group();
    armR.position.set(0.25, 0.92, 0);
    const shR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), shirt);
    const slR = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.048, 0.38, 10), shirt);
    slR.position.y = -0.19;
    const hdR = new THREE.Mesh(new THREE.SphereGeometry(0.054, 8, 8), skin);
    hdR.position.y = -0.4;
    armR.add(shR, slR, hdR);
    fig.add(armR);

    // Kepala proporsional dengan mata, rambut, & topi bundar
    const head = new THREE.Group();
    head.position.set(0, 1.21, 0);
    head.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), skin));
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    [-0.075, 0.075].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), eyeMat);
      eye.position.set(ex, 0.02, 0.2);
      head.add(eye);
    });
    const hatMat = new THREE.MeshStandardMaterial({ color: hatCol || 0xd97706, roughness: 0.75 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.04, 16), hatMat);
    brim.position.y = 0.14;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.13, 14), hatMat);
    crown.position.y = 0.21;
    head.add(brim, crown);
    fig.add(head);

    return { fig, armR };
  }

  function createFishingNpc(label, shirtCol, x, y, z, rotY, npcInfo) {
    const g = new THREE.Group();
    const { fig, armR } = buildSmoothNpcFigure(shirtCol, 0xd97706, false);
    const rod = createFishingRodGroup(0x0284c7, false, "fiber");
    rod.position.set(0.02, -0.35, 0.14);
    armR.add(rod);
    armR.rotation.x = -0.8;
    const bob = createBobberGroup(0, -y + 0.08, 2.7, BOBBERS[1]);
    g.add(fig, bob, createNpcLabelSprite(label));
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    if (npcInfo) attachNpcClickHitbox(g, [1.4, 2.2, 1.4], { name: label, badge: "🎣 PEMANCING", ...npcInfo });
    npcAnglerList.push({ armR, phase: Math.random() * 6 });
    return g;
  }

  function createVendorNpcWithCart(label, shirtCol, x, z, rotY, npcInfo) {
    const g = new THREE.Group();
    // Gerobak Jajanan Bandung
    const cart = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 0.9), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 }));
    cart.position.set(0, 0.55, 0);
    const topCanopy = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.14, 1.05), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 }));
    topCanopy.position.set(0, 1.78, 0);
    [-0.68, 0.68].forEach(px => {
      [-0.4, 0.4].forEach(pz => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
        pole.position.set(px, 1.35, pz);
        g.add(pole);
      });
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 10), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(px * 0.7, 0.22, 0.46);
      g.add(wheel);
    });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.26, 10), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7 }));
    pot.position.set(-0.3, 1.1, 0);
    // NPC Penjual halus di belakang gerobak
    const { fig } = buildSmoothNpcFigure(shirtCol || 0xf97316, 0xf8fafc, true);
    fig.position.set(0, 0, -0.72);
    const spr = createNpcLabelSprite(label, "rgba(154, 52, 18, 0.94)", "#fef08a", "#fb923c");
    spr.position.set(0, 2.35, -0.2);
    g.add(cart, topCanopy, pot, fig, spr);
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    if (npcInfo) attachNpcClickHitbox(g, [2.0, 2.3, 1.8], { name: label, badge: "🥟 PEDAGANG", ...npcInfo });
    return g;
  }

  window.getPirakuFishingGroundY = function(px, pz) {
    if (isPlayerOnPier(px, pz)) return 0.36;
    const rocks = window.pirakuInDistrict ? districtRocks : lansiaRocks;
    let rockY = null;
    for (let i = 0; i < rocks.length; i++) {
      const rk = rocks[i];
      if (Math.hypot(px - rk.x, pz - rk.z) <= rk.r) {
        if (rockY === null || rk.topY > rockY) rockY = rk.topY;
      }
    }
    if (rockY !== null) return rockY;
    if (isPlayerInLakeWater(px, pz)) return -0.72;
    return null;
  };

  let _pondWaterTex = null;
  function getPondWaterTexture() {
    if (_pondWaterTex) return _pondWaterTex;
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 256;
    const ctx = cv.getContext("2d");

    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 150);
    grad.addColorStop(0, "#0ea5e9");
    grad.addColorStop(0.6, "#0284c7");
    grad.addColorStop(1, "#0369a1");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Pola caustics & riak air berkilau
    ctx.strokeStyle = "rgba(186, 230, 253, 0.28)";
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 22; i++) {
      const cx = (i * 59) % 256;
      const cy = (i * 97) % 256;
      const r = 16 + (i % 4) * 9;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.3, r * 0.7, (i % 5) * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(224, 242, 254, 0.24)";
    for (let j = 0; j < 28; j++) {
      const px = (j * 43 + 17) % 256;
      const py = (j * 71 + 11) % 256;
      ctx.beginPath();
      ctx.arc(px, py, (j % 3) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    _pondWaterTex = new THREE.CanvasTexture(cv);
    _pondWaterTex.wrapS = THREE.RepeatWrapping;
    _pondWaterTex.wrapT = THREE.RepeatWrapping;
    _pondWaterTex.repeat.set(3, 3);
    return _pondWaterTex;
  }

  function createLotusAndPad(hasFlower, padScale) {
    const g = new THREE.Group();
    const s = padScale || 1;
    // Daun teratai berlekuk V khas kolam koi
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52 * s, 0.52 * s, 0.03, 18, 1, false, 0, Math.PI * 1.82),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 })
    );
    pad.rotation.y = Math.random() * Math.PI * 2;
    g.add(pad);

    if (hasFlower) {
      const petalMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.35, emissive: 0xbe185d, emissiveIntensity: 0.12 });
      for (let pi = 0; pi < 6; pi++) {
        const ang = (pi / 6) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.08 * s, 0.24 * s, 6), petalMat);
        petal.position.set(Math.cos(ang) * 0.10 * s, 0.10 * s, Math.sin(ang) * 0.10 * s);
        petal.rotation.z = -Math.cos(ang) * 0.55;
        petal.rotation.x = Math.sin(ang) * 0.55;
        g.add(petal);
      }
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.065 * s, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
      center.position.y = 0.11 * s;
      g.add(center);
    }
    return g;
  }

  function createCattailReedCluster() {
    const g = new THREE.Group();
    const reedMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const h = 0.75 + (i % 3) * 0.22;
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, h, 6), reedMat);
      stalk.position.set((i - 1.5) * 0.11, h / 2, ((i % 2) - 0.5) * 0.1);
      stalk.rotation.z = (i - 1.5) * 0.08;
      g.add(stalk);
      if (i % 2 === 0) {
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.18, 8), headMat);
        head.position.set(stalk.position.x + Math.sin(-stalk.rotation.z) * (h * 0.35), h * 0.78, stalk.position.z);
        head.rotation.z = stalk.rotation.z;
        g.add(head);
      }
    }
    return g;
  }

  function createPondKoiMesh(colHex, accHex) {
    const koi = buildDetailedFishBodyMesh({
      shape: "koi",
      meshCol: colHex,
      accent: accHex,
      rarity: "Uncommon"
    }, false);
    koi.scale.setScalar(0.62);
    return koi;
  }

  // Danau Taman Lansia koordinat 1:1 presisi (bebas jalan raya, dermaga panjang 8m, & gazebo kering)
  let lansiaPondGroup = null;
  const pondKoiList = [];
  function ensureTamanLansiaPondVisible() {
    const sc = window.pirakuScene;
    if (!sc || typeof THREE === "undefined") return;
    if (!lansiaPondGroup) {
      lansiaPondGroup = new THREE.Group();
      lansiaPondGroup.position.set(39, 0, 16.0);

      const grassMat = new THREE.MeshStandardMaterial({ color: 0x3d6639, roughness: 0.92 });
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88, flatShading: true });
      const darkRockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, flatShading: true });
      const waterMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, map: getPondWaterTexture(), roughness: 0.08, metalness: 0.45, transparent: true, opacity: 0.92 });
      const shallowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.16, transparent: true, opacity: 0.62 });
      const shoreMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.95 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
      const plankMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 });

      // Cekungan Danau Organik Besar + tepian pasir/batu rapi & air dangkal pirus
      [[0, -1.0, 6.6], [5.5, -1.5, 5.4], [1.0, 6.0, 6.8], [4.5, 10.2, 5.4]].forEach(([wx, wz, wr]) => {
        const sh = new THREE.Mesh(new THREE.CircleGeometry(wr + 0.75, 28), shoreMat);
        sh.rotation.x = -Math.PI / 2; sh.position.set(wx, 0.035, wz);
        const sl = new THREE.Mesh(new THREE.CircleGeometry(wr + 0.35, 28), shallowMat);
        sl.rotation.x = -Math.PI / 2; sl.position.set(wx, 0.06, wz);
        const dp = new THREE.Mesh(new THREE.CircleGeometry(wr, 28), waterMat);
        dp.rotation.x = -Math.PI / 2; dp.position.set(wx, 0.08, wz);
        lansiaPondGroup.add(sh, sl, dp);
      });

      // Batu alam mengikuti bentuk persis kontur 4 cekungan danau (bebas jalan raya & dermaga)
      const lansiaCircles = [[0, -1.0, 6.6], [5.5, -1.5, 5.4], [1.0, 6.0, 6.8], [4.5, 10.2, 5.4]];
      let lrIdx = 0;
      lansiaCircles.forEach(([cx, cz, cr], ci) => {
        const steps = 28;
        for (let i = 0; i < steps; i++) {
          const ang = (i / steps) * Math.PI * 2;
          const rx = cx + Math.cos(ang) * (cr + 0.55);
          const rz = cz + Math.sin(ang) * (cr + 0.55);
          // Skip jika titik berada di dalam lingkaran danau lainnya (ambil kontur terluar saja)
          if (lansiaCircles.some(([ox, oz, or], oi) => oi !== ci && Math.hypot(rx - ox, rz - oz) < or + 0.2)) continue;
          // Pastikan tidak bocor ke Jl. Diponegoro (world z < 7.2) atau Jl. Sentot (world x < 26.5)
          if (39 + rx < 27.2 || 16 + rz < 7.8) continue;
          // Pastikan tidak ada batu menembus koridor dermaga atau gazebo
          if (rx >= -13.0 && rx <= -1.8 && rz >= -2.2 && rz <= 2.2) continue;
          if (Math.hypot(rx - (-9.5), rz - 11.5) < 3.4) continue;
          const rBase = 0.58 + (lrIdx % 3) * 0.12;
          const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(rBase, 0), lrIdx % 2 === 0 ? rockMat : darkRockMat);
          rk.scale.set(1.25, 0.62, 1.1);
          rk.position.set(rx, 0.22, rz);
          rk.rotation.y = lrIdx * 0.7;
          lansiaPondGroup.add(rk);
          lansiaRocks.push({ x: 39 + rx, z: 16 + rz, r: rBase * 1.45, topY: Number((0.22 + rBase * 0.58).toFixed(2)) });
          lrIdx++;
        }
      });
      // Batu pijakan rapi menuju pintu dermaga barat
      [-12.4, -13.4, -14.4].forEach((sx, si) => {
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 1.5), shoreMat);
        st.position.set(sx, 0.05, (si % 2 === 0 ? 0.15 : -0.15));
        lansiaPondGroup.add(st);
      });

      // Air terjun batu bertingkat di sisi timur laut (aman dari jalan)
      const wfBase = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9, 0), darkRockMat);
      wfBase.scale.set(1.25, 1.35, 1.05);
      wfBase.position.set(9.2, 1.15, -3.2);
      const wfTop = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 0), rockMat);
      wfTop.position.set(9.5, 2.4, -3.5);
      const wfStream = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.3, 0.34), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85 }));
      wfStream.position.set(8.2, 1.15, -2.4);
      wfStream.rotation.y = -0.65;
      wfStream.rotation.x = 0.25;
      lansiaPondGroup.add(wfBase, wfTop, wfStream);

      const foam = new THREE.Mesh(new THREE.CircleGeometry(1.6, 16), new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.72 }));
      foam.rotation.x = -Math.PI / 2;
      foam.position.set(7.4, 0.11, -1.8);
      lansiaPondGroup.add(foam);

      // Dermaga kayu panjang 8 meter menjorok ke tengah air (x lokal -11.5..-3.5 -> world 27.5..35.5)
      const dock = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.26, 3.0), woodMat);
      dock.position.set(-7.5, 0.2, 0);
      // Papan-papan kayu melintang & pagar samping agar terasa berdiri di atas dermaga
      for (let px = -11.2; px <= -3.7; px += 0.62) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 2.88), plankMat);
        plank.position.set(px, 0.34, 0);
        lansiaPondGroup.add(plank);
      }
      [-11.3, -7.5, -3.7].forEach(px => {
        [-1.4, 1.4].forEach(pz => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.0, 6), woodMat);
          post.position.set(px, 0.5, pz);
          lansiaPondGroup.add(post);
        });
      });
      [-1.4, 1.4].forEach(lz => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.08, 0.08), plankMat);
        rail.position.set(-7.5, 0.85, lz);
        const lPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.6, 6), woodMat);
        lPole.position.set(-3.7, 1.15, lz);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        bulb.position.set(-3.7, 1.98, lz);
        lansiaPondGroup.add(rail, lPole, bulb);
      });

      // Gazebo Santai di daratan kering barat daya (x lokal -9.5, z lokal 11.5 -> world 29.5, 27.5, bebas batu & air!)
      const gazRoofMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
      const gazBase = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0xcbd5e1 }));
      gazBase.position.set(-9.5, 0.11, 11.5);
      for (let gp = 0; gp < 6; gp++) {
        const ga = (gp / 6) * Math.PI * 2;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.1, 6), woodMat);
        post.position.set(-9.5 + Math.cos(ga) * 1.55, 1.15, 11.5 + Math.sin(ga) * 1.55);
        lansiaPondGroup.add(post);
      }
      const gazRoof = new THREE.Mesh(new THREE.ConeGeometry(2.45, 1.3, 6), gazRoofMat);
      gazRoof.position.set(-9.5, 2.85, 11.5);
      lansiaPondGroup.add(gazBase, gazRoof);

      // Semak bunga & bangku taman di daratan kering
      [[-10.2, 5.8, 0xf43f5e], [9.5, 5.2, 0xfacc15], [-4.5, 13.5, 0xa855f7], [8.8, 11.5, 0xfb923c]].forEach(([fx, fz, fCol]) => {
        const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), grassMat);
        bush.position.set(fx, 0.34, fz);
        const fl = new THREE.Mesh(new THREE.SphereGeometry(0.17, 6, 6), new THREE.MeshStandardMaterial({ color: fCol }));
        fl.position.set(fx, 0.7, fz);
        lansiaPondGroup.add(bush, fl);
      });
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.65), woodMat);
      bench.position.set(-9.8, 0.25, 4.2);
      bench.rotation.y = 0.4;
      lansiaPondGroup.add(bench);

      // Ikan-ikan koi detail berenang santai di dalam air danau
      const koiColors = [0xf97316, 0xfacc15, 0xef4444, 0xf8fafc, 0xfb923c];
      const koiAccs = ["#ffffff", "#fef08a", "#ffffff", "#ef4444", "#ffffff"];
      for (let k = 0; k < 6; k++) {
        const koi = createPondKoiMesh(koiColors[k % koiColors.length], koiAccs[k % koiAccs.length]);
        lansiaPondGroup.add(koi);
        pondKoiList.push({
          mesh: koi,
          cx: 0.5 + (k % 3) * 2.2,
          cz: (k < 3 ? -0.5 : 6.0),
          rx: 2.2 + (k % 2) * 1.0,
          rz: 1.6 + (k % 3) * 0.6,
          speed: 0.45 + k * 0.09,
          phase: k * 1.15
        });
      }

      // Daun teratai berlekuk & bunga lotus mekar
      [[-1.8, -2.8], [2.4, 2.2], [5.8, -1.4], [-0.5, 4.2], [3.5, 8.2], [6.2, 6.8]].forEach(([lx, lz], idx) => {
        const lotus = createLotusAndPad(idx % 2 === 0, idx % 3 === 0 ? 1.15 : 0.92);
        lotus.position.set(lx, 0.11, lz);
        lansiaPondGroup.add(lotus);
      });
      // Rumpun alang-alang / tanaman air di tepi danau
      [[-4.2, -5.8], [8.5, 3.2], [6.5, 11.8], [-3.2, 9.8]].forEach(([rx, rz]) => {
        const reed = createCattailReedCluster();
        reed.position.set(rx, 0.06, rz);
        lansiaPondGroup.add(reed);
      });

      const cv = document.createElement("canvas");
      cv.width = 512; cv.height = 128;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 504, 120);
      ctx.fillStyle = "#38bdf8"; ctx.font = "900 34px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("🎣 DANAU TAMAN LANSIA", 256, 54);
      ctx.fillStyle = "#fde047"; ctx.font = "700 24px sans-serif";
      ctx.fillText("Jual Ikan & Beli Joran di Kopdes!", 256, 98);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.95), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), side: THREE.DoubleSide }));
      sign.position.set(-10.2, 2.35, -3.6);
      const sPole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.35, 8), woodMat);
      sPole.position.set(-10.2, 1.18, -3.6);

      lansiaPondGroup.add(dock, sign, sPole);
      // NPC Mancing & NPC Jualan di sekitar Danau Taman Lansia
      lansiaPondGroup.add(
        createFishingNpc("🎣 Mang Asep", 0x2563eb, -4.4, 0.36, -1.0, 0.25, { wx: 34.6, wz: 15.0, kec: "Bandung Wetan", wish: "Pakai Joran Kristal & Umbul Kosmik kalau mau ngejar Raja Samudra 1/100.000!" }),
        createFishingNpc("🎣 Teh Rina", 0xec4899, 6.2, 0.0, 12.6, Math.PI * 0.85, { wx: 45.2, wz: 28.6, kec: "Bandung Wetan", wish: "Pas hujan turun peluang ikan Rare–Divine naik 2x lipat lho!" }),
        createVendorNpcWithCart("🥟 Mang Ujang • Jajanan", 0xf97316, -12.6, 6.6, 0.55, { wx: 26.4, wz: 22.6, kec: "Bandung Wetan", wish: "Cireng & Bandrek hangat! Jajanan bisa dibeli & disimpan di Tas lewat Kopdes Biru Putih." })
      );
      const koiMeshes = new Set(pondKoiList.map(k => k.mesh));
      const npcArms = new Set(npcAnglerList.map(n => n.armR));
      lansiaPondGroup.traverse(o => {
        if (o !== lansiaPondGroup && !koiMeshes.has(o) && (!o.parent || !koiMeshes.has(o.parent)) && !npcArms.has(o)) {
          o.updateMatrix();
          o.matrixAutoUpdate = false;
        }
      });
      sc.add(lansiaPondGroup);
    }
    lansiaPondGroup.visible = !window.pirakuInDistrict;
  }

  // Kolam Mancing Khusus Kecamatan (diperluas & dipercantik di sisi Tenggara x:42, z:10.2)
  let districtPondGroup = null;
  const districtKoiList = [];
  function ensureDistrictPondVisible() {
    const sc = window.pirakuScene;
    if (!sc || typeof THREE === "undefined") return;
    if (!districtPondGroup) {
      districtPondGroup = new THREE.Group();
      districtPondGroup.position.set(42.0, 0, 10.2);

      const waterMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, map: getPondWaterTexture(), roughness: 0.08, metalness: 0.45, transparent: true, opacity: 0.92 });
      const shallowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.16, transparent: true, opacity: 0.62 });
      const shoreMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.95 });
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88, flatShading: true });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
      const plankMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 });

      [[0, -0.3, 6.2], [3.2, 0.2, 4.4], [-2.6, -0.5, 4.2]].forEach(([wx, wz, wr]) => {
        const sh = new THREE.Mesh(new THREE.CircleGeometry(wr + 0.7, 26), shoreMat);
        sh.rotation.x = -Math.PI / 2; sh.position.set(wx, 0.035, wz);
        const sl = new THREE.Mesh(new THREE.CircleGeometry(wr + 0.32, 26), shallowMat);
        sl.rotation.x = -Math.PI / 2; sl.position.set(wx, 0.06, wz);
        const dp = new THREE.Mesh(new THREE.CircleGeometry(wr, 26), waterMat);
        dp.rotation.x = -Math.PI / 2; dp.position.set(wx, 0.08, wz);
        districtPondGroup.add(sh, sl, dp);
      });

      // Batu tepian kolam mengikuti kontur persis 3 lingkaran kolam (hindari koridor dermaga selatan)
      const distCircles = [[0, -0.3, 6.2], [3.2, 0.2, 4.4], [-2.6, -0.5, 4.2]];
      let drIdx = 0;
      distCircles.forEach(([cx, cz, cr], ci) => {
        const steps = 24;
        for (let i = 0; i < steps; i++) {
          const ang = (i / steps) * Math.PI * 2;
          const rx = cx + Math.cos(ang) * (cr + 0.5);
          const rz = cz + Math.sin(ang) * (cr + 0.5);
          if (distCircles.some(([ox, oz, or], oi) => oi !== ci && Math.hypot(rx - ox, rz - oz) < or + 0.2)) continue;
          if (rx >= -2.2 && rx <= 2.2 && rz >= 0.0) continue;
          const rBase = 0.54 + (drIdx % 3) * 0.11;
          const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(rBase, 0), rockMat);
          rk.scale.set(1.22, 0.62, 1.08);
          rk.position.set(rx, 0.2, rz);
          rk.rotation.y = drIdx * 0.8;
          districtPondGroup.add(rk);
          districtRocks.push({ x: 42.0 + rx, z: 10.2 + rz, r: rBase * 1.42, topY: Number((0.2 + rBase * 0.58).toFixed(2)) });
          drIdx++;
        }
      });
      // Air terjun batu bertingkat + buih air di pojok barat laut kolam kecamatan
      const darkRockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, flatShading: true });
      const dwf = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), darkRockMat);
      dwf.scale.set(1.25, 1.35, 1.05);
      dwf.position.set(-5.6, 0.95, -3.8);
      const dwfTop = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), rockMat);
      dwfTop.position.set(-5.9, 1.95, -4.1);
      const dStream = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.85, 0.30), new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x0284c7, emissiveIntensity: 0.25, transparent: true, opacity: 0.88 }));
      dStream.position.set(-4.75, 0.92, -3.15);
      dStream.rotation.y = 0.7; dStream.rotation.x = 0.25;
      const dFoam = new THREE.Mesh(new THREE.CircleGeometry(1.35, 16), new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.72 }));
      dFoam.rotation.x = -Math.PI / 2;
      dFoam.position.set(-4.15, 0.11, -2.65);
      districtPondGroup.add(dwf, dwfTop, dStream, dFoam);

      // Saung Bambu santai di sisi timur laut lengkap dengan lantai kayu & lampion gantung
      const saungBase = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.9, 0.24, 6), woodMat);
      saungBase.position.set(6.8, 0.12, -4.0);
      const saungDeck = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.06, 6), plankMat);
      saungDeck.position.set(6.8, 0.26, -4.0);
      const saungRoof = new THREE.Mesh(new THREE.ConeGeometry(2.25, 1.2, 6), plankMat);
      saungRoof.position.set(6.8, 2.55, -4.0);
      const saungLantern = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      saungLantern.position.set(6.8, 1.92, -4.0);
      districtPondGroup.add(saungBase, saungDeck, saungRoof, saungLantern);
      for (let sp = 0; sp < 6; sp++) {
        const sa = (sp / 6) * Math.PI * 2;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.95, 6), woodMat);
        post.position.set(6.8 + Math.cos(sa) * 1.38, 1.08, -4.0 + Math.sin(sa) * 1.38);
        districtPondGroup.add(post);
      }

      // Semak bunga warna-warni di sekitar tepian kolam
      const bushMat = new THREE.MeshStandardMaterial({ color: 0x3d6639, roughness: 0.9 });
      [[-6.2, 1.2, 0xf43f5e], [6.4, 2.6, 0xfacc15], [4.6, -5.8, 0xa855f7], [-2.8, -5.6, 0xfb923c]].forEach(([fx, fz, fCol]) => {
        const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46, 0), bushMat);
        bush.position.set(fx, 0.30, fz);
        const fl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: fCol }));
        fl.position.set(fx, 0.64, fz);
        districtPondGroup.add(bush, fl);
      });

      // Batu pijakan rapi dari trotoar selatan ke dermaga + 2 bangku taman bersandaran
      [5.9, 6.6].forEach(sz => {
        const st = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.07, 0.6), shoreMat);
        st.position.set(0, 0.04, sz);
        districtPondGroup.add(st);
      });
      [-3.8, 3.8].forEach(bx => {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.12, 0.55), plankMat);
        seat.position.set(bx, 0.34, 5.2);
        const back = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.42, 0.08), woodMat);
        back.position.set(bx, 0.58, 5.44);
        [-0.68, 0.68].forEach(lx => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.34, 0.48), woodMat);
          leg.position.set(bx + lx, 0.17, 5.2);
          districtPondGroup.add(leg);
        });
        districtPondGroup.add(seat, back);
      });

      // Dermaga kayu panjang kecamatan (world x: 40.4..43.6, z: 10.9..16.1)
      const dock = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.26, 5.2), woodMat);
      dock.position.set(0, 0.2, 3.3);
      districtPondGroup.add(dock);
      for (let pz = 0.9; pz <= 5.6; pz += 0.55) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(3.08, 0.06, 0.42), plankMat);
        plank.position.set(0, 0.34, pz);
        districtPondGroup.add(plank);
      }
      [0.9, 3.3, 5.6].forEach(pz => {
        [-1.5, 1.5].forEach(lx => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.95, 6), woodMat);
          post.position.set(lx, 0.48, pz);
          districtPondGroup.add(post);
        });
      });
      [-1.5, 1.5].forEach(lx => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 5.0), plankMat);
        rail.position.set(lx, 0.85, 3.3);
        const lPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.5, 6), woodMat);
        lPole.position.set(lx, 1.1, 0.9);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        bulb.position.set(lx, 1.9, 0.9);
        districtPondGroup.add(rail, lPole, bulb);
      });

      // Papan nama Kolam Mancing Kecamatan
      const dCv = document.createElement("canvas");
      dCv.width = 480; dCv.height = 112;
      const dCtx = dCv.getContext("2d");
      dCtx.fillStyle = "#0f172a"; dCtx.fillRect(0, 0, 480, 112);
      dCtx.strokeStyle = "#38bdf8"; dCtx.lineWidth = 7; dCtx.strokeRect(4, 4, 472, 104);
      dCtx.fillStyle = "#38bdf8"; dCtx.font = "900 30px sans-serif"; dCtx.textAlign = "center";
      dCtx.fillText("🎣 KOLAM KECAMATAN", 240, 48);
      dCtx.fillStyle = "#fde047"; dCtx.font = "700 20px sans-serif";
      dCtx.fillText("Tersedia Ikan Eksklusif Wilayah!", 240, 86);
      const dSign = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.68), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(dCv), side: THREE.DoubleSide }));
      dSign.position.set(-2.9, 1.85, 5.6);
      const dSignPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.85, 8), woodMat);
      dSignPole.position.set(-2.9, 0.92, 5.6);
      districtPondGroup.add(dSign, dSignPole);

      // Teratai berlekuk, tanaman air & 5 ikan koi detail berenang
      [[-2.5, -2.0], [2.8, -1.5], [1.9, 2.3], [-3.2, 1.1], [0.4, -3.5]].forEach(([lx, lz], idx) => {
        const lotus = createLotusAndPad(idx % 2 === 0, 0.92);
        lotus.position.set(lx, 0.11, lz);
        districtPondGroup.add(lotus);
      });
      [[-4.8, 2.2], [5.2, -2.4], [4.8, 3.0]].forEach(([rx, rz]) => {
        const reed = createCattailReedCluster();
        reed.position.set(rx, 0.06, rz);
        districtPondGroup.add(reed);
      });
      const koiCols = [0xf97316, 0xfacc15, 0xef4444, 0xf8fafc, 0xfb923c];
      const koiAccsD = ["#ffffff", "#fef08a", "#ffffff", "#ef4444", "#ffffff"];
      for (let k = 0; k < 5; k++) {
        const kGrp = createPondKoiMesh(koiCols[k], koiAccsD[k]);
        districtPondGroup.add(kGrp);
        districtKoiList.push({ mesh: kGrp, cx: 0.3, cz: -0.6, rx: 1.8 + (k % 3) * 0.7, rz: 1.4 + (k % 2) * 0.6, speed: 0.52 + k * 0.1, phase: k * 1.3 });
      }

      // NPC Mancing & NPC Jualan di sekitar Kolam Mancing Kecamatan (nama unik per kecamatan, bukan Kang Dedi)
      const districtAngler = createFishingNpc("🎣 Mang Udin", 0x10b981, -1.0, 0.36, 1.4, Math.PI, { wx: 41.0, wz: 11.6, kec: "Kecamatan", wish: "Setiap kecamatan punya 1 ikan Mythic–Divine unik lho! Cek di tab Fishdex!" });
      const districtVendor = createVendorNpcWithCart("🧋 Teh Sari • Minuman", 0xec4899, -5.4, 5.1, 0.4, { wx: 36.6, wz: 15.3, kec: "Kecamatan", wish: "Es Kopi Braga & Bandrek seger! Jual ikan & upgrade joran bisa ke Kopdes sebelah utara." });
      districtPondGroup.userData.angler = districtAngler;
      districtPondGroup.userData.vendor = districtVendor;
      districtPondGroup.add(districtAngler, districtVendor);

      const koiSet = new Set(districtKoiList.map(k => k.mesh));
      const armSet = new Set(npcAnglerList.map(n => n.armR));
      districtPondGroup.traverse(o => {
        if (o !== districtPondGroup && !koiSet.has(o) && (!o.parent || !koiSet.has(o.parent)) && !armSet.has(o)) {
          o.updateMatrix();
          o.matrixAutoUpdate = false;
        }
      });
      sc.add(districtPondGroup);
    }
    districtPondGroup.visible = !!window.pirakuInDistrict;
    if (districtPondGroup.visible && districtPondGroup.userData.lastMapId !== window.pirakuActiveMapId) {
      const mid = window.pirakuActiveMapId || "coblong";
      districtPondGroup.userData.lastMapId = mid;
      const ex = DISTRICT_EXCLUSIVE_FISH[mid];
      const dName = ex ? ex.districtName : "Kecamatan";
      const anglerNames = ["🎣 Mang Udin", "🎣 Kang Tatang", "🎣 Teh Nina", "🎣 Mang Odang", "🎣 Kang Rizal", "🎣 Teh Maya", "🎣 Mang Yayan", "🎣 Teh Lilis", "🎣 Kang Ecep", "🎣 Mang Dadan", "🎣 Teh Wulan", "🎣 Kang Budi"];
      const vendorNames = ["🧋 Teh Sari • Minuman", "🥟 Mang Cepot • Cireng", "🍡 Teh Rini • Cilok", "🍵 Mang Aceng • Bandrek", "🍜 Teh Irma • Seblak", "🥞 Mang Usep • Surabi"];
      let hash = 0;
      for (let i = 0; i < mid.length; i++) hash = ((hash << 5) - hash + mid.charCodeAt(i)) | 0;
      const aName = anglerNames[Math.abs(hash) % anglerNames.length];
      const vName = vendorNames[Math.abs(hash >> 2) % vendorNames.length];
      const updateNpcMeta = (grp, newLabel, newWish) => {
        if (!grp) return;
        const spr = grp.children.find(c => c.isSprite);
        if (spr && spr.material && spr.material.map) {
          const isVend = grp === districtPondGroup.userData.vendor;
          const fresh = createNpcLabelSprite(newLabel, isVend ? "rgba(154, 52, 18, 0.94)" : null, isVend ? "#fef08a" : null, isVend ? "#fb923c" : null);
          spr.material.map.dispose();
          spr.material.map = fresh.material.map;
          spr.material.needsUpdate = true;
        }
        const hb = grp.children.find(c => c.userData && c.userData.npcBadge);
        if (hb) {
          hb.userData.ig = newLabel;
          hb.userData.kecamatan = dName;
          if (newWish) hb.userData.wish = newWish;
        }
      };
      updateNpcMeta(districtPondGroup.userData.angler, aName, ex ? `Di Kec. ${dName} ada ikan unik ${ex.name} [${ex.rarity.toUpperCase()}]! Cek Fishdex buat koleksinya.` : null);
      updateNpcMeta(districtPondGroup.userData.vendor, vName, `Jajanan segar khas Kec. ${dName}! Beli & simpan di Tas lewat Kopdes sebelah utara.`);
    }
  }

  let fishState = "idle";
  let rodMesh3D = null;
  let bobberMesh3D = null;
  let rippleMesh3D = null;
  let jumpFishMesh3D = null;
  let lineMesh3D = null;
  let currentFishSpec = null;
  let waitTimer = null;
  let biteTimeout = null;
  let reelRaf = null;
  let castAnimStart = 0;
  let fishPos = 50;
  let fishTarget = 50;
  let fishChangeAt = 0;
  let prevFishPos = 50;
  let barPos = 50;
  let catchProgress = 28;
  let isHoldingReel = false;
  let lastReelTs = 0;
  let catchCombo = 0;
  let wasInWater = false;

  function clear3DFishingVisuals() {
    const sc = window.pirakuScene;
    if (rodMesh3D && rodMesh3D.parent) rodMesh3D.parent.remove(rodMesh3D);
    if (bobberMesh3D && sc) sc.remove(bobberMesh3D);
    if (rippleMesh3D && sc) sc.remove(rippleMesh3D);
    if (jumpFishMesh3D && sc) sc.remove(jumpFishMesh3D);
    if (lineMesh3D && sc) sc.remove(lineMesh3D);
    rodMesh3D = bobberMesh3D = rippleMesh3D = jumpFishMesh3D = lineMesh3D = null;
  }

  function createFishingRodGroup(rodColor, isGold, rodId) {
    const rodGrp = new THREE.Group();
    const tilt = new THREE.Group();
    tilt.rotation.x = 0.76;
    const isCrystal = rodId === "crystal";
    const isCelestial = rodId === "celestial";
    const isGalatama = rodId === "galatama";
    const isHighTier = isGold || isCrystal || isCelestial || isGalatama;
    const blankMat = new THREE.MeshStandardMaterial({
      color: rodColor || 0xa16207,
      metalness: isHighTier ? 0.75 : 0.3,
      roughness: isHighTier ? 0.2 : 0.42,
      emissive: isGalatama ? 0xbe123c : (isCelestial ? 0x581c87 : (isCrystal ? 0x0369a1 : 0x000000)),
      emissiveIntensity: isGalatama ? 0.52 : (isCelestial ? 0.45 : (isCrystal ? 0.35 : 0))
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: (isGold || isGalatama) ? 0xfef08a : (isCelestial ? 0xf5d0fe : (isCrystal ? 0xbae6fd : 0xe2e8f0)),
      metalness: 0.88,
      roughness: 0.18
    });

    // Butt cap & gagang ergonomis dua lapis
    const buttCap = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 8), trimMat);
    buttCap.position.set(0, -0.06, 0);
    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058, 0.065, 0.58, 10),
      new THREE.MeshStandardMaterial({ color: isHighTier ? 0x0f172a : 0x78350f, roughness: 0.85 })
    );
    grip.position.set(0, 0.24, 0);

    // 3-section parabolic rod blank (pangkal -> tengah -> ujung lentur)
    const basePole = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.05, 1.05, 10), blankMat);
    basePole.position.set(0, 1.02, 0);
    const ferrule1 = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.07, 10), trimMat);
    ferrule1.position.set(0, 1.54, 0);

    const midSection = new THREE.Group();
    midSection.position.set(0, 1.54, 0);
    midSection.rotation.x = 0.09;
    const midPole = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.034, 0.92, 10), blankMat);
    midPole.position.set(0, 0.46, 0);
    const ferrule2 = new THREE.Mesh(new THREE.CylinderGeometry(0.029, 0.029, 0.06, 10), trimMat);
    ferrule2.position.set(0, 0.92, 0);
    midSection.add(midPole, ferrule2);

    const tipSection = new THREE.Group();
    tipSection.position.set(0, 0.92, 0);
    tipSection.rotation.x = 0.14;
    const tipPole = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.022, 0.95, 8), blankMat);
    tipPole.position.set(0, 0.475, 0);

    const tipColor = isCelestial ? 0xf0abfc : (isCrystal ? 0x38bdf8 : (isGold ? 0xfde047 : 0x38bdf8));
    const tipGeo = (isCrystal || isCelestial) ? new THREE.OctahedronGeometry(0.105, 0) : new THREE.SphereGeometry(isGold ? 0.075 : 0.042, 10, 10);
    const tipGlow = new THREE.Mesh(tipGeo, new THREE.MeshBasicMaterial({ color: tipColor }));
    tipGlow.position.set(0, 0.96, 0);
    const tipMarker = new THREE.Object3D();
    tipMarker.position.set(0, 0.96, 0);
    tipSection.add(tipGlow, tipMarker);
    tipSection.add(tipPole);
    midSection.add(tipSection);

    // 6 Cincin kolong senar (line guides) di sepanjang joran
    [0.85, 1.32].forEach((gy, gi) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.048 - gi * 0.006, 0.009, 6, 12), trimMat);
      r.position.set(0, gy, 0.056);
      tilt.add(r);
    });
    [0.32, 0.72].forEach((gy, gi) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.036 - gi * 0.006, 0.008, 6, 10), trimMat);
      r.position.set(0, gy, 0.045);
      midSection.add(r);
    });
    [0.35, 0.72].forEach((gy, gi) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.024 - gi * 0.005, 0.007, 6, 10), trimMat);
      r.position.set(0, gy, 0.034);
      tipSection.add(r);
    });

    // Efek ala Roblox Fish It untuk joran mahal (Karbon, Emas, Kristal, Naga Siliwangi)
    const animRings = [];
    let orbitGroup = null;
    let auraSphere = null;
    if (rodId === "carbon" || isHighTier) {
      const auraMat = new THREE.MeshBasicMaterial({ color: tipColor, transparent: true, opacity: isHighTier ? 0.36 : 0.25 });
      auraSphere = new THREE.Mesh(new THREE.SphereGeometry(isHighTier ? 0.19 : 0.09, 12, 12), auraMat);
      auraSphere.position.set(0, 0.96, 0);
      tipSection.add(auraSphere);
    }
    if (isHighTier) {
      // Lapisan aura energi menyala di sepanjang batang joran
      const sheathMat = new THREE.MeshBasicMaterial({ color: tipColor, transparent: true, opacity: 0.22 });
      const sheathBase = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.078, 1.05, 10), sheathMat);
      sheathBase.position.set(0, 1.02, 0);
      const sheathMid = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.06, 0.92, 10), sheathMat);
      sheathMid.position.set(0, 0.46, 0);
      tilt.add(sheathBase);
      midSection.add(sheathMid);

      // 3 Cincin energi berputar (gyro rings) di ujung & tengah joran
      const ringSpecs = [
        { parent: tipSection, y: 0.96, rad: isCelestial ? 0.24 : 0.19, col: tipColor, rx: 1.1, rz: 0.4 },
        { parent: tipSection, y: 0.96, rad: isCelestial ? 0.30 : 0.23, col: isCelestial ? 0xfde047 : 0xffffff, rx: -0.9, rz: 1.0 },
        { parent: midSection, y: 0.65, rad: 0.15, col: tipColor, rx: 1.5, rz: 0.0 }
      ];
      ringSpecs.forEach(rs => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(rs.rad, 0.015, 8, 22),
          new THREE.MeshBasicMaterial({ color: rs.col, transparent: true, opacity: 0.9 })
        );
        ring.position.set(0, rs.y, 0);
        ring.rotation.set(rs.rx, 0, rs.rz);
        rs.parent.add(ring);
        animRings.push(ring);
      });

      // Kristal / Bintang mengorbit di ujung joran
      orbitGroup = new THREE.Group();
      orbitGroup.position.set(0, 0.96, 0);
      const orbCount = isCelestial ? 5 : (isCrystal ? 4 : 3);
      const orbDist = isCelestial ? 0.28 : 0.22;
      for (let oi = 0; oi < orbCount; oi++) {
        const oa = (oi / orbCount) * Math.PI * 2;
        const orb = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.042, 0),
          new THREE.MeshBasicMaterial({ color: oi % 2 === 0 ? tipColor : 0xfde047 })
        );
        orb.position.set(Math.cos(oa) * orbDist, Math.sin(oa * 2) * 0.06, Math.sin(oa) * orbDist);
        orbitGroup.add(orb);
      }
      tipSection.add(orbitGroup);
    }
    rodGrp.userData.animRings = animRings;
    rodGrp.userData.orbitGroup = orbitGroup;
    rodGrp.userData.auraSphere = auraSphere;
    rodGrp.userData.tipGlow = tipGlow;

    // Reel spinning lengkap: dudukan, bodi, spool metalik, bail arm, & engkol
    const reelBody = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.13, 12), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
    reelBody.rotation.z = Math.PI / 2;
    reelBody.position.set(0, 0.56, 0.12);
    const reelSpool = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.15, 12), trimMat);
    reelSpool.rotation.z = Math.PI / 2;
    reelSpool.position.set(0, 0.56, 0.12);
    const bailArm = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.009, 6, 12, Math.PI), trimMat);
    bailArm.position.set(0, 0.56, 0.18);
    const crankArm = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.025), trimMat);
    crankArm.position.set(0.095, 0.60, 0.12);
    const crankKnob = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.6 }));
    crankKnob.position.set(0.115, 0.66, 0.12);

    tilt.add(buttCap, grip, basePole, ferrule1, midSection, reelBody, reelSpool, bailArm, crankArm, crankKnob);
    rodGrp.add(tilt);
    rodGrp.userData.tipMarker = tipMarker;
    rodGrp.position.set(0.32, 0.72, 0.12);
    return rodGrp;
  }

  function createBobberGroup(bx, wy, bz, bobberSpec) {
    const spec = bobberSpec || BOBBERS[0];
    const bob = new THREE.Group();
    const bTop = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: spec.topCol || 0xef4444 }));
    bTop.position.y = 0.06;
    const bBot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: spec.botCol || 0xf8fafc }));
    bBot.position.y = -0.02;
    bob.add(bTop, bBot);
    if (spec.glowCol) {
      const aura = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.022, 6, 16),
        new THREE.MeshBasicMaterial({ color: spec.glowCol, transparent: true, opacity: 0.78 })
      );
      aura.rotation.x = Math.PI / 2;
      aura.position.y = 0.03;
      bob.add(aura);
    }
    bob.position.set(bx, wy + 0.06, bz);
    return bob;
  }

  function createRippleMesh(bx, wy, bz) {
    const rip = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.42, 20),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    rip.rotation.x = -Math.PI / 2;
    rip.position.set(bx, wy + 0.02, bz);
    return rip;
  }

  function updateFishingLine(lineObj, rodGrp, bobObj) {
    if (!lineObj || !rodGrp || !bobObj) return;
    rodGrp.updateMatrixWorld(true);
    const tip = new THREE.Vector3();
    if (rodGrp.userData && rodGrp.userData.tipMarker) {
      rodGrp.userData.tipMarker.getWorldPosition(tip);
    } else {
      tip.set(0, 1.82, 1.44).applyMatrix4(rodGrp.matrixWorld);
    }
    const posAttr = lineObj.geometry && lineObj.geometry.attributes && lineObj.geometry.attributes.position;
    if (posAttr) {
      posAttr.setXYZ(0, tip.x, tip.y, tip.z);
      posAttr.setXYZ(1, bobObj.position.x, bobObj.position.y + 0.12, bobObj.position.z);
      posAttr.needsUpdate = true;
    }
  }

  function animateFishingPose(ud, rodGrp, state, now, castStart) {
    if (!ud || !state || state === "idle") return;
    if (state === "waiting") {
      const elapsed = now - (castStart || now);
      if (elapsed < 450) {
        const p = Math.max(0, Math.min(1, elapsed / 450));
        if (rodGrp) rodGrp.rotation.x = -0.58 * (1 - p);
        if (ud.armR) ud.armR.rotation.x = -1.55 + p * 0.65;
      } else {
        const bob = Math.sin(now * 0.004);
        if (rodGrp) rodGrp.rotation.x = bob * 0.04;
        if (ud.armR) ud.armR.rotation.x = -0.9 + bob * 0.05;
        if (ud.armL) ud.armL.rotation.x = -0.25;
      }
      if (ud.body) ud.body.rotation.x = 0;
    } else if (state === "bite") {
      const jerk = Math.sin(now * 0.028);
      if (rodGrp) rodGrp.rotation.x = jerk * 0.22;
      if (ud.armR) ud.armR.rotation.x = -1.05 + jerk * 0.28;
      if (ud.armL) ud.armL.rotation.x = -0.45 - jerk * 0.12;
      if (ud.body) ud.body.rotation.x = 0.06;
    } else if (state === "reeling") {
      const tug = Math.sin(now * 0.018);
      if (rodGrp) rodGrp.rotation.x = -0.22 + tug * 0.16;
      if (ud.armR) ud.armR.rotation.x = -1.15 + tug * 0.25;
      if (ud.armL) ud.armL.rotation.x = -0.75 - tug * 0.2;
      if (ud.body) ud.body.rotation.x = -0.14;
    }
  }

  function spawn3DFishingVisuals(pond) {
    clear3DFishingVisuals();
    const sc = window.pirakuScene;
    const pm = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (!sc || !pm || typeof THREE === "undefined") return;

    const rod = getEquippedRod();
    const rodGrp = createFishingRodGroup(rod.color, rod.id === "gold", rod.id);
    pm.add(rodGrp);
    rodMesh3D = rodGrp;
    castAnimStart = performance.now();

    pm.rotation.y = Math.atan2(pond.x - pm.position.x, pond.z - pm.position.z);

    const bx = pond.x + (Math.random() - 0.5) * 3.0;
    const bz = pond.z + (Math.random() - 0.5) * 2.5;

    const bobSpec = getEquippedBobber();
    const bob = createBobberGroup(bx, pond.waterY, bz, bobSpec);
    sc.add(bob);
    bobberMesh3D = bob;

    const rip = createRippleMesh(bx, pond.waterY, bz);
    sc.add(rip);
    rippleMesh3D = rip;

    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), bob.position.clone()]);
    lineMesh3D = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xe2e8f0 }));
    sc.add(lineMesh3D);
    updateFishingLine(lineMesh3D, rodMesh3D, bobberMesh3D);

    window.pirakuFishingSyncState = {
      state: "waiting",
      col: rod.color,
      gold: rod.id === "gold",
      rodId: rod.id,
      bobId: bobSpec.id,
      bx: Number(bx.toFixed(2)),
      bz: Number(bz.toFixed(2)),
      wy: Number(pond.waterY.toFixed(2))
    };
  }

  function spawnJumpingFish3D(fishSpec) {
    const sc = window.pirakuScene;
    if (!sc || !bobberMesh3D || typeof THREE === "undefined") return;
    if (jumpFishMesh3D) sc.remove(jumpFishMesh3D);
    const fGrp = buildDetailedFishBodyMesh(fishSpec, ["Epic", "Mythic", "Secret", "Cosmic", "Divine"].includes(fishSpec.rarity));
    fGrp.scale.setScalar(1.25);
    fGrp.position.copy(bobberMesh3D.position);
    sc.add(fGrp);
    jumpFishMesh3D = fGrp;
  }

  function rollFish() {
    const rod = getEquippedRod();
    const bobber = getEquippedBobber();
    const isRain = window.pirakuCurrentEventId === "rain";
    const totalLuck = rod.luckBonus + bobber.luckBoost + (castLuckBonus || 0);
    const isFreeRod = rod.id === "bamboo";
    const curMapId = window.pirakuActiveMapId || "bandung_wetan";
    const exFish = (window.pirakuInDistrict && DISTRICT_EXCLUSIVE_FISH[curMapId]) ? DISTRICT_EXCLUSIVE_FISH[curMapId] : null;
    const sourcePool = exFish ? FISH_CATALOG.concat([exFish]) : FISH_CATALOG;

    const pool = sourcePool.map(f => {
      let w = f.weight;
      if (f.rarity === "Common") {
        w *= Math.max(0.42, 1 - totalLuck * 0.25);
      } else if (f.rarity === "Uncommon") {
        w *= (1 + totalLuck * 0.45);
      } else if (f.rarity === "Rare") {
        w *= (isFreeRod ? 0.20 : 1 + totalLuck * 2.4) * (isRain ? 1.8 : 1.0);
      } else if (f.rarity === "Epic") {
        w *= (isFreeRod ? 0.03 : 1 + totalLuck * 3.0) * (isRain ? 2.0 : 1.0);
      } else {
        // Mythic, Secret, Cosmic, Divine: hampir mustahil pakai joran bambu gratisan, naik tajam di joran bagus!
        w *= (isFreeRod ? 0.005 : 1 + totalLuck * 3.8) * (isRain ? 2.2 : 1.0);
      }
      return { fish: f, w };
    });
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = Math.random() * total;
    for (const p of pool) {
      r -= p.w;
      if (r <= 0) return p.fish;
    }
    return FISH_CATALOG[1];
  }

  function setMobileControlsHidden(hide) {
    const jz = document.getElementById("joystick-zone");
    const isTouchDev = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 900;
    if (jz) {
      jz.style.display = hide ? "none" : (isTouchDev ? "block" : "");
      jz.style.visibility = hide ? "hidden" : "visible";
      jz.style.pointerEvents = hide ? "none" : "auto";
    }
    document.querySelectorAll('button[title="Buka Balai Obrolan Warga"], .btn-chat-fab').forEach(b => {
      b.style.display = hide ? "none" : "";
    });
  }

  let castLuckBonus = 0;
  let castBarRaf = null;
  let _finishPowerCastFn = null;
  let autoFishingEnabled = false;
  let _autoFishingTimer = null;

  window.toggleAutoPirakuFishing = function () {
    if (!autoFishingEnabled) {
      const hasUpgradedRod = getOwnedRods().some(id => id !== "bamboo");
      if (!hasUpgradedRod) {
        if (typeof window.showToast === "function") {
          window.showToast("🔒 Mancing Auto terkunci! Beli minimal Joran Fiber Braga (600 🪙) di Kopdes dulu.");
        }
        return;
      }
    }
    autoFishingEnabled = !autoFishingEnabled;
    clearTimeout(_autoFishingTimer);
    lastPondSig = "";
    if (autoFishingEnabled) {
      if (getBag().length >= 1000) {
        autoFishingEnabled = false;
        if (typeof window.showToast === "function") window.showToast("🎒 Tas ikan penuh (1000/1000)! Jual dulu di Kopdes.");
        return;
      }
      if (typeof window.showToast === "function") window.showToast("🤖 Mancing Auto AKTIF! Duduk santai & tonton saja 🎣");
      if (fishState === "idle" && typeof window.castPirakuFishingRod === "function") {
        window.castPirakuFishingRod();
      }
    } else {
      if (typeof window.showToast === "function") window.showToast("⏹️ Mancing Auto dimatikan");
      if (fishState !== "idle") cancelFishing(true);
    }
  };

  // ================= TURNAMEN GALATAMA 3 MENIT & BANNER HUJAN 2X LUCK =================
  const galatamaEvent = { active: false, endsAt: 0, bestKg: 0, bestFishName: "", catches: 0, cooldownUntil: 0 };

  window.startPirakuGalatama = function () {
    const now = Date.now();
    if (galatamaEvent.active) {
      if (typeof window.showToast === "function") window.showToast(`🏆 Galatama sedang berlangsung! Rekor: ${galatamaEvent.bestKg.toFixed(1)} kg`);
      return;
    }
    if (now < galatamaEvent.cooldownUntil) {
      const waitSec = Math.ceil((galatamaEvent.cooldownUntil - now) / 1000);
      if (typeof window.showToast === "function") window.showToast(`⏳ Turnamen Galatama berikutnya dalam ${waitSec} detik!`);
      return;
    }
    galatamaEvent.active = true;
    galatamaEvent.endsAt = now + 180000;
    galatamaEvent.bestKg = 0;
    galatamaEvent.bestFishName = "";
    galatamaEvent.catches = 0;
    lastPondSig = "";
    if (typeof window.playSynthTone === "function") window.playSynthTone(880, "triangle", 0.22);
    if (typeof window.showToast === "function") window.showToast("🏆 Turnamen Galatama 3 Menit DIMULAI! Tangkap ikan terberatmu!");
  };

  function updateGalatamaHud() {
    let pill = document.getElementById("piraku-galatama-hud");
    if (!galatamaEvent.active) {
      if (pill) pill.style.display = "none";
      return;
    }
    const now = Date.now();
    const remMs = galatamaEvent.endsAt - now;
    if (remMs <= 0) {
      galatamaEvent.active = false;
      galatamaEvent.cooldownUntil = now + 120000;
      lastPondSig = "";
      if (pill) pill.style.display = "none";
      if (galatamaEvent.catches > 0 && galatamaEvent.bestKg > 0) {
        const reward = Math.min(250, Math.round(60 + galatamaEvent.bestKg * 4));
        if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
          window.PirakuEconomy.addCoins(reward, "Hadiah Turnamen Galatama");
        }
        if (typeof window.grantPirakuXP === "function") window.grantPirakuXP(50, "Turnamen Galatama");
        if (typeof window.playSynthTone === "function") window.playSynthTone(1046, "sine", 0.35);
        if (typeof window.showToast === "function") {
          window.showToast(`🏆 Galatama Selesai! Terberat: ${galatamaEvent.bestFishName} (${galatamaEvent.bestKg.toFixed(1)} kg) → +${reward} 🪙 & +50 XP!`);
        }
        if (galatamaEvent.bestKg >= 10 && typeof window.broadcastChatMessage === "function") {
          const myIg = localStorage.getItem("piraku_my_ig") || "Warga";
          window.broadcastChatMessage(`🏆 ${myIg} menuntaskan Lomba Galatama dengan rekor ${galatamaEvent.bestFishName} (${galatamaEvent.bestKg.toFixed(1)} kg)!`);
        }
      } else if (typeof window.showToast === "function") {
        window.showToast("🏆 Waktu Galatama habis! Belum ada ikan yang tertangkap.");
      }
      return;
    }
    if (!pill && document.body) {
      pill = document.createElement("div");
      pill.id = "piraku-galatama-hud";
      pill.style.cssText = "position:fixed;top:116px;left:50%;transform:translateX(-50%);z-index:9001;background:linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.95));border:1.5px solid #facc15;color:#fde047;padding:6px 14px;border-radius:999px;font-size:11.5px;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,0.5);pointer-events:none;white-space:nowrap;";
      document.body.appendChild(pill);
    }
    const sec = Math.ceil(remMs / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    pill.innerHTML = `🏆 Galatama ${mm}:${ss} • Rekor: <span style="color:#4ade80;">${galatamaEvent.bestKg.toFixed(1)} kg</span> (${galatamaEvent.catches} ikan)`;
    pill.style.display = "block";
  }

  let _lastWasRainEvent = false;
  function showRainLuckBanner() {
    let b = document.getElementById("piraku-rain-luck-banner");
    if (!b && document.body) {
      b = document.createElement("div");
      b.id = "piraku-rain-luck-banner";
      b.style.cssText = "position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:9500;background:linear-gradient(135deg,rgba(12,74,110,0.95),rgba(30,58,138,0.95));border:1.5px solid #38bdf8;color:#e0f2fe;padding:8px 16px;border-radius:999px;font-size:12px;font-weight:900;box-shadow:0 10px 28px rgba(0,0,0,0.5);pointer-events:none;white-space:nowrap;transition:opacity 0.35s;";
      document.body.appendChild(b);
    }
    if (!b) return;
    b.innerHTML = "🌧️ <b>Hujan Deras Turun!</b> Peluang Ikan Rare–Divine <b>2x Lipat</b> di Danau!";
    b.style.opacity = "1";
    b.style.display = "block";
    clearTimeout(b._t);
    b._t = setTimeout(() => {
      b.style.opacity = "0";
      setTimeout(() => { b.style.display = "none"; }, 350);
    }, 4500);
  }

  function cancelFishing(stopAuto) {
    clearTimeout(waitTimer);
    clearTimeout(biteTimeout);
    clearTimeout(_autoFishingTimer);
    cancelAnimationFrame(reelRaf);
    cancelAnimationFrame(castBarRaf);
    if (stopAuto === true) {
      autoFishingEnabled = false;
      lastPondSig = "";
    }
    _finishPowerCastFn = null;
    castLuckBonus = 0;
    fishState = "idle";
    window.pirakuFishingSyncState = null;
    currentFishSpec = null;
    isHoldingReel = false;
    setMobileControlsHidden(false);
    clear3DFishingVisuals();
    const ui = document.getElementById("piraku-fishing-ui");
    if (ui) ui.style.display = "none";
  }

  function ensureFishingOverlay() {
    let ui = document.getElementById("piraku-fishing-ui");
    if (ui) return ui;
    ui = document.createElement("div");
    ui.id = "piraku-fishing-ui";
    // Posisi di bottom: 205px, z-index 9999 -> 100% di atas analog joystick & Obrolan, bebas tindih!
    ui.style.cssText = "position:fixed;bottom:205px;left:50%;transform:translateX(-50%);z-index:9999;display:none;flex-direction:column;align-items:center;gap:7px;width:min(360px, calc(100vw - 24px));background:rgba(15,23,42,0.97);border:2px solid #38bdf8;border-radius:16px;padding:11px 13px;color:#f8fafc;box-shadow:0 16px 40px rgba(0,0,0,0.8);user-select:none;-webkit-user-select:none;";
    document.body.appendChild(ui);
    return ui;
  }

  window.castPirakuFishingRod = function () {
    if (fishState !== "idle") return;
    const pm = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (pm && pm.position && isPlayerInLakeWater(pm.position.x, pm.position.z)) {
      if (typeof window.showToast === "function") window.showToast("💦 Naik ke dermaga atau tepi danau dulu sebelum lempar joran!");
      return;
    }
    const pond = getActivePond();
    const bobber = getEquippedBobber();
    fishState = "casting";
    setMobileControlsHidden(true);

    const ui = ensureFishingOverlay();
    ui.style.display = "flex";
    ui.innerHTML = `
      <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
        <span style="font-weight:900;font-size:12.5px;color:#38bdf8;">🎯 ATUR KEKUATAN LEMPARAN</span>
        <span id="pf-cast-pct" style="font-size:11.5px;font-weight:900;color:#fde047;">0%</span>
      </div>
      <div style="position:relative;width:100%;height:26px;background:#020617;border:2px solid #38bdf8;border-radius:12px;overflow:hidden;">
        <div style="position:absolute;top:0;bottom:0;left:75%;right:0;background:rgba(250,204,21,0.28);border-left:2px dashed #fde047;"></div>
        <div id="pf-cast-fill" style="width:0%;height:100%;background:linear-gradient(90deg,#38bdf8,#22c55e,#facc15);"></div>
      </div>
      <div style="display:flex;gap:8px;width:100%;">
        <button id="pf-cast-btn" style="flex:1;border:none;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#fff;padding:10px;border-radius:12px;font-weight:900;font-size:13px;cursor:pointer;">🎣 LEMPAR SEKARANG! (SPACE)</button>
        <button onclick="cancelPirakuFishing()" style="border:none;background:#1e293b;color:#94a3b8;padding:0 12px;border-radius:12px;font-weight:800;cursor:pointer;">✕</button>
      </div>
    `;

    let castPct = 0;
    let castDir = 1;
    let lastCastTs = performance.now();
    function stepCast(now) {
      if (fishState !== "casting") return;
      const dt = Math.min(0.05, (now - lastCastTs) / 1000);
      lastCastTs = now;
      castPct += castDir * 85 * dt;
      if (castPct >= 100) { castPct = 100; castDir = -1; }
      else if (castPct <= 0) { castPct = 0; castDir = 1; }
      const fillEl = document.getElementById("pf-cast-fill");
      const pctEl = document.getElementById("pf-cast-pct");
      if (fillEl) fillEl.style.width = castPct.toFixed(0) + "%";
      if (pctEl) pctEl.textContent = Math.round(castPct) + "%";
      castBarRaf = requestAnimationFrame(stepCast);
    }
    castBarRaf = requestAnimationFrame(stepCast);

    _finishPowerCastFn = function () {
      if (fishState !== "casting") return;
      cancelAnimationFrame(castBarRaf);
      _finishPowerCastFn = null;
      const isPerfectCast = castPct >= 75;
      const isGoodCast = !isPerfectCast && castPct >= 50;
      castLuckBonus = isPerfectCast ? 0.30 : (isGoodCast ? 0.10 : 0);
      fishState = "waiting";
      spawn3DFishingVisuals(pond);
      if (typeof window.playSynthTone === "function") window.playSynthTone(isPerfectCast ? 760 : 520, "sine", 0.14);

      const delayMs = (1500 + Math.random() * 1400) * (bobber.biteSpeed || 1.0) * (isPerfectCast ? 0.8 : 1.0);

      function triggerBite() {
        if (fishState !== "waiting") return;
        clearTimeout(waitTimer);
        fishState = "bite";
        if (window.pirakuFishingSyncState) window.pirakuFishingSyncState.state = "bite";
        if (typeof window.playSynthTone === "function") window.playSynthTone(880, "triangle", 0.24);
        if (navigator && typeof navigator.vibrate === "function") {
          try { navigator.vibrate([45, 30, 70]); } catch (_) {}
        }
        ui.innerHTML = `
          <div style="font-weight:900;font-size:17px;color:#facc15;text-shadow:0 0 12px rgba(250,204,21,0.55);">❗ IKAN MENYAMBAR!</div>
          <button onclick="strikePirakuFish()" style="width:100%;border:none;background:linear-gradient(135deg,#facc15,#f97316);color:#0f172a;padding:11px;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 6px 20px rgba(250,204,21,0.35);">⚡ TARIK SEKARANG! (TAP LAYAR / SPACE)</button>
        `;
        if (autoFishingEnabled) {
          _autoFishingTimer = setTimeout(() => {
            if (fishState === "bite" && autoFishingEnabled) window.strikePirakuFish();
          }, 340);
        }
        biteTimeout = setTimeout(() => {
          if (fishState === "bite") {
            catchCombo = 0;
            cancelFishing();
            if (typeof window.showToast === "function") window.showToast("💨 Telat tarik! Ikannya lepas...");
          }
        }, 4500);
      }

      ui.innerHTML = `
        <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
          <span style="font-weight:900;font-size:12.5px;color:#7dd3fc;">${isPerfectCast ? "✨ PERFECT CAST! (+30% Luck)" : isGoodCast ? "👍 GOOD CAST! (+10% Luck)" : "🎣 Menunggu di " + pond.name}</span>
          ${catchCombo > 0 ? `<span style="background:#9a3412;color:#fde047;padding:2px 8px;border-radius:99px;font-size:10.5px;font-weight:900;">🔥 Combo ${catchCombo}x</span>` : ""}
        </div>
        <div style="font-size:11px;color:#94a3b8;">Umbul-umbul: ${bobber.icon} <b>${bobber.name}</b> • ${autoFishingEnabled ? "🤖 Auto-Mancing aktif..." : "Tunggu sebentar..."}</div>
        <div style="display:flex;gap:8px;width:100%;">
          ${autoFishingEnabled ? `<button onclick="toggleAutoPirakuFishing()" style="flex:1;border:none;background:#991b1b;color:#fecaca;padding:6px 12px;border-radius:9px;font-size:11px;font-weight:900;cursor:pointer;">⏹️ Stop Auto</button>` : ""}
          <button onclick="cancelPirakuFishing(true)" style="border:none;background:rgba(148,163,184,0.2);color:#e2e8f0;padding:6px 12px;border-radius:9px;font-size:11px;font-weight:800;cursor:pointer;">Batal</button>
        </div>
      `;

      waitTimer = setTimeout(triggerBite, delayMs);
    };

    const castBtn = document.getElementById("pf-cast-btn");
    if (castBtn) castBtn.onclick = _finishPowerCastFn;
    if (autoFishingEnabled) {
      _autoFishingTimer = setTimeout(() => {
        if (fishState === "casting" && autoFishingEnabled && _finishPowerCastFn) _finishPowerCastFn();
      }, 780);
    }
  };

  window.cancelPirakuFishing = cancelFishing;

  window.strikePirakuFish = function () {
    if (fishState !== "bite") return;
    clearTimeout(biteTimeout);
    fishState = "reeling";
    if (window.pirakuFishingSyncState) window.pirakuFishingSyncState.state = "reeling";
    currentFishSpec = rollFish();
    spawnJumpingFish3D(currentFishSpec);

    const rod = getEquippedRod();
    fishPos = 50;
    prevFishPos = 50;
    fishTarget = 35 + Math.random() * 30;
    fishChangeAt = 0;
    barPos = 50;
    let barVel = 0;
    catchProgress = 35;
    isHoldingReel = false;
    lastReelTs = performance.now();

    const isStrongPull = ["Rare", "Epic", "Mythic", "Secret", "Cosmic", "Divine"].includes(currentFishSpec.rarity);
    const ui = ensureFishingOverlay();
    ui.onpointerdown = (e) => {
      if (e.target && e.target.closest("button") && e.target.closest("button").textContent === "✕") return;
      if (fishState === "bite") { e.preventDefault(); window.strikePirakuFish(); }
      else if (fishState === "reeling") { e.preventDefault(); isHoldingReel = true; }
    };
    ui.onpointerup = () => { isHoldingReel = false; };
    ui.onpointerleave = () => { isHoldingReel = false; };
    ui.innerHTML = `
      <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
        <span id="pf-status" style="font-weight:900;font-size:12.5px;color:${isStrongPull ? "#f97316" : "#4ade80"};">${isStrongPull ? "⚡ TARIKAN KUAT!" : "✓ ZONA TEPAT!"}</span>
        <span id="pf-pct" style="font-size:11.5px;font-weight:900;color:#7dd3fc;">35%</span>
      </div>
      <div id="pf-track" style="position:relative;width:100%;height:38px;background:linear-gradient(180deg,#020617,#0f172a);border:2px solid ${isStrongPull ? "#f97316" : "#38bdf8"};border-radius:14px;overflow:hidden;box-shadow:inset 0 2px 8px rgba(0,0,0,0.8);">
        <div id="pf-bar" style="position:absolute;top:3px;bottom:3px;width:${rod.barWidth}%;left:${50 - rod.barWidth / 2}%;background:rgba(34,197,94,0.42);border:2px solid #4ade80;border-radius:10px;box-shadow:0 0 14px rgba(74,222,128,0.45);transition:background 0.1s, border-color 0.1s;">
          <div style="position:absolute;top:2px;bottom:2px;left:36%;right:36%;background:rgba(250,204,21,0.42);border-radius:6px;"></div>
        </div>
        <div id="pf-fish" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.8));">🐟</div>
      </div>
      <div style="width:100%;height:10px;background:#1e293b;border-radius:99px;overflow:hidden;">
        <div id="pf-prog" style="width:35%;height:100%;background:linear-gradient(90deg,#38bdf8,#22c55e,#facc15);"></div>
      </div>
      <div style="display:flex;gap:8px;width:100%;">
        ${autoFishingEnabled
          ? `<button id="pf-hold-btn" onclick="toggleAutoPirakuFishing()" style="flex:1;border:none;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;padding:11px;border-radius:12px;font-weight:900;font-size:13px;cursor:pointer;">🤖 AUTO REEL AKTIF (Ketuk untuk Stop)</button>`
          : `<button id="pf-hold-btn" style="flex:1;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;padding:11px;border-radius:12px;font-weight:900;font-size:13px;cursor:pointer;touch-action:none;">✊ TAHAN LAYAR / SPACE</button>`}
        <button onclick="cancelPirakuFishing(true)" style="border:none;background:#1e293b;color:#94a3b8;padding:0 12px;border-radius:12px;font-weight:800;cursor:pointer;">✕</button>
      </div>
    `;

    const btn = document.getElementById("pf-hold-btn");
    if (btn && !autoFishingEnabled) {
      btn.onpointerdown = (e) => { e.preventDefault(); isHoldingReel = true; };
      btn.onpointerup = () => { isHoldingReel = false; };
      btn.onpointerleave = () => { isHoldingReel = false; };
    }

    let lastTickSound = 0;
    function stepReel(now) {
      if (fishState !== "reeling") return;
      const dt = Math.min(0.06, Math.max(0.008, (now - lastReelTs) / 1000));
      lastReelTs = now;

      if (now >= fishChangeAt) {
        fishTarget = 16 + Math.random() * 68;
        fishChangeAt = now + (1000 + Math.random() * (1100 - Math.min(500, currentFishSpec.erratic * 350)));
      }
      prevFishPos = fishPos;
      const fDiff = fishTarget - fishPos;
      fishPos += Math.sign(fDiff) * Math.min(Math.abs(fDiff), currentFishSpec.speed * 18 * dt);
      fishPos = Math.max(10, Math.min(90, fishPos));

      if (autoFishingEnabled) {
        isHoldingReel = barPos < fishPos - 1.5;
      }

      // Fisika bar santai & responsif (mudah dikendalikan di HP maupun PC)
      barVel += (isHoldingReel ? 200 : -170) * dt;
      barVel *= Math.pow(0.05, dt);
      barVel = Math.max(-58, Math.min(58, barVel));
      barPos += barVel * dt;
      const halfBar = rod.barWidth / 2;
      if (barPos <= halfBar) { barPos = halfBar; if (barVel < 0) barVel = 0; }
      if (barPos >= 100 - halfBar) { barPos = 100 - halfBar; if (barVel > 0) barVel = 0; }

      const distToCenter = Math.abs(fishPos - barPos);
      const inside = distToCenter <= halfBar + 4.5;
      const isPerfect = distToCenter <= halfBar * 0.42;
      catchProgress += (isPerfect ? 30 : inside ? 22 : -5) * dt;
      catchProgress = Math.max(0, Math.min(100, catchProgress));

      if (inside && now - lastTickSound > 160 && typeof window.playSynthTone === "function") {
        lastTickSound = now;
        window.playSynthTone((isPerfect ? 520 : 420) + catchProgress * 4.5, "sine", 0.04);
      }

      const barEl = document.getElementById("pf-bar");
      const trackEl = document.getElementById("pf-track");
      const fishEl = document.getElementById("pf-fish");
      const progEl = document.getElementById("pf-prog");
      const pctEl = document.getElementById("pf-pct");
      const statusEl = document.getElementById("pf-status");
      if (barEl) {
        barEl.style.left = (barPos - halfBar).toFixed(1) + "%";
        barEl.style.borderColor = isPerfect ? "#facc15" : inside ? "#4ade80" : "#ef4444";
        barEl.style.background = isPerfect ? "rgba(250,204,21,0.48)" : inside ? "rgba(34,197,94,0.46)" : "rgba(239,68,68,0.28)";
      }
      if (trackEl) {
        trackEl.style.borderColor = catchProgress >= 80 ? "#facc15" : catchProgress <= 20 ? "#ef4444" : (isStrongPull ? "#f97316" : "#38bdf8");
      }
      if (fishEl) {
        fishEl.style.left = fishPos.toFixed(1) + "%";
        const dirScale = fishPos >= prevFishPos ? -1 : 1;
        fishEl.style.transform = `translate(-50%,-50%) scaleX(${dirScale})`;
      }
      if (progEl) progEl.style.width = catchProgress.toFixed(1) + "%";
      if (pctEl) pctEl.textContent = Math.round(catchProgress) + "%";
      if (statusEl) {
        statusEl.textContent = isPerfect ? "⚡ PERFECT REEL!" : inside ? "✓ ZONA TEPAT!" : "⚠️ KEJAR IKANNYA!";
        statusEl.style.color = isPerfect ? "#fde047" : inside ? "#4ade80" : "#f87171";
      }

      if (jumpFishMesh3D && bobberMesh3D) {
        const jt = now * 0.012;
        jumpFishMesh3D.position.set(
          bobberMesh3D.position.x + Math.sin(jt) * 0.65,
          bobberMesh3D.position.y + Math.abs(Math.sin(jt * 1.4)) * 0.72,
          bobberMesh3D.position.z + Math.cos(jt) * 0.5
        );
        jumpFishMesh3D.rotation.y = -jt;
      }
      if (rodMesh3D) {
        rodMesh3D.rotation.x = Math.sin(now * 0.025) * (isHoldingReel ? 0.14 : 0.06);
      }

      if (catchProgress >= 100) { finishFishCatch(currentFishSpec, rod); return; }
      if (catchProgress <= 0) {
        catchCombo = 0;
        cancelFishing();
        if (typeof window.showToast === "function") window.showToast("💥 Senar putus! Ikannya terlalu kuat...");
        return;
      }
      reelRaf = requestAnimationFrame(stepReel);
    }
    reelRaf = requestAnimationFrame(stepReel);
  };

  function spawnRareCatchVFX(colorHex) {
    const sc = window.pirakuScene;
    const pm = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    if (!sc || !pm || typeof THREE === "undefined") return;
    const col = colorHex || 0xfde047;
    for (let i = 0; i < 18; i++) {
      const p = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.11, 0),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? col : 0xfde047, transparent: true, opacity: 0.95 })
      );
      const ang = (i / 18) * Math.PI * 2;
      const spd = 1.4 + Math.random() * 1.8;
      p.position.set(pm.position.x, pm.position.y + 1.1, pm.position.z);
      sc.add(p);
      rareVfxParticles.push({
        mesh: p,
        vx: Math.cos(ang) * spd * 0.04,
        vy: 0.06 + Math.random() * 0.06,
        vz: Math.sin(ang) * spd * 0.04,
        life: 1.0
      });
    }
  }

  function finishFishCatch(fish, rod) {
    catchCombo = Math.min(5, catchCombo + 1);
    const bobber = getEquippedBobber();
    cancelFishing();

    const streakMult = 1 + (catchCombo - 1) * 0.08;
    const kg = Number(((fish.minKg + Math.random() * (fish.maxKg - fish.minKg)) * streakMult).toFixed(1));
    const prevBest = loadJson("piraku_fish_best" + getUserSuf(), null);
    if (!prevBest || kg > (prevBest.kg || 0)) {
      localStorage.setItem("piraku_fish_best" + getUserSuf(), JSON.stringify({ name: fish.name, kg, rarity: fish.rarity }));
      markLocalFishTs();
      syncFishingToCloud();
    }
    if (galatamaEvent.active) {
      galatamaEvent.catches++;
      if (kg > galatamaEvent.bestKg) {
        galatamaEvent.bestKg = kg;
        galatamaEvent.bestFishName = fish.name;
        if (typeof window.showToast === "function") {
          window.showToast(`🏆 Rekor Galatama Baru: ${fish.name} (${kg} kg)!`);
        }
      }
    }
    if (["Mythic", "Secret", "Cosmic", "Divine"].includes(fish.rarity)) {
      spawnRareCatchVFX(fish.meshCol || 0xfde047);
    }
    let mutation = null;
    if (Math.random() < (rod.mutChance + (bobber.mutBoost || 0))) {
      mutation = MUTATIONS[Math.floor(Math.random() * MUTATIONS.length)];
    }
    const kgFactor = 1 + (kg / Math.max(2, fish.maxKg)) * 0.45;
    const coinVal = fish.baseCoin <= 0 ? 0 : Math.max(1, Math.round(fish.baseCoin * kgFactor * (mutation ? mutation.mult : 1) * 0.45));

    const bag = getBag();
    const caughtItem = {
      uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      id: fish.id, name: fish.name, icon: fish.icon, rarity: fish.rarity,
      kg, mutation: mutation ? mutation.label : "", coins: coinVal
    };
    bag.unshift(caughtItem);
    saveBag(bag);

    const dex = getDex();
    const prev = dex[fish.id];
    dex[fish.id] = { count: (prev ? prev.count : 0) + 1, bestKg: Math.max(prev ? prev.bestKg : 0, kg) };
    saveDex(dex);

    try {
      if (typeof window.playSynthTone === "function") window.playSynthTone(980, "sine", 0.35);
      if (typeof window.grantPirakuXP === "function") {
        const xpAmt = fish.rarity === "Mythic" ? 60 : fish.rarity === "Epic" ? 35 : fish.rarity === "Rare" ? 22 : 10;
        window.grantPirakuXP(xpAmt, "Mancing " + fish.name);
      }
    } catch (_) {}

    const rStyle = RARITY_STYLE[fish.rarity] || RARITY_STYLE.Common;
    try {
      if (typeof window.showToast === "function") {
        window.showToast(`${fish.icon} [${fish.rarity}] ${caughtItem.mutation ? caughtItem.mutation + " " : ""}${fish.name} (${kg} kg)${coinVal > 0 ? " • Jual di Kopdes: 🪙 " + coinVal : " • Sampah (0 🪙)"}!`);
      }
      if (["Epic", "Mythic", "Secret", "Cosmic", "Divine"].includes(fish.rarity) && typeof window.broadcastChatMessage === "function") {
        const myIg = localStorage.getItem("piraku_my_ig") || "Warga";
        window.broadcastChatMessage(`🎣 ${myIg} baru menangkap [${fish.rarity.toUpperCase()}${rStyle.odds ? " " + rStyle.odds : ""}] ${fish.name} (${kg} kg)!`);
      }
    } catch (_) {}

    const modal = ensureFishingModal();
    modal.style.zIndex = "99999";

    modal.style.display = "flex";
    modal.innerHTML = `
      <div style="width:100%;max-width:360px;background:#0f172a;border:2px solid ${rStyle.border};border-radius:20px;padding:20px;text-align:center;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
        <div style="margin-bottom:4px;">${renderFishArt(fish, 92)}</div>
        <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:10.5px;font-weight:900;background:${rStyle.bg};color:${rStyle.fg};border:1px solid ${rStyle.border};">${fish.rarity.toUpperCase()}${rStyle.odds ? " • " + rStyle.odds : ""}</span>
        ${catchCombo > 1 ? `<span style="margin-left:6px;display:inline-block;padding:3px 8px;border-radius:999px;font-size:10.5px;font-weight:900;background:#9a3412;color:#fde047;">🔥 ${catchCombo}x Streak</span>` : ""}
        <h3 style="margin:8px 0 4px;font-size:19px;font-weight:900;">${caughtItem.mutation ? caughtItem.mutation + " " : ""}${fish.name}</h3>
        <div style="font-size:12.5px;color:#cbd5e1;margin-bottom:14px;">Berat: <b>${kg} kg</b> • ${coinVal > 0 ? `Harga Jual (di Kopdes): <b style="color:#fde047;">🪙 ${coinVal}</b>` : `<b style="color:#94a3b8;">Sampah (0 🪙)</b>`}</div>
        <div style="display:flex;gap:8px;">
          <button onclick="document.getElementById('piraku-fishing-modal').style.display='none'; castPirakuFishingRod();" style="flex:1;border:none;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#fff;padding:11px;border-radius:12px;font-weight:900;cursor:pointer;">🎣 Lempar Lagi</button>
          <button onclick="toggleShowOffFish(0); document.getElementById('piraku-fishing-modal').style.display='none';" style="flex:1;border:none;background:linear-gradient(135deg,#f59e0b,#eab308);color:#0f172a;padding:11px;border-radius:12px;font-weight:900;cursor:pointer;">✨ Pamerkan!</button>
        </div>
        <button onclick="openFishingHubModal()" style="width:100%;margin-top:8px;border:none;background:#1e293b;color:#f8fafc;padding:9px;border-radius:12px;font-weight:800;border:1px solid #475569;cursor:pointer;">🎒 Buka Tas Ikan</button>
      </div>
    `;
    if (autoFishingEnabled) {
      _autoFishingTimer = setTimeout(() => {
        if (!autoFishingEnabled) return;
        const m = document.getElementById("piraku-fishing-modal");
        if (m) m.style.display = "none";
        if (getBag().length >= 1000) {
          autoFishingEnabled = false;
          lastPondSig = "";
          if (typeof window.showToast === "function") window.showToast("🎒 Tas ikan penuh (1000/1000)! Mancing Auto berhenti.");
          return;
        }
        if (fishState === "idle") window.castPirakuFishingRod();
      }, 1700);
    }
  }

  function ensureFishingModal() {
    let modal = document.getElementById("piraku-fishing-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "piraku-fishing-modal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.78);backdrop-filter:blur(6px);z-index:9999;display:none;align-items:center;justify-content:center;padding:16px;";
      modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
      document.body.appendChild(modal);
    }
    return modal;
  }

  window.toggleLockFish = function (bagIdx) {
    const bag = getBag();
    if (!bag[bagIdx]) return;
    bag[bagIdx].locked = !bag[bagIdx].locked;
    saveBag(bag);
    window.openFishingHubModal("bag");
  };

  const RARE_SELL_TIERS = ["Rare", "Epic", "Mythic", "Secret", "Cosmic", "Divine"];

  window.sellAllCaughtFish = function () {
    if (!isNearKopdes()) {
      if (typeof window.showToast === "function") window.showToast("🏪 Jalan kaki ke Kopdes Biru Putih dulu untuk menjual ikan!");
      return;
    }
    const bag = getBag();
    if (!bag.length) return;
    const lockedFish = bag.filter(f => f.locked);
    const toSell = bag.filter(f => !f.locked);
    if (!toSell.length) {
      if (typeof window.showToast === "function") window.showToast("🔒 Semua ikan di tas sedang dikunci! Buka kunci dulu jika ingin dijual.");
      return;
    }
    const rareToSell = toSell.filter(f => RARE_SELL_TIERS.includes(f.rarity));
    if (rareToSell.length > 0) {
      const preview = rareToSell.slice(0, 3).map(f => `[${f.rarity}] ${f.name}`).join(", ");
      const more = rareToSell.length > 3 ? ` +${rareToSell.length - 3} lainnya` : "";
      if (!confirm(`⚠️ Ada ${rareToSell.length} ikan langka yang belum dikunci (${preview}${more})!\n\nYakin mau JUAL SEMUA? (Tips: klik 🔒 dulu agar tidak ikut terjual)`)) {
        return;
      }
    }
    const validFish = toSell.filter(f => (Number(f.coins) || 0) > 0);
    const trashCount = toSell.length - validFish.length;
    const totalCoins = validFish.reduce((s, f) => s + (Number(f.coins) || 0), 0);
    saveBag(lockedFish);
    if (totalCoins > 0) {
      if (window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
        window.PirakuEconomy.addCoins(totalCoins, "Jual " + validFish.length + " Ikan di Kopdes");
      } else {
        const prev = parseInt(localStorage.getItem("piraku_coins") || "0", 10) || 0;
        localStorage.setItem("piraku_coins", String(prev + totalCoins));
      }
    }
    if (typeof window.showToast === "function") {
      window.showToast(totalCoins > 0
        ? `💰 Terjual ${validFish.length} ikan seharga 🪙 ${totalCoins}!${trashCount > 0 ? ` (${trashCount} sampah dibuang)` : ""}${lockedFish.length > 0 ? ` • 🔒 ${lockedFish.length} disimpan` : ""}`
        : `🗑️ ${trashCount} barang rusak dibuang (tidak bernilai koin).`);
    }
    window.openFishingHubModal("bag");
  };

  window.sellSingleCaughtFish = function (origIdx) {
    if (!isNearKopdes()) {
      if (typeof window.showToast === "function") window.showToast("🏪 Jalan kaki ke Kopdes Biru Putih dulu untuk menjual ikan!");
      return;
    }
    const bag = getBag();
    const item = bag[origIdx];
    if (!item || item.locked) return;
    if (RARE_SELL_TIERS.includes(item.rarity)) {
      if (!confirm(`⚠️ Yakin mau jual ikan langka [${item.rarity}] ${item.name} (${item.kg} kg)?\n(Tips: pakai tombol 🔒 untuk mengunci ikan)`)) {
        return;
      }
    }
    bag.splice(origIdx, 1);
    saveBag(bag);
    const c = Number(item.coins) || 0;
    if (c > 0 && window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
      window.PirakuEconomy.addCoins(c, "Jual " + item.name + " di Kopdes");
    }
    if (typeof window.showToast === "function") {
      window.showToast(c > 0 ? `💰 Terjual ${item.name} seharga 🪙 ${c}!` : `🗑️ ${item.name} dibuang (0 🪙).`);
    }
    window.openFishingHubModal("bag");
  };

  window.buyOrEquipFishingRod = function (rodId) {
    const rod = RODS.find(r => r.id === rodId);
    if (!rod) return;
    const owned = getOwnedRods();
    if (!owned.includes(rodId)) {
      if (!isNearKopdes()) {
        if (typeof window.showToast === "function") window.showToast("🏪 Jalan kaki ke Kopdes Biru Putih untuk membeli / upgrade joran!");
        return;
      }
      if (window.PirakuEconomy && !window.PirakuEconomy.spendCoins(rod.cost, "Beli " + rod.name + " di Kopdes")) return;
      owned.push(rodId);
      saveOwnedRods(owned);
    }
    setEquippedRodId(rodId);
    if (typeof window.showToast === "function") window.showToast(`${rod.badge} Memakai ${rod.name}!`);
    window.openFishingHubModal();
  };

  window.buyOrEquipBobber = function (bobId) {
    const bob = BOBBERS.find(b => b.id === bobId);
    if (!bob) return;
    const owned = getOwnedBobbers();
    if (!owned.includes(bobId)) {
      if (!isNearKopdes()) {
        if (typeof window.showToast === "function") window.showToast("🏪 Jalan kaki ke Kopdes Biru Putih untuk beli umbul-umbul!");
        return;
      }
      if (window.PirakuEconomy && !window.PirakuEconomy.spendCoins(bob.cost, "Beli " + bob.name + " di Kopdes")) return;
      owned.push(bobId);
      saveOwnedBobbers(owned);
    }
    setEquippedBobberId(bobId);
    if (typeof window.showToast === "function") window.showToast(`${bob.icon} ${bob.name} dipasang!`);
    window.openFishingHubModal();
  };

  let activeHubTab = "bag";
  window.openFishingHubModal = function (tabName) {
    const prevTab = activeHubTab;
    if (tabName) activeHubTab = tabName;
    const isSameTab = !tabName || tabName === prevTab;
    const modal = ensureFishingModal();
    const bag = getBag();
    const dex = getDex();
    const owned = getOwnedRods();
    const eqId = getEquippedRodId();
    const ownedBobbers = getOwnedBobbers();
    const eqBobber = getEquippedBobberId();
    const sellableBag = bag.filter(f => !f.locked);
    const totalVal = sellableBag.reduce((s, f) => s + (Number(f.coins) || 0), 0);
    const caughtTypes = Object.keys(dex).length;
    const atKopdes = isNearKopdes();

    const curMapId = window.pirakuActiveMapId || "bandung_wetan";
    const exFish = (window.pirakuInDistrict && DISTRICT_EXCLUSIVE_FISH[curMapId]) ? DISTRICT_EXCLUSIVE_FISH[curMapId] : null;
    const bestCatch = loadJson("piraku_fish_best" + getUserSuf(), null);
    const myCoins = (window.PirakuEconomy && typeof window.PirakuEconomy.getState === "function")
      ? (Number(window.PirakuEconomy.getState().coins) || 0)
      : (parseInt(localStorage.getItem("piraku_coins") || "0", 10) || 0);

    const prevScrollEl = document.getElementById("piraku-fishing-scroll");
    const savedScrollTop = (isSameTab && prevScrollEl) ? prevScrollEl.scrollTop : 0;

    modal.style.display = "flex";
    modal.innerHTML = `
      <div style="width:100%;max-width:440px;max-height:86vh;display:flex;flex-direction:column;background:#0f172a;border:1.5px solid #38bdf8;border-radius:20px;overflow:hidden;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
        <div style="padding:12px 16px 10px;background:linear-gradient(135deg,#0284c7,#1e3a8a);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div>
              <div style="font-weight:900;font-size:15px;">🎣 Tas &amp; Perlengkapan Mancing</div>
              <div style="font-size:11px;color:#e0f2fe;">Fishdex: ${caughtTypes}/${ALL_FISH_CATALOG.length} Jenis • ${window.pirakuCurrentEventId === "rain" ? "🌧️ Hujan 2x Rare!" : getActivePond().name}</div>
              ${bestCatch ? `<div style="font-size:10.5px;color:#fde047;font-weight:800;margin-top:2px;">🏆 Rekor Terberat: ${bestCatch.name} (${bestCatch.kg} kg)</div>` : ""}
            </div>
            <button onclick="document.getElementById('piraku-fishing-modal').style.display='none'" style="border:none;background:rgba(15,23,42,0.45);color:#fff;width:30px;height:30px;border-radius:999px;cursor:pointer;font-weight:800;">✕</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <button onclick="openFishingHubModal('bag')" style="border:none;padding:7px;border-radius:10px;font-size:11.5px;font-weight:900;cursor:pointer;background:${activeHubTab === "bag" ? "#f8fafc" : "rgba(15,23,42,0.45)"};color:${activeHubTab === "bag" ? "#0f172a" : "#e0f2fe"};">🎒 Tas &amp; Toko</button>
            <button onclick="openFishingHubModal('dex')" style="border:none;padding:7px;border-radius:10px;font-size:11.5px;font-weight:900;cursor:pointer;background:${activeHubTab === "dex" ? "#facc15" : "rgba(15,23,42,0.45)"};color:${activeHubTab === "dex" ? "#0f172a" : "#fde047"};">📖 Fishdex (${caughtTypes}/${ALL_FISH_CATALOG.length})</button>
          </div>
        </div>
        ${activeHubTab === "dex" ? `
        <div id="piraku-fishing-scroll" style="padding:12px 14px;overflow-y:auto;">
          <div style="font-size:11px;font-weight:900;color:#7dd3fc;margin-bottom:7px;">🏛️ PUSAT KOTA BANDUNG (${FISH_CATALOG.length} Jenis)</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px;">
            ${FISH_CATALOG.map(f => {
              const d = dex[f.id];
              const rs = RARITY_STYLE[f.rarity] || RARITY_STYLE.Common;
              return `
                <div style="background:rgba(30,41,59,${d ? "0.85" : "0.45"});border:1px solid ${d ? rs.border : "rgba(148,163,184,0.18)"};border-radius:12px;padding:9px;text-align:center;">
                  <div style="margin-bottom:4px;${d ? "" : "filter:brightness(0) opacity(0.35);"}">${renderFishArt(f, 42)}</div>
                  <div style="font-size:11.5px;font-weight:900;color:${d ? "#f8fafc" : "#64748b"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${d ? f.name : "???"}</div>
                  <span style="display:inline-block;margin-top:3px;padding:2px 7px;border-radius:999px;font-size:9px;font-weight:900;background:${rs.bg};color:${rs.fg};">${f.rarity.toUpperCase()}${rs.odds ? " • " + rs.odds : ""}</span>
                  <div style="font-size:10px;color:${d ? "#fde047" : "#475569"};margin-top:3px;">${d ? `Rekor: ${d.bestKg} kg (${d.count}x)` : "Belum tertangkap"}</div>
                </div>
              `;
            }).join("")}
          </div>
          <div style="font-size:11px;font-weight:900;color:#fde047;margin-bottom:7px;">🏙️ IKAN UNIK 29 KECAMATAN (MYTHIC–DIVINE)</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
            ${Object.values(DISTRICT_EXCLUSIVE_FISH).map(f => {
              const d = dex[f.id];
              const rs = RARITY_STYLE[f.rarity] || RARITY_STYLE.Mythic;
              return `
                <div style="background:rgba(30,41,59,${d ? "0.85" : "0.45"});border:1px solid ${d ? rs.border : "rgba(148,163,184,0.18)"};border-radius:12px;padding:9px;text-align:center;">
                  <div style="font-size:9.5px;font-weight:900;color:#93c5fd;margin-bottom:2px;">📍 Kec. ${f.districtName}</div>
                  <div style="margin-bottom:4px;${d ? "" : "filter:brightness(0) opacity(0.35);"}">${renderFishArt(f, 42)}</div>
                  <div style="font-size:11px;font-weight:900;color:${d ? "#f8fafc" : "#64748b"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${d ? f.name : "???"}</div>
                  <span style="display:inline-block;margin-top:3px;padding:2px 7px;border-radius:999px;font-size:9px;font-weight:900;background:${rs.bg};color:${rs.fg};">${f.rarity.toUpperCase()}</span>
                  <div style="font-size:10px;color:${d ? "#fde047" : "#475569"};margin-top:3px;">${d ? `Rekor: ${d.bestKg} kg (${d.count}x)` : "Cari di kolam kec. ini!"}</div>
                </div>
              `;
            }).join("")}
          </div>
        </div>` : `
        <div id="piraku-fishing-scroll" style="padding:12px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;">
          ${exFish ? `<div style="padding:8px 10px;border-radius:10px;background:rgba(168,85,247,0.16);border:1px solid #c084fc;font-size:11px;color:#f5d0fe;">🌟 Ikan Unik <b>Kec. ${exFish.districtName}</b>: <b>${exFish.name}</b> [${exFish.rarity.toUpperCase()}] bisa didapat di kolam ini!</div>` : ""}
          <div style="padding:9px 11px;border-radius:11px;background:${atKopdes ? "rgba(34,197,94,0.16)" : "rgba(245,158,11,0.16)"};border:1px solid ${atKopdes ? "#22c55e" : "#f59e0b"};font-size:11.5px;color:${atKopdes ? "#86efac" : "#fde047"};line-height:1.4;">
            ${atKopdes
              ? "✅ Kamu berada di <b>Kopdes Biru Putih</b> — siap jual ikan, beli umbul-umbul, &amp; upgrade joran!"
              : "🏪 Untuk jual ikan, beli umbul-umbul, atau upgrade joran, silakan <b>jalan kaki ke Kopdes Biru Putih</b> (" + (window.pirakuInDistrict ? "seberang jalan komplek timur" : "di belakang Museum Geologi") + ")."}
          </div>

          ${bag.length ? `<button onclick="sellAllCaughtFish()" style="width:100%;border:none;background:${atKopdes && sellableBag.length ? "linear-gradient(135deg,#facc15,#f59e0b)" : "#334155"};color:${atKopdes && sellableBag.length ? "#0f172a" : "#cbd5e1"};padding:10px;border-radius:11px;font-weight:900;font-size:12px;cursor:pointer;">💰 ${sellableBag.length === 0 ? "Semua " + bag.length + " Ikan Dikunci 🔒" : (atKopdes ? "Jual " + sellableBag.length + " Ikan (🪙 " + totalVal + ")" : "Jual " + sellableBag.length + " Ikan di Kopdes (🪙 " + totalVal + ")")}</button>` : ""}
          <button onclick="toggleHoldFishingRod()" style="width:100%;border:1px solid ${window.pirakuHoldRodOut ? "#facc15" : "#38bdf8"};background:${window.pirakuHoldRodOut ? "rgba(250,204,21,0.18)" : "rgba(56,189,248,0.14)"};color:${window.pirakuHoldRodOut ? "#fde047" : "#7dd3fc"};padding:8px 10px;border-radius:11px;font-weight:900;font-size:11.5px;cursor:pointer;">${window.pirakuHoldRodOut ? "🎒 Simpan Joran ke Punggung" : "✨ Keluarkan & Pamerkan Joran di Tangan"}</button>

          <div>
            <div style="font-size:11px;font-weight:900;color:#93c5fd;text-transform:uppercase;margin-bottom:6px;">🎈 Umbul-umbul / Pelampung</div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">
              ${BOBBERS.map(b => {
                const isOwn = ownedBobbers.includes(b.id);
                const isEq = eqBobber === b.id;
                const canAfford = isOwn || myCoins >= b.cost;
                return `
                  <button onclick="buyOrEquipBobber('${b.id}')" style="text-align:left;border:1px solid ${isEq ? "#38bdf8" : "rgba(148,163,184,0.22)"};background:${isEq ? "rgba(56,189,248,0.18)" : (canAfford ? "rgba(30,41,59,0.75)" : "rgba(15,23,42,0.55)")};opacity:${canAfford ? "1" : "0.6"};padding:8px 9px;border-radius:10px;color:#f8fafc;cursor:pointer;">
                    <div style="font-size:12px;font-weight:800;">${b.icon} ${b.name}</div>
                    <div style="font-size:10px;color:#94a3b8;margin-top:2px;">${b.desc}</div>
                    <div style="font-size:10px;font-weight:900;color:${isEq ? "#4ade80" : (canAfford ? "#fde047" : "#64748b")};margin-top:4px;">${isEq ? "Dipakai ✓" : (isOwn ? "Pasang" : (atKopdes ? "Beli 🪙 " + b.cost.toLocaleString("id-ID") : "🏪 Kopdes (🪙" + b.cost.toLocaleString("id-ID") + ")"))}</div>
                  </button>
                `;
              }).join("")}
            </div>
          </div>

          <div>
            <div style="font-size:11px;font-weight:900;color:#93c5fd;text-transform:uppercase;margin-bottom:6px;">🎣 Upgrade Joran</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${RODS.map(r => {
                const isOwn = owned.includes(r.id);
                const isEq = eqId === r.id;
                const canAfford = isOwn || myCoins >= r.cost;
                return `
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;background:rgba(30,41,59,0.8);border:1px solid ${isEq ? "#38bdf8" : "rgba(148,163,184,0.2)"};opacity:${canAfford ? "1" : "0.62"};padding:8px 10px;border-radius:11px;">
                    <div style="min-width:0;">
                      <div style="font-weight:800;font-size:12.5px;">${r.badge} ${r.name}</div>
                      <div style="font-size:10px;color:#7dd3fc;">${r.tierNote || ""}</div>
                      <div style="font-size:10px;color:#94a3b8;">Bar ${r.barWidth}% • Luck +${Math.round(r.luckBonus * 100)}% • Mutasi ${Math.round(r.mutChance * 100)}%</div>
                    </div>
                    <button onclick="buyOrEquipFishingRod('${r.id}')" style="border:none;background:${isEq ? "#22c55e" : isOwn ? "#334155" : (!canAfford ? "#334155" : (atKopdes ? "#facc15" : "#475569"))};color:${isEq || (!isOwn && atKopdes && canAfford) ? "#0f172a" : (canAfford ? "#f8fafc" : "#94a3b8")};padding:6px 10px;border-radius:9px;font-weight:900;font-size:11px;cursor:pointer;">${isEq ? "Dipakai ✓" : isOwn ? "Pakai" : (atKopdes ? "🪙 " + r.cost.toLocaleString("id-ID") : "🏪 Kopdes (🪙" + r.cost.toLocaleString("id-ID") + ")")}</button>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <div>
            <div style="font-size:11px;font-weight:900;color:#93c5fd;text-transform:uppercase;margin-bottom:6px;">🍱 Makanan &amp; Barang (${getItemBag().length})</div>
            ${(() => {
              const items = getItemBag();
              if (items.length === 0) {
                return `<div style="font-size:11.5px;color:#94a3b8;background:rgba(30,41,59,0.5);padding:9px;border-radius:10px;text-align:center;margin-bottom:10px;">Belum ada makanan/barang. Beli &amp; simpan jajanan di Kopdes!</div>`;
              }
              return `<div style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px;">
                ${items.slice(0, 12).map((it, idx) => `
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;background:rgba(30,41,59,0.75);padding:7px 10px;border-radius:10px;border-left:3px solid #22c55e;">
                    <span style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;flex:1;min-width:0;">
                      <span style="font-size:17px;">${it.icon}</span>
                      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${it.name} <span style="color:#4ade80;font-weight:700;">(+${it.boostSec}d)</span></span>
                    </span>
                    <button onclick="usePirakuBagItem(${idx})" style="border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;padding:4px 9px;border-radius:8px;font-size:10.5px;font-weight:900;cursor:pointer;white-space:nowrap;">🍽️ Makan</button>
                  </div>
                `).join("")}
              </div>`;
            })()}
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
              <div style="font-size:11px;font-weight:900;color:#93c5fd;text-transform:uppercase;">🎒 Tas Ikan (${bag.length})</div>
              ${bag.length > 0 ? `<div style="display:flex;gap:4px;flex-wrap:wrap;">
                ${[
                  { id: "all",    label: "Semua" },
                  { id: "locked", label: "🔒 Terkunci" },
                  { id: "rare",   label: "✨ Mythic+" }
                ].map(flt => {
                  const act = (window._pirakuBagFilter || "all") === flt.id;
                  return `<button onclick="window._pirakuBagFilter='${flt.id}';openFishingHubModal();" style="border:1px solid ${act ? "#facc15" : "rgba(148,163,184,0.28)"};background:${act ? "rgba(250,204,21,0.22)" : "#1e293b"};color:${act ? "#fde047" : "#94a3b8"};padding:3px 7px;border-radius:999px;font-size:10px;font-weight:800;cursor:pointer;">${flt.label}</button>`;
                }).join("")}
                ${bag.length > 1 ? [
                  { id: "newest", label: "🕒 Terbaru" },
                  { id: "rarity", label: "🌟 Terlangka" },
                  { id: "type",   label: "🐟 Jenis" }
                ].map(s => {
                  const act = (window._pirakuBagSort || "newest") === s.id;
                  return `<button onclick="setPirakuBagSort('${s.id}')" style="border:1px solid ${act ? "#38bdf8" : "rgba(148,163,184,0.28)"};background:${act ? "rgba(56,189,248,0.22)" : "#1e293b"};color:${act ? "#7dd3fc" : "#94a3b8"};padding:3px 7px;border-radius:999px;font-size:10px;font-weight:800;cursor:pointer;">${s.label}</button>`;
                }).join("") : ""}
              </div>` : ""}
            </div>
            ${bag.length === 0
              ? `<div style="font-size:11.5px;color:#94a3b8;background:rgba(30,41,59,0.5);padding:10px;border-radius:10px;text-align:center;">Belum ada ikan di tas. Pergi ke kolam & lempar joran!</div>`
              : `<div style="display:flex;flex-direction:column;gap:5px;">
                  ${(() => {
                    const rankMap = { Divine: 8, Cosmic: 7, Secret: 6, Mythic: 5, Epic: 4, Rare: 3, Uncommon: 2, Common: 1 };
                    const sortMode = window._pirakuBagSort || "newest";
                    const filterMode = window._pirakuBagFilter || "all";
                    let indexed = bag.map((f, origIdx) => ({ f, origIdx }));
                    if (filterMode === "locked") indexed = indexed.filter(x => x.f.locked);
                    else if (filterMode === "rare") indexed = indexed.filter(x => (rankMap[x.f.rarity] || 0) >= 5);
                    if (sortMode === "rarity") {
                      indexed.sort((a, b) => (rankMap[b.f.rarity] || 0) - (rankMap[a.f.rarity] || 0) || (b.f.coins || 0) - (a.f.coins || 0) || a.origIdx - b.origIdx);
                    } else if (sortMode === "type") {
                      indexed.sort((a, b) => String(a.f.name).localeCompare(String(b.f.name)) || (rankMap[b.f.rarity] || 0) - (rankMap[a.f.rarity] || 0));
                    }
                    if (indexed.length === 0) return `<div style="font-size:11px;color:#94a3b8;padding:10px;text-align:center;">Tidak ada ikan yang cocok dengan filter ini.</div>`;
                    return indexed.slice(0, 1000).map(({ f, origIdx }) => {
                      const rs = RARITY_STYLE[f.rarity] || RARITY_STYLE.Common;
                      const isShown = window.pirakuShownFish && window.pirakuShownFish.id === f.id && window.pirakuShownFish.kg === f.kg;
                      return `<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;background:rgba(30,41,59,0.75);padding:7px 10px;border-radius:10px;border-left:3px solid ${rs.border};">
                        <span style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;flex:1;min-width:0;">${renderFishArt(f, 28)} <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${f.mutation ? f.mutation + " " : ""}${f.name} <span style="color:#94a3b8;font-weight:600;">(${f.kg} kg)</span></span></span>
                        <span style="font-size:11px;font-weight:900;color:#fde047;white-space:nowrap;">🪙 ${f.coins}</span>
                        ${atKopdes && !f.locked && f.coins > 0 ? `<button onclick="sellSingleCaughtFish(${origIdx})" style="border:none;background:#22c55e;color:#052e16;padding:4px 7px;border-radius:8px;font-size:10px;font-weight:900;cursor:pointer;">Jual</button>` : ""}
                        <button onclick="toggleLockFish(${origIdx})" title="${f.locked ? "Buka Kunci" : "Kunci agar tidak ikut terjual"}" style="border:none;background:${f.locked ? "#f59e0b" : "#334155"};color:${f.locked ? "#0f172a" : "#cbd5e1"};padding:4px 7px;border-radius:8px;font-size:10.5px;font-weight:900;cursor:pointer;">${f.locked ? "🔒" : "🔓"}</button>
                        <button onclick="toggleShowOffFish(${origIdx})" style="border:none;background:${isShown ? "#ef4444" : "#38bdf8"};color:${isShown ? "#fff" : "#0f172a"};padding:4px 8px;border-radius:8px;font-size:10.5px;font-weight:900;cursor:pointer;white-space:nowrap;">${isShown ? "Simpan" : "✨ Pamer"}</button>
                      </div>`;
                    }).join("");
                  })()}
                </div>`}
          </div>
        </div>`}
      </div>
    `;
    const nextScrollEl = document.getElementById("piraku-fishing-scroll");
    if (nextScrollEl && savedScrollTop > 0) {
      nextScrollEl.scrollTop = savedScrollTop;
      requestAnimationFrame(() => { nextScrollEl.scrollTop = savedScrollTop; });
    }
  };

  window.setPirakuBagSort = function (mode) {
    window._pirakuBagSort = mode || "newest";
    window.openFishingHubModal("bag");
  };

  window.sellSingleCaughtFish = function (origIdx) {
    if (!isNearKopdes()) {
      if (typeof window.showToast === "function") window.showToast("🏪 Jalan kaki ke Kopdes Biru Putih dulu untuk menjual ikan!");
      return;
    }
    const bag = getBag();
    const item = bag[origIdx];
    if (!item || item.locked) return;
    bag.splice(origIdx, 1);
    saveBag(bag);
    const c = Number(item.coins) || 0;
    if (c > 0 && window.PirakuEconomy && typeof window.PirakuEconomy.addCoins === "function") {
      window.PirakuEconomy.addCoins(c, "Jual " + item.name + " di Kopdes");
    }
    if (typeof window.showToast === "function") {
      window.showToast(c > 0 ? `💰 Terjual ${item.name} seharga 🪙 ${c}!` : `🗑️ ${item.name} dibuang (0 🪙).`);
    }
    window.openFishingHubModal("bag");
  };

  window.addEventListener("keydown", (e) => {
    const t = e.target || document.activeElement;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
    if (e.code !== "Space") return;
    if (fishState === "casting" && _finishPowerCastFn) { e.preventDefault(); _finishPowerCastFn(); }
    else if (fishState === "bite") { e.preventDefault(); window.strikePirakuFish(); }
    else if (fishState === "reeling") { e.preventDefault(); isHoldingReel = true; }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "Space" && fishState === "reeling") isHoldingReel = false;
  });

  window.addEventListener("pointerdown", (e) => {
    const t = e.target;
    if (t && t.closest && t.closest("input, textarea, select, [contenteditable]")) return;
    if (t && t.closest && t.closest("button") && (t.closest("button").textContent || "").trim() === "✕") return;
    if (fishState === "bite") {
      window.strikePirakuFish();
    } else if (fishState === "reeling") {
      isHoldingReel = true;
    }
  });
  window.addEventListener("pointerup", () => {
    if (fishState === "reeling") isHoldingReel = false;
  });
  window.addEventListener("pointercancel", () => {
    if (fishState === "reeling") isHoldingReel = false;
  });

  let lastPondSig = "";
  let _barEl = null;
  let _worldPinEl = null;
  let _pinVec = null;
  let _lastPinX = -9999;
  let _lastPinY = -9999;
  function tickFishing3D() {
    ensureTamanLansiaPondVisible();
    ensureDistrictPondVisible();
    updateGalatamaHud();
    const isRainNow = window.pirakuCurrentEventId === "rain";
    if (isRainNow && !_lastWasRainEvent) showRainLuckBanner();
    _lastWasRainEvent = isRainNow;
    const pm = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    const pond = getActivePond();
    const now = performance.now();

    // Animasi riak air & ikan koi berenang di Danau Taman Lansia & Kolam Kecamatan
    if (_pondWaterTex) {
      _pondWaterTex.offset.x = (now * 0.000035) % 1;
      _pondWaterTex.offset.y = (now * 0.000022) % 1;
    }
    if (pondKoiList.length && lansiaPondGroup && lansiaPondGroup.visible) {
      const kt = now * 0.001;
      for (let i = 0; i < pondKoiList.length; i++) {
        const k = pondKoiList[i];
        const a = kt * k.speed + k.phase;
        const nx = k.cx + Math.cos(a) * k.rx;
        const nz = k.cz + Math.sin(a) * k.rz;
        k.mesh.position.set(nx, 0.14, nz);
        k.mesh.rotation.y = Math.atan2(-Math.sin(a) * k.rx, Math.cos(a) * k.rz);
        if (k.mesh.userData && k.mesh.userData.tailGroup) {
          k.mesh.userData.tailGroup.rotation.y = Math.sin(now * 0.012 + k.phase) * 0.35;
        }
      }
    }
    if (districtKoiList.length && districtPondGroup && districtPondGroup.visible) {
      const kt = now * 0.001;
      for (let i = 0; i < districtKoiList.length; i++) {
        const k = districtKoiList[i];
        const a = kt * k.speed + k.phase;
        k.mesh.position.set(k.cx + Math.cos(a) * k.rx, 0.14, k.cz + Math.sin(a) * k.rz);
        k.mesh.rotation.y = Math.atan2(-Math.sin(a) * k.rx, Math.cos(a) * k.rz);
        if (k.mesh.userData && k.mesh.userData.tailGroup) {
          k.mesh.userData.tailGroup.rotation.y = Math.sin(now * 0.012 + k.phase) * 0.35;
        }
      }
    }
    // Animasi NPC pemancing & partikel selebrasi ikan langka
    for (let i = 0; i < npcAnglerList.length; i++) {
      const na = npcAnglerList[i];
      if (na.armR) na.armR.rotation.x = -0.82 + Math.sin(now * 0.0025 + na.phase) * 0.08;
    }
    for (let i = rareVfxParticles.length - 1; i >= 0; i--) {
      const rp = rareVfxParticles[i];
      rp.mesh.position.x += rp.vx;
      rp.mesh.position.y += rp.vy;
      rp.mesh.position.z += rp.vz;
      rp.mesh.rotation.y += 0.14;
      rp.life -= 0.022;
      rp.mesh.material.opacity = Math.max(0, rp.life);
      if (rp.life <= 0) {
        if (window.pirakuScene) window.pirakuScene.remove(rp.mesh);
        rareVfxParticles.splice(i, 1);
      }
    }

    // Cek status masuk air danau (posisi Y ditangani oleh getPirakuFishingGroundY di main.js)
    if (pm && pm.position) {
      const inWater = isPlayerInLakeWater(pm.position.x, pm.position.z);
      if (inWater) {
        if (!wasInWater) {
          wasInWater = true;
          if (fishState !== "idle") cancelFishing();
          if (typeof window.showToast === "function") window.showToast("💦 Kecemplung danau! Naik ke dermaga atau tepian!");
        }
      } else {
        wasInWater = false;
      }
    }

    if (fishState !== "idle" && pm && pm.userData && pm.userData.a) {
      animateFishingPose(pm.userData.a, rodMesh3D, fishState, now, castAnimStart);
    }
    if (rodMesh3D) {
      animateRodEffects(rodMesh3D, now);
    }
    if (pm) {
      const eqRod = getEquippedRod();
      const holdOut = Boolean(window.pirakuHoldRodOut && fishState === "idle");
      window.pirakuCarriedRodState = (fishState === "idle" && (holdOut || eqRod.id !== "bamboo"))
        ? { id: eqRod.id, hold: holdOut }
        : null;
      window.syncEquippedRodVisual(pm, eqRod.id, holdOut, fishState !== "idle", now);
    }
    if (rippleMesh3D && fishState !== "idle") {
      const rp = ((now * (fishState === "reeling" ? 0.0024 : 0.0016)) % 1);
      rippleMesh3D.scale.setScalar(1 + rp * (fishState === "waiting" ? 1.9 : 3.2));
      rippleMesh3D.material.opacity = (1 - rp) * 0.75;
    }
    if (bobberMesh3D && fishState !== "idle") {
      const t = now * 0.006;
      bobberMesh3D.position.y = pond.waterY + (fishState === "waiting" ? Math.sin(t) * 0.03 : Math.sin(t * 4.5) * 0.14);
      if ((fishState === "bite" || fishState === "reeling") && now - (bobberMesh3D._lastSplash || 0) > 140 && window.pirakuScene && typeof THREE !== "undefined") {
        bobberMesh3D._lastSplash = now;
        for (let sp = 0; sp < 3; sp++) {
          const drop = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.9 })
          );
          const ang = Math.random() * Math.PI * 2;
          drop.position.set(bobberMesh3D.position.x, pond.waterY + 0.06, bobberMesh3D.position.z);
          window.pirakuScene.add(drop);
          rareVfxParticles.push({
            mesh: drop,
            vx: Math.cos(ang) * 0.035,
            vy: 0.055 + Math.random() * 0.04,
            vz: Math.sin(ang) * 0.035,
            life: 0.7
          });
        }
      }
    }
    if (lineMesh3D && rodMesh3D && bobberMesh3D && fishState !== "idle") {
      updateFishingLine(lineMesh3D, rodMesh3D, bobberMesh3D);
    }

    // Prompt mancing di KANAN BAWAH (bottom: 76px, right: 12px) agar bersih dari Obrolan & Analog kiri bawah!
    if (!_barEl && document.body) {
      _barEl = document.getElementById("piraku-fishing-prompt");
      if (!_barEl) {
        _barEl = document.createElement("div");
        _barEl.id = "piraku-fishing-prompt";
        _barEl.style.cssText = "position:fixed;bottom:calc(134px + env(safe-area-inset-bottom));right:14px;z-index:65;pointer-events:auto;display:none;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;background:rgba(15,23,42,0.94);backdrop-filter:blur(10px);border:1.5px solid #38bdf8;color:#f8fafc;font-size:10.5px;font-weight:800;box-shadow:0 10px 24px rgba(0,0,0,0.6);white-space:nowrap;";
        document.body.appendChild(_barEl);
      }
    }

    const distToPond = (pm && pm.position) ? Math.hypot(pm.position.x - pond.x, pm.position.z - pond.z) : 999;
    const nearPond = Boolean(pm && pm.position && fishState === "idle" && !wasInWater && distToPond <= pond.radius);

    // Pin lokasi HTML proyeksi 3D "🎣 Mancing di sini" (GPU translate3d tanpa layout reflow)
    if (!_worldPinEl && document.body) {
      _worldPinEl = document.getElementById("piraku-fishing-world-pin");
      if (!_worldPinEl) {
        _worldPinEl = document.createElement("div");
        _worldPinEl.id = "piraku-fishing-world-pin";
        _worldPinEl.style.cssText = "position:fixed;left:0;top:0;z-index:20;display:none;flex-direction:column;align-items:center;pointer-events:auto;cursor:pointer;will-change:transform;";
        _worldPinEl.innerHTML = `<div style="background:linear-gradient(135deg,#0284c7,#1d4ed8);border:2px solid #fde047;color:#ffffff;font-size:12px;font-weight:900;padding:5px 12px;border-radius:999px;box-shadow:0 6px 18px rgba(2,132,199,0.55);white-space:nowrap;letter-spacing:0.2px;">🎣 Mancing di sini</div><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #fde047;margin-top:-1px;"></div>`;
        _worldPinEl.onclick = () => { if (typeof window.guideToPirakuFishingSpot === "function") window.guideToPirakuFishingSpot(); };
        document.body.appendChild(_worldPinEl);
      }
    }
    const hidePinDist = window.pirakuInDistrict ? 10.5 : 13.5;
    const atLakeArea = Boolean(pm && pm.position && (distToPond <= hidePinDist || isPlayerOnPier(pm.position.x, pm.position.z) || isPlayerInLakeWater(pm.position.x, pm.position.z) || fishState !== "idle"));
    if (_worldPinEl) {
      if (!atLakeArea && window.pirakuCamera && typeof THREE !== "undefined") {
        if (!_pinVec) _pinVec = new THREE.Vector3();
        const pinX = window.pirakuInDistrict ? 42.0 : 32.5;
        const pinZ = window.pirakuInDistrict ? 13.0 : 16.0;
        _pinVec.set(pinX, 2.7 + Math.sin(now * 0.0035) * 0.16, pinZ).project(window.pirakuCamera);
        const sx = (_pinVec.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-_pinVec.y * 0.5 + 0.5) * window.innerHeight;
        if (_pinVec.z < 1 && sx > -80 && sx < window.innerWidth + 80 && sy > 20 && sy < window.innerHeight + 40) {
          if (Math.abs(sx - _lastPinX) >= 0.5 || Math.abs(sy - _lastPinY) >= 0.5) {
            _lastPinX = sx;
            _lastPinY = sy;
            _worldPinEl.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0) translate(-50%,-100%)`;
          }
          if (_worldPinEl.style.display !== "flex") _worldPinEl.style.display = "flex";
        } else if (_worldPinEl.style.display !== "none") {
          _worldPinEl.style.display = "none";
        }
      } else if (_worldPinEl.style.display !== "none") {
        _worldPinEl.style.display = "none";
      }
    }
    if (window.pirakuActiveMinimapTarget && window.pirakuActiveMinimapTarget.isFishingGuide && distToPond <= 13.5) {
      window.pirakuActiveMinimapTarget = null;
    }

    if (_barEl && fishState === "idle") {
      const bLen = getBagLen();
      const holdFlag = window.pirakuHoldRodOut ? "1" : "0";
      const autoFlag = autoFishingEnabled ? "1" : "0";
      const galFlag = galatamaEvent.active ? "1" : "0";
      const autoUnlocked = getOwnedRods().some(id => id !== "bamboo");
      const sig = (nearPond ? "near_" : "far_") + pond.name + "_" + bLen + "_" + holdFlag + "_" + autoFlag + "_" + galFlag + "_" + (autoUnlocked ? "1" : "0");
      if (lastPondSig !== sig) {
        lastPondSig = sig;
        const autoLabel = autoFishingEnabled ? "🤖 Auto: ON" : (autoUnlocked ? "🤖 Auto" : "🔒 Auto");
        _barEl.innerHTML = (nearPond ? `<button onclick="castPirakuFishingRod()" style="border:none;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#fff;padding:6px 12px;border-radius:999px;font-weight:900;font-size:11px;cursor:pointer;white-space:nowrap;">🎣 Lempar Joran</button><button onclick="toggleAutoPirakuFishing()" style="border:1px solid ${autoFishingEnabled ? "#4ade80" : (autoUnlocked ? "#38bdf8" : "#64748b")};background:${autoFishingEnabled ? "rgba(34,197,94,0.22)" : "#0f172a"};color:${autoFishingEnabled ? "#4ade80" : (autoUnlocked ? "#7dd3fc" : "#94a3b8")};padding:6px 10px;border-radius:999px;font-weight:900;font-size:11px;cursor:pointer;white-space:nowrap;">${autoLabel}</button><button onclick="startPirakuGalatama()" style="border:1px solid #facc15;background:${galatamaEvent.active ? "rgba(250,204,21,0.24)" : "#0f172a"};color:#fde047;padding:6px 9px;border-radius:999px;font-weight:900;font-size:11px;cursor:pointer;white-space:nowrap;">🏆 Galatama</button>` : "") +
          `<button onclick="toggleHoldFishingRod()" title="Keluarkan/Simpan Joran" style="border:1px solid ${window.pirakuHoldRodOut ? "#facc15" : "#38bdf8"};background:${window.pirakuHoldRodOut ? "rgba(250,204,21,0.2)" : "#0f172a"};color:${window.pirakuHoldRodOut ? "#fde047" : "#7dd3fc"};padding:6px 9px;border-radius:999px;font-weight:900;font-size:11px;cursor:pointer;white-space:nowrap;">${window.pirakuHoldRodOut ? "✨ Joran" : "🎣 Joran"}</button>` +
          `<button onclick="openFishingHubModal()" style="border:none;background:#1e293b;color:#fde047;padding:6px 11px;border-radius:999px;font-weight:900;font-size:11px;cursor:pointer;border:1px solid #475569;white-space:nowrap;">🎒 Tas (${bLen})</button>`;
      }
      if (_barEl.style.display !== "flex") _barEl.style.display = "flex";
    } else if (_barEl && _barEl.style.display !== "none") {
      _barEl.style.display = "none";
    }

    if (pm) {
      if (window.pirakuShownFish && (
        fishState !== "idle" ||
        wasInWater ||
        window.isRidingTram ||
        (pm.userData && pm.userData.a && pm.userData.a.vehicle) ||
        (document.getElementById("piraku-games-modal") && document.getElementById("piraku-games-modal").style.display === "flex")
      )) {
        window.pirakuShownFish = null;
      }
      window.syncShownFishOnMesh(pm, window.pirakuShownFish, now);
    }

    requestAnimationFrame(tickFishing3D);
  }

  const _fishTexCache = new Map();
  function getFishScaleTexture(colHex, accHex, sh, isCosmicPlus) {
    const key = `${colHex}_${accHex}_${sh}_${isCosmicPlus ? 1 : 0}`;
    if (_fishTexCache.has(key)) return _fishTexCache.get(key);
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 256;
    const ctx = cv.getContext("2d");

    const cMain = "#" + (colHex >>> 0).toString(16).padStart(6, "0");
    const cAcc = "#" + (accHex >>> 0).toString(16).padStart(6, "0");

    // Gradasi punggung ke perut
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, cMain);
    grad.addColorStop(0.55, cMain);
    grad.addColorStop(1, cAcc);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Pola sisik ikan (overlapping scales)
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.6;
    const stepX = 22, stepY = 18;
    for (let row = 0; row < 16; row++) {
      const offsetX = (row % 2) * (stepX / 2);
      for (let col = -1; col < 14; col++) {
        ctx.beginPath();
        ctx.arc(col * stepX + offsetX, row * stepY, 11, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
    }

    // Garis lateral & belang/totol sesuai jenis
    if (sh === "koi") {
      ctx.fillStyle = cAcc;
      ctx.beginPath(); ctx.ellipse(90, 80, 48, 30, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(185, 130, 38, 26, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.beginPath(); ctx.ellipse(145, 70, 22, 16, 0.2, 0, Math.PI * 2); ctx.fill();
    } else if (sh === "chubby" || sh === "whisker") {
      ctx.fillStyle = "rgba(15,23,42,0.16)";
      for (let sx = 45; sx <= 205; sx += 42) {
        ctx.fillRect(sx, 25, 14, 150);
      }
    }

    if (isCosmicPlus) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (let i = 0; i < 36; i++) {
        const px = (i * 73) % 256;
        const py = (i * 137) % 256;
        ctx.beginPath(); ctx.arc(px, py, (i % 3) + 1, 0, Math.PI * 2); ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    _fishTexCache.set(key, tex);
    return tex;
  }

  function makeSculptedFinMesh(points, depth, mat) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      if (p.length === 4) shape.quadraticCurveTo(p[0], p[1], p[2], p[3]);
      else shape.lineTo(p[0], p[1]);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: depth,
      bevelEnabled: true,
      bevelThickness: depth * 0.35,
      bevelSize: depth * 0.35,
      bevelSegments: 2
    });
    geo.center();
    return new THREE.Mesh(geo, mat);
  }

  function buildDetailedFishBodyMesh(f, isHighRarity) {
    const grp = new THREE.Group();
    const col = f.meshCol || 0x38bdf8;
    const accHex = f.accent ? parseInt(String(f.accent).replace("#", ""), 16) : 0xffffff;
    const safeAcc = isNaN(accHex) ? 0xffffff : accHex;
    const sh = f.shape || "chubby";
    const rarity = f.rarity || "Common";
    const isMythicPlus = rarity === "Mythic" || rarity === "Secret" || rarity === "Cosmic" || rarity === "Divine";
    const isCosmicPlus = rarity === "Cosmic" || rarity === "Divine" || rarity === "Secret";

    const scaleTex = (sh !== "boot") ? getFishScaleTexture(col, safeAcc, sh, isCosmicPlus) : null;
    const mat = new THREE.MeshStandardMaterial({
      color: scaleTex ? 0xffffff : col,
      map: scaleTex,
      roughness: isHighRarity ? 0.16 : 0.28,
      metalness: isHighRarity ? 0.55 : 0.20,
      emissive: isCosmicPlus ? col : (rarity === "Mythic" ? col : 0x000000),
      emissiveIntensity: isCosmicPlus ? 0.32 : (rarity === "Mythic" ? 0.12 : 0)
    });
    const accMat = new THREE.MeshStandardMaterial({
      color: safeAcc,
      roughness: 0.25,
      metalness: isHighRarity ? 0.45 : 0.18,
      emissive: isCosmicPlus ? safeAcc : 0x000000,
      emissiveIntensity: isCosmicPlus ? 0.22 : 0
    });
    const finMat = new THREE.MeshStandardMaterial({
      color: safeAcc,
      roughness: 0.26,
      metalness: 0.25,
      transparent: true,
      opacity: 0.90,
      emissive: isCosmicPlus ? safeAcc : 0x000000,
      emissiveIntensity: isCosmicPlus ? 0.18 : 0
    });
    const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: isCosmicPlus ? 0xfef08a : 0x090d16 });
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Mata ekspresif 3-lapis + kelopak alis ringan
    const addEyes = (ex, ey, ez, r) => {
      [-1, 1].forEach(side => {
        const sclera = new THREE.Mesh(new THREE.SphereGeometry(r * 1.22, 12, 12), scleraMat);
        sclera.scale.set(0.72, 1.0, 1.0);
        sclera.position.set(side * ex, ey, ez);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(r * 0.84, 10, 10), pupilMat);
        pupil.position.set(side * (ex + r * 0.34), ey, ez + r * 0.32);
        const dot = new THREE.Mesh(new THREE.SphereGeometry(r * 0.36, 8, 8), shineMat);
        dot.position.set(side * (ex + r * 0.56), ey + r * 0.28, ez + r * 0.66);
        grp.add(sclera, pupil, dot);
      });
    };

    if (sh === "boot") {
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.08, 0.56), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }));
      sole.position.set(0, -0.15, 0.04);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.40, 16), mat);
      shaft.position.set(0, 0.08, -0.1);
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.025, 8, 18), accMat);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.set(0, 0.27, -0.1);
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), mat);
      toe.scale.set(1.0, 0.8, 1.4);
      toe.position.set(0, -0.04, 0.16);
      grp.add(sole, shaft, cuff, toe);
      return grp;
    }

    if (sh === "whale") {
      // Profil Lathe paus streamline dari moncong ke ekor
      const pts = [
        new THREE.Vector2(0.00, 0.56),
        new THREE.Vector2(0.16, 0.50),
        new THREE.Vector2(0.30, 0.34),
        new THREE.Vector2(0.34, 0.10),
        new THREE.Vector2(0.28, -0.18),
        new THREE.Vector2(0.16, -0.44),
        new THREE.Vector2(0.06, -0.66),
        new THREE.Vector2(0.00, -0.70)
      ];
      const bodyGeo = new THREE.LatheGeometry(pts, 24);
      bodyGeo.rotateX(Math.PI / 2);
      const body = new THREE.Mesh(bodyGeo, mat);
      body.scale.set(0.95, 0.86, 1.0);

      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 14), accMat);
      belly.scale.set(0.88, 0.50, 1.55);
      belly.position.set(0, -0.13, 0.10);

      const dorsal = makeSculptedFinMesh([[0, 0], [0.06, 0.18], [-0.14, 0.20, -0.22, 0]], 0.03, finMat);
      dorsal.rotation.y = Math.PI / 2;
      dorsal.position.set(0, 0.28, -0.14);

      const tailGrp = new THREE.Group();
      tailGrp.position.set(0, 0, -0.64);
      [-1, 1].forEach(s => {
        const fluke = makeSculptedFinMesh([[0, 0], [0.24, 0.10, 0.36, -0.06], [0.14, -0.14], [0, -0.06]], 0.028, finMat);
        fluke.rotation.x = Math.PI / 2;
        fluke.scale.x = s;
        fluke.position.set(s * 0.17, 0, -0.06);
        tailGrp.add(fluke);

        const flip = makeSculptedFinMesh([[0, 0], [0.28, 0.08, 0.36, -0.10], [0.12, -0.14]], 0.025, accMat);
        flip.rotation.x = Math.PI / 2;
        flip.rotation.y = s * -0.35;
        flip.scale.x = s;
        flip.position.set(s * 0.36, -0.14, 0.14);
        grp.add(flip);
      });
      grp.userData.tailGroup = tailGrp;

      const spout = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.30, 12), new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.85 }));
      spout.rotation.x = Math.PI;
      spout.position.set(0, 0.44, 0.16);
      grp.add(body, belly, dorsal, tailGrp, spout);
      addEyes(0.26, 0.04, 0.38, 0.048);
    } else if (sh === "axolotl") {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 16), mat);
      body.scale.set(0.95, 0.82, 1.55);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), mat);
      head.scale.set(1.18, 0.84, 0.95);
      head.position.set(0, 0.04, 0.30);

      const tailGrp = new THREE.Group();
      tailGrp.position.set(0, 0, -0.34);
      const tailFin = makeSculptedFinMesh([[0, 0.12], [-0.36, 0.18, -0.48, 0], [-0.36, -0.18, 0, -0.12]], 0.025, finMat);
      tailFin.rotation.y = Math.PI / 2;
      tailFin.position.set(0, 0, -0.22);
      tailGrp.add(tailFin);
      grp.userData.tailGroup = tailGrp;

      [-1, 1].forEach(s => {
        [-0.08, 0.02, 0.12].forEach((gy, gi) => {
          const gill = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.014, 0.26, 8), accMat);
          gill.rotation.z = s * (1.08 + gi * 0.22);
          gill.position.set(s * 0.30, gy + 0.05, 0.26);
          const tip = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 8), accMat);
          tip.position.set(s * 0.41, gy + 0.08, 0.26);
          grp.add(gill, tip);
        });
        [-0.12, 0.16].forEach(lz => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.030, 0.16, 8), mat);
          leg.rotation.z = s * 0.72;
          leg.position.set(s * 0.21, -0.17, lz);
          grp.add(leg);
        });
      });
      grp.add(body, head, tailGrp);
      addEyes(0.15, 0.09, 0.49, 0.048);
    } else if (sh === "puffer") {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 20), mat);
      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.29, 18, 14), accMat);
      belly.position.set(0, -0.07, 0.03);
      belly.scale.set(0.95, 0.82, 0.95);
      const lips = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.02, 8, 16), accMat);
      lips.position.set(0, -0.04, 0.33);
      grp.add(body, belly, lips);
      for (let si = 0; si < 18; si++) {
        const phi = Math.acos(1 - 2 * (si + 0.5) / 18);
        const th = Math.PI * (1 + Math.sqrt(5)) * si;
        const dx = Math.sin(phi) * Math.cos(th);
        const dy = Math.cos(phi);
        const dz = Math.sin(phi) * Math.sin(th);
        if (dz > 0.70) continue;
        const spk = new THREE.Mesh(new THREE.ConeGeometry(0.040, 0.16, 8), accMat);
        spk.position.set(dx * 0.35, dy * 0.35, dz * 0.35);
        spk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz));
        grp.add(spk);
      }
      const tailGrp = new THREE.Group();
      tailGrp.position.set(0, 0, -0.32);
      const tail = makeSculptedFinMesh([[0, 0.05], [-0.18, 0.16], [-0.22, 0], [-0.18, -0.16], [0, -0.05]], 0.025, finMat);
      tail.rotation.y = Math.PI / 2;
      tail.position.set(0, 0, -0.10);
      tailGrp.add(tail);
      grp.userData.tailGroup = tailGrp;
      [-1, 1].forEach(s => {
        const pec = makeSculptedFinMesh([[0, 0.04], [-0.14, 0.10], [-0.12, -0.08], [0, -0.04]], 0.02, finMat);
        pec.rotation.y = s * -0.5;
        pec.position.set(s * 0.33, -0.02, 0.06);
        grp.add(pec);
      });
      grp.add(tailGrp);
      addEyes(0.18, 0.09, 0.29, 0.054);
    } else if (sh === "eel") {
      for (let seg = 0; seg < 7; seg++) {
        const r = 0.17 - seg * 0.018;
        const sMesh = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), seg % 2 === 0 ? mat : accMat);
        sMesh.scale.set(0.88, 0.96, 1.55);
        sMesh.position.set(Math.sin(seg * 1.0) * 0.11, Math.cos(seg * 0.65) * 0.03, 0.40 - seg * 0.18);
        grp.add(sMesh);
      }
      const dorsal = makeSculptedFinMesh([[0.45, 0], [0.25, 0.14], [-0.25, 0.16], [-0.55, 0.06], [-0.55, 0]], 0.022, finMat);
      dorsal.rotation.y = Math.PI / 2;
      dorsal.position.set(0, 0.14, -0.10);
      grp.add(dorsal);
      addEyes(0.11, 0.07, 0.48, 0.044);
    } else {
      // Profil Lathe hidrodinamis asli ikan (moncong lancip -> badan berotot -> pangkal ekor ramping!)
      const isRound = sh === "round";
      const isFancy = sh === "fancy" || sh === "crown";
      const pts = isRound
        ? [
            new THREE.Vector2(0.00, 0.42),
            new THREE.Vector2(0.16, 0.36),
            new THREE.Vector2(0.32, 0.18),
            new THREE.Vector2(0.34, 0.00),
            new THREE.Vector2(0.24, -0.22),
            new THREE.Vector2(0.09, -0.40),
            new THREE.Vector2(0.00, -0.44)
          ]
        : [
            new THREE.Vector2(0.00, 0.54),
            new THREE.Vector2(0.12, 0.46),
            new THREE.Vector2(0.25, 0.24),
            new THREE.Vector2(0.27, 0.04),
            new THREE.Vector2(0.20, -0.20),
            new THREE.Vector2(0.10, -0.42),
            new THREE.Vector2(0.05, -0.54),
            new THREE.Vector2(0.00, -0.56)
          ];
      const bodyGeo = new THREE.LatheGeometry(pts, 26);
      bodyGeo.rotateX(Math.PI / 2);
      const body = new THREE.Mesh(bodyGeo, mat);
      body.scale.set(isRound ? 0.85 : 0.62, isRound ? 1.05 : 0.96, 1.0);
      grp.add(body);

      // Mulut / bibir 3D
      const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.018, 8, 14), accMat);
      mouth.position.set(0, -0.02, isRound ? 0.40 : 0.51);
      grp.add(mouth);

      // Lengkung tutup insang (operculum)
      [-1, 1].forEach(s => {
        const gillPlate = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 6, 14, Math.PI * 0.85), accMat);
        gillPlate.rotation.y = s * Math.PI / 2;
        gillPlate.rotation.z = -0.35;
        gillPlate.position.set(s * (isRound ? 0.22 : 0.155), -0.01, 0.22);
        grp.add(gillPlate);
      });

      // Sirip punggung melengkung (sculpted dorsal fin)
      const dorsal = makeSculptedFinMesh(
        isFancy
          ? [[0.14, 0], [0.05, 0.34, -0.26, 0.36], [-0.34, 0.14, -0.24, 0]]
          : [[0.12, 0], [0.02, 0.24, -0.20, 0.22], [-0.26, 0.06, -0.20, 0]],
        0.022,
        finMat
      );
      dorsal.rotation.y = Math.PI / 2;
      dorsal.position.set(0, isRound ? 0.32 : 0.25, -0.02);
      grp.add(dorsal);

      // Sirip perut & sirip anal
      const analFin = makeSculptedFinMesh([[0.08, 0], [-0.04, -0.15], [-0.14, -0.12], [-0.10, 0]], 0.018, finMat);
      analFin.rotation.y = Math.PI / 2;
      analFin.position.set(0, isRound ? -0.24 : -0.18, -0.22);
      grp.add(analFin);

      // Ekor bulan sabit bercabang (sculpted crescent tail) dalam tailGroup agar bisa melambai!
      const tailGrp = new THREE.Group();
      tailGrp.position.set(0, 0, isRound ? -0.38 : -0.50);
      const tailFin = makeSculptedFinMesh(
        isFancy
          ? [[0, 0.05], [-0.32, 0.28, -0.38, 0.34], [-0.20, 0.08, -0.16, 0], [-0.20, -0.08, -0.38, -0.34], [-0.32, -0.28, 0, -0.05]]
          : [[0, 0.04], [-0.22, 0.20, -0.28, 0.24], [-0.14, 0.05, -0.12, 0], [-0.14, -0.05, -0.28, -0.24], [-0.22, -0.20, 0, -0.04]],
        0.022,
        finMat
      );
      tailFin.rotation.y = Math.PI / 2;
      tailFin.position.set(0, 0, -0.12);
      tailGrp.add(tailFin);
      grp.userData.tailGroup = tailGrp;
      grp.add(tailGrp);

      // Sirip dada kiri-kanan (sculpted pectoral fins)
      [-1, 1].forEach(s => {
        const pec = makeSculptedFinMesh(
          isFancy
            ? [[0, 0.04], [-0.24, 0.14, -0.28, -0.06], [-0.12, -0.12, 0, -0.04]]
            : [[0, 0.03], [-0.16, 0.10, -0.20, -0.04], [-0.08, -0.08, 0, -0.03]],
          0.018,
          finMat
        );
        pec.rotation.y = s * -0.65;
        pec.rotation.z = s * 0.35;
        pec.position.set(s * (isRound ? 0.24 : 0.17), -0.06, 0.14);
        grp.add(pec);
      });

      // Kumis panjang untuk Lele / Patin / Baung / Naga
      if (sh === "whisker" || isMythicPlus) {
        [-1, 1].forEach(s => {
          const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.005, isMythicPlus ? 0.44 : 0.30, 8), accMat);
          w1.rotation.z = s * 1.15; w1.rotation.x = 0.55;
          w1.position.set(s * 0.18, -0.03, isRound ? 0.36 : 0.48);
          grp.add(w1);
        });
      }
      addEyes(isRound ? 0.20 : 0.14, 0.07, isRound ? 0.28 : 0.38, 0.048);
    }

    // Mahkota emas untuk Epic / Mythic / Secret / Cosmic / Divine
    if (isHighRarity || sh === "crown") {
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.85, roughness: 0.15, emissive: 0xf59e0b, emissiveIntensity: 0.25 });
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.09, 0.15, 6), crownMat);
      crown.position.set(0, 0.38, 0.16);
      grp.add(crown);
    }
    // Cincin aura ganda & kristal mengorbit untuk Secret / Cosmic / Divine!
    if (isCosmicPlus) {
      const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.78 });
      const auraRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.020, 8, 32), ringMat);
      auraRing1.rotation.x = Math.PI / 2.2;
      const auraRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.015, 8, 28), new THREE.MeshBasicMaterial({ color: safeAcc, transparent: true, opacity: 0.68 }));
      auraRing2.rotation.y = Math.PI / 3;
      auraRing2.rotation.x = Math.PI / 3;
      grp.userData.auraRings = [auraRing1, auraRing2];
      grp.add(auraRing1, auraRing2);

      // 4 Kristal bercahaya mengorbit
      const orbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      for (let oi = 0; oi < 4; oi++) {
        const ang = (oi / 4) * Math.PI * 2;
        const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), orbMat);
        orb.position.set(Math.cos(ang) * 0.60, Math.sin(ang) * 0.18, Math.sin(ang) * 0.60);
        auraRing1.add(orb);
      }
    }
    return grp;
  }

  function computeShowOffScale(fishData) {
    const kg = Math.max(0.2, parseFloat(fishData.kg) || 1);
    // Ukuran murni mengikuti berat (kg): makin berat kg-nya makin besar (ikan ratusan kg bisa segede Gedung Sate!)
    let base = 0.62 + Math.pow(kg, 0.56) * 0.46;
    if (fishData.mut && fishData.mut.includes("Giant")) base *= 1.35;
    return Math.max(0.65, Math.min(22.0, base));
  }

  function create3DFishModel(fishData) {
    const f = ALL_FISH_CATALOG.find(x => x.id === fishData.id) || {};
    const isHigh = ["Epic", "Mythic", "Secret", "Cosmic", "Divine"].includes(fishData.rarity);
    const grp = buildDetailedFishBodyMesh({ ...f, ...fishData }, isHigh);
    const kgScale = computeShowOffScale(fishData);

    // Label nama ikan ringkas & proporsional di atas ikan (tidak kebesaran!)
    const cv = document.createElement("canvas");
    cv.width = 320; cv.height = 60;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "rgba(15, 23, 42, 0.86)";
    ctx.beginPath(); ctx.roundRect(6, 6, 308, 48, 24); ctx.fill();
    ctx.strokeStyle = f.col || "#fde047"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#fde047"; ctx.font = "900 18px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`${fishData.name} (${fishData.kg}kg)`, 160, 31);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false }));
    const worldW = Math.min(3.2, Math.max(1.25, 1.15 + kgScale * 0.11));
    const localW = worldW / kgScale;
    spr.scale.set(localW, localW * 0.19, 1);
    spr.position.set(0, 0.48 + 0.16 / kgScale, 0);
    grp.add(spr);

    grp.userData.showOffScale = kgScale;
    grp.scale.setScalar(kgScale);
    return grp;
  }

  window.syncShownFishOnMesh = function (mesh, fishData, now) {
    if (!mesh || typeof THREE === "undefined") return;
    const sig = fishData ? `${fishData.id}_${fishData.kg}_${fishData.mut || ""}` : "";
    if (!fishData) {
      if (mesh._pirakuShownFishGrp) {
        mesh.remove(mesh._pirakuShownFishGrp);
        mesh._pirakuShownFishGrp = null;
        mesh._pirakuShownFishSig = "";
      }
      return;
    }
    if (!mesh._pirakuShownFishGrp || mesh._pirakuShownFishSig !== sig) {
      if (mesh._pirakuShownFishGrp) mesh.remove(mesh._pirakuShownFishGrp);
      mesh._pirakuShownFishGrp = create3DFishModel(fishData);
      mesh._pirakuShownFishSig = sig;
      mesh.add(mesh._pirakuShownFishGrp);
    }
    const tNow = now || performance.now();
    const grp = mesh._pirakuShownFishGrp;
    const sc = grp.userData.showOffScale || 1;
    // Dipegang di depan tangan (melintang kiri-kanan) seperti di Roblox Fisch/Fish It, tidak melayang aneh!
    const yPos = 0.62 + sc * 0.34;
    const zPos = 0.50 + sc * 0.28;
    grp.position.set(0, yPos + Math.sin(tNow * 0.004) * 0.025, zPos);
    grp.rotation.y = Math.PI / 2 + Math.sin(tNow * 0.0025) * 0.12;
    if (grp.userData.tailGroup) {
      grp.userData.tailGroup.rotation.y = Math.sin(tNow * 0.009) * 0.28;
    }
    if (Array.isArray(grp.userData.auraRings)) {
      grp.userData.auraRings[0].rotation.z = tNow * 0.0014;
      grp.userData.auraRings[1].rotation.z = -tNow * 0.0018;
    }
  };

  window.toggleShowOffFish = function (bagIdx) {
    const bag = getBag();
    const item = bag[bagIdx];
    if (!item) return;
    const isSame = window.pirakuShownFish && window.pirakuShownFish.id === item.id && window.pirakuShownFish.kg === item.kg;
    if (isSame) {
      window.pirakuShownFish = null;
      if (typeof window.showToast === "function") window.showToast("🎒 Ikan disimpan kembali ke tas.");
    } else {
      window.pirakuShownFish = {
        id: item.id,
        name: item.name,
        rarity: item.rarity,
        kg: item.kg,
        mut: item.mutation || ""
      };
      if (typeof window.showToast === "function") {
        window.showToast(`✨ Memamerkan ${item.mutation ? item.mutation + " " : ""}${item.name} (${item.kg} kg) ke semua warga!`);
      }
    }
    const modal = document.getElementById("piraku-fishing-modal");
    if (modal && modal.style.display === "flex" && modal.innerHTML.includes("Tas Ikan")) {
      window.openFishingHubModal();
    }
  };

  function animateRodEffects(rodGrp, now) {
    if (!rodGrp || !rodGrp.userData) return;
    const t = now * 0.0025;
    if (Array.isArray(rodGrp.userData.animRings)) {
      rodGrp.userData.animRings.forEach((rg, idx) => {
        rg.rotation.y = t * (idx % 2 === 0 ? 1.4 : -1.7);
        rg.rotation.x += 0.015 * (idx % 2 === 0 ? 1 : -1);
      });
    }
    if (rodGrp.userData.orbitGroup) {
      rodGrp.userData.orbitGroup.rotation.y = t * 1.8;
    }
    if (rodGrp.userData.tipGlow) {
      rodGrp.userData.tipGlow.rotation.y = t * 1.3;
    }
    if (rodGrp.userData.auraSphere) {
      const s = 1 + Math.sin(now * 0.006) * 0.18;
      rodGrp.userData.auraSphere.scale.setScalar(s);
    }
  }

  window.toggleHoldFishingRod = function () {
    window.pirakuHoldRodOut = !window.pirakuHoldRodOut;
    const rod = getEquippedRod();
    if (typeof window.showToast === "function") {
      window.showToast(window.pirakuHoldRodOut
        ? `✨ Memegang ${rod.name} di tangan! Semua warga bisa melihatnya.`
        : `🎒 ${rod.name} disimpan kembali.`);
    }
    const modal = document.getElementById("piraku-fishing-modal");
    if (modal && modal.style.display === "flex") window.openFishingHubModal("bag");
  };

  window.syncEquippedRodVisual = function (pm, rodId, holdInHand, isFishingActive, now) {
    if (!pm || typeof THREE === "undefined") return;
    const rod = RODS.find(r => r.id === rodId) || RODS[0];
    const shouldShow = !isFishingActive && (holdInHand || (rodId && rodId !== "bamboo"));
    if (!shouldShow) {
      if (pm._pirakuBackRod) pm._pirakuBackRod.visible = false;
      return;
    }
    if (!pm._pirakuBackRod || pm._pirakuBackRodId !== rod.id) {
      if (pm._pirakuBackRod) pm.remove(pm._pirakuBackRod);
      const backRod = createFishingRodGroup(rod.color, rod.id === "gold", rod.id);
      pm.add(backRod);
      pm._pirakuBackRod = backRod;
      pm._pirakuBackRodId = rod.id;
    }
    const rMesh = pm._pirakuBackRod;
    rMesh.visible = true;
    if (holdInHand) {
      rMesh.position.set(0.32, 0.72, 0.14);
      rMesh.rotation.set(0.08, 0, 0);
      rMesh.scale.setScalar(1.0);
    } else {
      rMesh.position.set(0.18, 0.55, -0.24);
      rMesh.rotation.set(-0.95, 0.15, -0.45);
      rMesh.scale.setScalar(0.82);
    }
    animateRodEffects(rMesh, now);
  };

  window.clearRemotePlayerFishing3D = function (entry) {
    if (!entry) return;
    const sc = window.pirakuScene;
    if (entry.remoteRod && entry.remoteRod.parent) entry.remoteRod.parent.remove(entry.remoteRod);
    if (entry.remoteBobber && sc) sc.remove(entry.remoteBobber);
    if (entry.remoteRipple && sc) sc.remove(entry.remoteRipple);
    if (entry.remoteLine && sc) sc.remove(entry.remoteLine);
    entry.remoteRod = entry.remoteBobber = entry.remoteRipple = entry.remoteLine = null;
    entry.remoteFishSig = "";
    const ud = entry.mesh && entry.mesh.userData && entry.mesh.userData.a;
    if (ud && ud.body) ud.body.rotation.x *= 0.8;
  };

  window.syncRemotePlayerFishing3D = function (entry, now) {
    const sc = window.pirakuScene;
    const f = entry && entry.fishing;
    if (!sc || !entry || !entry.mesh || !f || !f.state || f.state === "idle" || typeof THREE === "undefined") {
      window.clearRemotePlayerFishing3D(entry);
      return;
    }
    const sig = `${f.rodId || ""}_${f.col || 0}_${f.bx || 0}_${f.bz || 0}`;
    if (!entry.remoteRod || entry.remoteFishSig !== sig) {
      window.clearRemotePlayerFishing3D(entry);
      entry.remoteFishSig = sig;
      entry.remoteFishStart = now;
      entry.remoteRod = createFishingRodGroup(f.col, !!f.gold, f.rodId);
      entry.mesh.add(entry.remoteRod);
      const wy = typeof f.wy === "number" ? f.wy : 0.08;
      const rBobSpec = BOBBERS.find(b => b.id === f.bobId) || BOBBERS[0];
      entry.remoteBobber = createBobberGroup(f.bx || entry.mesh.position.x, wy, f.bz || entry.mesh.position.z, rBobSpec);
      sc.add(entry.remoteBobber);
      entry.remoteRipple = createRippleMesh(f.bx || entry.mesh.position.x, wy, f.bz || entry.mesh.position.z);
      sc.add(entry.remoteRipple);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), entry.remoteBobber.position.clone()]);
      entry.remoteLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xe2e8f0 }));
      sc.add(entry.remoteLine);
    }
    const ud = entry.mesh.userData && entry.mesh.userData.a;
    animateFishingPose(ud, entry.remoteRod, f.state, now, entry.remoteFishStart || now);
    animateRodEffects(entry.remoteRod, now);
    const wy = typeof f.wy === "number" ? f.wy : 0.08;
    if (entry.remoteBobber) {
      const t = now * 0.006;
      entry.remoteBobber.position.y = wy + (f.state === "waiting" ? Math.sin(t) * 0.03 : Math.sin(t * 4.5) * 0.14);
    }
    if (entry.remoteRipple) {
      const rp = ((now * (f.state === "reeling" ? 0.0024 : 0.0016)) % 1);
      entry.remoteRipple.scale.setScalar(1 + rp * (f.state === "waiting" ? 1.9 : 3.2));
      entry.remoteRipple.material.opacity = (1 - rp) * 0.75;
    }
    if (entry.remoteLine && entry.remoteRod && entry.remoteBobber) {
      updateFishingLine(entry.remoteLine, entry.remoteRod, entry.remoteBobber);
    }
  };

  window.guideToPirakuFishingSpot = function () {
    if (window.pirakuInDistrict) {
      if (typeof window.showToast === "function") {
        window.showToast("🎣 Kolam Mancing Kecamatan ada di sisi Tenggara (Timur Gang Selatan, x:42, z:11)! Ikuti tanda '🎣 Mancing di sini'.");
      }
      return;
    }
    window.pirakuActiveMinimapTarget = {
      mapId: "bandung_wetan",
      x: 32.5,
      z: 16.0,
      label: "MANCING",
      color: "#38bdf8",
      isFishingGuide: true
    };
    if (typeof window.showToast === "function") {
      window.showToast("🎣 Danau Taman Lansia ada di Timur Gedung Sate! Ikuti garis biru di minimap & tanda 'Mancing di sini'.");
    }
  };

  function showFishingUpdateBanner() {
    const verKey = "piraku_update_seen_20261119v6";
    if (localStorage.getItem(verKey)) return;
    if (!document.body || document.getElementById("piraku-fishing-update-banner")) return;
    const b = document.createElement("div");
    b.id = "piraku-fishing-update-banner";
    b.style.cssText = "position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:99990;width:min(380px,calc(100vw - 24px));background:linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.96));border:1.5px solid #38bdf8;border-radius:14px;padding:10px 12px;color:#f8fafc;box-shadow:0 12px 32px rgba(0,0,0,0.65);display:flex;align-items:center;gap:10px;";
    b.innerHTML = `
      <div style="font-size:22px;line-height:1;">🎣</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:11.5px;font-weight:900;color:#38bdf8;">UPDATE MANCING 3D BARU!</div>
        <div style="font-size:10.5px;color:#cbd5e1;line-height:1.35;">40 Ikan (s/d 1/100.000), Joran Kristal &amp; Naga, + Pamer Ikan! Silakan refresh jika belum muncul.</div>
      </div>
      <button id="pf-upd-refresh" style="border:none;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#fff;padding:6px 10px;border-radius:8px;font-size:10.5px;font-weight:900;cursor:pointer;white-space:nowrap;">🔄 Refresh</button>
      <button id="pf-upd-close" style="border:none;background:transparent;color:#94a3b8;font-size:14px;font-weight:900;cursor:pointer;padding:2px 4px;">✕</button>
    `;
    document.body.appendChild(b);
    const dismiss = () => { localStorage.setItem(verKey, "1"); b.remove(); };
    b.querySelector("#pf-upd-refresh").onclick = () => { localStorage.setItem(verKey, "1"); location.reload(true); };
    b.querySelector("#pf-upd-close").onclick = dismiss;
  }

  setTimeout(() => { requestAnimationFrame(tickFishing3D); }, 800);
})();
