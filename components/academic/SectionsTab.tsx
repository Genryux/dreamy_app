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
      borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      <View style={[styles.classmateAvatar, { backgroundColor: '#199BCF' }]}>
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
      {/* Section Overview */}
      <View style={[styles.sectionOverviewCard, { 
        backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>

            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Section Overview</Text>
          </View>
          <View style={[styles.sectionBadge, { backgroundColor: '#199BCF' }]}>
            <Text style={styles.sectionBadgeText}>{displaySection?.name || '-'}</Text>
          </View>
        </View>
        
        {displaySection ? (
          <View style={styles.sectionDetails}>
            <View style={[styles.detailRow, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : '#F3F4F6' }]}>
              <View style={styles.detailLabelContainer}>
                <View style={[styles.detailIconContainer, { backgroundColor: '#199BCF' }]}>
                  <IconSymbol name="graduationcap.fill" size={10} color="#FFFFFF" />
                </View>
                <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Program</Text>
              </View>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displaySection.grade_level || '-'}</Text>
            </View>
            
            <View style={[styles.detailRow, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : '#F3F4F6' }]}>
              <View style={styles.detailLabelContainer}>
                <View style={[styles.detailIconContainer, { backgroundColor: '#199BCF' }]}>
                  <IconSymbol name="calendar" size={10} color="#FFFFFF" />
                </View>
                <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Academic Term</Text>
              </View>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displaySection.academic_term || '-'}</Text>
            </View>
            
            <View style={[styles.detailRow, { borderBottomColor: 'transparent' }]}>
              <View style={styles.detailLabelContainer}>
                <View style={[styles.detailIconContainer, { backgroundColor: '#199BCF' }]}>
                  <IconSymbol name="person.2.fill" size={10} color="#FFFFFF" />
                </View>
                <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Total Students</Text>
              </View>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displaySection.total_students || 0} students</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.emptySectionInfo, {
            backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground,
            borderColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder
          }]}>
            <Text style={[styles.emptySectionText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No section information available</Text>
            <Text style={[styles.emptySectionSubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Section details will appear here once you are enrolled</Text>
          </View>
        )}
      </View>

      {/* Class Adviser */}
      <View style={[styles.adviserCard, { 
        backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <View style={styles.adviserHeader}>
          <View style={styles.adviserTitleContainer}>

            <Text style={[styles.adviserTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Class Adviser</Text>
          </View>
        </View>
        
        {displayAdviser && displayAdviser.name !== '-' ? (
          <View style={styles.adviserInfo}>
            <View style={[styles.adviserAvatar, { backgroundColor: '#199BCF' }]}>
              <Text style={styles.adviserInitial}>
                {displayAdviser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </Text>
            </View>
            
            <View style={styles.adviserDetails}>
              <Text style={[styles.adviserName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{displayAdviser.name}</Text>
              {displayAdviser.email && displayAdviser.email !== '-' && (
                <View style={[styles.adviserDetailRow, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : '#F3F4F6' }]}>
                  <View style={styles.adviserDetailLabelContainer}>
                    <View style={[styles.adviserDetailIconContainer, { backgroundColor: '#199BCF' }]}>
                      <IconSymbol name="envelope.fill" size={10} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.adviserDetailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Email</Text>
                  </View>
                  <Text style={[styles.adviserDetailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displayAdviser.email}</Text>
                </View>
              )}
              {displayAdviser.phone && displayAdviser.phone !== '-' && (
                <View style={[styles.adviserDetailRow, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : '#F3F4F6' }]}>
                  <View style={styles.adviserDetailLabelContainer}>
                    <View style={[styles.adviserDetailIconContainer, { backgroundColor: '#199BCF' }]}>
                      <IconSymbol name="phone.fill" size={10} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.adviserDetailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Phone</Text>
                  </View>
                  <Text style={[styles.adviserDetailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displayAdviser.phone}</Text>
                </View>
              )}
              {displayAdviser.office && displayAdviser.office !== '-' && (
                <View style={[styles.adviserDetailRow, { borderBottomColor: 'transparent' }]}>
                  <View style={styles.adviserDetailLabelContainer}>
                    <View style={[styles.adviserDetailIconContainer, { backgroundColor: '#199BCF' }]}>
                      <IconSymbol name="building.2.fill" size={10} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.adviserDetailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Office</Text>
                  </View>
                  <Text style={[styles.adviserDetailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{displayAdviser.office}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.emptyAdviserInfo, { 
            backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground,
            borderColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder
          }]}>
            <Text style={[styles.emptyAdviserText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No class adviser assigned</Text>
            <Text style={[styles.emptyAdviserSubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Adviser information will appear here once assigned</Text>
          </View>
        )}
      </View>

      {/* Your Classmates */}
      <View style={styles.classmatesSection}>
        <View style={styles.classmatesHeader}>
          <Text style={[styles.classmatesTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Your Classmates</Text>
          <Text style={[styles.classmatesSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{displayClassmates.length} students in your section</Text>
        </View>
        
        {displayClassmates.length > 0 ? (
          <View style={[styles.classmatesList, { 
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            {displayClassmates.map(renderClassmateItem)}
          </View>
        ) : (
          <View style={[styles.emptyClassmates, { 
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
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
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sectionBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionDetails: {
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
  adviserCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  adviserHeader: {
    marginBottom: 14,
  },
  adviserTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adviserIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  adviserTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  adviserInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  adviserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adviserInitial: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  adviserDetails: {
    flex: 1,
  },
  adviserName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    lineHeight: 20,
  },
  adviserDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    width: '100%',
  },
  adviserDetailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adviserDetailIconContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  adviserDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adviserDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'right',
  },
  classmatesSection: {
    marginBottom: 20,
  },
  classmatesHeader: {
    marginBottom: 16,
  },
  classmatesTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  classmatesSubtitle: {
    fontSize: 13,
  },
  classmatesList: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  classmateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  classmateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 18,
  },
  classmateLrn: {
    fontSize: 12,
    lineHeight: 16,
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
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  emptyClassmatesText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyClassmatesSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
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
