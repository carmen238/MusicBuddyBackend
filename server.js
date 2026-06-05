require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database/db');

const authRoutes = require('./routes/authRoutes');
const photoRoutes = require('./routes/photoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', photoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 MusicBuddy Backend running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
});