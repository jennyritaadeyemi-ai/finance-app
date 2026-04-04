// app/(tabs)/transactions.tsx
import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../../src/store';
import { Colors, Spacing, Radius } from '../../src/theme';
import { TxnRow, EmptyState, MonoLabel } from '../../src/components';

const FILTERS = ['All', 'Income', 'Expense', 'Food', 'Transport', 'Shopping'];
const TYPE_MAP: Record<string,string> = { Income: 'income', Expense: 'expense' };



      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search transactions..."
          placeholderTextColor={Colors.muted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: Colors.muted, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.chip, filter === f && s.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[s.chipText, filter === f && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {grouped.length === 0
          ? <EmptyState emoji="💸" title="No transactions" body={search ? 'Try a different search term.' : 'Add your first transaction!'} />
          : grouped.map(([date, txns]) => (
              <View key={date}>
                <View style={s.dateHeader}>
                  <MonoLabel text={formatDate(date)} size={11} />
                  <MonoLabel text={`${txns.length} item${txns.length>1?'s':''}`} size={10} />
                </View>
                <View style={{ gap: 8 }}>
                  {txns.map(t => (
                    <TxnRow key={t.id} txn={t} onPress={() => router.push(`/transaction/${t.id}`)} />
                  ))}
                </View>
              </View>
            ))
        }
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(d: string) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (d === today) return 'TODAY';
  if (d === yesterday) return 'YESTERDAY';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingBottom: Spacing.sm },
  title:  { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },

  summary: { flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  sumPill: { flex: 1, padding: 12, alignItems: 'center', gap: 4 },
  sumDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 10 },
  sumVal:  { fontSize: 13, fontWeight: '700' },

  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  searchIcon:  { fontSize: 14 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14 },

  chips:    { paddingHorizontal: Spacing.lg, gap: 8, paddingBottom: Spacing.md },
  chip:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive:    { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText:      { fontSize: 12, fontWeight: '600', color: Colors.muted },
  chipTextActive:{ color: '#fff' },

  list: { paddingHorizontal: Spacing.lg, gap: 16 },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8 },
});
