# Plan

Two deadlines:

- **2026-10-28 · Authoring live:** both hosts can write the real quiz, with every question type, in the admin view, online, from their own devices, in the production database. (Moved from 2026-10-21 when the wireframes added more question types.)
- **Late November · Game ready:** dry run with a few friends on real phones. The Julquiz itself is in early December.

The quiz is written in production from day one, so nothing has to be moved from the development database later.

The dates are internal targets. Code quality (`docs/engineering.md`) wins if they conflict; the hard goal is hosting the quiz in early December.

## Next up

M1: propose the Convex schema and the content shape of every question type, for the user's review before any code.

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
- [ ] Convex schema: quizzes, rounds (question, activity, På spåret), questions
- [ ] Content validators for every question type, with the type registry (D14)
- [ ] Host passphrase gate
- [ ] shadcn/ui set up, Swedish UI texts
- [ ] Quiz list; create and copy a quiz
- [ ] Editor: rounds (add, reorder by drag), questions (add, reorder, delete), autosave
- [ ] Editor per question type
- [ ] Media: upload images, audio and video clips to Convex storage
- [ ] Production Convex deployment and Vercel project, passphrase set as env var
- [ ] Both hosts can log in and save from their own devices

### M2 · Live game loop
- [ ] Convex schema: games, teams, answers (drafts and locks), adjustments
- [ ] Screen sequence derived from the quiz (D15)
- [ ] TV: lobby with QR code and join word, rules screen, question and answer screens
- [ ] Phone: join with a team name and colour, rejoin after refresh, follow the game
- [ ] Admin: live control (now / next on the TV, next and previous, keyboard), timer with pause and +15 s, media playback, pause quiz
- [ ] Draft saving and locking, including on timer end (D16)

### M3 · Answering and grading, all types
- [ ] Answer input, TV display and grader for each question type
- [ ] Fuzzy text matching and the review queue
- [ ] Host overrides and manual points
- [ ] Leaderboard on the TV and admin, own score on phones

### M4 · Highlights
- [ ] På spåret: clue reveal and emergency brake
- [ ] Map pin with radius shown at reveal
- [ ] Drawing answers shown on the TV
- [ ] Score history and score graph on the TV

### M5 · Polish and launch (late November)
- [ ] Final visual design and Christmas theme, TV-sized layout
- [ ] Custom domain
- [ ] Dry run with a few friends on real phones

## Log

- 2026-10-14: Project scaffolded; Convex dev deployment linked; context docs created. Plan reordered so authoring goes live first, due 2026-10-21.
- 2026-10-15: Engineering standards and file structure agreed (D10–D12); Zod dropped.
- 2026-10-17: Test tooling, import rules, pre-commit hook and CI in place (D13).
- 2026-10-17: Wireframes reviewed: product doc rewritten, D14–D17 added, "Authoring live" moved to 2026-10-28.
