// app/(tabs)/settings.tsx
import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../../src/store';
import { Colors, Spacing, Radius } from '../../src/theme';
import { SectionHeader, MonoLabel, GhostButton } from '../../src/components';
import api from '../../src/services/api';


  async function handleExport(format: 'json' | 'csv') {
    Alert.alert('Export Data', `Export all transactions as ${format.toUpperCase()}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Export', onPress: async () => {
        try {
          const data: any = await api.exportData(format);
          Alert.alert('Export Ready', `${data.transactions?.length || 0} transactions exported.`);
        } catch (e: any) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user?.name?.[0] || 'A'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{user?.name}</Text>
            <MonoLabel text={user?.email || ''} size={12} />
          </View>
          <View style={s.currencyBadge}>
            <MonoLabel text={user?.currency || 'USD'} color={Colors.accent} size={13} />
          </View>
        </View>

        {/* Integrations */}
        <SectionHeader title="API & Integrations" />
        <View style={s.section}>
          <SettingRow icon="🔑" label="API Keys" sub="Manage third-party access" onPress={() => router.push('/settings/apikeys')} />
          <SettingRow icon="🔗" label="Webhooks"  sub="Real-time event callbacks"  onPress={() => router.push('/settings/webhooks')} />
        </View>

        {/* Quick API Key Summary */}
        {loaded && (
          <View style={{ paddingHorizontal: Spacing.lg, marginTop: 4 }}>
            <View style={s.keysSummary}>
              <MonoLabel text={`${apiKeys.length} active API key${apiKeys.length !== 1 ? 's' : ''}`} size={12} color={Colors.accent} />
              <Text style={s.keysAction} onPress={() => router.push('/settings/apikeys')}>Manage →</Text>
            </View>
            {apiKeys.slice(0, 2).map((k: any) => (
              <View key={k.id} style={s.keyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.keyName}>{k.name}</Text>
                  <MonoLabel text={`${k.scopes} · Last used: ${k.last_used ? new Date(k.last_used).toLocaleDateString() : 'Never'}`} size={10} />
                </View>
                <TouchableOpacity onPress={() => handleDeleteKey(k.id)} style={s.revokeBtn}>
                  <Text style={{ color: Colors.accent2, fontSize: 11, fontWeight: '700' }}>Revoke</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Data Export */}
        <SectionHeader title="Data Export" />
        <View style={s.section}>
          <SettingRow icon="📊" label="Export as CSV"  sub="Import to Excel, YNAB, Mint" onPress={() => handleExport('csv')} />
          <SettingRow icon="📦" label="Export as JSON" sub="For custom integrations"      onPress={() => handleExport('json')} />
        </View>

        {/* Supported Integrations */}
        <SectionHeader title="Integration Catalog" />
        <View style={{ paddingHorizontal: Spacing.lg, gap: 10 }}>
          {[
            { name: 'YNAB',      desc: 'Import via CSV export',         icon: '💚', status: 'Via CSV' },
            { name: 'Plaid',     desc: 'Connect bank accounts via API',  icon: '🏦', status: 'API Key' },
            { name: 'Zapier',    desc: 'Automate with 5000+ apps',       icon: '⚡', status: 'Webhook' },
            { name: 'Notion',    desc: 'Sync to Notion database',        icon: '📝', status: 'Webhook' },
            { name: 'Slack',     desc: 'Budget alerts in Slack',         icon: '💬', status: 'Webhook' },
            { name: 'Stripe',    desc: 'Track Stripe payouts',           icon: '💳', status: 'API Key' },
          ].map(i => (
            <View key={i.name} style={s.intRow}>
              <Text style={{ fontSize: 24 }}>{i.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 14 }}>{i.name}</Text>
                <MonoLabel text={i.desc} size={11} />
              </View>
              <View style={s.intBadge}><MonoLabel text={i.status} size={10} color={Colors.accent} /></View>
            </View>
          ))}
        </View>

        {/* App */}
        <SectionHeader title="App" />
        <View style={s.section}>
          <SettingRow icon="🌙" label="Dark Mode"    sub="Always on" />
          <SettingRow icon="🔔" label="Notifications" sub="Bill reminders & budget alerts" />
          <SettingRow icon="🔒" label="Biometrics"   sub="Face ID / fingerprint unlock" />
        </View>

        {/* Danger zone */}
        <View style={{ paddingHorizontal: Spacing.lg, marginTop: Spacing.lg, gap: 10 }}>
          <GhostButton label="Sign Out" onPress={handleLogout} color={Colors.accent2} />
        </View>

        <Text style={s.version}>Flōw Finance v1.0.0 · Made with ❤️</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ icon, label, sub, onPress }: any) {
  return (
    <TouchableOpacity style={sr.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={sr.icon}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={sr.label}>{label}</Text>
        {sub && <MonoLabel text={sub} size={11} />}
      </View>
      {onPress && <Text style={{ color: Colors.muted, fontSize: 18 }}>›</Text>}
    </TouchableOpacity>
  );
}

const sr = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  icon:  { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
});

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40 },
  topBar: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  title:  { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  avatar:      { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { color: '#fff', fontWeight: '800', fontSize: 20 },
  profileName: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  currencyBadge: { backgroundColor: Colors.accent + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  section: { paddingHorizontal: Spacing.lg, backgroundColor: Colors.surface, marginHorizontal: Spacing.lg, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md },
  keysSummary: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  keysAction:  { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  keyRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 8, gap: 10 },
  keyName:   { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  revokeBtn: { backgroundColor: Colors.accent2 + '18', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  intRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14, borderWidth: 1, borderColor: Colors.border },
  intBadge:  { backgroundColor: Colors.accent + '18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  version:   { textAlign: 'center', color: Colors.muted, fontSize: 11, marginTop: Spacing.xl },
});
