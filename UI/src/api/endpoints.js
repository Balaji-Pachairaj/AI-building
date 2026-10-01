/**
 * Centralized API Endpoints Configuration
 */
export const ENDPOINTS = {
  HEALTH: '/api/health',

  // Next Token Prediction Endpoints
  MODELS: '/get-models-id',
  NEXT_TOKEN: '/get-next-token',
  NEXT_TOKEN_HISTORY: '/get-next-token-history',
  PREDICT_NEXT_TOKEN: '/api/predict-next-token',

  // Boilerplate & Logging Endpoints
  BUILDING_STUFFS: '/building-stuffs',
  BUILDING_STUFFS_HIT: '/building-stuffs/hit',
  BUILDING_STUFFS_BY_ID: (id) => `/building-stuffs/${id}`,
  HIT: '/api/hit',
  LOGS: '/api/logs',
  LOGS_HIT: '/api/logs/hit',
  LOG_BY_ID: (id) => `/api/logs/${id}`,

  // Budget Padmanabhan Endpoints
  BUDGET_DASHBOARD: '/api/budget/dashboard',
  BUDGET_TAGS: '/api/budget/tags',
  BUDGET_TAG_BY_ID: (id) => `/api/budget/tags/${id}`,
  BUDGET_TAG_ANALYSIS: (tagName) => `/api/budget/tags/${encodeURIComponent(tagName)}/analysis`,
  BUDGET_TRANSACTIONS: '/api/budget/transactions',
  BUDGET_TRANSACTION_BY_ID: (id) => `/api/budget/transactions/${id}`,
  BUDGET_SETTINGS: '/api/budget/settings',
};
