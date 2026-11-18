-- Links saved on /stash. The site server reads and writes this table with the secret key;
-- RLS is on with no policies, so the public anon key gets nothing.
create table public.stash_items (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  kind text not null check (kind in ('recipe', 'product', 'article', 'place', 'video', 'other')),
  title text not null,
  summary text not null default '',
  site text not null default '',
  image text,
  -- { facts: [{ label, value }], list_title, list: [] }, as Claude returns it
  details jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  remind boolean not null default true,
  last_reminded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.stash_items enable row level security;

comment on table public.stash_items is 'Links saved on borysbabas.dev/stash. Accessed only by the site server with the secret key.';

-- The daily reminder job only ever looks at cards that still want reminding
create index stash_items_due_idx on public.stash_items (created_at) where remind;

-- Sign-in attempts since the last successful one, for the lockout on /api/stash/login
create table public.stash_login_attempts (
  id bigint generated always as identity primary key,
  at timestamptz not null default now()
);

alter table public.stash_login_attempts enable row level security;

comment on table public.stash_login_attempts is 'Sign-in attempts on borysbabas.dev/stash since the last successful one, for the lockout. Accessed only by the site server with the secret key.';

create index stash_login_attempts_at_idx on public.stash_login_attempts (at);
