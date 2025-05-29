import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Formik, Form, Field } from "formik";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";

const enhanceFilesWithPreview = (acceptedFiles) =>
  acceptedFiles.map((file) =>
    Object.assign(file, {
      preview: URL.createObjectURL(file),
    })
  );

const OpenTickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) =>
      setFiles((prev) => [...prev, ...enhanceFilesWithPreview(acceptedFiles)]),
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

  const renderFilePreviews = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 mt-4 gap-2">
      {files.map((file, index) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        return (
          <div
            key={index}
            className="relative w-20 h-20 border rounded-md overflow-hidden"
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
              <div className="w-full p-2 text-xs truncate">{file.name}</div>
            )}
            <button
              onClick={() => handleRemoveFile(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex">
      <SideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <NavBar />
        <div className="p-6 mt-[60px]">
          <h1 className="text-2xl font-bold mb-6">My Open Tickets</h1>
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
                onSubmit={(values) => {
                  console.log("Form values:", values);
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
                      <option value="System1">System 1</option>
                      <option value="System2">System 2</option>
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
                      <option value="suggestions">Suggestions</option>
                      <option value="complaint">Complaint</option>
                      <option value="bugReport">Bug Report</option>
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
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-sm">
                      Upload Your Documents (Optional)
                    </label>
                    <div
                      {...getRootProps()}
                      className="border-dashed border-2 h-50 border-gray-300 rounded-md p-6 text-center hover:border-gray-400 cursor-pointer mt-1"
                    >
                      <input {...getInputProps()} />
                      <p className="text-gray-500 text-sm">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-400 text-xs">
                        Supported formats: PDF, Images, Videos
                      </p>
                    </div>
                    {renderFilePreviews()}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-700 text-white rounded-md text-base font-medium hover:scale-105 transition-transform"
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
