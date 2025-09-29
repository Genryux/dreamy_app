import { apiService } from '@/services/api';
import { useEffect, useState } from 'react';

export function useAcademicData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const academicData = await apiService.getAcademicSummary();
      setData(academicData);
    } catch (err: any) {
      setError(err.message || 'Failed to load academic data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refresh: fetchData };
}

export function useSectionData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const sectionData = await apiService.getCurrentSection();
      setData(sectionData);
    } catch (err: any) {
      setError(err.message || 'Failed to load section data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refresh: fetchData };
}

export function useSubjectsData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const subjectsData = await apiService.getCurrentSubjects();
      setData(subjectsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refresh: fetchData };
}
