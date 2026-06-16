-- SQL script to initialize user data persistence in Supabase
-- Run this in your Supabase SQL Editor:

create table if not exists public.bujo_user_data (
  user_id uuid references auth.users not null primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.bujo_user_data enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can manage their own data" on public.bujo_user_data;

-- Create policy to allow users to select, insert, and update their own data
create policy "Users can manage their own data"
  on public.bujo_user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
