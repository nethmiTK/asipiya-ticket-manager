import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { LuTicketCheck } from "react-icons/lu";
import { IoIosArrowBack } from "react-icons/io";
import { VscNotebook } from "react-icons/vsc";
import { CiLogout } from "react-icons/ci";
import { GrSystem } from "react-icons/gr";

const Menus = [
  { title: "Ticket Manage", icon: <LuTicketCheck />, path: "/ticket-manage" },
  { title: "Supervisor Manage", icon: <VscNotebook />, path: "/supervisor-manage" },
  {
    title: "Asipiya Systems",
    icon: <GrSystem />,
    subMenu: true,
    subItems: [
      { title: "System Registration", path: "/system_registration" },
      { title: "Ticket Category", path: "/ticket-category" },
    ],
  },
];

const SideBar = () => {
  const [open, setOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleSubMenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  return (
    <div className="flex">
      <div
        className={`bg-gray-900 h-screen duration-300 p-5 pt-30 fixed top-0 left-0 z-50 ${
          open ? "w-72" : "w-20"
        }`}
      >
        <BsChevronLeft
          className={`absolute -right-3 mr-10 top-16 cursor-pointer text-white text-base ${
            !open && "rotate-180"
          }`}
          onClick={() => setOpen(!open)}
        />

        <div className="flex flex-col h-full justify-between">
          <ul className="pt-8">
            {Menus.map((menu, index) => (
              <div key={index}>
                {/* Wrap the item in Link if it's not a submenu */}
                {!menu.subMenu ? (
                  <Link to={menu.path}>
                    <li className="text-white text-sm flex items-center justify-between gap-x-4 mt-5 cursor-pointer p-2 hover:bg-gray-700 rounded-md">
                      <div className="flex items-center gap-x-4">
                        <span className="text-2xl">{menu.icon}</span>
                        <span
                          className={`font-medium overflow-hidden whitespace-nowrap duration-300 ${
                            open ? "opacity-100" : "opacity-0 w-0"
                          }`}
                        >
                          {menu.title}
                        </span>
                      </div>
                      {open && <IoIosArrowBack className="rotate-180" />}
                    </li>
                  </Link>
                ) : (
                  <>
                    <li
                      onClick={() => toggleSubMenu(index)}
                      className="text-white text-sm flex items-center justify-between gap-x-4 mt-5 cursor-pointer p-2 hover:bg-gray-700 rounded-md"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-x-4">
                          <span className="text-2xl">{menu.icon}</span>
                          <span
                            className={`font-medium flex-1 overflow-hidden whitespace-nowrap duration-300 ${
                              open ? "opacity-100" : "opacity-0 w-0"
                            }`}
                          >
                            {menu.title}
                          </span>
                        </div>
                        {open && (
                          <IoIosArrowBack
                            className={`transition-transform duration-300 ${
                              expandedMenu === index ? "rotate-270" : "rotate-180"
                            }`}
                          />
                        )}
                      </div>
                    </li>

                    {open && expandedMenu === index && menu.subItems && (
                      <ul className="pl-12 mt-1">
                        {menu.subItems.map((subItem, subIndex) => (
                          <li
                            key={subIndex}
                            className="text-gray-300 text-sm p-2 hover:bg-gray-700 rounded-md cursor-pointer"
                          >
                            <Link to={subItem.path}>{subItem.title}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
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
                    className={`font-medium flex-1 overflow-hidden whitespace-nowrap duration-300 ${
                      open ? "opacity-100" : "opacity-0 w-0"
                    }`}
                  >
                    Log Out
                  </span>
                </div>
                {open && <IoIosArrowBack className="rotate-180" />}
              </Link>
            </li>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
