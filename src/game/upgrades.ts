export type Upgrade = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cost: number;
  growth: number;
  effect: (level: number) => string;
};

export const UPGRADES: Upgrade[] = [
  {
    id: "launcher",
    name: "Cannon Launcher",
    icon: "🎯",
    desc: "More launch power off the surface.",
    cost: 40,
    growth: 1.35,
    effect: (l) => `+${l * 5}% power`,
  },
  {
    id: "plating",
    name: "Shell Plating",
    icon: "🛡️",
    desc: "More max HP and less lava damage.",
    cost: 60,
    growth: 1.38,
    effect: (l) => `${100 + l * 12} max HP`,
  },
  {
    id: "spurs",
    name: "Speed Spurs",
    icon: "💨",
    desc: "Faster rolling and sharper steering.",
    cost: 55,
    growth: 1.34,
    effect: (l) => `+${l * 4}% speed & steer`,
  },
  {
    id: "stamina",
    name: "Stamina Tank",
    icon: "🔋",
    desc: "Bigger fuel meter, slower burn.",
    cost: 50,
    growth: 1.33,
    effect: (l) => `+${l * 10}% fuel`,
  },
  {
    id: "drill",
    name: "Drill Snout",
    icon: "⛏️",
    desc: "Break harder rock and tougher ore.",
    cost: 120,
    growth: 1.58,
    effect: (l) => `dig tier ${l}`,
  },
  {
    id: "fortune",
    name: "Fortune Charm",
    icon: "🍀",
    desc: "Every ore is worth more coins.",
    cost: 90,
    growth: 1.40,
    effect: (l) => `+${l * 7}% value`,
  },
];

export function upgradeCost(u: Upgrade, level: number) {
  return Math.round(u.cost * Math.pow(u.growth, level));
}
