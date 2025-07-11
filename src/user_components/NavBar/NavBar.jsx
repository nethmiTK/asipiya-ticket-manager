import React from "react";
import { IoSearchSharp } from "react-icons/io5";
import { useAuth } from '../../App.jsx';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from 'react-icons/ai';
import { IoNotificationsOutline } from "react-icons/io5";
import { Menu } from "lucide-react";
import axiosClient from "../../frontend/axiosClient.js";

const NavBar = ({ isSidebarOpen, showNotifications, unreadNotifications, setShowNotifications, notificationRef,setOpen }) => {
    const { loggedInUser } = useAuth();
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/user-profile');
    };

    const profileImageUrl = loggedInUser?.ProfileImagePath
        ? `${axiosClient.defaults.baseURL}/uploads/${loggedInUser.ProfileImagePath}`
        : null;

    return (
        // <div className={`fixed top-0 ${isSidebarOpen ? 'left-72' : 'left-20'} right-0 h-[60px] bg-zinc-50 shadow-md flex items-center justify-between px-6 transition-all duration-300 z-40`}>
        <div className={`fixed top-0 right-0 h-[60px] bg-gray-900 shadow-md flex items-center justify-between px-6 transition-all duration-300 z-40
            left-0 w-full /* Default for mobile: full width, no left margin */
            lg:left-20 lg:w-[calc(100%-5rem)] /* Desktop collapsed: width takes 20px sidebar into account */
            ${isSidebarOpen ? 'lg:left-72 lg:w-[calc(100%-18rem)]' : ''} /* Desktop expanded: width takes 72px sidebar into account */
        `}>
{/* Hamburger Icon for Mobile - Visible only on small screens */}
            <button
                className="lg:hidden text-gray-700 text-3xl mr-4"
                onClick={() => setOpen(!isSidebarOpen)} // Toggle sidebar open state
                aria-label="Open sidebar"
            ><Menu /></button>
              
            {/* Dashboard Title */}
            <h1 className="text-2xl font-bold text-gray-800"></h1>

            {/* Search bar */}
            {/* <div className="w-96 border border-zinc-300 rounded-full h-9 flex items-center px-2">
                <IoSearchSharp className="text-gray-500 mr-2" />
                <input
                    type="text"
                    placeholder="Search in all tickets...."
                    className="w-full h-full rounded-full outline-none border-none bg-zinc-50 text-sm p-4"
                />
            </div> */}

            {/* User Profile and Notification Button */}
            <div className="flex items-center gap-4">
                {/* Profile Display Area */}
                <div
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-500 p-2 rounded-lg transition-colors"
                    onClick={handleProfileClick} // Entire block is clickable to go to profile
                    title="Go to Profile"
                >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-500 text-2xl">
                        {profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white">
                                {loggedInUser?.FullName?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-white">{loggedInUser?.FullName}</p>
                        <p className="text-sm text-white">{loggedInUser?.Role}</p>
                    </div>
                </div>

                {/* Notification Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); 
                        setShowNotifications(!showNotifications); 
                    }}
                    className="relative p-2 hover:bg-gray-500 rounded-full transition-colors"
                    title="Notifications"
                >
                    <IoNotificationsOutline className="text-2xl text-white cursor-pointer" />
                    {unreadNotifications > 0 && ( 
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadNotifications}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default NavBar;
