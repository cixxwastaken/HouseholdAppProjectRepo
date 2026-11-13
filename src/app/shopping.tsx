import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton, Card, Input, Screen } from '../components/Screen';
import { addShoppingItem, getDashboard, getMembership, toggleShoppingItem } from '../lib/api';
import type { DashboardData, Membership } from '../lib/types';

export default function Shopping() {
  const [name, setName] = useState(''); const [data, setData] = useState<DashboardData | null>(null); const [member, setMember] = useState<Membership | null>(null);
  const load = useCallback(async () => { const current = await getMembership(); setMember(current); if (current) setData(await getDashboard(current.household_id)); }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return <Screen title="Shopping list" eyebrow="Shared essentials"><Card title="Add an item"><View style={s.add}><Input label="What do you need?" placeholder="Milk, detergent, batteries…" value={name} onChangeText={setName}/><AppButton title="Add to list" disabled={!name.trim() || !member} onPress={async () => { if (!member) return; await addShoppingItem(member.household_id, name.trim()); setName(''); await load(); }}/></View></Card><Card title="To buy">{data?.shopping.length ? data.shopping.map((item) => <View key={item.id} style={s.row}><Text style={s.item}>{item.title}</Text><AppButton title="Got it" tone="secondary" onPress={async () => { await toggleShoppingItem(item.id, true); await load(); }}/></View>) : <Text style={s.empty}>Your list is clear.</Text>}</Card></Screen>;
}
const s = StyleSheet.create({ add: { gap: 12 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, paddingVertical: 4 }, item: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1D2B35' }, empty: { color: '#607078' } });
