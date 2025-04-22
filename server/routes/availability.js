const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { setAvailability, getAvailability, updateAvailability } = require('../controllers/availabilityController');

const router = express.Router();

// Allow any authenticated user to view availability
router.use(protect);
router.get('/store/:id', getAvailability); // Changed from getStoreAvailability to getAvailability

// Restrict setting availability to store owners
router.use(restrictTo('store_owner'));
router.post('/', setAvailability);
router.put('/:id', updateAvailability);

module.exports = router;