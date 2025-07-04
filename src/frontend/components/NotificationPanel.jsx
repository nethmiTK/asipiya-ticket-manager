 import React, { useState, useEffect, useRef } from 'react';
import axiosClient from "../axiosClient";
import { formatDistanceToNow } from 'date-fns';
import { IoClose } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { FaLaptopCode, FaUserPlus, FaLayerGroup, FaUserCheck, FaUserTimes, FaEdit, FaCheckCircle, FaCalendarAlt, FaComments } from 'react-icons/fa';
import { io } from 'socket.io-client';

const NotificationPanel = ({ userId, role, onClose, onNotificationUpdate }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    // Add some custom styles for animations
    const styles = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .notification-enter {
            animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .notification-panel {
            animation: slideInDown 0.3s ease-out forwards;
        }
        
        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    `;

    // Add styles to document head
    React.useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
        
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'text-yellow-600';
            case 'in progress':
                return 'text-blue-600';
            case 'resolved':
                return 'text-green-600';
            case 'rejected':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatNotificationMessage = (notification) => {
        if (notification.Type === 'STATUS_UPDATE') {
            return (
                <span>
                    <span className="font-medium text-blue-600">Status Update</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'RESOLUTION_UPDATE') {
            return (
                <span>
                    <span className="font-medium text-green-600">Resolution Update</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'DUE_DATE_UPDATE') {
            return (
                <span>
                    <span className="font-medium text-orange-600">Due Date Updated</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'TICKET_REJECTED') {
            // Handle ticket rejection notifications with special styling
            return (
                <span>
                    <span className="text-red-600 font-medium">Ticket Rejected</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'TICKET_UPDATED') {
            // Handle consolidated ticket update notifications
            return (
                <span>
                    <span className="text-blue-600 font-medium">Ticket Updated</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'SUPERVISOR_ASSIGNED') {
            // Handle supervisor assignment notifications
            return (
                <span>
                    <span className="text-green-600 font-medium">Supervisor Assigned</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'SUPERVISOR_UNASSIGNED') {
            // Handle supervisor unassignment notifications
            return (
                <span>
                    <span className="text-orange-600 font-medium">Supervisor Unassigned</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'SUPERVISOR_ADDED') {
            // Handle supervisor addition notifications
            return (
                <span>
                    <span className="text-green-600 font-medium">Supervisors Added</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'SUPERVISOR_REMOVED') {
            // Handle supervisor removal notifications
            return (
                <span>
                    <span className="text-red-600 font-medium">Supervisors Removed</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'NEW_CHAT_MESSAGE') {
            // Handle new chat message notifications
            // Try multiple possible field names for sender information
            let senderName = notification.SourceUserFullName || 
                             notification.SenderName || 
                             notification.SourceName || 
                             notification.UserName ||
                             notification.sourceUserFullName ||
                             'Someone';
                             
            let senderRole = notification.SourceUserRole || 
                            notification.sourceUserRole || 
                            null;
            
            // Debug logging to help track the issue
            console.log('Chat notification details:', {
                senderName,
                senderRole,
                fullNotification: notification
            });
            
            // Clean up the message and extract sender name if needed
            let cleanMessage = notification.Message;
            
            // If sender name is still 'Someone', try to extract from message
            if (senderName === 'Someone' && cleanMessage.includes(':')) {
                const messageParts = cleanMessage.split(':');
                if (messageParts.length >= 2) {
                    const potentialSender = messageParts[0].trim();
                    // Only use it if it's not "Unknown"
                    if (potentialSender !== 'Unknown') {
                        senderName = potentialSender;
                        cleanMessage = messageParts.slice(1).join(':').trim();
                    } else {
                        // Remove "Unknown:" prefix if it exists
                        cleanMessage = cleanMessage.replace('Unknown:', '').trim();
                    }
                }
            } else if (cleanMessage.startsWith('Unknown:')) {
                cleanMessage = cleanMessage.replace('Unknown:', '').trim();
            }
            
            // Extract time from message if it has "(Ticket #X)" format
            const ticketMatch = cleanMessage.match(/\(Ticket #\d+\)$/);
            if (ticketMatch) {
                cleanMessage = cleanMessage.replace(ticketMatch[0], '').trim();
            }
            
            // Determine sender display name based on role
            let displaySender = senderName;
            
            // If this is coming from admin panel, show role instead of full name
            if (role === 'User' || role === 'Client') {
                // For users/clients receiving messages, show role-based display
                if (senderRole === 'Admin') {
                    displaySender = 'Admin';
                } else if (senderRole === 'Supervisor') {
                    displaySender = 'Supervisor';
                } else if (senderName && senderName !== 'Someone') {
                    // If no role info but we have a name, assume it's admin
                    displaySender = 'Admin';
                }
            }
            
            return (
                <span>
                    <span className="text-blue-600 font-medium">💬 New Message from {displaySender}</span><br />
                    <span className="text-gray-600 text-sm">sent: {cleanMessage}</span>
                </span>
            );
        } else if (notification.Type === 'NEW_CLIENT_REGISTRATION') {
            // Handle client registration notifications
            return (
                <span>
                    <span className="text-blue-600 font-medium">New Client Registered</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'COMMENT_ADDED') {
            // Handle comment notifications
            return (
                <span>
                    <span className="text-purple-600 font-medium">New Comment</span><br />
                    {notification.Message}
                </span>
            );
        } else if (notification.Type === 'MENTION') {
            // Handle mention notifications
            return (
                <span>
                    <span className="text-indigo-600 font-medium">You were mentioned</span><br />
                    {notification.Message}
                </span>
            );
        }
        return notification.Message;
    };

    const getNotificationProfilePic = (notification) => {
        const systemNotificationTypes = ['NEW_SYSTEM_ADDED', 'NEW_CATEGORY_ADDED', 'NEW_USER_REGISTRATION', 'NEW_CLIENT_REGISTRATION'];
        const supervisorNotificationTypes = ['SUPERVISOR_ASSIGNED', 'SUPERVISOR_UNASSIGNED', 'TICKET_UPDATED', 'SUPERVISOR_ADDED', 'SUPERVISOR_REMOVED', 'STATUS_UPDATE', 'RESOLUTION_UPDATE', 'DUE_DATE_UPDATE'];
        
        // Priority 1: Check if notification has source user information (for personalized notifications)
        if (notification.SourceUserProfileImagePath) {
            // Use the source user's profile picture
            return {
                imgSrc: `http://localhost:5000/uploads/profile_images/${notification.SourceUserProfileImagePath}`,
                altText: notification.SourceUserFullName || 'User',
            };
        } else if (notification.SourceUserFullName) {
             // Fallback to UI-avatars if path is missing but name exists
            return {
                imgSrc: `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.SourceUserFullName)}&background=random&color=fff`,
                altText: notification.SourceUserFullName,
            };
        }
        
        // Priority 2: System notifications (use icons)
        if (systemNotificationTypes.includes(notification.Type)) {
            // Use a specific icon or image for system notifications
            switch (notification.Type) {
                case 'NEW_SYSTEM_ADDED':
                    return { icon: <FaLaptopCode className="w-6 h-6 text-indigo-600" />, bgColor: 'bg-gradient-to-br from-indigo-100 to-indigo-200' };
                case 'NEW_CATEGORY_ADDED':
                    return { icon: <FaLayerGroup className="w-6 h-6 text-purple-600" />, bgColor: 'bg-gradient-to-br from-purple-100 to-purple-200' };
                case 'NEW_USER_REGISTRATION':
                    return { icon: <FaUserPlus className="w-6 h-6 text-green-600" />, bgColor: 'bg-gradient-to-br from-green-100 to-green-200' };
                case 'NEW_CLIENT_REGISTRATION':
                    return { icon: <FaUserPlus className="w-6 h-6 text-blue-600" />, bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200' };
                default:
                    return { icon: <FaLaptopCode className="w-6 h-6 text-gray-600" />, bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200' };
            }
        }
        
        // Priority 3: Chat notifications (use icon only if no user info)
        if (notification.Type === 'NEW_CHAT_MESSAGE') {
            return { icon: <FaComments className="w-6 h-6 text-blue-600" />, bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200' };
        }
        
        // Priority 4: Supervisor-related notifications (use icons)
        if (supervisorNotificationTypes.includes(notification.Type)) {
            // Use specific icons for supervisor-related notifications
            switch (notification.Type) {
                case 'SUPERVISOR_ASSIGNED':
                    return { icon: <FaUserCheck className="w-6 h-6 text-green-600" />, bgColor: 'bg-gradient-to-br from-green-100 to-green-200' };
                case 'SUPERVISOR_UNASSIGNED':
                    return { icon: <FaUserTimes className="w-6 h-6 text-orange-600" />, bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200' };
                case 'SUPERVISOR_ADDED':
                    return { icon: <FaUserCheck className="w-6 h-6 text-green-600" />, bgColor: 'bg-gradient-to-br from-green-100 to-green-200' };
                case 'SUPERVISOR_REMOVED':
                    return { icon: <FaUserTimes className="w-6 h-6 text-red-600" />, bgColor: 'bg-gradient-to-br from-red-100 to-red-200' };
                case 'TICKET_UPDATED':
                    return { icon: <FaUserCheck className="w-6 h-6 text-blue-600" />, bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200' };
                case 'STATUS_UPDATE':
                    return { icon: <FaEdit className="w-6 h-6 text-blue-600" />, bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200' };
                case 'RESOLUTION_UPDATE':
                    return { icon: <FaCheckCircle className="w-6 h-6 text-green-600" />, bgColor: 'bg-gradient-to-br from-green-100 to-green-200' };
                case 'DUE_DATE_UPDATE':
                    return { icon: <FaCalendarAlt className="w-6 h-6 text-orange-600" />, bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200' };
                default:
                    return { icon: <FaUserCheck className="w-6 h-6 text-gray-600" />, bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200' };
            }
        }
        
        // Default fallback
        return { icon: <FaUserPlus className="w-6 h-6 text-gray-600" />, bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200' };
    };

    const fetchNotifications = async () => {
        try {
            // Fetch ALL notifications (both read and unread)
            const response = await axiosClient.get(`/api/notifications/${userId}`);
            
            // Filter to show only unread notifications initially
            const unreadNotifications = response.data.filter(notification => !notification.IsRead).map(notification => ({
                ...notification,
                justMarkedRead: false
            }));
            
            setNotifications(unreadNotifications);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to load notifications');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchNotifications();
            
            // Setup socket connection for real-time notifications
            socketRef.current = io("http://localhost:5000");
            
            // Listen for new notifications for this specific user
            socketRef.current.on(`notification-${userId}`, (newNotification) => {
                console.log('Received new notification:', newNotification);
                
                // Add the new notification to the beginning of the list
                setNotifications(prevNotifications => {
                    const newNotificationWithDetails = {
                        NotificationID: newNotification.notificationId,
                        UserID: userId,
                        Message: newNotification.message,
                        Type: newNotification.type,
                        IsRead: false,
                        CreatedAt: newNotification.createdAt,
                        TicketID: newNotification.ticketId,
                        SourceUserFullName: newNotification.sourceUserFullName || null,
                        SourceUserRole: newNotification.sourceUserRole || null,
                        SourceUserProfileImagePath: newNotification.sourceUserProfileImagePath || null,
                        justReceived: true // Flag to highlight new notifications
                    };
                    return [newNotificationWithDetails, ...prevNotifications];
                });
                
                // Update notification count in parent component
                if (onNotificationUpdate) {
                    onNotificationUpdate();
                }
            });
            
            // Listen for notification updates (like marking notifications as read)
            socketRef.current.on(`notification-update-${userId}`, (updateData) => {
                console.log('Received notification update:', updateData);
                
                if (updateData.type === 'CHAT_NOTIFICATIONS_READ') {
                    // Update notifications for this specific ticket
                    setNotifications(prevNotifications => {
                        return prevNotifications.map(notification => {
                            if (notification.Type === 'NEW_CHAT_MESSAGE' && 
                                notification.TicketID === updateData.ticketId) {
                                return { ...notification, IsRead: true };
                            }
                            return notification;
                        });
                    });
                    
                    // Update notification count in parent component
                    if (onNotificationUpdate) {
                        onNotificationUpdate();
                    }
                }
            });
            
            // Auto-update every 5 hours
            const interval = setInterval(fetchNotifications, 18000000); // 5 hours in milliseconds
            
            // Cleanup function
            return () => {
                clearInterval(interval);
                if (socketRef.current) {
                    socketRef.current.off(`notification-${userId}`);
                    socketRef.current.off(`notification-update-${userId}`);
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
            };
        }
    }, [userId, onNotificationUpdate]);

    const markAsRead = async (notificationId) => {
        try {
            // Mark the notification as read in the UI without removing it
            setNotifications(notifications.map(notification => 
                notification.NotificationID === notificationId
                    ? { ...notification, IsRead: true, justMarkedRead: true } // Mark as read and add indicator
                    : notification
            ));
            
            // Then make the API call to mark as read in the backend
            await axiosClient.put(`/api/notifications/read`, {
                notificationIds: [notificationId]
            });
            
            // Update the parent component's notification count
            if (onNotificationUpdate) {
                onNotificationUpdate();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // If API call fails, revert the read status
            setNotifications(notifications.map(notification => 
                notification.NotificationID === notificationId
                    ? { ...notification, IsRead: false, justMarkedRead: false } // Revert if API fails
                    : notification
            ));
        }
    };

    const getNotificationLink = (notification) => {
        // For users/clients, most notifications should not navigate
        if (role === 'User' || role === 'Client') {
            // Only specific notification types should be clickable for users
            const userClickableTypes = [
                'COMMENT_ADDED',    // When someone comments on their ticket
                'MENTION',          // When they are mentioned
                'NEW_CHAT_MESSAGE'  // When they receive a chat message
            ];
            
            if (userClickableTypes.includes(notification.Type) && notification.TicketID) {
                if (notification.Type === 'NEW_CHAT_MESSAGE') {
                    return `/ticket/${notification.TicketID}?tab=chat`;
                }
                return `/ticket/${notification.TicketID}`;
            }
            
            // All other user notifications should not navigate
            return '#';
        }
        
        // For admins/supervisors, keep existing navigation logic
        const nonNavigatingTypes = [
            'NEW_SYSTEM_ADDED', 
            'NEW_CATEGORY_ADDED', 
            'NEW_USER_REGISTRATION',
            'NEW_CLIENT_REGISTRATION',
            'SUPERVISOR_ADDED',
            'SUPERVISOR_REMOVED',
            'SUPERVISOR_UNASSIGNED'
        ];
        
        if (nonNavigatingTypes.includes(notification.Type)) {
            return '#'; // Do not navigate for these notification types
        } else if (notification.TicketID) {
            // For admins/supervisors, navigate to ticket management
            if (notification.Type === 'NEW_TICKET') {
                return `/ticket-manage?ticketId=${notification.TicketID}&tab=details`;
            } else if (notification.Type === 'MENTION' || notification.Type === 'COMMENT_ADDED') {
                return `/ticket-manage?ticketId=${notification.TicketID}&tab=comments`;
            } else if (notification.Type === 'NEW_CHAT_MESSAGE') {
                return `/ticket-manage?ticketId=${notification.TicketID}&tab=chat`;
            } else if (notification.Type === 'TICKET_REJECTED' || 
                       notification.Type === 'TICKET_UPDATED' || 
                       notification.Type === 'SUPERVISOR_ASSIGNED' ||
                       notification.Type === 'STATUS_UPDATE' ||
                       notification.Type === 'RESOLUTION_UPDATE' ||
                       notification.Type === 'DUE_DATE_UPDATE') {
                return `/ticket-manage?ticketId=${notification.TicketID}&tab=details`;
            }
            // Default for other ticket-related types
            return `/ticket-manage?ticketId=${notification.TicketID}&tab=details`;
        }
        return '#'; // Default fallback
    };

    const markAllAsRead = async () => {
        try {
            // Mark all notifications as read in the UI without removing them
            setNotifications(notifications.map(notification => ({
                ...notification,
                IsRead: true,
                justMarkedRead: true // Add indicator for recently marked as read
            })));
            
            // Then make the API call to mark all as read in the backend
            await axiosClient.put(`/api/notifications/read-all/${userId}`);
            
            // Update the parent component's notification count
            if (onNotificationUpdate) {
                onNotificationUpdate();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            // If API call fails, revert the read status
            setNotifications(notifications.map(notification => ({
                ...notification,
                IsRead: false,
                justMarkedRead: false // Revert if API fails
            })));
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-2xl w-96 p-6 border border-gray-100">
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="h-6 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-6"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-6"></div>
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-start space-x-4">
                                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-2xl w-96 p-6 border border-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-2xl w-96 max-h-[85vh] flex flex-col border border-gray-100 overflow-hidden notification-panel">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                    {notifications.filter(n => !n.IsRead).length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {notifications.filter(n => !n.IsRead).length}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {notifications.filter(n => !n.IsRead).length > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200"
                        >
                            Mark all as read
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                        <IoClose size={20} />
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2v-4" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No new notifications</p>
                        <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notification, index) => {
                            const { imgSrc, altText, icon, bgColor } = getNotificationProfilePic(notification);
                            const notificationLink = getNotificationLink(notification);
                            const isClickable = notificationLink !== '#';

                            return (
                                <Link
                                    key={notification.NotificationID}
                                    to={notificationLink}
                                    className={`flex items-start p-5 transition-all duration-300 group relative notification-enter ${
                                        notification.IsRead || notification.justMarkedRead
                                            ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-300 opacity-80' 
                                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400'
                                    } ${isClickable ? 'cursor-pointer hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-100' : 'cursor-default hover:bg-gray-100'}`}
                                    onClick={(e) => {
                                        if (!isClickable) {
                                            e.preventDefault();
                                        }
                                        if (!notification.IsRead && !notification.justMarkedRead) {
                                            markAsRead(notification.NotificationID);
                                        }
                                    }}
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    {imgSrc ? (
                                        <div className="relative">
                                            <img
                                                src={imgSrc}
                                                alt={altText}
                                                className="w-12 h-12 rounded-full mr-4 object-cover shadow-md ring-2 ring-white group-hover:ring-blue-200 transition-all duration-300"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${bgColor} shadow-md ring-2 ring-white group-hover:ring-blue-200 transition-all duration-300`}>
                                                {icon}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm leading-relaxed font-medium mb-2 ${
                                            notification.IsRead || notification.justMarkedRead 
                                                ? 'text-gray-500' 
                                                : 'text-gray-800'
                                        }`}>
                                            {formatNotificationMessage(notification)}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                                {formatDistanceToNow(new Date(notification.CreatedAt), { addSuffix: true })}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                {!notification.IsRead && !notification.justMarkedRead ? (
                                                    <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full font-medium">
                                                        New
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                                        Read
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Hover effect indicator */}
                                    {isClickable && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel; 