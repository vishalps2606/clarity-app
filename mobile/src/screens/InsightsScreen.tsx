import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { Activity, Clock, CheckCircle } from 'lucide-react-native';
import client from '../api/client';

const screenWidth = Dimensions.get("window").width;

export default function InsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      // Fetch all tasks to crunch numbers locally
      const res = await client.get('/tasks');
      const tasks = res.data;

      // 1. Calculate Total Focus Time (Sum of actualMinutes)
      const totalMinutes = tasks.reduce((acc: number, t: any) => acc + (t.actualMinutes || 0), 0);
      
      // 2. Calculate Completion Rate
      const completed = tasks.filter((t: any) => t.status === 'DONE').length;
      const totalTasks = tasks.length;

      // 3. Mock Weekly Data 
      // (This visualizes "Activity". In a real V2, we fetch this from backend)
      const mockWeeklyData = {
        labels: ["M", "T", "W", "T", "F", "S", "S"],
        datasets: [{
          // Just injecting the totalMinutes into today's slot for visual feedback
          data: [20, 45, 28, 60, 35, 10, totalMinutes > 10 ? totalMinutes : 15] 
        }]
      };

      setStats({
        totalMinutes,
        completed,
        totalTasks,
        chartData: mockWeeklyData
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInsights();
    }, [])
  );

  if (loading || !stats) {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#00F0FF" />
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchInsights(); }} tintColor="#00F0FF" />}
      >
        <Text style={styles.headerTitle}>SYSTEM ANALYTICS</Text>

        {/* HUD Grid */}
        <View style={styles.grid}>
            <View style={styles.card}>
                <Clock size={24} color="#00F0FF" style={styles.icon} />
                <Text style={styles.cardLabel}>FOCUS TIME</Text>
                <Text style={styles.cardValue}>{stats.totalMinutes}m</Text>
            </View>
            <View style={styles.card}>
                <CheckCircle size={24} color="#0AFF60" style={styles.icon} />
                <Text style={styles.cardLabel}>COMPLETED</Text>
                <Text style={styles.cardValue}>{stats.completed}</Text>
            </View>
            <View style={styles.card}>
                <Activity size={24} color="#BC13FE" style={styles.icon} />
                <Text style={styles.cardLabel}>EFFICIENCY</Text>
                <Text style={styles.cardValue}>
                    {stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0}%
                </Text>
            </View>
        </View>

        {/* Chart Section */}
        <Text style={styles.sectionTitle}>ACTIVITY LOG (WEEKLY ESTIMATE)</Text>
        <BarChart
            data={stats.chartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix="m"
            chartConfig={{
                backgroundColor: "#121212",
                backgroundGradientFrom: "#1E1E1E",
                backgroundGradientTo: "#121212",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 240, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(136, 136, 136, ${opacity})`,
                barPercentage: 0.6,
                propsForBackgroundLines: {
                    strokeWidth: 1,
                    stroke: "#333",
                    strokeDasharray: "0",
                },
            }}
            style={styles.chart}
            showValuesOnTopOfBars={true}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  center: { flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#EDEDED', letterSpacing: 1, marginBottom: 24 },
  
  grid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  card: { flex: 1, backgroundColor: '#121212', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A', minHeight: 120, justifyContent: 'center' },
  icon: { marginBottom: 12 },
  cardLabel: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 4, letterSpacing: 1 },
  cardValue: { color: '#EDEDED', fontSize: 24, fontWeight: 'bold' },

  sectionTitle: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 16, letterSpacing: 1 },
  chart: { borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A' }
});