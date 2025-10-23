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
      backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Recent Activity</Text>
        </View>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={[styles.viewAllText, { color: '#199BCF' }]}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {activities.length === 0 ? (
        <View style={[styles.emptyState, {
          backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground,
          borderColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder
        }]}>
          <IconSymbol name="clock" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No recent activity</Text>
          <Text style={[styles.emptySubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Your activities will appear here</Text>
        </View>
      ) : (
        <View style={styles.activitiesList}>
          {activities.slice(0, 3).map((activity, index) => (
            <View key={index} style={[styles.activityItem, {
              backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground,
              borderColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder
            }]}>
              <View style={[styles.activityIcon, { backgroundColor: '#199BCF' }]}>
                <IconSymbol name={getActivityIcon(activity.type)} size={14} color="#FFFFFF" />
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
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
  },
  activitiesList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 13,
    marginBottom: 3,
    lineHeight: 18,
  },
  activityDate: {
    fontSize: 11,
  },
});
