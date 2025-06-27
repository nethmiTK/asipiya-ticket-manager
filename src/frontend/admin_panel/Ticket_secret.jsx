import React from 'react';
import { IoArrowBack } from 'react-icons/io5';

const Ticket_secret = ({ ticket, onClose }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "text-blue-500";
      case "in progress":
        return "text-yellow-500";
      case "closed":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      case "pending":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <IoArrowBack className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Ticket Details
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ticket ID
              </label>
              <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                #{ticket.TicketID}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                User Name
              </label>
              <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                {ticket.UserName || "N/A"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Status
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className={`${getStatusColor(ticket.Status)} font-medium`}>
                  {ticket.Status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Priority
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className={`${getPriorityColor(ticket.Priority)} font-medium`}>
                  {ticket.Priority}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description
            </label>
            <div className="bg-gray-50 rounded-lg p-3 text-gray-800 min-h-[100px] whitespace-pre-wrap">
              {ticket.Description}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Created At
            </label>
            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
              {new Date(ticket.DateTime).toLocaleString()}
            </div>
          </div>

          {ticket.UserNote && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                User Note
              </label>
              <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                {ticket.UserNote}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ticket_secret; 