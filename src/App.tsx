import { useCallback, useEffect, useRef, useState } from "react";
import { GameCanvas } from "@/components/game/GameCanvas";
import { Leaderboard } from "@/components/Leaderboard";
import { ShellShop } from "@/components/ShellShop";
import { ORES } from "@/game/ores";
import { UPGRADES, upgradeCost } from "@/game/upgrades";
import { ADMIN_SHELL, ALL_SHELLS, SHELLS, getShell } from "@/game/shells";
import {
  defaultSave,
  loadSave,
  saveSave,
  type SaveData,
} from "@/game/storage";
import { supabase } from "@/lib/supabase";
import type { RunResult } from "@/game/engine";

type Screen =
  | "name"
  | "menu"
  | "shop"
  | "shells"
  | "board"
  | "play"
  | "result"
  | "code"
  | "admin";

const SECRET_CODE = "DRILLO09";

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("menu");
  const [save, setSave] = useState<SaveData>(defaultSave);
  const [result, setResult] = useState<RunResult | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [highlightScore, setHighlightScore] = useState<number | undefined>();

  useEffect(() => {
    const s = loadSave();
    setSave(s);
    setScreen(s.username ? "menu" : "name");
    setReady(true);
  }, []);

  const persist = useCallback((next: SaveData) => {
    setSave(next);
    saveSave(next);
  }, []);

  const onEnd = useCallback(
    (r: RunResult) => {
      setResult(r);
      const next: SaveData = {
        ...save,
        coins: save.coins + r.value,
        bestDepth: Math.max(save.bestDepth, r.depth),
        bestValue: Math.max(save.bestValue, r.value),
        runs: save.runs + 1,
      };
      persist(next);
      setScreen("result");
    },
    [save, persist],
  );

  if (!ready) return <div className="min-h-screen bg-background" />;

  if (screen === "play")
    return <GameCanvas save={save} onEnd={onEnd} onQuit={() => setScreen("menu")} />;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Backdrop />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10">
        {screen === "name" && (
          <NamePrompt
            value={nameInput}
            onChange={setNameInput}
            onSubmit={() => {
              const name = nameInput.trim().slice(0, 14) || "Dillo";
              persist({ ...save, username: name });
              setScreen("menu");
            }}
          />
        )}
        {screen === "menu" && (
          <Menu
            save={save}
            go={setScreen}
            onPlay={() => setScreen("play")}
            onSecret={() => setScreen(save.admin ? "admin" : "code")}
          />
        )}
        {screen === "code" && (
          <CodePrompt
            onUnlock={() => {
              persist({ ...save, admin: true });
              setScreen("admin");
            }}
            back={() => setScreen("menu")}
          />
        )}
        {screen === "admin" && (
          <AdminPanel save={save} persist={persist} back={() => setScreen("menu")} />
        )}
        {screen === "shop" && (
          <Shop save={save} persist={persist} back={() => setScreen("menu")} />
        )}
        {screen === "shells" && (
          <ShellShop save={save} persist={persist} back={() => setScreen("menu")} />
        )}
        {screen === "board" && (
          <Leaderboard
            me={save.username}
            highlightScore={highlightScore}
            back={() => {
              setHighlightScore(undefined);
              setScreen("menu");
            }}
          />
        )}
        {screen === "result" && result && (
          <Result
            result={result}
            save={save}
            onSubmitted={(score) => {
              setHighlightScore(score);
              setScreen("board");
            }}
            again={() => setScreen("play")}
            menu={() => setScreen("menu")}
            shop={() => setScreen("shop")}
            shells={() => setScreen("shells")}
          />
        )}
      </div>
    </main>
  );
}

function Backdrop() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="h-[26vh] w-full" style={{ background: "var(--gradient-sky)" }} />
      <div className="h-[6px] w-full bg-grass" />
      <div className="h-[74vh] w-full" style={{ background: "var(--gradient-dirt)" }} />
      <div className="absolute inset-0 opacity-40 mix-blend-overlay [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.35)_1px,transparent_0)] [background-size:7px_7px]" />
    </div>
  );
}

