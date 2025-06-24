import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Formik, Form, Field } from "formik";
import axios from "axios";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";
import NotificationPanel from "../components/NotificationPanel";
import { toast } from 'react-toastify';

const enhanceFilesWithPreview = (acceptedFiles) =>
  acceptedFiles.map((file) =>
    Object.assign(file, {
      preview: URL.createObjectURL(file),
    })
  );

const OpenTickets = () => {
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

  // Refs for dropdown click outside detection
  const systemDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }

      // Handle system dropdown
      if (systemDropdownRef.current && !systemDropdownRef.current.contains(event.target)) {
        setIsSystemDropdownOpen(false);
      }

      // Handle category dropdown
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).UserID : null;

      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/notifications/count/${userId}`);
        setUnreadNotifications(response.data.count);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.filter(
        (newFile) => !files.some(
          (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
        )
      );
      setFiles((prev) => [...prev, ...enhanceFilesWithPreview(newFiles)]);
    },
    multiple: true,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "video/*": [],
    },
  });

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchSystems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/system_registration");
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
      const res = await axios.get("http://localhost:5000/ticket_category");
      const activeCategories = res.data.filter(cat => cat.Status === 1);
      setCategoryName(activeCategories);
    } catch (error) {
      console.error("Error fetching systems:", error);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  // Clean up object URLs when component unmounts or files change
  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <div className="flex">
      <title>Create Ticket</title>
      <SideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300
          ml-0 
          lg:ml-20 ${isSidebarOpen ? 'lg:ml-72' : ''} 
        `}
      >
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

          {/* Loading */}
          {isSubmitting && (
            <div className="absolute inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-40">
              <div className="bg-white p-6 rounded-lg shadow-xl border w-80">
                <div className="text-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-lg font-medium text-gray-800">Submitting your ticket...</p>
                </div>

                {/* Progress Bar */}
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

          <h1 className="text-2xl font-bold mb-6">Create Your Tickets</h1>
          <div className="flex flex-col items-center justify-start">
            <div className="w-full max-w-[750px] bg-slate-100 text-black p-8 rounded-2xl shadow-lg">
              <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">
                Create Ticket
              </h1>

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

                    // Use selected values from custom dropdowns
                    const formValues = {
                      systemName: selectedSystem,
                      ticketCategory: selectedCategory,
                      description: values.description,
                    };

                    if (!formValues.systemName) {
                      toast.error("Please select a System Name.");
                      setIsSubmitting(false);
                      return;
                    }
                    if (!formValues.ticketCategory) {
                      toast.error("Please select a Ticket Category.");
                      setIsSubmitting(false);
                      return;
                    }
                    if (!formValues.description) {
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
                      ...formValues,
                      userId: user.UserID,
                    };

                    const ticketRes = await axios.post(
                      "http://localhost:5000/api/tickets",
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
                      formData.append("description", formValues.description);

                      // Progress: 70% - Uploading files
                      setUploadProgress(70);

                      await axios.post(
                        "http://localhost:5000/api/upload_evidence",
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

                    // Small delay to show completion
                    setTimeout(() => {
                      toast.success("Ticket and evidence submitted successfully");
                      resetForm();
                      setFiles([]);
                      setSelectedSystem("");
                      setSelectedCategory("");
                      setIsSubmitting(false);
                      setUploadProgress(0);
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
                  {/* Custom System Name Dropdown */}
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
                        className={`w-4 h-4 transition-transform duration-200 ${isSystemDropdownOpen ? "rotate-180" : "rotate-0"
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                    {isSystemDropdownOpen && !isSubmitting && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto top-full">
                        {systemNames.map((sys, index) => (
                          <div
                            key={index}
                            className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedSystem === sys.SystemName
                                ? "bg-blue-100 font-semibold"
                                : ""
                              }`}
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
                        className={`w-4 h-4 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : "rotate-0"
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                    {isCategoryDropdownOpen && !isSubmitting && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto top-full">
                        {categoryName.map((cat, index) => (
                          <div
                            key={index}
                            className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedCategory === cat.CategoryName
                                ? "bg-blue-100 font-semibold"
                                : ""
                              }`}
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
                    // required
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
    ${files.length > 0 ? 'h-auto max-h-[19rem] overflow-y-auto' : 'flex flex-col justify-center items-center'} min-h-[10rem] ${isSubmitting ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                      <input {...getInputProps()} disabled={isSubmitting} />
                      {files.length === 0 ? (
                        <>
                          <p className="text-gray-500 text-sm text-center">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-gray-400 text-xs text-center">
                            Supported formats: PDF, Images, Videos
                          </p>
                        </>
                      ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2 mt-2 py-1 w-full justify-items-center">
                          {files.map((file, index) => {
                            const isImage = file.type.startsWith("image/");
                            const isVideo = file.type.startsWith("video/");
                            return (
                              <div
                                key={file.name + file.size + index}
                                className="relative w-20 h-20 border rounded-md overflow-hidden flex-shrink-0"
                              >
                                {isImage && (
                                  <img
                                    src={file.preview}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                {isVideo && (
                                  <video
                                    src={file.preview}
                                    controls
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                {!isImage && !isVideo && (
                                  <div className="w-full p-2 text-xs truncate">
                                    {file.name}
                                  </div>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile(index);
                                  }}
                                  disabled={isSubmitting}
                                  className={`absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                              <p className="mt-1">Add More</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md text-base font-medium transition-all duration-200 ${isSubmitting
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:scale-105 hover:bg-blue-700'
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