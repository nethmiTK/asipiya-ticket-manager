import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2';
import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import crypto from 'crypto';
import util from 'util'; 
import ticketLogRoutes from './routes/ticketLog.js';
import userProfileRoutes from './routes/userProfile.js';
import axios from 'axios';

// --- Database Connection ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ticketmanager'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Add middleware to pass db connection to routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Configure routes
app.use('/api/ticket-logs', ticketLogRoutes);
app.use('/', userProfileRoutes);

//evidence uploads
app.use("/uploads", express.static("uploads"));
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const query = util.promisify(db.query).bind(db);

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));

// --- Multer Configuration for Profile Images ---
const profileImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', 'profile_images');
        // Create the directory if it doesn't exist
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.params.id;
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${userId}-${Date.now()}.${fileExtension}`);
    }
});

const upload = multer({ storage: profileImageStorage });

//  Define salt rounds for bcrypt hashing.
const saltRounds = 10;

// -------Register endpoint------- //

app.post("/register", async (req, res) => {
  const { FullName, Email, Password, Role, Phone } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Insert the user into appuser
    const query = 'INSERT INTO appuser (FullName, Email, Password, Role, Phone) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [FullName, Email, hashedPassword, Role, Phone], async (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).send('Error registering user');
      }

      const newUserID = result.insertId;

      // Optional: Link the user to an existing client with matching email
      const updateClientQuery = `
        UPDATE client 
        SET UserID = ? 
        WHERE ContactPersonEmail = ? AND UserID IS NULL
      `;

      db.query(updateClientQuery, [newUserID, Email], async (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating client with UserID:', updateErr);
          // Not fatal — continue registration
        } else {
          console.log(`Client records updated with UserID: ${newUserID}`);
        }

        // Send notification to admins
        try {
          await sendNotificationsByRoles(
            ['Admin'],
            `New ${Role} registered: ${FullName} (${Email})`,
            'NEW_USER_REGISTRATION'
          );
        } catch (notificationError) {
          console.error('Error sending registration notifications:', notificationError);
        }

        return res.status(200).send('User registered successfully');
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).send('Internal server error');
  }
});

// API endpoint to fetch tickets
app.get('/api/tickets', (req, res) => {
    const query = `
    SELECT t.TicketID, c.Email AS UserEmail, s.Description AS System, tc.Description AS Category, t.Status, t.Priority, t.DateTime
    FROM ticket t
    LEFT JOIN appuser c ON t.UserId = c.UserID
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID;
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tickets:', err);
            res.status(500).json({ error: 'Failed to fetch tickets' });
            return;
        }
        res.json(results);
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { Email, Password } = req.body;
    const query = 'SELECT UserID, FullName, Email, Phone, Role, ProfileImagePath, Password AS HashedPassword FROM appuser WHERE Email = ?';

    db.query(query, [Email], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.status(500).json({ message: 'Error during login' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        bcrypt.compare(Password, user.HashedPassword, (compareErr, isMatch) => {
            if (compareErr) {
                console.error('Error comparing passwords:', compareErr);
                return res.status(500).json({ message: 'Error during login' });
            }

            if (isMatch) {
                // Passwords match! Login successful.
                res.status(200).json({
                    message: 'Login successful',
                    user: {
                        UserID: user.UserID,
                        FullName: user.FullName,
                        Email: user.Email,
                        Phone: user.Phone,
                        Role: user.Role,
                        ProfileImagePath: user.ProfileImagePath || null
                    }
                });
            } else {
                // Passwords do not match
                res.status(401).json({ message: 'Invalid credentials' });
            }
        });
    });
});

// Get admin  profile endpoint 
app.get('/api/user/profile/:id', (req, res) => {
    const userId = req.params.id;
    // Select all fields that the frontend profile form expects
    const query = 'SELECT UserID, FullName, Email, Phone, Role, ProfileImagePath FROM appuser WHERE UserID = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user profile:', err);
            res.status(500).json({ message: 'Server error' });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(200).json(results[0]);
        }
    });
});

// Get admin profile update endpoint 
app.put('/api/user/profile/:id', async (req, res) => {
    const userId = req.params.id;
    const { FullName, Email, Phone, CurrentPassword, NewPassword } = req.body;

    try {
        // First get the current user data to verify password
        const getUserQuery = 'SELECT Password FROM appuser WHERE UserID = ?';
        const [user] = await db.promise().query(getUserQuery, [userId]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If password change is requested
        if (CurrentPassword && NewPassword) {
            // Verify current password
            const isPasswordValid = await bcrypt.compare(CurrentPassword, user[0].Password);

            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(NewPassword, saltRounds);

            // Update all fields including password
            const updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ?, Password = ? WHERE UserID = ?';
            await db.promise().query(updateQuery, [FullName, Email, Phone, hashedNewPassword, userId]);
        } else {
            // Update only non-password fields
            const updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ? WHERE UserID = ?';
            await db.promise().query(updateQuery, [FullName, Email, Phone, userId]);
        }

        // Get updated user data
        const getUpdatedUserQuery = 'SELECT UserID, FullName, Email, Phone, Role, ProfileImagePath FROM appuser WHERE UserID = ?';
        const [updatedUser] = await db.promise().query(getUpdatedUserQuery, [userId]);

        if (updatedUser.length === 0) {
            return res.status(404).json({ message: 'Failed to retrieve updated user data' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser[0]
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});

/* ------------------------- Add Members ------------------------- */

// Get all supervisors (excluding users)
app.get('/supervisor', (req, res) => {
    const query = "SELECT UserID, FullName, Email, Role FROM appuser WHERE Role NOT IN ('user', 'User')";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json(results);
    });
});

// Get supervisor by ID
app.get('/supervisor/:id', (req, res) => {
    const query = "SELECT * FROM appuser WHERE UserID = ?";
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json(results[0]);
    });
});

// Update supervisor by ID
app.put('/supervisor/:id', (req, res) => {
    const { FullName, Email, Role } = req.body;
    const query = "UPDATE appuser SET FullName = ?, Email = ?, Role = ? WHERE UserID = ?";
    db.query(query, [FullName, Email, Role, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.sendStatus(200);
    });
});


// Delete supervisor by ID
app.delete('/supervisor/:id', (req, res) => {
    const query = "DELETE FROM appuser WHERE UserID = ?";
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.sendStatus(200);
    });
});

/*---------------------- Invite User via Email ----------------------*/

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function isValidEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

app.post('/api/invite', (req, res) => {
    const { email, role } = req.body;

    // --- Validation ----
    const allowedRoles = ['User', 'Supervisor', 'Manager', 'Developer'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role specified: ${role}. Allowed roles are: ${allowedRoles.join(', ')}` });
    }

    if (!email || !role || !isValidEmail(email)) {
        return res.status(400).json({ message: 'Valid email and role are required' });
    }

    const checkQuery = 'SELECT * FROM appuser WHERE Email = ?';
    db.query(checkQuery, [email], async (err, results) => {
        if (err) {
            console.error('Error checking existing user:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        const mailOptions = {
            from: `"Asipiya Soft Solution (PVT) LTD" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `You're invited to manage user complaints - Role: ${role}`,
            html: `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #ffe6f0; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">

     <!-- 1. Logo and Company Name Inline -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <img src="https://miro.medium.com/v2/resize:fit:2400/1*-okfOPV73mecuWxCZz6uJA.jpeg" alt="Asipiya Logo" style="width: 50px; height: auto;">
        <h2 style="margin: 0; color: #005baa;">Asipiya Soft Solution (PVT) LTD</h2>
      </div>

       <!-- 2. Personalized Welcome -->
      <h3 style="text-align: center; color: #005baa;">Welcome Aboard!</h3>
      <p>Hello <strong>${role}</strong>,</p>

      <!-- 3. Description of Role & Responsibilities -->
      <p>You have been invited to join our internal complaint management system to help <strong>supervise, manage, or resolve user complaints</strong> for Asipiya Soft Solution systems.</p>

      <!-- 4. Role-specific Responsibilities -->
      <ul>
        <li>🛠 Resolve reported issues from users</li>
        <li>📊 View and track ticket status in real time</li>
        <li>💬 Collaborate with your team to solve problems efficiently</li>
      </ul>

          <!-- 5. Onboarding Step -->
      <p><strong>Step 1:</strong> Set your password to activate your account.</p>

       <!-- 6. CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL}/register?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}"
           style="background: #005baa; color: #fff; text-decoration: none; padding: 14px 24px; border-radius: 6px; font-size: 16px;">
          Activate Your Account
        </a>
      </div>

      <!-- 7. Security Note -->
      <p style="font-size: 12px; color: #888;">
        🔒 This invitation is intended only for <strong>${email}</strong>. This link is unique and cannot be shared. It will expire in 24 hours.
      </p>

      <!-- 8. Support Info -->
      <p>❓ Need help? Contact our support team at <a href="mailto:support@asipiya.lk">support@asipiya.lk</a></p>

       <!-- Footer -->
      <hr style="margin-top: 30px;">
      <p style="font-size: 12px; text-align: center; color: #aaa;">&copy; ${new Date().getFullYear()} Asipiya Soft Solution (PVT) LTD. All rights reserved.</p>
    </div>
  `
        };

        try {
            await transporter.sendMail(mailOptions);
            res.json({ message: 'Invitation email sent successfully.' });
        } catch (mailErr) {
            console.error(mailErr);
            res.status(500).json({ message: 'Failed to send email' });
        }
    });
});


