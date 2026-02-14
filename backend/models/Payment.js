const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR',
    },
    paymentMethod: {
      type: DataTypes.ENUM('Card', 'UPI', 'NetBanking', 'Wallet'),
      defaultValue: 'Card',
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeChargeId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Processing', 'Success', 'Failed', 'Refunded'),
      defaultValue: 'Pending',
    },
    transactionId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: (payment) => {
        if (!payment.transactionId && payment.status === 'Success') {
          payment.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          payment.paidAt = new Date();
        }
      },
    },
  });

  return Payment;
};
