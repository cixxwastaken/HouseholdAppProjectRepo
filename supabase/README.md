# Deploying the backend

1. Copy `.env.example` to `.env` and provide the project URL and **publishable** key.
2. Run `supabase link --project-ref <ref>` and `supabase db push`.
3. Deploy `enroll-household` and `send-reminders` with `supabase functions deploy <name> --no-verify-jwt`.
4. Configure a `pg_cron`/`pg_net` schedule for `send-reminders` using a Vault-held secret, following [Supabase scheduling docs](https://supabase.com/docs/guides/functions/schedule-functions). Do not use a publishable key for scheduler authorization.
5. Configure FCM and APNs credentials in EAS, then use a development build (not Expo Go on Android) to test remote notifications.
