import { apiService } from '@/services/api';
import { useEffect, useState } from 'react';

export function useFinancialData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const financialData = await apiService.getFinancialSummary();
      setData(financialData);
    } catch (err: any) {
      setError(err.message || 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refresh: fetchData };
}

export function useInvoicesData(termId?: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const invoicesData = await apiService.getCurrentInvoices(termId);
      setData(invoicesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [termId]);

  return { data, loading, error, refresh: fetchData };
}

export function usePaymentsData(termId?: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const paymentsData = await apiService.getCurrentPaymentHistory(termId);
      setData(paymentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [termId]);

  return { data, loading, error, refresh: fetchData };
}

export function useAvailableTerms() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const termsData = await apiService.getAvailableTerms();
      setData(termsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load available terms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refresh: fetchData };
}
