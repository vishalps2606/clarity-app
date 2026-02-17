import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Clock, Plus, Trash2 } from 'lucide-react-native';
import client from '../api/client';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

export default function ScheduleScreen() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showPicker, setShowPicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchSchedule = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await client.get(`/time-blocks?date=${today}`);
      setBlocks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await client.get('/tasks');
      // Only show pending tasks
      setTasks(res.data.filter((t: any) => t.status !== 'DONE'));
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSchedule();
      fetchTasks();
      setLoading(false);
    }, [])
  );

  const handleAddBlock = async (taskId: number) => {
    if (selectedHour === null) return;
    setCreating(true);

    try {
      // Create a 1-hour block by default
      const start = new Date();
      start.setHours(selectedHour, 0, 0, 0);
      
      const end = new Date(start);
      end.setHours(selectedHour + 1);

      await client.post('/time-blocks', {
        taskId: taskId,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });

      setShowPicker(false);
      fetchSchedule();
    } catch (err) {
      Alert.alert("Error", "Schedule conflict or server error.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBlock = async (id: number) => {
    try {
      await client.delete(`/time-blocks/${id}`);
      fetchSchedule();
    } catch (err) {
      Alert.alert("Error", "Could not remove block.");
    }
  };

  // Helper to render blocks positioned absolutely
  const renderBlocks = () => {
    return blocks.map((block) => {
      const start = new Date(block.startTime);
      const end = new Date(block.endTime);
      
      const startHour = start.getHours();
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      // Calculate position relative to 6 AM
      // Each hour slot is 80px height
      const topOffset = (startHour - 6) * 80; 
      const height = durationHours * 80;

      if (startHour < 6) return null; // Skip too early blocks for now

      return (
        <View 
            key={block.id} 
            style={[styles.block, { top: topOffset, height: height - 2 }]}
        >
            <View style={{flex: 1}}>
                <Text style={styles.blockTitle} numberOfLines={1}>
                    {block.task ? block.task.title : "Busy"}
                </Text>
                <Text style={styles.blockTime}>
                    {start.getHours()}:00 - {end.getHours()}:00
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteBlock(block.id)}>
                <Trash2 size={16} color="#000" />
            </TouchableOpacity>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>DAILY PROTOCOL</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.timeline}>
            {/* Hour Slots */}
            {HOURS.map(h => (
                <TouchableOpacity 
                    key={h} 
                    style={styles.slot}
                    onPress={() => {
                        setSelectedHour(h);
                        setShowPicker(true);
                    }}
                >
                    <Text style={styles.timeLabel}>{h}:00</Text>
                    <View style={styles.line} />
                </TouchableOpacity>
            ))}

            {/* Rendered Blocks Layer */}
            <View style={styles.blocksLayer}>
                {renderBlocks()}
            </View>
        </View>
      </ScrollView>

      {/* Task Picker Modal */}
      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>ASSIGN TASK TO {selectedHour}:00</Text>
                {loading || creating ? <ActivityIndicator color="#00F0FF" /> : (
                    <FlatList 
                        data={tasks}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.taskItem}
                                onPress={() => handleAddBlock(item.id)}
                            >
                                <Text style={styles.taskText}>{item.title}</Text>
                                <Plus size={20} color="#00F0FF" />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={{color: '#888'}}>No pending tasks available.</Text>}
                    />
                )}
                <TouchableOpacity 
                    style={styles.closeBtn} 
                    onPress={() => setShowPicker(false)}
                >
                    <Text style={styles.closeText}>CANCEL</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#EDEDED', letterSpacing: 1 },
  date: { color: '#00F0FF', fontFamily: 'monospace' },
  
  scroll: { paddingBottom: 100 },
  timeline: { position: 'relative', marginTop: 10 },
  
  slot: { height: 80, flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#1A1A1A' },
  timeLabel: { color: '#888', width: 50, fontFamily: 'monospace', fontSize: 12, marginTop: -8, backgroundColor: '#050505' },
  line: { flex: 1, height: 1, backgroundColor: '#2A2A2A', marginTop: 0 },

  blocksLayer: { position: 'absolute', top: 0, left: 70, right: 20, bottom: 0 },
  
  block: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    backgroundColor: '#00F0FF', 
    borderRadius: 6, 
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#008080'
  },
  blockTitle: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  blockTime: { color: '#333', fontSize: 10, marginTop: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#121212', height: '60%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32 },
  modalTitle: { color: '#EDEDED', fontSize: 18, fontWeight: 'bold', marginBottom: 24 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  taskText: { color: '#EDEDED', fontSize: 16 },
  closeBtn: { marginTop: 24, padding: 16, alignItems: 'center', backgroundColor: '#2A2A2A', borderRadius: 8 },
  closeText: { color: '#888', fontWeight: 'bold' }
});