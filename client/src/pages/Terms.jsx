import { Link } from 'react-router-dom';

const Terms = () => {
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
                <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed space-y-6">
                    <p>Welcome to SpendWise. By using our application, you agree to the following terms.</p>
                    
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Use of Service</h2>
                        <p>You agree to use SpendWise only for lawful financial tracking purposes and in a manner that does not infringe the rights of others.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Account Responsibility</h2>
                        <p>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Service Updates</h2>
                        <p>We reserves the right to modify or discontinue any part of the service at any time to improve the user experience.</p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Terms;
