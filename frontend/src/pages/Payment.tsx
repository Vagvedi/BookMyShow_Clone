import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMutation } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const PaymentForm: React.FC<{ bookingId: string; clientSecret: string; paymentIntentId: string }> = ({
  bookingId,
  clientSecret,
  paymentIntentId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const confirmPaymentMutation = useMutation({
    mutationFn: paymentService.confirmPayment,
    onSuccess: () => {
      localStorage.removeItem('pendingBooking');
      navigate('/booking/confirmation', { state: { bookingId } });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    try {
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        alert(stripeError.message || 'Payment failed');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        confirmPaymentMutation.mutate({ 
          paymentIntentId: paymentIntent.id || paymentIntentId, 
          bookingId 
        });
      }
    } catch (error: any) {
      alert(error.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Card Details</h3>
        <div className="border border-gray-300 rounded-md p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">
          <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242, any future expiry date, and any CVC.
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || confirmPaymentMutation.isPending}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {confirmPaymentMutation.isPending ? 'Processing Payment...' : `Pay Now`}
      </button>
    </form>
  );
};

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId || localStorage.getItem('pendingBookingId');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      navigate('/');
      return;
    }

    const createIntent = async () => {
      try {
        const { clientSecret: secret, paymentIntentId: intentId } = await paymentService.createPaymentIntent({ bookingId });
        setClientSecret(secret);
        setPaymentIntentId(intentId);
        localStorage.setItem('pendingBookingId', bookingId);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to initialize payment');
        navigate('/booking/summary');
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [bookingId, navigate]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div>Initializing payment...</div>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Payment</h1>
      <div className="max-w-2xl mx-auto">
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm bookingId={bookingId} clientSecret={clientSecret} paymentIntentId={paymentIntentId} />
        </Elements>
      </div>
    </div>
  );
};

export default Payment;
