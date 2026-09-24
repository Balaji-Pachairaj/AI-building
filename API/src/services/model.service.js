const models = require('../config/models.config');

/**
 * Service to manage model mappings, ordering, and resolution.
 */
class ModelService {
  /**
   * Get all available models ordered from cheaper to more costly.
   * Formatted with internal model_id and model_name.
   *
   * @returns {Array<{ model_id: number, model_name: string }>}
   */
  getAllModels() {
    // Sort from cheaper to more costly by costRank/id
    const sorted = [...models].sort((a, b) => (a.costRank || a.id) - (b.costRank || b.id));

    return sorted.map((model) => ({
      model_id: model.id,
      model_name: model.name,
    }));
  }

  /**
   * Get full model configuration by internal model_id
   *
   * @param {number|string} modelId
   * @returns {object|null}
   */
  getModelById(modelId) {
    const id = parseInt(modelId, 10);
    if (isNaN(id)) return null;

    return models.find((m) => m.id === id) || null;
  }

  /**
   * Check whether a model_id is valid
   *
   * @param {number|string} modelId
   * @returns {boolean}
   */
  isValidModelId(modelId) {
    return this.getModelById(modelId) !== null;
  }
}

module.exports = new ModelService();
