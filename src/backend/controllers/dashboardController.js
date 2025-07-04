import db from '../config/db.js';

// API endpoint to fetch the last 6 ticket log activities
export const getRecentActivities = (req, res) => {
  const query = `
    SELECT 
      tl.TicketID,
      tl.DateTime,
      tl.Type,
      tl.Description
    FROM ticketlog tl
    ORDER BY tl.DateTime DESC
    LIMIT 6
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching recent ticket log activities:', err);
      return res.status(500).json({ error: 'Failed to fetch recent ticket log activities' });
    }
    res.json(results);
  });
};

// API endpoint to fetch tickets
export const getTickets = (req, res) => {
  const query = `
    SELECT 
      t.TicketID, 
      u.FullName AS UserName, 
      t.Description, 
      t.Status, 
      t.Priority, 
      t.UserNote
    FROM 
      ticket t
    LEFT JOIN 
      appuser u 
    ON 
      t.UserId = u.UserID
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tickets:', err);
      res.status(500).json({ error: 'Failed to fetch tickets' });
      return;
    }
    res.json(results);
  });
};

// API endpoint to fetch ticket counts
export const getTicketCounts = (req, res) => {
  const queries = {
    total: 'SELECT COUNT(*) AS count FROM ticket',
    open: "SELECT COUNT(*) AS count FROM ticket WHERE Status IN ('Open', 'In Progress') AND Status != 'Rejected'",
    today: "SELECT COUNT(*) AS count FROM ticket WHERE DATE(DateTime) = CURDATE()",
    highPriority: "SELECT COUNT(*) AS count FROM ticket WHERE Priority = 'High' AND Status != 'Rejected'",
    resolved: "SELECT COUNT(*) AS count FROM ticket WHERE Status = 'Resolved'",
    pending: "SELECT COUNT(*) AS count FROM ticket WHERE Status = 'Pending'"
  };

  const results = {};
  let completed = 0;

  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, (err, result) => {
      if (err) {
        console.error(`Error fetching ${key} count:`, err);
        return res.status(500).json({ error: `Failed to fetch ${key} ticket count` });
      }

      results[key] = result[0].count;
      completed++;

      if (completed === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
};

// API endpoint to fetch filtered tickets  
export const getFilteredTickets = (req, res) => {
  const { type, company, system } = req.query;

  let baseQuery = `
    SELECT 
      t.TicketID,
      u.FullName AS UserName,
      c.CompanyName AS CompanyName,
      s.SystemName AS SystemName,
      t.Description,
      t.Status,
      t.Priority,
      t.DateTime
    FROM ticket t
    LEFT JOIN appuser u ON t.UserId = u.UserID
    LEFT JOIN client c ON u.Email = c.ContactPersonEmail
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
  `;

  let whereClause = [];
  let orderClause = 'ORDER BY t.DateTime DESC';

  // Type-based filter
  switch (type) {
    case 'pending':
      whereClause.push("t.Status = 'Pending'");
      break;
    case 'open':
      whereClause.push("t.Status IN ('Open', 'In Progress') AND t.Status != 'Rejected'");
      break;
    case 'today':
      whereClause.push("DATE(t.DateTime) = CURDATE()");
      break;
    case 'high-priority':
      whereClause.push("t.Status != 'Rejected'");
      orderClause = "ORDER BY FIELD(t.Priority, 'High', 'Medium', 'Low'), t.DateTime DESC";
      break;
    case 'resolved':
      whereClause.push("t.Status = 'Resolved'");
      break;
  }

  // Company filter
  if (company && company !== 'all') {
    whereClause.push("c.CompanyName = " + db.escape(company));
  }
  // System filter
  if (system && system !== 'all') {
    whereClause.push("s.SystemName = " + db.escape(system));
  }

  const finalWhere = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';
  const query = `${baseQuery} ${finalWhere} ${orderClause}`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching filtered tickets:', err);
      res.status(500).json({ error: 'Failed to fetch tickets' });
      return;
    }
    res.json(results);
  });
};

// API endpoint to fetch ticket status distribution
export const getStatusDistribution = (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN Priority = 'High' THEN 1 ELSE 0 END) AS high,
      SUM(CASE WHEN Priority = 'Medium' THEN 1 ELSE 0 END) AS medium,
      SUM(CASE WHEN Priority = 'Low' THEN 1 ELSE 0 END) AS low
    FROM ticket;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching ticket status distribution:', err);
      res.status(500).json({ error: 'Failed to fetch ticket status distribution' });
      return;
    }

    res.json(results[0]);
  });
};

// API endpoint to fetch ticket counts by system
export const getSystemDistribution = (req, res) => {
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

// Update endpoint for recent users
export const getRecentUsers = (req, res) => {
  const query = `
    SELECT DISTINCT 
      u.UserID,
      u.FullName,
      u.ProfileImagePath,
      EXISTS(
        SELECT 1 
        FROM ticket t 
        WHERE t.UserId = u.UserID 
        AND t.Status = 'Pending'
      ) as hasPendingTicket
    FROM appuser u
    WHERE u.Role = 'User'
    ORDER BY u.UserID DESC
    LIMIT 5
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching recent users:', err);
      return res.status(500).json({ error: 'Failed to fetch recent users' });
    }
    res.json(results);
  });
};

// API endpoint to fetch companies
export const getCompanies = (req, res) => {
  const query = `
    SELECT DISTINCT c.CompanyName
    FROM client c
    JOIN appuser au ON c.UserID = au.UserID
    WHERE c.CompanyName IS NOT NULL
    ORDER BY c.CompanyName
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching companies:', err);
      res.status(500).json({ error: 'Failed to fetch companies' });
      return;
    }
    res.json(results);
  });
};
