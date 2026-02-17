import "./global.css";
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Target, Zap, BarChart3, RefreshCw } from "lucide-react-native";

import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import CreateTaskScreen from "./src/screens/CreateTaskScreen";
import TaskDetailScreen from "./src/screens/TaskDetailScreen";
import FocusModeScreen from "./src/screens/FocusModeScreen";
import GoalsScreen from "./src/screens/GoalsScreen";
import InsightsScreen from "./src/screens/InsightsScreen";
import ReviewScreen from "./src/screens/ReviewScreen";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CreateTask: undefined;
  TaskDetail: { taskId: number };
  FocusMode: {
    taskId: number;
    initialTitle: string;
    currentActualMinutes: number;
  };
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#050505",
          borderTopColor: "#2A2A2A",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#00F0FF",
        tabBarInactiveTintColor: "#444",
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          tabBarLabel: "COMMAND",
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          tabBarIcon: ({ color }) => <Target size={24} color={color} />,
          tabBarLabel: "GOALS",
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
          tabBarLabel: "INSIGHTS",
        }}
      />
      <Tab.Screen
        name="Review"
        component={ReviewScreen}
        options={{
          tabBarIcon: ({ color }) => <RefreshCw size={24} color={color} />,
          tabBarLabel: "REVIEW",
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#050505",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#00F0FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#050505" },
        }}
      >
        {token ? (
          <Stack.Group>
            <Stack.Screen name="Main" component={MainTabs} />

            <Stack.Screen
              name="CreateTask"
              component={CreateTaskScreen}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="FocusMode" component={FocusModeScreen} />
          </Stack.Group>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
