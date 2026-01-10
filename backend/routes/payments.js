const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
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

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
      status: 'Pending',
    })
      .populate('movie')
      .populate('theatre');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already processed',
      });
    }

    // Create payment record
    let payment = await Payment.findOne({ booking: bookingId });
    
    if (!payment) {
      payment = await Payment.create({
        booking: bookingId,
        user: req.user._id,
        amount: booking.totalAmount,
        currency: 'INR',
        status: 'Pending',
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // Convert to paise
      currency: 'inr',
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
        paymentId: payment._id.toString(),
      },
      description: `Booking for ${booking.movie.title} at ${booking.theatre.name}`,
    });

    // Update payment with intent ID
    payment.stripePaymentIntentId = paymentIntent.id;
    await payment.save();

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
      stripePaymentIntentId: paymentIntentId,
      booking: bookingId,
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
    payment.status = 'Success';
    payment.stripeChargeId = paymentIntent.charges.data[0]?.id || '';
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.status = 'Confirmed';
      booking.payment = payment._id;
      await booking.save();

      // Send confirmation email (mocked - would use nodemailer in production)
      console.log(`Booking confirmed for ${req.user.email}`);
      console.log(`Booking Reference: ${booking.bookingReference}`);
      console.log(`Movie: ${booking.movie}`);
      console.log(`Amount: ₹${booking.totalAmount}`);
    }

    const updatedBooking = await Booking.findById(bookingId)
      .populate('movie')
      .populate('theatre')
      .populate('screen')
      .populate('show')
      .populate('payment');

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        booking: updatedBooking,
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
      _id: req.params.id,
      user: req.user._id,
    }).populate('booking');

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
