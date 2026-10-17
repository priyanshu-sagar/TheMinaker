import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassModal } from '@/components/glass/GlassModal';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { ConfirmRequest, GlassConfirmModal } from '@/components/conductor/GlassConfirmModal';
import { colors, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { ManifestStudent, useConductorStore } from '@/store/conductor.store';

export default function AttendanceScreen() {
  const students = useConductorStore((state) => state.studentManifest);
  const stops = useConductorStore((state) => state.routeStops);
  const markBoarded = useConductorStore((state) => state.markBoarded);
  const markAbsent = useConductorStore((state) => state.markAbsent);
  const pingParent = useConductorStore((state) => state.pingParent);
  const [stopId, setStopId] = useState<string | 'all' | 'missed'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);
  const completed = useMemo(() => new Set(stops.filter((stop) => stop.status === 'Completed').map((stop) => stop.id)), [stops]);
  const missed = useMemo(() => students.filter((student) => student.boardingStatus === 'Waiting' && completed.has(student.stopId)), [students, completed]);
  const boarded = students.filter((student) => student.boardingStatus === 'Boarded').length;
  const absent = students.filter((student) => student.boardingStatus === 'Absent').length;
  const waiting = students.filter((student) => student.boardingStatus === 'Waiting' || student.boardingStatus === 'Pinged').length;
  const rows = useMemo(() => {
    if (stopId === 'missed') return missed;
    if (stopId === 'all') return students;
    return students.filter((student) => student.stopId === stopId);
  }, [students, stopId, missed]);
  const open = students.find((student) => student.id === openId);
  const currentId = stops.find((stop) => stop.status === 'Current')?.id;

  const confirm = useCallback((tone: ConfirmRequest['tone'], title: string, summary: string, run: () => void) => {
    setAsk({ tone, title, summary, confirmLabel: 'Confirm', onConfirm: run });
  }, []);

  return (
    <MeshBackground>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        bounces={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={7}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.kpis}>
              <Stat label="Boarded" value={boarded} color={portalAccents.conductor.from} />
              <Stat label="Absent" value={absent} color={colors.error} />
              <Stat label="Waiting" value={waiting} color={colors.warning} />
            </View>
            {missed.length > 0 ? (
              <AnimatedPressable haptic="light" onPress={() => setStopId('missed')} style={styles.alert}>
                <Text style={styles.alertText}>{missed.length} students are still waiting at a completed stop</Text>
              </AnimatedPressable>
            ) : null}
            <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
              <Pill label="All" active={stopId === 'all'} onPress={() => setStopId('all')} />
              {stops.map((stop) => <Pill key={stop.id} label={stop.name.split(' ')[0] ?? stop.name} active={stopId === stop.id} current={stop.id === currentId} onPress={() => setStopId(stop.id)} />)}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => <ManifestLine student={item} missed={item.boardingStatus === 'Waiting' && completed.has(item.stopId)} onPress={setOpenId} />}
      />
      <GlassModal visible={open !== undefined} maxHeight="60%" title="Student" onClose={() => setOpenId(null)}>
        {open ? (
          <View>
            <Text style={styles.name}>{open.name}</Text>
            <Text style={styles.meta}>Roll {open.rollNumber} · {open.stopName}</Text>
            <Text style={styles.meta}>{open.parentName}</Text>
            <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${open.parentPhone}`)}><Text style={styles.link}>{open.parentPhone}</Text></AnimatedPressable>
            <Text style={styles.meta}>{open.lastUpdated ? `Last change ${new Date(open.lastUpdated).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : 'No status change yet'}</Text>
            <View style={styles.actions}>
              <AnimatedPressable haptic="medium" onPress={() => confirm('approve', 'Mark boarded', `${open.name} at ${open.stopName}`, () => markBoarded(open.id))} style={styles.board}><Text style={styles.white}>Boarded</Text></AnimatedPressable>
              <AnimatedPressable haptic="medium" onPress={() => confirm('reject', 'Mark absent', `${open.name} at ${open.stopName}`, () => markAbsent(open.id))} style={styles.absent}><Text style={styles.white}>Absent</Text></AnimatedPressable>
              <AnimatedPressable haptic="selection" onPress={() => confirm('info', 'Ping parent', `Send a check-in ping for ${open.name}?`, () => pingParent(open.id, 'Is your child coming today?'))} style={styles.ping}><Text style={styles.pingText}>Ping</Text></AnimatedPressable>
            </View>
          </View>
        ) : null}
      </GlassModal>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

const ManifestLine = memo(function ManifestLine({ student, missed, onPress }: { student: ManifestStudent; missed: boolean; onPress: (id: string) => void }) {
  const tone = student.boardingStatus === 'Boarded' ? styles.good : student.boardingStatus === 'Absent' ? styles.bad : student.boardingStatus === 'Dropped' ? styles.info : student.boardingStatus === 'Pinged' ? styles.warn : styles.muted;
  return (
    <AnimatedPressable haptic="selection" onPress={() => onPress(student.id)}>
      <GlassCard style={[shadows.sm, styles.row, missed ? styles.missed : null]}>
        <LinearGradient colors={[portalAccents.conductor.from, portalAccents.conductor.to]} style={styles.avatar}><Text style={styles.avatarText}>{student.name.slice(0, 1)}</Text></LinearGradient>
        <View style={styles.main}>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.meta}>Roll {student.rollNumber} · {student.stopName}</Text>
        </View>
        <Text style={[styles.chip, tone]}>{student.boardingStatus}</Text>
      </GlassCard>
    </AnimatedPressable>
  );
});

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return <GlassCard style={[shadows.sm, styles.stat]}><Text style={[styles.hero, { color }]}>{value}</Text><Text style={styles.meta}>{label}</Text></GlassCard>;
}
function Pill({ label, active, current, onPress }: { label: string; active: boolean; current?: boolean; onPress: () => void }) {
  return <AnimatedPressable haptic="selection" onPress={onPress} style={[styles.pill, active ? styles.pillOn : null]}><Text style={[styles.pillText, active ? styles.pillTextOn : null]}>{current ? '● ' : ''}{label}</Text></AnimatedPressable>;
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: 140 },
  kpis: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  stat: { flex: 1, padding: spacing.sm },
  hero: { ...typography.heading },
  alert: { borderWidth: 1, borderColor: colors.error, backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  alertText: { ...typography.caption, color: colors.warning },
  pills: { gap: spacing.xs, paddingBottom: spacing.sm },
  pill: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  pillOn: { backgroundColor: portalAccents.conductor.from, borderColor: portalAccents.conductor.from },
  pillText: { ...typography.caption, color: colors.textPrimary },
  pillTextOn: { color: palette.white, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, marginBottom: spacing.sm },
  missed: { borderColor: colors.error, borderWidth: 1.5 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  main: { flex: 1 },
  name: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  chip: { ...typography.caption, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, fontWeight: '700' },
  good: { backgroundColor: colors.successBg, color: colors.success },
  bad: { backgroundColor: colors.errorBg, color: colors.error },
  warn: { backgroundColor: colors.warningBg, color: colors.warning },
  info: { backgroundColor: colors.infoBg, color: colors.info },
  muted: { backgroundColor: colors.neutralBg, color: colors.textMuted },
  link: { ...typography.bodyBold, color: portalAccents.conductor.from, marginVertical: spacing.sm, backgroundColor: 'transparent' },
  actions: { flexDirection: 'row', gap: spacing.xs },
  board: { backgroundColor: colors.success, borderRadius: radius.full, paddingHorizontal: spacing.md, minHeight: 36, justifyContent: 'center' },
  absent: { backgroundColor: colors.error, borderRadius: radius.full, paddingHorizontal: spacing.md, minHeight: 36, justifyContent: 'center' },
  ping: { borderWidth: 1, borderColor: colors.warning, borderRadius: radius.full, paddingHorizontal: spacing.md, minHeight: 36, justifyContent: 'center' },
  white: { ...typography.caption, color: palette.white, fontWeight: '700' },
  pingText: { ...typography.caption, color: colors.warning, fontWeight: '700' },
});
