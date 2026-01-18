import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StudentSubjectHistoryData, teacherApiService } from '@/services/teacherApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

export default function StudentHistoryDetailScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { studentSubjectId } = useLocalSearchParams<{ studentSubjectId: string }>();
  const [data, setData] = useState<StudentSubjectHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDetail = async (isRefresh = false) => {
    if (!studentSubjectId) return;
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const result = await teacherApiService.getStudentSubjectHistory(Number(studentSubjectId));
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load student history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [studentSubjectId]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [studentSubjectId])
  );

  const handleUpdateRemedial = (status: 'failed' | 'cleared') => {
    if (!data) return;
    const label = status === 'cleared' ? 'Cleared' : 'Failed';

    Alert.alert(
      `Mark as ${label}`,
      status === 'cleared'
        ? 'Confirm the student has completed remedial and is cleared?'
        : 'Mark this remedial as still failed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const updated = await teacherApiService.updateRemedialStatus(data.student_subject_id, status);
              setData(updated);
            } catch (err: any) {
              Alert.alert('Update failed', err.message || 'Unable to update remedial status');
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  const renderInfoRow = (label: string, value: string | null) => (
    <View style={[styles.infoRow, { borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder }]}>
      <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{value ?? 'N/A'}</Text>
    </View>
  );

  const isTermClosing = data?.current_term?.status === 'Closing';
  const showRemedialActions = data?.evaluation_status?.toLowerCase() === 'failed' && !data?.is_remedial_status_finalized && isTermClosing;
  const remedialLockedByTerm = data?.evaluation_status?.toLowerCase() === 'failed' && !data?.is_remedial_status_finalized && !isTermClosing;

  if (loading && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading student...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Unable to load</Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDetail}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return null;
  }

  const formatStatus = (value: string | null | undefined) => {
    if (!value) return 'Not set';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const evaluationLabel = formatStatus(data.evaluation_status);
  const remedialLabel = formatStatus(data.remedial_status);
  const deadlineLabel = data.remedial_deadline ? new Date(data.remedial_deadline).toLocaleDateString() : 'Not set';
  const finalizedLabel = data.is_remedial_status_finalized ? 'Finalized' : 'Open';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDetail(true)}
            tintColor={Colors[colorScheme ?? 'light'].tint}
            colors={[Colors[colorScheme ?? 'light'].tint]}
          />
        }
      >
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Back</Text>
        </TouchableOpacity>

        <View style={[styles.card, {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        }]}> 
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.name, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{data.student_name}</Text>
              <Text style={[styles.subText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>LRN: {data.lrn ?? 'N/A'}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: `${Colors[colorScheme ?? 'light'].tint}20` }]}>
              <IconSymbol name="graduationcap.fill" size={12} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.statusText, { color: Colors[colorScheme ?? 'light'].tint }]}>{evaluationLabel}</Text>
            </View>
          </View>

          {renderInfoRow('Subject', data.subject_name)}
          {renderInfoRow('Section', data.section_name)}
          {renderInfoRow('Term', data.academic_term)}
          {renderInfoRow('Remedial Status', remedialLabel)}
          {renderInfoRow('Remedial Deadline', deadlineLabel)}
          {renderInfoRow('Finalization', finalizedLabel)}
        </View>

        {showRemedialActions ? (
          <View style={[styles.actionCard, {
            backgroundColor: colorScheme === 'dark' ? '#1F2D4D' : '#E5F2FA',
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : '#B6D9F2',
          }]}> 
            <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Update remedial status</Text>
            <Text style={[styles.actionSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Update this if the student already took and passed a remedial class.
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.failedButton]}
                onPress={() => handleUpdateRemedial('failed')}
                disabled={updating}
              >
                <Text style={styles.buttonText}>Failed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.clearedButton]}
                onPress={() => handleUpdateRemedial('cleared')}
                disabled={updating}
              >
                <Text style={styles.buttonText}>Cleared</Text>
              </TouchableOpacity>
            </View>
            {updating && (
              <View style={styles.updatingRow}>
                <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
                <Text style={[styles.updatingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Saving...</Text>
              </View>
            )}
          </View>
        ) : remedialLockedByTerm ? (
          <View style={[styles.actionCard, {
            backgroundColor: colorScheme === 'dark' ? '#1F2D4D' : '#E5F2FA',
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : '#B6D9F2',
          }]}> 
            <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Remedial update restricted</Text>
            <Text style={[styles.actionSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Remedial updates are only available when the current academic term is set to Closing.
            </Text>
          </View>
        ) : data?.evaluation_status?.toLowerCase() === 'failed' ? (
          <View style={[styles.actionCard, {
            backgroundColor: colorScheme === 'dark' ? '#1F2D4D' : '#E5F2FA',
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : '#B6D9F2',
          }]}> 
            <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Remedial finalized</Text>
            <Text style={[styles.actionSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              This remedial status is finalized and can no longer be updated.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  backText: {
    fontSize: 13,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  subText: {
    fontSize: 13,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 12,
    width: '45%',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    width: '55%',
    textAlign: 'right',
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  actionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  failedButton: {
    backgroundColor: '#DC2626',
  },
  clearedButton: {
    backgroundColor: '#059669',
  },
  buttonText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  updatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  updatingText: {
    fontSize: 12,
  },
});
