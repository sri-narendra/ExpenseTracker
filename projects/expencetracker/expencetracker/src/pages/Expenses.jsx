import { useContext, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ExpenseContext from '../context/ExpenseContext';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const Expenses = () => {
    const { expenses, meta, getExpenses, deleteExpense, loading } = useContext(ExpenseContext);
    const { logout } = useContext(AuthContext);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedExpenses, setSelectedExpenses] = useState([]);

    // Debounce searchTerm
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms debounce
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Debounced search/filter fetch
    const fetchExpenses = useCallback((page = 1) => {
        const filters = {};
        if (debouncedSearchTerm) filters.title = debouncedSearchTerm;
        if (typeFilter !== 'All Types') filters.type = typeFilter.toLowerCase();
        if (categoryFilter !== 'All Categories') filters.category = categoryFilter;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        getExpenses(page, filters);
    }, [getExpenses, debouncedSearchTerm, typeFilter, categoryFilter, startDate, endDate]);

    useEffect(() => {
        fetchExpenses(1);
    }, [fetchExpenses]);

    // Checkbox Logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedExpenses(expenses.map(exp => exp._id));
        } else {
            setSelectedExpenses([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedExpenses(prev => [...prev, id]);
        } else {
            setSelectedExpenses(prev => prev.filter(item => item !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedExpenses.length === 0) return;
        if (window.confirm(`Are you sure you want to delete ${selectedExpenses.length} selected transactions?`)) {
            try {
                for (const id of selectedExpenses) {
                    await deleteExpense(id);
                }
                setSelectedExpenses([]);
                toast.success('Selected transactions deleted');
                fetchExpenses(meta.currentPage);
            } catch (error) {
                console.error("Bulk delete error", error);
                toast.error("Failed to delete some transactions");
            }
        }
    };

    const paginate = (pageNumber) => {
        fetchExpenses(pageNumber);
        window.scrollTo(0, 0);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 min-h-screen">
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
                                <Link className="text-primary border-b-2 border-primary pb-1" to="/expenses">Expenses</Link>
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
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Link className="hover:text-primary" to="/">Dashboard</Link>
                            <span className="material-icons text-sm">chevron_right</span>
                            <span>Expenses</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Review and manage every expense recorded in your account.</p>
                    </div>
                    <Link to="/add-expense" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
                        <span className="material-icons">add</span>
                        Add New Transaction
                    </Link>
                </header>

                <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Search</label>
                            <div className="relative">
                                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                                <input 
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-sm" 
                                    placeholder="Search by title..." 
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                            <select 
                                className="w-full py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option>All Types</option>
                                <option>Income</option>
                                <option>Expense</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                            <select 
                                className="w-full py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option>All Categories</option>
                                <option>Food</option>
                                <option>Transport</option>
                                <option>Shopping</option>
                                <option>Housing</option>
                                <option>Utilities</option>
                                <option>Entertainment</option>
                                <option>Health</option>
                                <option>Salary</option>
                                <option>Business</option>
                                <option>Freelance</option>
                                <option>Investments</option>
                                <option>Gift</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date Range</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    className="w-full px-2 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-sm" 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <input 
                                    className="w-full px-2 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-sm" 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-500"><span className="text-gray-900 dark:text-white font-bold">{meta.totalCount}</span> Transactions found</span>
                            {selectedExpenses.length > 0 && (
                                <button 
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                                >
                                    <span className="material-icons text-sm">delete</span>
                                    Delete Selected ({selectedExpenses.length})
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto relative min-h-[200px]">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 transition-opacity">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            </div>
                        )}
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-4 w-4">
                                        <input 
                                            className="rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-gray-800 cursor-pointer" 
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={expenses.length > 0 && expenses.every(item => selectedExpenses.includes(item._id))}
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Transaction</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {expenses.map((expense) => (
                                    <tr key={expense._id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group ${selectedExpenses.includes(expense._id) ? 'bg-primary/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input 
                                                className="rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-gray-800 cursor-pointer" 
                                                type="checkbox"
                                                checked={selectedExpenses.includes(expense._id)}
                                                onChange={(e) => handleSelectOne(e, expense._id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${expense.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                    <span className="material-icons text-lg">{expense.type === 'income' ? 'trending_up' : 'trending_down'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-white">{expense.title}</span>
                                                    {expense.notes && <span className="text-[11px] text-gray-400 italic truncate max-w-[150px]">{expense.notes}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">{expense.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${expense.type === 'income' ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                                            {expense.type === 'income' ? '+' : ''}${(Number(expense.amount) || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link to={`/edit-expense/${expense._id}`} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit">
                                                    <span className="material-icons text-xl">edit</span>
                                                </Link>
                                                <button onClick={() => deleteExpense(expense._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                    <span className="material-icons text-xl">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">
                                            <div className="flex flex-col items-center">
                                                <span className="material-icons text-5xl mb-2 text-gray-300">history_toggle_off</span>
                                                <p>No transactions match your current filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                         <p className="text-sm text-gray-500">
                            Showing <span className="font-bold text-gray-900 dark:text-white">{(meta.currentPage - 1) * meta.limit + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(meta.currentPage * meta.limit, meta.totalCount)}</span> of <span className="font-bold text-gray-900 dark:text-white">{meta.totalCount}</span> entries
                         </p>
                         <div className="flex items-center gap-2">
                             <button 
                                onClick={() => paginate(meta.currentPage - 1)}
                                disabled={!meta.hasPrev}
                                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                             >
                                <span className="material-icons text-xl">chevron_left</span>
                             </button>
                             <div className="flex items-center gap-1">
                                {[...Array(meta.totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${meta.currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                             </div>
                             <button 
                                onClick={() => paginate(meta.currentPage + 1)}
                                disabled={!meta.hasNext}
                                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                             >
                                <span className="material-icons text-xl">chevron_right</span>
                             </button>
                         </div>
                    </div>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-auto">
                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">© 2024 SpendWise Expense Tracker. Hardened & Optimized.</p>
                </div>
            </footer>
        </div>
    );
};

export default Expenses;
