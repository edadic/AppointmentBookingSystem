const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { 
  setAvailability, 
  getAvailability, 
  updateAvailability 
} = require('../controllers/availabilityController');

const router = express.Router();

router.use(protect);
router.use(restrictTo('store_owner'));

router.post('/', setAvailability);
router.get('/store/:store_id', getAvailability);
router.put('/:id', updateAvailability);

module.exports = router;