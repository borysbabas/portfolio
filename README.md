# borysbabas.dev

The source of [borysbabas.dev](https://borysbabas.dev): a one-page portfolio built with **Nuxt 4**, **Vue 3** and
**Tailwind CSS 4**, deployed on Vercel.

## What's on it

- **Selected work**, loaded from my public GitHub repositories. Each card uses the repo's description and topics,
  and the first image in its README as the thumbnail. See [docs/GITHUB_TOKEN_SETUP.md](docs/GITHUB_TOKEN_SETUP.md).
- About, interests, experience and education, and contact.
- Privacy and terms pages.
- **Stash**, a private page at `/stash` (double-click the `.dev` in the footer). Paste a link and Claude reads it into a
  card: a recipe, a product, an article. Cards a week old get a reminder email, weekly, until switched off.

## Setup

```bash
npm install
cp .env.example .env   # optional: add a GITHUB_TOKEN to raise the GitHub rate limit
npm run dev            # http://localhost:3000
```

## Production

```bash
npm run build
npm run preview
```

The home page is cached for an hour on Vercel (`isr` in `nuxt.config.ts`), so the project list refreshes at most
hourly.

## Stash

- Settings are environment variables; see the Stash section of `.env.example`.
- Cards live in Supabase, in the tables from `supabase/stash.sql`.
- `vercel.json` runs `/api/stash/reminders` daily at 08:00 UTC; it emails one digest through Resend.
- Five wrong passwords in 15 minutes lock sign-in for 15 minutes, and email you when it happens.

## Structure

```
pages/index.vue                 the one-page home
pages/privacy.vue, terms.vue    legal pages, on layouts/default.vue
components/                     SiteNav, SiteFooter, SiteCursor, shared by every page
assets/css/site.css             the design: tokens, layout and motion
assets/css/main.css             Tailwind, mapped onto the design's tokens
server/api/github/repos.get.ts  the cached GitHub project list
pages/stash/, server/api/stash/ the private stash
```
