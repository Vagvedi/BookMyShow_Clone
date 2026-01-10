export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  city: string;
  phone?: string;
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  poster: string;
  trailer?: string;
  genre: string[];
  language: string[];
  duration: number;
  releaseDate: string;
  rating: number;
  cast?: Array<{ name: string; role: string; image?: string }>;
  director?: string;
  isActive: boolean;
}

export interface Theatre {
  _id: string;
  name: string;
  city: string;
  address: string;
  location?: { latitude: number; longitude: number };
  amenities?: string[];
  contact?: { phone?: string; email?: string };
  isActive: boolean;
}

export interface Seat {
  row: string;
  number: number;
  seatType: 'Standard' | 'Premium' | 'Recliner';
  price: number;
}

export interface Screen {
  _id: string;
  theatre: string | Theatre;
  name: string;
  totalSeats: number;
  seats: Seat[];
  layout: {
    rows: number;
    seatsPerRow: number;
  };
  isActive: boolean;
}

export interface Show {
  _id: string;
  movie: string | Movie;
  theatre: string | Theatre;
  screen: string | Screen;
  startTime: string;
  endTime: string;
  language: string;
  format: '2D' | '3D' | 'IMAX' | '4DX';
  basePrice: number;
  availableSeats: number;
  bookedSeats: Array<{ row: string; number: number }>;
  isActive: boolean;
}

export interface Booking {
  _id: string;
  user: string | User;
  show: string | Show;
  movie: string | Movie;
  theatre: string | Theatre;
  screen: string | Screen;
  seats: Seat[];
  totalAmount: number;
  bookingDate: string;
  showDate: string;
  showTime: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired';
  payment?: string | Payment;
  bookingReference: string;
}

export interface Payment {
  _id: string;
  booking: string | Booking;
  user: string | User;
  amount: number;
  currency: string;
  paymentMethod: 'Card' | 'UPI' | 'NetBanking' | 'Wallet';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  status: 'Pending' | 'Processing' | 'Success' | 'Failed' | 'Refunded';
  transactionId?: string;
  paidAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; param: string }>;
}
