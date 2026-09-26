import { StyleSheet, Text, View } from 'react-native';
import { FileText, Link2, Image as ImageIcon, StickyNote, Upload, Trash2 } from 'lucide-react-native';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { ClassMaterial, MaterialType } from '@/store/teacher.store';

const TYPE_META: Record<MaterialType, { icon: typeof FileText; fg: string; bg: string }> = {
    PDF: { icon: FileText, fg: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
    Note: { icon: StickyNote, fg: '#0891B2', bg: 'rgba(8,145,178,0.12)' },
    Link: { icon: Link2, fg: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
    Image: { icon: ImageIcon, fg: '#059669', bg: 'rgba(5,150,105,0.12)' },
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
                    <AnimatedPressable haptic="medium" onPress={onUpload} style={styles.uploadBtn}>
                        <Upload color="#fff" size={14} strokeWidth={2.6} />
                        <Text style={styles.uploadText}>Upload</Text>
                    </AnimatedPressable>
                ) : null}
            </View>

            {materials.length === 0 ? (
                <GlassCard>
                    <Text style={styles.empty}>No materials shared with this class yet.</Text>
                </GlassCard>
            ) : (
                materials.map((material, index) => {
                    const meta = TYPE_META[material.type];
                    const Icon = meta.icon;
                    return (
                        <FadeInRow key={material.id} index={index}>
                            <GlassCard padded={false} style={styles.card}>
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
                                            <Trash2 color={statusColors.absent} size={16} strokeWidth={2.2} />
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
    title: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: statusColors.academics, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 },
    uploadText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    card: {},
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
    iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
    meta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    trashBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: statusColors.absentBg, alignItems: 'center', justifyContent: 'center' },
    empty: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
