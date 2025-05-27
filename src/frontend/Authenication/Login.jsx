import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
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
            alert('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error during login:', error);
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login-container flex flex-col items-center justify-center min-h-screen text-gray-800">
            <h2 className="mb-5 text-3xl font-bold">Login</h2>
            <form onSubmit={handleSubmit} className="flex flex-col w-80 gap-4 bg-white p-6 rounded-lg shadow-lg">
                <input type="email" name="Email" placeholder="Email" value={credentials.Email} onChange={handleChange} required className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" name="Password" placeholder="Password" value={credentials.Password} onChange={handleChange} required className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Login</button>
            </form>
            <p className="mt-4">Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link></p>
        </div>
    );
};

export default Login;
