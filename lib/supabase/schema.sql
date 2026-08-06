-- ============================================================================
-- Portfolio 2.0 — Supabase schema
-- Paste this into the Supabase SQL Editor to create the tables.
-- ============================================================================

-- Blog posts (markdown content stored as plain text)
create table if not exists blog_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  date          date not null default current_date,
  excerpt       text not null default '',
  tags          jsonb not null default '[]'::jsonb,
  cover_image   text,
  content       text not null default '',
  reading_time  integer not null default 1,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_blog_posts_date on blog_posts (date desc);
create index idx_blog_posts_published on blog_posts (published) where published = true;


-- Projects (with nested thinking/results stored as jsonb)
create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  tagline       text not null default '',
  description   text not null default '',
  technologies  jsonb not null default '[]'::jsonb,
  year          text not null,
  cover_image   text,
  live_url      text,
  repo_url      text,
  featured      boolean not null default false,
  thinking      jsonb not null default '[]'::jsonb,
  results       jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_projects_featured on projects (featured) where featured = true;


-- Education history
create table if not exists education (
  id            uuid primary key default gen_random_uuid(),
  institution   text not null,
  degree        text not null,
  field         text not null default '',
  start_date    text not null,
  end_date      text not null,
  description   text not null default '',
  highlights    jsonb not null default '[]'::jsonb,
  gpa           text,
  courses       jsonb not null default '[]'::jsonb,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_education_order on education (sort_order);


-- Activities / involvements
create table if not exists activities (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  organization  text not null,
  type          text not null check (type in ('program', 'ambassadorship', 'involvement')),
  start_date    text not null,
  end_date      text,
  description   text not null default '',
  contributions jsonb not null default '[]'::jsonb,
  takeaway      text,
  image         text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_activities_order on activities (sort_order);


-- Certificates / credentials
create table if not exists certificates (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  issuer        text not null,
  date          date not null,
  description   text,
  image         text,
  url           text not null,
  credential_id text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_certificates_order on certificates (sort_order);


-- ============================================================================
-- Row-Level Security — enable public read, authenticated write
-- ============================================================================

alter table blog_posts enable row level security;
alter table projects enable row level security;
alter table education enable row level security;
alter table activities enable row level security;
alter table certificates enable row level security;

-- Public read access
create policy "Public can read published blog posts"
  on blog_posts for select using (published = true);

create policy "Public can read projects"
  on projects for select using (true);

create policy "Public can read education"
  on education for select using (true);

create policy "Public can read activities"
  on activities for select using (true);

-- Authenticated full access (use the Supabase dashboard to manage content)
create policy "Authenticated users can manage blog posts"
  on blog_posts for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage projects"
  on projects for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage education"
  on education for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage activities"
  on activities for all using (auth.role() = 'authenticated');

create policy "Public can read certificates"
  on certificates for select using (true);

create policy "Authenticated users can manage certificates"
  on certificates for all using (auth.role() = 'authenticated');
