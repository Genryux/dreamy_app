import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();

  async function onLogin() {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    
    setLoading(true);
    try {
      const data = await apiService.login(email, password);

      // Persist token securely
      if (data?.token) {
        await SecureStore.setItemAsync('authToken', data.token);
      }

      // Check PIN requirements
      if (data?.pin_setup_required) {
        // User needs to setup PIN
        router.replace('/auth/pin-setup');
      } else if (data?.pin_required) {
        // User needs to verify PIN
        router.replace('/auth/pin-verification');
      } else {
        // No PIN required, go to dashboard
        router.replace('/(tabs)/dashboard');
      }
    } catch (err: any) {
      Alert.alert('Login error', err?.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoCircle, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
                <IconSymbol name="graduationcap.fill" size={32} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.welcomeTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              Welcome Back
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Sign in to your student account
            </Text>
          </View>

          {/* Login Form */}
          <View style={[styles.formContainer, { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            <Text style={[styles.formTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              Sign In
            </Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>
                Email Address
              </Text>
              <View style={[styles.inputContainer, { 
                backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                borderColor: Colors[colorScheme ?? 'light'].cardBorder 
              }]}>
                <IconSymbol name="envelope.fill" size={20} color="#199BCF" />
                <TextInput
                  style={[styles.textInput, { color: Colors[colorScheme ?? 'light'].textValue }]}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>
                Password
              </Text>
              <View style={[styles.inputContainer, { 
                backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                borderColor: Colors[colorScheme ?? 'light'].cardBorder 
              }]}>
                <IconSymbol name="lock.shield" size={20} color="#199BCF" />
                <TextInput
                  style={[styles.textInput, { color: Colors[colorScheme ?? 'light'].textValue }]}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <IconSymbol 
                    name={showPassword ? "eye.slash.fill" : "eye.fill"} 
                    size={20} 
                    color={Colors[colorScheme ?? 'light'].textTertiary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={onLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Signing In...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <IconSymbol name="arrow.right.square.fill" size={20} color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            <Text style={[styles.helpText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Enter your student credentials to access your account
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#199BCF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    marginRight: 8,
  },
  passwordToggle: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#199BCF',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#199BCF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
});
