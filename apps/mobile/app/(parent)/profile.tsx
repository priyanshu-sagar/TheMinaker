import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { FadeInRow } from '@/components/glass/FadeInList';
import { ParentChrome } from '@/components/parent/ParentChrome';
import { ContactUpdateModal } from '@/components/parent/ContactUpdateModal';
import { ParentToast } from '@/components/parent/ParentToast';
import { StopDraft, StopMapModal } from '@/components/parent/StopMapModal';
import { StopReasonModal } from '@/components/parent/ContactUpdateModal';
import { colors, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { useActiveChild, useParentStore } from '@/store/parent.store';

export default function ParentProfileScreen() {
  const child = useActiveChild();
  const pendingRequests = useParentStore((state) => state.pendingRequests);
  const requestStopChange = useParentStore((state) => state.requestStopChange);
  const requestContactUpdate = useParentStore((state) => state.requestContactUpdate);
  const withdrawRequest = useParentStore((state) => state.withdrawRequest);
  const [contactOpen, setContactOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [draft, setDraft] = useState<StopDraft | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function statusLine(audience: string, kindLabel: string) {
    return audience === 'Gateman' ? `${kindLabel} — Pending Gateman Approval` : `${kindLabel} — Pending Admin Approval`;
  }

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ParentChrome />
        <ScrollView contentContainerStyle={styles.list}>
          <GlassCard style={[shadows.md, styles.assignedCard]}>
            <View style={styles.assigned}>
              <View style={styles.assignedText}>
                <Text style={styles.kicker}>Assigned now</Text>
                <Text style={styles.name}>{child?.name}</Text>
                <Text style={styles.line}>{child?.grade}</Text>
                <Text style={styles.line}>Stop {child?.boardingPoint.name}</Text>
                <Text style={styles.line}>Phone {child?.parentPhone || '—'}</Text>
              </View>
              <AnimatedPressable haptic="selection" onPress={() => setMapOpen(true)} style={styles.miniMap}>
                <MapView
                  style={styles.miniMapFill}
                  pointerEvents="none"
                  provider={undefined}
                  region={{
                    latitude: child?.boardingPoint.lat ?? 19.07,
                    longitude: child?.boardingPoint.lng ?? 72.87,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }}
                >
                  <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
                  {child ? <Marker coordinate={{ latitude: child.boardingPoint.lat, longitude: child.boardingPoint.lng }} /> : null}
                </MapView>
              </AnimatedPressable>
            </View>
          </GlassCard>
          <GlassCard style={styles.action}>
            <Text style={styles.kicker}>Gate passes</Text>
            <Text style={styles.line}>Last early exit: 9 Oct, 12:10 PM. Approved by the gateman.</Text>
          </GlassCard>
          <GlassCard style={styles.action}>
            <Text style={styles.kicker}>Transport fee</Text>
            <Text style={styles.line}>October is unpaid. Due 18 Oct. This is a local preview only.</Text>
          </GlassCard>
          <Text style={styles.section}>Ask for a change</Text>
          <Action label="Change boarding point" hint="Pin a new stop for the gateman" onPress={() => setMapOpen(true)} />
          <Action label="Update contact details" hint="Phone or email, confirmed with a code" onPress={() => setContactOpen(true)} />
          {pendingRequests.length > 0 ? <Text style={styles.section}>Pending requests</Text> : null}
          {pendingRequests.map((item, index) => (
            <FadeInRow key={item.id} index={index}>
              <Swipeable renderRightActions={() => (
                <AnimatedPressable haptic="medium" onPress={() => withdrawRequest(item.id)} style={styles.withdraw}>
                  <Text style={styles.withdrawText}>Withdraw</Text>
                </AnimatedPressable>
              )}>
                <AnimatedPressable haptic="selection" onPress={() => setOpenId(openId === item.id ? null : item.id)}>
                  <GlassCard style={styles.request}>
                    <Text style={styles.requestTitle}>{statusLine(item.audience, item.kind)}</Text>
                    {openId === item.id ? (
                      <View>
                        <Text style={styles.hint}>Current: {item.currentValue}</Text>
                        <Text style={styles.line}>Requested: {item.nextValue}</Text>
                        <Text style={styles.hint}>{item.reason}</Text>
                      </View>
                    ) : <Text style={styles.hint}>Tap to compare. Swipe to withdraw.</Text>}
                  </GlassCard>
                </AnimatedPressable>
              </Swipeable>
            </FadeInRow>
          ))}
        </ScrollView>
        <ParentToast message={toast} onDone={() => setToast(null)} />
      </SafeAreaView>
      <StopMapModal
        visible={mapOpen}
        currentStop={child?.boardingPoint.name ?? '—'}
        onClose={() => setMapOpen(false)}
        onConfirm={(next) => { setMapOpen(false); setDraft(next); }}
      />
      <StopReasonModal
        visible={draft !== null}
        currentStop={child?.boardingPoint.name ?? '—'}
        requested={draft ? `${draft.flat}, ${draft.area}` : ''}
        onClose={() => setDraft(null)}
        onSubmit={(reason) => {
          if (!draft) return;
          requestStopChange({ ...draft, reason });
          setDraft(null);
          setToast('Stop change is pending gateman approval.');
        }}
      />
      <ContactUpdateModal
        visible={contactOpen}
        currentPhone={child?.parentPhone ?? ''}
        currentEmail={child?.parentEmail ?? ''}
        onClose={() => setContactOpen(false)}
        onSubmit={(input) => {
          requestContactUpdate(input);
          setContactOpen(false);
          setToast('Contact update is pending admin approval.');
        }}
      />
    </MeshBackground>
  );
}

function Action({ label, hint, onPress }: { label: string; hint: string; onPress: () => void }) {
  return (
    <AnimatedPressable haptic="selection" onPress={onPress}>
      <GlassCard style={styles.action}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </GlassCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.lg, paddingBottom: 140 },
  assignedCard: { marginBottom: spacing.lg },
  assigned: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  assignedText: { flex: 1 },
  kicker: { ...typography.overline, color: portalAccents.parent.from },
  miniMap: { width: 110, height: 110, borderRadius: radius.lg, overflow: 'hidden' },
  miniMapFill: { flex: 1 },
  name: { ...typography.heading, marginTop: 4 },
  line: { ...typography.body, marginTop: 2 },
  section: { ...typography.overline, marginTop: spacing.lg, marginBottom: spacing.sm },
  action: { marginBottom: spacing.lg },
  actionLabel: { ...typography.bodyBold },
  hint: { ...typography.caption, marginTop: 2 },
  request: { marginBottom: spacing.sm },
  requestTitle: { ...typography.bodyBold },
  withdraw: { backgroundColor: colors.error, justifyContent: 'center', paddingHorizontal: spacing.lg, borderRadius: radius.md, marginBottom: spacing.sm },
  withdrawText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
