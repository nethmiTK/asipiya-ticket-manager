import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../App.jsx'; 
import { AiOutlineUser } from 'react-icons/ai';

const UserProfile = () => {
    const { loggedInUser: user, setLoggedInUser } = useAuth();

    const [profileData, setProfileData] = useState({
        FullName: '',
        Email: '',
        Phone: '',
        Role: ''
    });
    const [formData, setFormData] = useState({
        FullName: '',
        Email: '',
        S_Phone: '', 
        Phone: '',
        CurrentPassword: '',
        NewPassword: '',
        ConfirmNewPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({}); 

    useEffect(() => {
        // Fetch user data 
        const fetchUserProfile = async () => {
            if (user && user.UserID) { // Ensure user and UserID exist from context
                try {
                    setLoading(true);
                    // This API call now targets the new general user profile endpoint in index.js
                    const response = await axios.get(`http://localhost:5000/api/user/profile/${user.UserID}`);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

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

    const handleSave = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please correct the errors in the form.');
            return;
        }

        try {
            const updatePayload = {
                FullName: formData.FullName,
                Email: formData.Email,
                Phone: formData.Phone,
            };

            if (formData.CurrentPassword && formData.NewPassword) {
                updatePayload.CurrentPassword = formData.CurrentPassword;
                updatePayload.NewPassword = formData.NewPassword;
            }

            // This API call now targets the new general user profile endpoint in index.js
            const response = await axios.put(`http://localhost:5000/api/user/profile/${user.UserID}`, updatePayload);
            toast.success(response.data.message || 'Profile updated successfully!');

            if (setLoggedInUser) {
                const updatedUser = {
                    ...user,
                    FullName: formData.FullName,
                    Email: formData.Email,
                    Phone: formData.Phone,
                };
                setLoggedInUser(updatedUser); // Update context
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Update localStorage
            }

            // Clear password fields after successful update
            setFormData(prevData => ({
                ...prevData,
                CurrentPassword: '',
                NewPassword: '',
                ConfirmNewPassword: ''
            }));

            // Re-fetch profile data or update state directly to reflect changes
            setProfileData(prevData => ({
                ...prevData,
                FullName: formData.FullName,
                Email: formData.Email,
                Phone: formData.Phone,
            }));

        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Profile update failed: ${error.response.data.message}`);
            } else {
                toast.error('Profile update failed. Please try again.');
            }
        }
    };

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

    return (
        <div className="profile-container p-8 md:p-12 min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
                    {/* User Avatar Section (placeholder) */}
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-6xl mr-6 overflow-hidden">
                        <AiOutlineUser />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {profileData.FullName || 'User Profile'}
                        </h2>
                        <p className="text-lg text-gray-600">
                            {profileData.Email} - <span className="font-semibold">{profileData.Role || 'User'}</span>
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                            Avatar from gravatar.com Or Upload your own...
                        </p>
                        <button
                            onClick={() => toast.info("Image upload functionality is not implemented yet!")}
                            className="text-gray-500 hover:text-gray-700 text-sm mt-1"
                        >
                            <img src="https://via.placeholder.com/20" alt="Camera Icon" className="inline-block mr-1" /> 
                            Drop your files here or click in this area
                        </button>
                    </div>
                </div>

                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Account Details</h3>
                <form onSubmit={handleSave} className="space-y-6">
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
    );
};

export default UserProfile;