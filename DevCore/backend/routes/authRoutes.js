const express = require('express');
const router = express.Router();
const { signup, login, logout, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware'); // ✅ use correct middleware filename

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
