import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { teacherApiService } from '@/services/teacherApi';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ClassInfo {
  id: number;
  subject_name: string;
  section_name: string;
  program: string;
  year_level: string;
  room: string;
  days_of_week: string[];
  time_display: string;
}

interface StudentItem {
  id: number;
  student_subject_id: number;
  lrn: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  grade_level: string;
  program: string;
  evaluation_status: string;
  contact_number: string | null;
}

interface SectionData {
  class_info: ClassInfo;
  students_count: number;
  students: StudentItem[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
  };
}

export default function ClassStudentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await teacherApiService.getSectionStudents(Number(id));
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load class data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reset state when navigating away
  useFocusEffect(
    useCallback(() => {
      // Reset state when screen comes into focus
      setData(null);
      setLoading(true);
      setError(null);
      
      if (id) {
        fetchData();
      }

      // Cleanup when navigating away
      return () => {
        setData(null);
      };
    }, [id])
  );

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleStudentPress = (student: StudentItem) => {
    router.push({
      pathname: '/(teacher)/class/[id]/student/[studentId]' as any,
      params: { 
        id: id,
        studentId: student.id.toString(),
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return 'Passed';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const renderStudent = ({ item }: { item: StudentItem }) => (
    <TouchableOpacity
      style={[
        styles.studentCard,
        {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        },
      ]}
      onPress={() => handleStudentPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.studentAvatar}>
        <Text style={styles.avatarText}>
          {item.first_name?.charAt(0) || ''}{item.last_name?.charAt(0) || ''}
        </Text>
      </View>
      
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
          {item.name}
        </Text>
        <Text style={[styles.studentLrn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          LRN: {item.lrn}
        </Text>
      </View>
      
      <View style={styles.studentMeta}>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.evaluation_status)}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.evaluation_status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.evaluation_status) }]}>
            {getStatusText(item.evaluation_status)}
          </Text>
        </View>
        <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme ?? 'light'].textTertiary} />
      </View>
    </TouchableOpacity>
  );

  if (loading && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading class...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={Colors[colorScheme ?? 'light'].textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            Unable to load class
          </Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchData()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme ?? 'light'].textPrimary} style={{ transform: [{ rotate: '180deg' }] }} />
          <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Back</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data?.students || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStudent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors[colorScheme ?? 'light'].tint} />
        }
        ListHeaderComponent={() => (
          <>
            {/* Class Info Card */}
            <View style={[styles.classInfoCard, {
              backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
            }]}>
              <View style={styles.classHeader}>
                <View style={styles.subjectBadge}>
                  <IconSymbol name="book.fill" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.classHeaderText}>
                  <Text style={[styles.subjectName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                    {data?.class_info.subject_name}
                  </Text>
                  <Text style={[styles.sectionName, { color: Colors[colorScheme ?? 'light'].tint }]}>
                    {data?.class_info.section_name}
                  </Text>
                </View>
              </View>

              <View style={styles.classDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <IconSymbol name="graduationcap.fill" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Program</Text>
                    <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                      {data?.class_info.program || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="building.2.fill" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Room</Text>
                    <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                      {data?.class_info.room || 'TBA'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <IconSymbol name="calendar" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Schedule</Text>
                    <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                      {data?.class_info.days_of_week?.join(', ') || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="clock.fill" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Time</Text>
                    <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                      {data?.class_info.time_display || 'TBA'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Summary Stats */}
            {data?.summary && (
              <View style={[styles.summaryCard, {
                backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
              }]}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                    {data.summary.total}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Total</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: '#10B981' }]}>{data.summary.passed}</Text>
                  <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Passed</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{data.summary.failed}</Text>
                  <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Failed</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{data.summary.pending}</Text>
                  <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Pending</Text>
                </View>
              </View>
            )}

            {/* Students Header */}
            <View style={styles.studentsHeader}>
              <Text style={[styles.studentsTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                Students
              </Text>
              <Text style={[styles.studentsCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {data?.students_count || 0} enrolled
              </Text>
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          <View style={[styles.emptyState, {
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3D3D5C' : Colors[colorScheme ?? 'light'].cardBorder,
          }]}>
            <IconSymbol name="person.2.fill" size={48} color={Colors[colorScheme ?? 'light'].textTertiary} />
            <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              No Students
            </Text>
            <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              No students are enrolled in this class yet.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    backgroundColor: '#199BCF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  classInfoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#199BCF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classHeaderText: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  classDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#3A4F7B',
    marginHorizontal: 8,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  studentsCount: {
    fontSize: 14,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#199BCF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
  },
  studentLrn: {
    fontSize: 12,
    marginTop: 2,
  },
  studentMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});
