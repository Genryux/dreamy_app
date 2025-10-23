import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDashboard } from '@/hooks/useDashboard';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper functions for student status display
const getStatusDisplayText = (status: string | undefined): string => {
  if (!status || status === 'unknown') return 'Unknown';
  
  // Normalize the status by converting to lowercase and replacing spaces with underscores
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  
  switch (normalizedStatus) {
    case 'officially_enrolled':
      return 'Officially Enrolled';
    case 'graduated':
      return 'Graduated';
    case 'dropped':
      return 'Dropped';
    case 'transferred':
      return 'Transferred';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  }
};

const getStatusIcon = (status: string | undefined): string => {
  if (!status || status === 'unknown') return 'questionmark.circle';
  
  // Normalize the status by converting to lowercase and replacing spaces with underscores
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  
  switch (normalizedStatus) {
    case 'officially_enrolled':
      return 'checkmark.circle.fill';
    case 'graduated':
      return 'graduationcap.fill';
    case 'dropped':
      return 'xmark';
    case 'transferred':
      return 'chevron.right';
    default:
      return 'questionmark.circle';
  }
};

const getStatusBadgeColor = (status: string | undefined, colorScheme: string | null) => {
  if (!status || status === 'unknown') {
    return {
      background: colorScheme === 'dark' ? '#374151' : '#F3F4F6',
      border: '#9CA3AF',
      color: '#6B7280'
    };
  }
  
  // Normalize the status by converting to lowercase and replacing spaces with underscores
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  
  switch (normalizedStatus) {
    case 'officially_enrolled':
      return {
        background: colorScheme === 'dark' ? '#064E3B' : '#F0FDF4',
        border: '#10B981',
        color: '#10B981'
      };
    case 'graduated':
      return {
        background: colorScheme === 'dark' ? '#1E3A8A' : '#EFF6FF',
        border: '#3B82F6',
        color: '#3B82F6'
      };
    case 'dropped':
      return {
        background: colorScheme === 'dark' ? '#7F1D1D' : '#FEF2F2',
        border: '#EF4444',
        color: '#EF4444'
      };
    case 'transferred':
      return {
        background: colorScheme === 'dark' ? '#7C2D12' : '#FEF3C7',
        border: '#F59E0B',
        color: '#F59E0B'
      };
    default:
      return {
        background: colorScheme === 'dark' ? '#374151' : '#F3F4F6',
        border: '#9CA3AF',
        color: '#6B7280'
      };
  }
};

const getStatusAvatarColor = (status: string | undefined) => {
  if (!status || status === 'unknown') {
    return '#9CA3AF'; // Gray for unknown status
  }
  
  // Normalize the status by converting to lowercase and replacing spaces with underscores
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  
  switch (normalizedStatus) {
    case 'officially_enrolled':
      return '#10B981'; // Green for enrolled
    case 'graduated':
      return '#3B82F6'; // Blue for graduated
    case 'dropped':
      return '#EF4444'; // Red for dropped
    case 'transferred':
      return '#F59E0B'; // Orange for transferred
    default:
      return '#9CA3AF'; // Gray for unknown
  }
};

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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
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

  // Debug logging
  console.log('Profile Debug - Student:', displayStudent);
  console.log('Profile Debug - Student Status:', displayStudent?.status);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }}>
        {/* Header */}
        <View style={[styles.header, { alignItems: 'center' }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Profile</Text>
            <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Manage your personal information</Text>
          </View>
          <TouchableOpacity 
            style={[styles.logoutButton, {
              backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6',
              borderColor: Colors[colorScheme ?? 'light'].cardBorder
            }]} 
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.logoutText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header - Redesigned */}
          <View style={[styles.profileHeader, { 
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            {/* Top Section with Avatar and Basic Info */}
            <View style={styles.profileTopSection}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { 
                  backgroundColor: '#199BCF',
                  borderColor: Colors[colorScheme ?? 'light'].cardBorder 
                }]}>
                  <Text style={styles.avatarText}>
                    {displayStudent?.name ? 
                      displayStudent.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2) :
                      'ST'
                    }
                  </Text>
                </View>
                <View style={[styles.statusIndicator, {
                  backgroundColor: getStatusAvatarColor(displayStudent?.status),
                  borderColor: Colors[colorScheme ?? 'light'].cardBackground
                }]} />
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={[styles.studentName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                  {displayStudent?.name || 'Student Name'}
                </Text>
                <Text style={[styles.studentLRN, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  LRN: {displayStudent?.lrn || 'Not assigned'}
                </Text>
                <View style={styles.enrollmentStatus}>
                  <View style={[styles.statusBadge, {
                    backgroundColor: getStatusBadgeColor(displayStudent?.status || 'officially_enrolled', colorScheme).background,
                    borderColor: getStatusBadgeColor(displayStudent?.status || 'officially_enrolled', colorScheme).border
                  }]}>
                    <IconSymbol 
                      name={getStatusIcon(displayStudent?.status || 'officially_enrolled')} 
                      size={12} 
                      color={getStatusBadgeColor(displayStudent?.status || 'officially_enrolled', colorScheme).color} 
                    />
                    <Text style={[styles.statusText, {
                      color: getStatusBadgeColor(displayStudent?.status || 'officially_enrolled', colorScheme).color
                    }]}>
                      {getStatusDisplayText(displayStudent?.status || 'officially_enrolled')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Academic Term Info */}
            {displayEnrollment?.term && (
              <View style={[styles.termInfo, { 
                backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground,
                borderColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder 
              }]}>
                <View style={styles.termInfoLeft}>
                  <IconSymbol name="calendar" size={12} color={Colors[colorScheme ?? 'light'].textSecondary} />
                  <Text style={[styles.termLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Current Term</Text>
                </View>
                <Text style={[styles.termValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                  {displayEnrollment.term}
                </Text>
              </View>
            )}

          </View>

          {/* Action Cards */}
          <View style={styles.actionCardsContainer}>
            {/* Personal Information Card */}
            <TouchableOpacity style={[styles.actionCard, { 
              backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
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
              backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
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
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#199BCF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    minWidth: 120,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  logoutButtonError: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 120,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  profileHeader: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  profileTopSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  studentName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  studentLRN: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  enrollmentStatus: {
    alignSelf: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  termInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  termInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  termLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  termValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionCardsContainer: {
    gap: 4,
  },
  actionCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actionCardIconText: {
    fontSize: 18,
  },
  actionCardText: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  actionCardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  actionCardRight: {
    marginLeft: 8,
  },
  actionCardArrow: {
    fontSize: 18,
    fontWeight: '300',
  },
});
