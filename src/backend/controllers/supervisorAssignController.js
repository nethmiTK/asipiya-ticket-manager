// controllers/supervisorAssignController.js
import db from '../config/db.js';
import { createNotification, createTicketLog } from '../utils/notificationUtils.js';

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

// View a single ticket
export const getTicketDetails = async (req, res) => {
  const ticketId = req.params.id;

  const ticketQuery = `
    SELECT 
      t.TicketID,
      u.FullName AS UserName,
      u.Email AS UserEmail,
      s.SystemName,
      c.CategoryName,
      t.Description,
      t.DateTime,
      t.Status,
      t.Priority,
      t.FirstRespondedTime,
      t.LastRespondedTime,
      t.TicketDuration,
      t.UserNote,
      t.SupervisorID
    FROM ticket t
    JOIN appuser u ON t.UserId = u.UserID
    JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    JOIN ticketcategory c ON t.TicketCategoryID = c.TicketCategoryID
    WHERE t.TicketID = ?
  `;

  try {
    const results = await query(ticketQuery, [ticketId]);
    if (results.length === 0) return res.status(404).json({ error: 'Ticket not found' });

    const ticket = results[0];
    const supervisorIds = ticket.SupervisorID
      ? ticket.SupervisorID.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];

    if (supervisorIds.length === 0) {
      return res.status(200).json({ ...ticket, supervisor_id: [], supervisor_name: null });
    }

    const nameQuery = `SELECT UserID, FullName FROM appuser WHERE UserID IN (${supervisorIds.map(() => '?').join(',')})`;
    const nameResults = await query(nameQuery, supervisorIds);
    const fullNames = nameResults.map(row => row.FullName);

    res.json({
      ...ticket,
      supervisor_id: supervisorIds,
      supervisor_name: fullNames.join(', '),
    });
  } catch (err) {
    console.error("Error in ticket_view:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// View all tickets
export const getAllTickets = async (req, res) => {
  const sql = `
    SELECT 
      t.TicketID,
      s.SystemName,
      c.CompanyName,
      u.FullName AS UserName,
      t.Status,
      t.DateTime
    FROM ticket t
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN appuser u ON t.UserId = u.UserID
    LEFT JOIN client c ON u.Email = c.ContactPersonEmail
    ORDER BY t.TicketID ASC
  `;

  try {
    const results = await query(sql);
    res.json(results);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Assign supervisor to ticket
export const assignSupervisor = async (req, res) => {
  const ticketId = req.params.id;
  const { supervisorId, status, priority, assignerId } = req.body;

  if (!ticketId || !supervisorId || !assignerId) {
    return res.status(400).json({
      error: 'Ticket ID, Supervisor ID, and Assigner ID are required'
    });
  }

  const supervisorIds = supervisorId.split(',').map(id => id.trim());
  const supervisorString = supervisorIds.join(',');

  try {
    const current = await query(
      'SELECT Status, Priority, SupervisorID, UserId as ticketCreatorId FROM ticket WHERE TicketID = ?',
      [ticketId]
    );

    if (current.length === 0) return res.status(404).json({ error: 'Ticket not found' });

    const { Status: oldStatus, Priority: oldPriority, SupervisorID: oldSupervisorId, ticketCreatorId } = current[0];

    await query(
      `UPDATE ticket
       SET SupervisorID = ?, Status = ?, Priority = ?, LastRespondedTime = NOW(), FirstRespondedTime = COALESCE(FirstRespondedTime, NOW())
       WHERE TicketID = ?`,
      [supervisorString, status, priority, ticketId]
    );

    // Fetch all involved names
    const allIds = [
      ...new Set([
        ...supervisorIds,
        ...(oldSupervisorId || '').split(',').map(x => x.trim()),
        assignerId
      ])
    ].filter(Boolean);
    const nameMap = {};
    const nameQuery = `SELECT UserID, FullName FROM appuser WHERE UserID IN (${allIds.map(() => '?').join(',')})`;
    const allNames = await query(nameQuery, allIds);
    allNames.forEach(user => {
      nameMap[user.UserID] = user.FullName;
    });

    const changes = [];
    const logs = [];

    if (oldSupervisorId !== supervisorString) {
      const log = await createTicketLog(
        ticketId,
        'SUPERVISOR_CHANGE',
        `Assigned supervisors: ${supervisorIds.map(id => nameMap[id]).join(', ')}`,
        assignerId,
        oldSupervisorId,
        supervisorString
      );
      logs.push(log);
      changes.push(`supervisors updated`);
    }

    if (oldStatus !== status) {
      const log = await createTicketLog(ticketId, 'STATUS_CHANGE', `Changed status to ${status}`, assignerId, oldStatus, status);
      logs.push(log);
      changes.push(`status changed`);
    }

    if (oldPriority !== priority) {
      const log = await createTicketLog(ticketId, 'PRIORITY_CHANGE', `Changed priority to ${priority}`, assignerId, oldPriority, priority);
      logs.push(log);
      changes.push(`priority changed`);
    }

    // Notify ticket creator
    if (changes.length > 0 && ticketCreatorId) {
      await createNotification(
        ticketCreatorId,
        `Your ticket #${ticketId} updated: ${changes.join(', ')} by ${nameMap[assignerId]}`,
        'TICKET_UPDATED',
        logs[0]?.insertId || null,
        ticketId
      );
    }

    // Notify supervisors
    for (const supId of supervisorIds) {
      if (supId !== assignerId) {
        await createNotification(
          supId,
          `You have been assigned to ticket #${ticketId} by ${nameMap[assignerId]}.`,
          'SUPERVISOR_ASSIGNED',
          logs[0]?.insertId || null,
          ticketId
        );
      }
    }

    res.json({ message: 'Supervisor assigned successfully and changes logged' });
  } catch (err) {
    console.error("Error assigning supervisor:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// Get all supervisors
export const getSupervisors = (req, res) => {
  const query = `
    SELECT UserID, FullName FROM appuser 
    WHERE Role IN ('supervisor')
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching supervisors:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log("Supervisor result:", results);
    res.json(results);
  });
};

