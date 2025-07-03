import React, { useState, useEffect } from 'react';
import axiosClient from '../axiosClient'; // Changed from axios to axiosClient
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State for form data
    const [formData, setFormData] = useState({
        FullName: '',
        Email: '',
        Password: '',
        Role: 'User', // Default value
        Phone: ''
    });

    // State to store validation errors
    const [errors, setErrors] = useState({});

    // State to track if the email and role were pre-filled from the URL
    const [isEmailPreFilled, setIsEmailPreFilled] = useState(false);
    const [isRolePreFilled, setIsRolePreFilled] = useState(false);


    // Use useEffect to parse URL parameters when the component mounts
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailFromUrl = params.get('email');
        const roleFromUrl = params.get('role');

        if (emailFromUrl) {
            setFormData(prevData => ({ ...prevData, Email: emailFromUrl }));
            setIsEmailPreFilled(true);
        }
        if (roleFromUrl) {
            // Capitalize the first letter of the role for display/consistency if needed
            const formattedRole = roleFromUrl.charAt(0).toUpperCase() + roleFromUrl.slice(1).toLowerCase();
            setFormData(prevData => ({ ...prevData, Role: formattedRole }));
            setIsRolePreFilled(true);
        }
    }, [location.search]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    // validation function
    const validateForm = () => {
        const newErrors = {};
        const { FullName, Email, Password, Phone } = formData;

        if (!FullName.trim()) {
            newErrors.FullName = 'Full Name is required.';
        }

        if (!Email.trim()) {
            newErrors.Email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
            newErrors.Email = 'Invalid email format (e.g., user@example.com).';
        }

        if (!Password) {
            newErrors.Password = 'Password is required.';
        } else if (Password.length < 8) {
            newErrors.Password = 'Password must be at least 8 characters long.';
        } else if (!/[A-Z]/.test(Password)) {
            newErrors.Password = 'Password must contain at least one uppercase letter.';
        } else if (!/[a-z]/.test(Password)) {
            newErrors.Password = 'Password must contain at least one lowercase letter.';
        } else if (!/[0-9]/.test(Password)) {
            newErrors.Password = 'Password must contain at least one number.';
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(Password)) {
            newErrors.Password = 'Password must contain at least one special character.';
        }

        // Phone validation
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


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please correct the errors in the form.');
            return;
        }

        try {
            // Use axiosClient for POST request
            await axiosClient.post('/register', formData);
            toast.success('Registration successful!');
            navigate('/login');
        } catch (error) {
            console.error('Error during registration:', error);

            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Registration failed: ${error.response.data.message}`);
            } else {
                toast.error('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="register-container flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 py-12 px-8">
                <h2 className="mb-8 text-center text-4xl font-extrabold text-gray-900">Register</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <input
                            type="text"
                            name="FullName"
                            placeholder="Full Name"
                            value={formData.FullName}
                            onChange={handleChange}
                            required
                            className={`p-3 rounded-lg border w-full text-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.FullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-400 focus:ring-blue-500'
                                }`}
                        />
                        {errors.FullName && <p className="text-red-500 text-sm mt-1">{errors.FullName}</p>}
                    </div>
                    <div>
                        <input
                            type="email"
                            name="Email"
                            placeholder="Email"
                            value={formData.Email}
                            onChange={handleChange}
                            required
                            readOnly={isEmailPreFilled}
                            className={`p-3 rounded-lg border w-full text-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.Email ? 'border-red-500 focus:ring-red-500' : 'border-gray-400 focus:ring-blue-500'
                                } ${isEmailPreFilled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                        {errors.Email && <p className="text-red-500 text-sm mt-1">{errors.Email}</p>}
                    </div>
                    <div>
                        <input
                            type="password"
                            name="Password"
                            placeholder="Password"
                            value={formData.Password}
                            onChange={handleChange}
                            required
                            className={`p-3 rounded-lg border w-full text-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.Password ? 'border-red-500 focus:ring-red-500' : 'border-gray-400 focus:ring-blue-500'
                                }`}
                        />
                        {errors.Password && <p className="text-red-500 text-sm mt-1">{errors.Password}</p>}
                    </div>
                    {/* ONLY RENDER THE ROLE INPUT IF IT WAS PRE-FILLED FROM THE URL */}
                    {isRolePreFilled && (
                        <div>
                            <label htmlFor="Role" className="block text-sm font-medium text-gray-700 mb-1">Assigned Role:</label>
                            <input
                                type="text"
                                id="Role"
                                name="Role"
                                placeholder="Role"
                                value={formData.Role}
                                onChange={handleChange}
                                required
                                readOnly={true}
                                className={`p-3 rounded-lg border w-full text-lg placeholder-gray-500 focus:outline-none focus:ring-2 bg-gray-100 cursor-not-allowed`}
                            />
                        </div>
                    )}
                    <div>
                        <input
                            type="text"
                            name="Phone"
                            placeholder="Phone"
                            value={formData.Phone}
                            onChange={handleChange}
                            required
                            className={`p-3 rounded-lg border w-full text-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.Phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-400 focus:ring-blue-500'
                                }`}
                        />
                        {errors.Phone && <p className="text-red-500 text-sm mt-1">{errors.Phone}</p>}
                    </div>
                    <button
                        type="submit"
                        className="p-4 rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-700">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-semibold">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;