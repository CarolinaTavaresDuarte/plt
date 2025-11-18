import axios from 'axios';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const useApi = () => {
  const authContext = useAuth();
  const token = authContext ? authContext.token : null;

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

  return {
    get: async (url, config = {}) => {
      const response = await client.get(url, config);
      return response.data;
    },
    post: (url, data, config) => client.post(url, data, config),
    put: (url, data, config) => client.put(url, data, config),
    delete: (url, config) => client.delete(url, config),
  };
};