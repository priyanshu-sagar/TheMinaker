import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassModal } from '@/components/glass/GlassModal';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { ConductorNotification, useConductorStore } from '@/store/conductor.store';

const TABS = ['All', 'Parent', 'Gateman', 'Admin', 'System'] as const;
const BELL = 'M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z';

export function ConductorNotificationBell() {
  const notifications = useConductorStore((state) => state.notifications);
  const markNotificationRead = useConductorStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useConductorStore((state) => state.markAllNotificationsRead);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const unread = notifications.reduce((count, item) => count + (item.isRead ? 0 : 1), 0);
  const rows = useMemo(() => notifications.filter((item) => tab === 'All' || item.category === tab), [notifications, tab]);

  function openAction(item: ConductorNotification) {
    markNotificationRead(item.id);
    setOpen(false);
    if (item.actionType === 'PingReply' || item.actionType === 'BusChangeApproved' || item.actionType === 'BusChangeRejected' || item.actionType === 'OffLocationVerified') {
      router.push('/(conductor)/requests');
    }
  }

  return (
    <>
      <AnimatedPressable haptic="selection" onPress={() => setOpen(true)} style={styles.bell}>
        <Svg width={20} height={20} viewBox="0 0 24 24"><Path d={BELL} fill={colors.textPrimary} /></Svg>
        {unread > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View> : null}
      </AnimatedPressable>
      <GlassModal visible={open} fill scroll={false} maxHeight="85%" title="Notifications" onClose={() => setOpen(false)}>
        <View style={styles.flex}>
          <AnimatedPressable haptic="selection" onPress={markAllNotificationsRead}><Text style={styles.link}>Mark all read</Text></AnimatedPressable>
          <View style={styles.tabs}>
            {TABS.map((item) => (
              <AnimatedPressable key={item} haptic="selection" onPress={() => setTab(item)} style={[styles.tab, tab === item ? styles.tabOn : null]}>
                <Text style={styles.tabText}>{item}</Text>
              </AnimatedPressable>
            ))}
          </View>
          <FlatList
            data={rows}
            keyExtractor={(item) => item.id}
            bounces={false}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={7}
            ListEmptyComponent={<Text style={styles.empty}>All caught up</Text>}
            renderItem={({ item }) => <NoticeRow item={item} onOpen={openAction} />}
          />
        </View>
      </GlassModal>
    </>
  );
}

const NoticeRow = function NoticeRow({ item, onOpen }: { item: ConductorNotification; onOpen: (item: ConductorNotification) => void }) {
  return (
    <View style={styles.row}>
      {!item.isRead ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
      <View style={[styles.avatar, { backgroundColor: item.category === 'Gateman' ? colors.warningBg : item.category === 'Admin' ? colors.infoBg : item.category === 'Parent' ? colors.successBg : colors.neutralBg }]}>
        <Text style={styles.avatarText}>{item.category.slice(0, 1)}</Text>
      </View>
      <View style={styles.main}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</Text>
      </View>
      {item.actionable ? <AnimatedPressable haptic="selection" onPress={() => onOpen(item)}><Text style={styles.link}>Resolve</Text></AnimatedPressable> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bell: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceStrong },
  badge: { position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: palette.white, fontSize: 10, fontWeight: '700', backgroundColor: 'transparent' },
  link: { ...typography.bodyBold, color: portalAccents.conductor.from, backgroundColor: 'transparent' },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginVertical: spacing.sm },
  tab: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.sm, minHeight: 32, justifyContent: 'center' },
  tabOn: { backgroundColor: colors.successBg, borderColor: portalAccents.conductor.from },
  tabText: { ...typography.caption, color: colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.info },
  dotSpacer: { width: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.bodyBold },
  main: { flex: 1 },
  title: { ...typography.bodyBold },
  body: { ...typography.caption, marginTop: 2 },
  time: { ...typography.caption, marginTop: 2 },
  empty: { ...typography.body, textAlign: 'center', marginTop: spacing.xl },
});
