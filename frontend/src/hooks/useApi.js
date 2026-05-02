import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint, { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (!options.skip) fetch(options.params);
  }, [endpoint]);

  return { data, loading, error, refetch: fetch };
}

export function useMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (method, endpoint, body = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api[method](endpoint, body);
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error, setError };
}
