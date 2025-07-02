import React, { useState } from 'react';
import { FaEdit, FaEye } from 'react-icons/fa';
import TicketViewPage from '../TicketViewPage';
import Ticket_secret from '../Ticket_secret';

const TicketTable = ({ 
  tickets, 
  showStatus = true, 
  showPriority = true,
  onTicketClick
}) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showSecretModal, setShowSecretModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800 rounded-3xl px-3 py-1";
      case "in progress":
        return "bg-yellow-100 text-yellow-800 rounded-3xl px-3 py-1";
      case "resolved":
        return "bg-green-100 text-green-800 rounded-3xl px-3 py-1";
      case "reject":
        return "bg-purple-100 text-purple-800 rounded-3xl px-3 py-1";
      case "accept":
        return "bg-blue-100 text-blue-800 rounded-3xl px-3 py-1";
      case "closed":
        return "bg-green-100 text-green-800 rounded-3xl px-3 py-1";
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

  const handleTicketAction = (ticket) => {
    if (ticket.Status?.toLowerCase() === 'pending') {
      // For pending tickets, show TicketViewPage
      setSelectedTicket(ticket);
      setShowSecretModal(false);
    } else {
      // For non-pending tickets, show Ticket_secret
      setSelectedTicket(ticket);
      setShowSecretModal(true);
    }
    
    // If onTicketClick is provided, call it as well
    if (onTicketClick) {
      onTicketClick(ticket);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket ID
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                System Name
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              {showStatus && (
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              )}
              {showPriority && (
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
              )}
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.TicketID} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{ticket.TicketID}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.CompanyName || "N/A"}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {ticket.Description}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.SystemName || "N/A"}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.DateTime).toLocaleString()}
                </td>
                {showStatus && (
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${getStatusColor(ticket.Status)}`}>
                      {ticket.Status}
                    </span>
                  </td>
                )}
                {showPriority && (
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${getPriorityColor(ticket.Priority)}`}>
                      {ticket.Priority}
                    </span>
                  </td>
                )}
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleTicketAction(ticket)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title={ticket.Status?.toLowerCase() === 'pending' ? "Edit Ticket" : "View Ticket Details"}
                  >
                    {ticket.Status?.toLowerCase() === 'pending' ? (
                      <FaEdit className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/55" onClick={() => {
            setSelectedTicket(null);
            setShowSecretModal(false);
          }}></div>
          <div className="bg-white rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto relative z-10">
            {showSecretModal ? (
              <Ticket_secret 
                ticket={selectedTicket} 
                onClose={() => {
                  setSelectedTicket(null);
                  setShowSecretModal(false);
                }} 
              />
            ) : (
              <TicketViewPage
                ticketId={selectedTicket.TicketID}
                popupMode={true}
                onClose={() => {
                  setSelectedTicket(null);
                  setShowSecretModal(false);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTable; 