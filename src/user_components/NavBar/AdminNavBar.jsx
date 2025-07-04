import React from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import axiosClient from "../../frontend/axiosClient";

const AdminNavBar = ({
  pageTitle = "Dashboard",
  user,
  onProfileClick,
  onNotificationClick,
  unreadNotifications,
  showNotifications,
  notificationRef,
  sidebarOpen,
  children,
}) => {
  const leftOffset = sidebarOpen ? "18rem" : "5rem";

  return (
    <>
      <header
        className="fixed top-0 right-0 h-[50px] bg-gray-900 shadow-md z-50 px-6 flex items-center justify-between transition-all duration-300"
        style={{
          left: leftOffset,
          width: `calc(100% - ${leftOffset})`,
        }}
      >
        <h1 className="text-lg font-semibold ml-4 text-white">{pageTitle}</h1>

        <div className="flex items-center gap-6 relative">
          <div
            className="flex items-center gap-4 cursor-pointer p-2"
            onClick={onProfileClick}
          >

            <div className="w-9 h-9 rounded-full gap-4 overflow-hidden bg-gray-200 flex-shrink-0">
              {user?.ProfileImagePath ? (
                <img
                  src={`${axiosClient.defaults.baseURL}/uploads/${user.ProfileImagePath}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center gap-4 justify-center bg-blue-500 text-white font-bold">
                  {user?.FullName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-white">{user?.FullName}</p>
              <p className="text-sm text-gray-200">{user?.Role}</p>
            </div>
          </div>
          <button
                onClick={(e) => {
                e.stopPropagation();
                onNotificationClick();
                }}
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
                <IoNotificationsOutline className="text-2xl text-white hover:text-gray-900" />
                {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                </span>
                )}
            </button>
        </div>
      </header>

      {showNotifications && (
        <div
          ref={notificationRef}
          className="fixed right-6 top-[60px] z-50 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-md"
        >
          {children}
        </div>
      )}
    </>
  );
};

export default AdminNavBar;
