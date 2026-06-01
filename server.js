require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');  
const cors = require('cors');
const db = require('./database/db');
const authRoutes = require('./routes/authRoutes');


const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 MusicBuddy Backend running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 Register endpoint: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔗 Login endpoint: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`🔗 Update Field endpoint: POST http://localhost:${PORT}/api/auth/updateFieldUser`);
});