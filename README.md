# todo-web

A small React (Vite) to-do app for the deployment course. It talks to the [`todo-api`](../todo-api) Flask service.

Every request uses a relative address such as `fetch('/api/todos')`, never `http://localhost:8000/...`. In development Vite forwards `/api` to your API; in production nginx does, so the browser only ever talks to one address and CORS never comes up.

## Run it locally

Start `todo-api` first (it listens on port 8000), then:

```bash
npm ci
npm run dev
```

Open the address Vite prints. To use the API on the course server instead of your own laptop, tell the dev proxy where it is (replace `808X`):

```bash
API_TARGET=http://43.173.8.197:808X npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload and the `/api` proxy |
| `npm test` | Runs the tests once (Vitest and Testing Library) |
| `npm run lint` | Static checks (oxlint) |
| `npm run build` | Builds the static site into `dist/` |

The tests replace `fetch` with a fake, so they need no API and no network. That is what makes them suitable as a CI gate.

## Deploy by hand (session 3A)

```bash
git clone https://github.com/YOUR-USER/todo-web.git ~/web-app
cd ~/web-app
npm ci
npm run build
rsync -a --delete dist/ /var/www/app/
```

Then open `http://43.173.8.197:808X/`. The page loads from nginx, and its `/api/` calls go through nginx to Flask.

## Deploy with GitHub Actions

Use the `frontend.yml` workflow from the guide as it is. It runs `npm ci`, `npm run lint`, `npm test` and `npm run build`, uploads `dist/` with `rsync`, and checks that the page contains `id="root"`.
