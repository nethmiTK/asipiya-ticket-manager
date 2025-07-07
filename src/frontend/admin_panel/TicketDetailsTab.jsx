import React from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../axiosClient'; // Changed from axios to axiosClient

export default function TicketDetailsTab({
  selectedTicket,
  setSelectedTicket,
  user,
  setTickets,
  evidenceList,
  setShowProblemModal,
  showProblemModal,
}) {
  const handleUpdateTicket = async () => {
    try {
      const oldResolution = selectedTicket?.resolution || "";
      const newResolution = selectedTicket.resolution || "";

      // Use axiosClient for PUT request
      const res = await axiosClient.put(
        `/api/tickets/${selectedTicket.id}/resolution`, // Corrected endpoint for resolution update
        {
          resolution: newResolution,
          userId: user.UserID, // Pass userId for backend logging/notification
          oldResolution: oldResolution // Pass old resolution for backend logging
        }
      );

      // Check for successful response from axiosClient
      if (res.status !== 200) { // Axios typically returns status 200 for success
        throw new Error("Failed to update ticket");
      }

      toast.success("Ticket updated successfully!");

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
    // const oldStatus = selectedTicket.status; // Not used in this block after backend handles notification
    setSelectedTicket((prev) => ({
      ...prev,
      status: newStatus,
    }));
    try {
      // Use axiosClient for PUT request
      const res = await axiosClient.put(
        `/api/tickets/${selectedTicket.id}/status`,
        { status: newStatus, userId: user.UserID }
      );

      // Check for successful response from axiosClient
      if (res.status !== 200) { // Axios typically returns status 200 for success
        throw new Error("Failed to update status");
      }

      toast.success("Status updated successfully!");
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
    // const oldDueDate = selectedTicket.dueDate; // Not used in this block after backend handles notification
    setSelectedTicket((prev) => ({
      ...prev,
      dueDate: rawDate,
    }));
    try {
      // Use axiosClient for PUT request
      const res = await axiosClient.put(
        `/api/tickets/${selectedTicket.id}/due-date`,
        { dueDate: newDueDate, userId: user.UserID }
      );

      // Check for successful response from axiosClient
      if (res.status !== 200) { // Axios typically returns status 200 for success
        throw new Error("Failed to update due date");
      }

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

  const handleFileDownload = async (fileName) => {
      try {
        // For file downloads, if your backend's /download_evidence endpoint is also proxied
        // through axiosClient's base URL, you can use axiosClient here too.
        // Otherwise, keep it as fetch or adjust axiosClient's configuration.
        // Assuming it's still a direct path for simplicity if axiosClient isn't configured for blobs.
        const response = await fetch(
          `${axiosClient.defaults.baseURL}/api/download_evidence/${fileName}`
        );
        if (!response.ok) throw new Error("Download failed");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
  
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Download error:", error);
        alert("Download failed.");
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
          <div className="fixed inset-0 z-50 bg-black/55 flex justify-center items-center">
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
              // Construct the fileUrl using axiosClient's base URL
              const fileUrl = `${axiosClient.defaults.baseURL}/uploads/${evi.FilePath}`;
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

              return (
                <div
                  key={index}
                  className="border rounded p-2 bg-white shadow-sm flex flex-col items-center text-center justify-between"
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
                    <img
                      src="https://freesoft.ru/storage/images/729/7282/728101/728101_normal.png"
                      alt="File Icon"
                      className="w-20 h-20 object-contain mb-2"
                    />
                  )}
                  <p className="text-sm font-medium text-gray-800 text-center break-words mb-2 px-1">
                    {fileName}
                  </p>
                  <a
                    onClick={() => handleFileDownload(fileName)}
                    className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors duration-200"
                  >
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