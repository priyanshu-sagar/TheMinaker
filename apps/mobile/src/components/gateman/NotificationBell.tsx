import { useMemo, useState } from 'react';
import { FlatList, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassModal } from '@/components/glass/GlassModal';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { GateNotification, NotifCategory, useGatemanStore } from '@/store/gateman.store';

const TABS: Array<{ key: 'all' | NotifCategory; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'bus_fleet', label: 'Bus & Fleet' },
  { key: 'parent_gate', label: 'Parent & Gate' },
  { key: 'requests', label: 'Approvals' },
  { key: 'admin', label: 'School Admin' },
];

export function NotificationBell() {
  const notifications = useGatemanStore((state) => state.notifications);
  const markNotifRead = useGatemanStore((state) => state.markNotifRead);
  const markAllNotifsRead = useGatemanStore((state) => state.markAllNotifsRead);
  const markBusAtSchool = useGatemanStore((state) => state.markBusAtSchool);
  const verifyPickup = useGatemanStore((state) => state.verifyPickup);
  const denyPickup = useGatemanStore((state) => state.denyPickup);
  const approveRequest = useGatemanStore((state) => state.approveRequest);
  const rejectRequest = useGatemanStore((state) => state.rejectRequest);
  const acknowledgeDirective = useGatemanStore((state) => state.acknowledgeDirective);
  const verifyOffLocation = useGatemanStore((state) => state.verifyOffLocation);
  const buses = useGatemanStore((state) => state.buses);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('all');
  const [active, setActive] = useState<GateNotification | null>(null);
  const unread = notifications.filter((item) => !item.read).length;
  const counts = useMemo(() => {
    const tally: Record<string, number> = { all: 0, bus_fleet: 0, parent_gate: 0, requests: 0, admin: 0 };
    notifications.forEach((item) => {
      if (!item.read) {
        tally.all += 1;
        tally[item.category] += 1;
      }
    });
    return tally;
  }, [notifications]);
  const rows = useMemo(
    () => notifications.filter((item) => tab === 'all' || item.category === tab),
    [notifications, tab],
  );

  function act(item: GateNotification, kind: 'resolve' | 'approve' | 'reject' | 'verify') {
    if (item.action === 'bus' && item.referenceId) markBusAtSchool(item.referenceId);
    if (item.action === 'pickup' && item.referenceId) {
      if (kind === 'reject') denyPickup(item.referenceId);
      else verifyPickup(item.referenceId);
    }
    if (item.action === 'request' && item.referenceId) {
      if (kind === 'reject') rejectRequest(item.referenceId);
      else approveRequest(item.referenceId);
    }
    if (item.action === 'directive' && item.referenceId) acknowledgeDirective(item.referenceId);
    if (item.action === 'student' && item.referenceId) verifyOffLocation(item.referenceId, 'Confirmed with the conductor from the notification.');
    markNotifRead(item.id);
    setActive(null);
  }

  const bus = active?.action === 'bus' ? buses.find((item) => item.id === active.referenceId) : undefined;

  return (
    <>
      <AnimatedPressable haptic="selection" onPress={() => setOpen(true)} style={styles.bell}>
        <Bell color={portalAccents.gateman.from} size={20} />
        {unread > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        ) : null}
      </AnimatedPressable>
      <GlassModal
        visible={open}
        fill
        scroll={false}
        maxHeight="88%"
        title={active ? 'Notification' : 'Notifications'}
        onClose={() => { setOpen(false); setActive(null); }}
      >
        {active ? (
          <View style={styles.detail}>
            <Text style={styles.title}>{active.title}</Text>
            <Text style={styles.body}>{active.body}</Text>
            {bus ? <Text style={styles.body}>{bus.conductorName} · {bus.routeName}</Text> : null}
            <View style={styles.actions}>
              {active.action === 'bus' && bus ? (
                <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${bus.conductorPhone}`)} style={styles.ghost}>
                  <Text style={styles.ghostText}>Call conductor</Text>
                </AnimatedPressable>
              ) : null}
              {active.action === 'request' || active.action === 'pickup' ? (
                <AnimatedPressable haptic="medium" onPress={() => act(active, 'reject')} style={styles.ghost}>
                  <Text style={styles.ghostText}>Reject</Text>
                </AnimatedPressable>
              ) : null}
              <AnimatedPressable haptic="medium" onPress={() => act(active, 'verify')} style={styles.solid}>
                <Text style={styles.solidText}>
                  {active.action === 'request' ? 'Approve' : active.action === 'directive' ? 'Acknowledge' : active.action === 'bus' ? 'Mark at school' : 'Verify'}
                </Text>
              </AnimatedPressable>
            </View>
            <AnimatedPressable haptic="selection" onPress={() => setActive(null)}>
              <Text style={styles.back}>Back to list</Text>
            </AnimatedPressable>
          </View>
        ) : (
          <View style={styles.listWrap}>
            <View style={styles.toolbar}>
              <Text style={styles.count}>{unread} unread</Text>
              <AnimatedPressable haptic="selection" onPress={markAllNotifsRead}><Text style={styles.back}>Mark all read</Text></AnimatedPressable>
            </View>
            <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
              {TABS.map((item) => (
                <AnimatedPressable key={item.key} haptic="selection" onPress={() => setTab(item.key)} style={[styles.tab, tab === item.key ? styles.tabOn : null]}>
                  <Text style={styles.tabText}>{item.label}{counts[item.key] ? ` ${counts[item.key]}` : ''}</Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
            <FlatList
              data={rows}
              keyExtractor={(item) => item.id}
              bounces={false}
              overScrollMode="never"
              renderItem={({ item }) => {
                const related = item.action === 'bus' ? buses.find((bus) => bus.id === item.referenceId) : undefined;
                return (
                  <View style={styles.card}>
                    <View style={styles.cardMain}>
                      <Text style={styles.tabText}>{item.category.replace('_', ' ')} · {new Date(item.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      {related ? <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${related.conductorPhone}`)} style={styles.mini}><Text style={styles.miniText}>Call</Text></AnimatedPressable> : null}
                      {item.action === 'request' || item.action === 'pickup' ? <AnimatedPressable haptic="medium" onPress={() => act(item, 'reject')} style={styles.mini}><Text style={styles.miniText}>Reject</Text></AnimatedPressable> : null}
                      {item.actionable ? <AnimatedPressable haptic="medium" onPress={() => act(item, 'verify')} style={styles.miniSolid}><Text style={styles.solidText}>{item.action === 'request' ? 'Approve' : item.action === 'bus' ? 'Arrived' : item.action === 'directive' ? 'Ack' : 'Verify'}</Text></AnimatedPressable> : null}
                      <AnimatedPressable haptic="selection" onPress={() => { markNotifRead(item.id); setActive(item); }}><Text style={styles.back}>Details</Text></AnimatedPressable>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        )}
      </GlassModal>
    </>
  );
}

