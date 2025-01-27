const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const auth = require('../middleware/auth');

// Get all routines for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query;
    let query = { user: req.userId };
    
    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const routines = await Routine.find(query).sort({ createdAt: -1 });
    res.json(routines);
  } catch (err) {
    console.error('Error fetching routines:', err);
    res.status(500).json({ message: 'Failed to fetch routines' });
  }
});

// Create a new routine
router.post('/', auth, async (req, res) => {
  try {
    const routine = new Routine({
      ...req.body,
      user: req.userId,
      date: new Date(req.body.date) // Ensure date is properly converted
    });

    const newRoutine = await routine.save();
    res.status(201).json(newRoutine);
  } catch (err) {
    console.error('Error creating routine:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update routine
router.patch('/:id', auth, async (req, res) => {
  try {
    const routine = await Routine.findOne({ 
      _id: req.params.id,
      user: req.userId 
    });
    
    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] != null) {
        if (key === 'date') {
          routine[key] = new Date(req.body[key]);
        } else {
          routine[key] = req.body[key];
        }
      }
    });

    const updatedRoutine = await routine.save();
    res.json(updatedRoutine);
  } catch (err) {
    console.error('Error updating routine:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete routine
router.delete('/:id', auth, async (req, res) => {
  try {
    const routine = await Routine.findOne({ 
      _id: req.params.id,
      user: req.userId 
    });
    
    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    await Routine.deleteOne({ _id: req.params.id });
    res.json({ message: 'Routine deleted' });
  } catch (err) {
    console.error('Error deleting routine:', err);
    res.status(500).json({ message: err.message });
  }
});

// Toggle routine completion
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const routine = await Routine.findOne({ 
      _id: req.params.id,
      user: req.userId 
    });
    
    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    routine.completed = !routine.completed;
    const updatedRoutine = await routine.save();
    res.json(updatedRoutine);
  } catch (err) {
    console.error('Error toggling routine:', err);
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