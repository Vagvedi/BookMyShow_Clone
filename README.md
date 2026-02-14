# BookMyShow Clone - Full Stack Movie Ticket Booking Application

A full-featured movie ticket booking platform built with React, TypeScript, Node.js, Express, and MySQL. This application mimics the core functionality of BookMyShow, including movie listings, theatre management, seat selection, booking, and payment processing.

## 🚀 Features

### Core Features

- **Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Role-based access control (USER, ADMIN)
  - Secure password hashing with bcrypt

- **Movie Management**
  - Browse movies with posters, genres, languages, and ratings
  - Movie detail pages with cast, duration, synopsis, and trailer
  - Search and filter movies by genre, language, and city
  - Admin panel for adding/editing/deleting movies

- **Theatre & Show Management**
  - Theatre listings by city
  - Multiple screens per theatre
  - Dynamic show timings per movie
  - Admin panel for managing theatres, screens, and shows

- **Seat Booking**
  - Interactive seat selection UI with visual seat layout
  - Seat states: available, selected, booked
  - Prevents double booking
  - Dynamic pricing based on seat type

- **Booking & Payments**
  - Booking summary page
  - Stripe payment integration (test mode)
  - Booking confirmation and history
  - Email confirmation (console-based for now)

- **Admin Panel**
  - Dashboard with revenue metrics
  - Manage movies, theatres, screens, and shows
  - View all bookings and transactions
  - Configure seat layouts and pricing

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Redux Toolkit for state management
- React Query for data fetching
- React Router for navigation
- Stripe React for payment processing

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Stripe API for payments
- Express Validator for input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Stripe account (for payment processing - test mode is fine)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BookMyShow
```

### 2. Install Dependencies

Install root dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

Or use the convenience script:
```bash
npm run install-all
```

### 3. Environment Variables

#### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookmyshow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NODE_ENV=development
```

#### Frontend (.env)
Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

### 5. Run the Application

#### Option 1: Run Both Frontend and Backend Together
```bash
npm run dev
```

#### Option 2: Run Separately

Terminal 1 - Backend:
```bash
npm run server
# or
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run client
# or
cd frontend
npm start
```

The backend will run on `http://localhost:5000`
The frontend will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (Protected)
- `PUT /api/v1/auth/update-profile` - Update user profile (Protected)

### Movies
- `GET /api/v1/movies` - Get all movies (with filters)
- `GET /api/v1/movies/:id` - Get movie by ID
- `POST /api/v1/movies` - Create movie (Admin only)
- `PUT /api/v1/movies/:id` - Update movie (Admin only)
- `DELETE /api/v1/movies/:id` - Delete movie (Admin only)

### Theatres
- `GET /api/v1/theatres` - Get all theatres
- `GET /api/v1/theatres/:id` - Get theatre with screens
- `POST /api/v1/theatres` - Create theatre (Admin only)
- `PUT /api/v1/theatres/:id` - Update theatre (Admin only)
- `POST /api/v1/theatres/:id/screens` - Create screen (Admin only)

### Shows
- `GET /api/v1/shows` - Get shows (with filters)
- `GET /api/v1/shows/:id` - Get show with seat availability
- `POST /api/v1/shows` - Create show (Admin only)
- `PUT /api/v1/shows/:id` - Update show (Admin only)
- `DELETE /api/v1/shows/:id` - Delete show (Admin only)

### Bookings
- `POST /api/v1/bookings` - Create booking (Protected)
- `GET /api/v1/bookings` - Get user's bookings (Protected)
- `GET /api/v1/bookings/:id` - Get booking by ID (Protected)
- `PUT /api/v1/bookings/:id/cancel` - Cancel booking (Protected)

### Payments
- `POST /api/v1/payments/create-intent` - Create Stripe payment intent (Protected)
- `POST /api/v1/payments/confirm` - Confirm payment (Protected)
- `GET /api/v1/payments/:id` - Get payment details (Protected)

### Admin
- `GET /api/v1/admin/stats` - Get dashboard statistics (Admin only)
- `GET /api/v1/admin/bookings` - Get all bookings (Admin only)
- `GET /api/v1/admin/movies` - Get all movies (Admin only)
- `GET /api/v1/admin/theatres` - Get all theatres (Admin only)

## 🗄️ Database Models

- **User**: name, email, password, phone, role, city
- **Movie**: title, description, poster, trailer, genre, language, duration, releaseDate, rating, cast, director
- **Theatre**: name, city, address, location, amenities, contact
- **Screen**: theatre, name, totalSeats, seats (layout), layout
- **Show**: movie, theatre, screen, startTime, endTime, language, format, basePrice, availableSeats, bookedSeats
- **Booking**: user, show, movie, theatre, screen, seats, totalAmount, bookingDate, showDate, status, payment, bookingReference
- **Payment**: booking, user, amount, currency, paymentMethod, stripePaymentIntentId, status, transactionId

## 🎨 UI Features

- Responsive design (mobile-first approach)
- Clean and modern UI inspired by BookMyShow
- Interactive seat selection with visual feedback
- Loading states and error handling
- Modal dialogs for actions
- Form validation
- Toast notifications (via alerts for now)

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes with role-based access
- Input validation and sanitization
- CORS configuration
- Secure payment processing with Stripe

## 🧪 Testing Payments

Use Stripe test cards in payment form:
- **Card Number**: 4242 4242 4242 4242
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## 📝 Sample Data

To test the application, you'll need to:

1. **Create an Admin User**: Register a user and manually update the role in MongoDB:
   ```javascript
   db.users.updateOne({email: "admin@example.com"}, {$set: {role: "ADMIN"}})
   ```

2. **Add Movies**: Use the admin panel or API to add movies

3. **Add Theatres**: Use the admin panel or API to add theatres and screens

4. **Create Shows**: Use the admin panel or API to create shows for movies

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity if using MongoDB Atlas

### Stripe Payment Issues
- Verify Stripe keys in .env files
- Check that you're using test keys (sk_test_... and pk_test_...)
- Ensure payment intent is created before confirmation

### CORS Issues
- Check backend CORS configuration
- Verify API URL in frontend .env

### Port Already in Use
- Change PORT in backend .env
- Update REACT_APP_API_URL in frontend .env accordingly

## 🚧 Future Enhancements

- [ ] Email service integration (SendGrid/Nodemailer)
- [ ] Real-time seat locking during booking
- [ ] Promo codes and discounts
- [ ] Movie ratings and reviews
- [ ] Dark mode
- [ ] Docker containerization
- [ ] Unit and integration tests
- [ ] WebSocket for real-time updates
- [ ] Image upload for movie posters
- [ ] Advanced search with filters
- [ ] Booking reminder notifications

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.

---

**Note**: This is a clone project for educational purposes. Make sure to update all environment variables and security keys before deploying to production.
