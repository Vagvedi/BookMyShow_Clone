const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    showId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    seats: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bookingDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    showDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    showTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled', 'Expired'),
      defaultValue: 'Pending',
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bookingReference: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: (booking) => {
        if (!booking.bookingReference) {
          booking.bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
      },
    },
  });

  return Booking;
};
