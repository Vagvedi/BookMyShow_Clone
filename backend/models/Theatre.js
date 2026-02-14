const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Theatre = sequelize.define('Theatre', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Theatre name is required' },
      },
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'City is required' },
      },
      index: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' },
      },
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: { latitude: null, longitude: null },
    },
    amenities: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    contact: {
      type: DataTypes.JSON,
      defaultValue: { phone: null, email: null },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['city'] },
    ],
  });

  return Theatre;
};
