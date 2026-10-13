import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, ClipboardList, MessagesSquare } from 'lucide-react-native';
import { colors, radius, spacing, portalAccents, shadows, typography } from '@/design/tokens';
import { GlassCard } from '@/components/glass/GlassCard';

/**
 * Compact "what's on your plate" summary that lives on the V3 dashboard.
 * Aggregates: ungraded tests, students still marked "Pending" in the
 * homeroom roster, and un-acknowledged parent messages (mocked).
 */
export function UpcomingTasksCard({
    ungradedTests,
    pendingRoster,
    parentMessages,
}: {
    ungradedTests: number;
    pendingRoster: number;
    parentMessages: number;
}) {
    const items = [
        { key: 'tests', icon: ClipboardList, label: 'Tests to grade', value: ungradedTests, fg: portalAccents.teacher.from, bg: colors.checkedOutBg },
        { key: 'roster', icon: CheckCircle2, label: 'Roster pending', value: pendingRoster, fg: colors.info, bg: colors.infoBg },
        { key: 'parents', icon: MessagesSquare, label: 'Parent replies', value: parentMessages, fg: colors.warning, bg: colors.warningBg },
    ] as const;

    return (
        <GlassCard style={shadows.sm}>
            <Text style={styles.title}>Upcoming Tasks</Text>
            <View style={styles.row}>
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <View key={item.key} style={styles.item}>
                            <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                                <Icon color={item.fg} size={18} strokeWidth={2.4} />
                            </View>
                            <Text style={styles.value}>{item.value}</Text>
                            <Text style={styles.label}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    title: { ...typography.heading, color: colors.textPrimary, marginBottom: spacing.md },
    row: { flexDirection: 'row', gap: spacing.sm },
    item: { flex: 1, alignItems: 'center', gap: 4 },
    iconWrap: { width: 44, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
    value: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
    label: { ...typography.caption, fontWeight: '600', color: colors.textMuted, textAlign: 'center' },
});
