import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/design/tokens';
import { FadeInRow } from '@/components/glass/FadeInList';
import { ActionCard } from './ActionCard';
import { DiffRows } from './DiffRow';
import { MiniMapSnippet } from './MiniMapSnippet';
import { EditRequest, useGatemanStore } from '@/store/gateman.store';

export function EditRequestsList() {
  const editRequests = useGatemanStore((state) => state.editRequests);
  const approveEdit = useGatemanStore((state) => state.approveEdit);
  const rejectEdit = useGatemanStore((state) => state.rejectEdit);

  if (editRequests.length === 0) {
    return <Text style={styles.empty}>No pending edit requests.</Text>;
  }

  return (
    <View style={styles.list}>
      {editRequests.map((item, index) => (
        <FadeInRow key={item.id} index={index}>
          <ActionCard
            title={item.target}
            primaryLabel="Approve"
            secondaryLabel="Reject"
            onPrimary={() => approveEdit(item.id)}
            onSecondary={() => rejectEdit(item.id)}
          >
            <DiffRows oldData={item.oldData} newData={item.newData} />
            <Text style={styles.mapCaption}>Proposed location — 500 m radius</Text>
            <MiniMapSnippet center={item.newCoordinates} />
          </ActionCard>
        </FadeInRow>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  empty: { ...typography.body, padding: spacing.xl, textAlign: 'center', color: colors.textMuted },
  mapCaption: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, marginTop: 4 },
});
