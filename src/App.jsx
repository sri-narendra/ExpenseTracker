import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Switched to HashRouter for GH Pages
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import EditExpense from './pages/EditExpense';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Help from './pages/Help';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import ProtectedRoute from './components/ProtectedRoute'; // valid

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Router>
          <div className="min-h-screen bg-background-light text-gray-900 font-display">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Private Routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/add-expense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
              <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/edit-expense/:id" element={<ProtectedRoute><EditExpense /></ProtectedRoute>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/help" element={<Help />} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <ToastContainer />
          </div>
        </Router>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
