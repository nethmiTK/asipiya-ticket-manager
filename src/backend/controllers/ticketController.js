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

// Get tickets assigned to a specific supervisor (by UserID in appuser)
export const getTickets = (req, res) => {
  const { supervisorId, role } = req.query;

  // Role is required
  if (!role) {
    return res.status(400).json({ error: "User role is required" });
  }

  // Admin: Return all tickets
  if (role === "Admin") {
    const sql = `SELECT 
                    t.*, 
                    asys.SystemName AS AsipiyaSystemName, 
                    u.FullName AS UserName
                    FROM ticket t
                    LEFT JOIN asipiyasystem asys ON t.AsipiyaSystemID = asys.AsipiyaSystemID
                    LEFT JOIN appuser u ON t.UserId = u.UserID`;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching all tickets:", err);
        return res.status(500).json({ error: "Error fetching tickets" });
      }
      return res.json(results);
    });
  }

  // Supervisor: Return only their tickets
  else if (role === "Supervisor") {
    if (!supervisorId) {
      return res.status(400).json({ error: "Supervisor ID is required for supervisors" });
    }

    const sql = `SELECT 
                        t.*, 
                        asys.SystemName AS AsipiyaSystemName, 
                        u.FullName AS UserName
                        FROM ticket t
                        LEFT JOIN asipiyasystem asys ON t.AsipiyaSystemID = asys.AsipiyaSystemID
                        LEFT JOIN appuser u ON t.UserId = u.UserID
                        WHERE t.SupervisorID = ?`;

    db.query(sql, [supervisorId], (err, results) => {
      if (err) {
        console.error("Error fetching supervisor's tickets:", err);
        return res.status(500).json({ error: "Error fetching tickets" });
      }
      return res.json(results);
    });
  }

  // If the role is invalid
  else {
    return res.status(400).json({ error: "Invalid role specified" });
  }
};

// Get tickets with filtering by supervisor and system
export const getFilteredTickets = (req, res) => {
  const { supervisorId, systemId } = req.query;

  let sql = `
    SELECT 
      t.*, 
      asys.SystemName AS AsipiyaSystemName, 
      u.FullName AS UserName
    FROM ticket t
    LEFT JOIN asipiyasystem asys ON t.AsipiyaSystemID = asys.AsipiyaSystemID
    LEFT JOIN appuser u ON t.UserId = u.UserID
    WHERE 1 = 1
  `;

  const params = [];

  if (supervisorId && supervisorId !== "all") {
    const supId = parseInt(supervisorId, 10);
    if (isNaN(supId)) {
      return res.status(400).json({ error: "Invalid supervisor ID" });
    }
    sql += " AND FIND_IN_SET(?, t.SupervisorID)";
    params.push(supId);
  }

  if (systemId && systemId !== "all") {
    const sysId = parseInt(systemId, 10);
    if (isNaN(sysId)) {
      return res.status(400).json({ error: "Invalid system ID" });
    }
    sql += " AND t.AsipiyaSystemID = ?";
    params.push(sysId);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching tickets:", err);
      return res.status(500).json({ error: "Error fetching tickets" });
    }
    res.json(results);
  });
};

// Update ticket
export const updateTicket = (req, res) => {
  const { id } = req.params;
  const { status, dueDate, resolution } = req.body;

  // Build the SET clause dynamically
  const fields = [];
  const values = [];

  if (status !== undefined) {
    fields.push("Status = ?");
    values.push(status);
  }

  if (dueDate !== undefined) {
    fields.push("DueDate = ?");
    values.push(dueDate);
  }

  if (resolution !== undefined) {
    fields.push("Resolution = ?");
    values.push(resolution);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields provided to update." });
  }

  const sql = `UPDATE ticket SET ${fields.join(', ')} WHERE TicketID = ?`;
  values.push(id); // Add id to the end of values array for WHERE clause

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Failed to update ticket:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: "Ticket updated successfully" });
  });
};

// Get all supervisors
export const getSupervisors = (req, res) => {
  const sql = "SELECT UserID, FullName FROM appuser WHERE Role = 'Supervisor'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching supervisors:", err);
      return res.status(500).json({ error: "Error fetching supervisors" });
    }
    res.json(results);
  });
};

// Get all Asipiya systems
export const getAsipiyaSystems = (req, res) => {
  const sql = "SELECT AsipiyaSystemID, SystemName FROM asipiyasystem";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching systems:", err);
      return res.status(500).json({ error: "Error fetching systems" });
    }
    res.json(results);
  });
};

// Get all tickets (simple query)
export const getAllTicketsSimple = (req, res) => {
  const query = `
    SELECT * 
    FROM ticket 
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching tickets for supervisor:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(results);
  });
};
