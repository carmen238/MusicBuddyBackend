const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  getAllUsersInfos,
  getGenresStats,
  getInstrumentsStats,
  getTotNumUsers
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
      bio,
      instrument,
      experienceLevel,
      genre ,
      isInBand,
      photo_url
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

    var photo_url2;

    if(photo_url === undefined) photo_url2 = "";   //fix un po' ignorante, ma ha funzionato

    // Create user
    const userId = await createUser(
      email,
      hashed,
      name,
      surname,
      phone,
      bio,
      instrument,
      experienceLevel,
      genre,
      isInBand,
      photo_url2
    );

    console.log(`✅ User registered: ${email} (ID: ${userId})  ${name}   ${surname}   ${phone}   ${photo_url2} ${instrument} ${experienceLevel} ${genre} ${isInBand}`);

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
    console.log(`Bio: ${user.bio}`);
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
router.patch('/updateFieldUser', async (req, res) => {
  try {
    const { idUser, keyField, valueField } = req.body;

    // Validate required fields
    if (idUser === undefined || keyField === undefined || valueField === undefined) {
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
 * GET ALL USERS INFOS (NON SERVE)
 */
router.get("/getAllUsersInfos", async (req, res) => {
  try {
    const usersInfos = await getAllUsersInfos();
    //VA IN ERRORE LATO CLIENT PER COLPA DI isInBand CHE è NUMERO INVECE DI BOOLEANO

    if (!usersInfos || usersInfos.length == 0) {
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

/**
 * DELETE A USER
 */
router.post("/deleteUser", async (req, res) => {
  try {
    const id = req.body.userId;
    const success = await deleteUser(id);
        
    res.status(200).json({
      success: success,
      message: "User successfully deleted"
    });

    console.log(`✅ User successfully deleted`);

  } catch (err) {
    console.error('❌ Error deleting user:', err.message);
        
    res.status(500).json({
        success: false,
        message: 'Failed to delete user.'
    });
  }
});

/**
 * GET GENRES STATISTICS
 */
router.get("/getGenresStats", async (req, res) => {
  try {
    const genresStats = await getGenresStats();

    if (!genresStats || genresStats.length == 0) {
      res.status(404).json({ 
        success: false,
        data: null,
        message: 'No genres found'
      });
      return;
    }
        
    res.status(200).json({
        success: true,
        data: genresStats,
        message: 'Genres stats retrieved successfully'
    });

    console.log(`✅ Genres stats retrieved`);

  } catch (err) {
    console.error('❌ Error fetching genres stats:', err.message);
        
    res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve genres stats.'
    });
  }
});

/**
 * GET INSTRUMENTS STATISTICS
 */
router.get("/getInstrumentsStats", async (req, res) => {
  try {
    const instrumentsStats = await getInstrumentsStats();

    if (!instrumentsStats || instrumentsStats.length === 0) {
      res.status(404).json({ 
        success: false,
        data: null,
        message: 'No instruments found'
      });
      return;
    }
        
    res.status(200).json({
        success: true,
        data: instrumentsStats,
        message: 'Instruments stats retrieved successfully'
    });

    console.log(`✅ Instruments stats retrieved`);

  } catch (err) {
    console.error('❌ Error fetching instruments stats:', err.message);
        
    res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve instruments stats.'
    });
  }
});

/**
 * GET TOTAL NUMBER OF USERS
 */
router.get("/getTotNumUsers", async (req, res) => {
  try {
    const result = await getTotNumUsers();
    const totalUsers = result[0].tot_users;

    if (!totalUsers || totalUsers == 0) {
      res.status(404).json({ 
        success: false,
        totNumUsers: 0,
        message: 'No users found'
      });
      return;
    }
        
    res.status(200).json({
        success: true,
        totNumUsers: totalUsers,
        message: 'Users number retrieved successfully'
    });

    console.log(`✅ Instruments stats retrieved`);

  } catch (err) {
    console.error('❌ Error fetching users number:', err.message);
        
    res.status(500).json({
        success: false,
        totNumUsers: -1,
        message: 'Failed to retrieve users number.'
    });
  }
});

module.exports = router;