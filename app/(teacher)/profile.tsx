import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { apiService } from '@/services/api';
import { teacherApiService } from '@/services/teacherApi';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TeacherProfile {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    pin_enabled: boolean;
  };
  teacher: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email_address: string | null;
    contact_number: string | null;
    specialization: string | null;
    status: string;
    program: string | null;
  };
}

export default function TeacherProfileScreen() {
  const [data, setData] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedContact, setEditedContact] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [editedSpecialization, setEditedSpecialization] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const colorScheme = useColorScheme();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teacherApiService.getProfile();
      setData(response);
      setEditedContact(response.teacher.contact_number || '');
      setEditedEmail(response.teacher.email_address || '');
      setEditedFirstName(response.teacher.first_name || '');
      setEditedLastName(response.teacher.last_name || '');
      setEditedSpecialization(response.teacher.specialization || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await teacherApiService.updateProfile({
        contact_number: editedContact || null,
        email_address: editedEmail || null,
      });
      
      // Update local state
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          teacher: {
            ...prev.teacher,
            contact_number: editedContact || null,
            email_address: editedEmail || null,
          },
        };
      });
      
      setIsEditing(false);
      Alert.alert('Success', 'Contact information updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true);
      await teacherApiService.updateProfile({
        first_name: editedFirstName || null,
        last_name: editedLastName || null,
        specialization: editedSpecialization || null,
      });
      
      // Update local state
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          teacher: {
            ...prev.teacher,
            first_name: editedFirstName || '',
            last_name: editedLastName || '',
            full_name: `${editedFirstName} ${editedLastName}`,
            specialization: editedSpecialization || null,
          },
        };
      });
      
      setIsEditingBasic(false);
      Alert.alert('Success', 'Basic information updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update information');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.logout();
            } catch {
              // Ignore errors
            } finally {
              await SecureStore.deleteItemAsync('authToken');
              await SecureStore.deleteItemAsync('userType');
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  if (loading && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            Unable to load profile
          </Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        }]}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {data?.teacher.first_name?.charAt(0) || ''}{data?.teacher.last_name?.charAt(0) || ''}
            </Text>
          </View>
          
          <Text style={[styles.teacherName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            {data?.teacher.full_name}
          </Text>
          
          <Text style={[styles.employeeId, { color: Colors[colorScheme ?? 'light'].tint }]}>
            {data?.teacher.employee_id}
          </Text>

          <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.statusText, { color: '#10B981' }]}>
              {data?.teacher.status || 'Active'}
            </Text>
          </View>
        </View>

        {/* Teacher Information */}
        <View style={[styles.infoCard, {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              Teacher Information
            </Text>
            {!isEditingBasic && (
              <TouchableOpacity onPress={() => setIsEditingBasic(true)}>
                <IconSymbol name="pencil" size={18} color={Colors[colorScheme ?? 'light'].tint} />
              </TouchableOpacity>
            )}
          </View>
          
          {isEditingBasic ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  First Name
                </Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[colorScheme ?? 'light'].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
                  }]}
                  value={editedFirstName}
                  onChangeText={setEditedFirstName}
                  placeholder="Enter first name"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Last Name
                </Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[colorScheme ?? 'light'].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
                  }]}
                  value={editedLastName}
                  onChangeText={setEditedLastName}
                  placeholder="Enter last name"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Specialization
                </Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[colorScheme ?? 'light'].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
                  }]}
                  value={editedSpecialization}
                  onChangeText={setEditedSpecialization}
                  placeholder="Enter specialization"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              </View>

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colorScheme === 'dark' ? '#3D3D5C' : Colors[colorScheme ?? 'light'].cardBorder }]}
                  onPress={() => {
                    setIsEditingBasic(false);
                    setEditedFirstName(data?.teacher.first_name || '');
                    setEditedLastName(data?.teacher.last_name || '');
                    setEditedSpecialization(data?.teacher.specialization || '');
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.buttonDisabled]}
                  onPress={handleSaveBasicInfo}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoGrid}>
              <InfoRow label="First Name" value={data?.teacher.first_name || 'N/A'} colorScheme={colorScheme} />
              <InfoRow label="Last Name" value={data?.teacher.last_name || 'N/A'} colorScheme={colorScheme} />
              <InfoRow label="Specialization" value={data?.teacher.specialization || 'N/A'} colorScheme={colorScheme} />
              <InfoRow label="Program/Department" value={data?.teacher.program || 'N/A'} colorScheme={colorScheme} />
              <InfoRow label="Account Email" value={data?.user.email || 'N/A'} colorScheme={colorScheme} />
            </View>
          )}
        </View>

        {/* Contact Information (Editable) */}
        <View style={[styles.infoCard, {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              Contact Information
            </Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <IconSymbol name="pencil" size={18} color={Colors[colorScheme ?? 'light'].tint} />
              </TouchableOpacity>
            )}
          </View>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Phone Number
                </Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[colorScheme ?? 'light'].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
                  }]}
                  value={editedContact}
                  onChangeText={setEditedContact}
                  placeholder="Enter phone number (e.g., +63 912 345 6789)"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Email Address (Optional)
                </Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[colorScheme ?? 'light'].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
                  }]}
                  value={editedEmail}
                  onChangeText={setEditedEmail}
                  placeholder="Alternative email address"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder }]}
                  onPress={() => {
                    setIsEditing(false);
                    setEditedContact(data?.teacher.contact_number || '');
                    setEditedEmail(data?.teacher.email_address || '');
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.buttonDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoGrid}>
              <InfoRow 
                label="Phone Number" 
                value={data?.teacher.contact_number || 'Not provided'} 
                colorScheme={colorScheme}
              />
              <InfoRow 
                label="Email" 
                value={data?.teacher.email_address || data?.user.email || 'Not provided'} 
                colorScheme={colorScheme}
              />
            </View>
          )}
        </View>

        {/* Account Settings */}
        <View style={[styles.infoCard, {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary, marginBottom: 16 }]}>
            Account Settings
          </Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => setShowPasswordModal(true)}>
            <View style={styles.settingLeft}>
              <IconSymbol name="lock.shield" size={20} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.settingText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                Change Password
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme ?? 'light'].textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setShowPinModal(true)}>
            <View style={styles.settingLeft}>
              <IconSymbol name="lock.shield" size={20} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.settingText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                PIN Security
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: data?.user.pin_enabled ? '#10B981' : Colors[colorScheme ?? 'light'].textTertiary }]}>
                {data?.user.pin_enabled ? 'Enabled' : 'Disabled'}
              </Text>
              <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme ?? 'light'].textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="arrow.right.square.fill" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        pinEnabled={data?.user.pin_enabled || false}
        colorScheme={colorScheme}
      />

      {/* PIN Security Modal */}
      <PinSecurityModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        pinEnabled={data?.user.pin_enabled || false}
        onPinToggled={() => {
          if (data) {
            setData({
              ...data,
              user: {
                ...data.user,
                pin_enabled: !data.user.pin_enabled,
              },
            });
          }
        }}
        colorScheme={colorScheme}
      />
    </SafeAreaView>
  );
}

