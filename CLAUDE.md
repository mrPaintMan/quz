@AGENTS.md

# Quz

Live web app for the yearly Christmas quiz (Julquiz): a shared TV screen, one phone per team and a host admin view, all synced live. About 20 players in about 6 teams, one evening in early December.

## Read first

- `docs/product.md`: what the app does, the question types and the constraints.
- `docs/decisions.md`: decisions already made and why, plus open questions. Don't reopen a decision without saying so.
- `docs/plan.md`: milestones, what is done and what is next. Start each session here.
- `docs/deploy.md`: how production (Convex + Vercel) is set up.
- `docs/engineering.md`: code standards (clean code, colocated tests, 80% coverage, exceptions). Read before writing code; they take priority over deadlines.

## How we work

- The user steers through conversation and mostly does not read the code. Explain changes as behaviour and trade-offs, not diffs.
- Plan first: for each new instruction, propose an approach (what changes, which parts of the app, trade-offs, how you will verify it) and wait for a go or no-go before editing. Inside an approved plan, carry on without asking about each detail; come back if the plan has to change. Reading and investigating need no approval.
- Briefly explain Convex and non-obvious TypeScript when they come up; the user is new to Convex.
- Verify your own work: run the checks below, and check UI changes in the browser pane (the TV, phone and admin views).
- Ask the user about product choices. Decide implementation details yourself and record notable ones in `docs/decisions.md`.
- Before every push, run the code-review skill once on the commits about to be pushed (`origin/main..HEAD`). Fix real bugs in existing code and cheap fixes; skip findings about future code or pure style (YAGNI) with a reason; ask the user about product decisions. Fixes are verified by the checks, not reviewed again, unless a fix grows bigger than the original change.
- At the end of a work chunk, update `docs/plan.md` (tick items, set "Next up") and add any new decision to `docs/decisions.md`.

## Stack

Next.js (App Router) + TypeScript, Convex (database, real-time, file storage), Tailwind CSS. Hosted on Vercel Hobby; free tiers only, except a custom domain.

## Commands

- `npx convex dev`: runs the Convex dev deployment and regenerates `convex/_generated`. Keep it running while developing.
- `npm run dev`: Next.js dev server on http://localhost:3000.
- `npm run lint`, `npm run typecheck`, `npm run test:coverage`: run by the pre-commit hook; all must pass.
- `npm run test:watch`: tests in watch mode while developing.
- `npm run build`: also run before calling something done.

## Conventions

- Convex functions and schema live in `convex/`. Scores are computed from `answers` and `adjustments`, never stored twice.
- Question shapes are Convex validators in `convex/questions/content.ts`, the single source of truth; `src/domain` imports only their types.
- File structure and dependency rules: see `docs/engineering.md`.
- Host-only Convex functions check the host passphrase (env var).

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
