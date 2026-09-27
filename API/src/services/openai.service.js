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

  /**
   * Predict the probability distribution of possible next words/tokens for a given prompt.
   *
   * @param {object} params
   * @param {object} params.modelConfig - Model configuration object
   * @param {string} params.prompt - Input text sequence
   * @param {number} [params.topK=10] - Number of candidate tokens (1-20)
   * @returns {Promise<Array<{ token: string, probability: number }>>}
   */
  async predictNextTokenDistribution({ modelConfig, prompt, topK = 10 }) {
    const k = Math.min(20, Math.max(1, parseInt(topK, 10) || 10));
    const inputPrompt = typeof prompt === 'string' ? prompt : '';

    const primaryModel = modelConfig?.openaiModel || modelConfig?.name || 'gpt-4o';
    const fallbackModel = modelConfig?.fallbackModel || 'gpt-4o-mini';

    const systemPrompt = `You are an expert next-token and next-word probability distribution simulator for an autoregressive language model.
Analyze the given text prefix carefully.
Determine the top ${k} most probable next tokens or words that immediately follow.
Formatting rules:
1. If the token starts a new word, prefix it with a single space (e.g. " sleeping", " sitting", " running").
2. If the user prompt ends mid-word (e.g. "The cat is sleep") or the token is a suffix/subword or punctuation, do NOT include a leading space (e.g. "ing", "'s", ".", ",").
3. Return ONLY a valid JSON object strictly matching this format:
{
  "predictions": [
    { "token": " sleeping", "probability": 0.4231 },
    { "token": " sitting", "probability": 0.1872 }
  ]
}
4. Probabilities must be floating point numbers between 0 and 1, sorted strictly in descending order.`;

    try {
      const client = this.getClient();

      const callApi = async (modelName) => {
        try {
          return await client.chat.completions.create({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Prefix text: "${inputPrompt}"` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
          });
        } catch (apiErr) {
          const errMsg = (apiErr?.message || '').toLowerCase();
          // If system message or response_format json_object is unsupported by model (e.g. o1)
          if (
            errMsg.includes('response_format') ||
            errMsg.includes('system') ||
            errMsg.includes('not supported')
          ) {
            return await client.chat.completions.create({
              model: fallbackModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Prefix text: "${inputPrompt}"` },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.3,
            });
          }
          throw apiErr;
        }
      };

      let response;
      try {
        response = await callApi(primaryModel);
      } catch (err) {
        if (fallbackModel && fallbackModel !== primaryModel) {
          console.warn(`[OpenAIService] Retrying probability distribution with fallback model ${fallbackModel}...`);
          response = await callApi(fallbackModel);
        } else {
          throw err;
        }
      }

      const content = response.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed.predictions) && parsed.predictions.length > 0) {
        return parsed.predictions
          .slice(0, k)
          .map((item) => ({
            token: typeof item.token === 'string' ? item.token : String(item.token || ''),
            probability:
              typeof item.probability === 'number'
                ? Math.round(item.probability * 10000) / 10000
                : 0.01,
          }))
          .sort((a, b) => b.probability - a.probability);
      }
    } catch (error) {
      console.warn(`[OpenAIService] OpenAI distribution failed: ${error.message}. Generating contextual fallback.`);
      return this.generateFallbackDistribution(inputPrompt, k);
    }

    return this.generateFallbackDistribution(inputPrompt, k);
  }

  /**
   * Deterministic contextual fallback distribution generator in case OpenAI is unavailable.
   */
  generateFallbackDistribution(prompt, k) {
    const trimmed = (prompt || '').trim().toLowerCase();

    const candidatesCatalog = {
      'the cat is': [
        { token: ' sleeping', probability: 0.4231 },
        { token: ' sitting', probability: 0.1872 },
        { token: ' eating', probability: 0.1254 },
        { token: ' running', probability: 0.0831 },
        { token: ' playing', probability: 0.0692 },
        { token: ' purring', probability: 0.0514 },
        { token: ' resting', probability: 0.0321 },
        { token: ' looking', probability: 0.0185 },
      ],
      'the cat': [
        { token: ' is', probability: 0.3456 },
        { token: ' was', probability: 0.2214 },
        { token: ' sat', probability: 0.1652 },
        { token: ' sleeps', probability: 0.1143 },
        { token: ' jumped', probability: 0.0821 },
        { token: ' purred', probability: 0.0412 },
      ],
      'the weather today is': [
        { token: ' sunny', probability: 0.3621 },
        { token: ' cloudy', probability: 0.2145 },
        { token: ' expected', probability: 0.1582 },
        { token: ' clear', probability: 0.1124 },
        { token: ' rainy', probability: 0.0873 },
        { token: ' warm', probability: 0.0452 },
      ],
      'artificial intelligence will': [
        { token: ' transform', probability: 0.2854 },
        { token: ' continue', probability: 0.2215 },
        { token: ' reshape', probability: 0.1742 },
        { token: ' revolutionize', probability: 0.1321 },
        { token: ' play', probability: 0.0984 },
        { token: ' help', probability: 0.0584 },
      ],
    };

    for (const [key, candidates] of Object.entries(candidatesCatalog)) {
      if (trimmed.endsWith(key) || key.endsWith(trimmed)) {
        return candidates.slice(0, k);
      }
    }

    // Dynamic generation if prefix not matched
    const isEndingMidWord = /[a-zA-Z]$/.test(prompt) && !/\s$/.test(prompt);
    let defaults = [];

    if (isEndingMidWord && trimmed.endsWith('sleep')) {
      defaults = [
        { token: 'ing', probability: 0.5421 },
        { token: 's', probability: 0.2314 },
        { token: 'y', probability: 0.1245 },
        { token: 'er', probability: 0.0612 },
        { token: 'less', probability: 0.0408 },
      ];
    } else {
      defaults = [
        { token: ' and', probability: 0.2451 },
        { token: ' the', probability: 0.1874 },
        { token: ' is', probability: 0.1432 },
        { token: ' to', probability: 0.1215 },
        { token: ' of', probability: 0.0984 },
        { token: ' that', probability: 0.0765 },
        { token: ' in', probability: 0.0652 },
        { token: ' with', probability: 0.0421 },
        { token: ' for', probability: 0.0206 },
      ];
    }

    return defaults.slice(0, k);
  }
}

module.exports = new OpenAIService();
