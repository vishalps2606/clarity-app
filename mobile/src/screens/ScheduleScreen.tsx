import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react-native";
import client from "../api/client";

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  // 1. FETCH TIME BLOCKS
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["time-blocks", format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const res = await client.get(
        `/time-blocks?date=${format(selectedDate, "yyyy-MM-dd")}`,
      );
      return res.data;
    },
  });

  // 2. DELETE BLOCK MUTATION
  const deleteMutation = useMutation({
    mutationFn: (id: number) => client.delete(`/time-blocks/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["time-blocks"] }),
  });

  const renderBlock = ({ item }: any) => (
    <View style={styles.block}>
      <View style={styles.timeGutter}>
        <Text style={styles.timeText}>
          {format(new Date(item.startTime), "HH:mm")}
        </Text>
        <View style={styles.line} />
      </View>
      <View style={styles.blockContent}>
        <Text style={styles.blockTitle}>{item.taskTitle}</Text>
        <Text style={styles.blockGoal}>{item.goalTitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Date Navigator */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setSelectedDate(subDays(selectedDate, 1))}
        >
          <ChevronLeft color="#666" />
        </TouchableOpacity>
        <View style={styles.dateDisplay}>
          <CalendarIcon color="#00F0FF" size={16} />
          <Text style={styles.dateText}>
            {format(selectedDate, "EEEE, MMM do")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setSelectedDate(addDays(selectedDate, 1))}
        >
          <ChevronRight color="#666" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#00F0FF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={blocks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBlock}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No time blocks allocated for this cycle.
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
    backgroundColor: "#0A0A0A",
  },
  dateDisplay: { flexDirection: "row", alignItems: "center", gap: 10 },
  dateText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  list: { padding: 20 },
  block: { flexDirection: "row", marginBottom: 20, gap: 15 },
  timeGutter: { alignItems: "center", width: 50 },
  timeText: { color: "#444", fontSize: 12, fontWeight: "bold" },
  line: { width: 1, flex: 1, backgroundColor: "#1A1A1A", marginTop: 5 },
  blockContent: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  blockTitle: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  blockGoal: {
    color: "#00F0FF",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },
  emptyText: {
    color: "#333",
    textAlign: "center",
    marginTop: 50,
    fontStyle: "italic",
  },
});
