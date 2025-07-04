// controllers/clientController.js
import db from '../config/db.js';
import { sendNotificationsByRoles } from '../utils/notificationUtils.js';

// Reusable promise-based DB query
const query = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// GET: All clients
export const getClients = (req, res) => {
  const sql = "SELECT * FROM client";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching clients", error: err });
    res.json(results);
  });
};

// POST: Register new client
export const addClient = async (req, res) => {
  const { CompanyName, ContactNo, ContactPersonEmail, MobileNo } = req.body;

  try {
    // 1. Check if the email exists in appuser
    const userResults = await query(
      'SELECT UserID FROM appuser WHERE Email = ? LIMIT 1',
      [ContactPersonEmail]
    );

    const matchedUserID = userResults.length > 0 ? userResults[0].UserID : null;

    // 2. Insert into client table
    const insertResult = await query(
      `INSERT INTO client (CompanyName, ContactNo, ContactPersonEmail, MobileNo, UserID) VALUES (?, ?, ?, ?, ?)`,
      [CompanyName, ContactNo, ContactPersonEmail, MobileNo, matchedUserID]
    );

    // 3. Fetch inserted client
    const insertedClientID = insertResult.insertId;
    const clientRows = await query('SELECT * FROM client WHERE ClientID = ?', [insertedClientID]);

    // 4. Send notification to admin/manager
    try {
      await sendNotificationsByRoles(
        ['admin', 'manager'],
        `New client registered: ${CompanyName} (Contact: ${ContactPersonEmail})`,
        'NEW_CLIENT_REGISTRATION'
      );
    } catch (notificationError) {
      console.error('Error sending client registration notifications:', notificationError);
    }

    res.status(200).json({
      message: 'Client registered successfully',
      client: clientRows[0],
    });

  } catch (err) {
    console.error('Client registration error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};
