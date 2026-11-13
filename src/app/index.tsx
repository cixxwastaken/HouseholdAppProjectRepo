import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { supabase, supabaseConfigError } from '../lib/supabase';
import { getMembership } from '../lib/api';
export default function Index() { const [to, setTo] = useState<string | null>(null); useEffect(() => { (async () => { if (supabaseConfigError) { setTo('/configuration-error'); return; } try { const { data } = await supabase.auth.getSession(); setTo(!data.session ? '/sign-in' : (await getMembership()) ? '/home' : '/onboarding'); } catch { setTo('/sign-in'); } })(); }, []); return to ? <Redirect href={to as any} /> : null; }
