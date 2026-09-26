import { Pressable, StyleSheet, Text, View } from 'react-native';
import { glass } from '@/design/glass-theme';
import { colors, spacing, statusColors } from '@/design/gateman-theme';
import { GlassCard } from '@/components/glass/GlassCard';

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
    <GlassCard padded={false} style={styles.wrap}>
      <View style={styles.track}>
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          const count = counts[tab.key];
          return (
            <Pressable key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)}>
              <Text style={[styles.label, isActive ? styles.labelActive : null]}>{tab.label}</Text>
              {count > 0 ? (
                <View style={[styles.badge, tab.key === 'alerts' ? styles.badgeAmber : null]}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              ) : null}
              {isActive ? <View style={styles.indicator} /> : null}
            </Pressable>
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
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  labelActive: { color: colors.primary },
  indicator: { position: 'absolute', bottom: 0, height: 3, width: '60%', borderRadius: 2, backgroundColor: colors.primary },
  badge: {
    position: 'absolute',
    top: 4,
    right: '22%',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: statusColors.offline,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeAmber: { backgroundColor: statusColors.amber },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