// --- ADDED: FORGOT PASSWORD ENDPOINT ---
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ message: 'A valid email address is required.' });
    }

    // 1. Find the user by email
    db.query('SELECT UserID, FullName FROM appuser WHERE Email = ?', [email], (err, users) => {
        if (err) {
            console.error('Error finding user for password reset:', err);
            return res.status(500).json({ message: 'Server error. Please try again later.' });
        }

        if (users.length === 0) {
            // For security, always send a generic success message even if email not found
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        const user = users[0];
        const token = uuidv4(); // Generate a unique token
        const expiresAt = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'); // Token expires in 1 hour

        // 2. Invalidate any existing tokens for this user
        db.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.UserID], (deleteErr) => {
            if (deleteErr) {
                console.error('Error deleting old tokens:', deleteErr);
                return res.status(500).json({ message: 'Server error during token invalidation.' });
            }

            // 3. Store the new token in the database
            const insertTokenQuery = 'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
            db.query(insertTokenQuery, [user.UserID, token, expiresAt], (insertErr) => {
                if (insertErr) {
                    console.error('Error storing new token:', insertErr);
                    return res.status(500).json({ message: 'Server error during token storage.' });
                }

                // 4. Send the password reset email
                const resetLink = `${process.env.APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

                const mailOptions = {
                    from: `"Asipiya Soft Solution (PVT) LTD" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Password Reset Request',
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f0f8ff; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                                <img src="https://miro.medium.com/v2/resize:fit:2400/1*-okfOPV73mecuWxCZz6uJA.jpeg" alt="Asipiya Logo" style="width: 50px; height: auto;">
                                <h2 style="margin: 0; color: #005baa;">Asipiya Soft Solution (PVT) LTD</h2>
                            </div>

                            <h3 style="text-align: center; color: #005baa;">Password Reset Request</h3>
                            <p>Hello ${user.FullName || 'User'},</p>
                            <p>We received a request to reset the password for your account. If you did not make this request, please ignore this email.</p>
                            <p>To reset your password, please click the button below:</p>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetLink}"
                                   style="background: #005baa; color: #fff; text-decoration: none; padding: 14px 24px; border-radius: 6px; font-size: 16px;">
                                    Reset Your Password
                                </a>
                            </div>

                            <p style="font-size: 12px; color: #888;">
                                This link will expire in 1 hour. If you do not reset your password within this timeframe, you will need to request a new link.
                            </p>
                            <p>If you have any questions, feel free to contact our support team.</p>

                            <hr style="margin-top: 30px;">
                            <p style="font-size: 12px; text-align: center; color: #aaa;">&copy; ${new Date().getFullYear()} Asipiya Soft Solution (PVT) LTD. All rights reserved.</p>
                        </div>
                    `
                };

                transporter.sendMail(mailOptions, (mailErr) => {
                    if (mailErr) {
                        console.error('Error sending password reset email:', mailErr);
                        return res.status(500).json({ message: 'Failed to send email' });
                    }
                    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
                });
            });
        });
    });
});

// --- ADDED: RESET PASSWORD ENDPOINT ---
app.post('/reset-password', (req, res) => {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
        return res.status(400).json({ message: 'Email, token, and new password are required.' });
    }

    // 1. Find and validate the token
    db.query('SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?', [token], (err, tokens) => {
        if (err) {
            console.error('Error finding token:', err);
            return res.status(500).json({ message: 'Server error during token validation.' });
        }

        if (tokens.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token. Please request a new password reset link.' });
        }

        const resetToken = tokens[0];
        const currentDateTime = moment();
        const expiryDateTime = moment(resetToken.expires_at);

        if (currentDateTime.isAfter(expiryDateTime)) {
            // Token has expired, delete it from the database
            db.query('DELETE FROM password_reset_tokens WHERE token = ?', [token], (deleteErr) => {
                if (deleteErr) console.error('Error deleting expired token:', deleteErr);
                return res.status(400).json({ message: 'Token has expired. Please request a new password reset link.' });
            });
            return; // Exit here after sending response
        }

        // 2. Verify the user associated with the token matches the provided email
        db.query('SELECT UserID FROM appuser WHERE UserID = ? AND Email = ?', [resetToken.user_id, email], (err, users) => {
            if (err) {
                console.error('Error verifying user for reset:', err);
                return res.status(500).json({ message: 'Server error during user verification.' });
            }

            if (users.length === 0) {
                return res.status(400).json({ message: 'Invalid user for this token.' });
            }

            // 3. Hash the new password
            bcrypt.hash(newPassword, saltRounds, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Error hashing new password:', hashErr);
                    return res.status(500).json({ message: 'Error processing new password.' });
                }

                // 4. Update the user's password
                db.query('UPDATE appuser SET Password = ? WHERE UserID = ?', [hashedPassword, resetToken.user_id], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating password:', updateErr);
                        return res.status(500).json({ message: 'Server error during password update.' });
                    }

                    // 5. Invalidate (delete) the used token from the database
                    db.query('DELETE FROM password_reset_tokens WHERE token = ?', [token], (deleteUsedTokenErr) => {
                        if (deleteUsedTokenErr) console.error('Error deleting used token:', deleteUsedTokenErr);
                        res.status(200).json({ message: 'Password has been reset successfully.' });
                    });
                });
            });
        });
    });
});


/*---------------------------------------------------------------------------------------*/
//nope
// Get all chat messages for a ticket
app.get('/ticketchat/:ticketId', (req, res) => {
    const ticketId = req.params.ticketId;
    const sql = 'SELECT * FROM ticketchat WHERE TicketID = ? ORDER BY TicketChatID ASC';
    db.query(sql, [ticketId], (err, results) => {
        if (err) {
            console.error('Error fetching chat messages:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// ✅ Add a new chat message for a ticket
app.post('/ticketchat', upload.single('File'), (req, res) => {
    const { TicketID, Type, Note, UserID, Role } = req.body;
    const file = req.file;

    if (!TicketID || !Note) {
        return res.status(400).json({ error: 'TicketID and Note are required.' });
    }

    const filePath = file ? file.filename : null;

    const sql = `INSERT INTO ticketchat (TicketID, Type, Note, UserID, Role, Path)
               VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(
        sql,
        [TicketID, Type || null, Note, UserID || null, Role || null, filePath],
        (err, result) => {
            if (err) {
                console.error('Error adding chat message:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Build full file URL
            const fileUrl = file ? `http://localhost:5000/uploads/profile_images/${file.filename}` : null;

            res.status(201).json({
                message: 'Chat message added',
                chatId: result.insertId,
                fileUrl, // <- Send full URL back to frontend
            });
        }
    );
});

// ✅ GET messages for a specific ticket
app.get("/messages/:ticketId", (req, res) => {
    const ticketId = req.params.ticketId;

    db.query(
        `SELECT TicketChatID as id, TicketID, Type, Note as content,
      UserID, Path, Role, CreatedAt as timestamp
      FROM ticketchat WHERE TicketID = ? ORDER BY CreatedAt ASC`,
        [ticketId],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to fetch messages" });
            }

            const formatted = rows.map((r) => ({
                id: r.id,
                ticketid: r.TicketID,
                type: r.Type,
                content: r.content,
                userid: r.UserID,
                role: r.Role,
                timestamp: r.timestamp,
                file: r.Path
                    ? {
                        name: path.basename(r.Path),
                        url: `http://localhost:5000/uploads/profile_images/${r.Path}`,
                    }
                    : null,
                status: "delivered",
            }));

            res.json(formatted);
        }
    );
});

//nope
// POST a new chat message without file upload
app.post("/ticketchat", async (req, res) => {
    try {
        const { TicketID, Note, Type, UserID, Role } = req.body;

        // Insert only text messages
        const [result] = await db.execute(
            `INSERT INTO ticketchat (TicketID, Type, Note, UserID, Path, Role)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [TicketID, Type, Note, UserID, null, Role]
        );
        res.json({ chatId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send message" });
    }
});

/*-------------------------------Fetch Requests-----------------------------------------*/
// Route: Get tickets assigned to a specific supervisor

// Get tickets assigned to a specific supervisor (by UserID in appuser)
app.get("/tickets", (req, res) => {
    const { supervisorId, role } = req.query;

    // Role is required
    if (!role) {
        return res.status(400).json({ error: "User role is required" });
    }

    // Admin: Return all tickets
    if (role === "Admin") {
        const sql = `SELECT 
                    t.*, 
                    asys.SystemName AS AsipiyaSystemName, 
                    u.FullName AS UserName
                    FROM ticket t
                    LEFT JOIN asipiyasystem asys ON t.AsipiyaSystemID = asys.AsipiyaSystemID
                    LEFT JOIN appuser u ON t.UserId = u.UserID`;

        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching all tickets:", err);
                return res.status(500).json({ error: "Error fetching tickets" });
            }
            return res.json(results);
        });
    }

    // Supervisor: Return only their tickets
    else if (role === "Supervisor") {
        if (!supervisorId) {
            return res.status(400).json({ error: "Supervisor ID is required for supervisors" });
        }

        const sql = `SELECT 
                        t.*, 
                        asys.SystemName AS AsipiyaSystemName, 
                        u.FullName AS UserName
                        FROM ticket t
                        LEFT JOIN asipiyasystem asys ON t.AsipiyaSystemID = asys.AsipiyaSystemID
                        LEFT JOIN appuser u ON t.UserId = u.UserID
                        WHERE t.SupervisorID = ?`;

        db.query(sql, [supervisorId], (err, results) => {
            if (err) {
                console.error("Error fetching supervisor's tickets:", err);
                return res.status(500).json({ error: "Error fetching tickets" });
            }
            return res.json(results);
        });
    }

    // If the role is invalid
    else {
        return res.status(400).json({ error: "Invalid role specified" });
    }
});

app.get("/getting/tickets", (req, res) => {
    const { supervisorId, systemId } = req.query;

    let sql = `
    SELECT 
      t.*, 
      asys.SystemName AS AsipiyaSystemName, 
      u.FullName AS UserName
    FROM ticket t
    LEFT JOIN asipiyasystem asys ON t.AsipiyaSystemID = asys.AsipiyaSystemID
    LEFT JOIN appuser u ON t.UserId = u.UserID
    WHERE 1 = 1
  `;

    const params = [];

    if (supervisorId && supervisorId !== "all") {
        sql += " AND t.SupervisorID = ?";
        params.push(supervisorId);
    }

    if (systemId && systemId !== "all") {
        sql += " AND t.AsipiyaSystemID = ?";
        params.push(systemId);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error fetching tickets:", err);
            return res.status(500).json({ error: "Error fetching tickets" });
        }
        res.json(results);
    });
});

app.put('/tickets/:id', (req, res) => {
    const { id } = req.params;
    const { status, dueDate, resolution } = req.body;

    // Build the SET clause dynamically
    const fields = [];
    const values = [];

    if (status !== undefined) {
        fields.push("Status = ?");
        values.push(status);
    }

    if (dueDate !== undefined) {
        fields.push("DueDate = ?");
        values.push(dueDate);
    }

    if (resolution !== undefined) {
        fields.push("Resolution = ?");
        values.push(resolution);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields provided to update." });
    }

    const sql = `UPDATE ticket SET ${fields.join(', ')} WHERE TicketID = ?`;
    values.push(id); // Add id to the end of values array for WHERE clause

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Failed to update ticket:", err);
            return res.status(500).json({ message: "Server error" });
        }
        res.json({ message: "Ticket updated successfully" });
    });
});
//--------------------------------
app.get("/evidence/:ticketId", (req, res) => {
    const { ticketId } = req.params;

    const sql = "SELECT FilePath FROM evidence WHERE ComplaintID = ?";
    db.query(sql, [ticketId], (err, result) => {
        if (err) {
            console.error("Error fetching evidence:", err);
            return res.status(500).json({ error: "Failed to fetch evidence" });
        }
        res.json(result);
    });
});

app.get("/supervisors", (req, res) => {
    const sql = "SELECT UserID, FullName FROM appuser WHERE Role = 'supervisor'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching supervisors:", err);
            return res.status(500).json({ error: "Error fetching supervisors" });
        }
        res.json(results);
    });
});

app.get("/asipiyasystems", (req, res) => {
    const sql = "SELECT AsipiyaSystemID, SystemName FROM asipiyasystem";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching systems:", err);
            return res.status(500).json({ error: "Error fetching systems" });
        }
        res.json(results);
    });
});

//nope
app.get("/tickets", (req, res) => {
    const query = `
    SELECT * 
    FROM ticket 
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching tickets for supervisor:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        res.json(results);
    });
});

// Add this to your existing Node.js/Express backend
app.put('/tickets/accept/:ticketID', (req, res) => {
    const { ticketID } = req.params;

    db.query('UPDATE ticket SET Status = "Accepted" WHERE TicketID = ?', [ticketID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        return res.json({ message: "Ticket accepted successfully" });
    });
});

/*---------------------------------------------------------------------------------------*/



//View ticket details
app.get('/api/ticket_view/:id', (req, res) => {
    const ticketId = req.params.id;
    const query = `SELECT t.TicketID, u.FullName AS UserName, u.Email AS UserEmail,    
    s.SystemName,
    c.CategoryName,
    t.Description,
    t.DateTime,
    t.Status,
    t.Priority,
    t.FirstRespondedTime,
    t.LastRespondedTime,
    t.TicketDuration,
    t.UserNote
  FROM ticket t
  JOIN appuser u ON t.UserId = u.UserID
  JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
  JOIN ticketcategory c ON t.TicketCategoryID = c.TicketCategoryID
  WHERE t.TicketID = ?`;

    db.query(query, [ticketId], (err, results) => {
        if (err) {
            console.error("Error in ticket_view query:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        res.json(results[0]);
    });
});


app.get('/api/supervisors', (req, res) => {
    const query = `
    SELECT UserID, FullName FROM appuser 
    WHERE Role IN ('supervisor')
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching supervisors:", err);
            return res.status(500).json({ error: "Database error" });
        }
        console.log("Supervisor result:", results); // Add this
        res.json(results); // Make sure it's just `results`, not wrapped in an object
    });
});

// Helper function to create a ticket log
const createTicketLog = async (ticketId, type, description, userId, oldValue, newValue) => {
    return new Promise((resolve, reject) => {
        const logQuery = `
            INSERT INTO ticketlog (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue)
            VALUES (?, NOW(), ?, ?, ?, ?, ?)
        `;
        
        // Get user info for the log description - REVERTED CHANGE
        const userQuery = 'SELECT FullName, Role FROM appuser WHERE UserID = ?';
        db.query(userQuery, [userId], (userErr, userResults) => {
            if (userErr) {
                console.error("Error getting user info:", userErr);
                reject(userErr);
                return;
            }

            const userName = userResults[0]?.FullName || 'Unknown User';
            const userRole = userResults[0]?.Role || 'Unknown Role';
            
            const finalDescription = `${userName} (${userRole}) ${description}`;
            
            db.query(logQuery, [
                ticketId,
                type,
                finalDescription,
                userId,
                oldValue,
                newValue
            ], (err, result) => {
                if (err) {
                    console.error("Error creating ticket log:", err);
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    });
};

// In the status change handler:
app.put('/api/tickets/:ticketId/status', async (req, res) => {
  const { ticketId } = req.params;
  const { status, userId } = req.body; // <-- userId must be sent from frontend

  // 1. Get old status
  db.query('SELECT Status FROM ticket WHERE TicketID = ?', [ticketId], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ message: 'Error' });
    const oldStatus = results[0].Status;

    // 2. Update ticket
    db.query('UPDATE ticket SET Status = ? WHERE TicketID = ?', [status, ticketId], (err2) => {
      if (err2) return res.status(500).json({ message: 'Error updating status' });

      // 3. Log
      const desc = `Status changed from ${oldStatus} to ${status}`;
      db.query(
        'INSERT INTO ticketlog (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue) VALUES (?, NOW(), ?, ?, ?, ?, ?)',
        [ticketId, 'STATUS_CHANGE', desc, userId, oldStatus, status],
        () => {}
      );
      res.json({ message: 'Status updated and logged' });
    });
  });
});

// Update ticket priority
app.put('/api/tickets/:ticketId/priority', async (req, res) => {
    const { ticketId } = req.params;
    const { priority, userId } = req.body;

    // First get the current ticket and user details
    const getTicket = `
        SELECT 
            t.Priority,
            t.UserId as ticketUserId,
            t.SupervisorID,
            au.FullName as updatedByName,
            au_creator.FullName as creatorName
        FROM ticket t
        LEFT JOIN appuser au ON au.UserID = ?
        LEFT JOIN appuser au_creator ON au_creator.UserID = t.UserId
        WHERE t.TicketID = ?
    `;
    
    try {
        const [ticketResults] = await new Promise((resolve, reject) => {
            db.query(getTicket, [userId, ticketId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!ticketResults) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        const oldPriority = ticketResults.Priority;
        const ticketUserId = ticketResults.ticketUserId;
        const updatedByName = ticketResults.updatedByName;

        // Update the ticket priority
        const updateQuery = "UPDATE ticket SET Priority = ?, LastRespondedTime = NOW() WHERE TicketID = ?";
        
        await new Promise((resolve, reject) => {
            db.query(updateQuery, [priority, ticketId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // Create ticket log entry
        const logQuery = `
            INSERT INTO ticketlog 
            (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue, Note)
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
        `;

        const description = `Priority changed from ${oldPriority} to ${priority}`;
        const note = `Updated by ${updatedByName}`;

        const [logResult] = await new Promise((resolve, reject) => {
            db.query(
                logQuery,
                [ticketId, 'PRIORITY_CHANGE', description, userId, oldPriority, priority, note],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        // Create notifications
        try {
            // Notify ticket creator
            await createNotification(
                ticketUserId,
                `Your ticket #${ticketId} priority has been changed from ${oldPriority} to ${priority} by ${updatedByName}`,
                'PRIORITY_UPDATE',
                logResult.insertId
            );

            // If priority changed to High, notify supervisor
            if (priority === 'High' && ticketResults.SupervisorID) {
                await createNotification(
                    ticketResults.SupervisorID,
                    `Ticket #${ticketId} has been marked as High priority. Immediate attention required.`,
                    'HIGH_PRIORITY_ALERT',
                    logResult.insertId
                );
            }
        } catch (error) {
            console.error("Error creating notifications:", error);
        }

        res.json({ 
            message: "Ticket priority updated successfully",
            logId: logResult.insertId
        });
    } catch (error) {
        console.error("Error updating ticket priority:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Add comment to ticket
app.post('/api/tickets/:ticketId/comments', async (req, res) => {
  const { ticketId } = req.params;
  const { userId, comment, mentions, mentionedUserIds } = req.body;
  const sql = `CALL AddTicketComment(?, ?, ?, ?)`;
  db.query(sql, [ticketId, userId, comment, mentions || null], async (err, result) => {
    if (err) {
      console.error('Error adding comment:', err);
      return res.status(500).json({ message: 'Failed to add comment' });
    }

    // Add to ticketlog
    const logSql = `
      INSERT INTO ticketlog (TicketID, DateTime, Type, Description, UserID)
      VALUES (?, NOW(), 'COMMENT', ?, ?)
    `;
    db.query(logSql, [ticketId, comment, userId], (logErr) => {
      if (logErr) {
        console.error('Error adding to ticketlog:', logErr);
        // Not fatal, continue
      }
    });

    // Notify mentioned users (if you want)
    if (Array.isArray(mentionedUserIds)) {
      for (const mentionedUserId of mentionedUserIds) {
        await createNotification(
          mentionedUserId,
          `You were mentioned in a comment on ticket #${ticketId}`,
          'MENTION'
        );
      }
    }

    res.status(201).json({ message: 'Comment added successfully' });
  });
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
    },
});

const upload_evidence = multer({ storage: storage });

app.post("/upload_evidence", upload_evidence.array("evidenceFiles"), (req, res) => {
    const { ticketId, description } = req.body;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    if (!ticketId) {
        return res.status(400).json({ message: "Ticket ID is required" });
    }

    const values = req.files.map((file) => [ticketId, file.path, description]);

    const insertEvidenceQuery = `
    INSERT INTO evidence (ComplaintID, FilePath, Description) VALUES ?
  `;

    db.query(insertEvidenceQuery, [values], (err, result) => {
        if (err) {
            console.error("Error inserting evidence:", err);
            return res.status(500).json({ message: "Error saving evidence" });
        }
        res
            .status(200)
            .json({
                message: "Evidence files uploaded",
                inserted: result.affectedRows,
            });
    });
});

//user ticket view
app.get("/userTickets", (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    const sql = `
    SELECT 
      t.TicketID AS id,
      t.Description AS description,
      t.Status AS status,
      a.SystemName AS system_name,
      c.CategoryName AS category,
      t.DateTime AS datetime,
      t.SupervisorID AS supervisor_id,
      u.FullName AS supervisor_name
    FROM ticket t
    JOIN asipiyasystem a ON t.AsipiyaSystemID = a.AsipiyaSystemID
    JOIN ticketcategory c ON t.TicketCategoryID = c.TicketCategoryID
    LEFT JOIN appUser u ON t.SupervisorID = u.UserID
    WHERE t.UserID = ?
    ORDER BY t.DateTime DESC
  `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching tickets:", err);
            return res.status(500).json({ message: "Error fetching tickets" });
        }
        res.status(200).json(results);
    });
});

//User View ticket details by ticketId 
app.get("/userTicket/:ticketId", (req, res) => {
  const { ticketId } = req.params;
  const sql = `
    SELECT 
      t.TicketID AS id,
      t.Description AS description,
      t.Status AS status,
      a.SystemName AS system_name,
      c.CategoryName AS category,
      t.DateTime AS datetime,
      t.SupervisorID AS supervisor_id,
      u.FullName AS supervisor_name
    FROM ticket t
    JOIN asipiyasystem a ON t.AsipiyaSystemID = a.AsipiyaSystemID
    JOIN ticketcategory c ON t.TicketCategoryID = c.TicketCategoryID
    LEFT JOIN appUser u ON t.SupervisorID = u.UserID
    WHERE t.TicketID = ?
  `;
  db.query(sql, [ticketId], (err, results) => {
    if (err) {
      console.error("Error fetching ticket:", err);
      return res.status(500).json({ message: "Error fetching ticket" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(results[0]);
  });
});

//User view evidence by ticketId
app.get('/api/evidence/:ticketId', async (req, res) => {
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
});

// API endpoint to fetch ticket counts
app.get('/api/tickets/counts', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) AS count FROM ticket',
        open: "SELECT COUNT(*) AS count FROM ticket WHERE Status IN ('Open', 'In Progress') AND Status != 'Rejected'",
        today: "SELECT COUNT(*) AS count FROM ticket WHERE DATE(DateTime) = CURDATE()",
        highPriority: "SELECT COUNT(*) AS count FROM ticket WHERE Priority = 'High' AND Status != 'Rejected'",
        resolved: "SELECT COUNT(*) AS count FROM ticket WHERE Status = 'Resolved'",
        pending: "SELECT COUNT(*) AS count FROM ticket WHERE Status = 'Pending'"
    };

    const results = {};
    let completed = 0;

    Object.entries(queries).forEach(([key, query]) => {
        db.query(query, (err, result) => {
            if (err) {
                console.error(`Error fetching ${key} count:`, err);
                return res.status(500).json({ error: `Failed to fetch ${key} ticket count` });
            }

            results[key] = result[0].count;
            completed++;

            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

// API endpoint to fetch filtered tickets  
app.get('/api/tickets/filter', (req, res) => {
    const { type, company, system } = req.query; // <-- ADD company, system

    let baseQuery = `
        SELECT 
            t.TicketID,
            u.FullName AS UserName,
            c.CompanyName AS CompanyName,
            s.SystemName AS SystemName,
            t.Description,
            t.Status,
            t.Priority,
            t.DateTime
        FROM ticket t
        LEFT JOIN appuser u ON t.UserId = u.UserID
        LEFT JOIN client c ON u.Email = c.ContactPersonEmail
        LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    `;

    let whereClause = [];
    let orderClause = 'ORDER BY t.DateTime DESC';

    // Type-based filter
    switch (type) {
        case 'pending':
            whereClause.push("t.Status = 'Pending'");
            break;
        case 'open':
            whereClause.push("t.Status IN ('Open', 'In Progress') AND t.Status != 'Rejected'");
            break;
        case 'today':
            whereClause.push("DATE(t.DateTime) = CURDATE()");
            break;
        case 'high-priority':
            whereClause.push("t.Status != 'Rejected'");
            orderClause = "ORDER BY FIELD(t.Priority, 'High', 'Medium', 'Low'), t.DateTime DESC";
            break;
        case 'resolved':
            whereClause.push("t.Status = 'Resolved'");
            break;
    }

    // Company filter
    if (company && company !== 'all') {
        whereClause.push("c.CompanyName = " + db.escape(company));
    }
    // System filter
    if (system && system !== 'all') {
        whereClause.push("s.SystemName = " + db.escape(system));
    }

    const finalWhere = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';
    const query = `${baseQuery} ${finalWhere} ${orderClause}`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching filtered tickets:', err);
            res.status(500).json({ error: 'Failed to fetch tickets' });
            return;
        }
        res.json(results);
    });
});

// API endpoint to fetch ticket status distribution
app.get('/api/tickets/status-distribution', (req, res) => {
    const query = `
        SELECT 
            SUM(CASE WHEN Priority = 'High' THEN 1 ELSE 0 END) AS high,
            SUM(CASE WHEN Priority = 'Medium' THEN 1 ELSE 0 END) AS medium,
            SUM(CASE WHEN Priority = 'Low' THEN 1 ELSE 0 END) AS low
        FROM ticket;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching ticket status distribution:', err);
            res.status(500).json({ error: 'Failed to fetch ticket status distribution' });
            return;
        }

        res.json(results[0]);
    });
});

// API endpoint to fetch the last five activities
app.get('/api/tickets/recent-activities', (req, res) => {
    const query = `
        SELECT 
            t.TicketID,
            t.Description,
            t.Status,
            t.Priority,
            t.DateTime
        FROM ticket t
        ORDER BY t.DateTime DESC
        LIMIT 5
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching recent activities:', err);
            return res.status(500).json({ error: 'Failed to fetch recent activities' });
        }
        res.json(results);
    });
});

// API endpoint to fetch ticket  
app.get('/api/tickets/ ', (req, res) => {
    const query = `
        SELECT 
            t.TicketID, 
            u.FullName AS UserName, 
             t.Description, 
            t.Status, 
            t.Priority, 
            t.UserNote,
         FROM 
            ticket t
        LEFT JOIN 
            appuser u 
        ON 
            t.UserId = u.UserID;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tickets  s:', err);
            res.status(500).json({ error: 'Failed to fetch tickets ' });
            return;
        }
        res.json(results);
    });
});

// API endpoint to fetch ticket counts by system
app.get('/api/tickets/system-distribution', (req, res) => {
    const query = `
        SELECT 
            s.SystemName,
            COUNT(t.TicketID) as TicketCount
        FROM asipiyasystem s
        LEFT JOIN ticket t ON s.AsipiyaSystemID = t.AsipiyaSystemID
        GROUP BY s.SystemName
        ORDER BY TicketCount DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching ticket system distribution:', err);
            res.status(500).json({ error: 'Failed to fetch ticket system distribution' });
            return;
        }
        res.json(results);
    });
});

