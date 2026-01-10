const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  row: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  seatType: {
    type: String,
    enum: ['Standard', 'Premium', 'Recliner'],
    default: 'Standard',
  },
  price: {
    type: Number,
    required: true,
  },
}, { _id: false });

const screenSchema = new mongoose.Schema({
  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Screen name is required'],
  },
  totalSeats: {
    type: Number,
    required: true,
  },
  seats: [seatSchema], // Static seat layout
  layout: {
    rows: Number,
    seatsPerRow: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Screen', screenSchema);
