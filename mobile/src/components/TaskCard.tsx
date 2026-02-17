import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Clock, AlertCircle, CheckSquare, Trash2, Play } from 'lucide-react-native'; 
import client from '../api/client';

interface Task {
  id: number;
  title: string;
  status: 'READY' | 'IN_PROGRESS' | 'DONE';
  estimatedMinutes: number;
  actualMinutes?: number; 
  dueDatetime: string;
}

interface TaskCardProps {
  task: Task;
  onRefresh: () => void;
}

export default function TaskCard({ task, onRefresh }: TaskCardProps) {
  const navigation = useNavigation<any>(); 
  
  const isOverdue = new Date(task.dueDatetime) < new Date() && task.status !== 'DONE';

  const handleComplete = async () => {
    try {
      // Optimistic update or just wait for refresh
      await client.put(`/tasks/${task.id}/complete`);
      onRefresh();
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Objective?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await client.delete(`/tasks/${task.id}`);
            onRefresh();
          } catch (err) {
            Alert.alert("Error", "Failed to delete task");
          }
        }
      }
    ]);
  };

  const handleFocus = () => {
    navigation.navigate('FocusMode', { 
        taskId: task.id, 
        initialTitle: task.title, 
        currentActualMinutes: task.actualMinutes || 0 
    });
  };

  return (

    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
      style={styles.cardContainer}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.badge, 
              task.status === 'DONE' ? styles.badgeDone : 
              task.status === 'IN_PROGRESS' ? styles.badgeProgress : styles.badgeReady
          ]}>
            <Text style={[styles.badgeText, 
                task.status === 'DONE' ? styles.textDone : 
                task.status === 'IN_PROGRESS' ? styles.textProgress : styles.textReady
            ]}>
              {task.status.replace('_', ' ')}
            </Text>
          </View>
          {isOverdue && <AlertCircle size={16} color="#FF003C" />}
        </View>

        <Text style={styles.title} numberOfLines={2}>{task.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={12} color="#888" />
            <Text style={styles.metaText}>
                {task.actualMinutes ? `${task.actualMinutes}/` : ''}{task.estimatedMinutes}m
            </Text>
          </View>
          <Text style={styles.metaText}>
            {new Date(task.dueDatetime).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.actionBar}>
          {task.status !== 'DONE' && (
             <>
                {/* 1. FOCUS BUTTON */}
                <TouchableOpacity onPress={handleFocus} style={[styles.actionBtn, styles.focusBtn]}>
                    <Play size={20} color="#000" fill="#000" />
                </TouchableOpacity>

                {/* 2. COMPLETE BUTTON */}
                <TouchableOpacity onPress={handleComplete} style={styles.actionBtn}>
                    <CheckSquare size={20} color="#0AFF60" />
                </TouchableOpacity>
             </>
          )}
          
          {/* 3. DELETE BUTTON */}
          <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, styles.deleteBtn]}>
              <Trash2 size={20} color="#FF003C" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeDone: { borderColor: '#0AFF60', backgroundColor: 'rgba(10, 255, 96, 0.1)' },
  badgeProgress: { borderColor: '#BC13FE', backgroundColor: 'rgba(188, 19, 254, 0.1)' },
  badgeReady: { borderColor: '#888', backgroundColor: 'rgba(136, 136, 136, 0.1)' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  textDone: { color: '#0AFF60' },
  textProgress: { color: '#BC13FE' },
  textReady: { color: '#888' },
  title: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 12,
    gap: 12, 
  },
  actionBtn: {
    padding: 4,
  },
  focusBtn: {
    backgroundColor: '#EDEDED',
    borderRadius: 4,
    padding: 2,
    marginRight: 8,
  },
  deleteBtn: {
    marginLeft: 'auto', 
  },
});