import { API_CONFIG, getCurrentConfig } from '@/config/api';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ConfigTest() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const config = getCurrentConfig();

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        🔧 Configuration Test
      </Text>
      
      <View style={styles.configItem}>
        <Text style={[styles.label, { color: colors.textLabel }]}>Current Environment:</Text>
        <Text style={[styles.value, { color: colors.textValue }]}>{config.name}</Text>
      </View>
      
      <View style={styles.configItem}>
        <Text style={[styles.label, { color: colors.textLabel }]}>API URL:</Text>
        <Text style={[styles.value, { color: colors.textValue }]}>{config.BASE_URL}</Text>
      </View>
      
      <View style={styles.configItem}>
        <Text style={[styles.label, { color: colors.textLabel }]}>WebSocket Host:</Text>
        <Text style={[styles.value, { color: colors.textValue }]}>{config.REVERB_HOST}</Text>
      </View>
      
      <View style={styles.configItem}>
        <Text style={[styles.label, { color: colors.textLabel }]}>Available Environments:</Text>
        <Text style={[styles.value, { color: colors.textValue }]}>
          🏠 {API_CONFIG.HOME.name} - {API_CONFIG.HOME.BASE_URL}
        </Text>
        <Text style={[styles.value, { color: colors.textValue }]}>
          ☁️ {API_CONFIG.PRODUCTION.name} - {API_CONFIG.PRODUCTION.BASE_URL}
        </Text>
      </View>
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
  configItem: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    marginTop: 2,
  },
});
