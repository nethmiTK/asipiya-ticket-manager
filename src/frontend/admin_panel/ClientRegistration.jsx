import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../axiosClient'; // Changed from axios to axiosClient
import AdminSideBar from '../../user_components/SideBar/AdminSideBar';
import AdminNavBar from '../../user_components/NavBar/AdminNavBar';
import NotificationPanel from '../components/NotificationPanel';
import { toast } from 'react-toastify';
import { X, FileText } from 'lucide-react';
import { useAuth } from '../../App';
import { useNavigate } from 'react-router-dom'; // <-- Add this


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
            // Use axiosClient and remove base URL
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
            // Use axiosClient and remove base URL
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
            // Use axiosClient and remove base URL
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
            <div className={`flex-1 min-h-screen bg-gray-100 p-8 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}>
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

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4 ml-343"> {/* Consider removing ml-343 if it's not a valid class or intended for something specific */}
                        <button
                            onClick={() => {
                                setForm({ CompanyName: '', ContactNo: '', ContactPersonEmail: '', MobileNo: '' });
                                setShowModal(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            + Register New
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <table className="table-fixed w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2 text-left">Client ID</th>
                                <th className="p-2 text-left">Company Name</th>
                                <th className="p-2 text-left">Contact No</th>
                                <th className="p-2 text-left">Contact Person Email</th>
                                <th className="p-2 text-left">Mobile No</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentClients.map((client) => (
                                <tr key={client.ClientID}>
                                    <td className="p-2">{client.ClientID}</td>
                                    <td className="p-2">{client.CompanyName}</td>
                                    <td className="p-2">{client.ContactNo}</td>
                                    <td className="p-2">{client.ContactPersonEmail}</td>
                                    <td className="p-2">{client.MobileNo}</td>
                                </tr>
                            ))}
                            {currentClients.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center text-gray-500 py-4">No clients registered</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {clients.length > 0 && (
                    <div className="flex justify-end items-center mt-4 p-4">
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 text-sm">Entries per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="p-2 border border-gray-300 rounded-md text-sm"
                            >
                                {[5, 10, 20, 50].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            <span className="text-gray-700 text-sm">
                                {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, clients.length)} of ${clients.length}`}
                            </span>
                            <button onClick={() => paginate(1)} disabled={currentPage === 1} className="btn-page">&lt;&lt;</button>
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="btn-page">&lt;</button>
                            <span className="text-sm">{currentPage}</span>
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="btn-page">&gt;</button>
                            <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="btn-page">&gt;&gt;</button>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55">
                        <div className="bg-white p-6 rounded shadow-md w-full max-w-lg relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-black"
                            >
                                <X />
                            </button>
                            <h3 className="text-xl font-semibold mb-4">Register Client</h3>
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
                                            className="border rounded px-4 py-2 w-full pl-10"
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
                                        className="border rounded px-4 py-2 w-full"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="ContactPersonEmail"
                                        value={form.ContactPersonEmail}
                                        onChange={handleChange}
                                        className="border rounded px-4 py-2 w-full"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-1">Mobile No</label>
                                    <input
                                        type="text"
                                        name="MobileNo"
                                        value={form.MobileNo}
                                        onChange={handleChange}
                                        className="border rounded px-4 py-2 w-full"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                        Register
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="ml-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientRegistration;