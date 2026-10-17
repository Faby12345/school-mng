-- Romanian middle-school grades are tracked across the full school year.
drop index if exists public.grades_user_semester_subject_idx;

alter table public.grades
drop column if exists semester;
