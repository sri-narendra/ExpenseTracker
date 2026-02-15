import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ExpenseContext from '../context/ExpenseContext';
import { toast } from 'react-toastify';

const AddExpense = () => {
    const { addExpense } = useContext(ExpenseContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
        type: 'expense'
    });

    const { title, amount, category, date, notes, type } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onTypeChange = (newType) => {
        setFormData({ 
            ...formData, 
            type: newType, 
            category: newType === 'income' ? 'Salary' : 'Food' 
        });
    }

    const onSubmit = (e) => {
        e.preventDefault();

        if (!title || !amount) {
            toast.error('Please enter title and amount');
            return;
        }

        const newExpense = {
            title,
            amount: +amount,
            category,
            date,
            type,
            notes,
        };

        const handleAdd = async () => {
            try {
                await addExpense(newExpense);
                toast.success(`${type === 'income' ? 'Income' : 'Expense'} added successfully`);
                navigate('/');
            } catch (error) {
                console.error("Add expense error", error);
                toast.error("Failed to add transaction. Please try again.");
            }
        };

        handleAdd();
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 min-h-screen">
            {/* Nav */}
            <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-icons text-white text-xl">account_balance_wallet</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SpendWise</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Dashboard</Link>
                            <span className="text-sm font-medium text-primary">Add Transaction</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="flex mb-6 text-sm text-gray-500 dark:text-gray-400">
                        <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
                        <span className="mx-2 text-gray-300">/</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">Add {type === 'income' ? 'Income' : 'Expense'}</span>
                    </nav>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{type === 'income' ? 'Income' : 'Expense'} Details</h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track your {type} by adding a new entry.</p>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    <span className="material-icons">{type === 'income' ? 'trending_up' : 'trending_down'}</span>
                                </div>
                            </div>

                            {/* Type Toggle */}
                            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
                                <button
                                    type="button"
                                    onClick={() => onTypeChange('expense')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onTypeChange('income')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Income
                                </button>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-6">
                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="title">Title</label>
                                    <div className="relative">
                                        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">edit</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                            id="title"
                                            name="title"
                                            type="text"
                                            placeholder={type === 'income' ? "e.g., Salary, Freelance" : "e.g., Grocery Shopping"}
                                            value={title}
                                            onChange={onChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Amount */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="amount">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                            <input
                                                className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                                id="amount"
                                                name="amount"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={onChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="category">Category</label>
                                        <div className="relative">
                                            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">label</span>
                                            <select
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                                id="category"
                                                name="category"
                                                value={category}
                                                onChange={onChange}
                                            >
                                                {type === 'expense' ? (
                                                    <>
                                                        <option value="Food">Food & Drinks</option>
                                                        <option value="Transport">Transport</option>
                                                        <option value="Shopping">Shopping</option>
                                                        <option value="Housing">Housing</option>
                                                        <option value="Utilities">Utilities</option>
                                                        <option value="Entertainment">Entertainment</option>
                                                        <option value="Health">Health</option>
                                                        <option value="Other">Other</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Salary">Salary</option>
                                                        <option value="Business">Business</option>
                                                        <option value="Freelance">Freelance</option>
                                                        <option value="Investments">Investments</option>
                                                        <option value="Gift">Gift</option>
                                                        <option value="Other">Other</option>
                                                    </>
                                                )}
                                            </select>
                                            <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="date">Date</label>
                                    <div className="relative">
                                        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">calendar_today</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            id="date"
                                            name="date"
                                            type="date"
                                            value={date}
                                            onChange={onChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="notes">Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <div className="relative">
                                        <span className="material-icons absolute left-3 top-3 text-gray-400 text-[20px]">notes</span>
                                        <textarea
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 resize-none"
                                            id="notes"
                                            name="notes"
                                            rows="3"
                                            placeholder="Add additional details..."
                                            value={notes}
                                            onChange={onChange}
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
                                    >
                                        Save {type === 'income' ? 'Income' : 'Expense'}
                                    </button>
                                </div>
                            </form>
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

export default AddExpense;
