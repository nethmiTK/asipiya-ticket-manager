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
        <div className="login-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Login</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
                <input type="email" name="Email" placeholder="Email" value={credentials.Email} onChange={handleChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="password" name="Password" placeholder="Password" value={credentials.Password} onChange={handleChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <button type="submit" style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>Login</button>
            </form>
            <p style={{ marginTop: '10px' }}>Don't have an account? <Link to="/register" style={{ color: '#007bff' }}>Register</Link></p>
        </div>
    );
};

export default Login;
