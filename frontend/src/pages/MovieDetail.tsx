import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Show } from '../types';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieService.getMovie(id!),
    enabled: !!id,
  });

  const { data: shows = [], isLoading: showsLoading } = useQuery({
    queryKey: ['shows', id, selectedDate],
    queryFn: () => showService.getShows({ movieId: id, date: selectedDate }),
    enabled: !!id,
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBookShow = (showId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/shows/${showId}/seats`);
  };

  if (movieLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (!movie) {
    return <div className="container mx-auto px-4 py-8 text-center">Movie not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full rounded-lg shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=No+Image';
            }}
          />
        </div>
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          <div className="flex items-center space-x-4 mb-4">
            <span className="flex items-center bg-yellow-400 text-black px-3 py-1 rounded">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {movie.rating.toFixed(1)}
            </span>
            <span>{movie.duration} min</span>
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
          </div>
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {movie.genre.map((g) => (
                <span key={g} className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  {g}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {movie.language.map((l) => (
                <span key={l} className="bg-blue-100 px-3 py-1 rounded-full text-sm">
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">About the Movie</h3>
            <p className="text-gray-700">{movie.description}</p>
          </div>
          {movie.director && (
            <p className="text-gray-600">
              <span className="font-semibold">Director:</span> {movie.director}
            </p>
          )}
          {movie.cast && movie.cast.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Cast</h3>
              <div className="flex flex-wrap gap-4">
                {movie.cast.slice(0, 5).map((actor, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-300 mb-2"></div>
                    <p className="text-sm font-semibold">{actor.name}</p>
                    <p className="text-xs text-gray-500">{actor.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show Times */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Select Show</h2>
        <div className="mb-4">
          <label className="mr-2">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {showsLoading ? (
          <div className="text-center py-8">Loading shows...</div>
        ) : shows.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(
              shows.reduce((acc: { [key: string]: Show[] }, show) => {
                const theatreId = typeof show.theatre === 'object' ? (show.theatre as any)._id : show.theatre;
                if (!acc[theatreId]) acc[theatreId] = [];
                acc[theatreId].push(show);
                return acc;
              }, {})
            ).map(([theatreId, theatreShows]) => {
              const theatre = typeof (theatreShows[0].theatre as any) === 'object' ? theatreShows[0].theatre as any : null;
              return (
                <div key={theatreId} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4">{theatre?.name || 'Theatre'}</h3>
                  <p className="text-gray-600 mb-4">{theatre?.address}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {theatreShows.map((show) => (
                      <button
                        key={show._id}
                        onClick={() => handleBookShow(show._id)}
                        className="border-2 border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition"
                      >
                        <div>{formatTime(show.startTime)}</div>
                        <div className="text-xs">{show.format}</div>
                        <div className="text-xs text-gray-500">₹{show.basePrice}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No shows available for this date</div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
