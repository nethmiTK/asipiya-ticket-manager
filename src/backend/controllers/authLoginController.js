import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const login = (req, res) => {
  // Keep the EXACT same login logic from before
  const { Email, Password } = req.body;
  const query = 'SELECT UserID, FullName, Email, Phone, Role, ProfileImagePath, Password AS HashedPassword FROM appuser WHERE Email = ?';

  db.query(query, [Email], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Error during login' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    bcrypt.compare(Password, user.HashedPassword, (compareErr, isMatch) => {
      if (compareErr) {
        console.error('Error comparing passwords:', compareErr);
        return res.status(500).json({ message: 'Error during login' });
      }

      if (isMatch) {
        res.status(200).json({
          message: 'Login successful',
          user: {
            UserID: user.UserID,
            FullName: user.FullName,
            Email: user.Email,
            Phone: user.Phone,
            Role: user.Role,
            ProfileImagePath: user.ProfileImagePath || null
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });
  });
};