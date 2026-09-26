import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { Fab } from '@/components/glass/Fab';
import { TestListItem } from '@/components/teacher/TestListItem';
import { TestDetailModal } from '@/components/teacher/TestDetailModal';
import { CreateTestModal } from '@/components/teacher/CreateTestModal';
import { MarkedTest, useTeacherStore } from '@/store/teacher.store';

export default function AcademicsScreen() {
  const tests = useTeacherStore((state) => state.tests);
  const myClass = useTeacherStore((state) => state.myClass);
  const createTest = useTeacherStore((state) => state.createTest);
  const [selectedTest, setSelectedTest] = useState<MarkedTest | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Academics & Marks</Text>
          <Text style={styles.subtitle}>Tap a test to enter or review scores.</Text>
        </View>

        <FlatList
          data={tests}
          keyExtractor={(test) => test.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => <TestListItem test={item} onPress={() => setSelectedTest(item)} />}
        />

        <Fab label="+" onPress={() => setCreating(true)} color={statusColors.academics} />
      </SafeAreaView>

      <TestDetailModal test={selectedTest} roster={myClass} onClose={() => setSelectedTest(null)} />
      <CreateTestModal visible={creating} onClose={() => setCreating(false)} onCreate={createTest} />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, gap: 4 },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
});