// Update endpoint for recent users
app.get('/api/users/recent', (req, res) => {
    const query = `
        SELECT DISTINCT 
            u.UserID,
            u.FullName,
            u.ProfileImagePath,
            EXISTS(
                SELECT 1 
                FROM ticket t 
                WHERE t.UserId = u.UserID 
                AND t.Status = 'Pending'
            ) as hasPendingTicket
        FROM appuser u
        WHERE u.Role = 'User'
        ORDER BY u.UserID DESC
        LIMIT 5
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching recent users:', err);
            return res.status(500).json({ error: 'Failed to fetch recent users' });
        }
        res.json(results);
    });
});

/*-------------------------------NOTIFICATIONS---------------------------------------------------*/

// API endpoint to get unread notifications count
app.get('/api/notifications/count/:id', (req, res) => {
    const userId = req.params.id;
    const query = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE UserID = ? AND IsRead = FALSE
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching notification count:', err);
            return res.status(500).json({ error: 'Failed to fetch notification count' });
        }
        res.json({ count: results[0].count });
    });
});

// API endpoint to get user's notifications
app.get('/api/notifications/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT 
            NotificationID,
            Message,
            Type,
            IsRead,
            CreatedAt,
            TicketLogID
        FROM notifications 
        WHERE UserID = ? AND IsRead = FALSE
        ORDER BY CreatedAt DESC
        LIMIT 50
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching notifications:', err);
            return res.status(500).json({ error: 'Failed to fetch notifications' });
        }
        res.json(results);
    });
});

// API endpoint to mark notifications as read
app.put('/api/notifications/read', (req, res) => {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ error: 'Notification IDs array is required' });
    }

    const query = `
        UPDATE notifications 
        SET IsRead = TRUE 
        WHERE NotificationID IN (?)
    `;

    db.query(query, [notificationIds], (err, result) => {
        if (err) {
            console.error('Error marking notifications as read:', err);
            return res.status(500).json({ error: 'Failed to mark notifications as read' });
        }
        res.json({ message: 'Notifications marked as read', updatedCount: result.affectedRows });
    });
});

// ADDED: API endpoint to mark all notifications for a user as read
app.put('/api/notifications/read-all/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const query = `
        UPDATE notifications 
        SET IsRead = TRUE 
        WHERE UserID = ? AND IsRead = FALSE
    `;

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error marking all notifications as read:', err);
            return res.status(500).json({ error: 'Failed to mark all notifications as read' });
        }
        res.json({ message: 'All notifications marked as read', updatedCount: result.affectedRows });
    });
});

/*------------------------------COUNT TICKETS----------------------------------------------------*/

// API endpoint to fetch ticket counts for a SPECIFIC USER
app.get('/api/user/tickets/counts/:userId', (req, res) => {
    const userId = req.params.userId;
    const queries = {
        total: 'SELECT COUNT(*) AS count FROM ticket WHERE Userid = ?',
        pending: "SELECT COUNT(*) AS count FROM ticket WHERE Userid = ? AND Status = 'Pending'",
        resolved: "SELECT COUNT(*) AS count FROM ticket WHERE Userid = ? AND Status IN ('Resolved', 'Rejected')",
        ongoing: "SELECT COUNT(*) AS count FROM ticket WHERE Userid = ? AND Status IN ('Open', 'In Progress')"
    };

    const results = {};
    const totalQueries = Object.keys(queries).length;

    const promises = Object.entries(queries).map(([key, query]) => {
        return new Promise((resolve, reject) => {
            db.query(query, [userId], (err, result) => {
                if (err) {
                    console.error(`Error fetching user ${key} count:`, err);
                    reject({ error: `Failed to fetch user ${key} ticket count` });
                } else {
                    results[key] = result[0].count;
                    resolve();
                }
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            res.json(results);
        })
        .catch(error => {
            res.status(500).json(error);
        });
});

// API endpoint to fetch the last five activities for a SPECIFIC USER
app.get('/api/user/tickets/recent/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT
            t.TicketID,
            t.Description,
            t.Status,
            t.Priority,
            t.DateTime,
            s.SystemName,       -- Added SystemName
            tc.CategoryName     -- Added CategoryName
        FROM ticket t
        LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
        LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID
        WHERE t.UserId = ?
        ORDER BY t.DateTime DESC
        LIMIT 5
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user recent activities:', err);
            return res.status(500).json({ error: 'Failed to fetch user recent activities' });
        }
        res.json(results);
    });
});

/*----------------------------------------------------------------------------------*/

// Get user details by ID
app.get('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
    SELECT 
      u.UserID,
      u.FullName,
      u.Email,
      u.Phone as ContactNo,
      u.ProfileImagePath,
      COUNT(t.TicketID) as TotalTickets,
      SUM(CASE WHEN t.Status = 'Closed' THEN 1 ELSE 0 END) as ClosedTickets,
      SUM(CASE WHEN t.Priority = 'High' THEN 1 ELSE 0 END) as HighPriorityTickets
    FROM appuser u
    LEFT JOIN ticket t ON u.UserID = t.UserId
    WHERE u.UserID = ?
    GROUP BY u.UserID
  `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user details:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});

