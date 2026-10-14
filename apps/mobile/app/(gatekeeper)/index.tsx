import { useAttendanceStore } from '@/store/attendance.store';
import { StudentAttendanceCard } from '@/components/StudentAttendanceCard';
import { useStudentRoster } from '@/hooks/use-student-roster';
import { useAuthStore } from '@/store/auth.store';
import {
  AttendanceStatus,
  AttendanceType,
  StudentWithAttendance,
} from '@minaker/shared-types';
import { useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppTextInput } from '@/components/glass/AppTextInput';

const MODE_OPTIONS: Array<{ type: AttendanceType; label: string; emoji: string }> = [
  { type: AttendanceType.SCHOOL_ENTRY, label: 'Entry', emoji: '🏫' },
  { type: AttendanceType.SCHOOL_EXIT,  label: 'Exit',  emoji: '🚪' },
];

const CLASS_ALL = 'All Classes';

export default function GatekeeperHomeScreen() {
  const { user } = useAuthStore();
  const [mode, setMode] = useState<AttendanceType>(AttendanceType.SCHOOL_ENTRY);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>(CLASS_ALL);

  const { students, classSections, loading, error, refetch } = useStudentRoster({ attendanceType: mode });
  const { markStudent, pendingCount } = useAttendanceStore();

  const filtered = useMemo(() => {
    let list = students;
    if (classFilter !== CLASS_ALL) list = list.filter((s) => s.classSection === classFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.fullName.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));
    }
    return list;
  }, [students, classFilter, searchQuery]);

  const summary = useMemo(() => {
    const scope = classFilter === CLASS_ALL ? students : filtered;
    return {
      total:    scope.length,
      present:  scope.filter((s) => s.todayStatus === AttendanceStatus.PRESENT).length,
      absent:   scope.filter((s) => s.todayStatus === AttendanceStatus.ABSENT).length,
      late:     scope.filter((s) => s.todayStatus === AttendanceStatus.LATE).length,
      unmarked: scope.filter((s) => !s.todayStatus).length,
    };
  }, [students, filtered, classFilter]);

  const handleMark = useCallback(
    (student: StudentWithAttendance, status: AttendanceStatus) => {
      markStudent({
        studentId:      student.id,
        studentName:    student.fullName,
        attendanceType: mode,
        status,
        gateLocation:   'Main Gate',
        markedBy:       user!.id,
      });
    },
    [mode, markStudent, user],
  );

  const renderItem = ({ item }: { item: StudentWithAttendance }) => (
    <StudentAttendanceCard student={item} onMark={(status) => handleMark(item, status)} />
  );

  if (error) {
    return (
      <View style={styles.centered as any}>
        <Text style={styles.errorText as any}>Failed to load students</Text>
        <Pressable style={styles.retryBtn as any} onPress={refetch}>
          <Text style={styles.retryText as any}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container as any}>
      {/* Mode Toggle */}
      <View style={styles.modeRow as any}>
        {MODE_OPTIONS.map((m) => (
          <Pressable
            key={m.type}
            style={(mode === m.type ? styles.modeBtnActive : styles.modeBtn) as any}
            onPress={() => setMode(m.type)}
          >
            <Text style={(mode === m.type ? styles.modeBtnTextActive : styles.modeBtnText) as any}>
              {m.emoji} {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Search */}
      <AppTextInput
        style={styles.search as any}
        placeholder="🔍  Search name or roll no…"
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />

      {/* Class Filter Pills */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[CLASS_ALL, ...classSections]}
        keyExtractor={(item) => item}
        style={styles.pillList as any}
        renderItem={({ item }) => (
          <Pressable
            style={(classFilter === item ? styles.pillActive : styles.pill) as any}
            onPress={() => setClassFilter(item)}
          >
            <Text style={(classFilter === item ? styles.pillTextActive : styles.pillText) as any}>
              {item}
            </Text>
          </Pressable>
        )}
      />

      {/* Roster */}
      {loading ? (
        <ActivityIndicator style={styles.loader as any} size="large" color="#1a73e8" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
          ListEmptyComponent={<Text style={styles.emptyText as any}>No students found</Text>}
          contentContainerStyle={styles.listContent as any}
        />
      )}

      {/* Sticky Summary Bar */}
      <View style={styles.summaryBar as any}>
        <SummaryChip label="Present"  count={summary.present}  color="#10b981" />
        <SummaryChip label="Absent"   count={summary.absent}   color="#ef4444" />
        <SummaryChip label="Late"     count={summary.late}     color="#f59e0b" />
        <SummaryChip label="Unmarked" count={summary.unmarked} color="#9ca3af" />
        {pendingCount > 0 && (
          <Text style={styles.pendingBadge as any}>⏳ {pendingCount} pending sync</Text>
        )}
      </View>
    </View>
  );
}

function SummaryChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={styles.chip as any}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Text style={[styles.chipCount, { color }] as any}>{count}</Text>
      <Text style={styles.chipLabel as any}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f9fafb' },
  centered:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loader:           { marginTop: 40 },
  listContent:      { paddingBottom: 120 },

  modeRow:          { flexDirection: 'row', margin: 12, backgroundColor: '#e5e7eb', borderRadius: 10, padding: 3 },
  modeBtn:          { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  modeBtnActive:    { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#ffffff', shadowOpacity: 0.1, elevation: 2 },
  modeBtnText:      { fontWeight: '600', color: '#6b7280', fontSize: 15 },
  modeBtnTextActive:{ fontWeight: '600', color: '#1a73e8', fontSize: 15 },

  search:           { margin: 12, marginTop: 0, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },

  pillList:         { maxHeight: 44, paddingHorizontal: 12, marginBottom: 4 },
  pill:             { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 8 },
  pillActive:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1a73e8', marginRight: 8 },
  pillText:         { fontSize: 13, fontWeight: '600', color: '#374151' },
  pillTextActive:   { fontSize: 13, fontWeight: '600', color: '#ffffff' },

  emptyText:        { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 15 },

  summaryBar:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  chip:             { alignItems: 'center', flex: 1 },
  chipCount:        { fontSize: 18, fontWeight: '700' },
  chipLabel:        { fontSize: 11, color: '#6b7280', marginTop: 1 },
  pendingBadge:     { fontSize: 11, color: '#f59e0b', fontWeight: '600' },

  errorText:        { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn:         { backgroundColor: '#1a73e8', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText:        { color: '#fff', fontWeight: '600' },
});
