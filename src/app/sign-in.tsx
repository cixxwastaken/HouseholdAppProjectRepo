import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton, Card, Input, Screen } from '../components/Screen';
import { auth } from '../lib/api';

export default function SignIn() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const run = async (signup: boolean) => { try { setBusy(true); await (signup ? auth.signUp(email, password) : auth.signIn(email, password)); router.replace('/'); } catch (error) { Alert.alert('Could not continue', error instanceof Error ? error.message : 'Try again.'); } finally { setBusy(false); } };
  return <Screen eyebrow="Household, in sync" title="Homebase"><View style={s.hero}><View style={s.mark}><Text style={s.markText}>H</Text></View><Text style={s.lead}>The gentle way to keep a busy home moving together.</Text></View><Card><Input label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com"/><Input label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" placeholder="Your password"/><View style={s.actions}><AppButton title={busy ? 'One moment…' : 'Sign in'} disabled={busy || !email || !password} onPress={() => void run(false)}/><AppButton title="Create an account" tone="secondary" disabled={busy || !email || !password} onPress={() => void run(true)}/></View></Card><Text style={s.footnote}>Your household stays private. Sign in to see only the home you belong to.</Text></Screen>;
}
const s = StyleSheet.create({ hero: { gap: 13, paddingBottom: 4 }, mark: { width: 58, height: 58, borderRadius: 20, backgroundColor: '#1F6B59', alignItems: 'center', justifyContent: 'center', shadowColor: '#174B3E', shadowOpacity: .25, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 4 }, markText: { color: '#fff', fontSize: 27, fontWeight: '900' }, lead: { color: '#4C5E57', fontSize: 18, lineHeight: 27, maxWidth: 310 }, actions: { gap: 10, marginTop: 4 }, footnote: { color: '#61716B', fontSize: 13, lineHeight: 20, paddingHorizontal: 4 } });
