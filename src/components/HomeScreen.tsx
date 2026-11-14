import { useCallback, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton, Card, Screen, SectionLink } from './Screen';
import { completeChore, getDashboard, getMembership, getProfile } from '../lib/api';
import type { DashboardData, DashboardWidget, Membership } from '../lib/types';
import { registerForPushNotifications } from '../lib/notifications';

export default function HomeScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [member, setMember] = useState<Membership | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(['chores', 'events', 'shopping']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const current = await getMembership();
      setMember(current);
      if (!current) {
        setData(null);
        return;
      }

      const [profile, dashboard] = await Promise.all([
        getProfile(),
        getDashboard(current.household_id),
      ]);
      setWidgets(profile?.dashboard_widgets ?? ['chores', 'events', 'shopping']);
      setData(dashboard);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your household right now.');
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  if (loading) return <Screen eyebrow="Homebase" title="Today"><View style={s.loading}><ActivityIndicator size="large" color="#1F6B59" /><Text style={s.empty}>Loading your household…</Text></View></Screen>;

  if (error) return <Screen eyebrow="Homebase" title="Today">
    <Card title="Home could not load" accent="#D36B64">
      <Text style={s.empty}>{error}</Text>
      <AppButton title="Try again" onPress={() => void load()} />
    </Card>
  </Screen>;

  if (!member) return <Screen eyebrow="Homebase" title="Today">
    <Card title="Connect a household">
      <Text style={s.empty}>Create a household or join one to see your shared day here.</Text>
      <AppButton title="Open households" onPress={() => router.push('/household')} />
    </Card>
  </Screen>;

  if (!data) return <Screen eyebrow="Homebase" title="Today"><ActivityIndicator size="large" color="#1F6B59" /></Screen>;

  const greeting = member.display_name ? 'Hello, ' + member.display_name.split(' ')[0] : 'Your day';
  return <Screen eyebrow={new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} title={greeting}>
    <Text style={s.summary}>A quiet overview of what needs your attention.</Text>
    {widgets.includes('chores') ? <Card title="Chores" accent="#E69D54">
      <SectionLink label="See all chores" onPress={() => router.push('/chores')} />
      {data.chores.length ? data.chores.map((item) => <View key={item.id} style={s.row}>
        <View style={s.grow}><Text style={s.item}>{item.title}</Text><Text style={s.muted}>{new Date(item.due_at).toLocaleString()}</Text></View>
        <Pressable style={s.done} onPress={() => void completeChore(item.id).then(load).catch((error) => Alert.alert('Could not complete chore', error.message))}><Text style={s.doneText}>Done</Text></Pressable>
      </View>) : <Text style={s.empty}>Everything is clear for now.</Text>}
    </Card> : null}
    {widgets.includes('events') ? <Card title="Plans" accent="#8B78C9">
      <SectionLink label="Open calendar" onPress={() => router.push('/calendar')} />
      {data.events.length ? data.events.map((item) => <View key={item.id} style={s.eventRow}>
        <View style={s.time}><Text style={s.timeText}>{new Date(item.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></View><Text style={s.item}>{item.title}</Text>
      </View>) : <Text style={s.empty}>Nothing on the calendar today.</Text>}
    </Card> : null}
    {widgets.includes('shopping') ? <Card title="Shopping" accent="#4792AE">
      <SectionLink label="Open list" onPress={() => router.push('/shopping')} />
      {data.shopping.length ? data.shopping.slice(0, 4).map((item) => <Text key={item.id} style={s.shopping}>• {item.title}{item.quantity ? ' · ' + item.quantity : ''}</Text>) : <Text style={s.empty}>Your list is clear.</Text>}
    </Card> : null}
    <AppButton title="Enable gentle reminders" tone="quiet" onPress={() => void registerForPushNotifications()} />
  </Screen>;
}

const s = StyleSheet.create({
  loading: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  summary: { color: '#4C5E57', fontSize: 16, lineHeight: 24, marginTop: -6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(48,81,68,.12)', paddingTop: 11 },
  grow: { flex: 1 }, item: { color: '#21342D', fontSize: 16, fontWeight: '700' },
  muted: { color: '#75827D', fontSize: 13, marginTop: 2 },
  done: { paddingVertical: 8, paddingHorizontal: 11, borderRadius: 12, backgroundColor: '#D6ECE2' },
  doneText: { color: '#176347', fontSize: 13, fontWeight: '800' }, empty: { color: '#75827D', lineHeight: 20 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(48,81,68,.12)', paddingTop: 11 },
  time: { backgroundColor: '#EAE3FA', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 8 },
  timeText: { color: '#5B4796', fontWeight: '800', fontSize: 12 },
  shopping: { color: '#21342D', fontSize: 16, lineHeight: 24 },
});
