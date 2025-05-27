import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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
            alert('Registration successful!');
            navigate('/login');
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-container flex flex-col items-center justify-center min-h-screen text-gray-800">
            <h2 className="mb-5 text-3xl font-bold">Register</h2>
            <form onSubmit={handleSubmit} className="flex flex-col w-80 gap-4 bg-white p-6 rounded-lg shadow-lg">
                <input type="text" name="FullName" placeholder="Full Name" value={formData.FullName} onChange={handleChange} required className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="email" name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} required className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" name="Password" placeholder="Password" value={formData.Password} onChange={handleChange} required className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select name="Role" value={formData.Role} onChange={handleChange} required className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                </select>
                <input type="text" name="Phone" placeholder="Phone" value={formData.Phone} onChange={handleChange} required className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Register</button>
            </form>
            <p className="mt-4">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
        </div>
    );
};

export default Register;
