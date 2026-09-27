const nextTokenService = require('../services/next-token.service');
const modelService = require('../services/model.service');

const MAX_TOKENS_LIMIT = parseInt(process.env.MAX_TOKENS, 10) || 500;

/**
 * @desc    Generate next N tokens from user-provided input using an OpenAI model
 * @route   GET /get-next-token
 * @access  Public
 */
const getNextToken = async (req, res, next) => {
  try {
    const { input, tokens, model_id } = req.query;

    // 1. Validate 'input'
    if (input === undefined || input === null) {
      return res.status(400).json({
        error: {
          message: 'input query parameter is required',
        },
      });
    }

    if (typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'input must be a non-empty string',
        },
      });
    }

    // 2. Validate 'tokens'
    if (tokens === undefined || tokens === null || tokens === '') {
      return res.status(400).json({
        error: {
          message: 'tokens query parameter is required',
        },
      });
    }

    const tokensNum = Number(tokens);
    if (!Number.isInteger(tokensNum) || tokensNum <= 0) {
      return res.status(400).json({
        error: {
          message: 'tokens parameter must be a positive integer',
        },
      });
    }

    if (tokensNum > MAX_TOKENS_LIMIT) {
      return res.status(400).json({
        error: {
          message: `tokens parameter cannot exceed ${MAX_TOKENS_LIMIT}`,
        },
      });
    }

    // 3. Validate 'model_id'
    if (model_id === undefined || model_id === null || model_id === '') {
      return res.status(400).json({
        error: {
          message: 'model_id query parameter is required',
        },
      });
    }

    const modelIdNum = Number(model_id);
    if (!Number.isInteger(modelIdNum) || !modelService.isValidModelId(modelIdNum)) {
      return res.status(400).json({
        error: {
          message: 'Invalid model_id',
        },
      });
    }

    // 4. Call NextTokenService
    const result = await nextTokenService.generateAndSaveNextTokens({
      input: input.trim(),
      tokens: tokensNum,
      modelId: modelIdNum,
    });

    return res.status(200).json({
      input: result.input,
      tokens_requested: result.tokens_requested,
      model_id: result.model_id,
      model_name: result.model_name,
      output: result.output,
    });
  } catch (error) {
    const statusCode = error.status || error.statusCode || 500;
    return res.status(statusCode).json({
      error: {
        message: error.message || 'Internal server error',
      },
    });
  }
};

/**
 * @desc    Retrieve previously stored token generation history from MongoDB
 * @route   GET /get-next-token-history
 * @access  Public
 */
const getNextTokenHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await nextTokenService.getHistory({ page, limit });

    return res.status(200).json({
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    const statusCode = error.status || error.statusCode || 500;
    return res.status(statusCode).json({
      error: {
        message: error.message || 'Failed to retrieve token history',
      },
    });
  }
};

/**
 * @desc    Predict next-token probability distribution for a given prompt
 * @route   POST /api/predict-next-token or POST /predict-next-token
 * @access  Public
 */
const predictNextToken = async (req, res, next) => {
  try {
    const prompt =
      req.body?.prompt !== undefined
        ? req.body.prompt
        : req.query?.prompt !== undefined
        ? req.query.prompt
        : undefined;

    // Validate prompt presence
    if (prompt === undefined || prompt === null) {
      return res.status(400).json({
        error: {
          message: 'prompt parameter is required in request body or query string',
        },
      });
    }

    if (typeof prompt !== 'string') {
      return res.status(400).json({
        error: {
          message: 'prompt must be a string',
        },
      });
    }

    // Parse topK
    const rawTopK = req.body?.topK ?? req.body?.top_k ?? req.query?.topK ?? req.query?.top_k ?? 10;
    const topKNum = parseInt(rawTopK, 10);
    const topK = isNaN(topKNum) || topKNum < 1 ? 10 : Math.min(20, topKNum);

    // Parse model_id
    const rawModelId = req.body?.model_id ?? req.query?.model_id ?? 1;
    let modelId = parseInt(rawModelId, 10);
    if (isNaN(modelId) || !modelService.isValidModelId(modelId)) {
      modelId = 1;
    }

    // Call service to calculate probability distribution
    const result = await nextTokenService.predictProbabilityDistribution({
      prompt,
      topK,
      modelId,
    });

    return res.status(200).json({
      prompt: result.prompt,
      predictions: result.predictions,
      model_id: result.model_id,
      model_name: result.model_name,
      topK: result.topK,
    });
  } catch (error) {
    const statusCode = error.status || error.statusCode || 500;
    return res.status(statusCode).json({
      error: {
        message: error.message || 'Internal server error while predicting token distribution',
      },
    });
  }
};

module.exports = {
  getNextToken,
  getNextTokenHistory,
  predictNextToken,
};

