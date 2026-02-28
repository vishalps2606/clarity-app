import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Calendar, Clock, Target, X } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import client from "../api/client";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function CreateTaskScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  // Data State
  const [goals, setGoals] = useState<any[]>([]);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [date, setDate] = useState(new Date());
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  // Recurrence State
  const [recurrence, setRecurrence] = useState("NONE");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await client.get("/goals");
      setGoals(res.data);
      if (res.data.length > 0) setSelectedGoalId(res.data[0].id);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleCreate = async () => {
    if (!title.trim() || !selectedGoalId) {
      Alert.alert(
        "Logic Error",
        "Directive and Alignment (Goal) are required.",
      );
      return;
    }

    setLoading(true);
    try {
      await client.post("/tasks", {
        title: title.trim(),
        estimatedMinutes: parseInt(minutes) || 30,
        dueDatetime: date.toISOString(),
        goalId: selectedGoalId,
        recurrenceType: recurrence,
        recurrencePattern:
          recurrence === "DAILY" && selectedDays.length > 0
            ? selectedDays.join(",")
            : null,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        "Deployment Failed",
        "Server rejected the objective initialization.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getSelectedGoalName = () => {
    const g = goals.find((g) => g.id === selectedGoalId);
    return g ? g.title : "SELECT GOAL";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="#666" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NEW OBJECTIVE</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>DIRECTIVE</Text>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            placeholderTextColor="#333"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Goal Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ALIGNMENT (GOAL)</Text>
          <TouchableOpacity
            style={styles.selectorField}
            onPress={() => setShowGoalPicker(true)}
          >
            <Target size={16} color="#0AFF60" />
            <Text style={styles.selectorText}>{getSelectedGoalName()}</Text>
          </TouchableOpacity>
        </View>

        {/* Duration & Date */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>EST. TIME (MIN)</Text>
            <View style={styles.selectorField}>
              <Clock size={16} color="#00F0FF" />
              <TextInput
                style={styles.inlineInput}
                keyboardType="numeric"
                value={minutes}
                onChangeText={setMinutes}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>DEADLINE</Text>
            <TouchableOpacity
              style={styles.selectorField}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={16} color="#BC13FE" />
              <Text style={styles.selectorText}>
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setDate(d);
            }}
            minimumDate={new Date()}
          />
        )}

        {/* Recurrence Chips */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>RECURRENCE RULE</Text>
          <View style={styles.recurrenceRow}>
            {["NONE", "DAILY", "WEEKLY", "MONTHLY"].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.recurrenceBtn,
                  recurrence === r && styles.recurrenceBtnActive,
                ]}
                onPress={() => setRecurrence(r)}
              >
                <Text
                  style={[
                    styles.recurrenceText,
                    recurrence === r && styles.recurrenceTextActive,
                  ]}
                >
                  {r === "NONE" ? "ONCE" : r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekday Selector (Only for DAILY) */}
        {recurrence === "DAILY" && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>SPECIFIC DAYS (OPTIONAL)</Text>
            <View style={styles.daysContainer}>
              {DAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCircle,
                    selectedDays.includes(day) && styles.dayCircleActive,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays.includes(day) && styles.dayTextActive,
                    ]}
                  >
                    {day.substring(0, 1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitText}>INITIATE</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Goal Picker Modal */}
      <Modal visible={showGoalPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Strategic Goal</Text>
              <TouchableOpacity onPress={() => setShowGoalPicker(false)}>
                <X color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={goals}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.goalItem}
                  onPress={() => {
                    setSelectedGoalId(item.id);
                    setShowGoalPicker(false);
                  }}
                >
                  <Text style={styles.goalText}>{item.title}</Text>
                  <Text style={styles.goalSubtext}>{item.priority}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  headerTitle: { color: "#EDEDED", fontWeight: "bold", letterSpacing: 2 },
  content: { padding: 20 },
  inputGroup: { marginBottom: 24 },
  label: {
    color: "#888",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    color: "#EDEDED",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  row: { flexDirection: "row", gap: 16 },
  selectorField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  selectorText: { color: "#EDEDED", fontSize: 16 },
  inlineInput: { color: "#EDEDED", fontSize: 16, flex: 1, padding: 0 },

  recurrenceRow: { flexDirection: "row", gap: 8 },
  recurrenceBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    backgroundColor: "#121212",
    alignItems: "center",
  },
  recurrenceBtnActive: { backgroundColor: "#00F0FF", borderColor: "#00F0FF" },
  recurrenceText: { color: "#888", fontSize: 10, fontWeight: "bold" },
  recurrenceTextActive: { color: "#000" },

  daysContainer: { flexDirection: "row", justifyContent: "space-between" },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircleActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.1)",
  },
  dayText: { color: "#444", fontSize: 14, fontWeight: "bold" },
  dayTextActive: { color: "#00F0FF" },

  submitBtn: {
    backgroundColor: "#0AFF60",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#000", fontWeight: "bold", letterSpacing: 2 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { color: "#0AFF60", fontSize: 18, fontWeight: "bold" },
  goalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalText: { color: "#EDEDED", fontSize: 16 },
  goalSubtext: { color: "#444", fontSize: 12, fontWeight: "bold" },
});
