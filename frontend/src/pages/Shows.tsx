import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { showService } from '../services/showService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const Shows: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const movieId = searchParams.get('movieId');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const { data: shows = [], isLoading } = useQuery({
    queryKey: ['shows', movieId, date],
    queryFn: () => showService.getShows({ movieId: movieId || undefined, date }),
  });

  const handleBookShow = (showId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/shows/${showId}/seats`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Shows</h1>
      {isLoading ? (
        <div className="text-center py-12">Loading shows...</div>
      ) : shows.length > 0 ? (
        <div className="space-y-6">
          {shows.map((show: any) => (
            <div key={show._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    {typeof show.movie === 'object' ? show.movie.title : 'Movie'}
                  </h3>
                  <p className="text-gray-600">
                    {typeof show.theatre === 'object' ? show.theatre.name : 'Theatre'}
                  </p>
                </div>
                <div>
                  <p>{new Date(show.startTime).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{show.format} | {show.language}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">₹{show.basePrice}</p>
                    <p className="text-sm text-gray-500">{show.availableSeats} seats available</p>
                  </div>
                  <button
                    onClick={() => handleBookShow(show._id)}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No shows available</div>
      )}
    </div>
  );
};

export default Shows;
