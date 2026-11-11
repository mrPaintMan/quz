<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Notes for the next session

Kept outside the managed blocks above, which `next dev` and Convex rewrite.

- **Simplest first.** The user prefers the simplest option that does the job and drops features rather than adding complexity. When offering choices, lead with the simplest and say what it gives up.
- **Scale:** the user plans a much larger night next year; keep reads per keystroke and per screen small, bounded and indexed (D45). The 12-team cap (one colour per team, D34) is the known limit to lift then.
- **Out of scope until the user asks:** keyboard shortcuts and pausing the whole quiz (D38), rejoining from another phone (D34), a frozen copy of the quiz per game (D34).
- **Live game shape:** the game stores only the screen showing now, its place, the question timer, the clip's playback and the questions closed by Nästa (D41); scores are summed on every read from closed questions and adjustments, never stored (D43); the sequence is rebuilt from the quiz on every read (D35). `getRunningGame` is public (TV and phones), so anything that reveals what comes next, answer keys or host notes goes through a host-only query such as `getNextScreen` (D36, D38). TV screens live in `features/shared/tvScreens/` because the live control draws them too, silently (D39).
- **Answers (M3 builds on this):** phones save drafts with `saveAnswerDraft` and lock with `sendAnswer` (D41); drafts are a quiet fallback saved a second after the team pauses (D45), and anything counting answers reads only the locked range of `by_gameId_and_questionId_and_lockedAt`, so drafts never trigger it; the server alone decides whether a question is open. A new type's answering is three registry entries, each null until built (D42): `src/domain/answering/registry.ts` (show, reveal, imageIds, isComplete, outcomes (what each part of each answer counted as, whose points the scores sum, D58), plus its `ShownQuestion` / `RevealedAnswer` union members), `features/shared/questionDisplays/registry.ts` (TV) and `features/player/answering/registry.ts` (phone). Multiple choice is the worked example.
- **Cloud sessions (claude.ai/code):** the Quz online environment's setup script runs `npm ci` when a fresh container starts (added 2026-11-09); if `node_modules` is missing anyway, run `npm ci` first. There is no `.env.local` or Convex login, and the network policy blocks the Convex hosts (`api.convex.dev`, `*.convex.cloud`), so `npx convex dev` and `npx convex codegen` fail and the app can't be tried in a browser with data. When a file in `convex/` is added, renamed or removed, update its module list in `convex/_generated/api.d.ts` by hand, in the same sorted shape; say in the PR that the change wasn't tried in a browser.
- **Fast tests:** unit tests must be fast; the user won't have tests that can time out. Don't load real large files (such as the world atlas) in tests: give them tiny stand-ins (D57).
