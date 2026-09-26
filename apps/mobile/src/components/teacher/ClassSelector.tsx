import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, GraduationCap, Check, Users } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { useTeacherStore, useSelectedClass } from '@/store/teacher.store';

/**
 * Global class-context header — renders on every V3 Teacher tab so the
 * teacher always sees which class is scoping the screen and can switch
 * without leaving the tab. Homeroom classes get a "Homeroom" badge.
 */
export function ClassSelector({ subtitle }: { subtitle?: string }) {
    const classes = useTeacherStore((state) => state.classes);
    const selectedClass = useSelectedClass();
    const setSelectedClassId = useTeacherStore((state) => state.setSelectedClassId);
    const [open, setOpen] = useState(false);

    const selectedName = useMemo(() => selectedClass?.name ?? 'Select a class', [selectedClass]);
    const isHomeroom = selectedClass?.isClassTeacher ?? false;

    return (
        <View style={styles.wrap}>
            <GlassCard padded={false} style={styles.card}>
                <AnimatedPressable onPress={() => setOpen(true)} style={styles.row}>
                    <View style={styles.iconWrap}>
                        <GraduationCap color={statusColors.academics} size={22} strokeWidth={2.4} />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.label}>Class Context</Text>
                        <Text style={styles.name} numberOfLines={1}>{selectedName}</Text>
                        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                    </View>
                    {isHomeroom ? (
                        <View style={styles.homeroomBadge}>
                            <Users color={statusColors.present} size={12} strokeWidth={2.6} />
                            <Text style={styles.homeroomText}>Homeroom</Text>
                        </View>
                    ) : null}
                    <ChevronDown color={colors.textMuted} size={20} strokeWidth={2.2} />
                </AnimatedPressable>
            </GlassCard>

            <GlassModal visible={open} title="Switch Class" onClose={() => setOpen(false)}>
                <FlatList
                    data={classes}
                    keyExtractor={(cls) => cls.id}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                    renderItem={({ item }) => {
                        const active = item.id === selectedClass?.id;
                        return (
                            <AnimatedPressable
                                haptic="selection"
                                onPress={() => {
                                    setSelectedClassId(item.id);
                                    setOpen(false);
                                }}
                                style={[styles.option, active ? styles.optionActive : null]}
                            >
                                <BlurView intensity={active ? 40 : 20} tint="light" style={styles.optionBlur}>
                                    <View style={styles.optionInner}>
                                        <View style={styles.optionInfo}>
                                            <Text style={styles.optionName}>{item.name}</Text>
                                            {item.isClassTeacher ? (
                                                <Text style={styles.optionMeta}>You are the class teacher</Text>
                                            ) : (
                                                <Text style={styles.optionMeta}>Subject teacher only</Text>
                                            )}
                                        </View>
                                        {active ? <Check color={statusColors.present} size={20} strokeWidth={2.6} /> : null}
                                    </View>
                                </BlurView>
                            </AnimatedPressable>
                        );
                    }}
                />
            </GlassModal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
    card: {},
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
    iconWrap: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: statusColors.academicsBg,
        alignItems: 'center', justifyContent: 'center',
    },
    info: { flex: 1 },
    label: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
    name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 1 },
    subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    homeroomBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: statusColors.presentBg,
        borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
    },
    homeroomText: { fontSize: 10, fontWeight: '700', color: statusColors.present, textTransform: 'uppercase' },
    option: {
        borderRadius: radius.md,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: glass.border,
    },
    optionActive: { borderColor: statusColors.present },
    optionBlur: { borderRadius: radius.md },
    optionInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: glass.cardBg },
    optionInfo: { flex: 1 },
    optionName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    optionMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
