import { StyleSheet, Text, View } from 'react-native';
import { Clock, MapPin, Plus } from 'lucide-react-native';
import { colors, radius, spacing, palette, portalAccents, shadows, typography } from '@/design/tokens';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { SchedulePeriod } from '@/store/teacher.store';

/**
 * V3 horizontal timetable tile (dashboard). Compact card, lucide icons,
 * subtle active-state glow when the period is in session.
 */
export function ScheduleCard({ period, active, className }: { period: SchedulePeriod; active: boolean; className?: string }) {
    return (
        <GlassCard padded={false} style={[styles.card, shadows.sm, active ? styles.activeShadow : undefined]}>
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
    activeShadow: { shadowColor: colors.info, shadowOpacity: 0.3, shadowRadius: 14 },
    body: { padding: spacing.md, gap: 4, borderRadius: radius.md, minHeight: 138 },
    activeBody: { borderWidth: 1.5, borderColor: colors.info, backgroundColor: colors.infoBg },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    periodBadge: { borderRadius: radius.xs, backgroundColor: colors.divider, paddingHorizontal: 8, paddingVertical: 3 },
    periodText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
    subject: { ...typography.bodyBold, color: colors.textPrimary, marginTop: 4 },
    classLine: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    meta: { ...typography.caption, color: colors.textMuted },
    nowTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.info, borderRadius: radius.xs, paddingHorizontal: 6, paddingVertical: 3 },
    pulseDot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: palette.white },
    nowText: { fontSize: 10, fontWeight: '800', color: palette.white, textTransform: 'uppercase' },
});

/** "Add class" tile that appears at the end of the horizontal timetable strip. */
export function AddClassTile({ onPress }: { onPress: () => void }) {
    return (
        <AnimatedPressable haptic="medium" onPress={onPress}>
            <GlassCard padded={false} style={[styles.card, shadows.sm]}>
                <View style={[styles.body, addStyles.addBody]}>
                    <View style={addStyles.plusCircle}>
                        <Plus color={portalAccents.teacher.from} size={22} strokeWidth={2.8} />
                    </View>
                    <Text style={addStyles.addLabel}>Add Class</Text>
                    <Text style={addStyles.addMeta}>Assign a new period</Text>
                </View>
            </GlassCard>
        </AnimatedPressable>
    );
}

const addStyles = StyleSheet.create({
    addBody: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderWidth: 1.5, borderColor: colors.borderStrong, borderStyle: 'dashed', borderRadius: radius.md },
    plusCircle: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.checkedOutBg, alignItems: 'center', justifyContent: 'center' },
    addLabel: { ...typography.bodyBold, fontSize: 13, color: colors.textPrimary },
    addMeta: { ...typography.caption, color: colors.textMuted },
});
