import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * The configured base URL of the Octraban indexer backend.
 * Defaults to http://localhost:3001 (see README for the frontend/backend contract).
 */
export const getApiBaseUrl = (): string => API_BASE_URL;

/**
 * Lightweight connection check against the backend health endpoint.
 * Returns true when the indexer is reachable, false otherwise.
 * Never throws so callers can render a non-blocking banner.
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/api/health');
    return response.status >= 200 && response.status < 300;
  } catch {
    return false;
  }
};

export default api;
