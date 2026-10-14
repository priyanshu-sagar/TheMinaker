import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassModal } from '@/components/glass/GlassModal';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useParentStore } from '@/store/parent.store';
import { ChildSwitcher } from './ChildSwitcher';

export function ParentChrome() {
  const notices = useParentStore((state) => state.notices);
  const markNoticesRead = useParentStore((state) => state.markNoticesRead);
  const unread = notices.filter((notice) => !notice.read).length;
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'school' | 'transit'>('school');
  const rows = notices.filter((notice) => notice.channel === tab);

  return (
    <View style={styles.row}>
      <View style={styles.switcher}><ChildSwitcher /></View>
      <AnimatedPressable
        haptic="selection"
        onPress={() => { setOpen(true); markNoticesRead(tab); }}
        style={styles.bell}
      >
        <Bell color={portalAccents.parent.from} size={20} />
        {unread > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View> : null}
      </AnimatedPressable>
      <GlassModal visible={open} title="Notifications" maxHeight="68%" onClose={() => setOpen(false)}>
        <View style={styles.tabs}>
          {(['school', 'transit'] as const).map((key) => (
            <AnimatedPressable key={key} haptic="selection" onPress={() => { setTab(key); markNoticesRead(key); }} style={[styles.tab, tab === key ? styles.tabOn : null]}>
              <Text style={styles.tabText}>{key === 'school' ? 'School Updates' : 'Bus Updates'}</Text>
            </AnimatedPressable>
          ))}
        </View>
        <ScrollView>
          {rows.map((notice) => (
            <View key={notice.id} style={styles.notice}>
              <Text style={styles.noticeTitle}>{notice.title}</Text>
              <Text style={styles.noticeBody}>{notice.body}</Text>
            </View>
          ))}
        </ScrollView>
      </GlassModal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  switcher: { flex: 1 },
  bell: { marginRight: spacing.lg, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceStrong },
  badge: { position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: palette.white, fontSize: 10, fontWeight: '700', backgroundColor: 'transparent' },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, minHeight: 40, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  tabOn: { borderColor: portalAccents.parent.from, backgroundColor: colors.infoBg },
  tabText: { ...typography.caption, color: colors.textPrimary },
  notice: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  noticeTitle: { ...typography.bodyBold },
  noticeBody: { ...typography.caption, marginTop: 2 },
});
