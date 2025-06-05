import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import { FaTicketAlt, FaExclamationCircle } from 'react-icons/fa';
import { MdDoneAll } from 'react-icons/md';

const UserProfile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user-profile/${userId}`);
        setProfileData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profileData) {
    return <div>Error loading profile data</div>;
  }

  const { user, recentTickets } = profileData;

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      
      <main className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
        isSidebarOpen ? "ml-72" : "ml-20"
      }`}>
        <div className="p-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {user.ProfileImagePath ? (
                  <img 
                    src={`http://localhost:5000/uploads/${user.ProfileImagePath}`}
                    alt={user.FullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-4xl">
                    {user.FullName?.charAt(0)}
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{user.FullName}</h1>
                <p className="text-gray-600">{user.Email}</p>
                <p className="text-gray-600">{user.ContactNo}</p>
                <div className="mt-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {user.Role}
                  </span>
                  {user.Branch && (
                    <span className="ml-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {user.Branch}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <FaTicketAlt className="text-3xl text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Tickets</h3>
                  <p className="text-2xl font-bold text-blue-600">{user.TotalTickets}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <MdDoneAll className="text-3xl text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Closed Tickets</h3>
                  <p className="text-2xl font-bold text-green-600">{user.ClosedTickets}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <FaExclamationCircle className="text-3xl text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">High Priority</h3>
                  <p className="text-2xl font-bold text-red-600">{user.HighPriorityTickets}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Tickets</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">System</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.TicketID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{ticket.TicketID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.SystemName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {ticket.Description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ticket.Status === 'Open' ? 'bg-green-100 text-green-800' :
                          ticket.Status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ticket.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ticket.Priority === 'High' ? 'bg-red-100 text-red-800' :
                          ticket.Priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {ticket.Priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.CreatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile; 