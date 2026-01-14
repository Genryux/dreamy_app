import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TeachingHistoryItem, TeachingHistoryStudent, teacherApiService } from '@/services/teacherApi';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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

export default function TeacherHistoryScreen() {
  const colorScheme = useColorScheme();
  const [history, setHistory] = useState<TeachingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApiService.getTeachingHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load teaching history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalStudents = useMemo(() => {
    return history.reduce((sum, item) => sum + item.students.length, 0);
  }, [history]);

  const handleStudentPress = (student: TeachingHistoryStudent) => {
    router.push({
      pathname: '/(teacher)/history/[studentSubjectId]' as any,
      params: { studentSubjectId: student.student_subject_id.toString() },
    });
  };

  const renderStudent = (student: TeachingHistoryStudent) => {
    const isFailed = student.evaluation_status?.toLowerCase() === 'failed';
    const isCleared = student.remedial_status?.toLowerCase() === 'cleared';

    const formatStatus = (value: string | null | undefined) => {
      if (!value) return 'N/A';
      return value.charAt(0).toUpperCase() + value.slice(1);
    };

    return (
      <TouchableOpacity
        key={student.student_subject_id}
        style={[styles.studentChip, {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        }]}
        onPress={() => handleStudentPress(student)}
        activeOpacity={0.8}
      >
        <View style={styles.studentTextRow}>
          <Text style={[styles.studentName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            {student.name}
          </Text>
          <IconSymbol name="chevron.right" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
        </View>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: `${Colors[colorScheme ?? 'light'].tint}15` }]}>
            <IconSymbol name="graduationcap.fill" size={12} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].tint }]}> {formatStatus(student.evaluation_status)}</Text>
          </View>
          {student.remedial_status && (
            <View style={[styles.badge, {
              backgroundColor: isCleared ? '#E0F2FE' : isFailed ? '#FEF2F2' : `${Colors[colorScheme ?? 'light'].tint}20`,
            }]}> 
              <IconSymbol
                name={isCleared ? 'checkmark.circle.fill' : isFailed ? 'xmark.circle.fill' : 'clock.fill'}
                size={12}
                color={isCleared ? '#10B981' : isFailed ? '#EF4444' : Colors[colorScheme ?? 'light'].tint}
              />
                <Text style={[styles.badgeText, {
                  color: isCleared ? '#10B981' : isFailed ? '#EF4444' : Colors[colorScheme ?? 'light'].tint,
                }]}> {formatStatus(student.remedial_status)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = ({ item }: { item: TeachingHistoryItem }) => (
    <View style={[styles.card, {
      backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
    }]}> 
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.subjectName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{item.subject_name}</Text>
          <Text style={[styles.sectionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {item.section_name ?? 'No section'}
          </Text>
        </View>
        <View style={styles.metaPill}>
          <IconSymbol name="calendar" size={12} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {item.academic_term ?? 'Term N/A'}
          </Text>
        </View>
      </View>
      {item.students.length > 0 ? (
        <View style={styles.studentsGrid}>
          {item.students.map(renderStudent)}
        </View>
      ) : (
        <View style={styles.emptyStudents}>
          <IconSymbol name="person.crop.circle.badge.questionmark" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>No students recorded</Text>
        </View>
      )}
    </View>
  );

  if (loading && history.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && history.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Unable to load history</Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Teaching History</Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Subjects and students you've handled</Text>
        </View>
      </View>

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(_, index) => `history-${index}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchHistory}
            tintColor={Colors[colorScheme ?? 'light'].tint}
            colors={[Colors[colorScheme ?? 'light'].tint]}
          />
        }
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyState}>
            <IconSymbol name="clock.fill" size={32} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No history yet</Text>
            <Text style={[styles.emptySubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Handled students will appear here</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countText: {
    fontWeight: '700',
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionText: {
    fontSize: 13,
    marginTop: 2,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#00000008',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 6,
  },
  studentsGrid: {
    gap: 8,
  },
  studentChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  studentTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyStudents: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  emptyText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: '#199BCF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
