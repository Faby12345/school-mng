-- Core school data model from ARCHITECTURE.md and PRODUCT.md.
-- Every record is owned by an authenticated Supabase user and protected by RLS.

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (name = btrim(name) and length(name) > 0),
  icon text not null check (length(btrim(icon)) > 0),
  color_token text not null check (length(btrim(color_token)) > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjects_id_user_id_key unique (id, user_id)
);

create unique index subjects_user_name_key
on public.subjects (user_id, lower(name));

create index subjects_user_sort_order_idx
on public.subjects (user_id, sort_order, name);

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null,
  value smallint not null check (value between 1 and 10),
  assessment_type text not null check (length(btrim(assessment_type)) > 0),
  graded_on date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grades_subject_owner_fkey
    foreign key (subject_id, user_id)
    references public.subjects (id, user_id)
    on delete cascade,
  constraint grades_id_user_id_key unique (id, user_id)
);

create index grades_user_subject_date_idx
on public.grades (user_id, subject_id, graded_on desc);

create table public.homework (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid,
  title text not null check (length(btrim(title)) > 0),
  details text,
  due_at timestamptz not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  completed_at timestamptz,
  reminder_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homework_subject_owner_fkey
    foreign key (subject_id, user_id)
    references public.subjects (id, user_id)
    on delete set null (subject_id),
  constraint homework_id_user_id_key unique (id, user_id)
);

create index homework_user_due_idx
on public.homework (user_id, due_at);

create index homework_user_completed_due_idx
on public.homework (user_id, completed_at, due_at);

create index homework_user_subject_idx
on public.homework (user_id, subject_id);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null,
  title text not null check (length(btrim(title)) > 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_subject_owner_fkey
    foreign key (subject_id, user_id)
    references public.subjects (id, user_id)
    on delete cascade,
  constraint lessons_id_user_id_key unique (id, user_id)
);

create index lessons_user_subject_updated_idx
on public.lessons (user_id, subject_id, updated_at desc);

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null,
  question text not null check (length(btrim(question)) > 0),
  answer text not null check (length(btrim(answer)) > 0),
  source text not null check (source in ('manual', 'generated')),
  next_review_at timestamptz not null default now(),
  interval_days integer not null default 0 check (interval_days >= 0),
  ease_score numeric not null default 2.0 check (ease_score > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flashcards_lesson_owner_fkey
    foreign key (lesson_id, user_id)
    references public.lessons (id, user_id)
    on delete cascade,
  constraint flashcards_id_user_id_key unique (id, user_id)
);

create index flashcards_user_lesson_idx
on public.flashcards (user_id, lesson_id);

create index flashcards_user_next_review_idx
on public.flashcards (user_id, next_review_at);

create table public.study_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id uuid not null,
  rating text not null check (rating in ('again', 'hard', 'known')),
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_reviews_flashcard_owner_fkey
    foreign key (flashcard_id, user_id)
    references public.flashcards (id, user_id)
    on delete cascade
);

create index study_reviews_user_flashcard_date_idx
on public.study_reviews (user_id, flashcard_id, reviewed_at desc);

-- Included now so enabling the documented post-MVP Web Push feature will not
-- require an ad-hoc schema change. It remains unused by the MVP application.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null check (length(btrim(endpoint)) > 0),
  p256dh text not null check (length(btrim(p256dh)) > 0),
  auth text not null check (length(btrim(auth)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_subscriptions_user_endpoint_key unique (user_id, endpoint)
);

create index push_subscriptions_user_idx
on public.push_subscriptions (user_id);

-- Keep updated_at trustworthy even when writes do not come from Next.js.
create trigger subjects_set_updated_at
before update on public.subjects
for each row execute function public.set_updated_at();

create trigger grades_set_updated_at
before update on public.grades
for each row execute function public.set_updated_at();

create trigger homework_set_updated_at
before update on public.homework
for each row execute function public.set_updated_at();

create trigger lessons_set_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

create trigger flashcards_set_updated_at
before update on public.flashcards
for each row execute function public.set_updated_at();

create trigger study_reviews_set_updated_at
before update on public.study_reviews
for each row execute function public.set_updated_at();

create trigger push_subscriptions_set_updated_at
before update on public.push_subscriptions
for each row execute function public.set_updated_at();

alter table public.subjects enable row level security;
alter table public.grades enable row level security;
alter table public.homework enable row level security;
alter table public.lessons enable row level security;
alter table public.flashcards enable row level security;
alter table public.study_reviews enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "Users manage their own subjects"
on public.subjects
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own grades"
on public.grades
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own homework"
on public.homework
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own lessons"
on public.lessons
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own flashcards"
on public.flashcards
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own study reviews"
on public.study_reviews
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own push subscriptions"
on public.push_subscriptions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.subjects from anon;
revoke all on table public.grades from anon;
revoke all on table public.homework from anon;
revoke all on table public.lessons from anon;
revoke all on table public.flashcards from anon;
revoke all on table public.study_reviews from anon;
revoke all on table public.push_subscriptions from anon;

grant select, insert, update, delete on table public.subjects to authenticated;
grant select, insert, update, delete on table public.grades to authenticated;
grant select, insert, update, delete on table public.homework to authenticated;
grant select, insert, update, delete on table public.lessons to authenticated;
grant select, insert, update, delete on table public.flashcards to authenticated;
grant select, insert, update, delete on table public.study_reviews to authenticated;
grant select, insert, update, delete on table public.push_subscriptions to authenticated;

