import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { IoClose } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { FaLaptopCode, FaUserPlus, FaLayerGroup, FaUserCheck, FaUserTimes, FaEdit, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';

const NotificationPanel = ({ userId, role, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            // Extract old and new status from the message
            const match = notification.Message.match(/status has been updated from (.*) to (.*)/);
            if (match) {
                const [, oldStatus, newStatus] = match;
                return (
                    <span>
                        <span className="font-medium text-blue-600">Status Update</span><br />
                        Ticket #{notification.TicketID}: <br />
                        <span className={`font-medium ${getStatusColor(oldStatus)}`}>{oldStatus}</span>
                        <span className="mx-2">→</span>
                        <span className={`font-medium ${getStatusColor(newStatus)}`}>{newStatus}</span>
                    </span>
                );
            }
        } else if (notification.Type === 'RESOLUTION_UPDATE') {
            const match = notification.Message.match(/Resolution summary updated: (.*)/);
            if (match) {
                const [, resolutionText] = match;
                return (
                    <span>
                        <span className="font-medium text-green-600">Resolution Update</span><br />
                        Ticket #{notification.TicketID} has been resolved: <br />
                        <span className="italic text-gray-600">"{resolutionText}"</span>
                    </span>
                );
            }
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
        } else if (notification.Type === 'DUE_DATE_UPDATE') {
            // Handle due date update notifications
            return (
                <span>
                    <span className="text-orange-600 font-medium">Due Date Updated</span><br />
                    {notification.Message}
                </span>
            );
        }
        return notification.Message;
    };

    const getNotificationProfilePic = (notification) => {
        const systemNotificationTypes = ['NEW_SYSTEM_ADDED', 'NEW_CATEGORY_ADDED', 'NEW_USER_REGISTRATION', 'NEW_CLIENT_REGISTRATION'];
        const supervisorNotificationTypes = ['SUPERVISOR_ASSIGNED', 'SUPERVISOR_UNASSIGNED', 'TICKET_UPDATED', 'SUPERVISOR_ADDED', 'SUPERVISOR_REMOVED', 'STATUS_UPDATE', 'RESOLUTION_UPDATE', 'DUE_DATE_UPDATE'];
        
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
        } else if (supervisorNotificationTypes.includes(notification.Type)) {
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
        } else if (notification.SourceUserProfileImagePath) {
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
         else {
            // Default icon if no specific user or system type is matched
            return { icon: <FaUserPlus className="w-6 h-6 text-gray-600" />, bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200' };
        }
    };

    const fetchNotifications = async () => {
        try {
            // Fetch all notifications first
            const response = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
            
            // Filter to only show unread notifications on the frontend
            // This prevents read notifications from reappearing after refresh
            const unreadNotifications = response.data.filter(notification => !notification.IsRead);
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
            // Auto-update every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const markAsRead = async (notificationId) => {
        try {
            // First update the UI immediately by filtering out the read notification
            setNotifications(notifications.filter(notification => 
                notification.NotificationID !== notificationId
            ));
            
            // Then make the API call to mark as read in the backend
            await axios.put(`http://localhost:5000/api/notifications/read`, {
                notificationIds: [notificationId]
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // If API call fails, we could optionally restore the notification
            // But for better UX, we'll keep it removed from the UI
        }
    };

    const getNotificationLink = (notification) => {
        // For users/clients, most notifications should not navigate
        if (role === 'User' || role === 'Client') {
            // Only specific notification types should be clickable for users
            const userClickableTypes = [
                'COMMENT_ADDED',    // When someone comments on their ticket
                'MENTION'           // When they are mentioned
            ];
            
            if (userClickableTypes.includes(notification.Type) && notification.TicketID) {
                return `/users-dashboard?ticketId=${notification.TicketID}`;
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
            // First update the UI immediately by clearing all notifications
            setNotifications([]);
            
            // Then make the API call to mark all as read in the backend
            await axios.put(`http://localhost:5000/api/notifications/read-all/${userId}`);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            // If API call fails, we could optionally restore the notifications
            // But for better UX, we'll keep them removed from the UI
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
                    {notifications.length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {notifications.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {notifications.length > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200"
                        >
                            Mark all read
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
                                    className={`flex items-start p-5 transition-all duration-300 group relative notification-enter bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 ${isClickable ? 'cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50' : 'cursor-default hover:bg-gray-50'}`}
                                    onClick={(e) => {
                                        if (!isClickable) {
                                            e.preventDefault();
                                        }
                                        markAsRead(notification.NotificationID);
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
                                        <div className="text-sm text-gray-800 leading-relaxed font-medium mb-2">
                                            {formatNotificationMessage(notification)}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                                {formatDistanceToNow(new Date(notification.CreatedAt), { addSuffix: true })}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                {!isClickable && (
                                                    <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                                                        Info
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