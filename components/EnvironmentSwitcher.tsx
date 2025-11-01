import { API_CONFIG, switchEnvironment } from '@/config/api';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function EnvironmentSwitcher() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [currentEnv, setCurrentEnv] = useState<'HOME' | 'PRODUCTION'>('PRODUCTION');

  const handleSwitch = (env: 'HOME' | 'PRODUCTION') => {
    const config = switchEnvironment(env);
    setCurrentEnv(env);
    
    Alert.alert(
      'Environment Switched',
      `Now using: ${config.name}\nAPI: ${config.BASE_URL}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Network Environment
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            currentEnv === 'HOME' && styles.activeButton,
            { borderColor: colors.cardBorder }
          ]}
          onPress={() => handleSwitch('HOME')}
        >
          <Text style={[
            styles.buttonText,
            { color: currentEnv === 'HOME' ? colors.tint : colors.textSecondary }
          ]}>
            🏠 Home WiFi
          </Text>
          <Text style={[styles.subText, { color: colors.textTertiary }]}>
            MAMP Server
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            currentEnv === 'PRODUCTION' && styles.activeButton,
            { borderColor: colors.cardBorder }
          ]}
          onPress={() => handleSwitch('PRODUCTION')}
        >
          <Text style={[
            styles.buttonText,
            { color: currentEnv === 'PRODUCTION' ? colors.tint : colors.textSecondary }
          ]}>
            ☁️ Production
          </Text>
          <Text style={[styles.subText, { color: colors.textTertiary }]}>
            AWS Server
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.currentConfig, { color: colors.textSecondary }]}>
        Current: {API_CONFIG[currentEnv].name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(25, 155, 207, 0.1)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  currentConfig: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});
