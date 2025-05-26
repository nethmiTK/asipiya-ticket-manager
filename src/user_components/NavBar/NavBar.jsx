import React from "react";
import { IoSearchSharp } from "react-icons/io5";

const NavBar = () => {
  return (
    <div className="fixed top-0 left-72 right-0 h-[60px] bg-zinc-50 shadow-md flex items-center justify-center px-12 z-40">
      <div className="w-96 border border-zinc-300 rounded-full h-9 flex items-center px-2">
        <IoSearchSharp className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search in all tickets...."
          className="w-full h-full rounded-full outline-none border-none bg-zinc-50 text-sm p-4"
        />
      </div>
    </div>
  );
};

export default NavBar;
