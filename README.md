This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Search engine metadata

Set `NEXT_PUBLIC_SITE_URL` in Vercel to the production site origin (for example,
`https://your-domain.com`) so canonical URLs, structured data, and the sitemap
use the correct domain. The app provides article metadata and structured data,
an Open Graph image, and generated `/robots.txt` and `/sitemap.xml` routes.
Submit the sitemap URL to Google Search Console and Bing Webmaster Tools after
deployment. Metadata and structured data help search engines interpret the
site but cannot guarantee rankings or inclusion in AI-generated results.

## Admin blog management

The `/admin` dashboard supports password-protected article and category/subcategory
management, drafts, publishing, and per-article SEO metadata. Admin writes are
proxied through the Next.js server using an HTTP-only session cookie; do not expose
`ADMIN_API_TOKEN` as a `NEXT_PUBLIC_` variable.

Article content uses the Quill rich-text editor. Its image button embeds images
from public HTTP(S) URLs and requests descriptive alt text. Direct file uploads
need a configured image-storage provider; image files are not stored in MongoDB.
Article HTML is sanitized before it is saved and again before it is rendered.

Copy `.env.example` to `.env.local` and configure the frontend:

- `NEXT_PUBLIC_API_URL`: backend API origin ending in `/api`.
- `NEXT_PUBLIC_SITE_URL`: canonical production website origin.
- `ADMIN_PASSWORD`: password for `/admin`.
- `ADMIN_SESSION_SECRET`: long, unique secret used to sign admin sessions.
- `ADMIN_API_TOKEN`: long, unique token shared with the backend's `ADMIN_API_TOKEN`.

Configure `cricket-backend/.env` from that repository's `.env.example`, including
MongoDB connection and the matching `ADMIN_API_TOKEN`. Set `FRONTEND_URL` to the
frontend deployment origin. Never commit real environment files or secrets.

Public category and subcategory archives are available at `/category/:categorySlug`
and `/category/:categorySlug/:subcategorySlug`. Article pages support editable
SEO titles/descriptions, automatically generated canonical URLs, social previews, structured data, and
no-index control. The sitemap includes published, indexable articles and taxonomy
pages; robots rules exclude the admin dashboard.

The public homepage and category archives use server-rendered pagination with
crawlable page links and self-referencing canonical URLs for each page. The
admin article list uses authenticated API pagination and is excluded from search
engine crawling.
