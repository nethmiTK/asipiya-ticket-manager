import db from '../config/db.js';
import { sendNotificationsByRoles } from '../utils/notificationUtils.js';

export const addCategory = async (req, res) => {
  const { CategoryName, Description, Status } = req.body;
  const sql = 'INSERT INTO ticketcategory (CategoryName, Description, Status) VALUES (?, ?, ?)';

  db.query(sql, [CategoryName, Description, Status], async (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to add ticket category' });

    try {
      await sendNotificationsByRoles(['Supervisor', 'Developer', 'Admin'], `New ticket category added: ${CategoryName}`, 'NEW_CATEGORY_ADDED');
    } catch (error) {
      console.error('Notification error:', error);
    }

    res.status(200).json({ message: 'Ticket category added successfully', categoryId: result.insertId });
  });
};

export const getCategories = (req, res) => {
  const sql = `
    SELECT tc.*, CASE WHEN COUNT(t.TicketID) > 0 THEN 1 ELSE 0 END AS IsUsed
    FROM ticketcategory tc
    LEFT JOIN ticket t ON tc.TicketCategoryID = t.TicketCategoryID
    GROUP BY tc.TicketCategoryID, tc.CategoryName, tc.Description, tc.Status
    ORDER BY tc.TicketCategoryID;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching categories' });
    res.status(200).json(results);
  });
};

export const updateCategory = (req, res) => {
  const { id } = req.params;
  const { CategoryName, Description, Status } = req.body;

  const sql = 'UPDATE ticketcategory SET CategoryName = ?, Description = ?, Status = ? WHERE TicketCategoryID = ?';
  db.query(sql, [CategoryName, Description, Status, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error updating category' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category updated successfully' });
  });
};

export const deleteCategory = (req, res) => {
  const { id } = req.params;

  const checkSql = 'SELECT Status FROM ticketcategory WHERE TicketCategoryID = ?';
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error checking status' });
    if (results.length === 0) return res.status(404).json({ message: 'Category not found' });

    if (results[0].Status === 1) return res.status(403).json({ message: 'Cannot delete active category' });

    const deleteSql = 'DELETE FROM ticketcategory WHERE TicketCategoryID = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error deleting category' });
      res.status(200).json({ message: 'Category deleted successfully' });
    });
  });
};
