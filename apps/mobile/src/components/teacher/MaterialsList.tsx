import { StyleSheet, Text, View } from 'react-native';
import { FileText, Link2, Image as ImageIcon, StickyNote, Upload, Trash2 } from 'lucide-react-native';
import { colors, radius, spacing, palette, portalAccents, shadows, typography } from '@/design/tokens';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { ClassMaterial, MaterialType } from '@/store/teacher.store';

const TYPE_META: Record<MaterialType, { icon: typeof FileText; fg: string; bg: string }> = {
    PDF: { icon: FileText, fg: colors.error, bg: colors.errorBg },
    Note: { icon: StickyNote, fg: colors.info, bg: colors.infoBg },
    Link: { icon: Link2, fg: portalAccents.teacher.from, bg: colors.checkedOutBg },
    Image: { icon: ImageIcon, fg: colors.success, bg: colors.successBg },
};

export function MaterialsList({
    materials,
    onUpload,
    onRemove,
    canManage,
}: {
    materials: ClassMaterial[];
    onUpload: () => void;
    onRemove: (id: string) => void;
    canManage: boolean;
}) {
    return (
        <View style={styles.wrap}>
            <View style={styles.header}>
                <Text style={styles.title}>Class Materials</Text>
                {canManage ? (
                    <AnimatedPressable haptic="medium" onPress={onUpload} style={[styles.uploadBtn, shadows.sm]}>
                        <Upload color={palette.white} size={14} strokeWidth={2.6} />
                        <Text style={styles.uploadText}>Upload</Text>
                    </AnimatedPressable>
                ) : null}
            </View>

            {materials.length === 0 ? (
                <GlassCard style={shadows.sm}>
                    <Text style={styles.empty}>No materials shared with this class yet.</Text>
                </GlassCard>
            ) : (
                materials.map((material, index) => {
                    const meta = TYPE_META[material.type];
                    const Icon = meta.icon;
                    return (
                        <FadeInRow key={material.id} index={index}>
                            <GlassCard padded={false} style={[styles.card, shadows.sm]}>
                                <View style={styles.row}>
                                    <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
                                        <Icon color={meta.fg} size={18} strokeWidth={2.2} />
                                    </View>
                                    <View style={styles.info}>
                                        <Text style={styles.name} numberOfLines={1}>{material.title}</Text>
                                        <Text style={styles.meta}>{material.type} · Uploaded {material.date}</Text>
                                    </View>
                                    {canManage ? (
                                        <AnimatedPressable haptic="medium" onPress={() => onRemove(material.id)} style={styles.trashBtn}>
                                            <Trash2 color={colors.error} size={16} strokeWidth={2.2} />
                                        </AnimatedPressable>
                                    ) : null}
                                </View>
                            </GlassCard>
                        </FadeInRow>
                    );
                })
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: spacing.sm },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
    title: { ...typography.heading, color: colors.textPrimary },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: portalAccents.teacher.from,
        borderRadius: radius.md,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    uploadText: { color: palette.white, fontSize: 12, fontWeight: '700' },
    card: {},
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
    iconWrap: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    name: { ...typography.bodyBold, color: colors.textPrimary },
    meta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    trashBtn: { width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.errorBg, alignItems: 'center', justifyContent: 'center' },
    empty: { ...typography.body, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
