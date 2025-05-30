import React from "react";
import { IoSearchSharp } from "react-icons/io5";
import { useAuth } from '../../App.jsx';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from 'react-icons/ai';

const NavBar = () => {
  const { loggedInUser } = useAuth();
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    navigate('/user-profile');
  };

  const profileImageUrl = loggedInUser?.ProfileImagePath
    ? `http://localhost:5000/uploads/${loggedInUser.ProfileImagePath}` 
    : null; 

  return (
    <div className="fixed top-0 left-72 right-0 h-[60px] bg-zinc-50 shadow-md flex items-center justify-between px-12 z-40">
   
      <div></div>

      {/* Search bar */}
      <div className="w-96 border border-zinc-300 rounded-full h-9 flex items-center px-2">
        <IoSearchSharp className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search in all tickets...."
          className="w-full h-full rounded-full outline-none border-none bg-zinc-50 text-sm p-4"
        />
      </div>

      {/* User Avatar */}
      <button
        onClick={handleAvatarClick}
        className="relative w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        title="Go to Profile" 
      >
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-full h-full object-cover" 
          />
        ) : (
          <AiOutlineUser /> 
        )}
      </button>
    </div>
  );
};

export default NavBar;