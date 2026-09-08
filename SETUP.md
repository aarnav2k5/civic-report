# CivicReport setup

CivicReport uses Supabase as the primary backend. SQLite remains only as a local fallback when `DATABASE_URL` is absent.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Fill the Supabase variables in `.env.local`.
3. Run `npm install` and `npm run dev`.
4. Create a user in Supabase Authentication, set its `app_metadata.role` to `admin`, and open `/login` for the operations console.

## Production services

- `DATABASE_URL`: copy the Supabase Session Pooler connection string from **Connect**. The app creates its tables and indexes on first use.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: copy these from **Project Settings → API**.
- `SUPABASE_SERVICE_ROLE_KEY`: copy the server-only service role key from **Project Settings → API**. Never expose or commit this key.
- `SUPABASE_STORAGE_BUCKET`: leave it as `issue-images`; the app creates the public bucket automatically on the first upload.
- Email: intentionally not required. Reports and status changes are persisted in Supabase and visible in the application.
- Address lookup: the default Nominatim endpoint is suitable for low-volume development only. For production traffic, use a paid geocoder and set `NOMINATIM_BASE_URL` and a descriptive `NOMINATIM_USER_AGENT`.

## Roles

Public residents can submit and browse reports. Only authenticated `staff` and `admin` users can update status or assignments. Authentication sessions are handled by Supabase Auth. Create staff users in Supabase Authentication and add `{"role":"staff"}` to their `app_metadata`; keep display fields such as `department` and `full_name` in `user_metadata`.

## Before launch

Set a real domain, HTTPS, database backups, error monitoring, rate limiting/WAF on public APIs, and a reviewed user-provisioning flow. Do not use the local SQLite fallback or the Nominatim default endpoint for a public high-volume deployment.
