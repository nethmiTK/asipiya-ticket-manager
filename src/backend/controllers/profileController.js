// controllers/profileController.js

import db from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for profile images
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads', 'profile_images');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const profileImageUpload = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  const userId = req.params.id;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const imagePath = `profile_images/${req.file.filename}`;

  try {
    // Update the user's profile image path in the database
    const updateQuery = "UPDATE appuser SET ProfileImagePath = ? WHERE UserID = ?";
    await db.promise().query(updateQuery, [imagePath, userId]);

    res.status(200).json({
      message: "Profile image uploaded successfully",
      imagePath: imagePath,
    });
  } catch (error) {
    console.error("Error updating profile image path in DB:", error);
    res.status(500).json({ message: "Failed to update profile image." });
  }
};

// Delete profile image
export const deleteProfileImage = async (req, res) => {
  const userId = req.params.id;
  try {
    // Get the current image path to delete the file from the server
    const [results] = await db.promise().query('SELECT ProfileImagePath FROM appuser WHERE UserID = ?', [userId]);
    if (results.length > 0 && results[0].ProfileImagePath) {
      const filePath = path.join(__dirname, '../uploads', results[0].ProfileImagePath);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting old profile image file:', err);
          // Continue even if file deletion fails, as DB update is more critical
        }
      });
    }

    // Update the database to remove the profile image path
    const updateQuery = 'UPDATE appuser SET ProfileImagePath = NULL WHERE UserID = ?';
    await db.promise().query(updateQuery, [userId]);

    res.status(200).json({ message: 'Profile image removed successfully' });
  } catch (error) {
    console.error('Error removing profile image:', error);
    res.status(500).json({ message: 'Failed to remove profile image.' });
  }
};
