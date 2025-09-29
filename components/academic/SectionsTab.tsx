import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useSectionData } from '@/hooks/useAcademic';
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

interface Classmate {
  id: number;
  name: string;
  lrn: string;
}

interface Adviser {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  office?: string;
}

interface Section {
  id: number;
  name: string;
  grade_level: string;
  academic_term: string;
  total_students: number;
}

interface SectionsTabProps {
  section?: Section;
  adviser?: Adviser;
  classmates?: Classmate[];
  loading?: boolean;
}

export default function SectionsTab({ 
  section, 
  adviser, 
  classmates = [], 
  loading = false 
}: SectionsTabProps) {
  const { data: apiData, loading: apiLoading, error, refresh } = useSectionData();
  const colorScheme = useColorScheme();

  // Mock data for fallback
  const mockSection: Section = {
    id: 1,
    name: 'Section A',
    grade_level: 'Grade 10',
    academic_term: 'Academic Year 2024-2025, 1st Semester',
    total_students: 25,
  };

  const mockAdviser: Adviser = {
    id: 1,
    name: 'Dr. Maria Santos',
    email: 'maria.santos@dreamy.edu.ph',
    phone: '+63 917 123 4567',
    office: 'Room 205, Faculty Building',
  };

  const mockClassmates: Classmate[] = [
    { id: 1, name: 'John Michael Dela Cruz', lrn: '123456789012' },
    { id: 2, name: 'Sarah Jane Garcia', lrn: '123456789013' },
    { id: 3, name: 'Miguel Rodriguez', lrn: '123456789014' },
    { id: 4, name: 'Ana Marie Lopez', lrn: '123456789015' },
    { id: 5, name: 'Carlos Mendoza', lrn: '123456789016' },
    { id: 6, name: 'Isabella Torres', lrn: '123456789017' },
    { id: 7, name: 'Diego Ramos', lrn: '123456789018' },
    { id: 8, name: 'Sofia Herrera', lrn: '123456789019' },
    { id: 9, name: 'Lucas Morales', lrn: '123456789020' },
    { id: 10, name: 'Valentina Jimenez', lrn: '123456789021' },
  ];

  // Use API data if available, otherwise show empty states
  const displaySection = apiData || section;
  const displayAdviser = apiData?.adviser || adviser;
  const displayClassmates = apiData?.classmates?.length > 0 
    ? apiData.classmates 
    : classmates.length > 0 
    ? classmates 
    : []; // Empty array instead of mock data

  const isLoading = loading || apiLoading;

  const renderClassmateItem = (classmate: Classmate) => (
    <View key={classmate.id} style={[styles.classmateItem, { 
      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      <View style={styles.classmateAvatar}>
        <Text style={styles.classmateInitial}>
          {classmate.name && classmate.name !== '-' 
            ? classmate.name.split(' ').map(n => n[0]).join('').slice(0, 2)
            : '??'}
        </Text>
      </View>
      <View style={styles.classmateInfo}>
        <Text style={[styles.classmateName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{classmate.name || '-'}</Text>
        <Text style={[styles.classmateLrn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>LRN: {classmate.lrn || '-'}</Text>
      </View>
    </View>
  );

  if (isLoading && !displaySection) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading section data...</Text>
      </View>
    );
  }

  if (error && !displaySection) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Unable to load section data</Text>
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
      {/* Full Section Overview */}
      <View style={[styles.sectionOverviewCard, { 
        backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <IconSymbol name="book.fill" size={18} color="#199BCF" />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Section Overview</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{displaySection?.name || '-'}</Text>
          </View>
        </View>
        
        {displaySection ? (
          <View style={styles.sectionDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <IconSymbol name="graduationcap.fill" size={14} color="#199BCF" />
                <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Grade Level:</Text>
              </View>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displaySection.grade_level || '-'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <IconSymbol name="calendar" size={14} color="#199BCF" />
                <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Academic Term:</Text>
              </View>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displaySection.academic_term || '-'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <IconSymbol name="person.2.fill" size={14} color="#199BCF" />
                <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Total Students:</Text>
              </View>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displaySection.total_students || 0} students</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptySectionInfo}>
            <Text style={[styles.emptySectionText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No section information available</Text>
            <Text style={[styles.emptySectionSubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Section details will appear here once you are enrolled</Text>
          </View>
        )}
      </View>

      {/* Adviser Information */}
      <View style={[styles.adviserCard, { 
        backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <View style={styles.adviserHeader}>
          <View style={styles.adviserTitleContainer}>
            <IconSymbol name="person.fill" size={18} color="#199BCF" />
            <Text style={[styles.adviserTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Class Adviser</Text>
          </View>
        </View>
        
        {displayAdviser && displayAdviser.name !== '-' ? (
          <View style={styles.adviserInfo}>
            <View style={styles.adviserAvatar}>
              <Text style={styles.adviserInitial}>
                {displayAdviser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </Text>
            </View>
            
            <View style={styles.adviserDetails}>
              <Text style={[styles.adviserName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{displayAdviser.name}</Text>
              {displayAdviser.email && displayAdviser.email !== '-' && (
                <View style={styles.adviserDetailRow}>
                  <View style={styles.adviserDetailLabelContainer}>
                    <IconSymbol name="envelope.fill" size={14} color="#199BCF" />
                    <Text style={[styles.adviserDetailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Email:</Text>
                  </View>
                  <Text style={[styles.adviserDetailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displayAdviser.email}</Text>
                </View>
              )}
              {displayAdviser.phone && displayAdviser.phone !== '-' && (
                <View style={styles.adviserDetailRow}>
                  <View style={styles.adviserDetailLabelContainer}>
                    <IconSymbol name="phone.fill" size={14} color="#199BCF" />
                    <Text style={[styles.adviserDetailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Phone:</Text>
                  </View>
                  <Text style={[styles.adviserDetailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displayAdviser.phone}</Text>
                </View>
              )}
              {displayAdviser.office && displayAdviser.office !== '-' && (
                <View style={styles.adviserDetailRow}>
                  <View style={styles.adviserDetailLabelContainer}>
                    <IconSymbol name="building.2.fill" size={14} color="#199BCF" />
                    <Text style={[styles.adviserDetailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Office:</Text>
                  </View>
                  <Text style={[styles.adviserDetailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displayAdviser.office}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.emptyAdviserInfo, { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            <Text style={[styles.emptyAdviserText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No class adviser assigned</Text>
            <Text style={[styles.emptyAdviserSubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Adviser information will appear here once assigned</Text>
          </View>
        )}
      </View>

      {/* Classmates List */}
      <View style={styles.classmatesSection}>
        <View style={styles.classmatesHeader}>
          <View style={styles.classmatesTitleContainer}>
            <IconSymbol name="person.2.fill" size={20} color="#199BCF" />
            <Text style={[styles.classmatesTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Your Classmates</Text>
          </View>
          <Text style={[styles.classmatesSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{displayClassmates.length} students in your section</Text>
        </View>
        
        {displayClassmates.length > 0 ? (
          <View style={styles.classmatesList}>
            {displayClassmates.map(renderClassmateItem)}
          </View>
        ) : (
          <View style={[styles.emptyClassmates, { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            <Text style={[styles.emptyClassmatesText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No classmates found</Text>
            <Text style={[styles.emptyClassmatesSubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Classmates will appear here once they are enrolled</Text>
          </View>
        )}
      </View>

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
  sectionOverviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginLeft: 8,
  },
  sectionBadge: {
    backgroundColor: '#199BCF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sectionBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
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
  adviserCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  adviserHeader: {
    marginBottom: 16,
  },
  adviserTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adviserTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginLeft: 8,
  },
  adviserInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  adviserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#199BCF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  adviserInitial: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  adviserDetails: {
    flex: 1,
  },
  adviserName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 12,
  },
  adviserDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adviserDetailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  adviserDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  adviserDetailValue: {
    fontSize: 14,
    color: '#1A3165',
    fontWeight: '600',
    flex: 1,
  },
  classmatesSection: {
    marginBottom: 20,
  },
  classmatesHeader: {
    marginBottom: 16,
  },
  classmatesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  classmatesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3165',
    marginLeft: 8,
  },
  classmatesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  classmatesList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  classmateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  classmateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C8A165',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classmateInitial: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  classmateInfo: {
    flex: 1,
  },
  classmateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3165',
    marginBottom: 2,
  },
  classmateLrn: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
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
  emptyClassmates: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyClassmatesText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 8,
  },
  emptyClassmatesSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptySectionInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptySectionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 8,
  },
  emptySectionSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyAdviserInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyAdviserText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 8,
  },
  emptyAdviserSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
