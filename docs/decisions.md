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
No LLM API is free, so it is outside the free-tier baseline. (Partly replaced by D19: an AI judge for list grading is accepted as a small paid cost.)

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

**D18 · Activities are a question type; rounds are question rounds or På spåret** (2026-10-17)
An activity is a question (`activity`, with a max score; the prompt describes it) placed in a round like any other, usually last. Rounds have two kinds: `questions` and `paSparet`. Ingredients and drawing stay their own types: activities answered in the app.

**D19 · Layered grading with review per unique answer and an optional AI judge** (2026-10-17)
Open lists ("all capitals") can't have a complete answer key. Grading therefore runs in layers: optional answer key (bulk paste, may be empty) → fuzzy matching → hosts judge each unique unknown item once for all teams, and the decision is added to the answer key → optional AI judge that pre-fills suggestions the hosts confirm. The domain grader stays pure and only returns correct / wrong / needs review; the AI judge is a separate Convex action that works on "needs review" items only, so a failed call changes nothing. Per-unique-answer review also applies to free text. Cost is a few cents to a few SEK per year; this needs an Anthropic API key as a Convex env var. The model is chosen when the judge is built (M3).

**D20 · Question schema is permissive; completeness is a domain check** (2026-10-17)
Autosave stores half-written questions, so the Convex validators check shapes only. `findQuestionProblems` in `src/domain/questions/` lists what is missing (in Swedish), using each type's `findProblems` through the registry; the editor shows these and "Starta quiz" refuses to start while any remain. Max points are computed per type (`maxQuestionPoints`), not stored; `null` means no fixed maximum (open lists).

**D21 · Host passphrase via `process.env` and a `convex-helpers` wrapper** (2026-10-17)
`HOST_PASSPHRASE` is a Convex env var read with `process.env`, not declared with `defineApp({ env })`: that API is marked beta and unstable in Convex 1.46. `hostQuery` / `hostMutation` (built with `customQuery` / `customMutation` from `convex-helpers`) add a `hostPassphrase` argument to every host function and check it before the handler runs. The admin view keeps the passphrase in localStorage until the host logs out. An unset or empty `HOST_PASSPHRASE` refuses everything.

**D22 · Editor backend behaviour** (2026-10-17)
A new quiz starts empty. New questions start from their type's `createEmptyContent`. Fields with no honest default (`correctIndex`, the number `answer`, the map `target`) are `null` until filled in. Changing a question's type replaces its content with an empty draft (the UI confirms first). Updates patch only the given fields, so the two hosts don't overwrite each other's work on different fields. Ordering uses plain positions rewritten on move or delete. Bounded reads: 50 quizzes, 50 rounds per quiz, 100 questions per round. A På spåret round holds only På spåret questions. Copied quizzes share media files; files are never deleted in M1.

**D23 · Import boundaries per audience; features may use sub-folders** (2026-10-17)
Features now need sub-folders (11 type editors), which the old rule (no `../`, no importing another feature by alias) made impossible. ESLint now blocks imports between audiences (`host`, `player`, `tv`) and allows a feature's own audience, so a feature can import its own sub-folders by alias, and `<audience>/shared/` holds what several features of one audience use. Separation between features inside one audience is checked in review. `eslint-plugin-boundaries` is still the upgrade path if that proves too loose (replaces the D13 note).

**D24 · Dark plum-and-gold theme, Swedish document, client-rendered admin** (2026-10-17)
shadcn/ui (Base UI preset) with the wireframes' palette as tokens in `globals.css`, dark only; `<html lang="sv">`. The admin area renders in the browser behind `HostGate`, so Next's automatic instant-navigation validation is set to `manual-warning` (it only reported dropped client segments). `npm run typecheck` runs `next typegen` first, so route types exist in CI and the pre-commit hook.

