const express = require('express');
const router = express.Router();

router.get('/test-db', async (req, res) => {
  try {
    await req.app.get('sequelize').authenticate();
    res.json({ message: 'Database connection successful' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

module.exports = router;