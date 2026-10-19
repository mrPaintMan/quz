# Deploying to production

Not done yet: these steps need your Convex and Vercel logins. Do them once, then both hosts can write the real quiz at the production URL. The quiz is written in production from day one (see `docs/plan.md`).

## 1. Convex production deployment

1. The production deployment is `prod-eu` in **Europe (Ireland)**, the same region as dev. A deployment's region can't be changed later; a new one is created with `npx convex deployment create <name> --type prod --region eu --default` (only one default production deployment per project).
2. Set the host passphrase on production. Choose a different one from dev:

   ```bash
   npx convex env set HOST_PASSPHRASE "<production passphrase>" --prod
   ```

3. In the dashboard: **Settings → URL & Deploy Key → Generate Production Deploy Key**. Copy it for step 2.

## 2. Vercel project

1. On vercel.com: **Add New → Project**, import `mrPaintMan/quz`. Framework preset: Next.js (detected).
2. Environment variable: `CONVEX_DEPLOY_KEY` = the production deploy key from step 1.3 (Production environment only).
3. Override the **Build Command** so every deploy also deploys the Convex functions and passes the URL to Next.js:

   ```bash
   npx convex deploy --cmd 'npm run build'
   ```

   `convex deploy` sets `NEXT_PUBLIC_CONVEX_URL` for the build it runs.
4. Deploy. Vercel builds `main`; the `m1` branch gets a preview deployment, which uses the same production Convex deployment unless you add a separate preview deploy key.

## 3. Check

1. Open `https://<project>.vercel.app/admin`, log in with the production passphrase.
2. Create the real quiz (for example "Julquiz 2026"), add a round and a question, reload: it should still be there.
3. Log in from your fiancé's device too.

## 4. One-off data migrations

Run after the change that needs them reaches each deployment, then delete the function in a later PR.

Run one with `npx convex run --prod <module>:<function> '<args>'`, or without `--prod` for the dev deployment. A paginated one takes `{"paginationOpts":{"numItems":100,"cursor":null}}` and is run again with each answer's `continueCursor` until it answers `isDone: true`.

Pending: `questions/migratePaSparetClues:migratePaSparetClues` (D30), which turns På spåret clues into five plain texts. Done on dev on 2026-10-19 (1 trip); run on production once this change is deployed, then narrow the clue schema and delete the migration in a later PR.

Done: `migrateMissingNumbers` (D28) on 2026-10-18, on dev and production; it found no `NaN` to fix and was then deleted.

## 5. Domain

`quz.nu` is bought at Loopia, with its nameservers pointing at Cloudflare. In Cloudflare, the records Vercel shows under **Project → Settings → Domains** are set to **DNS only** (grey cloud): proxying through Cloudflare breaks Vercel's certificate. `www.quz.nu` redirects to `quz.nu`, the primary domain.

Don't use the Vercel Marketplace's Convex integration: it creates a separate Convex team instead of using this project.
