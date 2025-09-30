import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useNotifications } from '@/contexts/NotificationContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Notification } from '@/services/api';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    pendingNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore
  } = useNotifications();

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
  }, [markAsRead]);

  const handleMarkAllRead = useCallback(() => {
    if (unreadCount === 0) return;
    
    Alert.alert(
      'Mark All as Read',
      `Are you sure you want to mark all ${unreadCount} notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark All Read', onPress: markAllAsRead }
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
    const isPending = pendingNotifications.has(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: isUnread 
              ? Colors[colorScheme ?? 'light'].cardBackground 
              : Colors[colorScheme ?? 'light'].background,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder,
          }
        ]}
        onPress={() => handleNotificationPress(item)}
        disabled={isPending}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                name="bell.fill" 
                size={20} 
                color={isUnread ? '#199BCF' : Colors[colorScheme ?? 'light'].textSecondary} 
              />
            </View>
            <View style={styles.notificationText}>
              <Text style={[
                styles.notificationTitle,
                { 
                  color: Colors[colorScheme ?? 'light'].textPrimary,
                  fontWeight: isUnread ? '700' : '600'
                }
              ]}>
                {item.data.title}
              </Text>
              <Text style={[
                styles.notificationMessage,
                { color: Colors[colorScheme ?? 'light'].textSecondary }
              ]}>
                {item.data.message}
              </Text>
              <Text style={[
                styles.notificationTime,
                { color: Colors[colorScheme ?? 'light'].textSecondary }
              ]}>
                {getTimeAgo(item.created_at)}
              </Text>
            </View>
            {isPending ? (
              <ActivityIndicator size="small" color="#199BCF" style={styles.pendingIndicator} />
            ) : isUnread ? (
              <View style={styles.unreadIndicator} />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={[styles.emptyState, { 
      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      <View style={styles.emptyIconContainer}>
        <IconSymbol name="bell.fill" size={48} color="#199BCF" />
      </View>
      <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
        No Notifications Yet
      </Text>
      <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        You'll see your notifications here when you receive them
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#199BCF" />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Loading more...
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              Notifications
            </Text>
            <View style={styles.statusRow}>
              <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </Text>
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshNotifications}
                tintColor="#199BCF"
                colors={['#199BCF']}
              />
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
    paddingTop: 4,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#199BCF',
    borderRadius: 6,
  },
  markAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20, // Reduced space for tab bar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 8,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationItem: {
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(25, 155, 207, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#199BCF',
    marginLeft: 8,
    marginTop: 6,
  },
  pendingIndicator: {
    marginLeft: 8,
    marginTop: 2,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
});
