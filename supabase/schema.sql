-- GolfGives Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Charities table
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  upcoming_event TEXT,
  is_featured BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  charity_id UUID REFERENCES charities(id),
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Draws table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  draw_type TEXT DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  jackpot_rollover DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year)
);

-- Draw results table
CREATE TABLE draw_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('3', '4', '5')),
  winner_user_id UUID NOT NULL REFERENCES users(id),
  prize_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Charity contributions table
CREATE TABLE charity_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- TRIGGER: Auto-replace oldest score when 6th is added
-- ==============================
CREATE OR REPLACE FUNCTION enforce_max_scores()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
  oldest_score_id UUID;
BEGIN
  SELECT COUNT(*) INTO score_count FROM scores WHERE user_id = NEW.user_id;

  IF score_count >= 5 THEN
    SELECT id INTO oldest_score_id
    FROM scores
    WHERE user_id = NEW.user_id
    ORDER BY created_at ASC
    LIMIT 1;

    DELETE FROM scores WHERE id = oldest_score_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_scores_trigger
BEFORE INSERT ON scores
FOR EACH ROW EXECUTE FUNCTION enforce_max_scores();

-- ==============================
-- RLS Policies
-- ==============================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;

-- Users: read own, admin reads all
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Scores: own data only
CREATE POLICY "Users can CRUD own scores" ON scores FOR ALL USING (auth.uid() = user_id);

-- Draws: all can read published, admin manages
CREATE POLICY "Anyone can read published draws" ON draws FOR SELECT USING (status = 'published' OR auth.role() = 'service_role');

-- Draw results: winners can see own results
CREATE POLICY "Users see own draw results" ON draw_results FOR SELECT USING (auth.uid() = winner_user_id OR auth.role() = 'service_role');

-- Charities: public read
CREATE POLICY "Anyone can read charities" ON charities FOR SELECT USING (true);

-- Contributions: own only
CREATE POLICY "Users see own contributions" ON charity_contributions FOR SELECT USING (auth.uid() = user_id);

-- ==============================
-- Seed Data
-- ==============================
INSERT INTO charities (name, description, logo_url, upcoming_event, is_featured, category) VALUES
  ('Cancer Research UK', 'The world''s largest independent cancer research organisation, dedicated to saving lives through research.', null, 'Charity Golf Day - Apr 2026', true, 'Health'),
  ('Children''s Golf Foundation', 'Getting underprivileged kids onto the fairway and into education through sport.', null, 'Junior Open Day - May 2026', true, 'Youth'),
  ('Veterans on the Green', 'Supporting military veterans with therapy, community and competitive golf programmes.', null, 'Veterans Cup - Jun 2026', true, 'Veterans'),
  ('Mental Health Fairways', 'Using golf as a mental health tool — open days, peer support and structured programmes.', null, 'Mind & Golf Retreat - Mar 2026', false, 'Mental Health'),
  ('Golf for All Foundation', 'Breaking barriers in golf — disability access, adaptive equipment, and inclusive tournaments.', null, 'Adaptive Golf Day - Jul 2026', false, 'Accessibility'),
  ('Green Heart Initiative', 'Planting trees on golf courses and funding environmental restoration across the UK.', null, 'Eco-Golf Week - Aug 2026', false, 'Environment');

-- Sample draw
INSERT INTO draws (month, year, status, draw_type, jackpot_rollover) VALUES
  (3, 2026, 'pending', 'random', 0),
  (2, 2026, 'published', 'random', 0);
