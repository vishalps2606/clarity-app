import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Brain, Target, Zap, AlertCircle } from "lucide-react-native";
import { PieChart } from "react-native-chart-kit";
import client from "../api/client";

export default function InsightsScreen() {
  // 1. FETCH FROM SERVER
  const { data: insights, isLoading } = useQuery({
    queryKey: ["insights-weekly"],
    queryFn: async () => {
      const res = await client.get("/insights/weekly");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#00F0FF" />
        <Text style={styles.loaderText}>ANALYZING PERFORMANCE...</Text>
      </View>
    );
  }

  const chartData = [
    {
      name: "Done",
      population: insights?.completedTasks || 0,
      color: "#0AFF60",
      legendFontColor: "#888",
      legendFontSize: 10,
    },
    {
      name: "Slipped",
      population: insights?.slippageCount || 0,
      color: "#FF003C",
      legendFontColor: "#888",
      legendFontSize: 10,
    },
    {
      name: "Open",
      population: (insights?.totalTasks || 0) - (insights?.completedTasks || 0),
      color: "#333",
      legendFontColor: "#888",
      legendFontSize: 10,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>INTELLIGENCE</Text>
      </View>

      {/* SERVER FEEDBACK */}
      <View style={styles.feedbackCard}>
        <Brain color="#00F0FF" size={24} />
        <Text style={styles.feedbackText}>{insights?.feedback}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.statBox}>
          <Target color="#0AFF60" size={18} />
          <Text style={styles.statValue}>{insights?.completionRate}%</Text>
          <Text style={styles.statLabel}>SUCCESS RATE</Text>
        </View>

        <View style={styles.statBox}>
          <Zap color="#BC13FE" size={18} />
          <Text style={styles.statValue}>{insights?.avgErrorMinutes}m</Text>
          <Text style={styles.statLabel}>AVG TIME ERROR</Text>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>TACTICAL VOLUME</Text>
        <PieChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={180}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  header: { padding: 20, paddingTop: 60 },
  headerTitle: { color: "#666", fontWeight: "bold", letterSpacing: 2 },
  loader: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    color: "#00F0FF",
    marginTop: 15,
    fontSize: 10,
    fontWeight: "bold",
  },
  feedbackCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "rgba(0, 240, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.1)",
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  feedbackText: {
    color: "#EDEDED",
    flex: 1,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  grid: { flexDirection: "row", paddingHorizontal: 20, gap: 15 },
  statBox: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  statValue: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
  },
  statLabel: { color: "#444", fontSize: 10, fontWeight: "bold" },
  chartSection: {
    margin: 20,
    padding: 20,
    backgroundColor: "#121212",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  sectionTitle: {
    color: "#666",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
