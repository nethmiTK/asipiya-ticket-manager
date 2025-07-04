// src/backend/utils/notificationUtils.js
import db from '../config/db.js';

export async function createTicketLog(ticketId, type, description, userId, oldValue, newValue) {
  const query = `
    INSERT INTO ticketlog (TicketID, Type, Description, UserID, OldValue, NewValue, DateTime)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [ticketId, type, description, userId, oldValue, newValue], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export async function createNotification(userId, message, type, logId, ticketId) {
  const query = `
    INSERT INTO notification (UserID, Message, Type, LogID, TicketID, DateTime, IsRead)
    VALUES (?, ?, ?, ?, ?, NOW(), 0)
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [userId, message, type, logId, ticketId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}


// This function sends notifications to users based on their role
export const sendNotificationsByRoles = async (roles, message, type) => {
  const placeholders = roles.map(() => '?').join(', ');
  const query = `SELECT UserID FROM appuser WHERE Role IN (${placeholders})`;

  const [rows] = await db.promise().query(query, roles);

  if (rows.length === 0) return;

  const values = rows.map(row => [row.UserID, message, type, new Date()]);
  const insertQuery = `INSERT INTO notifications (UserID, Message, Type, CreatedAt) VALUES ?`;

  await db.promise().query(insertQuery, [values]);
};