// Get user's tickets
app.get('/api/tickets/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
    SELECT 
      t.TicketID,
      t.Description,
      t.Status,
      t.Priority,
      t.DateTime,
      t.TicketDuration as Duration,
      s.SystemName,
      tc.CategoryName
    FROM ticket t
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID
    WHERE t.UserId = ?
    ORDER BY t.DateTime DESC
  `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user tickets:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

/* ----------------------------------------------------------------------------------------------*/

// API endpoint to fetch tickets

app.get('/api/tickets', (req, res) => {
    const query = `
    SELECT t.TicketID, c.CompanyName AS Client, s.Description AS System, tc.Description AS Category, t.Status, t.Priority
    FROM ticket t
    LEFT JOIN client c ON t.UserId = c.ClientID
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID;
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tickets:', err);
            res.status(500).json({ error: 'Failed to fetch tickets' });
            return;
        }
        res.json(results);
    });
});

app.get('/api/pending_ticket', (req, res) => {
  const query = `
    SELECT 
      t.TicketID,
      s.SystemName AS SystemName,
      c.CompanyName AS CompanyName,
      u.FullName AS UserName,
      t.Status,
      t.DateTime
    FROM ticket t
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN appuser u ON t.UserId = u.UserID
    LEFT JOIN client c ON u.Email = c.ContactPersonEmail
    ORDER BY t.TicketID ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tickets:', err);
      res.status(500).json({ error: 'Failed to fetch tickets' });
      return;
    }
    res.json(results);
  });
});


//Add systems
app.post('/api/systems', async (req, res) => {
  const { systemName, description, status } = req.body;

  const sql = 'INSERT INTO asipiyasystem (SystemName, Description , Status) VALUES (?, ?, ?)';
  db.query(sql, [systemName, description, status], async (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

        // Send notification to supervisors, developers, and admins
        try {
            await sendNotificationsByRoles(
                ['Supervisor', 'Developer', 'Admin'],
                `New system added: ${systemName}`,
                'NEW_SYSTEM_ADDED'
            );
        } catch (error) {
            console.error('Error sending system registration notifications:', error);
        }

        res.status(200).json({ message: 'System registered successfully' });
    });
});

//View systems
app.get('/system_registration', (req, res) => {
    const sql = `
    SELECT
      s.*,
      CASE
        WHEN COUNT(t.TicketID) > 0 THEN 1
        ELSE 0
      END AS IsUsed
    FROM asipiyasystem s
    LEFT JOIN ticket t ON s.AsipiyaSystemID = t.AsipiyaSystemID
    GROUP BY
      s.AsipiyaSystemID, s.SystemName, s.Description, s.Status
    ORDER BY s.AsipiyaSystemID;
  `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching system status:', err);
            return res.status(500).json({ message: 'Database error during status fetch' });
        }
        res.status(200).json(results);
    });
});

app.put('/api/system_registration_update/:id', (req, res) => {
    const { id } = req.params;
    const { systemName, description, status } = req.body;
    const sql = 'UPDATE asipiyasystem SET SystemName = ?, Description = ?, Status = ? WHERE AsipiyaSystemID = ?';

    db.query(sql, [systemName, description, status, id], (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ error: 'Error updating system' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'System not found' });
        }

        res.status(200).json({ message: 'System updated successfully' });
    });
});


app.delete('/api/system_registration_delete/:id', (req, res) => {
    const { id } = req.params;

  const checkStatusSql = 'SELECT Status FROM asipiyasystem WHERE AsipiyaSystemID = ?';
  db.query(checkStatusSql, [id], (err, results) => {
    if (err) {
      console.error('Status check error:', err);
      return res.status(500).json({ error: 'Database error checking system status' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'System not found' });
    }

    const status = results[0].Status;
    if (status === 1) {
      return res.status(403).json({ message: 'Cannot delete active system (status = 1)' });
    }

        const deleteSql = 'DELETE FROM asipiyasystem WHERE AsipiyaSystemID = ?';
        db.query(deleteSql, [id], (err, result) => {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).json({ error: 'Error deleting system' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'System not found' });
            }

            res.status(200).json({ message: 'System deleted successfully' });
        });
    });
});



//Adding Category
app.post('/api/ticket_category', async (req, res) => {
  const { CategoryName, Description, Status } = req.body;

  const sql = 'INSERT INTO ticketcategory (CategoryName, Description, Status) VALUES (?, ?, ?)';
  db.query(sql, [CategoryName, Description, Status], async (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Failed to add ticket category" });
    }

        try {
            await sendNotificationsByRoles(
                ['Supervisor', 'Developer', 'Admin'],
                `New ticket category added: ${CategoryName}`,
                'NEW_CATEGORY_ADDED'
            );
        } catch (error) {
            console.error('Error sending category addition notifications:', error);
        }

        res.status(200).json({
            message: 'Ticket category added successfully',
            categoryId: result.insertId
        });
    });
});

//View Categories
app.get('/ticket_category', (req, res) => {
    const sql = `
    SELECT
      tc.*,
      CASE
        WHEN COUNT(t.TicketID) > 0 THEN 1
        ELSE 0
      END AS IsUsed
    FROM ticketcategory tc
    LEFT JOIN ticket t
      ON tc.TicketCategoryID = t.TicketCategoryID
    GROUP BY
      tc.TicketCategoryID, tc.CategoryName, tc.Description, tc.Status
    ORDER BY tc.TicketCategoryID;
  `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ message: 'Error fetching categories' });
        }
        res.status(200).json(results);
    });
});

app.put('/api/ticket_category_update/:id', (req, res) => {
    const { id } = req.params;
    const { CategoryName, Description, Status } = req.body;

    const sql = 'UPDATE ticketcategory SET CategoryName = ?, Description = ?, Status = ? WHERE TicketCategoryID = ?';
    db.query(sql, [CategoryName, Description, Status, id], (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ error: 'Error updating category' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category updated successfully' });
    });
});


app.delete('/api/ticket_category_delete/:id', (req, res) => {
    const { id } = req.params;

  const checkSql = 'SELECT Status FROM ticketcategory WHERE TicketCategoryID = ?';
  db.query(checkSql, [id], (err, results) => {
    if (err) {
      console.error('Status check error:', err);
      return res.status(500).json({ error: 'Database error checking category usage' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Category in use and cannot be deleted' });
    }

    const status = results[0].Status;
    if (status === 1) {
      return res.status(403).json({ message: 'Cannot delete active system (status = 1)' });
    }

    const deleteSql = 'DELETE FROM ticketcategory WHERE TicketCategoryID = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ error: 'Error deleting category' });
      }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.status(200).json({ message: 'Category deleted successfully' });
        });
    });
});

app.put('/api/ticket_status/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const now = new Date();
    const firstRespondedTimeValue = now;

    const sql = 'UPDATE ticket SET Status = ?, FirstRespondedTime = ? WHERE TicketID = ?';
    db.query(sql, [status, firstRespondedTimeValue, id], (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ error: 'Error Reject the Ticket' });
        }
        res.status(200).json({ message: 'Ticket rejected successfully' });
    });
});

/* ------------------------------NOTIFY ROLE BASED----------------------------------------------------------------*/

// Helper function to create a notification
const createNotification = async (userId, message, type, ticketLogId = null) => {
    return new Promise((resolve, reject) => {
        const query = `
      INSERT INTO notifications (UserID, Message, Type, TicketLogID)
      VALUES (?, ?, ?, ?)
    `;
        db.query(query, [userId, message, type, ticketLogId], (err, result) => {
            if (err) {
                console.error('Error creating notification:', err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Helper function to get users by roles
const getUsersByRoles = async (roles) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT UserID FROM appuser WHERE Role IN (?)';
        db.query(query, [roles], (err, results) => {
            if (err) {
                console.error('Error fetching users by roles:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Helper function to send notifications to users by roles
const sendNotificationsByRoles = async (roles, message, type, ticketLogId = null) => {
    try {
        const users = await getUsersByRoles(roles);
        const notifications = users.map(user =>
            createNotification(user.UserID, message, type, ticketLogId)
        );
        await Promise.all(notifications);
    } catch (error) {
        console.error('Error sending notifications by roles:', error);
    }
};

// Invite supervisor endpoint
app.post('/api/invite-supervisor', async (req, res) => {
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
});

// Assign supervisor to ticket endpoint
app.put('/api/tickets/:id/assign', (req, res) => {
    const ticketId = req.params.id;
    const { supervisorId, status, priority, assignerId } = req.body; // assignerId is received here

    console.log('Assign endpoint: Received:', { ticketId, supervisorId, status, priority, assignerId }); // Add this line

    if (!ticketId || !supervisorId || !assignerId) { // Assigner ID is required
        return res.status(400).json({ 
            error: 'Ticket ID, Supervisor ID, and Assigner ID are required' 
        });
    }

     db.query('SELECT Status, Priority, SupervisorID FROM ticket WHERE TicketID = ?', [ticketId], async (err, currentTicketResults) => {
        if (err) {
            console.error('Error fetching current ticket details for assignment:', err);
            return res.status(500).json({ error: 'Server error while fetching ticket details' });
        }
        if (currentTicketResults.length === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        const oldStatus = currentTicketResults[0].Status;
        const oldPriority = currentTicketResults[0].Priority;
        const oldSupervisorId = currentTicketResults[0].SupervisorID;

        console.log('Assign endpoint: Old Supervisor ID from DB:', oldSupervisorId); // Add this line

         const updateQuery = `
            UPDATE ticket 
            SET SupervisorID = ?,
                Status = ?,
                Priority = ?,
                LastRespondedTime = NOW(),
                FirstRespondedTime = COALESCE(FirstRespondedTime, NOW())
            WHERE TicketID = ?
        `;

        db.query(updateQuery, [supervisorId, status, priority, ticketId], async (err, result) => {
            if (err) {
                console.error('Error updating ticket during assignment:', err);
                return res.status(500).json({ 
                    error: 'Failed to assign supervisor',
                    message: err.message 
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    error: 'Ticket not found' 
                });
            }

            try {
                // Fetch supervisor names for logging
                const getSupervisorNames = `
                    SELECT
                        (SELECT FullName FROM appuser WHERE UserID = ?) as newSupervisorName,
                        (SELECT FullName FROM appuser WHERE UserID = ?) as oldSupervisorName;
                `;
                const [supervisorNamesQueryResult] = await new Promise((resolve, reject) => {
                    db.query(getSupervisorNames, [supervisorId, oldSupervisorId], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                console.log('Assign endpoint: Raw supervisorNames query result:', supervisorNamesQueryResult);

                let currentSupervisorName = 'unassigned';
                let newSupervisorName = 'Unknown Supervisor';

                if (supervisorNamesQueryResult && supervisorNamesQueryResult.length > 0) {
                    const names = supervisorNamesQueryResult[0];
                    console.log('Assign endpoint: Type of names.oldSupervisorName:', typeof names.oldSupervisorName, 'Value:', names.oldSupervisorName);
                    console.log('Assign endpoint: Type of names.newSupervisorName:', typeof names.newSupervisorName, 'Value:', names.newSupervisorName);

                    if (names.oldSupervisorName !== null && names.oldSupervisorName !== undefined) {
                        currentSupervisorName = names.oldSupervisorName.trim(); // Trim to remove any hidden whitespace
                    }
                    if (names.newSupervisorName !== null && names.newSupervisorName !== undefined) {
                        newSupervisorName = names.newSupervisorName.trim(); // Trim to remove any hidden whitespace
                    }
                }
                // Log the values after the assignment logic
                console.log('Assign endpoint: Names after explicit logic - current:', currentSupervisorName, 'new:', newSupervisorName);

                 if (oldSupervisorId != supervisorId) {
                    await createTicketLog(
                        ticketId,
                        'SUPERVISOR_CHANGE',
                        `Supervisor changed from ${currentSupervisorName} to ${newSupervisorName}`, // Changed to use names
                        assignerId, 
                        oldSupervisorId,
                        supervisorId
                    );
                }

                 if (oldStatus !== status) {
                    await createTicketLog(
                        ticketId,
                        'STATUS_CHANGE',
                        `Status changed from ${oldStatus} to ${status}`,
                        assignerId,  
                        oldStatus,
                        status
                    );
                }

                
                if (oldPriority !== priority) {
                    await createTicketLog(
                        ticketId,
                        'PRIORITY_CHANGE',
                        `Priority changed from ${oldPriority} to ${priority}`,
                        assignerId,  
                        oldPriority,
                        priority
                    );
                }
 
                await createNotification(
                    supervisorId,
                    `You have been assigned to ticket #${ticketId}. Status: ${status}, Priority: ${priority}.`,
                    'SUPERVISOR_ASSIGNED'
                );
                
                res.json({ 
                    message: 'Supervisor assigned and changes logged successfully',
                    status: 'success'
                });

            } catch (logErr) {
                console.error('Error creating logs or sending notifications during assignment:', logErr);
                 res.status(500).json({ 
                    error: 'Assignment successful, but failed to log changes or send notifications',
                    message: logErr.message 
                });
            }
        });
    });
});

