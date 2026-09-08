# CivicReport setup

CivicReport runs locally with the existing SQLite fallback, but production should use PostgreSQL and the configured integrations below.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `CIVIC_ADMIN_EMAIL` and `CIVIC_ADMIN_PASSWORD` to a long local password.
3. Run `npm install` and `npm run dev`.
4. Open `/login` for the operations console. The configured admin is provisioned automatically on the first sign-in.

## Production services

- `DATABASE_URL`: a PostgreSQL connection string. The app creates its tables and indexes on first use; run the app against a migration-reviewed database before opening access to users.
- S3-compatible object storage: create a private bucket, configure CORS for the deployed origin with `PUT` and `Content-Type`, and provide the S3 credentials plus a CDN/public object URL. Uploads use short-lived presigned URLs and issue rows store only the object URL.
- Resend: verify the sending domain, then set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. Report creation and status updates send notifications when these are configured.
- Address lookup: the default Nominatim endpoint is suitable for low-volume development only. For production traffic, use a paid geocoder and set `NOMINATIM_BASE_URL` and a descriptive `NOMINATIM_USER_AGENT`.

## Roles

Public residents can submit and browse reports. Only authenticated `staff` and `admin` users can update status or assignments. Admin/staff users are stored in PostgreSQL/SQLite sessions, not in the browser. The initial admin is bootstrapped from environment variables; additional staff provisioning should be added through your identity/admin workflow before launch.

## Before launch

Set a real domain, HTTPS, database backups, object-storage lifecycle/retention, error monitoring, rate limiting/WAF on public APIs, and a reviewed user-provisioning flow. Do not use the local SQLite fallback or the Nominatim default endpoint for a public high-volume deployment.
