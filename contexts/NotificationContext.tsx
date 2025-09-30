import { apiService, Notification } from '@/services/api';
import notificationService, { NotificationData } from '@/services/NotificationService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  pendingNotifications: Set<string>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // Track IDs of immediate notifications that have been marked as read locally
  const [readImmediateNotifications, setReadImmediateNotifications] = useState<Set<string>>(new Set());
  // Track IDs of notifications that are waiting for database confirmation (showing loading state)
  const [pendingNotifications, setPendingNotifications] = useState<Set<string>>(new Set());

  // Handle real-time notifications
  const handleRealtimeNotification = (notificationData: NotificationData) => {
    console.log('📱 New notification received in real-time');
    
    // Convert to our notification format
    const newNotification: Notification = {
      id: notificationData.id,
      type: notificationData.type,
      data: notificationData.data,
      read_at: notificationData.read_at,
      created_at: notificationData.created_at,
    };

    // Add to the beginning of the list, but check for duplicates first
    setNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(n => n.id === newNotification.id);
      if (exists) {
        console.log(`⚠️ Notification ${newNotification.id} already exists, skipping duplicate`);
        return prev;
      }
      // Add new notification to the beginning
      return [newNotification, ...prev];
    });
    
    // Increment unread count if notification is unread and doesn't already exist
    if (!newNotification.read_at) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Initialize real-time service
        await notificationService.initialize();
        
        // Add our handler
        notificationService.addNotificationHandler(handleRealtimeNotification);
        
        // Update connection status
        setIsConnected(notificationService.getConnectionStatus());
        
        // Load initial notifications
        await refreshNotifications();
        
        console.log('✅ Notification context initialized');
      } catch (error) {
        console.error('❌ Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      notificationService.removeNotificationHandler(handleRealtimeNotification);
      notificationService.disconnect();
    };
  }, []);

  // Refresh notifications from API
  const refreshNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getNotifications(1);
      
      // Get all shared_ids from queued notifications
      const queuedSharedIds = new Set(
        response.notifications
          .filter(n => n.type === 'App\\Notifications\\QueuedNotification' && n.data?.shared_id)
          .map(n => n.data.shared_id)
      );
      
      // Filter out immediate notifications that have a corresponding queued notification
      // and apply read state to immediate notifications that were marked as read locally
      const updatedNotifications = response.notifications
        .filter(notification => {
          // Remove immediate notifications if their queued version exists
          if (notification.type === 'App\\Notifications\\ImmediateNotification' && 
              notification.data?.shared_id && 
              queuedSharedIds.has(notification.data.shared_id)) {
            console.log(`🗑️ Removing immediate notification ${notification.id} - queued version exists`);
            return false;
          }
          return true;
        })
        .map(notification => {
          // Apply read state to immediate notifications marked locally
          if (notification.type === 'App\\Notifications\\ImmediateNotification' && 
              readImmediateNotifications.has(notification.id)) {
            return { ...notification, read_at: new Date().toISOString() };
          }
          return notification;
        });
      
      setNotifications(updatedNotifications);
      setUnreadCount(response.unread_count);
      setCurrentPage(1);
      setHasMore(response.current_page < response.last_page);
      
      console.log(`📋 Loaded ${response.notifications.length} notifications, ${response.unread_count} unread`);
    } catch (error) {
      console.error('❌ Failed to refresh notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more notifications (pagination)
  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    try {
      setIsLoading(true);
      const response = await apiService.getNotifications(currentPage + 1);
      
      // Apply read state to immediate notifications that were marked as read locally
      const updatedNotifications = response.notifications.map(notification => {
        if (notification.type === 'App\\Notifications\\ImmediateNotification' && 
            readImmediateNotifications.has(notification.id)) {
          return { ...notification, read_at: new Date().toISOString() };
        }
        return notification;
      });
      
      setNotifications(prev => [...prev, ...updatedNotifications]);
      setCurrentPage(prev => prev + 1);
      setHasMore(response.current_page < response.last_page);
      
      console.log(`📋 Loaded ${response.notifications.length} more notifications`);
    } catch (error) {
      console.error('❌ Failed to load more notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for database notification and mark it as read when found
  const pollForDatabaseNotification = async (immediateId: string, sharedId: string) => {
    const maxAttempts = 12; // Poll for up to 12 attempts (36 seconds total)
    const pollInterval = 3000; // Poll every 3 seconds
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Polling attempt ${attempt}/${maxAttempts} for shared_id: ${sharedId}`);
      
      try {
        // Fetch latest notifications
        const response = await apiService.getNotifications(1);
        
        // Look for matching database notification
        const dbNotification = response.notifications.find(n =>
          n.data?.shared_id === sharedId &&
          n.type === 'App\\Notifications\\QueuedNotification'
        );
        
        if (dbNotification) {
          console.log(`✅ Found database notification: ${dbNotification.id}`);
          
          // Mark it as read via API
          try {
            const markResponse = await apiService.markNotificationAsRead(dbNotification.id);
            if (markResponse.success) {
              setUnreadCount(markResponse.unread_count);
              console.log(`✅ Successfully marked database notification as read`);
            }
          } catch (error) {
            console.log('⚠️ Error marking database notification as read:', error);
          }
          
          // Remove from pending state
          setPendingNotifications(prev => {
            const newSet = new Set(prev);
            newSet.delete(immediateId);
            return newSet;
          });
          
          // Remove immediate notification and add/update database notification
          setNotifications(prev => {
            // Filter out immediate notification and any existing database notification with same ID
            const filtered = prev.filter(n => 
              n.id !== immediateId && n.id !== dbNotification.id
            );
            
            // Add the database notification with read state
            return filtered.concat({
              ...dbNotification,
              read_at: new Date().toISOString()
            }).sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
          
          return; // Success, stop polling
        }
        
        // Wait before next attempt
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      } catch (error) {
        console.log(`⚠️ Polling error on attempt ${attempt}:`, error);
        // Continue trying
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }
    }
    
    // Max attempts reached, remove from pending
    console.log('⏰ Max polling attempts reached, stopping');
    setPendingNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(immediateId);
      return newSet;
    });
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    // Find the notification to get its type and shared_id
    const targetNotification = notifications.find(n => n.id === id);
    const sharedId = targetNotification?.data?.shared_id;
    const isImmediateNotification = targetNotification?.type === 'App\\Notifications\\ImmediateNotification';
    
    console.log('🎯 Attempting to mark notification as read:');
    console.log('  - ID:', id);
    console.log('  - Type:', targetNotification?.type);
    console.log('  - Is Immediate:', isImmediateNotification);
    console.log('  - Shared ID:', sharedId);
    
    // Optimistically update local state for immediate UI feedback
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // If this is an immediate notification (ephemeral, not in DB), handle specially
    if (isImmediateNotification) {
      console.log('📱 Immediate notification - marked as read locally');
      
      // Track this immediate notification as read
      setReadImmediateNotifications(prev => new Set(prev).add(id));
      
      // If has shared_id, start polling for database notification
      if (sharedId) {
        // Add to pending state (shows loading indicator)
        setPendingNotifications(prev => new Set(prev).add(id));
        console.log('⏳ Starting background polling for database notification:', sharedId);
        
        // Poll in background (asynchronous, non-blocking)
        pollForDatabaseNotification(id, sharedId);
      }
      return;
    }
    
    // For database notifications (QueuedNotification), mark via API
    try {
      const response = await apiService.markNotificationAsRead(id);
      
      if (response.success) {
        setUnreadCount(response.unread_count);
        console.log(`✅ Marked database notification ${id} as read`);
      }
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      
      // If error occurs, revert the optimistic update
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read_at: null }
            : notification
        )
      );
      setUnreadCount(prev => prev + 1);
      await refreshNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            read_at: notification.read_at || new Date().toISOString()
          }))
        );
        
        setUnreadCount(0);
        console.log('✅ Marked all notifications as read');
      }
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    pendingNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
