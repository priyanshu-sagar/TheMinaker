import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { ClassSelector } from '@/components/teacher/ClassSelector';
import { TestListItem } from '@/components/teacher/TestListItem';
import { TestDetailModal } from '@/components/teacher/TestDetailModal';
import { CreateTestModal } from '@/components/teacher/CreateTestModal';
import { MarkedTest, useTeacherStore } from '@/store/teacher.store';

export default function AcademicsScreen() {
  const selectedClassId = useTeacherStore((state) => state.selectedClassId);
  const tests = useTeacherStore((state) => state.tests);
  const students = useTeacherStore((state) => state.students);
  const createTest = useTeacherStore((state) => state.createTest);
  const [selectedTest, setSelectedTest] = useState<MarkedTest | null>(null);
  const [creating, setCreating] = useState(false);

  const classTests = useMemo(() => tests.filter((test) => test.classId === selectedClassId), [tests, selectedClassId]);
  const classStudents = useMemo(() => students.filter((student) => student.classId === selectedClassId), [students, selectedClassId]);
  const liveTest = classTests.find((test) => test.id === selectedTest?.id) ?? selectedTest;

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ClassSelector subtitle="Tests and marks for this class" />
        <FlatList
          data={classTests}
          keyExtractor={(test) => test.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={<Text style={styles.empty}>No tests for this class yet.</Text>}
          renderItem={({ item, index }) => (
            <FadeInRow index={index}>
              <TestListItem test={item} onPress={() => setSelectedTest(item)} />
            </FadeInRow>
          )}
        />
        <AnimatedPressable haptic="medium" onPress={() => setCreating(true)} style={styles.fab}>
          <Plus color="#fff" size={26} strokeWidth={2.6} />
        </AnimatedPressable>
      </SafeAreaView>

      <TestDetailModal test={liveTest} roster={classStudents} onClose={() => setSelectedTest(null)} />
      <CreateTestModal
        visible={creating}
        classId={selectedClassId}
        classStudents={classStudents}
        onClose={() => setCreating(false)}
        onCreate={createTest}
      />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 3, paddingTop: spacing.sm },
  empty: { textAlign: 'center', color: colors.textMuted, paddingTop: spacing.xl },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: statusColors.academics,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
