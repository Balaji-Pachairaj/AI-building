import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

/**
 * Fetch server health check status
 */
export const fetchHealthCheck = async () => {
  const response = await axiosClient.get(ENDPOINTS.HEALTH);
  return {
    ...response.data,
    duration: response.duration,
  };
};

/**
 * Fetch root welcome information
 */
export const fetchRootInfo = async () => {
  const response = await axiosClient.get('/');
  return {
    ...response.data,
    duration: response.duration,
  };
};
