import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { NotificationBell } from '@/components/gateman/NotificationBell';
import { colors, palette, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { useGatemanStore } from '@/store/gateman.store';

export default function DirectoryScreen() {
  const contacts = useGatemanStore((state) => state.contacts);
  const addShiftLog = useGatemanStore((state) => state.addShiftLog);
  const [sent, setSent] = useState(false);

  async function call(phone: string) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    await Linking.openURL(`tel:${phone}`).catch(() => undefined);
  }

  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Directory</Text>
          <NotificationBell />
        </View>
        <ScrollView bounces={false} overScrollMode="never" contentContainerStyle={styles.list}>
          <AnimatedPressable
            haptic="medium"
            onPress={() => {
              addShiftLog({ action: 'SOS_SENT', description: 'Emergency alert sent from the gate' });
              setSent(true);
            }}
            style={styles.sos}
          >
            <Text style={styles.sosText}>{sent ? 'Emergency alert sent' : 'Send emergency alert'}</Text>
          </AnimatedPressable>
          {contacts.map((contact) => (
            <GlassCard key={contact.id} style={styles.card}>
              <Text style={styles.kicker}>{contact.role}</Text>
              <Text style={styles.name}>{contact.name}</Text>
              <AnimatedPressable haptic="medium" onPress={() => call(contact.phone)} style={styles.call}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  list: { padding: spacing.lg, paddingBottom: 140 },
  title: { ...typography.heading },
  sos: { minHeight: 52, borderRadius: radius.md, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  sosText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
  card: { marginBottom: spacing.md },
  kicker: { ...typography.overline, color: portalAccents.gateman.from },
  name: { ...typography.bodyBold, marginTop: 2 },
  call: { marginTop: spacing.md, minHeight: 42, borderRadius: radius.md, backgroundColor: portalAccents.gateman.from, alignItems: 'center', justifyContent: 'center' },
  callText: { ...typography.bodyBold, color: palette.white, backgroundColor: 'transparent' },
});
