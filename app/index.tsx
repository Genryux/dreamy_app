import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          // Check user type and route accordingly
          const userType = await SecureStore.getItemAsync('userType');
          if (userType === 'teacher') {
            router.replace('/(teacher)/dashboard');
          } else {
            router.replace('/(tabs)/dashboard');
          }
        } else {
          router.replace('/(auth)/login');
        }
      } catch (e) {
        router.replace('/(auth)/login');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
