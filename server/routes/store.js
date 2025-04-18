const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { 
  createStore, 
  getStores, 
  getStore, 
  updateStore, 
  deleteStore 
} = require('../controllers/storeController');

const router = express.Router();

// Protect all store routes
router.use(protect);
router.use(restrictTo('store_owner'));

router.post('/', createStore);
router.get('/', getStores);
router.get('/:id', getStore);
router.put('/:id', updateStore);
router.delete('/:id', deleteStore);

module.exports = router;