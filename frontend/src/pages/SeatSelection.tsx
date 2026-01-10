import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { showService } from '../services/showService';
import { bookingService } from '../services/bookingService';
import { Seat } from '../types';

const SeatSelection: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const { data: showData, isLoading } = useQuery({
    queryKey: ['show', showId],
    queryFn: () => showService.getShow(showId!),
    enabled: !!showId,
  });

  const createBookingMutation = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: (booking) => {
      localStorage.setItem('pendingBooking', JSON.stringify(booking));
      navigate('/booking/summary');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create booking');
    },
  });

  useEffect(() => {
    if (!showId) {
      navigate('/');
    }
  }, [showId, navigate]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading seat layout...</div>;
  }

  if (!showData) {
    return <div className="container mx-auto px-4 py-8 text-center">Show not found</div>;
  }

  const { show, seatInfo } = showData;
  const screen = typeof show.screen === 'object' ? show.screen : null;
  const movie = typeof show.movie === 'object' ? show.movie : null;
  const theatre = typeof show.theatre === 'object' ? show.theatre : null;

  if (!screen || !screen.seats || screen.seats.length === 0) {
    return <div className="container mx-auto px-4 py-8 text-center">Seat layout not available</div>;
  }

  // Group seats by row
  const seatsByRow: { [key: string]: any[] } = {};
  screen.seats.forEach((seat: any) => {
    if (!seatsByRow[seat.row]) {
      seatsByRow[seat.row] = [];
    }
    seatsByRow[seat.row].push(seat);
  });

  const isSeatBooked = (row: string, number: number) => {
    return seatInfo.bookedSeatsList?.some(
      (bs: any) => bs.row === row && bs.number === number
    );
  };

  const isSeatSelected = (row: string, number: number) => {
    return selectedSeats.some((s) => s.row === row && s.number === number);
  };

  const toggleSeat = (seat: any) => {
    if (isSeatBooked(seat.row, seat.number)) {
      return;
    }

    if (isSeatSelected(seat.row, seat.number)) {
      setSelectedSeats(selectedSeats.filter((s) => !(s.row === seat.row && s.number === seat.number)));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    createBookingMutation.mutate({
      showId: show._id,
      seats: selectedSeats,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{movie?.title || 'Movie'}</h1>
        <p className="text-gray-600">{theatre?.name} - {theatre?.address}</p>
        <p className="text-gray-600">
          {new Date(show.startTime).toLocaleDateString()} at {new Date(show.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Screen */}
          <div className="text-center mb-8">
            <div className="bg-gray-300 h-2 rounded-full mx-auto max-w-md mb-2"></div>
            <p className="text-gray-600 font-semibold">SCREEN THIS WAY</p>
          </div>

          {/* Seat Layout */}
          <div className="space-y-4">
            {Object.entries(seatsByRow)
              .sort()
              .map(([row, seats]) => (
                <div key={row} className="flex items-center justify-center gap-2">
                  <span className="w-8 font-semibold">{row}</span>
                  <div className="flex gap-1">
                    {seats
                      .sort((a, b) => a.number - b.number)
                      .map((seat) => {
                        const booked = isSeatBooked(seat.row, seat.number);
                        const selected = isSeatSelected(seat.row, seat.number);

                        return (
                          <button
                            key={`${seat.row}-${seat.number}`}
                            onClick={() => toggleSeat(seat)}
                            disabled={booked}
                            className={`
                              w-10 h-10 rounded text-xs font-semibold
                              ${booked
                                ? 'bg-gray-400 cursor-not-allowed'
                                : selected
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                              }
                            `}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 rounded"></div>
              <span className="text-sm">Booked</span>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit sticky top-20">
          <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
          <div className="space-y-2 mb-4">
            {selectedSeats.map((seat, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>
                  {seat.row}{seat.number} ({seat.seatType})
                </span>
                <span>₹{seat.price}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
          <button
            onClick={handleProceed}
            disabled={selectedSeats.length === 0 || createBookingMutation.isPending}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createBookingMutation.isPending ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
