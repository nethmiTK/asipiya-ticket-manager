import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { sendNotificationsByRoles } from '../utils/notificationUtils.js';
import db from '../config/db.js';

// Configure nodemailer transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Invite supervisor endpoint
export const inviteSupervisor = async (req, res) => {
  const { email, role } = req.body;

  // Generate invitation token
  const token = crypto.randomBytes(32).toString('hex');
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Invitation to Join as Supervisor',
    html: `
      <h2>You've been invited to join as a Supervisor</h2>
      <p>Please click the link below to complete your registration:</p>
      <a href="${process.env.FRONTEND_URL}/register?token=${token}&role=${role}">Complete Registration</a>
    `
  };

  try {
    await transporter.sendMail(mailOptions);

    // If inviting a supervisor, notify admins and existing supervisors
    if (role === 'Supervisor') {
      await sendNotificationsByRoles(
        ['Admin', 'Supervisor'],
        `New supervisor invitation sent to ${email}`,
        'NEW_SUPERVISOR_INVITED'
      );
    }

    res.json({ message: 'Invitation email sent successfully.' });
  } catch (mailErr) {
    console.error('Error sending invitation email:', mailErr);
    res.status(500).json({ message: 'Failed to send invitation email.' });
  }
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
    const values = req.files.map(file => [
      ticketId,
      `uploads/${file.filename}`,
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
