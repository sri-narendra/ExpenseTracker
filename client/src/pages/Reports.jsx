import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ExpenseContext from '../context/ExpenseContext';
import AuthContext from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { toast } from 'react-toastify';

const Reports = () => {
    const { expenses, getExpenses } = useContext(ExpenseContext);
    const { logout } = useContext(AuthContext);
    const [timeRange, setTimeRange] = useState('6m'); // Default to Last 6 Months

    useEffect(() => {
        // Fetch a large limit to ensure all data is available for reports/charts/export
        getExpenses(1, { limit: 1000 });
    }, [getExpenses]);

    // Data Processing for Charts
    const processChartData = () => {
        const monthlyData = {};
        const dailySpending = {};
        
        const now = new Date();

        (expenses || []).forEach(expense => {
            if (!expense) return;
            const date = new Date(expense.date);
            if (isNaN(date.getTime())) return;
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Filter Logic
            if (timeRange === '30d' && diffDays > 30) return;
            if (timeRange === '6m' && diffDays > 180) return;
            // 'all' includes everything

            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            const day = date.toLocaleDateString();
            
            // Monthly Income vs Spending
            if (!monthlyData[monthYear]) {
                // Use year * 12 + month for absolute sorting
                const sortOrder = date.getFullYear() * 12 + date.getMonth();
                monthlyData[monthYear] = { name: monthYear, Income: 0, Spending: 0, order: sortOrder };
            }
            
            if (expense.type === 'income') {
                monthlyData[monthYear].Income += Number(expense.amount) || 0;
            } else {
                monthlyData[monthYear].Spending += Number(expense.amount) || 0;
                
                // Daily Spending for Trend
                dailySpending[day] = (dailySpending[day] || 0) + expense.amount;
            }
        });

        // Convert to arrays and sort
        const incomeSpendingData = Object.values(monthlyData).sort((a, b) => a.order - b.order);

        // Get last 7 active days for trend or just last 7 days
        const spendingTrendData = Object.keys(dailySpending)
            .map(date => ({ name: date, value: dailySpending[date] }))
            .sort((a, b) => new Date(a.name) - new Date(b.name))
            .slice(-7); // Last 7 days

        return { incomeSpendingData, spendingTrendData };
    };

    const { incomeSpendingData, spendingTrendData } = processChartData();

    // Calculate Top Merchants/Categories from real data
    const categorySpending = (expenses || [])
        .filter(e => {
            if (!e || e.type === 'income') return false;
            // Apply same time filter to categories
            const date = new Date(e.date);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (timeRange === '30d' && diffDays > 30) return false;
            if (timeRange === '6m' && diffDays > 180) return false;
            return true;
        })
        .reduce((acc, expense) => {
            if (!expense) return acc;
            const category = expense.category || 'Other';
            acc[category] = (acc[category] || 0) + (Number(expense.amount) || 0);
            return acc;
        }, {});
    
    const topCategories = Object.keys(categorySpending)
        .map(key => ({ name: key, value: categorySpending[key] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4);

    const filteredExpensesForTotal = (expenses || []).filter(e => {
        if (!e || e.type === 'income') return false;
        const date = new Date(e.date);
        if (isNaN(date.getTime())) return false;
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (timeRange === '30d' && diffDays > 30) return false;
        if (timeRange === '6m' && diffDays > 180) return false;
        return true;
    });

    const totalSpent = filteredExpensesForTotal.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const averageDailySpend = spendingTrendData.length > 0 ? (totalSpent / (filteredExpensesForTotal.length || 1)).toFixed(2) : "0.00"; 

    const handleDownload = () => {
        if (!expenses || expenses.length === 0) {
            toast.error("No data available to export");
            return;
        }

        const headers = ["Date", "Title", "Type", "Category", "Amount", "Notes"];
        const csvRows = [
            headers.join(","), // Header row
            ...(expenses || []).map(e => [
                new Date(e.date).toLocaleDateString(),
                `"${(e.title || '').replace(/"/g, '""')}"`,
                e.type || 'expense',
                e.category || 'Other',
                e.amount || 0,
                `"${(e.notes || '').replace(/"/g, '""')}"`
            ].join(","))
        ];

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `SpendWise_Report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("CSV Report downloaded successfully!");
    };

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
                                <Link className="hover:text-primary transition-colors" to="/">Dashboard</Link>
                                <Link className="hover:text-primary transition-colors" to="/expenses">Expenses</Link>
                                <Link className="hover:text-primary transition-colors" to="/budgets">Budgets</Link>
                                <Link className="text-primary border-b-2 border-primary pb-1" to="/reports">Reports</Link>
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
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Detailed Analytics</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">In-depth breakdown of your financial habits.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1 flex shadow-sm">
                            <button 
                                onClick={() => setTimeRange('30d')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === '30d' ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                Last 30 Days
                            </button>
                            <button 
                                onClick={() => setTimeRange('6m')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === '6m' ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                Last 6 Months
                            </button>
                            <button 
                                onClick={() => setTimeRange('all')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === 'all' ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                All Time
                            </button>
                        </div>
                        <button onClick={handleDownload} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">
                            <span className="material-icons text-xl">download</span>
                        </button>
                    </div>
                </header>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Income vs. Spending</h2>
                            <p className="text-sm text-gray-500">Monthly comparison for the last 6 months</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Spending</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full mt-4">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={incomeSpendingData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="Income" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Spending" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Categories</h2>
                            <p className="text-sm text-gray-500">Where you spent the most this period</p>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                             {topCategories.map((cat, index) => (
                                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                            <span className="material-icons text-gray-500">category</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">${typeof cat.value === 'number' ? cat.value.toFixed(2) : '0.00'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/20 text-center">
                            <button onClick={handleDownload} className="text-primary text-sm font-semibold hover:underline">Download full report</button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cost Trend</h2>
                                <p className="text-sm text-gray-500">Weekly spending fluctuations</p>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={spendingTrendData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#5048e5" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#5048e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip />
                                    <Area type="monotone" dataKey="value" stroke="#5048e5" fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="material-icons text-primary">analytics</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Transaction</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">${averageDailySpend}</span>
                            </div>
                        </div>
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

export default Reports;
