import { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Bell, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import {
  colors,
  palette,
  portalAccents,
  radius,
  shadows,
  spacing,
  typography,
} from '@/design/tokens';
import {
  GateNotification,
  NotifCategory,
  useGatemanStore,
} from '@/store/gateman.store';

const SCREEN_H = Dimensions.get('window').height;

type FilterKey = 'all' | NotifCategory;

const CHIPS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'bus_fleet', label: 'Fleet' },
  { key: 'parent_gate', label: 'Parent' },
  { key: 'requests', label: 'Requests' },
  { key: 'admin', label: 'Admin' },
];

function getCategoryColor(cat: NotifCategory): string {
  switch (cat) {
    case 'bus_fleet':
      return colors.warning; // amber
    case 'parent_gate':
      return colors.info; // blue
    case 'requests':
      return colors.primary; // indigo
    case 'admin':
      return colors.success; // green
  }
}

function getCategoryLabel(cat: NotifCategory): string {
  switch (cat) {
    case 'bus_fleet':
      return 'Fleet Alert';
    case 'parent_gate':
      return 'Parent & Gate';
    case 'requests':
      return 'Routing Request';
    case 'admin':
      return 'Admin Circular';
  }
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function NotificationBell() {
  const notifications = useGatemanStore((state) => state.notifications);
  const markNotifRead = useGatemanStore((state) => state.markNotifRead);
  const markAllNotifsRead = useGatemanStore((state) => state.markAllNotifsRead);
  const earlyPickups = useGatemanStore((state) => state.earlyPickups);
  const routingRequests = useGatemanStore((state) => state.routingRequests);
  const buses = useGatemanStore((state) => state.buses);
  const verifyPickup = useGatemanStore((state) => state.verifyPickup);
  const denyPickup = useGatemanStore((state) => state.denyPickup);
  const approveRequest = useGatemanStore((state) => state.approveRequest);
  const rejectRequest = useGatemanStore((state) => state.rejectRequest);
  const pingConductor = useGatemanStore((state) => state.pingConductor);
  const markBusAtSchool = useGatemanStore((state) => state.markBusAtSchool);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedNotif, setSelectedNotif] = useState<GateNotification | null>(null);

  const unread = notifications.filter((item) => !item.read).length;

  const rows = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((item) => item.category === filter);
  }, [notifications, filter]);

  // Resolve linked item
  const linkedPickup = useMemo(() => {
    if (!selectedNotif?.referenceId) return null;
    return earlyPickups.find((p) => p.id === selectedNotif.referenceId) || null;
  }, [selectedNotif, earlyPickups]);

  const linkedRequest = useMemo(() => {
    if (!selectedNotif?.referenceId) return null;
    return routingRequests.find((r) => r.id === selectedNotif.referenceId) || null;
  }, [selectedNotif, routingRequests]);

  const linkedBus = useMemo(() => {
    if (!selectedNotif?.referenceId) return null;
    return buses.find((b) => b.id === selectedNotif.referenceId) || null;
  }, [selectedNotif, buses]);

  function handleOpenNotif(item: GateNotification) {
    markNotifRead(item.id);
    setSelectedNotif(item);
  }

  function handleDirectVerifyPickup(id: string, notifId: string) {
    Alert.alert('Confirm Authorization', 'Authorize student early pickup at the gate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Authorize',
        onPress: () => {
          verifyPickup(id);
          markNotifRead(notifId);
          setSelectedNotif(null);
          Alert.alert('Authorized', 'Early pickup successfully authorized and recorded.');
        },
      },
    ]);
  }

  function handleDirectDenyPickup(id: string, notifId: string) {
    Alert.alert('Deny Pickup', 'Are you sure you want to deny this pickup?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deny',
        style: 'destructive',
        onPress: () => {
          denyPickup(id);
          markNotifRead(notifId);
          setSelectedNotif(null);
          Alert.alert('Denied', 'Early pickup request denied.');
        },
      },
    ]);
  }

  function handleDirectApproveRequest(id: string, notifId: string) {
    Alert.alert('Approve Request', 'Approve this routing modification request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          approveRequest(id);
          markNotifRead(notifId);
          setSelectedNotif(null);
          Alert.alert('Approved', 'Routing modification request approved.');
        },
      },
    ]);
  }

  function handleDirectRejectRequest(id: string, notifId: string) {
    Alert.alert('Reject Request', 'Reject this routing modification request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          rejectRequest(id);
          markNotifRead(notifId);
          setSelectedNotif(null);
          Alert.alert('Rejected', 'Routing request has been rejected.');
        },
      },
    ]);
  }

  function handleDirectPingConductor(busId: string, notifId: string) {
    pingConductor(busId);
    markNotifRead(notifId);
    setSelectedNotif(null);
    Alert.alert('Ping Sent', 'High-priority ping dispatched to conductor.');
  }

  function handleDirectMarkAtSchool(busId: string, notifId: string) {
    Alert.alert('Mark At School', 'Place this bus at the school gate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          markBusAtSchool(busId);
          markNotifRead(notifId);
          setSelectedNotif(null);
          Alert.alert('Updated', 'Bus marked as At School.');
        },
      },
    ]);
  }

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

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          {/* Backdrop */}
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

          {/* Sheet */}
          <View style={[styles.sheet, { height: SCREEN_H * 0.78 }]}>
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, styles.sheetOverlay]} />

            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header row */}
            <View style={styles.headerRow}>
              <View style={styles.titleWrap}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unread > 0 ? (
                  <View style={styles.unreadCountBadge}>
                    <Text style={styles.unreadCountText}>{unread} new</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.headerActions}>
                {unread > 0 ? (
                  <AnimatedPressable
                    haptic="light"
                    onPress={markAllNotifsRead}
                    style={styles.markAllBtn}
                  >
                    <Text style={styles.markAllText}>Mark All Read</Text>
                  </AnimatedPressable>
                ) : null}
                <AnimatedPressable
                  haptic="light"
                  onPress={() => setOpen(false)}
                  style={styles.closeBtn}
                >
                  <X size={18} color={colors.textMuted} />
                </AnimatedPressable>
              </View>
            </View>

            {/* Filter chips */}
            <View style={styles.chipsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                {CHIPS.map((chip) => {
                  const active = filter === chip.key;
                  return (
                    <AnimatedPressable
                      key={chip.key}
                      haptic="selection"
                      onPress={() => setFilter(chip.key)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active ? styles.chipTextActive : styles.chipTextInactive,
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Notifications list */}
            <ScrollView
              contentContainerStyle={styles.listScroll}
              showsVerticalScrollIndicator={false}
            >
              {rows.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No notifications in this category</Text>
                </View>
              ) : null}

              {rows.map((item) => (
                <View
                  key={item.id}
                  style={[styles.cardContainer, item.read && styles.readCard]}
                >
                  <GlassCard padded={false} style={shadows.sm}>
                    <AnimatedPressable
                      haptic="light"
                      onPress={() => handleOpenNotif(item)}
                      style={styles.cardInner}
                    >
                      {/* Left colored strip: 4px wide, full height */}
                      <View
                        style={[
                          styles.colorStrip,
                          { backgroundColor: getCategoryColor(item.category) },
                        ]}
                      />

                      {/* Content */}
                      <View style={styles.cardBodyWrap}>
                        <View style={styles.cardTopRow}>
                          <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.cardTime}>
                            {formatTime(item.timestamp)}
                          </Text>
                        </View>
                        <Text style={styles.cardBody} numberOfLines={2}>
                          {item.body}
                        </Text>
                        {item.actionable ? (
                          <View style={styles.actionRow}>
                            <AnimatedPressable
                              haptic="medium"
                              onPress={() => handleOpenNotif(item)}
                              style={styles.reviewBtn}
                            >
                              <Text style={styles.reviewBtnText}>Review & Resolve →</Text>
                            </AnimatedPressable>
                          </View>
                        ) : null}
                      </View>
                    </AnimatedPressable>
                  </GlassCard>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Direct Resolution Detail Modal */}
      <Modal
        visible={Boolean(selectedNotif)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNotif(null)}
      >
        <View style={styles.detailBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedNotif(null)} />
          {selectedNotif && (
            <View style={styles.detailContainer}>
              <GlassCard style={shadows.lg}>
                {/* Header */}
                <View style={styles.detailHeader}>
                  <View style={[styles.detailCategoryPill, { backgroundColor: getCategoryColor(selectedNotif.category) + '22' }]}>
                    <Text style={[styles.detailCategoryText, { color: getCategoryColor(selectedNotif.category) }]}>
                      {getCategoryLabel(selectedNotif.category)}
                    </Text>
                  </View>
                  <AnimatedPressable haptic="light" onPress={() => setSelectedNotif(null)} style={styles.closeBtn}>
                    <X size={16} color={colors.textMuted} />
                  </AnimatedPressable>
                </View>

                <Text style={styles.detailTitle}>{selectedNotif.title}</Text>
                <Text style={styles.detailTime}>{formatTime(selectedNotif.timestamp)}</Text>
                <Text style={styles.detailBody}>{selectedNotif.body}</Text>

                {/* Linked Early Pickup Resolution */}
                {linkedPickup && (
                  <View style={styles.linkedBlock}>
                    <Text style={styles.linkedHeader}>Early Pickup Verification Dossier</Text>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Student:</Text><Text style={styles.metaVal}>{linkedPickup.studentName} ({linkedPickup.grade})</Text></View>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Parent:</Text><Text style={styles.metaVal}>{linkedPickup.parentName}</Text></View>
                    <Pressable onPress={() => Linking.openURL(`tel:${linkedPickup.parentPhone}`)}>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Phone:</Text><Text style={[styles.metaVal, { color: portalAccents.gateman.from }]}>{linkedPickup.parentPhone} 📞</Text></View>
                    </Pressable>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Reason:</Text><Text style={styles.metaValItalic}>"{linkedPickup.reason}"</Text></View>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Status:</Text><Text style={[styles.metaVal, { fontWeight: '700', color: linkedPickup.status === 'Verified' ? colors.success : linkedPickup.status === 'Denied' ? colors.error : colors.warning }]}>{linkedPickup.status}</Text></View>

                    {linkedPickup.status === 'Pending' && (
                      <View style={styles.directActionRow}>
                        <AnimatedPressable haptic="heavy" style={styles.btnPrimary} onPress={() => handleDirectVerifyPickup(linkedPickup.id, selectedNotif.id)}>
                          <LinearGradient colors={['#10B981', '#34D399']} style={styles.gradientBtn}>
                            <Text style={styles.btnTextWhite}>✓ Verify & Authorize</Text>
                          </LinearGradient>
                        </AnimatedPressable>
                        <AnimatedPressable haptic="medium" style={styles.btnDanger} onPress={() => handleDirectDenyPickup(linkedPickup.id, selectedNotif.id)}>
                          <Text style={styles.btnTextDanger}>✕ Deny</Text>
                        </AnimatedPressable>
                      </View>
                    )}
                  </View>
                )}

                {/* Linked Routing Request Resolution */}
                {linkedRequest && (
                  <View style={styles.linkedBlock}>
                    <Text style={styles.linkedHeader}>Routing Modification Details</Text>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Student:</Text><Text style={styles.metaVal}>{linkedRequest.studentName} ({linkedRequest.grade})</Text></View>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Request Type:</Text><Text style={styles.metaVal}>{linkedRequest.requestType}</Text></View>
                    {linkedRequest.requestType === 'Stop Change' ? (
                      <>
                        <View style={styles.metaRow}><Text style={styles.metaLabel}>Current Stop:</Text><Text style={styles.metaVal}>{linkedRequest.oldStop}</Text></View>
                        <View style={styles.metaRow}><Text style={styles.metaLabel}>Requested Stop:</Text><Text style={[styles.metaVal, { color: colors.success, fontWeight: '700' }]}>{linkedRequest.newStop}</Text></View>
                      </>
                    ) : (
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Transfer:</Text><Text style={styles.metaVal}>{linkedRequest.fromBusNumber} ➔ {linkedRequest.toBusNumber}</Text></View>
                    )}
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Parent Reason:</Text><Text style={styles.metaValItalic}>"{linkedRequest.reason}"</Text></View>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Status:</Text><Text style={[styles.metaVal, { fontWeight: '700', color: linkedRequest.status === 'Approved' ? colors.success : linkedRequest.status === 'Rejected' ? colors.error : colors.warning }]}>{linkedRequest.status}</Text></View>

                    {linkedRequest.status === 'Pending' && (
                      <View style={styles.directActionRow}>
                        <AnimatedPressable haptic="heavy" style={styles.btnPrimary} onPress={() => handleDirectApproveRequest(linkedRequest.id, selectedNotif.id)}>
                          <LinearGradient colors={['#10B981', '#34D399']} style={styles.gradientBtn}>
                            <Text style={styles.btnTextWhite}>✓ Approve Change</Text>
                          </LinearGradient>
                        </AnimatedPressable>
                        <AnimatedPressable haptic="medium" style={styles.btnDanger} onPress={() => handleDirectRejectRequest(linkedRequest.id, selectedNotif.id)}>
                          <Text style={styles.btnTextDanger}>✕ Reject</Text>
                        </AnimatedPressable>
                      </View>
                    )}
                  </View>
                )}

                {/* Linked Bus Resolution */}
                {linkedBus && (
                  <View style={styles.linkedBlock}>
                    <Text style={styles.linkedHeader}>Vehicle Operational Control</Text>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Bus Number:</Text><Text style={styles.metaVal}>{linkedBus.busNumber}</Text></View>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Route:</Text><Text style={styles.metaVal}>{linkedBus.routeName}</Text></View>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Conductor:</Text><Text style={styles.metaVal}>{linkedBus.conductorName}</Text></View>
                    <View style={styles.metaRow}><Text style={styles.metaLabel}>Status:</Text><Text style={[styles.metaVal, { fontWeight: '700' }]}>{linkedBus.status}</Text></View>

                    <View style={styles.directActionRow}>
                      <AnimatedPressable haptic="medium" style={styles.btnPrimary} onPress={() => handleDirectPingConductor(linkedBus.id, selectedNotif.id)}>
                        <LinearGradient colors={[portalAccents.gateman.from, portalAccents.gateman.to]} style={styles.gradientBtn}>
                          <Text style={styles.btnTextWhite}>Ping Conductor 📡</Text>
                        </LinearGradient>
                      </AnimatedPressable>
                      {linkedBus.status !== 'At School' && (
                        <AnimatedPressable haptic="medium" style={styles.btnSecondary} onPress={() => handleDirectMarkAtSchool(linkedBus.id, selectedNotif.id)}>
                          <Text style={styles.btnTextSecondary}>Mark At School 🏫</Text>
                        </AnimatedPressable>
                      )}
                    </View>
                  </View>
                )}

                {/* Dismiss button for general notifs */}
                {!linkedPickup && !linkedRequest && !linkedBus && (
                  <View style={{ marginTop: spacing.lg }}>
                    <AnimatedPressable haptic="medium" onPress={() => { markNotifRead(selectedNotif.id); setSelectedNotif(null); }}>
                      <LinearGradient colors={[portalAccents.gateman.from, portalAccents.gateman.to]} style={styles.gradientBtn}>
                        <Text style={styles.btnTextWhite}>✓ Acknowledge & Mark Resolved</Text>
                      </LinearGradient>
                    </AnimatedPressable>
                  </View>
                )}
              </GlassCard>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bell: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingTop: spacing.xs,
  },
  sheetOverlay: {
    backgroundColor: 'rgba(248,250,252,0.92)',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.title,
    fontSize: 20,
    color: colors.textPrimary,
  },
  unreadCountBadge: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  unreadCountText: {
    ...typography.caption,
    fontWeight: '700',
    color: portalAccents.gateman.from,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  markAllBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  markAllText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  chipsContainer: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: portalAccents.gateman.from,
    borderColor: portalAccents.gateman.from,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.borderStrong,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
  },
  chipTextActive: {
    color: palette.white,
  },
  chipTextInactive: {
    color: colors.textMuted,
  },
  listScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  emptyWrap: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cardContainer: {
    marginBottom: spacing.xs,
  },
  readCard: {
    opacity: 0.55,
  },
  cardInner: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 74,
  },
  colorStrip: {
    width: 4,
  },
  cardBodyWrap: {
    flex: 1,
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  cardTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    flex: 1,
    marginRight: spacing.sm,
    color: colors.textPrimary,
  },
  cardTime: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  cardBody: {
    ...typography.caption,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  actionRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
  },
  reviewBtn: {
    backgroundColor: portalAccents.gateman.from,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  reviewBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: palette.white,
  },
  // Detail Modal styles
  detailBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  detailContainer: {
    width: '100%',
    maxWidth: 420,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailCategoryPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  detailCategoryText: {
    ...typography.caption,
    fontWeight: '700',
  },
  detailTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  detailTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  detailBody: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  linkedBlock: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkedHeader: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metaVal: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaValItalic: {
    ...typography.caption,
    fontStyle: 'italic',
    color: colors.textSecondary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  directActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btnPrimary: {
    flex: 1,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  btnSecondary: {
    flex: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  btnDanger: {
    flex: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: 'rgba(244,63,94,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  gradientBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  btnTextWhite: {
    ...typography.bodyBold,
    fontSize: 14,
    color: palette.white,
  },
  btnTextDanger: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.error,
  },
  btnTextSecondary: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
