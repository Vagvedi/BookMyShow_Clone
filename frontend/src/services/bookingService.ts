import api from './api';
import { ApiResponse, Booking, Seat } from '../types';

interface CreateBookingData {
  showId: string;
  seats: Seat[];
}

export const bookingService = {
  createBooking: async (data: CreateBookingData): Promise<Booking> => {
    const response = await api.post<ApiResponse<{ booking: Booking }>>('/bookings', data);
    if (response.data.success && response.data.data) {
      return response.data.data.booking;
    }
    throw new Error(response.data.message || 'Failed to create booking');
  },

  getBookings: async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<{ bookings: Booking[] }>>('/bookings');
    if (response.data.success && response.data.data) {
      return response.data.data.bookings;
    }
    throw new Error(response.data.message || 'Failed to fetch bookings');
  },

  getBooking: async (id: string): Promise<Booking> => {
    const response = await api.get<ApiResponse<{ booking: Booking }>>(`/bookings/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data.booking;
    }
    throw new Error(response.data.message || 'Failed to fetch booking');
  },

  cancelBooking: async (id: string): Promise<Booking> => {
    const response = await api.put<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/cancel`);
    if (response.data.success && response.data.data) {
      return response.data.data.booking;
    }
    throw new Error(response.data.message || 'Failed to cancel booking');
  },
};
