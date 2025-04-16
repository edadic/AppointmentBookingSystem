const Store = require('../models/Store');
const StoreAvailability = require('../models/StoreAvailability');

const verifyStoreOwnership = async (storeId, userId) => {
  const store = await Store.findOne({ where: { id: storeId, user_id: userId } });
  return !!store;
};

exports.setAvailability = async (req, res) => {
  try {
    const { store_id, availabilities } = req.body;

    const isOwner = await verifyStoreOwnership(store_id, req.user.userId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to modify this store' });
    }

    await StoreAvailability.destroy({ where: { store_id } });
    
    const created = await StoreAvailability.bulkCreate(
      availabilities.map(availability => ({
        ...availability,
        store_id
      }))
    );

    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Error setting availability', error: error.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const { store_id } = req.params;
    
    const isOwner = await verifyStoreOwnership(store_id, req.user.userId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this store' });
    }

    const availability = await StoreAvailability.findAll({
      where: { store_id },
      order: [['weekday', 'ASC']]
    });

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const availability = await StoreAvailability.findByPk(id);
    
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    const isOwner = await verifyStoreOwnership(availability.store_id, req.user.userId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to modify this availability' });
    }

    await availability.update(req.body);
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error: error.message });
  }
};