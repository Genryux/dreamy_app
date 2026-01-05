// API Configuration for different network environments
export const API_CONFIG = {
  // Home WiFi (MAMP Server - Local Development)
  HOME: {
    BASE_URL: 'http://192.168.100.10:8888',
    REVERB_HOST: '192.168.100.10',
    REVERB_PORT: 8080,
    REVERB_SCHEME: 'ws',
    name: 'Home WiFi (MAMP)'
  },
  
  // Production (AWS EC2)
  PRODUCTION: {
    BASE_URL: 'https://dreamyschoolph.site',
    REVERB_HOST: 'dreamyschoolph.site',
    REVERB_PORT: 443,
    REVERB_SCHEME: 'wss',
    name: 'Production (AWS)'
  }
};

// Current environment - change this to switch networks
// Options: 'HOME' | 'PRODUCTION'
export const CURRENT_ENV: keyof typeof API_CONFIG = 'HOME';

// Get current configuration
export const getCurrentConfig = () => API_CONFIG[CURRENT_ENV];

// Helper function to switch environment
export const switchEnvironment = (env: keyof typeof API_CONFIG) => {
  console.log(`🔄 Switching to ${API_CONFIG[env].name}`);
  return API_CONFIG[env];
};

export default API_CONFIG;
