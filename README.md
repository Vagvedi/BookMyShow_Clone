# BookMyShow Clone - Movie Ticket Booking Application

A full-featured movie ticket booking platform built with React, TypeScript, Node.js, Express, and MySQL. This application mimics the core functionality of BookMyShow, including movie listings, theatre management, seat selection, booking, and payment processing.

##  Features

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
- **React 18** with TypeScript
- **Vite** as build tool and dev server
- **Tailwind CSS** for styling
- **Redux Toolkit** for state management
- **React Query (@tanstack/react-query)** for data fetching
- **React Router** for navigation
- **Stripe React** for payment processing

### Backend
- **Node.js** with Express
- **MySQL** with Sequelize ORM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Stripe API** for payments
- **Express Validator** for input validation
- **Nodemailer** for email services
- **CORS** for cross-origin requests

### Database
- **MySQL** as primary database
- **Sequelize** as ORM for database operations

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (local installation or MySQL cloud service)
- Stripe account (for payment processing - test mode is fine)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Vagvedi/BookMyShow_Clone.git
cd BookMyShow_Clone
```

### 2. Database Setup

Create a MySQL database named `bookmyshow`:

```sql
CREATE DATABASE bookmyshow;
```

### 3. Environment Variables

#### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bookmyshow

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLIC_KEY=your_stripe_public_key_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

#### Frontend (.env)
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Install Dependencies

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

### 5. Run the Application

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

The backend will run on `http://localhost:5000`
The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
BookMyShow_Clone/
├── backend/                    # Node.js Express API
│   ├── config/                # Database configuration
│   ├── middleware/            # Custom middleware
│   ├── models/               # Sequelize models
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Theatre.js
│   │   ├── Screen.js
│   │   ├── Show.js
│   │   ├── Booking.js
│   │   └── Payment.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── movies.js
│   │   ├── theatres.js
│   │   ├── shows.js
│   │   ├── bookings.js
│   │   ├── payments.js
│   │   └── admin.js
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── server.js             # Express server
├── frontend/                  # React TypeScript App
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Layout/
│   │   │   └── Auth/
│   │   ├── pages/           # Page components
│   │   │   ├── Auth/
│   │   │   ├── Admin/
│   │   │   ├── Home.tsx
│   │   │   ├── Movies.tsx
│   │   │   ├── MovieDetail.tsx
│   │   │   ├── Shows.tsx
│   │   │   ├── SeatSelection.tsx
│   │   │   ├── BookingSummary.tsx
│   │   │   ├── Payment.tsx
│   │   │   ├── BookingConfirmation.tsx
│   │   │   ├── Bookings.tsx
│   │   │   └── Profile.tsx
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main App component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html           # HTML template
│   ├── package.json
│   ├── vite.config.ts       # Vite configuration
│   └── tailwind.config.js   # Tailwind configuration
└── README.md
```

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

- **User**: id, name, email, password, phone, role, city, createdAt, updatedAt
- **Movie**: id, title, description, poster, trailer, genre, language, duration, releaseDate, rating, cast, director, isActive, createdAt, updatedAt
- **Theatre**: id, name, city, address, location, amenities, contact, isActive, createdAt, updatedAt
- **Screen**: id, theatreId, name, totalSeats, seats, layout, isActive, createdAt, updatedAt
- **Show**: id, movieId, theatreId, screenId, startTime, endTime, language, format, basePrice, availableSeats, bookedSeats, isActive, createdAt, updatedAt
- **Booking**: id, userId, showId, movieId, theatreId, screenId, seats, totalAmount, bookingDate, showDate, showTime, status, paymentId, bookingReference, createdAt, updatedAt
- **Payment**: id, bookingId, userId, amount, currency, paymentMethod, stripePaymentIntentId, stripeChargeId, status, transactionId, paidAt, createdAt, updatedAt

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

1. **Create an Admin User**: Register a user and manually update the role in MySQL:
   ```sql
   UPDATE Users SET role = 'ADMIN' WHERE email = 'admin@example.com';
   ```

2. **Add Movies**: Use the admin panel or API to add movies

3. **Add Theatres**: Use the admin panel or API to add theatres and screens

4. **Create Shows**: Use the admin panel or API to create shows for movies

## 🐛 Troubleshooting

### MySQL Connection Issues
- Ensure MySQL is running
- Check database credentials in .env file
- Verify database exists and user has permissions

### Stripe Payment Issues
- Verify Stripe keys in .env files
- Check that you're using test keys (sk_test_... and pk_test_...)
- Ensure payment intent is created before confirmation

### CORS Issues
- Check backend CORS configuration
- Verify API URL in frontend .env

### Port Already in Use
- Change PORT in backend .env
- Update VITE_API_URL in frontend .env accordingly

### Frontend Build Issues
- Ensure all dependencies are installed
- Check TypeScript configuration
- Verify Vite configuration

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
