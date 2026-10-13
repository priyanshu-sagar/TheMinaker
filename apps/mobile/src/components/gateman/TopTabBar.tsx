import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius, palette, shadows, typography } from '@/design/tokens';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';

export type InboxTabKey = 'profiles' | 'edits' | 'alerts';

export function TopTabBar({
  active,
  onChange,
  counts,
}: {
  active: InboxTabKey;
  onChange: (key: InboxTabKey) => void;
  counts: Record<InboxTabKey, number>;
}) {
  const tabs: Array<{ key: InboxTabKey; label: string }> = [
    { key: 'profiles', label: 'Profiles' },
    { key: 'edits', label: 'Edits' },
    { key: 'alerts', label: 'Geofence' },
  ];

  return (
    <GlassCard padded={false} style={[styles.wrap, shadows.sm]}>
      <View style={styles.track}>
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          const count = counts[tab.key];
          return (
            <AnimatedPressable key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)}>
              <Text style={[styles.label, isActive ? styles.labelActive : null]}>{tab.label}</Text>
              {count > 0 ? (
                <View style={[styles.badge, tab.key === 'alerts' ? styles.badgeAmber : null]}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              ) : null}
              {isActive ? <View style={styles.indicator} /> : null}
            </AnimatedPressable>
          );
        })}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: spacing.lg },
  track: { flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, gap: 4 },
  label: { ...typography.label, color: colors.textMuted },
  labelActive: { color: colors.primary },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '60%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: '22%',
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.offline,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeAmber: { backgroundColor: colors.warning },
  badgeText: { color: palette.white, fontSize: 10, fontWeight: '700' },
});
