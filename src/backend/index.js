import mysql from 'mysql';
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

// Login endpoint
app.post('/login', (req, res) => {
    const { Email, Password } = req.body;
    const query = 'SELECT * FROM appuser WHERE Email = ? AND Password = ?';
    db.query(query, [Email, Password], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).send('Error during login');
        } else if (results.length > 0) {
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
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



/*----------------------------------------------------------------------------------*/

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

export default db;
