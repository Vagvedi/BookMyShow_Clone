import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';

const Bookings: React.FC = () => {
  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingService.getBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: bookingService.cancelBooking,
    onSuccess: () => {
      refetch();
      alert('Booking cancelled successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    },
  });

  const handleCancel = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate(bookingId);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading bookings...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">You don't have any bookings yet.</p>
          <a href="/movies" className="text-red-600 hover:underline">
            Browse Movies
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: Booking) => {
            const movie = typeof booking.movie === 'object' ? booking.movie : null;
            const theatre = typeof booking.theatre === 'object' ? booking.theatre : null;
            const show = typeof booking.show === 'object' ? booking.show : null;
            const canCancel = booking.status === 'Confirmed' && new Date(booking.showDate) > new Date();

            return (
              <div key={booking._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{movie?.title || 'Movie'}</h3>
                    <p className="text-gray-600">{theatre?.name}</p>
                    <p className="text-sm text-gray-500">{theatre?.address}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === 'Confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking Reference</p>
                    <p className="font-semibold">{booking.bookingReference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Show Date & Time</p>
                    <p className="font-semibold">
                      {new Date(booking.showTime).toLocaleString()}
                    </p>
                  </div>
                  {show && (
                    <div>
                      <p className="text-sm text-gray-600">Format</p>
                      <p className="font-semibold">
                        {typeof show === 'object' ? `${show.format} - ${show.language}` : 'N/A'}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold">₹{booking.totalAmount}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.seats.map((seat, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {seat.row}{seat.number} ({seat.seatType})
                      </span>
                    ))}
                  </div>
                </div>
                {canCancel && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    disabled={cancelMutation.isPending}
                    className="text-red-600 hover:text-red-800 font-semibold disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;
