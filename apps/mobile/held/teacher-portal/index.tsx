import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, shadows, glass, typography } from '@/design/tokens';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { ClassSelector } from '@/components/teacher/ClassSelector';
import { AddClassTile, ScheduleCard } from '@/components/teacher/ScheduleCard';
import { MaterialsList } from '@/components/teacher/MaterialsList';
import { UpcomingTasksCard } from '@/components/teacher/UpcomingTasksCard';
import { UploadMaterialModal } from '@/components/teacher/UploadMaterialModal';
import { EditTimetableModal } from '@/components/teacher/ManagementModals';
import { parsePeriodTime, useSelectedClass, useTeacherStore } from '@/store/teacher.store';
import { useAuthStore } from '@/store/auth.store';

export default function TeacherDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const selected = useSelectedClass();
  const selectedClassId = useTeacherStore((state) => state.selectedClassId);
  const classes = useTeacherStore((state) => state.classes);
  const schedule = useTeacherStore((state) => state.schedule);
  const materials = useTeacherStore((state) => state.materials);
  const tests = useTeacherStore((state) => state.tests);
  const students = useTeacherStore((state) => state.students);
  const communications = useTeacherStore((state) => state.communications);
  const uploadMaterial = useTeacherStore((state) => state.uploadMaterial);
  const removeMaterial = useTeacherStore((state) => state.removeMaterial);
  const [uploading, setUploading] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(false);

  const classSchedule = useMemo(
    () => schedule.filter((period) => period.classId === selectedClassId).sort((a, b) => a.period - b.period),
    [schedule, selectedClassId],
  );
  const classMaterials = useMemo(
    () => materials.filter((item) => item.classId === selectedClassId),
    [materials, selectedClassId],
  );

  const { activeId, summary } = useMemo(() => {
    const now = new Date();
    let currentId: string | null = null;
    let nextLabel: string | null = null;
    for (const period of classSchedule) {
      const start = parsePeriodTime(period.time, now);
      const end = parsePeriodTime(period.endTime, now);
      if (now >= start && now <= end) currentId = period.id;
      if (!nextLabel && now < start) {
        const minutesAway = Math.round((start.getTime() - now.getTime()) / 60000);
        nextLabel = `Period ${period.period} (${period.subject}) in ${minutesAway} min`;
      }
    }
    return { activeId: currentId, summary: currentId ? 'Class in session now' : nextLabel ?? 'No more periods today' };
  }, [classSchedule]);

  const ungradedTests = tests.filter(
    (test) => test.classId === selectedClassId && test.scores.some((entry) => entry.score === null),
  ).length;
  const pendingRoster = selected?.isClassTeacher
    ? students.filter((student) => student.classId === selectedClassId && student.classAttendance === 'Pending').length
    : 0;
  const parentMessages = communications.filter(
    (message) => message.classId === selectedClassId && message.channel === 'DirectReport' && message.route === 'Parent',
  ).length;

  return (
    <MeshBackground>
      {/* Decorative orbs */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: radius.full,
          backgroundColor: glass.orb1,
          opacity: 0.6,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 120,
          left: -80,
          width: 280,
          height: 280,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.greeting}>Good morning, {user?.fullName?.split(' ')[0] ?? 'Teacher'}</Text>
          <ClassSelector subtitle={summary} />

          <GlassCard style={[styles.summaryCard, shadows.sm]} padded={false}>
            <View style={styles.summaryInner}>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          </GlassCard>

          <Text style={styles.sectionTitle}>Today's timetable</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scheduleRow}>
            {classSchedule.map((period) => (
              <ScheduleCard
                key={period.id}
                period={period}
                active={period.id === activeId}
                className={classes.find((cls) => cls.id === period.classId)?.name}
              />
            ))}
            <AddClassTile onPress={() => setEditingTimetable(true)} />
          </ScrollView>

          <UpcomingTasksCard
            ungradedTests={ungradedTests}
            pendingRoster={pendingRoster}
            parentMessages={parentMessages}
          />

          <MaterialsList
            materials={classMaterials}
            canManage
            onUpload={() => setUploading(true)}
            onRemove={removeMaterial}
          />
        </ScrollView>
      </SafeAreaView>

      <UploadMaterialModal
        visible={uploading}
        onClose={() => setUploading(false)}
        onUpload={(input) => uploadMaterial({ ...input, classId: selectedClassId })}
      />
      <EditTimetableModal visible={editingTimetable} classId={selectedClassId} onClose={() => setEditingTimetable(false)} />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.xl, gap: spacing.md },
  greeting: { ...typography.hero, fontSize: 24, color: colors.textPrimary, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  summaryCard: { marginHorizontal: spacing.lg },
  summaryInner: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  summaryText: { ...typography.caption, fontWeight: '700', color: colors.info },
  sectionTitle: { ...typography.heading, color: colors.textPrimary, paddingHorizontal: spacing.lg },
  scheduleRow: { paddingHorizontal: spacing.lg, gap: spacing.sm },
});
