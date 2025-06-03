import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState(null); 
    const navigate = useNavigate();
    const location = useLocation();

    // Extract token and email from URL parameters on component mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlToken = params.get('token');
        const urlEmail = params.get('email'); 

        if (!urlToken || !urlEmail) {
            toast.error('Invalid or missing reset token/email. Please request a new link.');
            navigate('/forgot-password'); 
            return;
        }
        setToken(urlToken);
        setEmail(urlEmail);

    }, [location.search, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'password') {
            setPassword(value);
        } else {
            setConfirmPassword(value);
        }
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' })); // Clear error on change
    };

    const validateForm = () => {
        const newErrors = {};
        if (!password) {
            newErrors.password = 'New password is required.';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = 'Password must contain at least one uppercase letter.';
        } else if (!/[a-z]/.test(password)) {
            newErrors.password = 'Password must contain at least one lowercase letter.';
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = 'Password must contain at least one number.';
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            newErrors.password = 'Password must contain at least one special character.';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
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

        if (!token || !email) {
            toast.error('Reset token or email is missing. Please request a new link.');
            navigate('/forgot-password');
            return;
        }

        setLoading(true); // Start loading
        try {
            // Send the new password, token, and email to the backend for verification and update
            const response = await axios.post('http://localhost:5000/reset-password', {
                email, 
                token, 
                newPassword: password
            });
            toast.success(response.data.message || 'Your password has been reset successfully!');
            navigate('/login'); // Redirect to login after successful reset
        } catch (error) {
            console.error('Error resetting password:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to reset password. Please try again.');
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    // Don't render the form until token and email are extracted from URL
    if (!token || !email) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gradient-to-br from-blue-100 to-purple-200">
                <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 py-12 px-8 text-center">
                    <p className="text-xl font-semibold text-gray-700">Loading or invalid link...</p>
                    <p className="mt-4 text-gray-600">Redirecting to forgot password page if link is invalid.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-container flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 py-12 px-8">
                <h2 className="mb-8 text-center text-4xl font-extrabold text-gray-900">Reset Password</h2>
                <p className="mb-6 text-center text-gray-600">
                    Enter your new password below.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="New Password"
                            value={password}
                            onChange={handleChange}
                            required
                            className={`p-3 rounded-lg border w-full text-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-400 focus:ring-blue-500'}`}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={handleChange}
                            required
                            className={`p-3 rounded-lg border w-full text-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-400 focus:ring-blue-500'}`}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`p-4 rounded-lg text-white font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;