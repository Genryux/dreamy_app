import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NewsItem } from '@/services/api';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NewsCardProps {
  item: NewsItem;
  onPress?: () => void;
}

export default function NewsCard({ item, onPress }: NewsCardProps) {
  const colorScheme = useColorScheme();
  const isAnnouncement = item.type === 'announcement';

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default action - show full content in alert for now
      Alert.alert(item.title, item.content);
    }
  };

  return (
    <TouchableOpacity style={[styles.container, { 
      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: Colors[colorScheme ?? 'light'].cardBorder 
    }]} onPress={handlePress}>
      <View style={styles.header}>
        <View style={[
          styles.typeBadge, 
          { backgroundColor: isAnnouncement ? '#EF4444' : '#199BCF' }
        ]}>
          <Text style={styles.typeText}>
            {isAnnouncement ? '📢 Announcement' : '📰 News'}
          </Text>
        </View>
        <Text style={[styles.date, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{item.published_at}</Text>
      </View>
      
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].textPrimary }]} numberOfLines={2}>
        {item.title}
      </Text>
      
      <Text style={[styles.content, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={3}>
        {item.content.replace(/<[^>]*>/g, '')} {/* Strip HTML tags */}
      </Text>
      
      <View style={styles.footer}>
        <Text style={[styles.readMore, { color: Colors[colorScheme ?? 'light'].tint }]}>Tap to read more</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: '#199BCF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 8,
    lineHeight: 24,
  },
  content: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    alignItems: 'flex-end',
  },
  readMore: {
    fontSize: 12,
    color: '#199BCF',
    fontWeight: '600',
  },
});
