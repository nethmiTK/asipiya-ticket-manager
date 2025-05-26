import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [values, setValues] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/auth/login', values);
      if (response.status === 201) { // Assuming 201 for success or 200 based on your backend
        localStorage.setItem('token', response.data.token);
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err.message); // Changed from console.log to console.error
      // You might want to add user-friendly error messages here, e.g., using a state variable
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100 p-4'>
      <div className='bg-white rounded-xl shadow-2xl p-8 w-full max-w-md'>
        <h2 className='text-3xl font-extrabold text-center text-gray-800 mb-8'>Welcome Back!</h2>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Enter your email'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200'
              onChange={handleChanges}
              required
            />
          </div>
          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
              Password
            </label>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter your password'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200'
              onChange={handleChanges}
              required
            />
          </div>
          <button
            type='submit'
            className='w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          >
            Login
          </button>
        </form>
        <p className='text-center text-sm text-gray-600 mt-6'>
          Don't have an account?{' '}
          <Link to='/register' className='text-blue-600 hover:text-blue-900 font-medium transition duration-200'>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;