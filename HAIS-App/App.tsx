import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from './src/presentation/screens/LoginScreen';
import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { InspectionFormScreen } from './src/presentation/screens/InspectionFormScreen';
import { UsersScreen } from './src/presentation/screens/UsersScreen';
import { useAuthStore } from './src/presentation/state/useAuthStore';

const Stack = createNativeStackNavigator();

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
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="InspectionForm" component={InspectionFormScreen} />
            <Stack.Screen name="Users" component={UsersScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
