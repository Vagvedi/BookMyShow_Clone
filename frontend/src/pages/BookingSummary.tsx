import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../types';

const BookingSummary: React.FC = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const storedBooking = localStorage.getItem('pendingBooking');
    if (!storedBooking) {
      navigate('/');
      return;
    }
    setBooking(JSON.parse(storedBooking));
  }, [navigate]);

  if (!booking) {
    return null;
  }

  const movie = typeof booking.movie === 'object' ? booking.movie : null;
  const theatre = typeof booking.theatre === 'object' ? booking.theatre : null;
  const show = typeof booking.show === 'object' ? booking.show : null;

  const handleProceedToPayment = () => {
    localStorage.setItem('pendingBookingId', booking._id);
    navigate('/booking/payment', { state: { bookingId: booking._id } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Booking Summary</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Booking Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600">Booking Reference</p>
              <p className="font-semibold">{booking.bookingReference}</p>
            </div>
            <div>
              <p className="text-gray-600">Movie</p>
              <p className="font-semibold">{movie?.title || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Theatre</p>
              <p className="font-semibold">{theatre?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500">{theatre?.address}</p>
            </div>
            <div>
              <p className="text-gray-600">Show Date & Time</p>
              <p className="font-semibold">
                {new Date(booking.showTime).toLocaleString()}
              </p>
            </div>
            {show && (
              <div>
                <p className="text-gray-600">Format & Language</p>
                <p className="font-semibold">
                  {typeof show === 'object' ? `${show.format} - ${show.language}` : 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Seat Details</h2>
          <div className="space-y-2 mb-4">
            {booking.seats.map((seat, idx) => (
              <div key={idx} className="flex justify-between border-b pb-2">
                <span>
                  {seat.row}{seat.number} ({seat.seatType})
                </span>
                <span>₹{seat.price}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span>₹{booking.totalAmount}</span>
            </div>
          </div>
          <button
            onClick={handleProceedToPayment}
            className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
