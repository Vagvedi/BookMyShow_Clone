import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import Shows from './pages/Shows';
import SeatSelection from './pages/SeatSelection';
import BookingSummary from './pages/BookingSummary';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import Bookings from './pages/Bookings';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminMovies from './pages/Admin/Movies';
import AdminTheatres from './pages/Admin/Theatres';
import AdminShows from './pages/Admin/Shows';
import AdminBookings from './pages/Admin/Bookings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Initialize Stripe (use test publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Elements stripe={stripePromise}>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/movies/:id" element={<MovieDetail />} />
                  <Route path="/shows" element={<Shows />} />
                  <Route path="/shows/:showId/seats" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
                  <Route path="/booking/summary" element={<ProtectedRoute><BookingSummary /></ProtectedRoute>} />
                  <Route path="/booking/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                  <Route path="/booking/confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
                  <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/movies" element={<ProtectedRoute requireAdmin><AdminMovies /></ProtectedRoute>} />
                  <Route path="/admin/theatres" element={<ProtectedRoute requireAdmin><AdminTheatres /></ProtectedRoute>} />
                  <Route path="/admin/shows" element={<ProtectedRoute requireAdmin><AdminShows /></ProtectedRoute>} />
                  <Route path="/admin/bookings" element={<ProtectedRoute requireAdmin><AdminBookings /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </Elements>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
