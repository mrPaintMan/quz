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
Zod: one discriminated union per question type, shared by editor and grader (Zod part replaced by D12). QR codes are generated in the browser, no external service.

**D5 · Long videos as YouTube or unlisted links; images and audio in Convex storage** (2026-10-04)

**D6 · Scores are derived, never stored** (2026-10-04)
Computed from `answers` and `adjustments`. Reusing a quiz means copying it, so old results stay intact.

**D7 · AI assist deferred** (2026-10-04)
No LLM API is free, so it is outside the free-tier baseline.

**D8 · Repo docs are the source of truth for development** (2026-10-14)
`docs/` holds product, decisions and plan. The claude.ai doc "Quz – Product & Tech Decisions" was the starting point and can be kept for discussing with the co-host.

**D9 · Project layout** (2026-10-14)
Next.js 16 with `src/` directory, npm, Convex functions in `convex/` at the repo root.

**D10 · Clean code, colocated tests and 80% coverage** (2026-10-14)
Every code file has a colocated test file; Vitest enforces 80% coverage; exceptions are listed with reasons in `docs/engineering.md`. Business logic is pure TypeScript so it can be tested without Convex or React. Tools: Vitest, convex-test, React Testing Library. Names explain code; no per-file header comments. Code quality takes priority over the internal deadlines.

**D11 · File structure: domain, backend and audience-based features** (2026-10-15)
Three layers with dependencies pointing inward: `src/domain` (pure rules), `convex/` (one folder per table, reads and writes in separate files), `src/features` (UI). Features are grouped by audience (`host`, `player`, `tv`, plus `shared`) and by feature inside each. Audience rather than device names, because the split is who uses it and for what, not screen size. Route files in `src/app` stay thin. Details and rules in `docs/engineering.md`.

**D12 · No Zod; Convex validators are the single source of shapes** (2026-10-15)
Convex needs its own validators for the schema and function arguments anyway; Zod would describe every question shape twice. The domain imports only the inferred types, so it stays free of Convex at runtime. Replaces the Zod part of D4.

**D13 · Quality gate on every commit** (2026-10-17)
A husky pre-commit hook runs `npm run lint`, `npm run typecheck` and `npm run test:coverage`, so the 80% threshold and the import rules are checked before code reaches GitHub. Boundary rules use typescript-eslint's `no-restricted-imports` (already part of Next.js's lint setup) instead of a separate plugin; revisit with `eslint-plugin-boundaries` if the rules need per-feature precision, for example once a feature gets sub-folders. Vitest 5 required `@types/node` 22, matching the local Node version.

**D14 · Question type is the main axis of extension** (2026-10-17)
About 11 types now, more in later years. Each type has the same set of parts: content validator (`convex/questions/`), answer validator, grader (`src/domain`), editor (host), answer input (player), TV display and review display. Within each layer, a type lives in its own folder (for example `src/domain/questionTypes/mapPin/`, `src/features/player/answering/mapPin/`), and each audience has a registry: a lookup from type to its part, typed as `Record<QuestionType, …>` so that adding a type fails to compile until every part exists. Adding a type means adding folders and registry entries, never editing shared code. Types stay split by audience (D11) rather than one folder per type across audiences, so rule 4 still holds. When per-type sub-folders arrive, the ESLint boundary rules move to `eslint-plugin-boundaries` (see D13).

**D15 · The night is a screen sequence derived from the quiz** (2026-10-17)
Lobby, rules, then show / answer / reveal per question, leaderboards between rounds, the score graph on demand. A pure domain function derives the sequence from the quiz; the game stores only its position in it, the timer (end time, or remaining time while paused) and media playback. The TV, phones and admin all render from that one state.

**D16 · Answers are drafts until locked; grading has a review state** (2026-10-17)
Phones save drafts to the server while the team answers. Submitting locks the answer; when a timer ends, the server locks every remaining draft as it is. Each graded answer is correct, wrong or needs review; the hosts settle reviews and can override anything. Scores stay derived (D6).

**D17 · Product details settled from the wireframes and the user** (2026-10-17)
Swedish-only UI. One team = one phone, with no player count. No hints on questions ("Visa ledtråd" dropped). Free text with 1–3 fields replaces the separate multi-part type. Free text uses fuzzy matching, with uncertain answers going to review. Map pin questions score if the pin is within a radius of the target, and the radius is shown at reveal. På spåret guesses lock when the brake is pulled. Some activities are answered in the app (ingredients, drawing). The wireframes are conceptual, not the final design.

## Open questions

- [ ] Convex document store fine, or Postgres (Supabase) with a keep-alive? (Leaning Convex, see D2.)
- [ ] Large media such as the På spåret film: upload (1 GB free storage) or link to YouTube?
- [ ] AI assist: draft whole rounds from a theme, or only suggest single questions and wrong options?
- [ ] Map pin: which map and tiles (free source such as OpenStreetMap), and one map style for all questions?
- [ ] Fuzzy matching: how close counts as correct, and how close goes to review?

## Resolved questions

- [x] UI language → Swedish only (D17).
- [x] På spåret: change a guess after locking? → No, locked when the brake is pulled (D17). A wrong guess scores 0 (assumed, confirm when building).
- [x] Free-text grading → fuzzy matching plus host review (D17).
- [x] Activities in the app → yes for ingredients and drawing; others scored by hand (D17).
