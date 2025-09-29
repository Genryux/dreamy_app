import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDashboard } from '@/hooks/useDashboard';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { data: dashboardData, loading, error, refresh } = useDashboard();
  const colorScheme = useColorScheme();

  const handlePersonalInfoPress = () => {
    router.push('/profile/personal-info');
  };

  const handleAccountSettingsPress = () => {
    router.push('/profile/account-settings');
  };

  const handleRetry = () => {
    refresh();
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
          onPress: async () => {
            try {
              await apiService.logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              // Even if logout fails, clear local token and redirect
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <IconSymbol name="exclamationmark.triangle" size={48} color="#EF4444" />
          </View>
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Unable to Load Profile</Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {error.includes('Server error') 
              ? 'There seems to be a connection issue. Please check your internet connection and try again.'
              : error
            }
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButtonError} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const student = dashboardData?.student;
  const enrollment = dashboardData?.enrollment;

  // Fallback data when API is not available
  const fallbackStudent = {
    name: 'Student User',
    lrn: 'Not Available',
  };
  const fallbackEnrollment = {
    status: 'unknown',
  };

  const displayStudent = student || fallbackStudent;
  const displayEnrollment = enrollment || fallbackEnrollment;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Profile</Text>
            <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Manage your personal information</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol name="arrow.right.square" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={[styles.profileHeader, { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
          {/* Avatar Placeholder */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayStudent?.name ? 
                  displayStudent.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2) :
                  'ST'
                }
              </Text>
            </View>
          </View>

          {/* Student Information */}
          <View style={styles.studentInfo}>
            <Text style={[styles.studentName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              {displayStudent?.name || 'Student Name'}
            </Text>
            <Text style={[styles.studentLRN, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              LRN: {displayStudent?.lrn || 'Not assigned'}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                displayEnrollment?.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
              ]}>
                <Text style={[
                  styles.statusText,
                  displayEnrollment?.status === 'confirmed' ? styles.statusTextConfirmed : styles.statusTextPending
                ]}>
                  {displayEnrollment?.status === 'confirmed' ? '✓ Enrolled' : '⏳ Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>

          {/* Action Cards */}
          <View style={styles.actionCardsContainer}>
            {/* Personal Information Card */}
            <TouchableOpacity style={[styles.actionCard, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].cardBorder 
            }]} onPress={handlePersonalInfoPress}>
              <View style={styles.actionCardContent}>
                <View style={styles.actionCardLeft}>
                  <View style={styles.actionCardIcon}>
                    <IconSymbol name="person" size={20} color="#199BCF" />
                  </View>
                  <View style={styles.actionCardText}>
                    <Text style={[styles.actionCardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Personal Information</Text>
                    <Text style={[styles.actionCardSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>View and edit your personal details</Text>
                  </View>
                </View>
                <View style={styles.actionCardRight}>
                  <Text style={[styles.actionCardArrow, { color: Colors[colorScheme ?? 'light'].textTertiary }]}>›</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Account Settings Card */}
            <TouchableOpacity style={[styles.actionCard, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].cardBorder 
            }]} onPress={handleAccountSettingsPress}>
              <View style={styles.actionCardContent}>
                <View style={styles.actionCardLeft}>
                  <View style={styles.actionCardIcon}>
                    <IconSymbol name="gearshape" size={20} color="#199BCF" />
                  </View>
                  <View style={styles.actionCardText}>
                    <Text style={[styles.actionCardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Account Settings</Text>
                    <Text style={[styles.actionCardSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Security & preferences</Text>
                  </View>
                </View>
                <View style={styles.actionCardRight}>
                  <Text style={[styles.actionCardArrow, { color: Colors[colorScheme ?? 'light'].textTertiary }]}>›</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Academic Summary Card */}
            <TouchableOpacity style={[styles.actionCard, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].cardBorder 
            }]}>
              <View style={styles.actionCardContent}>
                <View style={styles.actionCardLeft}>
                  <View style={styles.actionCardIcon}>
                    <IconSymbol name="chart.bar" size={20} color="#199BCF" />
                  </View>
                  <View style={styles.actionCardText}>
                    <Text style={[styles.actionCardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Academic Summary</Text>
                    <Text style={[styles.actionCardSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Your academic overview</Text>
                  </View>
                </View>
                <View style={styles.actionCardRight}>
                  <Text style={[styles.actionCardArrow, { color: Colors[colorScheme ?? 'light'].textTertiary }]}>›</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Documents Card */}
            <TouchableOpacity style={[styles.actionCard, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].cardBorder 
            }]}>
              <View style={styles.actionCardContent}>
                <View style={styles.actionCardLeft}>
                  <View style={styles.actionCardIcon}>
                    <IconSymbol name="doc.text" size={20} color="#199BCF" />
                  </View>
                  <View style={styles.actionCardText}>
                    <Text style={[styles.actionCardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Documents</Text>
                    <Text style={[styles.actionCardSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>View and request documents</Text>
                  </View>
                </View>
                <View style={styles.actionCardRight}>
                  <Text style={[styles.actionCardArrow, { color: Colors[colorScheme ?? 'light'].textTertiary }]}>›</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Help & Support Card */}
            <TouchableOpacity style={[styles.actionCard, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].cardBorder 
            }]}>
              <View style={styles.actionCardContent}>
                <View style={styles.actionCardLeft}>
                  <View style={styles.actionCardIcon}>
                    <IconSymbol name="questionmark.circle" size={20} color="#199BCF" />
                  </View>
                  <View style={styles.actionCardText}>
                    <Text style={[styles.actionCardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Help & Support</Text>
                    <Text style={[styles.actionCardSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Get help and support</Text>
                  </View>
                </View>
                <View style={styles.actionCardRight}>
                  <Text style={[styles.actionCardArrow, { color: Colors[colorScheme ?? 'light'].textTertiary }]}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for floating tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#199BCF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minWidth: 140,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButtonError: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 140,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#199BCF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  studentInfo: {
    alignItems: 'center',
  },
  studentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 8,
    textAlign: 'center',
  },
  studentLRN: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 16,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusConfirmed: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextConfirmed: {
    color: '#166534',
  },
  statusTextPending: {
    color: '#D97706',
  },
  actionCardsContainer: {
    gap: 4,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 4,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionCardIconText: {
    fontSize: 20,
  },
  actionCardText: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3165',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  actionCardRight: {
    marginLeft: 8,
  },
  actionCardArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
});
