import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoArrowBack, IoClose } from 'react-icons/io5';

const TicketViewPage = ({ ticketId, popupMode = false, onClose }) => {
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

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600">Loading ticket details...</div>
    );
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  const fields = {
    SystemName: 'System Name',
    UserEmail: 'User Email',
    CategoryName: 'Category',
    Description: 'Description',
  };

  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-3xl relative">
        {/* Back and Close buttons */}
        <div className="absolute p-4  top-4 left-4 flex items-center gap-140">
          {/* Back Button */}
          <button
            onClick={() => {
              if (popupMode) {
                onClose?.();
              } else {
                navigate(-1);
              }
            }}
            title="Back"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <IoArrowBack size={20} />
            Back
          </button>

          {/* Close Button (only in popupMode) */}
          {popupMode && (
            <button
              onClick={onClose}
              title="Close"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <IoClose size={20} />
              Close
            </button>
          )}
        </div>

        <h2 className="text-2xl p-5 font-semibold mb-8 text-center">Complain Details</h2>

        <div className="space-y-6">
          {Object.entries(fields).map(([key, label]) => (
            <div className="flex items-start" key={key}>
              <label className="w-40 font-medium">{label}</label>
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
          <button
            onClick={async () => {
              try {
                await axios.put(`http://localhost:5000/api/ticket_status/${id}`, {
                  status: 'Reject',
                });
                toast.success('Ticket rejected successfully');
              } catch (err) {
                toast.error('Failed to reject the ticket');
                console.error(err);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded"
          >
            Reject
          </button>

          <button
            onClick={() => navigate(`/supervisor_assign/${id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
          >
            Assign Supervisor
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketViewPage;
