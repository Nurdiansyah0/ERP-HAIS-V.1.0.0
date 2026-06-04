import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LoginScreen } from './src/presentation/screens/LoginScreen';
import { useAuthStore } from './src/presentation/state/useAuthStore';

// Dummy Home Screen untuk saat ini
const HomeScreen = () => {
  const { user, logout } = useAuthStore();
  
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Selamat datang, {user?.name}</Text>
      <Text style={styles.roleText}>Role: {user?.role}</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  const { user, checkSession, isLoading } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff' }}>Loading Session...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar style="light" />
      {user ? <HomeScreen /> : <LoginScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 24,
    color: '#f8fafc',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
    textTransform: 'uppercase',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
