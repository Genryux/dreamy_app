import { Colors } from '@/constants/Colors';
import { useSubjectsData } from '@/hooks/useAcademic';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type StatusFilter = 'enrolled' | 'taken';

type SubjectRecord = {
  id: number;
  subject_name: string;
  teacher_name?: string | null;
  days_of_week?: string[] | null;
  time_display?: string | null;
  room?: string | null;
  status?: string | null;
  evaluation_status?: string | null;
  remedial_status?: string | null;
  remedial_deadline?: string | null;
  academic_term?: string | null;
};

export default function SubjectsTab() {
  const { data: apiData, loading: apiLoading, error, refresh } = useSubjectsData();
  const colorScheme = useColorScheme();
  const [filter, setFilter] = useState<StatusFilter>('enrolled');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Promotion status from student's academic_status (null = Not Evaluated)
  const academicStatus = apiData?.academic_status;
  const getPromotionDisplay = () => {
    if (academicStatus === null || academicStatus === undefined) {
      return { text: 'Not Evaluated', color: Colors[colorScheme ?? 'light'].textSecondary };
    }
    const status = String(academicStatus).toLowerCase();
    if (status === 'passed' || status === 'completed') {
      return { text: `Eligible - ${academicStatus}`, color: '#22C55E' };
    }
    return { text: `Not Eligible - ${academicStatus}`, color: '#EF4444' };
  };
  const promoDisplay = getPromotionDisplay();

  const subjects: SubjectRecord[] = useMemo(() => {
    if (!apiData?.subjects) return [];
    return apiData.subjects.map((item: any, idx: number) => ({
      id: item.id ?? idx,
      subject_name: item.subject_name ?? item.name ?? 'Subject',
      teacher_name: item.teacher_name ?? item.teacher ?? null,
      days_of_week: item.days_of_week ?? null,
      time_display: item.time_display ?? item.schedule ?? null,
      room: item.room ?? null,
      status: (item.status || '').toLowerCase() || null,
      evaluation_status: item.evaluation_status ?? null,
      remedial_status: item.remedial_status ?? null,
      remedial_deadline: item.remedial_deadline ?? null,
      academic_term: item.academic_term ?? null,
    }));
  }, [apiData]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const status = (s.status || '').toLowerCase();
      if (filter === 'enrolled') {
        return status === 'enrolled' || !status;
      }
      return status === 'taken';
    });
  }, [subjects, filter]);

  const isLoading = apiLoading;



  const renderBadge = (label: string, tone: 'success' | 'error' | 'warning' | 'info') => {
    const tones = {
      success: { bg: '#DCFCE7', fg: '#15803D' },
      error: { bg: '#FEE2E2', fg: '#B91C1C' },
      warning: { bg: '#FEF3C7', fg: '#92400E' },
      info: { bg: `${Colors[colorScheme ?? 'light'].tint}1A`, fg: Colors[colorScheme ?? 'light'].tint },
    };
    const t = tones[tone];
    return (
      <View style={[styles.badge, { backgroundColor: t.bg }]}>
        <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
      </View>
    );
  };

  // Subject card matching design: subject name + eval badge on top, teacher, schedule, remedial if failed
  const renderSubjectCard = (subject: SubjectRecord) => {
    const evalStatus = (subject.evaluation_status || '').toLowerCase();
    const remedialStatus = (subject.remedial_status || '').toLowerCase();
    const isPassed = evalStatus === 'passed';
    const isFailed = evalStatus === 'failed';
    const isCleared = remedialStatus === 'cleared';

    const formatDay = (d: any) => {
      if (!d) return '';
      const s = String(d).trim().toLowerCase();
      const map: Record<string, string> = {
        monday: 'Mon',
        tuesday: 'Tue',
        wednesday: 'Wed',
        thursday: 'Thu',
        friday: 'Fri',
        saturday: 'Sat',
        sunday: 'Sun',
      };
      return map[s] ?? (s.length <= 3 ? s.toUpperCase() : s.charAt(0).toUpperCase() + s.slice(1));
    };

    const daysArrayNormalized: string[] = Array.isArray(subject.days_of_week)
      ? subject.days_of_week
      : subject.days_of_week
      ? String(subject.days_of_week).split(/,\s*/)
      : [];

    const daysText = daysArrayNormalized.length
      ? daysArrayNormalized.map(formatDay).join(', ')
      : 'Days TBA';
    const timeText = subject.time_display || 'Time TBA';

    return (
      <View
        key={`subject-${subject.id}-${filter}`}
        style={[
          styles.card,
          {
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
          },
        ]}
      >
        {/* Header: Subject name + Evaluation badge */}
        <View style={styles.cardHeader}>
          <Text style={[styles.subjectName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            {subject.subject_name}
          </Text>
          {isPassed && renderBadge('Passed ✓', 'success')}
          {isFailed && renderBadge('Failed ✕', 'error')}
          {!isPassed && !isFailed && renderBadge('Pending', 'info')}
        </View>

        {/* Teacher name */}
        <Text style={[styles.teacherName, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          {subject.teacher_name || 'Teacher TBA'}
        </Text>

        {/* Schedule: Time */}
        {/* Schedule: Days + Remedial badge if cleared */}
          {/* Schedule/time and days - only for non-taken (current/enrolled) subjects */}
          {((subject.status || '').toLowerCase() !== 'taken') && (
            <>
              <Text style={[styles.scheduleTime, { color: Colors[colorScheme ?? 'light'].textSecondary }]}> 
                {timeText}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={[styles.scheduleDays, { color: Colors[colorScheme ?? 'light'].textSecondary }]}> 
                  {daysText}
                </Text>
                <View style={{ alignItems: 'flex-end' }}>
                  {isFailed && remedialStatus && (
                    isCleared ? renderBadge('Cleared ✓', 'success') : renderBadge('Failed ✕', 'error')
                  )}
                  {isFailed && subject.remedial_deadline && (
                    <Text style={{ fontSize: 12, color: Colors[colorScheme ?? 'light'].textSecondary, marginTop: 2 }}>
                      Remedial Deadline: {new Date(subject.remedial_deadline).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            </>
          )}

          {/* For taken subjects we still show remedial status and deadline (if any), but hide schedule/day */}
          {((subject.status || '').toLowerCase() === 'taken') && isFailed && remedialStatus && (
            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                {isCleared ? renderBadge('Cleared ✓', 'success') : renderBadge('Failed ✕', 'error')}
              </View>
            </View>
          )}
      </View>
    );
  };

  if (isLoading && !subjects.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Loading subjects...
        </Text>
      </View>
    );
  }

  if (error && !subjects.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
          Unable to load subjects
        </Text>
        <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
    >
      {/* Promotion Eligibility Banner */}
      <View
        style={[
          styles.promoCard,
          {
            backgroundColor: colorScheme === 'dark' ? '#1F3A68' : `${Colors[colorScheme ?? 'light'].tint}14`,
            borderColor: colorScheme === 'dark' ? '#345589' : `${Colors[colorScheme ?? 'light'].tint}40`,
          },
        ]}
      >
        <Text style={[styles.promoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Promotion Eligibility
        </Text>
        <Text style={[styles.promoValue, { color: promoDisplay.color }]}>{promoDisplay.text}</Text>
      </View>

      {/* Dropdown Row with "Your Subjects" label */}
      <View style={styles.filterContainer}>
        <Text style={[styles.filterLabel, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Your Subjects</Text>
        <View
          style={[
            styles.dropdownWrapper,
            {
              backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setDropdownOpen((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dropdownText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              {filter === 'enrolled' ? 'Enrolled' : 'Taken'}
            </Text>
            <Text style={[styles.chevron, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {dropdownOpen ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {dropdownOpen && (
            <View
              style={[
                styles.dropdownList,
                {
                  backgroundColor: colorScheme === 'dark' ? '#24385F' : '#FFFFFF',
                  borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
                },
              ]}
            >
              {(['enrolled', 'taken'] as StatusFilter[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.dropdownItem, filter === f && styles.dropdownItemActive]}
                  onPress={() => {
                    setFilter(f);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: filter === f ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].textPrimary },
                    ]}
                  >
                    {f === 'enrolled' ? 'Enrolled' : 'Taken'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Guidance Note */}
      <View
        style={[
          styles.noteCard,
          {
            backgroundColor: colorScheme === 'dark' ? '#1E2F52' : `${Colors[colorScheme ?? 'light'].tint}0D`,
            borderColor: colorScheme === 'dark' ? '#2A3F6B' : `${Colors[colorScheme ?? 'light'].tint}26`,
          },
        ]}
      >
        <Text style={[styles.noteText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          For failed subjects, talk to your teacher for possible remedial classes.
        </Text>
      </View>

      {/* Subject Cards */}
      {filteredSubjects.length > 0 ? (
        <View style={styles.cardsList}>
          {filteredSubjects.map((subject) => renderSubjectCard(subject))}
        </View>
      ) : (
        <View
          style={[
            styles.emptyState,
            {
              backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
            },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            No {filter} subjects
          </Text>
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {filter === 'enrolled'
              ? 'You have no enrolled subjects for the current term.'
              : 'You have no taken subjects from previous terms.'}
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
    paddingTop: 16,
    paddingBottom: 120,
    gap: 14,
  },
  promoCard: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promoValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  dropdownWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 120,
    position: 'relative',
    zIndex: 10,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 10,
    marginLeft: 8,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(25, 155, 207, 0.1)',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteCard: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardsList: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 13,
    marginBottom: 2,
  },
  scheduleDays: {
    fontSize: 13,
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
