import React, { useCallback, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AttendanceStatus, AttendanceType, StudentWithAttendance } from '@minaker/shared-types';
import { useAuthStore } from '@/store/auth.store';
import { useAttendanceStore } from '@/store/attendance.store';
import { useStudentRoster } from '@/hooks/use-student-roster';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { SearchBar } from '@/components/glass/SearchBar';
import {
  colors,
  glass,
  palette,
  portalAccents,
  radius,
  shadows,
  spacing,
  typography,
} from '@/design/tokens';

/**
 * Conductor Student Manifest
 *
 * Shows all students assigned to this conductor's bus route.
 * Conductor taps to mark boarding/alighting for each student.
 * Unified glassmorphism v4 styling with staggered fade-in list and spring haptics.
 */
export default function ConductorManifestScreen() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { markStudent } = useAttendanceStore();

  // For conductor, we show bus_boarding marks by default
  const { students, loading, refetch } = useStudentRoster({
    attendanceType: AttendanceType.BUS_BOARDING,
  });

  const filtered = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q)
    );
  });

  const handleMark = useCallback(
    (student: StudentWithAttendance, status: AttendanceStatus) => {
      markStudent({
        studentId: student.id,
        studentName: student.fullName,
        attendanceType: AttendanceType.BUS_BOARDING,
        status,
        markedBy: user!.id,
      });
    },
    [],
  );

  return (
    <MeshBackground>
      {/* Decorative floating orbs */}
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbMid} pointerEvents="none" />
      <View style={styles.orbBottom} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={typography.title}>Student Manifest</Text>
          <Text style={[typography.caption, styles.headerSubtitle]}>
            Bus Route · Boarding Roster ({filtered.length} students)
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search student by name or roll…"
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={portalAccents.conductor.from} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(s) => s.id}
            renderItem={({ item, index }) => (
              index < 12 ? (
                <FadeInRow index={index}>
                  <StudentManifestRow
                    student={item}
                    onMark={(status) => handleMark(item, status)}
                  />
                </FadeInRow>
              ) : (
                <StudentManifestRow
                  student={item}
                  onMark={(status) => handleMark(item, status)}
                />
              )
            )}
            getItemLayout={(_data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={12}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refetch}
                tintColor={portalAccents.conductor.from}
                colors={[portalAccents.conductor.from]}
              />
            }
            ListEmptyComponent={
              <GlassCard style={[styles.emptyCard, shadows.sm]}>
                <Text style={styles.emptyEmoji}>🚌</Text>
                <Text style={[typography.bodyBold, styles.emptyTitle]}>
                  No Students Found
                </Text>
                <Text style={[typography.caption, styles.emptySubtitle]}>
                  No students match this route or search query.
                </Text>
              </GlassCard>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </MeshBackground>
  );
}

interface RowProps {
  student: StudentWithAttendance;
  onMark: (status: AttendanceStatus) => void;
}

const StudentManifestRow = React.memo(function StudentManifestRow({ student, onMark }: RowProps) {
  const [status, setStatus] = useState<AttendanceStatus | undefined>(student.todayStatus);

  const handleTap = () => {
    const next =
      !status || status === AttendanceStatus.ABSENT
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
        {
          options: ['Present', 'Absent', 'Late', 'Cancel'],
          cancelButtonIndex: 3,
          title: student.fullName,
        },
        (idx) => {
          if (idx < 3) {
            setStatus(values[idx]);
            onMark(values[idx]!);
          }
        },
      );
    } else {
      Alert.alert(student.fullName, 'Mark as:', [
        {
          text: 'Present',
          onPress: () => {
            setStatus(AttendanceStatus.PRESENT);
            onMark(AttendanceStatus.PRESENT);
          },
        },
        {
          text: 'Absent',
          onPress: () => {
            setStatus(AttendanceStatus.ABSENT);
            onMark(AttendanceStatus.ABSENT);
          },
        },
        {
          text: 'Late',
          onPress: () => {
            setStatus(AttendanceStatus.LATE);
            onMark(AttendanceStatus.LATE);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const isPresent = status === AttendanceStatus.PRESENT;
  const isAbsent = status === AttendanceStatus.ABSENT;
  const isLate = status === AttendanceStatus.LATE;

  const badgeBgStyle = isPresent
    ? styles.badgePresent
    : isAbsent
      ? styles.badgeAbsent
      : isLate
        ? styles.badgeLate
        : styles.badgeUnmarked;

  const dotStyle = isPresent
    ? styles.dotPresent
    : isAbsent
      ? styles.dotAbsent
      : styles.dotLate;

  const labelStyle = isPresent
    ? styles.labelPresent
    : isAbsent
      ? styles.labelAbsent
      : styles.labelLate;

  const labelText = isPresent ? 'Present' : isAbsent ? 'Absent' : 'Late';

  return (
    <AnimatedPressable
      onPress={handleTap}
      onLongPress={handleLongPress}
      style={styles.cardPressable}
    >
      <GlassCard style={shadows.sm} padded={false}>
        <View style={styles.cardInner}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{student.fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.info}>
            <Text style={typography.bodyBold} numberOfLines={1}>
              {student.fullName}
            </Text>
            <Text style={[typography.caption, styles.meta]}>
              Roll: {student.rollNumber} · {student.classSection}
            </Text>
          </View>
          <View style={[styles.badge, badgeBgStyle]}>
            {status ? (
              <>
                <View style={[styles.dot, dotStyle]} />
                <Text style={[styles.badgeLabel, labelStyle]}>{labelText}</Text>
              </>
            ) : (
              <Text style={styles.unmarkedText}>Mark</Text>
            )}
          </View>
        </View>
      </GlassCard>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  orbTop: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: radius.full,
    backgroundColor: glass.orb4,
  },
  orbMid: {
    position: 'absolute',
    top: 280,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: radius.full,
    backgroundColor: glass.orb1,
  },
  orbBottom: {
    position: 'absolute',
    bottom: 80,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: radius.full,
    backgroundColor: glass.orb2,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerSubtitle: {
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 110,
  },
  separator: {
    height: spacing.sm,
  },
  cardPressable: {
    borderRadius: radius.lg,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.heading,
    color: portalAccents.conductor.from,
  },
  info: {
    flex: 1,
  },
  meta: {
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  badgePresent: {
    backgroundColor: colors.successBg,
  },
  badgeAbsent: {
    backgroundColor: colors.errorBg,
  },
  badgeLate: {
    backgroundColor: colors.warningBg,
  },
  badgeUnmarked: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  dotPresent: {
    backgroundColor: colors.success,
  },
  dotAbsent: {
    backgroundColor: colors.error,
  },
  dotLate: {
    backgroundColor: colors.warning,
  },
  badgeLabel: {
    ...typography.overline,
    fontWeight: '700',
  },
  labelPresent: {
    color: colors.success,
  },
  labelAbsent: {
    color: colors.error,
  },
  labelLate: {
    color: colors.warning,
  },
  unmarkedText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    color: colors.textPrimary,
  },
  emptySubtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxs,
  },
});
