import dotenv from 'dotenv';
dotenv.config();
import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure nodemailer transporter 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }

  // 1. Find the user by email
  db.query('SELECT UserID, FullName FROM appuser WHERE Email = ?', [email], (err, users) => {
    if (err) {
      console.error('Error finding user for password reset:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }

    if (users.length === 0) {
      // For security, always send a generic success message even if email not found
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const user = users[0];
    const token = uuidv4(); // Generate a unique token
    const expiresAt = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'); // Token expires in 1 hour

    // 2. Invalidate any existing tokens for this user
    db.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.UserID], (deleteErr) => {
      if (deleteErr) {
        console.error('Error deleting old tokens:', deleteErr);
        return res.status(500).json({ message: 'Server error during token invalidation.' });
      }

      // 3. Store the new token in the database
      const insertTokenQuery = 'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
      db.query(insertTokenQuery, [user.UserID, token, expiresAt], (insertErr) => {
        if (insertErr) {
          console.error('Error storing new token:', insertErr);
          return res.status(500).json({ message: 'Server error during token storage.' });
        }

        // 4. Send the password reset email
        const resetLink = `${process.env.APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        const mailOptions = {
          from: `"Asipiya Soft Solution (PVT) LTD" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Password Reset Request',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f0f8ff; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <img src="https://miro.medium.com/v2/resize:fit:2400/1*-okfOPV73mecuWxCZz6uJA.jpeg" alt="Asipiya Logo" style="width: 50px; height: auto;">
                <h2 style="margin: 0; color: #005baa;">Asipiya Soft Solution (PVT) LTD</h2>
              </div>

              <h3 style="text-align: center; color: #005baa;">Password Reset Request</h3>
              <p>Hello ${user.FullName || 'User'},</p>
              <p>We received a request to reset the password for your account. If you did not make this request, please ignore this email.</p>
              <p>To reset your password, please click the button below:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}"
                   style="background: #005baa; color: #fff; text-decoration: none; padding: 14px 24px; border-radius: 6px; font-size: 16px;">
                  Reset Your Password
                </a>
              </div>

              <p style="font-size: 12px; color: #888;">
                This link will expire in 1 hour. If you do not reset your password within this timeframe, you will need to request a new link.
              </p>
              <p>If you have any questions, feel free to contact our support team.</p>

              <hr style="margin-top: 30px;">
              <p style="font-size: 12px; text-align: center; color: #aaa;">&copy; ${new Date().getFullYear()} Asipiya Soft Solution (PVT) LTD. All rights reserved.</p>
            </div>
          `
        };

        transporter.sendMail(mailOptions, (mailErr) => {
          if (mailErr) {
            console.error('Error sending password reset email:', mailErr);
            return res.status(500).json({ message: 'Failed to send email' });
          }
          res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        });
      });
    });
  });
};

// Helper function to validate email 
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}