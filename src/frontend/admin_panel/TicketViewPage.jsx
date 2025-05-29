import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SupervisorAssign from './SupervisorAssign';

const TicketViewPage = () => {
  const { id } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading ticket details...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold mb-8 text-center">Complain Details</h2>

        <div className="space-y-6">
          <div className="flex items-start">
            <label className="w-40 font-medium">System Name</label>
            <div className="flex-1 bg-gray-200 px-4 py-2 rounded">
              {ticketData.SystemName}
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-40 font-medium">Email</label>
            <div className="flex-1 bg-gray-200 px-4 py-2 rounded">
              {ticketData.UserEmail}
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-40 font-medium">Category</label>
            <div className="flex-1 bg-gray-200 px-4 py-2 rounded">
              {ticketData.CategoryName}
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-40 font-medium">Description</label>
            <div className="flex-1 bg-gray-200 px-4 py-2 rounded max-h-40 overflow-y-auto">
              {ticketData.Description}
            </div>
          </div>

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
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded"
          >
            Accept
          </button>
          {showModal && <SupervisorAssign onClose={() => setShowModal(false)} />}
        </div>
      </div>
    </div>
  );
};

export default TicketViewPage;
