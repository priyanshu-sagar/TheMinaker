import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Phone } from 'lucide-react-native';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { ChildSwitcher } from '@/components/parent/ChildSwitcher';
import { colors, palette, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';
import { useParentStore } from '@/store/parent.store';

export default function ParentSupportScreen() {
  const transit = useParentStore((state) => state.liveTransit);

  async function call(phone: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    await Linking.openURL(`tel:${phone}`).catch(() => undefined);
  }

  const contacts = [
    { title: 'Conductor', name: transit.conductorName, phone: transit.conductorPhone, hint: transit.routeName },
    { title: 'School gateman', name: transit.gatemanName, phone: transit.gatemanPhone, hint: 'Main gate' },
    { title: 'Transport office', name: 'School Admin', phone: transit.officePhone, hint: 'Account and route changes' },
  ];

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ChildSwitcher />
        <ScrollView contentContainerStyle={styles.list}>
          <Text style={styles.lead}>People on this child's route. Calls stay on your phone.</Text>
          {contacts.map((contact) => (
            <GlassCard key={contact.title} style={[styles.card, shadows.md]}>
              <Text style={styles.kicker}>{contact.title}</Text>
              <Text style={styles.name}>{contact.name}</Text>
              <Text style={styles.hint}>{contact.hint}</Text>
              <AnimatedPressable haptic="medium" onPress={() => call(contact.phone)} style={styles.call}>
                <Phone color={palette.white} size={16} />
                <Text style={styles.callText}>Call {contact.phone}</Text>
              </AnimatedPressable>
            </GlassCard>
          ))}
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.lg, paddingBottom: 110 },
  lead: { ...typography.subtitle, marginBottom: spacing.md },
  card: { marginBottom: spacing.md },
  kicker: { ...typography.overline, color: portalAccents.parent.from },
  name: { ...typography.heading, marginTop: 4 },
  hint: { ...typography.caption, marginTop: 2 },
  call: {
    marginTop: spacing.md,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: portalAccents.parent.from,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  callText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
