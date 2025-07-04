// src/backend/utils/notificationUtils.js
import db from '../config/db.js';

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
