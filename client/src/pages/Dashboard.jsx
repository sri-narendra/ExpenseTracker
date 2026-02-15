import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ExpenseContext from '../context/ExpenseContext';
import AuthContext from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
    const { expenses, getExpenses, deleteExpense, stats, getStats } = useContext(ExpenseContext);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [timeRange, setTimeRange] = useState('30');

    useEffect(() => {
        getExpenses();
        getStats();
    }, [getExpenses, getStats]);

    // Calculate KPIs from Stats (Full History)
    const totalIncome = Number(stats.totalIncome) || 0;
    const totalExpenses = Number(stats.totalExpenses) || 0;
    const totalBalance = totalIncome - totalExpenses;
    
    // Data safety
    const safeExpenses = Array.isArray(expenses) ? expenses : [];

    // Filter expenses by time range for Chart
    const filteredExpensesForChart = safeExpenses.filter(item => {
        if (!item || item.type === 'income') return false;
        if (timeRange === 'all') return true;
        
        const date = new Date(item.date);
        if (isNaN(date.getTime())) return false;
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        return diffDays <= parseInt(timeRange);
    });

    // Calculate Category Data for Chart (Expenses Only)
    const categoryData = filteredExpensesForChart
        .reduce((acc, expense) => {
            if (!expense) return acc;
            const category = expense.category || 'Other';
            acc[category] = (acc[category] || 0) + (Number(expense.amount) || 0);
            return acc;
        }, {});

    const chartData = Object.keys(categoryData).map(key => ({
        name: key,
        value: categoryData[key]
    }));

    // Find highest category
    let highestCategory = { name: 'N/A', value: 0 };
    if (chartData.length > 0) {
        highestCategory = chartData.reduce((prev, current) => (prev.value > current.value) ? prev : current);
    }
    
    // Sort expenses by date desc for "Recent Expenses"
    const recentExpenses = [...safeExpenses]
        .filter(e => e && e.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const COLORS = ['#5048e5', '#818cf8', '#94a3b8', '#10b981', '#f59e0b', '#ef4444'];

    // --- Budget Health Logic ---
    const defaultLimits = {
        'Food': 500,
        'Transport': 200,
        'Shopping': 300,
        'Housing': 1000,
        'Utilities': 200,
        'Entertainment': 150,
        'Health': 100,
        'Other': 400
    };
    const budgetLimits = (user?.settings?.budgetLimits && Object.keys(user.settings.budgetLimits).length > 0) 
        ? user.settings.budgetLimits 
        : defaultLimits;

    const totalLimit = Object.values(budgetLimits).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    const budgetHealthPercentage = totalLimit > 0 ? (totalExpenses / totalLimit) * 100 : 0;

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 min-h-screen">
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <span className="material-icons text-white">account_balance_wallet</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">SpendWise</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex gap-6 mr-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                                <Link className="text-primary border-b-2 border-primary pb-1" to="/">Dashboard</Link>
                                <Link className="hover:text-primary transition-colors" to="/expenses">Expenses</Link>
                                <Link className="hover:text-primary transition-colors" to="/budgets">Budgets</Link>
                                <Link className="hover:text-primary transition-colors" to="/reports">Reports</Link>
                            </div>
                            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <span className="material-icons text-lg">logout</span>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user && user.name}. Monitor your financial health.</p>
                    </div>
                    <Link to="/add-expense" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
                        <span className="material-icons text-lg">add</span>
                        Add New Transaction
                    </Link>
                </header>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Metric 1: Total Balance */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <span className="material-icons text-primary">account_balance</span>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${totalBalance >= 0 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-red-500 bg-red-50 dark:bg-red-500/10'}`}>
                                {totalBalance >= 0 ? 'Healthy' : 'Deficit'}
                            </span>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Balance</h3>
                        <p className={`text-3xl font-bold mt-1 ${totalBalance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                            {totalBalance < 0 ? '-' : ''}${(Number(Math.abs(totalBalance)) || 0).toFixed(2)}
                        </p>
                    </div>

                    {/* Metric 2: Total Income */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                             <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                                <span className="material-icons text-emerald-600">trending_up</span>
                            </div>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Income</h3>
                        <p className="text-3xl font-bold text-emerald-600 mt-1">+${(Number(totalIncome) || 0).toFixed(2)}</p>
                    </div>

                    {/* Metric 3: Total Expenses */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                             <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg">
                                <span className="material-icons text-red-600">trending_down</span>
                            </div>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Expenses</h3>
                        <p className="text-3xl font-bold text-red-600 mt-1">-${(Number(totalExpenses) || 0).toFixed(2)}</p>
                    </div>
                </div>

                {/* Middle Section: Chart and Savings Insight */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                     <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Spending by Category</h2>
                            <select 
                                className="text-sm border-gray-200 dark:border-gray-800 dark:bg-gray-900 rounded-lg focus:ring-primary"
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                <option value="30">Last 30 Days</option>
                                <option value="90">Last Quarter</option>
                                <option value="365">This Year</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-around gap-8 h-64">
                             {chartData.length > 0 ? (
                                <>
                                    <div className="relative w-64 h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total</span>
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">${(Number(totalExpenses) || 0).toFixed(0)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 w-full md:w-48 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
                                        {chartData.map((entry, index) => (
                                            <div key={`legend-${index}`} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-[80px]" title={entry.name}>{entry.name}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{totalExpenses > 0 ? ((entry.value / totalExpenses) * 100).toFixed(0) : 0}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center justify-center w-full h-full">
                                    <span className="material-icons text-4xl mb-2">pie_chart</span>
                                    <p>No expenses yet</p>
                                </div>
                            )}
                        </div>
                     </div>

                    {/* Side Card: Savings Insight -> Now Dynamic Budget Health */}
                    <div className="bg-gradient-to-br from-primary to-indigo-700 p-8 rounded-xl border border-transparent text-white shadow-xl flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-4">Savings Insight</h2>
                            <p className="text-indigo-100 leading-relaxed text-sm">
                                {totalExpenses > totalLimit 
                                    ? "Wait! You've exceeded your total budget limit. Time to review your spending habits." 
                                    : "Tracking your expenses is the first step to financial freedom. Keep reviewing your spending habits to identify savings opportunities!"}
                            </p>
                        </div>
                        <div className="mt-8">
                             <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2">Budget Health</h4>
                                <div className="flex justify-between text-sm mb-1 font-medium">
                                    <span>Spending vs Limit</span>
                                    <span>{budgetHealthPercentage > 100 ? 'Over' : (budgetHealthPercentage > 80 ? 'Warning' : 'Good')}</span>
                                </div>
                                <div className="w-full bg-indigo-900/30 rounded-full h-2">
                                    <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(budgetHealthPercentage, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] text-indigo-200 font-medium">
                                    <span>${totalExpenses.toFixed(0)} spent</span>
                                    <span>${totalLimit.toFixed(0)} limit</span>
                                </div>
                            </div>
                        </div>
                        <Link to="/reports" className="mt-8 whitespace-nowrap px-6 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-primary font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center inline-block">
                            View Insights
                        </Link>
                    </div>
                </div>

                {/* Bottom Section: Recent Expenses */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Expenses</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Title</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {recentExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No expenses recorded yet.</td>
                                    </tr>
                                ) : (
                                    recentExpenses.map((expense) => (
                                        <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${expense.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                        <span className="material-icons text-sm">{expense.type === 'income' ? 'trending_up' : 'trending_down'}</span>
                                                    </div>
                                                    {expense.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">{expense.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {expense.date && !isNaN(new Date(expense.date).getTime()) ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${expense.type === 'income' ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                                                {expense.type === 'income' ? '+' : ''}${(Number(expense.amount) || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                 <div className="flex items-center justify-center gap-2">
                                                    <Link to={`/edit-expense/${expense._id}`} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Edit">
                                                        <span className="material-icons text-lg">edit</span>
                                                    </Link>
                                                    <button onClick={() => deleteExpense(expense._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                                        <span className="material-icons text-lg">delete_outline</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Footer Meta */}
            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-auto">
                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">© 2024 SpendWise Expense Tracker. Built with care for your finances.</p>
                    <div className="flex gap-6 text-gray-400 text-sm">
                        <Link className="hover:text-primary transition-colors" to="/privacy">Privacy Policy</Link>
                        <Link className="hover:text-primary transition-colors" to="/terms">Terms of Service</Link>
                        <Link className="hover:text-primary transition-colors" to="/help">Help Center</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
