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

//evidence uploads
app.use("/uploads", express.static("uploads"));
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

    // Hash the password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Insert the user
    const query = 'INSERT INTO appuser (FullName, Email, Password, Role, Phone) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [FullName, Email, hashedPassword, Role, Phone], async (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Error registering user');
        } else {
            // Send notification to admins about new user registration
            try {
                await sendNotificationsByRoles(
                    ['Admin'],
                    `New ${Role} registered: ${FullName} (${Email})`,
                    'NEW_USER_REGISTRATION'
                );
            } catch (error) {
                console.error('Error sending registration notifications:', error);
            }
            res.status(200).send('User registered successfully');
        }
    });
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

// Add a new chat message for a ticket
app.post('/ticketchat', (req, res) => {
    const { TicketID, Type, Note, UserCustomerID, UserID, Path } = req.body;

    // Basic validation
    if (!TicketID || !Note) {
        return res.status(400).json({ error: 'TicketID and Note are required.' });
    }

    const sql = `INSERT INTO ticketchat (TicketID, Type, Note, UserCustomerID, UserID, Path)
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [TicketID, Type || null, Note, UserCustomerID || null, UserID || null, Path || null], (err, result) => {
        if (err) {
            console.error('Error adding chat message:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Chat message added', chatId: result.insertId });
    });
});

// ✅ GET messages for a specific ticket
app.get("/messages/:ticketId", (req, res) => {
  const ticketId = req.params.ticketId;

  db.query(
    `SELECT TicketChatID as id, TicketID, Type, Note as content,
      UserCustomerID, UserID, Path, Role, CreatedAt as timestamp
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
        usercustomerid: r.UserCustomerID,
        userid: r.UserID,
        role: r.Role,
        timestamp: r.timestamp,
        file: r.Path
          ? {
              name: path.basename(r.Path),
              url: `http://localhost:${PORT}/uploads/${r.Path}`,
            }
          : null,
        status: "delivered",
      }));

      res.json(formatted);
    }
  );
});


