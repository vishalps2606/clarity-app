import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Save, Trash2, Clock, Calendar, CheckCircle, Play } from 'lucide-react-native';
import client from '../api/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function TaskDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { taskId } = route.params; // Get ID passed from Dashboard

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit States
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, []);

  const fetchTaskDetails = async () => {
    try {
      const res = await client.get(`/tasks/${taskId}`); 
      setTask(res.data);
      setTitle(res.data.title);
      setMinutes(res.data.estimatedMinutes.toString());
      setDate(new Date(res.data.dueDatetime));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not load objective details.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put(`/tasks/${taskId}`, {
        title,
        estimatedMinutes: parseInt(minutes),
        dueDatetime: date.toISOString(),
        goalId: task.goal.id,
        status: task.status
      });
      Alert.alert("Success", "Intel Updated.");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Abort Mission?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await client.delete(`/tasks/${taskId}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert("Error", "Could not delete.");
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00F0FF" />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#EDEDED" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OBJECTIVE DETAILS</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Trash2 size={24} color="#FF003C" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, task.status === 'DONE' ? styles.statusDone : styles.statusPending]}>
            <Text style={[styles.statusText, task.status === 'DONE' ? styles.textDone : styles.textPending]}>
                STATUS: {task.status}
            </Text>
        </View>

        {/* Title Input */}
        <View style={styles.group}>
            <Text style={styles.label}>DIRECTIVE</Text>
            <TextInput 
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                multiline
            />
        </View>

        {/* Time & Date Row */}
        <View style={styles.row}>
            <View style={[styles.group, { flex: 1 }]}>
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
            <View style={[styles.group, { flex: 1 }]}>
                <Text style={styles.label}>DEADLINE</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.iconInput}>
                    <Calendar size={16} color="#BC13FE" />
                    <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Goal Context (Read Only) */}
        <View style={styles.group}>
            <Text style={styles.label}>LINKED GOAL</Text>
            <View style={styles.readOnlyBox}>
                <Text style={styles.readOnlyText}>
                    {task.goal ? task.goal.title : "Unlinked Operation"}
                </Text>
            </View>
        </View>

        {showDatePicker && (
            <DateTimePicker
                value={date}
                mode="date"
                onChange={(e, d) => {
                    setShowDatePicker(false);
                    if(d) setDate(d);
                }}
            />
        )}
      </ScrollView>

      {/* Save Action */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={styles.focusBtn} 
            onPress={() => navigation.navigate('FocusMode', { 
                taskId: taskId, 
                initialTitle: title,
                currentActualMinutes: task.actualMinutes 
            })}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Play size={20} color="#000" fill="#000" />
                <Text style={styles.focusText}>ENGAGE FOCUS</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#000" /> : (
                <>
                    <Save size={20} color="#000" />
                    <Text style={styles.saveText}>SAVE CHANGES</Text>
                </>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  loadingContainer: { flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 40 },
  headerTitle: { color: '#EDEDED', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  backBtn: { padding: 8 },
  content: { padding: 20 },
  
  statusBanner: { padding: 12, borderRadius: 8, marginBottom: 24, alignItems: 'center', borderWidth: 1 },
  statusDone: { backgroundColor: 'rgba(10, 255, 96, 0.1)', borderColor: '#0AFF60' },
  statusPending: { backgroundColor: 'rgba(255, 165, 0, 0.1)', borderColor: '#FFA500' },
  statusText: { fontWeight: 'bold', letterSpacing: 1 },
  textDone: { color: '#0AFF60' },
  textPending: { color: '#FFA500' },

  group: { marginBottom: 24 },
  label: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#2A2A2A', color: '#EDEDED', padding: 16, borderRadius: 8, fontSize: 16 },
  
  row: { flexDirection: 'row', gap: 16 },
  iconInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', borderWidth: 1, borderColor: '#2A2A2A', padding: 16, borderRadius: 8, gap: 12 },
  transparentInput: { color: '#EDEDED', fontSize: 16, flex: 1 },
  dateText: { color: '#EDEDED', fontSize: 16 },

  readOnlyBox: { padding: 16, backgroundColor: '#0A0A0A', borderRadius: 8, borderWidth: 1, borderColor: '#1A1A1A' },
  readOnlyText: { color: '#666', fontStyle: 'italic' },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#1A1A1A' },
  saveBtn: { backgroundColor: '#00F0FF', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16, borderRadius: 8 },
  saveText: { color: '#000', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  focusBtn: { 
    backgroundColor: '#EDEDED', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 12
  },
  focusText: { color: '#000', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});