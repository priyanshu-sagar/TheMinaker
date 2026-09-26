import { useAuthStore } from '@/store/auth.store';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  unmarked: number;
}

export default function SchoolAdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AttendanceSummary>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    unmarked: 0,
  });

  useEffect(() => {
    // apiClient.get<T> returns T directly (unwrapped by the interceptor)
    apiClient
      .get<AttendanceSummary>('/attendance/summary', { attendanceType: 'school_entry' })
      .then((data) => {
        setStats(data);
      })
      .catch(console.error);
  }, []);

  const attendancePercent =
    stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <View style={styles.container as any}>
      <View style={styles.header as any}>
        <Text style={styles.greeting as any}>Welcome, {user?.fullName} 👋</Text>
        <Text style={styles.date as any}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.grid as any}>
        <StatCard emoji="👥" label="Total Students" value={stats.total.toString()} color="#dbeafe" />
        <StatCard emoji="✅" label="Present Today"  value={stats.present.toString()} color="#d1fae5" />
        <StatCard emoji="❌" label="Absent Today"   value={stats.absent.toString()}  color="#fee2e2" />
        <StatCard emoji="📊" label="Attendance %"  value={`${attendancePercent}%`}  color="#ede9fe" />
      </View>
    </View>
  );
}

function StatCard({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: string;
  color: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardStyle: any = { ...StyleSheet.flatten(styles.card), backgroundColor: color };
  return (
    <View style={cardStyle}>
      <Text style={styles.cardEmoji as any}>{emoji}</Text>
      <Text style={styles.cardValue as any}>{value}</Text>
      <Text style={styles.cardLabel as any}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#111827' },
  date: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', borderRadius: 16, padding: 18 },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: '800', color: '#111827' },
  cardLabel: { fontSize: 13, color: '#374151', marginTop: 4 },
});
