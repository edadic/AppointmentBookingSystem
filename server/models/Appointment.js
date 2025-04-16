const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const Store = require('./Store');
const User = require('./User');

const Appointment = sequelize.define('Appointment', {
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  appointment_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: false,
  underscored: true
});

Appointment.belongsTo(Store, { foreignKey: 'store_id' });
Appointment.belongsTo(User, { foreignKey: 'user_id' });
Store.hasMany(Appointment, { foreignKey: 'store_id' });
User.hasMany(Appointment, { foreignKey: 'user_id' });

module.exports = Appointment;