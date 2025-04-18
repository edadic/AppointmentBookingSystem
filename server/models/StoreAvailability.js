const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const Store = require('./Store');

const StoreAvailability = sequelize.define('store_availability', { 
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Store,
      key: 'id',
    },
  },
  weekday: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']]
    }
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'store_availability'  // Added explicit table name
});

StoreAvailability.belongsTo(Store, { foreignKey: 'store_id' });
Store.hasMany(StoreAvailability, { foreignKey: 'store_id' });

module.exports = StoreAvailability;