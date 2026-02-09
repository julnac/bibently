import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, Button, Text, Icon } from '@rneui/themed';
import { router } from 'expo-router';
import { useAuth } from '@/src/core/context/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Po rejestracji możemy automatycznie zalogować użytkownika

  const handleRegister = async () => {
    // Podstawowa walidacja
    if (!email || !password || !confirmPassword) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Błąd', 'Hasła nie są identyczne');
      return;
    }

    setLoading(true);
    try {
      // Symulacja wywołania Twojego backendu/Firebase
      // const response = await authService.register(email, password);
      
      console.log('Rejestracja dla:', email);
      
      // Symulujemy sukces i automatyczne logowanie
      const mockToken = "new-user-token-123";
      await login(mockToken);
      
      Alert.alert('Sukces', 'Konto zostało utworzone!');
      router.replace('/(tabs)/map');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się utworzyć konta. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formCard}>
          <Text h3 style={styles.title}>Dołącz do Bibently</Text>
          <Text style={styles.subtitle}>Znajdź najlepsze wydarzenia w Twojej okolicy</Text>

          <Input
            placeholder="Adres e-mail"
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

          <Input
            placeholder="Powtórz hasło"
            leftIcon={<Icon name="lock-reset" size={20} color="#6b7280" />}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Button
            title="Zarejestruj się"
            loading={loading}
            onPress={handleRegister}
            buttonStyle={styles.registerButton}
            containerStyle={styles.buttonContainer}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Masz już konto?</Text>
            <Button
              title="Zaloguj się"
              type="clear"
              onPress={() => router.back()}
              titleStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    textAlign: 'center',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  registerButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
  },
  buttonContainer: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#4b5563',
  },
});