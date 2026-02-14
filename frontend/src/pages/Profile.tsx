import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { updateUser } from '../store/slices/authSlice';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || 'Mumbai',
  });

  const updateMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      dispatch(updateUser(updatedUser));
      alert('Profile updated successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <p className="text-gray-600">Email</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <div className="mb-4">
            <p className="text-gray-600">Role</p>
            <p className="font-semibold">{user?.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Update Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">City</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Pune">Pune</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
