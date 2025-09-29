import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#199BCF', // Direct color match with confirm enrollment button
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
         tabBarStyle: Platform.select({
           ios: {
             position: 'absolute',
             backgroundColor: 'transparent',
             paddingBottom: 20,
             height: 90,
             borderTopWidth: 0,
           },
           android: {
             backgroundColor: Colors[colorScheme ?? 'light'].tabBarBackground,
             borderTopWidth: 1,
             borderTopColor: Colors[colorScheme ?? 'light'].cardBorder,
             elevation: 8,
             paddingBottom: 8,
             height: 70,
           },
           default: {
             backgroundColor: Colors[colorScheme ?? 'light'].tabBarBackground,
             borderTopWidth: 1,
             borderTopColor: Colors[colorScheme ?? 'light'].cardBorder,
             paddingBottom: 8,
             height: 70,
           },
         }),
         tabBarLabelStyle: {
           fontSize: 11,
           fontWeight: '600',
           marginTop: 2,
           marginBottom: Platform.select({
             ios: 8,
             android: 4,
             default: 4,
           }),
         },
         tabBarIconStyle: {
           marginTop: 6,
         },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Academic',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="financial"
        options={{
          title: 'Financial',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Updates',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
