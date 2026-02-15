const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updateUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../middleware/validators');

router.post('/signup', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.get('/me', protect, getMe);
router.put('/update', protect, updateUser);

module.exports = router;
