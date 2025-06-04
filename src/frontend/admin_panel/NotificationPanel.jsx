import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  const getNotificationMessage = (notification) => {
    switch (notification.Type) {
      case 'Response':
        return `${notification.UserName} responded to ticket #${notification.TicketID}`;
      case 'Update':
        return `Ticket #${notification.TicketID} has been updated`;
      case 'Close':
        return `Ticket #${notification.TicketID} has been closed`;
      default:
        return notification.Description;
    }
  };

  const handleNotificationClick = (notification) => {
    // Navigate to the appropriate ticket view
    navigate(`/tickets?id=${notification.TicketID}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Notifications</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <IoClose size={20} />
        </button>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.TicketLogID}
              onClick={() => handleNotificationClick(notification)}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-gray-800">
                  {getNotificationMessage(notification)}
                </h4>
                <span className="text-xs text-gray-500">
                  {formatDateTime(notification.DateTime)}
                </span>
              </div>
              {notification.Note && (
                <p className="text-sm text-gray-600">{notification.Note}</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t">
        <button 
          onClick={fetchNotifications}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel; 