// POST a new chat message without file upload
app.post("/ticketchat", async (req, res) => {
  try {
    const { TicketID, Note, Type, UserCustomerID, UserID, Role } = req.body;

    // Insert only text messages
    const [result] = await db.execute(
      `INSERT INTO ticketchat (TicketID, Type, Note, UserCustomerID, UserID, Path, Role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [TicketID, Type, Note, UserCustomerID, UserID, null, Role || "customer"]
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
  const { supervisorId } = req.query;

  if (!supervisorId) {
    return res.status(400).json({ error: "Supervisor ID is required" });
  }

  const sql = "SELECT * FROM ticket WHERE SupervisorID = ?";
  db.query(sql, [supervisorId], (err, results) => {
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

  const sql = `
    UPDATE ticket 
    SET Status = ?, DueDate = ?, Resolution = ? 
    WHERE TicketID = ?
  `;
  db.query(sql, [status, dueDate, resolution, id], (err, result) => {
    if (err) {
      console.error("Failed to update ticket:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: "Ticket updated successfully" });
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


app.put('/api/tickets/:ticketId/status', async (req, res) => {
  const ticketId = req.params.ticketId;
  const { status, userId, supervisorName } = req.body;

  try {
    // First get the ticket details to know the user who created it and current status
    const getTicket = "SELECT t.UserId, t.Status, t.SupervisorID, u.FullName as SupervisorName FROM ticket t LEFT JOIN appuser u ON t.SupervisorID = u.UserID WHERE t.TicketID = ?";
    db.query(getTicket, [ticketId], async (err, results) => {
      if (err) {
        console.error("Error fetching ticket:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const ticketUserId = results[0].UserId;
      const oldStatus = results[0].Status;
      const supervisorId = results[0].SupervisorID;
      const supervisorFullName = results[0].SupervisorName;

      // Update the ticket status
      const updateQuery = "UPDATE ticket SET Status = ?, LastRespondedTime = NOW() WHERE TicketID = ?";
      db.query(updateQuery, [status, ticketId], async (err, result) => {
        if (err) {
          console.error("Error updating ticket status:", err);
          return res.status(500).json({ message: "Server error" });
        }

        // Create a ticket log entry with old and new values
        const logQuery = `
          INSERT INTO ticketlog (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue)
          VALUES (?, NOW(), 'STATUS_CHANGE', ?, ?, ?, ?)
        `;
        db.query(logQuery, [
          ticketId, 
          `Status changed from ${oldStatus} to ${status}`, 
          userId,
          oldStatus,
          status
        ], async (err, logResult) => {
          if (err) {
            console.error("Error creating ticket log:", err);
          } else {
            try {
              // Create first notification for the ticket creator about supervisor assignment
              await createNotification(
                ticketUserId,
                `Your ticket #${ticketId} has been assigned to supervisor ${supervisorFullName}. They will be handling your ticket.`,
                'SUPERVISOR_ASSIGNED',
                logResult.insertId
              );

              // Create second notification for the ticket creator about status change
              await createNotification(
                ticketUserId,
                `Your ticket #${ticketId} status has been updated from ${oldStatus} to ${status}`,
                'STATUS_UPDATE',
                logResult.insertId
              );

              // Notify supervisor about the assignment
              if (supervisorId) {
                await createNotification(
                  supervisorId,
                  `You have been assigned to handle ticket #${ticketId}. The ticket status has been changed from ${oldStatus} to ${status}`,
                  'TICKET_ASSIGNED',
                  logResult.insertId
                );
              }

            } catch (error) {
              console.error("Error creating notifications:", error);
            }
          }
        });

        res.json({ message: "Ticket status updated successfully" });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
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
    const { type } = req.query;

    let baseQuery = `
        SELECT 
            t.TicketID,
            u.FullName AS UserName,
            t.Description,
            t.Status,
            t.Priority,
            t.DateTime
        FROM ticket t
        LEFT JOIN appuser u ON t.UserId = u.UserID
    `;

    let whereClause = '';
    let orderClause = 'ORDER BY t.DateTime DESC';
    
    switch (type) {
        case 'pending':
            whereClause = "WHERE t.Status = 'Pending'";
            break;
        case 'open':
            whereClause = "WHERE t.Status IN ('Open', 'In Progress') AND t.Status != 'Rejected'";
            break;
        case 'today':
            whereClause = "WHERE DATE(t.DateTime) = CURDATE()";
            break;
        case 'high-priority':
            whereClause = "WHERE t.Status != 'Rejected'";
            orderClause = "ORDER BY FIELD(t.Priority, 'High', 'Medium', 'Low'), t.DateTime DESC";
            break;
        case 'resolved':
            whereClause = "WHERE t.Status = 'Resolved'";
            break;
    }

    const query = baseQuery + (whereClause ? ' ' + whereClause : '') + ' ' + orderClause;

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
        WHERE UserID = ?
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

