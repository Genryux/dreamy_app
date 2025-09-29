import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDashboard } from '@/hooks/useDashboard';
import { apiService } from '@/services/api';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountSettingsScreen() {
  const { data: dashboardData, loading, refresh } = useDashboard();
  const colorScheme = useColorScheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordPin, setPasswordPin] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailPin, setEmailPin] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  // PIN management state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [togglePin, setTogglePin] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [isTogglingPin, setIsTogglingPin] = useState(false);

  const student = dashboardData?.student;
  const enrollment = dashboardData?.enrollment;
  const user = dashboardData?.user;

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Only require PIN if PIN is enabled
    if (user?.pin_enabled && !passwordPin) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);

    try {
      // Call API to change password
      const passwordData: any = {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      };
      
      // Only include PIN if PIN is enabled
      if (user?.pin_enabled) {
        passwordData.pin = passwordPin;
      }
      
      await apiService.changePassword(passwordData);

      Alert.alert(
        'Success',
        'Password changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordPin('');
              // Refresh dashboard data
              refresh();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    // Validation
    if (!newEmail) {
      Alert.alert('Error', 'Please enter new email address');
      return;
    }

    // Only require PIN if PIN is enabled
    if (user?.pin_enabled && !emailPin) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    if (newEmail === student?.email_address) {
      Alert.alert('Error', 'New email must be different from current email');
      return;
    }

    setIsChangingEmail(true);

    try {
      // Call API to change email
      const emailData: any = {
        email: newEmail,
      };
      
      // Only include PIN if PIN is enabled
      if (user?.pin_enabled) {
        emailData.pin = emailPin;
      }
      
      await apiService.changeEmail(emailData);

      Alert.alert(
        'Success',
        'Email changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setNewEmail('');
              setEmailPin('');
              // Refresh dashboard data to update email display
              refresh();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change email');
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleChangePin = async () => {
    // Validation
    if (!currentPin || !newPin || !confirmNewPin) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPin.length !== 6) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }

    if (newPin !== confirmNewPin) {
      Alert.alert('Error', 'New PINs do not match');
      return;
    }

    setIsChangingPin(true);

    try {
      // Call API to change PIN
      await apiService.changePin({
        current_pin: currentPin,
        pin: newPin,
        pin_confirmation: confirmNewPin,
      });

      Alert.alert(
        'Success',
        'PIN changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPin('');
              setNewPin('');
              setConfirmNewPin('');
              // Refresh dashboard data
              refresh();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change PIN');
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleTogglePin = async (enable: boolean) => {
    // Validation
    if (!togglePin) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    if (togglePin.length !== 6) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }

    setIsTogglingPin(true);

    try {
      // Call API to toggle PIN
      await apiService.togglePin({
        pin: togglePin,
        enable: enable,
      });

      const message = enable ? 'PIN security enabled' : 'PIN security disabled';
      Alert.alert(
        'Success',
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              setTogglePin('');
              // Refresh dashboard data to update PIN status
              refresh();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to toggle PIN security');
    } finally {
      setIsTogglingPin(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Account Settings',
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].textPrimary,
          headerTitleStyle: {
            color: Colors[colorScheme ?? 'light'].textPrimary,
          },
        }}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Account Settings</Text>
          <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Manage your account security</Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Security Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <IconSymbol name="lock.shield" size={24} color="#199BCF" />
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Security</Text>
            </View>

            {/* Change Password Card */}
            <View style={[styles.card, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].cardBorder 
            }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Change Password</Text>
                <Text style={[styles.cardSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Update your account password</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Current Password</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      color: Colors[colorScheme ?? 'light'].textValue 
                    }]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>New Password</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      color: Colors[colorScheme ?? 'light'].textValue 
                    }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Confirm New Password</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      color: Colors[colorScheme ?? 'light'].textValue 
                    }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>PIN Verification</Text>
                  <TextInput
                    style={[styles.input, !user?.pin_enabled && styles.inputDisabled, { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      color: Colors[colorScheme ?? 'light'].textValue 
                    }]}
                    value={passwordPin}
                    onChangeText={setPasswordPin}
                    placeholder={user?.pin_enabled ? "Enter your PIN" : "PIN is currently disabled"}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                    secureTextEntry={user?.pin_enabled}
                    keyboardType="numeric"
                    maxLength={6}
                    editable={user?.pin_enabled}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isChangingPassword && styles.buttonDisabled]}
                  onPress={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  <View style={styles.buttonContent}>
                     <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>
                      {isChangingPassword ? 'Changing...' : 'Change Password'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Change Email Card */}
            <View style={[styles.card, styles.emailCard, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].cardBorder 
            }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Change Email Address</Text>
                <Text style={[styles.cardSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Update your email address</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Current Email</Text>
                  <Text style={[styles.currentValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.email_address || 'Not provided'}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>New Email Address</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      color: Colors[colorScheme ?? 'light'].textValue 
                    }]}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder="Enter new email address"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>PIN Verification</Text>
                  <TextInput
                    style={[styles.input, !user?.pin_enabled && styles.inputDisabled, { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      color: Colors[colorScheme ?? 'light'].textValue 
                    }]}
                    value={emailPin}
                    onChangeText={setEmailPin}
                    placeholder={user?.pin_enabled ? "Enter your PIN" : "PIN is currently disabled"}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                    secureTextEntry={user?.pin_enabled}
                    keyboardType="numeric"
                    maxLength={6}
                    editable={user?.pin_enabled}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isChangingEmail && styles.buttonDisabled]}
                  onPress={handleChangeEmail}
                  disabled={isChangingEmail}
                >
                  <View style={styles.buttonContent}>
                    <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>
                      {isChangingEmail ? 'Changing...' : 'Change Email'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* PIN Management Card */}
            <View style={[styles.card, styles.pinCard, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].cardBorder 
            }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>PIN Management</Text>
                  <View style={[styles.statusBadge, user?.pin_enabled ? styles.statusActive : styles.statusInactive]}>
                    <Text style={[styles.statusText, user?.pin_enabled ? styles.statusTextActive : styles.statusTextInactive]}>
                      {user?.pin_enabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Change or manage your PIN security</Text>
              </View>

              <View style={styles.form}>
                {/* Change PIN Section */}
                <View style={styles.sectionDivider}>
                  <Text style={[styles.sectionLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Change PIN</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Current PIN</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      color: Colors[colorScheme ?? 'light'].textValue 
                    }]}
                    value={currentPin}
                    onChangeText={setCurrentPin}
                    placeholder="Enter current PIN"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>New PIN</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      color: Colors[colorScheme ?? 'light'].textValue 
                    }]}
                    value={newPin}
                    onChangeText={setNewPin}
                    placeholder="Enter new PIN"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Confirm New PIN</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      color: Colors[colorScheme ?? 'light'].textValue 
                    }]}
                    value={confirmNewPin}
                    onChangeText={setConfirmNewPin}
                    placeholder="Confirm new PIN"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isChangingPin && styles.buttonDisabled]}
                  onPress={handleChangePin}
                  disabled={isChangingPin}
                >
                  <View style={styles.buttonContent}>
                    <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>
                      {isChangingPin ? 'Changing...' : 'Change PIN'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Toggle PIN Section */}
                <View style={styles.sectionDivider}>
                  <Text style={[styles.sectionLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>PIN Security Toggle</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Enter PIN to Toggle</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      color: Colors[colorScheme ?? 'light'].textValue 
                    }]}
                    value={togglePin}
                    onChangeText={setTogglePin}
                    placeholder="Enter your PIN"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>

                <View style={styles.toggleButtons}>
                  <TouchableOpacity
                    style={[styles.toggleButton, styles.enableButton, isTogglingPin && styles.buttonDisabled]}
                    onPress={() => handleTogglePin(true)}
                    disabled={isTogglingPin}
                  >
                    <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.toggleButtonText}>Enable PIN</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleButton, styles.disableButton, isTogglingPin && styles.buttonDisabled]}
                    onPress={() => handleTogglePin(false)}
                    disabled={isTogglingPin}
                  >
                    <IconSymbol name="xmark" size={16} color="#FFFFFF" />
                    <Text style={styles.toggleButtonText}>Disable PIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Account Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="person" size={24} color="#199BCF" />
              <Text style={styles.sectionTitle}>Account Information</Text>
            </View>

            {loading ? (
              <View style={[styles.card, { 
                backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                borderColor: Colors[colorScheme ?? 'light'].cardBorder 
              }]}>
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading account information...</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.card, { 
                backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                borderColor: Colors[colorScheme ?? 'light'].cardBorder 
              }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Account Type</Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>Student Account</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Student Status</Text>
                <View style={[styles.statusBadge, student?.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, student?.status === 'active' ? styles.statusTextActive : styles.statusTextInactive]}>
                    {student?.status === 'active' ? 'Active' : student?.status || 'Unknown'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Enrollment Status</Text>
                <View style={[styles.statusBadge, enrollment?.status === 'confirmed' ? styles.statusActive : styles.statusPending]}>
                  <Text style={[styles.statusText, enrollment?.status === 'confirmed' ? styles.statusTextActive : styles.statusTextPending]}>
                    {enrollment?.status === 'confirmed' ? 'Confirmed' : enrollment?.status || 'Pending'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Student ID (LRN)</Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.lrn || 'Not assigned'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Program</Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.program || 'Not assigned'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Grade Level</Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.grade_level || 'Not assigned'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Enrollment Date</Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>
                  {student?.enrollment_date || 'Not available'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Email Address</Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.email_address || 'Not provided'}</Text>
              </View>
              </View>
            )}
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <IconSymbol name="hand.raised" size={24} color="#199BCF" />
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Privacy & Data</Text>
            </View>

            <View style={[styles.card, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].cardBorder 
            }]}>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Data Export</Text>
                  <Text style={[styles.settingSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Download your personal data</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Delete Account</Text>
                  <Text style={[styles.settingSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Permanently delete your account</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A3165',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3165',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#166534',
  },
  statusTextPending: {
    color: '#92400E',
  },
  statusTextInactive: {
    color: '#991B1B',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  currentValue: {
    fontSize: 16,
    color: '#1A3165',
    fontWeight: '500',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emailCard: {
    marginTop: 20,
  },
  pinCard: {
    marginTop: 20,
  },
  sectionDivider: {
    marginTop: 20,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3165',
    marginBottom: 8,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  enableButton: {
    backgroundColor: '#10B981',
  },
  disableButton: {
    backgroundColor: '#EF4444',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    color: '#9CA3AF',
  },
});
