/**
 * Centralized API Endpoints Configuration
 */
export const ENDPOINTS = {
  HEALTH: '/api/health',

  // Next Token Prediction Endpoints
  MODELS: '/get-models-id',
  NEXT_TOKEN: '/get-next-token',
  NEXT_TOKEN_HISTORY: '/get-next-token-history',

  // Boilerplate & Logging Endpoints
  BUILDING_STUFFS: '/building-stuffs',
  BUILDING_STUFFS_HIT: '/building-stuffs/hit',
  BUILDING_STUFFS_BY_ID: (id) => `/building-stuffs/${id}`,
  HIT: '/api/hit',
  LOGS: '/api/logs',
  LOGS_HIT: '/api/logs/hit',
  LOG_BY_ID: (id) => `/api/logs/${id}`,
};
