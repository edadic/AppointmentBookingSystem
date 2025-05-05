const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { 
  createStore, 
  getStores, 
  getStore, 
  updateStore, 
  deleteStore,
  searchStores 
} = require('../controllers/storeController');

const router = express.Router();

router.get('/search', searchStores);
// Public routes (protected but not restricted)
router.use(protect);
router.get('/', getStores);
router.get('/:id', getStore);  // Make sure this route exists

// Store owner only routes
router.use(restrictTo('store_owner'));
router.post('/', createStore);
router.put('/:id', updateStore);
router.delete('/:id', deleteStore);

module.exports = router;