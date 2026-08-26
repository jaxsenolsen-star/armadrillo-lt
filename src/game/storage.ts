import { UPGRADES } from "./upgrades";

export type SaveData = {
  username: string;
  coins: number;
  levels: Record<string, number>;
  bestDepth: number;
  bestValue: number;
  runs: number;
  ownedShells: string[];
  equippedShell: string;
  /** Unlocked by entering the secret code on the title screen. */
  admin: boolean;
};

const SAVE_KEY = "armadrillo.save.v1";

export function defaultSave(): SaveData {
  return {
    username: "",
    coins: 0,
    levels: Object.fromEntries(UPGRADES.map((u) => [u.id, 0])),
    bestDepth: 0,
    bestValue: 0,
    runs: 0,
    ownedShells: ["basic"],
    equippedShell: "basic",
    admin: false,
  };
}

export function loadSave(): SaveData {
  const base = defaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...base,
      ...parsed,
      levels: { ...base.levels, ...(parsed.levels ?? {}) },
      ownedShells: parsed.ownedShells?.length ? parsed.ownedShells : ["basic"],
      equippedShell: parsed.equippedShell ?? "basic",
      admin: parsed.admin ?? false,
    };
  } catch {
    return base;
  }
}

export function saveSave(data: SaveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}
