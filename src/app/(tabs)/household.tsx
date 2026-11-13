import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton, Card, Input, Screen } from '../../components/Screen';
import { createHousehold, createInvite, getHousehold, getMembers, getMembership, joinWithCode, rotateJoinCode, updateHousehold } from '../../lib/api';
import type { HouseholdMember, Membership } from '../../lib/types';

export default function Household() {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [householdName, setHouseholdName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [newHousehold, setNewHousehold] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const current = await getMembership(); setMembership(current);
    if (current) { const [household, people] = await Promise.all([getHousehold(current.household_id), getMembers(current.household_id)]); setHouseholdName(household.name); setMembers(people); } else setMembers([]);
  }, []);
  useFocusEffect(useCallback(() => { void load().catch((error) => Alert.alert('Could not load household', error.message)); }, [load]));
  const saveHousehold = async () => { if (!membership || !householdName.trim()) return; try { setBusy(true); await updateHousehold(membership.household_id, householdName.trim()); Alert.alert('Household updated'); } catch (error) { Alert.alert('Could not update household', error instanceof Error ? error.message : 'Admin access is required.'); } finally { setBusy(false); } };
  const create = async () => { if (!newHousehold.trim()) return; try { setBusy(true); await createHousehold(newHousehold.trim()); setNewHousehold(''); await load(); Alert.alert('Household created'); } catch (error) { Alert.alert('Could not create household', error instanceof Error ? error.message : 'Try again.'); } finally { setBusy(false); } };
  const join = async () => { if (!joinCode.trim()) return; try { setBusy(true); await joinWithCode(joinCode.trim().toUpperCase()); setJoinCode(''); await load(); Alert.alert('Joined household'); } catch (error) { Alert.alert('Could not join', error instanceof Error ? error.message : 'Check the code and try again.'); } finally { setBusy(false); } };
  const invite = async (role: 'adult' | 'child') => { if (!membership) return; try { setBusy(true); const result = await createInvite(membership.household_id, role); Alert.alert('Invite ready', 'Share this one-use invite token with the new ' + role + ':\n\n' + result.inviteToken + '\n\nExpires ' + new Date(result.expiresAt).toLocaleDateString()); } catch (error) { Alert.alert('Could not create invite', error instanceof Error ? error.message : 'Deploy the included manage-household function first.'); } finally { setBusy(false); } };
  const rotate = async () => { if (!membership) return; try { setBusy(true); const result = await rotateJoinCode(membership.household_id); Alert.alert('New join code', result.code + '\n\nThe previous code is no longer valid.'); } catch (error) { Alert.alert('Could not rotate code', error instanceof Error ? error.message : 'Deploy the included manage-household function first.'); } finally { setBusy(false); } };
  if (!membership) return <Screen eyebrow="Your space" title="Household"><ActivityIndicator size="large" color="#1F6B59"/><Card title="Join a household"><Input label="Join code" value={joinCode} onChangeText={setJoinCode} autoCapitalize="characters"/><AppButton title="Join household" disabled={busy} onPress={() => void join()}/></Card><Card title="Create a household"><Input label="Household name" value={newHousehold} onChangeText={setNewHousehold}/><AppButton title="Create household" tone="secondary" disabled={busy} onPress={() => void create()}/></Card></Screen>;
  const isAdmin = membership.role === 'admin';
  return <Screen eyebrow="Your space" title="Household">
    <Card title="Current household" accent="#8B78C9"><Text style={s.copy}>Everyone in this trusted home can collaborate here.</Text><Text style={s.role}>Your role: {membership.role}</Text>{isAdmin ? <><Input label="Household name" value={householdName} onChangeText={setHouseholdName}/><AppButton title="Save household name" disabled={busy} onPress={() => void saveHousehold()}/></> : <Text style={s.name}>{householdName}</Text>}</Card>
    {isAdmin ? <Card title="Invite people" accent="#E69D54"><Text style={s.copy}>Create expiring single-use invites, or rotate a household join code.</Text><AppButton title="Invite an adult" tone="secondary" disabled={busy} onPress={() => void invite('adult')}/><AppButton title="Invite a child" tone="secondary" disabled={busy} onPress={() => void invite('child')}/><AppButton title="Rotate join code" tone="quiet" disabled={busy} onPress={() => void rotate()}/></Card> : null}
    <Card title="Join another household"><Input label="Join code" value={joinCode} onChangeText={setJoinCode} autoCapitalize="characters"/><AppButton title="Join household" tone="secondary" disabled={busy} onPress={() => void join()}/></Card>
    <Card title="Create another household"><Input label="Household name" value={newHousehold} onChangeText={setNewHousehold}/><AppButton title="Create household" tone="secondary" disabled={busy} onPress={() => void create()}/></Card>
    <Card title={'People · ' + members.length}>{members.map((person) => <View key={person.id} style={s.member}><View style={s.avatar}><Text style={s.avatarText}>{(person.display_name ?? 'H').slice(0, 1).toUpperCase()}</Text></View><View><Text style={s.name}>{person.display_name ?? 'Household member'}</Text><Text style={s.copy}>{person.role}</Text></View></View>)}</Card>
  </Screen>;
}
const s = StyleSheet.create({ copy: { color: '#607078', lineHeight: 21 }, role: { color: '#6B579D', fontWeight: '800', textTransform: 'capitalize' }, name: { color: '#21342D', fontSize: 16, fontWeight: '700' }, member: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 6 }, avatar: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D9EEE5' }, avatarText: { color: '#1C664F', fontWeight: '800', fontSize: 16 } });