function Title({ onSecret }: { onSecret?: () => void }) {
  const hits = useRef(0);
  const timer = useRef<number | null>(null);

  // Five *consecutive* taps on the final O — a pause of 1.5s breaks the streak.
  const tapO = () => {
    if (!onSecret) return;
    hits.current += 1;
    if (timer.current) window.clearTimeout(timer.current);
    if (hits.current >= 5) {
      hits.current = 0;
      onSecret();
      return;
    }
    timer.current = window.setTimeout(() => {
      hits.current = 0;
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="mb-6 text-center">
      <h1 className="title-outline text-5xl font-extrabold text-gold sm:text-7xl">
        ARMADRILL
        <span
          onClick={tapO}
          className={onSecret ? "cursor-pointer select-none" : undefined}
        >
          O
        </span>
      </h1>
      <p className="mt-2 font-pixel text-[10px] leading-relaxed text-foreground sm:text-xs">
        launch • roll • smash • mine deeper
      </p>
    </div>
  );
}

function Btn({
  children,
  onClick,
  tone = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "primary" | "secondary" | "accent";
  disabled?: boolean;
}) {
  const tones = {
    primary: "bg-gold text-gold-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
  } as const;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`chunky w-full rounded-2xl border-2 border-border px-6 py-3 text-xl font-extrabold disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function NamePrompt({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="w-full max-w-md">
      <Title />
      <form
        className="panel space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h2 className="text-2xl">Pick your dillo name</h2>
        <p className="text-sm text-muted-foreground">
          Shown on the leaderboard with your best scores.
        </p>
        <input
          autoFocus
          value={value}
          maxLength={14}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. RollyPoly"
          className="w-full rounded-xl border-2 border-border bg-input px-4 py-3 text-lg font-bold text-foreground outline-none focus:border-ring"
        />
        <Btn>Start digging</Btn>
      </form>
    </div>
  );
}

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-card px-3 py-1.5 text-lg font-extrabold">
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}

function Menu({
  save,
  go,
  onPlay,
  onSecret,
}: {
  save: SaveData;
  go: (s: Screen) => void;
  onPlay: () => void;
  onSecret: () => void;
}) {
  const equippedShell = getShell(save.equippedShell);
  return (
    <div className="w-full max-w-md">
      <Title onSecret={onSecret} />
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        <Stat icon="🪙" label={`${save.coins.toLocaleString()}`} />
        <Stat icon="⬇" label={`${save.bestDepth} m best`} />
        <Stat icon={equippedShell?.icon ?? "🦔"} label={save.username || "Dillo"} />
      </div>
      <div className="panel space-y-3 p-6">
        <Btn onClick={onPlay}>▶ Play</Btn>
        <Btn tone="accent" onClick={() => go("shells")}>
          🐢 Shell Shop
        </Btn>
        <Btn tone="accent" onClick={() => go("shop")}>
          🛠 Upgrades
        </Btn>
        <Btn tone="secondary" onClick={() => go("board")}>
          🏆 Leaderboard
        </Btn>
        {save.admin && (
          <Btn tone="secondary" onClick={() => go("admin")}>
            👑 Admin Panel
          </Btn>
        )}
        <p className="pt-1 text-center text-sm text-muted-foreground">
          Drag to aim, release to launch. Steer with A / D or ← → — steering needs fuel.
          Stop completely and the run ends. Esc quits.
        </p>
      </div>
    </div>
  );
}

function CodePrompt({
  onUnlock,
  back,
}: {
  onUnlock: () => void;
  back: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (value.trim().toUpperCase() === SECRET_CODE) {
      onUnlock();
      return;
    }
    setError(true);
    setValue("");
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="title-outline text-4xl font-extrabold text-gold sm:text-5xl">
          RESTRICTED
        </h1>
        <p className="mt-2 font-pixel text-[10px] leading-relaxed text-foreground sm:text-xs">
          maintenance hatch • enter code
        </p>
      </div>
      <form
        className="panel space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <h2 className="text-2xl">🔒 Password</h2>
        <p className="text-sm text-muted-foreground">
          This hatch leads to the dev tunnels. Wrong codes get you nowhere.
        </p>
        <input
          autoFocus
          type="password"
          value={value}
          maxLength={24}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder="••••••••"
          className="w-full rounded-xl border-2 border-border bg-input px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] text-foreground outline-none focus:border-ring"
        />
        {error && (
          <p className="text-center text-sm font-bold text-destructive">
            Access denied. The hatch stays shut.
          </p>
        )}
        <Btn>Unlock</Btn>
        <Btn tone="secondary" onClick={back}>
          ← Back
        </Btn>
      </form>
    </div>
  );
}

function AdminPanel({
  save,
  persist,
  back,
}: {
  save: SaveData;
  persist: (s: SaveData) => void;
  back: () => void;
}) {
  const [note, setNote] = useState("Admin access granted. Welcome, boss.");
  const MAX_LEVEL = 30;

  const maxedLevels = () =>
    Object.fromEntries(UPGRADES.map((u) => [u.id, MAX_LEVEL]));

  const giveCoins = (n: number) => {
    persist({ ...save, coins: save.coins + n });
    setNote(`+${n.toLocaleString()} coins added.`);
  };

  const maxUpgrades = () => {
    persist({ ...save, levels: maxedLevels() });
    setNote(`All ${UPGRADES.length} upgrades set to Lv ${MAX_LEVEL}.`);
  };

  const unlockShells = () => {
    persist({ ...save, ownedShells: SHELLS.map((s) => s.id) });
    setNote(`All ${SHELLS.length} shells unlocked.`);
  };

  const grantAdminShell = () => {
    persist({
      ...save,
      ownedShells: Array.from(new Set([...save.ownedShells, ADMIN_SHELL.id])),
      equippedShell: ADMIN_SHELL.id,
    });
    setNote("Admin Shell granted and equipped. All stats boosted.");
  };

  const giveEverything = () => {
    persist({
      ...save,
      coins: 1_000_000_000,
      levels: maxedLevels(),
      ownedShells: ALL_SHELLS.map((s) => s.id),
      equippedShell: ADMIN_SHELL.id,
      bestDepth: Math.max(save.bestDepth, 1),
    });
    setNote("EVERYTHING granted: 1B coins, max upgrades, every shell.");
  };

  const wipe = () => {
    persist({
      ...defaultSave(),
      username: save.username,
      admin: true,
    });
    setNote("Progress wiped. Admin access kept.");
  };

  const equipped = getShell(save.equippedShell);

  return (
    <div className="w-full max-w-2xl">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-3xl font-extrabold text-gold">👑 Admin Panel</h2>
        <Stat icon="🪙" label={`${save.coins.toLocaleString()}`} />
      </header>

      <div className="panel space-y-4 p-6">
        <p className="rounded-xl border-2 border-border bg-secondary px-4 py-2 text-center text-sm font-bold text-secondary-foreground">
          {note}
        </p>

        <section className="space-y-2">
          <h3 className="text-xl font-extrabold text-accent">🪙 Money</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[10_000, 1_000_000, 100_000_000, 1_000_000_000].map((n) => (
              <button
                key={n}
                onClick={() => giveCoins(n)}
                className="chunky rounded-xl border-2 border-border bg-gold px-3 py-2 font-extrabold text-gold-foreground"
              >
                +{n >= 1_000_000_000
                  ? "1B"
                  : n >= 1_000_000
                    ? `${n / 1_000_000}M`
                    : `${n / 1000}K`}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-xl font-extrabold text-accent">🛠 Unlocks</h3>
          <Btn tone="accent" onClick={maxUpgrades}>
            ⬆ Max all upgrades (Lv {MAX_LEVEL})
          </Btn>
          <Btn tone="accent" onClick={unlockShells}>
            🐢 Unlock every shell
          </Btn>
          <Btn tone="accent" onClick={grantAdminShell}>
            👑 Grant + equip Admin Shell
          </Btn>
        </section>

        <section className="space-y-2">
          <h3 className="text-xl font-extrabold text-accent">⚡ One tap</h3>
          <Btn onClick={giveEverything}>🎁 GIVE ME EVERYTHING</Btn>
        </section>

        <div className="rounded-xl border-2 border-border bg-card/60 p-3 text-sm text-muted-foreground">
          <p className="font-bold text-foreground">Current loadout</p>
          <p>
            {equipped.icon} {equipped.name} · {save.ownedShells.length} shells owned ·{" "}
            {UPGRADES.map((u) => `${u.icon}${save.levels[u.id] ?? 0}`).join(" ")}
          </p>
        </div>

        <Btn tone="secondary" onClick={wipe}>
          🗑 Wipe progress
        </Btn>
        <Btn tone="secondary" onClick={back}>
          ← Back to menu
        </Btn>
      </div>
    </div>
  );
}

function Shop({
  save,
  persist,
  back,
}: {
  save: SaveData;
  persist: (s: SaveData) => void;
  back: () => void;
}) {
  return (
    <div className="w-full max-w-2xl">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-3xl font-extrabold text-gold">🛠 Upgrades</h2>
        <Stat icon="🪙" label={`${save.coins.toLocaleString()}`} />
      </header>
      <div className="panel divide-y-2 divide-border p-2">
        {UPGRADES.map((u) => {
          const level = save.levels[u.id] ?? 0;
          const cost = upgradeCost(u, level);
          const afford = save.coins >= cost;
          return (
            <div key={u.id} className="flex items-center gap-3 p-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-border bg-secondary text-2xl">
                <span aria-hidden>{u.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-extrabold">
                  {u.name} <span className="text-muted-foreground">Lv {level}</span>
                </p>
                <p className="truncate text-sm text-muted-foreground">{u.desc}</p>
                <p className="text-sm font-bold text-accent">
                  now: {u.effect(level)} → next: {u.effect(level + 1)}
                </p>
              </div>
              <button
                disabled={!afford}
                onClick={() =>
                  persist({
                    ...save,
                    coins: save.coins - cost,
                    levels: { ...save.levels, [u.id]: level + 1 },
                  })
                }
                className="chunky shrink-0 rounded-xl border-2 border-border bg-gold px-4 py-2 font-extrabold text-gold-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                🪙 {cost.toLocaleString()}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <Btn tone="secondary" onClick={back}>
          ← Back
        </Btn>
      </div>
    </div>
  );
}

function Result({
  result,
  save,
  onSubmitted,
  again,
  menu,
  shop,
  shells,
}: {
  result: RunResult;
  save: SaveData;
  onSubmitted: (score: number) => void;
  again: () => void;
  menu: () => void;
  shop: () => void;
  shells: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = result.value + Math.floor(result.depth * 2);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const { error: insErr } = await supabase.from("leaderboard").insert({
      player_name: save.username || "Dillo",
      score,
      depth: result.depth,
      value: result.value,
      shell: save.equippedShell,
    });
    setSubmitting(false);
    if (insErr) {
      setError("Could not submit score. Try again.");
      return;
    }
    setSubmitted(true);
    onSubmitted(score);
  };

  const found = ORES.filter((o) => result.ores[o.id]);
  return (
    <div className="w-full max-w-md">
      <h2 className="mb-4 text-center text-4xl font-extrabold text-gold">Run over!</h2>
      <div className="panel space-y-4 p-6">
        <div className="flex justify-center gap-2">
          <Stat icon="⬇" label={`${result.depth} m`} />
          <Stat icon="🪙" label={`+${result.value.toLocaleString()}`} />
          <Stat icon="★" label={`${score.toLocaleString()}`} />
        </div>
        {found.length > 0 ? (
          <ul className="space-y-1">
            {found.map((o) => (
              <li key={o.id} className="flex items-center gap-2 text-base font-bold">
                <span
                  aria-hidden
                  className="size-4 rounded-sm border border-border"
                  style={{ background: o.colors[1] }}
                />
                <span className="flex-1">{o.name}</span>
                <span className="text-muted-foreground">×{result.ores[o.id]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">No ore this time — dig on!</p>
        )}
        <p className="text-center text-sm text-muted-foreground">
          Best depth {save.bestDepth} m · {save.coins.toLocaleString()} coins banked
        </p>

        {!submitted ? (
          <button
            onClick={submit}
            disabled={submitting}
            className="chunky w-full rounded-2xl border-2 border-border bg-accent px-6 py-3 text-lg font-extrabold text-accent-foreground disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "🏆 Submit to leaderboard"}
          </button>
        ) : (
          <p className="text-center text-sm font-bold text-accent">
            Score submitted! Check the leaderboard.
          </p>
        )}
        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <Btn onClick={again}>▶ Launch again</Btn>
        <Btn tone="accent" onClick={shells}>
          🐢 Shell Shop
        </Btn>
        <Btn tone="accent" onClick={shop}>
          ��� Spend coins
        </Btn>
        <Btn tone="secondary" onClick={menu}>
          ← Main menu
        </Btn>
      </div>
    </div>
  );
}
