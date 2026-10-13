import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { FadeInRow } from '@/components/glass/FadeInList';
import { StatusPill } from '@/components/shared/StatusPill';
import { colors, glass, radius, shadows, spacing, typography } from '@/design/tokens';

export default function ParentNotificationsScreen() {
  return (
    <MeshBackground>
      {/* Decorative floating orbs */}
      <View
        style={{
          position: 'absolute',
          top: -50,
          left: -40,
          width: 200,
          height: 200,
          borderRadius: radius.full,
          backgroundColor: glass.orb3,
          opacity: 0.6,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 120,
          right: -50,
          width: 250,
          height: 250,
          borderRadius: radius.full,
          backgroundColor: glass.orb1,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <FadeInRow index={0}>
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Text style={typography.title}>Alerts & Notifications</Text>
                <StatusPill variant="info" label="All Caught Up" />
              </View>
              <Text style={typography.subtitle}>Bus arrival alerts and attendance updates.</Text>
            </View>
          </FadeInRow>

          <FadeInRow index={1}>
            <GlassCard style={[styles.card, shadows.md]}>
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔔</Text>
                <Text style={[typography.heading, { textAlign: 'center', marginBottom: spacing.xs }]}>
                  No New Alerts
                </Text>
                <Text
                  style={[
                    typography.body,
                    { textAlign: 'center', color: colors.textMuted, paddingHorizontal: spacing.md },
                  ]}
                >
                  You're all caught up! Alerts will appear here.
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    marginBottom: spacing.sm,
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
