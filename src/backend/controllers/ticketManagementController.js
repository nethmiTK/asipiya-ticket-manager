// controllers/ticketManagementController.js

import db from '../config/db.js';
import { createTicketLog, createNotification } from '../utils/notificationUtils.js';

// Assign supervisor to ticket
export const assignSupervisor = async (req, res) => {
  const { ticketId } = req.params;
  const { supervisorId, userId } = req.body;

  // Get current ticket and user details
  const getDetailsQuery = `
    SELECT 
      t.SupervisorID as currentSupervisorId,
      t.UserId as ticketUserId,
      au_new.FullName as newSupervisorName,
      au_old.FullName as currentSupervisorName,
      au_assigner.FullName as assignerName
    FROM ticket t
    LEFT JOIN appuser au_new ON au_new.UserID = ?
    LEFT JOIN appuser au_old ON au_old.UserID = t.SupervisorID
    LEFT JOIN appuser au_assigner ON au_assigner.UserID = ?
    WHERE t.TicketID = ?
  `;

  try {
    const [details] = await new Promise((resolve, reject) => {
      db.query(getDetailsQuery, [supervisorId, userId, ticketId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!details) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update supervisor
    const updateQuery = "UPDATE ticket SET SupervisorID = ?, LastRespondedTime = NOW() WHERE TicketID = ?";

    await new Promise((resolve, reject) => {
      db.query(updateQuery, [supervisorId, ticketId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Create ticket log entry
    const logQuery = `
      INSERT INTO ticketlog 
      (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue, Note)
      VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
    `;

    let description;
    if (!details.currentSupervisorId) {
      description = `Supervisor assigned: ${details.newSupervisorName}`;
    } else {
      description = `Supervisor changed from ${details.currentSupervisorName} to ${details.newSupervisorName}`;
    }

    const note = `Updated by ${details.assignerName}`;

    const [logResult] = await new Promise((resolve, reject) => {
      db.query(
        logQuery,
        [
          ticketId,
          'SUPERVISOR_CHANGE',
          description,
          userId,
          details.currentSupervisorId,
          supervisorId,
          note
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    // Create notifications
    try {
      // Notify new supervisor
      await createNotification(
        supervisorId,
        `You have been assigned as supervisor for ticket #${ticketId} by ${details.assignerName}`,
        'SUPERVISOR_ASSIGNED',
        logResult.insertId
      );

      // Notify ticket creator
      await createNotification(
        details.ticketUserId,
        `${details.newSupervisorName} has been assigned as supervisor for your ticket #${ticketId}`,
        'SUPERVISOR_UPDATED',
        logResult.insertId
      );

      // Notify old supervisor if exists
      if (details.currentSupervisorId && details.currentSupervisorId !== supervisorId) {
        await createNotification(
          details.currentSupervisorId,
          `You have been unassigned from ticket #${ticketId} by ${details.assignerName}`,
          'SUPERVISOR_UNASSIGNED',
          logResult.insertId
        );
      }
    } catch (error) {
      console.error("Error creating notifications:", error);
    }

    res.json({
      message: "Supervisor assigned successfully",
      logId: logResult.insertId
    });
  } catch (error) {
    console.error("Error assigning supervisor:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update ticket due date
export const updateDueDate = async (req, res) => {
  const { ticketId } = req.params;
  const { dueDate, userId } = req.body;

  db.query('SELECT DueDate FROM ticket WHERE TicketID = ?', [ticketId], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ message: 'Error' });
    const oldDueDate = results[0].DueDate;

    db.query('UPDATE ticket SET DueDate = ? WHERE TicketID = ?', [dueDate, ticketId], async (err2) => {
      if (err2) return res.status(500).json({ message: 'Error updating due date' });

      let desc;
      if (!oldDueDate) {
        desc = `changed due date to ${dueDate}`;
      } else {
        desc = `changed due date from ${oldDueDate} to ${dueDate}`;
      }
      await createTicketLog(
        ticketId,
        'DUE_DATE_CHANGE',
        desc,
        userId,
        oldDueDate,
        dueDate,
        null
      );
      res.json({ message: 'Due date updated and logged' });
    });
  });
};

// Update ticket resolution
export const updateResolution = async (req, res) => {
  const { ticketId } = req.params;
  const { resolution, userId } = req.body;

  db.query('SELECT Resolution FROM ticket WHERE TicketID = ?', [ticketId], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ message: 'Error' });
    const oldResolution = results[0].Resolution;

    db.query('UPDATE ticket SET Resolution = ? WHERE TicketID = ?', [resolution, ticketId], async (err2) => {
      if (err2) return res.status(500).json({ message: 'Error updating resolution' });

      let desc;
      if (!oldResolution) {
        desc = `changed resolution to "${resolution || ''}"`;
      } else {
        desc = `changed resolution from "${oldResolution || ''}" to "${resolution || ''}"`;
      }
      await createTicketLog(
        ticketId,
        'RESOLUTION_CHANGE',
        desc,
        userId,
        oldResolution,
        resolution,
        null
      );
      res.json({ message: 'Resolution updated and logged' });
    });
  });
};
