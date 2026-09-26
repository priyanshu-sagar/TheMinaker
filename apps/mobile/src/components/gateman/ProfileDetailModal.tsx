import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/design/gateman-theme';
import { GlassModal } from '@/components/glass/GlassModal';
import { ProfileApproval } from '@/store/gateman.store';

export function ProfileDetailModal({
  profile,
  onClose,
}: {
  profile: ProfileApproval | null;
  onClose: () => void;
}) {
  return (
    <GlassModal visible={profile !== null} title="Profile Details" onClose={onClose}>
      {profile ? (
        <>
          <Row label="Student" value={profile.studentName} />
          <Row label="Grade" value={profile.grade} />
          <Row label="Parent / Guardian" value={profile.parentName} />
          <Row label="Contact Phone" value={profile.phone} />
          <Row label="Emergency Contact" value={profile.emergencyContact} />
          <Row label="Home Address" value={profile.address} />
          <Row label="Assigned Stop" value={profile.assignedStop} />
        </>
      ) : null}
    </GlassModal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 2 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  value: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
});
