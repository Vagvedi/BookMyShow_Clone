const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Screen = sequelize.define('Screen', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    theatreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Screen name is required' },
      },
    },
    totalSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seats: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    layout: {
      type: DataTypes.JSON,
      defaultValue: { rows: 0, seatsPerRow: 0 },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: true,
  });

  return Screen;
};
