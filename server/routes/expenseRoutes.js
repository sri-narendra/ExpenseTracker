const express = require('express');
const router = express.Router();
const {
    getExpenses,
    getExpense,
    setExpense,
    updateExpense,
    deleteExpense,
    getStats,
    getMonthlySummary
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { expenseValidator } = require('../middleware/validators');

router.use(protect); // All expense routes are protected

router.route('/')
    .get(getExpenses)
    .post(expenseValidator, setExpense);

router.get('/stats', getStats);
router.get('/summary', getMonthlySummary);

router.route('/:id')
    .get(getExpense)
    .put(expenseValidator, updateExpense)
    .delete(deleteExpense);

module.exports = router;
