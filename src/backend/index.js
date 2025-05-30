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
app.post('/register', (req, res) => {
    const { FullName, Email, Password, Role, Phone } = req.body;

    bcrypt.hash(Password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Error registering user: Password hashing failed');
        }

        const query = 'INSERT INTO appuser (FullName, Email, Password, Role, Phone) VALUES (?, ?, ?, ?, ?)';
        
        db.query(query, [FullName, Email, hashedPassword, Role, Phone], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
              
                if (err.code === 'ER_DUP_ENTRY') { 
                    return res.status(409).send('User with this email already exists.');
                }
                res.status(500).send('Error registering user');
            } else {
                res.status(200).send('User registered successfully');
            }
        });
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
                        Role: user.Role.toLowerCase(),
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

// Get admin profile update  endpoint 
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
    const { CategoryName, Description } = req.body;

    if (!CategoryName) {
        return res.status(400).json({ error: 'Category name is required.' });
    }

    const sql = 'INSERT INTO ticketcategory (CategoryName, Description) VALUES (?, ?)';
    db.query(sql, [CategoryName, Description], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to add ticket category" });
        }
        res.status(200).json({ 
            message: 'Ticket category added successfully',
            category: {
                TicketCategoryID: result.insertId,
                CategoryName,
                Description
            }
        });
    });
});

//View Categories
app.get('/ticket_category', (req, res) => {
    const sql = 'SELECT TicketCategoryID, CategoryName, Description FROM ticketcategory ORDER BY TicketCategoryID DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ message: 'Error fetching categories' });
        }
        res.status(200).json(results);
    });
});


