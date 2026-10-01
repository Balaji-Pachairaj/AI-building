const Tag = require('../models/tag.model');
const Transaction = require('../models/transaction.model');
const BudgetSetting = require('../models/budget-setting.model');

// Default initial tags if none exist in the database
const DEFAULT_TAGS = [
  { name: 'food', color: '#ff5e62', description: 'Dining, groceries, cafe & restaurants' },
  { name: 'shopping', color: '#833ab4', description: 'Clothing, gadgets & personal items' },
  { name: 'travel', color: '#405de6', description: 'Commute, fuel, flights & transport' },
  { name: 'entertainment', color: '#fd1d1d', description: 'Movies, streaming & games' },
  { name: 'groceries', color: '#10b981', description: 'Supermarket and pantry essentials' },
  { name: 'utilities', color: '#f59e0b', description: 'Electricity, water, internet & mobile' },
  { name: 'health', color: '#06b6d4', description: 'Pharmacy, doctors & fitness' },
  { name: 'investment', color: '#14b8a6', description: 'Savings, stocks & funds' },
];

/**
 * Helper to parse date range strings or generate defaults
 * Default: 1st day of current month to current date
 */
const parseDateRange = (startDateStr, endDateStr) => {
  const now = new Date();
  let start;
  let end;

  if (startDateStr) {
    start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
  } else {
    // 1st of current month
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  if (endDateStr) {
    end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
  } else {
    // End of today
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  return { start, end };
};

/**
 * Helper to ensure default tags exist in DB
 */
const ensureDefaultTags = async () => {
  const count = await Tag.countDocuments();
  if (count === 0) {
    try {
      await Tag.insertMany(DEFAULT_TAGS, { ordered: false });
    } catch {
      // Ignore duplicate errors during concurrent inserts
    }
  }
};

/**
 * GET /api/budget/tags
 * Returns all registered tags, optionally with spent stats if date filter supplied
 */
exports.getTags = async (req, res, next) => {
  try {
    await ensureDefaultTags();

    const { startDate, endDate } = req.query;
    const allTags = await Tag.find().sort({ name: 1 }).lean();

    if (!startDate && !endDate) {
      return res.status(200).json({
        success: true,
        count: allTags.length,
        tags: allTags,
      });
    }

    const { start, end } = parseDateRange(startDate, endDate);

    // Aggregate spending by tag in date range
    const tagStats = await Transaction.aggregate([
      { $match: { time: { $gte: start, $lte: end } } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = new Map();
    tagStats.forEach((s) => {
      statsMap.set(s._id.toLowerCase(), { totalSpent: s.totalSpent, count: s.count });
    });

    const enrichedTags = allTags.map((tag) => {
      const stats = statsMap.get(tag.name.toLowerCase()) || { totalSpent: 0, count: 0 };
      return {
        ...tag,
        totalSpent: stats.totalSpent,
        transactionCount: stats.count,
      };
    });

    // Sort by totalSpent descending by default
    enrichedTags.sort((a, b) => b.totalSpent - a.totalSpent);

    res.status(200).json({
      success: true,
      count: enrichedTags.length,
      tags: enrichedTags,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/budget/tags
 * Create a new tag (stored in lowercase, unique)
 */
exports.createTag = async (req, res, next) => {
  try {
    let { name, color, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required.',
      });
    }

    const normalizedName = name.trim().toLowerCase();

    // Check if tag already exists
    const existing = await Tag.findOne({ name: normalizedName });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Tag "${normalizedName}" already exists. Tags are unique and case-insensitive.`,
        tag: existing,
      });
    }

    // Default instagram-like colors if not provided
    const palette = ['#e1306c', '#833ab4', '#fd1d1d', '#fcb045', '#405de6', '#10b981', '#06b6d4'];
    const chosenColor = color || palette[Math.floor(Math.random() * palette.length)];

    const newTag = await Tag.create({
      name: normalizedName,
      color: chosenColor,
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: `Tag "${normalizedName}" created successfully`,
      tag: newTag,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Tag already exists.',
      });
    }
    next(error);
  }
};

/**
 * DELETE /api/budget/tags/:id
 */
exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Tag.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found.',
      });
    }
    res.status(200).json({
      success: true,
      message: `Tag "${deleted.name}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/budget/transactions
 * Create a new expense transaction with Amount, Time, and Tags
 */
exports.createTransaction = async (req, res, next) => {
  try {
    const { amount, time, tags, description } = req.body;

    // Validate amount
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transaction amount must be a positive number greater than 0.',
      });
    }

    // Validate time
    const parsedTime = time ? new Date(time) : new Date();
    if (isNaN(parsedTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction time format.',
      });
    }

    // Validate tags
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one tag is required for the transaction.',
      });
    }

    // Clean and lowercase all tags
    const normalizedTags = [...new Set(
      tags
        .filter((t) => typeof t === 'string' && t.trim().length > 0)
        .map((t) => t.trim().toLowerCase())
    )];

    if (normalizedTags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tags must contain valid non-empty strings.',
      });
    }

    // Ensure all tags exist in Tag model (upsert them if user entered a new one)
    for (const tagName of normalizedTags) {
      await Tag.findOneAndUpdate(
        { name: tagName },
        { $setOnInsert: { name: tagName, color: '#e1306c' } },
        { upsert: true, returnDocument: 'after' }
      );
    }

    const transaction = await Transaction.create({
      amount: parsedAmount,
      time: parsedTime,
      tags: normalizedTags,
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Transaction logged successfully.',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/budget/transactions
 * List transactions with date filter and optional tag filter
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, tag, limit = 100, page = 1 } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);

    const query = {
      time: { $gte: start, $lte: end },
    };

    if (tag) {
      query.tags = tag.trim().toLowerCase();
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, totalCount, stats] = await Promise.all([
      Transaction.find(query)
        .sort({ time: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Transaction.countDocuments(query),
      Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalAmount = stats.length > 0 ? stats[0].totalAmount : 0;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    res.status(200).json({
      success: true,
      dateRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
      summary: {
        totalAmount,
        averageAmount: Math.round(averageAmount * 100) / 100,
        transactionCount: totalCount,
      },
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/budget/transactions/:id
 */
exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Transaction.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/budget/dashboard
 * Main Dashboard summary: Money Spent, Money Remaining, Sorted Tags List
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    await ensureDefaultTags();

    const { startDate, endDate } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);

    // 1. Fetch budget setting (default 50,000)
    let budgetSetting = await BudgetSetting.findOne({ key: 'monthly_budget' });
    if (!budgetSetting) {
      budgetSetting = await BudgetSetting.create({ key: 'monthly_budget', monthlyBudget: 50000 });
    }
    const monthlyBudget = budgetSetting.monthlyBudget;

    // 2. Aggregate total money spent and transaction count in date range
    const totalStats = await Transaction.aggregate([
      { $match: { time: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSpent = totalStats.length > 0 ? totalStats[0].totalSpent : 0;
    const totalTransactions = totalStats.length > 0 ? totalStats[0].count : 0;
    const moneyRemaining = monthlyBudget - totalSpent;

    // 3. Aggregate spending by tag in date range
    const tagStats = await Transaction.aggregate([
      { $match: { time: { $gte: start, $lte: end } } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = new Map();
    tagStats.forEach((s) => {
      statsMap.set(s._id.toLowerCase(), { totalSpent: s.totalSpent, count: s.count });
    });

    // 4. Fetch all tags from Tag model
    const allTags = await Tag.find().sort({ name: 1 }).lean();

    const tagsSummary = allTags.map((tag) => {
      const stats = statsMap.get(tag.name.toLowerCase()) || { totalSpent: 0, count: 0 };
      const percentage = totalSpent > 0 ? Math.round((stats.totalSpent / totalSpent) * 1000) / 10 : 0;
      return {
        _id: tag._id,
        name: tag.name,
        color: tag.color,
        description: tag.description,
        totalSpent: stats.totalSpent,
        transactionCount: stats.count,
        percentage,
      };
    });

    // Sort tags by totalSpent descending
    tagsSummary.sort((a, b) => b.totalSpent - a.totalSpent);

    res.status(200).json({
      success: true,
      dateRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        formattedStart: start.toISOString().split('T')[0],
        formattedEnd: end.toISOString().split('T')[0],
      },
      budgetOverview: {
        totalSpent,
        totalTransactions,
        averageSpent: totalTransactions > 0 ? Math.round((totalSpent / totalTransactions) * 100) / 100 : 0,
        moneyRemaining,
        monthlyBudget,
        currency: budgetSetting.currency || '₹',
      },
      tagsSummary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/budget/tags/:tagName/analysis
 * Analytics for a specific tag:
 * 1) Total Amount spent in date range
 * 2) Average Amount spent in date range (Total / count)
 * 3) Time and Amount timeline (for Bar and Line charts)
 */
exports.getTagAnalysis = async (req, res, next) => {
  try {
    const { tagName } = req.params;
    const { startDate, endDate } = req.query;

    if (!tagName) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required.',
      });
    }

    const normalizedTag = tagName.trim().toLowerCase();
    const { start, end } = parseDateRange(startDate, endDate);

    // Tag details
    const tagInfo = await Tag.findOne({ name: normalizedTag }).lean();

    // Matching transactions
    const matchQuery = {
      tags: normalizedTag,
      time: { $gte: start, $lte: end },
    };

    // Overall stats for this tag
    const statsResult = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSpent = statsResult.length > 0 ? statsResult[0].totalSpent : 0;
    const transactionCount = statsResult.length > 0 ? statsResult[0].count : 0;
    const averageSpent = transactionCount > 0 ? Math.round((totalSpent / transactionCount) * 100) / 100 : 0;

    // Timeline aggregation by date (YYYY-MM-DD)
    const dailyStats = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$time' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const timeline = dailyStats.map((d) => ({
      date: d._id,
      amount: d.totalAmount,
      count: d.count,
    }));

    // Fetch transactions list for this tag in date range
    const transactions = await Transaction.find(matchQuery)
      .sort({ time: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      tag: {
        name: normalizedTag,
        color: tagInfo ? tagInfo.color : '#e1306c',
        description: tagInfo ? tagInfo.description : '',
      },
      dateRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        formattedStart: start.toISOString().split('T')[0],
        formattedEnd: end.toISOString().split('T')[0],
      },
      analytics: {
        totalSpent,
        transactionCount,
        averageSpent,
      },
      timeline,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/budget/settings
 * Retrieve budget configuration
 */
exports.getBudgetSettings = async (req, res, next) => {
  try {
    let setting = await BudgetSetting.findOne({ key: 'monthly_budget' });
    if (!setting) {
      setting = await BudgetSetting.create({ key: 'monthly_budget', monthlyBudget: 50000 });
    }
    res.status(200).json({
      success: true,
      setting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/budget/settings
 * Update budget configuration
 */
exports.updateBudgetSettings = async (req, res, next) => {
  try {
    const { monthlyBudget, currency } = req.body;
    const numBudget = Number(monthlyBudget);

    if (isNaN(numBudget) || numBudget < 0) {
      return res.status(400).json({
        success: false,
        message: 'Monthly budget must be a positive number.',
      });
    }

    const updateData = { monthlyBudget: numBudget };
    if (currency) updateData.currency = currency.trim();

    const setting = await BudgetSetting.findOneAndUpdate(
      { key: 'monthly_budget' },
      updateData,
      { returnDocument: 'after', upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget settings updated successfully.',
      setting,
    });
  } catch (error) {
    next(error);
  }
};
