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

None pending.

Done: `migratePaSparetClues` (D30) on 2026-10-19, on dev and production; it turned one trip on each into five plain-text clues, and the clue schema was then narrowed and the migration deleted. `migrateMissingNumbers` (D28) on 2026-10-18, on dev and production; it found no `NaN` to fix and was then deleted.

## 5. Domain

`quz.nu` is bought at Loopia, with its nameservers pointing at Cloudflare. In Cloudflare, the records Vercel shows under **Project → Settings → Domains** are set to **DNS only** (grey cloud): proxying through Cloudflare breaks Vercel's certificate. `www.quz.nu` redirects to `quz.nu`, the primary domain.

Don't use the Vercel Marketplace's Convex integration: it creates a separate Convex team instead of using this project.

## 6. Film storage in Cloudflare R2

Films (videos) are stored in Cloudflare R2, where downloads are free, through the `@convex-dev/r2` component (D32). Images, audio and the films' stills stay in Convex storage. Dev and production each get their own bucket and token.

1. In the Cloudflare dashboard (the same account as the `quz.nu` DNS), open **R2 Object Storage** and switch it on. Cloudflare may ask for a card even on the free plan (10 GB storage, free downloads).
2. **Create bucket** twice: `quz-films-dev` and `quz-films-prod`, Standard storage, with **EU jurisdiction** so the films stay in the EU (the dev bucket was made this way).
3. In each bucket: **Settings → CORS policy → Add**, and paste (the dev bucket only needs the localhost line, the production bucket only the quz.nu lines):
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://quz.nu", "https://www.quz.nu"],
       "AllowedMethods": ["GET", "PUT"],
       "AllowedHeaders": ["Content-Type"]
     }
   ]
   ```
4. On the R2 overview page: **Manage R2 API Tokens → Create API Token**, permission **Object Read & Write**, limited to one bucket. Make one token for each bucket. Cloudflare shows four values once: Token value, Access Key ID, Secret Access Key and an endpoint. For an EU-jurisdiction bucket the endpoint must contain `.eu.` (`https://<account id>.eu.r2.cloudflarestorage.com`); the address without it answers "CORS not configured for this bucket" and every upload fails.
5. Give each Convex deployment its bucket's values; run these yourself so the keys never pass through anyone else. Without `--prod` they go to dev:
   ```sh
   npx convex env set R2_BUCKET quz-films-dev
   npx convex env set R2_ENDPOINT https://<account id>.eu.r2.cloudflarestorage.com
   npx convex env set R2_ACCESS_KEY_ID <access key id>
   npx convex env set R2_SECRET_ACCESS_KEY <secret access key>
   npx convex env set R2_TOKEN <token value>
   ```
   and the same with `--prod` and `quz-films-prod`.
6. Check: upload a film in the editor, then press "Spela upp". The file shows up in the bucket's **Objects** list.

The buckets stay private: the app plays films through signed links that expire after a few hours.