// Create new ticket
app.post('/api/tickets', async (req, res) => {
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

    const updateSql = `
      UPDATE asipiyasystem
      SET Status = 1
      WHERE AsipiyaSystemID = ?
    `;
    await db.promise().query(updateSql, [systemID]);

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
});

app.post('/api/upload_evidence', upload_evidence.array('evidenceFiles'), async (req, res) => {
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
      file.path.replace(/\\/g, '/'),
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
});



//UserChat
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"].includes(
    ext
  );
}

app.post("/api/ticketchatUser", upload.single("file"), (req, res) => {
  const { TicketID, Type, Note, UserID, Role } = req.body;
  const filePath = req.file ? req.file.filename : null;

  if (!TicketID || !Note) {
    return res.status(400).json({ error: "TicketID and Note are required." });
  }

  const sql = `
    INSERT INTO ticketchat (TicketID, Type, Note, UserID, Path, Role) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    TicketID,
    Type || "text",
    Note,
    UserID || null,
    filePath,
    Role || "User",
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ error: "Failed to save message." });
    }
    const fileUrl = filePath
      ? `${req.protocol}://${req.get(
          "host"
        )}/uploads/profile_images/${filePath}`
      : null;

    res.status(201).json({
      message: "Message saved",
      chatId: result.insertId,
      file: fileUrl
        ? {
            url: fileUrl,
            isImage: isImageFile(filePath),
            name: req.file.originalname,
          }
        : null,
    });
  });
});

app.get("/api/ticketchatUser/:ticketID", (req, res) => {
  const ticketID = req.params.ticketID;

  if (!ticketID) {
    return res.status(400).json({ error: "TicketID is required." });
  }

  const sql = `
    SELECT TicketChatID AS id, TicketID, Type, Note AS content, 
           UserID, Path, Role, CreatedAt AS timestamp
    FROM ticketchat
    WHERE TicketID = ?
    ORDER BY CreatedAt ASC
  `;

  db.query(sql, [ticketID], (err, results) => {
    if (err) {
      console.error("DB fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch messages." });
    }

    const formatted = results.map((msg) => ({
      id: msg.id,
      ticketid: msg.TicketID,
      type: msg.Type,
      content: msg.content,
      userid: msg.UserID,
      role: msg.Role,
      timestamp: msg.timestamp,
      file: msg.Path
        ? {
            url: `${req.protocol}://${req.get("host")}/uploads/profile_images/${msg.Path}`,
            isImage: isImageFile(msg.Path),
            name: path.basename(msg.Path),
          }
        : null,
    }));

    res.status(200).json(formatted);
  });
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "/uploads/profile_images/", filename);
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).send("File not found.");
    }
  });
});

