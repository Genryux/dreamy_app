import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useNotifications } from '@/contexts/NotificationContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Notification } from '@/services/api';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeacherNotificationsScreen() {
  const colorScheme = useColorScheme();
  const {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAllAsRead,
    loadMore,
    hasMore,
  } = useNotifications();

  const handleNotificationPress = useCallback((notification: Notification) => {
    const redirectToTab = (tabName: string) => {
      router.push(`/(teacher)/${tabName}`);
    };

    if (notification.data.url) {
      const url = notification.data.url;

      if (url.includes('/teacher/subject') || url.includes('/teacher/dashboard')) {
        redirectToTab('dashboard');
      } else if (url.includes('/history')) {
        redirectToTab('history');
      } else if (url.includes('/profile') || url.includes('/account')) {
        redirectToTab('profile');
      } else {
        redirectToTab('dashboard');
      }
    } else {
      const type = notification.type.toLowerCase();

      if (type.includes('subject') || type.includes('section') || type.includes('academic')) {
        redirectToTab('dashboard');
      } else if (type.includes('history')) {
        redirectToTab('history');
      } else if (type.includes('profile') || type.includes('account')) {
        redirectToTab('profile');
      } else {
        redirectToTab('dashboard');
      }
    }
  }, []);

  const handleMarkAllRead = useCallback(() => {
    if (unreadCount === 0) return;

    Alert.alert(
      'Mark All as Read',
      `Are you sure you want to mark all ${unreadCount} notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark All Read', onPress: markAllAsRead },
      ]
    );
  }, [unreadCount, markAllAsRead]);

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const isUnread = !item.read_at;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: isUnread
              ? (colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground)
              : (colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background),
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
          },
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <IconSymbol
                name="bell.fill"
                size={18}
                color={isUnread ? '#199BCF' : Colors[colorScheme ?? 'light'].textSecondary}
              />
            </View>
            <View style={styles.notificationText}>
              <Text
                style={[
                  styles.notificationTitle,
                  {
                    color: Colors[colorScheme ?? 'light'].textPrimary,
                    fontWeight: isUnread ? '700' : '600',
                  },
                ]}
              >
                {item.data.title}
              </Text>
              <Text
                style={[
                  styles.notificationMessage,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}
              >
                {item.data.message}
              </Text>
              <Text
                style={[
                  styles.notificationTime,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}
              >
                {getTimeAgo(item.created_at)}
              </Text>
            </View>
            {isUnread ? (
              <View style={styles.unreadIndicator} />
            ) : (
              <IconSymbol
                name="chevron.right"
                size={14}
                color={Colors[colorScheme ?? 'light'].textSecondary}
                style={styles.redirectIndicator}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View
      style={[
        styles.emptyState,
        {
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder,
        },
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <IconSymbol name="bell.fill" size={40} color="#199BCF" />
      </View>
      <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No Notifications Yet</Text>
      <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>You'll see your notifications here when you receive them</Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#199BCF" />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading more...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Notifications</Text>
            <View style={styles.statusRow}>
              <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}> {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} </Text>
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refreshNotifications} tintColor="#199BCF" colors={['#199BCF']} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : undefined}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#199BCF',
    borderRadius: 8,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  notificationContent: {
    padding: 14,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(25, 155, 207, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    marginTop: 6,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#199BCF',
    marginLeft: 8,
    marginTop: 6,
  },
  redirectIndicator: {
    marginLeft: 8,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(25, 155, 207, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 6,
    fontSize: 12,
  },
});
