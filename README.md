# HyperStore

A marketplace for renting sea toys and equipment in the 1–10 m range — foils, jetskis, sea
scooters, catamarans, small boats and extreme sports gear. Launching in Turkey; the UI is in
English.

## What this first milestone covers

- **Accounts with two roles.** Sign up as a **renter** (browse and rent) or an **owner** (list your
  equipment). The role is picked at signup and stored on the user's profile.
- **Creating a listing.** Owners publish an item with a title, category, description, photos, size
  in metres, location and hourly price in Turkish lira.
- **Browsing the feed.** Anyone can browse every published listing and filter by category,
  location and price range, plus sort by newest or price.
- **Listing detail page.** Photo gallery and the full spec for a single item.

Deliberately **not** built yet (later sessions): payments, booking and reservations, messaging, map
view, long-term rental or sale flow, tender/approval process, second-hand sales, experience centre.

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase Postgres, guarded by Row Level Security |
| Auth | Supabase Auth (email + password) |
| Photos | Supabase Storage, uploaded straight from the browser |

## Getting it running

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com/dashboard), create a project, and pick a region close to
Turkey (`eu-central-1` works well).

### 2. Create the schema

Open **SQL Editor** in the Supabase dashboard, paste the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it. It is
idempotent, so re-running is safe.

That one script creates:

- the `profiles` table plus the trigger that fills it in when someone signs up,
- the `listings` table with its indexes and check constraints,
- Row Level Security policies — anyone can read published listings, only owner accounts can create
  them, and only the author can edit or delete their own,
- the public `listing-photos` storage bucket, where each user may only write inside a folder named
  after their user id.

### 3. Point the app at your project

```bash
cp .env.example .env.local
```

Fill in both values from **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon / publishable key>
```

The anon key is meant to be public — every table is protected by RLS.

### 4. Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

> **Tip for local testing:** by default Supabase emails a confirmation link before a new account can
> sign in. To skip that while developing, turn off **Confirm email** under
> *Authentication → Sign In / Providers → Email*.

## Deploying to Vercel

No terminal needed.

1. At [vercel.com/new](https://vercel.com/new), sign in with GitHub and import the
   `HyperStore` repository.
2. Leave the build settings alone — Vercel detects Next.js on its own.
3. Before the first deploy, expand **Environment Variables** and add the same two values that
   are in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   Both are `NEXT_PUBLIC_`, so they are baked in at build time — they must be set *before* the
   build, not after, or the deploy will come up unconfigured.
4. **Deploy.**

Two things worth setting once the first deploy is up:

- **Which branch is production.** Vercel treats the repository's default branch as production and
  every other branch as a preview deployment. If the work you want live is on a feature branch,
  either merge it into the default branch or change **Settings → Git → Production Branch**.
- **Supabase Site URL.** In the Supabase dashboard, under *Authentication → URL Configuration*,
  set **Site URL** to your Vercel domain. It is unused while email confirmation is off, but
  password-reset and confirmation links need it later.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |

## How it fits together

```
src/
  app/
    page.tsx                  landing page
    login/, signup/           auth screens
    auth/actions.ts           sign in / sign up / sign out server actions
    listings/
      page.tsx                the feed, filters live in the URL
      [id]/page.tsx           listing detail
      new/page.tsx            owner-only create form
      actions.ts              create + delete server actions (re-validated server side)
    dashboard/page.tsx        an owner's own listings
  components/                 header, cards, filters, forms, photo uploader/gallery
  lib/
    supabase/                 browser, server and middleware clients
    auth.ts                   current user + role helpers
    listings.ts               listing queries and filter parsing
    constants.ts              categories, locations, formatting
supabase/migrations/          the SQL schema
middleware.ts                 refreshes the Supabase session cookie on every request
```

A few decisions worth knowing:

- **Filters live in the query string** (`/listings?category=jetski&location=Bodrum&maxPrice=3000`),
  so the feed is server-rendered, shareable and works without JavaScript.
- **Photos upload from the browser** directly to Supabase Storage under `<user-id>/<uuid>.<ext>`;
  the form then submits those object paths. The server action re-checks that every path belongs to
  the signed-in user before saving the listing.
- **Authorisation is enforced in the database**, not just in the UI. The `is_owner()` check in the
  insert policy means a renter account cannot create a listing even by calling the API directly.
