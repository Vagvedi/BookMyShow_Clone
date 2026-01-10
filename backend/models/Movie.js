const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Movie description is required'],
  },
  poster: {
    type: String,
    required: [true, 'Movie poster URL is required'],
  },
  trailer: {
    type: String,
  },
  genre: [{
    type: String,
    enum: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Fantasy', 'Animation', 'Documentary'],
    required: true,
  }],
  language: [{
    type: String,
    enum: ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi'],
    required: true,
  }],
  duration: {
    type: Number, // in minutes
    required: [true, 'Movie duration is required'],
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required'],
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  cast: [{
    name: String,
    role: String,
    image: String,
  }],
  director: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for search
movieSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
