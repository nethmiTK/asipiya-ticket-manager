// controllers/evidenceController.js
import db from '../config/db.js';

// Fetch all evidence data for a ticket
export const getAllEvidenceByTicketId = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM evidence WHERE ComplaintID = ?',
      [ticketId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching evidence:', err);
    res.status(500).json({ message: 'Failed to fetch evidence' });
  }
};

// Fetch only FilePaths for a ticket's evidence
export const getEvidencePathsByTicketId = (req, res) => {
  const { ticketId } = req.params;

  const sql = "SELECT FilePath FROM evidence WHERE ComplaintID = ?";
  db.query(sql, [ticketId], (err, result) => {
    if (err) {
      console.error("Error fetching evidence paths:", err);
      return res.status(500).json({ error: "Failed to fetch evidence paths" });
    }
    res.json(result);
  });
};
