import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const bookingId = location.state?.bookingId;

  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your booking has been confirmed successfully. A confirmation email has been sent to your registered email address.
        </p>
        {bookingId && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <p className="text-sm text-gray-600 mb-2">Booking Reference</p>
            <p className="text-xl font-bold">{bookingId}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Link
            to="/bookings"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            View My Bookings
          </Link>
          <Link
            to="/movies"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Browse More Movies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
