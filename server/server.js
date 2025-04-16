const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, testConnection } = require('./utils/database');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');

app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
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
