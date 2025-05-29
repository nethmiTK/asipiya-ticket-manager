import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";

const AdminProfile = () => {
    const [profile, setProfile] = useState({
        FullName: '',
        Email: '',
        Phone: '',
        CurrentPassword: '',
        NewPassword: '',
        ConfirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                toast.error('User ID not found. Please login again.');
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/admin/profile/${userId}`);
            const { FullName, Email, Phone } = response.data;
            setProfile(prev => ({
                ...prev,
                FullName,
                Email,
                Phone,
                CurrentPassword: '',
                NewPassword: '',
                ConfirmPassword: ''
            }));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
        if (['CurrentPassword', 'NewPassword', 'ConfirmPassword'].includes(name)) {
            setPasswordError('');
        }
    };

    const validateStrongPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^(){}[\]=+_<>.,;:`~\\|'"-]).{8,}$/;
        return regex.test(password);
    };

    const validatePasswords = () => {
        const { CurrentPassword, NewPassword, ConfirmPassword } = profile;
        if (NewPassword || ConfirmPassword || CurrentPassword) {
            if (!CurrentPassword) {
                setPasswordError('Current password is required');
                return false;
            }
            if (!NewPassword) {
                setPasswordError('New password is required');
                return false;
            }
            if (!ConfirmPassword) {
                setPasswordError('Confirm password is required');
                return false;
            }
            if (NewPassword !== ConfirmPassword) {
                setPasswordError('New passwords do not match');
                return false;
            }
            if (!validateStrongPassword(NewPassword)) {
                setPasswordError(
                    'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
                );
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePasswords()) {
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                toast.error('User ID not found. Please login again.');
                return;
            }

            const updateData = {
                FullName: profile.FullName,
                Email: profile.Email,
                Phone: profile.Phone
            };

            if (profile.NewPassword && profile.CurrentPassword) {
                updateData.CurrentPassword = profile.CurrentPassword;
                updateData.NewPassword = profile.NewPassword;
            }

            await axios.put(`http://localhost:5000/api/admin/profile/${userId}`, updateData);
            toast.success('Profile updated successfully');
            setIsEditing(false);

            setProfile(prev => ({
                ...prev,
                CurrentPassword: '',
                NewPassword: '',
                ConfirmPassword: ''
            }));
            setPasswordError('');
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.status === 400) {
                setPasswordError(error.response.data.message);
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to update profile');
            }
        }
    };

    const mainContent = (
        <div className="flex-grow p-8 bg-gray-100">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Admin Profile</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                            >
                                <FaUser className="text-lg" />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            name="FullName"
                                            value={profile.FullName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="email"
                                            name="Email"
                                            value={profile.Email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="Phone"
                                            value={profile.Phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                                    {passwordError && (
                                        <div className="text-red-500 text-sm mb-4">
                                            {passwordError}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="password"
                                                name="CurrentPassword"
                                                value={profile.CurrentPassword}
                                                onChange={handleChange}
                                                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter your current password"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="password"
                                                name="NewPassword"
                                                value={profile.NewPassword}
                                                onChange={handleChange}
                                                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter new password"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="password"
                                                name="ConfirmPassword"
                                                value={profile.ConfirmPassword}
                                                onChange={handleChange}
                                                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Confirm new password"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <div className="flex justify-end space-x-4 mt-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setPasswordError('');
                                        fetchProfile();
                                    }}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex h-screen">
                <AdminSideBar />
                <div className="flex-grow p-8">
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <AdminSideBar />
            {mainContent}
        </div>
    );
};

export default AdminProfile;
