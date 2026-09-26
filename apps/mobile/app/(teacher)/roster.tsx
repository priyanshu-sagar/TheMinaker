import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { StudentRosterCard } from '@/components/teacher/StudentRosterCard';
import { useTeacherStore } from '@/store/teacher.store';

export default function ClassRosterScreen() {
  const myClass = useTeacherStore((state) => state.myClass);
  const markClassAttendance = useTeacherStore((state) => state.markClassAttendance);
  const awardBehaviorPoint = useTeacherStore((state) => state.awardBehaviorPoint);

  const { presentCount, absentCount } = useMemo(
    () => ({
      presentCount: myClass.filter((student) => student.classAttendance === 'Present' || student.classAttendance === 'Late').length,
      absentCount: myClass.filter((student) => student.classAttendance === 'Absent').length,
    }),
    [myClass],
  );

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Class 6-B Roster</Text>
          <Text style={styles.summary}>
            <Text style={{ color: statusColors.present, fontWeight: '700' }}>Present: {presentCount}</Text>
            {'  ·  '}
            <Text style={{ color: statusColors.absent, fontWeight: '700' }}>Absent: {absentCount}</Text>
          </Text>
        </View>

        <FlatList
          data={myClass}
          keyExtractor={(student) => student.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <StudentRosterCard
              student={item}
              onMarkAttendance={(status) => markClassAttendance(item.id, status)}
              onAdjustPoints={(amount) => awardBehaviorPoint(item.id, amount)}
            />
          )}
        />
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, gap: 4 },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  summary: { fontSize: 13 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
});