**D25 · Editor interaction choices for M1** (2026-10-17)
Reordering rounds, questions, items and pairs uses up/down buttons rather than drag and drop: accessible by keyboard, works on phones, and needs no extra library; drag can come later. Map pin targets are typed as coordinates with a link to check them in OpenStreetMap; a clickable map comes with the map question's phone view (M4). Question editors keep a local draft and autosave 600 ms after typing stops (and on leaving the question); the whole draft is saved, so two hosts on the same question get last-save-wins. Type pickers use native `<select>` for simplicity and testability.

**D26 · Drag and drop beside the arrows** (2026-10-18)
Reopens D25's "buttons rather than drag": rounds, a round's questions and Sortera items can now also be dragged by a grip handle, within their own list only (another round stays the "Flytta till omgång" picker). Library: `@dnd-kit` (core, sortable, utilities), which handles mouse, touch and keyboard dragging and lets us give screen readers Swedish texts. Only the handle starts a drag, so buttons and inputs in a row keep working. The arrows stay; at the ends they are disabled instead of hidden, so rows don't shift. `SortableList` shows the new order until the move settles, because a Convex mutation resolves only after the client has the updated query, so rows don't jump back; on failure they return to the server's order. Sortera items keep their position as id, since they are plain strings that may repeat. Dropdowns draw their own chevron, inset like the text.

**D27 · Map pin authored on a borders-only map, like the phone answers it** (2026-10-18)
Reopens D25's typed coordinates: the hosts now place the answer the way teams will, by moving a map under a fixed pin in its centre, and the pin's spot is saved as `target`. The scoring radius shows as a gold circle to real scale around the pin. A second map, the size of a phone (350 × 470), sets where the phone map starts (`initialView`), kept apart so the starting view never gives away the answer. The coordinate fields stay, because the map has no place names: paste coordinates from Google Maps and the map follows. Scoring stays one radius with one score (tiers and "closest team wins" were considered, not chosen). The map is `BorderMap` in `src/features/shared/map/`, ready for the phone and the TV reveal in M4. Library: Leaflet 1.9 (BSD), wrapped by hand rather than through `react-leaflet` (Hippocratic licence), loaded only in the browser; MapLibre GL was smoother but about five times bigger and untestable in jsdom. Data: Natural Earth 1:50m countries (public domain) from `world-atlas` (ISC), drawn as land, sea and borders with no tile server, API key or third-party request; about 750 kB, loaded with the first map. The data joins shapes across the 180° meridian, so longitudes are unwrapped before drawing. Zoom runs 1–10 (the borders get coarse past that), the same range the completeness check uses (`MAP_ZOOM`); only a move that changes the view and isn't our own counts as the user's, and after a page resize the map goes back to the last view (Leaflet keeps the centre only to the pixel, kilometres when zoomed out), and zooming alone places no answer; pinch and double-click zoom around the pin so zooming never moves the answer, and the scroll wheel scrolls the page instead of zooming. No schema change; there were no map questions in dev or production yet.

**D28 · An empty number field is `null`, never `NaN`** (2026-10-18)
Every number the hosts type (points, margins, radius, time limit, the answer) is `number | null` in the validators (`numberOrNull`), and an empty or invalid field saves as `null`. Before this, some fields started as `NaN` and others as `null`, so every rule and the coming graders had to check both; with one kind of "missing" the compiler points out each place that must handle it. A max score is `null` while its points are missing, shown as "– p". Half-typed map coordinates stay in the editor until both are filled in, instead of being saved with a `NaN`. Questions saved earlier are fixed once per deployment by `questions/migrateMissingNumbers` (`docs/deploy.md`), which is deleted afterwards. Follows the existing rule in `docs/engineering.md` ("not filled in yet → `null`") that the NaN fields had drifted from.

