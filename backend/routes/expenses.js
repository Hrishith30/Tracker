const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// Get all expenses for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new expense
router.post('/', auth, async (req, res) => {
  const expense = new Expense({
    ...req.body,
    user: req.userId // Add user ID to expense
  });

  try {
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update expense
router.patch('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    Object.keys(req.body).forEach(key => {
      if (req.body[key] != null) {
        expense[key] = req.body[key];
      }
    });

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    await Expense.deleteOne({ _id: req.params.id });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get expense statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};
    
    if (startDate || endDate) {
      dateQuery = {};
      if (startDate) {
        // Convert local date to UTC for query
        const startUTC = new Date(startDate);
        startUTC.setUTCHours(0, 0, 0, 0);
        dateQuery.$gte = startUTC;
      }
      if (endDate) {
        // Convert local date to UTC for query
        const endUTC = new Date(endDate);
        endUTC.setUTCHours(23, 59, 59, 999);
        dateQuery.$lte = endUTC;
      }
    }

    const stats = await Expense.aggregate([
      { $match: { date: dateQuery } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Expense.aggregate([
      { $match: { date: dateQuery } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({ 
      summary: stats,
      byCategory: categoryStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 