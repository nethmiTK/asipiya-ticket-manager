import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Formik, Form, Field } from "formik";
import axiosClient from "../axiosClient"; // Changed to axiosClient
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";
import NotificationPanel from "../components/NotificationPanel";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

// Helper function to enhance files with preview URLs
const enhanceFilesWithPreview = (acceptedFiles) =>
    acceptedFiles.map((file) =>
        Object.assign(file, {
            preview: URL.createObjectURL(file),
        })
    );

// Helper function to get file icon based on file type using image URLs
const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconBaseUrl = "https://cdn-icons-png.flaticon.com/512/"; // Base URL for Flaticon 512x512 icons

    switch (extension) {
        case 'pdf': return <img src={`${iconBaseUrl}136/136522.png`} alt="PDF icon" className="w-5 h-5" />;
        case 'doc':
        case 'docx': return <img src={`${iconBaseUrl}888/888883.png`} alt="Word icon" className="w-5 h-5" />;
        case 'xls':
        case 'xlsx': return <img src={`${iconBaseUrl}732/732220.png`} alt="Excel icon" className="w-5 h-5" />;
        case 'ppt':
        case 'pptx': return <img src={`${iconBaseUrl}7817/7817494.png`} alt="PowerPoint icon" className="w-5 h-5" />;
        case 'txt': return <img src={`${iconBaseUrl}8243/8243060.png`} alt="Text icon" className="w-5 h-5" />;
        case 'zip':
        case 'rar':
        case '7z': return <img src={`${iconBaseUrl}337/337960.png`} alt="Archive icon" className="w-5 h-5" />;
        case 'mp3':
        case 'wav':
        case 'flac': return <img src={`${iconBaseUrl}651/651717.png`} alt="Audio icon" className="w-5 h-5" />;
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'mkv': return <img src={`${iconBaseUrl}10278/10278992.png`} alt="Video icon" className="w-5 h-5" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp': return <img src={`${iconBaseUrl}1829/1829586.png`} alt="Image icon" className="w-5 h-5" />;
        default: return <img src={`${iconBaseUrl}64/64522.png`} alt="File icon" className="w-5 h-5" />;
    }
};

