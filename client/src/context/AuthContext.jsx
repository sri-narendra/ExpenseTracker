import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    // response is already response.data thanks to interceptor
                    setUser(response.data);
                } catch (error) {
                    console.error('Session check failed:', error.message);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            setUser(response.data);
            setError(null);
            return response.data;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await api.post('/auth/signup', { name, email, password });
            localStorage.setItem('token', response.data.token);
            setUser(response.data);
            setError(null);
            return response.data;
        } catch (err) {
            setError(err.message || 'Registration failed');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = async (userData) => {
        try {
            const response = await api.put('/auth/update', userData);
            setUser(response.data);
            return response.data;
        } catch (err) {
            setError(err.message || 'Update failed');
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
