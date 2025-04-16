const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./utils/database');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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

const PORT = process.env.PORT || 5000;

// Sync database and start server
sequelize.sync({ alter: false }).then(() => {
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
