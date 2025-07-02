import React from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const Ticket_secret = ({ ticket, onClose }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800 rounded-3xl px-3 py-1";
      case "in progress":
        return "bg-yellow-100 text-yellow-800 rounded-3xl px-3 py-1";
      case "closed":
        return "bg-green-100 text-green-800 rounded-3xl px-3 py-1";
      case "rejected":
        return "bg-red-100 text-red-800 rounded-3xl px-3 py-1";
      case "pending":
        return "bg-orange-100 text-orange-800 rounded-3xl px-3 py-1";
      default:
        return "bg-gray-100 text-gray-800 rounded-3xl px-3 py-1";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 rounded-3xl px-3 py-1";
      case "medium":
        return "bg-yellow-100 text-yellow-800 rounded-3xl px-3 py-1";
      case "low":
        return "bg-green-100 text-green-800 rounded-3xl px-3 py-1";
      default:
        return "bg-gray-100 text-gray-800 rounded-3xl px-3 py-1";
    }
  };

  return (
 
    <div className="fixed inset-0 flex items-center justify-center z-50">
 
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

          {/* ✅ Edit Supervisor Button */}
          <div>
            <button
              onClick={() => navigate(`/edit_supervisors/${ticket.TicketID}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Edit Supervisor
            </button>
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
