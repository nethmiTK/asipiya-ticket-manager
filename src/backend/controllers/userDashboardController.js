// controllers/dashboardController.js
import db from '../config/db.js';

export const getUserTicketCounts = async (req, res) => {
  const userId = req.params.userId;
  const queries = {
    total: 'SELECT COUNT(*) AS count FROM ticket WHERE Userid = ?',
    pending: "SELECT COUNT(*) AS count FROM ticket WHERE Userid = ? AND Status = 'Pending'",
    resolved: "SELECT COUNT(*) AS count FROM ticket WHERE Userid = ? AND Status IN ('Resolved', 'Rejected')",
    ongoing: "SELECT COUNT(*) AS count FROM ticket WHERE Userid = ? AND Status IN ('Open', 'In Progress')"
  };

  try {
    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      const [result] = await db.promise().query(query, [userId]);
      results[key] = result[0].count;
    }
    res.json(results);
  } catch (error) {
    console.error(`Error fetching user ticket counts:`, error);
    res.status(500).json({ error: 'Failed to fetch ticket counts' });
  }
};

export const getUserRecentTickets = async (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT
      t.TicketID,
      t.Description,
      t.Status,
      t.Priority,
      t.DateTime,
      s.SystemName,
      tc.CategoryName
    FROM ticket t
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID
    WHERE t.UserId = ?
    ORDER BY t.DateTime DESC
    LIMIT 5
  `;

  try {
    const [results] = await db.promise().query(query, [userId]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching user recent tickets:', error);
    res.status(500).json({ error: 'Failed to fetch recent tickets' });
  }
};