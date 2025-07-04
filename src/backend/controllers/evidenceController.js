import db from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Simulate __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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

export const downloadEvidenceFile = (req, res) => {
  const filename = req.params.filename;

  // Secure absolute path (prevent path traversal)
  const filePath = path.resolve(__dirname, '../../uploads', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", filePath);
      return res.status(404).send("File not found.");
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).send("Error downloading file.");
      }
    });
  });
};
