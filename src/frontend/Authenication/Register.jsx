import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        FullName: '',
        Email: '',
        Password: '',
        Role: '',
        Phone: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/register', formData);
            toast.success('Registration successful!');
            navigate('/login');
        } catch (error) {
            console.error('Error during registration:', error);

            toast.error('Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-container flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 py-12 px-8">
                <h2 className="mb-8 text-center text-4xl font-extrabold text-gray-900">Register</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <input
                        type="text"
                        name="FullName"
                        placeholder="Full Name"
                        value={formData.FullName}
                        onChange={handleChange}
                        required
                        className="p-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-lg"
                    />
                    <input
                        type="email"
                        name="Email"
                        placeholder="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        required
                        className="p-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-lg"
                    />
                    <input
                        type="password"
                        name="Password"
                        placeholder="Password"
                        value={formData.Password}
                        onChange={handleChange}
                        required
                        className="p-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-lg"
                    />
                    <select
                        name="Role"
                        value={formData.Role}
                        onChange={handleChange}
                        required
                        className="p-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white text-lg"
                    >
                        <option value="" disabled>Select Role</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                    </select>
                    <input
                        type="text"
                        name="Phone"
                        placeholder="Phone"
                        value={formData.Phone}
                        onChange={handleChange}
                        required
                        className="p-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-lg"
                    />
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