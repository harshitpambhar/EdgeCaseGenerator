import { useState, useCallback } from 'react';
import { handleApiError } from '../utils/api-utils';

export const useFetch = (apiCall, initialData = null, shouldFetchOnMount = true) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(...args);
      setData(result?.data || result);
      return result?.data || result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset,
  };
};

export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setStatus('pending');
      setData(null);
      setError(null);
      try {
        const result = await asyncFunction(...args);
        setData(result);
        setStatus('success');
        return result;
      } catch (error) {
        setError(error);
        setStatus('error');
        throw error;
      }
    },
    [asyncFunction]
  );

  if (immediate) {
    React.useEffect(() => {
      execute();
    }, [execute]);
  }

  return { execute, status, data, error };
};
