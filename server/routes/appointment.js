const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  createAppointment,
  getUserAppointments,
  getStoreAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

const router = express.Router();

router.use(protect);

// Routes for all authenticated users
router.post('/', createAppointment);
router.get('/my-appointments', getUserAppointments);

// Routes for store owners only
router.get('/store/:storeId', restrictTo('store_owner'), getStoreAppointments);
router.patch('/:id/status', restrictTo('store_owner'), updateAppointmentStatus);

module.exports = router;