# Homebase

Expo + Supabase household management app. The first slice includes secure email/password auth, household enrollment, a Today dashboard, shared shopping, chores, events, role-aware RLS, and server-side reminder delivery.

## Local setup

1. Use a supported Node release for Expo SDK 58 (Node 24 or 26; this checkout was created under Node 25, which Expo does not support).
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in the Supabase URL and publishable key.
4. Follow [supabase/README.md](supabase/README.md) to apply the migration and deploy functions.
5. Run `npx expo start`.

Remote push notifications require an EAS development build with APNs/FCM credentials; Android Expo Go cannot receive them.

## Security model

Every household record is RLS-protected. Admins control membership and enrollment, adults manage shared content, and children can contribute shopping/calendar items and complete assigned chores. Enrollment and reminders use Edge Functions; no service-role secret is included in the app.
