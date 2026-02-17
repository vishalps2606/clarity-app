import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import client from '../api/client';
import { X, Clock, Calendar, Target } from 'lucide-react-native';

export default function CreateTaskScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('30');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New State for Goal Selection
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  // 1. Fetch Goals on Mount
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await client.get('/goals');
        setGoals(res.data);
        // Default to the first goal if available
        if (res.data.length > 0) {
            setSelectedGoalId(res.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load goals", err);
      }
    };
    fetchGoals();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
        Alert.alert("Missing Intel", "Task title is required.");
        return;
    }
    if (!selectedGoalId) {
        Alert.alert("Link Required", "You must link this task to a Goal (or create one first).");
        return;
    }

    setLoading(true);
    try {
      // 2. Send the Payload expected by Backend
      const payload = {
        title: title,
        estimatedMinutes: parseInt(minutes) || 30,
        dueDatetime: date.toISOString(),
        goalId: selectedGoalId, // <--- THE MISSING PIECE
        // Removed 'difficulty' as it wasn't in your backend DTO
      };

      await client.post('/tasks', payload);
      navigation.goBack(); 
    } catch (err: any) {
      console.error(err.response?.data || err);
      Alert.alert("Error", "Failed to create objective.");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const getSelectedGoalName = () => {
    const g = goals.find(g => g.id === selectedGoalId);
    return g ? g.title : "Select Goal";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NEW OBJECTIVE</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
            <Text style={styles.label}>DIRECTIVE</Text>
            <TextInput 
                style={styles.input} 
                placeholder="What needs to be done?" 
                placeholderTextColor="#444"
                autoFocus
                value={title}
                onChangeText={setTitle}
            />
        </View>

        {/* Goal Selector */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>ALIGNMENT (GOAL)</Text>
            <TouchableOpacity 
                style={styles.iconInput} 
                onPress={() => setShowGoalPicker(true)}
            >
                <Target size={16} color="#0AFF60" />
                <Text style={styles.dateText}>{getSelectedGoalName()}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>ESTIMATION (MIN)</Text>
                <View style={styles.iconInput}>
                    <Clock size={16} color="#00F0FF" />
                    <TextInput 
                        style={styles.transparentInput}
                        value={minutes}
                        onChangeText={setMinutes}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>DEADLINE</Text>
                <TouchableOpacity 
                    style={styles.iconInput} 
                    onPress={() => setShowDatePicker(true)}
                >
                    <Calendar size={16} color="#BC13FE" />
                    <Text style={styles.dateText}>
                        {date.toLocaleDateString()}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

        {showDatePicker && (
            <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
            />
        )}

        <TouchableOpacity 
            style={styles.createBtn} 
            onPress={handleCreate}
            disabled={loading}
        >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.createBtnText}>INITIATE</Text>}
        </TouchableOpacity>
      </View>

      {/* Simple Goal Picker Modal */}
      <Modal visible={showGoalPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Goal</Text>
                <FlatList 
                    data={goals}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.goalItem}
                            onPress={() => {
                                setSelectedGoalId(item.id);
                                setShowGoalPicker(false);
                            }}
                        >
                            <Text style={styles.goalText}>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                />
                <TouchableOpacity onPress={() => setShowGoalPicker(false)} style={styles.closeBtn}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  headerTitle: { color: '#EDEDED', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  form: { gap: 24 },
  label: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  inputGroup: {},
  input: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#EDEDED',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: 16 },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  transparentInput: { color: '#EDEDED', fontSize: 16, flex: 1 },
  dateText: { color: '#EDEDED', fontSize: 16 },
  createBtn: {
    marginTop: 24,
    backgroundColor: '#0AFF60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#121212', borderRadius: 12, padding: 20, maxHeight: 400 },
  modalTitle: { color: '#0AFF60', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  goalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  goalText: { color: '#EDEDED', fontSize: 16 },
  closeBtn: { marginTop: 16, alignItems: 'center', padding: 12 },
  closeText: { color: '#888' }
});