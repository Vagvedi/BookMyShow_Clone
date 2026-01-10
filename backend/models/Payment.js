const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentMethod: {
    type: String,
    enum: ['Card', 'UPI', 'NetBanking', 'Wallet'],
    default: 'Card',
  },
  stripePaymentIntentId: {
    type: String,
  },
  stripeChargeId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Success', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  transactionId: {
    type: String,
    unique: true,
  },
  paidAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Generate transaction ID before saving
paymentSchema.pre('save', async function (next) {
  if (!this.transactionId && this.status === 'Success') {
    this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    this.paidAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
