# GolfGives 🏌️‍♂️💚

**Play Golf. Win Prizes. Change Lives.**

A golf charity subscription platform built with Next.js 15, Supabase, Stripe, and Resend.

---

## 🏗 Tech Stack

| Layer        | Tech                        |
|-------------|----------------------------|
| Framework   | Next.js 15 (App Router)    |
| Database    | Supabase (PostgreSQL)       |
| Auth        | Supabase Auth               |
| Payments    | Stripe Subscriptions        |
| Emails      | Resend                      |
| Styling     | Tailwind CSS 4              |
| Animations  | Framer Motion               |
| Deployment  | Vercel                      |

---

## 📋 Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode)
- A [Resend](https://resend.com) account
- A [Vercel](https://vercel.com) account (for deployment)

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd golfgives
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable                          | Where to get it                                          |
|----------------------------------|----------------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase Dashboard → Project Settings → Data API         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Same page → `anon` (public) key                          |
| `SUPABASE_SERVICE_KEY`           | Same page → `service_role` key (keep secret!)            |
| `STRIPE_SECRET_KEY`              | Stripe Dashboard → Developers → API Keys                 |
| `STRIPE_WEBHOOK_SECRET`          | Stripe CLI or Dashboard → Webhooks → Signing secret      |
| `STRIPE_PRICE_MONTHLY_ID`       | Stripe → Products → Create Monthly (£9.99/mo) → Price ID |
| `STRIPE_PRICE_YEARLY_ID`        | Stripe → Products → Create Yearly (£99/yr) → Price ID    |
| `RESEND_API_KEY`                 | Resend Dashboard → API Keys                               |
| `ADMIN_EMAILS`                   | Comma-separated admin login emails (e.g., `admin@golfgives.co.uk`) |

### 3. Set up the database

Run the SQL schema in your **Supabase PostgreSQL SQL Editor** (not MySQL tools):

```
supabase/schema.sql
```

Then run the improved trigger:

```
supabase/trigger_enforce_max_scores.sql
```

### 4. Create Stripe Products

In the Stripe Dashboard:

1. **Product 1**: "GolfGives Monthly" → Add price: £9.99/month → Copy Price ID
2. **Product 2**: "GolfGives Yearly" → Add price: £99/year → Copy Price ID
3. Set these as `STRIPE_PRICE_MONTHLY_ID` and `STRIPE_PRICE_YEARLY_ID`

### 5. Set up Stripe Webhook

For local development:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

For production (Vercel):

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy the signing secret

### 6. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
golfgives/
├── app/
│   ├── admin/              # Admin panel (analytics, users, draws, winners)
│   ├── api/
│   │   ├── admin/          # Admin APIs (draw, winners, analytics)
│   │   ├── auth/callback/  # Supabase auth callback
│   │   └── stripe/         # Stripe checkout & webhook
│   ├── charities/          # Public charity pages
│   ├── dashboard/          # User dashboard
│   ├── login/              # Login page
│   ├── pricing/            # Subscription pricing page
│   └── signup/             # Registration page
├── components/
│   ├── admin/              # Admin sidebar
│   ├── dashboard/          # Dashboard widgets
│   ├── landing/            # Landing page sections
│   ├── layout/             # Shared layout (navbar)
│   └── ui/                 # Shared UI (skeletons, error boundaries)
├── lib/
│   ├── actions/            # Server actions (scores)
│   ├── supabase/           # Supabase client helpers
│   ├── draw-engine.ts      # Draw engine (random + algorithmic)
│   └── stripe.ts           # Stripe configuration
├── supabase/
│   ├── schema.sql          # Database schema + seed data
│   └── trigger_enforce_max_scores.sql  # Rolling 5-score trigger
├── types/                  # TypeScript type definitions
├── middleware.ts            # Auth + subscription protection
├── vercel.json             # Vercel deployment config
└── .env.example            # Environment variable template
```

---

## 🎯 Key Features

### Score Engine
- Users submit Stableford scores (1-45)
- Rolling window of 5 scores per user (DB trigger auto-deletes oldest)
- Server-side validation via Zod

### Stripe Subscriptions
- Monthly (£9.99/mo) and Yearly (£99/yr) plans
- Stripe Checkout for payments
- Webhook handling with idempotency
- Auto-updates subscription_status on payment events

### Draw Engine
- **Random Mode**: 5 random numbers matched against user scores
- **Algorithmic Mode**: Weights numbers by least-frequent scores
- Prize pool: 70% to prizes (40/35/25 split), 30% to charity
- Jackpot rollover when no 5-match winner
- Simulate mode for preview without committing

### Admin Panel
- Analytics with live data
- User management with search/filter
- Draw management (simulate/publish)
- Winner verification with email notifications

---

## 🧪 Running Tests

```bash
# Install vitest if not installed
npx vitest run lib/__tests__/scores.test.ts
```

---

## 🧾 Test Credentials Format

For development/testing, create test users in Supabase Auth:

```
Email:    test@golfgives.co.uk
Password: TestPassword123!

Admin:    admin@golfgives.co.uk
Password: AdminPassword123!

Set `ADMIN_EMAILS=admin@golfgives.co.uk` in Vercel/local env so `/admin` routes are restricted to that account. Admin allowlisted users are redirected to `/admin` after login.
```

Use Stripe test cards:
```
Success:        4242 4242 4242 4242
Decline:        4000 0000 0000 0002
Requires Auth:  4000 0025 0000 3155
```

---

## 🚢 Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add all env variables from `.env.example`
   - In Vercel, each variable must be created as a separate key/value entry.
   - Do not paste the full `.env` file into one variable value.
4. Deploy!

The `vercel.json` is pre-configured with:
- London region (`lhr1`)
- Extended timeouts for webhook/draw routes
- Security headers on API routes

---

## 🛠 Troubleshooting

- **Admin error: `Invalid API key` on `/admin/*` APIs**
  - `SUPABASE_SERVICE_KEY` is missing, placeholder, or using the anon/publishable key.
  - Fix: set `SUPABASE_SERVICE_KEY` to Supabase **service_role** key in Vercel.

- **Dashboard error: `scores_user_id_fkey` when submitting score**
  - This means the logged-in auth user has no matching row in `public.users`.
  - The app now self-heals by creating a minimal user profile when dashboard/score actions run.
  - If you still see this, verify RLS policies and that `users.id` references `auth.users.id` in Supabase PostgreSQL.

---

## 📄 License

Private — all rights reserved.
