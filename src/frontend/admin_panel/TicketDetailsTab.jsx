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
      const originalTicket = tickets.find(t => t.id === selectedTicket.id);
      const oldResolution = originalTicket?.resolution || "";
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

      setTickets((prev) => // This requires setTickets to be passed as a prop
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                resolution: selectedTicket.resolution,
              }
            : t
        )
      );
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
      setTickets((prevTickets) => // This requires setTickets to be passed as a prop
        prevTickets.map((t) =>
          t.id === selectedTicket.id ? { ...t, status: newStatus } : t
        )
      );
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

      setTickets((prevTickets) => // This requires setTickets to be passed as a prop
        prevTickets.map((ticket) =>
          ticket.id === selectedTicket.id
            ? { ...ticket, dueDate: rawDate }
            : ticket
        )
      );
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
              const isDoc = /\.(docx?|xlsx?)$/i.test(fileName);

              return (
                <div
                  key={index}
                  className="border rounded p-2 bg-white shadow-sm flex flex-col items-center text-center"
                >
                  {isImage ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" >
                      <img src={fileUrl} alt={fileName} className="w-24 h-24 object-cover rounded hover:opacity-90 transition" />
                    </a>
                  ) : isPDF ? (
                    <div >
                    
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:underline"
                    >
                      <img
                              src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                              alt="PDF"
                              className="w-20 h-20 object-contain mb-1 justify-center items-center"
                            />
                    </a>
                    </div>
                  ) : isVideo ? (
                    <video controls className="w-24 h-24 rounded" title={fileName} >
                      <source src={fileUrl} type={`video/${fileName.split(".").pop()}`} />
                      Your browser does not support the video tag.
                    </video>
                  ) : isAudio ? (
                    <audio controls className="w-full" title={fileName} >
                      <source src={fileUrl} type={`audio/${fileName.split(".").pop()}`} />
                      Your browser does not support the audio element.
                    </audio>
                  ) : isDoc ? (
                    <div>
                    
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline" >
                      <img
                              src="https://img1.pnghut.com/0/6/19/Hcg4MhtqQZ/google-play-yellow-brand-pdf-android.jpg"
                              alt="DOC"
                              className="w-20 h-20 object-contain mb-1 justify-center items-center"
                            />
                    </a></div>
                  ) : (
                    <div>
                    
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" >
                      <img
                              src="https://img1.pnghut.com/0/6/19/Hcg4MhtqQZ/google-play-yellow-brand-pdf-android.jpg"
                              alt="TXT"
                              className="w-20 h-20 object-contain mb-1 justify-center items-center"
                            />
                    </a>
                    </div>
                  )}
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