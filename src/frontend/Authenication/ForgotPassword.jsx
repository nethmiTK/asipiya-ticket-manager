import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        try {
            // Send the email to the backend to initiate password reset
            const response = await axios.post('http://localhost:5000/forgot-password', { email });
            toast.success(response.data.message || 'Password reset link sent to your email!');
            navigate('/login'); // Redirect to login page after sending link
        } catch (error) {
            console.error('Error requesting password reset:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to send password reset link. Please try again.');
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="forgot-password-container flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 py-12 px-8">
                <h2 className="mb-8 text-center text-4xl font-extrabold text-gray-900">Forgot Password</h2>
                <p className="mb-6 text-center text-gray-600">
                    Enter your email address below and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email Address"
                            value={email}
                            onChange={handleChange}
                            required
                            className="p-3 rounded-lg border border-gray-400 w-full text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading} // Disable button while loading
                        className={`p-4 rounded-lg text-white font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-700">
                    Remembered your password? <Link to="/login" className="text-blue-600 hover:underline font-semibold">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;