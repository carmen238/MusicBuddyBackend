const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, updateFieldUser } = require('../models/userModel');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, surname, phone } = req.body;

    // Validate required fields
    if (!email || !password || !name || !surname) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, password, name, surname' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await createUser(email, hashedPassword, name, surname, phone);

    console.log(`New user registered: ${email}`);
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: userId
    });

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, password' 
      });
    }

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    console.log(`User logged in: ${email}`);
    res.status(200).json({ 
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        bio: user.bio || ''
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/updatFieldUser
 * Update field the field of the user
 */
router.post('/updateFieldUser', async (req, res) => {
  try {
    const { idUser, keyField, valueField } = req.body;

    // Validate required fields
    if (!idUser || !keyField || !valueField) {
      return res.status(400).json({ 
        error: 'Missing required fields: idUser, keyField, valueField' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (keyField === 'email' && !emailRegex.test(valueField)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Call the update function
    const success = await updateFieldUser(idUser, keyField, valueField);

    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Field updated: ${keyField} for user ${idUser}`);
    res.status(200).json({ 
      message: 'Field updated successfully',
      userId: idUser
    });

  } catch (err) {
    console.error('Field update error:', err.message);
    res.status(500).json({ error: 'Field update failed' });
  }
});


module.exports = router;