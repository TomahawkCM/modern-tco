-- Migration: 004_seed_system_categories
-- Adds type and display_order columns to categories table
-- Seeds 14 parent categories + 67 child categories + English translations
-- Aligned with offline app category hierarchy
-- Per V1-DATABASE-SCHEMA-DESIGN.md: deterministic, no AI-generated data
--
-- Depends on: 003_accounts_transactions_categories (categories + category_translations tables)
-- Note: UNIQUE(key) and UNIQUE(category_id, locale) already exist from 003

-- ============================================================
-- 1. Schema changes: add type and display_order to categories
-- ============================================================

CREATE TYPE public.category_type AS ENUM ('income', 'expense', 'transfer');

ALTER TABLE public.categories
  ADD COLUMN type public.category_type NOT NULL DEFAULT 'expense',
  ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;

-- Indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- ============================================================
-- 2. Seed parent categories (14 top-level groups)
-- ============================================================

INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('food_dining',          NULL, true, 'expense',  1),
  ('transportation',       NULL, true, 'expense',  2),
  ('bills_utilities',      NULL, true, 'expense',  3),
  ('shopping',             NULL, true, 'expense',  4),
  ('entertainment',        NULL, true, 'expense',  5),
  ('health_fitness',       NULL, true, 'expense',  6),
  ('housing',              NULL, true, 'expense',  7),
  ('income',               NULL, true, 'income',   8),
  ('savings_investments',  NULL, true, 'expense',  9),
  ('education',            NULL, true, 'expense',  10),
  ('pets',                 NULL, true, 'expense',  11),
  ('travel',               NULL, true, 'expense',  12),
  ('miscellaneous',        NULL, true, 'expense',  13),
  ('transfers',            NULL, true, 'transfer', 14);

-- ============================================================
-- 3. Seed child categories (grouped by parent)
-- ============================================================

-- Food & Dining children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('groceries',      (SELECT id FROM public.categories WHERE key = 'food_dining'), true, 'expense', 1),
  ('restaurants',    (SELECT id FROM public.categories WHERE key = 'food_dining'), true, 'expense', 2),
  ('coffee_shops',   (SELECT id FROM public.categories WHERE key = 'food_dining'), true, 'expense', 3),
  ('fast_food',      (SELECT id FROM public.categories WHERE key = 'food_dining'), true, 'expense', 4),
  ('food_delivery',  (SELECT id FROM public.categories WHERE key = 'food_dining'), true, 'expense', 5);

-- Transportation children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('gas_fuel',             (SELECT id FROM public.categories WHERE key = 'transportation'), true, 'expense', 1),
  ('public_transit',       (SELECT id FROM public.categories WHERE key = 'transportation'), true, 'expense', 2),
  ('parking',              (SELECT id FROM public.categories WHERE key = 'transportation'), true, 'expense', 3),
  ('vehicle_maintenance',  (SELECT id FROM public.categories WHERE key = 'transportation'), true, 'expense', 4),
  ('car_payment',          (SELECT id FROM public.categories WHERE key = 'transportation'), true, 'expense', 5);

-- Bills & Utilities children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('electricity',   (SELECT id FROM public.categories WHERE key = 'bills_utilities'), true, 'expense', 1),
  ('water',         (SELECT id FROM public.categories WHERE key = 'bills_utilities'), true, 'expense', 2),
  ('internet',      (SELECT id FROM public.categories WHERE key = 'bills_utilities'), true, 'expense', 3),
  ('phone',         (SELECT id FROM public.categories WHERE key = 'bills_utilities'), true, 'expense', 4),
  ('insurance',     (SELECT id FROM public.categories WHERE key = 'bills_utilities'), true, 'expense', 5),
  ('gas_heating',   (SELECT id FROM public.categories WHERE key = 'bills_utilities'), true, 'expense', 6);

-- Shopping children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('clothing',       (SELECT id FROM public.categories WHERE key = 'shopping'), true, 'expense', 1),
  ('electronics',    (SELECT id FROM public.categories WHERE key = 'shopping'), true, 'expense', 2),
  ('home_goods',     (SELECT id FROM public.categories WHERE key = 'shopping'), true, 'expense', 3),
  ('personal_care',  (SELECT id FROM public.categories WHERE key = 'shopping'), true, 'expense', 4),
  ('gifts',          (SELECT id FROM public.categories WHERE key = 'shopping'), true, 'expense', 5);

-- Entertainment children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('streaming',       (SELECT id FROM public.categories WHERE key = 'entertainment'), true, 'expense', 1),
  ('movies_theater',  (SELECT id FROM public.categories WHERE key = 'entertainment'), true, 'expense', 2),
  ('games',           (SELECT id FROM public.categories WHERE key = 'entertainment'), true, 'expense', 3),
  ('hobbies',         (SELECT id FROM public.categories WHERE key = 'entertainment'), true, 'expense', 4),
  ('events',          (SELECT id FROM public.categories WHERE key = 'entertainment'), true, 'expense', 5);

