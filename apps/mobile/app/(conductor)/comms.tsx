import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { GlassCard } from '@/components/glass/GlassCard';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { ConfirmRequest, GlassConfirmModal } from '@/components/conductor/GlassConfirmModal';
import { colors, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { useConductorStore } from '@/store/conductor.store';

export default function CommsScreen() {
  const broadcasts = useConductorStore((state) => state.broadcasts);
  const markBroadcastRead = useConductorStore((state) => state.markBroadcastRead);
  const [tab, setTab] = useState<'Broadcasts' | 'Directory'>('Broadcasts');
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);

  return (
    <MeshBackground>
      <View style={styles.switcher}>
        {(['Broadcasts', 'Directory'] as const).map((item) => (
          <AnimatedPressable key={item} haptic="selection" onPress={() => setTab(item)} style={[styles.switch, tab === item ? styles.switchOn : null]}>
            <Text style={styles.switchText}>{item}</Text>
          </AnimatedPressable>
        ))}
      </View>
      <ScrollView bounces={false} contentContainerStyle={styles.list}>
        {tab === 'Broadcasts' ? broadcasts.map((item) => (
          <GlassCard key={item.id} style={[shadows.sm, styles.card]}>
            <Text style={[styles.badge, item.from === 'Admin' ? styles.admin : styles.gate]}>{item.from}</Text>
            <Text style={styles.body}>{item.title}</Text>
            <Text style={styles.meta}>{item.body}</Text>
            <Text style={styles.meta}>{new Date(item.sentAt).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}</Text>
            {item.isRead ? null : <AnimatedPressable haptic="selection" onPress={() => markBroadcastRead(item.id)}><Text style={styles.link}>Mark as read</Text></AnimatedPressable>}
          </GlassCard>
        )) : (
          <View>
            <GlassCard style={[shadows.md, styles.card]}>
              <LinearGradient colors={[portalAccents.gateman.from, portalAccents.gateman.to]} style={styles.avatar}><Text style={styles.avatarText}>R</Text></LinearGradient>
              <Text style={styles.body}>Ramesh Kumar</Text>
              <Text style={styles.meta}>Gateman on duty · Gate open</Text>
              <AnimatedPressable haptic="medium" onPress={() => Linking.openURL('tel:+919900011122')} style={styles.call}><Text style={styles.white}>Call gateman</Text></AnimatedPressable>
            </GlassCard>
            <GlassCard style={[shadows.md, styles.card]}>
              <View style={styles.adminAvatar}><Text style={styles.avatarText}>P</Text></View>
              <Text style={styles.body}>Principal office</Text>
              <Text style={styles.meta}>School administration</Text>
              <AnimatedPressable haptic="medium" onPress={() => Linking.openURL('tel:+911141230010')} style={styles.call}><Text style={styles.white}>Call admin</Text></AnimatedPressable>
            </GlassCard>
            <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'reject', title: 'Emergency call', summary: 'This calls the school emergency line. Use it only for a real emergency.', confirmLabel: 'Call now', onConfirm: () => Linking.openURL('tel:+911234567890') })} style={styles.sos}>
              <Text style={styles.white}>Emergency — call the school</Text>
            </AnimatedPressable>
          </View>
        )}
      </ScrollView>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  switcher: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  switch: { flex: 1, minHeight: 36, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white },
  switchOn: { borderColor: portalAccents.conductor.from, backgroundColor: colors.successBg },
  switchText: { ...typography.caption, color: colors.textPrimary, fontWeight: '700' },
  list: { padding: spacing.lg, paddingBottom: 140 },
  card: { padding: spacing.md, marginBottom: spacing.sm },
  badge: { alignSelf: 'flex-start', ...typography.caption, overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, fontWeight: '700' },
  admin: { backgroundColor: colors.infoBg, color: colors.info },
  gate: { backgroundColor: colors.warningBg, color: colors.warning },
  body: { ...typography.bodyBold, marginTop: spacing.xs },
  meta: { ...typography.caption, marginTop: 2 },
  link: { ...typography.bodyBold, color: portalAccents.conductor.from, marginTop: spacing.sm, backgroundColor: 'transparent' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  adminAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.info },
  avatarText: { ...typography.heading, color: palette.white, backgroundColor: 'transparent' },
  call: { marginTop: spacing.sm, minHeight: 40, borderRadius: radius.full, backgroundColor: portalAccents.conductor.from, alignItems: 'center', justifyContent: 'center' },
  white: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  sos: { minHeight: 52, borderRadius: radius.full, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
});
