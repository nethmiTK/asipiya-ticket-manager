import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { IoClose } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { FaLaptopCode, FaUserPlus, FaLayerGroup } from 'react-icons/fa';

const NotificationPanel = ({ userId, role, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                        Ticket #{notification.TicketID} status: <br />
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
                        Ticket #{notification.TicketID} resolution updated: <span className="italic">"{resolutionText}"</span>
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
        }
        return notification.Message;
    };

    const getNotificationProfilePic = (notification) => {
        const systemNotificationTypes = ['NEW_SYSTEM_ADDED', 'NEW_CATEGORY_ADDED', 'NEW_USER_REGISTRATION'];
        if (systemNotificationTypes.includes(notification.Type)) {
            // Use a specific icon or image for system notifications
            switch (notification.Type) {
                case 'NEW_SYSTEM_ADDED':
                    return { icon: <FaLaptopCode className="w-6 h-6 text-indigo-500" />, bgColor: 'bg-indigo-100' };
                case 'NEW_CATEGORY_ADDED':
                    return { icon: <FaLayerGroup className="w-6 h-6 text-purple-500" />, bgColor: 'bg-purple-100' };
                case 'NEW_USER_REGISTRATION':
                    return { icon: <FaUserPlus className="w-6 h-6 text-green-500" />, bgColor: 'bg-green-100' };
                default:
                    return { icon: <FaLaptopCode className="w-6 h-6 text-gray-500" />, bgColor: 'bg-gray-100' };
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
            return { icon: <FaUserPlus className="w-6 h-6 text-gray-500" />, bgColor: 'bg-gray-100' };
        }
    };

    const fetchNotifications = async () => {
        try {
            // Assuming backend provides SourceUserProfileImagePath and SourceUserFullName for relevant notifications
            // The backend API should be updated to include these fields in its response
            const response = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
            setNotifications(response.data);
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
            await axios.put(`http://localhost:5000/api/notifications/read`, {
                notificationIds: [notificationId]
            });
            setNotifications(notifications.map(notification => 
                notification.NotificationID === notificationId 
                    ? { ...notification, IsRead: true }
                    : notification
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationLink = (notification) => {
        const nonNavigatingTypes = ['NEW_SYSTEM_ADDED', 'NEW_CATEGORY_ADDED', 'NEW_USER_REGISTRATION'];
        
        if (nonNavigatingTypes.includes(notification.Type)) {
            return '#'; // Do not navigate for system notifications
        } else if (notification.TicketID) {
            // For ticket-related notifications, navigate to the TicketManage page with the ticket ID
            // And potentially set the tab to 'details' or 'comments' depending on the notification type
            if (notification.Type === 'NEW_TICKET') {
                return `/ticket-manage?ticketId=${notification.TicketID}&tab=details`;
            } else if (notification.Type === 'MENTION' || notification.Type === 'COMMENT_ADDED') {
                return `/ticket-manage?ticketId=${notification.TicketID}&tab=comments`;
            } else if (notification.Type === 'TICKET_REJECTED') {
                return `/ticket-manage?ticketId=${notification.TicketID}&tab=details`;
            }
            // Default for other ticket-related types
            return `/ticket-manage?ticketId=${notification.TicketID}&tab=details`;
        }
        return '#'; // Default fallback
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/read-all/${userId}`);
            setNotifications(notifications.map(notification => ({ ...notification, IsRead: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-lg w-96 p-4">
                <div className="animate-pulse flex space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-lg w-96 p-4">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Notifications</h2>
                {notifications.some(notif => !notif.IsRead) && (
                    <button 
                        onClick={markAllAsRead}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Mark all as read
                    </button>
                )}
                <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <IoClose size={24} />
                </button>
            </div>

            <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {notifications.map(notification => {
                            const { imgSrc, altText, icon, bgColor } = getNotificationProfilePic(notification);
                            const notificationLink = getNotificationLink(notification);
                            const isClickable = notificationLink !== '#';

                            return (
                                <Link
                                    key={notification.NotificationID}
                                    to={notificationLink}
                                    className={`flex items-start p-4 hover:bg-gray-50 transition-colors ${
                                        !notification.IsRead ? 'bg-blue-50' : ''
                                    } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                                    onClick={(e) => {
                                        if (!isClickable) {
                                            e.preventDefault(); // Prevent navigation if not clickable
                                        }
                                        if (!notification.IsRead) {
                                            markAsRead(notification.NotificationID);
                                        }
                                    }}
                                >
                                    {imgSrc ? (
                                        <img
                                            src={imgSrc}
                                            alt={altText}
                                            className="w-10 h-10 rounded-full mr-3 object-cover shadow-sm"
                                        />
                                    ) : (
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${bgColor} shadow-sm`}>
                                            {icon}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800 leading-snug">{formatNotificationMessage(notification)}</p>
                                        <div className="mt-1 flex justify-between items-center">
                                            <span className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(notification.CreatedAt), { addSuffix: true })}
                                            </span>
                                            {!notification.IsRead && (
                                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                            )}
                                        </div>
                                    </div>
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