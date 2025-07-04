import bcrypt from 'bcryptjs';

// Get user profile data
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user data from appuser table
    const query = `
      SELECT 
        a.UserID,
        a.FullName,
        a.Email,
        a.ContactNo,
        a.Role,
        a.ProfileImagePath,
        a.Branch,
        COUNT(t.TicketID) as TotalTickets,
        SUM(CASE WHEN t.Status = 'Open' THEN 1 ELSE 0 END) as OpenTickets,
        SUM(CASE WHEN t.Status = 'Closed' THEN 1 ELSE 0 END) as ClosedTickets,
        SUM(CASE WHEN t.Priority = 'High' THEN 1 ELSE 0 END) as HighPriorityTickets
      FROM appuser a
      LEFT JOIN ticket t ON a.UserID = t.UserID
      WHERE a.UserID = ?
      GROUP BY a.UserID`;

    const [userData] = await req.db.query(query, [userId]);

    if (!userData || userData.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent tickets
    const recentTicketsQuery = `
      SELECT 
        t.TicketID,
        t.Description,
        t.Status,
        t.Priority,
        t.CreatedAt,
        s.SystemName
      FROM ticket t
      LEFT JOIN asipiyasystem s ON t.SystemID = s.SystemID
      WHERE t.UserID = ?
      ORDER BY t.CreatedAt DESC
      LIMIT 5`;

    const recentTickets = await req.db.query(recentTicketsQuery, [userId]);

    res.json({
      user: userData[0],
      recentTickets
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin profile endpoint 
export const getAdminProfile = (req, res) => {
  const userId = req.params.id;
  // Select all fields that the frontend profile form expects
  const query = 'SELECT UserID, FullName, Email, Phone, Role, ProfileImagePath FROM appuser WHERE UserID = ?';

  req.db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ message: 'Server error' });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(results[0]);
    }
  });
};

// Get admin profile update endpoint 
export const updateAdminProfile = async (req, res) => {
  const userId = req.params.id;
  const { FullName, Email, Phone, CurrentPassword, NewPassword } = req.body;
  const saltRounds = 10;

  try {
    // First get the current user data to verify password
    const getUserQuery = 'SELECT Password FROM appuser WHERE UserID = ?';
    const [user] = await req.db.promise().query(getUserQuery, [userId]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If password change is requested
    if (CurrentPassword && NewPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(CurrentPassword, user[0].Password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(NewPassword, saltRounds);

      // Update all fields including password
      const updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ?, Password = ? WHERE UserID = ?';
      await req.db.promise().query(updateQuery, [FullName, Email, Phone, hashedNewPassword, userId]);
    } else {
      // Update only non-password fields
      const updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ? WHERE UserID = ?';
      await req.db.promise().query(updateQuery, [FullName, Email, Phone, userId]);
    }

    // Get updated user data
    const getUpdatedUserQuery = 'SELECT UserID, FullName, Email, Phone, Role, ProfileImagePath FROM appuser WHERE UserID = ?';
    const [updatedUser] = await req.db.promise().query(getUpdatedUserQuery, [userId]);

    if (updatedUser.length === 0) {
      return res.status(404).json({ message: 'Failed to retrieve updated user data' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};