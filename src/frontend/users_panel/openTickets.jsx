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
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [systemNames, setSystemNames] = useState([]);
  const [categoryName, setCategoryName] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
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
      // Filter out files that are already selected by checking their name and size
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
        className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"
          }`}
      >
        <NavBar
          isSidebarOpen={isSidebarOpen}
          showNotifications={showNotifications}
          unreadNotifications={unreadNotifications}
          setShowNotifications={setShowNotifications}
          notificationRef={notificationRef}
        />
        <div className="p-6 mt-[60px]">
          {showNotifications && (
            <div ref={notificationRef} className="absolute right-4 top-[70px] z-50">
              <NotificationPanel
                userId={JSON.parse(localStorage.getItem("user"))?.UserID}
                role={JSON.parse(localStorage.getItem("user"))?.Role}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-6">Create Your Tickets</h1>
          <div className="flex flex-col items-center justify-start">
            <div className="w-[750px] bg-slate-100 text-black p-8 rounded-2xl shadow-lg">
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
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (!user || !user.UserID) {
                      toast.error("User not logged in. Please login first.");
                      return;
                    }

                    const ticketPayload = {
                      ...values,
                      userId: user.UserID,
                    };

                    const ticketRes = await axios.post(
                      "http://localhost:5000/api/tickets",
                      ticketPayload
                    );

                    const ticketId = ticketRes.data.ticketId;

                    if (files.length > 0) {
                      const formData = new FormData();
                      files.forEach((file) => {
                        formData.append("evidenceFiles", file);
                      });
                      formData.append("ticketId", ticketId);
                      formData.append("description", values.description);

                      await axios.post(
                        "http://localhost:5000/api/upload_evidence",
                        formData,
                        {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                        }
                      );
                    }

                    toast.success("Ticket and evidence submitted successfully");
                    resetForm();
                    setFiles([]);
                  } catch (err) {
                    console.error("Error submitting ticket and evidence:", err);
                    toast.error("Failed to submit ticket or evidence");
                  }
                }}
              >
                <Form className="space-y-4">
                  <div>
                    <label className="block font-medium text-sm">
                      System Name
                    </label>
                    <Field
                      as="select"
                      name="systemName"
                      className="w-full h-9 p-1 border border-gray-300 rounded-md text-sm mt-1 focus:ring-2 focus:ring-gray-400"
                    >
                      <option value="" disabled hidden>
                        Select System
                      </option>
                      {systemNames.map((sys, index) => (
                        <option key={index} value={sys.SystemName}>
                          {sys.SystemName}
                        </option>
                      ))}
                    </Field>
                  </div>

                  <div>
                    <label className="block font-medium text-sm">
                      Ticket Category
                    </label>
                    <Field
                      as="select"
                      name="ticketCategory"
                      className="w-full h-9 p-1 border border-gray-300 rounded-md text-sm mt-1 focus:ring-2 focus:ring-gray-400"
                    >
                      <option value="" disabled hidden>
                        Select Ticket Category
                      </option>
                      {categoryName.map((sys, index) => (
                        <option key={index} value={sys.CategoryName}>
                          {sys.CategoryName}
                        </option>
                      ))}
                    </Field>
                  </div>

                  <div>
                    <label className="block font-medium text-sm">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows="4"
                      className="w-full h-50 p-3 border border-gray-300 rounded-md text-sm mt-1 focus:ring-2 focus:ring-gray-400"
                      placeholder="Provide details of your problem"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-sm mb-1">
                      Upload Your Documents (Optional)
                    </label>
                    {/* Dropzone Area */}
                    <div
                      {...getRootProps()}
                      className={`border-dashed border-2 border-gray-300 rounded-md p-6 text-center hover:border-gray-400 cursor-pointer mt-1
                        ${files.length > 0 ? "h-auto" : "min-h-[10rem] flex flex-col justify-center items-center"}`} 
                    >
                      <input {...getInputProps()} />
                      {files.length === 0 ? (
                        <>
                          <p className="text-gray-500 text-sm">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-gray-400 text-xs">
                            Supported formats: PDF, Images, Videos
                          </p>
                        </>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 mt-2 items-center justify-center">
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
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                          {/* "+ Add more" button*/}
                          <div
                            className="relative w-20 h-20 border-dashed border-2 border-gray-300 rounded-md flex flex-col items-center justify-center text-center text-gray-500 hover:border-gray-400 cursor-pointer text-xs"
                            style={{ minWidth: '80px', minHeight: '80px' }} 
                          >
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            <p className="mt-1">Add More</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:scale-105 transition-transform"
                    >
                      Submit
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
