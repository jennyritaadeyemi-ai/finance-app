// app/(tabs)/budget.tsx
import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store';
import { Colors, Spacing, Radius } from '../../src/theme';
import { SectionHeader, ProgressBar, MonoLabel, PrimaryButton, EmptyState } from '../../src/components';

export default function BudgetScreen() {
  const { budgets, categories, addBudget, updateBudget, loadAll } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [catId, setCatId]  = useState('');
  const [amount, setAmount]= useState('');
  const [alertAt, setAlertAt] = useState('80');
  const [saving, setSaving]   = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, []);

  const totalBudget = budgets.reduce((s: number, b: any) => s + b.amount, 0);
  const totalSpent  = budgets.reduce((s: number, b: any) => s + b.spent, 0);
  const overBudget  = (budgets as any[]).filter((b: any) => b.pct >= 1);

  async function handleSave() {
    if (!catId || !amount) return Alert.alert('Fill all fields');
    setSaving(true);
    try {
      await addBudget({ category_id: catId, amount: parseFloat(amount), alert_at: parseFloat(alertAt) / 100 });
      setShowModal(false); setCatId(''); setAmount(''); setAlertAt('80');
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  const expenseCats = (categories as any[]).filter(c => c.type === 'expense' || c.type === 'both');
  const usedCatIds  = new Set((budgets as any[]).map((b: any) => b.category_id));
  const availCats   = expenseCats.filter(c => !usedCatIds.has(c.id));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.title}>Budgets</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview */}
        <View style={[s.card, { marginHorizontal: Spacing.lg }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <MonoLabel text="TOTAL BUDGET" />
              <Text style={s.bigNum}>${totalBudget.toFixed(0)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <MonoLabel text="SPENT" />
              <Text style={[s.bigNum, { color: Colors.accent2 }]}>${totalSpent.toFixed(0)}</Text>
            </View>
          </View>
          <ProgressBar pct={totalBudget > 0 ? totalSpent / totalBudget : 0} height={10} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <MonoLabel text={`${totalBudget > 0 ? ((totalSpent/totalBudget)*100).toFixed(0) : 0}% used`} />
            <MonoLabel text={`$${Math.max(totalBudget - totalSpent, 0).toFixed(0)} remaining`} />
          </View>
          {overBudget.length > 0 && (
            <View style={s.alertBanner}>
              <Text style={s.alertText}>⚠️ {overBudget.length} categor{overBudget.length>1?'ies':'y'} over budget</Text>
            </View>
          )}
        </View>

        <SectionHeader title="Categories" action="+ Add" onAction={() => setShowModal(true)} />

        {budgets.length === 0
          ? <EmptyState emoji="🎯" title="No budgets yet" body="Set spending limits for your categories to stay on track." />
          : (budgets as any[]).map((b: any) => (
              <BudgetItem key={b.id} budget={b} onEdit={async (id, amt) => { await updateBudget(id, { amount: amt }); await loadAll(); }} />
            ))
        }
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.handle} />
            <Text style={s.modalTitle}>New Budget</Text>
            <Text style={s.modalSub}>Set a monthly spending limit</Text>

            <Text style={s.label}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {availCats.map(c => (
                  <TouchableOpacity key={c.id} style={[s.catChip, catId === c.id && s.catChipActive]} onPress={() => setCatId(c.id)}>
                    <Text>{c.icon} {c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={s.label}>MONTHLY LIMIT ($)</Text>
            <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="300" placeholderTextColor={Colors.muted} />

            <Text style={s.label}>ALERT WHEN (% USED)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.lg }}>
              {['50','70','80','90'].map(v => (
                <TouchableOpacity key={v} style={[s.pctChip, alertAt === v && s.catChipActive]} onPress={() => setAlertAt(v)}>
                  <Text style={{ color: alertAt === v ? '#fff' : Colors.text, fontWeight: '600', fontSize: 13 }}>{v}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            <PrimaryButton label="Create Budget" onPress={handleSave} loading={saving} />
            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setShowModal(false)}>
              <Text style={{ color: Colors.muted, fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BudgetItem({ budget: b, onEdit }: { budget: any; onEdit: (id: string, amt: number) => void }) {
  const barColor = b.pct >= 1 ? Colors.accent2 : b.pct >= b.alert_at ? Colors.warning : Colors.accent3;
  return (
    <View style={bi.wrap}>
      <View style={bi.row}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 20 }}>{b.category_icon || '📦'}</Text>
          <Text style={bi.name}>{b.category_name}</Text>
        </View>
        <MonoLabel text={`$${b.spent.toFixed(0)} / $${b.amount}`} size={12} />
      </View>
      <ProgressBar pct={b.pct} color={barColor} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <MonoLabel text={`${(b.pct * 100).toFixed(0)}% used`} color={b.pct >= 1 ? Colors.accent2 : Colors.muted} />
        <MonoLabel text={`$${Math.max(b.remaining, 0).toFixed(0)} left`} />
      </View>
      {b.pct >= b.alert_at && (
        <View style={bi.alertRow}>
          <Text style={bi.alertTxt}>{b.pct >= 1 ? '🔴 Over budget!' : '🟡 Getting close'}</Text>
        </View>
      )}
    </View>
  );
}

const bi = StyleSheet.create({
  wrap:  { marginHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 10 },
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  name:  { fontSize: 14, fontWeight: '600', color: Colors.text },
  alertRow: { marginTop: 8, backgroundColor: Colors.accent2 + '15', borderRadius: 8, padding: 8 },
  alertTxt: { fontSize: 12, color: Colors.accent2, fontWeight: '600' },
});

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingBottom: Spacing.sm },
  title:  { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  card:   { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  bigNum: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -1 },
  alertBanner: { marginTop: 12, backgroundColor: Colors.accent2 + '18', borderRadius: 10, padding: 10 },
  alertText:   { color: Colors.accent2, fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalSheet:   { backgroundColor: Colors.surface, borderRadius: 28, padding: Spacing.lg, paddingBottom: 40 },
  handle:    { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg },
  modalTitle:{ fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  modalSub:  { fontSize: 13, color: Colors.muted, marginBottom: Spacing.lg },
  label:     { fontSize: 10, color: Colors.muted, letterSpacing: 2, marginBottom: 8, fontWeight: '700' },
  input:     { backgroundColor: Colors.surface2, borderRadius: Radius.md, padding: 14, color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  catChip:   { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface2 },
  catChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  pctChip:   { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.surface2 },
});
