const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import models
const User = require('./models/User')(sequelize);
const Movie = require('./models/Movie')(sequelize);
const Theatre = require('./models/Theatre')(sequelize);
const Screen = require('./models/Screen')(sequelize);
const Show = require('./models/Show')(sequelize);
const Booking = require('./models/Booking')(sequelize);
const Payment = require('./models/Payment')(sequelize);

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/movies', require('./routes/movies'));
app.use('/api/v1/theatres', require('./routes/theatres'));
app.use('/api/v1/shows', require('./routes/shows'));
app.use('/api/v1/bookings', require('./routes/bookings'));
app.use('/api/v1/payments', require('./routes/payments'));
app.use('/api/v1/admin', require('./routes/admin'));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'BookMyShow API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection and server startup
sequelize
  .sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    console.log('MySQL Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

module.exports = app;
