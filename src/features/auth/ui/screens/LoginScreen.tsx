import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../../../theme/colors';
import { makeLoginUseCase } from '../../../../main/factories/AuthFactory';
import { useLoginViewModel } from '../../presentation/viewmodels/useLoginViewModel';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const viewModel = useLoginViewModel(makeLoginUseCase());
  const { email, setEmail, password, setPassword, loading, error, handleLogin } = viewModel;

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.background]}
      style={styles.container}
    >
      <View collapsable={false} style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="calendar" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>
            Escala<Text style={{ color: colors.text }}>Fácil</Text>
          </Text>
          <Text style={styles.subtitle}>Gerencie suas escalas ministeriais de forma simples</Text>
        </View>

        <View collapsable={false} style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View 
            collapsable={false}
            style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}
          >
            <Ionicons 
              name="mail-outline" 
              size={20} 
              color={emailFocused ? colors.primary : colors.textSecondary} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <View 
            collapsable={false}
            style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}
          >
            <Ionicons 
              name="lock-closed-outline" 
              size={20} 
              color={passwordFocused ? colors.primary : colors.textSecondary} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>

          <TouchableOpacity 
            activeOpacity={0.85}
            onPress={() => handleLogin(onLoginSuccess)}
            disabled={loading}
            style={styles.buttonContainer}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={[styles.button, loading && styles.buttonDisabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.hintContainer}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <View style={styles.hintTextWrapper}>
              <Text style={styles.hintTitle}>Acesso de Teste:</Text>
              <Text style={styles.hintText}>
                Use <Text style={styles.hintHighlight}>admin@escala.com</Text> ou <Text style={styles.hintHighlight}>user@escala.com</Text> com a senha <Text style={styles.hintHighlight}>123456</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(79, 70, 229, 0.1)',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 58,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
    outlineStyle: 'none',
  } as any,
  buttonContainer: {
    marginTop: 18,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  button: {
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hintContainer: {
    flexDirection: 'row',
    backgroundColor: colors.infoLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  hintTextWrapper: {
    marginLeft: 10,
    flex: 1,
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.info,
    marginBottom: 2,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  hintHighlight: {
    fontWeight: '600',
    color: colors.text,
  },
});
