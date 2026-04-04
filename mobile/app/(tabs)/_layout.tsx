// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[t.iconWrap, focused && t.iconActive]}>
      <Text style={t.emoji}>{emoji}</Text>
      <Text style={[t.label, focused && t.labelActive]}>{label}</Text>
      {focused && <View style={t.dot} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: t.bar,
      tabBarShowLabel: false,
    }}>
      <Tabs.Screen name="index"        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home"     focused={focused} /> }} />
      <Tabs.Screen name="transactions" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Txns"     focused={focused} /> }} />
      <Tabs.Screen name="budget"       options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" label="Budget"   focused={focused} /> }} />
      <Tabs.Screen name="bills"        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📅" label="Bills"    focused={focused} /> }} />
      <Tabs.Screen name="insights"     options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="✨" label="Insights" focused={focused} /> }} />
      <Tabs.Screen name="settings"     options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="Settings" focused={focused} /> }} />
    </Tabs>
  );
}

const t = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(13,13,20,0.97)',
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
  },
  iconWrap:  { alignItems: 'center', gap: 3, paddingHorizontal: 8 },
  iconActive:{ },
  emoji:     { fontSize: 22 },
  label:     { fontSize: 9, color: Colors.muted, fontWeight: '600', letterSpacing: 0.5 },
  labelActive: { color: Colors.accent },
  dot:       { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.accent },
});
