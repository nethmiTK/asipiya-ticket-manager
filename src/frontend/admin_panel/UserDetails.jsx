import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
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
        // Fetch user data
        const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setUserData(userResponse.data);

        // Fetch user's tickets
        const ticketsResponse = await axios.get(`http://localhost:5000/api/tickets/user/${userId}`);
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

  const latestTicket = tickets[0] || {};

  return (
    <div className="flex">
      <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      
      <main className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
        isSidebarOpen ? "ml-72" : "ml-20"
      }`}>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* User Profile Section */}
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {userData.ProfileImagePath ? (
                  <img 
                    src={`http://localhost:5000/uploads/${userData.ProfileImagePath}`}
                    alt={userData.FullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-2xl">
                    {userData.FullName?.charAt(0)}
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{userData.FullName}</h1>
                <p className="text-gray-600">{userData.ContactNo}</p>
                <p className="text-gray-600">{userData.Email}</p>
              </div>
            </div>

            {/* Ticket Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Total Tickets: {tickets.length}</h2>
              
              {latestTicket && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Ticket ID</p>
                      <p className="font-medium">#{latestTicket.TicketID}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ticket Duration</p>
                      <p className="font-medium">{latestTicket.Duration || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Priority</p>
                      <p className="font-medium">{latestTicket.Priority}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium">{latestTicket.Status}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-600">Description</p>
                    <p className="font-medium">{latestTicket.Description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDetails; 