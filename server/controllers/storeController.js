const { Op } = require('sequelize');
const Store = require('../models/Store');
const StoreAvailability = require('../models/StoreAvailability');
const Appointment = require('../models/Appointment');

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

exports.searchStores = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      available,
      sort = 'name_asc',
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Search by name, description, and location
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by location
    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }

    // Define sort options
    const sortOptions = {
      name_asc: [['name', 'ASC']],
      name_desc: [['name', 'DESC']],
      created_desc: [['created_at', 'DESC']],
      created_asc: [['created_at', 'ASC']]
    };

    let stores = await Store.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: sortOptions[sort] || sortOptions.name_asc,
      include: [
        {
          model: StoreAvailability,
          attributes: ['weekday', 'start_time', 'end_time']
        }
      ]
    });

    // Filter stores with available appointments if requested
    if (available === 'true') {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      stores.rows = await Promise.all(stores.rows.map(async (store) => {
        const appointments = await Appointment.count({
          where: {
            store_id: store.id,
            appointment_time: {
              [Op.between]: [now, oneWeekFromNow]
            },
            status: 'approved'
          }
        });
        
        const hasAvailability = store.store_availabilities.some(avail => {
          const today = now.toLocaleString('en-US', { weekday: 'long' });
          return avail.weekday === today;
        });

        return {
          ...store.toJSON(),
          has_availability: hasAvailability && appointments < 10 // arbitrary threshold
        };
      }));

      if (available === 'true') {
        stores.rows = stores.rows.filter(store => store.has_availability);
        stores.count = stores.rows.length;
      }
    }

    res.json({
      stores: stores.rows,
      total: stores.count,
      pages: Math.ceil(stores.count / limit)
    });
  } catch (error) {
    console.error('Search stores error:', error); 
    res.status(500).json({ 
      message: 'Error searching stores', 
      error: error.message 
    });
  }
};