# mrama-admin-server

Backend for `/admin` login on the Mrama Institute site. Express + TypeScript,
one `users` table in Postgres, JWT sessions. No public signup — accounts are
created locally with a script.

## 1. Create the Supabase project

1. https://supabase.com → New project.
2. Project Settings → Database → Connection string → copy the "URI" (this is
   `DATABASE_URL`, includes your database password).
3. SQL Editor → paste the contents of `migrations/001_create_users.sql` → run.
   This creates the `users` table (and enables `pgcrypto` for UUID
   generation, which Supabase usually already has).

## 2. Local setup

```bash
cd server
npm install
cp .env.example .env
# fill in DATABASE_URL and JWT_SECRET (generate with: openssl rand -hex 32)
```

Create your first account:

```bash
npm run create-user
```

Run the server:

```bash
npm run dev
```

## 3. Deploy to Render

1. https://render.com → New → Web Service → connect this GitHub repo.
2. **Root Directory**: `server`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. Environment → add `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS` (comma-
   separated list of frontend origins allowed to call this API, e.g.
   `https://easonyang001.github.io`).
6. Deploy. Render gives you a URL like `https://mrama-admin-server.onrender.com`
   — this is `VITE_API_BASE_URL` for the frontend (set as a GitHub Actions
   repo secret, see the root README).

To add another admin later, run `npm run create-user` locally again (pointed
at the production `DATABASE_URL` via `.env`) — no redeploy needed.

## Endpoints

- `POST /api/login` — `{ username, password }` → `{ token }` (401 on bad
  credentials, rate-limited to 5 attempts / 15 min per IP)
- `GET /api/verify` — `Authorization: Bearer <token>` → 200 or 401
- `GET /health` — liveness check
