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



// Get admin  profile endpoint 
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

// API endpoint to fetch ticket counts
app.get('/api/tickets/counts', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) AS count FROM ticket',
        open: "SELECT COUNT(*) AS count FROM ticket WHERE Status = 'open'",
        today: "SELECT COUNT(*) AS count FROM ticket WHERE DATE(DateTime) = CURDATE()",
        highPriority: "SELECT COUNT(*) AS count FROM ticket WHERE Priority = 'High'",
        closed: "SELECT COUNT(*) AS count FROM ticket WHERE Status = 'close'"
    };

    const results = {};
    let completed = 0;

    Object.keys(queries).forEach((key) => {
        db.query(queries[key], (err, result) => {
            if (err) {
                console.error(`Error fetching ${key} count:`, err);
                res.status(500).json({ error: 'Failed to fetch ticket counts' });
                return;
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

    let query;
    switch (type) {
        case 'open':
            query = "SELECT * FROM ticket WHERE Status = 'open'";
            break;
        case 'today':
            query = "SELECT * FROM ticket WHERE DATE(DateTime) = CURDATE()";
            break;
        case 'high-priority':
            query = "SELECT * FROM ticket WHERE Priority = 'High'";
            break;
        case 'closed':
            query = "SELECT * FROM ticket WHERE Status = 'close'";
            break;
        default:
            query = 'SELECT * FROM ticket';
    }

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

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

export default db;