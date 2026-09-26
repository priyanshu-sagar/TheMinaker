import { FlatList, StyleSheet, Text } from 'react-native';
import { spacing } from '@/design/gateman-theme';
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
    <FlatList
      data={editRequests}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }: { item: EditRequest }) => (
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
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  empty: { padding: spacing.xl, textAlign: 'center', color: '#8a939e' },
  mapCaption: { fontSize: 12, fontWeight: '600', color: '#5b6572', marginTop: 4 },
});
