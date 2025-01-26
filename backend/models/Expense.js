const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
    get: function(date) {
      return date.toISOString();
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: function(date) {
      return date.toISOString();
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Expense', expenseSchema); 