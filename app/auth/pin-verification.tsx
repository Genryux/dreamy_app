import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PinVerificationScreen() {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;
  const colorScheme = useColorScheme();

  const handleVerifyPin = async () => {
    if (!pin) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    if (pin.length !== 6) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }

    setIsVerifying(true);

    try {
      // Call API to verify PIN
      await apiService.verifyPin({
        pin: pin,
      });

      // PIN verified successfully, navigate to dashboard based on user type
      const userType = await SecureStore.getItemAsync('userType');
      if (userType === 'teacher') {
        router.replace('/(teacher)/dashboard');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        Alert.alert(
          'Too Many Attempts',
          'You have exceeded the maximum number of PIN attempts. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Logout and redirect to login
                apiService.logout();
                router.replace('/(auth)/login');
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Incorrect PIN',
          `Incorrect PIN. ${maxAttempts - newAttempts} attempts remaining.`,
          [
            {
              text: 'Try Again',
              onPress: () => {
                setPin('');
              },
            },
          ]
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            apiService.logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { 
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : '#EFF6FF',
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder
          }]}>
            <IconSymbol name="lock.shield" size={32} color="#199BCF" />
          </View>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Enter PIN</Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Enter your 6-digit PIN to continue
          </Text>
        </View>

        {/* PIN Input */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.pinInput, {
                backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
                color: Colors[colorScheme ?? 'light'].textPrimary
              }]}
              value={pin}
              onChangeText={setPin}
              placeholder="000000"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              textAlign="center"
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isVerifying && styles.buttonDisabled]}
            onPress={handleVerifyPin}
            disabled={isVerifying}
          >
            <Text style={styles.buttonText}>
              {isVerifying ? 'Verifying...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Attempts Counter */}
        {attempts > 0 && (
          <View style={[styles.attemptsContainer, {
            backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#FEF3C7',
            borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#FDE68A'
          }]}>
            <Text style={[styles.attemptsText, {
              color: colorScheme === 'dark' ? '#FFFFFF' : '#92400E'
            }]}>
              Attempts: {attempts}/{maxAttempts}
            </Text>
          </View>
        )}

        {/* Logout Option */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.logoutButton, {
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : '#F3F4F6',
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : '#D1D5DB'
          }]} onPress={handleLogout}>
            <IconSymbol name="arrow.right.square" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.logoutText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  pinInput: {
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    textAlign: 'center',
    letterSpacing: 6,
  },
  button: {
    backgroundColor: '#199BCF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  attemptsContainer: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  attemptsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
