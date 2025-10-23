import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Enrollment, Student } from '@/services/api';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StudentInfoCardProps {
  student: Student;
  enrollment: Enrollment;
  onConfirmEnrollment?: () => void;
  confirming?: boolean;
}

export default function StudentInfoCard({ student, enrollment, onConfirmEnrollment, confirming = false }: StudentInfoCardProps) {
  const colorScheme = useColorScheme();
  
  // Debug logging for enrollment confirmation
  console.log('Enrollment Confirmation Debug:', {
    status: enrollment.status,
    evaluation_status: enrollment.evaluation_status,
    term: enrollment.term,
    shouldShowConfirmation: (enrollment.status === 'pending_confirmation' || enrollment.status === 'not_enrolled') && enrollment.evaluation_status === 'passed'
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return '#10B981'; // Green
      case 'pending_confirmation':
        return '#F59E0B'; // Yellow
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'Enrolled';
      case 'pending_confirmation':
        return 'Pending Confirmation';
      case 'not_enrolled':
        return 'Not Enrolled';
      default:
        return 'Unknown Status';
    }
  };

  const handleConfirmEnrollment = () => {
    Alert.alert(
      'Confirm Enrollment',
      `Are you sure you want to confirm your enrollment for ${enrollment.term}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          style: 'default',
          onPress: () => {
            if (onConfirmEnrollment) {
              onConfirmEnrollment();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      {/* Welcome Section */}
      <View style={[styles.welcomeSection, {
        backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground,
        borderColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder
      }]}>
        <View style={styles.welcomeHeader}>
          <View style={styles.welcomeIconContainer}>
            <IconSymbol name="person.fill" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={[styles.welcomeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Welcome back</Text>
            <Text style={[styles.studentName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{student.name}</Text>
          </View>
        </View>
        
        <View style={styles.quickInfo}>
          <View style={styles.quickInfoItem}>
            <Text style={[styles.quickInfoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Student ID</Text>
            <Text style={[styles.quickInfoValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{student.lrn}</Text>
          </View>
          <View style={styles.quickInfoItem}>
            <Text style={[styles.quickInfoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(enrollment.status) }]}>
              <Text style={styles.statusText}>{getStatusText(enrollment.status)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Student Information */}
      <View style={[styles.infoSection, {
        backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground,
        borderColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder
      }]}>
        <Text style={[styles.infoSectionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Student Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Grade Level</Text>
            <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{student.grade_level}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Program</Text>
            <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{student.program}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Academic Term</Text>
            <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{enrollment.term || 'N/A'}</Text>
          </View>
          
          {enrollment.confirmed_at && (
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Confirmed On</Text>
              <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{enrollment.confirmed_at}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Academic Evaluation Status */}
      {enrollment.evaluation_status && enrollment.evaluation_status !== null && (
        <View style={[styles.evaluationSection, { 
          backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground,
          borderColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder 
        }]}>
          <View style={styles.evaluationHeader}>
            <IconSymbol name="graduationcap.fill" size={16} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.evaluationTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Academic Evaluation</Text>
          </View>
          
          <View style={[styles.evaluationStatusCard, { 
            backgroundColor: enrollment.evaluation_status === 'passed' 
              ? (colorScheme === 'dark' ? '#064E3B' : '#F0FDF4')
              : (colorScheme === 'dark' ? '#7F1D1D' : '#FEF2F2'),
            borderColor: enrollment.evaluation_status === 'passed' ? '#10B981' : '#EF4444'
          }]}>
            <View style={styles.evaluationStatusHeader}>
              <IconSymbol 
                name={enrollment.evaluation_status === 'passed' ? 'checkmark.circle.fill' : 'xmark'} 
                size={18} 
                color={enrollment.evaluation_status === 'passed' ? '#10B981' : '#EF4444'} 
              />
              <Text style={[styles.evaluationStatusTitle, { 
                color: enrollment.evaluation_status === 'passed' ? '#10B981' : '#EF4444'
              }]}>
                {enrollment.evaluation_status === 'passed' ? 'PASSED' : 'FAILED'}
              </Text>
            </View>
            
            <Text style={[styles.evaluationMessage, { 
                color: enrollment.evaluation_status === 'passed' 
                  ? (colorScheme === 'dark' ? '#D1FAE5' : Colors[colorScheme ?? 'light'].textPrimary)
                  : (colorScheme === 'dark' ? '#FEE2E2' : Colors[colorScheme ?? 'light'].textPrimary)
              }]}>
              {enrollment.evaluation_status === 'passed' 
                ? 'Congratulations! You have successfully passed this academic term and are expected to be promoted to the next school year.'
                : 'You have not met the academic requirements for this term and are expected to be retained in the current grade level for the next school year.'
              }
            </Text>
            
            {enrollment.evaluation_notes && (
              <View style={styles.evaluationNotesContainer}>
                <Text style={[styles.evaluationNotesLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Additional Notes:
                </Text>
                <Text style={[styles.evaluationNotes, { 
                  color: enrollment.evaluation_status === 'passed' 
                    ? (colorScheme === 'dark' ? '#A7F3D0' : Colors[colorScheme ?? 'light'].textPrimary)
                    : (colorScheme === 'dark' ? '#FECACA' : Colors[colorScheme ?? 'light'].textPrimary)
                }]}>
                  {enrollment.evaluation_notes}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Enrollment Confirmation */}
      {(enrollment.status === 'pending_confirmation' || enrollment.status === 'not_enrolled') && (
        <View style={[styles.confirmationSection, { 
          backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground,
          borderColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder 
        }]}>
          <View style={styles.confirmationHeader}>
            <IconSymbol name="doc.text.fill" size={16} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.confirmationTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Enrollment Confirmation Required</Text>
          </View>
          
          <Text style={[styles.confirmationSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Please confirm your enrollment for {enrollment.term} to complete your registration.
          </Text>
          
          <TouchableOpacity 
            style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]} 
            onPress={handleConfirmEnrollment}
            activeOpacity={0.8}
            disabled={confirming}
          >
            <Text style={styles.confirmButtonText}>
              {confirming ? 'Confirming...' : 'Confirm Enrollment'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // Welcome Section
  welcomeSection: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#199BCF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickInfoItem: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  // Information Section
  infoSection: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
    paddingRight: 8,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  confirmationSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  confirmationSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#199BCF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  // Evaluation Section
  evaluationSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  evaluationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  evaluationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  evaluationStatusCard: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  evaluationStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  evaluationStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  evaluationMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  evaluationNotesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  evaluationNotesLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  evaluationNotes: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
