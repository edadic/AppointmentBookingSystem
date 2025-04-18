const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const User = require('./User');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact_email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
  underscored: true
});

Store.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Store, { foreignKey: 'user_id' });

module.exports = Store;