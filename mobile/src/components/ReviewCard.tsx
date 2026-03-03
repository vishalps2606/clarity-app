import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  Play,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface ReviewCardProps {
  task: any;
  onDecision: (decision: string, note: string, nextDate?: string) => void;
}

export default function ReviewCard({ task, onDecision }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDecision = (decision: string) => {
    onDecision(
      decision,
      note,
      decision === "DELAY" ? selectedDate.toISOString() : undefined,
    );
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.mainInfo}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.goalTag}>{task.goalTitle || "NO STRATEGY"}</Text>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.staleInfo}>
            Stale for {task.estimatedMinutes}m • {task.recurrenceType}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp color="#444" size={20} />
        ) : (
          <ChevronDown color="#444" size={20} />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expansion}>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a brief post-mortem note..."
            placeholderTextColor="#333"
            value={note}
            onChangeText={setNote}
            multiline
          />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.resumeBtn]}
              onPress={() => handleDecision("RESUME")}
            >
              <Play size={16} color="#000" fill="#000" />
              <Text style={styles.btnText}>RESUME</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.delayBtn]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={16} color="#BC13FE" />
              <Text style={[styles.btnText, { color: "#BC13FE" }]}>DELAY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.dropBtn]}
              onPress={() => handleDecision("DROP")}
            >
              <Trash2 size={16} color="#FF003C" />
              <Text style={[styles.btnText, { color: "#FF003C" }]}>DROP</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              onChange={(e, d) => {
                setShowDatePicker(false);
                if (d) {
                  setSelectedDate(d);
                  handleDecision("DELAY");
                }
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    overflow: "hidden",
  },
  mainInfo: { padding: 20, flexDirection: "row", alignItems: "center" },
  goalTag: {
    color: "#BC13FE",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  staleInfo: { color: "#444", fontSize: 12, marginTop: 4 },
  expansion: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  noteInput: {
    color: "#EDEDED",
    fontSize: 14,
    paddingVertical: 15,
    fontStyle: "italic",
  },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  resumeBtn: { backgroundColor: "#0AFF60", borderColor: "#0AFF60" },
  delayBtn: { backgroundColor: "transparent", borderColor: "#BC13FE" },
  dropBtn: { backgroundColor: "transparent", borderColor: "#FF003C" },
  btnText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#000",
  },
});
