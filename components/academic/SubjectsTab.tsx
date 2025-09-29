import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useSubjectsData } from '@/hooks/useAcademic';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface Subject {
  id: number;
  name: string;
  code: string;
  teacher: string;
  schedule: string;
  room: string;
}

interface SubjectsTabProps {
  subjects?: Subject[];
  loading?: boolean;
}

export default function SubjectsTab({ subjects = [], loading = false }: SubjectsTabProps) {
  const { data: apiData, loading: apiLoading, error, refresh } = useSubjectsData();
  const colorScheme = useColorScheme();

  // Mock data for fallback
  const mockSubjects: Subject[] = [
    {
      id: 1,
      name: 'Mathematics',
      code: 'MATH101',
      teacher: 'Dr. Sarah Johnson',
      schedule: 'Mon, Wed, Fri 9:00-10:00 AM',
      room: 'Room 201',
    },
    {
      id: 2,
      name: 'English Literature',
      code: 'ENG102',
      teacher: 'Prof. Michael Brown',
      schedule: 'Tue, Thu 2:00-3:30 PM',
      room: 'Room 105',
    },
    {
      id: 3,
      name: 'Science',
      code: 'SCI103',
      teacher: 'Dr. Emily Davis',
      schedule: 'Mon, Wed 11:00-12:00 PM',
      room: 'Lab 301',
    },
  ];

  // Use API data if available, otherwise fall back to props or show empty state
  const displaySubjects = apiData?.subjects?.length > 0 
    ? apiData.subjects 
    : subjects.length > 0 
    ? subjects 
    : []; // Empty array instead of mock data

  const sectionInfo = apiData?.section_info || {
    name: '-',
    grade_level: '-',
    academic_term: '-',
  };

  const isLoading = loading || apiLoading;

  const renderSubjectCard = (subject: Subject) => (
    <View key={subject.id} style={[styles.subjectCard, { 
      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      <View style={styles.subjectHeader}>
        <View style={styles.subjectTitleContainer}>
          <Text style={[styles.subjectName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{subject.name || '-'}</Text>
          <Text style={[styles.subjectCode, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{subject.code || '-'}</Text>
        </View>
      </View>
      
      <View style={styles.subjectDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <IconSymbol name="person.fill" size={14} color="#199BCF" />
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Teacher:</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{subject.teacher || '-'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <IconSymbol name="clock.fill" size={14} color="#199BCF" />
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Schedule:</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{subject.schedule || '-'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <IconSymbol name="building.2.fill" size={14} color="#199BCF" />
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Room:</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{subject.room || '-'}</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading && !displaySubjects.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading subjects...</Text>
      </View>
    );
  }

  if (error && !displaySubjects.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Unable to load subjects</Text>
        <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refresh} />
      }
    >
      {/* Subtle Section Info */}
      <View style={[styles.sectionInfoCard, { 
        backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <View style={styles.sectionInfoTitleContainer}>
          <IconSymbol name="book.fill" size={16} color="#199BCF" />
          <Text style={[styles.sectionInfoTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Current Section</Text>
        </View>
        <Text style={[styles.sectionInfoText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{sectionInfo.grade_level} - {sectionInfo.name}</Text>
        <Text style={[styles.sectionInfoSubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{sectionInfo.academic_term}</Text>
      </View>

      {/* Subjects List */}
      <View style={styles.subjectsHeader}>
        <Text style={[styles.subjectsTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Your Subjects</Text>
        <Text style={[styles.subjectsSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{displaySubjects.length} subjects enrolled</Text>
      </View>

      {displaySubjects.length > 0 ? (
        <View style={styles.subjectsList}>
          {displaySubjects.map(renderSubjectCard)}
        </View>
      ) : (
        <View style={[styles.emptyState, { 
          backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: Colors[colorScheme ?? 'light'].cardBorder 
        }]}>
          <View style={styles.emptyIconContainer}>
            <IconSymbol name="book.fill" size={48} color="#199BCF" />
          </View>
          <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No Subjects Assigned</Text>
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Subjects will appear here once they are assigned to your section.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  sectionInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionInfoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3165',
    marginLeft: 8,
  },
  sectionInfoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 2,
  },
  sectionInfoSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  subjectsHeader: {
    marginBottom: 16,
  },
  subjectsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 4,
  },
  subjectsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  subjectsList: {
    gap: 12,
  },
  subjectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subjectTitleContainer: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 4,
  },
  subjectCode: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  subjectDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A3165',
    fontWeight: '600',
    flex: 1,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingVertical: 40,
    paddingHorizontal: 20,
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
});
