const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: true,
  },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true,
  },
  startTime: {
    type: Date,
    required: [true, 'Show start time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'Show end time is required'],
  },
  language: {
    type: String,
    required: true,
  },
  format: {
    type: String,
    enum: ['2D', '3D', 'IMAX', '4DX'],
    default: '2D',
  },
  basePrice: {
    type: Number,
    required: true,
  },
  availableSeats: {
    type: Number,
    default: 0,
  },
  bookedSeats: [{
    row: String,
    number: Number,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
showSchema.index({ movie: 1, theatre: 1, startTime: 1 });
showSchema.index({ startTime: 1 });

module.exports = mongoose.model('Show', showSchema);
