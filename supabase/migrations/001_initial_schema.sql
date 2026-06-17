-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Expenses table
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  concept text not null default '',
  amount numeric(12, 2) not null default 0,
  date date not null,
  category text not null default 'General',
  status text not null default 'Pendiente',
  payment_type text,
  payment_method text,
  description text,
  credited_to text,
  created_at timestamptz default now()
);

-- Incomes table
create table if not exists incomes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  source text not null default '',
  amount numeric(12, 2) not null default 0,
  date date not null,
  status text not null default 'Pendiente',
  type text not null default 'Extra',
  description text,
  created_at timestamptz default now()
);

-- User preferences (categories, payment types, methods, statuses)
create table if not exists user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  categories text[] default array['General','Recurrente','Bancos','Alimentación','Transporte','Servicios','Ocio'],
  payment_types text[] default array['Pago mínimo','Pago total','Pago parcial','Pago extraordinario'],
  payment_methods text[] default array['Efectivo','Tarjeta','Transferencia'],
  statuses text[] default array['Completado','Pendiente','Atrasado'],
  updated_at timestamptz default now()
);

-- Row Level Security (each user only sees their own data)
alter table expenses enable row level security;
alter table incomes enable row level security;
alter table user_preferences enable row level security;

create policy "Users can manage their own expenses"
  on expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their own incomes"
  on incomes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their own preferences"
  on user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
