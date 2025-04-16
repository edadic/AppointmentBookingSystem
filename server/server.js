const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, testConnection } = require('./utils/database');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Set sequelize instance
app.set('sequelize', sequelize);

// Routes
const testRoutes = require('./routes/test');
app.use('/api', testRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

// Test DB connection before starting server
testConnection().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
      app.listen(PORT + 1, () => {
        console.log(`Server is running on port ${PORT + 1}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
});
