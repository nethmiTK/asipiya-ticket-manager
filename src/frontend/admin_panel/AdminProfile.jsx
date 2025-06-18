//  AdminProfile
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../App.jsx'; 
import { AiOutlineUser, AiOutlineCamera } from 'react-icons/ai';
import { IoClose } from 'react-icons/io5';
import AdminSideBar from "../../user_components/SideBar/AdminSideBar";

const AdminProfile = () => {
    const { loggedInUser: user, setLoggedInUser } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isOpen, setIsOpen] = useState(true);

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
            if (user && user.UserID) {
                try {
                    setLoading(true);
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
                    if (fetchedData.ProfileImagePath) {
                        setPreviewUrl(`http://localhost:5000/uploads/${fetchedData.ProfileImagePath}`);
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

            // Create FormData and upload immediately
            const formData = new FormData();
            formData.append('profileImage', file);

            try {
                const response = await axios.post(
                    `http://localhost:5000/api/user/profile/upload/${user.UserID}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                if (response.data.imagePath) {
                    setPreviewUrl(`http://localhost:5000/uploads/${response.data.imagePath}`);
                    setLoggedInUser({
                        ...user,
                        ProfileImagePath: response.data.imagePath
                    });
                    toast.success('Profile image updated successfully');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Failed to upload profile image');
            }
        }
    };

    const handleImageClick = async () => {
        if (previewUrl) {
            try {
                await axios.delete(`http://localhost:5000/api/user/profile/image/${user.UserID}`);
                setPreviewUrl(null);
                setProfileImage(null);
                setLoggedInUser({
                    ...user,
                    ProfileImagePath: null
                });
                toast.success('Profile image removed successfully');
            } catch (error) {
                console.error('Error deleting image:', error);
                toast.error('Failed to remove profile image');
            }
        }
    };

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

    const handleSavePersonalInfo = async (e) => {
        e.preventDefault();

        const { FullName, Email, Phone } = formData;
        if (!FullName.trim() || !Email.trim() || !Phone.trim()) {
            toast.error('Please fill out all fields in Personal Information.');
            return;
        }

        try {
            const updatePayload = { FullName, Email, Phone };
            const response = await axios.put(`http://localhost:5000/api/user/profile/${user.UserID}`, updatePayload);
            toast.success(response.data.message || 'Personal information updated successfully!');

            if (setLoggedInUser) {
                const updatedUser = { ...user, FullName, Email, Phone };
                setLoggedInUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            setProfileData(prevData => ({ ...prevData, FullName, Email, Phone }));
        } catch (error) {
            console.error('Error updating personal information:', error);
            toast.error('Failed to update personal information. Please try again.');
        }
    };

    const handleSaveSecurityInfo = async (e) => {
        e.preventDefault();

        const { CurrentPassword, NewPassword, ConfirmNewPassword, FullName, Email, Phone } = formData;
        if (!CurrentPassword || !NewPassword || !ConfirmNewPassword) {
            toast.error('Please fill out all fields in Security Information.');
            return;
        }

        if (NewPassword !== ConfirmNewPassword) {
            toast.error('New password and confirm password do not match.');
            return;
        }

        try {
            const updatePayload = { CurrentPassword, NewPassword, FullName, Email, Phone };
            const response = await axios.put(`http://localhost:5000/api/user/profile/${user.UserID}`, updatePayload);
            toast.success(response.data.message || 'Security information updated successfully!');

            setFormData(prevData => ({
                ...prevData,
                CurrentPassword: '',
                NewPassword: '',
                ConfirmNewPassword: ''
            }));
        } catch (error) {
            console.error('Error updating security information:', error);
            toast.error('Failed to update security information. Please try again.');
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
        <div className="min-h-screen bg-white flex">
            <AdminSideBar open={isOpen} setOpen={setIsOpen} />

            <div className={`flex-1 overflow-y-auto p-6 md:p-12 transition-all duration-300 ${isOpen ? "ml-72" : "ml-20"}`}>
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                                {previewUrl ? (
                                    <>
                                        <img 
                                            src={previewUrl} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={handleImageClick}
                                            className="absolute top-0 right-0 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
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
                            <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
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

                    {/* Form */}
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Personal Information</h3>

                    <form onSubmit={handleSavePersonalInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
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
                                required
                                className={`w-full rounded-md border ${errors.FullName ? 'border-red-500' : 'border-gray-300'} px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                            {errors.FullName && <p className="text-red-500 text-xs mt-1">{errors.FullName}</p>}
                        </div>

                        {/* Email */}
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
                                required
                                className={`w-full rounded-md border ${errors.Email ? 'border-red-500' : 'border-gray-300'} px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                            {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email}</p>}
                        </div>

                        {/* Phone */}
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
                                required
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

                    <h3 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">Security Information</h3>
                    <form onSubmit={handleSaveSecurityInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current Password */}
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

                        {/* New Password */}
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

                        {/* Confirm New Password */}
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
