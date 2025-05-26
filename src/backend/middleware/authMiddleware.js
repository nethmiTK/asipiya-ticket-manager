// src/backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ message: "No Token Provided or invalid format" });
        }
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(403).json({ message: "No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }
        return res.status(500).json({ message: "Server error during token verification." });
    }
};

export const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(401).json({ message: "Authentication required to check roles." });
        }

        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ message: "Access denied. You do not have the required permissions." });
        }

        next();
    };
};
