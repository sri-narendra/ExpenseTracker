import { Link } from 'react-router-dom';

const Help = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-display">
            <nav className="bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-icons text-white text-sm">account_balance_wallet</span>
                        </div>
                        <span className="text-lg font-bold text-primary">SpendWise</span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Help Center</h1>
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How do I add an income?</h2>
                        <p className="text-gray-600 dark:text-gray-400">Click "Add Transaction" and toggle the switch from "Expense" to "Income". You can then select a category like Salary or Freelance.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How do I set a budget?</h2>
                        <p className="text-gray-600 dark:text-gray-400">Navigate to the "Budgets" tab. Click the pencil icon on any category to set your monthly spending limit.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Can I export my data?</h2>
                        <p className="text-gray-600 dark:text-gray-400">Yes! Go to the "Reports" page and click the Download icon at the top right to get your transaction history in CSV format.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Help;
