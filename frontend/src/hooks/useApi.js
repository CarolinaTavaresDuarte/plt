import axios from 'axios';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const useApi = () => {
  const { token } = useAuth();

  const client = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL
    });

    instance.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [token]);

  return client;
};