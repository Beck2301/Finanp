-- ============================================================
-- Módulo de Tarjetas de Crédito — KBFinanzas
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Tabla de tarjetas de crédito
create table if not exists public.credit_cards (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  last_four   text,
  credit_limit decimal(12,2),
  cut_day     integer check (cut_day >= 1 and cut_day <= 31),
  payment_day integer check (payment_day >= 1 and payment_day <= 31),
  color       text default '#0073ea',
  created_at  timestamptz default now()
);

-- Tabla de compras con tarjeta de crédito
create table if not exists public.credit_card_purchases (
  id              uuid default gen_random_uuid() primary key,
  credit_card_id  uuid references public.credit_cards(id) on delete cascade not null,
  user_id         uuid references auth.users(id) on delete cascade not null,
  concept         text not null,
  amount          decimal(12,2) not null,
  date            text not null,
  category        text,
  description     text,
  paid            boolean default false,
  created_at      timestamptz default now()
);

-- Row Level Security
alter table public.credit_cards enable row level security;
create policy "Users manage own credit cards"
  on public.credit_cards for all
  using (auth.uid() = user_id);

alter table public.credit_card_purchases enable row level security;
create policy "Users manage own credit card purchases"
  on public.credit_card_purchases for all
  using (auth.uid() = user_id);
