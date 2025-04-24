const express = require('express');
const { getCurrentUser, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, getCurrentUser);
router.put('/update', protect, updateUser);

module.exports = router;