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
