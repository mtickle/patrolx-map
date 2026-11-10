import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useApiDataEndpoint = (apiEndPoint, params = {}, refreshIntervalMs = 60000) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_PATROLX_API_URL || 'http://localhost:3001/api/';
    const API_KEY = import.meta.env.VITE_PATROLX_API_KEY;
    const serializedParams = JSON.stringify(params);

    const fetchData = useCallback(() => {
        if (!apiEndPoint) return;

        const client = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'x-api-key': API_KEY }
        });

        client
            .get(apiEndPoint, { params: JSON.parse(serializedParams) })
            .then((res) => {
                setData(Array.isArray(res.data) ? res.data : []);
                setError(null);
            })
            .catch((err) => {
                console.error(`Error fetching ${apiEndPoint}:`, err);
                setError(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [apiEndPoint, serializedParams, API_BASE_URL, API_KEY]);

    useEffect(() => {
        setIsLoading(true);
        fetchData();

        if (refreshIntervalMs > 0) {
            const timer = setInterval(fetchData, refreshIntervalMs);
            return () => clearInterval(timer);
        }
    }, [fetchData, refreshIntervalMs]);

    return { data, isLoading, error, refetch: fetchData };
};