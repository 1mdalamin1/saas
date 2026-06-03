-- Supabase project: zxfoqkwihalntaytpxfn (Driving Instructor)
-- Applied via migrations. Re-run only on a fresh project.

-- ========== Profiles ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_id serial unique,
  full_name text,
  avatar_url text,
  phone text,
  address text,
  age integer check (age is null or (age >= 1 and age <= 150)),
  gender text check (
    gender is null
    or gender in ('male', 'female', 'other', 'prefer_not_to_say')
  ),
  twitter_url text,
  linkedin_url text,
  instagram_url text,
  facebook_url text,
  website_url text,
  hourly_rate numeric(10,2) not null default 42,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== Instructor app data ==========
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  phone text not null default '',
  theory_passed boolean not null default false,
  status text not null default 'Active'
    check (status in ('Active', 'Passed', 'Cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'Booked'
    check (status in ('Booked', 'Completed', 'No-show')),
  notes text not null default ''
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  amount numeric(10,2) not null,
  status text not null default 'Due'
    check (status in ('Paid', 'Due')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  student_id uuid primary key references public.students (id) on delete cascade,
  instructor_id uuid not null references auth.users (id) on delete cascade,
  skills jsonb not null default '[]'::jsonb,
  last_updated timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  youtube_url text not null default '',
  category text not null default '',
  description text not null default ''
);

-- RLS: instructor_id = auth.uid() on all app tables (see migrations)

-- Demo data: authenticated users call seed_demo_data() when they have no students
