import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaUserTag, FaArrowLeft } from 'react-icons/fa';
import { format } from 'date-fns';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const [userResponse, ticketsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/${userId}`),
          axios.get(`http://localhost:5000/api/tickets/user/${userId}`)
        ]);
        setUser(userResponse.data);
        setTickets(ticketsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "text-blue-500";
      case "in progress":
        return "text-yellow-500";
      case "closed":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      
      <main className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
        isSidebarOpen ? "ml-72" : "ml-20"
      }`}>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {user?.ProfileImagePath ? (
                  <img 
                    src={`http://localhost:5000/uploads/${user.ProfileImagePath}`}
                    alt={user.FullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-3xl">
                    {user?.FullName?.charAt(0)}
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{user?.FullName}</h1>
                <p className="text-gray-600">{user?.Email}</p>
                <p className="text-gray-600">{user?.ContactNo}</p>
                <p className="text-gray-600">Branch: {user?.Branch}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">User Tickets</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.TicketID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{ticket.TicketID}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {ticket.Description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${getStatusColor(ticket.Status)} font-medium`}>
                          {ticket.Status}
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

export default UserDetails; 