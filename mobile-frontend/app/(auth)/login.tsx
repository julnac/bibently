import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, Button, Text, Icon } from '@rneui/themed';
import { useAuth } from '@/src/core/context/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Pobieramy funkcję login z Twojego kontekstu

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Błąd', 'Proszę wypełnić wszystkie pola');
      return;
    }

    setLoading(true);
    try {
      // Symulacja zapytania do Twojego backendu .NET
      // W przyszłości użyjesz tutaj: const response = await authService.login(email, password);
      
      const mockToken = "fake-firebase-jwt-token"; // Tu trafi token z Twojego API
      
      await login(mockToken); // To zapisze token i przekieruje do /map
    } catch (error) {
      Alert.alert('Błąd logowania', 'Nieprawidłowy e-mail lub hasło');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.formCard}>
        <Text h3 style={styles.title}>Bibently</Text>
        <Text style={styles.subtitle}>Zaloguj się, aby zarządzać wydarzeniami</Text>

        <Input
          placeholder="E-mail"
          leftIcon={<Icon name="email" size={20} color="#6b7280" />}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Input
          placeholder="Hasło"
          leftIcon={<Icon name="lock" size={20} color="#6b7280" />}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button
          title="Zaloguj się"
          loading={loading}
          onPress={handleLogin}
          buttonStyle={styles.loginButton}
          containerStyle={styles.buttonContainer}
        />

        <Button
          title="Nie masz konta? Zarejestruj się"
          type="clear"
          onPress={() => router.push('/register')}
          titleStyle={{ color: '#4f46e5', fontSize: 14 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    padding: 20,
  },
  formCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 25,
  },
  loginButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
});