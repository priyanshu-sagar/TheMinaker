import { useAuthStore } from '@/store/auth.store';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';

export default function SchoolAdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ total: 0, present: 0, activeBuses: 2, attendancePercent: 0 });

  useEffect(() => {
    // Fetch real summary from backend for today
    apiClient.get('/attendance/summary?attendanceType=school_entry')
      .then(res => {
        const { total, present } = res.data;
        setStats({
          total,
          present,
          activeBuses: 2, // Hardcoded placeholder for buses until fleet endpoint hooked up
          attendancePercent: total > 0 ? Math.round((present / total) * 100) : 0
        });
      })
      .catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.fullName} 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      <View style={styles.grid}>
        <StatCard emoji="👥" label="Total Students" value={stats.total.toString()} color="#dbeafe" />
        <StatCard emoji="✅" label="Present Today" value={stats.present.toString()} color="#d1fae5" />
        <StatCard emoji="🚌" label="Active Buses" value={stats.activeBuses.toString()} color="#fef3c7" />
        <StatCard emoji="📊" label="Attendance %" value={stats.attendancePercent + "%"} color="#ede9fe" />
      </View>
    </View>
  );
}

function StatCard({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
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
