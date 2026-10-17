-- Semester is selected explicitly because school calendar boundaries can vary.
alter table public.grades
add column semester smallint not null default 1
check (semester in (1, 2));

create index grades_user_semester_subject_idx
on public.grades (user_id, semester, subject_id, graded_on desc);

