import type { ReactNode } from 'react';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type ButtonTone = 'primary' | 'secondary' | 'quiet';

export function Screen({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return <SafeAreaView style={styles.safe}><StatusBar style="dark"/><View pointerEvents="none" style={styles.orbOne}/><View pointerEvents="none" style={styles.orbTwo}/><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.heading}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.title}>{title}</Text></View>{children}</ScrollView></SafeAreaView>;
}

export function Card({ title, children, accent }: { title?: string; children: ReactNode; accent?: string }) {
  return <BlurView intensity={26} tint="light" style={[styles.card, accent ? { borderLeftColor: accent, borderLeftWidth: 4 } : null]}><View style={styles.cardInner}>{title ? <Text style={styles.cardTitle}>{title}</Text> : null}{children}</View></BlurView>;
}

export function Input({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} placeholderTextColor="#7C888A" selectionColor="#397A68" {...props}/></View>;
}

export function AppButton({ title, onPress, disabled, tone = 'primary' }: { title: string; onPress: () => void; disabled?: boolean; tone?: ButtonTone }) {
  const toneStyle = tone === 'primary' ? styles.buttonPrimary : tone === 'secondary' ? styles.buttonSecondary : styles.buttonQuiet;
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, toneStyle, (pressed || disabled) && styles.buttonPressed]}><Text style={[styles.buttonText, tone === 'secondary' && styles.buttonTextSecondary, tone === 'quiet' && styles.buttonTextQuiet]}>{title}</Text></Pressable>;
}

export function SectionLink({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.sectionLink, pressed && styles.buttonPressed]}><Text style={styles.sectionLinkText}>{label}</Text><Text style={styles.chevron}>›</Text></Pressable>; }

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EAF0EE', overflow: 'hidden' }, content: { padding: 20, paddingBottom: 42, gap: 16 }, heading: { paddingTop: 16, gap: 5 }, eyebrow: { color: '#397A68', fontSize: 13, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }, title: { color: '#172622', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -1.1 }, orbOne: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#B9DDD1', top: -130, right: -80, opacity: .72 }, orbTwo: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#D8CBE9', bottom: -125, left: -95, opacity: .58 }, card: { borderRadius: 26, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,.74)', backgroundColor: 'rgba(255,255,255,.48)', shadowColor: '#244138', shadowOpacity: .12, shadowRadius: 22, shadowOffset: { width: 0, height: 9 }, elevation: 3 }, cardInner: { padding: 17, gap: 13 }, cardTitle: { color: '#21342D', fontSize: 18, fontWeight: '800', letterSpacing: -.25 }, field: { gap: 7 }, label: { color: '#52645E', fontSize: 13, fontWeight: '800', letterSpacing: .15 }, input: { backgroundColor: 'rgba(255,255,255,.62)', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(57,122,104,.10)', paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#172622' }, button: { minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, buttonPrimary: { backgroundColor: '#1F6B59', shadowColor: '#174B3E', shadowOpacity: .26, shadowRadius: 11, shadowOffset: { width: 0, height: 6 }, elevation: 3 }, buttonSecondary: { backgroundColor: 'rgba(255,255,255,.64)', borderWidth: 1, borderColor: 'rgba(31,107,89,.18)' }, buttonQuiet: { backgroundColor: 'transparent' }, buttonPressed: { opacity: .55, transform: [{ scale: .985 }] }, buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' }, buttonTextSecondary: { color: '#1F6B59' }, buttonTextQuiet: { color: '#397A68' }, sectionLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 }, sectionLinkText: { color: '#397A68', fontWeight: '800', fontSize: 14 }, chevron: { color: '#397A68', fontSize: 25, lineHeight: 21, fontWeight: '300' }
});
