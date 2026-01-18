import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { teacherApiService } from '@/services/teacherApi';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StudentData {
  student: {
    id: number;
    student_subject_id: number;
    lrn: string;
    name: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    email: string;
    gender: string;
    birthdate: string | null;
    age: number | null;
    contact_number: string | null;
    current_address: string | null;
    grade_level: string;
    program: string;
    section: string;
    status: string;
  };
  enrollment: {
    evaluation_status: string;
    subject_name: string;
  };
  guardian_info: {
    father_name: string | null;
    father_contact: string | null;
    mother_name: string | null;
    mother_contact: string | null;
    guardian_name: string | null;
    guardian_contact: string | null;
  };
}

export default function StudentDetailScreen() {
  const { id, studentId } = useLocalSearchParams<{ id: string; studentId: string }>();
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const colorScheme = useColorScheme();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teacherApiService.getStudentDetails(Number(id), Number(studentId));
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  // Reset state when navigating away
  useFocusEffect(
    useCallback(() => {
      // Reset state when screen comes into focus
      setData(null);
      setLoading(true);
      setError(null);
      
      if (id && studentId) {
        fetchData();
      }

      // Handle hardware back button on Android
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        router.push(`/(teacher)/class/${id}` as any);
        return true; // Prevent default behavior
      });

      // Cleanup when navigating away
      return () => {
        setData(null);
        backHandler.remove();
      };
    }, [id, studentId])
  );

  const handleEvaluate = (status: 'passed' | 'failed') => {
    const statusText = status === 'passed' ? 'PASSED' : 'FAILED';
    
    Alert.alert(
      '⚠️ Confirm Evaluation',
      `You are about to mark ${data?.student.name} as ${statusText} for ${data?.enrollment.subject_name}.\n\n` +
      '⚠️ This action is only recommended before the end of the semester. Please exercise caution.\n\n' +
      '🚫 This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: `Mark as ${statusText}`,
          style: status === 'failed' ? 'destructive' : 'default',
          onPress: () => confirmEvaluation(status),
        },
      ]
    );
  };

  const confirmEvaluation = async (status: 'passed' | 'failed') => {
    try {
      setEvaluating(true);
      await teacherApiService.evaluateStudent(Number(id), Number(studentId), status);
      
      // Update local state
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          enrollment: {
            ...prev.enrollment,
            evaluation_status: status,
          },
        };
      });

      Alert.alert(
        'Success',
        `${data?.student.name} has been marked as ${status.toUpperCase()}.`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to evaluate student');
    } finally {
      setEvaluating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return 'Passed';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending Evaluation';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading student...
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/(teacher)/class/${id}` as any)}>
            <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme ?? 'light'].textPrimary} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            Unable to load student
          </Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isAlreadyEvaluated = data?.enrollment.evaluation_status === 'passed' || 
                              data?.enrollment.evaluation_status === 'failed';
  const isTermClosing = data?.term?.status === 'Closing';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/(teacher)/class/${id}` as any)}>
          <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme ?? 'light'].textPrimary} style={{ transform: [{ rotate: '180deg' }] }} />
          <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Student Profile Card */}
        <View style={[styles.profileCard, {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        }]}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {data?.student.first_name?.charAt(0) || ''}{data?.student.last_name?.charAt(0) || ''}
            </Text>
          </View>
          
          <Text style={[styles.studentNameLarge, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            {data?.student.name}
          </Text>
          
          <Text style={[styles.lrnText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            LRN: {data?.student.lrn}
          </Text>

          <View style={[styles.statusBadgeLarge, { backgroundColor: `${getStatusColor(data?.enrollment.evaluation_status || '')}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(data?.enrollment.evaluation_status || '') }]} />
            <Text style={[styles.statusTextLarge, { color: getStatusColor(data?.enrollment.evaluation_status || '') }]}>
              {getStatusText(data?.enrollment.evaluation_status || '')}
            </Text>
          </View>

          {data?.enrollment.evaluation_status === 'failed' && (
            <View style={[styles.remedialBadge, { backgroundColor: '#FEE2E2' }]}> 
              <IconSymbol name="exclamationmark.circle.fill" size={14} color="#B91C1C" />
              <Text style={[styles.remedialText, { color: '#B91C1C' }]}>
                {data?.enrollment.remedial_status ? data.enrollment.remedial_status.toUpperCase() : 'FAILED'}
              </Text>
            </View>
          )}

          <Text style={[styles.subjectLabel, { color: Colors[colorScheme ?? 'light'].textTertiary }]}>
            Subject: {data?.enrollment.subject_name}
          </Text>
        </View>

        {/* Basic Information */}
        <View style={[styles.infoCard, {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            <IconSymbol name="person.fill" size={16} color={Colors[colorScheme ?? 'light'].tint} /> Basic Information
          </Text>
          
          <View style={styles.infoGrid}>
            <InfoRow label="Gender" value={data?.student.gender || 'N/A'} colorScheme={colorScheme} />
            <InfoRow label="Age" value={data?.student.age?.toString() || 'N/A'} colorScheme={colorScheme} />
            <InfoRow label="Birthdate" value={formatDate(data?.student.birthdate || null)} colorScheme={colorScheme} />
            <InfoRow label="Grade Level" value={data?.student.grade_level || 'N/A'} colorScheme={colorScheme} />
            <InfoRow label="Program" value={data?.student.program || 'N/A'} colorScheme={colorScheme} />
            <InfoRow label="Section" value={data?.student.section || 'N/A'} colorScheme={colorScheme} />
          </View>
        </View>

        {/* Contact Information */}
        <View style={[styles.infoCard, {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            <IconSymbol name="phone.fill" size={16} color={Colors[colorScheme ?? 'light'].tint} /> Contact Information
          </Text>
          
          <View style={styles.infoGrid}>
            <InfoRow label="Email" value={data?.student.email || 'N/A'} colorScheme={colorScheme} />
            <InfoRow label="Contact Number" value={data?.student.contact_number || 'N/A'} colorScheme={colorScheme} />
            <InfoRow label="Address" value={data?.student.current_address || 'N/A'} colorScheme={colorScheme} />
          </View>
        </View>

        {/* Guardian Information */}
        {data?.guardian_info && (
          <View style={[styles.infoCard, {
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
          }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              <IconSymbol name="person.2.fill" size={16} color={Colors[colorScheme ?? 'light'].tint} /> Guardian Information
            </Text>
            
            <View style={styles.infoGrid}>
              {data.guardian_info.father_name && (
                <>
                  <InfoRow label="Father" value={data.guardian_info.father_name} colorScheme={colorScheme} />
                  <InfoRow label="Father's Contact" value={data.guardian_info.father_contact || 'N/A'} colorScheme={colorScheme} />
                </>
              )}
              {data.guardian_info.mother_name && (
                <>
                  <InfoRow label="Mother" value={data.guardian_info.mother_name} colorScheme={colorScheme} />
                  <InfoRow label="Mother's Contact" value={data.guardian_info.mother_contact || 'N/A'} colorScheme={colorScheme} />
                </>
              )}
              {data.guardian_info.guardian_name && (
                <>
                  <InfoRow label="Guardian" value={data.guardian_info.guardian_name} colorScheme={colorScheme} />
                  <InfoRow label="Guardian's Contact" value={data.guardian_info.guardian_contact || 'N/A'} colorScheme={colorScheme} />
                </>
              )}
            </View>
          </View>
        )}

        {/* Evaluation Buttons */}
        <View style={[styles.evaluationCard, {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
            <IconSymbol name="checkmark.circle.fill" size={16} color={Colors[colorScheme ?? 'light'].tint} /> Evaluation
          </Text>

          {isAlreadyEvaluated ? (
            <View style={styles.alreadyEvaluated}>
              <IconSymbol 
                name={data?.enrollment.evaluation_status === 'passed' ? 'checkmark.circle.fill' : 'xmark'} 
                size={32} 
                color={getStatusColor(data?.enrollment.evaluation_status || '')} 
              />
              <Text style={[styles.alreadyEvaluatedText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                This student has already been evaluated as{' '}
                <Text style={{ color: getStatusColor(data?.enrollment.evaluation_status || ''), fontWeight: '700' }}>
                  {data?.enrollment.evaluation_status?.toUpperCase()}
                </Text>
              </Text>
            </View>
          ) : isTermClosing ? (
            <>
              <View style={styles.warningBox}>
                <IconSymbol name="exclamationmark.triangle" size={20} color="#F59E0B" />
                <Text style={[styles.warningText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  This action is only recommended before the end of the semester. Please exercise caution.
                </Text>
              </View>

              <View style={styles.evaluationButtons}>
                <TouchableOpacity
                  style={[styles.passButton, evaluating && styles.buttonDisabled]}
                  onPress={() => handleEvaluate('passed')}
                  disabled={evaluating}
                >
                  {evaluating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Mark as PASSED</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.failButton, evaluating && styles.buttonDisabled]}
                  onPress={() => handleEvaluate('failed')}
                  disabled={evaluating}
                >
                  {evaluating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <IconSymbol name="xmark" size={20} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Mark as FAILED</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.warningBox}>
              <IconSymbol name="exclamationmark.triangle" size={20} color="#F59E0B" />
              <Text style={[styles.warningText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Evaluation is currently not allowed. It will be available once the current academic term is set to Closing.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper component for info rows
function InfoRow({ label, value, colorScheme }: { label: string; value: string; colorScheme: 'light' | 'dark' | null | undefined }) {
  const scheme = colorScheme ?? 'light';
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: Colors[scheme].textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: Colors[scheme].textPrimary }]}>{value}</Text>
    </View>
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
    padding: 16,
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
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#199BCF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  studentNameLarge: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  lrnText: {
    fontSize: 14,
    marginTop: 4,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
  },
  subjectLabel: {
    fontSize: 12,
    marginTop: 12,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  remedialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  remedialText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 13,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  evaluationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  evaluationButtons: {
    gap: 12,
  },
  passButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  failButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  alreadyEvaluated: {
    alignItems: 'center',
    padding: 20,
  },
  alreadyEvaluatedText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
