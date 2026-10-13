import { Linking, StyleSheet, Text, View } from 'react-native';
import { Phone, Mail, TrendingUp, ClipboardList, MessageCircle } from 'lucide-react-native';
import { colors, radius, spacing, palette, portalAccents, shadows, typography } from '@/design/tokens';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { RosterStudent } from '@/store/teacher.store';

/**
 * V3 "Student Details" bottom sheet — parent contact, progress bar, and
 * past test scores. Includes a shortcut to Message Parent (feeds into
 * the Comms > Direct Reports flow via the caller-provided callback).
 */
export function StudentDetailsModal({
    student,
    onClose,
    onMessageParent,
}: {
    student: RosterStudent | null;
    onClose: () => void;
    onMessageParent: (studentId: string) => void;
}) {
    if (!student) {
        return <GlassModal visible={false} title="" onClose={onClose}><View /></GlassModal>;
    }

    const progressColor =
        student.progressPercent >= 80 ? colors.success :
        student.progressPercent >= 60 ? colors.info : colors.warning;

    return (
        <GlassModal visible={true} title={student.name} onClose={onClose}>
            <Text style={styles.subtitle}>Roll {student.rollNumber}</Text>

            {/* Parent contact */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Parent Contact</Text>
                <View style={styles.contactCard}>
                    <Text style={styles.parentName}>{student.parentName}</Text>
                    <View style={styles.contactRow}>
                        <AnimatedPressable
                            haptic="medium"
                            onPress={() => Linking.openURL(`tel:${student.parentPhone}`).catch(() => undefined)}
                            style={[styles.contactBtn, { backgroundColor: colors.successBg }]}
                        >
                            <Phone color={colors.success} size={16} strokeWidth={2.4} />
                            <Text style={[styles.contactBtnText, { color: colors.success }]}>{student.parentPhone}</Text>
                        </AnimatedPressable>
                    </View>
                    <View style={styles.contactRow}>
                        <AnimatedPressable
                            haptic="medium"
                            onPress={() => Linking.openURL(`mailto:${student.parentEmail}`).catch(() => undefined)}
                            style={[styles.contactBtn, { backgroundColor: colors.infoBg }]}
                        >
                            <Mail color={colors.info} size={16} strokeWidth={2.4} />
                            <Text style={[styles.contactBtnText, { color: colors.info }]}>{student.parentEmail}</Text>
                        </AnimatedPressable>
                    </View>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <TrendingUp color={progressColor} size={16} strokeWidth={2.4} />
                    <Text style={styles.sectionTitle}>Academic Progress</Text>
                </View>
                <View style={styles.progressCard}>
                    <View style={styles.progressBarWrap}>
                        <View style={[styles.progressBar, { width: `${student.progressPercent}%`, backgroundColor: progressColor }]} />
                    </View>
                    <Text style={[styles.progressText, { color: progressColor }]}>{student.progressPercent}% overall</Text>
                </View>
            </View>

            {/* Past scores */}
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <ClipboardList color={portalAccents.teacher.from} size={16} strokeWidth={2.4} />
                    <Text style={styles.sectionTitle}>Past Test Scores</Text>
                </View>
                {student.pastScores.length === 0 ? (
                    <Text style={styles.empty}>No graded tests yet.</Text>
                ) : (
                    student.pastScores.map((score, index) => {
                        const pct = Math.round((score.score / score.maxMarks) * 100);
                        return (
                            <View key={`${score.testTitle}-${index}`} style={styles.scoreRow}>
                                <View style={styles.scoreInfo}>
                                    <Text style={styles.scoreTitle}>{score.testTitle}</Text>
                                    <Text style={styles.scoreMeta}>{score.subject} · {score.date}</Text>
                                </View>
                                <Text style={styles.scoreValue}>
                                    {score.score}/{score.maxMarks}
                                    <Text style={styles.scorePct}> ({pct}%)</Text>
                                </Text>
                            </View>
                        );
                    })
                )}
            </View>

            <AnimatedPressable
                haptic="medium"
                onPress={() => { onMessageParent(student.id); onClose(); }}
                style={[styles.messageBtn, shadows.sm]}
            >
                <MessageCircle color={palette.white} size={16} strokeWidth={2.4} />
                <Text style={styles.messageText}>Message Parent</Text>
            </AnimatedPressable>
        </GlassModal>
    );
}

const styles = StyleSheet.create({
    subtitle: { ...typography.caption, color: colors.textMuted, marginTop: -spacing.xs },
    section: { gap: spacing.sm },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sectionTitle: { ...typography.overline, color: colors.textPrimary },
    contactCard: { gap: spacing.sm },
    parentName: { ...typography.bodyBold, color: colors.textPrimary },
    contactRow: {},
    contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 },
    contactBtnText: { fontSize: 13, fontWeight: '700' },
    progressCard: { gap: 6 },
    progressBarWrap: { height: 10, borderRadius: radius.full, backgroundColor: colors.divider, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: radius.full },
    progressText: { fontSize: 12, fontWeight: '700' },
    empty: { ...typography.body, fontSize: 13, color: colors.textMuted, fontStyle: 'italic' },
    scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
    scoreInfo: { flex: 1 },
    scoreTitle: { ...typography.caption, fontWeight: '700', color: colors.textPrimary },
    scoreMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    scoreValue: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
    scorePct: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
    messageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, borderRadius: radius.md, backgroundColor: portalAccents.teacher.from, marginTop: spacing.sm },
    messageText: { color: palette.white, fontSize: 15, fontWeight: '700' },
});
