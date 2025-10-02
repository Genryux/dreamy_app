import { NOTIFICATION_CONFIG } from '@/config/notifications';
import * as SecureStore from 'expo-secure-store';
import Pusher from 'pusher-js/react-native';
import { apiService } from './api';

export interface NotificationData {
  id: string;
  type: string;
  data: {
    title: string;
    message: string;
    url?: string;
    shared_id?: string; // For matching with database notifications
  };
  read_at: string | null;
  created_at: string;
}

type NotificationHandler = (notification: NotificationData) => void;

class NotificationService {
  private pusher: Pusher | null = null;
  private publicChannel: any = null; // Public students channel
  private privateChannel: any = null; // Private user channel
  private isConnected: boolean = false;
  private notificationHandlers: NotificationHandler[] = [];
  private currentUserId: number | null = null;

  /**
   * Initialize the Laravel Reverb connection for real-time notifications
   */
  async initialize(): Promise<void> {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (!token) {
        console.warn('No auth token found, cannot initialize notifications');
        return;
      }

      // Initialize Pusher client for Laravel Reverb
      this.pusher = new Pusher(NOTIFICATION_CONFIG.REVERB_APP_KEY, {
        wsHost: NOTIFICATION_CONFIG.REVERB_HOST,
        wsPort: NOTIFICATION_CONFIG.REVERB_PORT,
        wssPort: NOTIFICATION_CONFIG.REVERB_PORT,
        forceTLS: NOTIFICATION_CONFIG.REVERB_SCHEME === 'wss',
        enabledTransports: [NOTIFICATION_CONFIG.REVERB_SCHEME === 'wss' ? 'wss' : 'ws'],
        cluster: '', // Required by Pusher client but not used by Reverb
        authEndpoint: `${NOTIFICATION_CONFIG.API_BASE_URL}/api/broadcasting/auth`,
        auth: {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
      });

      // Get current user ID for private channel
      this.currentUserId = await this.getCurrentUserId();
      console.log(`🔍 Current user ID retrieved: ${this.currentUserId}`);

      // Subscribe to public students channel
      this.publicChannel = this.pusher.subscribe(NOTIFICATION_CONFIG.CHANNELS.STUDENTS);
      console.log(`📱 Subscribed to public channel: ${NOTIFICATION_CONFIG.CHANNELS.STUDENTS}`);

      // Subscribe to private user channel if user ID is available
      if (this.currentUserId) {
        const privateChannelName = `${NOTIFICATION_CONFIG.CHANNELS.PRIVATE_USER}${this.currentUserId}`;
        console.log(`📱 Attempting to subscribe to private channel: ${privateChannelName}`);
        this.privateChannel = this.pusher.subscribe(privateChannelName);
        
        // Set up private channel listeners
        this.setupPrivateChannelListeners();
      } else {
        console.log('⚠️ No user ID available, skipping private channel subscription');
      }

      // Listen for connection events
      this.pusher.connection.bind('connected', () => {
        console.log('✅ Reverb connected successfully');
        this.isConnected = true;
      });

      this.pusher.connection.bind('disconnected', () => {
        console.log('❌ Reverb disconnected');
        this.isConnected = false;
      });

      this.pusher.connection.bind('error', (error: any) => {
        console.error('❌ Reverb connection error:', error);
        this.isConnected = false;
      });

      // Listen for notification events on PUBLIC channel
      this.publicChannel.bind(NOTIFICATION_CONFIG.EVENTS.NOTIFICATION_CREATED, 
        (data: any) => {
          console.log('📱 Public notification received via WebSocket:', data);
          this.handleNotification(data);
        }
      );

      this.publicChannel.bind('notification', (data: any) => {
        console.log('📱 Generic public notification received:', data);
        this.handleNotification(data);
      });

      // Public channel subscription events
      this.publicChannel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Successfully subscribed to public students channel');
      });

      this.publicChannel.bind('pusher:subscription_error', (error: any) => {
        console.error('❌ Failed to subscribe to public students channel:', error);
      });

      // Private channel listeners are set up in setupPrivateChannelListeners() method

