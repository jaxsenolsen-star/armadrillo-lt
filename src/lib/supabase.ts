import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** False when the env vars are missing — the game still runs, only the leaderboard is offline. */
export const supabaseReady = Boolean(url && anon);

if (!supabaseReady) {
  console.warn(
    "[armadrillo] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — leaderboard disabled.",
  );
}

// Placeholders keep createClient from throwing at import time, which would blank the whole app.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anon || "placeholder-anon-key",
  { auth: { persistSession: false } },
);

export type LeaderRow = {
  id: string;
  player_name: string;
  score: number;
  depth: number;
  value: number;
  shell: string | null;
  created_at: string;
};
