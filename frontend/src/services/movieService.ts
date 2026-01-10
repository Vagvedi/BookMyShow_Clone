import api from './api';
import { ApiResponse, Movie } from '../types';

interface MovieFilters {
  search?: string;
  genre?: string | string[];
  language?: string | string[];
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface MoviesResponse {
  movies: Movie[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const movieService = {
  getMovies: async (filters: MovieFilters = {}): Promise<MoviesResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await api.get<ApiResponse<MoviesResponse>>(`/movies?${params.toString()}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch movies');
  },

  getMovie: async (id: string): Promise<Movie> => {
    const response = await api.get<ApiResponse<{ movie: Movie }>>(`/movies/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data.movie;
    }
    throw new Error(response.data.message || 'Failed to fetch movie');
  },

  createMovie: async (movie: Partial<Movie>): Promise<Movie> => {
    const response = await api.post<ApiResponse<{ movie: Movie }>>('/movies', movie);
    if (response.data.success && response.data.data) {
      return response.data.data.movie;
    }
    throw new Error(response.data.message || 'Failed to create movie');
  },

  updateMovie: async (id: string, movie: Partial<Movie>): Promise<Movie> => {
    const response = await api.put<ApiResponse<{ movie: Movie }>>(`/movies/${id}`, movie);
    if (response.data.success && response.data.data) {
      return response.data.data.movie;
    }
    throw new Error(response.data.message || 'Failed to update movie');
  },

  deleteMovie: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/movies/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete movie');
    }
  },
};
