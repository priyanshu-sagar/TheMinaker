import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Save } from 'lucide-react-native';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { SearchBar } from '@/components/glass/SearchBar';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { ClassSelector } from '@/components/teacher/ClassSelector';
import { StudentRosterCard } from '@/components/teacher/StudentRosterCard';
import { StudentDetailsModal } from '@/components/teacher/StudentDetailsModal';
import { RosterStudent, useSelectedClass, useTeacherStore } from '@/store/teacher.store';

export default function ClassRosterScreen() {
  const selected = useSelectedClass();
  const selectedClassId = useTeacherStore((state) => state.selectedClassId);
  const students = useTeacherStore((state) => state.students);
  const markClassAttendance = useTeacherStore((state) => state.markClassAttendance);
  const saveClassAttendance = useTeacherStore((state) => state.saveClassAttendance);
  const [query, setQuery] = useState('');
  const [details, setDetails] = useState<RosterStudent | null>(null);

  const roster = useMemo(() => {
    const mine = students.filter((student) => student.classId === selectedClassId);
    const needle = query.trim().toLowerCase();
    if (!needle) return mine;
    return mine.filter((student) => student.name.toLowerCase().includes(needle) || student.rollNumber.toLowerCase().includes(needle));
  }, [students, selectedClassId, query]);

  const presentCount = roster.filter((student) => student.classAttendance === 'Present').length;
  const absentCount = roster.filter((student) => student.classAttendance === 'Absent').length;
  const isHomeroom = selected?.isClassTeacher ?? false;

  function onSave() {
    saveClassAttendance(selectedClassId);
    Alert.alert('Attendance saved', `${presentCount} present · ${absentCount} absent for ${selected?.name ?? 'this class'}.`);
  }

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ClassSelector />
        {!isHomeroom ? (
          <View style={styles.locked}>
            <Text style={styles.lockedTitle}>Roster is for your homeroom</Text>
            <Text style={styles.lockedBody}>Switch to a class where you are the class teacher to mark attendance.</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.summary}>
                <Text style={{ color: statusColors.present, fontWeight: '700' }}>Present {presentCount}</Text>
                {'  ·  '}
                <Text style={{ color: statusColors.absent, fontWeight: '700' }}>Absent {absentCount}</Text>
              </Text>
            </View>
            <View style={styles.searchWrap}>
              <SearchBar value={query} onChangeText={setQuery} placeholder="Search name or roll" />
            </View>
            <FlatList
              data={roster}
              keyExtractor={(student) => student.id}
              contentContainerStyle={styles.list}
              ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
              ListEmptyComponent={<Text style={styles.empty}>No students match that search.</Text>}
              renderItem={({ item, index }) => (
                <FadeInRow index={index}>
                  <StudentRosterCard
                    student={item}
                    onMarkAttendance={(status) => markClassAttendance(item.id, status)}
                    onOpenDetails={() => setDetails(item)}
                  />
                </FadeInRow>
              )}
            />
            <AnimatedPressable haptic="medium" onPress={onSave} style={styles.saveBtn}>
              <Save color="#fff" size={16} strokeWidth={2.4} />
              <Text style={styles.saveText}>Save Attendance</Text>
            </AnimatedPressable>
          </>
        )}
      </SafeAreaView>

      <StudentDetailsModal
        student={details}
        onClose={() => setDetails(null)}
        onMessageParent={(studentId) => {
          router.push({ pathname: '/(teacher)/comms', params: { reportStudentId: studentId } });
        }}
      />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  summary: { fontSize: 13 },
  searchWrap: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 96 },
  empty: { textAlign: 'center', color: colors.textMuted, paddingTop: spacing.xl },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  lockedTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  lockedBody: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  saveBtn: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: statusColors.present,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
