import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAvailableTerms, useInvoicesData } from '@/hooks/useFinancial';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Invoice {
  id: number;
  invoice_number: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  created_at: string;
  // due_date: string; // Removed: no due_date field in database
  items: Array<{
    id: number;
    fee_name: string;
    amount: number;
  }>;
  payment_status: string;
}

interface InvoicesTabProps {
  invoices?: Invoice[];
  loading?: boolean;
}

export default function InvoicesTab({ invoices = [], loading = false }: InvoicesTabProps) {
  const [selectedTermId, setSelectedTermId] = useState<number | undefined>(undefined);
  const [showTermModal, setShowTermModal] = useState(false);
  const { data: apiData, loading: apiLoading, error, refresh } = useInvoicesData(selectedTermId);
  const { data: availableTerms, loading: termsLoading } = useAvailableTerms();
  const colorScheme = useColorScheme();


  // Use API data if available, otherwise fall back to props or show empty state
  const displayInvoices = apiData?.invoices?.length > 0 
    ? apiData.invoices 
    : invoices.length > 0 
    ? invoices 
    : []; // Empty array instead of mock data

  const academicTerm = apiData?.academic_term || '-';
  const summary = apiData?.summary || {
    total_invoices: 0,
    total_amount: 0,
    total_paid: 0,
    total_balance: 0,
  };

  const isLoading = loading || apiLoading;

  const handleTermSelect = (termId: number | undefined) => {
    setSelectedTermId(termId);
    setShowTermModal(false);
  };

  const getCurrentTermName = () => {
    if (selectedTermId) {
      return availableTerms.find(t => t.id === selectedTermId)?.name || 'Select Term';
    }
    return 'Current Term';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10B981';
      case 'partial':
        return '#F59E0B';
      case 'unpaid':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partial';
      case 'unpaid':
        return 'Unpaid';
      default:
        return 'Unknown';
    }
  };

  const renderInvoiceCard = (invoice: Invoice) => (
    <View key={invoice.id} style={[styles.invoiceCard, { 
      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceTitleContainer}>
          <Text style={[styles.invoiceNumber, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{invoice.invoice_number}</Text>
          <Text style={[styles.invoiceDate, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{invoice.created_at}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.payment_status) }]}>
          <Text style={styles.statusText}>{getStatusText(invoice.payment_status)}</Text>
        </View>
      </View>
      
      <View style={styles.invoiceDetails}>
        <View style={[styles.detailRow, { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
          <View style={styles.detailLabelContainer}>
            <IconSymbol name="dollarsign.circle.fill" size={14} color="#199BCF" />
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Total Amount:</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>₱{invoice.total_amount.toLocaleString()}</Text>
        </View>
        
        <View style={[styles.detailRow, { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
          <View style={styles.detailLabelContainer}>
            <IconSymbol name="checkmark.circle.fill" size={14} color="#199BCF" />
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Paid Amount:</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>₱{invoice.paid_amount.toLocaleString()}</Text>
        </View>
        
        {/* Due Date removed - no due_date field in database */}
        
        {invoice.balance > 0 && (
          <View style={[styles.detailRow, { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#199BCF" />
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Balance:</Text>
            </View>
            <Text style={[styles.detailValue, styles.balanceText, { color: Colors[colorScheme ?? 'light'].textValue }]}>₱{invoice.balance.toLocaleString()}</Text>
          </View>
        )}
      </View>

      {invoice.items.length > 0 && (
        <View style={[styles.itemsSection, { borderTopColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
          <View style={styles.itemsTitleContainer}>
            <IconSymbol name="list.bullet" size={16} color="#199BCF" />
            <Text style={[styles.itemsTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Invoice Items:</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={[styles.itemName, { color: Colors[colorScheme ?? 'light'].textLabel }]}>{item.fee_name}</Text>
              <Text style={[styles.itemAmount, { color: Colors[colorScheme ?? 'light'].textValue }]}>₱{item.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading && !displayInvoices.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading invoices...</Text>
      </View>
    );
  }

  if (error && !displayInvoices.length) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <IconSymbol name="creditcard.fill" size={48} color="#199BCF" />
        </View>
        <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Unable to load invoices</Text>
        <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refresh} />
      }
    >
      {/* Financial Summary */}
      <View style={[styles.summaryCard, { 
        backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryTitleContainer}>
            <IconSymbol name="dollarsign.circle.fill" size={20} color="#199BCF" />
            <Text style={[styles.summaryTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Financial Summary</Text>
          </View>
          <Text style={[styles.summarySubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{academicTerm}</Text>
        </View>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Total Invoices</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{summary.total_invoices}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Total Amount</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>₱{summary.total_amount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Total Paid</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>₱{summary.total_paid.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Balance</Text>
            <Text style={[styles.summaryValue, summary.total_balance > 0 ? styles.balanceText : null, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              ₱{summary.total_balance.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Invoices Header */}
      <View style={styles.invoicesHeader}>
        <View style={styles.invoicesTitleRow}>
          <View style={styles.invoicesTitleContainer}>
            <IconSymbol name="doc.text.fill" size={20} color="#199BCF" />
            <Text style={[styles.invoicesTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Your Invoices</Text>
          </View>
          {availableTerms && availableTerms.length > 1 && (
            <View style={styles.termSelector}>
              <TouchableOpacity 
                style={styles.termSelectorButton}
                onPress={() => setShowTermModal(true)}
              >
                <Text style={styles.termSelectorText}>
                  {getCurrentTermName()}
                </Text>
                <Text style={styles.termSelectorIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={[styles.invoicesSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{displayInvoices.length} invoices found</Text>
      </View>

      {displayInvoices.length > 0 ? (
        <View style={styles.invoicesList}>
          {displayInvoices.map(renderInvoiceCard)}
        </View>
      ) : (
        <View style={[styles.emptyState, { 
          backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: Colors[colorScheme ?? 'light'].cardBorder 
        }]}>
          <View style={styles.emptyIconContainer}>
            <IconSymbol name="doc.text.fill" size={48} color="#199BCF" />
          </View>
          <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No Invoices Found</Text>
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Invoices will appear here once they are generated for your enrollment.
          </Text>
        </View>
      )}

      {/* Term Selection Modal */}
      <Modal
        visible={showTermModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTermModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            <View style={[styles.modalHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Select Academic Term</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowTermModal(false)}
              >
                <IconSymbol name="xmark" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <TouchableOpacity
                style={[
                  styles.termOption,
                  { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder },
                  !selectedTermId && { backgroundColor: Colors[colorScheme ?? 'light'].sectionBackground }
                ]}
                onPress={() => handleTermSelect(undefined)}
              >
                <View style={styles.termOptionContent}>
                  <View style={styles.termOptionLeft}>
                    <Text style={[
                      styles.termOptionText,
                      { color: Colors[colorScheme ?? 'light'].textPrimary },
                      !selectedTermId && styles.termOptionTextSelected
                    ]}>
                      Current Term
                    </Text>
                  </View>
                  <View style={styles.termOptionRight}>
                    {!selectedTermId && (
                      <IconSymbol name="checkmark" size={16} color="#199BCF" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              
              {availableTerms.map((term) => (
                <TouchableOpacity
                  key={term.id}
                  style={[
                    styles.termOption,
                    { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder },
                    selectedTermId === term.id && { backgroundColor: Colors[colorScheme ?? 'light'].sectionBackground }
                  ]}
                  onPress={() => handleTermSelect(term.id)}
                >
                  <View style={styles.termOptionContent}>
                    <View style={styles.termOptionLeft}>
                      <Text style={[
                        styles.termOptionText,
                        { color: Colors[colorScheme ?? 'light'].textPrimary },
                        selectedTermId === term.id && styles.termOptionTextSelected
                      ]}>
                        {term.name}
                      </Text>
                      {term.has_unpaid_invoices && (
                        <View style={styles.unpaidIndicator}>
                          <View style={styles.unpaidIndicatorContainer}>
                            <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#DC2626" />
                            <Text style={styles.unpaidIndicatorText}>
                              {term.unpaid_invoices_count} unpaid invoice{term.unpaid_invoices_count > 1 ? 's' : ''}
                            </Text>
                          </View>
                          <Text style={styles.unpaidAmountText}>
                            ₱{term.total_unpaid_amount?.toLocaleString() || '0'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.termOptionRight}>
                      {selectedTermId === term.id && (
                        <IconSymbol name="checkmark" size={16} color="#199BCF" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3165',
    marginLeft: 8,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1A3165',
    fontWeight: '700',
  },
  balanceText: {
    color: '#EF4444',
  },
  invoicesHeader: {
    marginBottom: 16,
  },
  invoicesTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  invoicesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoicesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3165',
    marginLeft: 8,
  },
  termSelector: {
    marginLeft: 12,
  },
  termSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  termSelectorText: {
    fontSize: 12,
    color: '#1A3165',
    fontWeight: '600',
    marginRight: 4,
  },
  termSelectorIcon: {
    fontSize: 10,
    color: '#6B7280',
  },
  invoicesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  invoicesList: {
    gap: 12,
  },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  invoiceTitleContainer: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A3165',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  itemsSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  itemsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3165',
    marginLeft: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemName: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  itemAmount: {
    fontSize: 14,
    color: '#1A3165',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '70%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalBody: {
    maxHeight: 300,
  },
  termOption: {
    padding: 16,
    borderBottomWidth: 1,
  },
  termOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  termOptionLeft: {
    flex: 1,
  },
  termOptionRight: {
    marginLeft: 12,
  },
  termOptionText: {
    fontSize: 16,
    color: '#1A3165',
    fontWeight: '500',
    marginBottom: 4,
  },
  termOptionTextSelected: {
    color: '#199BCF',
    fontWeight: '700',
  },
  termOptionCheck: {
    fontSize: 16,
    color: '#199BCF',
    fontWeight: '700',
  },
  unpaidIndicator: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 4,
  },
  unpaidIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  unpaidIndicatorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 4,
  },
  unpaidAmountText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '700',
  },
});
