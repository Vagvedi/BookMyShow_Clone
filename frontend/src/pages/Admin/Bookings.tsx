import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ApiResponse, Booking } from '../../types';

const AdminBookings: React.FC = () => {
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ bookings: Booking[]; pagination: any }>>('/admin/bookings');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch bookings');
    },
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading bookings...</div>;
  }

  const bookings = bookingsData?.bookings || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No bookings found</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Booking Ref</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Movie</th>
                <th className="px-4 py-3 text-left">Theatre</th>
                <th className="px-4 py-3 text-left">Show Time</th>
                <th className="px-4 py-3 text-left">Seats</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking: Booking) => {
                const movie = typeof booking.movie === 'object' ? booking.movie : null;
                const theatre = typeof booking.theatre === 'object' ? booking.theatre : null;
                const user = typeof booking.user === 'object' ? booking.user : null;

                return (
                  <tr key={booking._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{booking.bookingReference}</td>
                    <td className="px-4 py-3">{user?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{movie?.title || 'N/A'}</td>
                    <td className="px-4 py-3">{theatre?.name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {new Date(booking.showTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {booking.seats.map((s) => `${s.row}${s.number}`).join(', ')}
                    </td>
                    <td className="px-4 py-3">₹{booking.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          booking.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
