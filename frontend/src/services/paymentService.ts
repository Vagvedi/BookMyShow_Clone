import api from './api';
import { ApiResponse, Payment } from '../types';

interface CreatePaymentIntentData {
  bookingId: string;
}

interface ConfirmPaymentData {
  paymentIntentId: string;
  bookingId: string;
}

export const paymentService = {
  createPaymentIntent: async (data: CreatePaymentIntentData): Promise<{ clientSecret: string; paymentIntentId: string }> => {
    const response = await api.post<ApiResponse<{ clientSecret: string; paymentIntentId: string }>>('/payments/create-intent', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create payment intent');
  },

  confirmPayment: async (data: ConfirmPaymentData): Promise<{ booking: any; payment: Payment }> => {
    const response = await api.post<ApiResponse<{ booking: any; payment: Payment }>>('/payments/confirm', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to confirm payment');
  },

  getPayment: async (id: string): Promise<Payment> => {
    const response = await api.get<ApiResponse<{ payment: Payment }>>(`/payments/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data.payment;
    }
    throw new Error(response.data.message || 'Failed to fetch payment');
  },
};
