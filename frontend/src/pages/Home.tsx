import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import { Movie } from '../types';

const Home: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('Mumbai');

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ['movies', 'home'],
    queryFn: () => movieService.getMovies({ limit: 8, sortBy: 'releaseDate', sortOrder: 'desc' }),
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center text-white">
        <div className="text-center z-10">
          <h1 className="text-5xl font-bold mb-4">Welcome to BookMyShow</h1>
          <p className="text-xl mb-8">Book your favorite movies in seconds</p>
          <Link
            to="/movies"
            className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Browse Movies
          </Link>
        </div>
      </div>

      {/* City Selection */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <span className="font-semibold">Select City:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
      </div>

      {/* Featured Movies */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Now Showing</h2>
        {isLoading ? (
          <div className="text-center py-12">Loading movies...</div>
        ) : moviesData?.movies.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {moviesData.movies.map((movie: Movie) => (
              <Link
                key={movie._id}
                to={`/movies/${movie._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-80 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Image';
                  }}
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 truncate">{movie.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{movie.genre[0]}</span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {movie.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No movies available</div>
        )}
      </div>
    </div>
  );
};

export default Home;
