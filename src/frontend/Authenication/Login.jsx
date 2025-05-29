import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({
        Email: '',
        Password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', credentials);
            toast.success('Login successful!');

            const userRole = response.data.role;
            const userId = response.data.UserID;
            
            // Store both role and userId in localStorage
            localStorage.setItem('role', userRole);
            localStorage.setItem('userId', userId);

            if (onLoginSuccess) {
                onLoginSuccess(userRole);
            }

        } catch (error) {
            console.error('Error during login:', error);
            if (error.response && error.response.status === 401) {
                toast.error('Login failed. Invalid credentials.');
            } else {
                toast.error('Login failed. Please try again later.');
            }
        }
    };

    return (
        <div className="login-container flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 py-12 px-8">
                <h2 className="mb-8 text-center text-4xl font-extrabold text-gray-900">Login</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <input
                        type="email"
                        name="Email"
                        placeholder="Email"
                        value={credentials.Email}
                        onChange={handleChange}
                        required
                        className="p-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-lg"
                    />
                    <input
                        type="password"
                        name="Password"
                        placeholder="Password"
                        value={credentials.Password}
                        onChange={handleChange}
                        required
                        className="p-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-lg"
                    />
                    <button
                        type="submit"
                        className="p-4 rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-700">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-semibold">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;