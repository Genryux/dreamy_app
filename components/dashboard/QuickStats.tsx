import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Activity } from '@/services/api';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickStatsProps {
  activities: Activity[];
  onViewAllPress?: () => void;
}

export default function QuickStats({ activities, onViewAllPress }: QuickStatsProps) {
  const colorScheme = useColorScheme();
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment_confirmed':
        return 'checkmark.circle.fill';
      case 'document_submitted':
        return 'doc.text.fill';
      case 'payment_made':
        return 'creditcard.fill';
      default:
        return 'pin.fill';
    }
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Recent Activity</Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={[styles.viewAllText, { color: Colors[colorScheme ?? 'light'].tint }]}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No recent activity</Text>
          <Text style={[styles.emptySubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Your activities will appear here</Text>
        </View>
      ) : (
        <View style={styles.activitiesList}>
          {activities.slice(0, 3).map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors[colorScheme ?? 'light'].sectionBackground }]}>
                <IconSymbol name={getActivityIcon(activity.type)} size={16} color={Colors[colorScheme ?? 'light'].tint} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityMessage, { color: Colors[colorScheme ?? 'light'].textPrimary }]} numberOfLines={2}>
                  {activity.message}
                </Text>
                <Text style={[styles.activityDate, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{activity.date}</Text>
              </View>
            </View>
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
  },
  viewAllText: {
    fontSize: 14,
    color: '#199BCF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#1A3165',
    marginBottom: 4,
    lineHeight: 20,
  },
  activityDate: {
    fontSize: 12,
    color: '#6B7280',
  },
});
