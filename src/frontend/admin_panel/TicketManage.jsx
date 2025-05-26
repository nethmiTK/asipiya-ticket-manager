import { FaBell } from "react-icons/fa6";
import TicketCard from "./TicketCard";
import { useNavigate } from 'react-router-dom';

export default function TicketManage() {
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    navigate('/tickets-request');
  };

  const tickets = [
    { id: 1, status: "Accepted" },
    { id: 2, status: "In Process" },
    { id: 3, status: "Completed" }
  ];

  const accepted = tickets.filter(t => t.status === "Accepted");
  const inProcess = tickets.filter(t => t.status === "In Process");
  const completed = tickets.filter(t => t.status === "Completed");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-700">Ticket Management</h1>
        <div onClick={handleNotificationClick} className="relative cursor-pointer">
          <FaBell className="text-2xl text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-2">
            3
          </span>
        </div>
      </nav>
    
      {/* Ticket Sections */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        
        {/* Accepted */}
        <section>
          <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-4">
            Accepted
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accepted.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        </section>
    <hr className="border-t-2 border-gray-300" />
        {/* In Process */}
        <section>
          <h3 className="text-lg sm:text-xl font-semibold text-yellow-700 mb-4">
            In Process
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProcess.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        </section>
    <hr className="border-t-2 border-gray-300" />
        {/* Completed */}
        <section>
          <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-4">
            Completed
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        </section>

      </div>
    </div>
  );
}
