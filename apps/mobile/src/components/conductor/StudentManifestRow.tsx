import { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { ManifestStudent } from '@/store/conductor.store';

type Props = {
  student: ManifestStudent;
  onBoarded: (id: string) => void;
  onAbsent: (id: string) => void;
  onPing: (id: string) => void;
  onOffLocation: (id: string) => void;
  routeChangeModeActive: boolean;
  showStop?: boolean;
};

function StudentManifestRowComponent({ student, onBoarded, onAbsent, onPing, onOffLocation, routeChangeModeActive, showStop }: Props) {
  const [editing, setEditing] = useState(false);
  const marked = student.boardingStatus === 'Boarded' || student.boardingStatus === 'Absent' || student.boardingStatus === 'Dropped';
  const showActions = !marked || editing;

  function board() {
    if (student.distanceMeters > 650 && !routeChangeModeActive) onOffLocation(student.id);
    else onBoarded(student.id);
    setEditing(false);
  }

  return (
    <View style={styles.card}>
      <LinearGradient colors={[portalAccents.conductor.from, portalAccents.conductor.to]} style={styles.avatar}>
        <Text style={styles.avatarText}>{student.name.slice(0, 1)}</Text>
      </LinearGradient>
      <View style={styles.main}>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.meta}>Roll {student.rollNumber}{showStop ? ` · ${student.stopName}` : ''}</Text>
        {showActions ? (
          <View style={styles.actions}>
            <AnimatedPressable haptic="medium" onPress={board} style={styles.board}><Text style={styles.white}>Boarded</Text></AnimatedPressable>
            <AnimatedPressable haptic="medium" onPress={() => { onAbsent(student.id); setEditing(false); }} style={styles.absent}><Text style={styles.white}>Absent</Text></AnimatedPressable>
            <AnimatedPressable haptic="selection" onPress={() => onPing(student.id)} style={styles.ping}><Text style={styles.pingText}>Ping</Text></AnimatedPressable>
          </View>
        ) : (
          <View style={styles.actions}>
            <Text style={[styles.badge, student.boardingStatus === 'Absent' ? styles.bad : styles.good]}>{student.boardingStatus}</Text>
            <AnimatedPressable haptic="selection" onPress={() => setEditing(true)}><Text style={styles.edit}>Edit</Text></AnimatedPressable>
          </View>
        )}
      </View>
    </View>
  );
}

export const StudentManifestRow = memo(StudentManifestRowComponent, (prev, next) => prev.student.id === next.student.id && prev.student.boardingStatus === next.student.boardingStatus && prev.student.distanceMeters === next.student.distanceMeters && prev.routeChangeModeActive === next.routeChangeModeActive && prev.showStop === next.showStop && prev.onBoarded === next.onBoarded && prev.onAbsent === next.onAbsent && prev.onPing === next.onPing && prev.onOffLocation === next.onOffLocation);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.sm, padding: spacing.sm, marginBottom: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  main: { flex: 1 },
  name: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm, alignItems: 'center' },
  board: { backgroundColor: colors.success, borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 30, justifyContent: 'center' },
  absent: { backgroundColor: colors.error, borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 30, justifyContent: 'center' },
  ping: { borderWidth: 1, borderColor: colors.warning, borderRadius: radius.full, paddingHorizontal: spacing.sm, minHeight: 30, justifyContent: 'center' },
  white: { ...typography.caption, color: palette.white, fontWeight: '700' },
  pingText: { ...typography.caption, color: colors.warning, fontWeight: '700' },
  badge: { ...typography.caption, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, fontWeight: '700' },
  good: { backgroundColor: colors.successBg, color: colors.success },
  bad: { backgroundColor: colors.errorBg, color: colors.error },
  edit: { ...typography.caption, color: portalAccents.conductor.from, fontWeight: '700' },
});
