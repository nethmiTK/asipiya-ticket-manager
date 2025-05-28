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

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post("http://localhost:8081/create-ticket", {
        userId: 1,
        asipiyaSystemId: 1,
        dateTime: new Date().toISOString(),
        ticketCategoryId: 1,
        description: values.description,
        status: "Open",
        priority: values.priority,
        userNote: "Example user note",
      });

      alert("Ticket Created Successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to create ticket.");
    }
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
                      placeholder="Select system"
                      className="w-full h-9 p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mt-1"
                    >
                      <option value="" disabled selected hidden>
                        Select System
                      </option>
                      <option value=""></option>
                      <option value=""></option>
                      <option value=""></option>
                      <option value=""></option>
                    </Field>

                    <label className="font-medium text-sm">Priority</label>
                    <Field
                      as="select"
                      name="priority"
                      placeholder="Select Priority"
                      className="w-full h-9 p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mt-1"
                    >
                      <option value="" disabled selected hidden>
                        Select Priority
                      </option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
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

                    <div className="flex justify-end">
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
