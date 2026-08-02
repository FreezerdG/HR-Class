# Onboarding API

Tiny Express + Postgres API that stores onboarding page submissions
(company, new hire, manager, buddy) so they can be listed back on the
public HTML page.

## Deploy on Railway

1. **Push this folder to its own GitHub repo** (separate from your HTML
   repo — e.g. `onboarding-api`).
2. On [railway.app](https://railway.app), click **New Project → Deploy
   from GitHub repo**, and pick that repo.
3. In the same project, click **New → Database → Add PostgreSQL**.
   Railway automatically sets a `DATABASE_URL` variable on your API
   service — you don't need to copy/paste it yourself.
4. Open your API service → **Variables**, and add:
   - `ALLOWED_ORIGIN` = the URL of your GitHub Pages site, e.g.
     `https://yourname.github.io` (use `*` temporarily while testing,
     then lock it down).
5. Railway will build and deploy automatically. Once it's live, open
   **Settings → Networking → Generate Domain** to get a public URL,
   something like `https://onboarding-api-production.up.railway.app`.
6. Visit that URL in your browser — you should see
   `Onboarding API is running.`
7. Copy that URL into `API_BASE` near the top of the `<script>` tag in
   your `index.html`.

That's it — no separate SQL install, no manual table creation. The
API creates its own `submissions` table the first time it starts.

## API

- `GET /api/submissions` — returns the 50 most recent submissions as JSON.
- `POST /api/submissions` — body: `{ company_name, hire_name, manager_name, buddy_name }`. Saves a new row.

## Local testing (optional)

```bash
npm install
DATABASE_URL=postgres://... npm start
```
