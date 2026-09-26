import { StyleSheet, Text, View } from 'react-native';
import { Clock, MapPin, Plus } from 'lucide-react-native';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { SchedulePeriod } from '@/store/teacher.store';

/**
 * V3 horizontal timetable tile (dashboard). Compact card, lucide icons,
 * subtle active-state glow when the period is in session.
 */
export function ScheduleCard({ period, active, className }: { period: SchedulePeriod; active: boolean; className?: string }) {
    return (
        <GlassCard padded={false} style={[styles.card, active ? styles.activeShadow : undefined]}>
            <View style={[styles.body, active ? styles.activeBody : null]}>
                <View style={styles.headerRow}>
                    <View style={styles.periodBadge}>
                        <Text style={styles.periodText}>P{period.period}</Text>
                    </View>
                    {active ? (
                        <View style={styles.nowTag}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.nowText}>Now</Text>
                        </View>
                    ) : null}
                </View>
                <Text style={styles.subject} numberOfLines={2}>{period.subject}</Text>
                {className ? <Text style={styles.classLine} numberOfLines={1}>{className}</Text> : null}
                <View style={styles.metaRow}>
                    <Clock color={colors.textMuted} size={12} strokeWidth={2.2} />
                    <Text style={styles.meta}>{period.time}</Text>
                </View>
                <View style={styles.metaRow}>
                    <MapPin color={colors.textMuted} size={12} strokeWidth={2.2} />
                    <Text style={styles.meta}>{period.room}</Text>
                </View>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    card: { width: 172 },
    activeShadow: { shadowColor: statusColors.info, shadowOpacity: 0.3, shadowRadius: 14 },
    body: { padding: spacing.md, gap: 4, borderRadius: 14, minHeight: 138 },
    activeBody: { borderWidth: 1.5, borderColor: statusColors.info, backgroundColor: statusColors.infoBg },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    periodBadge: { borderRadius: 8, backgroundColor: 'rgba(148,163,184,0.18)', paddingHorizontal: 8, paddingVertical: 3 },
    periodText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
    subject: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 4 },
    classLine: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    meta: { fontSize: 12, color: colors.textMuted },
    nowTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: statusColors.info, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
    pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
    nowText: { fontSize: 10, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
});

/** "Add class" tile that appears at the end of the horizontal timetable strip. */
export function AddClassTile({ onPress }: { onPress: () => void }) {
    return (
        <AnimatedPressable haptic="medium" onPress={onPress}>
            <GlassCard padded={false} style={styles.card}>
                <View style={[styles.body, addStyles.addBody]}>
                    <View style={addStyles.plusCircle}>
                        <Plus color="#8B5CF6" size={22} strokeWidth={2.8} />
                    </View>
                    <Text style={addStyles.addLabel}>Add Class</Text>
                    <Text style={addStyles.addMeta}>Assign a new period</Text>
                </View>
            </GlassCard>
        </AnimatedPressable>
    );
}

const addStyles = StyleSheet.create({
    addBody: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderWidth: 1.5, borderColor: 'rgba(148,163,184,0.35)', borderStyle: 'dashed', borderRadius: 14 },
    plusCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(139,92,246,0.15)', alignItems: 'center', justifyContent: 'center' },
    addLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
    addMeta: { fontSize: 11, color: colors.textMuted },
});
