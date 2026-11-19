// piraku-fishing.js — Mancing 3D ala Roblox Fisch (Danau Besar, Tenggelam di Air, Jual/Upgrade Khusus di Kopdes, UI Anti-Tindih)
(function () {
  "use strict";

  const RODS = [
    { id: "bamboo",    name: "Joran Bambu Cikapundung", cost: 0,    barWidth: 34, luckBonus: 0.00, mutChance: 0.05, color: 0xa16207, badge: "🎋" },
    { id: "fiber",     name: "Joran Fiber Braga",       cost: 80,   barWidth: 40, luckBonus: 0.14, mutChance: 0.10, color: 0x0284c7, badge: "🎣" },
    { id: "carbon",    name: "Joran Karbon Dago",       cost: 250,  barWidth: 46, luckBonus: 0.30, mutChance: 0.16, color: 0x1e293b, badge: "⚡" },
    { id: "gold",      name: "Joran Emas Siliwangi",    cost: 700,  barWidth: 54, luckBonus: 0.52, mutChance: 0.26, color: 0xfacc15, badge: "👑" },
    { id: "crystal",   name: "Joran Kristal Tangkuban", cost: 1600, barWidth: 60, luckBonus: 0.78, mutChance: 0.36, color: 0x38bdf8, badge: "💎" },
    { id: "celestial", name: "Joran Naga Siliwangi",    cost: 3500, barWidth: 68, luckBonus: 1.15, mutChance: 0.50, color: 0xa855f7, badge: "🌌" }
  ];

  const BAITS = [
    { id: "worm",  name: "Cacing Tanah", cost: 0,  qtyOnBuy: 0, luckBoost: 0.00, mutBoost: 0.00, icon: "🪱" },
    { id: "pelet", name: "Pelet Sakti",  cost: 12, qtyOnBuy: 5, luckBoost: 0.25, mutBoost: 0.06, icon: "🟢" },
    { id: "udang", name: "Udang Emas",   cost: 30, qtyOnBuy: 5, luckBoost: 0.55, mutBoost: 0.15, icon: "🦐" }
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

  function renderFishArt(fishOrItem, size) {
    const f = FISH_CATALOG.find(x => x.id === fishOrItem.id) || fishOrItem || {};
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

  function getBag() { return loadJson("piraku_fish_bag" + getUserSuf(), []); }
  function saveBag(bag) { localStorage.setItem("piraku_fish_bag" + getUserSuf(), JSON.stringify(bag.slice(0, 60))); }
  function getDex() { return loadJson("piraku_fish_dex" + getUserSuf(), {}); }
  function saveDex(dex) { localStorage.setItem("piraku_fish_dex" + getUserSuf(), JSON.stringify(dex)); }
  function getOwnedRods() {
    const arr = loadJson("piraku_fish_rods" + getUserSuf(), ["bamboo"]);
    return Array.isArray(arr) && arr.length ? arr : ["bamboo"];
  }
  function saveOwnedRods(arr) { localStorage.setItem("piraku_fish_rods" + getUserSuf(), JSON.stringify(arr)); }
  function getEquippedRodId() { return localStorage.getItem("piraku_fish_rod_eq" + getUserSuf()) || "bamboo"; }
  function setEquippedRodId(id) { localStorage.setItem("piraku_fish_rod_eq" + getUserSuf(), id); }
  function getEquippedRod() { return RODS.find(r => r.id === getEquippedRodId()) || RODS[0]; }

  function getBaitCounts() { return loadJson("piraku_fish_baits" + getUserSuf(), { pelet: 0, udang: 0 }); }
  function saveBaitCounts(obj) { localStorage.setItem("piraku_fish_baits" + getUserSuf(), JSON.stringify(obj)); }
  function getEquippedBaitId() {
    const id = localStorage.getItem("piraku_fish_bait_eq" + getUserSuf()) || "worm";
    if (id !== "worm" && (getBaitCounts()[id] || 0) <= 0) return "worm";
    return id;
  }
  function setEquippedBaitId(id) { localStorage.setItem("piraku_fish_bait_eq" + getUserSuf(), id); }

  function getActivePond() {
    if (window.pirakuInDistrict) {
      return { name: "Kolam Apartemen", x: -42.8, z: 17.5, waterY: 0.55, radius: 7.5, spotX: -39.4, spotZ: 17.5 };
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
    if (window.pirakuInDistrict) return false;
    // Dermaga panjang (world x: 27.5..35.5, z: 14.5..17.5)
    return px >= 27.5 && px <= 35.5 && pz >= 14.5 && pz <= 17.5;
  }

  function isPlayerInLakeWater(px, pz) {
    if (window.pirakuInDistrict) {
      return Math.hypot(px - (-42.8), pz - 17.5) < 1.95;
    }
    if (isPlayerOnPier(px, pz)) return false;
    const inMain = Math.hypot(px - 39.0, pz - 15.0) < 6.4;
    const inEast = Math.hypot(px - 44.5, pz - 14.5) < 5.2;
    const inSouth1 = Math.hypot(px - 40.0, pz - 22.0) < 6.6;
    const inSouth2 = Math.hypot(px - 43.5, pz - 26.2) < 5.2;
    return inMain || inEast || inSouth1 || inSouth2;
  }

  window.getPirakuFishingGroundY = function(px, pz) {
    if (isPlayerOnPier(px, pz)) return 0.36;
    if (isPlayerInLakeWater(px, pz)) return -0.72;
    return null;
  };

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
      const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.12, metalness: 0.35, transparent: true, opacity: 0.92 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
      const plankMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 });

      // Cekungan Danau Organik Besar (strictly z = 8.4..31.6, x = 32.4..49.8 -> 100% aman dari semua jalan!)
      const wMain = new THREE.Mesh(new THREE.CircleGeometry(6.6, 28), waterMat);
      wMain.rotation.x = -Math.PI / 2; wMain.position.set(0, 0.08, -1.0);
      const wEast = new THREE.Mesh(new THREE.CircleGeometry(5.4, 26), waterMat);
      wEast.rotation.x = -Math.PI / 2; wEast.position.set(5.5, 0.08, -1.5);
      const wSouth1 = new THREE.Mesh(new THREE.CircleGeometry(6.8, 28), waterMat);
      wSouth1.rotation.x = -Math.PI / 2; wSouth1.position.set(1.0, 0.08, 6.0);
      const wSouth2 = new THREE.Mesh(new THREE.CircleGeometry(5.4, 26), waterMat);
      wSouth2.rotation.x = -Math.PI / 2; wSouth2.position.set(4.5, 0.08, 10.2);
      lansiaPondGroup.add(wMain, wEast, wSouth1, wSouth2);

      // Batu alam mengelilingi tepian danau (hindari sisi dermaga barat & sisi gazebo barat daya)
      for (let i = 0; i < 34; i++) {
        const ang = (i / 34) * Math.PI * 2;
        if (ang > Math.PI * 0.72 && ang < Math.PI * 1.15) continue;
        const radX = 8.2 + Math.sin(i * 1.9) * 0.6;
        const radZ = 9.4 + Math.cos(i * 2.3) * 0.6;
        const rx = Math.cos(ang) * radX + 2.0;
        const rz = Math.sin(ang) * radZ + 3.4;
        // Pastikan tidak bocor ke Jl. Diponegoro (world z < 7.2) atau Jl. Sentot (world x < 26.5)
        if (39 + rx < 27.0 || 16 + rz < 7.6) continue;
        // Pastikan tidak ada batu menembus koridor dermaga atau gazebo
        if (rx >= -13.0 && rx <= -1.8 && rz >= -3.0 && rz <= 3.0) continue;
        if (Math.hypot(rx - (-9.5), rz - 11.5) < 3.6) continue;
        const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.52 + (i % 3) * 0.2, 0), i % 2 === 0 ? rockMat : darkRockMat);
        rk.scale.set(1.25, 0.65, 1.05);
        rk.position.set(rx, 0.22, rz);
        rk.rotation.y = i * 0.7;
        lansiaPondGroup.add(rk);
      }

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

      // Ikan-ikan koi hidup berenang santai di dalam air danau
      const koiColors = [0xf97316, 0xfacc15, 0xef4444, 0xf8fafc, 0xfb923c];
      for (let k = 0; k < 6; k++) {
        const koi = new THREE.Group();
        const kb = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.55, 6), new THREE.MeshStandardMaterial({ color: koiColors[k % koiColors.length], roughness: 0.35 }));
        kb.rotation.x = Math.PI / 2;
        koi.add(kb);
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

      [[-1.8, -2.8], [2.4, 2.2], [5.8, -1.4], [-0.5, 4.2], [3.5, 8.2]].forEach(([lx, lz], idx) => {
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 12), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
        pad.position.set(lx, 0.11, lz);
        lansiaPondGroup.add(pad);
        if (idx % 2 === 0) {
          const flw = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0xf472b6 }));
          flw.position.set(lx, 0.21, lz);
          lansiaPondGroup.add(flw);
        }
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
      sc.add(lansiaPondGroup);
    }
    lansiaPondGroup.visible = !window.pirakuInDistrict;
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
    const isHighTier = isGold || isCrystal || isCelestial;
    const blankMat = new THREE.MeshStandardMaterial({
      color: rodColor || 0xa16207,
      metalness: isHighTier ? 0.75 : 0.3,
      roughness: isHighTier ? 0.2 : 0.42,
      emissive: isCelestial ? 0x581c87 : (isCrystal ? 0x0369a1 : 0x000000),
      emissiveIntensity: isCelestial ? 0.45 : (isCrystal ? 0.35 : 0)
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: isGold ? 0xfef08a : (isCelestial ? 0xf5d0fe : (isCrystal ? 0xbae6fd : 0xe2e8f0)),
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
    const tipGeo = (isCrystal || isCelestial) ? new THREE.OctahedronGeometry(0.065, 0) : new THREE.SphereGeometry(0.038, 8, 8);
    const tipGlow = new THREE.Mesh(tipGeo, new THREE.MeshBasicMaterial({ color: tipColor }));
    tipGlow.position.set(0, 0.96, 0);
    const tipMarker = new THREE.Object3D();
    tipMarker.position.set(0, 0.96, 0);
    tipSection.add(tipPole, tipGlow, tipMarker);
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

    // Aura cincin khusus Joran Kristal & Naga Siliwangi
    if (isCelestial || isCrystal) {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.012, 8, 18),
        new THREE.MeshBasicMaterial({ color: isCelestial ? 0xfde047 : 0x7dd3fc })
      );
      halo.rotation.x = Math.PI / 2;
      halo.position.set(0, 0.92, 0);
      tipSection.add(halo);
    }

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

  function createBobberGroup(bx, wy, bz) {
    const bob = new THREE.Group();
    const bTop = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    bTop.position.y = 0.06;
    const bBot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
    bBot.position.y = -0.02;
    bob.add(bTop, bBot);
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

    const bob = createBobberGroup(bx, pond.waterY, bz);
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
      bx: Number(bx.toFixed(2)),
      bz: Number(bz.toFixed(2)),
      wy: Number(pond.waterY.toFixed(2))
    };
  }

  function spawnJumpingFish3D(fishSpec) {
    const sc = window.pirakuScene;
    if (!sc || !bobberMesh3D || typeof THREE === "undefined") return;
    if (jumpFishMesh3D) sc.remove(jumpFishMesh3D);
    const fGrp = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.78, 8), new THREE.MeshStandardMaterial({ color: fishSpec.meshCol, roughness: 0.35, metalness: 0.25 }));
    body.rotation.x = Math.PI / 2;
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.3, 4), new THREE.MeshStandardMaterial({ color: fishSpec.meshCol }));
    tail.rotation.x = -Math.PI / 2;
    tail.position.z = -0.44;
    fGrp.add(body, tail);
    fGrp.position.copy(bobberMesh3D.position);
    sc.add(fGrp);
    jumpFishMesh3D = fGrp;
  }

  function rollFish() {
    const rod = getEquippedRod();
    const baitId = getEquippedBaitId();
    const bait = BAITS.find(b => b.id === baitId) || BAITS[0];
    const isRain = window.pirakuCurrentEventId === "rain";
    const totalLuck = rod.luckBonus + bait.luckBoost;

    const pool = FISH_CATALOG.map(f => {
      let w = f.weight;
      if (f.rarity === "Rare" || f.rarity === "Epic" || f.rarity === "Mythic" || f.rarity === "Secret" || f.rarity === "Cosmic" || f.rarity === "Divine") {
        w *= (1 + totalLuck * 2.4) * (isRain ? 2.0 : 1.0);
      }
      if ((f.rarity === "Mythic" || f.rarity === "Secret" || f.rarity === "Cosmic" || f.rarity === "Divine") && rod.id === "bamboo" && baitId === "worm") w *= 0.25;
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

  function consumeOneBait() {
    const eq = getEquippedBaitId();
    if (eq === "worm") return;
    const counts = getBaitCounts();
    if ((counts[eq] || 0) > 0) {
      counts[eq] -= 1;
      saveBaitCounts(counts);
      if (counts[eq] <= 0) setEquippedBaitId("worm");
    }
  }

  function setMobileControlsHidden(hide) {
    const jz = document.getElementById("joystick-zone");
    if (jz) { jz.style.display = hide ? "none" : ""; jz.style.pointerEvents = hide ? "none" : ""; }
    document.querySelectorAll('button[title="Buka Balai Obrolan Warga"], .btn-chat-fab').forEach(b => {
      b.style.display = hide ? "none" : "";
    });
  }

  function cancelFishing() {
    clearTimeout(waitTimer);
    clearTimeout(biteTimeout);
    cancelAnimationFrame(reelRaf);
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
    fishState = "waiting";
    setMobileControlsHidden(true);
    spawn3DFishingVisuals(pond);
    if (typeof window.playSynthTone === "function") window.playSynthTone(520, "sine", 0.12);

    const bait = BAITS.find(b => b.id === getEquippedBaitId()) || BAITS[0];
    const ui = ensureFishingOverlay();
    ui.style.display = "flex";
    ui.innerHTML = `
      <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
        <span style="font-weight:900;font-size:12.5px;color:#7dd3fc;">🎣 Menunggu di ${pond.name}</span>
        ${catchCombo > 0 ? `<span style="background:#9a3412;color:#fde047;padding:2px 8px;border-radius:99px;font-size:10.5px;font-weight:900;">🔥 Combo ${catchCombo}x</span>` : ""}
      </div>
      <div style="font-size:11px;color:#94a3b8;">Umpan: ${bait.icon} <b>${bait.name}</b> • Perhatikan pelampung di air!</div>
      <button onclick="cancelPirakuFishing()" style="border:none;background:rgba(148,163,184,0.2);color:#e2e8f0;padding:5px 12px;border-radius:9px;font-size:11px;font-weight:800;cursor:pointer;">Batal</button>
    `;

    const delayMs = 1500 + Math.random() * 1900;
    waitTimer = setTimeout(() => {
      if (fishState !== "waiting") return;
      fishState = "bite";
      if (window.pirakuFishingSyncState) window.pirakuFishingSyncState.state = "bite";
      if (typeof window.playSynthTone === "function") window.playSynthTone(880, "triangle", 0.24);
      ui.innerHTML = `
        <div style="font-weight:900;font-size:16px;color:#facc15;">❗ IKAN MENYAMBAR!</div>
        <button onclick="strikePirakuFish()" style="width:100%;border:none;background:linear-gradient(135deg,#facc15,#f97316);color:#0f172a;padding:11px;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;">⚡ TARIK SEKARANG! (SPACE)</button>
      `;
      biteTimeout = setTimeout(() => {
        if (fishState === "bite") {
          catchCombo = 0;
          cancelFishing();
          if (typeof window.showToast === "function") window.showToast("💨 Telat tarik! Ikannya lepas...");
        }
      }, 4200);
    }, delayMs);
  };

  window.cancelPirakuFishing = cancelFishing;

  window.strikePirakuFish = function () {
    if (fishState !== "bite") return;
    clearTimeout(biteTimeout);
    fishState = "reeling";
    if (window.pirakuFishingSyncState) window.pirakuFishingSyncState.state = "reeling";
    currentFishSpec = rollFish();
    consumeOneBait();
    spawnJumpingFish3D(currentFishSpec);

    const rod = getEquippedRod();
    fishPos = 50;
    prevFishPos = 50;
    fishTarget = 30 + Math.random() * 40;
    fishChangeAt = 0;
    barPos = 50;
    catchProgress = 40;
    isHoldingReel = false;
    lastReelTs = performance.now();

    const isStrongPull = currentFishSpec.rarity === "Rare" || currentFishSpec.rarity === "Epic" || currentFishSpec.rarity === "Mythic";
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
        <span id="pf-status" style="font-weight:900;font-size:12.5px;color:${isStrongPull ? "#f97316" : "#4ade80"};">${isStrongPull ? "⚡ TARIKAN KUAT! JANGAN LEPAS!" : "✓ ZONA TEPAT!"}</span>
        <span id="pf-pct" style="font-size:11.5px;font-weight:900;color:#7dd3fc;">32%</span>
      </div>
      <div id="pf-track" style="position:relative;width:100%;height:38px;background:linear-gradient(180deg,#020617,#0f172a);border:2px solid ${isStrongPull ? "#f97316" : "#38bdf8"};border-radius:14px;overflow:hidden;box-shadow:inset 0 2px 8px rgba(0,0,0,0.8);">
        <div id="pf-bar" style="position:absolute;top:3px;bottom:3px;width:${rod.barWidth}%;left:${50 - rod.barWidth / 2}%;background:rgba(34,197,94,0.42);border:2px solid #4ade80;border-radius:10px;box-shadow:0 0 14px rgba(74,222,128,0.45);transition:background 0.1s, border-color 0.1s;"></div>
        <div id="pf-fish" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.8));">🐟</div>
      </div>
      <div style="width:100%;height:10px;background:#1e293b;border-radius:99px;overflow:hidden;">
        <div id="pf-prog" style="width:32%;height:100%;background:linear-gradient(90deg,#38bdf8,#22c55e,#facc15);"></div>
      </div>
      <div style="display:flex;gap:8px;width:100%;">
        <button id="pf-hold-btn" style="flex:1;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#052e16;padding:11px;border-radius:12px;font-weight:900;font-size:13.5px;cursor:pointer;touch-action:none;">✊ TAHAN / SPACE (GESER KANAN)</button>
        <button onclick="cancelPirakuFishing()" style="border:none;background:#1e293b;color:#94a3b8;padding:0 12px;border-radius:12px;font-weight:800;cursor:pointer;">✕</button>
      </div>
    `;

    const btn = document.getElementById("pf-hold-btn");
    if (btn) {
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
        fishTarget = 10 + Math.random() * 80;
        fishChangeAt = now + (600 + Math.random() * (950 - currentFishSpec.erratic * 350));
      }
      prevFishPos = fishPos;
      const fDiff = fishTarget - fishPos;
      fishPos += Math.sign(fDiff) * Math.min(Math.abs(fDiff), currentFishSpec.speed * 42 * dt);
      fishPos = Math.max(8, Math.min(92, fishPos));

      // Kontrol langsung & responsif (tahan geser kanan, lepas geser kiri) tanpa licin
      barPos += (isHoldingReel ? 95 : -78) * dt;
      const halfBar = rod.barWidth / 2;
      barPos = Math.max(halfBar, Math.min(100 - halfBar, barPos));

      const distToCenter = Math.abs(fishPos - barPos);
      const inside = distToCenter <= halfBar + 3.5;
      const isPerfect = distToCenter <= halfBar * 0.45;
      catchProgress += (isPerfect ? 52 : inside ? 38 : -11) * dt;
      catchProgress = Math.max(0, Math.min(100, catchProgress));

      if (inside && now - lastTickSound > 160 && typeof window.playSynthTone === "function") {
        lastTickSound = now;
        window.playSynthTone(420 + catchProgress * 4.5, "sine", 0.04);
      }

      const barEl = document.getElementById("pf-bar");
      const fishEl = document.getElementById("pf-fish");
      const progEl = document.getElementById("pf-prog");
      const pctEl = document.getElementById("pf-pct");
      const statusEl = document.getElementById("pf-status");
      if (barEl) {
        barEl.style.left = (barPos - halfBar).toFixed(1) + "%";
        barEl.style.borderColor = isPerfect ? "#facc15" : inside ? "#4ade80" : "#ef4444";
        barEl.style.background = isPerfect ? "rgba(250,204,21,0.48)" : inside ? "rgba(34,197,94,0.46)" : "rgba(239,68,68,0.28)";
      }
      if (fishEl) {
        fishEl.style.left = fishPos.toFixed(1) + "%";
        const dirScale = fishPos >= prevFishPos ? -1 : 1;
        fishEl.style.transform = `translate(-50%,-50%) scaleX(${dirScale})`;
      }
      if (progEl) progEl.style.width = catchProgress.toFixed(1) + "%";
      if (pctEl) pctEl.textContent = Math.round(catchProgress) + "%";
      if (statusEl) {
        statusEl.textContent = isPerfect ? "⚡ PERFECT! CEPAT!" : inside ? "✓ ZONA TEPAT!" : "⚠️ KEJAR IKANNYA!";
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

  function finishFishCatch(fish, rod) {
    catchCombo = Math.min(5, catchCombo + 1);
    const bait = BAITS.find(b => b.id === getEquippedBaitId()) || BAITS[0];
    cancelFishing();

    const streakMult = 1 + (catchCombo - 1) * 0.08;
    const kg = Number(((fish.minKg + Math.random() * (fish.maxKg - fish.minKg)) * streakMult).toFixed(1));
    let mutation = null;
    if (Math.random() < (rod.mutChance + bait.mutBoost)) {
      mutation = MUTATIONS[Math.floor(Math.random() * MUTATIONS.length)];
    }
    const kgFactor = 1 + (kg / Math.max(2, fish.maxKg)) * 0.45;
    const coinVal = fish.baseCoin <= 0 ? 0 : Math.max(1, Math.round(fish.baseCoin * kgFactor * (mutation ? mutation.mult : 1)));

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

  window.sellAllCaughtFish = function () {
    if (!isNearKopdes()) {
      if (typeof window.showToast === "function") window.showToast("🏪 Jalan kaki ke Kopdes Biru Putih dulu untuk menjual ikan!");
      return;
    }
    const bag = getBag();
    if (!bag.length) return;
    const validFish = bag.filter(f => (Number(f.coins) || 0) > 0);
    const trashCount = bag.length - validFish.length;
    const totalCoins = validFish.reduce((s, f) => s + (Number(f.coins) || 0), 0);
    saveBag([]);
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
        ? `💰 Terjual ${validFish.length} ikan seharga 🪙 ${totalCoins}!${trashCount > 0 ? ` (${trashCount} sampah dibuang)` : ""}`
        : `🗑️ ${trashCount} barang rusak dibuang (tidak bernilai koin).`);
    }
    window.openFishingHubModal();
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

  window.buyOrEquipBait = function (baitId) {
    const bait = BAITS.find(b => b.id === baitId);
    if (!bait) return;
    if (baitId === "worm") {
      setEquippedBaitId("worm");
      window.openFishingHubModal();
      return;
    }
    const counts = getBaitCounts();
    if ((counts[baitId] || 0) <= 0) {
      if (!isNearKopdes()) {
        if (typeof window.showToast === "function") window.showToast("🏪 Jalan kaki ke Kopdes Biru Putih untuk membeli umpan!");
        return;
      }
      if (window.PirakuEconomy && !window.PirakuEconomy.spendCoins(bait.cost, "Beli Umpan " + bait.name + " di Kopdes")) return;
      counts[baitId] = (counts[baitId] || 0) + bait.qtyOnBuy;
      saveBaitCounts(counts);
    }
    setEquippedBaitId(baitId);
    if (typeof window.showToast === "function") window.showToast(`${bait.icon} Umpan ${bait.name} siap dipakai!`);
    window.openFishingHubModal();
  };

  window.openFishingHubModal = function () {
    const modal = ensureFishingModal();
    const bag = getBag();
    const dex = getDex();
    const owned = getOwnedRods();
    const eqId = getEquippedRodId();
    const baits = getBaitCounts();
    const eqBait = getEquippedBaitId();
    const totalVal = bag.reduce((s, f) => s + (Number(f.coins) || 0), 0);
    const caughtTypes = Object.keys(dex).length;
    const atKopdes = isNearKopdes();

    modal.style.display = "flex";
    modal.innerHTML = `
      <div style="width:100%;max-width:440px;max-height:86vh;display:flex;flex-direction:column;background:#0f172a;border:1.5px solid #38bdf8;border-radius:20px;overflow:hidden;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
        <div style="padding:14px 16px;background:linear-gradient(135deg,#0284c7,#1e3a8a);display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:900;font-size:15px;">🎣 Mancing 3D Bandung</div>
            <div style="font-size:11px;color:#e0f2fe;">Fishdex: ${caughtTypes}/${FISH_CATALOG.length} Jenis • ${window.pirakuCurrentEventId === "rain" ? "🌧️ Hujan 2x Rare!" : getActivePond().name}</div>
          </div>
          <button onclick="document.getElementById('piraku-fishing-modal').style.display='none'" style="border:none;background:rgba(15,23,42,0.45);color:#fff;width:30px;height:30px;border-radius:999px;cursor:pointer;font-weight:800;">✕</button>
        </div>
        <div style="padding:12px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;">
          <div style="padding:9px 11px;border-radius:11px;background:${atKopdes ? "rgba(34,197,94,0.16)" : "rgba(245,158,11,0.16)"};border:1px solid ${atKopdes ? "#22c55e" : "#f59e0b"};font-size:11.5px;color:${atKopdes ? "#86efac" : "#fde047"};line-height:1.4;">
            ${atKopdes
              ? "✅ Kamu berada di <b>Kopdes Biru Putih</b> — siap jual ikan, beli umpan, &amp; upgrade joran!"
              : "🏪 Untuk jual ikan, beli umpan, atau upgrade joran, silakan <b>jalan kaki ke Kopdes Biru Putih</b> (" + (window.pirakuInDistrict ? "seberang jalan komplek timur" : "di belakang Museum Geologi") + ")."}
          </div>

          ${bag.length ? `<button onclick="sellAllCaughtFish()" style="width:100%;border:none;background:${atKopdes ? "linear-gradient(135deg,#facc15,#f59e0b)" : "#334155"};color:${atKopdes ? "#0f172a" : "#cbd5e1"};padding:10px;border-radius:11px;font-weight:900;font-size:12px;cursor:pointer;">💰 ${atKopdes ? "Jual Semua " + bag.length + " Ikan (🪙 " + totalVal + ")" : "Jual " + bag.length + " Ikan di Kopdes (🪙 " + totalVal + ")"}</button>` : ""}

          <div>
            <div style="font-size:11px;font-weight:900;color:#93c5fd;text-transform:uppercase;margin-bottom:6px;">🪱 Umpan Mancing</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
              ${BAITS.map(b => {
                const cnt = b.id === "worm" ? "∞" : (baits[b.id] || 0);
                const isEq = eqBait === b.id;
                const needBuy = b.id !== "worm" && (baits[b.id] || 0) <= 0;
                return `
                  <button onclick="buyOrEquipBait('${b.id}')" style="text-align:left;border:1px solid ${isEq ? "#38bdf8" : "rgba(148,163,184,0.22)"};background:${isEq ? "rgba(56,189,248,0.18)" : "rgba(30,41,59,0.75)"};padding:7px 8px;border-radius:10px;color:#f8fafc;cursor:pointer;">
                    <div style="font-size:12px;font-weight:800;">${b.icon} ${b.name}</div>
                    <div style="font-size:10px;color:#94a3b8;margin-top:2px;">Stok: ${cnt}</div>
                    <div style="font-size:10px;font-weight:900;color:${isEq ? "#4ade80" : "#fde047"};margin-top:3px;">${isEq ? "Dipakai ✓" : (!needBuy ? "Pakai" : (atKopdes ? "Beli 🪙 " + b.cost : "🏪 Kopdes"))}</div>
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
                return `
                  <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(30,41,59,0.8);border:1px solid ${isEq ? "#38bdf8" : "rgba(148,163,184,0.2)"};padding:8px 10px;border-radius:11px;">
                    <div>
                      <div style="font-weight:800;font-size:12.5px;">${r.badge} ${r.name}</div>
                      <div style="font-size:10.5px;color:#94a3b8;">Bar ${r.barWidth}% • Luck +${Math.round(r.luckBonus * 100)}% • Mutasi ${Math.round(r.mutChance * 100)}%</div>
                    </div>
                    <button onclick="buyOrEquipFishingRod('${r.id}')" style="border:none;background:${isEq ? "#22c55e" : isOwn ? "#334155" : (atKopdes ? "#facc15" : "#475569")};color:${isEq || (!isOwn && atKopdes) ? "#0f172a" : "#f8fafc"};padding:6px 10px;border-radius:9px;font-weight:900;font-size:11px;cursor:pointer;">${isEq ? "Dipakai ✓" : isOwn ? "Pakai" : (atKopdes ? "🪙 " + r.cost : "🏪 Kopdes (🪙" + r.cost + ")")}</button>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <div>
            <div style="font-size:11px;font-weight:900;color:#93c5fd;text-transform:uppercase;margin-bottom:6px;">🎒 Tas Ikan (${bag.length})</div>
            ${bag.length === 0
              ? `<div style="font-size:11.5px;color:#94a3b8;background:rgba(30,41,59,0.5);padding:10px;border-radius:10px;text-align:center;">Belum ada ikan di tas. Pergi ke kolam & lempar joran!</div>`
              : `<div style="display:flex;flex-direction:column;gap:5px;">
                  ${bag.slice(0, 12).map((f, idx) => {
                    const rs = RARITY_STYLE[f.rarity] || RARITY_STYLE.Common;
                    const isShown = window.pirakuShownFish && window.pirakuShownFish.id === f.id && window.pirakuShownFish.kg === f.kg;
                    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;background:rgba(30,41,59,0.75);padding:7px 10px;border-radius:10px;border-left:3px solid ${rs.border};">
                      <span style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;flex:1;min-width:0;">${renderFishArt(f, 28)} <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${f.mutation ? f.mutation + " " : ""}${f.name} <span style="color:#94a3b8;font-weight:600;">(${f.kg} kg)</span></span></span>
                      <span style="font-size:11px;font-weight:900;color:#fde047;white-space:nowrap;">🪙 ${f.coins}</span>
                      <button onclick="toggleShowOffFish(${idx})" style="border:none;background:${isShown ? "#ef4444" : "#38bdf8"};color:${isShown ? "#fff" : "#0f172a"};padding:4px 8px;border-radius:8px;font-size:10.5px;font-weight:900;cursor:pointer;white-space:nowrap;">${isShown ? "Simpan" : "✨ Pamer"}</button>
                    </div>`;
                  }).join("")}
                </div>`}
          </div>
        </div>
      </div>
    `;
  };

  window.addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;
    if (fishState === "bite") { e.preventDefault(); window.strikePirakuFish(); }
    else if (fishState === "reeling") { e.preventDefault(); isHoldingReel = true; }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "Space" && fishState === "reeling") isHoldingReel = false;
  });

  let lastPondSig = "";
  function tickFishing3D() {
    ensureTamanLansiaPondVisible();
    const pm = typeof window.getMyActivePlayerMesh === "function" ? window.getMyActivePlayerMesh() : null;
    const pond = getActivePond();
    const now = performance.now();

    // Animasi ikan koi berenang di Danau Taman Lansia
    if (pondKoiList.length && lansiaPondGroup && lansiaPondGroup.visible) {
      const kt = now * 0.001;
      for (let i = 0; i < pondKoiList.length; i++) {
        const k = pondKoiList[i];
        const a = kt * k.speed + k.phase;
        const nx = k.cx + Math.cos(a) * k.rx;
        const nz = k.cz + Math.sin(a) * k.rz;
        k.mesh.position.set(nx, 0.14, nz);
        k.mesh.rotation.y = Math.atan2(-Math.sin(a) * k.rx, Math.cos(a) * k.rz);
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
    if (rippleMesh3D && fishState !== "idle") {
      const rp = ((now * (fishState === "reeling" ? 0.0024 : 0.0016)) % 1);
      rippleMesh3D.scale.setScalar(1 + rp * (fishState === "waiting" ? 1.9 : 3.2));
      rippleMesh3D.material.opacity = (1 - rp) * 0.75;
    }
    if (bobberMesh3D && fishState !== "idle") {
      const t = now * 0.006;
      bobberMesh3D.position.y = pond.waterY + (fishState === "waiting" ? Math.sin(t) * 0.03 : Math.sin(t * 4.5) * 0.14);
    }
    if (lineMesh3D && rodMesh3D && bobberMesh3D && fishState !== "idle") {
      updateFishingLine(lineMesh3D, rodMesh3D, bobberMesh3D);
    }

    // Prompt mancing di KANAN BAWAH (bottom: 76px, right: 12px) agar bersih dari Obrolan & Analog kiri bawah!
    let bar = document.getElementById("piraku-fishing-prompt");
    if (!bar && document.body) {
      bar = document.createElement("div");
      bar.id = "piraku-fishing-prompt";
      bar.style.cssText = "position:fixed;bottom:76px;right:12px;z-index:46;display:none;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(15,23,42,0.94);backdrop-filter:blur(10px);border:1.5px solid #38bdf8;color:#f8fafc;font-size:11px;font-weight:800;box-shadow:0 10px 24px rgba(0,0,0,0.6);white-space:nowrap;";
      document.body.appendChild(bar);
    }

    const distToPond = (pm && pm.position) ? Math.hypot(pm.position.x - pond.x, pm.position.z - pond.z) : 999;
    const nearPond = Boolean(pm && pm.position && fishState === "idle" && !wasInWater && distToPond <= pond.radius);

    // Pin lokasi HTML proyeksi 3D "🎣 Mancing di sini" (tajam di jarak berapapun, desain biru-emas beda dari nickname, hilang saat di kolam)
    let worldPin = document.getElementById("piraku-fishing-world-pin");
    if (!worldPin && document.body) {
      worldPin = document.createElement("div");
      worldPin.id = "piraku-fishing-world-pin";
      worldPin.style.cssText = "position:fixed;left:0;top:0;z-index:20;display:none;flex-direction:column;align-items:center;pointer-events:auto;cursor:pointer;transform:translate(-50%,-100%);";
      worldPin.innerHTML = `<div style="background:linear-gradient(135deg,#0284c7,#1d4ed8);border:2px solid #fde047;color:#ffffff;font-size:12px;font-weight:900;padding:5px 12px;border-radius:999px;box-shadow:0 6px 18px rgba(2,132,199,0.55);white-space:nowrap;letter-spacing:0.2px;">🎣 Mancing di sini</div><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #fde047;margin-top:-1px;"></div>`;
      worldPin.onclick = () => { if (typeof window.guideToPirakuFishingSpot === "function") window.guideToPirakuFishingSpot(); };
      document.body.appendChild(worldPin);
    }
    const atLakeArea = Boolean(pm && pm.position && (distToPond <= 13.5 || isPlayerOnPier(pm.position.x, pm.position.z) || isPlayerInLakeWater(pm.position.x, pm.position.z) || fishState !== "idle"));
    if (worldPin) {
      if (!window.pirakuInDistrict && !atLakeArea && window.pirakuCamera && typeof THREE !== "undefined") {
        const pv = new THREE.Vector3(32.5, 2.7 + Math.sin(now * 0.0035) * 0.16, 16.0).project(window.pirakuCamera);
        const sx = (pv.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-pv.y * 0.5 + 0.5) * window.innerHeight;
        if (pv.z < 1 && sx > -80 && sx < window.innerWidth + 80 && sy > 20 && sy < window.innerHeight + 40) {
          worldPin.style.left = sx.toFixed(1) + "px";
          worldPin.style.top = sy.toFixed(1) + "px";
          if (worldPin.style.display !== "flex") worldPin.style.display = "flex";
        } else if (worldPin.style.display !== "none") {
          worldPin.style.display = "none";
        }
      } else if (worldPin.style.display !== "none") {
        worldPin.style.display = "none";
      }
    }
    if (window.pirakuActiveMinimapTarget && window.pirakuActiveMinimapTarget.isFishingGuide && distToPond <= 13.5) {
      window.pirakuActiveMinimapTarget = null;
    }

    if (bar && nearPond) {
      const sig = pond.name + "_" + getBag().length;
      if (lastPondSig !== sig) {
        lastPondSig = sig;
        bar.innerHTML = `<button onclick="castPirakuFishingRod()" style="border:none;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#fff;padding:6px 12px;border-radius:999px;font-weight:900;font-size:11px;cursor:pointer;white-space:nowrap;">🎣 Lempar Joran</button>` +
          `<button onclick="openFishingHubModal()" style="border:none;background:#1e293b;color:#fde047;padding:6px 10px;border-radius:999px;font-weight:800;font-size:11px;cursor:pointer;border:1px solid #475569;white-space:nowrap;">🎒 Tas (${getBag().length})</button>`;
      }
      if (bar.style.display !== "flex") bar.style.display = "flex";
    } else if (bar && bar.style.display !== "none") {
      bar.style.display = "none";
    }

    if (pm) {
      window.syncShownFishOnMesh(pm, window.pirakuShownFish, now);
    }

    requestAnimationFrame(tickFishing3D);
  }

  function create3DFishModel(fishData) {
    const f = FISH_CATALOG.find(x => x.id === fishData.id) || {};
    const grp = new THREE.Group();
    const col = f.meshCol || 0x38bdf8;
    const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.35, metalness: fishData.rarity === "Mythic" ? 0.55 : 0.2 });
    const kgScale = Math.max(0.75, Math.min(2.1, 0.72 + (parseFloat(fishData.kg) || 2) * 0.045)) * (fishData.mut && fishData.mut.includes("Giant") ? 1.35 : 1);

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), mat);
    body.scale.set(0.85, 0.95, 1.45);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.36, 4), mat);
    tail.rotation.x = Math.PI / 2;
    tail.position.z = -0.45;
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), eyeMat);
    eyeL.position.set(0.18, 0.08, 0.24);
    const eyeR = eyeL.clone();
    eyeR.position.x = -0.18;
    grp.add(body, tail, eyeL, eyeR);

    if (fishData.rarity === "Epic" || fishData.rarity === "Mythic") {
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 5), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
      crown.position.set(0, 0.34, 0.05);
      grp.add(crown);
    }

    // Label kecil nama ikan di atas ikan 3D
    const cv = document.createElement("canvas");
    cv.width = 320; cv.height = 64;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.beginPath(); ctx.roundRect(6, 6, 308, 52, 26); ctx.fill();
    ctx.strokeStyle = f.col || "#fde047"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#fde047"; ctx.font = "900 22px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`${fishData.name} (${fishData.kg}kg)`, 160, 33);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false }));
    spr.scale.set(2.4, 0.48, 1);
    spr.position.set(0, 0.65, 0);
    grp.add(spr);

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
    mesh._pirakuShownFishGrp.position.set(0, 1.48 + Math.sin((now || performance.now()) * 0.004) * 0.09, 0.72);
    mesh._pirakuShownFishGrp.rotation.y = Math.sin((now || performance.now()) * 0.0025) * 0.35;
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
      entry.remoteBobber = createBobberGroup(f.bx || entry.mesh.position.x, wy, f.bz || entry.mesh.position.z);
      sc.add(entry.remoteBobber);
      entry.remoteRipple = createRippleMesh(f.bx || entry.mesh.position.x, wy, f.bz || entry.mesh.position.z);
      sc.add(entry.remoteRipple);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), entry.remoteBobber.position.clone()]);
      entry.remoteLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xe2e8f0 }));
      sc.add(entry.remoteLine);
    }
    const ud = entry.mesh.userData && entry.mesh.userData.a;
    animateFishingPose(ud, entry.remoteRod, f.state, now, entry.remoteFishStart || now);
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
        window.showToast("🎣 Kolam komplek ada di Taman Air Mancur (-42.8, 17.5), atau keluar ke Kota untuk ke Danau Taman Lansia!");
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

  setTimeout(() => { showFishingUpdateBanner(); requestAnimationFrame(tickFishing3D); }, 800);
})();
