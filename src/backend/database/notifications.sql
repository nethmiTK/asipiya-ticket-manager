-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    NotificationID INT NOT NULL AUTO_INCREMENT,
    UserID INT NOT NULL,
    Message TEXT NOT NULL,
    Type VARCHAR(50) NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TicketLogID INT DEFAULT NULL,
    PRIMARY KEY (NotificationID),
    KEY UserID (UserID),
    KEY TicketLogID (TicketLogID)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; 