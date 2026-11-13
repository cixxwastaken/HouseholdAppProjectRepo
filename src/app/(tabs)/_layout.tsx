import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: '#1F6B59',
    tabBarInactiveTintColor: '#74827B',
    tabBarShowLabel: true,
    tabBarLabelPosition: 'below-icon',
    tabBarLabelStyle: { fontSize: 12, fontWeight: '700', marginTop: 2 },
    tabBarItemStyle: { paddingVertical: 5 },
    tabBarStyle: { backgroundColor: '#F5F9F7', borderTopColor: 'rgba(32, 72, 59, .12)', borderTopWidth: 1, height: 80, paddingTop: 6, elevation: 10 },
    sceneStyle: { backgroundColor: '#EAF0EE' },
  }}>
    <Tabs.Screen name="home" options={{ title: 'Home', tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color as string} size={size} /> }} />
    <Tabs.Screen name="household" options={{ title: 'Household', tabBarLabel: 'Household', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color as string} size={size} /> }} />
    <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarLabel: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color as string} size={size} /> }} />
  </Tabs>;
}