      // Debug: Log all events on public channel
      this.publicChannel.bind_global((eventName: string, data: any) => {
        console.log(`🔍 Public channel event received: ${eventName}`, data);
      });

    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(data: any): void {
    console.log('🔄 Processing notification data:', data);
    console.log('🔍 Raw data structure:', JSON.stringify(data, null, 2));
    
    // Handle different data structures that might come from Laravel
    const notificationData = data.data || data; // Sometimes data is nested
    console.log('🔍 Extracted notificationData:', JSON.stringify(notificationData, null, 2));
    
    const notification: NotificationData = {
      // Use the Laravel notification ID, or generate a unique one for immediate notifications
      id: data.id || notificationData.id || `immediate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type || notificationData.type || 'App\\Notifications\\ImmediateNotification',
      data: {
        title: notificationData.title || data.title || 'New Notification',
        message: notificationData.message || data.message || 'You have a new notification',
        url: notificationData.url || data.url || null,
        shared_id: notificationData.shared_id || data.shared_id || null, // Store shared_id for matching with database notifications
      },
      read_at: null,
      created_at: data.created_at || new Date().toISOString(),
    };

    console.log('✅ Processed notification:', notification);

    // Notify all registered handlers
    this.notificationHandlers.forEach(handler => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Error in notification handler:', error);
      }
    });
  }

  /**
   * Add a notification handler
   */
  addNotificationHandler(handler: NotificationHandler): void {
    this.notificationHandlers.push(handler);
  }

  /**
   * Remove a notification handler
   */
  removeNotificationHandler(handler: NotificationHandler): void {
    const index = this.notificationHandlers.indexOf(handler);
    if (index > -1) {
      this.notificationHandlers.splice(index, 1);
    }
  }

  /**
   * Get current user ID from API
   */
  private async getCurrentUserId(): Promise<number | null> {
    try {
      // Check if we have an auth token first
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        console.log('⚠️ No auth token found, cannot get user ID for private channel');
        return null;
      }

      // Use the existing API service to get current user
      const userData = await apiService.getCurrentUser();
      
      if (userData && userData.id) {
        console.log(`✅ Retrieved user ID for private channel: ${userData.id}`);
        return userData.id;
      } else {
        console.log('⚠️ User data retrieved but no ID found');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to get current user ID:', error);
      // Don't throw error - just return null so public channel still works
      return null;
    }
  }

  /**
   * Disconnect from Reverb
   */
  disconnect(): void {
    if (this.publicChannel) {
      this.publicChannel.unbind_all();
      this.pusher?.unsubscribe(NOTIFICATION_CONFIG.CHANNELS.STUDENTS);
    }
    
    if (this.privateChannel && this.currentUserId) {
      this.privateChannel.unbind_all();
      this.pusher?.unsubscribe(`${NOTIFICATION_CONFIG.CHANNELS.PRIVATE_USER}${this.currentUserId}`);
    }
    
    if (this.pusher) {
      this.pusher.disconnect();
    }
    
    this.isConnected = false;
    this.notificationHandlers = [];
    this.currentUserId = null;
    console.log('🔌 Notification service disconnected');
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Update user ID and reconnect to private channel
   * Call this when user logs in or user data changes
   */
  async updateUserId(userId: number | null): Promise<void> {
    // If user ID hasn't changed, no need to reconnect
    if (this.currentUserId === userId) {
      return;
    }

    console.log(`🔄 Updating user ID from ${this.currentUserId} to ${userId}`);

    // Disconnect old private channel if exists
    if (this.privateChannel && this.currentUserId) {
      this.privateChannel.unbind_all();
      this.pusher?.unsubscribe(`${NOTIFICATION_CONFIG.CHANNELS.PRIVATE_USER}${this.currentUserId}`);
      this.privateChannel = null;
    }

    // Update user ID
    this.currentUserId = userId;

    // Subscribe to new private channel if user ID is available and pusher is connected
    if (this.pusher && this.currentUserId && this.isConnected) {
      const privateChannelName = `${NOTIFICATION_CONFIG.CHANNELS.PRIVATE_USER}${this.currentUserId}`;
      this.privateChannel = this.pusher.subscribe(privateChannelName);
      console.log(`📱 Subscribing to new private channel: ${privateChannelName}`);

      // Set up event listeners for the new private channel
      this.setupPrivateChannelListeners();
    }
  }

  /**
   * Set up event listeners for private channel
   */
  private setupPrivateChannelListeners(): void {
    if (!this.privateChannel) return;

    this.privateChannel.bind(NOTIFICATION_CONFIG.EVENTS.NOTIFICATION_CREATED, 
      (data: any) => {
        console.log('📱 Private notification received via WebSocket:', data);
        this.handleNotification(data);
      }
    );

    this.privateChannel.bind('notification', (data: any) => {
      console.log('📱 Generic private notification received:', data);
      this.handleNotification(data);
    });

    // Private channel subscription events
    this.privateChannel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Successfully subscribed to private user channel');
    });

    this.privateChannel.bind('pusher:subscription_error', (error: any) => {
      console.error('❌ Failed to subscribe to private user channel:', error);
    });

    // Debug: Log all events on private channel
    this.privateChannel.bind_global((eventName: string, data: any) => {
      console.log(`🔍 Private channel event received: ${eventName}`, data);
    });
  }

  /**
   * Manually reconnect
   */
  async reconnect(): Promise<void> {
    this.disconnect();
    await new Promise(resolve => setTimeout(resolve, NOTIFICATION_CONFIG.SETTINGS.RECONNECT_DELAY));
    await this.initialize();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
