import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

/**
 * Next Token API Client Service
 */
export const nextTokenApi = {
  /**
   * Fetch available models with internal IDs ordered from cheaper to costliest
   */
  getModels: async () => {
    const response = await axiosClient.get(ENDPOINTS.MODELS);
    return response.data;
  },

  /**
   * Generate next N tokens for input sequence using selected model_id
   * @param {object} params
   * @param {string} params.input - User input text
   * @param {number} params.tokens - Number of tokens to predict
   * @param {number} params.model_id - Internal model ID
   */
  getNextToken: async ({ input, tokens, model_id }) => {
    const response = await axiosClient.get(ENDPOINTS.NEXT_TOKEN, {
      params: {
        input,
        tokens,
        model_id,
      },
    });
    return {
      data: response.data,
      duration: response.duration,
    };
  },

  /**
   * Retrieve historical next token generation requests from MongoDB
   * @param {object} params
   * @param {number} [params.page=1]
   * @param {number} [params.limit=10]
   */
  getHistory: async ({ page = 1, limit = 10 } = {}) => {
    const response = await axiosClient.get(ENDPOINTS.NEXT_TOKEN_HISTORY, {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Predict next-token probability distribution for a given prompt
   * @param {object} params
   * @param {string} params.prompt - Input prompt sequence
   * @param {number} [params.topK=10] - Number of candidate tokens
   * @param {number} [params.model_id=1] - Internal model ID
   */
  predictProbabilityDistribution: async ({ prompt, topK = 10, model_id = 1 }) => {
    const response = await axiosClient.post(ENDPOINTS.PREDICT_NEXT_TOKEN, {
      prompt,
      topK,
      model_id,
    });
    return {
      data: response.data,
      duration: response.duration,
    };
  },
};

export default nextTokenApi;
