-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create API Keys Table (If not exists)
create table if not exists api_keys (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  created_at timestamptz default now() not null,
  last_used_at timestamptz,
  is_active boolean default true not null
);

-- Index for fast lookup by hash
create index if not exists idx_api_keys_hash on api_keys(key_hash);
create index if not exists idx_api_keys_user on api_keys(user_id);

-- RLS for API Keys
alter table api_keys enable row level security;

create policy "Users can view their own keys"
  on api_keys for select
  using (auth.uid() = user_id);

create policy "Users can insert their own keys"
  on api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own keys"
  on api_keys for delete
  using (auth.uid() = user_id);

-- 2. Create Usage Logs Table
create table if not exists usage_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  key_id uuid references api_keys(id) on delete set null,
  endpoint text not null,
  method text not null,
  status_code int not null,
  duration_ms int not null,
  ip_address text,
  cost numeric default 0,
  created_at timestamptz default now() not null
);

-- Indexes for Analytics
create index if not exists idx_usage_logs_user on usage_logs(user_id);
create index if not exists idx_usage_logs_created on usage_logs(created_at);

-- RLS for Logs
alter table usage_logs enable row level security;

create policy "Users can view their own logs"
  on usage_logs for select
  using (auth.uid() = user_id);

-- Note: Service Role will insert logs, so no insert policy needed for authenticated users typically. 
-- However, we can add one just in case we do client-side logging (unlikely for usage).
