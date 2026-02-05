-- Enable Row Level Security
create table usage_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  request_count int default 0,
  last_request_at timestamp with time zone default now(),
  tier text default 'free',
  created_at timestamp with time zone default now()
);

alter table usage_metrics enable row level security;

-- Allow users to read their own usage
create policy "Users can view their own usage" 
on usage_metrics for select 
using (auth.uid() = user_id);

-- Allow server (service_role) to update usage
create policy "Service role can update usage" 
on usage_metrics for all 
using (true) 
with check (true);

-- Function to handle new user signup (auto-create usage row)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.usage_metrics (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on new user creation
-- Trigger the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. API Keys Table (The Vault)
create table api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  key_hash text not null,               -- Storing SHA-256 hash (never plain text)
  key_prefix text not null,             -- First 7 chars for UI (sk_live_...)
  label text default 'API Key',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_used_at timestamp with time zone
);

-- Enable RLS for API Keys
alter table api_keys enable row level security;

-- Users can view their own keys
create policy "Users can view own api keys"
  on api_keys for select
  using ( auth.uid() = user_id );

-- Users can delete their own keys
create policy "Users can delete own api keys"
  on api_keys for delete
  using ( auth.uid() = user_id );

-- Users can insert their own keys (via server action)
create policy "Users can insert own api keys"
  on api_keys for insert
  with check ( auth.uid() = user_id );
