import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

// A simple dashboard to show after login
function DashboardScreen() {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#0AFF60', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        SYSTEM ONLINE
      </Text>
      <Text style={{ color: '#EDEDED', marginBottom: 40 }}>Welcome, Agent.</Text>
      <Text onPress={logout} style={{ color: '#FF003C', padding: 10, borderWidth: 1, borderColor: '#FF003C', borderRadius: 5 }}>
        DISCONNECT
      </Text>
    </View>
  );
}

function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00F0FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050505' } }}>
        {token ? (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
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