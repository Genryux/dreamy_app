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
      backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      <View style={styles.subjectHeader}>
        <View style={styles.subjectTitleContainer}>
          <View style={[styles.subjectIconContainer, { backgroundColor: '#199BCF' }]}>
            <IconSymbol name="book.fill" size={12} color="#FFFFFF" />
          </View>
          <View style={styles.subjectTitleText}>
            <Text style={[styles.subjectName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{subject.name || '-'}</Text>
            <Text style={[styles.subjectCode, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{subject.code || '-'}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.subjectDetails}>
        <View style={[styles.detailRow, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : '#F3F4F6' }]}>
          <View style={styles.detailLabelContainer}>
            <View style={[styles.detailIconContainer, { backgroundColor: '#199BCF' }]}>
              <IconSymbol name="person.fill" size={10} color="#FFFFFF" />
            </View>
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Teacher</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{subject.teacher || '-'}</Text>
        </View>
        
        <View style={[styles.detailRow, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : '#F3F4F6' }]}>
          <View style={styles.detailLabelContainer}>
            <View style={[styles.detailIconContainer, { backgroundColor: '#199BCF' }]}>
              <IconSymbol name="clock.fill" size={10} color="#FFFFFF" />
            </View>
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Schedule</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{subject.schedule || '-'}</Text>
        </View>
        
        <View style={[styles.detailRow, { borderBottomColor: 'transparent' }]}>
          <View style={styles.detailLabelContainer}>
            <View style={[styles.detailIconContainer, { backgroundColor: '#199BCF' }]}>
              <IconSymbol name="building.2.fill" size={10} color="#FFFFFF" />
            </View>
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Room</Text>
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
      {/* Current Section Info */}
      <View style={[styles.sectionInfoCard, { 
        backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <View style={styles.sectionInfoHeader}>
          <View style={styles.sectionInfoTitleContainer}>
            <View style={[styles.sectionInfoIconContainer, { backgroundColor: '#199BCF' }]}>
              <IconSymbol name="book.fill" size={14} color="#FFFFFF" />
            </View>
            <Text style={[styles.sectionInfoTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Current Section</Text>
          </View>
        </View>
        
        <View style={styles.sectionInfoContent}>
          <View style={styles.sectionInfoMain}>
            <Text style={[styles.sectionInfoText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              {sectionInfo.grade_level} - {sectionInfo.name}
            </Text>
            <Text style={[styles.sectionInfoSubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {sectionInfo.academic_term}
            </Text>
          </View>
        </View>
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
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
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
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionInfoHeader: {
    marginBottom: 12,
  },
  sectionInfoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionInfoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sectionInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionInfoContent: {
    flex: 1,
  },
  sectionInfoMain: {
    flex: 1,
  },
  sectionInfoText: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 22,
  },
  sectionInfoSubtext: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  subjectsHeader: {
    marginBottom: 16,
  },
  subjectsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subjectsSubtitle: {
    fontSize: 14,
  },
  subjectsList: {
    gap: 12,
  },
  subjectCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  subjectHeader: {
    marginBottom: 14,
  },
  subjectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  subjectTitleText: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    lineHeight: 20,
  },
  subjectCode: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
  },
  subjectDetails: {
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    width: '100%',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'right',
  },
  emptyState: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  emptyIconContainer: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
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
    textAlign: 'center',
  },
});
