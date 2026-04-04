// app/(tabs)/insights.tsx
import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store';
import { Colors, Spacing, Radius } from '../../src/theme';
import { SectionHeader, MonoLabel, EmptyState } from '../../src/components';

const CARD_COLORS: Record<string, { bg: string; border: string; tag: string }> = {
  alert:    { bg: Colors.accent2 + '12', border: Colors.accent2 + '44', tag: Colors.accent2 },
  warning:  { bg: Colors.warning  + '12', border: Colors.warning  + '44', tag: Colors.warning  },
  positive: { bg: Colors.accent3  + '12', border: Colors.accent3  + '44', tag: Colors.accent3  },
  tip:      { bg: Colors.accent   + '12', border: Colors.accent   + '44', tag: Colors.accent   },
  reminder: { bg: Colors.accent   + '12', border: Colors.accent   + '44', tag: Colors.accent   },
};

export default function InsightsScreen() {
  const { insights, trends, loadAll } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadAll(); setRefreshing(false); }, []);

  const summary  = insights?.summary;
  const insightList: any[] = insights?.insights || [];
  const maxSpend = Math.max(...(trends as any[]).map((t: any) => Math.max(t.spend, t.income)), 1);

  
  chartCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  legend:    { flexDirection: 'row', gap: 16, marginBottom: 14 },
  legendItem:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  trendBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 80 },
  trendCol:  { flex: 1, alignItems: 'center', gap: 4 },
  barGroup:  { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  trendBar:  { width: 7, borderRadius: 3 },

  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14, borderWidth: 1, borderColor: Colors.border },
  catName:{ fontSize: 14, fontWeight: '600', color: Colors.text },

  insightCard:  { marginHorizontal: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, marginBottom: 10, gap: 6 },
  insightTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, lineHeight: 21 },
  insightBody:  { fontSize: 12, color: Colors.muted, lineHeight: 18 },
});
