import { createContext, useReducer, useCallback } from 'react';
import api from '../utils/api';

const initialState = {
    expenses: [],
    meta: {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false
    },
    stats: {
        totalExpenses: 0,
        totalIncome: 0,
        highestExpense: 0,
        averageExpense: 0,
        count: 0
    },
    error: null,
    loading: true,
};

const ExpenseContext = createContext(initialState);

const AppReducer = (state, action) => {
    switch (action.type) {
        case 'GET_EXPENSES':
            return {
                ...state,
                loading: false,
                expenses: action.payload.data,
                meta: action.payload.meta || state.meta,
                error: null
            };
        case 'ADD_EXPENSE':
            return {
                ...state,
                expenses: [action.payload, ...state.expenses],
                error: null
            };
        case 'DELETE_EXPENSE':
            return {
                ...state,
                expenses: state.expenses.filter(expense => expense._id !== action.payload),
                error: null
            };
        case 'UPDATE_EXPENSE':
            return {
                ...state,
                expenses: state.expenses.map(expense => 
                    expense._id === action.payload._id ? action.payload : expense
                ),
                error: null
            };
        case 'GET_STATS':
            return {
                ...state,
                stats: action.payload,
                error: null
            };
        case 'EXPENSE_ERROR':
            return {
                ...state,
                error: action.payload,
            };
        default:
            return state;
    }
};

export const ExpenseProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialState);

    const getExpenses = useCallback(async (page = 1, filters = {}) => {
        try {
            const response = await api.get('/expenses', {
                params: { page, ...filters }
            });

            dispatch({
                type: 'GET_EXPENSES',
                payload: response
            });
        } catch (err) {
            dispatch({
                type: 'EXPENSE_ERROR',
                payload: err.message
            });
        }
    }, []);

    const addExpense = useCallback(async (expense) => {
        try {
            const response = await api.post('/expenses', expense);

            dispatch({
                type: 'ADD_EXPENSE',
                payload: response.data
            });
        } catch (err) {
            dispatch({
                type: 'EXPENSE_ERROR',
                payload: err.message
            });
        }
    }, []);

    const deleteExpense = useCallback(async (id) => {
        try {
            await api.delete(`/expenses/${id}`);

            dispatch({
                type: 'DELETE_EXPENSE',
                payload: id,
            });
        } catch (err) {
            dispatch({
                type: 'EXPENSE_ERROR',
                payload: err.message
            });
        }
    }, []);

    const updateExpense = useCallback(async (id, updatedExpense) => {
        try {
            const response = await api.put(`/expenses/${id}`, updatedExpense);

            dispatch({
                type: 'UPDATE_EXPENSE',
                payload: response.data
            });
        } catch (err) {
            dispatch({
                type: 'EXPENSE_ERROR',
                payload: err.message
            });
            throw err;
        }
    }, []);

    const getStats = useCallback(async () => {
        try {
            const response = await api.get('/expenses/stats');
            dispatch({
                type: 'GET_STATS',
                payload: response.data
            });
        } catch (err) {
            dispatch({
                type: 'EXPENSE_ERROR',
                payload: err.message
            });
        }
    }, []);

    return (
        <ExpenseContext.Provider value={{
            expenses: state.expenses,
            meta: state.meta,
            stats: state.stats,
            error: state.error,
            loading: state.loading,
            getExpenses,
            getStats,
            deleteExpense,
            addExpense,
            updateExpense
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export default ExpenseContext;
