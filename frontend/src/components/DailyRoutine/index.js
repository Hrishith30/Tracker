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
      const response = await routineApi.getAll(selectedDate);
      const filteredRoutines = response.data.filter(routine => 
        routine.date.split('T')[0] === selectedDate
      );
      setRoutines(filteredRoutines);
      setError(null);
    } catch (err) {
      setError('Failed to fetch routines');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const routineWithDate = { ...formData, date: selectedDate };
      const response = await routineApi.create(routineWithDate);
      if (response.data.date === selectedDate) {
        setRoutines([...routines, response.data]);
      }
      setFormData({
        activity: '',
        category: 'work',
        priority: 'medium',
        notes: '',
        mood: 'neutral',
        reflection: '',
        date: selectedDate
      });
      setError(null);
    } catch (err) {
      setError('Failed to create routine');
      console.error('Error:', err);
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