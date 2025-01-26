import { useState, useEffect } from 'react';
import { expenseApi } from '../../services/api';
import './Expenses.css';
import { formatLocalDate, getLocalISOString } from '../../utils/dateUtils';

function Expenses() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: getLocalISOString().split('T')[0],
    timestamp: new Date().getTime()
  });

  const categories = {
    expense: ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Other'],
    income: ['Salary', 'Freelance', 'Investments', 'Other']
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await expenseApi.getAll();
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Adjust the date to avoid timezone issues
      const adjustedDate = new Date(formData.date);
      adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset());
      
      const response = await expenseApi.create({
        ...formData,
        date: adjustedDate.toISOString(),
        amount: parseFloat(formData.amount),
        timestamp: new Date().getTime()
      });
      setTransactions([response.data, ...transactions]);
      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: getLocalISOString().split('T')[0],
        timestamp: new Date().getTime()
      });
      setError(null);
    } catch (err) {
      setError('Failed to add transaction');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await expenseApi.delete(id);
        setTransactions(transactions.filter(t => t._id !== id));
        setError(null);
      } catch (err) {
        setError('Failed to delete transaction');
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="expenses">
      <div className="expenses-header">
        <center><h1>Manage Expenses</h1></center>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="expenses-grid">
        <div className="form-card">
          <h2>Add Transaction</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {categories[formData.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Add Transaction
            </button>
          </form>
        </div>

        <div className="transactions-card">
          <h2>Recent Transactions</h2>
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction._id}>
                    <td>{formatLocalDate(transaction.date)}</td>
                    <td>
                      <span className={`type-badge ${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.category}</td>
                    <td>{transaction.description}</td>
                    <td className={transaction.type}>
                      {transaction.type === 'income' ? '+' : '-'}$
                      {transaction.amount.toFixed(2)}
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(transaction._id)}
                      ></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Expenses; 