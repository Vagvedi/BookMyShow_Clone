const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Show = sequelize.define('Show', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    theatreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    screenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Show start time is required' },
      },
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Show end time is required' },
      },
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    format: {
      type: DataTypes.ENUM('2D', '3D', 'IMAX', '4DX'),
      defaultValue: '2D',
    },
    basePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bookedSeats: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['movieId', 'theatreId', 'startTime'] },
      { fields: ['startTime'] },
    ],
  });

  return Show;
};
