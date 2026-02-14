const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Theatre = require('../models/Theatre')(sequelize);
const Screen = require('../models/Screen')(sequelize);
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/theatres
// @desc    Get all theatres (filtered by city)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    const where = { isActive: true };
    
    if (city) {
      where.city = { [Op.like]: `%${city}%` };
    }

    const theatres = await Theatre.findAll({ 
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { theatres },
    });
  } catch (error) {
    console.error('Get theatres error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/v1/theatres/:id
// @desc    Get single theatre with screens
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const theatre = await Theatre.findByPk(req.params.id);
    
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }

    const screens = await Screen.findAll({ 
      where: { theatreId: req.params.id, isActive: true }
    });

    res.json({
      success: true,
      data: {
        theatre,
        screens,
      },
    });
  } catch (error) {
    console.error('Get theatre error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/v1/theatres
// @desc    Create new theatre
// @access  Private/Admin
router.post(
  '/',
  protect,
  authorize('ADMIN'),
  [
    body('name').notEmpty().withMessage('Theatre name is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('address').notEmpty().withMessage('Address is required'),
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

      const theatre = await Theatre.create(req.body);

      res.status(201).json({
        success: true,
        data: { theatre },
      });
    } catch (error) {
      console.error('Create theatre error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   PUT /api/v1/theatres/:id
// @desc    Update theatre
// @access  Private/Admin
router.put('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const theatre = await Theatre.findByPk(req.params.id);

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }

    await theatre.update(req.body);

    res.json({
      success: true,
      data: { theatre },
    });
  } catch (error) {
    console.error('Update theatre error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/v1/theatres/:id/screens
// @desc    Create screen for theatre
// @access  Private/Admin
router.post(
  '/:id/screens',
  protect,
  authorize('ADMIN'),
  [
    body('name').notEmpty().withMessage('Screen name is required'),
    body('totalSeats').isNumeric().withMessage('Total seats must be a number'),
    body('layout.rows').isNumeric().withMessage('Rows must be a number'),
    body('layout.seatsPerRow').isNumeric().withMessage('Seats per row must be a number'),
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

      const { name, totalSeats, layout, seats } = req.body;

      // Generate seats if not provided
      let generatedSeats = seats;
      if (!generatedSeats && layout) {
        generatedSeats = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
        
        for (let i = 0; i < layout.rows; i++) {
          for (let j = 1; j <= layout.seatsPerRow; j++) {
            const rowLetter = rows[i];
            const seatType = i < 2 ? 'Premium' : i < layout.rows - 2 ? 'Standard' : 'Premium';
            const price = seatType === 'Premium' ? 350 : 250;
            
            generatedSeats.push({
              row: rowLetter,
              number: j,
              seatType,
              price,
            });
          }
        }
      }

      const screen = await Screen.create({
        theatreId: req.params.id,
        name,
        totalSeats,
        seats: generatedSeats || [],
        layout,
      });

      res.status(201).json({
        success: true,
        data: { screen },
      });
    } catch (error) {
      console.error('Create screen error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

module.exports = router;
