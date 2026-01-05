import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ScheduleItem, teacherApiService, TeacherDashboardData } from '@/services/teacherApi';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeacherDashboard() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'today' | 'all'>('today');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [allClasses, setAllClasses] = useState<ScheduleItem[]>([]);
  const colorScheme = useColorScheme();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teacherApiService.getDashboard();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClasses = async () => {
    try {
      const response = await teacherApiService.getMyClasses();
      setAllClasses(response.all_classes);
    } catch (err: any) {
      console.error('Failed to load all classes:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchAllClasses();
  }, []);

  const parseTime = (timeStr: string | null): number => {
    if (!timeStr) return -1;
    // Parse "8:00 AM" or "1:30 PM" format
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return -1;
    
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  const isCurrentClass = (item: ScheduleItem) => {
    if (!item.start_time || !item.end_time) return false;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = parseTime(item.start_time);
    const endMinutes = parseTime(item.end_time);
    
    if (startMinutes === -1 || endMinutes === -1) return false;
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const handleClassPress = (item: ScheduleItem) => {
    router.push({
      pathname: '/(teacher)/class/[id]' as any,
      params: { id: item.id.toString() },
    });
  };

  const handleProfilePress = () => {
    router.push('/(teacher)/profile');
  };

  // Parse date for display
  const parseDate = () => {
    if (!data?.current_date) return { month: '', day: '', dayName: '' };
    
    // Format: "Monday, January 6, 2026"
    const parts = data.current_date.split(', ');
    const dayName = parts[0];
    const dateStr = parts.slice(1).join(', ');
    const dateParts = dateStr.split(' ');
    const month = dateParts[0];
    const day = dateParts[1]?.replace(',', '');
    
    return { month, day, dayName };
  };

  const { month, day, dayName } = parseDate();

  const displaySchedule = filter === 'today' ? data?.today_schedule : allClasses;

  const handleFilterChange = (newFilter: 'today' | 'all') => {
    setFilter(newFilter);
    setShowFilterMenu(false);
  };

  if (loading && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading schedule...
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
            Unable to load schedule
          </Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboard}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchDashboard} tintColor={Colors[colorScheme ?? 'light'].tint} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.todaySelector}
            onPress={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Text style={[styles.todayText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              {filter === 'today' ? 'Today' : 'All Classes'}
            </Text>
            <IconSymbol name="chevron.right" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} style={{ transform: [{ rotate: showFilterMenu ? '-90deg' : '90deg' }] }} />
          </TouchableOpacity>
          
          {showFilterMenu && (
            <View style={[styles.filterMenu, {
              backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
            }]}>
              <TouchableOpacity 
                style={[styles.filterOption, filter === 'today' && styles.filterOptionActive]}
                onPress={() => handleFilterChange('today')}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: filter === 'today' ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].textPrimary }
                ]}>
                  Today
                </Text>
                {filter === 'today' && (
                  <IconSymbol name="checkmark" size={16} color={Colors[colorScheme ?? 'light'].tint} />
                )}
              </TouchableOpacity>
              <View style={[styles.filterDivider, { backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder }]} />
              <TouchableOpacity 
                style={[styles.filterOption, filter === 'all' && styles.filterOptionActive]}
                onPress={() => handleFilterChange('all')}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: filter === 'all' ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].textPrimary }
                ]}>
                  All Classes
                </Text>
                {filter === 'all' && (
                  <IconSymbol name="checkmark" size={16} color={Colors[colorScheme ?? 'light'].tint} />
                )}
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
            <View style={[styles.avatarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
              <IconSymbol name="person.fill" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Date Display */}
        <View style={styles.dateSection}>
          <Text style={[styles.dateSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {filter === 'today' ? 'Your schedules today' : 'All your classes'}
          </Text>
          <Text style={[styles.dateTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            {month} {day} <Text style={styles.dateDivider}>|</Text> <Text style={styles.dayName}>{dayName}</Text>
          </Text>
        </View>

        {/* Schedule List */}
        <View style={styles.scheduleList}>
          {displaySchedule && displaySchedule.length > 0 ? (
            displaySchedule.map((item: ScheduleItem, index: number) => {
              const isCurrent = filter === 'today' && isCurrentClass(item);
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.scheduleCard,
                    {
                      backgroundColor: colorScheme === 'dark' 
                        ? (isCurrent ? '#3A4F7B' : '#2A3F6B')
                        : (isCurrent ? '#E0F2FE' : Colors[colorScheme ?? 'light'].cardBackground),
                      borderColor: isCurrent ? Colors[colorScheme ?? 'light'].tint : (colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder),
                      borderWidth: isCurrent ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleClassPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardContent}>
                    <Text style={[
                      styles.subjectName,
                      { color: Colors[colorScheme ?? 'light'].textPrimary }
                    ]}>
                      {item.subject_name}
                    </Text>
                    <Text style={[
                      styles.sectionName,
                      { color: Colors[colorScheme ?? 'light'].textSecondary }
                    ]}>
                      {item.section_name}
                    </Text>
                    <Text style={[
                      styles.timeText,
                      { color: Colors[colorScheme ?? 'light'].textTertiary }
                    ]}>
                      {item.time_display}
                    </Text>
                  </View>
                  
                  <View style={styles.cardMeta}>
                    <View style={[styles.studentsBadge, { backgroundColor: `${Colors[colorScheme ?? 'light'].tint}15` }]}>
                      <IconSymbol name="person.2.fill" size={12} color={Colors[colorScheme ?? 'light'].tint} />
                      <Text style={[styles.studentsCount, { color: Colors[colorScheme ?? 'light'].tint }]}>{item.students_count}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme ?? 'light'].textTertiary} />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={[styles.emptyState, {
              backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
            }]}>
              <IconSymbol name="calendar" size={48} color={Colors[colorScheme ?? 'light'].textTertiary} />
              <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                {filter === 'today' ? 'No Classes Today' : 'No Classes'}
              </Text>
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {filter === 'today' ? 'Enjoy your free day!' : 'No classes assigned yet'}
              </Text>
            </View>
          )}
        </View>

        {/* Statistics Summary */}
        {data?.statistics && (
          <View style={[styles.statsContainer, {
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
          }]}>
            <Text style={[styles.statsTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              This Semester
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{data.statistics.total_subjects}</Text>
                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Subjects</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>{data.statistics.total_sections}</Text>
                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Sections</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>{data.statistics.total_students}</Text>
                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Students</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  todaySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  todayText: {
    fontSize: 18,
    fontWeight: '600',
  },
  filterMenu: {
    position: 'absolute',
    top: 35,
    left: 0,
    minWidth: 150,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterOptionActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  filterOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  filterDivider: {
    height: 1,
    marginVertical: 4,
  },
  profileButton: {
    padding: 4,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  dateSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  dateDivider: {
    fontWeight: '300',
    opacity: 0.5,
  },
  dayName: {
    fontWeight: '400',
  },
  scheduleList: {
    gap: 12,
  },
  scheduleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  cardContent: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionName: {
    fontSize: 14,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
  },
  cardMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  studentsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  studentsCount: {
    fontSize: 12,
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
  },
  statsContainer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
