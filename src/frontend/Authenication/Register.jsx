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
        <div className="register-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Register</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
                <input type="text" name="FullName" placeholder="Full Name" value={formData.FullName} onChange={handleChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="email" name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="password" name="Password" placeholder="Password" value={formData.Password} onChange={handleChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="text" name="Role" placeholder="Role" value={formData.Role} onChange={handleChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="text" name="Phone" placeholder="Phone" value={formData.Phone} onChange={handleChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <button type="submit" style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>Register</button>
            </form>
            <p style={{ marginTop: '10px' }}>Already have an account? <Link to="/login" style={{ color: '#007bff' }}>Login</Link></p>
        </div>
    );
};

export default Register;
