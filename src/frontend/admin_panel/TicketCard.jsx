export default function TicketCard({ ticket, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "text-green-700";
      case "In Process":
        return "text-yellow-700";
      case "Completed":
        return "text-blue-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div
      onClick={() => onClick(ticket)}
      className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
    >
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Ticket #{ticket.id}</h2>
        <span className={`text-sm font-medium ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>
      <p className="text-gray-600 text-sm mt-1 truncate">{ticket.problem || "No problem specified"}</p>
    </div>
  );
}
