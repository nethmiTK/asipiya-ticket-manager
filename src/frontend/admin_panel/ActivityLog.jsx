import React from 'react';
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";

export default function ActivityLog() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        <div className="min-h-screen bg-gray-50">
          {/* Top Navigation */}
          <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center rounded-lg">
            <h1 className="text-2xl font-bold text-gray-700">Activity Log</h1>
          </nav>

          {/* Activity Log Content */}
          <div className="max-w-7xl mx-auto mt-6 bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {/* Activity entries would go here */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Ticket #123 Updated</h3>
                    <p className="text-gray-600">Status changed from Open to In Progress</p>
                  </div>
                  <span className="text-sm text-gray-500">2024-03-21 14:30</span>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">New Comment Added</h3>
                    <p className="text-gray-600">Comment added to Ticket #456</p>
                  </div>
                  <span className="text-sm text-gray-500">2024-03-21 13:15</span>
                </div>
              </div>

              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Evidence File Uploaded</h3>
                    <p className="text-gray-600">New file added to Ticket #789</p>
                  </div>
                  <span className="text-sm text-gray-500">2024-03-21 12:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 