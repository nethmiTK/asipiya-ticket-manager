import db from '../config/db.js';

// Get ticket counts by system
export const getTicketSystemDistribution = (req, res) => {
  const query = `
    SELECT 
      s.SystemName,
      COUNT(t.TicketID) as TicketCount
    FROM asipiyasystem s
    LEFT JOIN ticket t ON s.AsipiyaSystemID = t.AsipiyaSystemID
    GROUP BY s.SystemName
    ORDER BY TicketCount DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching ticket system distribution:', err);
      res.status(500).json({ error: 'Failed to fetch ticket system distribution' });
      return;
    }
    res.json(results);
  });
};

// Get user details by ID
export const getUserDetails = (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT 
      u.UserID,
      u.FullName,
      u.Email,
      u.Phone as ContactNo,
      u.ProfileImagePath,
      COUNT(t.TicketID) as TotalTickets,
      SUM(CASE WHEN t.Status = 'Closed' THEN 1 ELSE 0 END) as ClosedTickets,
      SUM(CASE WHEN t.Priority = 'High' THEN 1 ELSE 0 END) as HighPriorityTickets
    FROM appuser u
    LEFT JOIN ticket t ON u.UserID = t.UserId
    WHERE u.UserID = ?
    GROUP BY u.UserID
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
};

// Get user's tickets
export const getUserTickets = (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT 
      t.TicketID,
      t.Description,
      t.Status,
      t.Priority,
      t.DateTime,
      t.TicketDuration as Duration,
      s.SystemName,
      tc.CategoryName
    FROM ticket t
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID
    WHERE t.UserId = ?
    ORDER BY t.DateTime DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user tickets:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};
