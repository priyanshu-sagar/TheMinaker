import { useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { spacing } from '@/design/gateman-theme';
import { ActionCard } from './ActionCard';
import { ProfileDetailModal } from './ProfileDetailModal';
import { ProfileApproval, useGatemanStore } from '@/store/gateman.store';

export function ProfileApprovalsList() {
  const approvals = useGatemanStore((state) => state.profileApprovals);
  const approveProfile = useGatemanStore((state) => state.approveProfile);
  const rejectProfile = useGatemanStore((state) => state.rejectProfile);
  const resubmitProfile = useGatemanStore((state) => state.resubmitProfile);
  const [detail, setDetail] = useState<ProfileApproval | null>(null);

  if (approvals.length === 0) {
    return <Text style={styles.empty}>No pending profile approvals.</Text>;
  }

  return (
    <>
      <FlatList
        data={approvals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: ProfileApproval }) => (
          <ActionCard
            title={item.studentName}
            subtitle={`Parent: ${item.parentName} · ${item.phone}`}
            onPress={() => setDetail(item)}
            primaryLabel="Approve"
            secondaryLabel="Reject"
            onPrimary={() => approveProfile(item.id)}
            onSecondary={() => rejectProfile(item.id)}
            tertiaryLabel="Resubmit Query"
            onTertiary={() => resubmitProfile(item.id)}
          >
            <Text style={styles.stop}>Assigned stop: {item.assignedStop}</Text>
          </ActionCard>
        )}
      />
      <ProfileDetailModal profile={detail} onClose={() => setDetail(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  empty: { padding: spacing.xl, textAlign: 'center', color: '#8a939e' },
  stop: { fontSize: 13, color: '#5b6572' },
});
