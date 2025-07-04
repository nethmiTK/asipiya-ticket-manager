import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../axiosClient'; // Changed from axios to axiosClient
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';

const UserDetails = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use axiosClient and remove base URL
        const userResponse = await axiosClient.get(`/api/users/${userId}`);
        setUserData(userResponse.data);

        // Use axiosClient and remove base URL
        const ticketsResponse = await axiosClient.get(`/api/tickets/user/${userId}`);
        setTickets(ticketsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return <div>User not found</div>;
  }

  // Calculate ticket statistics
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(ticket => ticket.Status === 'Pending').length;
  const resolvedTickets = tickets.filter(ticket => ticket.Status === 'Resolved').length;

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <main className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
        isSidebarOpen ? "ml-72" : "ml-20"
      }`}>
        <div className="p-8">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {userData.ProfileImagePath ? (
                  <img
                    src={`${axiosClient.defaults.baseURL}/uploads/${userData.ProfileImagePath}`} // Keep this as it's for static file serving
                    alt={userData.FullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-3xl">
                    {userData.FullName?.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{userData.FullName}</h1>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Phone:</span> {userData.ContactNo}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {userData.Email}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-500 text-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold mb-1">Total Tickets</p>
                  <h3 className="text-3xl font-bold">{totalTickets}</h3>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>

            <div className="bg-yellow-500 text-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold mb-1">Pending Tickets</p>
                  <h3 className="text-3xl font-bold">{pendingTickets}</h3>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </div>

            <div className="bg-green-500 text-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold mb-1">Resolved Tickets</p>
                  <h3 className="text-3xl font-bold">{resolvedTickets}</h3>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
          </div>

          {/* Latest Ticket Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Latest Ticket Information</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.TicketID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{ticket.TicketID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.Description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${ticket.Status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            ticket.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {ticket.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${ticket.Priority === 'High' ? 'bg-red-100 text-red-800' :
                            ticket.Priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'}`}>
                          {ticket.Priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.SystemName}
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

export default UserDetails;