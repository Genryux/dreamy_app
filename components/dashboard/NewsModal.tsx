import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NewsItem } from '@/services/api';
import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface NewsModalProps {
  visible: boolean;
  item: NewsItem | null;
  onClose: () => void;
}

export default function NewsModal({ visible, item, onClose }: NewsModalProps) {
  const colorScheme = useColorScheme();
  if (!item) return null;

  const isAnnouncement = item.type === 'announcement';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

          {/* Fixed Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.closeButton, {
                backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : 'rgba(0, 0, 0, 0.05)',
              }]}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol name="xmark" size={18} color={Colors[colorScheme ?? 'light'].textPrimary} />
            </TouchableOpacity>

            <View
              style={[
                styles.typeBadge,
                { backgroundColor: isAnnouncement ? '#EF4444' : '#199BCF' },
              ]}
            >
              <IconSymbol
                name={isAnnouncement ? 'megaphone.fill' : 'newspaper.fill'}
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.typeText}>
                {isAnnouncement ? 'Announcement' : 'News'}
              </Text>
            </View>

            <View style={styles.placeholder} />
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Title */}
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              {item.title}
            </Text>

            {/* Date */}
            <View style={styles.dateRow}>
              <IconSymbol name="calendar" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.dateText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {item.published_at}
              </Text>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder }]} />

            {/* Content */}
            <View style={[styles.contentContainer, {
              backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder
            }]}>
              <Text 
                style={[styles.contentText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}
                numberOfLines={0}
                ellipsizeMode="clip"
                allowFontScaling={true}
              >
                {item.content.replace(/<[^>]*>/g, '')}
              </Text>
            </View>

            {/* Footer Info */}
            <View style={[styles.footerInfo, {
              backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : 'rgba(25, 155, 207, 0.08)',
              borderColor: colorScheme === 'dark' ? '#3A4F7B' : 'rgba(25, 155, 207, 0.2)'
            }]}>
              <IconSymbol name="info.circle" size={16} color="#199BCF" />
              <Text style={[styles.footerText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                This {isAnnouncement ? 'announcement' : 'news'} was published by the school administration.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  contentContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(25, 155, 207, 0.08)',
    borderWidth: 1,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
});