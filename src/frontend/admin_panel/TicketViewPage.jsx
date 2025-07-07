// TicketViewPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import { toast } from "react-toastify";
import { IoClose, IoArrowBackCircleSharp } from "react-icons/io5";
import { useAuth } from "../../App.jsx";

const getFileIcon = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  const iconBaseUrl = "https://cdn-icons-png.flaticon.com/512/";
  const iconMap = {
    pdf: "136/136522.png",
    doc: "888/888883.png",
    docx: "888/888883.png",
    xls: "732/732220.png",
    xlsx: "732/732220.png",
    ppt: "7817/7817494.png",
    pptx: "7817/7817494.png",
    txt: "8243/8243060.png",
    zip: "337/337960.png",
    rar: "337/337960.png",
    "7z": "337/337960.png",
    mp3: "651/651717.png",
    wav: "651/651717.png",
    flac: "651/651717.png",
    mp4: "10278/10278992.png",
    avi: "10278/10278992.png",
    mov: "10278/10278992.png",
    mkv: "10278/10278992.png",
    jpg: "1829/1829586.png",
    jpeg: "1829/1829586.png",
    png: "1829/1829586.png",
    gif: "1829/1829586.png",
    bmp: "1829/1829586.png",
    default: "64/64522.png",
  };

  const iconPath = iconMap[extension] || iconMap.default;

  return (
    <img
      src={`${iconBaseUrl}${iconPath}`}
      alt={`${extension.toUpperCase()} icon`}
      className="w-6 h-6"
    />
  );
};

