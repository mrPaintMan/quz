# Plan

Two deadlines:

- **2026-10-21 · Authoring live:** both hosts can write the real quiz in the admin view, online, from their own devices, in the production database.
- **Late November · Game ready:** dry run with a few friends on real phones. The Julquiz itself is in early December.

The quiz is written in production from day one, so nothing has to be moved from the development database later.

The dates are internal targets. Code quality (`docs/engineering.md`) wins if they conflict; the hard goal is hosting the quiz in early December.

## Next up

M1 Convex schema for quizzes, rounds and questions, with question content validators for the first three types.

## Milestones

### M0 · Setup
- [x] Next.js + TypeScript + Tailwind scaffold
- [x] Convex installed, Convex provider wired into the root layout
- [x] Context docs: `CLAUDE.md`, `docs/`
- [x] Convex dev deployment created and linked (`.env.local`)

### M1 · Authoring live (due 2026-10-21)
- [x] Engineering standards (`docs/engineering.md`)
- [x] File structure agreed (D11)
- [x] Vitest, convex-test and React Testing Library set up, 80% threshold enforced
- [x] ESLint import rules for the dependency direction
- [x] Pre-commit hook: lint, typecheck, tests with coverage
- [x] CI on GitHub Actions: lint, typecheck, tests with coverage, build
- [ ] Convex schema: quizzes, rounds, questions
- [ ] Question content validators for the first types: multiple choice, free text, numeric (tolerance tiers)
- [ ] Host passphrase gate
- [ ] shadcn/ui set up
- [ ] Admin: create a quiz, add and reorder rounds and questions, attach images
- [ ] Production Convex deployment and Vercel project, passphrase set as env var
- [ ] Both hosts can log in and save from their own devices

### M2 · More question types (in parallel with authoring)
- [ ] Numeric closest wins, multi-part, matching
- [ ] Audio and video links
- [ ] På spåret question with clues
- [ ] Activity rounds (manual points)
- [ ] Copy a past quiz

### M3 · Live game loop
- [ ] Convex schema: games, teams, answers, adjustments
- [ ] Start a game from a quiz, show join QR code on the TV
- [ ] Team phone: join with a team name, rejoin after refresh
- [ ] Host drives Show → Answer → Lock → Grade → Reveal
- [ ] TV view follows the game state

### M4 · Grading and scores
- [ ] Auto-grading for each question type
- [ ] Host review and override
- [ ] Manual points for activities
- [ ] Live leaderboard on the TV, own score on phones
- [ ] På spåret clue levels during the game
- [ ] Countdown timer

### M5 · Polish and launch (late November)
- [ ] Christmas theme, TV-sized layout
- [ ] Custom domain
- [ ] Dry run with a few friends on real phones

## Log

- 2026-10-14: Project scaffolded; Convex dev deployment linked; context docs created. Plan reordered so authoring goes live first, due 2026-10-21.
- 2026-10-15: Engineering standards and file structure agreed (D10–D12); Zod dropped.
- 2026-10-17: Test tooling, import rules, pre-commit hook and CI in place (D13).
