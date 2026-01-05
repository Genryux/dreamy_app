import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PinSetupScreen() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const colorScheme = useColorScheme();

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

      // Get user type for proper routing
      const userType = await SecureStore.getItemAsync('userType');
      const dashboardRoute = userType === 'teacher' ? '/(teacher)/dashboard' : '/(tabs)/dashboard';

      Alert.alert(
        'Success',
        'PIN setup successfully! You can now use this PIN for secure access.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to dashboard
              router.replace(dashboardRoute as any);
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { 
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : '#EFF6FF',
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder
          }]}>
            <IconSymbol name="lock.shield" size={48} color="#199BCF" />
          </View>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Setup Your PIN</Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Create a 6-digit PIN for secure access to your account
          </Text>
        </View>

        {/* PIN Input Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Enter PIN</Text>
            <TextInput
              style={[styles.pinInput, { 
                backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                borderColor: '#199BCF',
                color: Colors[colorScheme ?? 'light'].textValue
              }]}
              value={pin}
              onChangeText={setPin}
              placeholder="000000"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              textAlign="center"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Confirm PIN</Text>
            <TextInput
              style={[styles.pinInput, { 
                backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                borderColor: '#199BCF',
                color: Colors[colorScheme ?? 'light'].textValue
              }]}
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder="000000"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
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
        <View style={[styles.infoContainer, { 
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : '#F0FDF4',
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : '#BBF7D0'
        }]}>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark" size={16} color="#10B981" />
            <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].textValue }]}>PIN is encrypted and secure</Text>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark" size={16} color="#10B981" />
            <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].textValue }]}>Required for sensitive operations</Text>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark" size={16} color="#10B981" />
            <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].textValue }]}>Can be disabled in settings</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
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
    width: 72,
    height: 72,
    borderRadius: 36,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  pinInput: {
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
    letterSpacing: 6,
  },
  button: {
    backgroundColor: '#199BCF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
});
