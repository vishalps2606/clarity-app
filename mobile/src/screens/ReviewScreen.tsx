import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AlertTriangle, Calendar, Trash2, ArrowRight } from 'lucide-react-native';
import client from '../api/client';

export default function ReviewScreen() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await client.get('/tasks/review'); // Hitting the existing backend endpoint
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [])
  );

  const handleDecision = async (taskId: number, action: 'RESCHEDULE' | 'DELETE') => {
    setProcessing(true);
    try {
      if (action === 'DELETE') {

        await client.delete(`/tasks/${taskId}`);

      } else {

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); 

        await client.post(`/tasks/${taskId}/review`, {
            decision: 'ACCEPT_DELAY',
            note: 'Moved via Mobile Review',
            newDueDatetime: tomorrow.toISOString()
        });
      }
      
      setReviews(prev => prev.filter(t => t.id !== taskId));

    } catch (err: any) {
      console.error(err.response?.data || err);
      Alert.alert("Error", "Decision failed to sync.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#BC13FE" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>EVENING PROTOCOL</Text>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{reviews.length} PENDING</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {reviews.length === 0 ? (
            <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>ALL CLEAR</Text>
                <Text style={styles.emptyText}>No zombie tasks detected.</Text>
            </View>
        ) : (
            reviews.map(task => (
                <View key={task.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <AlertTriangle size={20} color="#FF003C" />
                        <Text style={styles.taskTitle}>{task.title}</Text>
                    </View>
                    <Text style={styles.meta}>
                        Originally due: {new Date(task.dueDatetime).toLocaleDateString()}
                    </Text>

                    <View style={styles.actions}>
                        <TouchableOpacity 
                            style={[styles.btn, styles.deleteBtn]} 
                            onPress={() => handleDecision(task.id, 'DELETE')}
                            disabled={processing}
                        >
                            <Trash2 size={20} color="#FF003C" />
                            <Text style={[styles.btnText, { color: '#FF003C' }]}>DROP</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.btn, styles.keepBtn]} 
                            onPress={() => handleDecision(task.id, 'RESCHEDULE')}
                            disabled={processing}
                        >
                            <Text style={[styles.btnText, { color: '#000' }]}>PUSH (+1 DAY)</Text>
                            <ArrowRight size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  center: { flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#EDEDED', letterSpacing: 1 },
  badge: { backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  badgeText: { color: '#FF003C', fontWeight: 'bold', fontSize: 10 },
  
  list: { padding: 20 },
  card: { backgroundColor: '#121212', borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#FF003C' },
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
  taskTitle: { color: '#EDEDED', fontSize: 18, fontWeight: 'bold', flex: 1 },
  meta: { color: '#888', fontSize: 12, fontFamily: 'monospace', marginBottom: 24, marginLeft: 32 },
  
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 8, gap: 8, borderWidth: 1 },
  deleteBtn: { borderColor: '#FF003C', backgroundColor: 'rgba(255, 0, 60, 0.1)' },
  keepBtn: { backgroundColor: '#EDEDED', borderColor: '#EDEDED' },
  btnText: { fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },

  emptyState: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
  emptyTitle: { color: '#0AFF60', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#888' }
});