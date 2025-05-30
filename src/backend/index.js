import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2';
import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';

// Create a connection to the database
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

// Register endpoint
app.post('/register', (req, res) => {
    const { FullName, Email, Password, Role, Phone } = req.body;
    const query = 'INSERT INTO appuser (FullName, Email, Password, Role, Phone) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [FullName, Email, Password, Role, Phone], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Error registering user');
        } else {
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

// Login endpoint - MODIFIED to return the full user object
app.post('/login', (req, res) => {
    const { Email, Password } = req.body;
    // Select all necessary fields for the user profile
    const query = 'SELECT UserID, FullName, Email, Phone, Role FROM appuser WHERE Email = ? AND Password = ?';
    db.query(query, [Email, Password], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).json({ message: 'Error during login' });
        } else if (results.length > 0) {
            const user = results[0]; // This is the full user object from the database
            res.status(200).json({
                message: 'Login successful',
                user: {
                    UserID: user.UserID,
                    FullName: user.FullName,
                    Email: user.Email,
                    Phone: user.Phone,
                    Role: user.Role.toLowerCase() // Ensure role is lowercase for consistency
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
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

    if (!email || !role || !isValidEmail(email)) {
        return res.status(400).json({ message: 'Valid email and role are required' });
    }
    const checkQuery = 'SELECT * FROM appuser WHERE Email = ?';
    db.query(checkQuery, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });

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



/*---------------------------------------------------------------------------------------*/

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

//Add systems
app.post('/system_registration', (req, res) => {
    const { systemName, description } = req.body;

    if (!systemName || !description) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = 'INSERT INTO asipiyasystem (SystemName, Description) VALUES (?, ?)';
    db.query(sql, [systemName, description], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json({ message: 'System registered successfully' });
    });
});

//View systems
app.get('/system_registration', (req, res) => {
    const sql = 'SELECT * FROM asipiyasystem';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching systems:', err);
            return res.status(500).json({ message: 'Error fetching systems' });
        }
        res.status(200).json(results);
    });
});

//Adding Category
app.post('/ticket_category', (req, res) => {
    const { categoryName, categoryDescription } = req.body;

    if (!categoryName || !categoryDescription) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = 'INSERT INTO ticketcategory (CategoryName, Description) VALUES (?, ?)';
    db.query(sql, [categoryName, categoryDescription], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json({ message: 'System registered successfully' });
    });
});

//View Categories
app.get('/ticket_category', (req, res) => {
    const sql = 'SELECT * FROM ticketcategory';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching systems:', err);
            return res.status(500).json({ message: 'Error fetching systems' });
        }
        res.status(200).json(results);
    });
});


//View ticket details
app.get('/api/ticket_view/:id', (req, res) => {
    const ticketId = req.params.id;
    const query = `SELECT t.TicketID, u.FullName AS UserName, u.Email AS UserEmail, s.SystemName, c.CategoryName,t.Description,t.DateTime,
  t.Status,t.Priority,t.FirstRespondedTime,t.LastRespondedTime,t.TicketDuration,t.UserNote
  FROM 
    ticket t
  JOIN 
    appuser u ON t.UserId = u.UserID
  JOIN 
    asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
  JOIN 
    ticketcategory c ON t.TicketCategoryID = c.TicketCategoryID
  WHERE 
    t.TicketID = ?`;

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

/*----------------------------------------------------------------------------------*/

// Get admin profile endpoint 
app.get('/api/admin/profile/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT UserID, FullName, Email, Phone, Role FROM appuser WHERE UserID = ? AND Role = "admin"'; // Added Role to selection

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching admin profile:', err);
            res.status(500).json({ message: 'Server error' });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Admin not found' });
        } else {
            res.status(200).json(results[0]);
        }
    });
});

// Update admin profile endpoint 
app.put('/api/admin/profile/:id', (req, res) => {
    const userId = req.params.id;
    const { FullName, Email, Phone, CurrentPassword, NewPassword } = req.body;

    const verifyQuery = 'SELECT Password FROM appuser WHERE UserID = ? AND Role = "admin"'; // Check for admin role

    db.query(verifyQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error verifying admin:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const admin = results[0];

        if (CurrentPassword && NewPassword) {
            if (CurrentPassword !== admin.Password) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            const updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ?, Password = ? WHERE UserID = ? AND Role = "admin"';
            db.query(updateQuery, [FullName, Email, Phone, NewPassword, userId], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Error updating admin profile:', updateErr);
                    res.status(500).json({ message: 'Error updating profile' });
                } else {
                    res.status(200).json({ message: 'Profile updated successfully' });
                }
            });
        } else {
            // Update without password change
            const updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ? WHERE UserID = ? AND Role = "admin"';
            db.query(updateQuery, [FullName, Email, Phone, userId], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Error updating admin profile:', updateErr);
                    res.status(500).json({ message: 'Error updating profile' });
                } else {
                    res.status(200).json({ message: 'Profile updated successfully' });
                }
            });
        }
    });
});


//  Get user profile endpoint (general user)
app.get('/api/user/profile/:id', (req, res) => {
    const userId = req.params.id;
    // Select all fields that the frontend profile form expects
    const query = 'SELECT UserID, FullName, Email, Phone, Role FROM appuser WHERE UserID = ?';

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

// Update user profile endpoint (general user)
app.put('/api/user/profile/:id', (req, res) => {
    const userId = req.params.id;
    const { FullName, Email, Phone, CurrentPassword, NewPassword } = req.body;

    const verifyQuery = 'SELECT Password FROM appuser WHERE UserID = ?';

    db.query(verifyQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error verifying user for profile update:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUser = results[0];

        let updateQuery;
        let queryParams;

        if (CurrentPassword && NewPassword) {
            if (CurrentPassword !== currentUser.Password) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ?, Password = ? WHERE UserID = ?';
            queryParams = [FullName, Email, Phone, NewPassword, userId];
        } else {
            updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ? WHERE UserID = ?';
            queryParams = [FullName, Email, Phone, userId];
        }

        db.query(updateQuery, queryParams, (updateErr, updateResult) => {
            if (updateErr) {
                console.error('Error updating user profile:', updateErr);
                res.status(500).json({ message: 'Error updating profile' });
            } else if (updateResult.affectedRows === 0) {
                res.status(404).json({ message: 'User not found or no changes made' });
            } else {
                res.status(200).json({ message: 'Profile updated successfully' });
            }
        });
    });
});


//Create ticket 
app.get("/system_registration", (req, res) => {
    const sql = "SELECT SystemName FROM asipiyasystem";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching systems:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

app.get("/ticket_category", (req, res) => {
    const sql = "SELECT CategoryName FROM ticketcategory";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching systems:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

export default db;