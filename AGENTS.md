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
- **Out of scope until the user asks:** keyboard shortcuts and pausing the whole quiz (D38), rejoining from another phone (D34), a frozen copy of the quiz per game (D34).
- **Live game shape:** the game stores only the screen showing now, its place and the question timer; the sequence is rebuilt from the quiz on every read (D35). `getRunningGame` is public (TV and phones), so anything that reveals what comes next, answer keys or host notes goes through a host-only query such as `getNextScreen` (D36, D38). TV screens live in `features/shared/tvScreens/` because the live control draws them too.
- **Cloud sessions (claude.ai/code):** the container starts without `node_modules`, so run `npm ci` first. There is no `.env.local` or Convex login, and the network policy blocks the Convex hosts (`api.convex.dev`, `*.convex.cloud`), so `npx convex dev` and `npx convex codegen` fail and the app can't be tried in a browser with data. When a file in `convex/` is added, renamed or removed, update its module list in `convex/_generated/api.d.ts` by hand, in the same sorted shape; say in the PR that the change wasn't tried in a browser.
- **Slow container:** with four cores, a full `npm run test:coverage` can time out `src/features/shared/map/loadBorderShapes.test.ts`, which loads large border files; `main` does the same. It passes alone; rerun before suspecting your change.
