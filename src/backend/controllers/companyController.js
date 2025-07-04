// controllers/companyController.js

import db from '../config/db.js';

// Get all companies
export const getCompanies = (req, res) => {
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
};
