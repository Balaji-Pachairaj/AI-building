/**
 * Centralized Model Configuration
 *
 * Ordered sequentially from cheaper to more costly:
 * 1 -> gpt-5 (base tier)
 * 2 -> gpt-4o (multimodal flagship)
 * 3 -> gpt-4-turbo (high capability legacy)
 * 4 -> o3-mini (efficient reasoning)
 * 5 -> o1-mini (specialized reasoning)
 * 6 -> o1 (flagship reasoning)
 * 7 -> o1-pro (high compute reasoning)
 *
 * Designed so additional models can easily be added later.
 */
const MODELS = [
  {
    id: 1,
    name: "gpt-4o",
    openaiModel: process.env.OPENAI_MODEL_ID_1 || "gpt-4o",
    fallbackModel: "gpt-4o-mini",
    costRank: 1,
  },
  {
    id: 2,
    name: "gpt-5",
    openaiModel: process.env.OPENAI_MODEL_ID_2 || "gpt-5",
    fallbackModel: "gpt-4o-mini",
    costRank: 2,
  },
  {
    id: 3,
    name: "gpt-4-turbo",
    openaiModel: process.env.OPENAI_MODEL_ID_3 || "gpt-4-turbo",
    fallbackModel: "gpt-4o",
    costRank: 3,
  },
  {
    id: 4,
    name: "o3-mini",
    openaiModel: process.env.OPENAI_MODEL_ID_4 || "o3-mini",
    fallbackModel: "gpt-4o-mini",
    costRank: 4,
  },
  {
    id: 5,
    name: "o1-mini",
    openaiModel: process.env.OPENAI_MODEL_ID_5 || "o1-mini",
    fallbackModel: "gpt-4o-mini",
    costRank: 5,
  },
  {
    id: 6,
    name: "o1",
    openaiModel: process.env.OPENAI_MODEL_ID_6 || "o1",
    fallbackModel: "gpt-4o",
    costRank: 6,
  },
  {
    id: 7,
    name: "o1-pro",
    openaiModel: process.env.OPENAI_MODEL_ID_7 || "o1-pro",
    fallbackModel: "o1",
    costRank: 7,
  },
];

module.exports = MODELS;
