const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theatre name is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  amenities: [{
    type: String,
    enum: ['Parking', 'Food Court', 'AC', 'Dolby Atmos', 'IMAX', 'Recliner Seats'],
  }],
  contact: {
    phone: String,
    email: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for city-based queries
theatreSchema.index({ city: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
