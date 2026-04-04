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

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.title}>Insights</Text>
        <MonoLabel text="AI-powered" color={Colors.accent} size={12} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        {summary && (
          <View style={s.statsGrid}>
            <StatCard label="SAVINGS RATE" value={`${(summary.savings_rate * 100).toFixed(1)}%`} color={summary.savings_rate >= 0.2 ? Colors.accent3 : Colors.warning} />
            <StatCard label="SPENT" value={`$${summary.this_month_spend?.toFixed(0)}`} color={Colors.accent2} />
            <StatCard label="INCOME" value={`$${summary.this_month_income?.toFixed(0)}`} color={Colors.accent3} />
            <StatCard label="ALERTS" value={`${summary.over_budget_count}`} color={summary.over_budget_count > 0 ? Colors.accent2 : Colors.accent3} />
          </View>
        )}

        {/* Trend Chart */}
        {trends.length > 0 && (
          <>
            <SectionHeader title="6-Month Trend" />
            <View style={[s.chartCard, { marginHorizontal: Spacing.lg }]}>
              {/* Legend */}
              <View style={s.legend}>
                <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: Colors.accent3 }]} /><MonoLabel text="INCOME" size={10} /></View>
                <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: Colors.accent2 }]} /><MonoLabel text="SPEND"  size={10} /></View>
                <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: Colors.accent }]}  /><MonoLabel text="SAVED"  size={10} /></View>
              </View>
              {/* Bars */}
              <View style={s.trendBars}>
                {(trends as any[]).map((t: any, i: number) => (
                  <View key={i} style={s.trendCol}>
                    <View style={s.barGroup}>
                      <View style={[s.trendBar, { height: Math.max((t.income / maxSpend) * 72, 3), backgroundColor: Colors.accent3 }]} />
                      <View style={[s.trendBar, { height: Math.max((t.spend  / maxSpend) * 72, 3), backgroundColor: Colors.accent2 }]} />
                      <View style={[s.trendBar, { height: Math.max((Math.max(t.saved,0) / maxSpend) * 72, 3), backgroundColor: Colors.accent }]} />
                    </View>
                    <MonoLabel text={t.label} size={9} />
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Top Categories */}
        {summary?.top_categories?.length > 0 && (
          <>
            <SectionHeader title="Top Spending" />
            <View style={{ paddingHorizontal: Spacing.lg, gap: 8 }}>
              {summary.top_categories.slice(0, 4).map((c: any, i: number) => {
                const pct = summary.this_month_spend > 0 ? c.total / summary.this_month_spend : 0;
                return (
                  <View key={i} style={s.catRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                      <Text style={s.catName}>{c.name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <MonoLabel text={`$${c.total.toFixed(0)}`} size={13} color={Colors.text} />
                      <MonoLabel text={`${(pct*100).toFixed(0)}% of spend`} size={10} />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Insight Cards */}
        <SectionHeader title="Personalized Tips" />
        {insightList.length === 0
          ? <EmptyState emoji="✨" title="Add some transactions" body="Flōw needs spending data to generate personalized insights." />
          : insightList.map((insight: any, i: number) => {
              const theme = CARD_COLORS[insight.type] || CARD_COLORS.tip;
              return (
                <TouchableOpacity key={i} style={[s.insightCard, { backgroundColor: theme.bg, borderColor: theme.border }]} activeOpacity={0.8}>
                  <MonoLabel text={insight.tag} color={theme.tag} size={10} />
                  <Text style={s.insightTitle}>{insight.title}</Text>
                  <Text style={s.insightBody}>{insight.body}</Text>
                  {insight.action && <MonoLabel text={`${insight.action} →`} color={theme.tag} size={12} />}
                </TouchableOpacity>
              );
            })
        }
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={sc.wrap}>
      <MonoLabel text={label} size={9} />
      <Text style={[sc.val, { color }]}>{value}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 12, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  val:  { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
});

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingBottom: Spacing.sm },
  title:  { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: Spacing.lg, marginBottom: 4 },

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
