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
      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      <View style={[styles.welcomeContainer, { 
        backgroundColor: Colors[colorScheme ?? 'light'].sectionBackground,
        borderColor: Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <View style={styles.welcomeHeader}>
          <View style={styles.welcomeIconContainer}>
            <IconSymbol name="person.fill" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={[styles.welcomeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Welcome back</Text>
            <Text style={[styles.studentName, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{student.name}</Text>
          </View>
        </View>
        
        <View style={styles.welcomeDivider} />
        
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

      {/* Detailed Student Information */}
      <View style={styles.detailedInfoContainer}>
        <Text style={[styles.detailedInfoTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Student Information</Text>
        <View style={styles.detailedInfoGrid}>
          <View style={styles.detailedInfoItem}>
            <Text style={[styles.detailedInfoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Grade Level</Text>
            <Text style={[styles.detailedInfoValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student.grade_level}</Text>
          </View>
          
          <View style={styles.detailedInfoItem}>
            <Text style={[styles.detailedInfoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Program</Text>
            <Text style={[styles.detailedInfoValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student.program}</Text>
          </View>
          
          <View style={styles.detailedInfoItem}>
            <Text style={[styles.detailedInfoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Academic Term</Text>
            <Text style={[styles.detailedInfoValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{enrollment.term || 'N/A'}</Text>
          </View>
          
          {enrollment.confirmed_at && (
            <View style={styles.detailedInfoItem}>
              <Text style={[styles.detailedInfoLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Confirmed On</Text>
              <Text style={[styles.detailedInfoValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{enrollment.confirmed_at}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Enrollment Confirmation Section */}
      {enrollment.status === 'pending_confirmation' && (
        <View style={[styles.confirmationSection, { 
          backgroundColor: Colors[colorScheme ?? 'light'].sectionBackground,
          borderColor: Colors[colorScheme ?? 'light'].cardBorder 
        }]}>
          <View style={styles.confirmationHeader}>
            <View style={styles.confirmationTitleContainer}>
              <IconSymbol name="doc.text.fill" size={18} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.confirmationTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Enrollment Confirmation Required</Text>
            </View>
            <Text style={[styles.confirmationSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Please confirm your enrollment for {enrollment.term} to complete your registration.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]} 
            onPress={handleConfirmEnrollment}
            activeOpacity={0.8}
            disabled={confirming}
          >
            <View style={styles.confirmButtonContent}>
              {confirming && <IconSymbol name="arrow.clockwise" size={16} color="#FFFFFF" />}
              <Text style={styles.confirmButtonText}>
                {confirming ? 'Confirming Enrollment...' : 'Confirm My Enrollment'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.confirmationNote, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            This action will officially enroll you for the current academic term.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // New Professional Welcome Container Styles
  welcomeContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#199BCF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#199BCF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  studentName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  welcomeDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
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
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Detailed Information Section Styles
  detailedInfoContainer: {
    marginBottom: 20,
  },
  detailedInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  detailedInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailedInfoItem: {
    width: '50%',
    marginBottom: 12,
    paddingRight: 8,
  },
  detailedInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  detailedInfoValue: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  confirmationSection: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  confirmationHeader: {
    marginBottom: 16,
  },
  confirmationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginLeft: 8,
  },
  confirmationSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#199BCF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#199BCF',
  },
  confirmButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0.1,
  },
  confirmationNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
