// controllers/inviteController.js
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import db from '../config/db.js'; 

// Configure Nodemailer transporter - This should be defined once
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Ensure these are set in your .env file
        pass: process.env.EMAIL_PASS
    }
});

// Helper function for email validation
function isValidEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Controller function to handle the invitation logic
const inviteUser = async (req, res) => { // Mark as async because of await transporter.sendMail
    const { email, role } = req.body;

    // --- Validation ----
    const allowedRoles = ['User', 'Supervisor', 'Manager', 'Developer'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role specified: ${role}. Allowed roles are: ${allowedRoles.join(', ')}` });
    }

    if (!email || !role || !isValidEmail(email)) {
        return res.status(400).json({ message: 'Valid email and role are required' });
    }

    // Check if user already exists in the database
    const checkQuery = 'SELECT UserID FROM appuser WHERE Email = ?'; // Only fetch UserID as we just need to check existence
    db.query(checkQuery, [email], async (err, results) => { // Make this callback async
        if (err) {
            console.error('Error checking existing user:', err);
            return res.status(500).json({ message: 'Server error while checking user existence.' });
        }

        // Optional: If user already exists, you might want to return a different message
        if (results.length > 0) {
             return res.status(409).json({ message: 'A user with this email already exists.' });
        }

        // Construct the invitation email content
        const currentYear = new Date().getFullYear(); // Dynamic year for copyright

        const mailOptions = {
            from: `"Asipiya Soft Solution (PVT) LTD" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `You're invited to manage user complaints - Role: ${role}`,
            html: `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #ffe6f0; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <img src="https://miro.medium.com/v2/resize:fit:2400/1*-okfOPV73mecuWxCZz6uJA.jpeg" alt="Asipiya Logo" style="width: 50px; height: auto;">
        <h2 style="margin: 0; color: #005baa;">Asipiya Soft Solution (PVT) LTD</h2>
      </div>

        <h3 style="text-align: center; color: #005baa;">Welcome Aboard!</h3>
      <p>Hello <strong>${role}</strong>,</p>

      <p>You have been invited to join our internal complaint management system to help <strong>supervise, manage, or resolve user complaints</strong> for Asipiya Soft Solution systems.</p>

      <ul>
        <li>🛠 Resolve reported issues from users</li>
        <li>📊 View and track ticket status in real time</li>
        <li>💬 Collaborate with your team to solve problems efficiently</li>
      </ul>

          <p><strong>Step 1:</strong> Set your password to activate your account.</p>

        <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL}/register?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}"
           style="background: #005baa; color: #fff; text-decoration: none; padding: 14px 24px; border-radius: 6px; font-size: 16px;">
          Activate Your Account
        </a>
      </div>

      <p style="font-size: 12px; color: #888;">
        🔒 This invitation is intended only for <strong>${email}</strong>. This link is unique and cannot be shared. It will expire in 24 hours.
      </p>

      <p>❓ Need help? Contact our support team at <a href="mailto:support@asipiya.lk">support@asipiya.lk</a></p>

        <hr style="margin-top: 30px;">
      <p style="font-size: 12px; text-align: center; color: #aaa;">&copy; ${currentYear} Asipiya Soft Solution (PVT) LTD. All rights reserved.</p>
    </div>
`
        };

        // --- Send the email ---
        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Invitation email sent successfully.' });
        } catch (mailErr) {
            console.error('Error sending invitation email:', mailErr);
            res.status(500).json({ message: 'Failed to send email. Please check server logs.' });
        }
    });
};

// Export the controller function
export default {
    inviteUser
};