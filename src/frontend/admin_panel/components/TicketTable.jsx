import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import TicketViewPage from '../TicketViewPage';

const TicketTable = ({ 
  tickets, 
  showStatus = true, 
  showPriority = true,
}) => {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "text-blue-500";
      case "in progress":
        return "text-yellow-500";
      case "resolved":
        return "text-green-500";
      case "reject":
        return "text-purple-500";
      case "accept":
        return "text-blue-500";
      case "closed":
        return "text-green-500";
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
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="View Ticket Details"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}></div>
          <div className="bg-white rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto relative z-10">
            <TicketViewPage
              ticketId={selectedTicket.TicketID}
              popupMode={true}
              onClose={() => setSelectedTicket(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTable; 