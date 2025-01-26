const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    get: function(date) {
      if (!date) return null;
      // Convert to local ISO string without timezone offset
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString();
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: function(date) {
      // Convert to local ISO string
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString();
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema); 