import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAvailableTerms, usePaymentsData } from '@/hooks/useFinancial';
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

interface Payment {
  id: number;
  invoice_number: string;
  amount: number;
  payment_date: string;
  method: string;
  type: string;
  reference_no: string;
  status: string;
  total_discount?: number;
  original_amount?: number;
  early_discount?: number;
  custom_discounts?: number;
}

interface PaymentsTabProps {
  payments?: Payment[];
  loading?: boolean;
}

export default function PaymentsTab({ payments = [], loading = false }: PaymentsTabProps) {
  const [selectedTermId, setSelectedTermId] = useState<number | undefined>(undefined);
  const [showTermModal, setShowTermModal] = useState(false);
  const { data: apiData, loading: apiLoading, error, refresh } = usePaymentsData(selectedTermId);
  const { data: availableTerms, loading: termsLoading } = useAvailableTerms();
  const colorScheme = useColorScheme();


  // Use API data if available, otherwise fall back to props or show empty state
  const displayPayments = apiData?.payments?.length > 0 
    ? apiData.payments 
    : payments.length > 0 
    ? payments 
    : []; // Empty array instead of mock data

  const academicTerm = apiData?.academic_term || '-';
  const summary = apiData?.summary || {
    total_payments: 0,
    total_amount: 0,
    last_payment_date: null,
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

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'banknote.fill';
      case 'bank transfer':
      case 'bank_transfer':
        return 'building.2.fill';
      case 'credit card':
      case 'credit_card':
        return 'creditcard.fill';
      case 'check':
        return 'doc.text.fill';
      default:
        return 'dollarsign.circle.fill';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tuition':
        return 'graduationcap.fill';
      case 'miscellaneous':
      case 'misc':
        return 'list.bullet';
      case 'library':
        return 'book.fill';
      case 'laboratory':
        return 'flask.fill';
      default:
        return 'doc.text.fill';
    }
  };

  const renderPaymentCard = (payment: Payment) => (
    <View key={payment.id} style={[styles.paymentCard, { 
      backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
      borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
    }]}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentTitleContainer}>
          <Text style={[styles.paymentReference, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{payment.reference_no}</Text>
          <Text style={[styles.paymentDate, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{payment.payment_date}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{payment.status}</Text>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <View style={[styles.detailRow, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder }]}>
          <View style={styles.detailLabelContainer}>
            <IconSymbol name="dollarsign.circle.fill" size={14} color="#199BCF" />
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Amount:</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>₱{payment.amount.toLocaleString()}</Text>
        </View>
        
        {/* Total Discount - Show if discount exists */}
        {payment.total_discount && payment.total_discount > 0 && (
          <View style={[styles.detailRow, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder }]}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol name="percent" size={14} color="#199BCF" />
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Total Discount:</Text>
            </View>
            <Text style={[styles.detailValue, { color: '#10B981' }]}>-₱{payment.total_discount.toLocaleString()}</Text>
          </View>
        )}
        
        <View style={[styles.detailRow, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder }]}>
          <View style={styles.detailLabelContainer}>
            <IconSymbol name="doc.text.fill" size={14} color="#199BCF" />
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Invoice:</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>
            {payment.invoice_number || 'N/A'}
          </Text>
        </View>
        
        <View style={[styles.detailRow, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder }]}>
          <View style={styles.detailLabelContainer}>
            <IconSymbol name={getMethodIcon(payment.method)} size={14} color="#199BCF" />
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Payment Method:</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{payment.method}</Text>
        </View>
        
        <View style={[styles.detailRow, { borderBottomColor: 'transparent' }]}>
          <View style={styles.detailLabelContainer}>
            <IconSymbol name={getTypeIcon(payment.type)} size={14} color="#199BCF" />
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Payment Type:</Text>
          </View>
          <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{payment.type}</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading && !displayPayments.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading payment history...</Text>
      </View>
    );
  }

  if (error && !displayPayments.length) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <IconSymbol name="creditcard.fill" size={48} color="#199BCF" />
        </View>
        <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Unable to load payment history</Text>
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
      {/* Payment Summary */}
      <View style={[styles.summaryCard, { 
        backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
        borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
      }]}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryTitleContainer}>
            <Text style={[styles.summaryTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Payment Summary</Text>
          </View>
          <Text style={[styles.summarySubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{academicTerm}</Text>
        </View>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Total Payments</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{summary.total_payments.toString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Total Amount</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>₱{summary.total_amount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Last Payment</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{summary.last_payment_date || 'N/A'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Status</Text>
            <Text style={[styles.summaryValue, styles.successText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              {displayPayments.length > 0 ? 'Active' : 'No payments'}
            </Text>
          </View>
        </View>
      </View>

      {/* Payments Header */}
      <View style={styles.paymentsHeader}>
        <View style={styles.paymentsTitleRow}>
          <View style={styles.paymentsTitleContainer}>
            <IconSymbol name="list.bullet" size={20} color="#199BCF" />
            <Text style={[styles.paymentsTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Payment History</Text>
          </View>
          {availableTerms && availableTerms.length > 1 && (
            <View style={styles.termSelector}>
              <TouchableOpacity 
                style={[styles.termSelectorButton, {
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F3F4F6',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#E5E7EB'
                }]}
                onPress={() => setShowTermModal(true)}
              >
                <Text style={[styles.termSelectorText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                  {getCurrentTermName()}
                </Text>
                <IconSymbol name="chevron.down" size={12} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={[styles.paymentsSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{displayPayments.length.toString()} payments found</Text>
      </View>

      {displayPayments.length > 0 ? (
        <View style={styles.paymentsList}>
          {displayPayments.map(renderPaymentCard)}
        </View>
      ) : (
        <View style={[styles.emptyState, { 
          backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
        }]}>
          <View style={styles.emptyIconContainer}>
            <IconSymbol name="creditcard.fill" size={40} color="#199BCF" />
          </View>
          <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>No Payment History</Text>
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Your payment history will appear here once payments are made.
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
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder }]}>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Select Academic Term</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowTermModal(false)}
              >
                <IconSymbol name="xmark" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <TouchableOpacity
                style={[
                  styles.termOption,
                  { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder },
                  !selectedTermId && { backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground }
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
                    { borderBottomColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder },
                    selectedTermId === term.id && { backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].sectionBackground }
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
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  summaryHeader: {
    marginBottom: 12,
  },
  summaryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  summarySubtitle: {
    fontSize: 13,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 3,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  successText: {
    color: '#10B981',
  },
  paymentsHeader: {
    marginBottom: 16,
  },
  paymentsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3165',
    marginLeft: 8,
  },
  termSelector: {
    marginLeft: 10,
  },
  termSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  termSelectorText: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  paymentsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentsList: {
    gap: 12,
  },
  paymentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  paymentTitleContainer: {
    flex: 1,
  },
  paymentReference: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  paymentDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  paymentDetails: {
    gap: 0,
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
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
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
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  emptyIconContainer: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // Add backdrop blur effect using built-in React Native capabilities
    backdropFilter: 'blur(10px)',
  },
  modalContent: {
    borderRadius: 12,
    width: '100%',
    maxHeight: '70%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBody: {
    maxHeight: 300,
  },
  termOption: {
    padding: 14,
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
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 3,
  },
  termOptionTextSelected: {
    color: '#199BCF',
    fontWeight: '700',
  },
  termOptionCheck: {
    fontSize: 15,
    color: '#199BCF',
    fontWeight: '700',
  },
  unpaidIndicator: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 3,
  },
  unpaidIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  unpaidIndicatorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 4,
  },
  unpaidAmountText: {
    fontSize: 10,
    color: '#B91C1C',
    fontWeight: '700',
  },
});
