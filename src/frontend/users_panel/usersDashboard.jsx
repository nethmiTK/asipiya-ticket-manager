import React from "react";
import SideBar from "../../user_components/SideBar/SideBar";
import NavBar from "../../user_components/NavBar/NavBar";

const usersDashboard = () => {
  return (
    <div>
      <div className="flex">
        <SideBar />

        <div className="flex-1 ml-72 flex flex-col h-screen overflow-y-auto">
          <NavBar />

          <div className="p-6 mt-[60px]">
            <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default usersDashboard;
