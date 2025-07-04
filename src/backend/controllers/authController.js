// controllers/authController.js
import db from '../config/db.js';
import bcrypt from 'bcryptjs';
//import { sendNotificationsByRoles } from '../utils/notificationHelper.js';

export const register = async (req, res) => {
  const { FullName, Email, Password, Role, Phone } = req.body;

  // Hash the password
  bcrypt.hash(Password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error('Error hashing password:', hashErr);
      return res.status(500).send('Error registering user');
    }

    // Insert the user
    const query = 'INSERT INTO appuser (FullName, Email, Password, Role, Phone) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [FullName, Email, hashedPassword, Role, Phone], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).send('Error registering user');
      }

      const newUserID = result.insertId;

      // Link to client if email matches
      const updateClientQuery = `
        UPDATE client 
        SET UserID = ? 
        WHERE ContactPersonEmail = ? AND UserID IS NULL
      `;

      db.query(updateClientQuery, [newUserID, Email], (updateErr) => {
        if (updateErr) {
          console.error('Error updating client:', updateErr);
        }
        
        return res.status(200).send('User registered successfully');
      });
    });
  });
};