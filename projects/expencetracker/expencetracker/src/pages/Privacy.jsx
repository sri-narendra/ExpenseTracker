import { Link } from 'react-router-dom';

const Privacy = () => {
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
                <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed space-y-6">
                    <p>Last updated: February 2024</p>
                    <p>At SpendWise, we take your privacy seriously. This policy explains how we handle your data.</p>
                    
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Information We Collect</h2>
                        <p>We only collect information necessary to provide you with a great expense tracking experience, including your name, email address, and the financial data you choose to input.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. How We Use Your Data</h2>
                        <p>Your data is used exclusively to generate your personal financial reports, track your budgets, and sync your information across your devices.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Data Security</h2>
                        <p>We use industry-standard encryption and security protocols to ensure your data is protected and never shared with third parties without your explicit consent.</p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
