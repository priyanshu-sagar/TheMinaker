import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { ConfirmModal } from '@/components/parent/ConfirmModal';
import { ParentChrome } from '@/components/parent/ParentChrome';
import { colors, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { useActiveChild, useParentStore } from '@/store/parent.store';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ParentAttendanceScreen() {
  const activeChildId = useParentStore((state) => state.activeChildId);
  const history = useParentStore((state) => state.attendanceHistory);
  const child = useActiveChild();
  const exceptionLogs = useParentStore((state) => state.exceptionLogs);
  const setArrivalReminder = useParentStore((state) => state.setArrivalReminder);
  const [warnOff, setWarnOff] = useState(false);
  const [selected, setSelected] = useState('2026-10-13');
  const logs = useMemo(() => history.filter((row) => row.childId === activeChildId), [history, activeChildId]);
  const byDate = useMemo(() => new Map(logs.map((row) => [row.date, row])), [logs]);
  const dayNotes = exceptionLogs.filter((log) => log.childId === activeChildId && log.at.slice(0, 10) === selected);
  const selectedLog = byDate.get(selected);

  const cells: Array<{ day: number | null; iso: string }> = [];
  const firstWeekday = new Date(2026, 9, 1).getDay();
  for (let i = 0; i < firstWeekday; i += 1) cells.push({ day: null, iso: `pad-${i}` });
  for (let day = 1; day <= 31; day += 1) {
    const iso = `2026-10-${String(day).padStart(2, '0')}`;
    cells.push({ day, iso });
  }

  const events = [
    ...(selectedLog?.status === 'Present'
      ? [
          { time: selectedLog.boardedTime ?? '—', label: 'Boarded the bus' },
          { time: selectedLog.droppedTime ?? '—', label: 'Dropped at campus' },
        ]
      : selectedLog?.status === 'Absent'
        ? [{ time: 'All day', label: 'Marked absent' }]
        : []),
    ...dayNotes.map((log) => ({ time: new Date(log.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), label: log.label })),
  ];

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ParentChrome />
        <ScrollView contentContainerStyle={styles.list}>
          <GlassCard style={shadows.md}>
            <Text style={styles.month}>October 2026</Text>
            <View style={styles.week}>
              {WEEK.map((label, index) => <Text key={`${label}-${index}`} style={styles.weekDay}>{label}</Text>)}
            </View>
            <View style={styles.grid}>
              {cells.map((cell) => {
                const log = byDate.get(cell.iso);
                const on = cell.iso === selected;
                return (
                  <AnimatedPressable
                    key={cell.iso}
                    haptic="selection"
                    disabled={cell.day === null}
                    onPress={() => cell.day && setSelected(cell.iso)}
                    style={[styles.cell, on ? styles.cellOn : null]}
                  >
                    <Text style={styles.day}>{cell.day ?? ''}</Text>
                    {log ? <View style={[styles.dot, { backgroundColor: log.status === 'Present' ? colors.success : colors.error }]} /> : <View style={styles.dotSpacer} />}
                  </AnimatedPressable>
                );
              })}
            </View>
          </GlassCard>

          <GlassCard style={[styles.alertCard, shadows.md]}>
            <View style={styles.alertRow}>
              <Text style={styles.time}>{child?.arrivalReminder ? 'Arrival alerts are on' : 'Arrival alerts are off'}</Text>
              <AnimatedPressable
                haptic="selection"
                onPress={() => {
                  if (!child) return;
                  if (child.arrivalReminder) setWarnOff(true);
                  else setArrivalReminder(child.id, true);
                }}
                style={[styles.switch, child?.arrivalReminder ? styles.switchOn : null]}
              >
                <View style={[styles.knob, child?.arrivalReminder ? styles.knobOn : null]} />
              </AnimatedPressable>
            </View>
          </GlassCard>
          {events.length === 0 ? <Text style={styles.empty}>No transit log for this day.</Text> : null}
          {events.map((event, index) => (
            <View key={event.label} style={styles.timeline}>
              <View style={styles.rail}>
                <View style={styles.node} />
                {index < events.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <GlassCard style={styles.event}>
                <Text style={styles.time}>{event.time}</Text>
                <Text style={styles.eventLabel}>{event.label}</Text>
              </GlassCard>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
      <ConfirmModal
        visible={warnOff}
        title="Turn off arrival alerts?"
        body="You may miss the bus at the stop if alerts are off."
        confirmLabel="Turn off"
        onClose={() => setWarnOff(false)}
        onConfirm={() => {
          if (child) setArrivalReminder(child.id, false);
          setWarnOff(false);
        }}
      />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.lg, paddingBottom: 120 },
  month: { ...typography.heading, marginBottom: spacing.md },
  week: { flexDirection: 'row' },
  weekDay: { width: '14.28%', textAlign: 'center', ...typography.caption },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', alignItems: 'center', paddingVertical: spacing.xs },
  cellOn: { backgroundColor: colors.infoBg, borderRadius: radius.sm },
  day: { ...typography.body },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  dotSpacer: { width: 6, height: 6, marginTop: 2 },
  alertCard: { marginTop: spacing.lg, marginBottom: spacing.md },
  alertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switch: { width: 44, height: 26, borderRadius: 13, backgroundColor: colors.borderStrong, justifyContent: 'center', paddingHorizontal: 3 },
  switchOn: { backgroundColor: portalAccents.parent.from },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: palette.white },
  knobOn: { alignSelf: 'flex-end' },
  empty: { ...typography.caption },
  timeline: { flexDirection: 'row' },
  rail: { width: 24, alignItems: 'center' },
  node: { width: 12, height: 12, borderRadius: 6, backgroundColor: portalAccents.parent.from, marginTop: spacing.md },
  line: { width: 2, flex: 1, backgroundColor: portalAccents.parent.to },
  event: { flex: 1, marginBottom: spacing.sm },
  time: { ...typography.bodyBold, color: palette.ink100 },
  eventLabel: { ...typography.caption, marginTop: 2 },
});
