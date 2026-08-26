import { ADMIN_SHELL, SHELLS } from "@/game/shells";
import type { SaveData } from "@/game/storage";

export function ShellShop({
  save,
  persist,
  back,
}: {
  save: SaveData;
  persist: (s: SaveData) => void;
  back: () => void;
}) {
  const isOwned = (id: string) => save.ownedShells.includes(id);
  const isEquipped = (id: string) => save.equippedShell === id;

  // Admin Shell is hidden until it has been granted from the admin panel.
  const list = isOwned(ADMIN_SHELL.id) ? [ADMIN_SHELL, ...SHELLS] : SHELLS;

  const buy = (id: string, cost: number) => {
    if (isOwned(id) || save.coins < cost) return;
    persist({
      ...save,
      coins: save.coins - cost,
      ownedShells: [...save.ownedShells, id],
      equippedShell: id,
    });
  };

  const equip = (id: string) => {
    if (!isOwned(id)) return;
    persist({ ...save, equippedShell: id });
  };

  return (
    <div className="w-full max-w-2xl">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-3xl font-extrabold text-gold">🐢 Shell Shop</h2>
        <span className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-card px-3 py-1.5 text-lg font-extrabold">
          🪙 {save.coins.toLocaleString()}
        </span>
      </header>
      <div className="panel divide-y-2 divide-border p-2">
        {list.map((s) => {
          const owned = isOwned(s.id);
          const equipped = isEquipped(s.id);
          const afford = save.coins >= s.cost;
          return (
            <div key={s.id} className="flex items-center gap-3 p-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-border bg-secondary text-2xl">
                <span aria-hidden>{s.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-extrabold">
                  {s.name}
                  {equipped && <span className="ml-2 text-sm text-accent">equipped</span>}
                </p>
                <p className="truncate text-sm text-muted-foreground">{s.desc}</p>
              </div>
              {owned ? (
                <button
                  disabled={equipped}
                  onClick={() => equip(s.id)}
                  className="chunky shrink-0 rounded-xl border-2 border-border bg-accent px-4 py-2 font-extrabold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {equipped ? "✓" : "Equip"}
                </button>
              ) : (
                <button
                  disabled={!afford}
                  onClick={() => buy(s.id, s.cost)}
                  className="chunky shrink-0 rounded-xl border-2 border-border bg-gold px-4 py-2 font-extrabold text-gold-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  🪙 {s.cost.toLocaleString()}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <button
          onClick={back}
          className="chunky w-full rounded-2xl border-2 border-border bg-secondary px-6 py-3 text-xl font-extrabold text-secondary-foreground"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
