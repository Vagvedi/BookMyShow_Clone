const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Screen = require('../models/Screen');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/v1/bookings
// @desc    Create new booking
// @access  Private
router.post(
  '/',
  protect,
  [
    body('showId').notEmpty().withMessage('Show ID is required'),
    body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
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

      const { showId, seats } = req.body;

      // Get show details
      const show = await Show.findById(showId)
        .populate('movie')
        .populate('theatre')
        .populate('screen');

      if (!show) {
        return res.status(404).json({
          success: false,
          message: 'Show not found',
        });
      }

      // Check if show is active
      if (!show.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Show is not available',
        });
      }

      // Check if seats are already booked
      const bookedSeats = show.bookedSeats || [];
      const selectedSeats = seats.map(s => ({ row: s.row, number: s.number }));

      for (const seat of selectedSeats) {
        const isBooked = bookedSeats.some(
          bs => bs.row === seat.row && bs.number === seat.number
        );
        if (isBooked) {
          return res.status(400).json({
            success: false,
            message: `Seat ${seat.row}${seat.number} is already booked`,
          });
        }
      }

      // Get screen to validate seats and calculate price
      const screen = await Screen.findById(show.screen._id);
      if (!screen) {
        return res.status(404).json({
          success: false,
          message: 'Screen not found',
        });
      }

      // Validate and get seat prices
      let totalAmount = 0;
      const validatedSeats = [];

      for (const seat of seats) {
        const screenSeat = screen.seats.find(
          s => s.row === seat.row && s.number === seat.number
        );

        if (!screenSeat) {
          return res.status(400).json({
            success: false,
            message: `Seat ${seat.row}${seat.number} does not exist`,
          });
        }

        const seatPrice = screenSeat.price || show.basePrice;
        totalAmount += seatPrice;

        validatedSeats.push({
          row: seat.row,
          number: seat.number,
          seatType: screenSeat.seatType,
          price: seatPrice,
        });
      }

      // Create booking
      const booking = await Booking.create({
        user: req.user._id,
        show: showId,
        movie: show.movie._id,
        theatre: show.theatre._id,
        screen: show.screen._id,
        seats: validatedSeats,
        totalAmount,
        showDate: show.startTime,
        showTime: show.startTime,
      });

      // Update show with booked seats (temporary lock - will be confirmed after payment)
      show.bookedSeats = [...bookedSeats, ...selectedSeats];
      show.availableSeats = show.availableSeats - selectedSeats.length;
      await show.save();

      const createdBooking = await Booking.findById(booking._id)
        .populate('movie', 'title poster')
        .populate('theatre', 'name address')
        .populate('show', 'startTime endTime language format');

      res.status(201).json({
        success: true,
        data: { booking: createdBooking },
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   GET /api/v1/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title poster')
      .populate('theatre', 'name address city')
      .populate('screen', 'name')
      .populate('show', 'startTime endTime language format')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/v1/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('movie')
      .populate('theatre')
      .populate('screen')
      .populate('show')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/v1/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('show');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    // Check if show time has passed
    if (new Date(booking.showDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking for past shows',
      });
    }

    // Update booking status
    booking.status = 'Cancelled';
    await booking.save();

    // Release seats
    if (booking.show) {
      const show = await Show.findById(booking.show._id);
      if (show) {
        const seatsToRelease = booking.seats.map(s => ({ row: s.row, number: s.number }));
        show.bookedSeats = show.bookedSeats.filter(
          bs => !seatsToRelease.some(s => s.row === bs.row && s.number === bs.number)
        );
        show.availableSeats = show.availableSeats + seatsToRelease.length;
        await show.save();
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking },
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
