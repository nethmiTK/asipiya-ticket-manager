import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoArrowBack } from 'react-icons/io5';

const TicketViewPage = ({ ticketId, popupMode = false, onClose }) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const id = popupMode ? ticketId : routeId;

  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/ticket_view/${id}`)
      .then((response) => {
        setTicketData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  const handleReject = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/ticket_status/${id}`, {
        status: 'Reject',
      });

      if (response.status === 200 || response.status === 204) {
        toast.success('Ticket rejected successfully');
        if (popupMode) {
          onClose();
        } else {
          navigate(-1);
        }
      } else {
        toast.error('Failed to reject the ticket');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while rejecting the ticket');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => (popupMode ? onClose() : navigate(-1))}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <IoArrowBack className="mr-2" /> Back
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-center mb-8">Complain Details</h2>

      <div className="space-y-6">
        <div className="flex">
          <label className="w-1/3 font-medium">System Name</label>
          <div className="w-2/3 bg-gray-100 p-2 rounded">{ticketData.SystemName}</div>
        </div>

        <div className="flex">
          <label className="w-1/3 font-medium">User Email</label>
          <div className="w-2/3 bg-gray-100 p-2 rounded">{ticketData.UserEmail}</div>
        </div>

        <div className="flex">
          <label className="w-1/3 font-medium">Category</label>
          <div className="w-2/3 bg-gray-100 p-2 rounded">{ticketData.CategoryName}</div>
        </div>

        <div className="flex">
          <label className="w-1/3 font-medium">Description</label>
          <div className="w-2/3 bg-gray-100 p-2 rounded">{ticketData.Description}</div>
        </div>

        <div className="flex">
          <label className="w-1/3 font-medium">Date & Time</label>
          <div className="w-2/3 bg-gray-100 p-2 rounded">
            {new Date(ticketData.DateTime).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handleReject}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
        >
          Reject
        </button>

        <button
          onClick={() => navigate(`/supervisor_assign/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Assign Supervisor
        </button>
      </div>
    </div>
  );
};

export default TicketViewPage;
