const TokenHistory = require('../models/token-history.model');
const modelService = require('./model.service');
const openaiService = require('./openai.service');

/**
 * Service orchestrating Next Token Generation and History Retrieval.
 */
class NextTokenService {
  /**
   * Process next-token generation:
   * 1. Resolve model by model_id
   * 2. Call OpenAI API for token generation
   * 3. Persist record to MongoDB
   * 4. Return formatted response
   *
   * @param {object} params
   * @param {string} params.input - User input text
   * @param {number} params.tokens - Number of tokens to generate
   * @param {number} params.modelId - Internal model ID
   * @returns {Promise<object>}
   */
  async generateAndSaveNextTokens({ input, tokens, modelId }) {
    // 1. Resolve model
    const model = modelService.getModelById(modelId);
    if (!model) {
      const error = new Error('Invalid model_id');
      error.status = 400;
      throw error;
    }

    // 2. Call OpenAI API
    // Note: If OpenAI generation fails, an error is thrown here and nothing is saved to DB.
    const output = await openaiService.generateNextTokens({
      modelConfig: model,
      prompt: input,
      tokens,
    });

    // 3. Persist to MongoDB
    try {
      await TokenHistory.create({
        input,
        tokensRequested: tokens,
        modelId: model.id,
        modelName: model.name,
        output,
      });
    } catch (dbError) {
      console.error(`[NextTokenService] Database persistence failed: ${dbError.message}`);
      const err = new Error(`Database error saving token history: ${dbError.message}`);
      err.status = 500;
      throw err;
    }

    // 4. Return response
    return {
      input,
      tokens_requested: tokens,
      model_id: model.id,
      model_name: model.name,
      output,
    };
  }

  /**
   * Retrieve stored next-token generation history from MongoDB.
   *
   * @param {object} queryOptions
   * @param {number} [queryOptions.page=1]
   * @param {number} [queryOptions.limit=20]
   * @returns {Promise<object>}
   */
  async getHistory({ page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    try {
      const [records, total] = await Promise.all([
        TokenHistory.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        TokenHistory.countDocuments(),
      ]);

      const data = records.map((doc) => ({
        id: doc._id.toString(),
        input: doc.input,
        tokens_requested: doc.tokensRequested,
        model_id: doc.modelId,
        model_name: doc.modelName,
        output: doc.output,
        created_at: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
      }));

      return {
        data,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      };
    } catch (dbError) {
      console.error(`[NextTokenService] Failed to fetch history: ${dbError.message}`);
      const err = new Error(`Database error fetching token history: ${dbError.message}`);
      err.status = 500;
      throw err;
    }
  }
}

module.exports = new NextTokenService();
