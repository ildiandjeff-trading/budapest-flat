-- Hungarian versions of the guest guide (fall back to English when empty)
alter table public.guide_sections add column title_hu text, add column body_hu text;
