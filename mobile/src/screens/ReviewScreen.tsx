import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, AlertTriangle } from "lucide-react-native";
import client from "../api/client";
import ReviewCard from "../components/ReviewCard"; // Ensure this component is updated

export default function ReviewScreen() {
  const queryClient = useQueryClient();

  // 1. FETCH REVIEW QUEUE
  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tasks-review"],
    queryFn: async () => {
      const res = await client.get("/tasks/review");
      return res.data;
    },
  });

  // 2. SUBMIT DECISION
  const reviewMutation = useMutation({
    mutationFn: async ({ taskId, decision, note, nextDate }: any) => {
      return client.post(`/tasks/${taskId}/review`, {
        decision,
        note,
        newDueDatetime: nextDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-review"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () =>
      Alert.alert("System Failure", "Could not process review decision."),
  });

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#BC13FE" />
        <Text style={styles.loaderText}>RETRIEVING STALE OBJECTIVES...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TACTICAL REVIEW</Text>
        <Text style={styles.subTitle}>
          {tasks.length} ITEMS REQUIRING CLARITY
        </Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ReviewCard
            task={item}
            onDecision={(decision, note, nextDate) =>
              reviewMutation.mutate({
                taskId: item.id,
                decision,
                note,
                nextDate,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AlertTriangle color="#333" size={48} />
            <Text style={styles.emptyText}>
              Backlog is empty. All systems normal.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  subTitle: {
    color: "#BC13FE",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 5,
    fontMono: "monospace",
  },
  loader: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    color: "#666",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 15,
  },
  list: { padding: 20 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    gap: 20,
  },
  emptyText: { color: "#444", fontStyle: "italic", fontSize: 14 },
});
