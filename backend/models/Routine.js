const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  activity: {
    type: String,
    required: true
  },
  date: {
    type: Date,
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Routine', routineSchema); 