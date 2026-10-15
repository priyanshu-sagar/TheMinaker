import { useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Bell, X } from 'lucide-react-native';
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
import { NotifCategory, useGatemanStore } from '@/store/gateman.store';

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

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const unread = notifications.filter((item) => !item.read).length;

  const rows = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((item) => item.category === filter);
  }, [notifications, filter]);

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
                      onPress={() => markNotifRead(item.id)}
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
                              onPress={() => markNotifRead(item.id)}
                              style={styles.reviewBtn}
                            >
                              <Text style={styles.reviewBtnText}>Review →</Text>
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
});
