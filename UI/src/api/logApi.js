import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

/**
 * Record an arbitrary API hit to POST /api/hit
 */
export const recordHit = async (payload) => {
  const response = await axiosClient.post(ENDPOINTS.HIT, payload);
  return response.data;
};

/**
 * Record a hit via the /api/logs/hit alias
 */
export const recordLogsHit = async (payload) => {
  const response = await axiosClient.post(ENDPOINTS.LOGS_HIT, payload);
  return response.data;
};

/**
 * Get all logs with pagination
 */
export const fetchLogs = async (params = { page: 1, limit: 10 }) => {
  const response = await axiosClient.get(ENDPOINTS.LOGS, { params });
  return response.data;
};

/**
 * Get single log by ID
 */
export const fetchLogById = async (id) => {
  const response = await axiosClient.get(ENDPOINTS.LOG_BY_ID(id));
  return response.data;
};

/**
 * Clear all logs
 */
export const clearAllLogs = async () => {
  const response = await axiosClient.delete(ENDPOINTS.LOGS);
  return response.data;
};
