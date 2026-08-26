export type ShellEffects = {
  magnet?: boolean;
  lavaReduction?: number;
  fuelReduction?: number;
  coinBonus?: number;
  drillBonus?: number;
  armorBonus?: number;
  speedBonus?: number;
  doubleOres?: boolean;
  hpBonus?: number;
  /** Flat bonus tiers added to the drill snout level (admin only). */
  drillTier?: number;
  /** Bigger magnet radius multiplier (admin only). */
  magnetPower?: number;
};

export type Shell = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cost: number;
  effects: ShellEffects;
};

export const SHELLS: Shell[] = [
  {
    id: "basic",
    name: "Basic Shell",
    icon: "🦔",
    desc: "Standard armadillo shell. No special powers.",
    cost: 0,
    effects: {},
  },
  {
    id: "magnetic",
    name: "Magnetic Shell",
    icon: "🧲",
    desc: "Pulls nearby ores toward you automatically.",
    cost: 1_000_000,
    effects: { magnet: true },
  },
  {
    id: "lava",
    name: "Lava Shell",
    icon: "🌋",
    desc: "Take 50% less lava damage.",
    cost: 1_500_000,
    effects: { lavaReduction: 0.5 },
  },
  {
    id: "charged",
    name: "Charged Shell",
    icon: "⚡",
    desc: "Fuel usage decreased by 50%.",
    cost: 1_200_000,
    effects: { fuelReduction: 0.5 },
  },
  {
    id: "golden",
    name: "Golden Shell",
    icon: "✨",
    desc: "+25% coin value from every ore collected.",
    cost: 800_000,
    effects: { coinBonus: 0.25 },
  },
  {
    id: "diamond",
    name: "Diamond Shell",
    icon: "💎",
    desc: "+15% drill speed. Glitters with compressed carbon.",
    cost: 2_000_000,
    effects: { drillBonus: 0.15 },
  },
  {
    id: "obsidian",
    name: "Obsidian Shell",
    icon: "🪨",
    desc: "+30% damage reduction from all hazards.",
    cost: 1_800_000,
    effects: { armorBonus: 0.3 },
  },
  {
    id: "turbo",
    name: "Turbo Shell",
    icon: "🏎️",
    desc: "+20% horizontal movement speed underground.",
    cost: 900_000,
    effects: { speedBonus: 0.2 },
  },
  {
    id: "prospector",
    name: "Prospector's Shell",
    icon: "⛏️",
    desc: "Doubles ore spawn density — more loot everywhere.",
    cost: 1_600_000,
    effects: { doubleOres: true },
  },
  {
    id: "titanium",
    name: "Titanium Shell",
    icon: "🔩",
    desc: "+10% drill, +10% armor, +10% coin value.",
    cost: 2_500_000,
    effects: { drillBonus: 0.1, armorBonus: 0.1, coinBonus: 0.1 },
  },
  {
    id: "phoenix",
    name: "Phoenix Shell",
    icon: "🔥",
    desc: "Halves lava damage AND fuel usage.",
    cost: 3_500_000,
    effects: { lavaReduction: 0.5, fuelReduction: 0.5 },
  },
  {
    id: "mythic",
    name: "Mythic Shell",
    icon: "🌟",
    desc: "+20% coins, +20% drill, +20% speed, +20% armor, +30% HP.",
    cost: 5_000_000,
    effects: {
      coinBonus: 0.2,
      drillBonus: 0.2,
      speedBonus: 0.2,
      armorBonus: 0.2,
      hpBonus: 0.3,
    },
  },
];

/**
 * Hidden shell, only obtainable through the admin panel.
 * Not part of SHELLS so it never shows up in the normal Shell Shop list.
 */
export const ADMIN_SHELL: Shell = {
  id: "admin",
  name: "Admin Shell",
  icon: "👑",
  desc: "DEV: max drill, magnet, double ores, huge HP / speed / coins, near-immune.",
  cost: 0,
  effects: {
    magnet: true,
    magnetPower: 3,
    lavaReduction: 0.95,
    fuelReduction: 0.85,
    coinBonus: 4,
    drillBonus: 1,
    drillTier: 12,
    armorBonus: 0.95,
    speedBonus: 1,
    doubleOres: true,
    hpBonus: 9,
  },
};

/** Every shell including hidden ones — use this for lookups by id. */
export const ALL_SHELLS: Shell[] = [...SHELLS, ADMIN_SHELL];

export function getShell(id: string): Shell {
  return ALL_SHELLS.find((s) => s.id === id) ?? SHELLS[0];
}
