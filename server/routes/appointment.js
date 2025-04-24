const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  createAppointment,
  getUserAppointments,
  getStoreAppointments,
  updateAppointmentStatus,
  getStoreBookedSlots 
} = require('../controllers/appointmentController');

const router = express.Router();

// Public route - must be before protect middleware
router.get('/store/:storeId/booked', getStoreBookedSlots);

// Protected routes
router.use(protect);

// Routes for all authenticated users
router.post('/', createAppointment);
router.get('/my-appointments', getUserAppointments);

// Routes for store owners only
router.get('/store/:storeId', restrictTo('store_owner'), getStoreAppointments);
router.patch('/:id/status', restrictTo('store_owner'), updateAppointmentStatus);

module.exports = router;