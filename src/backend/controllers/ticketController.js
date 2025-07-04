// controllers/ticketController.js

import db from '../config/db.js';
import { sendNotificationsByRoles } from '../utils/notificationUtils.js';

export const createTicket = async (req, res) => {
  const { userId, systemName, ticketCategory, description } = req.body;

  try {
    // Get system ID
    const getSystemId = "SELECT AsipiyaSystemID FROM asipiyasystem WHERE SystemName = ?";
    const [systemResult] = await db.promise().query(getSystemId, [systemName]);

    if (systemResult.length === 0) {
      return res.status(400).json({ message: "Invalid system name" });
    }

    const systemID = systemResult[0].AsipiyaSystemID;

    // Get category ID
    const getCategoryId = "SELECT TicketCategoryID FROM ticketcategory WHERE CategoryName = ?";
    const [categoryResult] = await db.promise().query(getCategoryId, [ticketCategory]);

    if (categoryResult.length === 0) {
      return res.status(400).json({ message: "Invalid ticket category" });
    }

    const categoryID = categoryResult[0].TicketCategoryID;

    // Insert ticket
    const insertTicket = `
      INSERT INTO ticket (UserId, AsipiyaSystemID, TicketCategoryID, Description, Status, Priority)
      VALUES (?, ?, ?, ?, 'Pending', 'Medium')
    `;
    const [result] = await db.promise().query(insertTicket, [
      userId,
      systemID,
      categoryID,
      description
    ]);

    // Update system status to active
    const updateSql = `
      UPDATE asipiyasystem
      SET Status = 1
      WHERE AsipiyaSystemID = ?
    `;
    await db.promise().query(updateSql, [systemID]);

    // Send notification
    try {
      await sendNotificationsByRoles(
        ['Admin'],
        `New ticket created by User #${userId}: ${description.substring(0, 50)}...`,
        'NEW_TICKET'
      );
    } catch (error) {
      console.error('Error sending ticket creation notifications:', error);
    }

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketId: result.insertId
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Error creating ticket' });
  }
};

export const getUserTickets = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const sql = `
    SELECT 
      t.TicketID AS id,
      t.Description AS description,
      t.Status AS status,
      a.SystemName AS system_name,
      c.CategoryName AS category,
      t.DateTime AS datetime,
      t.SupervisorID AS supervisor_id,
      u.FullName AS supervisor_name
    FROM ticket t
    JOIN asipiyasystem a ON t.AsipiyaSystemID = a.AsipiyaSystemID
    JOIN ticketcategory c ON t.TicketCategoryID = c.TicketCategoryID
    LEFT JOIN appUser u ON t.SupervisorID = u.UserID
    WHERE t.UserID = ?
    ORDER BY t.DateTime DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching tickets:", err);
      return res.status(500).json({ message: "Error fetching tickets" });
    }
    res.status(200).json(results);
  });
};

export const getUserTicketById = (req, res) => {
  const { ticketId } = req.params;

  const sql = `
    SELECT 
      t.TicketID AS id,
      t.Description AS description,
      t.Status AS status,
      a.SystemName AS system_name,
      c.CategoryName AS category,
      t.DateTime AS datetime,
      t.SupervisorID AS supervisor_id,
      t.LastRespondedTime
    FROM ticket t
    JOIN asipiyasystem a ON t.AsipiyaSystemID = a.AsipiyaSystemID
    JOIN ticketcategory c ON t.TicketCategoryID = c.TicketCategoryID
    WHERE t.TicketID = ?
  `;

  db.query(sql, [ticketId], (err, results) => {
    if (err) {
      console.error("Error fetching ticket:", err);
      return res.status(500).json({ message: "Error fetching ticket" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const ticket = results[0];
    const supervisorIds = ticket.supervisor_id
      ? ticket.supervisor_id.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];

    if (supervisorIds.length === 0) {
      return res.status(200).json({ ...ticket, supervisor_name: null });
    }

    const placeholders = supervisorIds.map(() => '?').join(',');
    const nameQuery = `SELECT UserID, FullName FROM appuser WHERE UserID IN (${placeholders})`;

    db.query(nameQuery, supervisorIds, (err, nameResults) => {
      if (err) {
        console.error("Error fetching supervisor names:", err);
        return res.status(500).json({ message: "Error fetching supervisor names" });
      }

      const names = nameResults.map(row => row.FullName);
      res.status(200).json({ ...ticket, supervisor_name: names.join(', ') });
    });
  });
};
