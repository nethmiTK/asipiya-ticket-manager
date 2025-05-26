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
    <>
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">Ticket Manage</h1>
        <div onClick={handleNotificationClick} className="relative cursor-pointer">
          <FaBell className="text-2xl text-gray-700" />
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-2">3</span>
        </div>
      </nav>

      <div className="p-6 space-y-6">

        <section>
          <h3 className="text-lg font-bold mb-2">Accepted</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accepted.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mt-6 mb-2">In Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProcess.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mt-6 mb-2">Completed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        </section>
      </div>
    </>
  );
}
