import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../features/auth/ui/screens/LoginScreen';
import { EscalasScreen } from '../../features/escala/ui/screens/EscalasScreen';
import { makeAuthRepository } from '../factories/AuthFactory';
import { ActivityIndicator, View } from 'react-native';
import { User } from '../../features/auth/domain/entities/User';
import { useNotificationListener } from '../../core/hooks/useNotificationListener';

const Stack = createNativeStackNavigator();

interface NavigationAuthContextType {
  currentUser: User | null;
  onLoginSuccess: () => Promise<void>;
  onLogout: () => Promise<void>;
}

const NavigationAuthContext = createContext<NavigationAuthContextType | undefined>(undefined);

function LoginScreenWrapper() {
  const context = useContext(NavigationAuthContext);
  if (!context) {
    throw new Error('NavigationAuthContext must be used within AppNavigator');
  }
  return <LoginScreen onLoginSuccess={context.onLoginSuccess} />;
}

function EscalasScreenWrapper() {
  const context = useContext(NavigationAuthContext);
  if (!context) {
    throw new Error('NavigationAuthContext must be used within AppNavigator');
  }
  if (!context.currentUser) return null;
  return (
    <EscalasScreen 
      currentUser={context.currentUser}
      onLogout={context.onLogout} 
    />
  );
}

export function AppNavigator() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authRepository = useMemo(() => makeAuthRepository(), []);

  // Ativa o ouvinte de notificações em tempo real
  useNotificationListener(currentUser);

  useEffect(() => {
    authRepository.getCurrentUser().then(user => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, [authRepository]);

  const onLoginSuccess = useMemo(() => async () => {
    const user = await authRepository.getCurrentUser();
    setCurrentUser(user);
  }, [authRepository]);

  const onLogout = useMemo(() => async () => {
    await authRepository.logout();
    setCurrentUser(null);
  }, [authRepository]);

  const authContextValue = useMemo(() => ({
    currentUser,
    onLoginSuccess,
    onLogout
  }), [currentUser, onLoginSuccess, onLogout]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationAuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {currentUser ? (
            <Stack.Screen name="Escalas" component={EscalasScreenWrapper} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreenWrapper} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationAuthContext.Provider>
  );
}