const TicketViewPage = ({ ticketId, popupMode = false, onClose }) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { loggedInUser: user } = useAuth();
  const id = popupMode ? ticketId : routeId;

  const [ticketData, setTicketData] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDescModal, setShowDescModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReasonDropdown, setRejectReasonDropdown] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketRes = await axiosClient.get(`/api/ticket_view/${id}`);
        setTicketData(ticketRes.data);

        const evidenceRes = await axiosClient.get(`/api/evidence/${id}`);
        setEvidenceList(evidenceRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileDownload = async (fileName) => {
    try {
      const response = await axiosClient.get(`/api/download_evidence/${fileName}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed.");
    }
  };

  const handlePreview = async (fileName, type) => {
    try {
      const response = await axiosClient.get(`/api/download_evidence/${fileName}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const objectUrl = URL.createObjectURL(blob);

      setPreviewUrl({
        url: objectUrl,
        name: fileName,
        type,
      });
    } catch (err) {
      console.error("Preview error:", err);
      toast.error("Failed to preview file");
    }
  };

  const handleReject = async () => {
    const finalReason =
      rejectReasonDropdown === "Add Note"
        ? rejectNote.trim()
        : rejectReasonDropdown;

    if (!finalReason) {
      toast.error("Please provide a reason to reject.");
      return;
    }

    try {
      const response = await axiosClient.put(`/api/ticket_status/${id}`, {
        status: "Rejected",
        reason: finalReason,
        userId: user?.UserID,
      });

      if (response.status === 200 || response.status === 204) {
        toast.success("Ticket rejected successfully");
        popupMode ? onClose() : navigate(-1);
      } else {
        toast.error("Failed to reject the ticket");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while rejecting the ticket");
    } finally {
      setShowRejectModal(false);
      setRejectReasonDropdown("");
      setRejectNote("");
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => (popupMode ? onClose() : navigate(-1))}
          className="flex items-center text-gray-600 hover:text-blue-700 p-2 rounded-sm font-bold"
        >
          <IoArrowBackCircleSharp className="w-7 h-7 mr-2" />
          <span>Back</span>
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-center mb-8">
        Ticket Details
      </h2>

      <div className="space-x-15 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Ticket ID
            </label>
            <div className="bg-gray-50 rounded-lg p-2 text-gray-800">
              #{ticketData.TicketID}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              User Name
            </label>
            <div className="bg-gray-50 rounded-lg p-2 text-gray-800">
              {ticketData.UserName}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Status
            </label>
            <div className="bg-gray-50 rounded-lg p-2 text-gray-800">
              {ticketData.Status}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Priority
            </label>
            <div className="bg-gray-50 rounded-lg p-2 text-gray-800">
              {ticketData.Priority}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description
            </label>
            <div className="bg-gray-50 rounded-lg p-2 text-gray-800 text-justify relative">
              <p
                className="overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {ticketData.Description}
              </p>
              <button
                className="text-blue-600 cursor-pointer text-xs mt-1"
                onClick={() => setShowDescModal(true)}
              >
                Read more
              </button>
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Created At
            </label>
            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
              {new Date(ticketData.DateTime).toLocaleString()}
            </div>
          </div>
        </div>

        {evidenceList.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-4">Evidence Files</h3>
            <div className="flex flex-wrap gap-4">
              {evidenceList.map((evi) => {
                const filePath = evi.FilePath.replace(/\\/g, "/");
                const fileName = filePath.split("/").pop();
                const extension = fileName.split(".").pop().toLowerCase();

                const isImage = [
                  "jpg",
                  "jpeg",
                  "png",
                  "gif",
                  "bmp",
                  "webp",
                ].includes(extension);
                const isVideo = ["mp4", "webm", "ogg"].includes(extension);
                const isAudio = ["mp3", "wav", "ogg"].includes(extension);
                const isPdf = extension === "pdf";

                return (
                  <div
                    key={evi.EvidenceID}
                    className="w-25 h-25 border rounded-lg p-2 shadow-md bg-gray-100 flex flex-col items-center justify-between relative"
                  >
                    <div
                      className="w-full h-full flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        const type = isImage
                          ? "image"
                          : isVideo
                          ? "video"
                          : isAudio
                          ? "audio"
                          : isPdf
                          ? "pdf"
                          : null;

                        if (!type) {
                          toast.info(
                            "This file type cannot be previewed. Please download it."
                          );
                          return;
                        }

                        handlePreview(fileName, type);
                      }}
                      title="Click to preview"
                    >
                      {getFileIcon(fileName)}
                    </div>

                    <button
                      onClick={() => handleFileDownload(fileName)}
                      className="absolute bottom-1 right-1 text-xs bg-blue-600 text-white px-1 py-0.5 rounded hover:bg-blue-700"
                    >
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 ml-86 mt-8">
        <button
          onClick={() => setShowRejectModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
        >
          Reject
        </button>
        <button
          onClick={() => navigate(`/supervisor_assign/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Assign Supervisor
        </button>
      </div>

      {showDescModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          onClick={() => setShowDescModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-[80vh] max-h-[70vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setShowDescModal(false)}
            >
              <IoClose size={24} />
            </button>
            <p className="whitespace-pre-wrap text-gray-800">
              {ticketData.Description}
            </p>
          </div>
        </div>
      )}

      {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55">
                    <div className="bg-gray-200 p-6 rounded-lg w-full max-w-md relative">
                        <button
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectReasonDropdown('');
                                setRejectNote('');
                            }}
                            className="absolute top-2 right-2 text-gray-600 hover:text-black"
                        >
                            <IoClose size={24} />
                        </button>
                        <h3 className="text-lg font-semibold mb-4">Reject Ticket</h3>

                        <label className="block font-medium mb-1">Select Reason</label>
                        <select
                            value={rejectReasonDropdown}
                            onChange={(e) => {
                                setRejectReasonDropdown(e.target.value);
                                if (e.target.value !== 'Add Note') setRejectNote('');
                            }}
                            className="w-full mb-4 p-3 border border-black rounded"
                        >
                            <option value="">-- Choose Reason --</option>
                            <option value="Incomplete Information">Incomplete Information</option>
                            <option value="Invalid Request">Invalid Request</option>
                            <option value="Duplicate Ticket">Duplicate Ticket</option>
                            <option value="Not a Bug">Not a Bug</option>
                            <option value="Already Fixed">Already Fixed</option>
                            <option value="Feature Request Misclassified as Bug">Feature Request Misclassified as Bug</option>
                            <option value="Add Note">Add Note</option>
                        </select>

                        {rejectReasonDropdown === 'Add Note' && (
                            <>
                                <label className="block font-medium mb-1">Custom Note</label>
                                <textarea
                                    value={rejectNote}
                                    onChange={(e) => setRejectNote(e.target.value)}
                                    className="w-full mb-4 p-3 border border-black rounded"
                                    rows={4}
                                    placeholder="Write your custom reason here..."
                                />
                            </>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReasonDropdown('');
                                    setRejectNote('');
                                }}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                disabled={!rejectReasonDropdown || (rejectReasonDropdown === 'Add Note' && !rejectNote.trim())}
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
      )}


      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex bg-black/55 items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-gray-100 rounded-lg p-4 w-full max-w-2xl mx-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setPreviewUrl(null)}
            >
              <IoClose size={24} />
            </button>

            <h4 className="text-lg font-semibold mb-4">{previewUrl.name}</h4>
            <div className="mb-4 max-h-[400px] overflow-auto flex justify-center items-center w-full">
              {previewUrl.type === "image" && (
                <img
                  src={previewUrl.url}
                  alt={previewUrl.name}
                  className="max-w-full max-h-96"
                />
              )}
              {previewUrl.type === "video" && (
                <video controls className="max-w-full max-h-96">
                  <source src={previewUrl.url} />
                </video>
              )}
              {previewUrl.type === "audio" && (
                <audio controls className="w-full">
                  <source src={previewUrl.url} />
                </audio>
              )}
              {previewUrl.type === "pdf" && (
                <iframe
                  src={previewUrl.url}
                  className="w-full h-[500px] border rounded"
                  title="PDF Preview"
                ></iframe>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleFileDownload(previewUrl.name)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketViewPage;
