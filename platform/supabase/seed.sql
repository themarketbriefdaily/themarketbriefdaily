-- Seed default content config. Safe to re-run.

insert into public.paywall_rules (key, section, description, required_tier) values
  ('research.archive',    'Research',  'Full research archive & long-form briefs', 'pro'),
  ('research.daily',      'Research',  'Daily brief',                              'free'),
  ('portfolios.summary',  'Portfolios','Performance summaries',                    'free'),
  ('portfolios.holdings', 'Portfolios','Holdings & attribution',                   'pro'),
  ('markets.headline',    'Markets',   'Headline indicators & ticker',             'free'),
  ('markets.history',     'Markets',   'Full indicator history & curve',           'pro'),
  ('learn.library',       'Learn',     'Education library',                        'free'),
  ('learn.questionbank',  'Learn',     'CFA & Quant question bank',                'pro'),
  ('tools.dcf',           'Tools',     'DCF & bond-yield tools',                   'pro'),
  ('data.api',            'Data',      'Indicator data API',                       'institutional')
on conflict (key) do nothing;

insert into public.indicator_sources (key, label, provider, series_id, required_tier) values
  ('cpi',      'US CPI (YoY)',      'fred',  'CPIAUCSL', 'free'),
  ('core',     'US Core CPI (YoY)', 'fred',  'CPILFESL', 'free'),
  ('fedfunds', 'Fed Funds Rate',    'fred',  'FEDFUNDS', 'free'),
  ('unrate',   'Unemployment',      'fred',  'UNRATE',   'free'),
  ('ust10',    'UST 10Y',           'fred',  'DGS10',    'free')
on conflict (key) do nothing;

insert into public.courses (slug, title, description, required_tier) values
  ('cfa-l1', 'CFA Level 1 Question Bank', 'Exam-style questions across all 10 topic areas.', 'pro'),
  ('quant',  'Quant Trader Course',      'Signal construction, backtesting, risk and execution.', 'pro')
on conflict (slug) do nothing;

-- To make yourself an admin after signing up, run:
--   update public.profiles set role = 'admin' where email = 'you@themarketbriefdaily.com';
