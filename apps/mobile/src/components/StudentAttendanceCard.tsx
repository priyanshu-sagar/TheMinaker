import { AttendanceStatus, StudentWithAttendance } from '@minaker/shared-types';
import { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

interface Props {
  student: StudentWithAttendance;
  onMark: (status: AttendanceStatus) => void;
}

// Typed StyleSheet to avoid indexed-access inference issues with strict mode
const S = StyleSheet.create({
  card:         { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 4, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  avatar:       { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dbeafe', alignItems: 'center' as const, justifyContent: 'center' as const, marginRight: 12 },
  avatarText:   { fontSize: 18, fontWeight: '700' as const, color: '#1a73e8' },
  info:         { flex: 1 },
  name:         { fontSize: 15, fontWeight: '600' as const, color: '#111827' },
  meta:         { fontSize: 12, color: '#6b7280', marginTop: 2 },

  badgeUnmarked: { flexDirection: 'row' as const, alignItems: 'center' as const, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4, backgroundColor: '#f3f4f6', borderWidth: 1.5, borderColor: '#d1d5db' },
  badgePresent:  { flexDirection: 'row' as const, alignItems: 'center' as const, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4, backgroundColor: '#d1fae5' },
  badgeAbsent:   { flexDirection: 'row' as const, alignItems: 'center' as const, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4, backgroundColor: '#fee2e2' },
  badgeLate:     { flexDirection: 'row' as const, alignItems: 'center' as const, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4, backgroundColor: '#fef3c7' },

  dotPresent:   { fontSize: 10, color: '#10b981' },
  dotAbsent:    { fontSize: 10, color: '#ef4444' },
  dotLate:      { fontSize: 10, color: '#f59e0b' },
  labelPresent: { fontSize: 13, fontWeight: '700' as const, color: '#10b981' },
  labelAbsent:  { fontSize: 13, fontWeight: '700' as const, color: '#ef4444' },
  labelLate:    { fontSize: 13, fontWeight: '700' as const, color: '#f59e0b' },
  unmarkedText: { fontSize: 13, fontWeight: '600' as const, color: '#9ca3af' },
});

/**
 * A student row card:
 * - Tap:        Present ↔ Absent toggle
 * - Long press: Action sheet → Present / Absent / Late
 */
export function StudentAttendanceCard({ student, onMark }: Props) {
  const [status, setStatus] = useState<AttendanceStatus | undefined>(student.todayStatus);

  const handleTap = () => {
    const next = (!status || status === AttendanceStatus.ABSENT)
      ? AttendanceStatus.PRESENT
      : AttendanceStatus.ABSENT;
    setStatus(next);
    onMark(next);
  };

  const handleLongPress = () => {
    const values: AttendanceStatus[] = [
      AttendanceStatus.PRESENT,
      AttendanceStatus.ABSENT,
      AttendanceStatus.LATE,
    ];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Present', 'Absent', 'Late', 'Cancel'], cancelButtonIndex: 3, title: student.fullName },
        (idx) => { if (idx < 3) { setStatus(values[idx]); onMark(values[idx]!); } },
      );
    } else {
      Alert.alert(student.fullName, 'Mark as:', [
        { text: 'Present', onPress: () => { setStatus(AttendanceStatus.PRESENT); onMark(AttendanceStatus.PRESENT); } },
        { text: 'Absent',  onPress: () => { setStatus(AttendanceStatus.ABSENT);  onMark(AttendanceStatus.ABSENT);  } },
        { text: 'Late',    onPress: () => { setStatus(AttendanceStatus.LATE);    onMark(AttendanceStatus.LATE);    } },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const badgeStyle = (status === AttendanceStatus.PRESENT ? S.badgePresent
    : status === AttendanceStatus.ABSENT ? S.badgeAbsent
    : status === AttendanceStatus.LATE   ? S.badgeLate
    : S.badgeUnmarked) as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dotStyle = (status === AttendanceStatus.PRESENT ? S.dotPresent
    : status === AttendanceStatus.ABSENT ? S.dotAbsent
    : S.dotLate) as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labelStyle = (status === AttendanceStatus.PRESENT ? S.labelPresent
    : status === AttendanceStatus.ABSENT ? S.labelAbsent
    : S.labelLate) as any;

  const labelText = status === AttendanceStatus.PRESENT ? 'Present'
    : status === AttendanceStatus.ABSENT ? 'Absent'
    : 'Late';

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Pressable style={S.card as any} onPress={handleTap} onLongPress={handleLongPress} android_ripple={{ color: '#e5e7eb' }}>
      <View style={S.avatar as any}>
        <Text style={S.avatarText as any}>{student.fullName.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={S.info as any}>
        <Text style={S.name as any} numberOfLines={1}>{student.fullName}</Text>
        <Text style={S.meta as any}>Roll: {student.rollNumber} · {student.classSection}</Text>
      </View>
      <Pressable style={badgeStyle} onPress={handleTap} onLongPress={handleLongPress} hitSlop={8}>
        {status ? (
          <>
            <Text style={dotStyle}>●</Text>
            <Text style={labelStyle}>{labelText}</Text>
          </>
        ) : (
          <Text style={S.unmarkedText as any}>Mark</Text>
        )}
      </Pressable>
    </Pressable>
  );
}
