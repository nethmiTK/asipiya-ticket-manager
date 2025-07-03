import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient"; // Changed from axios to axiosClient
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import TicketViewPage from "../admin_panel/TicketViewPage";
import { FaEdit } from 'react-icons/fa';
import Select from "react-select";

const PendingTicket = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTicketPopup, setShowTicketPopup] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const [systemOptions, setSystemOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Use axiosClient and remove the base URL
        const response = await axiosClient.get("/api/pending_ticket");
        const pendingTickets = response.data.filter(
          (ticket) => ticket.Status?.toLowerCase() === "pending"
        );
        setTickets(pendingTickets);
        setFilteredTickets(pendingTickets);

        // Create unique dropdown options
        const systems = [...new Set(pendingTickets.map(t => t.SystemName).filter(Boolean))];
        const companies = [...new Set(pendingTickets.map(t => t.CompanyName).filter(Boolean))];
        setSystemOptions(systems.map(s => ({ value: s, label: s })));
        setCompanyOptions(companies.map(c => ({ value: c, label: c })));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setLoading(false);
        // Optionally, add a toast notification for the user
        toast.error("Failed to load pending tickets.");
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    let temp = [...tickets];
    if (selectedSystem) {
      temp = temp.filter(ticket => ticket.SystemName === selectedSystem.value);
    }
    if (selectedCompany) {
      temp = temp.filter(ticket => ticket.CompanyName === selectedCompany.value);
    }
    setFilteredTickets(temp);
    setCurrentPage(1); // Reset to first page on filter change
  }, [selectedSystem, selectedCompany, tickets]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open": return "text-red-500";
      case "in progress": return "text-yellow-500";
      case "closed": return "text-green-500";
      case "pending": return "text-blue-500";
      default: return "";
    }
  };

  const handleTicketClick = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowTicketPopup(true);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <main className={`flex-1 min-h-screen bg-gray-100 p-6 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Pending Tickets</h1>

          <div className="flex gap-4 mb-4">
            <div className="w-64">
              <Select
                options={systemOptions}
                value={selectedSystem}
                onChange={setSelectedSystem}
                placeholder="Filter by System"
                isClearable
              />
            </div>
            <div className="w-64">
              <Select
                options={companyOptions}
                value={selectedCompany}
                onChange={setSelectedCompany}
                placeholder="Filter by Company"
                isClearable
              />
            </div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">System Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((ticket) => (
                <tr key={ticket.TicketID} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.TicketID}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{ticket.SystemName || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{ticket.CompanyName || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{ticket.UserName || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{ticket.DateTime ? new Date(ticket.DateTime).toLocaleString() : "N/A"}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <span className={getStatusColor(ticket.Status)}>
                      {ticket.Status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => handleTicketClick(ticket.TicketID)} className="text-blue-600 hover:text-blue-800 transition-colors" title="View Ticket Details">
                      <FaEdit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-end items-center mt-4 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-gray-700 text-sm mr-2">Entries per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <span className="text-gray-700 text-sm">
                {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredTickets.length)} of ${filteredTickets.length}`}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 text-sm"
                >
                  &lt;&lt;
                </button>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 text-sm"
                >
                  &lt;
                </button>
                <span className="text-gray-700 text-sm font-medium">{currentPage}</span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 text-sm"
                >
                  &gt;
                </button>
                <button
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 text-sm"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showTicketPopup && (
        <div className="fixed inset-0 z-50 bg-black/55 flex justify-center items-center">
          <div className="rounded-lg w-[90%] max-w-4xl relative">
            <div className="bg-white rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto relative z-10">
              <TicketViewPage
                ticketId={selectedTicketId}
                popupMode={true}
                onClose={() => setShowTicketPopup(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTicket;