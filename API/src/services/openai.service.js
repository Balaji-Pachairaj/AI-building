const OpenAI = require('openai');

/**
 * Service dedicated to OpenAI API communication.
 * Keeps API credentials secure and abstracts API interactions.
 */
class OpenAIService {
  constructor() {
    this.client = null;
    this.cachedKey = null;
  }

  /**
   * Lazily instantiate the OpenAI client using environment variables.
   * Ensures API key is dynamically read and kept private.
   */
  getClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const err = new Error('OPENAI_API_KEY is not configured in environment variables');
      err.status = 500;
      throw err;
    }

    if (!this.client || this.cachedKey !== apiKey) {
      this.client = new OpenAI({ apiKey });
      this.cachedKey = apiKey;
    }

    return this.client;
  }

  /**
   * Generate next N tokens for a given prompt using an OpenAI model.
   * Note: No temperature, reasoning_effort, or thinking quality parameters
   * are passed to ensure maximum compatibility across standard and reasoning models.
   *
   * @param {object} params
   * @param {object} params.modelConfig - Model configuration object
   * @param {string} params.prompt - Input text sequence
   * @param {number} params.tokens - Number of tokens requested
   * @returns {Promise<string>} Generated output
   */
  async generateNextTokens({ modelConfig, prompt, tokens }) {
    const client = this.getClient();
    const primaryModel = modelConfig.openaiModel || modelConfig.name;
    const fallbackModel = modelConfig.fallbackModel || 'gpt-4o-mini';

    const systemPrompt = {
      role: 'system',
      content:
        'You are a next-token text prediction engine. Continue the given text directly and seamlessly from where it leaves off. Do not repeat the input prompt. Do not output any commentary, greetings, introductory words, or markdown formatting. Output only the immediate continuation text.',
    };

    const userPrompt = {
      role: 'user',
      content: prompt,
    };

    const callApi = async (modelName) => {
      try {
        // Only pass model, messages, and max_completion_tokens (no temperature or thinking queries)
        return await client.chat.completions.create({
          model: modelName,
          messages: [systemPrompt, userPrompt],
          max_completion_tokens: tokens,
        });
      } catch (err) {
        const errMsg = (err?.message || '').toLowerCase();

        // If system role is not supported by this model (e.g. o1 models), retry with user-only prompt
        if (errMsg.includes('system') && (errMsg.includes('role') || errMsg.includes('unsupported'))) {
          return await client.chat.completions.create({
            model: modelName,
            messages: [
              {
                role: 'user',
                content: `Instruction: You are a next-token text prediction engine. Continue the given text directly and seamlessly from where it leaves off. Do not repeat the prompt. Output only the immediate continuation text.\n\nText: ${prompt}`,
              },
            ],
            max_completion_tokens: tokens,
          });
        }

        // If max_completion_tokens is not recognized by a legacy model, fallback to max_tokens
        if (errMsg.includes('max_completion_tokens')) {
          return await client.chat.completions.create({
            model: modelName,
            messages: [systemPrompt, userPrompt],
            max_tokens: tokens,
          });
        }

        throw err;
      }
    };

    let response;
    try {
      response = await callApi(primaryModel);
    } catch (err) {
      const isNotFound =
        err?.status === 404 ||
        (err?.message &&
          (err.message.includes('does not exist') ||
            err.message.includes('model_not_found') ||
            err.message.includes('not found')));

      // If model (e.g. gpt-5) does not exist on OpenAI, fallback to available model
      if (isNotFound && fallbackModel && fallbackModel !== primaryModel) {
        console.warn(
          `[OpenAIService] Model '${primaryModel}' not found. Retrying with fallback model '${fallbackModel}'...`
        );
        response = await callApi(fallbackModel);
      } else {
        console.error(`[OpenAIService] Generation request failed: ${err.message}`);
        const apiError = new Error(err.message || 'OpenAI API generation failed');
        apiError.status = err.status || 502;
        throw apiError;
      }
    }

    const generatedText = response.choices?.[0]?.message?.content || '';
    return generatedText.trim();
  }
}

module.exports = new OpenAIService();
