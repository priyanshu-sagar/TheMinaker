import { Linking, StyleSheet, Text, View } from 'react-native';
import { Phone, Mail, TrendingUp, ClipboardList, MessageCircle } from 'lucide-react-native';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
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
        student.progressPercent >= 80 ? statusColors.present :
        student.progressPercent >= 60 ? statusColors.info : statusColors.late;

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
                            style={[styles.contactBtn, { backgroundColor: statusColors.presentBg }]}
                        >
                            <Phone color={statusColors.present} size={16} strokeWidth={2.4} />
                            <Text style={[styles.contactBtnText, { color: statusColors.present }]}>{student.parentPhone}</Text>
                        </AnimatedPressable>
                    </View>
                    <View style={styles.contactRow}>
                        <AnimatedPressable
                            haptic="medium"
                            onPress={() => Linking.openURL(`mailto:${student.parentEmail}`).catch(() => undefined)}
                            style={[styles.contactBtn, { backgroundColor: statusColors.infoBg }]}
                        >
                            <Mail color={statusColors.info} size={16} strokeWidth={2.4} />
                            <Text style={[styles.contactBtnText, { color: statusColors.info }]}>{student.parentEmail}</Text>
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
                    <ClipboardList color={statusColors.academics} size={16} strokeWidth={2.4} />
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
                style={styles.messageBtn}
            >
                <MessageCircle color="#fff" size={16} strokeWidth={2.4} />
                <Text style={styles.messageText}>Message Parent</Text>
            </AnimatedPressable>
        </GlassModal>
    );
}

const styles = StyleSheet.create({
    subtitle: { fontSize: 13, color: colors.textMuted, marginTop: -spacing.xs },
    section: { gap: spacing.sm },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.4 },
    contactCard: { gap: spacing.sm },
    parentName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    contactRow: {},
    contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 },
    contactBtnText: { fontSize: 13, fontWeight: '700' },
    progressCard: { gap: 6 },
    progressBarWrap: { height: 10, borderRadius: 5, backgroundColor: 'rgba(148,163,184,0.2)', overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 5 },
    progressText: { fontSize: 12, fontWeight: '700' },
    empty: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic' },
    scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(148,163,184,0.25)' },
    scoreInfo: { flex: 1 },
    scoreTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
    scoreMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    scoreValue: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
    scorePct: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
    messageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, borderRadius: radius.md, backgroundColor: statusColors.info, marginTop: spacing.sm },
    messageText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
