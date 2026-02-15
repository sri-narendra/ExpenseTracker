const Expense = require('../models/Expense');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

// Helper to validate Mongo ID
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid expense ID format');
  }
};

// @desc    Get expenses with pagination and filtering
// @route   GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by user first to hit index
    const filter = { user: req.user._id };

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    // Category filter
    if (req.query.category) filter.category = req.query.category;
    
    // Type filter
    if (req.query.type) filter.type = req.query.type;

    // Title search (Partial match, case-insensitive)
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: 'i' };
    }

    const totalCount = await Expense.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: expenses,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
const getExpense = async (req, res, next) => {
  try {
    validateObjectId(req.params.id);

    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      throw new ApiError(404, 'Expense not found or not authorized');
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set expense
// @route   POST /api/expenses
const setExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, notes, type } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      date: date || Date.now(),
      notes,
      type: type || 'expense',
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense (Robust pattern findOne + save)
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    validateObjectId(req.params.id);
    
    // Ownership enforced by finding with both ID and user ID
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      throw new ApiError(404, 'Expense not found or not authorized');
    }

    // Update fields
    const fields = ['title', 'amount', 'category', 'date', 'notes', 'type'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        expense[field] = req.body[field];
      }
    });

    const updatedExpense = await expense.save();

    res.json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense (Robust pattern findOne + delete)
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    validateObjectId(req.params.id);

    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      throw new ApiError(404, 'Expense not found or not authorized');
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial stats
// @route   GET /api/expenses/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await Expense.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalExpenses: { 
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } 
          },
          totalIncome: { 
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } 
          },
          highestExpense: { 
            $max: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } 
          },
          averageExpense: { 
            $avg: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", null] } 
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalExpenses: 0,
        totalIncome: 0,
        highestExpense: 0,
        averageExpense: 0,
        count: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly summary (Year-aware)
// @route   GET /api/expenses/summary
const getMonthlySummary = async (req, res, next) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          amount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpense,
  setExpense,
  updateExpense,
  deleteExpense,
  getStats,
  getMonthlySummary
};
