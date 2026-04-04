// app/(tabs)/bills.tsx
import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Modal, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store';
import { Colors, Spacing, Radius } from '../../src/theme';
import { SectionHeader, Badge, MonoLabel, PrimaryButton, EmptyState } from '../../src/components';

export default function BillsScreen() {
  const { bills, accounts, categories, addBill, loadAll } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', due_day: '', auto_pay: false, icon: '📄' });
  const [saving, setSaving] = useState(false);

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadAll(); setRefreshing(false); }, []);

  const due7  = (bills as any[]).filter((b: any) => b.days_until_due <= 7);
  const due30 = (bills as any[]).filter((b: any) => b.days_until_due > 7 && b.days_until_due <= 30);
  const total7 = due7.reduce((s: number, b: any) => s + b.amount, 0);

  async function handleSave() {
    if (!form.name || !form.amount || !form.due_day) return Alert.alert('Fill all required fields');
    setSaving(true);
    try {
      await addBill({ ...form, amount: parseFloat(form.amount), due_day: parseInt(form.due_day) });
      setShowModal(false);
      setForm({ name: '', amount: '', due_day: '', auto_pay: false, icon: '📄' });
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.title}>Bills</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={[s.card, { marginHorizontal: Spacing.lg }]}>
          <MonoLabel text="DUE THIS MONTH" />
          <Text style={s.bigNum}>${(bills as any[]).reduce((s: number,b: any)=>s+b.amount,0).toFixed(2)}</Text>
          {due7.length > 0 && (
            <View style={s.urgentBanner}>
              <Text style={s.urgentText}>⚡ {due7.length} bill{due7.length>1?'s':''} due within 7 days — ${total7.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {due7.length > 0 && <SectionHeader title="Due Soon" />}
        <View style={s.list}>
          {due7.map((b: any) => <BillRow key={b.id} bill={b} urgent />)}
        </View>

        {due30.length > 0 && <SectionHeader title="Upcoming" />}
        <View style={s.list}>
          {due30.map((b: any) => <BillRow key={b.id} bill={b} />)}
        </View>

        {bills.length === 0 && (
          <EmptyState emoji="📅" title="No bills yet" body="Add recurring bills to get payment predictions and reminders." />
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.handle} />
            <Text style={s.modalTitle}>Add Bill</Text>
            <Text style={s.modalSub}>Track a recurring payment</Text>

            {/* Icon picker */}
            <Text style={s.label}>ICON</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['🏠','⚡','💧','📱','🌐','🎬','🎵','🏋️','🚗','💳','📺','☁️'].map(ic => (
                  <TouchableOpacity key={ic} style={[s.iconPill, form.icon === ic && s.iconPillActive]} onPress={() => setForm(f => ({ ...f, icon: ic }))}>
                    <Text style={{ fontSize: 20 }}>{ic}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={s.label}>BILL NAME</Text>
            <TextInput style={s.input} value={form.name} onChangeText={v => setForm(f=>({...f,name:v}))} placeholder="Rent, Netflix..." placeholderTextColor={Colors.muted} />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>AMOUNT ($)</Text>
                <TextInput style={s.input} value={form.amount} onChangeText={v => setForm(f=>({...f,amount:v}))} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={Colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>DUE DAY</Text>
                <TextInput style={s.input} value={form.due_day} onChangeText={v => setForm(f=>({...f,due_day:v}))} keyboardType="number-pad" placeholder="1-31" placeholderTextColor={Colors.muted} />
              </View>
            </View>

            <View style={s.switchRow}>
              <View>
                <Text style={{ color: Colors.text, fontWeight: '600' }}>Auto-pay</Text>
                <MonoLabel text="Automatically deducted" size={11} />
              </View>
              <Switch value={form.auto_pay} onValueChange={v => setForm(f=>({...f,auto_pay:v}))} trackColor={{ true: Colors.accent }} thumbColor="#fff" />
            </View>

            <PrimaryButton label="Add Bill" onPress={handleSave} loading={saving} />
            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setShowModal(false)}>
              <Text style={{ color: Colors.muted, fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BillRow({ bill: b, urgent }: { bill: any; urgent?: boolean }) {
  const badgeLabel = b.auto_pay ? 'AUTO' : b.days_until_due <= 3 ? 'URGENT' : b.days_until_due <= 7 ? 'SOON' : 'OK';
  const badgeColor = b.auto_pay ? Colors.accent : b.days_until_due <= 3 ? Colors.accent2 : b.days_until_due <= 7 ? Colors.warning : Colors.accent3;

  return (
    <View style={[br.row, urgent && br.rowUrgent]}>
      <View style={br.icon}><Text style={{ fontSize: 22 }}>{b.icon || '📄'}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={br.name}>{b.name}</Text>
        <MonoLabel text={b.auto_pay ? 'Auto-pay · ' : '' + `Due day ${b.due_day} · ${b.days_until_due} days`} size={11} />
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={br.amount}>${b.amount.toFixed(2)}</Text>
        <Badge label={badgeLabel} color={badgeColor} />
      </View>
    </View>
  );
}

const br = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14, borderWidth: 1, borderColor: Colors.border },
  rowUrgent: { borderColor: Colors.accent2 + '44' },
  icon:      { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  name:      { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  amount:    { fontSize: 16, fontWeight: '700', color: Colors.text },
});

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingBottom: Spacing.sm },
  title:  { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  card:   { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  bigNum: { fontSize: 32, fontWeight: '800', color: Colors.text, letterSpacing: -1, marginTop: 4, marginBottom: 8 },
  urgentBanner: { backgroundColor: Colors.accent2 + '18', borderRadius: 10, padding: 10 },
  urgentText:   { color: Colors.accent2, fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.lg, gap: 8 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalSheet:   { backgroundColor: Colors.surface, borderRadius: 28, padding: Spacing.lg, paddingBottom: 40, maxHeight: '90%' },
  handle:    { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg },
  modalTitle:{ fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  modalSub:  { fontSize: 13, color: Colors.muted, marginBottom: Spacing.lg },
  label:     { fontSize: 10, color: Colors.muted, letterSpacing: 2, marginBottom: 8, fontWeight: '700' },
  input:     { backgroundColor: Colors.surface2, borderRadius: Radius.md, padding: 14, color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  iconPill:  { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  iconPillActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '22' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, backgroundColor: Colors.surface2, borderRadius: Radius.md, padding: 14, borderWidth: 1, borderColor: Colors.border },
});
