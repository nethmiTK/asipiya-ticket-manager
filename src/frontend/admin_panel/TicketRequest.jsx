import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Sample data
const sampleRequests = [
  {
    id: 1,
    companyName: "Asipiya Soft Solutions Pvt Ltd",
    userName: "Mr. Roy",
    description:
      "A bud in a system refers to a potential point of growth or improvement within an existing structure...",
    dateTime: "20/05/2025 14:34:19",
    status: "Pending",
  },
  {
    id: 2,
    companyName: "CodeWaves Pvt Ltd",
    userName: "Mr. Kamal",
    description: "Facing issues with the login module of HRMS system.",
    dateTime: "20/05/2025 15:05:43",
    status: "Pending",
  },
];

const TicketRequest = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(sampleRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const updateStatus = (id, newStatus) => {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    setRequests(updated);
  };

  const handleAccept = (id) => updateStatus(id, "Accepted");

  const handleView = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">
            Support Requests
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-100 text-left">
                  <th className="py-3 px-4 border-b">Company Name</th>
                  <th className="py-3 px-4 border-b">User Name</th>
                  <th className="py-3 px-4 border-b">Date & Time</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 transition duration-200"
                  >
                    <td className="py-3 px-4 border-b">{req.companyName}</td>
                    <td className="py-3 px-4 border-b">{req.userName}</td>
                    <td className="py-3 px-4 border-b">{req.dateTime}</td>
                    <td className="py-3 px-4 border-b">{req.status}</td>
                    <td className="py-3 px-4 border-b text-center space-x-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        onClick={() => handleAccept(req.id)}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        onClick={() => handleView(req)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-gray-500"
                    >
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
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
              <p>
                <strong>Company:</strong> {selectedRequest.companyName}
              </p>
              <p>
                <strong>User:</strong> {selectedRequest.userName}
              </p>
              <p className="my-2">
                <strong>Description:</strong>
                <br />
                <span className="block mt-1 text-gray-700">
                  {selectedRequest.description}
                </span>
              </p>
              <p>
                <strong>Date & Time:</strong> {selectedRequest.dateTime}
              </p>
              <p>
                <strong>Status:</strong> {selectedRequest.status}
              </p>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    handleAccept(selectedRequest.id);
                    setShowModal(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded"
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
