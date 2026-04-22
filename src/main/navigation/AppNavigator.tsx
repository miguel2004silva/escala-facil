import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../features/auth/ui/screens/LoginScreen';
import { EscalasScreen } from '../../features/escala/ui/screens/EscalasScreen';
import { makeLoginViewModel, makeAuthRepository } from '../factories/AuthFactory';
import { makeEscalasViewModel, makeConfirmarPresencaViewModel } from '../factories/EscalaFactory';
import { ActivityIndicator, View } from 'react-native';
import { User } from '../../features/auth/domain/entities/User';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authRepository = makeAuthRepository();

  useEffect(() => {
    authRepository.getCurrentUser().then(user => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          <Stack.Screen name="Escalas">
            {() => (
              <EscalasScreen 
                currentUser={currentUser}
                onLogout={async () => {
                  await authRepository.logout();
                  setCurrentUser(null);
                }} 
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {() => (
              <LoginScreen 
                onLoginSuccess={async () => {
                  const user = await authRepository.getCurrentUser();
                  setCurrentUser(user);
                }} 
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

