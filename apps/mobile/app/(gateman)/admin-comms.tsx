import { useMemo, useState } from 'react';
import { FlatList, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { SearchField, SlideToConfirm } from '@/components/gateman/sheets';
import { GlassModal } from '@/components/glass/GlassModal';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { BusStatus, useGatemanStore } from '@/store/gateman.store';
import { SHEET } from '@/components/gateman/sheets';
import { ConfirmRequest, GlassConfirmModal } from '@/components/gateman/GlassConfirmModal';

const TEMPLATES = ['Gate closing in 10 mins', 'Hold departure', 'Heavy traffic on main approach', 'All buses report headcount'];
const STATUS: Array<'All' | BusStatus> = ['All', 'En Route', 'Delayed', 'At School', 'Offline'];

export default function AdminCommsScreen() {
  const contacts = useGatemanStore((state) => state.contacts);
  const buses = useGatemanStore((state) => state.buses);
  const areas = useGatemanStore((state) => state.areas);
  const directives = useGatemanStore((state) => state.directives);
  const gateOpen = useGatemanStore((state) => state.gateOpen);
  const adminOverride = useGatemanStore((state) => state.adminOverride);
  const threshold = useGatemanStore((state) => state.afternoonThresholdMinutes);
  const sendBroadcast = useGatemanStore((state) => state.sendBroadcast);
  const acknowledgeDirective = useGatemanStore((state) => state.acknowledgeDirective);
  const addShiftLog = useGatemanStore((state) => state.addShiftLog);
  const pingConductor = useGatemanStore((state) => state.pingConductor);
  const setClockOverride = useGatemanStore((state) => state.setClockOverride);
  const clockOverride = useGatemanStore((state) => state.clockOverride);
  const adminOverrideGate = useGatemanStore((state) => state.adminOverrideGate);
  const [query, setQuery] = useState('');
  const [areaId, setAreaId] = useState<string | 'all'>('all');
  const [status, setStatus] = useState<(typeof STATUS)[number]>('All');
  const [custom, setCustom] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [ask, setAsk] = useState<ConfirmRequest | null>(null);

  const conductors = useMemo(() => {
    const area = areas.find((item) => item.id === areaId);
    const needle = query.trim().toLowerCase();
    return buses.filter((bus) => {
      if (area && !area.busIds.includes(bus.id)) return false;
      if (status !== 'All' && bus.status !== status && !(status === 'En Route' && bus.status === 'Active')) return false;
      if (!needle) return true;
      return `${bus.conductorName} ${bus.busNumber} ${bus.routeName} ${bus.areaName}`.toLowerCase().includes(needle);
    });
  }, [buses, areas, areaId, query, status]);

  const thresholdLabel = `${String(Math.floor(threshold / 60)).padStart(2, '0')}:${String(threshold % 60).padStart(2, '0')}`;

  function broadcast(message: string) {
    const area = areas.find((item) => item.id === areaId);
    const target = area ? area.name : 'all conductors';
    setAsk({ tone: 'override', title: 'Send broadcast', summary: `"${message}" goes to ${target}.`, confirmLabel: 'Confirm send', onConfirm: () => sendBroadcast(message, areaId) });
  }

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin</Text>
          <NotificationBell />
        </View>
        <FlatList
          style={styles.flex}
          data={conductors}
          keyExtractor={(item) => item.id}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <Text style={styles.kicker}>School desk</Text>
              {contacts.filter((item) => item.role !== 'Conductor').map((item) => (
                <View key={item.id} style={styles.person}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.slice(0, 1)}</Text></View>
                  <View style={styles.main}>
                    <Text style={styles.body}>{item.role === 'Reception' ? 'Reception' : item.name}</Text>
                    <Text style={styles.meta}>{item.role} · {item.available ? 'Available' : 'On call'}</Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={styles.meta}>{item.phone}</Text>
                    <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${item.phone}`)} style={styles.call}>
                      <Text style={styles.callText}>Call</Text>
                    </AnimatedPressable>
                  </View>
                </View>
              ))}

              <View style={styles.schedule}>
                <Text style={styles.body}>Gate schedule</Text>
                <Text style={styles.meta}>Morning window 06:30–08:30 · Afternoon dismissal {thresholdLabel}</Text>
                <Text style={styles.meta}>Gate is {gateOpen ? 'open' : 'closed'}{adminOverride?.active ? ` · Override by ${adminOverride.openedBy}` : ''}</Text>
                <AnimatedPressable haptic="medium" onPress={() => setAsk({ tone: 'override', title: 'Request admin override', summary: 'School admin will take the gate from this shift.', confirmLabel: 'Confirm escalate', onConfirm: () => { addShiftLog({ action: 'OVERRIDE', description: 'Gateman requested a school admin gate override' }); adminOverrideGate(!gateOpen, 'School Admin'); } })}>
                  <Text style={styles.link}>Request admin override</Text>
                </AnimatedPressable>
              </View>

              <Text style={styles.kicker}>Quick broadcasts</Text>
              <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
                <AnimatedPressable haptic="selection" onPress={() => setAreaId('all')} style={[styles.pill, areaId === 'all' ? styles.pillOn : null]}>
                  <Text style={styles.pillText}>All conductors</Text>
                </AnimatedPressable>
                {areas.map((area) => (
                  <AnimatedPressable key={area.id} haptic="selection" onPress={() => setAreaId(area.id)} style={[styles.pill, areaId === area.id ? styles.pillOn : null]}>
                    <Text style={styles.pillText}>{area.name}</Text>
                  </AnimatedPressable>
                ))}
              </ScrollView>
              {TEMPLATES.map((template) => (
                <View key={template} style={styles.broadcast}>
                  <Text style={styles.body}>▸ {template}</Text>
                  <AnimatedPressable haptic="selection" onPress={() => broadcast(template)} style={styles.send}>
                    <Text style={styles.sendText}>Send</Text>
                  </AnimatedPressable>
                </View>
              ))}
              <View style={styles.broadcast}>
                <SearchField value={custom} onChangeText={setCustom} placeholder="Custom broadcast" />
                <AnimatedPressable haptic="selection" onPress={() => { if (custom.trim()) { broadcast(custom.trim()); setCustom(''); } }} style={styles.send}>
                  <Text style={styles.sendText}>Send</Text>
                </AnimatedPressable>
              </View>

              <AnimatedPressable haptic="medium" onPress={() => setAlertOpen(true)} style={styles.alertBtn}>
                <Text style={styles.callText}>Priority gate and fleet alert</Text>
                <Text style={styles.alertSub}>Sends an immediate notice to Reception, School Admin, and conductors.</Text>
              </AnimatedPressable>

              <Text style={styles.kicker}>School admin directives</Text>
              {directives.map((item) => (
                <View key={item.id} style={styles.person}>
                  <View style={styles.main}>
                    <Text style={styles.body}>{item.title}</Text>
                    <Text style={styles.meta}>{item.from} · {item.body}</Text>
                  </View>
                  {item.acknowledged ? <Text style={styles.meta}>Done</Text> : (
                    <AnimatedPressable haptic="medium" onPress={() => acknowledgeDirective(item.id)} style={styles.send}><Text style={styles.sendText}>Ack</Text></AnimatedPressable>
                  )}
                </View>
              ))}
              <AnimatedPressable haptic="selection" onPress={() => setClockOverride(clockOverride === 14 * 60 + 30 ? null : 14 * 60 + 30)}>
                <Text style={styles.meta}>{clockOverride === 14 * 60 + 30 ? 'Clock preview 14:30. Tap for the real clock.' : 'Preview the afternoon window at 14:30'}</Text>
              </AnimatedPressable>

              <Text style={styles.kicker}>Conductors</Text>
              <SearchField value={query} onChangeText={setQuery} placeholder="Search conductors" />
              <View style={styles.pillsWrap}>
                {STATUS.map((item) => (
                  <AnimatedPressable key={item} haptic="selection" onPress={() => setStatus(item)} style={[styles.pill, status === item ? styles.pillOn : null]}>
                    <Text style={styles.pillText}>{item}</Text>
                  </AnimatedPressable>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.person}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.conductorName.slice(0, 1)}</Text></View>
              <View style={styles.main}>
                <Text style={styles.body}>{item.conductorName}</Text>
                <Text style={styles.meta}>{item.busNumber} · {item.areaName}</Text>
              </View>
              <Text style={styles.status}>{item.status}</Text>
              <AnimatedPressable haptic="selection" onPress={() => { pingConductor(item.id); setAsk({ tone: 'info', title: 'Ping sent', summary: `${item.conductorName} was pinged on ${item.busNumber}.`, confirmLabel: 'OK', onConfirm: () => undefined }); }} style={styles.send}>
                <Text style={styles.sendText}>Ping</Text>
              </AnimatedPressable>
              <AnimatedPressable haptic="medium" onPress={() => Linking.openURL(`tel:${item.conductorPhone}`)} style={styles.call}>
                <Text style={styles.callText}>Call</Text>
              </AnimatedPressable>
            </View>
          )}
        />
      </SafeAreaView>
      <GlassModal visible={alertOpen} fill maxHeight={SHEET} title="Priority gate and fleet alert" onClose={() => setAlertOpen(false)}>
        <Text style={styles.meta}>This reaches Reception, School Admin, and every conductor on duty.</Text>
        <SlideToConfirm label="Slide to send the priority alert" onConfirm={() => { addShiftLog({ action: 'SOS_SENT', description: 'Priority gate and fleet alert sent to reception, admin, and conductors' }); setAlertOpen(false); }} />
      </GlassModal>
      <GlassConfirmModal request={ask} onClose={() => setAsk(null)} />
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, backgroundColor: palette.offWhite, zIndex: 2 },
  title: { ...typography.heading },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 150 },
  kicker: { ...typography.overline, marginTop: spacing.md, marginBottom: spacing.sm },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.warningBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.bodyBold, color: portalAccents.gateman.from },
  main: { flex: 1 },
  body: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  call: { minHeight: 32, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center' },
  callText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  link: { ...typography.bodyBold, color: portalAccents.gateman.from, marginTop: spacing.xs, backgroundColor: 'transparent' },
  schedule: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: palette.white, borderWidth: 1, borderColor: colors.borderStrong },
  pills: { gap: spacing.xs, paddingBottom: spacing.sm },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  pill: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: palette.white, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  pillOn: { borderColor: portalAccents.gateman.from, backgroundColor: colors.warningBg },
  pillText: { ...typography.caption, color: colors.textPrimary },
  broadcast: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  send: { borderRadius: radius.full, borderWidth: 1, borderColor: portalAccents.gateman.from, paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center' },
  sendText: { ...typography.caption, color: portalAccents.gateman.from },
  alertBtn: { marginTop: spacing.md, borderRadius: radius.md, backgroundColor: colors.error, padding: spacing.md },
  alertSub: { ...typography.caption, color: palette.white, marginTop: 4, backgroundColor: 'transparent' },
  status: { ...typography.caption, color: colors.textPrimary },
});
