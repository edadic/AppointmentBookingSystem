const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_store_owner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  // This will automatically add the createdAt and updatedAt fields
  timestamps: true,
  // If you want to keep your snake_case naming
  underscored: true
});

module.exports = User;