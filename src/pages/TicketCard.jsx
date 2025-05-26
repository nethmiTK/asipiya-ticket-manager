export default function TicketCard({ ticket }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 space-y-2">
      <h4 className="text-lg font-semibold">{ticket.title}</h4>
      <p className="text-sm text-gray-600">{ticket.description}</p>
      <p className="text-sm">Date: {ticket.date}</p>
      <p className="text-sm font-medium">Status: {ticket.status}</p>
    </div>
  );
}
