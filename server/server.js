const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./utils/database');
const User = require('./models/User');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const storeRoutes = require('./routes/store');
const availabilityRoutes = require('./routes/availability');
const appointmentRoutes = require('./routes/appointment');

app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/stores', storeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 5001;
sequelize.sync({ alter: false})
.then(() => {
  const startServer = (port) => {
    app.listen(port)
      .on('listening', () => {
        console.log(`Server is running on port ${port}`);
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is busy, trying ${port + 1}`);
          startServer(port + 1);
        } else {
          console.error('Server error:', err);
        }
      });
  };

  startServer(PORT);
}).catch(err => {
  console.error('Error syncing database:', err);
});
