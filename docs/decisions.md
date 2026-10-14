# Decisions

Newest at the bottom. Each entry: what was decided, why, and the date. To change a decision, add a new entry that replaces the old one instead of editing it.

## Decided

**D1 · Next.js (App Router) + TypeScript on Vercel Hobby** (2026-10-04)
The user's preferred stack; deploys natively to Vercel. Personal non-commercial use fits the free plan.

**D2 · Convex for database, real-time and file storage** (2026-10-04)
Vercel functions cannot hold WebSocket connections, so live sync needs a separate service. Convex reactive queries push game state to every screen with no WebSocket code. Supabase was rejected because free projects pause after 7 days of low activity, and Quz is idle about 10 months a year.

**D3 · No player accounts; one shared host passphrase in an env var** (2026-10-04)
Security is not a goal. Teams join by QR code and team name; the team id is kept in localStorage so a phone can rejoin after a refresh.

**D4 · Tailwind CSS + shadcn/ui, Zod, qrcode.react** (2026-10-04)
Zod: one discriminated union per question type, shared by editor and grader. QR codes are generated in the browser, no external service.

**D5 · Long videos as YouTube or unlisted links; images and audio in Convex storage** (2026-10-04)

**D6 · Scores are derived, never stored** (2026-10-04)
Computed from `answers` and `adjustments`. Reusing a quiz means copying it, so old results stay intact.

**D7 · AI assist deferred** (2026-10-04)
No LLM API is free, so it is outside the free-tier baseline.

**D8 · Repo docs are the source of truth for development** (2026-10-14)
`docs/` holds product, decisions and plan. The claude.ai doc "Quz – Product & Tech Decisions" was the starting point and can be kept for discussing with the co-host.

**D9 · Project layout** (2026-10-14)
Next.js 16 with `src/` directory, npm, Convex functions in `convex/` at the repo root.

## Open questions

- [ ] Convex document store fine, or Postgres (Supabase) with a keep-alive? (Leaning Convex, see D2.)
- [ ] UI language: Swedish only, or Swedish and English?
- [ ] På spåret: may a team change its guess after locking it, and does a wrong locked guess score zero?
- [ ] Free-text grading: is exact match after normalization (case, spaces, åäö) enough, with the host fixing the rest?
- [ ] Large media such as the På spåret film: upload (1 GB free storage) or link to YouTube?
- [ ] AI assist: draft whole rounds from a theme, or only suggest single questions and wrong options?
- [ ] Activities: support some digitally (drawing an answer, a timed maths question), or always score by hand?
