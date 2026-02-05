-- Templates Table for The Laboratory
create table templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null default 'Untitled Draft',
  html_content text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Secure it (RLS)
alter table templates enable row level security;

-- Policy: Users can only see/edit their own templates
create policy "Users can CRUD their own templates" 
on templates for all 
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Auto-update 'updated_at' column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_templates_updated_at
before update on templates
for each row execute procedure update_updated_at_column();
