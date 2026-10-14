import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassModal } from '@/components/glass/GlassModal';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { ExceptionKind, useParentStore } from '@/store/parent.store';

const TITLES: Record<ExceptionKind, string> = {
  selfDropOff: 'Morning drop-off',
  earlyPickup: 'Early pick-up',
  absent: 'Full-day absence',
  reminder: 'Arrival reminder',
};

export function ConfirmModal({
  visible,
  title,
  body,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <GlassModal visible={visible} title={title} onClose={onClose}>
      <Text style={styles.body}>{body}</Text>
      <AnimatedPressable haptic="medium" onPress={onConfirm} style={styles.confirm}>
        <Text style={styles.confirmText}>{confirmLabel}</Text>
      </AnimatedPressable>
      <AnimatedPressable haptic="light" onPress={onClose} style={styles.cancel}>
        <Text style={styles.cancelText}>Not now</Text>
      </AnimatedPressable>
    </GlassModal>
  );
}

export function ExceptionDetailsModal({
  visible,
  kind,
  childId,
  onClose,
}: {
  visible: boolean;
  kind: ExceptionKind | null;
  childId: string;
  onClose: () => void;
}) {
  const logs = useParentStore((state) => state.exceptionLogs);
  const [cursor, setCursor] = useState(() => new Date(2026, 9, 1));
  const [day, setDay] = useState('2026-10-14');
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString([], { month: 'long', year: 'numeric' });
  const mine = useMemo(
    () => logs.filter((log) => log.childId === childId && log.kind === kind),
    [logs, childId, kind],
  );
  const byDate = useMemo(() => {
    const map = new Map<string, typeof mine>();
    mine.forEach((log) => {
      const key = log.at.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), log]);
    });
    return map;
  }, [mine]);
  const shown = byDate.get(day) ?? [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const first = new Date(year, month, 1).getDay();
  const cells: Array<{ day: number | null; iso: string }> = [];
  for (let i = 0; i < first; i += 1) cells.push({ day: null, iso: `pad-${year}-${month}-${i}` });
  for (let date = 1; date <= daysInMonth; date += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    cells.push({ day: date, iso });
  }

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setCursor(next);
    setDay(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`);
  }

  return (
    <GlassModal visible={visible && kind !== null} title={kind ? TITLES[kind] : ''} maxHeight="70%" onClose={onClose}>
      <View style={styles.monthRow}>
        <AnimatedPressable haptic="selection" onPress={() => shiftMonth(-1)}><Text style={styles.nav}>‹</Text></AnimatedPressable>
        <Text style={styles.kicker}>{monthLabel}</Text>
        <AnimatedPressable haptic="selection" onPress={() => shiftMonth(1)}><Text style={styles.nav}>›</Text></AnimatedPressable>
      </View>
      <View style={styles.grid}>
        {cells.map((cell) => {
          const marked = byDate.has(cell.iso);
          const on = cell.iso === day;
          return (
            <AnimatedPressable
              key={cell.iso}
              haptic="selection"
              disabled={cell.day === null}
              onPress={() => cell.day && setDay(cell.iso)}
              style={[styles.cell, on ? styles.cellOn : null]}
            >
              <Text style={styles.cellText}>{cell.day ?? ''}</Text>
              {marked ? <View style={styles.mark} /> : <View style={styles.markSpacer} />}
            </AnimatedPressable>
          );
        })}
      </View>
      <Text style={styles.kicker}>{day}</Text>
      {shown.length === 0 ? <Text style={styles.body}>No exception on this day.</Text> : null}
      {shown.map((log) => (
        <View key={log.id} style={styles.logCard}>
          <View style={styles.rail}>
            <View style={styles.node} />
            <View style={styles.stem} />
          </View>
          <View style={styles.logBody}>
            <Text style={styles.logTime}>{new Date(log.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
            <Text style={styles.log}>{log.label}</Text>
          </View>
        </View>
      ))}
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.body, marginBottom: spacing.md },
  confirm: { minHeight: 48, borderRadius: radius.md, backgroundColor: portalAccents.parent.from, alignItems: 'center', justifyContent: 'center' },
  confirmText: { ...typography.bodyBold, color: '#fff', backgroundColor: 'transparent' },
  cancel: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  cancelText: { ...typography.bodyBold, color: portalAccents.parent.from, backgroundColor: 'transparent' },
  kicker: { ...typography.overline, marginTop: spacing.sm, marginBottom: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
  cellOn: { backgroundColor: colors.infoBg, borderRadius: radius.sm },
  cellText: { ...typography.caption, color: colors.textPrimary },
  mark: { width: 5, height: 5, borderRadius: 3, backgroundColor: portalAccents.parent.from, marginTop: 2 },
  markSpacer: { width: 5, height: 5, marginTop: 2 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  nav: { fontSize: 28, color: portalAccents.parent.from, paddingHorizontal: spacing.md, backgroundColor: 'transparent' },
  logCard: { flexDirection: 'row', marginBottom: spacing.sm },
  rail: { width: 18, alignItems: 'center' },
  stem: { width: 2, flex: 1, backgroundColor: colors.infoBg, marginTop: 2 },
  logBody: { flex: 1, backgroundColor: colors.surfaceStrong, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  node: { width: 8, height: 8, borderRadius: 4, backgroundColor: portalAccents.parent.from },
  logTime: { ...typography.bodyBold },
  log: { ...typography.caption, marginBottom: spacing.xs },
  link: { ...typography.bodyBold, color: portalAccents.parent.from, marginTop: spacing.sm, backgroundColor: 'transparent' },
});
