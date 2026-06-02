const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { updateUser, findUserById } = require('../models/userModel');
const router = express.Router();

// ===== MULTER CONFIGURATION =====

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/profile-photos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${req.userId}_${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// ===== MIDDLEWARE: Extract User ID =====

const extractUserId = (req, res, next) => {
  try {
    const userId = req.body.userId || req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID not provided' });
    }

    req.userId = userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// ===== UPLOAD ENDPOINT =====

router.post(
  '/profile/photo',
  extractUserId,
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = parseInt(req.userId);

      const user = await findUserById(userId);
      if (!user) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete old photo
      if (user.photo_url) {
        const oldPhotoPath = path.join(__dirname, '..', user.photo_url);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
          console.log(`🗑️ Old photo deleted: ${user.photo_url}`);
        }
      }

      const photoUrl = `/uploads/profile-photos/${req.file.filename}`;

    const success = await updateUser(userId, 'photo_url', photoUrl);
    
      if (!success) {
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: 'Failed to save photo URL' , photoUrl});
      }

      console.log(`✅ Photo uploaded: ${photoUrl}`);

      res.json({
        success: true,
        photoUrl,
        message: 'Photo uploaded successfully'
      });

    } catch (err) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      console.error('❌ Photo upload error:', err.message);

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 5MB limit' });
      }

      if (err.message.includes('Only JPG and PNG')) {
        return res.status(400).json({ error: 'Only JPG and PNG files are allowed' });
      }

      res.status(500).json({ error: 'Photo upload failed' });
    }
  }
);

// ===== SERVE PHOTOS =====

router.get('/profile-photos/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    if (!filepath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.sendFile(filepath);

  } catch (err) {
    console.error('❌ Error serving photo:', err.message);
    res.status(500).json({ error: 'Failed to serve photo' });
  }
});

module.exports = router;