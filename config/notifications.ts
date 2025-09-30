// Notification Configuration
// Update these values to match your Laravel Reverb setup

export const NOTIFICATION_CONFIG = {
  // Laravel Reverb Configuration (From your .env file)
  REVERB_APP_KEY: 'ak6vcojiwfqssrwgezk4', // Your actual REVERB_APP_KEY from .env
  REVERB_HOST: '192.168.100.10', // Your Laravel server IP (not localhost for mobile)
  REVERB_PORT: 8080, // Your REVERB_PORT from .env
  REVERB_SCHEME: 'ws', // 'ws' for local development (http), 'wss' for production with SSL
  
  // API Configuration (Should match your Laravel backend)
  API_BASE_URL: 'http://192.168.100.10:8888', // Update to match your backend URL
  
  // Channel Names (Should match your Laravel broadcasting channels)
  CHANNELS: {
    STUDENTS: 'students',
  },
  
  // Event Names (Should match your Laravel notification events)
  EVENTS: {
    NOTIFICATION_CREATED: 'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
  },
  
  // Notification Settings
  SETTINGS: {
    PAGINATION_SIZE: 20,
    MAX_BADGE_COUNT: 99,
    RECONNECT_DELAY: 1000, // milliseconds
  },
};

export default NOTIFICATION_CONFIG;
