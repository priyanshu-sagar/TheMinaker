import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { FadeInRow } from '@/components/glass/FadeInList';
import { StatusPill } from '@/components/shared/StatusPill';
import { colors, glass, radius, shadows, spacing, typography } from '@/design/tokens';

export default function ParentAttendanceScreen() {
  return (
    <MeshBackground>
      {/* Decorative floating orbs */}
      <View
        style={{
          position: 'absolute',
          top: -40,
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
          left: -60,
          width: 260,
          height: 260,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <FadeInRow index={0}>
            <View style={styles.header}>
              <Text style={typography.title}>Attendance History</Text>
              <Text style={typography.subtitle}>Your child's daily attendance record.</Text>
            </View>
          </FadeInRow>

          {/* Quick summary card */}
          <FadeInRow index={1}>
            <GlassCard style={[styles.card, shadows.md]}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Today's Status</Text>
                  <StatusPill variant="online" label="School In Session" />
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Monthly Rate</Text>
                  <Text style={[typography.heading, { color: colors.primary }]}>96.4%</Text>
                </View>
              </View>
            </GlassCard>
          </FadeInRow>

          <FadeInRow index={2}>
            <GlassCard style={[styles.card, shadows.md]}>
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={[typography.heading, { textAlign: 'center', marginBottom: spacing.xs }]}>
                  No Records Yet Today
                </Text>
                <Text
                  style={[
                    typography.body,
                    { textAlign: 'center', color: colors.textMuted, paddingHorizontal: spacing.md },
                  ]}
                >
                  Attendance records will appear here once the school day begins.
                </Text>
              </View>
            </GlassCard>
          </FadeInRow>
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  card: {
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
});
