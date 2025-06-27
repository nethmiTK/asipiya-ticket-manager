// TicketDetailsTab.jsx
import React from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
// You might need to import other components or hooks used within the details section
// e.g., useAuth if you use 'user' within this component for permissions or user-specific logic

export default function TicketDetailsTab({
  selectedTicket,
  setSelectedTicket,
  user, // Pass user if needed for permissions/logging
  setTickets, // Pass setTickets if you want this component to update the main ticket list
  evidenceList,
  setShowProblemModal,
  showProblemModal,
  // Add any other props that are currently used in the 'details' section
}) {
  const handleUpdateTicket = async () => {
    try {
      // Ensure 'tickets' is available in scope, likely passed as a prop or fetched
      // For now, assuming 'tickets' would be part of the component's state or props if needed here.
      // If 'tickets' is not a prop, you might need to fetch it or remove this specific logging logic
      // if it relies on comparing with an "originalTicket" that isn't readily available.
      // For this example, I'll comment out the 'originalTicket' finding if 'tickets' isn't explicitly passed.

      // const originalTicket = tickets.find(t => t.id === selectedTicket.id);
      // const oldResolution = originalTicket?.resolution || "";
      const oldResolution = selectedTicket?.resolution || ""; // Simpler, assumes selectedTicket already has the current state before update
      const newResolution = selectedTicket.resolution || "";
      const res = await fetch(
        `http://localhost:5000/tickets/${selectedTicket.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolution: newResolution,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update ticket");

      // Log the resolution update to ticket log if resolution was added/changed
      if (newResolution && newResolution !== oldResolution) {
        try {
          await axios.post('http://localhost:5000/api/ticket-logs', {
            ticketId: selectedTicket.id,
            type: 'RESOLUTION_UPDATE',
            description: `Resolution summary updated: ${newResolution.substring(0, 100)}${newResolution.length > 100 ? '...' : ''}`,
            userId: user.UserID,
            oldValue: oldResolution,
            newValue: newResolution
          });
        } catch (logError) {
          console.error("Failed to log resolution update:", logError);
        }
      }

      toast.success("Ticket updated successfully!");
      // If you want to close the modal or perform other actions after save
      // closeModal(); // You'd need to pass this as a prop if used

      // Check if setTickets prop is provided before attempting to use it
      if (setTickets) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? {
                ...t,
                resolution: selectedTicket.resolution,
              }
              : t
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update ticket");
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedTicket((prev) => ({
      ...prev,
      status: newStatus,
    }));
    try {
      const res = await fetch(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, userId: user.UserID }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");

      toast.success("Status updated successfully!");
      // Check if setTickets prop is provided before attempting to use it
      if (setTickets) {
        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            t.id === selectedTicket.id ? { ...t, status: newStatus } : t
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDueDateChange = async (e) => {
    const rawDate = e.target.value;
    const newDueDate = rawDate;
    setSelectedTicket((prev) => ({
      ...prev,
      dueDate: rawDate,
    }));
    try {
      const res = await fetch(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/due-date`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dueDate: newDueDate, userId: user.UserID }),
        }
      );
      if (!res.ok) throw new Error("Failed to update due date");

      // Check if setTickets prop is provided before attempting to use it
      if (setTickets) {
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === selectedTicket.id
              ? { ...ticket, dueDate: rawDate }
              : ticket
          )
        );
      }
      toast.success("Due date updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update due date");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Ticket #{selectedTicket.id} Details
        </h2>
        <p>
          <strong>Status:</strong> {selectedTicket.status}
        </p>
        <p>
          <strong>Date:</strong> {selectedTicket.date}
        </p>
        <p>
          <strong>Priority:</strong> {selectedTicket.priority}
        </p>
        <p className="text-sm">
          <strong>Problem:</strong>{" "}
          {selectedTicket.problem.length > 100 ? (
            <>
              {selectedTicket.problem.slice(0, 100)}...
              <button
                onClick={() => setShowProblemModal(true)}
                className="text-blue-600 hover:underline ml-1"
              >
                See More
              </button>
            </>
          ) : (
            selectedTicket.problem
          )}
        </p>
        {showProblemModal && (
          <div className="fixed inset-0 z-50 bg-black/40 bg-opacity-40 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[80vh]">
              <h2 className="text-lg font-semibold mb-4">
                Full Problem Description
              </h2>
              <div className="text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-60 pr-2">
                {selectedTicket.problem}
              </div>
              <div className="text-right mt-4">
                <button
                  onClick={() => setShowProblemModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <p>
          <strong>System Name:</strong>{" "}
          {selectedTicket.systemName}
        </p>
        <p>
          <strong>User Name:</strong> {selectedTicket.userName}
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">
            Change Status
          </label>
          <select
            value={selectedTicket.status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={selectedTicket.dueDate || ""}
            onChange={handleDueDateChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Resolution Summary
          </label>
          <textarea
            rows={3}
            value={selectedTicket.resolution || ""}
            onChange={(e) =>
              setSelectedTicket({
                ...selectedTicket,
                resolution: e.target.value,
              })
            }
            placeholder="Add summary..."
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div className="space-y-4 h-[430px]">
        <h4 className="font-semibold mb-2">Evidence Files</h4>
        {evidenceList.length === 0 ? (
          <p className="text-sm text-gray-500">
            No evidence files available.
          </p>
        ) : (
          <div className=" overflow-y-auto grid grid-cols-2 gap-4 p-2 border rounded bg-gray-50">
            {evidenceList.map((evi, index) => {
              const fileUrl = `http://localhost:5000/${evi.FilePath}`;
              const fileName = evi.FilePath.split("/").pop();

              const isImage =
                /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
                  fileName
                );
              const isPDF = /\.pdf$/i.test(fileName);
              const isVideo = /\.(mp4|webm|ogg)$/i.test(
                fileName
              );
              const isAudio = /\.(mp3|wav|ogg)$/i.test(
                fileName
              );
              // Removed isDoc as we will use a generic file icon for non-media/non-PDF
              // const isDoc = /\.(docx?|xlsx?)$/i.test(fileName);


              return (
                <div
                  key={index}
                  className="border rounded p-2 bg-white shadow-sm flex flex-col items-center text-center justify-between" // Added justify-between for consistent spacing
                >
                  {isImage ? (
                    <img src={fileUrl} alt={fileName} className="w-24 h-24 object-cover rounded mb-2" />
                  ) : isPDF ? (
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                      alt="PDF Icon"
                      className="w-20 h-20 object-contain mb-2"
                    />
                  ) : isVideo ? (
                    <video controls className="w-24 h-24 rounded mb-2" title={fileName}>
                      <source src={fileUrl} type={`video/${fileName.split(".").pop()}`} />
                      Your browser does not support the video tag.
                    </video>
                  ) : isAudio ? (
                    <audio controls className="w-full mb-2" title={fileName}>
                      <source src={fileUrl} type={`audio/${fileName.split(".").pop()}`} />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    // Generic file icon for other types (documents, etc.)
                    <img
                      src="https://freesoft.ru/storage/images/729/7282/728101/728101_normal.png" // A more common generic file icon
                      alt="File Icon"
                      className="w-20 h-20 object-contain mb-2"
                    />
                  )}
                  <p className="text-sm font-medium text-gray-800 text-center break-words mb-2 px-1">
                    {fileName}
                  </p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={fileName} // This attribute prompts for download
                    className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-between pt-2">
          <button onClick={handleUpdateTicket} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}