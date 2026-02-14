const express = require('express');
const sequelize = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment')(sequelize);
const Booking = require('../models/Booking')(sequelize);
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/v1/payments/create-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    const booking = await Booking.findByPk(bookingId);

    if (!booking || booking.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Create payment record
    let payment = await Payment.findOne({ where: { bookingId } });
    
    if (!payment) {
      payment = await Payment.create({
        bookingId,
        userId: req.user.id,
        amount: booking.totalAmount,
        status: 'Pending',
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // Convert to paise
      currency: 'inr',
      metadata: {
        bookingId: booking.id,
        userId: req.user.id,
        paymentId: payment.id,
      },
    });

    // Update payment with intent ID
    await payment.update({ stripePaymentIntentId: paymentIntent.id });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/v1/payments/confirm
// @desc    Confirm payment and update booking
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    if (!paymentIntentId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and booking ID are required',
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment not succeeded. Status: ${paymentIntent.status}`,
      });
    }

    // Find payment and booking
    const payment = await Payment.findOne({
      where: {
        stripePaymentIntentId: paymentIntentId,
        bookingId,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status === 'Success') {
      return res.status(400).json({
        success: false,
        message: 'Payment already confirmed',
      });
    }

    // Update payment status
    await payment.update({
      status: 'Success',
      stripeChargeId: paymentIntent.charges.data[0]?.id || '',
    });

    // Update booking status
    const booking = await Booking.findByPk(bookingId);
    if (booking && booking.userId === req.user.id) {
      await booking.update({ status: 'Confirmed' });

      // Send confirmation email (mocked - would use nodemailer in production)
      console.log(`Booking confirmed for user ${req.user.email}`);
      console.log(`Booking Reference: ${booking.bookingReference}`);
      console.log(`Amount: ₹${booking.totalAmount}`);
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        booking,
        payment,
      },
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/v1/payments/:id
// @desc    Get payment details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
