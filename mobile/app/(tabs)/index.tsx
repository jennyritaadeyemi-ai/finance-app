// app/(tabs)/index.tsx — Home Dashboard
import { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../../src/store';
import { Colors, Spacing, Radius } from '../../src/theme';
import { SectionHeader, TxnRow, MonoLabel, EmptyState } from '../../src/components';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, accounts, transactions, trends, insights, loadAll } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, []);

  const totalBalance = accounts.reduce((s: number, a: any) => s + (a.type !== 'credit' ? a.balance : 0), 0);
  const thisMonth = trends[trends.length - 1] || { spend: 0, income: 0, saved: 0 };
  const lastMonth = trends[trends.length - 2] || { spend: 0 };
  const spendDelta = lastMonth.spend > 0 ? ((thisMonth.spend - lastMonth.spend) / lastMonth.spend * 100) : 0;
  const recent = transactions.slice(0, 6);

  // Bar chart max
  const maxVal = Math.max(...trends.map((t: any) => t.spend), 1);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <MonoLabel text={`GOOD ${getGreeting()}`} />
            <Text style={s.userName}>{user?.name?.split(' ')[0] || 'there'} 👋</Text>
          </View>
          <TouchableOpacity style={s.avatar} onPress={() => router.push('/(tabs)/settings')}>
            <Text style={s.avatarText}>{user?.name?.[0] || 'A'}</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={s.balanceCard}>
          <View style={s.balanceGlow} />
          <MonoLabel text="NET WORTH" />
          <Text style={s.balanceAmount}>${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          <MonoLabel text={`${spendDelta >= 0 ? '↑' : '↓'} ${Math.abs(spendDelta).toFixed(1)}% vs last month`} color={spendDelta <= 0 ? Colors.accent3 : Colors.accent2} size={12} />

          <View style={s.pills}>
            {[
              { label: 'INCOME',  value: `$${thisMonth.income.toFixed(0)}`, color: Colors.accent3 },
              { label: 'SPENT',   value: `$${thisMonth.spend.toFixed(0)}`,  color: Colors.accent2 },
              { label: 'SAVED',   value: `$${Math.max(thisMonth.saved,0).toFixed(0)}`, color: Colors.accent },
            ].map(p => (
              <View key={p.label} style={s.pill}>
                <MonoLabel text={p.label} size={9} />
                <Text style={[s.pillVal, { color: p.color }]}>{p.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spending Chart */}
        <SectionHeader title="6-Month Spending" />
        <View style={[s.card, { marginHorizontal: Spacing.lg }]}>
          {trends.length > 0 ? (
            <View style={s.chartWrap}>
              <View style={s.bars}>
                {trends.map((t: any, i: number) => {
                  const h = Math.max((t.spend / maxVal) * 64, 4);
                  const isLast = i === trends.length - 1;
                  return (
                    <View key={i} style={s.barCol}>
                      <View style={[s.bar, { height: h, backgroundColor: isLast ? Colors.accent : Colors.surface2 }]} />
                      <MonoLabel text={t.label} size={9} />
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <MonoLabel text="No data yet" color={Colors.muted} />
          )}
        </View>

        {/* Accounts */}
        <SectionHeader title="Accounts" action="+ Add" onAction={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.accountsScroll}>
          {accounts.map((acc: any) => (
            <View key={acc.id} style={[s.accountCard, { borderColor: acc.color + '55' }]}>
              <Text style={{ fontSize: 24 }}>{acc.icon}</Text>
              <Text style={s.accountName}>{acc.name}</Text>
              <MonoLabel text={acc.type.toUpperCase()} size={9} />
              <Text style={[s.accountBal, { color: acc.balance >= 0 ? Colors.accent3 : Colors.accent2 }]}>
                ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
          {accounts.length === 0 && (
            <View style={[s.accountCard, { borderStyle: 'dashed' }]}>
              <Text style={{ fontSize: 24 }}>➕</Text>
              <Text style={[s.accountName, { color: Colors.muted }]}>Add Account</Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={s.quickActions}>
          {[
            { icon: '➕', label: 'Add',      action: () => router.push('/transaction/new') },
            { icon: '🎯', label: 'Budget',   action: () => router.push('/(tabs)/budget') },
            { icon: '📅', label: 'Bills',    action: () => router.push('/(tabs)/bills') },
            { icon: '✨', label: 'Insights', action: () => router.push('/(tabs)/insights') },
          ].map(q => (
            <TouchableOpacity key={q.label} style={s.qaBtn} onPress={q.action} activeOpacity={0.7}>
              <Text style={{ fontSize: 22 }}>{q.icon}</Text>
              <Text style={s.qaLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Alert */}
        {insights?.insights?.[0] && (
          <TouchableOpacity style={s.insightBanner} onPress={() => router.push('/(tabs)/insights')} activeOpacity={0.8}>
            <View style={s.insightBannerInner}>
              <Text style={s.insightTag}>✨ AI INSIGHT</Text>
              <Text style={s.insightTitle}>{insights.insights[0].title}</Text>
              <MonoLabel text="View all insights →" color={Colors.accent} size={12} />
            </View>
          </TouchableOpacity>
        )}

        {/* Recent Transactions */}
        <SectionHeader title="Recent" action="See all →" onAction={() => router.push('/(tabs)/transactions')} />
        <View style={s.txnList}>
          {recent.length === 0
            ? <EmptyState emoji="💸" title="No transactions yet" body="Add your first transaction to get started." />
            : recent.map((t: any) => (
                <TxnRow key={t.id} txn={t} onPress={() => router.push(`/transaction/${t.id}`)} />
              ))
          }
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => router.push('/transaction/new')} activeOpacity={0.85}>
        <Text style={s.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'MORNING';
  if (h < 17) return 'AFTERNOON';
  return 'EVENING';
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingTop: Spacing.md },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  balanceCard: { marginHorizontal: Spacing.lg, backgroundColor: '#1e1a3a', borderRadius: Radius.xxl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.accent + '33', overflow: 'hidden', gap: 6 },
  balanceGlow: { position: 'absolute', top: -80, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.accent, opacity: 0.07 },
  balanceAmount: { fontSize: 40, fontWeight: '800', color: Colors.text, letterSpacing: -1.5 },
  pills: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pill: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.md, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', gap: 4 },
  pillVal: { fontSize: 16, fontWeight: '700' },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  chartWrap: { },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  bar: { width: '100%', borderRadius: 4 },

  accountsScroll: { paddingHorizontal: Spacing.lg, gap: 12 },
  accountCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, width: 150, gap: 4 },
  accountName: { fontSize: 13, fontWeight: '600', color: Colors.text },
  accountBal: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },

  quickActions: { flexDirection: 'row', gap: 10, paddingHorizontal: Spacing.lg },
  qaBtn: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border },
  qaLabel: { fontSize: 10, color: Colors.muted, fontWeight: '600' },

  insightBanner: { marginHorizontal: Spacing.lg, marginTop: Spacing.md },
  insightBannerInner: { backgroundColor: Colors.accent + '18', borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.accent + '44', gap: 4 },
  insightTag: { fontSize: 9, color: Colors.accent, fontWeight: '700', letterSpacing: 2 },
  insightTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },

  txnList: { paddingHorizontal: Spacing.lg, gap: 8, marginTop: 4 },

  fab: { position: 'absolute', bottom: 100, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.accent, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
