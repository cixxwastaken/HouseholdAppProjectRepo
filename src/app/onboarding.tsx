import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton, Card, Input, Screen } from '../components/Screen';
import { createHousehold, joinWithCode } from '../lib/api';

export default function Onboarding() {
  const [name, setName] = useState(''); const [code, setCode] = useState(''); const [busy, setBusy] = useState(false);
  const run = async (work: () => Promise<unknown>, message: string) => { try { setBusy(true); await work(); router.replace('/home'); } catch (error) { Alert.alert(message, error instanceof Error ? error.message : 'Try again.'); } finally { setBusy(false); } };
  return <Screen eyebrow="Welcome" title="Make a homebase"><Text style={s.intro}>Start a fresh shared space, or join the household that is waiting for you.</Text><Card title="Create your household" accent="#1F6B59"><Text style={s.copy}>You’ll be its administrator—able to invite, organise, and keep everyone in sync.</Text><Input label="Household name" value={name} onChangeText={setName} placeholder="The Smith home"/><AppButton title={busy ? 'Creating…' : 'Create household'} disabled={busy || !name.trim()} onPress={() => void run(() => createHousehold(name.trim()), 'Could not create household')}/></Card><View style={s.divider}><View style={s.line}/><Text style={s.or}>or</Text><View style={s.line}/></View><Card title="Join an existing home"><Text style={s.copy}>Ask an administrator for the current join code.</Text><Input label="Join code" value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="ABC-123"/><AppButton title="Join household" tone="secondary" disabled={busy || !code.trim()} onPress={() => void run(() => joinWithCode(code.trim()), 'Could not join household')}/></Card></Screen>;
}
const s = StyleSheet.create({ intro: { color: '#4C5E57', fontSize: 17, lineHeight: 25, marginBottom: 2 }, copy: { color: '#61716B', lineHeight: 20 }, divider: { flexDirection: 'row', alignItems: 'center', gap: 11 }, line: { flex: 1, height: 1, backgroundColor: 'rgba(58,92,79,.16)' }, or: { color: '#76837D', fontWeight: '700', fontSize: 13 } });
