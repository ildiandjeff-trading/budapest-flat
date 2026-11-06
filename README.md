# Jildi's Budapest Flat

A web-first app to track who's staying at the flat and give guests everything they need.

- `/` animated intro
- `/calendar` month calendar with stay bars, "right now" card and upcoming list
- `/guide` guest guide (owners can edit)
- `/login` one shared password for everyone

Stack: Next.js 15, Tailwind 4, Framer Motion, Supabase, Vercel.

Without Supabase env vars the app runs in **demo mode** (data saved in the browser).
To connect Supabase, run `supabase/migrations/0001_init.sql`, add the shared account email to `members`, and set the vars in `.env.example`.
