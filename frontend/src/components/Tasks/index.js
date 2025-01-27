import { useState, useEffect } from 'react';
import { taskApi } from '../../services/api';
import './Tasks.css';
import { formatLocalDateTime, getLocalISOString, formatDateTime } from '../../utils/dateUtils';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: getLocalISOString().split('T')[0],
    priority: 'medium',
    status: 'pending'
  });
  const [error, setError] = useState('');

  // Fetch tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskApi.getAll();
      console.log('Fetched tasks:', response.data);
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks');
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create task
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      const selectedDate = new Date(newTask.dueDate + 'T12:00:00');
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      
      const taskToSubmit = {
        ...newTask,
        dueDate: selectedDate.toISOString()
      };
      
      const response = await taskApi.create(taskToSubmit);
      setTasks(prev => [response.data, ...prev]);
      setNewTask({
        title: '',
        description: '',
        dueDate: getLocalISOString().split('T')[0],
        priority: 'medium',
        status: 'pending'
      });
      setError('');
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
    }
  };

  // Delete task
  const handleDelete = async (taskId) => {
    try {
      await taskApi.delete(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  // Toggle task status
  const handleToggleStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const response = await taskApi.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
    }
  };

  // Add this new function
  const filteredTasks = tasks.filter(task => {
    if (priorityFilter === 'all') return true;
    return task.priority === priorityFilter;
  });

  return (
    <div className="tasks-container">
      <h1 className="tasks-heading">Tasks</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="tasks-content">
        <form onSubmit={handleSubmit} className="task-form">
          <h2 className="form-heading">New Task</h2>
          <h3 className="thin-heading">Title</h3>
          <input
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="Title"
            required
            className="task-input"
          />
          
          <h3 className="thin-heading">In Detail</h3>
          <input
            type="text"
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="task-input"
          />
          
          <h3 className="thin-heading">Due</h3>
          <input
            type="date"
            name="dueDate"
            value={newTask.dueDate}
            onChange={handleInputChange}
            className="task-input"
          />
          
          <h3 className="thin-heading">Priority</h3>
          <select
            name="priority"
            value={newTask.priority}
            onChange={handleInputChange}
            className="task-input"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          
          <button type="submit" className="task-button submit-button">
            Add Task
          </button>
        </form>
        <div className="tasks-list-container">
          <div className="priority-filter">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="task-input priority-filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="tasks-list">
            {filteredTasks.map(task => (
              <div 
                key={task._id} 
                className={`task-item ${task.status} priority-${task.priority}`}
              >
                <div className="task-content">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-details">
                    <span className={`priority ${task.priority}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="due-date">
                        Due: {formatDateTime(task.dueDate)}
                      </span>
                    )}
                    <span className={`status ${task.status}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  <button
                    className={`task-button ${task.status === 'completed' ? 'undo-button' : 'complete-button'}`}
                    onClick={() => handleToggleStatus(task._id, task.status)}
                  >
                    {task.status === 'completed' ? 'Undo' : 'Complete'}
                  </button>
                  <button
                    className="task-button delete-button"
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasks;