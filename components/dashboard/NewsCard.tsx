import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NewsItem, apiService } from '@/services/api';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NewsModal from './NewsModal';

interface NewsCardProps {
  item: NewsItem;
  onPress?: () => void;
}

export default function NewsCard({ item, onPress }: NewsCardProps) {
  const colorScheme = useColorScheme();
  const isAnnouncement = item.type === 'announcement';
  const [modalVisible, setModalVisible] = useState(false);
  const [fullContent, setFullContent] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else {
      // Fetch full content when opening modal
      setLoading(true);
      try {
        const fullNewsItem = await apiService.getNewsDetails(item.id);
        setFullContent(fullNewsItem);
        setModalVisible(true);
      } catch (error) {
        console.error('Failed to fetch full content:', error);
        // Fallback to truncated content
        setFullContent(item);
        setModalVisible(true);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <TouchableOpacity style={[styles.container, { 
        backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder 
      }]} onPress={handlePress}>
        <View style={styles.header}>
          <View style={[
            styles.typeBadge, 
            { backgroundColor: isAnnouncement ? '#EF4444' : '#199BCF' }
          ]}>
            <IconSymbol 
              name={isAnnouncement ? 'megaphone.fill' : 'newspaper.fill'} 
              size={12} 
              color="#FFFFFF" 
            />
            <Text style={styles.typeText}>
              {isAnnouncement ? 'Announcement' : 'News'}
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
          <View style={styles.readMoreContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#199BCF" />
            ) : (
              <>
                <Text style={[styles.readMore, { color: '#199BCF' }]}>Read more</Text>
                <IconSymbol 
                  name="chevron.right" 
                  size={12} 
                  color="#199BCF" 
                />
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <NewsModal
        visible={modalVisible}
        item={fullContent || item}
        onClose={() => {
          setModalVisible(false);
          setFullContent(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A3165',
    marginBottom: 6,
    lineHeight: 20,
  },
  content: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginBottom: 8,
  },
  footer: {
    alignItems: 'flex-end',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  readMore: {
    fontSize: 11,
    color: '#199BCF',
    fontWeight: '500',
  },
});
