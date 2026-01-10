const express = require('express');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

// @route   GET /api/v1/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments({ isActive: true });
    const totalTheatres = await Theatre.countDocuments({ isActive: true });
    const totalShows = await Show.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments({ status: 'Confirmed' });

    // Revenue stats
    const revenueData = await Payment.aggregate([
      {
        $match: { status: 'Success' },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const totalTransactions = revenueData[0]?.totalTransactions || 0;

    // Recent bookings
    const recentBookings = await Booking.find({ status: 'Confirmed' })
      .populate('user', 'name email')
      .populate('movie', 'title')
      .populate('theatre', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Revenue by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueByDate = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalMovies,
          totalTheatres,
          totalShows,
          totalBookings,
          totalRevenue,
          totalTransactions,
        },
        recentBookings,
        revenueByDate,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/v1/admin/bookings
// @desc    Get all bookings (with filters)
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('movie', 'title poster')
      .populate('theatre', 'name city')
      .populate('show', 'startTime')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/v1/admin/movies
// @desc    Get all movies (including inactive)
// @access  Private/Admin
router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { movies },
    });
  } catch (error) {
    console.error('Get admin movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/v1/admin/theatres
// @desc    Get all theatres (including inactive)
// @access  Private/Admin
router.get('/theatres', async (req, res) => {
  try {
    const theatres = await Theatre.find().populate('screens').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { theatres },
    });
  } catch (error) {
    console.error('Get admin theatres error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
