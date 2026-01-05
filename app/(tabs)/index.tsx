import SectionsTab from '@/components/academic/SectionsTab';
import SubjectsTab from '@/components/academic/SubjectsTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AcademicInfoScreen() {
  const [activeTab, setActiveTab] = useState<'subjects' | 'sections'>('subjects');
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
      <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Academic Information</Text>
        <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Your academic details and class information</Text>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabContainer, { 
        backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'subjects' && styles.activeTab]}
          onPress={() => setActiveTab('subjects')}
        >
          <View style={styles.tabContent}>
            <IconSymbol 
              name="book.fill" 
              size={18} 
              color={activeTab === 'subjects' ? '#FFFFFF' : '#199BCF'} 
            />
            <Text style={[styles.tabText, { 
              color: activeTab === 'subjects' ? '#FFFFFF' : Colors[colorScheme ?? 'light'].textSecondary 
            }]}>
              Subjects
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sections' && styles.activeTab]}
          onPress={() => setActiveTab('sections')}
        >
          <View style={styles.tabContent}>
            <IconSymbol 
              name="person.2.fill" 
              size={18} 
              color={activeTab === 'sections' ? '#FFFFFF' : '#199BCF'} 
            />
            <Text style={[styles.tabText, { 
              color: activeTab === 'sections' ? '#FFFFFF' : Colors[colorScheme ?? 'light'].textSecondary 
            }]}>
              Sections
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'subjects' ? (
          <SubjectsTab />
        ) : (
          <SectionsTab />
        )}
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#199BCF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
