import api from './api';
import { ApiResponse, Theatre, Screen } from '../types';

export const theatreService = {
  getTheatres: async (city?: string): Promise<Theatre[]> => {
    const params = city ? `?city=${city}` : '';
    const response = await api.get<ApiResponse<{ theatres: Theatre[] }>>(`/theatres${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data.theatres;
    }
    throw new Error(response.data.message || 'Failed to fetch theatres');
  },

  getTheatre: async (id: string): Promise<{ theatre: Theatre; screens: Screen[] }> => {
    const response = await api.get<ApiResponse<{ theatre: Theatre; screens: Screen[] }>>(`/theatres/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch theatre');
  },

  createTheatre: async (theatre: Partial<Theatre>): Promise<Theatre> => {
    const response = await api.post<ApiResponse<{ theatre: Theatre }>>('/theatres', theatre);
    if (response.data.success && response.data.data) {
      return response.data.data.theatre;
    }
    throw new Error(response.data.message || 'Failed to create theatre');
  },

  updateTheatre: async (id: string, theatre: Partial<Theatre>): Promise<Theatre> => {
    const response = await api.put<ApiResponse<{ theatre: Theatre }>>(`/theatres/${id}`, theatre);
    if (response.data.success && response.data.data) {
      return response.data.data.theatre;
    }
    throw new Error(response.data.message || 'Failed to update theatre');
  },

  createScreen: async (theatreId: string, screen: Partial<Screen>): Promise<Screen> => {
    const response = await api.post<ApiResponse<{ screen: Screen }>>(`/theatres/${theatreId}/screens`, screen);
    if (response.data.success && response.data.data) {
      return response.data.data.screen;
    }
    throw new Error(response.data.message || 'Failed to create screen');
  },
};
