import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { glass } from '@/design/glass-theme';
import { colors, radius, spacing, statusColors } from '@/design/gateman-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { RequestModificationModal } from '@/components/shared/RequestModificationModal';
import { useAuthStore } from '@/store/auth.store';
import { DirectoryContact, useGatemanStore } from '@/store/gateman.store';

export default function SettingsDirectoryScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const directory = useGatemanStore((state) => state.directory);
  const submitModificationRequest = useGatemanStore((state) => state.submitModificationRequest);
  const [modalOpen, setModalOpen] = useState(false);

  const sections = useMemo(() => {
    const conductors = directory.filter((contact) => contact.role === 'Conductor');
    const admins = directory.filter((contact) => contact.role === 'School Admin');
    return [
      { title: 'Conductors', data: conductors },
      { title: 'School Admins', data: admins },
    ];
  }, [directory]);

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
              <Text style={styles.avatarText}>{(user?.fullName ?? 'G').charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.fullName ?? 'Gateman'}</Text>
              <Text style={styles.id}>ID: {user?.employeeId ?? '—'}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified Phone</Text>
            </View>
          </View>
        </GlassCard>

        <Pressable style={styles.modifyBtn} onPress={() => setModalOpen(true)}>
          <Text style={styles.modifyIcon}>✏️</Text>
          <Text style={styles.modifyText}>Request Details Modification</Text>
        </Pressable>

        <SectionList
          sections={sections}
          keyExtractor={(item: DirectoryContact) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <GlassCard padded={false}>
              <Pressable style={styles.contactRow} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{item.phone}</Text>
                </View>
                <View style={styles.callBadge}>
                  <Text style={styles.callIcon}>📞</Text>
                </View>
              </Pressable>
            </GlassCard>
          )}
        />

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
  profileCard: { margin: spacing.lg },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e4edf6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  profileInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  id: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  verifiedBadge: { backgroundColor: statusColors.onlineBg, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: statusColors.online },
  modifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  modifyIcon: { fontSize: 16 },
  modifyText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.xs, textTransform: 'uppercase' },
  contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  contactInfo: {},
  contactName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  contactPhone: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  callBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: statusColors.onlineBg, alignItems: 'center', justifyContent: 'center' },
  callIcon: { fontSize: 15 },
  logout: {
    margin: spacing.lg,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: statusColors.offline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
