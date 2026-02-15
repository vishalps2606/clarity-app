import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import client, { setAuthToken } from '../api/client';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 256,
    height: 256,
    backgroundColor: '#BC13FE',
    borderRadius: 128,
    opacity: 0.2,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EDEDED',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888888',
    fontFamily: 'monospace',
  },
  form: {
    gap: 16,
  },
  fieldContainer: {
    marginVertical: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonActive: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#00F0FF',
    borderColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#121212',
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#050505',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert("Error", "Credentials Required");
        return;
    }
    
    setLoading(true);
    try {
      const res = await client.post('/auth/login', { email, password });
      const token = res.data?.token;
      
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token received from server');
      }
      
      setAuthToken(token);
      await login(token);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Invalid credentials or server unreachable.";
      Alert.alert("Access Denied", errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glowEffect} />
      
      <View style={styles.header}>
        <Text style={styles.title}>IDENTIFY</Text>
        <Text style={styles.subtitle}>Enter credentials to sync.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fieldContainer}>
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

        <View style={styles.fieldContainer}>
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
            style={loading ? styles.buttonDisabled : styles.buttonActive}
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