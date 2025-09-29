import { IconSymbol } from '@/components/ui/IconSymbol';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PinSetupScreen() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetupPin = async () => {
    // Validation
    if (!pin || !confirmPin) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    if (pin.length !== 6) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    setIsSettingUp(true);

    try {
      // Call API to setup PIN
      await apiService.setupPin({
        pin: pin,
        pin_confirmation: confirmPin,
      });

      Alert.alert(
        'Success',
        'PIN setup successfully! You can now use this PIN for secure access.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to dashboard
              router.replace('/(tabs)/dashboard');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to setup PIN');
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol name="lock.shield" size={48} color="#199BCF" />
          </View>
          <Text style={styles.title}>Setup Your PIN</Text>
          <Text style={styles.subtitle}>
            Create a 6-digit PIN for secure access to your account
          </Text>
        </View>

        {/* PIN Input Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enter PIN</Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              placeholder="000000"
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              textAlign="center"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm PIN</Text>
            <TextInput
              style={styles.pinInput}
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder="000000"
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              textAlign="center"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isSettingUp && styles.buttonDisabled]}
            onPress={handleSetupPin}
            disabled={isSettingUp}
          >
            <View style={styles.buttonContent}>
              <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {isSettingUp ? 'Setting up...' : 'Setup PIN'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark" size={16} color="#10B981" />
            <Text style={styles.infoText}>PIN is encrypted and secure</Text>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark" size={16} color="#10B981" />
            <Text style={styles.infoText}>Required for sensitive operations</Text>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark" size={16} color="#10B981" />
            <Text style={styles.infoText}>Can be disabled in settings</Text>
          </View>
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
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
  infoContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
    fontWeight: '500',
  },
});
