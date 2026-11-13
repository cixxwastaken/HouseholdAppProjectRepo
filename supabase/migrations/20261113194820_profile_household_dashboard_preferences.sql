-- Profile and personal dashboard settings. Review and apply only after testing
-- against a non-production project.
alter table public.profiles
  add column if not exists bio text check (char_length(bio) <= 280),
  add column if not exists avatar_path text,
  add column if not exists dashboard_widgets jsonb not null default '["chores","events","shopping"]'::jsonb;

create table if not exists public.spotify_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  track_name text,
  artist_name text,
  album_art_url text,
  is_playing boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.spotify_presence enable row level security;

create policy "household members read spotify presence"
on public.spotify_presence for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.memberships viewer
    join public.memberships owner on owner.household_id = viewer.household_id
    where viewer.user_id = auth.uid() and owner.user_id = spotify_presence.user_id
  )
);

-- Only trusted server-side code may refresh Spotify presence. Clients never
-- receive or persist Spotify access tokens.
revoke insert, update, delete on public.spotify_presence from anon, authenticated;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', false)
on conflict (id) do nothing;

create policy "users upload their own profile avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users update their own profile avatar"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "household members read profile avatars"
on storage.objects for select to authenticated
using (
  bucket_id = 'profile-avatars'
  and exists (
    select 1
    from public.memberships viewer
    join public.memberships owner on owner.household_id = viewer.household_id
    where viewer.user_id = auth.uid()
      and owner.user_id = (storage.foldername(name))[1]::uuid
  )
);

create policy "users delete their own profile avatar"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
