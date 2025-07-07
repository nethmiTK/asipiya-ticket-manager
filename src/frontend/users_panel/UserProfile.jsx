import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../axiosClient'; // Import the axiosClient
import { toast } from 'react-toastify';
import { useAuth } from '../../App.jsx';
import { AiOutlineUser } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";
import NotificationPanel from "../components/NotificationPanel";

const UserProfile = () => {
    const { loggedInUser: user, setLoggedInUser } = useAuth();
    const navigate = useNavigate();

    // profileData will store the fetched state from the backend
    const [profileData, setProfileData] = useState({
        FullName: '',
        Email: '',
        Phone: '',
        Role: '',
        ProfileImagePath: ''
    });

    // formData will store the current input values from the user
    const [formData, setFormData] = useState({
        FullName: '',
        Email: '',
        Phone: '',
        CurrentPassword: '',
        NewPassword: '',
        ConfirmNewPassword: ''
    });

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const fileInputRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const notificationRef = useRef(null);

    // Effect for handling clicks outside the notification panel
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

    // Effect for fetching unread notifications
    useEffect(() => {
        const fetchUnreadNotifications = async () => {
            if (!user || !user.UserID) return;
            try {
                // Use axiosClient and remove base URL
                const response = await axiosClient.get(`/api/notifications/count/${user.UserID}`);
                setUnreadNotifications(response.data.count);
            } catch (error) {
                console.error('Error fetching unread notifications:', error);
            }
        };

        if (user?.UserID) {
            fetchUnreadNotifications();
            const interval = setInterval(fetchUnreadNotifications, 30000); // Check every 30 seconds
            return () => clearInterval(interval);
        }
    }, [user]);


    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user && user.UserID) {
                try {
                    setLoading(true);
                    // Use axiosClient and remove base URL
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

                    // Set image preview if an image path exists from the backend
                    if (fetchedData.ProfileImagePath) {
                        setImagePreview(`${axiosClient.defaults.baseURL}/uploads/${fetchedData.ProfileImagePath}`); // Use axiosClient's baseURL
                    } else {
                        setImagePreview(null); // No image, clear preview
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
    }, [user]);

    // Handles changes in form input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    // Validates form fields before submission
    const validateForm = () => {
        const newErrors = {};
        const { FullName, Email, Phone, CurrentPassword, NewPassword, ConfirmNewPassword } = formData;

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

        // Validate new password only if attempting to change it
        if (NewPassword || CurrentPassword || ConfirmNewPassword) {
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
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handles selection of a file for upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
            toast.info("Image selected. Click 'Upload Image' to save it.");
        } else {
            setSelectedFile(null);
            // Revert to current profile image if user cancels file selection
            setImagePreview(profileData.ProfileImagePath ? `${axiosClient.defaults.baseURL}/uploads/${profileData.ProfileImagePath}` : null);
        }
    };

    // Handles the actual image upload to the server
    const handleImageUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select an image first.");
            return;
        }

        if (!user || !user.UserID) {
            toast.error("User not logged in or UserID not available.");
            return;
        }

        setLoading(true);
        const formDataPayload = new FormData();
        formDataPayload.append('profileImage', selectedFile); // 'profileImage' must match Multer's field name in backend

        try {
            // Use axiosClient and remove base URL
            const response = await axiosClient.post(`/api/user/profile/upload/${user.UserID}`, formDataPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success(response.data.message || "Profile image uploaded successfully!");


            setProfileData(prevData => ({
                ...prevData,
                ProfileImagePath: response.data.imagePath
            }));

            // Update loggedInUser context and localStorage
            if (setLoggedInUser) {
                const updatedUser = {
                    ...user,
                    ProfileImagePath: response.data.imagePath,
                };
                setLoggedInUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            // Clear selected file state after successful upload
            setSelectedFile(null);

        } catch (error) {
            console.error('Error uploading image:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Image upload failed: ${error.response.data.message}`);
            } else {
                toast.error('Image upload failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handles removal of the profile image
    const handleImageRemove = async () => {
        if (!user || !user.UserID) {
            toast.error("User not logged in or UserID not available.");
            return;
        }

        if (!profileData.ProfileImagePath && !selectedFile) {
            toast.info("No profile image to remove.");
            return;
        }

        // If there's a selected file that hasn't been uploaded yet, just clear it locally
        if (selectedFile) {
            setSelectedFile(null);
            setImagePreview(null); // Clear local preview
            setProfileData(prevData => ({ ...prevData, ProfileImagePath: null }));
            toast.info("Selected image cleared locally.");
            return;
        }

        // If there's an image from the server, send delete request
        setLoading(true);
        try {
            // Use axiosClient and remove base URL
            const response = await axiosClient.delete(`/api/user/profile/image/${user.UserID}`);
            toast.success(response.data.message || "Profile image removed successfully!");

            // Clear image states and profileData
            setSelectedFile(null);
            setImagePreview(null);
            setProfileData(prevData => ({ ...prevData, ProfileImagePath: null }));

            // Update loggedInUser context and localStorage
            if (setLoggedInUser) {
                const updatedUser = {
                    ...user, // Keep existing user data
                    ProfileImagePath: null, // Clear the image path
                };
                setLoggedInUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Error removing image:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Image removal failed: ${error.response.data.message}`);
            } else {
                toast.error('Image removal failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handles saving of general profile details
    const handleSave = async (e) => {
        e.preventDefault();

        // Validate form fields first
        if (!validateForm()) {
            toast.error('Please correct the errors in the form.');
            return;
        }

        const currentFullName = formData.FullName.trim();
        const currentEmail = formData.Email.trim();
        const currentPhone = formData.Phone.trim();

        const originalFullName = profileData.FullName ? profileData.FullName.trim() : '';
        const originalEmail = profileData.Email ? profileData.Email.trim() : '';
        const originalPhone = profileData.Phone ? profileData.Phone.trim() : '';

        // Check for changes in text fields
        const hasTextChanges =
            currentFullName !== originalFullName ||
            currentEmail !== originalEmail ||
            currentPhone !== originalPhone;

        // Check if the user attempted to change the password (by filling current or new password)
        const hasPasswordChanges = formData.CurrentPassword !== '' || formData.NewPassword !== '';

        // If no changes in text fields and no password change attempt, stop here
        if (!hasTextChanges && !hasPasswordChanges) {
            toast.info('No changes detected to save.');

            setFormData(prevData => ({
                ...prevData,
                CurrentPassword: '',
                NewPassword: '',
                ConfirmNewPassword: ''
            }));
            return; // Exit the function
        }

        try {
            setLoading(true);

            const updatePayload = {
                FullName: currentFullName,
                Email: currentEmail,
                Phone: currentPhone,
            };

            if (hasPasswordChanges) {
                updatePayload.CurrentPassword = formData.CurrentPassword;
                updatePayload.NewPassword = formData.NewPassword;
            }

            // Use axiosClient and remove base URL
            const response = await axiosClient.put(`/api/user/profile/${user.UserID}`, updatePayload);
            toast.success(response.data.message || 'Profile updated successfully!');


            setProfileData(prevData => ({
                ...prevData,
                FullName: currentFullName,
                Email: currentEmail,
                Phone: currentPhone,

            }));

            // Also update loggedInUser context and localStorage
            if (setLoggedInUser) {
                const updatedUser = {
                    ...user, // Retain existing user data, including ProfileImagePath
                    FullName: currentFullName,
                    Email: currentEmail,
                    Phone: currentPhone,
                };
                setLoggedInUser(updatedUser); // Update context
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Update localStorage
            }

            // Clear password fields in formData after a successful password change
            setFormData(prevData => ({
                ...prevData,
                CurrentPassword: '',
                NewPassword: '',
                ConfirmNewPassword: ''
            }));

        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Profile update failed: ${error.response.data.message}`);
            } else {
                toast.error('Profile update failed. Please try again.');
            }
        } finally {
            setLoading(false); // End loading state
        }
    };

    // --- Loading and Error States ---
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-700">Loading profile...</p>
            </div>
        );
    }

    if (!user || !user.UserID) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-red-500">Please log in to view your profile.</p>
            </div>
        );
    }

    // --- Component Render ---
    return (
        <div className="flex">
            <title>User Profile</title>
            <SideBar open={isSidebarOpen} setOpen={setIsSidebarOpen} />


            <div className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300
                ml-0
                lg:ml-20 ${isSidebarOpen ? 'lg:ml-72' : ''}
            `}>
                <NavBar
                    isSidebarOpen={isSidebarOpen}
                    showNotifications={showNotifications}
                    unreadNotifications={unreadNotifications}
                    setShowNotifications={setShowNotifications}
                    notificationRef={notificationRef}
                    setOpen={setIsSidebarOpen}
                />

                <div className="p-6 mt-[60px] flex-1">
                    {showNotifications && (
                        <div ref={notificationRef} className="absolute right-4 top-[70px] z-50">
                            <NotificationPanel
                                userId={user?.UserID} // Pass the user ID to the NotificationPanel
                                role={user?.Role}
                                onClose={() => setShowNotifications(false)}
                            />
                        </div>
                    )}

                    <div className="max-w-4xl mx-auto mb-4">
                        <button
                            onClick={() => navigate(-1)} // Navigate back to the previous page
                            className="flex items-center text-blue-600 hover:text-blue-800 font-semibold text-lg transition duration-200 focus:outline-none"
                            aria-label="Go back"
                        >
                            <FaArrowLeft className="mr-2" /> Back
                        </button>
                    </div>
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
                            {/* User Avatar Section */}
                            <div className="relative w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-6xl mr-6 cursor-pointer"
                                onClick={() => fileInputRef.current.click()} // Make the entire circle clickable
                                title="Click to change profile image"
                            >

                                {imagePreview ? (
                                    <>
                                        <img
                                            src={imagePreview}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-full border-2 border-black"
                                        />
                                        {/* Remove Image Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleImageRemove();
                                            }}
                                            className="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 focus:outline-none shadow-md z-10"
                                            title="Remove profile image"
                                        >
                                            <MdClose size={12} />
                                        </button>

                                    </>
                                ) : (
                                    <AiOutlineUser />
                                )}
                            </div>

                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900">
                                    {profileData.FullName || 'User Profile'}
                                </h2>
                                <p className="text-lg text-gray-600">
                                    {profileData.Email} - <span className="font-semibold">{profileData.Role || 'User'}</span>
                                </p>

                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*" // Only accept image files
                                    style={{ display: 'none' }}
                                />

                                {/* Upload Button - only show if a file is selected locally */}
                                {selectedFile && (
                                    <button
                                        onClick={handleImageUpload}
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm mt-2 transition duration-200"
                                    >
                                        Upload Image
                                    </button>
                                )}
                            </div>
                        </div>

                        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Account Details</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                        <input type="password" autoComplete="new-password" style={{ display: 'none' }} />
                            {/* Full Name */}
                            <div>
                                <label htmlFor="FullName" className="block text-gray-700 text-sm font-bold mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="FullName"
                                    name="FullName"
                                    value={formData.FullName}
                                    onChange={handleChange}
                                    required
                                    className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.FullName ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.FullName && <p className="text-red-500 text-xs italic mt-1">{errors.FullName}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="Email" className="block text-gray-700 text-sm font-bold mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="Email"
                                    name="Email"
                                    value={formData.Email}
                                    onChange={handleChange}
                                    required
                                    className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Email ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.Email && <p className="text-red-500 text-xs italic mt-1">{errors.Email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="Phone" className="block text-gray-700 text-sm font-bold mb-2">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    id="Phone"
                                    name="Phone"
                                    value={formData.Phone}
                                    onChange={handleChange}
                                    required
                                    className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Phone ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.Phone && <p className="text-red-500 text-xs italic mt-1">{errors.Phone}</p>}
                            </div>

                            {/* Current Password (for changing password) */}
                            <div>
                                <label htmlFor="CurrentPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                    Current Password (Leave blank if not changing)
                                </label>
                                <input
                                    type="password"
                                    id="CurrentPassword"
                                    name="CurrentPassword"
                                    value={formData.CurrentPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.CurrentPassword ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.CurrentPassword && <p className="text-red-500 text-xs italic mt-1">{errors.CurrentPassword}</p>}
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="NewPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                    New Password (Leave blank if not changing)
                                </label>
                                <input
                                    type="password"
                                    id="NewPassword"
                                    name="NewPassword"
                                    value={formData.NewPassword}
                                    onChange={handleChange}
                                    className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.NewPassword ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.NewPassword && <p className="text-red-500 text-xs italic mt-1">{errors.NewPassword}</p>}
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label htmlFor="ConfirmNewPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="ConfirmNewPassword"
                                    name="ConfirmNewPassword"
                                    value={formData.ConfirmNewPassword}
                                    onChange={handleChange}
                                    className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ConfirmNewPassword ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.ConfirmNewPassword && <p className="text-red-500 text-xs italic mt-1">{errors.ConfirmNewPassword}</p>}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;