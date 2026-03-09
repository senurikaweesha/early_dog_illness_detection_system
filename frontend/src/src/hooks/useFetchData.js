import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';

export const useFetchData = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [fetchFunction, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData, ...dependencies]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
};
