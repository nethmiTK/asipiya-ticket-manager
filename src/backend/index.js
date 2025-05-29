import mysql from 'mysql2';
import express from 'express';
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

// Get all members
app.get('/supervisor', (req, res) => {
    const query = 'SELECT id, Name AS name, Email AS email, Role AS role FROM supervisors';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ message: 'Server error' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Add a new member
app.post('/add-member', (req, res) => {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    const query = 'INSERT INTO supervisors (Name, Email, Role) VALUES (?, ?, ?)';
    db.query(query, [name, email, role], (err, result) => {
        if (err) {
            console.error('Error adding user:', err);
            res.status(500).json({ message: 'Error adding user' });
        } else {
            res.status(201).json({ message: 'User added successfully', userId: result.insertId });
        }
    });
});

// Get user by member
app.get('/supervisor/:id', (req, res) => {
    const query = 'SELECT * FROM supervisors WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results[0]);
    });
});

// Update member
app.put('/supervisor/:id', (req, res) => {
    const { name, email, role } = req.body;
    const query = 'UPDATE supervisors SET Name = ?, Email = ?, Role = ? WHERE id = ?';
    db.query(query, [name, email, role, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.sendStatus(200);
    });
});

// Delete member
app.delete('/supervisor/:id', (req, res) => {
    const query = 'DELETE FROM supervisors WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.sendStatus(200);
    });
});

// API endpoint to fetch tickets (duplicate, keeping for now as it exists in original)
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