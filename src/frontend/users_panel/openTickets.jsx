import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Formik, Form, Field } from "formik";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";

const OpenTickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setFiles(acceptedFiles),
    multiple: true,
    accept: {
      "image/*": [],
      "application/pdf": [],
    },
  });

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
              <div>
                <Formik>
                  <Form className="space-y-3">
                    <label className="font-medium text-sm">Name</label>
                    <Field
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      className="w-full h-9 p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mt-1"
                    />

                    <label className="font-medium text-sm">Company Name</label>
                    <Field
                      type="text"
                      name="companyName"
                      placeholder="Enter your company name"
                      className="w-full h-9 p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mt-1"
                    />

                    <label className="font-medium text-sm">Issue Title</label>
                    <Field
                      type="text"
                      name="issueTitle"
                      placeholder="Enter your issue title"
                      className="w-full h-9 p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mt-1"
                    />

                    <label className="font-medium text-sm">Severity</label>
                    <Field
                      type="text"
                      name="severity"
                      placeholder="Enter severity"
                      className="w-full h-9 p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mt-1"
                    />

                    <label className="font-medium text-sm">
                      Upload Your Documents
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
                        Supported formats: PDF, Images
                      </p>
                    </div>

                    {files.length > 0 && (
                      <ul className="mt-2">
                        {files.map((file) => (
                          <li key={file.path} className="text-gray-600 text-sm">
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    )}

                    <label className="font-medium text-sm">Description</label>
                    <textarea
                      name="description"
                      placeholder="Provide details of your problem"
                      className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mt-2 h-50"
                      rows="4"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3 py-2 bg-green-700 text-white rounded-md text-base font-medium transition-transform transform hover:scale-105"
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
    </div>
  );
};

export default OpenTickets;
