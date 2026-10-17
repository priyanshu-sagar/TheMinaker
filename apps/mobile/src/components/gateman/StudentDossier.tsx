import { ReactNode, useMemo } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useGatemanStore } from '@/store/gateman.store';

export function StudentDossier({
  studentId,
  statusLabel,
  time,
  children,
  footer,
}: {
  studentId: string;
  statusLabel: string;
  time?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const students = useGatemanStore((state) => state.students);
  const buses = useGatemanStore((state) => state.buses);
  const student = useMemo(() => students.find((item) => item.id === studentId), [students, studentId]);
  const bus = useMemo(() => buses.find((item) => item.id === student?.busId), [buses, student?.busId]);
  if (!student) return <Text style={styles.meta}>Student record is no longer on this shift.</Text>;
  const tone = statusLabel.toLowerCase().includes('reject') || statusLabel.toLowerCase().includes('denied')
    ? styles.bad
    : statusLabel.toLowerCase().includes('pending') || statusLabel.toLowerCase().includes('waiting')
      ? styles.wait
      : styles.good;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{student.name.slice(0, 1)}</Text></View>
        <View style={styles.main}>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.meta}>{student.grade} · {student.id.toUpperCase()}</Text>
          {time ? <Text style={styles.meta}>{new Date(time).toLocaleString()}</Text> : null}
        </View>
        <Text style={[styles.pill, tone]}>{statusLabel}</Text>
      </View>
      <View style={styles.grid}>
        <Info title="Bus and route" body={bus ? `${bus.busNumber}\n${bus.areaName} · ${bus.status}` : 'No bus assigned'} />
        <Info title="Stop and timing" body={`${student.assignedStop}\n${bus ? `Departs ${bus.departureTime}` : 'No departure'}`} />
        <Info title="Parent" body={student.parentName} action="Call parent" onAction={() => Linking.openURL(`tel:${student.parentPhone}`)} />
        <Info title="Conductor" body={bus?.conductorName ?? 'Unassigned'} action={bus ? 'Call conductor' : undefined} onAction={bus ? () => Linking.openURL(`tel:${bus.conductorPhone}`) : undefined} />
      </View>
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

function Info({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.kicker}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {action && onAction ? (
        <AnimatedPressable haptic="medium" onPress={onAction} style={styles.call}>
          <Text style={styles.callText}>{action}</Text>
        </AnimatedPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: portalAccents.gateman.from, backgroundColor: 'transparent' },
  main: { flex: 1 },
  name: { ...typography.heading },
  meta: { ...typography.caption, marginTop: 2 },
  pill: { ...typography.caption, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, fontWeight: '700' },
  good: { backgroundColor: '#ECFDF5', color: '#059669' },
  wait: { backgroundColor: '#FFF7ED', color: '#EA580C' },
  bad: { backgroundColor: '#FEF2F2', color: '#DC2626' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%', flexGrow: 1, backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.sm },
  kicker: { ...typography.overline },
  body: { ...typography.bodyBold, marginTop: 4 },
  call: { marginTop: spacing.sm, alignSelf: 'flex-start', backgroundColor: portalAccents.gateman.from, borderRadius: radius.full, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  callText: { ...typography.caption, color: palette.white, fontWeight: '700' },
  footer: { gap: spacing.sm, marginTop: spacing.sm },
});
