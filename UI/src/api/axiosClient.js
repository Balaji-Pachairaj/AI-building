import axios from 'axios';

/**
 * Read backend API URL from environment variables
 * Vite exposes variables prefixed with VITE_ via import.meta.env
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Store reference to dispatch for interceptor notifications (injected from store setup)
let reduxDispatch = null;

export const injectStoreDispatch = (dispatch) => {
  reduxDispatch = dispatch;
};

/**
 * Create custom Axios instance
 */
const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// =========================================================================
// Request Interceptor: Logging, Correlation IDs, Timestamps
// =========================================================================
axiosClient.interceptors.request.use(
  (config) => {
    // Generate a unique client correlation ID for request tracing
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    config.headers['x-request-id'] = requestId;

    // Attach request start time for latency measurement
    config.metadata = { startTime: performance.now(), requestId };

    // In development mode, log outgoing requests
    if (import.meta.env.DEV) {
      console.log(`[HTTP Request] 🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        params: config.params,
        data: config.data,
        requestId,
      });
    }

    return config;
  },
  (error) => {
    console.error('[HTTP Request Error]', error);
    return Promise.reject(error);
  }
);

// =========================================================================
// Response Interceptor: Latency tracking, Data unwrapping, Error Handling
// =========================================================================
axiosClient.interceptors.response.use(
  (response) => {
    // Calculate response duration
    const duration = response.config?.metadata?.startTime
      ? Math.round(performance.now() - response.config.metadata.startTime)
      : null;

    if (import.meta.env.DEV) {
      console.log(
        `[HTTP Response] ✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`,
        response.data
      );
    }

    // Attach calculated duration to response for UI metrics
    response.duration = duration;

    return response;
  },
  (error) => {
    const originalRequest = error.config;
    const duration = originalRequest?.metadata?.startTime
      ? Math.round(performance.now() - originalRequest.metadata.startTime)
      : null;

    let standardizedError = {
      message: 'An unexpected error occurred.',
      status: error.response?.status || null,
      code: error.code,
      data: error.response?.data || null,
      duration,
    };

    if (error.response) {
      // Server responded with an error status (4xx, 5xx)
      const serverMessage =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        error.response.statusText;
      standardizedError.message = serverMessage || `Server returned error (${error.response.status})`;

      console.error(
        `[HTTP Error ${error.response.status}] ❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}:`,
        standardizedError.message
      );
    } else if (error.request) {
      // The request was made but no response was received (Network error, CORS, Server down)
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        standardizedError.message = 'Request timed out after 12 seconds. Server might be busy.';
      } else {
        standardizedError.message = `Cannot reach backend at ${BASE_URL}. Ensure the Express server is running.`;
      }
      console.error('[HTTP Network/Connectivity Error] ❌', standardizedError.message);
    } else {
      // Something happened setting up the request
      standardizedError.message = error.message;
      console.error('[HTTP Client Setup Error] ❌', error.message);
    }

    // If reduxDispatch is configured, dispatch a global error notification
    if (reduxDispatch && !originalRequest?.skipGlobalErrorToast) {
      // Dispatch error toast dynamically to avoid circular dependencies
      reduxDispatch({
        type: 'notifications/addNotification',
        payload: {
          type: 'error',
          title: `Request Failed (${standardizedError.status || standardizedError.code || 'Network'})`,
          message: standardizedError.message,
        },
      });
    }

    return Promise.reject(standardizedError);
  }
);

export default axiosClient;
