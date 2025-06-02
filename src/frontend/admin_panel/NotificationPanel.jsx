import React from 'react';
import { IoClose } from 'react-icons/io5';

const NotificationPanel = ({ isOpen, onClose }) => {
  const notifications = [
    {
      id: 1,
      title: "New Ticket Created",
      message: "A new high priority ticket has been created",
      time: "5 minutes ago",
      isRead: false
    },
    {
      id: 2,
      title: "Ticket Updated",
      message: "Ticket #123 has been updated by supervisor",
      time: "1 hour ago",
      isRead: false
    },
    {
      id: 3,
      title: "System Alert",
      message: "System maintenance scheduled for tomorrow",
      time: "2 hours ago",
      isRead: true
    }
  ];

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
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
              !notification.isRead ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-medium text-gray-800">{notification.title}</h4>
              <span className="text-xs text-gray-500">{notification.time}</span>
            </div>
            <p className="text-sm text-gray-600">{notification.message}</p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel; 