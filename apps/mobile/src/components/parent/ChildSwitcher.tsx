import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { colors, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useParentStore } from '@/store/parent.store';

/** Glass child switcher. Every parent tab reads the same active child. */
export function ChildSwitcher() {
  const children = useParentStore((state) => state.children);
  const activeChildId = useParentStore((state) => state.activeChildId);
  const setActiveChildId = useParentStore((state) => state.setActiveChildId);
  const [open, setOpen] = useState(false);
  const active = children.find((child) => child.id === activeChildId);

  return (
    <View style={styles.wrap}>
      <GlassCard padded={false}>
        <AnimatedPressable haptic="selection" onPress={() => setOpen(true)} style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(active?.name ?? 'C').charAt(0)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.kicker}>Viewing</Text>
            <Text style={styles.name}>{active?.name ?? 'Select a child'}</Text>
            <Text style={styles.meta}>{active?.grade}</Text>
          </View>
          <ChevronDown color={colors.textMuted} size={20} />
        </AnimatedPressable>
      </GlassCard>

      <GlassModal visible={open} title="Switch child" onClose={() => setOpen(false)}>
        {children.map((child) => {
          const selected = child.id === activeChildId;
          return (
            <AnimatedPressable
              key={child.id}
              haptic="selection"
              onPress={() => {
                setActiveChildId(child.id);
                setOpen(false);
              }}
              style={[styles.option, selected ? styles.optionOn : null]}
            >
              <Text style={styles.optionName}>{child.name}</Text>
              <Text style={styles.optionMeta}>{child.grade} · Bus {child.assignedBusId}</Text>
            </AnimatedPressable>
          );
        })}
      </GlassModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: portalAccents.parent.from,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.heading, color: colors.surfaceStrong, backgroundColor: 'transparent' },
  info: { flex: 1 },
  kicker: { ...typography.overline, color: portalAccents.parent.from },
  name: { ...typography.heading },
  meta: { ...typography.caption },
  option: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionOn: { borderColor: portalAccents.parent.from, backgroundColor: colors.infoBg },
  optionName: { ...typography.bodyBold },
  optionMeta: { ...typography.caption, marginTop: 2 },
});
