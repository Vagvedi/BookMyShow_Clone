const express = require('express');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Booking = require('../models/Booking')(sequelize);
const Payment = require('../models/Payment')(sequelize);
const Movie = require('../models/Movie')(sequelize);
const Theatre = require('../models/Theatre')(sequelize);
const Show = require('../models/Show')(sequelize);
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
    const totalMovies = await Movie.count({ where: { isActive: true } });
    const totalTheatres = await Theatre.count({ where: { isActive: true } });
    const totalShows = await Show.count({ where: { isActive: true } });
    const totalBookings = await Booking.count({ where: { status: 'Confirmed' } });

    // Revenue stats
    const payments = await Payment.findAll({
      where: { status: 'Success' },
      attributes: ['amount'],
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;

    // Recent bookings
    const recentBookings = await Booking.findAll({
      where: { status: 'Confirmed' },
      include: [
        { model: Movie, attributes: ['title'] },
        { model: Theatre, attributes: ['name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    // Revenue by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await Payment.findAll({
      where: {
        status: 'Success',
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: ['createdAt', 'amount'],
    });

    // Group revenue by date
    const revenueByDate = {};
    revenueData.forEach(payment => {
      const date = new Date(payment.createdAt).toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = { revenue: 0, count: 0 };
      }
      revenueByDate[date].revenue += payment.amount;
      revenueByDate[date].count += 1;
    });

    const revenueByDateArray = Object.keys(revenueByDate)
      .sort()
      .map(date => ({
        date,
        revenue: revenueByDate[date].revenue,
        count: revenueByDate[date].count,
      }));

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
        revenueByDate: revenueByDateArray,
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
    const where = {};

    if (status) {
      where.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: bookings, count: total } = await Booking.findAndCountAll({
      where,
      include: [
        { model: Movie, attributes: ['title', 'poster'] },
        { model: Theatre, attributes: ['name', 'city'] },
        { model: Show, attributes: ['startTime'] },
        { model: Payment },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

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

// @route   GET /api/v1/admin/payments
// @desc    Get all payments (with filters)
// @access  Private/Admin
router.get('/payments', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: payments, count: total } = await Payment.findAndCountAll({
      where,
      include: [{ model: Booking }],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get admin payments error:', error);
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
    const movies = await Movie.findAll({
      order: [['createdAt', 'DESC']],
    });

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
    const theatres = await Theatre.findAll({
      include: [{ model: Screen }],
      order: [['createdAt', 'DESC']],
    });

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

// @route   GET /api/v1/admin/revenue
// @desc    Get revenue statistics
// @access  Private/Admin
router.get('/revenue', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenues = await Payment.findAll({
      where: {
        status: 'Success',
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: ['createdAt', 'amount'],
    });

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        transactionCount: revenues.length,
        period: '30 days',
      },
    });
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Import Screen model for include operations
const Screen = require('../models/Screen')(sequelize);

module.exports = router;