const styles = StyleSheet.create({
  bell: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceStrong },
  badge: { position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: palette.white, fontSize: 10, fontWeight: '700', backgroundColor: 'transparent' },
  listWrap: { flex: 1 },
  count: { ...typography.caption },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  tabs: { gap: spacing.xs, paddingBottom: spacing.sm },
  card: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  cardMain: { flex: 1 },
  cardActions: { alignItems: 'flex-end', gap: 4 },
  mini: { minHeight: 28, paddingHorizontal: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, justifyContent: 'center' },
  miniSolid: { minHeight: 28, paddingHorizontal: spacing.sm, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, justifyContent: 'center' },
  miniText: { ...typography.caption, color: colors.textPrimary },
  tab: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.sm, minHeight: 32, justifyContent: 'center' },
  tabOn: { borderColor: portalAccents.gateman.from, backgroundColor: colors.warningBg },
  tabText: { ...typography.caption, color: colors.textPrimary },
  row: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  title: { ...typography.bodyBold },
  body: { ...typography.caption, marginTop: 2 },
  detail: { flex: 1, gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  ghost: { flex: 1, minHeight: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  ghostText: { ...typography.bodyBold },
  solid: { flex: 1, minHeight: 44, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center' },
  solidText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  back: { ...typography.bodyBold, color: portalAccents.gateman.from, marginTop: spacing.md, backgroundColor: 'transparent' },
});
