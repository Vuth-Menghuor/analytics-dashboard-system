# Deploy CCUN Insights on Render

This repository contains a `render.yaml` Blueprint that creates two resources:

- `ccun-insights-web`: Nuxt frontend
- `ccun-insights-api`: Laravel API

The application PostgreSQL database is supplied through the `DB_URL` environment variable. This supports Neon, Supabase, or another managed PostgreSQL provider without requiring a second Render database.

The Moodle analytics database is deliberately **not** created by this Blueprint. It contains the project's source analytics data and must be migrated to, or made reachable from, Render separately.

## Deploy

1. Push this repository to GitHub, GitLab, or Bitbucket. Do not commit either `.env` file.
2. In the Render dashboard, select **New → Blueprint Instance**, connect the repository, and choose the branch containing `render.yaml`.
3. Render prompts for the variables marked `sync: false`. Use the values below after Render displays the service URLs:

| Service | Variable | Value |
| --- | --- | --- |
| API | `APP_URL` | API URL, e.g. `https://ccun-insights-api.onrender.com` |
| API | `CORS_ALLOWED_ORIGINS` | Frontend URL, e.g. `https://ccun-insights-web.onrender.com` |
| API | `DB_URL` | PostgreSQL connection string from Neon, e.g. `postgresql://user:password@host/database?sslmode=require` |
| API | `GOOGLE_CLIENT_ID` | Your Google OAuth web-client ID; leave empty only if registration with Google is disabled |
| API | `ANALYTICS_DB_*` | Host, database, username, password, and port for the Moodle analytics PostgreSQL database |
| Web | `NUXT_PUBLIC_API_BASE_URL` | API URL ending in `/api`, e.g. `https://ccun-insights-api.onrender.com/api` |
| Web | `NUXT_PUBLIC_GOOGLE_CLIENT_ID` | The same Google OAuth web-client ID used by the API |

4. After the first deployment, add both the frontend URL and any custom domain to the Google OAuth client's Authorized JavaScript origins. Add your sign-up page URL to its authorized redirect URIs if Google asks for one.
5. Verify `https://<api-url>/up`, open the frontend, then test registration/login, a dashboard chart, CSV export, and avatar upload.

## Important production notes

- The API runs database migrations automatically on startup. Keep it at one instance unless migrations are moved to Render's pre-deploy command.
- The database set in `DB_URL` holds Laravel users, sessions, cache, jobs, and application migrations. It is separate from `ANALYTICS_DB_*`.
- Avatar uploads use local storage by default. Render service filesystems are ephemeral, so uploaded avatars can disappear after a redeploy. Attach a persistent disk or switch the `public` disk to S3-compatible object storage before using uploads in production.
- Free services can spin down when idle and are unsuitable for a production school system. Use paid plans and database backups for a reliable deployment.
