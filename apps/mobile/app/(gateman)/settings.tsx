import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { glass, colors, radius, spacing, shadows, palette, typography } from '@/design/tokens';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
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
      {/* Decorative orbs */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: radius.full,
          backgroundColor: glass.orb1,
          opacity: 0.6,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 120,
          left: -80,
          width: 280,
          height: 280,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <GlassCard style={[styles.profileCard, shadows.sm]}>
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

        <AnimatedPressable style={[styles.modifyBtn, shadows.sm]} onPress={() => setModalOpen(true)}>
          <Text style={styles.modifyIcon}>✏️</Text>
          <Text style={styles.modifyText}>Request Details Modification</Text>
        </AnimatedPressable>

        <SectionList
          sections={sections}
          keyExtractor={(item: DirectoryContact) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item, index }) => (
            <FadeInRow index={index}>
              <GlassCard padded={false} style={shadows.sm}>
                <AnimatedPressable style={styles.contactRow} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phone}</Text>
                  </View>
                  <View style={styles.callBadge}>
                    <Text style={styles.callIcon}>📞</Text>
                  </View>
                </AnimatedPressable>
              </GlassCard>
            </FadeInRow>
          )}
        />

        <AnimatedPressable style={[styles.logout, shadows.sm]} onPress={onLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </AnimatedPressable>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  profileInfo: { flex: 1 },
  name: { ...typography.heading, color: colors.textPrimary },
  id: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  verifiedBadge: { backgroundColor: colors.onlineBg, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: colors.online },
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
  modifyText: { color: palette.white, fontSize: 15, fontWeight: '700' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  sectionHeader: { ...typography.overline, color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.xs },
  contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  contactInfo: {},
  contactName: { ...typography.bodyBold, color: colors.textPrimary },
  contactPhone: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  callBadge: { width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.onlineBg, alignItems: 'center', justifyContent: 'center' },
  callIcon: { fontSize: 15 },
  logout: {
    margin: spacing.lg,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.offline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: palette.white, fontSize: 16, fontWeight: '700' },
});
