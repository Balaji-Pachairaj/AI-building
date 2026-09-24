const modelService = require('../services/model.service');

/**
 * @desc    Get available models with their internal IDs ordered from cheaper to costly
 * @route   GET /get-models-id
 * @access  Public
 */
const getModelsId = async (req, res, next) => {
  try {
    const models = modelService.getAllModels();

    return res.status(200).json({
      models,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getModelsId,
};
