const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Movie = require('../models/Movie')(sequelize);
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/movies
// @desc    Get all movies (with search, filter, pagination)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      genre,
      language,
      page = 1,
      limit = 10,
      sortBy = 'releaseDate',
      sortOrder = 'desc',
    } = req.query;

    const where = { isActive: true };

    // Search by title or description
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by genre - handle JSON array
    if (genre) {
      const genreArray = Array.isArray(genre) ? genre : [genre];
      // JSON contains check
      where[Op.or] = genreArray.map(g => sequelize.where(sequelize.fn('JSON_CONTAINS', sequelize.col('genre'), sequelize.literal(`"${g}"`)), Op.eq, 1));
    }

    // Filter by language - handle JSON array
    if (language) {
      const langArray = Array.isArray(language) ? language : [language];
      where[Op.or] = langArray.map(l => sequelize.where(sequelize.fn('JSON_CONTAINS', sequelize.col('language'), sequelize.literal(`"${l}"`)), Op.eq, 1));
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sortBy, sortOrder === 'asc' ? 'ASC' : 'DESC']];

    const { count, rows: movies } = await Movie.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
    });

    res.json({
      success: true,
      data: {
        movies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/v1/movies/:id
// @desc    Get single movie by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    res.json({
      success: true,
      data: { movie },
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/v1/movies
// @desc    Create new movie
// @access  Private/Admin
router.post(
  '/',
  protect,
  authorize('ADMIN'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('poster').notEmpty().withMessage('Poster URL is required'),
    body('genre').isArray().withMessage('Genre must be an array'),
    body('language').isArray().withMessage('Language must be an array'),
    body('duration').isNumeric().withMessage('Duration must be a number'),
    body('releaseDate').isISO8601().withMessage('Release date must be a valid date'),
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

      const movie = await Movie.create(req.body);

      res.status(201).json({
        success: true,
        data: { movie },
      });
    } catch (error) {
      console.error('Create movie error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   PUT /api/v1/movies/:id
// @desc    Update movie
// @access  Private/Admin
router.put('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    await movie.update(req.body);

    res.json({
      success: true,
      data: { movie },
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/v1/movies/:id
// @desc    Delete movie (soft delete)
// @access  Private/Admin
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    await movie.update({ isActive: false });

    res.json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
