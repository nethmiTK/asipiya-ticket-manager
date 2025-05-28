import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Formik, Form, Field } from "formik";
import axios from "axios";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";

const OpenTickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) =>
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        ),
      ]),
    multiple: true,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "video/*": [],
    },
  });

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("userId", 1);
      formData.append("asipiyaSystemId", 1);
      formData.append("dateTime", new Date().toISOString());
      formData.append("ticketCategoryId", 1);
      formData.append("description", values.description);
      formData.append("status", "Open");
      formData.append("priority", values.priority);
      formData.append("userNote", "Example user note");

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.post(
        "http://localhost:8081/create-ticket",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Ticket Created Successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to create ticket.");
    }
  };

  const renderPreview = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 mt-4">
        {files.map((file, index) => {
          if (file.type.startsWith("image/")) {
            return (
              <div
                key={index}
                className="relative w-20 h-20 border rounded-md overflow-hidden"
              >
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            );
          } else if (file.type.startsWith("video/")) {
            return (
              <div
                key={index}
                className="relative w-20 h-20 border rounded-md overflow-hidden"
              >
                <video
                  src={file.preview}
                  controls
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            );
          } else {
            return (
              <div
                key={index}
                className="w-full text-sm text-gray-600 flex items-center justify-between"
              >
                <p className="truncate">{file.name}</p>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:underline text-xs"
                >
                  Remove
                </button>
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex">
      <title>Open Ticket</title>
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
            <div className="w-[750px] h-auto bg-slate-100 text-black p-8 rounded-2xl shadow-lg">
              <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">
                Create Ticket
              </h1>
              <Formik
                initialValues={{
                  priority: "",
                  description: "",
                }}
                onSubmit={handleSubmit}
              >
                {({ handleSubmit }) => (
                  <Form className="space-y-3" onSubmit={handleSubmit}>
                    <label className="font-medium text-sm">System Name</label>
                    <Field
                      as="select"
                      name="systemName"
                      className="w-full h-9 p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mt-1"
                    >
                      <option value="" disabled hidden>
                        Select System
                      </option>
                      <option value="">System 1</option>
                      <option value="">System 2</option>
                    </Field>

                    <label className="font-medium text-sm">
                      Ticket Category
                    </label>
                    <Field
                      as="select"
                      name="ticketCategory"
                      className="w-full h-9 p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mt-1"
                    >
                      <option value="" disabled hidden>
                        Select Ticket Category
                      </option>
                      <option value="">Category 1</option>
                      <option value="">Category 2</option>
                    </Field>

                    <label className="font-medium text-sm">Description</label>
                    <textarea
                      name="description"
                      placeholder="Provide details of your problem"
                      className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mt-2 h-50"
                      rows="4"
                    />

                    <label className="font-medium text-sm">
                      Upload Your Documents (Optional)
                    </label>
                    <div
                      {...getRootProps()}
                      className="border-dashed border-2 border-gray-300 rounded-md p-6 text-center hover:border-gray-400 cursor-pointer h-50 mt-2"
                    >
                      <input {...getInputProps()} />
                      <p className="text-gray-500 text-sm">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-400 text-xs">
                        Supported formats: PDF, Images, Videos
                      </p>
                    </div>

                    {renderPreview()}

                    <div className="flex justify-end mt-4">
                      <button
                        type="submit"
                        className="px-3 py-2 bg-green-700 text-white rounded-md text-base font-medium transition-transform transform hover:scale-105"
                      >
                        Submit
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenTickets;
