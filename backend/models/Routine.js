const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  activity: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['work', 'exercise', 'study', 'selfCare', 'meals', 'leisure', 'important', 'health'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'neutral', 'down', 'bad'],
    default: 'neutral'
  },
  notes: {
    type: String,
    default: ''
  },
  reflection: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    get: function(date) {
      if (!date) return null;
      // Convert to local ISO string without timezone offset
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
    }
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
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('Routine', routineSchema); 