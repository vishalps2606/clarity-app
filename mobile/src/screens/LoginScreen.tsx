import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import client from '../api/client'; // Only import the default client

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // <--- Get the login function from Context

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert("Error", "Credentials Required");
        return;
    }
    
    setLoading(true);
    try {
      console.log(`Attempting login to: ${client.defaults.baseURL}/auth/login`);
      
      const res = await client.post('/auth/login', { email, password });
      
      // 1. DELETE THIS LINE -> setAuthToken(res.data.token); 
      // The client.ts interceptor will automatically find the token in SecureStore now.

      // 2. Just call login() from Context. 
      // This saves the token to SecureStore, which client.ts reads automatically.
      await login(res.data.token); 

    } catch (err: any) {
      console.error("Login error:", err);
      const message = err.response?.data?.message || "Invalid credentials or server unreachable.";
      Alert.alert("Access Denied", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Glow */}
      <View style={styles.glow} />
      
      <View style={styles.header}>
        <Text style={styles.title}>IDENTIFY</Text>
        <Text style={styles.subtitle}>Enter credentials to sync.</Text>
      </View>

      <View style={styles.form}>
        <View>
            <Text style={styles.label}>Email</Text>
            <TextInput 
                style={styles.input}
                placeholder="user@clarity.com"
                placeholderTextColor="#444"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
        </View>

        <View>
            <Text style={styles.label}>Password</Text>
            <TextInput 
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#444"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
        </View>

        <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            style={[styles.button, loading && styles.buttonDisabled]}
        >
            {loading ? (
                <ActivityIndicator color="#00F0FF" />
            ) : (
                <Text style={styles.buttonText}>CONNECT</Text>
            )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 256,
    height: 256,
    backgroundColor: '#BC13FE',
    borderRadius: 128,
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#EDEDED',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'monospace',
  },
  form: {
    gap: 24,
  },
  label: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#EDEDED',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 32,
    backgroundColor: '#00F0FF', // Neon Blue
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#121212',
    borderColor: '#2A2A2A',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 2,
  },
});