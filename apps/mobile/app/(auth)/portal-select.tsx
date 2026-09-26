import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { portalAccents } from '@/design/glass-theme';
import { colors, spacing, typography } from '@/design/theme';

const PORTALS = [
  { key: 'parent', label: 'Parent Portal', description: "Track your child's transit & manage daily attendance.", href: '/(auth)/parent/login' as const, accent: portalAccents.parent },
  { key: 'teacher', label: 'Teacher Portal', description: 'Manage class rosters & view student whereabouts.', href: '/(auth)/teacher/school-select' as const, accent: portalAccents.teacher },
  { key: 'gateman', label: 'Gateman Portal', description: 'Monitor fleet live & authorize campus entry/exit.', href: '/(auth)/gateman/login' as const, accent: portalAccents.gateman },
  { key: 'conductor', label: 'Conductor Portal', description: 'Broadcast live routes & scan student boarding.', href: '/(auth)/conductor/login' as const, accent: portalAccents.conductor },
  { key: 'school-admin', label: 'School Admin', description: 'Enterprise dashboard for complete school oversight.', href: '/(auth)/school-admin/school-select' as const, accent: portalAccents.schoolAdmin },
];

export default function PortalSelectScreen() {
  return (
    <MeshBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.body}>
          <Text style={typography.title}>Select Your Portal</Text>
          <Text style={[typography.subtitle, styles.subtitle]}>Choose how you'd like to sign in.</Text>

          <View style={styles.list}>
            {PORTALS.map((portal) => (
              <GlassCard key={portal.key} padded={false}>
                <Pressable style={styles.tile} onPress={() => router.push(portal.href)}>
                  <View style={[styles.iconWrap, { backgroundColor: portal.accent.from }]}>
                    <Text style={styles.icon}>{portal.accent.icon}</Text>
                  </View>
                  <View style={styles.textCol}>
                    <Text style={styles.label}>{portal.label}</Text>
                    <Text style={styles.description}>{portal.description}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              </GlassCard>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.xl },
  list: { gap: spacing.md },
  tile: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  iconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  textCol: { flex: 1 },
  label: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  description: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  chevron: { fontSize: 20, color: colors.textMuted },
});
