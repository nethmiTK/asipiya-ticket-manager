import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate  } from "react-router-dom";
import axiosClient from "../axiosClient"; // Changed from axios to axiosClient
import ChatUI from "../../user_components/ChatUI/ChatUI";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";
import NotificationPanel from "../components/NotificationPanel";
import { IoClose } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";

const TicketDetails = () => {
  const { ticketId } = useParams();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [evidenceLoading, setEvidenceLoading] = useState(true);
  const [ticketError, setTicketError] = useState(null);
  const [evidenceError, setEvidenceError] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const notificationRef = useRef(null);

  const [activeTab, setActiveTab] = useState("details");

  const [previewUrl, setPreviewUrl] = useState(null);

  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  let parsedUser = null;
  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Failed to parse localStorage user:", err);
  }

  const iconBaseUrl = "https://cdn-icons-png.flaticon.com/512/";

  const getIconUrl = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    const iconMap = {
      pdf: "136/136522.png",
      xls: "732/732220.png",
      xlsx: "732/732220.png",
      doc: "888/888883.png",
      docx: "888/888883.png",
      ppt: "7817/7817494.png",
      pptx: "7817/7817494.png",
    };

    const iconPath = iconMap[extension] || null;
    return iconPath ? `${iconBaseUrl}${iconPath}` : null;
  };

  useEffect(() => {
    if (!ticketId) return;

    setTicketLoading(true);
    setTicketError(null);
    axiosClient // Changed from axios
      .get(`/userTicket/${ticketId}`)
      .then((res) => setTicket(res.data))
      .catch(() => setTicketError("Error fetching ticket details"))
      .finally(() => setTicketLoading(false));
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;

    setEvidenceLoading(true);
    setEvidenceError(null);
    axiosClient // Changed from axios
      .get(`/api/evidence/${ticketId}`)
      .then((res) => setEvidenceFiles(res.data))
      .catch(() => setEvidenceError("Error fetching evidence files"))
      .finally(() => setEvidenceLoading(false));
  }, [ticketId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const currentUserId = parsedUser?.UserID;
      if (!currentUserId) return;

      try {
        const response = await axiosClient.get( // Changed from axios
          `/api/notifications/count/${currentUserId}`
        );
        setUnreadNotifications(response.data.count);
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
      }
    };

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, [parsedUser]);

  const handleFileDownload = async (fileName) => {
    try {
      // For file downloads, if your backend's /download_evidence endpoint is also proxied
      // through axiosClient's base URL, you can use axiosClient here too.
      // Otherwise, keep it as fetch or adjust axiosClient's configuration.
      // Assuming it's still a direct path for simplicity if axiosClient isn't configured for blobs.
      const response = await fetch(
        `http://localhost:5000/download_evidence/${fileName}`
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

  // Handle tab query parameter from notification links
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam && (tabParam === "details" || tabParam === "chat")) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  if (ticketLoading) return <p>Loading ticket details...</p>;
  if (ticketError) return <p className="text-red-600">{ticketError}</p>;
  if (!ticket) return <p>No ticket found.</p>;

  // Calculate fixed height for details/chat container: total viewport height minus navbar & padding (navbar ~60px, padding ~48px)
  const fixedHeight = "calc(100vh - 60px - 48px)"; // adjust as needed

  return (
    <div className="flex">
      <SideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <div
        className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300
          ml-0
          lg:ml-20 ${isSidebarOpen ? "lg:ml-72" : ""}`}
      >
        <NavBar
          isSidebarOpen={isSidebarOpen}
          showNotifications={showNotifications}
          unreadNotifications={unreadNotifications}
          setShowNotifications={setShowNotifications}
          notificationRef={notificationRef}
          setOpen={setIsSidebarOpen}
        />

  <div className="px-6 pt-4 mt-[60px]"> {/* Added mt-[60px] here */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 font-semibold text-lg transition duration-200 focus:outline-none"
        aria-label="Go back"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
    </div>

        <div className="p-6">
          {showNotifications && (
            <div
              ref={notificationRef}
              className="absolute right-4 top-[70px] z-50"
            >
              <NotificationPanel
                userId={parsedUser?.UserID}
                role={parsedUser?.Role}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}

          {/* <h2 className="text-2xl font-bold mb-4">Ticket Details</h2> */}

          <div className="flex lg:hidden justify-between border-b mb-4">
            <button
              onClick={() => setActiveTab("details")}
              className={`w-1/2 py-2 text-center font-medium ${
                activeTab === "details"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`w-1/2 py-2 text-center font-medium ${
                activeTab === "chat"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Chat
            </button>
          </div>

          {activeTab === "details" && (
            <div
              className="lg:hidden bg-gray-100 border border-zinc-300 rounded-lg shadow-lg p-4 mb-4 overflow-auto"
              style={{ height: fixedHeight }}
            >
              <div className="space-y-3 text-lg text-justify">
                <p>
                  <strong>Ticket ID:</strong> {ticket.id}
                </p>
                <p>
                  <strong>Status:</strong> {ticket.status}
                </p>
                <p>
                  <strong>Description:</strong> {ticket.description}
                </p>
                <p>
                  <strong>System Name:</strong> {ticket.system_name}
                </p>
                <p>
                  <strong>Category:</strong> {ticket.category}
                </p>
                <p>
                  <strong>Date & Time:</strong>{" "}
                  {new Date(ticket.datetime).toLocaleString()}
                </p>
                <p>
                  <strong>Supervisor:</strong>{" "}
                  {ticket.supervisor_name || "Not Assigned"}
                </p>
                <p>
                  <strong>Supervisor Last Responded Time:</strong>{" "}
                  {ticket.LastRespondedTime
                    ? new Date(ticket.LastRespondedTime).toLocaleString()
                    : "No responses yet"}
                </p>

                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4">Evidence Files</h3>
                  {evidenceLoading ? (
                    <p>Loading evidence files...</p>
                  ) : evidenceError ? (
                    <p className="text-red-600">{evidenceError}</p>
                  ) : evidenceFiles.length === 0 ? (
                    <p>No evidence files available.</p>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {evidenceFiles.map((file) => {
                        const filePath = file.FilePath || file.filepath || "";
                        const fileUrl = `http://localhost:5000/${filePath.replace(
                          /\\/g,
                          "/"
                        )}`;
                        const fileName = fileUrl.split("/").pop();
                        const lowerName = fileName.toLowerCase();
                        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
                          lowerName
                        );
                        const isVideo = /\.(mp4|webm|ogg)$/i.test(lowerName);
                        const isAudio = /\.(mp3|wav|ogg)$/i.test(lowerName);
                        const isPdf = /\.pdf$/i.test(lowerName);
                        const isPreviewable =
                          isImage || isVideo || isAudio || isPdf;
                        const iconUrl = getIconUrl(fileName);

                        return (
                          <div
                            key={file.EvidenceID || file.id || fileName}
                            className="w-25 h-25 border rounded-lg p-2 shadow-md bg-gray-100 flex flex-col items-center justify-between relative overflow-hidden"
                          >
                            <div
                              className="w-full h-full flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                if (!isPreviewable) return;
                                setPreviewUrl({
                                  url: fileUrl,
                                  name: fileName,
                                  type: isImage
                                    ? "image"
                                    : isVideo
                                    ? "video"
                                    : isAudio
                                    ? "audio"
                                    : isPdf
                                    ? "pdf"
                                    : "other",
                                });
                              }}
                              title={
                                isPreviewable
                                  ? "Click to preview"
                                  : "Download only"
                              }
                            >
                              {isImage ? (
                                <img
                                  src={fileUrl}
                                  alt={fileName}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : isVideo ? (
                                <video
                                  muted
                                  className="w-full h-full object-cover rounded"
                                >
                                  <source src={fileUrl} />
                                </video>
                              ) : isAudio ? (
                                <div className="text-sm text-gray-700">
                                  🎵 Audio
                                </div>
                              ) : iconUrl ? (
                                <img
                                  src={iconUrl}
                                  alt={`${fileName} icon`}
                                  className="w-10 h-10"
                                />
                              ) : (
                                <div className="text-xs text-gray-600">
                                  No preview
                                </div>
                              )}
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
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div
              className="lg:hidden bg-white border border-zinc-300 rounded-lg shadow-lg p-4 overflow-auto"
              style={{ height: fixedHeight }}
            >
              <h2 className="font-bold text-xl mb-2">Chat</h2>
              <ChatUI ticketID={ticket.id} />
            </div>
          )}

          {/* Desktop layout */}
          <div className="hidden lg:grid grid-cols-2 gap-4" style={{ height: fixedHeight }}>
            <div
              className="bg-gray-100 border h-180 border-zinc-300 rounded-lg shadow-lg p-4 overflow-auto"
            >
              <h2 className="text-2xl font-bold mb-4">Ticket Details</h2>
              <div className="space-y-3 text-lg text-justify">
                <p>
                  <strong>Ticket ID:</strong> {ticket.id}
                </p>
                <p>
                  <strong>Status:</strong> {ticket.status}
                </p>
                <p>
                  <strong>Description:</strong> {ticket.description}
                </p>
                <p>
                  <strong>System Name:</strong> {ticket.system_name}
                </p>
                <p>
                  <strong>Category:</strong> {ticket.category}
                </p>
                <p>
                  <strong>Date & Time:</strong>{" "}
                  {new Date(ticket.datetime).toLocaleString()}
                </p>
                <p>
                  <strong>Supervisor:</strong>{" "}
                  {ticket.supervisor_name || "Not Assigned"}
                </p>
                <p>
                  <strong>Supervisor Last Responded Time:</strong>{" "}
                  {ticket.LastRespondedTime
                    ? new Date(ticket.LastRespondedTime).toLocaleString()
                    : "No responses yet"}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Evidence Files</h3>
                {evidenceLoading ? (
                  <p>Loading evidence files...</p>
                ) : evidenceError ? (
                  <p className="text-red-600">{evidenceError}</p>
                ) : evidenceFiles.length === 0 ? (
                  <p>No evidence files available.</p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {evidenceFiles.map((file) => {
                      const filePath = file.FilePath || file.filepath || "";
                      const fileUrl = `http://localhost:5000/${filePath.replace(
                        /\\/g,
                        "/"
                      )}`;
                      const fileName = fileUrl.split("/").pop();
                      const lowerName = fileName.toLowerCase();

                      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
                        lowerName
                      );
                      const isVideo = /\.(mp4|webm|ogg)$/i.test(lowerName);
                      const isAudio = /\.(mp3|wav|ogg)$/i.test(lowerName);
                      const isPdf = /\.pdf$/i.test(lowerName);
                      const isPreviewable =
                        isImage || isVideo || isAudio || isPdf;

                      const iconUrl = getIconUrl(fileName);

                      return (
                        <div
                          key={file.EvidenceID || file.id || fileName}
                          className="w-25 h-25 border rounded-lg p-2 shadow-md bg-gray-100 flex flex-col items-center justify-between relative overflow-hidden"
                        >
                          <div
                            className="w-full h-full flex items-center justify-center cursor-pointer"
                            onClick={() => {
                              if (!isPreviewable) return;
                              setPreviewUrl({
                                url: fileUrl,
                                name: fileName,
                                type: isImage
                                  ? "image"
                                  : isVideo
                                  ? "video"
                                  : isAudio
                                  ? "audio"
                                  : isPdf
                                  ? "pdf"
                                  : "other",
                              });
                            }}
                            title={
                              isPreviewable
                                ? "Click to preview"
                                : "Download only"
                            }
                          >
                            {isImage ? (
                              <img
                                src={fileUrl}
                                alt={fileName}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : isVideo ? (
                              <video
                                muted
                                className="w-full h-full object-cover rounded"
                              >
                                <source src={fileUrl} />
                              </video>
                            ) : isAudio ? (
                              <div className="text-sm text-gray-700">
                                🎵 Audio
                              </div>
                            ) : iconUrl ? (
                              <img
                                src={iconUrl}
                                alt={`${fileName} icon`}
                                className="w-10 h-10"
                              />
                            ) : (
                              <div className="text-xs text-gray-600">
                                No preview
                              </div>
                            )}
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
                )}
              </div>
            </div>

            <div
              className="bg-white border h-180 border-zinc-300 rounded-lg shadow-lg p-4 overflow-auto"
            >
              <h2 className="text-2xl font-bold mb-4">Chat</h2>
              <ChatUI ticketID={ticket.id} />
            </div>
          </div>

          {previewUrl && (
            <div className="fixed inset-0 z-50 flex bg-black/25 items-center justify-center p-4">
              <div className="bg-gray-100 rounded-lg p-4 w-full max-w-2xl mx-auto relative">
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-black"
                >
                  <IoClose size={24} />
                </button>

                <h4 className="text-lg font-semibold mb-4">
                  {previewUrl.name}
                </h4>

                <div className="mb-4 max-h-[400px] overflow-auto flex justify-center items-center w-full">
                  {previewUrl.type === "image" ? (
                    <img
                      src={previewUrl.url}
                      alt={previewUrl.name}
                      className="max-w-full max-h-96"
                    />
                  ) : previewUrl.type === "video" ? (
                    <video controls className="max-w-full max-h-96">
                      <source src={previewUrl.url} />
                    </video>
                  ) : previewUrl.type === "audio" ? (
                    <audio controls className="w-full">
                      <source src={previewUrl.url} />
                    </audio>
                  ) : previewUrl.type === "pdf" ? (
                    <iframe
                      src={previewUrl.url}
                      className="w-full h-[500px] border rounded"
                      title="PDF Preview"
                    ></iframe>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Cannot preview this file type.
                    </div>
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
      </div>
    </div>
  );
};

export default TicketDetails;