import React, { useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import { LuTicketCheck, LuTicketPlus } from "react-icons/lu";
import { IoIosArrowBack } from "react-icons/io";
import { AiOutlineUser } from "react-icons/ai";
import { CiLogout } from "react-icons/ci";

const Menus = [
  { title: "My All Tickets", icon: <LuTicketCheck /> },
  { title: "My Open Tickets", icon: <LuTicketPlus /> },
  { title: "My Profile", icon: <AiOutlineUser /> },
  { title: "Log Out", icon: <CiLogout /> },
];

const UserSideBar = () => {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex">
      <div
        className={`bg-gray-900 h-screen duration-300 p-5 pt-8 ${
          open ? "w-72" : "w-20"
        } relative`}
      >
        <BsChevronLeft
          className={`absolute -right-3 mr-10 top-16 cursor-pointer text-white text-base ${
            !open && "rotate-180"
          }`}
          onClick={() => setOpen(!open)}
        />

        <ul className="pt-30">
          {Menus.map((menu, index) => (
            <li
              key={index}
              className="text-white text-sm flex items-center gap-x-4 mt-5 cursor-pointer p-2 hover:bg-gray-700 rounded-md"
            >
              <span className="text-2xl">{menu.icon}</span>
              <span
                className={`font-medium flex-1 overflow-hidden whitespace-nowrap duration-300 ${
                  open ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                {menu.title}
              </span>
              <span className={`font-medium ${!open && "hidden"}`}>
                <IoIosArrowBack className="rotate-180" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserSideBar;
