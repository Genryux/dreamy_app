import { IconSymbol } from '@/components/ui/IconSymbol';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PinVerificationScreen() {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

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

      // PIN verified successfully, navigate to dashboard
      router.replace('/(tabs)/dashboard');
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol name="lock.shield" size={48} color="#199BCF" />
          </View>
          <Text style={styles.title}>Enter Your PIN</Text>
          <Text style={styles.subtitle}>
            Please enter your 6-digit PIN to continue
          </Text>
        </View>

        {/* PIN Input */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              placeholder="000000"
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
            <View style={styles.buttonContent}>
              <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {isVerifying ? 'Verifying...' : 'Verify PIN'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Attempts Counter */}
        {attempts > 0 && (
          <View style={styles.attemptsContainer}>
            <Text style={styles.attemptsText}>
              Attempts: {attempts}/{maxAttempts}
            </Text>
          </View>
        )}

        {/* Logout Option */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol name="arrow.right.square" size={16} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  pinInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A3165',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#199BCF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#199BCF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  attemptsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  attemptsText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
});