// Helper component for info rows
function InfoRow({ label, value, colorScheme }: { 
  label: string; 
  value: string; 
  colorScheme: 'light' | 'dark' | null | undefined;
}) {
  const scheme = colorScheme ?? 'light';
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: Colors[scheme].textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: Colors[scheme].textPrimary }]}>{value}</Text>
    </View>
  );
}

// Change Password Modal Component
function ChangePasswordModal({ visible, onClose, pinEnabled, colorScheme }: { 
  visible: boolean; 
  onClose: () => void; 
  pinEnabled: boolean;
  colorScheme: 'light' | 'dark' | null | undefined;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const scheme = colorScheme ?? 'light';

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (pinEnabled && !pin) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    try {
      setLoading(true);
      await apiService.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
        ...(pinEnabled && { pin }),
      });
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPin('');
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, {
        backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[scheme].cardBackground,
      }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: Colors[scheme].textPrimary }]}>Change Password</Text>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol name="xmark" size={24} color={Colors[scheme].textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: Colors[scheme].textSecondary }]}>Current Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordInput, {
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                  color: Colors[scheme].textPrimary,
                  borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder,
                }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={Colors[scheme].textTertiary}
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowCurrent(!showCurrent)}>
                <IconSymbol name={showCurrent ? "eye.slash" : "eye"} size={20} color={Colors[scheme].textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: Colors[scheme].textSecondary }]}>New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordInput, {
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                  color: Colors[scheme].textPrimary,
                  borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder,
                }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={Colors[scheme].textTertiary}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNew(!showNew)}>
                <IconSymbol name={showNew ? "eye.slash" : "eye"} size={20} color={Colors[scheme].textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: Colors[scheme].textSecondary }]}>Confirm New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordInput, {
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                  color: Colors[scheme].textPrimary,
                  borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder,
                }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={Colors[scheme].textTertiary}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirm(!showConfirm)}>
                <IconSymbol name={showConfirm ? "eye.slash" : "eye"} size={20} color={Colors[scheme].textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {pinEnabled && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: Colors[scheme].textSecondary }]}>PIN (for verification)</Text>
              <TextInput
                style={[styles.textInput, {
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                  color: Colors[scheme].textPrimary,
                  borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder,
                }]}
                value={pin}
                onChangeText={setPin}
                placeholder="Enter your 6-digit PIN"
                placeholderTextColor={Colors[scheme].textTertiary}
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder }]}
            onPress={onClose}
          >
            <Text style={[styles.modalButtonText, { color: Colors[scheme].textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonPrimary, loading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// PIN Security Modal Component
function PinSecurityModal({ visible, onClose, pinEnabled, onPinToggled, colorScheme }: { 
  visible: boolean; 
  onClose: () => void; 
  pinEnabled: boolean;
  onPinToggled: () => void;
  colorScheme: 'light' | 'dark' | null | undefined;
}) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'setup' | 'change' | 'disable'>('setup');

  const scheme = colorScheme ?? 'light';

  useEffect(() => {
    if (visible) {
      setMode(pinEnabled ? 'change' : 'setup');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    }
  }, [visible, pinEnabled]);

  const handleSetupPin = async () => {
    if (!newPin || !confirmPin) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    if (newPin.length !== 6) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }

    try {
      setLoading(true);
      await apiService.setupPin({ pin: newPin, pin_confirmation: confirmPin });
      Alert.alert('Success', 'PIN has been set up successfully');
      onPinToggled();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to setup PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PINs do not match');
      return;
    }

    if (newPin.length !== 6) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }

    try {
      setLoading(true);
      await apiService.changePin({ current_pin: currentPin, pin: newPin, pin_confirmation: confirmPin });
      Alert.alert('Success', 'PIN changed successfully');
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleDisablePin = async () => {
    if (!currentPin) {
      Alert.alert('Error', 'Please enter your current PIN');
      return;
    }

    Alert.alert(
      'Disable PIN',
      'Are you sure you want to disable PIN security?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiService.togglePin({ pin: currentPin, enable: false });
              Alert.alert('Success', 'PIN has been disabled');
              onPinToggled();
              onClose();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to disable PIN');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, {
        backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[scheme].cardBackground,
      }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: Colors[scheme].textPrimary }]}>PIN Security</Text>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol name="xmark" size={24} color={Colors[scheme].textSecondary} />
          </TouchableOpacity>
        </View>

        {pinEnabled && (
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'change' && styles.modeButtonActive]}
              onPress={() => setMode('change')}
            >
              <Text style={[styles.modeButtonText, { color: mode === 'change' ? Colors[scheme].tint : Colors[scheme].textSecondary }]}>
                Change PIN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'disable' && styles.modeButtonActive]}
              onPress={() => setMode('disable')}
            >
              <Text style={[styles.modeButtonText, { color: mode === 'disable' ? '#EF4444' : Colors[scheme].textSecondary }]}>
                Disable PIN
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.modalBody}>
          {mode === 'setup' && (
            <>
              <Text style={[styles.modalDescription, { color: Colors[scheme].textSecondary }]}>
                Set up a 6-digit PIN for quick access to your account
              </Text>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[scheme].textSecondary }]}>New PIN</Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[scheme].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder,
                  }]}
                  value={newPin}
                  onChangeText={setNewPin}
                  placeholder="Enter 6-digit PIN"
                  placeholderTextColor={Colors[scheme].textTertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[scheme].textSecondary }]}>Confirm PIN</Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[scheme].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder,
                  }]}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  placeholder="Confirm 6-digit PIN"
                  placeholderTextColor={Colors[scheme].textTertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                />
              </View>
            </>
          )}

          {mode === 'change' && (
            <>
              <Text style={[styles.modalDescription, { color: Colors[scheme].textSecondary }]}>
                Change your PIN security code
              </Text>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[scheme].textSecondary }]}>Current PIN</Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[scheme].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder,
                  }]}
                  value={currentPin}
                  onChangeText={setCurrentPin}
                  placeholder="Enter current PIN"
                  placeholderTextColor={Colors[scheme].textTertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[scheme].textSecondary }]}>New PIN</Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[scheme].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder,
                  }]}
                  value={newPin}
                  onChangeText={setNewPin}
                  placeholder="Enter new 6-digit PIN"
                  placeholderTextColor={Colors[scheme].textTertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[scheme].textSecondary }]}>Confirm New PIN</Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[scheme].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder,
                  }]}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  placeholder="Confirm new PIN"
                  placeholderTextColor={Colors[scheme].textTertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                />
              </View>
            </>
          )}

          {mode === 'disable' && (
            <>
              <Text style={[styles.modalDescription, { color: Colors[scheme].textSecondary }]}>
                Enter your current PIN to disable PIN security
              </Text>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[scheme].textSecondary }]}>Current PIN</Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F8F8F8',
                    color: Colors[scheme].textPrimary,
                    borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder,
                  }]}
                  value={currentPin}
                  onChangeText={setCurrentPin}
                  placeholder="Enter current PIN"
                  placeholderTextColor={Colors[scheme].textTertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                />
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[scheme].cardBorder }]}
            onPress={onClose}
          >
            <Text style={[styles.modalButtonText, { color: Colors[scheme].textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modalButton, 
              mode === 'disable' ? styles.modalButtonDanger : styles.modalButtonPrimary,
              loading && styles.buttonDisabled
            ]}
            onPress={mode === 'setup' ? handleSetupPin : mode === 'change' ? handleChangePin : handleDisablePin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                {mode === 'setup' ? 'Setup PIN' : mode === 'change' ? 'Change PIN' : 'Disable PIN'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  teacherName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  employeeId: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 13,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    fontSize: 15,
  },
  settingValue: {
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    borderWidth: 1,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.light.tint,
  },
  modalButtonDanger: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});