-- Health & Fitness children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('gym_fitness',   (SELECT id FROM public.categories WHERE key = 'health_fitness'), true, 'expense', 1),
  ('medical',       (SELECT id FROM public.categories WHERE key = 'health_fitness'), true, 'expense', 2),
  ('pharmacy',      (SELECT id FROM public.categories WHERE key = 'health_fitness'), true, 'expense', 3),
  ('supplements',   (SELECT id FROM public.categories WHERE key = 'health_fitness'), true, 'expense', 4),
  ('therapy',       (SELECT id FROM public.categories WHERE key = 'health_fitness'), true, 'expense', 5);

-- Housing children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('rent_mortgage',      (SELECT id FROM public.categories WHERE key = 'housing'), true, 'expense', 1),
  ('property_tax',       (SELECT id FROM public.categories WHERE key = 'housing'), true, 'expense', 2),
  ('home_maintenance',   (SELECT id FROM public.categories WHERE key = 'housing'), true, 'expense', 3),
  ('hoa_fees',           (SELECT id FROM public.categories WHERE key = 'housing'), true, 'expense', 4),
  ('home_improvement',   (SELECT id FROM public.categories WHERE key = 'housing'), true, 'expense', 5);

-- Income children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('salary',             (SELECT id FROM public.categories WHERE key = 'income'), true, 'income', 1),
  ('freelance',          (SELECT id FROM public.categories WHERE key = 'income'), true, 'income', 2),
  ('investment_income',  (SELECT id FROM public.categories WHERE key = 'income'), true, 'income', 3),
  ('bonus',              (SELECT id FROM public.categories WHERE key = 'income'), true, 'income', 4),
  ('other_income',       (SELECT id FROM public.categories WHERE key = 'income'), true, 'income', 5);

-- Savings & Investments children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('emergency_fund',  (SELECT id FROM public.categories WHERE key = 'savings_investments'), true, 'expense', 1),
  ('retirement',      (SELECT id FROM public.categories WHERE key = 'savings_investments'), true, 'expense', 2),
  ('stocks_etf',      (SELECT id FROM public.categories WHERE key = 'savings_investments'), true, 'expense', 3),
  ('tfsa',            (SELECT id FROM public.categories WHERE key = 'savings_investments'), true, 'expense', 4),
  ('rrsp',            (SELECT id FROM public.categories WHERE key = 'savings_investments'), true, 'expense', 5);

-- Education children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('tuition',          (SELECT id FROM public.categories WHERE key = 'education'), true, 'expense', 1),
  ('books_supplies',   (SELECT id FROM public.categories WHERE key = 'education'), true, 'expense', 2),
  ('online_courses',   (SELECT id FROM public.categories WHERE key = 'education'), true, 'expense', 3),
  ('school_supplies',  (SELECT id FROM public.categories WHERE key = 'education'), true, 'expense', 4),
  ('student_loans',    (SELECT id FROM public.categories WHERE key = 'education'), true, 'expense', 5);

-- Pets children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('pet_food',       (SELECT id FROM public.categories WHERE key = 'pets'), true, 'expense', 1),
  ('veterinary',     (SELECT id FROM public.categories WHERE key = 'pets'), true, 'expense', 2),
  ('pet_grooming',   (SELECT id FROM public.categories WHERE key = 'pets'), true, 'expense', 3),
  ('pet_supplies',   (SELECT id FROM public.categories WHERE key = 'pets'), true, 'expense', 4),
  ('pet_insurance',  (SELECT id FROM public.categories WHERE key = 'pets'), true, 'expense', 5);

-- Travel children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('flights',              (SELECT id FROM public.categories WHERE key = 'travel'), true, 'expense', 1),
  ('hotels_lodging',       (SELECT id FROM public.categories WHERE key = 'travel'), true, 'expense', 2),
  ('travel_food',          (SELECT id FROM public.categories WHERE key = 'travel'), true, 'expense', 3),
  ('travel_activities',    (SELECT id FROM public.categories WHERE key = 'travel'), true, 'expense', 4),
  ('travel_transport',     (SELECT id FROM public.categories WHERE key = 'travel'), true, 'expense', 5);

-- Miscellaneous children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('gifts_given',     (SELECT id FROM public.categories WHERE key = 'miscellaneous'), true, 'expense', 1),
  ('donations',       (SELECT id FROM public.categories WHERE key = 'miscellaneous'), true, 'expense', 2),
  ('bank_fees',       (SELECT id FROM public.categories WHERE key = 'miscellaneous'), true, 'expense', 3),
  ('other_expense',   (SELECT id FROM public.categories WHERE key = 'miscellaneous'), true, 'expense', 4);

-- Transfers children
INSERT INTO public.categories (key, parent_id, is_system, type, display_order) VALUES
  ('account_transfer',      (SELECT id FROM public.categories WHERE key = 'transfers'), true, 'transfer', 1),
  ('credit_card_payment',   (SELECT id FROM public.categories WHERE key = 'transfers'), true, 'transfer', 2);

