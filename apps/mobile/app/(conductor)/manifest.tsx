import { StudentAttendanceCard } from '@/components/StudentAttendanceCard';
import { useStudentRoster } from '@/hooks/use-student-roster';
import { useAttendanceStore } from '@/store/attendance.store';
import { useAuthStore } from '@/store/auth.store';
import { AttendanceStatus, AttendanceType, StudentWithAttendance } from '@minaker/shared-types';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/**
 * Conductor Student Manifest
 *
 * Shows all students assigned to this conductor's bus route.
 * Conductor taps to mark boarding/alighting for each student.
 * Same StudentAttendanceCard component used by gatekeeper — consistent UX.
 */
export default function ConductorManifestScreen() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { markStudent } = useAttendanceStore();

  // For conductor, we show bus_boarding marks by default
  const { students, loading, refetch } = useStudentRoster({
    attendanceType: AttendanceType.BUS_BOARDING,
  });

  const filtered = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q)
    );
  });

  const handleMark = useCallback(
    (student: StudentWithAttendance, status: AttendanceStatus) => {
      markStudent({
        studentId: student.id,
        studentName: student.fullName,
        attendanceType: AttendanceType.BUS_BOARDING,
        status,
        markedBy: user!.id,
      });
    },
    [markStudent, user],
  );

  return (
    <View style={styles.container as any}>
      <TextInput
        style={styles.search as any}
        placeholder="🔍  Search student…"
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1a73e8" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <StudentAttendanceCard
              student={item}
              onMark={(status) => handleMark(item, status)}
            />
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
          ListEmptyComponent={
            <Text style={styles.empty as any}>No students found for this route</Text>
          }
          contentContainerStyle={{ paddingBottom: 80 } as any}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  search: {
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