/*-------------------------------------------------------------------------------------------------------------------------------*/

//Client side

app.get('/api/clients', (req, res) => {
  const sql = "SELECT * FROM client";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching clients", error: err });
    res.json(results);
  });
});

// POST add new client


app.post('/api/clients', async (req, res) => {
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

    res.status(200).json({
      message: 'Client registered successfully',
      client: clientRows[0],
    });
  } catch (err) {
    console.error('Client registration error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});


// Add ticket log routes
app.use('/api/ticket-logs', ticketLogRoutes);

// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

export default db;

// Add attachment endpoint
app.post('/api/tickets/:ticketId/attachments', async (req, res) => {
    const { ticketId } = req.params;
    const { fileName, fileUrl, userId } = req.body;

    try {
        // Create log entry for the attachment
        const logResult = await createTicketLog(
            ticketId,
            'ATTACHMENT',
            `added an attachment: ${fileName}`,
            userId,
            null,
            fileUrl
        );

        // Get ticket creator ID for notification
        const getTicket = "SELECT UserId as ticketUserId FROM ticket WHERE TicketID = ?";
        const [ticketResult] = await new Promise((resolve, reject) => {
            db.query(getTicket, [ticketId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (ticketResult) {
            try {
                await createNotification(
                    ticketResult.ticketUserId,
                    `New attachment added to your ticket #${ticketId}`,
                    'NEW_ATTACHMENT',
                    logResult.insertId
                );
            } catch (error) {
                console.error("Error creating notification:", error);
            }
        }

        res.json({ message: "Attachment added successfully" });
    } catch (error) {
        console.error("Error adding attachment:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Configure multer for attachments
const attachmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', 'attachments');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const attachmentUpload = multer({ 
    storage: attachmentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Add attachment endpoint
app.post('/api/tickets/:ticketId/attachments', attachmentUpload.single('file'), async (req, res) => {
    const { ticketId } = req.params;
    const { userId } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Get user details
    const getUserQuery = `
        SELECT 
            au.FullName as uploaderName,
            t.UserId as ticketUserId,
            t.SupervisorID
        FROM appuser au
        LEFT JOIN ticket t ON t.TicketID = ?
        WHERE au.UserID = ?
    `;

    try {
        const [userResults] = await new Promise((resolve, reject) => {
            db.query(getUserQuery, [ticketId, userId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!userResults) {
            return res.status(404).json({ message: "User or ticket not found" });
        }

        const uploaderName = userResults.uploaderName;
        const filePath = file.path;
        const fileName = file.originalname;
        const fileSize = file.size;
        const fileType = file.mimetype;

        // Create ticket log entry
        const logQuery = `
            INSERT INTO ticketlog 
            (TicketID, DateTime, Type, Description, UserID, Note, NewValue)
            VALUES (?, NOW(), ?, ?, ?, ?, ?)
        `;

        const description = `File "${fileName}" uploaded by ${uploaderName}`;
        const fileDetails = JSON.stringify({
            name: fileName,
            size: fileSize,
            type: fileType,
            path: filePath
        });

        const [logResult] = await new Promise((resolve, reject) => {
            db.query(
                logQuery,
                [ticketId, 'ATTACHMENT', description, userId, `File size: ${Math.round(fileSize/1024)}KB`, fileDetails],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        // Update LastRespondedTime
        await new Promise((resolve, reject) => {
            db.query(
                "UPDATE ticket SET LastRespondedTime = NOW() WHERE TicketID = ?",
                [ticketId],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        // Create notifications
        try {
            // Notify ticket creator if attachment is from someone else
            if (userId !== userResults.ticketUserId) {
                await createNotification(
                    userResults.ticketUserId,
                    `New file "${fileName}" attached to ticket #${ticketId} by ${uploaderName}`,
                    'NEW_ATTACHMENT',
                    logResult.insertId
                );
            }

            // Notify supervisor if exists and attachment is from ticket creator
            if (userResults.SupervisorID && userId === userResults.ticketUserId) {
                await createNotification(
                    userResults.SupervisorID,
                    `Ticket creator attached a file "${fileName}" to ticket #${ticketId}`,
                    'CREATOR_ATTACHMENT',
                    logResult.insertId
                );
            }
        } catch (error) {
            console.error("Error creating notifications:", error);
        }

        res.json({ 
            message: "File uploaded successfully",
            file: {
                name: fileName,
                path: filePath,
                size: fileSize,
                type: fileType
            },
            logId: logResult.insertId
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Assign supervisor to ticket
app.put('/api/tickets/:ticketId/supervisor', async (req, res) => {
    const { ticketId } = req.params;
    const { supervisorId, userId } = req.body;

    // Get current ticket and user details
    const getDetailsQuery = `
        SELECT 
            t.SupervisorID as currentSupervisorId,
            t.UserId as ticketUserId,
            au_new.FullName as newSupervisorName,
            au_old.FullName as currentSupervisorName,
            au_assigner.FullName as assignerName
        FROM ticket t
        LEFT JOIN appuser au_new ON au_new.UserID = ?
        LEFT JOIN appuser au_old ON au_old.UserID = t.SupervisorID
        LEFT JOIN appuser au_assigner ON au_assigner.UserID = ?
        WHERE t.TicketID = ?
    `;

    try {
        const [details] = await new Promise((resolve, reject) => {
            db.query(getDetailsQuery, [supervisorId, userId, ticketId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!details) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Update supervisor
        const updateQuery = "UPDATE ticket SET SupervisorID = ?, LastRespondedTime = NOW() WHERE TicketID = ?";
        
        await new Promise((resolve, reject) => {
            db.query(updateQuery, [supervisorId, ticketId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // Create ticket log entry
        const logQuery = `
            INSERT INTO ticketlog 
            (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue, Note)
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
        `;

        let description;
        if (!details.currentSupervisorId) {
            description = `Supervisor assigned: ${details.newSupervisorName}`;
        } else {
            description = `Supervisor changed from ${details.currentSupervisorName} to ${details.newSupervisorName}`;
        }

        const note = `Updated by ${details.assignerName}`;

        const [logResult] = await new Promise((resolve, reject) => {
            db.query(
                logQuery,
                [
                    ticketId, 
                    'SUPERVISOR_CHANGE', 
                    description, 
                    userId,
                    details.currentSupervisorId,
                    supervisorId,
                    note
                ],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        // Create notifications
        try {
            // Notify new supervisor
            await createNotification(
                supervisorId,
                `You have been assigned as supervisor for ticket #${ticketId} by ${details.assignerName}`,
                'SUPERVISOR_ASSIGNED',
                logResult.insertId
            );

            // Notify ticket creator
            await createNotification(
                details.ticketUserId,
                `${details.newSupervisorName} has been assigned as supervisor for your ticket #${ticketId}`,
                'SUPERVISOR_UPDATED',
                logResult.insertId
            );

            // Notify old supervisor if exists
            if (details.currentSupervisorId && details.currentSupervisorId !== supervisorId) {
                await createNotification(
                    details.currentSupervisorId,
                    `You have been unassigned from ticket #${ticketId} by ${details.assignerName}`,
                    'SUPERVISOR_UNASSIGNED',
                    logResult.insertId
                );
            }
        } catch (error) {
            console.error("Error creating notifications:", error);
        }

        res.json({ 
            message: "Supervisor assigned successfully",
            logId: logResult.insertId
        });
    } catch (error) {
        console.error("Error assigning supervisor:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update ticket due date
app.put('/api/tickets/:ticketId/due-date', async (req, res) => {
  const { ticketId } = req.params;
  const { dueDate, userId } = req.body; // <-- userId must be sent from frontend

  db.query('SELECT DueDate FROM ticket WHERE TicketID = ?', [ticketId], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ message: 'Error' });
    const oldDueDate = results[0].DueDate;

    db.query('UPDATE ticket SET DueDate = ? WHERE TicketID = ?', [dueDate, ticketId], (err2) => {
      if (err2) return res.status(500).json({ message: 'Error updating due date' });

      const desc = `Due date changed from ${oldDueDate} to ${dueDate}`;
      db.query(
        'INSERT INTO ticketlog (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue) VALUES (?, NOW(), ?, ?, ?, ?, ?)',
        [ticketId, 'DUE_DATE_CHANGE', desc, userId, oldDueDate, dueDate],
        () => {}
      );
      res.json({ message: 'Due date updated and logged' });
    });
  });
});

// Update ticket resolution
app.put('/api/tickets/:ticketId/resolution', async (req, res) => {
  const { ticketId } = req.params;
  const { resolution, userId } = req.body; // <-- userId must be sent from frontend

  db.query('SELECT Resolution FROM ticket WHERE TicketID = ?', [ticketId], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ message: 'Error' });
    const oldResolution = results[0].Resolution;

    db.query('UPDATE ticket SET Resolution = ? WHERE TicketID = ?', [resolution, ticketId], (err2) => {
      if (err2) return res.status(500).json({ message: 'Error updating resolution' });

      const desc = `Resolution changed from "${oldResolution || ''}" to "${resolution || ''}"`;
      db.query(
        'INSERT INTO ticketlog (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue) VALUES (?, NOW(), ?, ?, ?, ?, ?)',
        [ticketId, 'RESOLUTION_CHANGE', desc, userId, oldResolution, resolution],
        () => {}
      );
      res.json({ message: 'Resolution updated and logged' });
    });
  });
});


// API endpoint to fetch companies
app.get('/api/companies', (req, res) => {
  const query = `
    SELECT DISTINCT c.CompanyName
    FROM client c
    JOIN appuser au ON c.UserID = au.UserID
    WHERE c.CompanyName IS NOT NULL
    ORDER BY c.CompanyName
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching companies:', err);
      return res.status(500).json({ error: 'Failed to fetch companies' });
    }
    res.json(results);
  });
});

app.get('/api/tickets/:ticketId/comments', (req, res) => {
  const { ticketId } = req.params;
  const sql = `
    SELECT c.CommentID, c.CommentText, c.CreatedAt, c.Mentions, u.FullName
    FROM comments c
    JOIN appuser u ON c.UserID = u.UserID
    WHERE c.TicketID = ?
    ORDER BY c.CreatedAt ASC
  `;
  db.query(sql, [ticketId], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ message: 'Failed to fetch comments' });
    }
    res.json(results);
  });
});

app.get('/api/mentionable-users', (req, res) => {
  db.query(
    "SELECT UserID, FullName, Role FROM appuser WHERE Role IN ('Admin', 'Supervisor', 'Developer')",
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch users' });
      res.json(results);
    }
  );
});

// API endpoint to fetch the last five ticket logs
app.get('/api/ticket-logs/recent', (req, res) => {
    const query = `
        SELECT 
            TicketID,
            DateTime,
            Type,
            Description
        FROM ticketlog
        ORDER BY DateTime DESC
        LIMIT 6
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching recent ticket logs:', err);
            return res.status(500).json({ error: 'Failed to fetch recent ticket logs' });
        }
        res.json(results);
    });
});

 