-- ============================================================
-- 4. Seed English translations for all categories
-- ============================================================

-- Parent category translations
INSERT INTO public.category_translations (category_id, locale, display_name)
SELECT id, 'en', display FROM (VALUES
  ('food_dining',         'Food & Dining'),
  ('transportation',      'Transportation'),
  ('bills_utilities',     'Bills & Utilities'),
  ('shopping',            'Shopping'),
  ('entertainment',       'Entertainment'),
  ('health_fitness',      'Health & Fitness'),
  ('housing',             'Housing'),
  ('income',              'Income'),
  ('savings_investments', 'Savings & Investments'),
  ('education',           'Education'),
  ('pets',                'Pets'),
  ('travel',              'Travel'),
  ('miscellaneous',       'Miscellaneous'),
  ('transfers',           'Transfers')
) AS t(cat_key, display)
JOIN public.categories c ON c.key = t.cat_key;

-- Child category translations
INSERT INTO public.category_translations (category_id, locale, display_name)
SELECT id, 'en', display FROM (VALUES
  -- Food & Dining
  ('groceries',           'Groceries'),
  ('restaurants',         'Restaurants'),
  ('coffee_shops',        'Coffee Shops'),
  ('fast_food',           'Fast Food'),
  ('food_delivery',       'Delivery'),
  -- Transportation
  ('gas_fuel',            'Gas & Fuel'),
  ('public_transit',      'Public Transit'),
  ('parking',             'Parking'),
  ('vehicle_maintenance', 'Vehicle Maintenance'),
  ('car_payment',         'Car Payment'),
  -- Bills & Utilities
  ('electricity',         'Electricity'),
  ('water',               'Water'),
  ('internet',            'Internet'),
  ('phone',               'Phone'),
  ('insurance',           'Insurance'),
  ('gas_heating',         'Gas / Heating'),
  -- Shopping
  ('clothing',            'Clothing'),
  ('electronics',         'Electronics'),
  ('home_goods',          'Home Goods'),
  ('personal_care',       'Personal Care'),
  ('gifts',               'Gifts'),
  -- Entertainment
  ('streaming',           'Streaming'),
  ('movies_theater',      'Movies & Theater'),
  ('games',               'Games'),
  ('hobbies',             'Hobbies'),
  ('events',              'Events'),
  -- Health & Fitness
  ('gym_fitness',         'Gym & Fitness'),
  ('medical',             'Medical'),
  ('pharmacy',            'Pharmacy'),
  ('supplements',         'Supplements'),
  ('therapy',             'Therapy'),
  -- Housing
  ('rent_mortgage',       'Rent / Mortgage'),
  ('property_tax',        'Property Tax'),
  ('home_maintenance',    'Home Maintenance'),
  ('hoa_fees',            'HOA Fees'),
  ('home_improvement',    'Home Improvement'),
  -- Income
  ('salary',              'Salary'),
  ('freelance',           'Freelance'),
  ('investment_income',   'Investment Income'),
  ('bonus',               'Bonus'),
  ('other_income',        'Other Income'),
  -- Savings & Investments
  ('emergency_fund',      'Emergency Fund'),
  ('retirement',          'Retirement'),
  ('stocks_etf',          'Stocks & ETFs'),
  ('tfsa',                'TFSA'),
  ('rrsp',                'RRSP'),
  -- Education
  ('tuition',             'Tuition'),
  ('books_supplies',      'Books & Supplies'),
  ('online_courses',      'Online Courses'),
  ('school_supplies',     'School Supplies'),
  ('student_loans',       'Student Loans'),
  -- Pets
  ('pet_food',            'Pet Food'),
  ('veterinary',          'Veterinary'),
  ('pet_grooming',        'Grooming'),
  ('pet_supplies',        'Pet Supplies'),
  ('pet_insurance',       'Pet Insurance'),
  -- Travel
  ('flights',             'Flights'),
  ('hotels_lodging',      'Hotels & Lodging'),
  ('travel_food',         'Food & Dining (Travel)'),
  ('travel_activities',   'Activities & Tours'),
  ('travel_transport',    'Local Transportation'),
  -- Miscellaneous
  ('gifts_given',         'Gifts Given'),
  ('donations',           'Donations'),
  ('bank_fees',           'Bank Fees'),
  ('other_expense',       'Other'),
  -- Transfers
  ('account_transfer',    'Account Transfer'),
  ('credit_card_payment', 'Credit Card Payment')
) AS t(cat_key, display)
JOIN public.categories c ON c.key = t.cat_key;

-- ============================================================
-- 5. RLS note
-- ============================================================
-- categories and category_translations are system-level read-only data.
-- RLS is NOT added here because all authenticated users must read
-- the same system categories. Write access is restricted by:
-- 1. is_system = true flag (application-level enforcement)
-- 2. No INSERT/UPDATE/DELETE policies for regular users
-- User customization goes through user_category_overrides (already has RLS).
