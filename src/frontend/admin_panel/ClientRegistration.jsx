import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../axiosClient';
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import AdminNavBar from '../../user_components/NavBar/AdminNavBar';
import NotificationPanel from '../components/NotificationPanel';
import { toast } from 'react-toastify';
import { X, FileText } from 'lucide-react';
import { useAuth } from '../../App';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';


const ClientRegistration = () => {
    const [form, setForm] = useState({
        CompanyName: '',
        ContactNo: '',
        ContactPersonEmail: '',
        MobileNo: ''
    });
    const [clients, setClients] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Notifications
    const { loggedInUser: user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const notificationRef = useRef(null);
    const navigate = useNavigate();


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadNotifications = useCallback(async () => {
        if (!user?.UserID) return;
        try {
            const res = await axiosClient.get(`/api/notifications/count/${user.UserID}`);
            setUnreadNotifications(res.data.count);
        } catch (error) {
            console.error("Error fetching unread notifications", error);
        }
    }, [user?.UserID]);

    useEffect(() => {
        if (user?.UserID) {
            fetchUnreadNotifications();
            const interval = setInterval(fetchUnreadNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user, fetchUnreadNotifications]);

    const handleNotificationPanelUpdate = () => {
        fetchUnreadNotifications();
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClients = clients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(clients.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const fetchClients = async () => {
        try {
            const res = await axiosClient.get('/api/clients');
            setClients(res.data);
            localStorage.setItem('clients', JSON.stringify(res.data));
        } catch (err) {
            setError('Failed to fetch clients: ' + err.message);
        }
    };

    useEffect(() => {
        const storedClients = localStorage.getItem('clients');
        if (storedClients) {
            setClients(JSON.parse(storedClients));
        }
        fetchClients();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await axiosClient.post('/api/clients', form);
            toast.success('Client registered successfully!');
            setForm({ CompanyName: '', ContactNo: '', ContactPersonEmail: '', MobileNo: '' });
            setShowModal(false);
            fetchClients();
        } catch (err) {
            setError('Submit error: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="flex">
            <AdminSideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
            <AdminNavBar
                pageTitle="Client Registration"
                user={user}
                sidebarOpen={isSidebarOpen}
                onProfileClick={() => navigate('/admin-profile')}
                onNotificationClick={() => setShowNotifications(!showNotifications)}
                unreadNotifications={unreadNotifications}
                showNotifications={showNotifications}
                notificationRef={notificationRef}
            />
            {/* Main content area - adjusted padding for smaller screens */}
            <div className={`flex-1 min-h-screen bg-gray-100 p-4 md:p-8 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
                {showNotifications && (
                    <div ref={notificationRef} className="absolute right-4 top-16 z-50">
                        <NotificationPanel
                            userId={user?.UserID}
                            role={user?.Role}
                            onClose={() => setShowNotifications(false)}
                            onNotificationUpdate={handleNotificationPanelUpdate}
                        />
                    </div>
                )}
                <div><h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-8"></h1></div> {/* Adjusted font size and margin */}
                <div className="bg-white rounded-lg shadow p-4 md:p-6"> {/* Adjusted padding */}
                    <div className="flex justify-end items-center mb-4"> {/* Removed ml-343 as it's not a standard Tailwind class and might cause issues */}
                        <button
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Register New User"
                            onClick={() => {
                                setForm({ CompanyName: '', ContactNo: '', ContactPersonEmail: '', MobileNo: '' });
                                setShowModal(true);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 md:px-4 md:py-2 rounded hover:bg-blue-700 text-sm md:text-base" // Adjusted padding and font size
                        >
                            +
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded mb-4 text-sm"> {/* Adjusted padding and font size */}
                            {error}
                        </div>
                    )}

                    {/* Table Responsiveness: Added overflow-x-auto */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200"> {/* Changed table-fixed to min-w-full to allow columns to shrink, added divide-y */}
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="p-2 text-left text-xs md:text-sm">Client ID</th> {/* Adjusted font size */}
                                    <th className="p-2 text-left text-xs md:text-sm">Company Name</th>
                                    <th className="p-2 text-left text-xs md:text-sm">Contact No</th>
                                    <th className="p-2 text-left text-xs md:text-sm">Contact Person Email</th>
                                    <th className="p-2 text-left text-xs md:text-sm">Mobile No</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentClients.map((client) => (
                                    <tr key={client.ClientID}>
                                        <td className="p-2 text-xs md:text-sm">{client.ClientID}</td> {/* Adjusted font size */}
                                        <td className="p-2 text-xs md:text-sm">{client.CompanyName}</td>
                                        <td className="p-2 text-xs md:text-sm">{client.ContactNo}</td>
                                        <td className="p-2 text-xs md:text-sm">{client.ContactPersonEmail}</td>
                                        <td className="p-2 text-xs md:text-sm">{client.MobileNo}</td>
                                    </tr>
                                ))}
                                {currentClients.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center text-gray-500 py-4 text-sm">No clients registered</td> {/* Adjusted font size */}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {clients.length > 0 && (
                    <div className="flex flex-col md:flex-row justify-end items-center mt-4 p-4 space-y-2 md:space-y-0 md:space-x-4"> {/* Added flex-col on mobile, flex-row on md+, and spacing */}
                        <div className="flex items-center space-x-2 md:space-x-4 text-sm"> {/* Adjusted spacing and font size */}
                            <span className="text-gray-700">Entries per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="p-1 md:p-2 border border-gray-300 rounded-md text-sm" // Adjusted padding
                            >
                                {[5, 10, 20, 50].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            <span className="text-gray-700">
                                {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, clients.length)} of ${clients.length}`}
                            </span>
                            <button onClick={() => paginate(1)} disabled={currentPage === 1} className="btn-page text-sm md:text-base p-1 md:p-2">&lt;&lt;</button> {/* Adjusted padding and font size */}
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="btn-page text-sm md:text-base p-1 md:p-2">&lt;</button>
                            <span className="text-sm">{currentPage}</span>
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="btn-page text-sm md:text-base p-1 md:p-2">&gt;</button>
                            <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="btn-page text-sm md:text-base p-1 md:p-2">&gt;&gt;</button>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"> {/* Added padding for small screens */}
                        <div className="bg-white p-6 rounded shadow-md w-full max-w-lg relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-black"
                            >
                                <X />
                            </button>
                            <h3 className="text-lg md:text-xl font-semibold mb-4">Register Client</h3> {/* Adjusted font size */}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Company Name</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <FileText size={16} />
                                        </span>
                                        <input
                                            type="text"
                                            name="CompanyName"
                                            value={form.CompanyName}
                                            onChange={handleChange}
                                            className="border rounded px-4 py-2 w-full pl-10 text-sm md:text-base" // Adjusted font size
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Contact No</label>
                                    <input
                                        type="text"
                                        name="ContactNo"
                                        value={form.ContactNo}
                                        onChange={handleChange}
                                        className="border rounded px-4 py-2 w-full text-sm md:text-base" // Adjusted font size
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="ContactPersonEmail"
                                        value={form.ContactPersonEmail}
                                        onChange={handleChange}
                                        className="border rounded px-4 py-2 w-full text-sm md:text-base" // Adjusted font size
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-1">Mobile No</label>
                                    <input
                                        type="text"
                                        name="MobileNo"
                                        value={form.MobileNo}
                                        onChange={handleChange}
                                        className="border rounded px-4 py-2 w-full text-sm md:text-base" // Adjusted font size
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm md:text-base"> {/* Adjusted font size */}
                                        Register
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="ml-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm md:text-base" 
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <Tooltip id="tooltip" place="top" />
        </div>
    );
};

export default ClientRegistration;