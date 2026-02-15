import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
    });
    const [loading, setLoading] = useState(false);

    const { name, email, password, confirmPassword, terms } = formData;
    const [showPassword, setShowPassword] = useState(false);
    const { register, error, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
        if (error) {
            toast.error(error);
        }
    }, [user, error, navigate]);

    const onChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (!terms) {
            toast.error('Please agree to the Terms of Service');
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
        } catch (err) {
            console.error("Signup error", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
             {/* Background Decorative Element */}
             <div className="fixed top-0 right-0 -z-10 opacity-10 pointer-events-none overflow-hidden">
                <svg className="h-[600px] w-[600px] transform translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 400 400">
                    <defs>
                        <pattern height="40" id="pattern-id" patternUnits="userSpaceOnUse" width="40" x="0" y="0">
                            <path className="text-primary" d="M0 40V.5H40" fill="none" stroke="currentColor"></path>
                        </pattern>
                    </defs>
                    <rect fill="url(#pattern-id)" height="400" width="400"></rect>
                </svg>
            </div>
            <div className="fixed bottom-0 left-0 -z-10 opacity-10 pointer-events-none overflow-hidden">
                <svg className="h-[600px] w-[600px] transform -translate-x-1/2 translate-y-1/2" fill="none" viewBox="0 0 400 400">
                    <circle className="text-primary" cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="2"></circle>
                    <circle className="text-primary" cx="200" cy="200" r="140" stroke="currentColor" strokeDasharray="10 10" strokeWidth="1"></circle>
                </svg>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* App Logo & Branding */}
                <div className="flex justify-center mb-6">
                    <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/30">
                        <span className="material-icons text-white text-3xl">account_balance_wallet</span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Start tracking your expenses with precision today.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                {/* Auth Card */}
                <div className="bg-white dark:bg-gray-800/50 dark:border dark:border-gray-700 py-10 px-6 shadow-xl rounded-xl sm:px-10">
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Full Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="name">
                                Full Name
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons text-gray-400 text-lg">person</span>
                                </div>
                                <input
                                    autoComplete="name"
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-900 dark:text-white"
                                    id="name"
                                    name="name"
                                    value={name}
                                    onChange={onChange}
                                    placeholder="John Doe"
                                    required
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                                Email Address
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons text-gray-400 text-lg">mail</span>
                                </div>
                                <input
                                    autoComplete="email"
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-900 dark:text-white"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    placeholder="name@example.com"
                                    required
                                    type="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons text-gray-400 text-lg">lock</span>
                                </div>
                                <input
                                    autoComplete="new-password"
                                    className="appearance-none block w-full pl-10 px-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-900 dark:text-white"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    placeholder="••••••••"
                                    required
                                    type={showPassword ? "text" : "password"}
                                />
                                <div 
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-icons text-gray-400 text-lg hover:text-gray-600 dark:hover:text-gray-200">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons text-gray-400 text-lg">verified_user</span>
                                </div>
                                <input
                                    autoComplete="new-password"
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-900 dark:text-white"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={onChange}
                                    placeholder="••••••••"
                                    required
                                    type="password"
                                />
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-center">
                            <input
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                id="terms"
                                name="terms"
                                checked={terms}
                                onChange={onChange}
                                required
                                type="checkbox"
                            />
                            <label className="ml-2 block text-xs text-gray-600 dark:text-gray-400" htmlFor="terms">
                                I agree to the <Link className="text-primary hover:underline" to="/terms">Terms of Service</Link> and <Link className="text-primary hover:underline" to="/privacy">Privacy Policy</Link>
                            </label>
                        </div>

                        {/* Primary Action Button */}
                        <div>
                            <button
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading && <span className="material-icons text-lg mr-2 animate-spin">sync</span>}
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    {/* Redirect Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link className="font-semibold text-primary hover:text-primary/80 transition-colors" to="/login">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* App Benefits Section */}
                <div className="mt-8 grid grid-cols-3 gap-4 px-2">
                    <div className="text-center">
                        <span className="material-icons text-primary/60 text-xl mb-1">security</span>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Secure Data</p>
                    </div>
                    <div className="text-center">
                        <span className="material-icons text-primary/60 text-xl mb-1">insights</span>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Smart Insights</p>
                    </div>
                    <div className="text-center">
                        <span className="material-icons text-primary/60 text-xl mb-1">cloud_sync</span>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Auto Sync</p>
                    </div>
                </div>
            </div>

            {/* Footer Meta */}
            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-auto">
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

export default Signup;
