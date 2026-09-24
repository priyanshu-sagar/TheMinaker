import { AttendanceStatus, StudentWithAttendance } from '@minaker/shared-types';
import { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface Props {
  student: StudentWithAttendance;
  onMark: (status: AttendanceStatus) => void;
}

const STATUS_CONFIG = {
  [AttendanceStatus.PRESENT]: { label: 'Present', color: '#10b981', bg: '#d1fae5', dot: '●' },
  [AttendanceStatus.ABSENT]: { label: 'Absent', color: '#ef4444', bg: '#fee2e2', dot: '●' },
  [AttendanceStatus.LATE]: { label: 'Late', color: '#f59e0b', bg: '#fef3c7', dot: '●' },
} as const;

/**
 * A student row card with:
 * - Tap toggle:       Present ↔ Absent
 * - Long press:       Show action sheet → Present / Absent / Late
 *
 * Renders the student's name, roll number, class section,
 * and current attendance status as a colored badge.
 */
export function StudentAttendanceCard({ student, onMark }: Props) {
  const [optimisticStatus, setOptimisticStatus] = useState<AttendanceStatus | undefined>(
    student.todayStatus,
  );

  const currentStatus = optimisticStatus;
  const cfg = currentStatus ? STATUS_CONFIG[currentStatus] : null;

  const handleTap = () => {
    // Toggle: no status → Present, Present → Absent, Absent → Present
    const next =
      !currentStatus || currentStatus === AttendanceStatus.ABSENT
        ? AttendanceStatus.PRESENT
        : AttendanceStatus.ABSENT;
    setOptimisticStatus(next);
    onMark(next);
  };

  const handleLongPress = () => {
    const options = ['Present', 'Absent', 'Late', 'Cancel'];
    const values = [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 3, title: student.fullName },
        (idx) => {
          if (idx < 3) {
            setOptimisticStatus(values[idx]);
            onMark(values[idx]!);
          }
        },
      );
    } else {
      // Android — use Alert as fallback (replace with a bottom sheet in Phase 2)
      Alert.alert(student.fullName, 'Mark as:', [
        { text: 'Present', onPress: () => { setOptimisticStatus(AttendanceStatus.PRESENT); onMark(AttendanceStatus.PRESENT); } },
        { text: 'Absent',  onPress: () => { setOptimisticStatus(AttendanceStatus.ABSENT);  onMark(AttendanceStatus.ABSENT);  } },
        { text: 'Late',    onPress: () => { setOptimisticStatus(AttendanceStatus.LATE);    onMark(AttendanceStatus.LATE);    } },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <Pressable
      style={styles.card}
      onPress={handleTap}
      onLongPress={handleLongPress}
      android_ripple={{ color: '#e5e7eb' }}
    >
      {/* Avatar placeholder */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {student.fullName.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Student info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {student.fullName}
        </Text>
        <Text style={styles.meta}>
          Roll: {student.rollNumber} · {student.classSection}
        </Text>
      </View>

      {/* Status badge */}
      <Pressable
        style={[styles.badge, cfg ? { backgroundColor: cfg.bg } : styles.badgeUnmarked]}
        onPress={handleTap}
        onLongPress={handleLongPress}
        hitSlop={8}
      >
        {cfg ? (
          <>
            <Text style={[styles.badgeDot, { color: cfg.color }]}>●</Text>
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </>
        ) : (
          <Text style={styles.badgeUnmarkedText}>Mark</Text>
        )}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#1a73e8' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  badgeUnmarked: { backgroundColor: '#f3f4f6', borderWidth: 1.5, borderColor: '#d1d5db' },
  badgeDot: { fontSize: 10 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  badgeUnmarkedText: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
});
