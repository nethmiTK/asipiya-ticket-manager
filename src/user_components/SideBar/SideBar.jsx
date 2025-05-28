import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { LuTicketCheck, LuTicketPlus } from "react-icons/lu";
import { IoIosArrowBack } from "react-icons/io";
import { AiOutlineUser } from "react-icons/ai";
import { CiLogout } from "react-icons/ci";

const Menus = [
  { title: "My All Tickets", icon: <LuTicketCheck />, path: "/all-tickets" },
  { title: "My Open Tickets", icon: <LuTicketPlus />, path: "/open-tickets" },
  { title: "My Profile", icon: <AiOutlineUser />, path: "/profile" },
];

const SideBar = () => {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex">
      <div
        className={`bg-gray-900 h-screen duration-300 p-5 pt-30 fixed top-0 left-0 z-50 transition-all
    ${open ? "w-72" : "w-20"}`}
      >
        <BsChevronLeft
          className={`absolute -right-3 top-16 cursor-pointer text-white text-base transition-transform duration-300
      ${open ? "rotate-0" : "rotate-180"}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle sidebar"
        />

        <div className="flex flex-col h-full justify-between">
          <ul className="pt-8">
            {Menus.map((menu, index) => (
              <li
                key={index}
                className="text-white text-sm flex items-center justify-between gap-x-4 mt-5 cursor-pointer p-2 hover:bg-gray-700 rounded-md"
              >
                <Link
                  to={menu.path}
                  className="flex items-center gap-x-4 w-full justify-between"
                >
                  <div className="flex items-center gap-x-4">
                    <span className="text-2xl">{menu.icon}</span>
                    <span
                      className={`font-medium flex-1 overflow-hidden whitespace-nowrap duration-300
                  ${open ? "opacity-100" : "opacity-0 w-0"}`}
                    >
                      {menu.title}
                    </span>
                  </div>
                  {open && (
                    <span className="font-medium flex items-center">
                      <IoIosArrowBack className="rotate-180" />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <li className="text-white text-sm flex items-center justify-between gap-x-4 cursor-pointer p-2 hover:bg-gray-700 rounded-md">
              <Link
                to="/logout"
                className="flex items-center gap-x-4 w-full justify-between"
              >
                <div className="flex items-center gap-x-4">
                  <span className="text-2xl">
                    <CiLogout />
                  </span>
                  <span
                    className={`font-medium flex-1 overflow-hidden whitespace-nowrap duration-300
                ${open ? "opacity-100" : "opacity-0 w-0"}`}
                  >
                    Log Out
                  </span>
                </div>
                {open && (
                  <span className="font-medium flex items-center">
                    <IoIosArrowBack className="rotate-180" />
                  </span>
                )}
              </Link>
            </li>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
