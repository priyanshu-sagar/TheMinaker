import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ChevronRight, Contact, LogOut, Pencil, School, Users } from 'lucide-react-native';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { RequestModificationModal } from '@/components/shared/RequestModificationModal';
import { ClassSelector } from '@/components/teacher/ClassSelector';
import {
  EditTimetableModal,
  ManageClassesModal,
  ParentDirectoryModal,
  RosterManagementModal,
} from '@/components/teacher/ManagementModals';
import { useAuthStore } from '@/store/auth.store';
import { useSelectedClass, useTeacherStore } from '@/store/teacher.store';

type HubKey = 'classes' | 'timetable' | 'roster' | 'parents' | null;

export default function TeacherSettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const selected = useSelectedClass();
  const selectedClassId = useTeacherStore((state) => state.selectedClassId);
  const students = useTeacherStore((state) => state.students);
  const submitModificationRequest = useTeacherStore((state) => state.submitModificationRequest);
  const [hub, setHub] = useState<HubKey>(null);
  const [modifyOpen, setModifyOpen] = useState(false);

  const classStudents = students.filter((student) => student.classId === selectedClassId);

  async function onLogout() {
    await signOut();
    router.replace('/(auth)/portal-select');
  }

  const rows = [
    { key: 'classes' as const, label: 'Manage My Classes', icon: School, hint: 'Add or remove classes you teach' },
    { key: 'timetable' as const, label: 'Edit Timetable', icon: BookOpen, hint: 'Periods for the selected class' },
    { key: 'roster' as const, label: 'Student & Roster Management', icon: Users, hint: 'Add or remove students' },
    { key: 'parents' as const, label: 'Parent Contact Directory', icon: Contact, hint: 'Call a parent from this class' },
  ];

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ClassSelector />
          <GlassCard style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user?.fullName ?? 'T').charAt(0)}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user?.fullName ?? 'Teacher'}</Text>
                <Text style={styles.id}>ID: {user?.employeeId ?? '—'}</Text>
                <Text style={styles.classInfo}>{selected?.name ?? 'No class selected'}</Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified phone</Text>
            </View>
          </GlassCard>

          <Text style={styles.section}>Management</Text>
          <GlassCard padded={false}>
            {rows.map((row, index) => {
              const Icon = row.icon;
              return (
                <AnimatedPressable
                  key={row.key}
                  haptic="selection"
                  onPress={() => setHub(row.key)}
                  style={[styles.hubRow, index < rows.length - 1 ? styles.hubDivider : null]}
                >
                  <View style={styles.hubIcon}>
                    <Icon color={colors.primary} size={18} strokeWidth={2.2} />
                  </View>
                  <View style={styles.hubInfo}>
                    <Text style={styles.hubLabel}>{row.label}</Text>
                    <Text style={styles.hubHint}>{row.hint}</Text>
                  </View>
                  <ChevronRight color={colors.textMuted} size={18} />
                </AnimatedPressable>
              );
            })}
          </GlassCard>

          <AnimatedPressable haptic="light" onPress={() => setModifyOpen(true)} style={styles.modifyBtn}>
            <Pencil color="#fff" size={16} strokeWidth={2.4} />
            <Text style={styles.modifyText}>Request Details Modification</Text>
          </AnimatedPressable>

          <AnimatedPressable haptic="medium" onPress={onLogout} style={styles.logout}>
            <LogOut color="#fff" size={16} strokeWidth={2.4} />
            <Text style={styles.logoutText}>Log Out</Text>
          </AnimatedPressable>
        </ScrollView>
      </SafeAreaView>

      <ManageClassesModal visible={hub === 'classes'} onClose={() => setHub(null)} />
      <EditTimetableModal visible={hub === 'timetable'} classId={selectedClassId} onClose={() => setHub(null)} />
      <RosterManagementModal visible={hub === 'roster'} classId={selectedClassId} onClose={() => setHub(null)} />
      <ParentDirectoryModal visible={hub === 'parents'} roster={classStudents} onClose={() => setHub(null)} />
      <RequestModificationModal visible={modifyOpen} onClose={() => setModifyOpen(false)} onSubmit={submitModificationRequest} />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.xl, gap: spacing.md },
  profileCard: { marginHorizontal: spacing.lg, gap: spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e4edf6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  profileInfo: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  id: { fontSize: 13, color: colors.textMuted },
  classInfo: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  verifiedBadge: { backgroundColor: statusColors.presentBg, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start' },
  verifiedText: { fontSize: 11, fontWeight: '700', color: statusColors.present },
  section: { fontSize: 13, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', paddingHorizontal: spacing.lg, letterSpacing: 0.4 },
  hubRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  hubDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(148,163,184,0.3)' },
  hubIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(26,79,139,0.1)', alignItems: 'center', justifyContent: 'center' },
  hubInfo: { flex: 1 },
  hubLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  hubHint: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  modifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  modifyText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  logout: {
    marginHorizontal: spacing.lg,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: statusColors.absent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
