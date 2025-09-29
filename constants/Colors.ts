/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#199BCF'; // Exact same as confirm enrollment button
const tintColorDark = '#87CEEB'; // Light sky blue for dark mode

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F8FAFC', // Light gray background instead of pure white
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#9CA3AF', // Lighter gray for inactive tabs
    tabIconSelected: tintColorLight,
    tabBarBackground: '#F8FAFC', // Light background for tab bar
    // Container colors
    cardBackground: '#FFFFFF', // Keep cards pure white for contrast
    cardBorder: '#E2E8F0', // Slightly darker border for better definition
    sectionBackground: '#F1F5F9', // Darker section background
    headerBackground: 'transparent',
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#199BCF',
    // Text colors
    textPrimary: '#1A3165',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    // Label and value colors for better contrast
    textLabel: '#374151', // Darker for labels
    textValue: '#6B7280', // Lighter for values
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#6B7280', // Darker gray for inactive tabs in dark mode
    tabIconSelected: tintColorDark,
    tabBarBackground: '#1F2937', // Dark background for tab bar
    // Container colors
    cardBackground: '#1F2937',
    cardBorder: '#4B5563',
    sectionBackground: '#111827',
    headerBackground: 'transparent',
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#87CEEB',
    // Text colors
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    // Label and value colors for better contrast
    textLabel: '#E5E7EB', // Lighter for labels in dark mode
    textValue: '#9CA3AF', // Darker for values in dark mode
  },
};
