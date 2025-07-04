import util from 'util';

// Get all logs for a specific ticket
export const getTicketLogs = async (req, res) => {
    console.log('req.db:', req.db);
    const { ticketId } = req.params;
    
    const query = `
        SELECT 
            tl.*,
            au.FullName as UserName,
            t.Status as CurrentStatus,
            t.Priority as CurrentPriority,
            t.Description as TicketDescription,
            t.DateTime as TicketCreatedAt,
            t.Resolution as TicketResolution,
            t.SupervisorID,
            t.DueDate,
            t.LastRespondedTime,
            au_creator.FullName as CreatedByName,
            s.SystemName,
            tc.CategoryName,
            CASE 
                WHEN tl.Type = 'COMMENT' THEN tl.Note
                WHEN tl.Type = 'ATTACHMENT' THEN tl.NewValue
                ELSE NULL 
            END as AdditionalInfo
        FROM ticketlog tl
        JOIN ticket t ON t.TicketID = tl.TicketID
        LEFT JOIN appuser au ON au.UserID = tl.UserID
        LEFT JOIN appuser au_creator ON au_creator.UserID = t.UserId
        LEFT JOIN asipiyasystem s ON s.AsipiyaSystemID = t.AsipiyaSystemID
        LEFT JOIN ticketcategory tc ON tc.TicketCategoryID = t.TicketCategoryID
        WHERE tl.TicketID = ?
        ORDER BY tl.DateTime DESC
    `;

    try {
        // Promisify the query function for this specific request
        const queryAsync = util.promisify(req.db.query).bind(req.db);

        const results = await queryAsync(query, [ticketId]);

        if (results.length === 0) {
            return res.json([]);
        }

        const supervisorIdsString = results[0].SupervisorID;
        let supervisorNames = 'Not Assigned';

        console.log("Backend: SupervisorIDs string from ticket:", supervisorIdsString);

        if (supervisorIdsString) {
            const supervisorIds = supervisorIdsString.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (supervisorIds.length > 0) {
                const placeholders = supervisorIds.map(() => '?').join(',');
                const nameQuery = `SELECT FullName FROM appuser WHERE UserID IN (${placeholders})`;
                
                try {
                    const nameResults = await queryAsync(nameQuery, supervisorIds);
                    supervisorNames = nameResults.map(row => row.FullName).join(', ');
                    console.log("Backend: Fetched supervisor names:", supervisorNames);
                } catch (nameErr) {
                    console.error("Error fetching supervisor names:", nameErr);
                    supervisorNames = 'Error fetching supervisor names';
                }
            }
        }

        // Process the results to format them nicely
        const formattedResults = results.map(log => ({
            ...log,
            formattedDateTime: new Date(log.DateTime).toLocaleString(),
            actionType: log.Type,
            actor: log.UserName,
            details: {
                oldValue: log.OldValue,
                newValue: log.NewValue,
                description: log.Description,
                note: log.Note,
                additionalInfo: log.AdditionalInfo
            },
            ticketInfo: {
                currentStatus: log.CurrentStatus,
                currentPriority: log.CurrentPriority,
                description: log.TicketDescription,
                createdAt: log.TicketCreatedAt,
                resolution: log.TicketResolution,
                dueDate: log.DueDate,
                lastRespondedTime: log.LastRespondedTime,
                system: log.SystemName,
                category: log.CategoryName
            },
            people: {
                supervisor: supervisorNames,
                creator: log.CreatedByName
            }
        }));

        res.json(formattedResults);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a new log entry
export const createTicketLog = async (req, res) => {
    const {
        ticketId,
        type,
        description,
        note,
        userId,
        oldValue,
        newValue,
        attachmentPath
    } = req.body;

    // Validate required fields
    if (!ticketId || !type || !userId) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['ticketId', 'type', 'userId']
        });
    }

    const query = `
        INSERT INTO ticketlog 
        (TicketID, Type, Description, Note, UserID, OldValue, NewValue, DateTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    try {
        // For attachments, store the file path in NewValue
        const finalNewValue = type === 'ATTACHMENT' ? attachmentPath : newValue;

        req.db.query(
            query,
            [ticketId, type, description, note, userId, oldValue, finalNewValue],
            async (err, result) => {
                if (err) {
                    console.error('Error creating ticket log:', err);
                    return res.status(500).json({ error: 'Failed to create ticket log' });
                }

                // Get the created log entry with user details
                const getLogQuery = `
                    SELECT 
                        tl.*,
                        au.FullName as UserName
                    FROM ticketlog tl
                    LEFT JOIN appuser au ON au.UserID = tl.UserID
                    WHERE tl.LogID = ?
                `;

                req.db.query(getLogQuery, [result.insertId], (err, logResults) => {
                    if (err) {
                        console.error('Error fetching created log:', err);
                        return res.status(500).json({ error: 'Log created but failed to fetch details' });
                    }

                    res.status(201).json({
                        message: 'Ticket log created successfully',
                        log: logResults[0]
                    });
                });
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get log statistics for a ticket
export const getTicketLogStats = async (req, res) => {
    const { ticketId } = req.params;
    
    const query = `
        SELECT 
            COUNT(*) as totalActions,
            SUM(CASE WHEN Type = 'STATUS_CHANGE' THEN 1 ELSE 0 END) as statusChanges,
            SUM(CASE WHEN Type = 'PRIORITY_CHANGE' THEN 1 ELSE 0 END) as priorityChanges,
            SUM(CASE WHEN Type = 'COMMENT' THEN 1 ELSE 0 END) as comments,
            SUM(CASE WHEN Type = 'ATTACHMENT' THEN 1 ELSE 0 END) as attachments,
            MIN(DateTime) as firstAction,
            MAX(DateTime) as lastAction,
            COUNT(DISTINCT UserID) as uniqueUsers
        FROM ticketlog
        WHERE TicketID = ?
    `;

    try {
        req.db.query(query, [ticketId], (err, results) => {
            if (err) {
                console.error('Error fetching ticket log statistics:', err);
                return res.status(500).json({ error: 'Failed to fetch ticket log statistics' });
            }
            res.json(results[0]);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 