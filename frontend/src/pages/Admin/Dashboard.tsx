import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ApiResponse } from '../../types';

interface AdminStats {
  stats: {
    totalMovies: number;
    totalTheatres: number;
    totalShows: number;
    totalBookings: number;
    totalRevenue: number;
    totalTransactions: number;
  };
  recentBookings: any[];
  revenueByDate: Array<{ _id: string; revenue: number; count: number }>;
}

const AdminDashboard: React.FC = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch stats');
    },
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading dashboard...</div>;
  }

  const stats = statsData?.stats || {
    totalMovies: 0,
    totalTheatres: 0,
    totalShows: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalTransactions: 0,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link
          to="/admin/movies"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.totalMovies}</div>
          <div className="text-gray-600">Movies</div>
        </Link>
        <Link
          to="/admin/theatres"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.totalTheatres}</div>
          <div className="text-gray-600">Theatres</div>
        </Link>
        <Link
          to="/admin/shows"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.totalShows}</div>
          <div className="text-gray-600">Shows</div>
        </Link>
        <Link
          to="/admin/bookings"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.totalBookings}</div>
          <div className="text-gray-600">Bookings</div>
        </Link>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Revenue Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-bold text-lg">₹{stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold">{stats.totalTransactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Transaction</span>
              <span className="font-semibold">
                ₹{stats.totalTransactions > 0 ? (stats.totalRevenue / stats.totalTransactions).toFixed(2) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/movies"
              className="block w-full bg-red-600 text-white py-2 px-4 rounded text-center hover:bg-red-700 transition"
            >
              Add New Movie
            </Link>
            <Link
              to="/admin/theatres"
              className="block w-full bg-red-600 text-white py-2 px-4 rounded text-center hover:bg-red-700 transition"
            >
              Add New Theatre
            </Link>
            <Link
              to="/admin/shows"
              className="block w-full bg-red-600 text-white py-2 px-4 rounded text-center hover:bg-red-700 transition"
            >
              Create Show
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      {statsData?.recentBookings && statsData.recentBookings.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Movie</th>
                  <th className="text-left py-2">Theatre</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {statsData.recentBookings.map((booking: any) => (
                  <tr key={booking._id} className="border-b">
                    <td className="py-2">
                      {typeof booking.user === 'object' ? booking.user.name : 'N/A'}
                    </td>
                    <td className="py-2">
                      {typeof booking.movie === 'object' ? booking.movie.title : 'N/A'}
                    </td>
                    <td className="py-2">
                      {typeof booking.theatre === 'object' ? booking.theatre.name : 'N/A'}
                    </td>
                    <td className="py-2">₹{booking.totalAmount}</td>
                    <td className="py-2">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
