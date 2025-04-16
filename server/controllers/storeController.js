const Store = require('../models/Store');

exports.createStore = async (req, res) => {
  try {
    const store = await Store.create({
      ...req.body,
      user_id: req.user.userId
    });
    res.status(201).json(store);
  } catch (error) {
    res.status(400).json({ message: 'Error creating store', error: error.message });
  }
};

exports.getStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      where: { user_id: req.user.userId }
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
        id: req.params.id,
        user_id: req.user.userId
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