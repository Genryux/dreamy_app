import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';

// Custom floating tab bar background for Android/Web
export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  
  return (
    <View 
      style={{
        backgroundColor: Colors[colorScheme ?? 'light'].tabBarBackground,
        flex: 1,
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
