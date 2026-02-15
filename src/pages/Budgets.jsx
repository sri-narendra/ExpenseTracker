import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExpenseContext from '../context/ExpenseContext';
import AuthContext from '../context/AuthContext';

const Budgets = () => {
    const { expenses, getExpenses } = useContext(ExpenseContext);
    const { user, updateUser, logout } = useContext(AuthContext);

    useEffect(() => {
        getExpenses();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Default limits if not set
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

    // Improved fallback: use defaultLimits if settings are empty/missing
    const budgetLimits = (user?.settings?.budgetLimits && Object.keys(user.settings.budgetLimits).length > 0) 
        ? user.settings.budgetLimits 
        : defaultLimits;

    const handleEditBudget = async (category, currentLimit) => {
        const newLimit = prompt(`Enter new budget limit for ${category}:`, currentLimit);
        if (newLimit && !isNaN(newLimit)) {
             const updatedLimits = { ...budgetLimits, [category]: parseFloat(newLimit) };
             try {
                await updateUser({ settings: { budgetLimits: updatedLimits } });
             } catch (error) {
                 console.error("Failed to update budget", error);
                 alert("Failed to update budget");
             }
        }
    }

    const handleCreateBudget = async () => {
        const category = prompt("Enter category name (e.g., Travel, Education):");
        if (category) {
            const limit = prompt(`Enter budget limit for ${category}:`);
            if (limit && !isNaN(limit)) {
                const updatedLimits = { ...budgetLimits, [category]: parseFloat(limit) };
                try {
                    await updateUser({ settings: { budgetLimits: updatedLimits } });
                } catch (error) {
                    console.error("Failed to add budget", error);
                    alert(`Failed to add budget: ${error.response?.data?.message || error.message}`);
                }
            }
        }
    }

    const handleDeleteBudget = async (category) => {
        if (window.confirm(`Are you sure you want to delete the budget for ${category}?`)) {
             const updatedLimits = { ...budgetLimits };
             delete updatedLimits[category];
             try {
                 await updateUser({ settings: { budgetLimits: updatedLimits } });
             } catch (error) {
                 console.error("Failed to delete budget", error);
                 alert(`Failed to delete budget: ${error.response?.data?.message || error.message}`);
             }
        }
    }

    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    // Calculate actual spending per category (Expenses only)
    const categorySpending = safeExpenses
        .filter(e => e && e.type !== 'income')
        .reduce((acc, expense) => {
            if (!expense) return acc;
            const category = expense.category || 'Other';
            acc[category] = (acc[category] || 0) + (Number(expense.amount) || 0);
            return acc;
        }, {});

    // Ensure all categories in limits are shown, plus any that have spending
    const allCategories = new Set([...Object.keys(budgetLimits), ...Object.keys(categorySpending)]);

    const budgetCards = Array.from(allCategories).map(category => {
        const spent = categorySpending[category] || 0;
        const limit = budgetLimits[category] || 0; // Default to 0 if no limit set for a spending category
        const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : (spent > 0 ? 100 : 0);
        const isOverBudget = spent > limit;
        const remaining = limit - spent;

        // Visual helpers
        let colorClass = 'bg-primary';
        let remainingColorClass = 'text-emerald-600 dark:text-emerald-400';
        
        if (isOverBudget) {
            colorClass = 'bg-red-500';
            remainingColorClass = 'text-red-600 dark:text-red-400';
        } else if (percentage > 80) {
            colorClass = 'bg-amber-500';
        }

        return {
            category,
            spent,
            limit,
            percentage,
            isOverBudget,
            remaining,
            colorClass,
            remainingColorClass
        };
    });

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
                                <Link className="text-primary border-b-2 border-primary pb-1" to="/budgets">Budgets</Link>
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Set limits for categories and track your spending health.</p>
                    </div>
                    <button onClick={handleCreateBudget} className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
                        <span className="material-icons text-lg">add_circle_outline</span>
                        Create New Budget
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgetCards.map((item) => (
                         <div key={item.category} className={`bg-white dark:bg-gray-900 p-6 rounded-xl border ${item.isOverBudget ? 'border-red-500/20 dark:border-red-500/30' : 'border-gray-200 dark:border-gray-800'} shadow-sm relative overflow-hidden group`}>
                            {item.isOverBudget && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Over Budget</div>
                                </div>
                            )}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                        <span className="material-icons text-gray-500">category</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{item.category}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-sm font-medium ${item.remainingColorClass}`}>
                                                {item.isOverBudget ? 'Over' : 'Left'}: ${Math.abs(Number(item.remaining) || 0).toFixed(0)}
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Limit: ${item.limit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleEditBudget(item.category, item.limit)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Budget">
                                        <span className="material-icons text-xl">edit</span>
                                    </button>
                                    {item.limit > 0 && (
                                        <button 
                                            onClick={() => handleDeleteBudget(item.category)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete Budget"
                                        >
                                            <span className="material-icons text-xl">delete_outline</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className={`text-2xl font-bold ${item.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>${(Number(item.spent) || 0).toFixed(2)}</span>
                                        <span className="text-gray-400 text-sm"> / ${(Number(item.limit) || 0).toFixed(2)}</span>
                                    </div>
                                    <span className={`text-xs font-semibold ${item.isOverBudget ? 'text-red-600 bg-red-50 dark:bg-red-500/10' : 'text-gray-500 bg-gray-100 dark:bg-gray-800'} px-2 py-1 rounded-full`}>{(item.percentage || 0).toFixed(0)}% Used</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                    <div className={`${item.colorClass} h-full transition-all duration-500`} style={{ width: `${item.percentage}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-500">Remaining Balance</span>
                                    <span className={`text-sm font-bold ${item.remainingColorClass}`}>${(Number(item.remaining) || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
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

export default Budgets;
