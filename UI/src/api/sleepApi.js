import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

/**
 * Sleep API service calls
 */
const sleepApi = {
  getSleepStatus: () => axiosClient.get(ENDPOINTS.SLEEP_STATUS),

  recordSleep: (data = {}) => axiosClient.post(ENDPOINTS.SLEEP_RECORD, data),

  recordWakeUp: (data = {}) => axiosClient.post(ENDPOINTS.SLEEP_WAKE_UP, data),

  getSleepAnalytics: () => axiosClient.get(ENDPOINTS.SLEEP_ANALYTICS),

  getSleepRecords: () => axiosClient.get(ENDPOINTS.SLEEP_RECORDS),

  updateSleepSession: (id, data) => axiosClient.put(ENDPOINTS.SLEEP_SESSION_BY_ID(id), data),

  deleteSleepSession: (id) => axiosClient.delete(ENDPOINTS.SLEEP_SESSION_BY_ID(id)),
};

export default sleepApi;

