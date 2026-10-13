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
  accentColor,
}: {
  segments: { label: string; count: number }[];
  activeIndex: number;
  onPress: (i: number) => void;
  accentColor: string;
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
            style={[styles.segmentBtn, isActive && { backgroundColor: accentColor }]}
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

        {/* Glass Segmented Control */}
        <GlassSegmentedControl
          segments={segments}
          activeIndex={activeTab}
          onPress={setActiveTab}
          accentColor={portalAccents.gateman.from}
        />

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
  content: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: radius.full,
    padding: 4,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
  segmentLabel: {
    ...typography.label,
    fontWeight: '600',
    color: colors.textMuted,
  },
  segmentLabelActive: {
    color: 'white',
  },
  segmentBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  segmentBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  segmentBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    fontSize: 10,
  },
  segmentBadgeTextActive: {
    color: 'white',
  },
});
