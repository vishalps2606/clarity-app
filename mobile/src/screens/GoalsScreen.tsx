import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Target, X, Trophy, AlertCircle } from 'lucide-react-native';
import * as Progress from 'react-native-progress';
import client from '../api/client';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Create Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState('P1');
  const [creating, setCreating] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await client.get('/goals');
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
  );

  const handleCreateGoal = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await client.post('/goals', {
        title: newTitle,
        description: '', 
        priority: priority,
        status: 'ACTIVE'   
      });
      setShowCreate(false);
      setNewTitle('');
      setPriority('P1');
      fetchGoals();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not establish new goal.");
    } finally {
      setCreating(false);
    }
  };

  const renderGoal = ({ item }: { item: any }) => {
    const progress = item.progress || 0; 
    
    const priorityColors: any = { P0: '#FF003C', P1: '#BC13FE', P2: '#0AFF60' };
    const pColor = priorityColors[item.priority] || '#BC13FE';

    return (
        <View style={[styles.card, { borderColor: item.priority === 'P0' ? '#FF003C' : '#2A2A2A' }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: `${pColor}20` }]}>
                    <Target size={20} color={pColor} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Text style={[styles.priorityBadge, { color: pColor }]}>{item.priority}</Text>
                        <Text style={styles.cardStatus}>{item.status}</Text>
                    </View>
                </View>
                {item.status === 'DONE' && <Trophy size={20} color="#0AFF60" />}
            </View>
            
            <View style={styles.progressContainer}>
                <View style={styles.progressRow}>
                    <Text style={styles.progressText}>PROGRESS</Text>
                    <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                </View>
                <Progress.Bar 
                    progress={progress} 
                    width={null} 
                    color={pColor}
                    unfilledColor="#1A1A1A" 
                    borderWidth={0} 
                    height={4} 
                />
            </View>
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>STRATEGIC GOALS</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.addBtn}>
            <Plus size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGoals(); }} tintColor="#BC13FE" />}
      />

      {/* Create Goal Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>NEW DIRECTIVE</Text>
                    <TouchableOpacity onPress={() => setShowCreate(false)}>
                        <X size={24} color="#888" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.label}>GOAL TITLE</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="E.g., Launch MVP"
                    placeholderTextColor="#444"
                    autoFocus
                    value={newTitle}
                    onChangeText={setNewTitle}
                />

                {/* PRIORITY SELECTOR */}
                <Text style={styles.label}>PRIORITY LEVEL</Text>
                <View style={styles.priorityRow}>
                    {['P0', 'P1', 'P2'].map((p) => (
                        <TouchableOpacity 
                            key={p}
                            style={[
                                styles.pBtn, 
                                priority === p && styles.pBtnActive,
                                { borderColor: p === 'P0' ? '#FF003C' : p === 'P1' ? '#BC13FE' : '#0AFF60' }
                            ]}
                            onPress={() => setPriority(p)}
                        >
                            <Text style={[
                                styles.pBtnText, 
                                priority === p && { color: '#000', fontWeight: 'bold' }
                            ]}>
                                {p === 'P0' ? 'HIGH' : p === 'P1' ? 'MED' : 'LOW'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity 
                    style={styles.createBtn} 
                    onPress={handleCreateGoal}
                    disabled={creating}
                >
                    {creating ? <ActivityIndicator color="#000" /> : <Text style={styles.createBtnText}>ESTABLISH GOAL</Text>}
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#EDEDED', letterSpacing: 1 },
  addBtn: { backgroundColor: '#BC13FE', padding: 8, borderRadius: 8 },
  
  list: { padding: 20 },
  card: { backgroundColor: '#121212', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { color: '#EDEDED', fontSize: 16, fontWeight: 'bold' },
  priorityBadge: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  cardStatus: { color: '#888', fontSize: 10, marginTop: 4, fontFamily: 'monospace' },
  
  progressContainer: { gap: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { color: '#888', fontSize: 10, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#121212', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, paddingBottom: 64, borderWidth: 1, borderColor: '#2A2A2A' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { color: '#BC13FE', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  label: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 8, padding: 16, color: '#EDEDED', fontSize: 16, marginBottom: 24 },
  
  // Priority Styles
  priorityRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  pBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center', borderColor: '#444' },
  pBtnActive: { backgroundColor: '#EDEDED', borderColor: '#EDEDED' },
  pBtnText: { color: '#888', fontSize: 12, letterSpacing: 1 },

  createBtn: { backgroundColor: '#BC13FE', borderRadius: 8, padding: 16, alignItems: 'center' },
  createBtnText: { color: '#000', fontWeight: 'bold', letterSpacing: 1 }
});