# Plan

Two deadlines:

- **2026-10-28 · Authoring live:** both hosts can write the real quiz, with every question type, in the admin view, online, from their own devices, in the production database. (Moved from 2026-10-21 when the wireframes added more question types.)
- **Late November · Game ready:** dry run with a few friends on real phones. The Julquiz itself is in early December.

The quiz is written in production from day one, so nothing has to be moved from the development database later.

The dates are internal targets. Code quality (`docs/engineering.md`) wins if they conflict; the hard goal is hosting the quiz in early December.

## Next up

Merge the `remove-dead-code` and `review-fixes` PRs, then run `migrateMissingNumbers` on production (`docs/deploy.md`) and delete it in a follow-up PR. Both hosts try writing in production; then M2 (the live game loop) starts with a proposal for the games, teams and answers schema.

## Milestones

### M0 · Setup
- [x] Next.js + TypeScript + Tailwind scaffold
- [x] Convex installed, Convex provider wired into the root layout
- [x] Context docs: `CLAUDE.md`, `docs/`
- [x] Convex dev deployment created and linked (`.env.local`)
- [x] Engineering standards and file structure (D10–D12)
- [x] Vitest, convex-test, React Testing Library, 80% threshold enforced
- [x] ESLint import rules, pre-commit hook, CI on GitHub Actions (D13)

### M1 · Authoring live (due 2026-10-28)
- [x] Convex schema: quizzes, rounds (question round, På spåret), questions (D18)
- [x] Content validators for every question type, with the type registry (D14)
- [x] Domain rules per type: max points and problems, `findQuestionProblems` (D20)
- [x] Convex queries and mutations: quizzes, rounds, questions (create, update, reorder, delete, copy), media upload (D22)
- [x] Host passphrase gate, backend (D21)
- [x] Login screen for the passphrase
- [x] shadcn/ui set up, Swedish UI texts, wireframe theme (D24)
- [x] Quiz list; create, copy and delete a quiz
- [x] Editor: rounds (add, rename, reorder, delete), questions (add, reorder, delete), autosave (D25)
- [x] Editor per question type (all 11)
- [x] Media: upload images, audio and video clips to Convex storage
- [x] Production Convex deployment (Ireland) and Vercel project, live at quz.nu
- [ ] Both hosts can log in and save from their own devices (to confirm)

### Follow-ups from M1
- [x] Drag and drop for reordering, beside the arrows (D26)
- [x] Map for placing the map pin answer and the phone's starting view, with the radius drawn (D27)
- [x] Moving a question to another round from the editor
- [x] Show a message when creating, copying, deleting or moving fails (`ActionErrorProvider`)
- [x] Fixes from the codebase review: one hook for half-typed field text, autosave reports its own failures, shared authoring parts in `authoring/shared/`, one type per shape, docs brought up to date
- [x] Empty number fields saved as `null` instead of `NaN` (D28)
- [ ] Run `migrateMissingNumbers` on dev and production, then delete it
- [x] Send the host back to the login screen, instead of a blank page, if the passphrase changes on the server while logged in (`SessionErrorBoundary`)

### M2 · Live game loop
- [ ] Convex schema: games, teams, answers (drafts and locks), adjustments
- [ ] Screen sequence derived from the quiz (D15)
- [ ] TV: lobby with QR code and join word, rules screen, question and answer screens
- [ ] Phone: join with a team name and colour, rejoin after refresh, follow the game
- [ ] Admin: live control (now / next on the TV, next and previous, keyboard), timer with pause and +15 s, media playback, pause quiz
- [ ] Draft saving and locking, including on timer end (D16)

### M3 · Answering and grading, all types
- [ ] Answer input, TV display and grader for each question type
- [ ] Fuzzy text matching and the review queue, per unique answer (D19). Use one shared answer normalizer for grading and for the editor's duplicate checks (`hasDuplicates`), so they can't disagree
- [ ] AI judge for list questions, suggestions confirmed by hosts (D19)
- [ ] Host overrides and manual points
- [ ] Leaderboard on the TV and admin, own score on phones

### M4 · Highlights
- [ ] På spåret: clue reveal and emergency brake
- [ ] Map pin answer input and reveal with radius, reusing `BorderMap` (D27)
- [ ] Drawing answers shown on the TV
- [ ] Score history and score graph on the TV

### M5 · Polish and launch (late November)
- [ ] Final visual design and Christmas theme, TV-sized layout
- [x] Custom domain (quz.nu)
- [ ] Dry run with a few friends on real phones

## Log

- 2026-10-14: Project scaffolded; Convex dev deployment linked; context docs created. Plan reordered so authoring goes live first, due 2026-10-21.
- 2026-10-15: Engineering standards and file structure agreed (D10–D12); Zod dropped.
- 2026-10-17: Test tooling, import rules, pre-commit hook and CI in place (D13).
- 2026-10-17: Wireframes reviewed: product doc rewritten, D14–D17 added, "Authoring live" moved to 2026-10-28.
- 2026-10-17: Schema, content validators for all 11 types and domain rules (max points, problems) with tests; D18–D20.
- 2026-10-17: Fixes from the first code review: NaN-safe checks, duplicate and tier-order warnings, map zoom check, alias imports in the domain (verified to bundle in Convex).
- 2026-10-17: Second review fixes (match allows a shared right side, placing order, margin message, duplicate options); review workflow set to one round per push.
- 2026-10-17: Editor backend: passphrase wrapper, quiz/round/question/media functions with tests (D21, D22).
- 2026-10-17: Admin UI on branch `m1`: login, quiz list, three-column editor with all 11 question type editors, autosave and media upload (D23–D25). Production deploy steps written in `docs/deploy.md`.
- 2026-10-17: Error messages for failed host actions, a session error boundary, and moving a question to another round (M1 follow-ups).
- 2026-10-17: Production live at quz.nu (Convex prod in Ireland). Copy pass on the authoring flow: omgång, deltagarna, alternativ (`docs/copy.md`); one branch and PR per topic.
- 2026-10-18: M1 polish: drag and drop for rounds, questions and Sortera items, disabled arrows at list ends, dropdown chevron inset (D26).
- 2026-10-18: Map pin authoring on a borders-only map with a fixed pin, the radius drawn to scale, and a phone-sized map for the starting view (D27).
- 2026-10-18: Codebase review for tech debt, clean-code smells and dead code. Removed unused files (Next.js starter icons, `src/lib/utils.ts`, the unused shadcn card, Convex's starter README), the login form's unused notice, the unused sidebar colour tokens, and two needless type exports.
- 2026-10-18: Review fixes: `useDraftText` for number, lines and answer-key fields, `useAutosave` with save failure, sortable rows and autosave moved to `authoring/shared/`, single types for rounds with questions, media kind and map views, docs updated; empty numbers are `null` everywhere, with a one-off migration (D28).
