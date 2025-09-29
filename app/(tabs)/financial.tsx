import InvoicesTab from '@/components/financial/InvoicesTab';
import PaymentsTab from '@/components/financial/PaymentsTab';
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

export default function FinancialScreen() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Financial Information</Text>
        <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Your invoices and payment history</Text>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabContainer, { 
        backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invoices' && styles.activeTab]}
          onPress={() => setActiveTab('invoices')}
        >
          <View style={styles.tabContent}>
            <IconSymbol 
              name="doc.text.fill" 
              size={18} 
              color={activeTab === 'invoices' ? '#FFFFFF' : '#199BCF'} 
            />
            <Text style={[styles.tabText, activeTab === 'invoices' && styles.activeTabText]}>
              Invoices
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <View style={styles.tabContent}>
            <IconSymbol 
              name="creditcard.fill" 
              size={18} 
              color={activeTab === 'payments' ? '#FFFFFF' : '#199BCF'} 
            />
            <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
              Payments
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'invoices' ? (
          <InvoicesTab />
        ) : (
          <PaymentsTab />
        )}
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
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#6B7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
