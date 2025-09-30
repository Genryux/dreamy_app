import { NOTIFICATION_CONFIG } from '@/config/notifications';
import * as SecureStore from 'expo-secure-store';
import Pusher from 'pusher-js/react-native';

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
  private channel: any = null;
  private isConnected: boolean = false;
  private notificationHandlers: NotificationHandler[] = [];

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

      // Subscribe to students channel
      this.channel = this.pusher.subscribe(NOTIFICATION_CONFIG.CHANNELS.STUDENTS);

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

      // Listen for notification events
      this.channel.bind(NOTIFICATION_CONFIG.EVENTS.NOTIFICATION_CREATED, 
        (data: any) => {
          console.log('📱 New notification received via WebSocket:', data);
          this.handleNotification(data);
        }
      );

      // Also listen for the generic event name that might be used
      this.channel.bind('notification', (data: any) => {
        console.log('📱 Generic notification received:', data);
        this.handleNotification(data);
      });

      // Channel subscription events
      this.channel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Successfully subscribed to students channel');
      });

      this.channel.bind('pusher:subscription_error', (error: any) => {
        console.error('❌ Failed to subscribe to students channel:', error);
      });

      // Debug: Log all events on this channel
      this.channel.bind_global((eventName: string, data: any) => {
        console.log(`🔍 Channel event received: ${eventName}`, data);
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
   * Disconnect from Reverb
   */
  disconnect(): void {
    if (this.channel) {
      this.channel.unbind_all();
      this.pusher?.unsubscribe(NOTIFICATION_CONFIG.CHANNELS.STUDENTS);
    }
    
    if (this.pusher) {
      this.pusher.disconnect();
    }
    
    this.isConnected = false;
    this.notificationHandlers = [];
    console.log('🔌 Notification service disconnected');
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
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
