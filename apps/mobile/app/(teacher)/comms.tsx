import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { colors, spacing, statusColors } from '@/design/teacher-theme';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { ClassSelector } from '@/components/teacher/ClassSelector';
import { CommsSegment } from '@/components/teacher/CommsSegment';
import { CommsFeedItem } from '@/components/teacher/CommsFeedItem';
import { AnnouncementModal, DirectReportModal } from '@/components/teacher/NewMessageModal';
import { CommsChannel, useSelectedClass, useTeacherStore } from '@/store/teacher.store';

export default function CommsHubScreen() {
  const params = useLocalSearchParams<{ reportStudentId?: string }>();
  const selected = useSelectedClass();
  const selectedClassId = useTeacherStore((state) => state.selectedClassId);
  const communications = useTeacherStore((state) => state.communications);
  const students = useTeacherStore((state) => state.students);
  const sendAnnouncement = useTeacherStore((state) => state.sendAnnouncement);
  const sendDirectReport = useTeacherStore((state) => state.sendDirectReport);
  const isHomeroom = selected?.isClassTeacher ?? false;
  const [tab, setTab] = useState<CommsChannel>(isHomeroom ? 'Announcement' : 'DirectReport');
  const [announcing, setAnnouncing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [presetStudentId, setPresetStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (!isHomeroom && tab === 'Announcement') setTab('DirectReport');
  }, [isHomeroom, tab]);

  useEffect(() => {
    if (typeof params.reportStudentId === 'string' && params.reportStudentId.length > 0) {
      setPresetStudentId(params.reportStudentId);
      setTab('DirectReport');
      setReporting(true);
    }
  }, [params.reportStudentId]);

  const classStudents = useMemo(
    () => students.filter((student) => student.classId === selectedClassId),
    [students, selectedClassId],
  );
  const filtered = useMemo(
    () => communications.filter((message) => message.classId === selectedClassId && message.channel === tab),
    [communications, selectedClassId, tab],
  );

  function openComposer() {
    if (tab === 'Announcement' && isHomeroom) setAnnouncing(true);
    else setReporting(true);
  }

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ClassSelector subtitle={isHomeroom ? 'Announcements and parent reports' : 'Direct reports only'} />
        <View style={styles.segmentWrap}>
          <CommsSegment value={tab} onChange={setTab} allowAnnouncements={isHomeroom} />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(message) => message.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {tab === 'Announcement' ? 'No class announcements yet.' : 'No direct reports yet.'}
            </Text>
          }
          renderItem={({ item, index }) => (
            <FadeInRow index={index}>
              <CommsFeedItem
                message={item}
                targetStudent={item.channel === 'DirectReport' ? classStudents.find((student) => student.id === item.targetStudentId) : undefined}
              />
            </FadeInRow>
          )}
        />
        <AnimatedPressable haptic="medium" onPress={openComposer} style={styles.fab}>
          <Plus color="#fff" size={26} strokeWidth={2.6} />
        </AnimatedPressable>
      </SafeAreaView>

      <AnnouncementModal
        visible={announcing}
        className={selected?.name ?? 'this class'}
        onClose={() => setAnnouncing(false)}
        onSend={(payload) => sendAnnouncement({ classId: selectedClassId, ...payload })}
      />
      <DirectReportModal
        visible={reporting}
        roster={classStudents}
        presetStudentId={presetStudentId}
        onClose={() => { setReporting(false); setPresetStudentId(null); }}
        onSend={(payload) => sendDirectReport({ classId: selectedClassId, ...payload })}
      />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  segmentWrap: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 3 },
  empty: { textAlign: 'center', color: colors.textMuted, paddingTop: spacing.xl },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: statusColors.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
