const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  getAllUsersInfos
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
      experienceLevel,
      genre ,
      isInBand,
      photo_url = null
    } = req.body;

    // Validate required fields
    if (!email || !password || !name || !surname) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, password, name, surname' 
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    

    // Create user
    const userId = await createUser(
      email,
      hashed,
      name,
      surname,
      phone,
      instrument,
      experienceLevel,
      genre,
      isInBand,
      photo_url
    );

    console.log(`✅ User registered: ${email} (ID: ${userId})  ${name}   ${surname}   ${phone}   ${photo_url} ${instrument} ${instrument} ${experienceLevel} ${genre} ${isInBand}`);

    const token = jwt.sign(
      { id: userId},
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      userId,
      token: token
    });

  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * LOGIN
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

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Return user without password
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      phone: user.phone || null,
      bio: user.bio || null,
      instrument: user.instrument || null,
      experienceLevel: user.experienceLevel || null,
      genre: user.genre || null,
      isInBand: user.isInBand || false,
      photo_url: user.photo_url || null,
    };

    console.log(`✅ User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token: token,
      user: userWithoutPassword
    });

  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * UPDATE FIELD
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

    // Validate email format if updating email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (keyField === 'email' && !emailRegex.test(valueField)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Update user field
    const success = await updateUser(idUser, keyField, valueField);

    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ User field updated: ID ${idUser}, ${keyField} = ${valueField}`);

    res.json({ 
      message: 'Field updated successfully',
      userId: idUser
    });

  } catch (err) {
    console.error('❌ Update error:', err.message);
    res.status(500).json({ error: 'Update failed ' });
  }
});

/**
 * GET ALL USERS INFOS
 */
router.get("/getAllUsersInfos", async (req, res) => {
  try {
    const usersInfos = await getAllUsersInfos();

    if (!usersInfos || usersInfos.length === 0) {
      res.status(404).json({ 
        success: false,
        message: 'No users found'
      });
      return;
    }
        
    res.status(200).json({
        success: true,
        data: usersInfos
    });

    console.log(`✅ Users infos retrieved`);

  } catch (err) {
    console.error('❌ Error fetching users:', err.message);
        
    res.status(500).json({
        success: false,
        message: 'Failed to retrieve users.'
    });
  }
});

/*router.get('/getAllUsersInfos', async (req, res) => {
  try {
    
    // get all users infos
    const users = await getAllUsersInfos();

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' }); // Nota: corretto anche l'inglese "Any user found" in "No users found"
    }

    console.log(`✅ Found users: ${users.length}`);

    res.json({ 
      message: 'Users retrieved successfully',
      users: users
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users', message: err.message });
  }
});*/

/**
 * DELETE A USER
 */
router.delete("/deleteUser", async (req, res) => {
  try {
    const { id } = req.body;
    const success = await deleteUser(id)
        
    res.status(200).json({
      success = success,
      message = "User successfully deleted"
    });

    console.log(`✅ User successfully deleted`);

  } catch (err) {
    console.error('❌ Error deleting user:', err.message);
        
    res.status(500).json({
        success = false,
        message: 'Failed to delete user.'
    });
  }
});


module.exports = router;