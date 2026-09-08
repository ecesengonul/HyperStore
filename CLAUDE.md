# Working on HyperStore

## Delivering work

**Open a pull request for every piece of work, as soon as it is done.** Do not stop at pushing
the branch — a pushed branch with no PR is invisible on GitHub and easy to lose track of. The
repository owner merges each PR themselves when they are ready; do not merge without being asked.

## What this is

A marketplace for renting sea toys and equipment in the 1–10 m range (foils, jetskis, sea
scooters, catamarans, small boats, extreme sports gear). Launching in Turkey, English UI.

Built so far: accounts with a renter/owner role, listing creation by owners, a filterable browse
feed, and a listing detail page. Deliberately **not** built yet — payments, booking and
reservations, messaging, map view, long-term rental or sale flow, tender/approval process,
second-hand sales, the experience centre. Do not add these speculatively.

## Stack and conventions

- Next.js 15 App Router + React 19 + TypeScript, Tailwind CSS v4.
- Supabase for database, auth and photo storage. `@supabase/ssr` clients live in
  `src/lib/supabase/` — browser, server and middleware variants; use the right one.
- **Authorisation belongs in the database.** Row Level Security in
  `supabase/migrations/0001_init.sql` is what actually enforces the rules; UI checks are a
  convenience on top. When adding a table, add its policies in the same migration.
- Feed filters live in the query string, so `/listings` stays server-rendered and shareable.
  Keep new filters in the URL rather than in client state.
- Prices are Turkish lira, formatted through `formatPrice` in `src/lib/constants.ts`.

## Before opening a PR

Run all four, and say in the PR what you actually ran:

```
npm run typecheck
npm run lint
npm run build
npm audit          # must report zero vulnerabilities
```

`package.json` carries an `overrides` block pinning `postcss` and `sharp` past advisories in
Next's own nested dependencies. Keep `npm audit` clean rather than removing the pins.

Local runs need `.env.local` (see `.env.example`). It is git-ignored — never commit real keys.