**D29 · Drag only, and two map detail levels by zoom** (2026-10-19)
Reopens D26's arrows: rounds, a round's questions and Sortera items now move only by their grip handle, which also works from the keyboard (Space, arrow keys, Space), so the arrows were taken out to give the Omgångar list room; a round's count ("5 frågor") sits under its title, which may wrap. Reopens D27's single 1:50m map: hosts found it too coarse once questions went into production. The map now draws Natural Earth at 1:50m for zoom 1–5 and 1:10m from zoom 6 (`borderDetailForZoom`), and zoom goes to 12 instead of 10. Each scale is its own chunk, about 230 and 920 kB compressed, fetched the first time a map needs it and then kept; the old borders stay until the new ones have loaded, so the coastline visibly sharpens at zoom 6. Three levels (adding 1:110m for zoom 1–4) were tried and dropped: the usual starting zoom 4 then opened on a coastline with Gotland missing. Natural Earth has no scale between 1:50m and 1:10m; one could be made by simplifying 1:10m at build time if phones struggle. Zoomed in, the 1:10m map is about 6× the points of 1:50m (some 60–100 MB on a phone), because Leaflet projects the whole world on each zoom; tiling the data would fix that and was left until a phone shows it is needed. Component tests drag by keyboard through `dragByKeyboard.setup.ts`, which gives jsdom's rows a height and waits a frame per key, since dnd-kit measures in an animation frame.

**D30 · På spåret is one trip with five fixed clues, paced through an uploaded film** (2026-10-19)
Reopens D18 and D22 (a På spåret round held any number of trips) and D5 (long videos as links). A På spåret round is exactly one trip: the trip is created together with the round, and the server refuses a second one, moving another question in, or deleting the trip on its own (the round is deleted instead). The trip stays a question, so the coming game loop treats it like any other answered and scored question; moving it onto the round document was considered and not chosen. A trip has exactly five clues worth 10, 8, 6, 4 and 2 points, fixed in `PA_SPARET_CLUE_POINTS` and no longer stored; each needs its text. The trip needs a film (`requiresVideo` in the type's rules), uploaded to Convex storage: a 2-minute film is about 75 MB at 1080p, 30 fps, 5 Mbit/s (the export advice shown in the editor), well inside 1 GB of storage, but each full download counts against the free plan's 1 GB of monthly egress, a hard cap. So the host's browser reads the film's length and a 640-wide JPEG still from the local file while uploading (`readVideoFacts`), both saved with the video media (`posterId`, `durationSeconds`, null if the browser can't read them); the editor shows the still and downloads the film only on "Spela upp". This applies to every video, not only trips. During play the clues are evenly paced: the film is split into five equal parts and clue n shows during part n (`activeClueIndex`); M2 keeps the film's play position on the server, so a team's brake locks at the right clue, and shows the admin which clue is active, with the time left to the next. YouTube (ads, needs internet, can't be preloaded, timing through its player) and Cloudflare R2 (free egress, but a second service with keys and CORS) were considered. Clues saved before this carried their own points; the schema accepted both shapes until a one-off migration had turned the one trip on dev and on production into five plain-text clues (2026-10-19), and was then narrowed to plain text.

## Open questions

- [ ] Convex document store fine, or Postgres (Supabase) with a keep-alive? (Leaning Convex, see D2.)
- [ ] AI assist: draft whole rounds from a theme, or only suggest single questions and wrong options?
- [ ] Fuzzy matching: how close counts as correct, and how close goes to review?
- [ ] AI judge model: Claude Haiku 5.5 (cheapest) or Claude Opus 5.5 (default)? Decide in M3.

## Resolved questions

- [x] Large media such as the På spåret film: upload or link to YouTube? → Uploaded to Convex, encoded to about 75 MB, shown in the editor by a still (D30).
- [x] Map pin: which map and tiles? → Leaflet with Natural Earth borders, one style for all questions, no tiles (D27).
- [x] UI language → Swedish only (D17).
- [x] På spåret: change a guess after locking? → No, locked when the brake is pulled (D17). A wrong guess scores 0 (assumed, confirm when building).
- [x] Free-text grading → fuzzy matching plus host review (D17).
- [x] Activities in the app → yes for ingredients and drawing; others scored by hand (D17, D18).
- [x] Grading open lists → layered grading, review per unique answer, optional AI judge with host confirmation (D19).
