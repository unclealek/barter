// hooks/useLoadingState.js
import { useState } from 'react';

export function useLoadingState(initialState = false) {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const withLoading = async (callback) => {
    try {
      setLoading(true);
      setError(null);
      await callback();
    } catch (err) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, withLoading };
}
