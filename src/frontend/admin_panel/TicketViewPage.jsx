import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TicketViewPage = ({ ticketId, popupMode = false }) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const id = popupMode ? ticketId : routeId;

  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/ticket_view/${id}`)
      .then((response) => {
        setTicketData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to load ticket data.');
        setLoading(false);
        console.error(error);
      });
  }, [id]);

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading ticket details...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div
      className={`${
        popupMode
          ? 'fixed inset-0 z-50 flex justify-center items-center bg-gray-200 bg-opacity-80 backdrop-blur-sm'
          : ''
      }`}
    >
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold mb-8 text-center">Complain Details</h2>

        <div className="space-y-6">
          {['SystemName', 'UserEmail', 'CategoryName', 'Description'].map((key) => (
            <div className="flex items-start" key={key}>
              <label className="w-40 font-medium">{key.replace(/([A-Z])/g, ' $1')}</label>
              <div className="flex-1 bg-gray-200 px-4 py-2 rounded">{ticketData[key]}</div>
            </div>
          ))}
          <div className="flex items-start">
            <label className="w-40 font-medium">Date & Time</label>
            <div className="flex-1 bg-gray-200 px-4 py-2 rounded">
              {new Date(ticketData.DateTime).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10 gap-8">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded">
            Reject
          </button>
          <button
            onClick={() => navigate(`/supervisor_assign/${id}`)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded"
          >
            Assign Supervisor
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketViewPage;
