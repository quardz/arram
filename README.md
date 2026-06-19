# Aram Valartha Naayaki Sevai Maiyam (ASM) — Website

A modern rebuild of [arram.org.in](https://arram.org.in) using **Next.js 16** (App Router, SSR), **React 19**, **TypeScript** and **Tailwind CSS v4**. Deployable to **Vercel** with zero configuration.

## Tech stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)      |
| Rendering      | Server Components (SSR) + static assets |
| Styling        | Tailwind CSS v4                         |
| Language       | TypeScript                              |
| Forms          | Server Actions (`useActionState`)       |
| Deployment     | Vercel                                  |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Project structure

```
src/
  app/
    layout.tsx            # Root layout (header, footer, fonts, metadata)
    page.tsx              # Home
    about/                # About Us
    hindu-kudumbam/       # Activity pages
    family-welfare-homam/
    kovil-konda-thamizhagam/
    kovil-maiyam/
    voice-of-dharma/
    csr/                  # CSR page + enquiry form
    volunteer/            # Volunteer page + registration form
    gallery/              # Photo gallery (reads /public/images/gallery)
    news/                 # News list + [slug] article pages
    contact/              # Contact page + form
    terms/  privacy/      # Legal placeholders
    actions.ts            # Server actions for all forms
  components/             # Header, Footer, PageHeader, forms/
  content/                # site.ts, activities.ts, news.ts (editable content)
public/
  logo.png
  images/                 # Imagery copied from the original site
```

## Forms

Contact, Volunteer registration and CSR enquiry forms post to **server actions** in
`src/app/actions.ts`. Each submission is currently **logged server-side**
(`console.log`, visible in Vercel function logs).

To persist to a database later, replace the body of `persistSubmission` in
`src/app/actions.ts` with your DB write (Postgres / Prisma / Drizzle / etc.).
No other code needs to change.

## Static asset caching

`next.config.ts` sets `Cache-Control: public, max-age=31536000, immutable` for
everything under `/images/*` and for common static file extensions. Next.js
already serves its build output under `/_next/static` as immutable. The image
optimizer is configured with a long `minimumCacheTTL`.

## Editing content

Most text lives directly in the page files. Shared/structured content is in
`src/content/`:

- `site.ts` — navigation, contact details, donate link
- `activities.ts` — home-page activity cards and impact stats
- `news.ts` — news articles

Add gallery photos by dropping image files into `public/images/gallery/`.

## Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel — it auto-detects Next.js.
3. Deploy. No environment variables are required for the current feature set.

## Roadmap

- User login / member area (planned)
- Database-backed form submissions
- Online donations integration
