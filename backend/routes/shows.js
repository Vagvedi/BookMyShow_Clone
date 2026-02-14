const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Show = require('../models/Show')(sequelize);
const Screen = require('../models/Screen')(sequelize);
const Movie = require('../models/Movie')(sequelize);
const Theatre = require('../models/Theatre')(sequelize);
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/shows
// @desc    Get shows (filtered by movie, theatre, date, city)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { movieId, theatreId, date, city } = req.query;
    const where = { isActive: true };

    if (movieId) {
      where.movieId = movieId;
    }

    if (theatreId) {
      where.theatreId = theatreId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.startTime = { [Op.gte]: startOfDay, [Op.lte]: endOfDay };
    }

    const shows = await Show.findAll({
      where,
      attributes: ['id', 'movieId', 'theatreId', 'screenId', 'startTime', 'language', 'format', 'basePrice', 'availableSeats'],
      order: [['startTime', 'ASC']],
    });

    // Filter by city if provided
    let filteredShows = shows;
    if (city) {
      const theatres = await Theatre.findAll({
        where: { city: { [Op.like]: `%${city}%` } },
        attributes: ['id']
      });
      const theatreIds = theatres.map(t => t.id);
      filteredShows = shows.filter(show => theatreIds.includes(show.theatreId));
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
    const show = await Show.findByPk(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    const screen = await Screen.findByPk(show.screenId);
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
    body('movieId').notEmpty().withMessage('Movie ID is required'),
    body('theatreId').notEmpty().withMessage('Theatre ID is required'),
    body('screenId').notEmpty().withMessage('Screen ID is required'),
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

      const { movieId, theatreId, screenId, startTime, language, format, basePrice } = req.body;

      const screenData = await Screen.findByPk(screenId);
      if (!screenData) {
        return res.status(404).json({
          success: false,
          message: 'Screen not found',
        });
      }

      const movieData = await Movie.findByPk(movieId);
      const duration = movieData?.duration || 120;
      const endTime = new Date(new Date(startTime).getTime() + (duration + 20) * 60000);

      const totalSeats = screenData.totalSeats || screenData.seats.length;

      const show = await Show.create({
        movieId,
        theatreId,
        screenId,
        startTime: new Date(startTime),
        endTime,
        language,
        format: format || '2D',
        basePrice,
        availableSeats: totalSeats,
      });

      res.status(201).json({
        success: true,
        data: { show },
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
    const show = await Show.findByPk(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    await show.update(req.body);

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
    const show = await Show.findByPk(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    await show.update({ isActive: false });

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
