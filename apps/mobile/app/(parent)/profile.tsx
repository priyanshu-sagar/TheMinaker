import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { ChildSwitcher } from '@/components/parent/ChildSwitcher';
import { RequestModal } from '@/components/parent/RequestModal';
import { colors, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { useActiveChild, useParentStore } from '@/store/parent.store';

type RequestKind = 'bus' | 'stop' | 'phone' | 'details' | null;

export default function ParentProfileScreen() {
  const child = useActiveChild();
  const requests = useParentStore((state) => state.requests);
  const requestBusChange = useParentStore((state) => state.requestBusChange);
  const requestStopChange = useParentStore((state) => state.requestStopChange);
  const requestProfileUpdate = useParentStore((state) => state.requestProfileUpdate);
  const [kind, setKind] = useState<RequestKind>(null);
  const [toast, setToast] = useState<string | null>(null);

  const mine = requests.filter((item) => item.childId === child?.id);

  function done(message: string) {
    setKind(null);
    setToast(message);
  }

  const modal =
    kind === 'bus'
      ? { title: 'Request bus change', label: 'Requested bus or route', placeholder: 'e.g. Route 6, Andheri East' }
      : kind === 'stop'
        ? { title: 'Request boarding point', label: 'New boarding point', placeholder: 'e.g. Infinity Mall stop' }
        : kind === 'phone'
          ? { title: 'Update contact number', label: 'New phone number', placeholder: '+91 ...' }
          : { title: 'Edit child details', label: 'What should change', placeholder: 'e.g. spelling of the name' };

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ChildSwitcher />
        <ScrollView contentContainerStyle={styles.list}>
          <GlassCard style={shadows.md}>
            <Text style={styles.kicker}>Assigned now</Text>
            <Text style={styles.name}>{child?.name}</Text>
            <Text style={styles.line}>{child?.grade}</Text>
            <Text style={styles.line}>Bus {child?.assignedBusId}</Text>
            <Text style={styles.line}>Stop {child?.boardingPoint.name}</Text>
          </GlassCard>

          <Text style={styles.section}>Ask for a change</Text>
          <Action label="Request bus change" hint="Goes to the gateman" onPress={() => setKind('bus')} />
          <Action label="Request boarding point" hint="Goes to the gateman" onPress={() => setKind('stop')} />
          <Action label="Update contact number" hint="Goes to the school admin" onPress={() => setKind('phone')} />
          <Action label="Edit child details" hint="Goes to the school admin" onPress={() => setKind('details')} />

          {mine.length > 0 ? <Text style={styles.section}>Sent requests</Text> : null}
          {mine.map((item) => (
            <GlassCard key={item.id} style={styles.request}>
              <Text style={styles.requestTitle}>{item.kind}</Text>
              <Text style={styles.line}>{item.detail}</Text>
              <Text style={styles.hint}>To {item.audience}</Text>
            </GlassCard>
          ))}
          {toast ? <Text style={styles.toast}>{toast}</Text> : null}
        </ScrollView>
      </SafeAreaView>

      <RequestModal
        visible={kind !== null}
        title={modal.title}
        detailLabel={modal.label}
        detailPlaceholder={modal.placeholder}
        onClose={() => setKind(null)}
        onSubmit={(detail, reason) => {
          if (kind === 'bus') requestBusChange(detail, reason);
          if (kind === 'stop') requestStopChange(detail, reason);
          if (kind === 'phone') requestProfileUpdate({ kind: 'Contact number', detail, reason });
          if (kind === 'details') requestProfileUpdate({ kind: 'Child details', detail, reason });
          done('Request sent. It stays in this list until the school acts on it.');
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
  list: { padding: spacing.lg, paddingBottom: 110 },
  kicker: { ...typography.overline, color: portalAccents.parent.from },
  name: { ...typography.heading, marginTop: 4 },
  line: { ...typography.body, marginTop: 2 },
  section: { ...typography.overline, marginTop: spacing.lg, marginBottom: spacing.sm },
  action: { marginBottom: spacing.sm },
  actionLabel: { ...typography.bodyBold },
  hint: { ...typography.caption, marginTop: 2 },
  request: { marginBottom: spacing.sm },
  requestTitle: { ...typography.bodyBold },
  toast: {
    marginTop: spacing.md,
    backgroundColor: colors.successBg,
    color: colors.success,
    borderRadius: radius.md,
    padding: spacing.md,
    overflow: 'hidden',
  },
});
