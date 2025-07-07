// controllers/evidenceController.js
import db from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Upload evidence files
export const uploadEvidence = async (req, res) => {
  const { ticketId, description } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  if (!ticketId) {
    return res.status(400).json({ message: 'Ticket ID is required' });
  }

  try {
    // Ensure the uploads directory exists
    const uploadsDir = path.resolve(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const values = req.files.map(file => [
      ticketId,
      file.filename,
      description
    ]);

    const insertEvidenceQuery = `
      INSERT INTO evidence (ComplaintID, FilePath, Description)
      VALUES ?
    `;

    await db.promise().query(insertEvidenceQuery, [values]);

    res.status(200).json({
      message: 'Evidence files uploaded successfully',
      count: req.files.length
    });
  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(500).json({ message: 'Error uploading evidence' });
  }
};

// Download evidence file
export const downloadEvidence = (req, res) => {
  const filename = req.params.filename;

  // Ensure it resolves to the correct full path (prevents path traversal attacks)
  const filePath = path.resolve(__dirname, "../uploads/", filename);

  // Check if the file exists before attempting download
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", filePath);
      return res.status(404).send("File not found.");
    }

    // Download the file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).send("Error downloading file.");
      }
    });
  });
};
