import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient'; // Changed from axios to axiosClient
import { IoArrowBackCircleSharp } from "react-icons/io5";

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
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
    default: "64/64522.png"
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

const Ticket_secret = ({ ticket, onClose }) => {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [showDescModal, setShowDescModal] = useState(false);

  useEffect(() => {
    if (!ticket?.TicketID) return;
    // Use axiosClient and remove base URL
    axiosClient.get(`/evidence/${ticket.TicketID}`)
      .then(res => setEvidenceList(res.data))
      .catch(err => console.error("Evidence fetch failed", err));
  }, [ticket?.TicketID]);

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

  const handleDownload = (fileName) => {
    // Construct the URL using the base URL from axiosClient
    // The server needs to handle the /download_evidence endpoint
    const url = axiosClient.defaults.baseURL + `/download_evidence/${fileName}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Suggests the file name for download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/55 flex justify-center items-center"
        onClick={onClose}
      >
        <div className="rounded-lg w-[90%] max-w-4xl relative">
          <div
            className="bg-white rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto relative z-10 p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={onClose}
                className="flex items-center text-gray-600 hover:text-blue-700 p-2 rounded-sm font-bold"
              >
                <IoArrowBackCircleSharp className="w-7 h-7 mr-2" />
                <span>Back</span>
              </button>
            </div>

            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              Ticket Details
            </h2>

            <div className="space-x-10 space-y-2">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Ticket ID</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-800">#{ticket.TicketID}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">User Name</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-800">{ticket.UserName || "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className={`${getStatusColor(ticket.Status)} font-medium`}>{ticket.Status}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className={`${getPriorityColor(ticket.Priority)} font-medium`}>{ticket.Priority}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                {/* Truncated description with read more */}
                <div className="bg-gray-50 rounded-lg p-2 text-gray-800 text-justify relative">
                  <p
                    className="overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {ticket.Description}
                  </p>
                  <button
                    className="text-blue-600 cursor-pointer text-xs mt-1"
                    onClick={() => setShowDescModal(true)}
                  >
                    Read more
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
                <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                  {new Date(ticket.DateTime).toLocaleString()}
                </div>
              </div>

              {evidenceList.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Evidence Files</label>
                  <div className="flex flex-wrap gap-4">
                    {evidenceList.map((evi) => {
                      const filePath = evi.FilePath.replace(/\\/g, '/');
                      const fileName = filePath.split('/').pop();
                      // Use axiosClient's base URL for file URLs
                      const fileUrl = `${axiosClient.defaults.baseURL}/${filePath.startsWith("uploads/") ? filePath : "uploads/" + filePath}`;
                      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
                      const isVideo = /\.(mp4|webm|ogg)$/i.test(fileName);
                      const isAudio = /\.(mp3|wav|ogg)$/i.test(fileName);
                      const isPdf = /\.pdf$/i.test(fileName);
                      const isPreviewable = isImage || isVideo || isAudio || isPdf;

                      return (
                        <div
                          key={evi.EvidenceID}
                          onClick={() => {
                            if (isPreviewable) {
                              setPreviewUrl({
                                url: fileUrl,
                                name: fileName,
                                type: isImage ? 'image' : isVideo ? 'video' : isAudio ? 'audio' : 'pdf'
                              });
                            }
                          }}
                          title={isPreviewable ? "Click to preview" : "Download only"}
                          className="w-24 h-24 p-2 bg-gray-100 border rounded flex flex-col items-center justify-center cursor-pointer relative hover:shadow-md"
                        >
                          <div className="flex items-center justify-center w-full h-full">
                            {getFileIcon(fileName)}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent triggering preview when clicking Download
                              handleDownload(fileName);
                            }}
                            className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 mt-1"
                          >
                            Download
                          </button>
                        </div>

                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/edit_supervisors/${ticket.TicketID}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded ml-130"
              >
                Edit Supervisor
              </button>

              {ticket.UserNote && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">User Note</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-800">{ticket.UserNote}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Modal */}

      </div>

      {/* Full Description Modal */}
      {showDescModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 bg-opacity-60 p-4"
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
            <p className="whitespace-pre-wrap text-gray-800">{ticket.Description}</p>
          </div>
        </div>
      )}

      {/* 🔍 Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex bg-black/55 items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-white rounded-lg p-4 w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              <IoClose size={24} />
            </button>
            <h4 className="text-lg font-semibold mb-4">{previewUrl.name}</h4>
            <div className="mb-4 max-h-[400px] overflow-auto flex justify-center items-center w-full">
              {previewUrl.type === 'image' ? (
                <img src={previewUrl.url} alt={previewUrl.name} className="max-w-full max-h-96" />
              ) : previewUrl.type === 'video' ? (
                <video controls className="max-w-full max-h-96">
                  <source src={previewUrl.url} />
                </video>
              ) : previewUrl.type === 'audio' ? (
                <audio controls className="w-full">
                  <source src={previewUrl.url} />
                </audio>
              ) : (
                <iframe
                  src={previewUrl.url}
                  className="w-full h-[500px] border rounded"
                  title="PDF Preview"
                ></iframe>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleDownload(previewUrl.name)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Ticket_secret;