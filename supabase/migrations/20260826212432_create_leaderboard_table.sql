/*
# Create Armadrillo leaderboard table (single-tenant, no auth)

1. New Tables
- `leaderboard`
  - `id` (uuid, primary key)
  - `player_name` (text, not null) — the name the player enters
  - `score` (bigint, not null) — final score (coins + depth bonus)
  - `depth` (integer, not null) — max depth reached in meters
  - `coins_collected` (bigint, not null) — total coins collected this run
  - `shell` (text) — which shell was equipped during the run
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `leaderboard`.
- Allow anon + authenticated CRUD because the game has no sign-in; data is intentionally public/shared (a global arcade leaderboard).
- All four CRUD policies use `TO anon, authenticated`.

3. Notes
- No user_id / no auth — this is a global arcade leaderboard where anyone can submit a score.
- `score` is bigint to handle large values.
- An index on `score DESC` accelerates the top-N query the leaderboard UI runs on every load.
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  score bigint NOT NULL,
  depth integer NOT NULL,
  coins_collected bigint NOT NULL,
  shell text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS leaderboard_score_desc_idx ON leaderboard (score DESC);

DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard;
CREATE POLICY "anon_select_leaderboard"
ON leaderboard FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard;
CREATE POLICY "anon_insert_leaderboard"
ON leaderboard FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leaderboard" ON leaderboard;
CREATE POLICY "anon_update_leaderboard"
ON leaderboard FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leaderboard" ON leaderboard;
CREATE POLICY "anon_delete_leaderboard"
ON leaderboard FOR DELETE
TO anon, authenticated USING (true);
