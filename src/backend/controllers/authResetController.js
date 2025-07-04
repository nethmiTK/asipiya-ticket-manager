import dotenv from 'dotenv';
dotenv.config();
import db from '../config/db.js';
import moment from 'moment';
import bcrypt from 'bcryptjs';

export const resetPassword = (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'Email, token, and new password are required.' });
  }

  // 1. Find and validate the token
  db.query('SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?', [token], (err, tokens) => {
    if (err) {
      console.error('Error finding token:', err);
      return res.status(500).json({ message: 'Server error during token validation.' });
    }

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token. Please request a new password reset link.' });
    }

    const resetToken = tokens[0];
    const currentDateTime = moment();
    const expiryDateTime = moment(resetToken.expires_at);

    if (currentDateTime.isAfter(expiryDateTime)) {
      // Token has expired, delete it
      db.query('DELETE FROM password_reset_tokens WHERE token = ?', [token], (deleteErr) => {
        if (deleteErr) console.error('Error deleting expired token:', deleteErr);
        return res.status(400).json({ message: 'Token has expired. Please request a new password reset link.' });
      });
      return;
    }

    // 2. Verify user matches token
    db.query('SELECT UserID FROM appuser WHERE UserID = ? AND Email = ?', [resetToken.user_id, email], (err, users) => {
      if (err) {
        console.error('Error verifying user:', err);
        return res.status(500).json({ message: 'Server error during user verification.' });
      }

      if (users.length === 0) {
        return res.status(400).json({ message: 'Invalid user for this token.' });
      }

      // 3. Hash new password
      bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Error hashing password:', hashErr);
          return res.status(500).json({ message: 'Error processing new password.' });
        }

        // 4. Update password
        db.query('UPDATE appuser SET Password = ? WHERE UserID = ?', [hashedPassword, resetToken.user_id], (updateErr) => {
          if (updateErr) {
            console.error('Error updating password:', updateErr);
            return res.status(500).json({ message: 'Server error during password update.' });
          }

          // 5. Delete used token
          db.query('DELETE FROM password_reset_tokens WHERE token = ?', [token], (deleteErr) => {
            if (deleteErr) console.error('Error deleting token:', deleteErr);
            res.status(200).json({ message: 'Password has been reset successfully.' });
          });
        });
      });
    });
  });
};