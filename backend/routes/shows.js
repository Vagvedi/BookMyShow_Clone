const express = require('express');
const { body, validationResult } = require('express-validator');
const Show = require('../models/Show');
const Screen = require('../models/Screen');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/shows
// @desc    Get shows (filtered by movie, theatre, date, city)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { movieId, theatreId, date, city } = req.query;
    const query = { isActive: true };

    if (movieId) {
      query.movie = movieId;
    }

    if (theatreId) {
      query.theatre = theatreId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const shows = await Show.find(query)
      .populate('movie', 'title poster duration')
      .populate('theatre', 'name address city')
      .populate('screen', 'name totalSeats seats layout')
      .sort({ startTime: 1 });

    // Filter by city if provided
    let filteredShows = shows;
    if (city) {
      filteredShows = shows.filter(show => {
        const theatre = show.theatre;
        return theatre && theatre.city && theatre.city.toLowerCase().includes(city.toLowerCase());
      });
    }

    res.json({
      success: true,
      data: { shows: filteredShows },
    });
  } catch (error) {
    console.error('Get shows error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/v1/shows/:id
// @desc    Get single show with seat availability
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('screen');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    // Calculate available seats
    const screen = show.screen;
    const totalSeats = screen.totalSeats || screen.seats.length;
    const bookedSeats = show.bookedSeats || [];
    const availableSeats = totalSeats - bookedSeats.length;

    res.json({
      success: true,
      data: {
        show,
        seatInfo: {
          total: totalSeats,
          booked: bookedSeats.length,
          available: availableSeats,
          bookedSeatsList: bookedSeats,
        },
      },
    });
  } catch (error) {
    console.error('Get show error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/v1/shows
// @desc    Create new show
// @access  Private/Admin
router.post(
  '/',
  protect,
  authorize('ADMIN'),
  [
    body('movie').notEmpty().withMessage('Movie ID is required'),
    body('theatre').notEmpty().withMessage('Theatre ID is required'),
    body('screen').notEmpty().withMessage('Screen ID is required'),
    body('startTime').isISO8601().withMessage('Start time must be a valid date'),
    body('language').notEmpty().withMessage('Language is required'),
    body('basePrice').isNumeric().withMessage('Base price must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { movie, theatre, screen, startTime, language, format, basePrice } = req.body;

      // Get screen to calculate end time
      const screenData = await Screen.findById(screen);
      if (!screenData) {
        return res.status(404).json({
          success: false,
          message: 'Screen not found',
        });
      }

      // Calculate end time (assuming average movie duration + 20 min buffer)
      const movieModel = require('../models/Movie');
      const movieData = await movieModel.findById(movie);
      const duration = movieData?.duration || 120;
      const endTime = new Date(new Date(startTime).getTime() + (duration + 20) * 60000);

      // Calculate available seats
      const totalSeats = screenData.totalSeats || screenData.seats.length;

      const showData = await Show.create({
        movie,
        theatre,
        screen,
        startTime: new Date(startTime),
        endTime,
        language,
        format: format || '2D',
        basePrice,
        availableSeats: totalSeats,
      });

      const createdShow = await Show.findById(showData._id)
        .populate('movie')
        .populate('theatre')
        .populate('screen');

      res.status(201).json({
        success: true,
        data: { show: createdShow },
      });
    } catch (error) {
      console.error('Create show error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   PUT /api/v1/shows/:id
// @desc    Update show
// @access  Private/Admin
router.put('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('movie')
      .populate('theatre')
      .populate('screen');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    res.json({
      success: true,
      data: { show },
    });
  } catch (error) {
    console.error('Update show error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/v1/shows/:id
// @desc    Delete show
// @access  Private/Admin
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    res.json({
      success: true,
      message: 'Show deleted successfully',
    });
  } catch (error) {
    console.error('Delete show error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
