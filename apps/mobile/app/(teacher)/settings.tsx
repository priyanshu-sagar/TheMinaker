import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, statusColors } from '@/design/teacher-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { RequestModificationModal } from '@/components/shared/RequestModificationModal';
import { useAuthStore } from '@/store/auth.store';
import { useTeacherStore } from '@/store/teacher.store';

export default function TeacherSettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const submitModificationRequest = useTeacherStore((state) => state.submitModificationRequest);
  const [modalOpen, setModalOpen] = useState(false);

  async function onLogout() {
    await signOut();
    router.replace('/(auth)/portal-select');
  }

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.fullName ?? 'T').charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.fullName ?? 'Teacher'}</Text>
              <Text style={styles.id}>ID: {user?.employeeId ?? '—'}</Text>
              <Text style={styles.classInfo}>Assigned Class: 6-B</Text>
            </View>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified Phone</Text>
          </View>
        </GlassCard>

        <Pressable style={styles.modifyBtn} onPress={() => setModalOpen(true)}>
          <Text style={styles.modifyIcon}>✏️</Text>
          <Text style={styles.modifyText}>Request Details Modification</Text>
        </Pressable>

        <View style={styles.spacer} />

        <Pressable style={styles.logout} onPress={onLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </SafeAreaView>

      <RequestModificationModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={submitModificationRequest}
      />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  profileCard: { margin: spacing.lg, gap: spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e4edf6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  profileInfo: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  id: { fontSize: 13, color: colors.textMuted },
  classInfo: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  verifiedBadge: { backgroundColor: statusColors.presentBg, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start' },
  verifiedText: { fontSize: 11, fontWeight: '700', color: statusColors.present },
  modifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  modifyIcon: { fontSize: 16 },
  modifyText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  spacer: { flex: 1 },
  logout: {
    margin: spacing.lg,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: statusColors.absent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
