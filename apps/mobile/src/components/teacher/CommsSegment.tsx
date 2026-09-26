import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/design/teacher-theme';
import { GlassCard } from '@/components/glass/GlassCard';
import { CommsType } from '@/store/teacher.store';

export function CommsSegment({ value, onChange }: { value: CommsType; onChange: (value: CommsType) => void }) {
  const options: CommsType[] = ['Broadcast', 'Complaint'];
  return (
    <GlassCard padded={false}>
      <View style={styles.track}>
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable key={option} style={styles.segment} onPress={() => onChange(option)}>
              <Text style={[styles.label, active ? styles.labelActive : null]}>
                {option === 'Broadcast' ? 'Broadcasts' : 'Complaints / Direct'}
              </Text>
              {active ? <View style={styles.indicator} /> : null}
            </Pressable>
          );
        })}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row' },
  segment: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  labelActive: { color: colors.primary },
  indicator: { position: 'absolute', bottom: 0, height: 3, width: '60%', borderRadius: 2, backgroundColor: colors.primary },
});
