import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { colors, glass, portalAccents, radius, shadows, spacing, typography } from '@/design/tokens';

const PORTALS = [
  {
    key: 'parent',
    label: 'Parent Portal',
    description: "Track your child's transit & manage daily attendance.",
    href: '/(auth)/parent/login' as const,
    accent: portalAccents.parent,
  },
  {
    key: 'teacher',
    label: 'Teacher Portal',
    description: 'Manage class rosters & view student whereabouts.',
    href: '/(auth)/teacher/school-select' as const,
    accent: portalAccents.teacher,
  },
  {
    key: 'gateman',
    label: 'Gateman Portal',
    description: 'Monitor fleet live & authorize campus entry/exit.',
    href: '/(auth)/gateman/login' as const,
    accent: portalAccents.gateman,
  },
  {
    key: 'conductor',
    label: 'Conductor Portal',
    description: 'Broadcast live routes & scan student boarding.',
    href: '/(auth)/conductor/login' as const,
    accent: portalAccents.conductor,
  },
  {
    key: 'school-admin',
    label: 'School Admin',
    description: 'Enterprise dashboard for complete school oversight.',
    href: '/(auth)/school-admin/school-select' as const,
    accent: portalAccents.schoolAdmin,
  },
];

export default function PortalSelectScreen() {
  return (
    <MeshBackground>
      {/* Subtle depth orbs */}
      <View style={[styles.orb, styles.orb1]} pointerEvents="none" />
      <View style={[styles.orb, styles.orb2]} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.body}>
          <Text style={typography.title}>Select Your Portal</Text>
          <Text style={[typography.subtitle, styles.subtitle]}>Choose how you'd like to sign in.</Text>

          <View style={styles.list}>
            {PORTALS.map((portal) => (
              <GlassCard key={portal.key} padded={false} style={shadows.sm}>
                <AnimatedPressable style={styles.tile} onPress={() => router.push(portal.href)}>
                  <LinearGradient
                    colors={[portal.accent.from, portal.accent.to]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconWrap}
                  >
                    <Text style={styles.icon}>{portal.accent.icon}</Text>
                  </LinearGradient>
                  <View style={styles.textCol}>
                    <Text style={styles.label}>{portal.label}</Text>
                    <Text style={styles.description}>{portal.description}</Text>
                  </View>
                  <View style={styles.chevronWrap}>
                    <View style={styles.chevronArrow} />
                  </View>
                </AnimatedPressable>
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
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  textCol: { flex: 1 },
  label: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  description: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  chevronWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronArrow: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.textMuted,
    transform: [{ rotate: '45deg' }],
  },
  orb: {
    position: 'absolute',
    borderRadius: radius.full,
  },
  orb1: {
    width: 220,
    height: 220,
    top: 140,
    right: -80,
    backgroundColor: glass.orb2,
    opacity: 0.5,
  },
  orb2: {
    width: 260,
    height: 260,
    bottom: 60,
    left: -100,
    backgroundColor: glass.orb1,
    opacity: 0.45,
  },
});
