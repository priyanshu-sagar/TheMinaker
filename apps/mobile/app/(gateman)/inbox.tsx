import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { colors, glass, portalAccents, radius, spacing, typography } from '@/design/tokens';
import { MeshBackground } from '@/components/glass/MeshBackground';
import { AnimatedPressable } from '@/components/glass/AnimatedPressable';
import { useGatemanStore } from '@/store/gateman.store';
import { ProfileApprovalsList } from '@/components/gateman/ProfileApprovalsList';
import { EditRequestsList } from '@/components/gateman/EditRequestsList';
import { GeofenceAlertsList } from '@/components/gateman/GeofenceAlertsList';

function GlassSegmentedControl({
  segments,
  activeIndex,
  onPress,
}: {
  segments: { label: string; count: number }[];
  activeIndex: number;
  onPress: (i: number) => void;
  accentColor?: string;
}) {
  return (
    <BlurView intensity={30} tint="light" style={styles.segmentTrack}>
      {segments.map((seg, i) => {
        const isActive = i === activeIndex;
        return (
          <AnimatedPressable
            key={seg.label}
            onPress={() => onPress(i)}
            haptic="selection"
            style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
              {seg.label}
            </Text>
            {seg.count > 0 && (
              <View style={[styles.segmentBadge, isActive && styles.segmentBadgeActive]}>
                <Text style={[styles.segmentBadgeText, isActive && styles.segmentBadgeTextActive]}>
                  {seg.count}
                </Text>
              </View>
            )}
          </AnimatedPressable>
        );
      })}
    </BlurView>
  );
}

export default function InboxScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const { profileApprovals, editRequests, geofenceAlerts } = useGatemanStore();

  const segments = [
    { label: 'Profiles', count: profileApprovals.length },
    { label: 'Edits', count: editRequests.length },
    { label: 'Geofence', count: geofenceAlerts.length },
  ];

  return (
    <MeshBackground>
      {/* Decorative orbs — always behind content */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: radius.full,
          backgroundColor: glass.orb1,
          opacity: 0.6,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          left: -80,
          width: 280,
          height: 280,
          borderRadius: radius.full,
          backgroundColor: glass.orb2,
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={typography.title}>Action Inbox</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Review and resolve pending actions
          </Text>
        </View>

        {/* Glass Segmented Control with iOS separator */}
        <View style={styles.segmentedControlWrap}>
          <GlassSegmentedControl
            segments={segments}
            activeIndex={activeTab}
            onPress={setActiveTab}
          />
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {activeTab === 0 && <ProfileApprovalsList />}
          {activeTab === 1 && <EditRequestsList />}
          {activeTab === 2 && <GeofenceAlertsList />}
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  segmentedControlWrap: {
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: glass.border,
    marginBottom: spacing.xs,
  },
  content: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: radius.full,
    padding: 3,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: glass.border,
    overflow: 'hidden',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 0,
  },
  segmentLabel: {
    ...typography.label,
    fontWeight: '600',
    color: colors.textMuted,
  },
  segmentLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  segmentBadge: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  segmentBadgeActive: {
    backgroundColor: portalAccents.gateman.from,
  },
  segmentBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    fontSize: 10,
  },
  segmentBadgeTextActive: {
    color: '#ffffff',
  },
});
