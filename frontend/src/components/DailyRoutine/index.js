import { useState, useEffect } from 'react';
import { routineApi } from '../../services/api';
import './DailyRoutine.css';

function DailyRoutine() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - (offset * 60 * 1000))
    .toISOString()
    .split('T')[0];

  const [selectedDate, setSelectedDate] = useState(localDate);
  const [formData, setFormData] = useState({
    activity: '',
    category: 'work',
    priority: 'medium',
    notes: '',
    mood: 'neutral',
    reflection: '',
    date: localDate
  });

  const categories = {
    work: '💼 Work',
    exercise: '💪 Exercise',
    study: '📚 Study',
    selfCare: '🧘‍♂️ Self Care',
    meals: '🍽️ Meals',
    leisure: '🎮 Leisure',
    important: '⭐ Important',
    health: '❤️ Health'
  };

  const moods = {
    great: '😄 Great',
    good: '🙂 Good',
    neutral: '😐 Neutral',
    down: '😕 Down',
    bad: '😢 Bad'
  };

  useEffect(() => {
    fetchRoutines();
  }, [selectedDate]);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching routines for date:', selectedDate);
      const response = await routineApi.getAll(selectedDate);
      console.log('Fetched routines:', response.data);
      
      // Sort routines by creation date, newest first
      const sortedRoutines = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setRoutines(sortedRoutines);
    } catch (err) {
      console.error('Error fetching routines:', err);
      setError(err.response?.data?.message || 'Failed to fetch routines');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const routineWithDate = { 
        ...formData,
        date: selectedDate // Ensure we're using the selectedDate
      };
      
      console.log('Submitting routine:', routineWithDate); // Debug log
      
      const response = await routineApi.create(routineWithDate);
      console.log('Created routine:', response.data); // Debug log
      
      // Immediately add the new routine to the state
      setRoutines(prevRoutines => [...prevRoutines, response.data]);
      
      // Reset form
      setFormData({
        activity: '',
        category: 'work',
        priority: 'medium',
        notes: '',
        mood: 'neutral',
        reflection: '',
        date: selectedDate
      });
      
      // Optional: Show success message
      // toast.success('Entry added successfully');
      
    } catch (err) {
      console.error('Error creating routine:', err);
      setError(err.response?.data?.message || 'Failed to create routine');
    }
  };

  const toggleCompletion = async (id) => {
    try {
      const response = await routineApi.toggle(id);
      setRoutines(routines.map(routine =>
        routine._id === id ? response.data : routine
      ));
      setError(null);
    } catch (err) {
      setError('Failed to update routine');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await routineApi.delete(id);
        setRoutines(routines.filter(routine => routine._id !== id));
        setError(null);
      } catch (err) {
        setError('Failed to delete routine');
        console.error('Error:', err);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setFormData(prev => ({ ...prev, date: e.target.value }));
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Optional: Add a useEffect to sort routines whenever they change
  useEffect(() => {
    setRoutines(prevRoutines => 
      [...prevRoutines].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    );
  }, []);

  return (
    <div className="daily-routine">
      <div className="routine-header">
        <h1>Daily Journal & Activities</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="date-picker"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="routine-grid">
        <div className="routine-form-card">
          <h2>Add New Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Activity / Title</label>
              <input
                type="text"
                name="activity"
                value={formData.activity}
                onChange={handleChange}
                required
                placeholder="What's on your mind?"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select 
                name="category" 
                value={formData.category}
                onChange={handleChange}
              >
                {Object.entries(categories).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mood</label>
              <select
                name="mood"
                value={formData.mood}
                onChange={handleChange}
              >
                {Object.entries(moods).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Add any additional notes..."
              ></textarea>
            </div>

            <div className="form-group">
              <label>Diary</label>
              <textarea
                name="reflection"
                value={formData.reflection}
                onChange={handleChange}
                rows="4"
                placeholder="Write your diary here..."
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              Add Entry
            </button>
          </form>
        </div>

        <div className="routine-list-card">
          <h2>Daily Timeline</h2>
          {loading ? (
            <div className="loading">Loading entries...</div>
          ) : (
            <div className="routine-timeline">
              {routines.length === 0 ? (
                <div className="no-routines">No entries for this day</div>
              ) : (
                routines.map(routine => (
                  <div 
                    key={routine._id} 
                    className={`routine-item ${routine.completed ? 'completed' : ''} ${routine.reflection ? 'reflection-type' : 'activity-type'}`}
                  >
                    <div className={`routine-content category-${routine.category}`}>
                      <div className="routine-meta">
                        <div className="meta-column">
                          <span className="timestamp">{formatDateTime(routine.createdAt)}</span>
                          <span className="mood-indicator">{moods[routine.mood]}</span>
                        </div>
                      </div>
                      <div className="routine-info">
                        <div className="routine-header">
                          <h3>{routine.activity}</h3>
                        </div>
                        <span className="category-badge">
                          {categories[routine.category]}
                        </span>
                        {routine.notes && (
                          <p className="routine-notes">{routine.notes}</p>
                        )}
                        {routine.reflection && (
                          <p className="routine-reflection">{routine.reflection}</p>
                        )}
                      </div>
                      <div className="routine-actions">
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(routine._id)}
                        ></button>
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={routine.completed}
                            onChange={() => toggleCompletion(routine._id)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyRoutine; 