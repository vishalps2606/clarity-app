import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Caching tools
import { Plus, Target, X, Trophy, ChevronRight } from "lucide-react-native";
import * as Progress from "react-native-progress";
import client from "../api/client";

export default function GoalsScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  // Create Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [priority, setPriority] = useState("P1");

  // 1. DATA FETCHING: Use useQuery (Replaces fetchGoals and useFocusEffect)
  const {
    data: goals = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await client.get("/goals");
      return res.data; // Now uses the server-flattened GoalResponse DTO
    },
  });

  // 2. CREATION LOGIC: Use useMutation (Ensures cache updates after adding a goal)
  const createMutation = useMutation({
    mutationFn: (newGoal: any) => client.post("/goals", newGoal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] }); // Auto-refresh list
      setShowCreate(false);
      setNewTitle("");
      setPriority("P1");
    },
    onError: () => Alert.alert("Error", "Could not establish new goal."),
  });

  const handleCreateGoal = () => {
    if (!newTitle.trim()) return;
    createMutation.mutate({
      title: newTitle,
      description: "",
      priority: priority,
      status: "ACTIVE",
    });
  };

  const renderGoal = ({ item }: { item: any }) => {
    // Calculate progress using the new DTO fields
    const progressValue =
      item.totalTasks === 0 ? 0 : item.completedTasks / item.totalTasks;

    const priorityColors: any = { P0: "#FF003C", P1: "#BC13FE", P2: "#0AFF60" };
    const pColor = priorityColors[item.priority] || "#BC13FE";

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { borderColor: item.priority === "P0" ? "#FF003C" : "#2A2A2A" },
        ]}
        onPress={() => navigation.navigate("GoalDetail", { goalId: item.id })} // NEW: Drill down
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: `${pColor}20` }]}>
            <Target size={20} color={pColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <Text style={[styles.priorityBadge, { color: pColor }]}>
                {item.priority}
              </Text>
              <Text style={styles.cardStatus}>{item.status}</Text>
              <Text style={styles.objectiveCount}>
                {item.completedTasks}/{item.totalTasks} UNITS
              </Text>
            </View>
          </View>
          {item.status === "DONE" ? (
            <Trophy size={20} color="#0AFF60" />
          ) : (
            <ChevronRight size={18} color="#2A2A2A" />
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>STRATEGIC PROGRESS</Text>
            <Text style={styles.progressText}>
              {Math.round(progressValue * 100)}%
            </Text>
          </View>
          <Progress.Bar
            progress={progressValue}
            width={null}
            color={pColor}
            unfilledColor="#1A1A1A"
            borderWidth={0}
            height={4}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>STRATEGIC MAP</Text>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          style={styles.addBtn}
        >
          <Plus size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {isLoading && goals.length === 0 ? (
        <ActivityIndicator color="#BC13FE" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}

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
              placeholder="E.g., Finish Backend Audit"
              placeholderTextColor="#444"
              autoFocus
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.label}>PRIORITY LEVEL</Text>
            <View style={styles.priorityRow}>
              {["P0", "P1", "P2"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.pBtn,
                    priority === p && styles.pBtnActive,
                    {
                      borderColor:
                        p === "P0"
                          ? "#FF003C"
                          : p === "P1"
                            ? "#BC13FE"
                            : "#0AFF60",
                    },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.pBtnText,
                      priority === p && { color: "#000", fontWeight: "bold" },
                    ]}
                  >
                    {p === "P0" ? "HIGH" : p === "P1" ? "MED" : "LOW"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleCreateGoal}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.createBtnText}>ESTABLISH GOAL</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#EDEDED",
    letterSpacing: 2,
  },
  addBtn: { backgroundColor: "#0AFF60", padding: 8, borderRadius: 8 }, // Switched to Green for consistency

  list: { padding: 20 },
  card: {
    backgroundColor: "#121212",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: "row", gap: 12, marginBottom: 16 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { color: "#EDEDED", fontSize: 16, fontWeight: "bold" },
  priorityBadge: { fontSize: 10, fontWeight: "bold", marginTop: 4 },
  cardStatus: {
    color: "#888",
    fontSize: 10,
    marginTop: 4,
    fontFamily: "monospace",
  },
  objectiveCount: {
    color: "#444",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },

  progressContainer: { gap: 8 },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { color: "#888", fontSize: 10, fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    paddingBottom: 64,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  modalTitle: {
    color: "#BC13FE",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  label: { color: "#888", fontSize: 10, fontWeight: "bold", marginBottom: 12 },
  input: {
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 8,
    padding: 16,
    color: "#EDEDED",
    fontSize: 16,
    marginBottom: 24,
  },

  priorityRow: { flexDirection: "row", gap: 12, marginBottom: 32 },
  pBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    borderColor: "#444",
  },
  pBtnActive: { backgroundColor: "#EDEDED", borderColor: "#EDEDED" },
  pBtnText: { color: "#888", fontSize: 12, letterSpacing: 1 },

  createBtn: {
    backgroundColor: "#0AFF60",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  createBtnText: { color: "#000", fontWeight: "bold", letterSpacing: 1 },
});
