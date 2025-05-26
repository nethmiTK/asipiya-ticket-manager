export default function TicketCard({ ticket }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 space-y-2">
      <h4 className="text-lg font-semibold text-gray-700">{ticket.title}</h4>
      <p className="text-sm text-gray-600 text-gray-700">{ticket.description}</p>
      <p className="text-sm text-gray-700">Date: {ticket.date}</p>
      <p className="text-sm font-medium text-gray-700">Status: {ticket.status}</p>
    </div>
  );
}
