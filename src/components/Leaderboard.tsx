import { useEffect, useState, useCallback } from "react";
import { supabase, type LeaderRow } from "@/lib/supabase";

export function Leaderboard({
  me,
  back,
  highlightScore,
}: {
  me: string;
  back: () => void;
  highlightScore?: number;
}) {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase
      .from("leaderboard")
      .select("id, player_name, score, depth, value, shell, created_at")
      .order("score", { ascending: false })
      .limit(50);
    if (error) {
      setError("Could not load leaderboard.");
      setLoading(false);
      return;
    }
    setRows((data ?? []) as LeaderRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBoard();
    const ch = supabase
      .channel("leaderboard-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leaderboard" },
        () => fetchBoard(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "leaderboard" },
        () => fetchBoard(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [fetchBoard]);

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="w-full max-w-xl">
      <h2 className="mb-4 flex items-center gap-2 text-3xl font-extrabold text-gold">
        🏆 Deepest Dillos
        <span className="flex items-center gap-1 text-sm font-bold text-accent">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          live
        </span>
      </h2>
      <div className="panel overflow-hidden p-2">
        {loading && rows.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">Loading scores...</p>
        )}
        {error && <p className="p-6 text-center text-destructive">{error}</p>}
        {!loading && !error && rows.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">
            No scores yet — be the first to dig!
          </p>
        )}
        {rows.map((e, i) => {
          const isMe = e.player_name === me;
          const isHi = highlightScore != null && e.score === highlightScore;
          return (
            <div
              key={e.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                isHi ? "bg-primary/30 ring-2 ring-primary" : isMe ? "bg-secondary" : ""
              }`}
            >
              <span className="w-8 font-pixel text-[10px] text-muted-foreground">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-lg font-extrabold">
                {e.player_name}
                {isMe && <span className="ml-2 text-sm text-accent">you</span>}
              </span>
              {e.shell && e.shell !== "basic" && (
                <span className="hidden text-xs capitalize text-muted-foreground sm:inline">
                  {e.shell}
                </span>
              )}
              <span className="font-extrabold text-gem">⬇ {e.depth} m</span>
              <span className="w-24 text-right font-extrabold text-gold">🪙 {e.score}</span>
              <span className="hidden w-16 text-right text-xs text-muted-foreground sm:inline">
                {fmtTime(e.created_at)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Real player scores — updates live as people play.
      </p>
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
