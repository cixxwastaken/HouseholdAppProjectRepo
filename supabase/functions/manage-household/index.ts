// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

console.log("Hello from Functions!");

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    // Called by another service with a secret key
    // ctx.supabaseAdmin bypasses RLS — use for privileged operations
    /*
    if (ctx.authMode === "secret") {
      const { user_id } = await req.json();
      const { data } = await ctx.supabaseAdmin.auth.admin.getUserById(user_id);

      return Response.json({
        email: data?.user?.email,
      });
    }
    */

    const { name } = await req.json();

    return Response.json({
      message: `Hello ${name}!`,
    });
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/manage-household' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const hash = async (value: string) =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))))
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('');

const makeJoinCode = () => crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase();

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const authorization = request.headers.get('Authorization');
  if (!authorization) return Response.json({ error: 'Sign in required' }, { status: 401, headers: cors });

  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return Response.json({ error: 'Invalid session' }, { status: 401, headers: cors });

  const body = await request.json();
  const householdId = typeof body.householdId === 'string' ? body.householdId : '';
  if (!householdId) return Response.json({ error: 'Household is required' }, { status: 400, headers: cors });

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: membership } = await db.from('memberships').select('role').eq('household_id', householdId).eq('user_id', user.id).maybeSingle();
  if (membership?.role !== 'admin') return Response.json({ error: 'Only household admins can manage invitations.' }, { status: 403, headers: cors });

  if (body.action === 'rotateJoinCode') {
    const code = makeJoinCode();
    const { error } = await db.from('join_codes').upsert({ household_id: householdId, code_hash: await hash(code), rotated_by: user.id, rotated_at: new Date().toISOString() });
    if (error) return Response.json({ error: error.message }, { status: 400, headers: cors });
    return Response.json({ code }, { headers: cors });
  }

  if (body.action === 'createInvite') {
    const role = body.role === 'child' ? 'child' : 'adult';
    const days = Math.max(1, Math.min(Number(body.expiresInDays) || 7, 30));
    const token = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
    const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
    const { error } = await db.from('invite_links').insert({ household_id: householdId, token_hash: await hash(token), role, expires_at: expiresAt, created_by: user.id });
    if (error) return Response.json({ error: error.message }, { status: 400, headers: cors });
    return Response.json({ inviteToken: token, expiresAt, role }, { headers: cors });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers: cors });
});
