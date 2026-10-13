import { useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@/design/tokens';
import { FadeInRow } from '@/components/glass/FadeInList';
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
        renderItem={({ item, index }: { item: ProfileApproval; index: number }) => (
          <FadeInRow index={index}>
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
          </FadeInRow>
        )}
      />
      <ProfileDetailModal profile={detail} onClose={() => setDetail(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  empty: { ...typography.body, padding: spacing.xl, textAlign: 'center', color: colors.textMuted },
  stop: { ...typography.caption, color: colors.textSecondary },
});
