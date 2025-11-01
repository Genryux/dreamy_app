// import { ConfigTest } from '@/components/ConfigTest';
import NewsCard from '@/components/dashboard/NewsCard';
import QuickStats from '@/components/dashboard/QuickStats';
import StudentInfoCard from '@/components/dashboard/StudentInfoCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDashboard } from '@/hooks/useDashboard';
import { apiService } from '@/services/api';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
  const { data, loading, error, refresh } = useDashboard();
  const [confirming, setConfirming] = useState(false);
  const colorScheme = useColorScheme();

  if (loading && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={[styles.errorContainer, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Unable to load dashboard</Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={[styles.errorContainer, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No data available</Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Please try refreshing</Text>
        </View>
      </SafeAreaView>
    );
  }


  const handleConfirmEnrollment = async () => {
    if (!data?.enrollment?.id) {
      Alert.alert('Error', 'Enrollment information not available');
      return;
    }

    setConfirming(true);
    try {
      const result = await apiService.confirmEnrollment(data.enrollment.id);
      
      if (result.success) {
        Alert.alert(
          'Success!', 
          'Your enrollment has been confirmed successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh dashboard data to show updated status
                refresh();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to confirm enrollment');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
      {/* Student Info Card */}
      <StudentInfoCard 
        student={data.student} 
        enrollment={data.enrollment}
        onConfirmEnrollment={handleConfirmEnrollment}
        confirming={confirming}
      />

      {/* Configuration Test - Remove this after testing */}
      {/* <ConfigTest /> */}

      {/* Recent Activity */}
      <QuickStats activities={data.recent_activity} />

      {/* News & Announcements Section */}
      <View style={[styles.newsSection, {
        backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder
      }]}>
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Latest Updates</Text>
        </View>
        
        {/* Announcements */}
        {data.announcements && data.announcements.length > 0 && (
          <View style={styles.subsection}>
            <View style={styles.subsectionTitleContainer}>
              <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Announcements</Text>
              <View style={[styles.countBadge, { backgroundColor: '#199BCF' }]}>
                <Text style={styles.countText}>{data.announcements.length}</Text>
              </View>
            </View>
            {data.announcements.map((announcement) => (
              <NewsCard 
                key={announcement.id} 
                item={announcement}
              />
            ))}
          </View>
        )}

        {/* News */}
        {data.news && data.news.length > 0 && (
          <View style={styles.subsection}>
            <View style={styles.subsectionTitleContainer}>
              <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>News</Text>
              <View style={[styles.countBadge, { backgroundColor: '#199BCF' }]}>
                <Text style={styles.countText}>{data.news.length}</Text>
              </View>
            </View>
            {data.news.map((newsItem) => (
              <NewsCard 
                key={newsItem.id} 
                item={newsItem}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {(!data.news || data.news.length === 0) && 
         (!data.announcements || data.announcements.length === 0) && (
          <View style={styles.emptyState}>
            <IconSymbol name="newspaper" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No updates available</Text>
            <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Check back later for news and announcements</Text>
          </View>
        )}
      </View>
      </ScrollView>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  newsSection: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
