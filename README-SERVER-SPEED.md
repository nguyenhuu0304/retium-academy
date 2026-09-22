# Retium Academy — server-timed score TEST

1. Backup Supabase and project. Run `SQL-SERVER-SPEED.sql` in Supabase SQL Editor. It preserves existing scores, but replaces the old scoring RPC. Do not run old `SQL-SECURE-QUIZ.sql` afterward.
2. Copy this package into a NEW project folder; preserve existing `.env.local` privately. Never upload `.env.local`.
3. `npm install`, `npm run build`, then `npm run dev`. Test two Discord accounts, 5/5 with different speeds, duplicate save, retake same day, timeout, and refresh.
4. Do not deploy before tests. Legacy points remain unchanged (historical speed cannot be reconstructed).

Security limitations: the question bank/answer key is still included in the client bundle, so a player can look up answers. Server timestamps and points are authoritative, but this is NOT a cheat-proof competitive quiz. The server awards timing based on when it receives each answer, and latency may affect bonus. Existing truncated Discord player keys can theoretically collide. Do not advertise this as fully secure or use it for financial rewards.
