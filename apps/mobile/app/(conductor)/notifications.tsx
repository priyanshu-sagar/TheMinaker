import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { ConfirmRequest, GlassConfirmModal } from '@/components/conductor/GlassConfirmModal';
import { colors, palette, radius, shadows, spacing, typography } from '@/design/tokens';
import { ConductorNotification, useConductorStore } from '@/store/conductor.store';

const FILTERS = ['All', 'Gateman', 'Admin', 'Parent', 'SOS'] as const;

function age(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
  return 'Yesterday';
}

export default function AlertsScreen() {
  const notifications = useConductorStore((state) => state.notifications);
  const broadcasts = useConductorStore((state) => state.broadcasts);
  const markNotificationRead = useConductorStore((state) => state.markNotificationRead);
  const markBroadcastRead = useConductorStore((state) => state.markBroadcastRead);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);
  const feed = useMemo(() => {
    const notes: ConductorNotification[] = [
      ...notifications,
      ...broadcasts.map((item) => ({ id: item.id, category: item.from === 'Admin' ? 'Admin' as const : 'Gateman' as const, title: item.title, body: item.body, isRead: item.isRead, actionable: item.from === 'Gateman', timestamp: item.sentAt })),
    ];
    return notes.filter((item) => {
      if (filter === 'All') return true;
      if (filter === 'SOS') return item.title.toLowerCase().includes('sos') || item.category === 'System';
      return item.category === filter;
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [notifications, broadcasts, filter]);

  function tone(category: ConductorNotification['category']) {
    if (category === 'Admin') return styles.admin;
    if (category === 'Gateman') return styles.gate;
    if (category === 'Parent') return styles.parent;
    return styles.sos;
  }

  return (
    <MeshBackground>
      <ScrollView bounces={false} contentContainerStyle={styles.list}>
        <View style={styles.filters}>
          {FILTERS.map((item) => (
            <AnimatedPressable key={item} haptic="selection" onPress={() => setFilter(item)} style={[styles.filter, filter === item ? styles.filterOn : null]}>
              <Text style={styles.filterText}>{item === 'Gateman' ? 'Gateman directives' : item === 'Admin' ? 'Admin circulars' : item === 'Parent' ? 'Parent alerts' : item === 'SOS' ? 'SOS and safety' : 'All'}</Text>
            </AnimatedPressable>
          ))}
        </View>
        {feed.map((item) => (
          <GlassCard key={item.id} style={[shadows.sm, styles.card, item.isRead ? null : styles.unread]}>
            <Text style={[styles.badge, tone(item.category)]}>{item.category}</Text>
            <Text style={styles.body}>{item.title}</Text>
            <Text style={styles.meta}>{item.body}</Text>
            <Text style={styles.meta}>{age(item.timestamp)}{item.isRead ? '' : ' · Unread'}</Text>
            <View style={styles.actions}>
              {item.category === 'Gateman' ? <AnimatedPressable haptic="selection" onPress={() => { markNotificationRead(item.id); markBroadcastRead(item.id); }}><Text style={styles.link}>Acknowledge</Text></AnimatedPressable> : null}
              {item.category === 'Admin' ? <AnimatedPressable haptic="selection" onPress={() => markBroadcastRead(item.id)}><Text style={styles.link}>View detour note</Text></AnimatedPressable> : null}
              {item.category === 'Gateman' || item.category === 'Admin' ? <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(item.category === 'Gateman' ? 'tel:+919900011122' : 'tel:+911141230010')}><Text style={styles.link}>Call</Text></AnimatedPressable> : null}
            </View>
          </GlassCard>
        ))}
        <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'reject', title: 'Emergency call', summary: 'This calls the school security line. Use it only for a real emergency.', confirmLabel: 'Call now', onConfirm: () => Linking.openURL('tel:+911234567890') })} style={styles.sosBtn}>
          <Text style={styles.white}>Emergency — call the school</Text>
        </AnimatedPressable>
      </ScrollView>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: 140 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  filter: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.sm, minHeight: 32, justifyContent: 'center' },
  filterOn: { borderColor: colors.info, backgroundColor: colors.infoBg },
  filterText: { ...typography.caption, color: colors.textPrimary },
  card: { padding: spacing.md, marginBottom: spacing.sm },
  unread: { borderColor: colors.info, borderWidth: 1 },
  badge: { alignSelf: 'flex-start', ...typography.caption, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, fontWeight: '700' },
  admin: { backgroundColor: colors.infoBg, color: colors.info },
  gate: { backgroundColor: colors.warningBg, color: colors.warning },
  parent: { backgroundColor: colors.successBg, color: colors.success },
  sos: { backgroundColor: colors.errorBg, color: colors.error },
  body: { ...typography.bodyBold, marginTop: spacing.xs },
  meta: { ...typography.caption, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  link: { ...typography.bodyBold, color: colors.info, backgroundColor: 'transparent' },
  sosBtn: { minHeight: 52, borderRadius: radius.full, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  white: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