// Helper function to check if file can be previewed in browser
const canPreviewFile = (file) => {
    // Only return true for file types that browsers natively support for direct preview.
    return file.type.startsWith('image/') ||
        file.type.startsWith('video/') ||
        file.type.startsWith('audio/') ||
        file.type === 'application/pdf';
};
const PreviewModal = ({ previewFile, onClose }) => {
    const previewRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!previewFile) return;

        const renderOfficeDocument = async () => {
            try {
                setLoading(true);

                if (previewFile.type.includes('wordprocessingml.document') ||
                    previewFile.type === 'application/msword') {
                    // Word document preview
                    const { renderAsync } = await import('docx-preview');
                    const arrayBuffer = await previewFile.arrayBuffer();
                    await renderAsync(arrayBuffer, previewRef.current);
                }
                else if (previewFile.type.includes('spreadsheetml.sheet') ||
                    previewFile.type === 'application/vnd.ms-excel') {
                    // Excel preview
                    const XLSX = await import('xlsx');
                    const arrayBuffer = await previewFile.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer);
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const html = XLSX.utils.sheet_to_html(worksheet);
                    previewRef.current.innerHTML = html;
                }
                else if (previewFile.type.includes('presentationml.presentation') ||
                    previewFile.type === 'application/vnd.ms-powerpoint') {
                    // PowerPoint preview
                    previewRef.current.innerHTML = '<p class="text-yellow-500 text-center py-4">PowerPoint preview is not supported at the moment. Please download the file instead.</p>'; // Add a fallback message
                }
            } catch (error) {
                console.error('Error rendering document:', error);
                previewRef.current.innerHTML = '<p class="text-red-500">Error previewing document. Please download instead.</p>';
            } finally {
                setLoading(false);
            }
        };

        if (previewFile.type.includes('officedocument') ||
            previewFile.type === 'application/msword' ||
            previewFile.type === 'application/vnd.ms-excel' ||
            previewFile.type === 'application/vnd.ms-powerpoint') {
            renderOfficeDocument();
        }

        return () => {
        };
    }, [previewFile]);

    if (!previewFile) return null;

    const isImage = previewFile.type.startsWith('image/');
    const isVideo = previewFile.type.startsWith('video/');
    const isPdf = previewFile.type === 'application/pdf';
    const isAudio = previewFile.type.startsWith('audio/');
    const isOfficeDoc = previewFile.type.includes('officedocument') ||
        previewFile.type === 'application/msword' ||
        previewFile.type === 'application/vnd.ms-excel';

    const iconBaseUrl = "https://cdn-icons-png.flaticon.com/512/";

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/55 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-medium flex items-center">
                        {isImage && <img src={`${iconBaseUrl}1829/1829586.png`} alt="Image icon" className="mr-2 w-5 h-5" />}
                        {isVideo && <img src={`${iconBaseUrl}10278/10278992.png`} alt="Video icon" className="mr-2 w-5 h-5" />}
                        {isPdf && <img src={`${iconBaseUrl}136/136522.png`} alt="PDF icon" className="mr-2 w-5 h-5" />}
                        {isAudio && <img src={`${iconBaseUrl}651/651717.png`} alt="Audio icon" className="mr-2 w-5 h-5" />}
                        {isOfficeDoc && <img src={`${iconBaseUrl}888/888883.png`} alt="Office document icon" className="mr-2 w-5 h-5" />}
                        {previewFile.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    {loading && isOfficeDoc && (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading document...</span>
                        </div>
                    )}

                    {isImage && (
                        <img
                            src={previewFile.preview}
                            alt={previewFile.name}
                            className="max-w-full max-h-[70vh] mx-auto object-contain"
                        />
                    )}
                    {isVideo && (
                        <video
                            src={previewFile.preview}
                            controls
                            className="max-w-full max-h-[70vh] mx-auto"
                        />
                    )}
                    {isPdf && (
                        <iframe
                            src={previewFile.preview}
                            className="w-full h-[70vh] border-0"
                            title={previewFile.name}
                        />
                    )}
                    {isAudio && (
                        <audio
                            src={previewFile.preview}
                            controls
                            className="w-full max-w-md mx-auto mt-8"
                        />
                    )}
                    {isOfficeDoc && (
                        <div
                            ref={previewRef}
                            className="w-full h-[70vh] overflow-auto border p-4"
                        ></div>
                    )}
                </div>
            </div>
        </div>
    );
};

