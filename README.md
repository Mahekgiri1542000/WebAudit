# WebAudit — AI-Powered Website Auditing SaaS

> Full website audit in 60 seconds — SEO, AI Visibility, PageSpeed, Security, and more.

---

## Overview

WebAudit is a production-ready SaaS platform that audits websites across 60+ dimensions and delivers AI-powered improvement recommendations. Built with Next.js 15, it supports real-time streaming audits, background workers, multi-provider AI analysis, and a full billing system.

---

## Features

### Core Auditing
- **On-Page SEO** — Title, meta, headings, canonical, structured data (JSON-LD), Open Graph
- **Technical SEO** — Crawlability, robots.txt, sitemap, redirects, hreflang
- **PageSpeed & Core Web Vitals** — LCP, CLS, FID via Google PageSpeed Insights API
- **Security** — SSL/TLS, HSTS, CSP, malware scan, blacklist check, VirusTotal
- **GEO (Generative Engine Optimization)** — AI search visibility for ChatGPT, Perplexity, Gemini
- **AEO (Answer Engine Optimization)** — Voice search, featured snippet, FAQ readiness
- **Off-Page SEO** — Backlink signals, domain authority estimation
- **Worldwide SEO** — Multi-region ranking simulation
- **CMS Detection** — WordPress, Shopify, Webflow, Framer, Next.js, and more

### AI Deep Analysis
- Stream full enterprise-grade website analysis using **Gemini 2.5 Flash**, **Claude Opus**, or **GPT-4o**
- 10-section report: Executive Summary, SEO, UX, Brand, Content, Performance, Accessibility, Conversion, Technical, Quick Wins + Roadmap
- Scores across 9 dimensions with color-coded progress bars
- Export to TXT or copy to clipboard

### Dashboard
- Real-time audit progress with Server-Sent Events (SSE) streaming
- Monitored sites with automatic scheduled re-audits
- Notification center (score drops, security alerts, weekly digests)
- Shareable audit reports with public URLs
- Printable / PDF-export audit reports with certificate of health
- Keyword ranking tracker

### Billing & Plans
- **Free** — 3 audits/month
- **Starter** — 20 audits/month
- **Pro** — 100 audits/month + AI Analysis
- **Agency** — Unlimited + white-label
- Stripe Checkout + Customer Portal + Webhook handling

### Auth & Security
- Email/password authentication (NextAuth v5)
- Forgot password + email verification flows
- Rate limiting on all sensitive endpoints (Upstash)
- SSRF protection on audit URL inputs
- Security headers via middleware

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma |
| Auth | NextAuth v5 + bcryptjs |
| Queue | BullMQ + Upstash Redis |
| Rate Limiting | @upstash/ratelimit |
| Email | Resend |
| Payments | Stripe |
| AI Providers | Anthropic Claude, Google Gemini, OpenAI |
| Scraping | Cheerio |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI |
| Charts | Recharts |
| Animations | Framer Motion |
| 3D Globe | Three.js + React Three Fiber |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, forgot-password, verify-email
│   ├── (marketing)/     # Home, pricing, blog, about, contact, docs, etc.
│   ├── dashboard/       # Main app — audits, sites, billing, settings, AI analysis
│   ├── api/             # All API routes
│   ├── admin/           # Admin panel
│   └── print/           # Printable audit report
├── components/
│   ├── dashboard/       # Sidebar, audit UI, export, checkout
│   └── landing/         # Hero, globe, particle effects
├── lib/
│   ├── audit/           # All audit engines (SEO, PageSpeed, Security, GEO, etc.)
│   ├── ai-analysis/     # Scraper + prompt builder for AI deep analysis
│   ├── billing/         # Stripe, plan features, usage tracking
│   ├── notifications/   # Email templates (Resend)
│   ├── security/        # Rate limiting, SSRF guard
│   └── auth.ts          # NextAuth config
├── worker/
│   ├── audit-worker.ts          # BullMQ audit job processor
│   ├── ai-suggestions-worker.ts # AI suggestion generator
│   ├── monitor-scheduler.ts     # Scheduled site monitoring
│   └── cleanup-worker.ts        # Old data cleanup
└── types/
    └── audit.ts                 # Shared TypeScript types
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Mahekgiri1542000/WebAudit.git
cd WebAudit
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see Environment Variables section below).

### 3. Set up the database

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Run background workers (optional, for audit queue)

```bash
npm run worker        # Audit worker
npm run worker:ai     # AI suggestions worker
npm run scheduler     # Monitor scheduler
```

---

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Database (Neon)
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Auth
NEXTAUTH_SECRET=
AUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Google APIs
GOOGLE_PAGESPEED_API_KEY=

# AI Providers
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_AGENCY=

# Queue (Upstash Redis)
REDIS_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Security (optional)
VIRUSTOTAL_API_KEY=
SERPAPI_KEY=
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in the Vercel dashboard
4. Set `NEXTAUTH_URL` to your production domain
5. Deploy

### Database Migration on Deploy

```bash
vercel exec -- npx prisma migrate deploy
```

---

## Plans & Pricing

| Plan | Audits/mo | AI Analysis | Monitoring | Price |
|---|---|---|---|---|
| Free | 3 | — | — | $0 |
| Starter | 20 | — | 5 sites | $19/mo |
| Pro | 100 | ✅ | 25 sites | $49/mo |
| Agency | Unlimited | ✅ | Unlimited | $149/mo |

---

## License

MIT — free to use, modify, and deploy.

---

## Author

Built by [Mahek Giri](https://github.com/Mahekgiri1542000)
