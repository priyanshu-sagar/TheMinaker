import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, glass, typography } from '@/design/tokens';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { TopTabBar, InboxTabKey } from '@/components/gateman/TopTabBar';
import { ProfileApprovalsList } from '@/components/gateman/ProfileApprovalsList';
import { EditRequestsList } from '@/components/gateman/EditRequestsList';
import { GeofenceAlertsList } from '@/components/gateman/GeofenceAlertsList';
import { useGatemanStore } from '@/store/gateman.store';

export default function ActionInboxScreen() {
  const [tab, setTab] = useState<InboxTabKey>('profiles');

  // Select each primitive count separately — a selector that returns a new
  // object literal every render breaks Zustand's useSyncExternalStore
  // equality check and causes an infinite re-render loop.
  const profilesCount = useGatemanStore((state) => state.profileApprovals.length);
  const editsCount = useGatemanStore((state) => state.editRequests.length);
  const alertsCount = useGatemanStore((state) => state.geofenceAlerts.length);
  const counts = useMemo(
    () => ({ profiles: profilesCount, edits: editsCount, alerts: alertsCount }),
    [profilesCount, editsCount, alertsCount],
  );

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
          bottom: 100,
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
        <View style={styles.header}>
          <Text style={styles.title}>Action Inbox</Text>
        </View>
        <TopTabBar active={tab} onChange={setTab} counts={counts} />
        <View style={styles.body}>
          {tab === 'profiles' ? <ProfileApprovalsList /> : null}
          {tab === 'edits' ? <EditRequestsList /> : null}
          {tab === 'alerts' ? <GeofenceAlertsList /> : null}
        </View>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { ...typography.title, color: colors.textPrimary },
  body: { flex: 1, marginTop: spacing.md },
});
