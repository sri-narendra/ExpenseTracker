import { useState, useContext, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ExpenseContext from '../context/ExpenseContext';
import { toast } from 'react-toastify';
import api from '../utils/api';

const EditExpense = () => {
    const { updateExpense } = useContext(ExpenseContext);
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: '',
        notes: '',
        type: 'expense'
    });
    const [loading, setLoading] = useState(true);

    const { title, amount, category, date, notes, type } = formData;

    const fetchExpenseDetails = useCallback(async () => {
        try {
            const response = await api.get(`/expenses/${id}`);
            const data = response.data;
            setFormData({
                title: data.title,
                amount: data.amount.toString(),
                category: data.category,
                date: new Date(data.date).toISOString().slice(0, 10),
                notes: data.notes || '',
                type: data.type || 'expense'
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching expense", error);
            toast.error("Failed to load transaction details");
            navigate('/expenses');
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchExpenseDetails();
    }, [fetchExpenseDetails]);

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

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!title || !amount) {
            toast.error('Please enter title and amount');
            return;
        }

        const updatedData = {
            title,
            amount: +amount,
            category,
            date,
            type,
            notes,
        };

        try {
            await updateExpense(id, updatedData);
            toast.success(`${type === 'income' ? 'Income' : 'Expense'} updated successfully`);
            navigate('/expenses');
        } catch (error) {
            console.error("Update error", error);
            toast.error("Failed to update transaction");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 min-h-screen">
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
                            <Link to="/expenses" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Expenses</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto">
                    <nav className="flex mb-6 text-sm text-gray-500 dark:text-gray-400">
                        <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
                        <span className="mx-2 text-gray-300">/</span>
                        <Link to="/expenses" className="hover:text-primary transition-colors">Expenses</Link>
                        <span className="mx-2 text-gray-300">/</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">Edit Transaction</span>
                    </nav>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-8">
                            <h1 className="text-2xl font-bold mb-8">Edit {type === 'income' ? 'Income' : 'Expense'}</h1>

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
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Title</label>
                                    <input
                                        className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                                        name="title"
                                        value={title}
                                        onChange={onChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</label>
                                        <input
                                            className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            value={amount}
                                            onChange={onChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
                                        <select
                                            className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none cursor-pointer"
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
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                                    <input
                                        className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                                        name="date"
                                        type="date"
                                        value={date}
                                        onChange={onChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                                    <textarea
                                        className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none resize-none"
                                        name="notes"
                                        rows="3"
                                        value={notes}
                                        onChange={onChange}
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/expenses')}
                                        className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
                                    >
                                        Update Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditExpense;