/*----------------------------------------------------------------------------------*/

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
    SELECT t.TicketID, s.SystemName AS SystemName, tc.CategoryName AS CategoryName, u.FullName AS UserName, t.Status
    FROM ticket t
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID
    LEFT JOIN appuser u ON t.UserId = u.UserID ORDER BY TicketID ASC
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
  const { systemName, description } = req.body;

  const sql = 'INSERT INTO asipiyasystem (SystemName, Description) VALUES (?, ?)';
  db.query(sql, [systemName, description], async (err) => {
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
        WHEN COUNT(t.TicketID) > 0 THEN 'Active'
        ELSE 'Inactive'
      END AS Status
    FROM asipiyasystem s
    LEFT JOIN ticket t
      ON s.AsipiyaSystemID = t.AsipiyaSystemID
    GROUP BY
      s.AsipiyaSystemID, s.SystemName, s.Description
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
  const { systemName, description } = req.body;

  const sql = 'UPDATE asipiyasystem SET SystemName = ?, Description = ? WHERE AsipiyaSystemID = ?';
  db.query(sql, [systemName, description, id], (err, result) => {
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

  const checkSql = 'SELECT * FROM ticket WHERE AsipiyaSystemID = ?'; // if your ticket table uses this FK
  db.query(checkSql, [id], (err, results) => {
    if (err) {
      console.error('Check usage error:', err);
      return res.status(500).json({ error: 'Database error checking system usage' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'System is in use and cannot be deleted' });
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
  const { CategoryName, Description } = req.body;

  const sql = 'INSERT INTO ticketcategory (CategoryName, Description) VALUES (?, ?)';
  db.query(sql, [CategoryName, Description], async (err, result) => {
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
        WHEN COUNT(t.TicketID) > 0 THEN 'Active'
        ELSE 'Inactive'
      END AS Status
    FROM ticketcategory tc
    LEFT JOIN ticket t
      ON tc.TicketCategoryID = t.TicketCategoryID
    GROUP BY
      tc.TicketCategoryID, tc.CategoryName, tc.Description
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
  const { CategoryName, Description } = req.body;

  const sql = 'UPDATE ticketcategory SET CategoryName = ?, Description = ? WHERE TicketCategoryID = ?';
  db.query(sql, [CategoryName, Description, id], (err, result) => {
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

  const checkSql = 'SELECT * FROM ticket WHERE TicketCategoryID = ?';
  db.query(checkSql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error checking category usage' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Category in use and cannot be deleted' });
    }

    const deleteSql = 'DELETE FROM ticketcategory WHERE TicketCategoryID = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
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

  const sql = 'UPDATE ticket SET Status = ? WHERE TicketID = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Error Reject the Ticket' });
    }
    res.status(200).json({ message: 'Ticket rejected successfully' });
  });
});

/* ----------------------------------------------------------------------------------------------*/

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
app.put('/api/tickets/:id/assign', async (req, res) => {
  const ticketId = req.params.id;
  const { status, priority, supervisorId } = req.body;

  // First get the ticket details to know the user who created it
  const getTicketQuery = 'SELECT UserId FROM ticket WHERE TicketID = ?';
  db.query(getTicketQuery, [ticketId], async (err, ticketResults) => {
    if (err) {
      console.error('Error fetching ticket:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (ticketResults.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const userId = ticketResults[0].UserId;

    const sql = `UPDATE ticket SET Status = ?, Priority = ?, SupervisorID = ? WHERE TicketID = ?`;

    db.query(sql, [status, priority, supervisorId, ticketId], async (err, result) => {
      if (err) {
        console.error('Error assigning supervisor:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      try {
        // Notify the assigned supervisor
        await createNotification(
          supervisorId,
          `You have been assigned to ticket #${ticketId}`,
          'SUPERVISOR_ASSIGNED'
        );

        // Notify the ticket creator
        await createNotification(
          userId,
          `A supervisor has been assigned to your ticket #${ticketId}`,
          'TICKET_UPDATED'
        );

        // Notify admins
        await sendNotificationsByRoles(
          ['Admin'],
          `Supervisor assigned to ticket #${ticketId}`,
          'SUPERVISOR_ASSIGNMENT'
        );
      } catch (error) {
        console.error('Error sending supervisor assignment notifications:', error);
      }

      res.json({ message: 'Supervisor assigned successfully' });
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
    
    // Get category ID
    const getCategoryId = "SELECT TicketCategoryID FROM ticketcategory WHERE CategoryName = ?";
    const [categoryResult] = await db.promise().query(getCategoryId, [ticketCategory]);
    
    if (categoryResult.length === 0) {
      return res.status(400).json({ message: "Invalid ticket category" });
    }

    // Insert ticket
    const insertTicket = `
      INSERT INTO ticket (UserId, AsipiyaSystemID, TicketCategoryID, Description, Status, Priority)
      VALUES (?, ?, ?, ?, 'Pending', 'Medium')
    `;
    
    const [result] = await db.promise().query(insertTicket, [
      userId,
      systemResult[0].AsipiyaSystemID,
      categoryResult[0].TicketCategoryID,
      description
    ]);

    // Send notification to admins about new ticket
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

// Upload evidence for a ticket
app.post('/api/upload_evidence', upload_evidence.array('evidenceFiles'), async (req, res) => {
  const { ticketId, description } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  if (!ticketId) {
    return res.status(400).json({ message: 'Ticket ID is required' });
  }

  try {
    const values = req.files.map(file => [ticketId, file.path, description]);
    
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

// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

export default db;