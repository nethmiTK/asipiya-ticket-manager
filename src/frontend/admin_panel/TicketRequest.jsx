import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TicketRequest = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = async (supervisorName) => {
    setLoading(true);
    setError(null);
    try {
      const url = supervisorName
        ? `http://localhost:5000/tickets/supervisor/${encodeURIComponent(supervisorName)}`
        : `http://localhost:5000/tickets`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message || "Unexpected error");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTickets(searchTerm.trim());
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleView = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleAccept = async (ticketID) => {
  try {
    const response = await fetch(`http://localhost:5000/tickets/accept/${ticketID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok) throw new Error("Failed to accept ticket");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text(); // inspect the HTML
      throw new Error(`Expected JSON, got: ${text.slice(0, 100)}`);
    }

    const data = await response.json(); // This line fails if the response is HTML
    alert("Ticket accepted!");
  } catch (error) {
    console.error("Failed to accept ticket:", error.message);
    alert("Error: " + error.message);
  }
};


  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/ticket-manage")}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          <span className="mr-2">Manage Tickets</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Support Requests</h2>

          <input
            type="text"
            placeholder="Search by Supervisor name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 p-2 border rounded w-full max-w-xs"
          />

          {loading && <p>Loading tickets...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-100 text-left">
                    <th className="py-3 px-4 border-b">Ticket ID</th>
                    <th className="py-3 px-4 border-b">Supervisor Name</th>
                    <th className="py-3 px-4 border-b">Date & Time</th>
                    <th className="py-3 px-4 border-b">Status</th>
                    <th className="py-3 px-4 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-gray-500">
                        No requests found.
                      </td>
                    </tr>
                  )}

                  {requests.map((req) => (
                    <tr key={req.TicketID} className="hover:bg-gray-50 transition duration-200">
                      <td className="py-3 px-4 border-b">{req.TicketID}</td>
                      <td className="py-3 px-4 border-b">{req.SupervisorName}</td>
                      <td className="py-3 px-4 border-b">{req.DateTime}</td>
                      <td className="py-3 px-4 border-b">{req.Status}</td>
                      <td className="py-3 px-4 border-b text-center">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                          onClick={() => handleView(req)}
                        >
                          View
                        </button>

                        {req.Status !== "Accepted" && (
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                            onClick={() => handleAccept(req.TicketID)}
                          >
                            Accept
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
              <button
                className="absolute top-2 right-3 text-xl font-bold text-gray-600 hover:text-red-500"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
              <h3 className="text-xl font-semibold mb-4">Request Details</h3>
              <p><strong>Ticket ID:</strong> {selectedRequest.TicketID}</p>
              <p><strong>Supervisor:</strong> {selectedRequest.SupervisorName}</p>
              <p className="my-2">
                <strong>Description:</strong>
                <br />
                <span className="block mt-1 text-gray-700">{selectedRequest.Description}</span>
              </p>
              <p><strong>Date & Time:</strong> {selectedRequest.DateTime}</p>
              <p><strong>Status:</strong> {selectedRequest.Status}</p>

              <div className="mt-6 flex justify-between">
                {selectedRequest.Status !== "Accepted" && (
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    onClick={() => handleAccept(selectedRequest.TicketID)}
                  >
                    Accept
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketRequest;
