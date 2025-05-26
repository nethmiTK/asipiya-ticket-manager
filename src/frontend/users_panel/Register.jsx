import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [values, setValues] = useState({
    username: '',
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
      // CORRECTED URL: Changed port from 3000 to 5000 and added /api
      const response = await axios.post('http://localhost:5000/api/auth/register', values);
      if (response.status === 201) {
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err.message);
      // You might want to add user-friendly error messages here
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server response data:', err.response.data);
        console.error('Server response status:', err.response.status);
        console.error('Server response headers:', err.response.headers);
        alert(`Registration failed: ${err.response.data.message || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        alert('Registration failed: No response from server. Is the backend running?');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error in request setup:', err.message);
        alert('Registration failed: An unexpected error occurred.');
      }
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100 p-4'>
      <div className='bg-white rounded-xl shadow-2xl p-8 w-full max-w-md'>
        <h2 className='text-3xl font-extrabold text-center text-gray-800 mb-8'>Create Account</h2>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-1'>
              Username
            </label>
            <input
              type='text'
              id='username'
              name='username'
              placeholder='Enter your username'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200'
              onChange={handleChanges}
              required
            />
          </div>
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
            Register
          </button>
        </form>
        <p className='text-center text-sm text-gray-600 mt-6'>
          Already have an account?{' '}
          <Link to='/login' className='text-blue-600 hover:text-blue-900 font-medium transition duration-200'>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;