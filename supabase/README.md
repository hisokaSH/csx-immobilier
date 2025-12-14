# Supabase Edge Functions

## Deploy All Functions

### 1. Install Supabase CLI

```bash
# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# macOS
brew install supabase/tap/supabase

# npm (not recommended)
npm install -g supabase
```

### 2. Login and Link

```bash
supabase login
cd csx-app
supabase link --project-ref cqxvklcvanlphrgojdvc
```

### 3. Set Secrets

```bash
# Required for AI descriptions
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx

# Required for Facebook/Instagram posting
supabase secrets set FACEBOOK_APP_ID=your_app_id
supabase secrets set FACEBOOK_APP_SECRET=your_app_secret

# Required for Stripe billing
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_PRICE_STARTER=price_xxx
supabase secrets set STRIPE_PRICE_PRO=price_xxx
supabase secrets set STRIPE_PRICE_AGENCE=price_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 4. Deploy Functions

```bash
supabase functions deploy generate-description
supabase functions deploy facebook-oauth
supabase functions deploy publish-to-platforms
supabase functions deploy submit-lead
supabase functions deploy create-checkout
supabase functions deploy create-portal
supabase functions deploy stripe-webhook
```

---

## Function Details

### generate-description
Generates property descriptions using Claude AI.

### facebook-oauth
Handles Facebook OAuth flow:
- Exchanges auth code for access token
- Gets long-lived token (60 days)
- Fetches user's Pages and Instagram Business accounts

### publish-to-platforms
Publishes listings to connected platforms:
- Posts to Facebook Pages (with image if available)
- Posts to Instagram Business (requires image)

### submit-lead
Handles public lead form submissions:
- Validates contact info
- Creates lead linked to listing owner
- Returns success message

### create-checkout
Creates Stripe Checkout session for subscriptions.

### create-portal
Creates Stripe Customer Portal session for subscription management.

### stripe-webhook
Handles Stripe webhook events:
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_failed

---

## Stripe Setup

### 1. Create Products in Stripe Dashboard

Go to https://dashboard.stripe.com/products and create 3 products:

**Starter - 49 EUR/month**
- Click "Add product"
- Name: "CSX Immobilier Starter"
- Price: 49 EUR, Recurring monthly
- Copy the Price ID (starts with `price_`)

**Pro - 99 EUR/month**
- Name: "CSX Immobilier Pro"  
- Price: 99 EUR, Recurring monthly
- Copy the Price ID

**Agence - 249 EUR/month**
- Name: "CSX Immobilier Agence"
- Price: 249 EUR, Recurring monthly
- Copy the Price ID

### 2. Set Price IDs as Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_PRICE_STARTER=price_xxx
supabase secrets set STRIPE_PRICE_PRO=price_xxx
supabase secrets set STRIPE_PRICE_AGENCE=price_xxx
```

### 3. Setup Webhook

Go to https://dashboard.stripe.com/webhooks

Click "Add endpoint":
- Endpoint URL: `https://cqxvklcvanlphrgojdvc.supabase.co/functions/v1/stripe-webhook`
- Events to listen: 
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_failed

Copy the Signing secret and set it:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 4. Configure Customer Portal

Go to https://dashboard.stripe.com/settings/billing/portal

Enable:
- Update payment method
- Cancel subscription
- Switch plans

### 5. Add Stripe columns to profiles table

Run this SQL in Supabase:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;
```

---

## Facebook App Setup

1. Go to https://developers.facebook.com/apps/create/
2. Choose "Business" type
3. Add products:
   - Facebook Login
   - Instagram Graph API
4. Configure Facebook Login:
   - Valid OAuth Redirect URIs: `https://your-domain.com/accounts`
5. Request permissions:
   - pages_show_list
   - pages_read_engagement  
   - pages_manage_posts
   - instagram_basic
   - instagram_content_publish
6. Submit for App Review (required for production)

---

## Troubleshooting

**ANTHROPIC_API_KEY not configured**
- Run: `supabase secrets set ANTHROPIC_API_KEY=...`

**Facebook OAuth error**
- Check FACEBOOK_APP_ID and FACEBOOK_APP_SECRET secrets
- Verify redirect URI matches your domain

**Instagram requires image**
- Instagram posts require at least one image
- Images must be publicly accessible URLs
