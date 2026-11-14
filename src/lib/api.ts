import { supabase } from './supabase';
import type { DashboardData, DashboardWidget, HouseholdRole, Membership, Profile, RecurrenceRule } from './types';
const unwrap = <T = any>(result: any): T => { if (result.error) throw new Error(result.error.message); return result.data as T; };
export const auth = { signIn: async (email: string, password: string) => unwrap(await supabase.auth.signInWithPassword({ email, password })), signUp: async (email: string, password: string) => unwrap(await supabase.auth.signUp({ email, password })), signOut: async () => unwrap(await supabase.auth.signOut()) };
export async function getMembership(): Promise<Membership | null> { const { data: { user } } = await supabase.auth.getUser(); if (!user) return null; const row = unwrap(await supabase.from('memberships').select('household_id,role').eq('user_id', user.id).maybeSingle() as any) as any; if (!row) return null; const profile = unwrap(await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle() as any) as { display_name: string | null } | null; return { household_id: row.household_id, role: row.role, display_name: profile?.display_name ?? null }; }
// Do not request a RETURNING row here: the admin membership is created by an
// after-insert trigger, and RLS correctly prevents reading the household until
// that membership exists. The caller refreshes its membership after success.
export const createHousehold = async (name: string) => unwrap(await supabase.from('households').insert({ name }) as any);
export const joinWithCode = async (code: string) => unwrap(await supabase.functions.invoke('enroll-household', { body: { code } }) as any);
export const redeemInvite = async (inviteToken: string) => unwrap(await supabase.functions.invoke('enroll-household', { body: { inviteToken } }) as any);
const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = ['chores', 'events', 'shopping'];

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await supabase
    .from('profiles')
    .select('id,display_name,bio,avatar_path,dashboard_widgets')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile.error) return profile.data as Profile | null;

  // Newer profile preferences are optional until their version-controlled
  // migration is applied. Keep existing installations usable in the meantime.
  const missingOptionalColumn =
    ['bio', 'avatar_path', 'dashboard_widgets'].some((column) => profile.error?.message.includes(column)) &&
    /column|schema cache|does not exist|could not find/i.test(profile.error.message);
  if (!missingOptionalColumn) throw new Error(profile.error.message);

  const legacy = await supabase
    .from('profiles')
    .select('id,display_name')
    .eq('id', user.id)
    .maybeSingle();
  if (legacy.error) throw new Error(legacy.error.message);
  if (!legacy.data) return null;

  return {
    ...legacy.data,
    bio: null,
    avatar_path: null,
    dashboard_widgets: [...DEFAULT_DASHBOARD_WIDGETS],
  };
}
export async function saveProfile(input: Pick<Profile, 'display_name' | 'bio' | 'dashboard_widgets'>) { const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Sign in required'); return unwrap(await supabase.from('profiles').update(input).eq('id', user.id) as any); }
export async function uploadProfileAvatar(uri: string) { const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Sign in required'); const response = await fetch(uri); const file = await response.blob(); const path = user.id + '/avatar-' + Date.now() + '.jpg'; unwrap(await supabase.storage.from('profile-avatars').upload(path, file, { contentType: 'image/jpeg', upsert: false }) as any); return unwrap(await supabase.from('profiles').update({ avatar_path: path }).eq('id', user.id) as any); }
export const getHousehold = async (householdId: string) => unwrap(await supabase.from('households').select('id,name').eq('id', householdId).single() as any) as { id: string; name: string };
export const updateHousehold = async (id: string, name: string) => unwrap(await supabase.from('households').update({ name }).eq('id', id) as any);
export const createInvite = async (householdId: string, role: 'adult' | 'child') => unwrap(await supabase.functions.invoke('manage-household', { body: { action: 'createInvite', householdId, role, expiresInDays: 7 } }) as any) as { inviteToken: string; expiresAt: string; role: string };
export const rotateJoinCode = async (householdId: string) => unwrap(await supabase.functions.invoke('manage-household', { body: { action: 'rotateJoinCode', householdId } }) as any) as { code: string };
export async function getDashboard(householdId: string): Promise<DashboardData> { const now = new Date(); const tomorrow = new Date(now.getTime() + 86400000).toISOString(); const [chores, events, shopping] = await Promise.all([supabase.from('chore_occurrences').select('id,title,due_at,assignee_id,status').eq('household_id', householdId).eq('status','open').lte('due_at',tomorrow).order('due_at'),supabase.from('events').select('id,title,starts_at').eq('household_id',householdId).gte('starts_at',now.toISOString()).lt('starts_at',tomorrow).order('starts_at'),supabase.from('shopping_items').select('id,title,quantity,checked_at').eq('household_id',householdId).is('checked_at',null).order('created_at')]); return { chores: unwrap(chores as any) ?? [], events: unwrap(events as any) ?? [], shopping: unwrap(shopping as any) ?? [] }; }
export const getMembers = async (householdId: string) => { const rows = unwrap(await supabase.from('memberships').select('id,user_id,role').eq('household_id', householdId).order('joined_at') as any) as any[]; const userIds = rows.map((row) => row.user_id); const profiles = userIds.length ? unwrap(await supabase.from('profiles').select('id,display_name').in('id', userIds) as any) as any[] : []; const displayNames = new Map(profiles.map((profile) => [profile.id, profile.display_name])); return rows.map((row) => ({ id: row.id, user_id: row.user_id, role: row.role, display_name: displayNames.get(row.user_id) ?? null })); };
export const getOpenChores = async (householdId: string) => unwrap(await supabase.from('chore_occurrences').select('id,title,due_at,assignee_id,status').eq('household_id', householdId).eq('status', 'open').order('due_at') as any) as any;
export const getUpcomingEvents = async (householdId: string) => unwrap(await supabase.from('events').select('id,title,starts_at,ends_at,created_by,event_attendees(user_id)').eq('household_id', householdId).gte('ends_at', new Date().toISOString()).order('starts_at') as any) as any;
export const completeChore = async (occurrenceId: string) => unwrap(await supabase.from('chore_completions').insert({ occurrence_id: occurrenceId }).select().single() as any);
export const addShoppingItem = async (household_id: string, title: string, quantity?: string) => unwrap(await supabase.from('shopping_items').insert({ household_id, title, quantity: quantity || null }).select().single() as any);
export const toggleShoppingItem = async (id: string, checked: boolean) => unwrap(await supabase.from('shopping_items').update({ checked_at: checked ? new Date().toISOString() : null }).eq('id', id) as any);
export const createChore = async (input: { household_id: string; title: string; assignee_id?: string; due_at: string; recurrence?: RecurrenceRule }) => unwrap(await supabase.from('chores').insert({ household_id: input.household_id, title: input.title, assignee_id: input.assignee_id ?? null, recurrence: input.recurrence ?? null, next_due_at: input.due_at }).select().single() as any);
export const createEvent = async ({ attendee_ids, ...eventInput }: { household_id: string; title: string; starts_at: string; ends_at: string; attendee_ids: string[] }) => { const event = unwrap(await supabase.from('events').insert(eventInput).select('id').single() as any) as any; if (attendee_ids.length) unwrap(await supabase.from('event_attendees').insert(attendee_ids.map(user_id => ({ event_id: event.id, user_id }))) as any); return event; };
export const savePushToken = async (token: string, platform: string) => unwrap(await supabase.from('device_push_tokens').upsert({ token, platform, last_seen_at: new Date().toISOString() }, { onConflict: 'token' }) as any);
export const changeMemberRole = async (id: string, role: HouseholdRole) => unwrap(await supabase.from('memberships').update({ role }).eq('id',id) as any);
