import { apiService, DashboardData } from '@/services/api';
import { useEffect, useState } from 'react';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await apiService.getDashboardData();
      setData(dashboardData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const refresh = () => {
    fetchDashboard();
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}
