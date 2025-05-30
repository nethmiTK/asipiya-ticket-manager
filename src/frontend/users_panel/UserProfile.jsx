import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../App.jsx'; 
import { AiOutlineUser } from 'react-icons/ai'; // For the default user icon
import { MdClose } from 'react-icons/md'; // For the remove image icon

const UserProfile = () => {
    const { loggedInUser: user, setLoggedInUser } = useAuth();

    const [profileData, setProfileData] = useState({
        FullName: '',
        Email: '',
        Phone: '',
        Role: '',
        ProfileImagePath: '' // This holds the path from the DB
    });
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
    const [selectedFile, setSelectedFile] = useState(null); // State for the file chosen via input
    const [imagePreview, setImagePreview] = useState(null); // State for the URL to display (either local or server)

    const fileInputRef = useRef(null); // Ref for the hidden file input

    // Effect to fetch user profile data on component mount or user change
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user && user.UserID) {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://localhost:5000/api/user/profile/${user.UserID}`);
                    const fetchedData = response.data;

                    setProfileData(fetchedData); // Set the profile data including the image path

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
                        setImagePreview(`http://localhost:5000/uploads/${fetchedData.ProfileImagePath}`); // Construct full URL
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
    }, [user]); // Re-run if `user` object changes

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
            setImagePreview(URL.createObjectURL(file)); // Create a local URL for instant preview
            toast.info("Image selected. Click 'Upload Image' to save it.");
        } else {
            setSelectedFile(null);
            // Revert to current profile image if user cancels file selection
            setImagePreview(profileData.ProfileImagePath ? `http://localhost:5000/uploads/${profileData.ProfileImagePath}` : null);
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
            const response = await axios.post(`http://localhost:5000/api/user/profile/upload/${user.UserID}`, formDataPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
            toast.success(response.data.message || "Profile image uploaded successfully!");
            
            // Update profileData state with the new image path returned from backend
            setProfileData(prevData => ({
                ...prevData,
                ProfileImagePath: response.data.imagePath 
            }));
            
            // Update loggedInUser context and localStorage
            if (setLoggedInUser) {
                const updatedUser = {
                    ...user, // Keep existing user data
                    ProfileImagePath: response.data.imagePath, // Update only the image path
                };
                setLoggedInUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            // Clear selected file state after successful upload
            setSelectedFile(null);
            // Image preview is already updated by setProfileData / imagePreview
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
            setProfileData(prevData => ({ ...prevData, ProfileImagePath: null })); // Clear DB path
            toast.info("Selected image cleared locally.");
            return;
        }

        // If there's an image from the server, send delete request
        setLoading(true);
        try {
            const response = await axios.delete(`http://localhost:5000/api/user/profile/image/${user.UserID}`);
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

            const response = await axios.put(`http://localhost:5000/api/user/profile/${user.UserID}`, updatePayload);
            toast.success(response.data.message || 'Profile updated successfully!');

            if (setLoggedInUser) {
                const updatedUser = {
                    ...user, // Retain existing user data, including ProfileImagePath
                    FullName: formData.FullName,
                    Email: formData.Email,
                    Phone: formData.Phone,
                    // ProfileImagePath is already present in 'user' from context, or will be updated by handleImageUpload
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
        <div className="profile-container p-8 md:p-12 min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
                    {/* User Avatar Section */}
                    <div 
                        className="relative w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-6xl mr-6 overflow-hidden cursor-pointer"
                        onClick={() => fileInputRef.current.click()} // Make the entire circle clickable
                        title="Click to change profile image"
                    >
                        {/* Conditional rendering for profile image */}
                        {imagePreview ? (
                            <>
                                <img
                                    src={imagePreview}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                {/* Remove Image Button (X icon) */}
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); // Prevent triggering file input click
                                        handleImageRemove(); 
                                    }}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 focus:outline-none"
                                    title="Remove profile image"
                                >
                                    <MdClose size={16} />
                                </button>
                            </>
                        ) : (
                            <AiOutlineUser /> // Default icon if no image
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
                            ref={fileInputRef} // Assign the ref
                            onChange={handleFileChange}
                            accept="image/*" // Only accept image files
                            style={{ display: 'none' }} // Hide the input
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
