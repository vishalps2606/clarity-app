import "./global.css";
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0AFF60',
    marginBottom: 16,
  },
  syncingText: {
    fontSize: 14,
    color: '#00F0FF',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FF003C',
    borderRadius: 6,
  },
  buttonText: {
    color: '#FF003C',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF003C',
    textAlign: 'center',
    fontSize: 16,
  },
});

// Temporary Dashboard Placeholder
function DashboardPlaceholder() {
    const { logout } = useAuth();
    return (
        <View style={styles.container}>
            <Text style={styles.successText}>ACCESS GRANTED</Text>
            <TouchableOpacity onPress={logout} style={styles.button}>
                <Text style={styles.buttonText}>DISCONNECT</Text>
            </TouchableOpacity>
        </View>
    );
}

function Navigation() {
  const authContext = useAuth();
  const { token, isLoading } = authContext;

  if (typeof isLoading !== 'boolean' || isLoading === undefined || isLoading === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00F0FF" />
        <Text style={styles.syncingText}>INITIALIZING...</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#00F0FF" />
            <Text style={styles.syncingText}>SYNCING...</Text>
        </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Dashboard" component={DashboardPlaceholder} />
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
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}