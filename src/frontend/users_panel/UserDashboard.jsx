import React from "react";
import UserNavBar from "../../user_components/NavBar/NavBar";
import UserSideBar from "../../user_components/SideBar/SideBar"

const UserDashboard = () => {
  return (
    <div className="flex h-screen">
      <title>Dashboard</title>
      <UserSideBar />
      <div className="flex-1 flex flex-col">
        <UserNavBar />
        <div className="p-4">
          <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
