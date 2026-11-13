import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Expo inlines only statically referenced EXPO_PUBLIC_* variables. Do not use
// bracket notation or a dynamic helper here, otherwise cloud builds omit them.
const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || null;
const configuredKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || null;
let configError: string | null = null;

if (!configuredUrl || !configuredKey) {
  configError = 'Supabase connection details are missing from this build.';
} else {
  try {
    const parsed = new URL(configuredUrl);
    if (parsed.protocol !== 'https:') throw new Error('not HTTPS');
  } catch {
    configError = 'The Supabase project URL in this build is invalid.';
  }

  if (!configuredKey.startsWith('sb_publishable_')) {
    configError = 'The Supabase publishable key in this build is invalid.';
  }
}

// A placeholder client lets the app render a useful diagnostic screen when a
// cloud build is misconfigured instead of terminating during module startup.
const url = configuredUrl ?? 'https://configuration-missing.invalid';
const key = configuredKey ?? 'sb_publishable_configuration_missing';
export const supabaseConfigError = configError;
const storage = { getItem: (name: string) => SecureStore.getItemAsync(name), setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value), removeItem: (name: string) => SecureStore.deleteItemAsync(name) };
export const supabase = createClient(url, key, { auth: { storage: Platform.OS === 'web' ? undefined : storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } });
if (Platform.OS !== 'web') AppState.addEventListener('change', (state) => state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh());
