import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAvailableTerms, useInvoicesData } from '@/hooks/useFinancial';
import { apiService } from '@/services/api';
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
  has_payment_plan: boolean;
  payment_mode: string | null; // 'flexible', 'installment', 'full', or null
  payment_plan?: {
    id: number;
    down_payment_amount: number;
    monthly_amount: number;
    first_month_amount: number;
    installment_months: number;
    schedules: Array<{
      installment_number: number;
      description: string;
      amount_due: number;
      amount_paid: number;
      due_date: string;
      status: string;
    }>;
  };
}

interface InvoicesTabProps {
  invoices?: Invoice[];
  loading?: boolean;
}

export default function InvoicesTab({ invoices = [], loading = false }: InvoicesTabProps) {
  const [selectedTermId, setSelectedTermId] = useState<number | undefined>(undefined);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showPaymentPlanModal, setShowPaymentPlanModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentPlanPreview, setPaymentPlanPreview] = useState<any>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isSettingOneTime, setIsSettingOneTime] = useState(false);
  const { data: apiData, loading: apiLoading, error, refresh } = useInvoicesData(selectedTermId);
  const { data: availableTerms, loading: termsLoading, error: termsError } = useAvailableTerms();
  const colorScheme = useColorScheme();

  // Helper function to format numbers consistently
  const formatCurrency = (amount: number | string | null | undefined): string => {
    const numAmount = Number(amount || 0);
    return numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };


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

    const handleMonthlyInstallmentClick = async (invoice: Invoice) => {
      setSelectedInvoice(invoice);
      
      try {
        // Calculate payment plan preview using apiService
        // Down payment will be fetched from SchoolSettings by the API
        const data = await apiService.calculatePaymentPlan({
          total_amount: invoice.total_amount,
          installment_months: 9,
        });
      
      setPaymentPlanPreview(data);
      setShowPaymentPlanModal(true);
    } catch (error) {
      console.error('Error calculating payment plan:', error);
    }
  };

  const handleConfirmPaymentPlan = async () => {
    if (!selectedInvoice) return;
    
    setIsCreatingPlan(true);
    try {
      // Call API to create payment plan using apiService
      await apiService.selectPaymentPlan(selectedInvoice.id, 'installment');
      
      setShowPaymentPlanModal(false);
      setSelectedInvoice(null);
      setPaymentPlanPreview(null);
      
      // Add small delay to ensure DB transaction is fully committed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh invoices to show updated data
      await refresh();
    } catch (error) {
      console.error('Error creating payment plan:', error);
      alert('Failed to create payment plan. Please try again.');
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleCancelPaymentPlan = () => {
    setShowPaymentPlanModal(false);
    setSelectedInvoice(null);
    setPaymentPlanPreview(null);
  };

  const handleOneTimePaymentClick = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsSettingOneTime(true);
    
    try {
      // Call API to set payment mode to full using apiService
      await apiService.selectPaymentPlan(invoice.id, 'full');
      
      // Add small delay to ensure DB update is committed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh invoices to show updated data
      await refresh();
    } catch (error) {
      console.error('Error setting one-time payment:', error);
      alert('Failed to set payment mode. Please try again.');
    } finally {
      setIsSettingOneTime(false);
    }
  };

  const renderInvoiceCard = (invoice: Invoice) => (
    <View key={invoice.id} style={styles.invoiceContainer}>
      {/* Invoice Details Container */}
      <View style={[styles.invoiceCard, { 
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
            <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>₱{Number(invoice.total_amount).toLocaleString()}</Text>
          </View>
          
          <View style={[styles.detailRow, { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol name="checkmark.circle.fill" size={14} color="#199BCF" />
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Paid Amount:</Text>
            </View>
            <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>₱{Number(invoice.paid_amount).toLocaleString()}</Text>
          </View>
          
          {invoice.balance > 0 && (
            <View style={[styles.detailRow, { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
              <View style={styles.detailLabelContainer}>
                <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#199BCF" />
                <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Balance:</Text>
              </View>
              <Text style={[styles.detailValue, styles.balanceText, { color: Colors[colorScheme ?? 'light'].textValue }]}>₱{Number(invoice.balance).toLocaleString()}</Text>
            </View>
          )}
        </View>

        {invoice.items && invoice.items.length > 0 && (
          <View style={[styles.itemsSection, { borderTopColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
            <View style={styles.itemsTitleContainer}>
              <IconSymbol name="list.bullet" size={16} color="#199BCF" />
              <Text style={[styles.itemsTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Invoice Items:</Text>
            </View>
            {invoice.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={[styles.itemName, { color: Colors[colorScheme ?? 'light'].textLabel }]}>{item.fee_name || 'Fee'}</Text>
                <Text style={[styles.itemAmount, { color: Colors[colorScheme ?? 'light'].textValue }]}>₱{Number(item.amount || 0).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {(invoice.payment_status === 'unpaid' && !invoice.has_payment_plan && invoice.balance > 0 && (invoice.payment_mode === 'flexible' || !invoice.payment_mode)) && (
          <View style={[styles.paymentPlanSection, { borderTopColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
            <Text style={[styles.paymentPlanTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Choose Payment Option:</Text>
            
            <TouchableOpacity
              style={[styles.paymentButton, styles.oneTimeButton]}
              onPress={() => handleOneTimePaymentClick(invoice)}
              disabled={isSettingOneTime}
            >
              <View style={styles.buttonContent}>
                {isSettingOneTime ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <IconSymbol name="dollarsign.circle.fill" size={20} color="#FFFFFF" />
                )}
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>
                    {isSettingOneTime ? 'Setting...' : 'One-Time Payment'}
                  </Text>
                  <Text style={styles.buttonSubtitle}>Pay the full amount</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentButton, styles.installmentButton]}
              onPress={() => handleMonthlyInstallmentClick(invoice)}
            >
              <View style={styles.buttonContent}>
                <IconSymbol name="calendar" size={20} color="#6B7280" />
                <View style={styles.buttonTextContainer}>
                  <Text style={[styles.buttonTitle, styles.installmentButtonText]}>Monthly Installment</Text>
                  <Text style={[styles.buttonSubtitle, styles.installmentButtonSubtext]}>Pay over 9 months</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Payment Plan Container - FIXED CONDITION */}
      {((invoice.has_payment_plan === true || invoice.has_payment_plan === 1) && invoice.payment_plan && invoice.payment_plan.id) && (
        <View style={[styles.paymentPlanCard, { 
          backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: Colors[colorScheme ?? 'light'].cardBorder 
        }]}>
          <View style={styles.planHeader}>
            <IconSymbol name="calendar" size={18} color="#199BCF" />
            <Text style={[styles.planHeaderText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              {(() => {
                const mode = String(invoice.payment_mode || '');
                if (mode === 'installment') return 'Monthly Installment Plan';
                if (mode === 'full') return 'One-Time Payment';
                return 'Payment Plan';
              })()}
            </Text>
          </View>
          
          {String(invoice.payment_mode || '') === 'installment' && (
            <>
              {/* Payment Summary - SAFE VERSION */}
              {(invoice.payment_plan?.down_payment_amount !== null || invoice.payment_plan?.monthly_amount !== null) && (
                <View style={styles.planSummary}>
                  {invoice.payment_plan?.down_payment_amount !== null && (
                    <View style={[styles.planSummaryItem, {
                      backgroundColor: '#F8FAFC',
                      borderColor: '#199BCF',
                      borderWidth: 1,
                    }]}>
                      <Text style={[styles.planLabel, { color: '#374151' }]}>Down Payment</Text>
                      <Text style={[styles.planValue, { color: '#199BCF' }]}>
                        ₱{(() => {
                          const amount = Number(invoice.payment_plan?.down_payment_amount || 0);
                          return isNaN(amount) ? '0' : amount.toLocaleString();
                        })()}
                      </Text>
                    </View>
                  )}
                  {invoice.payment_plan?.monthly_amount !== null && (
                    <View style={[styles.planSummaryItem, {
                      backgroundColor: '#F8FAFC',
                      borderColor: '#199BCF',
                      borderWidth: 1,
                    }]}>
                      <Text style={[styles.planLabel, { color: '#374151' }]}>Monthly Amount</Text>
                      <Text style={[styles.planValue, { color: '#199BCF' }]}>
                        ₱{(() => {
                          const amount = Number(invoice.payment_plan?.monthly_amount || 0);
                          return isNaN(amount) ? '0' : amount.toLocaleString();
                        })()}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* Upcoming Payments Section - SAFE VERSION */}
              {invoice.payment_plan?.schedules && Array.isArray(invoice.payment_plan.schedules) && invoice.payment_plan.schedules.length > 0 && (
                <View style={styles.upcomingPaymentsSection}>
                  <Text style={[styles.upcomingTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                    Payment Schedule
                  </Text>
                  
                  <View style={styles.scheduleList}>
                    {invoice.payment_plan.schedules.map((schedule, index) => {
                      // Ultra-safe extraction with comprehensive fallbacks
                      const installmentNumber = Number(schedule?.installment_number) || index || 0;
                      const description = String(schedule?.description || 'Payment');
                      const amountDue = Number(schedule?.amount_due) || 0;
                      const amountPaid = Number(schedule?.amount_paid) || 0;
                      const dueDate = schedule?.due_date ? String(schedule.due_date) : null;
                      const status = String(schedule?.status || 'pending');
                      
                      return (
                        <View key={installmentNumber} style={[styles.scheduleItem, { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
                          <View style={styles.scheduleLeft}>
                            <Text style={[styles.scheduleDescription, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                              {description}
                            </Text>
                            <View style={styles.scheduleDetailsRow}>
                              <Text style={[styles.scheduleAmount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                                ₱{isNaN(amountDue) ? '0' : amountDue.toLocaleString()}
                              </Text>
                              {dueDate && (
                                <>
                                  <Text style={[styles.scheduleSeparator, { color: Colors[colorScheme ?? 'light'].textSecondary }]}> • </Text>
                                  <Text style={[styles.scheduleDueDate, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                                    {dueDate}
                                  </Text>
                                </>
                              )}
                            </View>
                            {amountPaid > 0 && (
                              <Text style={styles.schedulePaidAmount}>
                                Paid: ₱{isNaN(amountPaid) ? '0' : amountPaid.toLocaleString()}
                              </Text>
                            )}
                          </View>
                          <View style={[styles.scheduleStatus, { 
                            backgroundColor: status === 'paid' ? '#10B981' : 
                                           status === 'partial' ? '#F59E0B' : 
                                           status === 'overdue' ? '#EF4444' : '#6B7280' 
                          }]}>
                            <Text style={styles.scheduleStatusText}>{status}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* One-Time Payment Confirmation Container */}
      {(invoice.payment_mode === 'full' && !invoice.has_payment_plan) && (
        <View style={[styles.paymentPlanCard, { 
          backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
          borderColor: Colors[colorScheme ?? 'light'].cardBorder 
        }]}>
          <View style={styles.planHeader}>
            <IconSymbol name="dollarsign.circle.fill" size={18} color="#199BCF" />
            <Text style={[styles.planHeaderText, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              One-Time Payment Selected
            </Text>
          </View>
          
          <View style={[styles.oneTimePaymentSummary, { 
            backgroundColor: Colors[colorScheme ?? 'light'].sectionBackground,
            borderColor: '#199BCF',
            borderWidth: 1,
            borderRadius: 8,
          }]}>
            <View style={styles.oneTimePaymentRow}>
              <View style={styles.oneTimePaymentLeft}>
                <Text style={[styles.oneTimePaymentLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Payment Mode</Text>
                <Text style={[styles.oneTimePaymentValue, { color: '#199BCF' }]}>One-Time Payment</Text>
              </View>
              <View style={styles.oneTimePaymentRight}>
                <Text style={[styles.oneTimePaymentLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Total Amount</Text>
                <Text style={[styles.oneTimePaymentValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>₱{Number(invoice.total_amount).toLocaleString()}</Text>
              </View>
            </View>
          </View>
          
          <Text style={[styles.planNote, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            You can pay the full amount at any time. Contact the school for payment instructions.
          </Text>
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
            <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>{summary.total_invoices.toString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Total Amount</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>₱{Number(summary.total_amount).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Total Paid</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>₱{Number(summary.total_paid).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Balance</Text>
            <Text style={[styles.summaryValue, summary.total_balance > 0 ? styles.balanceText : null, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
              ₱{Number(summary.total_balance).toLocaleString()}
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
                <IconSymbol name="chevron.down" size={12} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={[styles.invoicesSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{displayInvoices.length.toString()} invoices found</Text>
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

      {/* Payment Plan Breakdown Modal */}
      <Modal
        visible={showPaymentPlanModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelPaymentPlan}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.paymentPlanModal, { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            <View style={[styles.modalHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Monthly Installment Plan</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={handleCancelPaymentPlan}
              >
                <IconSymbol name="xmark" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.paymentPlanModalBody}>
              {paymentPlanPreview && paymentPlanPreview.plan && (
                <View style={styles.planBreakdown}>
                  <Text style={[styles.breakdownTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                    Payment Breakdown
                  </Text>
                  
                  <View style={[styles.breakdownSummary, { backgroundColor: Colors[colorScheme ?? 'light'].sectionBackground }]}>
                    <View style={styles.breakdownRow}>
                      <Text style={[styles.breakdownLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Total Amount</Text>
                      <Text style={[styles.breakdownValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>₱{Number(paymentPlanPreview.plan.total_amount || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={[styles.breakdownLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Down Payment</Text>
                      <Text style={[styles.breakdownValue, styles.downPaymentValue]}>₱{Number(paymentPlanPreview.plan.down_payment_amount || 0).toLocaleString()}</Text>
                    </View>
                    <View style={[styles.breakdownRow, styles.remainingRow]}>
                      <Text style={[styles.breakdownLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Remaining Balance</Text>
                      <Text style={[styles.breakdownValue, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>₱{Number(paymentPlanPreview.plan.remaining_amount || 0).toLocaleString()}</Text>
                    </View>
                  </View>

                  {/* Warning Message */}
                  <View style={[styles.warningContainer, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}>
                    <View style={styles.warningContent}>
                      <Text style={styles.warningText}>
                        💡 Please note: These computations may vary depending on your actual down payment. If you fall short with the down payment, the remaining amount will be added to your first monthly billing.
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.scheduleTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                    Payment Schedule (9 Months)
                  </Text>

                  {paymentPlanPreview.schedule && Array.isArray(paymentPlanPreview.schedule) && paymentPlanPreview.schedule.map((item: any, index: number) => (
                    <View key={index} style={[styles.scheduleItemBreakdown, { borderBottomColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
                      <View style={styles.scheduleItemLeft}>
                        <Text style={[styles.scheduleItemDescription, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                          {String(item.description || 'Payment')}
                        </Text>
                        {item.due_date && (
                          <Text style={[styles.scheduleItemDate, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                            Due: {String(item.due_date)}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.scheduleItemAmount, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>
                        ₱{Number(item.amount || 0).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: Colors[colorScheme ?? 'light'].cardBorder }]}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelPaymentPlan}
                disabled={isCreatingPlan}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmPaymentPlan}
                disabled={isCreatingPlan}
              >
                {isCreatingPlan ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Plan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  invoiceContainer: {
    marginBottom: 16,
    gap: 12,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentPlanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
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
  paymentPlanModalBody: {
    flex: 1,
    paddingBottom: 20,
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
  // Payment Plan Selection Styles
  paymentPlanSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  paymentPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3165',
    marginBottom: 8,
  },
  paymentButton: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  oneTimeButton: {
    backgroundColor: '#199BCF',
    borderColor: '#199BCF',
  },
  installmentButton: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: '#E0F2FE',
  },
  installmentButtonText: {
    color: '#1A3165',
  },
  installmentButtonSubtext: {
    color: '#6B7280',
  },
  // Payment Plan Display Styles
  paymentPlanDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  planHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3165',
  },
  planSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  planSummaryItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
  },
  planLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  planValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3165',
  },
  scheduleList: {
    gap: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  scheduleLeft: {
    flex: 1,
  },
  scheduleDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A3165',
    marginBottom: 2,
  },
  scheduleAmount: {
    fontSize: 12,
    color: '#6B7280',
  },
  scheduleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scheduleStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  scheduleMore: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  // Payment Plan Modal Styles
  paymentPlanModal: {
    flex: 1,
    maxHeight: '80%',
  },
  planBreakdown: {
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 12,
  },
  breakdownSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  remainingRow: {
    marginBottom: 0,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3165',
  },
  downPaymentValue: {
    color: '#199BCF',
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3165',
    marginBottom: 12,
  },
  scheduleItemBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  scheduleItemLeft: {
    flex: 1,
  },
  scheduleItemDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A3165',
    marginBottom: 2,
  },
  scheduleItemDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  scheduleItemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3165',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: '#199BCF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  // Current Due Payment Highlight Styles
  currentDueCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentDueHeader: {
    marginBottom: 12,
  },
  currentDueTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  currentDueBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentDueLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentDueDateText: {
    fontSize: 12,
  },
  currentDueAmount: {
    fontSize: 24,
    fontWeight: '800',
  },
  currentDuePaid: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 8,
  },
  // Upcoming Payments Section Styles
  upcomingPaymentsSection: {
    marginTop: 8,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  scheduleDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scheduleSeparator: {
    fontSize: 12,
  },
  scheduleDueDate: {
    fontSize: 11,
  },
  schedulePaidAmount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  // One-Time Payment Styles
  oneTimePaymentSummary: {
    padding: 16,
    marginBottom: 12,
  },
  oneTimePaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  oneTimePaymentLeft: {
    flex: 1,
    marginRight: 16,
  },
  oneTimePaymentRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  oneTimePaymentLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  oneTimePaymentValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Warning Message Styles
  warningContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    marginTop: 4,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  // Loading styles
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
});
