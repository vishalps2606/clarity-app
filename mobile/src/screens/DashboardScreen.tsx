import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import TaskCard from '../components/TaskCard';

export default function DashboardScreen() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await client.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, []);

  // Filter Logic (Matches Web: Today + Overdue)
  const todaysTasks = tasks.filter(task => {
    if (task.status === 'DONE') return false;
    const taskDate = new Date(task.dueDatetime);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return taskDate <= today;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>COMMAND CENTER</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          </View>
          <Text onPress={logout} style={styles.logoutBtn}>EXIT</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>PENDING</Text>
                <Text style={[styles.statValue, { color: '#00F0FF' }]}>{todaysTasks.length}</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>COMPLETED</Text>
                <Text style={[styles.statValue, { color: '#0AFF60' }]}>
                    {tasks.filter(t => t.status === 'DONE').length}
                </Text>
            </View>
        </View>

        <Text style={styles.sectionTitle}>PRIORITY QUEUE</Text>

        {loading ? (
            <ActivityIndicator color="#00F0FF" style={{ marginTop: 20 }} />
        ) : todaysTasks.length === 0 ? (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>All systems nominal.</Text>
                <Text style={styles.emptySubtext}>No tasks due today.</Text>
            </View>
        ) : (
            todaysTasks.map(task => (
                <TaskCard key={task.id} task={task} onRefresh={fetchTasks} />
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#EDEDED', letterSpacing: 1 },
  date: { color: '#888', fontFamily: 'monospace' },
  logoutBtn: { color: '#FF003C', fontWeight: 'bold', borderWidth: 1, borderColor: '#FF003C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { 
    flex: 1, 
    backgroundColor: '#121212', 
    padding: 16, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#2A2A2A',
    alignItems: 'center' 
  },
  statLabel: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold' },

  sectionTitle: { color: '#BC13FE', fontSize: 14, fontWeight: 'bold', marginBottom: 16, letterSpacing: 1 },
  
  emptyState: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyText: { color: '#EDEDED', fontSize: 16 },
  emptySubtext: { color: '#888', fontSize: 12 },
});