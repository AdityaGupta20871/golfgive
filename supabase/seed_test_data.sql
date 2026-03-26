-- ============================================================
-- GolfGives — Test Data Seed
-- ============================================================
-- Run this in your Supabase SQL Editor AFTER schema.sql
-- to create test users with scores for full functionality testing.
--
-- IMPORTANT: You must first create these users in Supabase Auth:
--   1. Go to Authentication → Users → Add User
--   2. Create each user with the email/password below
--   3. Copy the UUID from the Auth table
--   4. Replace the UUIDs in this script with the real ones
-- ============================================================

-- ┌─────────────────────────────────────────────────────────┐
-- │ STEP 1: Create users in Supabase Auth Dashboard first  │
-- │                                                         │
-- │ User 1 (Regular):                                       │
-- │   Email:    testuser@golfgives.co.uk                    │
-- │   Password: GolfGives2026!                              │
-- │                                                         │
-- │ User 2 (Admin):                                         │
-- │   Email:    admin@golfgives.co.uk                       │
-- │   Password: AdminGolf2026!                              │
-- │                                                         │
-- │ User 3 (Inactive):                                      │
-- │   Email:    inactive@golfgives.co.uk                    │
-- │   Password: InactiveGolf2026!                           │
-- └─────────────────────────────────────────────────────────┘

-- STEP 2: After creating users in Auth, get their UUIDs and run:
-- (Replace 'AUTH_USER_1_UUID' etc with real UUIDs from Auth → Users)

-- === Insert into public.users table ===

-- Test User (active subscriber with scores)
INSERT INTO users (id, name, email, subscription_status, subscription_plan, charity_id, charity_percentage, stripe_customer_id)
SELECT
  id,
  'Test Golfer',
  'testuser@golfgives.co.uk',
  'active',
  'monthly',
  (SELECT id FROM charities WHERE name = 'Cancer Research UK' LIMIT 1),
  15,
  'cus_test_user_001'
FROM auth.users
WHERE email = 'testuser@golfgives.co.uk'
ON CONFLICT (id) DO UPDATE SET
  subscription_status = 'active',
  subscription_plan = 'monthly';

-- Admin User (active subscriber)
INSERT INTO users (id, name, email, subscription_status, subscription_plan, charity_id, charity_percentage, stripe_customer_id)
SELECT
  id,
  'Admin User',
  'admin@golfgives.co.uk',
  'active',
  'yearly',
  (SELECT id FROM charities WHERE name = 'Veterans on the Green' LIMIT 1),
  20,
  'cus_test_admin_001'
FROM auth.users
WHERE email = 'admin@golfgives.co.uk'
ON CONFLICT (id) DO UPDATE SET
  subscription_status = 'active',
  subscription_plan = 'yearly';

-- Inactive User (no subscription)
INSERT INTO users (id, name, email, subscription_status, subscription_plan, charity_id, charity_percentage)
SELECT
  id,
  'Inactive Player',
  'inactive@golfgives.co.uk',
  'inactive',
  NULL,
  (SELECT id FROM charities WHERE name = 'Mental Health Fairways' LIMIT 1),
  10
FROM auth.users
WHERE email = 'inactive@golfgives.co.uk'
ON CONFLICT (id) DO UPDATE SET
  subscription_status = 'inactive';

-- === Insert test scores for Test User (5 scores) ===
INSERT INTO scores (user_id, score, date)
SELECT id, 36, '2026-03-01' FROM auth.users WHERE email = 'testuser@golfgives.co.uk';

INSERT INTO scores (user_id, score, date)
SELECT id, 31, '2026-03-05' FROM auth.users WHERE email = 'testuser@golfgives.co.uk';

INSERT INTO scores (user_id, score, date)
SELECT id, 42, '2026-03-10' FROM auth.users WHERE email = 'testuser@golfgives.co.uk';

INSERT INTO scores (user_id, score, date)
SELECT id, 28, '2026-03-15' FROM auth.users WHERE email = 'testuser@golfgives.co.uk';

INSERT INTO scores (user_id, score, date)
SELECT id, 39, '2026-03-20' FROM auth.users WHERE email = 'testuser@golfgives.co.uk';

-- === Insert test scores for Admin User (3 scores) ===
INSERT INTO scores (user_id, score, date)
SELECT id, 44, '2026-03-02' FROM auth.users WHERE email = 'admin@golfgives.co.uk';

INSERT INTO scores (user_id, score, date)
SELECT id, 37, '2026-03-08' FROM auth.users WHERE email = 'admin@golfgives.co.uk';

INSERT INTO scores (user_id, score, date)
SELECT id, 33, '2026-03-14' FROM auth.users WHERE email = 'admin@golfgives.co.uk';

-- === Sample charity contributions ===
INSERT INTO charity_contributions (user_id, charity_id, amount, date)
SELECT
  u.id,
  u.charity_id,
  1.50,
  '2026-03-01'
FROM users u WHERE u.email = 'testuser@golfgives.co.uk' AND u.charity_id IS NOT NULL;

INSERT INTO charity_contributions (user_id, charity_id, amount, date)
SELECT
  u.id,
  u.charity_id,
  1.50,
  '2026-02-01'
FROM users u WHERE u.email = 'testuser@golfgives.co.uk' AND u.charity_id IS NOT NULL;

INSERT INTO charity_contributions (user_id, charity_id, amount, date)
SELECT
  u.id,
  u.charity_id,
  8.25,
  '2026-03-01'
FROM users u WHERE u.email = 'admin@golfgives.co.uk' AND u.charity_id IS NOT NULL;
