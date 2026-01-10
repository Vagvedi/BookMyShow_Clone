import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieService } from '../../services/movieService';
import { Movie } from '../../types';

const AdminMovies: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster: '',
    trailer: '',
    genre: [] as string[],
    language: [] as string[],
    duration: '',
    releaseDate: '',
    rating: '',
    director: '',
  });

  const queryClient = useQueryClient();

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: async () => {
      const response = await movieService.getMovies({ limit: 100 });
      return response.movies;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: movieService.deleteMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      alert('Movie deleted successfully');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const movieData = {
        ...formData,
        duration: parseInt(formData.duration),
        rating: parseFloat(formData.rating) || 0,
        genre: formData.genre,
        language: formData.language,
      };

      if (editingMovie) {
        await movieService.updateMovie(editingMovie._id, movieData);
        alert('Movie updated successfully');
      } else {
        await movieService.createMovie(movieData);
        alert('Movie created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save movie');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      poster: '',
      trailer: '',
      genre: [],
      language: [],
      duration: '',
      releaseDate: '',
      rating: '',
      director: '',
    });
    setEditingMovie(null);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      poster: movie.poster,
      trailer: movie.trailer || '',
      genre: movie.genre,
      language: movie.language,
      duration: movie.duration.toString(),
      releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0],
      rating: movie.rating.toString(),
      director: movie.director || '',
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Movies</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Add New Movie
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-64 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Image';
              }}
            />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{movie.title}</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">{movie.genre[0]}</span>
                <span className={`px-2 py-1 rounded text-xs ${movie.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {movie.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(movie)}
                  className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this movie?')) {
                      deleteMutation.mutate(movie._id);
                    }
                  }}
                  className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingMovie ? 'Edit Movie' : 'Add New Movie'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Poster URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.poster}
                    onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Trailer URL</label>
                  <input
                    type="url"
                    value={formData.trailer}
                    onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Release Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1">Genre (comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="Action, Drama, Comedy"
                  value={formData.genre.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      genre: e.target.value.split(',').map((g) => g.trim()),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1">Language (comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="Hindi, English"
                  value={formData.language.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      language: e.target.value.split(',').map((l) => l.trim()),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  {editingMovie ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;
