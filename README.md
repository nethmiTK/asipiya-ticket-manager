# 🎫 Ticket Manager System (React + MySQL)

A full-featured complaint management and communication system built with **React** for the frontend and **MySQL** for the backend. The system supports ticket tracking, supervisor assignment, secure chat, real-time-style notifications, login system, and role-based access.

---

## 🧩 Tech Stack

- **Frontend**: React.js
- **Backend**: PHP (or Node.js API)
- **Database**: MySQL
- **State Management**: React Context / Redux (optional)
- **Form Validation**: React Hook Form / JavaScript + Server-side validation

---

## 🚀 Features

### ✅ Authentication & User Accounts
- **Login/Logout system** with session/token
- **Password encryption**
- **User roles**:
  - **Client** – Creates and tracks tickets
  - **Supervisor** – Handles assigned tickets and chats
  - **Admin / Ticket Manager** – Manages users, tickets, categories

### 🎟️ Ticket Management
- Create and view tickets
- Assign supervisors
- Update status and priority
- Reject tickets with reason
- Comment and mention users

### 💬 Chat System
- Chat between:
  - Supervisor ↔ Client
  - Supervisor ↔ Admin
  - Admin ↔ Client
- Chat is linked to a specific ticket
- **Notification type `CHAT_MESSAGE`** triggered per message

### 🔔 Notification System
Each action generates a notification. Users are alerted based on:

| Notification Type         | Description |
|---------------------------|-------------|
| `NEW_TICKET`              | Ticket created |
| `NEW_SYSTEM_ADDED`        | New system added |
| `NEW_CATEGORY_ADDED`      | New category created |
| `NEW_USER_REGISTRATION`   | User signup |
| `NEW_CLIENT_REGISTRATION` | Client registered |
| `SUPERVISOR_ADDED`        | Supervisor added |
| `SUPERVISOR_ASSIGNED`     | Assigned to ticket |
| `SUPERVISOR_REMOVED`      | Supervisor removed |
| `SUPERVISOR_UNASSIGNED`   | Supervisor unassigned |
| `TICKET_UPDATED`          | Ticket details changed |
| `STATUS_UPDATE`           | Status change |
| `PRIORITY_UPDATE`         | Priority updated |
| `TICKET_REJECTED`         | Ticket rejected |
| `COMMENT_ADDED`           | New comment |
| `MENTION`                 | Mentioned in comment/status |
| `CHAT_MESSAGE`            | New chat message |

---

## 🛡️ Validation

### Frontend (React)
- **React Hook Form** or basic form validation
- Required fields, format checks, error messages

### Backend (PHP or Node)
- Server-side validations
- Prevent SQL injection using prepared statements

---

 
