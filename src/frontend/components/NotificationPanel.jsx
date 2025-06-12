import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { IoClose } from 'react-icons/io5';
import { Link } from 'react-router-dom';

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
        }
        return notification.Message;
    };

    const fetchNotifications = async () => {
        try {
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
        if (notification.TicketID) {
            return role.toLowerCase() === 'admin' 
                ? `/ticket-manage/${notification.TicketID}`
                : `/my-tickets/${notification.TicketID}`;
        }
        return '#';
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
                        {notifications.map(notification => (
                            <Link
                                key={notification.NotificationID}
                                to={getNotificationLink(notification)}
                                className={`block p-4 hover:bg-gray-50 transition-colors ${
                                    !notification.IsRead ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => !notification.IsRead && markAsRead(notification.NotificationID)}
                            >
                                <p className="text-sm text-gray-800">{formatNotificationMessage(notification)}</p>
                                <div className="mt-2 flex justify-between items-center">
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(notification.CreatedAt), { addSuffix: true })}
                                    </span>
                                    {!notification.IsRead && (
                                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel; 