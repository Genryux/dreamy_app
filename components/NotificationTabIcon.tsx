import { IconSymbol } from '@/components/ui/IconSymbol';
import { NOTIFICATION_CONFIG } from '@/config/notifications';
import { useNotifications } from '@/contexts/NotificationContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface NotificationTabIconProps {
  color: string;
  size?: number;
}

export function NotificationTabIcon({ color, size = 28 }: NotificationTabIconProps) {
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.container}>
      <IconSymbol size={size} name="bell.fill" color={color} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > NOTIFICATION_CONFIG.SETTINGS.MAX_BADGE_COUNT 
              ? `${NOTIFICATION_CONFIG.SETTINGS.MAX_BADGE_COUNT}+` 
              : unreadCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default NotificationTabIcon;
