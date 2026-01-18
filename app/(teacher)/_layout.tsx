import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { NotificationTabIcon } from '@/components/NotificationTabIcon';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TeacherTabLayout() {
  const colorScheme = useColorScheme();

  return (
    <NotificationProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#199BCF', // Direct color match with confirm enrollment button
          tabBarInactiveTintColor: colorScheme === 'dark' ? '#8B9DC3' : Colors[colorScheme ?? 'light'].textSecondary,
          headerShown: false,
          title: '', // Hide the default route group title
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].tabBarBackground,
              paddingBottom: 16,
              height: 85,
              borderTopWidth: 1.5,
              borderTopColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder,
              shadowColor: colorScheme === 'dark' ? '#000000' : '#000000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
              shadowRadius: 4,
            },
            android: {
              backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].tabBarBackground,
              borderTopWidth: 1.5,
              borderTopColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder,
              elevation: 8,
              paddingBottom: 6,
              height: 65,
            },
            default: {
              backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].tabBarBackground,
              borderTopWidth: 1.5,
              borderTopColor: colorScheme === 'dark' ? '#4A5F8B' : Colors[colorScheme ?? 'light'].cardBorder,
              paddingBottom: 6,
              height: 65,
            },
          }),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 1,
            marginBottom: Platform.select({
              ios: 6,
              android: 3,
              default: 3,
            }),
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
        }}>
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="clock.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Updates',
            tabBarIcon: ({ color }) => <NotificationTabIcon color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
          }}
        />
        {/* Hide dynamic routes from tab bar */}
        <Tabs.Screen
          name="class/[id]/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="class/[id]/student/[studentId]"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="history/[studentSubjectId]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </NotificationProvider>
  );
}
