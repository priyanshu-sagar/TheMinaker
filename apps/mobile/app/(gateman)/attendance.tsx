import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, glass, typography } from '@/design/tokens';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { FadeInRow } from '@/components/glass/FadeInList';
import { BusSelectorPills } from '@/components/gateman/BusSelectorPills';
import { SearchBar } from '@/components/glass/SearchBar';
import { StudentRosterRow } from '@/components/gateman/StudentRosterRow';
import { useGatemanStore } from '@/store/gateman.store';

export default function MasterAttendanceScreen() {
  const fleet = useGatemanStore((state) => state.fleet);
  const roster = useGatemanStore((state) => state.roster);
  const updateAttendanceStatus = useGatemanStore((state) => state.updateAttendanceStatus);
  const [selectedBusId, setSelectedBusId] = useState(fleet[0]?.id ?? '');
  const [query, setQuery] = useState('');

  const busRoster = useMemo(() => {
    const rows = roster.filter((entry) => entry.busId === selectedBusId);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((entry) => entry.studentName.toLowerCase().includes(q));
  }, [roster, selectedBusId, query]);

  return (
    <MeshBackground>
      {/* Decorative orbs */}
      <View
        style={{
          position: 'absolute',
          top: -50,
          right: -30,
          width: 220,
          height: 220,
          borderRadius: radius.full,
          backgroundColor: glass.orb1,
          opacity: 0.6,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 140,
          left: -70,
          width: 260,
          height: 260,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Master Attendance</Text>
          <Text style={styles.subtitle}>Manual override — select a route, then update each student.</Text>
        </View>

        <View style={styles.selector}>
          <BusSelectorPills buses={fleet} selectedId={selectedBusId} onSelect={setSelectedBusId} />
        </View>

        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search student by name" />
        </View>

        <FlatList
          data={busRoster}
          keyExtractor={(entry) => entry.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={<Text style={styles.empty}>No students match this route or search.</Text>}
          renderItem={({ item, index }) => (
            <FadeInRow index={index}>
              <StudentRosterRow
                studentName={item.studentName}
                attendanceStatus={item.attendanceStatus}
                statusUpdatedAt={item.statusUpdatedAt}
                onChange={(status) => updateAttendanceStatus(item.id, status)}
              />
            </FadeInRow>
          )}
        />
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xs },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textMuted },
  selector: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  searchWrap: { marginTop: spacing.md, marginHorizontal: spacing.lg },
  list: { padding: spacing.lg },
  empty: { ...typography.body, textAlign: 'center', color: colors.textMuted, paddingTop: spacing.xl },
});
