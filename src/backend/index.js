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

// Login endpoint
app.post('/login', (req, res) => {
    const { Email, Password } = req.body;
    const query = 'SELECT * FROM appuser WHERE Email = ? AND Password = ?';
    db.query(query, [Email, Password], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).json({ message: 'Error during login' });
        } else if (results.length > 0) {
            const user = results[0];
            res.status(200).json({
                message: 'Login successful',
                role: user.Role.toLowerCase(),
                UserID: user.UserID
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
    db.query(checkQuery, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const insertQuery = 'INSERT INTO appuser (Email, Role) VALUES (?, ?)';
        db.query(insertQuery, [email, role], async (err) => {
            if (err) return res.status(500).json({ message: 'Error inserting user' });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'You are invited to join the App',
                html: `
                    <p>Hello,</p>
                    <p>You have been invited to join our app as a <strong>${role}</strong>.</p>
                    <p>Please set your password by clicking the link below:</p>
                    <a href="${process.env.APP_URL}">Set your password</a>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
                res.json({ message: 'Invitation sent successfully' });
            } catch (mailErr) {
                console.error(mailErr);
                res.status(500).json({ message: 'Failed to send email' });
            }
        });
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


/*----------------------------------------------------------------------------------*/

// Get admin profile endpoint
app.get('/api/admin/profile/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT UserID, FullName, Email, Phone FROM appuser WHERE UserID = ? AND Role = "admin"';
    
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

    // First verify this is an admin
    const verifyQuery = 'SELECT * FROM appuser WHERE UserID = ? AND Role = "admin"';
    
    db.query(verifyQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error verifying admin:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const admin = results[0];

        // If password change is requested, verify current password
        if (CurrentPassword && NewPassword) {
            if (CurrentPassword !== admin.Password) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Update with new password
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

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

export default db;
