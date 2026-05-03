-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  full_name text,
  role text default 'driver',
  company_name text,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  foreign key (id) references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create RLS policies
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Create function to handle new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, company_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'driver'),
    coalesce(new.raw_user_meta_data->>'company_name', '')
  );
  return new;
end;
$$;

-- Create trigger for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
