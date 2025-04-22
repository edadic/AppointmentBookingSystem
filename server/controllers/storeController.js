const Store = require('../models/Store');

exports.createStore = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log

    // Ensure all required fields are present
    if (!req.body.name || !req.body.location || !req.body.contact_email || !req.body.phone_number) {
      return res.status(400).json({ 
        message: 'All fields are required: Name, Location, Contact Email, and Phone Number' 
      });
    }

    const store = await Store.create({
      ...req.body,
      user_id: req.user.userId
    });

    res.status(201).json(store);
  } catch (error) {
    console.error('Store creation error:', error); // Debug log
    res.status(400).json({ 
      message: error.message || 'Error creating store'
    });
  }
};

exports.getStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      where: req.user.isStoreOwner ? { user_id: req.user.userId } : {}
    });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stores', error: error.message });
  }
};

exports.getStore = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { 
        id: req.params.id
        // Remove user_id filter to allow any user to view any store
      }
    });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store', error: error.message });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.userId
      }
    });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    await store.update(req.body);
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Error updating store', error: error.message });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.userId
      }
    });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    await store.destroy();
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting store', error: error.message });
  }
};