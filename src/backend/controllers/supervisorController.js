// controllers/supervisorController.js
import db from '../config/db.js';

// Get all supervisors (excluding 'user' role)
const getAllSupervisors = (req, res) => {
    const query = "SELECT UserID, FullName, Email, Role FROM appuser WHERE Role NOT IN ('user', 'User')";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching supervisors:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json(results);
    });
};

// Get supervisor by ID
const getSupervisorById = (req, res) => {
    const query = "SELECT UserID, FullName, Email, Role FROM appuser WHERE UserID = ?";
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching supervisor:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Supervisor not found' });
        }
        res.status(200).json(results[0]);
    });
};

// Update supervisor by ID
const updateSupervisorById = (req, res) => {
    const { FullName, Email, Role } = req.body;

    const allowedRoles = ['Supervisor', 'Manager', 'Developer'];
    if (Role && !allowedRoles.includes(Role)) {
        return res.status(400).json({ message: `Invalid role specified: ${Role}. Allowed roles are: ${allowedRoles.join(', ')}` });
    }

    const query = "UPDATE appuser SET FullName = ?, Email = ?, Role = ? WHERE UserID = ?";
    db.query(query, [FullName, Email, Role, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating supervisor:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Supervisor not found or no changes made' });
        }
        res.sendStatus(200);
    });
};

// Delete supervisor by ID
const deleteSupervisorById = (req, res) => {
    const query = "DELETE FROM appuser WHERE UserID = ?";
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting supervisor:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Supervisor not found' });
        }
        res.sendStatus(200);
    });
};

// CORRECTED: Removed the stray backtick
export default {
    getAllSupervisors,
    getSupervisorById,
    updateSupervisorById,
    deleteSupervisorById
};