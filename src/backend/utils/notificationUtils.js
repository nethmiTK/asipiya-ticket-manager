// src/backend/utils/notificationUtils.js
import db from '../config/db.js';

export async function createTicketLog(ticketId, type, description, userId, oldValue, newValue, note = null) {
  return new Promise(async (resolve, reject) => {
    let userName = 'System';
    if (userId) {
      try {
        const [userResult] = await db.promise().query('SELECT FullName FROM appuser WHERE UserID = ?', [userId]);
        if (userResult.length > 0) {
          userName = userResult[0].FullName;
        }
      } catch (userErr) {
        console.error("Error fetching user name for ticket log:", userErr);
        // Continue even if user name fetch fails
      }
    }

    const logQuery = `
      INSERT INTO ticketlog (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue, Note)
      VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
    `;

    const finalDescription = `${userName} ${description}`;
    const finalNote = note ? `${note} by ${userName}` : `Updated by ${userName}`;

    db.query(logQuery, [
      ticketId,
      type,
      finalDescription,
      userId,
      oldValue,
      newValue,
      finalNote
    ], (err, result) => {
      if (err) {
        console.error("Error creating ticket log:", err);
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

export async function createNotification(userId, message, type, logId, ticketId) {
  const query = `
    INSERT INTO notifications (UserID, Message, Type, TicketLogID, CreatedAt, IsRead)
    VALUES (?, ?, ?, ?, NOW(), 0)
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [userId, message, type, logId], (err, result) => {
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
