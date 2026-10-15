import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassModal } from '@/components/glass/GlassModal';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useGatemanStore } from '@/store/gateman.store';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = useGatemanStore((state) => state.notifications);
  const markNotifRead = useGatemanStore((state) => state.markNotifRead);
  const markAllNotifsRead = useGatemanStore((state) => state.markAllNotifsRead);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <AnimatedPressable
        haptic="selection"
        onPress={() => {
          setOpen(true);
        }}
        style={styles.bell}
      >
        <Bell color={portalAccents.gateman.from} size={20} />
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        ) : null}
      </AnimatedPressable>

      <GlassModal
        visible={open}
        title="Gate Notifications"
        maxHeight="65%"
        onClose={() => setOpen(false)}
      >
        <View style={styles.modalHeaderRow}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
          </Text>
          {unreadCount > 0 && (
            <AnimatedPressable
              haptic="selection"
              onPress={markAllNotifsRead}
              style={styles.markAllBtn}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </AnimatedPressable>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
          {notifications.length === 0 ? (
            <Text style={[typography.caption, styles.emptyText]}>No notifications</Text>
          ) : (
            notifications.map((item) => (
              <AnimatedPressable
                key={item.id}
                haptic="selection"
                onPress={() => markNotifRead(item.id)}
                style={[styles.noticeItem, !item.read && styles.unreadItem]}
              >
                <View style={styles.noticeTop}>
                  <Text
                    style={[
                      styles.categoryTag,
                      item.category === 'critical'
                        ? styles.criticalTag
                        : item.category === 'parent_action'
                        ? styles.parentTag
                        : styles.adminTag,
                    ]}
                  >
                    {item.category.toUpperCase().replace('_', ' ')}
                  </Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.noticeTitle}>{item.title}</Text>
                <Text style={styles.noticeBody}>{item.body}</Text>
              </AnimatedPressable>
            ))
          )}
        </ScrollView>
      </GlassModal>
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
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  markAllBtn: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  markAllText: {
    ...typography.caption,
    color: portalAccents.gateman.from,
    fontWeight: '600',
  },
  scrollList: {
    paddingBottom: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: spacing.xl,
    color: colors.textMuted,
  },
  noticeItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  unreadItem: {
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
  },
  noticeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  categoryTag: {
    ...typography.overline,
    fontSize: 9,
  },
  criticalTag: {
    color: colors.error,
  },
  parentTag: {
    color: portalAccents.gateman.from,
  },
  adminTag: {
    color: colors.info,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: portalAccents.gateman.from,
  },
  noticeTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  noticeBody: {
    ...typography.caption,
    marginTop: 2,
    color: colors.textMuted,
  },
});
