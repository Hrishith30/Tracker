import { useState, useEffect } from 'react';
import { taskApi, expenseApi, routineApi } from '../../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './Dashboard.css';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function Dashboard() {
  const { user } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [stats, setStats] = useState({
    tasks: {
      pending: 0,
      completed: 0
    },
    expenses: {
      total: 0,
      status: 'neutral'
    },
    routines: {
      todayTotal: 0,
      todayCompleted: 0
    }
  });

  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    income: [],
    expenses: []
  });

  useEffect(() => {
    fetchDashboardData();

    // Update time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
      // Fetch dashboard data every minute
      if (new Date().getSeconds() === 0) {
        fetchDashboardData();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch tasks
      const tasksResponse = await taskApi.getAll();
      const allTasks = tasksResponse.data;
      const pendingTasks = allTasks.filter(task => task.status === 'pending').length;
      const completedTasks = allTasks.filter(task => task.status === 'completed').length;

      // Fetch expenses
      const expensesResponse = await expenseApi.getAll();
      const expenses = expensesResponse.data;
      const totalExpenses = expenses.reduce((sum, exp) => {
        return exp.type === 'income' ? sum + exp.amount : sum - exp.amount;
      }, 0);

      // Get recent transactions (last 5)
      const recentTransactions = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      // Fetch routines
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localDate = new Date(today.getTime() - (offset * 60 * 1000))
        .toISOString()
        .split('T')[0];

      const routinesResponse = await routineApi.getAll(localDate);
      const todayRoutines = routinesResponse.data.filter(routine => {
        const routineDate = new Date(routine.date).toISOString().split('T')[0];
        return routineDate === localDate;
      });

      const todayCompleted = todayRoutines.filter(routine => routine.completed).length;

      // Process monthly data
      const monthlyStats = processMonthlyData(expenses);
      setMonthlyData(monthlyStats);

      setStats({
        tasks: {
          pending: pendingTasks,
          completed: completedTasks
        },
        expenses: {
          total: totalExpenses,
          status: totalExpenses > 0 ? 'profit' : totalExpenses < 0 ? 'debt' : 'neutral'
        },
        routines: {
          todayTotal: todayRoutines.length,
          todayCompleted
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const processMonthlyData = (expenses) => {
    // Get last 6 months including current month
    const months = [];
    const monthlyStats = {};
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.push(monthYear);
      monthlyStats[monthYear] = { income: 0, expenses: 0 };
    }
    
    // Process expenses
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      // Only process if it's within our 6-month window
      if (monthlyStats[monthYear]) {
        if (expense.type === 'income') {
          monthlyStats[monthYear].income += expense.amount;
        } else {
          monthlyStats[monthYear].expenses += expense.amount;
        }
      }
    });

    return {
      labels: months,
      income: months.map(month => monthlyStats[month].income),
      expenses: months.map(month => monthlyStats[month].expenses)
    };
  };

  const chartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Income',
        data: monthlyData.income,
        backgroundColor: 'rgba(75, 192, 192, 0.9)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: monthlyData.expenses,
        backgroundColor: 'rgba(255, 99, 132, 0.9)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Financial Overview'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      },
      x: {
        barPercentage: 0.9,
        categoryPercentage: 0.9
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username || 'Guest'}!</h1>
        <div className="datetime-display">
          <div>{currentDateTime.toLocaleDateString()}</div>
          <div>{currentDateTime.toLocaleTimeString()}</div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        {/* Tasks Overview */}
        <div className="dashboard-card">
          <h2>Tasks Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <div className="status-circle pending">
                <span className="status-number">{stats.tasks.pending}</span>
              </div>
              <span className="status-label">Pending Tasks</span>
            </div>
            <div className="status-item">
              <div className="status-circle completed">
                <span className="status-number">{stats.tasks.completed}</span>
              </div>
              <span className="status-label">Completed Tasks</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="dashboard-card">
          <h2>Financial Summary</h2>
          <div className={`financial-status ${stats.expenses.status}`}>
            <span className="amount">
              ${Math.abs(stats.expenses.total).toFixed(2)}
            </span>
            <span className="status-label">
              {stats.expenses.status === 'profit' ? 'Current Profit' : 
               stats.expenses.status === 'debt' ? 'Current Debt' : 
               'Break Even'}
            </span>
          </div>
        </div>

        {/* Today's Routines */}
        <div className="dashboard-card">
          <h2>Today's Routines</h2>
          <div className="status-grid">
            <div className="status-item">
              <div className="status-circle total">
                <span className="status-number">{stats.routines.todayTotal}</span>
              </div>
              <span className="status-label">Total Routines</span>
            </div>
            <div className="status-item">
              <div className="status-circle completed">
                <span className="status-number">{stats.routines.todayCompleted}</span>
              </div>
              <span className="status-label">Completed</span>
            </div>
          </div>
        </div>

        {/* Monthly Financial Chart */}
        <div className="dashboard-card full-width">
          <h2>Monthly Financial Overview</h2>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} height={300} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 