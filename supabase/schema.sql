-- Flawed Hero database. Apply once to the flawed-hero Supabase project.
-- Controlled access: people register, then Michael (admin) or Phil (super user) approve them.

create table public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  email text,
  name text not null default '',
  phone text, address text,
  kin_name text, kin_relationship text, kin_phone text,
  hero_story text,
  hero_story_choice text check (hero_story_choice in ('own','rework')),
  photo_path text,
  role text not null default 'member' check (role in ('admin','super','member')),
  status text not null default 'pending' check (status in ('pending','approved','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.requests (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  author_name text not null default '',
  title text not null check (char_length(title) between 3 and 120),
  body text check (char_length(body) <= 1000),
  status text not null default 'suggested' check (status in ('suggested','accepted','planned','building','done','denied','later')),
  priority int check (priority between 1 and 99),
  reply text check (char_length(reply) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Who is asking? (security definer so policies can use them without recursion)
create function public.my_status() returns text language sql stable security definer set search_path = public
  as $$ select status from public.profiles where user_id = auth.uid() $$;
create function public.my_role() returns text language sql stable security definer set search_path = public
  as $$ select role from public.profiles where user_id = auth.uid() and status = 'approved' $$;
create function public.is_approved() returns boolean language sql stable security definer set search_path = public
  as $$ select coalesce(public.my_status() = 'approved', false) $$;
create function public.is_staff() returns boolean language sql stable security definer set search_path = public
  as $$ select coalesce(public.my_role() in ('admin','super'), false) $$;
create function public.is_admin() returns boolean language sql stable security definer set search_path = public
  as $$ select coalesce(public.my_role() = 'admin', false) $$;

-- New sign-ups get a pending profile automatically
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Requests: the server fixes the author, name and starting status, so none can be faked
create function public.request_defaults() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.user_id := auth.uid();
  new.author_name := coalesce((select name from public.profiles where user_id = auth.uid()), '');
  new.status := 'suggested'; new.priority := null; new.reply := null;
  return new;
end $$;
create trigger requests_defaults before insert on public.requests for each row execute function public.request_defaults();

-- Approve / block / change role. Staff may approve and block; only the admin may change roles.
create function public.set_member(p_user uuid, p_status text, p_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Not allowed'; end if;
  if p_role is not null and not public.is_admin() then raise exception 'Only the admin can change roles'; end if;
  if p_status is not null and p_status not in ('pending','approved','blocked') then raise exception 'Bad status'; end if;
  if p_role is not null and p_role not in ('admin','super','member') then raise exception 'Bad role'; end if;
  if p_user = auth.uid() and ((p_status is not null and p_status <> 'approved') or p_role is not null) then
    raise exception 'You cannot change your own access';
  end if;
  update public.profiles set status = coalesce(p_status, status), role = coalesce(p_role, role), updated_at = now() where user_id = p_user;
end $$;
revoke all on function public.set_member(uuid, text, text) from public, anon;
grant execute on function public.set_member(uuid, text, text) to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.request_defaults() from public, anon, authenticated;
revoke all on function public.my_status() from public, anon;
revoke all on function public.my_role() from public, anon;
revoke all on function public.is_approved() from public, anon;
revoke all on function public.is_staff() from public, anon;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.my_status(), public.my_role(), public.is_approved(), public.is_staff(), public.is_admin() to authenticated;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.requests enable row level security;

create policy "own profile or staff" on public.profiles for select to authenticated using (user_id = auth.uid() or public.is_staff());
-- Members edit only their own contact details; status and role can never be touched from the app
create policy "edit own profile" on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke all on public.profiles from anon;
revoke insert, delete, update on public.profiles from authenticated;
grant update (name, phone, address, kin_name, kin_relationship, kin_phone, hero_story, hero_story_choice, photo_path, updated_at) on public.profiles to authenticated;

create policy "approved read queue" on public.requests for select to authenticated using (public.is_approved());
create policy "approved suggest" on public.requests for insert to authenticated with check (public.is_approved());
create policy "admin manage queue" on public.requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete queue" on public.requests for delete to authenticated using (public.is_admin());
revoke all on public.requests from anon;
revoke update on public.requests from authenticated;
grant update (status, priority, reply, updated_at) on public.requests to authenticated;

-- Photos: private bucket, each person writes only inside their own folder; approved members can view
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 1048576, array['image/jpeg','image/png','image/webp']) on conflict (id) do nothing;
create policy "avatars read" on storage.objects for select to authenticated using (bucket_id = 'avatars' and (public.is_approved() or (storage.foldername(name))[1] = auth.uid()::text));
create policy "avatars insert own" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars update own" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars delete own" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Useful Contacts: visible to approved members, managed by the admin
create table public.contacts (
  id bigint generated always as identity primary key,
  name text not null, role text, phone text, email text,
  sort int not null default 100,
  created_at timestamptz not null default now()
);
alter table public.contacts enable row level security;
create policy "approved read contacts" on public.contacts for select to authenticated using (public.is_approved());
create policy "admin manage contacts" on public.contacts for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.contacts from anon;
-- Seed (see the live table for the current list): Phil Roberton first (sort 10), Michael Broadbent, app developer (sort 90)
