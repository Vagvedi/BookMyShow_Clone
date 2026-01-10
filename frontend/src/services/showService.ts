import api from './api';
import { ApiResponse, Show } from '../types';

interface ShowFilters {
  movieId?: string;
  theatreId?: string;
  date?: string;
  city?: string;
}

export const showService = {
  getShows: async (filters: ShowFilters = {}): Promise<Show[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<{ shows: Show[] }>>(`/shows?${params.toString()}`);
    if (response.data.success && response.data.data) {
      return response.data.data.shows;
    }
    throw new Error(response.data.message || 'Failed to fetch shows');
  },

  getShow: async (id: string): Promise<{ show: Show; seatInfo: any }> => {
    const response = await api.get<ApiResponse<{ show: Show; seatInfo: any }>>(`/shows/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch show');
  },

  createShow: async (show: Partial<Show>): Promise<Show> => {
    const response = await api.post<ApiResponse<{ show: Show }>>('/shows', show);
    if (response.data.success && response.data.data) {
      return response.data.data.show;
    }
    throw new Error(response.data.message || 'Failed to create show');
  },

  updateShow: async (id: string, show: Partial<Show>): Promise<Show> => {
    const response = await api.put<ApiResponse<{ show: Show }>>(`/shows/${id}`, show);
    if (response.data.success && response.data.data) {
      return response.data.data.show;
    }
    throw new Error(response.data.message || 'Failed to update show');
  },

  deleteShow: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/shows/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete show');
    }
  },
};
