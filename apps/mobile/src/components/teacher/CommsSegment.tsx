import { StyleSheet, Text, View } from 'react-native';
import { Megaphone, Send } from 'lucide-react-native';
import { colors, spacing, radius, shadows, typography } from '@/design/tokens';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { CommsChannel } from '@/store/teacher.store';

const OPTIONS: Array<{ key: CommsChannel; label: string; icon: typeof Megaphone }> = [
  { key: 'Announcement', label: 'Class Announcements', icon: Megaphone },
  { key: 'DirectReport', label: 'Direct Reports', icon: Send },
];

export function CommsSegment({
  value,
  onChange,
  allowAnnouncements,
}: {
  value: CommsChannel;
  onChange: (value: CommsChannel) => void;
  allowAnnouncements: boolean;
}) {
  const options = allowAnnouncements ? OPTIONS : OPTIONS.filter((option) => option.key === 'DirectReport');
  return (
    <GlassCard padded={false} style={shadows.sm}>
      <View style={styles.track}>
        {options.map((option) => {
          const active = option.key === value;
          const Icon = option.icon;
          return (
            <AnimatedPressable key={option.key} haptic="selection" style={styles.segment} onPress={() => onChange(option.key)}>
              <View style={styles.labelRow}>
                <Icon color={active ? colors.primary : colors.textMuted} size={14} strokeWidth={2.4} />
                <Text style={[styles.label, active ? styles.labelActive : null]}>{option.label}</Text>
              </View>
              {active ? <View style={styles.indicator} /> : null}
            </AnimatedPressable>
          );
        })}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row' },
  segment: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { ...typography.caption, fontWeight: '600', color: colors.textMuted },
  labelActive: { color: colors.primary },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '70%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
