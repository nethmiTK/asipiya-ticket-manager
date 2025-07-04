import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../axiosClient'; // Assuming this is the correct relative path from admin_panel to frontend
import { toast } from 'react-toastify';
import { useAuth } from '../../App.jsx';
import { AiOutlineUser, AiOutlineCamera } from 'react-icons/ai';
import { IoClose } from 'react-icons/io5';
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";
import NotificationPanel from '../components/NotificationPanel.jsx';
import AdminNavBar from '../../user_components/NavBar/AdminNavBar.jsx';
import { useNavigate } from 'react-router-dom';

const AdminProfile = () => {
    const { loggedInUser: user, setLoggedInUser } = useAuth();
    const navigate = useNavigate();

    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const notificationRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    const [profileData, setProfileData] = useState({
        FullName: '',
        Email: '',
        Phone: '',
        Role: '',
        ProfileImagePath: null
    });

    const [formData, setFormData] = useState({
        FullName: '',
        Email: '',
        Phone: '',
        CurrentPassword: '',
        NewPassword: '',
        ConfirmNewPassword: ''
    });

    // --- Fetch User Profile Data ---
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user && user.UserID) {
                try {
                    setLoading(true);
                    const response = await axiosClient.get(`/api/user/profile/${user.UserID}`);
                    const fetchedData = response.data;
                    setProfileData(fetchedData);
                    setFormData({
                        FullName: fetchedData.FullName,
                        Email: fetchedData.Email,
                        Phone: fetchedData.Phone,
                        CurrentPassword: '',
                        NewPassword: '',
                        ConfirmNewPassword: ''
                    });
                    if (fetchedData.ProfileImagePath) {
                        // Correctly using axiosClient.defaults.baseURL here
                        setPreviewUrl(`${axiosClient.defaults.baseURL}/uploads/${fetchedData.ProfileImagePath}`);
                    } else {
                        setPreviewUrl(null);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    toast.error('Failed to load profile data.');
                    setLoading(false);
                }
            } else {
                setLoading(false);
                toast.info("User ID not available. Please log in.");
            }
        };
        fetchUserProfile();
    }, [user, setLoggedInUser]);

    // --- Profile Image Handling ---
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            const imageFormData = new FormData();
            imageFormData.append('profileImage', file);

            try {
                // Path now includes '/api'
                const response = await axiosClient.post(
                    `/api/user/profile/upload/${user.UserID}`,
                    imageFormData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                if (response.data.imagePath) {
                    // *** MODIFIED LINE HERE ***
                    setPreviewUrl(`${axiosClient.defaults.baseURL}/uploads/${response.data.imagePath}`);
                    if (setLoggedInUser) {
                        const updatedUser = { ...user, ProfileImagePath: response.data.imagePath };
                        setLoggedInUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                    toast.success('Profile image updated successfully!');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Failed to upload profile image.');
            }
        }
    };

    const handleImageRemove = async () => {
        if (!previewUrl) return;

        try {
            // Path now includes '/api'
            await axiosClient.delete(`/api/user/profile/image/${user.UserID}`);
            setPreviewUrl(null);
            setProfileImage(null);
            if (setLoggedInUser) {
                const updatedUser = { ...user, ProfileImagePath: null };
                setLoggedInUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            toast.success('Profile image removed successfully!');
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to remove profile image.');
        }
    };

    // --- Form Field Change Handler ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    // --- Form Validation ---
    const validatePersonalInfo = () => {
        const newErrors = {};
        const { FullName, Email, Phone } = formData;

        if (!FullName.trim()) {
            newErrors.FullName = 'Full Name is required.';
        }
        if (!Email.trim()) {
            newErrors.Email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
            newErrors.Email = 'Invalid email format (e.g., user@example.com).';
        }
        if (!Phone.trim()) {
            newErrors.Phone = 'Phone number is required.';
        } else if (!/^\d+$/.test(Phone)) {
            newErrors.Phone = 'Phone number must contain only digits.';
        } else if (Phone.length < 10) {
            newErrors.Phone = 'Phone number must be at least 10 digits long.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSecurityInfo = () => {
        const newErrors = {};
        const { CurrentPassword, NewPassword, ConfirmNewPassword } = formData;

        if (CurrentPassword || NewPassword || ConfirmNewPassword) {
            if (!CurrentPassword) {
                newErrors.CurrentPassword = 'Current password is required to change password.';
            }
            if (!NewPassword) {
                newErrors.NewPassword = 'New password is required.';
            } else if (NewPassword.length < 8) {
                newErrors.NewPassword = 'New password must be at least 8 characters long.';
            } else if (!/[A-Z]/.test(NewPassword)) {
                newErrors.NewPassword = 'New password must contain at least one uppercase letter.';
            } else if (!/[a-z]/.test(NewPassword)) {
                newErrors.NewPassword = 'New password must contain at least one lowercase letter.';
            } else if (!/[0-9]/.test(NewPassword)) {
                newErrors.NewPassword = 'New password must contain at least one number.';
            } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(NewPassword)) {
                newErrors.NewPassword = 'New password must contain at least one special character.';
            }

            if (NewPassword && ConfirmNewPassword && NewPassword !== ConfirmNewPassword) {
                newErrors.ConfirmNewPassword = 'New password and confirm password do not match.';
            } else if (!ConfirmNewPassword) {
                newErrors.ConfirmNewPassword = 'Confirm new password is required.';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Save Handlers ---
    const handleSavePersonalInfo = async (e) => {
        e.preventDefault();
        if (!validatePersonalInfo()) {
            toast.error('Please correct the errors in personal information.');
            return;
        }

        const { FullName, Email, Phone } = formData;
        try {
            const updatePayload = { FullName, Email, Phone };
            // Path now includes '/api'
            const response = await axiosClient.put(`/api/user/profile/${user.UserID}`, updatePayload);
            toast.success(response.data.message || 'Personal information updated successfully!');

            if (setLoggedInUser) {
                const updatedUser = { ...user, FullName, Email, Phone };
                setLoggedInUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            setProfileData(prevData => ({ ...prevData, FullName, Email, Phone }));
        } catch (error) {
            console.error('Error updating personal information:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update personal information. Please try again.';
            toast.error(errorMessage);
        }
    };

    const handleSaveSecurityInfo = async (e) => {
        e.preventDefault();
        if (!validateSecurityInfo()) {
            toast.error('Please correct the errors in security information.');
            return;
        }

        const { CurrentPassword, NewPassword } = formData;
        const updatePayload = { CurrentPassword, NewPassword };

        try {
            // Path now includes '/api'
            const response = await axiosClient.put(`/api/user/profile/${user.UserID}`, updatePayload);
            toast.success(response.data.message || 'Security information updated successfully!');

            setFormData(prevData => ({
                ...prevData,
                CurrentPassword: '',
                NewPassword: '',
                ConfirmNewPassword: ''
            }));
        } catch (error) {
            console.error('Error updating security information:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update security information. Please try again.';
            toast.error(errorMessage);
        }
    };

    // --- Notification Handling for AdminNavBar ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchUnreadNotifications = useCallback(async () => {
        if (!user?.UserID) return;
        try {
            // Path now includes '/api'
            const response = await axiosClient.get(`/api/notifications/count/${user.UserID}`);
            setUnreadNotifications(response.data.count);
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    }, [user?.UserID]);

    useEffect(() => {
        if (user?.UserID) {
            fetchUnreadNotifications();
            const interval = setInterval(fetchUnreadNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user, fetchUnreadNotifications]);

    const handleNotificationPanelUpdate = useCallback(() => {
        fetchUnreadNotifications();
    }, [fetchUnreadNotifications]);

    // --- Profile Click Handler for AdminNavBar (if navigating to own profile) ---
    const handleProfileClick = useCallback(() => {
        navigate('/admin-profile');
    }, [navigate]);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Loading profile...</p>
            </div>
        );
    }

    if (!user || !user.UserID) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-red-500">Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex">
            <AdminSideBar open={isOpen} setOpen={setIsOpen} />
            <AdminNavBar
                pageTitle="My Profile"
                user={user}
                sidebarOpen={isOpen}
                onProfileClick={handleProfileClick}
                onNotificationClick={() => setShowNotifications(!showNotifications)}
                unreadNotifications={unreadNotifications}
                showNotifications={showNotifications}
                notificationRef={notificationRef}
            />

            <div className={`flex-1 overflow-y-auto p-6 md:p-12 transition-all duration-300 ${isOpen ? "ml-72" : "ml-20"}`}>
                {showNotifications && (
                    <div ref={notificationRef} className="absolute right-4 top-14 z-50">
                        <NotificationPanel
                            userId={user?.UserID}
                            role={user?.Role}
                            onClose={() => setShowNotifications(false)}
                            onNotificationUpdate={handleNotificationPanelUpdate}
                        />
                    </div>
                )}
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 flex items-center justify-center">
                                {previewUrl ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={handleImageRemove}
                                            className="absolute top-0 right-0 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
                                            aria-label="Remove profile image"
                                        >
                                            <IoClose size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <AiOutlineUser className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors" aria-label="Upload new profile image">
                                <AiOutlineCamera className="text-white w-5 h-5" />
                                <input
                                    type="file"
                                    id="profile-image"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Personal Information Form */}
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Personal Information</h3>
                    <form onSubmit={handleSavePersonalInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label htmlFor="FullName" className="text-sm font-medium text-gray-700 block mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="FullName"
                                name="FullName"
                                value={formData.FullName}
                                onChange={handleChange}
                                className={`w-full rounded-md border ${errors.FullName ? 'border-red-500' : 'border-gray-300'} px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                            {errors.FullName && <p className="text-red-500 text-xs mt-1">{errors.FullName}</p>}
                        </div>

                        <div>
                            <label htmlFor="Email" className="text-sm font-medium text-gray-700 block mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="Email"
                                name="Email"
                                value={formData.Email}
                                onChange={handleChange}
                                className={`w-full rounded-md border ${errors.Email ? 'border-red-500' : 'border-gray-300'} px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                            {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email}</p>}
                        </div>

                        <div>
                            <label htmlFor="Phone" className="text-sm font-medium text-gray-700 block mb-1">
                                Phone
                            </label>
                            <input
                                type="text"
                                id="Phone"
                                name="Phone"
                                value={formData.Phone}
                                onChange={handleChange}
                                className={`w-full rounded-md border ${errors.Phone ? 'border-red-500' : 'border-gray-300'} px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                            {errors.Phone && <p className="text-red-500 text-xs mt-1">{errors.Phone}</p>}
                        </div>

                        <div className="col-span-full flex justify-end mt-6">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                            >
                                Save Personal Information
                            </button>
                        </div>
                    </form>

                    {/* Security Information Form */}
                    <h3 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">Security Information</h3>
                    <form onSubmit={handleSaveSecurityInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="CurrentPassword" className="text-sm font-medium text-gray-700 block mb-1">
                                Current Password
                            </label>
                            <input
                                type="password"
                                id="CurrentPassword"
                                name="CurrentPassword"
                                value={formData.CurrentPassword}
                                onChange={handleChange}
                                className={`w-full rounded-md border ${errors.CurrentPassword ? 'border-red-500' : 'border-gray-300'} px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                            {errors.CurrentPassword && <p className="text-red-500 text-xs mt-1">{errors.CurrentPassword}</p>}
                        </div>

                        <div>
                            <label htmlFor="NewPassword" className="text-sm font-medium text-gray-700 block mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="NewPassword"
                                name="NewPassword"
                                value={formData.NewPassword}
                                onChange={handleChange}
                                className={`w-full rounded-md border ${errors.NewPassword ? 'border-red-500' : 'border-gray-300'} px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                            {errors.NewPassword && <p className="text-red-500 text-xs mt-1">{errors.NewPassword}</p>}
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="ConfirmNewPassword" className="text-sm font-medium text-gray-700 block mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                id="ConfirmNewPassword"
                                name="ConfirmNewPassword"
                                value={formData.ConfirmNewPassword}
                                onChange={handleChange}
                                className={`w-full rounded-md border ${errors.ConfirmNewPassword ? 'border-red-500' : 'border-gray-300'} px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                            {errors.ConfirmNewPassword && <p className="text-red-500 text-xs mt-1">{errors.ConfirmNewPassword}</p>}
                        </div>

                        <div className="col-span-full flex justify-end mt-6">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                            >
                                Save Security Information
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;