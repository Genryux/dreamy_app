// Notification Configuration
// Update these values to match your Laravel Reverb setup
import { getCurrentConfig } from './api';

const config = getCurrentConfig();

export const NOTIFICATION_CONFIG = {
  // Laravel Reverb Configuration (From your .env file)
  REVERB_APP_KEY: 'ak6vcojiwfqssrwgezk4', // Your actual REVERB_APP_KEY from .env
  REVERB_HOST: config.REVERB_HOST, // Dynamic host based on current environment
  REVERB_PORT: config.REVERB_PORT, // Your REVERB_PORT from .env
  REVERB_SCHEME: config.REVERB_SCHEME, // 'ws' for local development (http), 'wss' for production with SSL
  
  // API Configuration (Should match your Laravel backend)
  API_BASE_URL: config.BASE_URL, // Dynamic API URL based on current environment
  
  // Channel Names (Should match your Laravel broadcasting channels)
  CHANNELS: {
    STUDENTS: 'students', // Public channel for all students
    PRIVATE_USER: 'user.', // User-specific channel prefix (will append user ID)
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
