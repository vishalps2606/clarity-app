import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Target } from "lucide-react-native";
import client from "../api/client";
import TaskCard from "../components/TaskCard";

export default function GoalDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { goalId } = route.params;

  // 1. FETCH GOAL DATA & TASKS
  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["goal-tasks", goalId],
    queryFn: async () => {
      const res = await client.get(`/goals/${goalId}/tasks`);
      return res.data;
    },
  });

  // We fetch the goal title from the first task or another goal query if tasks are empty
  const goalTitle = tasks.length > 0 ? tasks[0].goalTitle : "Strategic Goal";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="#666" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>STRATEGY DETAIL</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateTask", { goalId })}
        >
          <Plus color="#0AFF60" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <Target color="#BC13FE" size={20} />
        <Text style={styles.goalName}>{goalTitle}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#00F0FF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TaskCard task={item} onRefresh={refetch} />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No tactical objectives assigned to this strategy yet.
            </Text>
          }
        />
      )}
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
  headerTitle: { color: "#666", fontWeight: "bold", letterSpacing: 2 },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  goalName: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  list: { padding: 20, gap: 15 },
  emptyText: {
    color: "#444",
    textAlign: "center",
    marginTop: 40,
    fontStyle: "italic",
  },
});
