import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { Fab } from '@/components/glass/Fab';
import { CommsSegment } from '@/components/teacher/CommsSegment';
import { CommsFeedItem } from '@/components/teacher/CommsFeedItem';
import { NewMessageModal } from '@/components/teacher/NewMessageModal';
import { CommsType, useTeacherStore } from '@/store/teacher.store';

export default function CommsHubScreen() {
  const communications = useTeacherStore((state) => state.communications);
  const myClass = useTeacherStore((state) => state.myClass);
  const sendNotification = useTeacherStore((state) => state.sendNotification);
  const [tab, setTab] = useState<CommsType>('Broadcast');
  const [composing, setComposing] = useState(false);

  const filtered = useMemo(() => communications.filter((message) => message.type === tab), [communications, tab]);

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Comms Hub</Text>
        </View>

        <View style={styles.segmentWrap}>
          <CommsSegment value={tab} onChange={setTab} />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(message) => message.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={<Text style={styles.empty}>No {tab === 'Broadcast' ? 'broadcasts' : 'complaints'} yet.</Text>}
          renderItem={({ item }) => (
            <CommsFeedItem message={item} targetStudent={myClass.find((student) => student.id === item.targetStudentId)} />
          )}
        />

        <Fab label="✉" onPress={() => setComposing(true)} color={statusColors.info} />
      </SafeAreaView>

      <NewMessageModal
        visible={composing}
        onClose={() => setComposing(false)}
        roster={myClass}
        onSend={sendNotification}
      />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  segmentWrap: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
  empty: { textAlign: 'center', color: colors.textMuted, paddingTop: spacing.xl },
});
