import React from "react";
import { IoSearchSharp } from "react-icons/io5";

const UserNavBar = () => {
  return (
    <div className="w-full h-[6ch] px-12 bg-zinc-50 shadow-md flex items-center justify-center">
      <div className="w-96 border border-zinc-300 rounded-full h-9 flex items-center justify-center text-center">
        <span className="px-1 mt-1">
          <IoSearchSharp />
        </span>
        <input
          type="text"
          placeholder="Search in all tickets...."
          className=" h-full rounded-full outline-none border-none p-1 bg-zinc-50 text-sm"
        />
      </div>
    </div>
  );
};

export default UserNavBar;
