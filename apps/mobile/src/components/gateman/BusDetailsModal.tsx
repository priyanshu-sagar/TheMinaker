import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius, typography } from '@/design/tokens';
import { GlassModal } from '@/components/glass/GlassModal';
import { StatusBadge } from './StatusBadge';
import { FleetBus, getBusStats, useGatemanStore } from '@/store/gateman.store';

export function BusDetailsModal({ bus, onClose }: { bus: FleetBus | null; onClose: () => void }) {
  const roster = useGatemanStore((state) => state.roster);
  const stats = bus ? getBusStats(roster, bus.id) : null;

  return (
    <GlassModal visible={bus !== null} title={bus?.busNumber ?? ''} onClose={onClose}>
      {bus && stats ? (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.route}>{bus.routeName}</Text>
            <StatusBadge label={bus.status} tone={bus.status === 'Online' ? 'online' : 'offline'} />
          </View>
          <Text style={styles.conductor}>Conductor: {bus.conductorName}</Text>

          <View style={styles.statsGrid}>
            <StatTile label="Total Students" value={stats.totalStudents} fg={colors.textPrimary} bg={colors.divider} />
            <StatTile label="Boarded (In)" value={stats.boardedIn} fg={colors.boarded} bg={colors.boardedBg} />
            <StatTile label="Dropped (Out)" value={stats.droppedOut} fg={colors.dropped} bg={colors.droppedBg} />
            <StatTile label="Absent (Not coming)" value={stats.absent} fg={colors.offline} bg={colors.offlineBg} />
          </View>
        </>
      ) : null}
    </GlassModal>
  );
}

function StatTile({ label, value, fg, bg }: { label: string; value: number; fg: string; bg: string }) {
  return (
    <View style={[styles.tile, { backgroundColor: bg }]}>
      <Text style={[styles.tileValue, { color: fg }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  route: { ...typography.heading, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  conductor: { ...typography.caption, color: colors.textMuted },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  tile: { width: '47%', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  tileValue: { fontSize: 22, fontWeight: '800' },
  tileLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
});
