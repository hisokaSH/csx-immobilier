# CSX Immobilier

Plateforme SaaS d'automatisation immobilière pour les Antilles.

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Setup Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings → API** and copy your:
   - Project URL
   - Anon/Public key

4. Create a `.env` file:
```bash
cp .env.example .env
```

5. Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Setup Database Tables

Run this SQL in Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  website TEXT,
  stripe_customer_id TEXT,
  subscription_id TEXT,
  subscription_status TEXT,
  subscription_plan TEXT,
  subscription_current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Listings table
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  price_type TEXT DEFAULT 'sale', -- sale, rent, vacation
  property_type TEXT DEFAULT 'apartment',
  location TEXT,
  beds INTEGER,
  baths INTEGER,
  area INTEGER,
  features TEXT[],
  images TEXT[],
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, pending, active, paused
  platforms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Listings policies
CREATE POLICY "Users can view own listings" ON listings
  FOR SELECT USING (auth.uid() = user_id);

-- Public can view active listings (for public listing page)
CREATE POLICY "Public can view active listings" ON listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  listing_id UUID REFERENCES listings(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  source TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, qualified, visited, lost
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON leads
  FOR DELETE USING (auth.uid() = user_id);

-- Platform connections table
CREATE TABLE platform_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected',
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

-- Platform connections policies
CREATE POLICY "Users can view own connections" ON platform_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own connections" ON platform_connections
  FOR ALL USING (auth.uid() = user_id);
```

### 4. Configure Auth

In Supabase Dashboard → Authentication → URL Configuration:

- Set **Site URL** to: `http://localhost:5173` (dev) or your production URL
- Add **Redirect URLs**: 
  - `http://localhost:5173`
  - `https://your-domain.com`

### 5. Run the app
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
src/
├── components/       # Reusable components
│   ├── Sidebar.jsx
│   └── ProtectedRoute.jsx
├── context/          # React contexts
│   └── AuthContext.jsx
├── lib/              # Utilities
│   ├── supabase.js   # Supabase client
│   └── database.js   # CRUD operations & hooks
├── pages/            # Page components
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── Listings.jsx
│   ├── CreateListing.jsx
│   ├── Leads.jsx
│   ├── Settings.jsx
│   └── ...
├── App.jsx           # Main app with routing
├── main.jsx          # Entry point
└── styles.css        # Global styles
```

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## 🔐 Features

- ✅ Landing page
- ✅ User authentication (signup, login, password reset)
- ✅ Protected dashboard routes
- ✅ Listings CRUD (create, edit, delete, list)
- ✅ Leads management (view, update status, delete)
- ✅ User profile & settings
- ✅ Platform connections UI
- ✅ AI tools (description generator UI)
- ✅ Real-time dashboard stats

## 📝 Next Steps

- [ ] Wire up real AI generation (Claude API)
- [ ] Implement platform OAuth flows
- [ ] Add Stripe billing
- [ ] File upload for images (Supabase Storage)
