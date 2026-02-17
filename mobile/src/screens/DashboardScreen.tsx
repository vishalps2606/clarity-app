import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import client from '../api/client';
import TaskCard from '../components/TaskCard';

export default function DashboardScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation<any>();
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

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, []);

  const todaysTasks = tasks.filter(task => {
    if (task.status === 'DONE') return false;
    const taskDate = new Date(task.dueDatetime);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return taskDate <= today;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>COMMAND CENTER</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          </View>
          <Text onPress={logout} style={styles.logoutBtn}>EXIT</Text>
        </View>

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

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Plus size={32} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  scrollContent: { padding: 20, paddingBottom: 100 }, // Extra padding for FAB
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

  // FAB STYLES
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00F0FF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});