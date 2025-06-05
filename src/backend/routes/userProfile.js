const express = require('express');
const router = express.Router();
const db = require('../db');

// Get user profile data
router.get('/api/user-profile/:userId', async (req, res) => {
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

    const [userData] = await db.query(query, [userId]);

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

    const recentTickets = await db.query(recentTicketsQuery, [userId]);

    res.json({
      user: userData[0],
      recentTickets
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 