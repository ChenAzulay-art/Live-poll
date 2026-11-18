# Live Poll

Crowd votes for the next artist. The DJ watches it live.

Guests join with a night code and pick from a short lineup. The DJ draws artists from a list, opens a 90-second poll, and sees votes update on the booth. When time is up, the winner is locked in.

Live site: [live-poll-kohl.vercel.app](https://live-poll-kohl.vercel.app)

## How a night works

1. The DJ adds artists, then draws a poll and opens it.
2. Guests open `/vote/NIGHT` or scan the QR on the booth.
3. Everyone has 90 seconds to vote. One vote per device.
4. The timer ends, the poll closes, and the winner is shown on both screens.

Local demo night code is `NIGHT`. DJ PIN defaults to `1234`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is taken, Next will pick another, or you can pass one:

```bash
npm run dev -- --port 3001
```

The first run creates a local SQLite file (`local.db`) and seeds the demo night.

On a phone on the same Wi-Fi, use the laptop's LAN address from the DJ QR, not `localhost`.

## Environment

None of these are required for local demo. Set them for production.

| Variable             | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `DJ_PIN`             | Booth login PIN. Defaults to `1234`.                       |
| `SESSION_SECRET`     | Signs the DJ session cookie.                               |
| `TURSO_DATABASE_URL` | Remote LibSQL / Turso database. `DATABASE_URL` also works. |
| `TURSO_AUTH_TOKEN`   | Turso auth token. Required with a remote database.         |

Hosted deploys (Vercel) need `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, then a redeploy.

## Scripts

```bash
npm run check   # types, lint, format, tests
npm test
npm run build
```

## Stack

Next.js App Router, Drizzle + LibSQL (SQLite locally, Turso in production), and a black / acid-lime poster UI.
