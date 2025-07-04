import db from '../config/db.js';
import { sendNotificationsByRoles } from '../utils/notificationUtils.js';

export const addSystem = async (req, res) => {
  const { systemName, description, status } = req.body;
  const sql = 'INSERT INTO asipiyasystem (SystemName, Description, Status) VALUES (?, ?, ?)';

  db.query(sql, [systemName, description, status], async (err) => {
    if (err) return res.status(500).json({ message: "Database error" });

    try {
      await sendNotificationsByRoles(['Supervisor', 'Developer', 'Admin'], `New system added: ${systemName}`, 'NEW_SYSTEM_ADDED');
    } catch (error) {
      console.error('Notification error:', error);
    }

    res.status(200).json({ message: 'System registered successfully' });
  });
};

export const getSystems = (req, res) => {
  const sql = `
    SELECT s.*, CASE WHEN COUNT(t.TicketID) > 0 THEN 1 ELSE 0 END AS IsUsed
    FROM asipiyasystem s
    LEFT JOIN ticket t ON s.AsipiyaSystemID = t.AsipiyaSystemID
    GROUP BY s.AsipiyaSystemID, s.SystemName, s.Description, s.Status
    ORDER BY s.AsipiyaSystemID;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching systems' });
    res.status(200).json(results);
  });
};

export const updateSystem = (req, res) => {
  const { id } = req.params;
  const { systemName, description, status } = req.body;

  const sql = 'UPDATE asipiyasystem SET SystemName = ?, Description = ?, Status = ? WHERE AsipiyaSystemID = ?';
  db.query(sql, [systemName, description, status, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error updating system' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'System not found' });

    res.status(200).json({ message: 'System updated successfully' });
  });
};

export const deleteSystem = (req, res) => {
  const { id } = req.params;

  const checkSql = 'SELECT Status FROM asipiyasystem WHERE AsipiyaSystemID = ?';
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error checking status' });
    if (results.length === 0) return res.status(404).json({ message: 'System not found' });

    if (results[0].Status === 1) return res.status(403).json({ message: 'Cannot delete active system' });

    const deleteSql = 'DELETE FROM asipiyasystem WHERE AsipiyaSystemID = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error deleting system' });
      res.status(200).json({ message: 'System deleted successfully' });
    });
  });
};
