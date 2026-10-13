import { StyleSheet, Text, View } from 'react-native';
import { Target, Users } from 'lucide-react-native';
import { colors, radius, spacing, portalAccents, shadows, typography } from '@/design/tokens';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { MarkedTest } from '@/store/teacher.store';

export function TestListItem({ test, onPress }: { test: MarkedTest; onPress: () => void }) {
    const graded = test.scores.filter((entry) => entry.score !== null).length;
    const total = test.scores.length;
    const isFullyGraded = total > 0 && graded === total;
    const targeted = test.targetStudentIds.length > 0;

    return (
        <AnimatedPressable haptic="light" onPress={onPress}>
            <GlassCard padded={false} style={shadows.sm}>
                <View style={styles.row}>
                    <View style={styles.info}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>{test.title}</Text>
                            {targeted ? (
                                <View style={styles.scopeChip}>
                                    <Target color={colors.warning} size={10} strokeWidth={2.6} />
                                    <Text style={styles.scopeText}>Targeted</Text>
                                </View>
                            ) : (
                                <View style={[styles.scopeChip, styles.scopeChipClass]}>
                                    <Users color={colors.info} size={10} strokeWidth={2.6} />
                                    <Text style={[styles.scopeText, styles.scopeTextClass]}>Whole Class</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.meta}>{test.subject} · Max {test.maxMarks} · {test.date}</Text>
                    </View>
                    <View style={[styles.badge, isFullyGraded ? styles.badgeDone : styles.badgePending]}>
                        <Text style={[styles.badgeText, isFullyGraded ? styles.badgeTextDone : styles.badgeTextPending]}>
                            {graded}/{total} graded
                        </Text>
                    </View>
                </View>
            </GlassCard>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, gap: spacing.md },
    info: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
    title: { ...typography.bodyBold, color: colors.textPrimary },
    scopeChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.warningBg, borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2 },
    scopeChipClass: { backgroundColor: colors.infoBg },
    scopeText: { fontSize: 9, fontWeight: '800', color: colors.warning, textTransform: 'uppercase', letterSpacing: 0.4 },
    scopeTextClass: { color: colors.info },
    meta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
    badge: { borderRadius: radius.xs, paddingHorizontal: 8, paddingVertical: 4 },
    badgeDone: { backgroundColor: colors.successBg },
    badgePending: { backgroundColor: colors.checkedOutBg },
    badgeText: { fontSize: 11, fontWeight: '700' },
    badgeTextDone: { color: colors.success },
    badgeTextPending: { color: portalAccents.teacher.from },
});
