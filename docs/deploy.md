# Deploying to production

Not done yet: these steps need your Convex and Vercel logins. Do them once, then both hosts can write the real quiz at the production URL. The quiz is written in production from day one (see `docs/plan.md`).

## 1. Convex production deployment

1. Open the Convex dashboard, project **quz**, and switch to the **Production** deployment (it exists already, unused).
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

## Later (M5)

- Custom domain (for example quz.se): **Vercel → Project → Settings → Domains**. This is the one accepted cost.