const OpenTickets = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const [systemNames, setSystemNames] = useState([]);
    const [categoryName, setCategoryName] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const notificationRef = useRef(null);

    // Loading state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Custom dropdown states
    const [isSystemDropdownOpen, setIsSystemDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [selectedSystem, setSelectedSystem] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    // File dropdown states
    const [fileDropdownStates, setFileDropdownStates] = useState({});

    // Refs for dropdown click outside detection
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
    const systemDropdownRef = useRef(null);
    const categoryDropdownRef = useRef(null);

    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (systemDropdownRef.current && !systemDropdownRef.current.contains(event.target)) {
                setIsSystemDropdownOpen(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCategoryDropdownOpen(false);
            }
            if (!event.target.closest('.file-dropdown')) {
                setFileDropdownStates({});
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchUnreadNotifications = async () => {
            const storedUser = localStorage.getItem("user");
            const userId = storedUser ? JSON.parse(storedUser).UserID : null;

            if (!userId) return;

            try {
                // Use axiosClient and remove base URL
                const response = await axiosClient.get(`/api/notifications/count/${userId}`);
                setUnreadNotifications(response.data.count);
            } catch (error) {
                console.error('Error fetching unread notifications:', error);
            }
        };

        fetchUnreadNotifications();
        const interval = setInterval(fetchUnreadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // File handling
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            const newFiles = acceptedFiles.filter(
                newFile => !files.some(existingFile =>
                    existingFile.name === newFile.name && existingFile.size === newFile.size
                )
            );
            setFiles(prev => [...prev, ...enhanceFilesWithPreview(newFiles)]);
        },
        multiple: true,
        accept: undefined,
    });

    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setFileDropdownStates(prev => {
            const newState = { ...prev };
            delete newState[index];
            return newState;
        });
    };

    const handleFileDropdownToggle = (index, event) => {
        event.stopPropagation();
        event.preventDefault();

        const rect = event.currentTarget.getBoundingClientRect();
        setDropdownPosition({
            x: rect.left,
            y: rect.bottom + window.scrollY
        });

        setFileDropdownStates(prev => ({
            [index]: !prev[index]
        }));
    };

    const handleFileOpen = async (file) => {
        if (canPreviewFile(file)) {
            setPreviewFile(file);
            setIsPreviewOpen(true);
        } else {
            toast.info('This file type cannot be previewed. Please download it instead.');
        }
        setFileDropdownStates({});
    };

    const handleFileDownload = (file) => {
        const link = document.createElement('a');
        link.href = file.preview;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setFileDropdownStates({});
    };

    const fetchSystems = async () => {
        try {
            // Use axiosClient and remove base URL
            const res = await axiosClient.get("/system_registration");
            const activeSystems = res.data.filter(system => system.Status === 1);
            setSystemNames(activeSystems);
        } catch (error) {
            console.error("Error fetching systems:", error);
        }
    };

    useEffect(() => {
        fetchSystems();
    }, []);

    const fetchCategory = async () => {
        try {
            // Use axiosClient and remove base URL
            const res = await axiosClient.get("/ticket_category");
            const activeCategories = res.data.filter(cat => cat.Status === 1);
            setCategoryName(activeCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, []);

    // Clean up object URLs
    useEffect(() => {
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

  return (
    <div className="flex">
      <title>Create Ticket</title>
      <SideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ml-0 lg:ml-20 ${isSidebarOpen ? 'lg:ml-72' : ''}`}>
        <NavBar
          isSidebarOpen={isSidebarOpen}
          showNotifications={showNotifications}
          unreadNotifications={unreadNotifications}
          setShowNotifications={setShowNotifications}
          notificationRef={notificationRef}
          setOpen={setIsSidebarOpen}
        />

        <div className="p-6 mt-[60px] relative">
          {showNotifications && (
            <div ref={notificationRef} className="absolute right-4 top-[70px] z-50">
              <NotificationPanel
                userId={JSON.parse(localStorage.getItem("user"))?.UserID}
                role={JSON.parse(localStorage.getItem("user"))?.Role}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}

          {isSubmitting && (
            <div className="absolute inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-40">
              <div className="bg-white p-6 rounded-lg shadow-xl border w-80">
                <div className="text-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-lg font-medium text-gray-800">Submitting your ticket...</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 text-center">{uploadProgress}% Complete</p>
                {files.length > 0 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Uploading {files.length} file{files.length > 1 ? 's' : ''}...
                  </p>
                )}
              </div>
            </div>
          )}

          {isPreviewOpen && (
            <PreviewModal
              previewFile={previewFile}
              onClose={() => setIsPreviewOpen(false)}
            />
          )}

          <h1 className="text-2xl font-bold mb-6 text-gray-800">Create Your Ticket</h1>
          <div className="flex flex-col items-center justify-start">
            <div className="w-full max-w-[750px] bg-slate-100 text-black p-8 rounded-2xl shadow-lg">

              <Formik
                initialValues={{
                  systemName: "",
                  ticketCategory: "",
                  description: "",
                }}
                onSubmit={async (values, { resetForm }) => {
                  try {
                    setIsSubmitting(true);
                    setUploadProgress(0);

                    if (!selectedSystem || selectedSystem.trim() === "") {
                      toast.error("Please select a System Name.");
                      setIsSubmitting(false);
                      return;
                    }
                    if (!selectedCategory || selectedCategory.trim() === "") {
                      toast.error("Please select a Ticket Category.");
                      setIsSubmitting(false);
                      return;
                    }
                    if (!values.description || values.description.trim() === "") {
                      toast.error("Please provide a Description.");
                      setIsSubmitting(false);
                      return;
                    }

                    const user = JSON.parse(localStorage.getItem("user"));
                    if (!user || !user.UserID) {
                      toast.error("User not logged in. Please login first.");
                      setIsSubmitting(false);
                      return;
                    }

                    // Progress: 20% - Submitting ticket data
                    setUploadProgress(20);
                    const ticketPayload = {
                      systemName: selectedSystem,
                      ticketCategory: selectedCategory,
                      description: values.description,
                      userId: user.UserID,
                    };

                    const ticketRes = await axiosClient.post(
                      "/api/tickets",
                      ticketPayload
                    );

                    const ticketId = ticketRes.data.ticketId;
                    // Progress: 50% - Ticket created
                    setUploadProgress(50);

                    if (files.length > 0) {
                      const formData = new FormData();
                      files.forEach((file) => {
                        formData.append("evidenceFiles", file);
                      });
                      formData.append("ticketId", ticketId);
                      formData.append("description", values.description);

                      // Progress: 70% - Uploading files
                      setUploadProgress(70);
                      await axiosClient.post(
                        "/api/upload_evidence",
                        formData,
                        {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                          onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round(
                              70 + (progressEvent.loaded * 25) / progressEvent.total
                            );
                            setUploadProgress(percentCompleted);
                          },
                        }
                      );
                    }

                    // Progress: 100% - Complete
                    setUploadProgress(100);
                    setTimeout(() => {
                      toast.success("Ticket and evidence submitted successfully");
                      resetForm();
                      setFiles([]);
                      setSelectedSystem("");
                      setSelectedCategory("");
                      setFileDropdownStates({});
                      setIsSubmitting(false);
                      setUploadProgress(0);
                      navigate("/ticket-view");
                    }, 500);

                  } catch (err) {
                    console.error("Error submitting ticket and evidence:", err);
                    toast.error("Failed to submit ticket or evidence");
                    setIsSubmitting(false);
                    setUploadProgress(0);
                  }
                }}
              >
                <Form className="space-y-4">
                  <div className="flex flex-col relative" ref={systemDropdownRef}>
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      System Name
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSystemDropdownOpen(!isSystemDropdownOpen)}
                      disabled={isSubmitting}
                      className={`flex justify-between items-center p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-left cursor-pointer h-9 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {selectedSystem || "Select System"}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isSystemDropdownOpen ? "rotate-180" : "rotate-0"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    {isSystemDropdownOpen && !isSubmitting && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto top-full">
                        {systemNames.map((sys, index) => (
                          <div
                            key={index}
                            className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedSystem === sys.SystemName ? "bg-blue-100 font-semibold" : ""}`}
                            onClick={() => {
                              setSelectedSystem(sys.SystemName);
                              setIsSystemDropdownOpen(false);
                            }}
                          >
                            {sys.SystemName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Custom Category Dropdown */}
                  <div className="flex flex-col relative" ref={categoryDropdownRef}>
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Ticket Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      disabled={isSubmitting}
                      className={`flex justify-between items-center p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-left cursor-pointer h-9 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {selectedCategory || "Select Ticket Category"}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : "rotate-0"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    {isCategoryDropdownOpen && !isSubmitting && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto top-full">
                        {categoryName.map((cat, index) => (
                          <div
                            key={index}
                            className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedCategory === cat.CategoryName ? "bg-blue-100 font-semibold" : ""}`}
                            onClick={() => {
                              setSelectedCategory(cat.CategoryName);
                              setIsCategoryDropdownOpen(false);
                            }}
                          >
                            {cat.CategoryName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-sm">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows="4"
                      disabled={isSubmitting}
                      className={`w-full h-50 p-3 border border-gray-300 rounded-md text-sm mt-1 focus:ring-2 focus:ring-gray-400 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Provide details of your problem"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-sm mb-1">
                      Upload Your Documents (Optional)
                    </label>
                    {/* Dropzone Area */}
                    <div
                      {...getRootProps()}
                      className={`border-dashed border-2 border-gray-300 rounded-md p-6 hover:border-gray-400 cursor-pointer mt-1 
                        ${files.length > 0 ? 'h-auto max-h-[19rem] overflow-y-auto' : 'flex flex-col justify-center items-center'} 
                        min-h-[10rem] ${isSubmitting ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                      <input {...getInputProps()} disabled={isSubmitting} />
                      {files.length === 0 ? (
                        <>
                          <p className="text-gray-500 text-sm text-center">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-gray-400 text-xs text-center">
                            All file types are supported
                          </p>
                        </>
                      ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2 mt-2 py-1 w-full justify-items-center">
                          {files.map((file, index) => {
                            const isImage = file.type.startsWith("image/");
                            const isVideo = file.type.startsWith("video/");
                            const fileIcon = getFileIcon(file.name);

                            return (
                              <div
                                key={`${file.name}-${file.size}-${index}`}
                                className="relative w-20 h-20 border rounded-md overflow-hidden flex-shrink-0"
                              >
                                {isImage && (
                                  <div className="relative w-full h-full">
                                    <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                    <button
                                      onClick={(e) => handleFileDropdownToggle(index, e)}
                                      className="absolute top-1 left-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer hover:bg-opacity-70 z-10"
                                    >
                                      ⋮
                                    </button>
                                  </div>
                                )}
                                {isVideo && (
                                  <div className="relative w-full h-full">
                                    <video src={file.preview} className="w-full h-full object-cover" controls={false} />
                                    <button
                                      onClick={(e) => handleFileDropdownToggle(index, e)}
                                      className="absolute top-1 left-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer hover:bg-opacity-70 z-10"
                                    >
                                      ⋮
                                    </button>
                                  </div>
                                )}
                                {!isImage && !isVideo && (
                                  <div className="relative w-full h-full p-1 bg-gray-50 flex flex-col items-center justify-center">
                                    <div className="text-lg mb-1">{fileIcon}</div>
                                    <div className="text-xs text-center truncate max-w-full px-1">{file.name}</div>
                                    <button
                                      onClick={(e) => handleFileDropdownToggle(index, e)}
                                      className="absolute top-1 left-1 bg-gray-600 bg-opacity-70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer hover:bg-opacity-90 z-10"
                                    >
                                      ⋮
                                    </button>
                                  </div>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile(index);
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer hover:bg-red-600 z-10"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                          {!isSubmitting && (
                            <div
                              className="relative w-20 h-20 border-dashed border-2 border-gray-300 rounded-md flex flex-col items-center justify-center text-center text-gray-500 hover:border-gray-400 cursor-pointer text-xs"
                              style={{ minWidth: '80px', minHeight: '80px' }}
                            >
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                              <p className="mt-1">Add More</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {Object.keys(fileDropdownStates).map(index => {
                    const file = files[index];
                    const isVideo = file?.type.startsWith("video/");

                    return fileDropdownStates[index] && (
                      <div
                        key={`dropdown-${index}`}
                        className="file-dropdown fixed z-[9999] bg-white border border-gray-300 rounded-md shadow-lg"
                        style={{
                          top: `${dropdownPosition.y}px`,
                          left: `${dropdownPosition.x}px`,
                          minWidth: '120px'
                        }}
                      >
                        {isVideo ? (
                          <>
                            <button
                              onClick={() => handleFileOpen(file)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                            >
                              <span className="mr-2">▶️</span> Play
                            </button>
                            <button
                              onClick={() => {
                                window.open(file.preview, '_blank', 'fullscreen=yes');
                                setFileDropdownStates({});
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                            >
                              <span className="mr-2">⛶</span> Fullscreen
                            </button>
                            <button
                              onClick={() => handleFileDownload(file)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                            >
                              <span className="mr-2">⬇️</span> Download
                            </button>
                            <button
                              onClick={() => {
                                toast.info('Mute functionality would be implemented with video controls');
                                setFileDropdownStates({});
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                            >
                              <span className="mr-2">🔇</span> Mute
                            </button>
                            <button
                              onClick={() => {
                                toast.info('Playback speed control would be implemented with video controls');
                                setFileDropdownStates({});
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                            >
                              <span className="mr-2">⏩</span> Playback speed
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleFileOpen(file)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                            >
                              <span className="mr-2">▶️</span> Open
                            </button>
                            <button
                              onClick={() => handleFileDownload(file)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                            >
                              <span className="mr-2">⬇️</span> Download
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md text-base font-medium transition-all duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:bg-blue-700'
                        }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </Form>
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenTickets;