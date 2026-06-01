const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  createUser,
  findUserByEmail,
  updateFieldUser
} = require('../models/userModel');

const router = express.Router();

/**
 * REGISTER
 */
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      surname,
      phone,
      instrument,
      genres,
      experienceLevel,
      isInBand
    } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const userId = await createUser(
      email,
      hashed,
      name,
      surname,
      phone,
      instrument,
      genres,
      experienceLevel,
      isInBand
    );

    res.status(201).json({
      message: 'User created',
      userId
    });

  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * LOGIN
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * UPDATE FIELD
 */
router.post('/updateFieldUser', async (req, res) => {
  try {
    const { idUser, keyField, valueField } = req.body;

    const ok = await updateFieldUser(idUser, keyField, valueField);

    if (!ok) {
      return res.status(400).json({ error: 'Update failed' });
    }

    res.json({ message: 'Updated' });

  } catch (err) {
    res.status(500).json({ error: 'Update error' });
  }
});

module.exports = router;