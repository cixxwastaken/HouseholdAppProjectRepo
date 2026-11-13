import { useCallback, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as ImagePicker from 'expo-image-picker';
import { AppButton, Card, Input, Screen } from '../../components/Screen';
import { auth, getMembership, getProfile, saveProfile, uploadProfileAvatar } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import type { DashboardWidget, Membership } from '../../lib/types';
import { registerForPushNotifications } from '../../lib/notifications';

const widgetOptions: { key: DashboardWidget; label: string }[] = [{ key: 'chores', label: 'Chores' }, { key: 'events', label: 'Plans' }, { key: 'shopping', label: 'Shopping' }];

export default function Settings() {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [widgets, setWidgets] = useState<DashboardWidget[]>(['chores', 'events', 'shopping']);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setMembership(await getMembership());
    const profile = await getProfile();
    setDisplayName(profile?.display_name ?? ''); setBio(profile?.bio ?? ''); setWidgets(profile?.dashboard_widgets ?? ['chores', 'events', 'shopping']);
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const save = async () => { try { setBusy(true); await saveProfile({ display_name: displayName.trim() || null, bio: bio.trim() || null, dashboard_widgets: widgets }); Alert.alert('Profile saved', 'Your profile and Home dashboard are updated.'); } catch (error) { Alert.alert('Could not save profile', error instanceof Error ? error.message : 'Apply the profile migration first.'); } finally { setBusy(false); } };
  const choosePhoto = async () => { try { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.75 }); if (!result.canceled) { setBusy(true); await uploadProfileAvatar(result.assets[0].uri); Alert.alert('Profile picture saved'); } } catch (error) { Alert.alert('Could not save picture', error instanceof Error ? error.message : 'Apply the profile migration first.'); } finally { setBusy(false); } };
  const spotify = async () => { try { const redirectTo = 'homebase://settings'; const { data, error } = await supabase.auth.linkIdentity({ provider: 'spotify', options: { redirectTo } }); if (error) throw error; if (data?.url) await WebBrowser.openAuthSessionAsync(data.url, redirectTo); } catch (error) { Alert.alert('Spotify needs setup', 'Add Spotify client credentials and the Homebase redirect URL in Supabase Auth first. ' + (error instanceof Error ? error.message : '')); } };
  const signOut = async () => { try { setBusy(true); await auth.signOut(); router.replace('/'); } catch (error) { Alert.alert('Could not sign out', error instanceof Error ? error.message : 'Try again.'); } finally { setBusy(false); } };
  const toggle = (key: DashboardWidget) => setWidgets((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  return <Screen eyebrow="Your preferences" title="Settings">
    <Card title="Profile" accent="#8B78C9"><Input label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="How your household sees you" maxLength={80}/><Input label="Bio" value={bio} onChangeText={setBio} placeholder="A few words about you" maxLength={280} multiline/><AppButton title="Choose profile picture" tone="secondary" disabled={busy} onPress={() => void choosePhoto()}/></Card>
    <Card title="Home dashboard" accent="#E69D54"><Text style={s.copy}>Choose what appears on Home for this account.</Text>{widgetOptions.map((item) => <Pressable key={item.key} onPress={() => toggle(item.key)} style={s.row}><Text style={s.name}>{item.label}</Text><View style={[s.check, widgets.includes(item.key) && s.checked]}><Text style={s.tick}>{widgets.includes(item.key) ? '✓' : ''}</Text></View></Pressable>)}<AppButton title={busy ? 'Saving…' : 'Save profile & dashboard'} disabled={busy} onPress={() => void save()}/></Card>
    <Card title="Spotify" accent="#4792AE"><Text style={s.copy}>Link Spotify to show your current listening activity on your profile. Playback tokens stay server-side.</Text><AppButton title="Connect Spotify" tone="secondary" onPress={() => void spotify()}/></Card>
    <Card title="Notifications"><AppButton title="Enable reminders" tone="secondary" onPress={() => void registerForPushNotifications()}/></Card>
    <Card title="Account"><Text style={s.copy}>{membership ? 'Signed in as a ' + membership.role + '.' : 'Signed in to Homebase.'}</Text><AppButton title={busy ? 'Working…' : 'Sign out'} tone="quiet" disabled={busy} onPress={() => void signOut()}/></Card>
  </Screen>;
}
const s = StyleSheet.create({ copy: { color: '#607078', lineHeight: 21 }, hint: { color: '#75827D', fontSize: 13, lineHeight: 18 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(48,81,68,.12)' }, name: { color: '#21342D', fontSize: 15, fontWeight: '800' }, check: { width: 25, height: 25, borderRadius: 9, borderWidth: 1, borderColor: '#AAB8B1', alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: '#1F6B59', borderColor: '#1F6B59' }, tick: { color: 'white', fontWeight: '900' } });