//View ticket details
app.get('/api/ticket_view/:id', (req, res) => {
  const ticketId = req.params.id;
  const query = `SELECT t.TicketID, u.FullName AS UserName, s.SystemName, c.CategoryName, t.Description, t.DateTime,
  t.Status, t.Priority, t.FirstRespondedTime, t.LastRespondedTime, t.TicketDuration, t.UserNote
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

// Get user profile endpoint (general user) 
app.get('/api/user/profile/:id', (req, res) => {
    const userId = req.params.id;
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

// Update user profile endpoint (general user)
app.put('/api/user/profile/:id', (req, res) => {
    const userId = req.params.id;
    const { FullName, Email, Phone, CurrentPassword, NewPassword } = req.body;

    // Select the hashed password from the DB for comparison
    const verifyQuery = 'SELECT Password AS HashedPassword FROM appuser WHERE UserID = ?';

    db.query(verifyQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error verifying user for profile update:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUser = results[0]; 

        const handleProfileUpdate = async () => {
            let updateQuery;
            let queryParams;

            if (CurrentPassword && NewPassword) {
                try {
                    // Compare provided current password with the stored hashed password
                    const isCurrentPasswordMatch = await bcrypt.compare(CurrentPassword, currentUser.HashedPassword);
                    if (!isCurrentPasswordMatch) {
                        return res.status(400).json({ message: 'Current password is incorrect' });
                    }

                    // Hash the new password before updating
                    const hashedNewPassword = await bcrypt.hash(NewPassword, saltRounds);
                    updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ?, Password = ? WHERE UserID = ?';
                    queryParams = [FullName, Email, Phone, hashedNewPassword, userId];
                } catch (hashErr) {
                    console.error('Error hashing new password:', hashErr);
                    return res.status(500).json({ message: 'Error processing new password' });
                }
            } else {
                // User is NOT changing password, just updating other details
                updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ? WHERE UserID = ?';
                queryParams = [FullName, Email, Phone, userId];
            }

            db.query(updateQuery, queryParams, (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Error updating user profile:', updateErr);
                    res.status(500).json({ message: 'Error updating profile' });
                } else {
                    if (updateResult.affectedRows === 0) {
                        res.status(200).json({ message: 'No changes were made to the profile.' });
                    } else {
                        res.status(200).json({ message: 'Profile updated successfully' });
                    }
                }
            });
        };

        handleProfileUpdate();
    });
});

// PROFILE IMAGE UPLOAD ENDPOINT
app.post('/api/user/profile/upload/:id', upload.single('profileImage'), (req, res) => {
    const userId = req.params.id;
    
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Path relative to the 'uploads' directory, to be stored in DB
    const imagePath = `profile_images/${req.file.filename}`; 

    const query = 'UPDATE appuser SET ProfileImagePath = ? WHERE UserID = ?';
    db.query(query, [imagePath, userId], (err, result) => {
        if (err) {
            console.error('Error updating profile image path in DB:', err);
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting uploaded file after DB failure:', unlinkErr);
            });
            return res.status(500).json({ message: 'Error saving image path to database.' });
        }
        res.status(200).json({ 
            message: 'Profile image uploaded successfully', 
            imagePath: imagePath 
        });
    });
});

// DELETE PROFILE IMAGE ENDPOINT
app.delete('/api/user/profile/image/:id', (req, res) => {
    const userId = req.params.id;

    const getImagePathQuery = 'SELECT ProfileImagePath FROM appuser WHERE UserID = ?';
    db.query(getImagePathQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching image path for deletion:', err);
            return res.status(500).json({ message: 'Server error retrieving image path.' });
        }

        if (results.length === 0 || !results[0].ProfileImagePath) {
            return res.status(404).json({ message: 'User or existing profile image not found.' });
        }

        const oldImagePath = results[0].ProfileImagePath;
        const fullPathToDelete = path.join(__dirname, 'uploads', oldImagePath); 

        // Update DB first to clear the path
        const updateDbQuery = 'UPDATE appuser SET ProfileImagePath = NULL WHERE UserID = ?';
        db.query(updateDbQuery, [userId], (dbErr, dbResult) => {
            if (dbErr) {
                console.error('Error clearing profile image path in DB:', dbErr);
                return res.status(500).json({ message: 'Error clearing image path in database.' });
            }

            // Attempt to delete the file from the file system
            fs.unlink(fullPathToDelete, (unlinkErr) => {
                if (unlinkErr) {
                    console.warn(`Warning: Could not delete old file at ${fullPathToDelete}:`, unlinkErr);
                    return res.status(200).json({ message: 'Profile image removed from DB, but file could not be deleted from server.', imagePath: null });
                }
                res.status(200).json({ message: 'Profile image removed successfully!', imagePath: null });
            });
        });
    });
});

/*----------------------------------------------------------------------------------*/

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

// API endpoint to fetch ticket counts
app.get('/api/tickets/counts', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) AS count FROM ticket',
        open: "SELECT COUNT(*) AS count FROM ticket WHERE Status = 'Open'",
        today: "SELECT COUNT(*) AS count FROM ticket WHERE DATE(DateTime) = CURDATE()",
        highPriority: "SELECT COUNT(*) AS count FROM ticket WHERE Priority = 'High'",
        closed: "SELECT COUNT(*) AS count FROM ticket WHERE Status = 'Closed'"
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
            t.UserNote
        FROM ticket t
        LEFT JOIN appuser u ON t.UserId = u.UserID
    `;

    let whereClause = '';
    switch (type) {
        case 'open':
            whereClause = "WHERE t.Status = 'Open'";
            break;
        case 'today':
            whereClause = "WHERE DATE(t.DateTime) = CURDATE()";
            break;
        case 'high-priority':
            whereClause = "WHERE t.Priority = 'High'";
            break;
        case 'closed':
            whereClause = "WHERE t.Status = 'Closed'";
            break;
    }

    const query = baseQuery + (whereClause ? ' ' + whereClause : '');

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
        SELECT TicketID, Description, Status, Priority, DateTime
        FROM ticket
        ORDER BY DateTime DESC
        LIMIT 5;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching recent activities:', err);
            res.status(500).json({ error: 'Failed to fetch recent activities' });
            return;
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

// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

export default db;