import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

/**
 * Budget Padmanabhan API Client
 */
export const budgetApi = {
  // Fetch dashboard summary (Money spent, remaining, sorted tags list)
  getDashboardSummary: (params = {}) => {
    return axiosClient.get(ENDPOINTS.BUDGET_DASHBOARD, { params });
  },

  // Fetch all tags
  getTags: (params = {}) => {
    return axiosClient.get(ENDPOINTS.BUDGET_TAGS, { params });
  },

  // Create new tag (case-insensitive lowercase)
  createTag: (data) => {
    return axiosClient.post(ENDPOINTS.BUDGET_TAGS, data);
  },

  // Delete tag
  deleteTag: (id) => {
    return axiosClient.delete(ENDPOINTS.BUDGET_TAG_BY_ID(id));
  },

  // Get tag analytics (Total, Average, Timeline)
  getTagAnalysis: (tagName, params = {}) => {
    return axiosClient.get(ENDPOINTS.BUDGET_TAG_ANALYSIS(tagName), { params });
  },

  // Log new transaction
  createTransaction: (data) => {
    return axiosClient.post(ENDPOINTS.BUDGET_TRANSACTIONS, data);
  },

  // Fetch transactions list
  getTransactions: (params = {}) => {
    return axiosClient.get(ENDPOINTS.BUDGET_TRANSACTIONS, { params });
  },

  // Delete transaction
  deleteTransaction: (id) => {
    return axiosClient.delete(ENDPOINTS.BUDGET_TRANSACTION_BY_ID(id));
  },

  // Get budget settings
  getSettings: () => {
    return axiosClient.get(ENDPOINTS.BUDGET_SETTINGS);
  },

  // Update budget settings
  updateSettings: (data) => {
    return axiosClient.put(ENDPOINTS.BUDGET_SETTINGS, data);
  },
};

export default budgetApi;
