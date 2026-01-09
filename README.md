# Real Estate CRM

AI-powered follow-up message generator for real estate agents. Built with Next.js, Supabase, and Claude AI.

## Features

- **AI Message Generator**: Generate personalized follow-up messages based on deal stage, channel, and tone
- **Deal Pipeline**: Visual Kanban board with drag-and-drop between stages
- **Smart Follow-ups**: Track overdue, due today, and upcoming follow-ups
- **Daily Email Reminders**: Automated morning digest of deals needing attention
- **Analytics Dashboard**: Pipeline funnel, conversion stats, client breakdowns
- **Multi-Channel**: Email & WhatsApp message formats with one-click copy
- **CSV Import**: Bulk upload existing clients
- **Search & Filter**: Find deals by name, stage, or client type
- **Stripe Payments**: Subscription billing with free trial

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (Postgres + Auth)
- **AI**: Claude API (claude-sonnet-4-20250514)
- **Payments**: Stripe (subscriptions, billing portal)
- **Email**: Resend (transactional emails)
- **Hosting**: Vercel (with cron jobs)

## Getting Started

### 1. Clone and Install

```bash
git clone <repo>
cd realestate-crm
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:
   - `supabase/schema.sql` (main schema)
   - `supabase/migrations/001_add_stripe.sql` (Stripe columns)
3. Go to **Authentication > URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Add redirect URL: `http://localhost:3000/auth/callback`
4. Go to **Authentication > Email Templates > Confirm signup** and update the link:
   ```html
   <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Confirm Email</a>
   ```

### 3. Set Up Stripe (Optional)

1. Create account at [stripe.com](https://stripe.com)
2. Create a Product with monthly price ($29/month)
3. Note the Price ID (starts with `price_`)
4. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
5. Add events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### 4. Set Up Resend (Optional)

1. Create account at [resend.com](https://resend.com)
2. Verify your domain or use their test domain
3. Get API key

### 5. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx

# Resend (optional)
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=CRM <noreply@yourdomain.com>

# Cron
CRON_SECRET=random-secret-string

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add all environment variables
4. Deploy

Vercel will automatically set up the daily cron job (8am UTC) for email reminders.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── (auth)/login/         # Login/signup
│   ├── (dashboard)/
│   │   ├── app/              # Today dashboard
│   │   ├── deals/            # Deal list + pipeline
│   │   ├── deal/[id]/        # Deal details + generator
│   │   ├── analytics/        # Analytics dashboard
│   │   └── settings/         # Profile & billing
│   └── api/
│       ├── generate/         # Claude message generation
│       ├── stripe/           # Checkout, portal, webhook
│       └── cron/             # Daily reminder emails
├── components/
│   ├── deals/                # Deal cards, table, pipeline
│   ├── messages/             # Generator, history
│   ├── settings/             # Profile, subscription
│   └── ui/                   # Buttons, inputs, cards
└── lib/
    ├── prompts.ts            # 15 stage-specific prompts
    ├── stripe.ts             # Stripe client
    ├── email.ts              # Resend client
    └── supabase/             # Supabase clients
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/generate` | POST | Generate AI message |
| `/api/stripe/checkout` | POST | Create Stripe checkout |
| `/api/stripe/portal` | POST | Billing portal session |
| `/api/stripe/webhook` | POST | Stripe webhooks |
| `/api/cron/daily-reminders` | GET | Send reminder emails |

## Database Tables

| Table | Description |
|-------|-------------|
| `profiles` | User data, Stripe customer ID, subscription status |
| `crm_deals` | Client deals with stage, contact info |
| `crm_messages` | Generated messages history |
| `crm_api_usage` | Usage logging for rate limiting |

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| **7-Day Trial** | Free | Full access to all features |
| **Solo Agent** | €79/month | Unlimited deals & AI messages, email reminders |
| **Agency** | €59/agent/month | Everything in Solo + centralized billing, priority support (min 5 agents) |

No freemium. No feature gating. Professional pricing for professional tools.

## License

MIT
