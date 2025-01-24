const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const auth = require('../middleware/auth');

// Get all routines for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const routines = await Routine.find({ user: req.userId });
    res.json(routines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new routine
router.post('/', auth, async (req, res) => {
  const routine = new Routine({
    ...req.body,
    user: req.userId // Add user ID to routine
  });

  try {
    const newRoutine = await routine.save();
    res.status(201).json(newRoutine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update routine
router.patch('/:id', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    Object.keys(req.body).forEach(key => {
      if (req.body[key] != null) {
        routine[key] = req.body[key];
      }
    });

    const updatedRoutine = await routine.save();
    res.json(updatedRoutine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete routine
router.delete('/:id', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    await Routine.deleteOne({ _id: req.params.id });
    res.json({ message: 'Routine deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle routine completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    routine.completed = !routine.completed;
    const updatedRoutine = await routine.save();
    res.json(updatedRoutine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get routine statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};

    if (startDate || endDate) {
      dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
    }

    const stats = await Routine.aggregate([
      { $match: { date: dateQuery } },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$completed', 1, 0] }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          completed: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completed', '$total'] },
              100
            ]
          }
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 